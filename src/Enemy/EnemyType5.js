// EnemyType5 — ステージ5ボス
// テーマ: 時間

import { EnemyBase } from "./EnemyBase.js";
import { RoundShotFunc, FanShotFunc } from "./EnemyShot.js";
import { ChangeActivation, Bullet } from '../bullet.js';
import { DifficultyLevel } from "../Screens/BaseScreen.js";
import { enemy_info_list, EnemyTypeEnum } from '../game_status.js';
import { showBurstWarning, showLineWarning, showFanWarning, showAreaWarning, showSpotWarning } from '../DangerWarning.js';

const wait = (seconds) => new Promise(resolve => setTimeout(resolve, seconds * 1000));

export class EnemyType5 extends EnemyBase {
    constructor(GameScreenContainer, StartShootingX, StartShootingY, StartShootingWidth, StartShootingHeight) {
        const enemyInfo = enemy_info_list[EnemyTypeEnum.E_TYPE_5] || enemy_info_list[EnemyTypeEnum.E_TYPE_1];
        const hpGauges = (DifficultyLevel < 1) ? 2 : (DifficultyLevel <= 2) ? 3 : 4;
        const BaseConfig = {
            ...enemyInfo,
            enemy_maxhp: enemyInfo.enemy_maxhp * ((0.6 * DifficultyLevel) + 0.4),
            enemy_hp_guage: hpGauges,
            ETypeTypeID: EnemyTypeEnum.E_TYPE_5
        };
        super(GameScreenContainer, StartShootingX, StartShootingY, StartShootingWidth, StartShootingHeight, BaseConfig);
        this._attackLoopsStarted = false;

        this.SkillDefinitions = {
            0: {
                name: "正弦「波動砲弾幕」",
                NoMoveFlag: false,
                targetX: () => this.StartAreaX + this.NowPlayAreaWidth * 0.5,
                targetY: () => this.StartAreaY + this.NowPlayAreaHeight * 0.2,
                attackFunction: this.AttackSkill1,
                allowMoveAfter: true
            },
            1: {
                name: "飽和「移動爆発陣」",
                NoMoveFlag: false,
                targetX: () => this.StartAreaX + this.NowPlayAreaWidth * 0.5,
                targetY: () => this.StartAreaY + this.NowPlayAreaHeight * 0.3,
                attackFunction: this.AttackSkill2,
                allowMoveAfter: true
            }
        };

        if (DifficultyLevel === 2) {
            // Hard
            this.SkillDefinitions[2] = {
                name: "刻印「キング・クリムゾン」",
                NoMoveFlag: false,
                targetX: () => this.StartAreaX + this.NowPlayAreaWidth * 0.5,
                targetY: () => this.StartAreaY + this.NowPlayAreaHeight * 0.2,
                attackFunction: this.AttackSkill4,
                allowMoveAfter: true
            };
        } else if (DifficultyLevel === 3) {
            // Lunatic
            this.SkillDefinitions[2] = {
                name: "刻印「キング・クリムゾン」",
                NoMoveFlag: false,
                targetX: () => this.StartAreaX + this.NowPlayAreaWidth * 0.5,
                targetY: () => this.StartAreaY + this.NowPlayAreaHeight * 0.2,
                attackFunction: this.AttackSkill4,
                allowMoveAfter: true
            };
            this.SkillDefinitions[3] = {
                name: "遡行「時の砂時計・リバース」",
                NoMoveFlag: false,
                targetX: () => this.StartAreaX + this.NowPlayAreaWidth * 0.5,
                targetY: () => this.StartAreaY + this.NowPlayAreaHeight * 0.25,
                attackFunction: this.AttackSkill5,
                allowMoveAfter: true
            };
        } else if (DifficultyLevel === 1) {
            // Normal
            this.SkillDefinitions[2] = {
                name: "倍速「クロックアップ・オーバー」",
                NoMoveFlag: false,
                targetX: () => this.StartAreaX + this.NowPlayAreaWidth * 0.5,
                targetY: () => this.StartAreaY + this.NowPlayAreaHeight * 0.25,
                attackFunction: this.AttackSkill3,
                allowMoveAfter: true
            };
        }

        // 時間制御エフェクト用のオーバーレイ（青/紫カラー）
        this.timeOverlay = null;
    }

    async Initialize() {
        await super.Initialize();

        // 逆再生時の時間変化エフェクト用グラフィックス
        this.timeOverlay = new PIXI.Graphics();
        this.timeOverlay.beginFill(0x440088);
        this.timeOverlay.drawRect(this.StartAreaX, this.StartAreaY, this.NowPlayAreaWidth, this.NowPlayAreaHeight);
        this.timeOverlay.endFill();
        this.timeOverlay.alpha = 0;
        this.timeOverlay.visible = false;
        this.EnemyContainer.addChild(this.timeOverlay);
    }

