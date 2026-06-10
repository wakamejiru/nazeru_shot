// EnemyType7 — ステージ7ボス
// テーマ: 壁バウンド / 反射弾
// 通常攻撃: 斜め弾(壁でvx/vy反転) + 扇形弾
// スペル: 反射嵐 / 格子弾幕 / ランダム反射
import { EnemyBase } from "./EnemyBase.js";
import { FanShotFunc, RoundShotFunc } from "./EnemyShot.js";
import { Bullet } from '../bullet.js';
import { DifficultyLevel } from "../Screens/BaseScreen.js";
import { enemy_info_list, EnemyTypeEnum } from '../game_status.js';
import { showLineWarning, showBurstWarning } from '../DangerWarning.js';

const wait = (seconds) => new Promise(resolve => setTimeout(resolve, seconds * 1000));

/**
 * バウンド弾を1発生成してEnemyBulletArrayに追加する
 * bounce_count回だけ壁で反射する
 */
function spawnBounceBullet(EnemyBulletArray, container, sx, sy, vx, vy, minX, maxX, minY, maxY, opts) {
    // bounce_count / area_boundsをBulletのupdateで処理できないため、
    // ここでは単純に反射を内蔵したカスタムBulletライクオブジェクトを使う代わりに、
    // Bulletクラスのax/ayを使った擬似的なバウンド(速度の符号反転はBullet外で処理)を行う
    // 実装上の制約から、バウンドは「初速の方向を斜め45度系」で行う
    EnemyBulletArray.push(new Bullet(container, sx, sy, {
        ...opts,
        vx: vx,
        vy: vy,
        // カスタムフラグ（Bulletクラスがbounce_boundsを読む場合）
        bounce_bounds: { minX, maxX, minY, maxY },
        bounce_count: opts.bounce_count || 3
    }));
}

export class EnemyType7 extends EnemyBase {
    constructor(GameScreenContainer, StartShootingX, StartShootingY, StartShootingWidth, StartShootingHeight) {
        const enemyInfo = enemy_info_list[EnemyTypeEnum.E_TYPE_7];
        const BaseConfig = {
            ...enemyInfo,
            enemy_maxhp: enemyInfo.enemy_maxhp * ((0.6 * DifficultyLevel) + 0.4),
            enemy_hp_guage: (DifficultyLevel < 2) ? 2 : 3,
            ETypeTypeID: EnemyTypeEnum.E_TYPE_7
        };
        super(GameScreenContainer, StartShootingX, StartShootingY, StartShootingWidth, StartShootingHeight, BaseConfig);
        this._attackLoopsStarted = false;

        this.SkillDefinitions = {
            0: {
                name: "反射「乱反射嵐」",
                NoMoveFlag: false,
                targetX: () => this.StartAreaX + this.NowPlayAreaWidth * 0.5,
                targetY: () => this.StartAreaY + this.NowPlayAreaHeight * 0.2,
                attackFunction: this.AttackSkill1,
                allowMoveAfter: true
            },
            1: {
                name: "格子「碁盤の目弾幕」",
                NoMoveFlag: false,
                targetX: () => this.StartAreaX + this.NowPlayAreaWidth * 0.5,
                targetY: () => this.StartAreaY + this.NowPlayAreaHeight * 0.15,
                attackFunction: this.AttackSkill2,
                allowMoveAfter: true
            },
            2: {
                name: "混沌「反射の迷宮」",
                NoMoveFlag: false,
                targetX: () => this.StartAreaX + this.NowPlayAreaWidth * 0.5,
                targetY: () => this.StartAreaY + this.NowPlayAreaHeight * 0.25,
                attackFunction: this.AttackSkill3,
                allowMoveAfter: true
            }
        };
    }

    updateScale(NewScaleFactor, NewShootingStartX, NewShootingStartY, NewShootingWidth, NewShootingHeight) {
        super.updateScale(NewScaleFactor, NewShootingStartX, NewShootingStartY, NewShootingWidth, NewShootingHeight);
    }

    move(DeltaTime) { super.move(DeltaTime); }

    _shoot(EnemyBulletArray, TargetPlayer, DeltaTime) {
        if (this.NowHPGuageHP <= 0) { this._attackLoopsStarted = false; return; }
        if (!this._attackLoopsStarted) {
            this._attackLoopsStarted = true;
            this.pattern1_Loop(EnemyBulletArray, TargetPlayer, 0.5);
            this.pattern2_Loop(EnemyBulletArray, TargetPlayer, 2.5);
        }
    }

