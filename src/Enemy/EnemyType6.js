// EnemyType6 — ステージ6ボス
// テーマ: 螺旋 / 加速弾
// 通常攻撃: 螺旋弾(回転位相) + 加速弾(ジャーク)
// スペル: 二重螺旋 / 加加速弾幕 / 収束螺旋
import { EnemyBase } from "./EnemyBase.js";
import { RoundShotFunc, CircleAndHomeShotFunc } from "./EnemyShot.js";
import { ChangeActivation, Bullet } from '../bullet.js';
import { DifficultyLevel } from "../Screens/BaseScreen.js";
import { enemy_info_list, EnemyTypeEnum } from '../game_status.js';
import { showBurstWarning } from '../DangerWarning.js';

const wait = (seconds) => new Promise(resolve => setTimeout(resolve, seconds * 1000));

export class EnemyType6 extends EnemyBase {
    constructor(GameScreenContainer, StartShootingX, StartShootingY, StartShootingWidth, StartShootingHeight) {
        const enemyInfo = enemy_info_list[EnemyTypeEnum.E_TYPE_6];
        const BaseConfig = {
            ...enemyInfo,
            enemy_maxhp: enemyInfo.enemy_maxhp * ((0.6 * DifficultyLevel) + 0.4),
            enemy_hp_guage: (DifficultyLevel < 2) ? 2 : 3,
            ETypeTypeID: EnemyTypeEnum.E_TYPE_6
        };
        super(GameScreenContainer, StartShootingX, StartShootingY, StartShootingWidth, StartShootingHeight, BaseConfig);
        this._attackLoopsStarted = false;

        this.SkillDefinitions = {
            0: {
                name: "螺旋「銀河渦動」",
                NoMoveFlag: false,
                targetX: () => this.StartAreaX + this.NowPlayAreaWidth * 0.5,
                targetY: () => this.StartAreaY + this.NowPlayAreaHeight * 0.25,
                attackFunction: this.AttackSkill1,
                allowMoveAfter: true
            },
            1: {
                name: "加速「無限加速度」",
                NoMoveFlag: false,
                targetX: () => this.StartAreaX + this.NowPlayAreaWidth * 0.5,
                targetY: () => this.StartAreaY + this.NowPlayAreaHeight * 0.2,
                attackFunction: this.AttackSkill2,
                allowMoveAfter: true
            },
            2: {
                name: "収束「引力点」",
                NoMoveFlag: false,
                targetX: () => this.StartAreaX + this.NowPlayAreaWidth * 0.5,
                targetY: () => this.StartAreaY + this.NowPlayAreaHeight * 0.3,
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
            this.pattern2_Loop(EnemyBulletArray, TargetPlayer, 2.0);
        }
    }

    /** 螺旋弾 */
    async pattern1_Loop(EnemyBulletArray, TargetPlayer, initialDelay) {
        await wait(initialDelay);
        let phase = 0;
        while (this.NowHPGuageHP > 0) {
            const dm = 1.0 + DifficultyLevel * 0.5;
            if (!this.SkillActivate) {
                const arms = 3;
                const spd = 200 * dm;
                for (let i = 0; i < arms; i++) {
                    const a = phase + (Math.PI * 2 * i / arms);
                    EnemyBulletArray.push(new Bullet(this.EnemyContainer, this.x, this.y, {
                        vx: spd * Math.cos(a), vy: spd * Math.sin(a),
                        ax: 0, ay: 0, width: 10, height: 10,
                        damage: 22, life: 15,
                        BulletImageKey: "BulletTypeA", shape: "circle",
                        target: TargetPlayer, trackingStrength: 0
                    }));
                }
                phase += 0.2;
            }
            await wait(0.12 / dm);
        }
    }

    /** 加速弾 — jx/jy で加加速度 */
    async pattern2_Loop(EnemyBulletArray, TargetPlayer, initialDelay) {
        await wait(initialDelay);
        while (this.NowHPGuageHP > 0) {
            const dm = 1.0 + DifficultyLevel * 0.4;
            if (!this.SkillActivate) {
                const n = 8 + Math.floor(DifficultyLevel * 2);
                await showBurstWarning(this.EnemyContainer, this.x, this.y, 60, 0.45);
                if (this.NowHPGuageHP > 0 && !this.SkillActivate) {
                    for (let i = 0; i < n; i++) {
                        const a = Math.PI * 2 * i / n;
                        const initSpd = 30;
                        const accel = 60 * dm;
                        EnemyBulletArray.push(new Bullet(this.EnemyContainer, this.x, this.y, {
                            vx: initSpd * Math.cos(a), vy: initSpd * Math.sin(a),
                            ax: accel * Math.cos(a), ay: accel * Math.sin(a),
                            jx: 5 * Math.cos(a), jy: 5 * Math.sin(a),
                            width: 12, height: 12, damage: 30, life: 18,
                            BulletImageKey: "BulletTypeA", shape: "circle",
                            target: TargetPlayer, trackingStrength: 0
                        }));
                    }
                }
            }
            await wait(1.5 / dm);
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

    /** スペル1: 二重螺旋 */
    async AttackSkill1(EnemyBulletArray, TargetPlayer) {
        const dm = 1.0 + DifficultyLevel * 0.5;
        let phase = 0;
        while (this.NowHPGuageHP > 0 && this.SkillActivate) {
            // 時計回り螺旋
            for (let i = 0; i < 5; i++) {
                const a = phase + (Math.PI * 2 * i / 5);
                EnemyBulletArray.push(new Bullet(this.EnemyContainer, this.x, this.y, {
                    vx: 220 * dm * Math.cos(a), vy: 220 * dm * Math.sin(a),
                    width: 10, height: 10, damage: 25, life: 18,
                    BulletImageKey: "BulletTypeA", shape: "circle",
                    target: TargetPlayer, trackingStrength: 0
                }));
            }
            // 反時計回り螺旋
            for (let i = 0; i < 5; i++) {
                const a = -phase + (Math.PI * 2 * i / 5) + Math.PI / 5;
                EnemyBulletArray.push(new Bullet(this.EnemyContainer, this.x, this.y, {
                    vx: 200 * dm * Math.cos(a), vy: 200 * dm * Math.sin(a),
                    width: 8, height: 8, damage: 20, life: 18,
                    BulletImageKey: "BulletTypeA", shape: "circle",
                    target: TargetPlayer, trackingStrength: 0
                }));
            }
            phase += 0.12;
            await wait(0.15);
        }
        this.CanMoveFlag = true;
    }

    /** スペル2: 加加速弾幕 — 遅く出て急激に加速 */
    async AttackSkill2(EnemyBulletArray, TargetPlayer) {
        const dm = 1.0 + DifficultyLevel * 0.5;
        let phase = 0;
        while (this.NowHPGuageHP > 0 && this.SkillActivate) {
            const n = 16 + Math.floor(6 * DifficultyLevel);
            await showBurstWarning(this.EnemyContainer, this.x, this.y, 80, 0.5);
            if (this.NowHPGuageHP > 0 && this.SkillActivate) {
                for (let i = 0; i < n; i++) {
                    const a = phase + (Math.PI * 2 * i / n);
                    EnemyBulletArray.push(new Bullet(this.EnemyContainer, this.x, this.y, {
                        vx: 10 * Math.cos(a), vy: 10 * Math.sin(a),
                        ax: 50 * dm * Math.cos(a), ay: 50 * dm * Math.sin(a),
                        jx: 15 * Math.cos(a), jy: 15 * Math.sin(a),
                        width: 10, height: 10, damage: 30, life: 18,
                        BulletImageKey: "BulletTypeA", shape: "circle",
                        target: TargetPlayer, trackingStrength: 0
                    }));
                }
            }
            phase += 0.3;
            await wait(0.5 / dm);
        }
        this.CanMoveFlag = true;
    }

    /** スペル3: 収束弾 — 外周から中心へ収束後散開 */
    async AttackSkill3(EnemyBulletArray, TargetPlayer) {
        const dm = 1.0 + DifficultyLevel * 0.5;
        while (this.NowHPGuageHP > 0 && this.SkillActivate) {
            const n = 20 + Math.floor(4 * DifficultyLevel);
            // 収束範囲（折り返し地点）を示す警告
            const turnRadius = this.NowPlayAreaWidth * 0.08;
            await showBurstWarning(this.EnemyContainer, this.x, this.y, turnRadius, 0.55);
            if (this.NowHPGuageHP > 0 && this.SkillActivate) {
                // 追尾→一定距離で方向転換
                CircleAndHomeShotFunc(EnemyBulletArray, this.x, this.y, n, 0, 360,
                    { vx: 100, vy: 100, ax: 0, ay: 0, jx: 0, jy: 0, width: 10, height: 10, damage: 25, life: 20, BulletImageKey: "BulletTypeA", shape: "circle" },
                    { ChangeActivation: ChangeActivation.Activate1, vx: 200 * dm, vy: 200 * dm, ax: 0, ay: 0, jx: 0, jy: 0, LengthParcent: 1.0 },
                    turnRadius,
                    this.EnemyContainer
                );
            }
            await wait(0.8 / dm);
        }
        this.CanMoveFlag = true;
    }

    // QRコード+パックマン

    // ピンポン

    _getSkillDefinitionForPhase(phase) { return this.SkillDefinitions[phase]; }
}