    updateScale(NewScaleFactor, NewShootingStartX, NewShootingStartY, NewShootingWidth, NewShootingHeight) {
        super.updateScale(NewScaleFactor, NewShootingStartX, NewShootingStartY, NewShootingWidth, NewShootingHeight);
        if (this.timeOverlay) {
            this.timeOverlay.clear();
            this.timeOverlay.beginFill(0x440088);
            this.timeOverlay.drawRect(NewShootingStartX, NewShootingStartY, NewShootingWidth, NewShootingHeight);
            this.timeOverlay.endFill();
        }
    }

    move(DeltaTime) { super.move(DeltaTime); }

    _shoot(EnemyBulletArray, TargetPlayer, DeltaTime) {
        if (this.NowHPGuageHP <= 0) { 
            this._attackLoopsStarted = false; 
            if (this.timeOverlay) this.timeOverlay.visible = false;
            return; 
        }
        if (!this._attackLoopsStarted) {
            this._attackLoopsStarted = true;
            this.pattern1_Loop(EnemyBulletArray, TargetPlayer, 0.5);
            this.pattern2_Loop(EnemyBulletArray, TargetPlayer, 3.0);
        }
    }

    /**
     * 【通常パターン1】自機方向へのサインカーブ弾
     */
    async pattern1_Loop(EnemyBulletArray, TargetPlayer, initialDelay) {
        await wait(initialDelay);
        while (this.NowHPGuageHP > 0) {
            const dm = 1.0 + DifficultyLevel * 0.5;
            if (!this.SkillActivate) {
                const n = 5 + Math.floor(DifficultyLevel * 2);
                const dx = TargetPlayer.x - this.x;
                const dy = TargetPlayer.y - this.y;
                const baseA = Math.atan2(dy, dx);
                const halfSpread = (n - 1) * 0.2 / 2;
                
                const dist = Math.sqrt(dx * dx + dy * dy) + 200;
                await showFanWarning(
                    this.EnemyContainer,
                    this.x, this.y, dist,
                    baseA - halfSpread, baseA + halfSpread,
                    0.45
                );
                
                if (this.NowHPGuageHP > 0 && !this.SkillActivate) {
                    for (let i = 0; i < n; i++) {
                        const spread = (i - Math.floor(n / 2)) * 0.2;
                        const a = baseA + spread;
                        EnemyBulletArray.push(new Bullet(this.EnemyContainer, this.x, this.y, {
                            vx: 180 * dm * Math.cos(a),
                            vy: 180 * dm * Math.sin(a),
                            ax: 0, ay: 0,
                            sine_wave_enabled: true,
                            sine_amplitude: 40 + Math.random() * 20,
                            sine_angular_frequency: Math.PI * (1.5 + Math.random()),
                            sine_axis: "x",
                            width: 10, height: 10, damage: 25, life: 18,
                            BulletImageKey: "BulletTypeA", shape: "circle"
                        }));
                    }
                }
            }
            await wait(0.6 / dm);
        }
    }