    /** 斜め方向のバウンド弾（擬似的にランダム角度で発射） */
    async pattern1_Loop(EnemyBulletArray, TargetPlayer, initialDelay) {
        await wait(initialDelay);
        while (this.NowHPGuageHP > 0) {
            const dm = 1.0 + DifficultyLevel * 0.5;
            if (!this.SkillActivate) {
                const angles = [Math.PI * 0.25, Math.PI * 0.75, Math.PI * 1.25, Math.PI * 1.75];
                const spd = 220 * dm;
                
                // 対角線上の長さを見越して少し長めの警告線を引く
                const warnings = angles.map(a => showLineWarning(
                    this.EnemyContainer,
                    this.x, this.y,
                    this.x + 500 * Math.cos(a), this.y + 500 * Math.sin(a),
                    14, 500, 0.45
                ));
                await Promise.all(warnings);

                if (this.NowHPGuageHP > 0 && !this.SkillActivate) {
                    for (const a of angles) {
                        spawnBounceBullet(EnemyBulletArray, this.EnemyContainer,
                            this.x, this.y, spd * Math.cos(a), spd * Math.sin(a),
                            this.StartAreaX, this.StartAreaX + this.NowPlayAreaWidth,
                            this.StartAreaY, this.StartAreaY + this.NowPlayAreaHeight,
                            { width: 12, height: 12, damage: 25, life: 18,
                              BulletImageKey: "BulletTypeA", shape: "circle",
                              target: TargetPlayer, trackingStrength: 0, bounce_count: 3 }
                        );
                    }
                }
            }
            await wait(0.8 / dm);
        }
    }

    /** プレイヤー方向扇形弾 */
    async pattern2_Loop(EnemyBulletArray, TargetPlayer, initialDelay) {
        await wait(initialDelay);
        while (this.NowHPGuageHP > 0) {
            const dm = 1.0 + DifficultyLevel * 0.4;
            if (!this.SkillActivate) {
                const dx = TargetPlayer.x - this.x;
                const dy = TargetPlayer.y - this.y;
                const ca = Math.atan2(dy, dx);
                const n = 5 + Math.floor(DifficultyLevel * 2);
                const spread = Math.PI / 4;
                for (let i = 0; i < n; i++) {
                    const a = ca - spread + (2 * spread * i / (n - 1));
                    EnemyBulletArray.push(new Bullet(this.EnemyContainer, this.x, this.y, {
                        vx: 180 * dm * Math.cos(a), vy: 180 * dm * Math.sin(a),
                        width: 10, height: 10, damage: 20, life: 15,
                        BulletImageKey: "BulletTypeA", shape: "circle",
                        target: TargetPlayer, trackingStrength: 0
                    }));
                }
            }
            await wait(1.0 / dm);
        }
    }

    async _skilrun(DeltaTime, TargetPlayer, EnemyBulletArray) {
        super._skilrun(DeltaTime);
        if (this.SkillActivate && !this.IsSkillTextShown) {
            this.IsSkillTextShown = true;
            this.EnemyContainer.emit('skillActivated', true, 5, 0.1);
            const phase = this.MaxEnemyHPGuage - this.NowEnemyHPGuage;
            const def = this._getSkillDefinitionForPhase(phase);
            if (def) this._executeSkill(def, EnemyBulletArray, TargetPlayer);
            else this.CanMoveFlag = true;
            this.SkillText.visible = true;
            this.SkillTimerText.visible = true;
            const sy = this.SkillText.y;
            gsap.fromTo(this.SkillText, { y: sy + 20, alpha: 0 }, { y: sy, alpha: 1, duration: 0.8, ease: "power2.out" });
            const ty = this.SkillTimerText.y;
            gsap.fromTo(this.SkillTimerText, { y: ty + 20, alpha: 0 }, { y: ty, alpha: 1, duration: 0.8, ease: "power2.out" });
        }
    }

    /** スペル1: 全方位乱反射 */
    async AttackSkill1(EnemyBulletArray, TargetPlayer) {
        const dm = 1.0 + DifficultyLevel * 0.5;
        while (this.NowHPGuageHP > 0 && this.SkillActivate) {
            const n = 12 + Math.floor(4 * DifficultyLevel);
            for (let i = 0; i < n; i++) {
                const a = Math.PI * 2 * i / n + (Math.random() * 0.2);
                const spd = 220 * dm;
                spawnBounceBullet(EnemyBulletArray, this.EnemyContainer,
                    this.x, this.y, spd * Math.cos(a), spd * Math.sin(a),
                    this.StartAreaX, this.StartAreaX + this.NowPlayAreaWidth,
                    this.StartAreaY, this.StartAreaY + this.NowPlayAreaHeight,
                    { width: 10, height: 10, damage: 28, life: 20,
                      BulletImageKey: "BulletTypeA", shape: "circle",
                      target: TargetPlayer, trackingStrength: 0, bounce_count: 4 }
                );
            }
            await wait(0.5 / dm);
        }
        this.CanMoveFlag = true;
    }

