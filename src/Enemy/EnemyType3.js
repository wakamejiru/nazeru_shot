// EnemyType3 — ステージ3ボス
// 使役＋力学

import { EnemyBase } from "./EnemyBase.js";
import { SingleShotFunc, RoundShotFunc, FanShotFunc, CircleAndHomeShotFunc } from "./EnemyShot.js";
import { ChangeActivation, Bullet } from '../bullet.js';
import { DifficultyLevel } from "../Screens/BaseScreen.js";
import { enemy_info_list, EnemyTypeEnum } from '../game_status.js';
import { showBurstWarning, showLineWarning, showSpotWarning } from '../DangerWarning.js';

const wait = (seconds) => new Promise(resolve => setTimeout(resolve, seconds * 1000));

export class EnemyType3 extends EnemyBase {
    constructor(GameScreenContainer, StartShootingX, StartShootingY, StartShootingWidth, StartShootingHeight) {
        const enemyInfo = enemy_info_list[EnemyTypeEnum.E_TYPE_3] || enemy_info_list[EnemyTypeEnum.E_TYPE_1];
        const hpGauges = (DifficultyLevel < 1) ? 2 : (DifficultyLevel <= 2) ? 3 : 4;
        const BaseConfig = {
            ...enemyInfo,
            enemy_maxhp: enemyInfo.enemy_maxhp * ((0.6 * DifficultyLevel) + 0.4),
            enemy_hp_guage: hpGauges,
            ETypeTypeID: EnemyTypeEnum.E_TYPE_3
        };
        super(GameScreenContainer, StartShootingX, StartShootingY, StartShootingWidth, StartShootingHeight, BaseConfig);
        this._attackLoopsStarted = false;

        // 使い魔の初期化（ボスのテクスチャを流用・縮小・着色して表現）
        this.servant1 = null;
        this.servant2 = null;

        this.SkillDefinitions = {
            0: {
                name: "回転螺旋「渦の中心」",
                NoMoveFlag: false,
                targetX: () => this.StartAreaX + this.NowPlayAreaWidth * 0.5,
                targetY: () => this.StartAreaY + this.NowPlayAreaHeight * 0.2,
                attackFunction: this.AttackSkill1,
                allowMoveAfter: true
            },
            1: {
                name: "使役「楕円引力フィールド」",
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
                name: "風車使役「偏心加速度」",
                NoMoveFlag: false,
                targetX: () => this.StartAreaX + this.NowPlayAreaWidth * 0.5,
                targetY: () => this.StartAreaY + this.NowPlayAreaHeight * 0.25,
                attackFunction: this.AttackSkill4,
                allowMoveAfter: true
            };
        } else if (DifficultyLevel === 3) {
            // Lunatic
            this.SkillDefinitions[2] = {
                name: "風車使役「偏心加速度」",
                NoMoveFlag: false,
                targetX: () => this.StartAreaX + this.NowPlayAreaWidth * 0.5,
                targetY: () => this.StartAreaY + this.NowPlayAreaHeight * 0.25,
                attackFunction: this.AttackSkill4,
                allowMoveAfter: true
            };
            this.SkillDefinitions[3] = {
                name: "重力「空間歪曲フィールド」",
                NoMoveFlag: false,
                targetX: () => this.StartAreaX + this.NowPlayAreaWidth * 0.5,
                targetY: () => this.StartAreaY + this.NowPlayAreaHeight * 0.2,
                attackFunction: this.AttackSkill5,
                allowMoveAfter: true
            };
        } else if (DifficultyLevel === 1) {
            // Normal
            this.SkillDefinitions[2] = {
                name: "二重振り子「連動追尾」",
                NoMoveFlag: false,
                targetX: () => this.StartAreaX + this.NowPlayAreaWidth * 0.5,
                targetY: () => this.StartAreaY + this.NowPlayAreaHeight * 0.25,
                attackFunction: this.AttackSkill3,
                allowMoveAfter: true
            };
        }

        // ペンデュラムおよび使い魔制御用の変数
        this.servantTimer = 0;
        this.isPendulumActive = false;
    }