    /**
     * 【通常パターン2】一時停止 ＋ 全方位飽和爆発
     */
    async pattern2_Loop(EnemyBulletArray, TargetPlayer, initialDelay) {
        await wait(initialDelay);
        while (this.NowHPGuageHP > 0) {
            const dm = 1.0 + DifficultyLevel * 0.4;
            if (!this.SkillActivate) {
                this.CanMoveFlag = false;
                const burstRadius = this.NowPlayAreaWidth * 0.35;
                await showBurstWarning(this.EnemyContainer, this.x, this.y, burstRadius, 1.2);
                
                if (this.NowHPGuageHP > 0 && !this.SkillActivate) {
                    const n = 20 + Math.floor(6 * DifficultyLevel);
                    for (let i = 0; i < n; i++) {
                        const a = Math.PI * 2 * i / n;
                        const spd = 220 * dm;
                        EnemyBulletArray.push(new Bullet(this.EnemyContainer, this.x, this.y, {
                            vx: spd * Math.cos(a), vy: spd * Math.sin(a),
                            width: 10, height: 10, damage: 20, life: 15,
                            BulletImageKey: "BulletTypeA", shape: "circle"
                        }));
                    }
                }
                this.CanMoveFlag = true;
            }
            await wait(3.5 / dm);
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

    /**
     * スペル1: 正弦「波動砲弾幕」（時間凍結＋設置型円弧弾）
     */
    async AttackSkill1(EnemyBulletArray, TargetPlayer) {
        const dm = 1.0 + DifficultyLevel * 0.5;
        this.CanMoveFlag = false;

        const originalSpeed = TargetPlayer.BaseSpeed || 200;

        while (this.NowHPGuageHP > 0 && this.SkillActivate) {
            // 1. 時間停止の予兆（背景を紫化、プレイヤー及び弾幕の完全静止）
            this.timeOverlay.visible = true;
            gsap.to(this.timeOverlay, { alpha: 0.5, duration: 0.2 });
            
            // プレイヤー移動封印
            TargetPlayer.BaseSpeed = 0;
            
            // 既存弾の速度を保存して停止
            const frozenBullets = [];
            for (const b of EnemyBulletArray) {
                if (b.isHit) continue;
                b.savedVx = b.vx; b.savedVy = b.vy;
                b.savedAx = b.ax; b.savedAy = b.ay;
                b.vx = 0; b.vy = 0;
                b.ax = 0; b.ay = 0;
                frozenBullets.push(b);
            }

            // 2. 静止中に円弧弾幕を設置（4層）
            const layers = 4;
            const bulletsPerLayer = 6 + Math.floor(DifficultyLevel * 2);
            const spreadAngle = 100;
            const oneStep = spreadAngle / (bulletsPerLayer - 1);
            
            const newBullets = [];

            for (let lay = 0; lay < layers; lay++) {
                const startAngle = 90 - spreadAngle / 2;
                const rOffset = 30 + lay * 25;
                
                // 射出予告線の表示
                const fanAStart = (startAngle) * Math.PI / 180;
                const fanAEnd = (startAngle + spreadAngle) * Math.PI / 180;
                showFanWarning(this.EnemyContainer, this.x, this.y, 700, fanAStart, fanAEnd, 0.6);

                for (let i = 0; i < bulletsPerLayer; i++) {
                    const angleRad = (startAngle + i * oneStep) * Math.PI / 180;
                    const sx = this.x + rOffset * Math.cos(angleRad);
                    const sy = this.y + rOffset * Math.sin(angleRad);
                    
                    const b = new Bullet(this.EnemyContainer, sx, sy, {
                        vx: 0, vy: 0, ax: 0, ay: 0,
                        width: 12, height: 12, damage: 25, life: 15,
                        BulletImageKey: "BulletTypeA", shape: "circle"
                    });
                    EnemyBulletArray.push(b);
                    newBullets.push({ bullet: b, angleRad });
                }
            }

            await wait(1.2); // 1.2秒間の時間凍結

            if (this.NowHPGuageHP <= 0 || !this.SkillActivate) {
                TargetPlayer.BaseSpeed = originalSpeed;
                break;
            }

            // 3. 時間始動（背景復元、速度復元、新設弾の射出）
            gsap.to(this.timeOverlay, { alpha: 0, duration: 0.2, onComplete: () => this.timeOverlay.visible = false });
            TargetPlayer.BaseSpeed = originalSpeed;

            // 既存弾の速度復元
            for (const b of frozenBullets) {
                if (b.isHit) continue;
                b.vx = b.savedVx; b.vy = b.savedVy;
                b.ax = b.savedAx; b.ay = b.savedAy;
            }

            // 新設弾の射出
            const speed = 400 * dm;
            for (const item of newBullets) {
                if (item.bullet.isHit) continue;
                item.bullet.vx = speed * Math.cos(item.bullet.savedAngleRad || item.angleRad);
                item.bullet.vy = speed * Math.sin(item.bullet.savedAngleRad || item.angleRad);
            }

            await wait(2.0 / dm);
        }
        
        TargetPlayer.BaseSpeed = originalSpeed;
        this.timeOverlay.visible = false;
        this.CanMoveFlag = true;
    }

    /**
     * スペル2: 飽和「移動爆発陣」（高速テレポート設置弾＋反射境界）
     */
    async AttackSkill2(EnemyBulletArray, TargetPlayer) {
        const dm = 1.0 + DifficultyLevel * 0.5;
        this.CanMoveFlag = false;

        const teleportCount = 3 + Math.floor(DifficultyLevel);

        while (this.NowHPGuageHP > 0 && this.SkillActivate) {
            const placedSpots = [];

            // 1. 高速テレポート＆置き弾
            for (let t = 0; t < teleportCount; t++) {
                if (this.NowHPGuageHP <= 0 || !this.SkillActivate) break;

                const tx = this.StartAreaX + this.NowPlayAreaWidth * (0.2 + Math.random() * 0.6);
                const ty = this.StartAreaY + this.NowPlayAreaHeight * (0.1 + Math.random() * 0.25);
                
                // 瞬間移動
                await new Promise(r => gsap.to(this, { x: tx, y: ty, duration: 0.1, onComplete: r }));
                placedSpots.push({ x: this.x, y: this.y });

                // 置き弾警告
                showSpotWarning(this.EnemyContainer, this.x, this.y, 25, 0.4);
                await wait(0.15);
            }

            if (this.NowHPGuageHP <= 0 || !this.SkillActivate) break;

            // 2. 設置した置き弾から壁反射の6方向連続連射
            const loopCount = 2 + Math.floor(DifficultyLevel); // 連射数（2〜5連）
            for (const spot of placedSpots) {
                for (let i = 0; i < loopCount; i++) {
                    const speed = (140 + i * 35) * dm;
                    const opt = {
                        vx: speed, vy: speed,
                        width: 14, height: 14, damage: 20, life: 20,
                        BulletImageKey: "BulletTypeA", shape: "circle",
                        bounce: true,
                        minXArea: this.StartAreaX,
                        maxXArea: this.StartAreaX + this.NowPlayAreaWidth,
                        minYArea: this.StartAreaY,
                        maxYArea: this.StartAreaY + this.NowPlayAreaHeight,
                        bounceCount: 3
                    };
                    RoundShotFunc(EnemyBulletArray, spot.x, spot.y, 6, i * 15, opt, 360, this.EnemyContainer);
                }
            }

            await wait(2.5 / dm);
        }
        this.CanMoveFlag = true;
    }

    /**
     * スペル3: 倍速「クロックアップ・オーバー」（Normal用高速化）
     */
    async AttackSkill3(EnemyBulletArray, TargetPlayer) {
        const speedMultiplier = 2.5 + Math.tan(DifficultyLevel * 0.4); // 倍速スケール
        this.CanMoveFlag = true;

        while (this.NowHPGuageHP > 0 && this.SkillActivate) {
            // 本体が高速で点滅し、倍速状態を演出
            this.EnemyImage.alpha = 0.4 + 0.6 * Math.sin(Date.now() * 0.05);

            // 通常パターン1を倍速で射出
            const n = 6 + Math.floor(DifficultyLevel * 2);
            const dx = TargetPlayer.x - this.x;
            const dy = TargetPlayer.y - this.y;
            const baseA = Math.atan2(dy, dx);
            
            for (let i = 0; i < n; i++) {
                const spread = (i - Math.floor(n / 2)) * 0.25;
                const a = baseA + spread;
                EnemyBulletArray.push(new Bullet(this.EnemyContainer, this.x, this.y, {
                    vx: 260 * speedMultiplier * Math.cos(a),
                    vy: 260 * speedMultiplier * Math.sin(a),
                    width: 10, height: 10, damage: 20, life: 10,
                    BulletImageKey: "BulletTypeA", shape: "circle"
                }));
            }

            // 倍速での待機
            await wait(0.3 / speedMultiplier);
        }
        
        if (this.EnemyImage) this.EnemyImage.alpha = 1.0;
        this.CanMoveFlag = true;
    }

    /**
     * スペル4: 刻印「キング・クリムゾン」（時間飛び＋位置補正）
     */
    async AttackSkill4(EnemyBulletArray, TargetPlayer) {
        const dm = 1.0 + DifficultyLevel * 0.5;
        this.CanMoveFlag = false;

        let time = 0;
        while (this.NowHPGuageHP > 0 && this.SkillActivate) {
            time += 0.1;

            // 1. 螺旋風車を配置
            const optWindmill = { vx: 160 * dm, vy: 160 * dm, width: 10, height: 10, damage: 20, life: 15, BulletImageKey: "BulletTypeA", shape: "circle" };
            RoundShotFunc(EnemyBulletArray, this.x, this.y, 8, time * 25, optWindmill, 360, this.EnemyContainer);

            // 2. 定期的に「時間消し飛び」を発動
            if (Math.floor(time * 10) % 25 === 0) {
                // 赤色の全画面消し飛びフラッシュ
                this.timeOverlay.visible = true;
                this.timeOverlay.tint = 0xff3333; // 赤
                gsap.fromTo(this.timeOverlay, { alpha: 0.7 }, { alpha: 0, duration: 0.3, onComplete: () => this.timeOverlay.visible = false });

                // 弾の瞬間移動（スキップ）
                for (const b of EnemyBulletArray) {
                    if (b.isHit || !b.vx) continue;
                    b.pathCenterX += b.vx * 1.2; // 1.2秒分進む
                    b.pathCenterY += b.vy * 1.2;
                }

                // ボス本体も別の場所に瞬間移動
                const tx = this.StartAreaX + this.NowPlayAreaWidth * (0.2 + Math.random() * 0.6);
                const ty = this.StartAreaY + this.NowPlayAreaHeight * (0.1 + Math.random() * 0.25);
                this.x = tx;
                this.y = ty;
            }

            await wait(0.1);
        }
        this.CanMoveFlag = true;
    }

    /**
     * スペル5: 遡行「時の砂時計・リバース」（Lunatic限定時間逆再生）
     */
    async AttackSkill5(EnemyBulletArray, TargetPlayer) {
        this.CanMoveFlag = false;

        const maxFrames = 150; // 記録するフレーム数の上限
        let history = []; // 弾の座標履歴
        let reverseTimer = 0;

        while (this.NowHPGuageHP > 0 && this.SkillActivate) {
            // --- 順再生（Forward）フェーズ（3.0秒間） ---
            history = [];
            reverseTimer = 0;
            this.timeOverlay.visible = false;
            
            const startFwdTime = Date.now();
            while (Date.now() - startFwdTime < 3000) {
                if (this.NowHPGuageHP <= 0 || !this.SkillActivate) break;

                // 螺旋弾幕の射出
                const a = (Date.now() * 0.003);
                const count = 12;
                const opt = { vx: 180, vy: 180, width: 12, height: 12, damage: 20, life: 10, BulletImageKey: "BulletTypeA", shape: "circle" };
                RoundShotFunc(EnemyBulletArray, this.x, this.y, count, a * 180 / Math.PI, opt, 360, this.EnemyContainer);

                // 全弾の現在の座標を履歴に記録
                const frame = EnemyBulletArray.map(b => {
                    // IDが無ければ付与して一意にする
                    if (b.revId === undefined) b.revId = Math.random();
                    return {
                        bullet: b,
                        revId: b.revId,
                        x: b.x,
                        y: b.y
                    };
                });
                history.push(frame);
                if (history.length > maxFrames) history.shift();

                await wait(0.06);
            }

            if (this.NowHPGuageHP <= 0 || !this.SkillActivate) break;

            // --- 逆再生（Reverse）フェーズ（3.0秒間） ---
            this.timeOverlay.visible = true;
            this.timeOverlay.tint = 0x440088; // 紫
            gsap.to(this.timeOverlay, { alpha: 0.5, duration: 0.2 });

            // 弾の自動更新速度を一時ゼロに
            const backupVelocities = [];
            for (const b of EnemyBulletArray) {
                if (b.isHit) continue;
                backupVelocities.push({
                    bullet: b,
                    vx: b.vx, vy: b.vy,
                    ax: b.ax, ay: b.ay
                });
                b.vx = 0; b.vy = 0;
                b.ax = 0; b.ay = 0;
            }

            // 履歴を逆から辿る（再生速度は難易度補正で2倍速等も考慮）
            const playbackSpeed = 2.0; // 逆再生は2倍速で巻き戻す
            for (let i = history.length - 1; i >= 0; i -= playbackSpeed) {
                if (this.NowHPGuageHP <= 0 || !this.SkillActivate) break;

                const frameIndex = Math.floor(i);
                if (frameIndex < 0) break;
                const frame = history[frameIndex];

                // 弾の座標を過去の座標に強制上書き
                for (const item of frame) {
                    const b = item.bullet;
                    if (b && !b.isHit) {
                        b.x = item.x;
                        b.y = item.y;
                        b.pathCenterX = item.x + b.width / 2;
                        b.pathCenterY = item.y + b.height / 2;

                        // ボス本体に極端に近づいたら吸収消滅させる
                        const distToBoss = Math.sqrt((b.x - this.x)**2 + (b.y - this.y)**2);
                        if (distToBoss < 40) {
                            b.destroy();
                        }
                    }
                }

                await wait(0.06);
            }

            // 速度の復元
            for (const item of backupVelocities) {
                if (item.bullet && !item.bullet.isHit) {
                    item.bullet.vx = item.vx;
                    item.bullet.vy = item.vy;
                    item.bullet.ax = item.ax;
                    item.bullet.ay = item.ay;
                }
            }

            // 逆再生のオーバーレイをフェードアウト
            gsap.to(this.timeOverlay, { alpha: 0, duration: 0.2, onComplete: () => this.timeOverlay.visible = false });
            await wait(0.5);
        }

        this.timeOverlay.visible = false;
        this.CanMoveFlag = true;
    }

    _getSkillDefinitionForPhase(phase) { return this.SkillDefinitions[phase]; }
}