    /** スペル2: 格子状に弾を一斉発射 */
    async AttackSkill2(EnemyBulletArray, TargetPlayer) {
        const dm = 1.0 + DifficultyLevel * 0.5;
        while (this.NowHPGuageHP > 0 && this.SkillActivate) {
            const rowCount = 4 + Math.floor(DifficultyLevel);
            const colCount = 3 + Math.floor(DifficultyLevel);

            // 格子の危険警告線を引く
            const warnings = [];
            // 縦に落ちてくる弾の警告（上から下へ）
            for (let i = 0; i < rowCount; i++) {
                const startX = this.StartAreaX + (this.NowPlayAreaWidth * i / rowCount);
                const startY = this.StartAreaY + 10;
                warnings.push(showLineWarning(this.EnemyContainer, startX, startY, startX, startY + this.NowPlayAreaHeight, 14, this.NowPlayAreaHeight, 0.45));
            }
            // 横に進む弾の警告（左から右へ）
            for (let j = 0; j < colCount; j++) {
                const startX2 = this.StartAreaX + 10;
                const startY2 = this.StartAreaY + (this.NowPlayAreaHeight * j / colCount * 0.5);
                warnings.push(showLineWarning(this.EnemyContainer, startX2, startY2, startX2 + this.NowPlayAreaWidth, startY2, 14, this.NowPlayAreaWidth, 0.45));
            }
            await Promise.all(warnings);

            if (this.NowHPGuageHP > 0 && this.SkillActivate) {
                // 横方向 n本
                for (let i = 0; i < rowCount; i++) {
                    const startX = this.StartAreaX + (this.NowPlayAreaWidth * i / rowCount);
                    const startY = this.StartAreaY + 10;
                    EnemyBulletArray.push(new Bullet(this.EnemyContainer, startX, startY, {
                        vx: 0, vy: 200 * dm,
                        width: 10, height: 24, damage: 30, life: 15,
                        BulletImageKey: "BulletTypeA", shape: "rectangle",
                        target: TargetPlayer, trackingStrength: 0
                    }));
                }
                // 縦方向 n本
                for (let j = 0; j < colCount; j++) {
                    const startX2 = this.StartAreaX + 10;
                    const startY2 = this.StartAreaY + (this.NowPlayAreaHeight * j / colCount * 0.5);
                    EnemyBulletArray.push(new Bullet(this.EnemyContainer, startX2, startY2, {
                        vx: 200 * dm, vy: 0,
                        width: 24, height: 10, damage: 30, life: 15,
                        BulletImageKey: "BulletTypeA", shape: "rectangle",
                        target: TargetPlayer, trackingStrength: 0
                    }));
                }
            }
            await wait(1.2 / dm);
        }
        this.CanMoveFlag = true;
    }

    /** スペル3: ランダム角度の反射弾を大量に */
    async AttackSkill3(EnemyBulletArray, TargetPlayer) {
        const dm = 1.0 + DifficultyLevel * 0.5;
        while (this.NowHPGuageHP > 0 && this.SkillActivate) {
            const n = 20 + Math.floor(8 * DifficultyLevel);
            for (let i = 0; i < n; i++) {
                const a = Math.random() * Math.PI * 2;
                const spd = (150 + Math.random() * 100) * dm;
                spawnBounceBullet(EnemyBulletArray, this.EnemyContainer,
                    this.x, this.y, spd * Math.cos(a), spd * Math.sin(a),
                    this.StartAreaX, this.StartAreaX + this.NowPlayAreaWidth,
                    this.StartAreaY, this.StartAreaY + this.NowPlayAreaHeight,
                    { width: 10, height: 10, damage: 25, life: 20,
                      BulletImageKey: "BulletTypeA", shape: "circle",
                      target: TargetPlayer, trackingStrength: 0, bounce_count: 5 }
                );
            }
            await wait(0.6 / dm);
        }
        this.CanMoveFlag = true;
    }

    _getSkillDefinitionForPhase(phase) { return this.SkillDefinitions[phase]; }
}