    async Initialize() {
        await super.Initialize();

        const texture = PIXI.Texture.from(this.EnemyImageKey);
        
        // 使い魔1
        this.servant1 = new PIXI.Sprite(texture);
        this.servant1.anchor.set(0.5);
        this.servant1.scale.set(this.CurrentScaleFactor * 0.4);
        this.servant1.tint = 0x88ff88;
        this.EnemyContainer.addChild(this.servant1);

        // 使い魔2
        this.servant2 = new PIXI.Sprite(texture);
        this.servant2.anchor.set(0.5);
        this.servant2.scale.set(this.CurrentScaleFactor * 0.4);
        this.servant2.tint = 0x8888ff;
        this.EnemyContainer.addChild(this.servant2);

        // 初期配置
        this.servant1.x = this.x - 80;
        this.servant1.y = this.y + 40;
        this.servant2.x = this.x + 80;
        this.servant2.y = this.y + 40;
    }

    updateScale(NewScaleFactor, NewShootingStartX, NewShootingStartY, NewShootingWidth, NewShootingHeight) {
        super.updateScale(NewScaleFactor, NewShootingStartX, NewShootingStartY, NewShootingWidth, NewShootingHeight);
        if (this.servant1) this.servant1.scale.set(NewScaleFactor * 0.4);
        if (this.servant2) this.servant2.scale.set(NewScaleFactor * 0.4);
    }

    move(DeltaTime) { 
        super.move(DeltaTime); 
        this.updateServantPositions(DeltaTime);
    }

    /**
     * 使い魔の通常巡回アニメーション
     */
    updateServantPositions(DeltaTime) {
        if (!this.servant1 || !this.servant2) return;
        this.servantTimer += DeltaTime;

        if (!this.isPendulumActive) {
            // 通常時の楕円周回軌道
            const angle = this.servantTimer * 2.5;
            this.servant1.x = this.x + 100 * Math.cos(angle);
            this.servant1.y = this.y + 45 * Math.sin(angle);

            this.servant2.x = this.x - 100 * Math.cos(angle);
            this.servant2.y = this.y - 45 * Math.sin(angle);
        }
    }

    _shoot(EnemyBulletArray, TargetPlayer, DeltaTime) {
        if (this.NowHPGuageHP <= 0) { 
            this._attackLoopsStarted = false; 
            if (this.servant1) this.servant1.visible = false;
            if (this.servant2) this.servant2.visible = false;
            return; 
        }
        if (!this._attackLoopsStarted) {
            this._attackLoopsStarted = true;
            this.pattern1_Loop(EnemyBulletArray, TargetPlayer, 0.5);
            this.pattern2_Loop(EnemyBulletArray, TargetPlayer, 2.0);
            this.pattern4_Loop(EnemyBulletArray, TargetPlayer, 3.5);
            this.pattern5_Loop(EnemyBulletArray, TargetPlayer, 4.5);
        }
    }

    /**
     * 【通常パターン1】風車追尾弾 ＋ 使い魔時間差扇形弾
     */
    async pattern1_Loop(EnemyBulletArray, TargetPlayer, initialDelay) {
        await wait(initialDelay);
        let rotAngle = 0;
        while (this.NowHPGuageHP > 0) {
            const dm = 1.0 + DifficultyLevel * 0.5;
            if (this.NowHPGuageHP > 0 && !this.SkillActivate) {
                // 1. 本体から風車弾（のち追尾）
                const arms = 6 + Math.floor(DifficultyLevel * 2);
                const speed = 180 * dm;
                for (let i = 0; i < arms; i++) {
                    const a = rotAngle + (i * Math.PI * 2 / arms);
                    const bulletOptions = {
                        vx: speed * Math.cos(a), vy: speed * Math.sin(a),
                        ax: 0, ay: 0, width: 10, height: 10,
                        damage: 20, life: 15,
                        BulletImageKey: "BulletTypeA", shape: "circle",
                        ActivationLength: 120,
                        PostActivationOptions: {
                            ChangeActivation: ChangeActivation.Activate1,
                            vx: 180 * dm, vy: 180 * dm, ax: 0, ay: 0, jx: 0, jy: 0,
                            trackingStrength: 1.0 * dm, maxSpeed: 220, LengthParcent: 1.0
                        },
                        target: TargetPlayer
                    };
                    EnemyBulletArray.push(new Bullet(this.EnemyContainer, this.x, this.y, bulletOptions));
                }
                rotAngle += 0.25 / dm;

                // 2. 使い魔からの時間差扇形弾
                const fanCount = 3 + Math.floor(DifficultyLevel);
                const fanSpread = 50;
                
                // 使い魔1から発射
                const angleToPlayer1 = Math.atan2(TargetPlayer.y - this.servant1.y, TargetPlayer.x - this.servant1.x) * 180 / Math.PI;
                const opt1 = { vx: 200, vy: 200, width: 10, height: 10, damage: 15, life: 10, BulletImageKey: "BulletTypeA", shape: "circle" };
                for(let i = 0; i < fanCount; i++) {
                    if (this.NowHPGuageHP <= 0 || this.SkillActivate) break;
                    // 外側から1発ずつ
                    const stepAngle = angleToPlayer1 - fanSpread/2 + (fanSpread * i / (fanCount - 1));
                    FanShotFunc(EnemyBulletArray, this.servant1.x, this.servant1.y, 1, 0, stepAngle, opt1, this.EnemyContainer);
                    await wait(0.08);
                }

                // 使い魔2から発射
                const angleToPlayer2 = Math.atan2(TargetPlayer.y - this.servant2.y, TargetPlayer.x - this.servant2.x) * 180 / Math.PI;
                const opt2 = { vx: 200, vy: 200, width: 10, height: 10, damage: 15, life: 10, BulletImageKey: "BulletTypeA", shape: "circle" };
                for(let i = 0; i < fanCount; i++) {
                    if (this.NowHPGuageHP <= 0 || this.SkillActivate) break;
                    const stepAngle = angleToPlayer2 + fanSpread/2 - (fanSpread * i / (fanCount - 1));
                    FanShotFunc(EnemyBulletArray, this.servant2.x, this.servant2.y, 1, 0, stepAngle, opt2, this.EnemyContainer);
                    await wait(0.08);
                }
            }
            await wait(2.5 / dm);
        }
    }

    /**
     * 【通常パターン2】歯磨き粉ストリーム ＋ 使い魔Vの字包囲弾
     */
    async pattern2_Loop(EnemyBulletArray, TargetPlayer, initialDelay) {
        await wait(initialDelay);
        while (this.NowHPGuageHP > 0) {
            const dm = 1.0 + DifficultyLevel * 0.4;
            if (this.NowHPGuageHP > 0 && !this.SkillActivate) {
                // 1. 使い魔がVの字で外周をブロック
                const optV1 = { vx: 320 * dm, vy: 320 * dm, width: 12, height: 12, damage: 20, life: 10, BulletImageKey: "BulletTypeA", shape: "circle" };
                const aV1 = Math.atan2(TargetPlayer.y - 120 - this.servant1.y, TargetPlayer.x - 60 - this.servant1.x) * 180 / Math.PI;
                FanShotFunc(EnemyBulletArray, this.servant1.x, this.servant1.y, 3, 10, aV1, optV1, this.EnemyContainer);

                const optV2 = { vx: 320 * dm, vy: 320 * dm, width: 12, height: 12, damage: 20, life: 10, BulletImageKey: "BulletTypeA", shape: "circle" };
                const aV2 = Math.atan2(TargetPlayer.y - 120 - this.servant2.y, TargetPlayer.x + 60 - this.servant2.x) * 180 / Math.PI;
                FanShotFunc(EnemyBulletArray, this.servant2.x, this.servant2.y, 3, 10, aV2, optV2, this.EnemyContainer);

                // 2. 本体から歯磨き粉のような不揃いストリーム射出
                const count = 10 + Math.floor(DifficultyLevel * 4);
                for (let i = 0; i < count; i++) {
                    if (this.NowHPGuageHP <= 0 || this.SkillActivate) break;
                    const dx = TargetPlayer.x - this.x;
                    const dy = TargetPlayer.y - this.y;
                    const baseAngle = Math.atan2(dy, dx);
                    // 揺らぎを追加
                    const angle = baseAngle + (Math.random() - 0.5) * 0.35;
                    const speed = 130 + Math.random() * 140;

                    EnemyBulletArray.push(new Bullet(this.EnemyContainer, this.x, this.y, {
                        vx: speed * Math.cos(angle), vy: speed * Math.sin(angle),
                        width: 8, height: 8, damage: 15, life: 10,
                        BulletImageKey: "BulletTypeA", shape: "circle"
                    }));
                    await wait(0.08);
                }
            }
            await wait(2.2 / dm);
        }
    }

    /**
     * 【通常パターン4】使い魔の左右布陣円形弾 ＋ 本体落葉弾
     */
    async pattern4_Loop(EnemyBulletArray, TargetPlayer, initialDelay) {
        await wait(initialDelay);
        while (this.NowHPGuageHP > 0) {
            const dm = 1.0 + DifficultyLevel * 0.4;
            if (this.NowHPGuageHP > 0 && !this.SkillActivate) {
                this.isPendulumActive = true;
                
                // 使い魔を一時的に左右の定位置にスライド移動
                const leftPos = { x: this.StartAreaX + this.NowPlayAreaWidth * 0.15, y: this.StartAreaY + this.NowPlayAreaHeight * 0.35 };
                const rightPos = { x: this.StartAreaX + this.NowPlayAreaWidth * 0.85, y: this.StartAreaY + this.NowPlayAreaHeight * 0.35 };
                
                gsap.to(this.servant1, { x: leftPos.x, y: leftPos.y, duration: 0.6 });
                gsap.to(this.servant2, { x: rightPos.x, y: rightPos.y, duration: 0.6 });
                await wait(0.6);

                if (this.NowHPGuageHP > 0 && !this.SkillActivate) {
                    const circleCount = 12 + Math.floor(DifficultyLevel * 4);
                    const opt = { vx: 120, vy: 120, width: 10, height: 10, damage: 15, life: 10, BulletImageKey: "BulletTypeA", shape: "circle" };
                    RoundShotFunc(EnemyBulletArray, this.servant1.x, this.servant1.y, circleCount, 0, opt, 360, this.EnemyContainer);
                    RoundShotFunc(EnemyBulletArray, this.servant2.x, this.servant2.y, circleCount, 0, opt, 360, this.EnemyContainer);

                    // 本体が上部をスライド移動しながら落葉弾を落とす
                    const oldX = this.x;
                    const slideTargetX = this.StartAreaX + (Math.random() > 0.5 ? this.NowPlayAreaWidth * 0.25 : this.NowPlayAreaWidth * 0.75);
                    
                    gsap.to(this, { x: slideTargetX, duration: 1.0, ease: "power1.inOut" });

                    for (let i = 0; i < 8; i++) {
                        if (this.NowHPGuageHP <= 0 || this.SkillActivate) break;
                        const leafOptions = {
                            vx: 0,
                            vy: 80 + Math.random() * 40,
                            sine_wave_enabled: true,
                            sine_amplitude: 60 + Math.random() * 40,
                            sine_angular_frequency: Math.PI * (1.2 + Math.random()),
                            sine_axis: "x",
                            width: 14, height: 14, damage: 25, life: 20,
                            BulletImageKey: "BulletTypeA", shape: "circle"
                        };
                        EnemyBulletArray.push(new Bullet(this.EnemyContainer, this.x, this.y, leafOptions));
                        await wait(0.12);
                    }
                }
                
                this.isPendulumActive = false;
            }
            await wait(3.8 / dm);
        }
    }

    /**
     * 【通常パターン5】場外軸Sinビーム ＋ 上昇放物線弾
     */
    async pattern5_Loop(EnemyBulletArray, TargetPlayer, initialDelay) {
        await wait(initialDelay);
        while (this.NowHPGuageHP > 0) {
            const dm = 1.0 + DifficultyLevel * 0.4;
            if (this.NowHPGuageHP > 0 && !this.SkillActivate) {
                // 1. 場外軸Sinビーム警告線の配置
                const beamCount = 4 + Math.floor(DifficultyLevel);
                const warnings = [];
                for (let i = 0; i < beamCount; i++) {
                    const sx = this.StartAreaX + (this.NowPlayAreaWidth * (i + 1)) / (beamCount + 1);
                    warnings.push(showLineWarning(this.EnemyContainer, sx, this.StartAreaY - 20, sx, this.StartAreaY + this.NowPlayAreaHeight + 20, 15, 1200, 0.6));
                }
                await Promise.all(warnings);

                if (this.NowHPGuageHP > 0 && !this.SkillActivate) {
                    // 同時発射
                    for (let i = 0; i < beamCount; i++) {
                        const sx = this.StartAreaX + (this.NowPlayAreaWidth * (i + 1)) / (beamCount + 1);
                        EnemyBulletArray.push(new Bullet(this.EnemyContainer, sx, this.StartAreaY, {
                            vx: 0, vy: 500 * dm, width: 16, height: 40, damage: 25, life: 10,
                            BulletImageKey: "BulletTypeA", shape: "circle"
                        }));
                    }

                    // 2. 下から上に凸な放物線弾
                    const bottomY = this.StartAreaY + this.NowPlayAreaHeight * 0.95;
                    const popCount = 6 + Math.floor(DifficultyLevel * 2);
                    for (let i = 0; i < popCount; i++) {
                        const sx = this.StartAreaX + Math.random() * this.NowPlayAreaWidth;
                        EnemyBulletArray.push(new Bullet(this.EnemyContainer, sx, bottomY, {
                            vx: (Math.random() - 0.5) * 80,
                            vy: -380 * dm,
                            ax: 0,
                            ay: 200 * dm, // 重力
                            width: 12, height: 12, damage: 20, life: 25,
                            BulletImageKey: "BulletTypeA", shape: "circle"
                        }));
                    }
                }
            }
            await wait(4.2 / dm);
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
            else { this.CanMoveFlag = true; }
            this.SkillText.visible = true;
            this.SkillTimerText.visible = true;
            const sy = this.SkillText.y;
            gsap.fromTo(this.SkillText, { y: sy + 20, alpha: 0 }, { y: sy, alpha: 1, duration: 0.8, ease: "power2.out" });
            const ty = this.SkillTimerText.y;
            gsap.fromTo(this.SkillTimerText, { y: ty + 20, alpha: 0 }, { y: ty, alpha: 1, duration: 0.8, ease: "power2.out" });
        }
    }

    /**
     * スペル1: 回転螺旋「渦の中心」
     * 水平中央上部配置。使い魔が楕円軌道で周回しつつ下部に水平に弾幕。
     */
    async AttackSkill1(EnemyBulletArray, TargetPlayer) {
        const dm = 1.0 + DifficultyLevel * 0.5;
        this.CanMoveFlag = false;
        this.isPendulumActive = true; // 使い魔の軌道制御

        let timer = 0;

        while (this.NowHPGuageHP > 0 && this.SkillActivate) {
            // 使い魔の楕円周回（ボスを軸とする）
            timer += 0.08 * dm;
            this.servant1.x = this.x + 150 * Math.cos(timer);
            this.servant1.y = this.y + 60 * Math.sin(timer);

            this.servant2.x = this.x - 150 * Math.cos(timer);
            this.servant2.y = this.y - 60 * Math.sin(timer);

            // 使い魔から下向き水平弾
            const opt = { vx: 0, vy: 250, width: 10, height: 10, damage: 20, life: 15, BulletImageKey: "BulletTypeA", shape: "circle" };
            EnemyBulletArray.push(new Bullet(this.EnemyContainer, this.servant1.x, this.servant1.y, opt));
            EnemyBulletArray.push(new Bullet(this.EnemyContainer, this.servant2.x, this.servant2.y, opt));

            // 本体は自機を高速スナイプ
            if (Math.floor(timer * 10) % 5 === 0) {
                const dx = TargetPlayer.x - this.x;
                const dy = TargetPlayer.y - this.y;
                const angle = Math.atan2(dy, dx);
                const optSnipe = {
                    vx: 550 * dm * Math.cos(angle), vy: 550 * dm * Math.sin(angle),
                    width: 14, height: 14, damage: 30, life: 10, BulletImageKey: "BulletTypeA", shape: "circle"
                };
                EnemyBulletArray.push(new Bullet(this.EnemyContainer, this.x, this.y, optSnipe));
            }

            await wait(0.08);
        }
        this.isPendulumActive = false;
        this.CanMoveFlag = true;
    }

    /**
     * スペル2: 使役「楕円引力フィールド」
     * 保持した弾が一定時間後に自機に向かって一斉集束する
     */
    async AttackSkill2(EnemyBulletArray, TargetPlayer) {
        const dm = 1.0 + DifficultyLevel * 0.5;
        this.CanMoveFlag = false;

        while (this.NowHPGuageHP > 0 && this.SkillActivate) {
            const count = 16 + Math.floor(DifficultyLevel * 4);
            const pool = [];
            const r = this.NowPlayAreaWidth * 0.12;
            
            // 1. 周囲に弾を生成して一旦静止
            for (let i = 0; i < count; i++) {
                const angleRad = (i * 360 / count) * Math.PI / 180;
                const sx = this.x + r * Math.cos(angleRad);
                const sy = this.y + r * Math.sin(angleRad);
                
                const b = new Bullet(this.EnemyContainer, sx, sy, {
                    vx: 0, vy: 0, width: 12, height: 12, damage: 25, life: 20,
                    BulletImageKey: "BulletTypeA", shape: "circle",
                    // 1.2秒後にアクティベーションを作動
                    ActivationLength: 1, // わずかでも動けば発動
                    PostActivationOptions: {
                        ChangeActivation: ChangeActivation.Activate1,
                        vx: 300 * dm, vy: 300 * dm, ax: 0, ay: 0, jx: 0, jy: 0,
                        trackingStrength: 1.5 * dm, maxSpeed: 350, LengthParcent: 1.0
                    },
                    target: TargetPlayer
                });
                EnemyBulletArray.push(b);
                pool.push(b);
            }

            // 同時に使い魔は左右で交互に全方位弾を連射
            const optServant = { vx: 130 * dm, vy: 130 * dm, width: 10, height: 10, damage: 15, life: 10, BulletImageKey: "BulletTypeA", shape: "circle" };
            RoundShotFunc(EnemyBulletArray, this.servant1.x, this.servant1.y, 8, 0, optServant, 360, this.EnemyContainer);
            await wait(0.6);
            
            // 弾をわずかに動かして活性化フラグを刺激
            for (const b of pool) {
                b.vx = 2; // 微小な力を与える
                b.vy = 2;
            }

            RoundShotFunc(EnemyBulletArray, this.servant2.x, this.servant2.y, 8, 0, optServant, 360, this.EnemyContainer);
            await wait(1.4);
        }
        this.CanMoveFlag = true;
    }

    /**
     * スペル3: 二重振り子「連動追尾」（Normal限定）
     */
    async AttackSkill3(EnemyBulletArray, TargetPlayer) {
        const dm = 1.0 + DifficultyLevel * 0.5;
        this.CanMoveFlag = false;
        this.isPendulumActive = true;

        let theta1 = Math.PI / 2;
        let theta2 = Math.PI / 2;
        let time = 0;

        while (this.NowHPGuageHP > 0 && this.SkillActivate) {
            time += 0.04 * dm;
            
            // 簡単な二重振り子の動きをサインカーブで近似
            theta1 = Math.sin(time) * 1.2;
            theta2 = Math.sin(time * 1.7) * 1.5;

            const L1 = 120;
            const L2 = 90;

            // 各関節の座標
            this.servant1.x = this.x + L1 * Math.sin(theta1);
            this.servant1.y = this.y + L1 * Math.cos(theta1);

            this.servant2.x = this.servant1.x + L2 * Math.sin(theta2);
            this.servant2.y = this.servant1.y + L2 * Math.cos(theta2);

            // 各ノードから全方位弾を放出
            const opt = { vx: 120 * dm, vy: 120 * dm, width: 10, height: 10, damage: 20, life: 10, BulletImageKey: "BulletTypeA", shape: "circle" };
            if (Math.floor(time * 20) % 5 === 0) {
                RoundShotFunc(EnemyBulletArray, this.x, this.y, 6, 0, opt, 360, this.EnemyContainer);
                RoundShotFunc(EnemyBulletArray, this.servant1.x, this.servant1.y, 6, 0, opt, 360, this.EnemyContainer);
                RoundShotFunc(EnemyBulletArray, this.servant2.x, this.servant2.y, 6, 0, opt, 360, this.EnemyContainer);
            }

            await wait(0.05);
        }
        this.isPendulumActive = false;
        this.CanMoveFlag = true;
    }

    /**
     * スペル4: 風車使役「偏心加速度」（Hard以上限定）
     */
    async AttackSkill4(EnemyBulletArray, TargetPlayer) {
        const dm = 1.0 + DifficultyLevel * 0.5;
        this.CanMoveFlag = false;
        this.isPendulumActive = true;

        let time = 0;
        while (this.NowHPGuageHP > 0 && this.SkillActivate) {
            time += 0.05 * dm;

            // 左右に使い魔を配置してスライド往復
            this.servant1.x = this.StartAreaX + this.NowPlayAreaWidth * 0.25 + 50 * Math.sin(time * 2);
            this.servant1.y = this.StartAreaY + this.NowPlayAreaHeight * 0.3;

            this.servant2.x = this.StartAreaX + this.NowPlayAreaWidth * 0.75 - 50 * Math.sin(time * 2);
            this.servant2.y = this.StartAreaY + this.NowPlayAreaHeight * 0.3;

            // 本体から風車弾
            const optWindmill = { vx: 150 * dm, vy: 150 * dm, width: 10, height: 10, damage: 20, life: 15, BulletImageKey: "BulletTypeA", shape: "circle" };
            RoundShotFunc(EnemyBulletArray, this.x, this.y, 8, time * 30, optWindmill, 360, this.EnemyContainer);
            RoundShotFunc(EnemyBulletArray, this.x, this.y, 8, -time * 30, optWindmill, 360, this.EnemyContainer);

            // 使い魔から非一様な（加速度がサインで変動する）自機狙い弾
            if (Math.floor(time * 20) % 6 === 0) {
                const angle1 = Math.atan2(TargetPlayer.y - this.servant1.y, TargetPlayer.x - this.servant1.x);
                const bulletOptionsErratic1 = {
                    vx: 80 * Math.cos(angle1), vy: 80 * Math.sin(angle1),
                    // サイン波で加速度が絶えず変化する
                    ax: 250 * Math.sin(time * 5) * Math.cos(angle1),
                    ay: 250 * Math.sin(time * 5) * Math.sin(angle1),
                    width: 12, height: 12, damage: 25, life: 20,
                    BulletImageKey: "BulletTypeA", shape: "circle"
                };
                EnemyBulletArray.push(new Bullet(this.EnemyContainer, this.servant1.x, this.servant1.y, bulletOptionsErratic1));

                const angle2 = Math.atan2(TargetPlayer.y - this.servant2.y, TargetPlayer.x - this.servant2.x);
                const bulletOptionsErratic2 = {
                    vx: 80 * Math.cos(angle2), vy: 80 * Math.sin(angle2),
                    ax: 250 * Math.sin(time * 5 + Math.PI) * Math.cos(angle2),
                    ay: 250 * Math.sin(time * 5 + Math.PI) * Math.sin(angle2),
                    width: 12, height: 12, damage: 25, life: 20,
                    BulletImageKey: "BulletTypeA", shape: "circle"
                };
                EnemyBulletArray.push(new Bullet(this.EnemyContainer, this.servant2.x, this.servant2.y, bulletOptionsErratic2));
            }

            await wait(0.08);
        }
        this.isPendulumActive = false;
        this.CanMoveFlag = true;
    }

    /**
     * スペル5: 重力「空間歪曲フィールド」（Lunatic限定）
     */
    async AttackSkill5(EnemyBulletArray, TargetPlayer) {
        const dm = 1.0 + DifficultyLevel * 0.5;
        this.CanMoveFlag = false;
        this.isPendulumActive = true;

        // 開始時全弾消去
        EnemyBulletArray.forEach(b => b.destroy());
        EnemyBulletArray.length = 0;

        let time = 0;

        while (this.NowHPGuageHP > 0 && this.SkillActivate) {
            time += 0.08 * dm;

            // 使い魔は自機の周囲を激しく飛び回る
            this.servant1.x = TargetPlayer.x + 120 * Math.cos(time * 4);
            this.servant1.y = TargetPlayer.y + 120 * Math.sin(time * 4);

            this.servant2.x = TargetPlayer.x - 120 * Math.cos(time * 4);
            this.servant2.y = TargetPlayer.y - 120 * Math.sin(time * 4);

            // 使い魔から、自機への強い「重力追尾」弾を射出
            const optGravity = {
                vx: 100 * Math.cos(time), vy: 100 * Math.sin(time),
                width: 12, height: 12, damage: 20, life: 15,
                BulletImageKey: "BulletTypeA", shape: "circle",
                target: TargetPlayer,
                trackingStrength: 3.5 * dm, // 非常に強い追尾（空間歪曲）
                maxSpeed: 250
            };
            EnemyBulletArray.push(new Bullet(this.EnemyContainer, this.servant1.x, this.servant1.y, optGravity));
            EnemyBulletArray.push(new Bullet(this.EnemyContainer, this.servant2.x, this.servant2.y, optGravity));

            // 本体からは左右に動きながら円形弾を連続射出
            if (Math.floor(time * 10) % 8 === 0) {
                const count = 16 + Math.floor(DifficultyLevel * 4);
                const optCircle = {
                    vx: 140 * dm, vy: 140 * dm,
                    width: 10, height: 10, damage: 20, life: 15,
                    BulletImageKey: "BulletTypeA", shape: "circle"
                };
                RoundShotFunc(EnemyBulletArray, this.x, this.y, count, time * 20, optCircle, 360, this.EnemyContainer);
            }

            await wait(0.08);
        }
        this.isPendulumActive = false;
        this.CanMoveFlag = true;
    }

    _getSkillDefinitionForPhase(phase) { return this.SkillDefinitions[phase]; }
}
