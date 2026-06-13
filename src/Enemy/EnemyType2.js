// Type2Enemyのクラス
// テーマ：ビーム+音

import { EnemyBase } from "./EnemyBase.js";
import { SingleShotFunc, RoundShotFunc, FanShotFunc, windmillshotfunc, CircleAndHomeShotFunc } from "./EnemyShot.js";
import { ChangeActivation, Bullet } from '../bullet.js'; 
import { DifficultyLevel } from "../Screens/BaseScreen.js"
import { CharacterTypeEnum, character_info_list, MainBulletEnum, SubBulletEnum, 
    main_bulled_info_list, sub_bulled_info_list, 
    enemy_info_list,
    EnemyTypeEnum } from '../game_status.js';
import { showLineWarning, showBurstWarning, showSpotWarning, showFanWarning, showAreaWarning } from '../DangerWarning.js';

/**
 * 指定された秒数だけ待機するPromiseを返すヘルパー関数
 * @param {number} seconds - 待機する秒数
 */
const wait = (seconds) => new Promise(resolve => setTimeout(resolve, seconds * 1000));

export class EnemyType2 extends EnemyBase {
    constructor(GameScreenContainer, StartShootingX, StartShootingY, StartShootingWidth, StartShootingHeight) {
        
        const enemyInfo = enemy_info_list[EnemyTypeEnum.E_TYPE_2] || enemy_info_list[EnemyTypeEnum.E_TYPE_1];
        // HP、バーを難易度ごとに変更
        const hpGauges = (DifficultyLevel < 1) ? 2 : (DifficultyLevel <= 2) ? 3 : 4;
        const BaseConfig = {
            ...enemyInfo,
            enemy_maxhp: enemyInfo.enemy_maxhp * ((0.6 * DifficultyLevel) + 0.4),
            enemy_hp_guage: hpGauges,
            ETypeTypeID: EnemyTypeEnum.E_TYPE_2
        };

        super(GameScreenContainer, StartShootingX, StartShootingY, StartShootingWidth, StartShootingHeight, BaseConfig);

        this._attackLoopsStarted = false;

        // スキルごとの設定をデータとして定義
        this.SkillDefinitions = {
            0: {
                name: "輪音「バームクーヘン」",
                NoMoveFlag: false,
                targetX: () => this.StartAreaX + (this.NowPlayAreaWidth * 0.5),
                targetY: () => this.StartAreaY + this.NowPlayAreaHeight * 0.25,
                attackFunction: this.AttackSkill1, 
                allowMoveAfter: true
            },
            1: {
                name: "光響「超電磁集束ビーム」",              
                NoMoveFlag: false,
                targetX: () => this.StartAreaX + (this.NowPlayAreaWidth * 0.5),
                targetY: () => this.StartAreaY + this.NowPlayAreaHeight * 0.2,
                attackFunction: this.AttackSkill2, 
                allowMoveAfter: true 
            }
        };

        if (DifficultyLevel === 2) {
            // Hard
            this.SkillDefinitions[2] = {
                name: "旋律「回転十字ビームと残光」",
                NoMoveFlag: false,
                targetX: () => this.StartAreaX + (this.NowPlayAreaWidth * 0.5),
                targetY: () => this.StartAreaY + this.NowPlayAreaHeight * 0.25,
                attackFunction: this.AttackSkill3,
                allowMoveAfter: true
            };
        } else if (DifficultyLevel === 3) {
            // Lunatic
            this.SkillDefinitions[2] = {
                name: "旋律「回転十字ビームと残光」",
                NoMoveFlag: false,
                targetX: () => this.StartAreaX + (this.NowPlayAreaWidth * 0.5),
                targetY: () => this.StartAreaY + this.NowPlayAreaHeight * 0.25,
                attackFunction: this.AttackSkill3,
                allowMoveAfter: true
            };
            this.SkillDefinitions[3] = {
                name: "反響「多重反射レーザー」",
                NoMoveFlag: false,
                targetX: () => this.StartAreaX + (this.NowPlayAreaWidth * 0.5),
                targetY: () => this.StartAreaY + this.NowPlayAreaHeight * 0.25,
                attackFunction: this.AttackSkill4,
                allowMoveAfter: true
            };
        } else if (DifficultyLevel === 1) {
            // Normal
            this.SkillDefinitions[2] = {
                name: "反響「多重反射レーザー」",
                NoMoveFlag: false,
                targetX: () => this.StartAreaX + (this.NowPlayAreaWidth * 0.5),
                targetY: () => this.StartAreaY + this.NowPlayAreaHeight * 0.25,
                attackFunction: this.AttackSkill4,
                allowMoveAfter: true
            };
        }
    }

    updateScale(NewScaleFactor, NewShootingStartX, NewShootingStartY, NewShootingWidth, NewShootingHeight) {
        super.updateScale(NewScaleFactor, NewShootingStartX, NewShootingStartY, NewShootingWidth, NewShootingHeight);
    }

    move(DeltaTime) {
        super.move(DeltaTime);
    }

    _shoot(EnemyBulletArray, TargetPlayer, DeltaTime) {
        if (this.NowHPGuageHP <= 0) {
            this._attackLoopsStarted = false; 
            return;
        }

        if (!this._attackLoopsStarted) {
            this._attackLoopsStarted = true;
            
            this.pattern1_Loop(EnemyBulletArray, TargetPlayer, 0.3);
            this.pattern2_Loop(EnemyBulletArray, TargetPlayer, 1.5);
            this.pattern3_Loop(EnemyBulletArray, TargetPlayer, 2.0);
        }
    }

    /**
     * 【攻撃パターン1】微小円弧のカーブ弾幕
     */
    async pattern1_Loop(EnemyBulletArray, TargetPlayer, initialDelay) {
        await wait(initialDelay);

        while (this.NowHPGuageHP > 0) {
            const dm = 1.0 + DifficultyLevel * 0.5;
            if ((this.NowHPGuageHP > 0) && (this.SkillActivate == false)) {
                const dx = TargetPlayer.x - this.x;
                const dy = TargetPlayer.y - this.y;
                const centerAngleDegrees = Math.atan2(dy, dx) * (180 / Math.PI);
                
                const bulletCount = 3 + Math.floor(DifficultyLevel);
                const fanAngle = 12; // 狭い円弧
                
                const speed = 180 * dm;
                const turnDirection = Math.random() > 0.5 ? 1 : -1;
                
                const bulletOptions = {
                    vx: speed, vy: speed, ax: 0, ay: 0, jx: 0, jy: 0,
                    width: 20, height: 20, damage: 20, life: 15,
                    BulletImageKey: "BulletTypeA", shape: "circle",
                    turnRate: 0.15 * turnDirection * dm
                };

                const startAngle = centerAngleDegrees - fanAngle / 2;
                const endAngle = centerAngleDegrees + fanAngle / 2;

                RoundShotFunc(EnemyBulletArray, this.x, this.y, bulletCount, startAngle, bulletOptions, endAngle, this.EnemyContainer);
            }
            await wait(1.5 / dm);
        }
    }

    /**
     * 【攻撃パターン2】移動円形弾＋極太薙ぎ払いビーム
     */
    async pattern2_Loop(EnemyBulletArray, TargetPlayer, initialDelay) {
        await wait(initialDelay);

        while (this.NowHPGuageHP > 0) {
            const dm = 1.0 + DifficultyLevel * 0.4;
            if ((this.NowHPGuageHP > 0) && (this.SkillActivate == false)) {
                this.CanMoveFlag = false;

                // 薙ぎ払いビーム (0度〜180度へスイープ)
                const sweepSteps = 30 + Math.floor(10 * DifficultyLevel);
                const sweepDuration = 1.5;
                const stepDelay = sweepDuration / sweepSteps;
                
                // 円形弾幕を同時に放つ
                const bulletOptionsCircle = {
                    vx: 120 * dm, vy: 120 * dm, ax: 0, ay: 0, jx: 0, jy: 0,
                    width: 10, height: 10, damage: 15, life: 15,
                    BulletImageKey: "BulletTypeA", shape: "circle"
                };
                RoundShotFunc(EnemyBulletArray, this.x, this.y, 16, 0, bulletOptionsCircle, 360, this.EnemyContainer);

                // スイープビーム射出
                const sweepDirection = Math.random() > 0.5 ? 1 : -1;
                const startAngle = sweepDirection === 1 ? 0 : 180;
                const endAngle = sweepDirection === 1 ? 180 : 0;
                
                for (let i = 0; i <= sweepSteps; i++) {
                    if (this.NowHPGuageHP <= 0 || this.SkillActivate) break;
                    
                    const angleDeg = startAngle + (endAngle - startAngle) * (i / sweepSteps);
                    const angleRad = angleDeg * Math.PI / 180;
                    
                    // ビームを構成する重ね弾
                    for (let dist = 0; dist < 8; dist++) {
                        const sx = this.x + dist * 15 * Math.cos(angleRad);
                        const sy = this.y + dist * 15 * Math.sin(angleRad);
                        const bulletOptionsBeam = {
                            vx: 550 * dm * Math.cos(angleRad),
                            vy: 550 * dm * Math.sin(angleRad),
                            width: 25, height: 25, damage: 30, life: 1,
                            BulletImageKey: "BulletTypeA", shape: "circle"
                        };
                        EnemyBulletArray.push(new Bullet(this.EnemyContainer, sx, sy, bulletOptionsBeam));
                    }
                    await wait(stepDelay);
                }
                
                if (!this.SkillActivate) {
                    this.CanMoveFlag = true;
                }
            }
            await wait(4.5 / dm);
        }
    }

    /**
     * 【攻撃パターン3】放物線上昇弾＋自機狙い前後逆転ひし形弾
     */
    async pattern3_Loop(EnemyBulletArray, TargetPlayer, initialDelay) {
        await wait(initialDelay);

        while (this.NowHPGuageHP > 0) {
            const dm = 1.0 + DifficultyLevel * 0.4;
            if ((this.NowHPGuageHP > 0) && (this.SkillActivate == false)) {
                // 1. 放物線上昇弾
                const bottomY = this.StartAreaY + this.NowPlayAreaHeight * 0.95;
                const bulletCountBottom = 6 + Math.floor(4 * DifficultyLevel);
                for (let i = 0; i < bulletCountBottom; i++) {
                    const startX = this.StartAreaX + (this.NowPlayAreaWidth * (i + 1)) / (bulletCountBottom + 1);
                    const bulletOptionsBottom = {
                        vx: 0,
                        vy: -350 * dm, // 上方へ発射
                        ax: 0,
                        ay: 180 * dm,  // 下方向への加速度（重力）
                        width: 12, height: 12, damage: 20, life: 20,
                        BulletImageKey: "BulletTypeA", shape: "circle"
                    };
                    EnemyBulletArray.push(new Bullet(this.EnemyContainer, startX, bottomY, bulletOptionsBottom));
                }

                // 2. 前後逆転ひし形弾（自機狙い）
                const dx = TargetPlayer.x - this.x;
                const dy = TargetPlayer.y - this.y;
                const angle = Math.atan2(dy, dx);
                
                const count = 4;
                for (let i = 0; i < count; i++) {
                    // 後ろの弾ほど初速・加速度を上げる
                    const speed = 120 + i * 25;
                    const accel = 15 + i * 25;
                    
                    const bulletOptionsRhombus = {
                        vx: speed * dm * Math.cos(angle),
                        vy: speed * dm * Math.sin(angle),
                        ax: accel * dm * Math.cos(angle),
                        ay: accel * dm * Math.sin(angle),
                        width: 14, height: 14, damage: 25, life: 10,
                        BulletImageKey: "BulletTypeA", shape: "circle"
                    };
                    EnemyBulletArray.push(new Bullet(this.EnemyContainer, this.x, this.y, bulletOptionsRhombus));
                }
            }
            await wait(3.2 / dm);
        }
    }

    /**
     * スペル1: 輪音「バームクーヘン」
     */
    async AttackSkill1(EnemyBulletArray, TargetPlayer) {
        const dm = 1.0 + (DifficultyLevel * 0.5);
        this.CanMoveFlag = false;

        let baseAngle = 0;
        while ((this.NowHPGuageHP > 0) && (this.SkillActivate == true)) {
            const count = 18 + Math.floor(6 * DifficultyLevel);
            const radius = this.NowPlayAreaWidth * 0.15;
            
            // 拡縮するリングを配置
            for (let i = 0; i < count; i++) {
                const angleRad = (baseAngle + i * 360 / count) * Math.PI / 180;
                const sx = this.x + radius * Math.cos(angleRad);
                const sy = this.y + radius * Math.sin(angleRad);
                
                const bulletOptions = {
                    vx: 60 * dm * Math.cos(angleRad),
                    vy: 60 * dm * Math.sin(angleRad),
                    ax: 20 * dm * Math.cos(angleRad),
                    ay: 20 * dm * Math.sin(angleRad),
                    sine_wave_enabled: true,
                    sine_amplitude: 40,
                    sine_angular_frequency: Math.PI * 1.5,
                    sine_axis: "x",
                    width: 14, height: 14, damage: 30, life: 20,
                    BulletImageKey: "BulletTypeA", shape: "circle"
                };
                EnemyBulletArray.push(new Bullet(this.EnemyContainer, sx, sy, bulletOptions));
            }
            
            baseAngle += 15;
            await wait(1.0 / dm);
        }
        this.CanMoveFlag = true;
    }

    /**
     * スペル2: 光響「超電磁集束ビーム」
     */
    async AttackSkill2(EnemyBulletArray, TargetPlayer) {
        const dm = 1.0 + (DifficultyLevel * 0.5);
        this.CanMoveFlag = false;

        let elapsed = 0;
        while ((this.NowHPGuageHP > 0) && (this.SkillActivate == true)) {
            // 予測線を表示
            await showAreaWarning(
                this.EnemyContainer,
                this.x - 30,
                this.StartAreaY,
                60,
                this.NowPlayAreaHeight,
                0.5
            );

            if (this.NowHPGuageHP <= 0 || !this.SkillActivate) break;

            const beamDuration = 2.0;
            const beamSteps = 40;
            const stepDelay = beamDuration / beamSteps;

            for (let step = 0; step < beamSteps; step++) {
                if (this.NowHPGuageHP <= 0 || !this.SkillActivate) break;

                // ビームの連続発射
                const beamWidth = 40 + Math.sin(elapsed * 5) * 15;
                const bulletOptionsBeam = {
                    vx: 0,
                    vy: 850,
                    width: beamWidth, height: 30, damage: 35, life: 1,
                    BulletImageKey: "BulletTypeA", shape: "circle"
                };
                EnemyBulletArray.push(new Bullet(this.EnemyContainer, this.x, this.y, bulletOptionsBeam));

                // 激突箇所から散らばる迷光弾 (Sin波でうねりながら自機を追尾)
                const strayX = this.x + (Math.random() - 0.5) * 60;
                const strayY = this.StartAreaY + this.NowPlayAreaHeight * 0.95;
                const strayOptions = {
                    vx: 0,
                    vy: -150 - Math.random() * 100,
                    ax: 0, ay: 0,
                    sine_wave_enabled: true,
                    sine_amplitude: 40 + Math.random() * 30,
                    sine_angular_frequency: Math.PI * (1.5 + Math.random()),
                    sine_axis: "x",
                    width: 12, height: 12, damage: 20, life: 25,
                    target: TargetPlayer, trackingStrength: 0.6 * dm,
                    BulletImageKey: "BulletTypeA", shape: "circle"
                };
                EnemyBulletArray.push(new Bullet(this.EnemyContainer, strayX, strayY, strayOptions));

                elapsed += stepDelay;
                await wait(stepDelay);
            }
            await wait(1.5 / dm);
        }
        this.CanMoveFlag = true;
    }

    /**
     * スペル3: 旋律「回転十字ビームと残光」（Hard以上限定）
     */
    async AttackSkill3(EnemyBulletArray, TargetPlayer) {
        const dm = 1.0 + (DifficultyLevel * 0.5);
        this.CanMoveFlag = false;

        let angleRad = 0;
        const beamLengths = 8;
        const rotationSpeed = 0.5 * dm; // 回転角速度

        while ((this.NowHPGuageHP > 0) && (this.SkillActivate == true)) {
            // 十字ビームを連続配置
            for (let dist = 1; dist <= beamLengths; dist++) {
                const len = dist * 40;
                for (let b = 0; b < 4; b++) {
                    const finalAngle = angleRad + (b * Math.PI / 2);
                    const sx = this.x + len * Math.cos(finalAngle);
                    const sy = this.y + len * Math.sin(finalAngle);
                    
                    // 静止する「残光弾」を設置
                    const bulletOptionsStray = {
                        vx: 0, vy: 0, ax: 0, ay: 0,
                        width: 12, height: 12, damage: 20, life: 10,
                        BulletImageKey: "BulletTypeA", shape: "circle"
                    };
                    const bullet = new Bullet(this.EnemyContainer, sx, sy, bulletOptionsStray);
                    EnemyBulletArray.push(bullet);

                    // 数秒後に残光弾を消滅させるタイマーをセット
                    setTimeout(() => {
                        if (bullet && !bullet.isHit) bullet.destroy();
                    }, 2500);
                }
            }

            angleRad += rotationSpeed * 0.1;
            await wait(0.1);
        }
        this.CanMoveFlag = true;
    }

    /**
     * スペル4: 反響「多重反射レーザー」（Normal / Lunatic用）
     */
    async AttackSkill4(EnemyBulletArray, TargetPlayer) {
        const dm = 1.0 + (DifficultyLevel * 0.5);
        this.CanMoveFlag = false;

        let fireAngle = 45;
        while ((this.NowHPGuageHP > 0) && (this.SkillActivate == true)) {
            const count = 4 + Math.floor(DifficultyLevel);
            
            // 扇状に反射レーザーを射出
            const spread = 40;
            const startA = fireAngle - spread / 2;
            const oneStep = spread / (count - 1 || 1);

            for (let i = 0; i < count; i++) {
                const curAngleRad = (startA + i * oneStep) * Math.PI / 180;
                const speed = 250 * dm;

                const bulletOptions = {
                    vx: speed * Math.cos(curAngleRad),
                    vy: speed * Math.sin(curAngleRad),
                    ax: 0, ay: 0, jx: 0, jy: 0,
                    width: 14, height: 14, damage: 25, life: 30,
                    BulletImageKey: "BulletTypeA", shape: "circle",
                    // 反射の設定
                    bounce: true,
                    minXArea: this.StartAreaX,
                    maxXArea: this.StartAreaX + this.NowPlayAreaWidth,
                    minYArea: this.StartAreaY,
                    maxYArea: this.StartAreaY + this.NowPlayAreaHeight,
                    bounceCount: 4 // 4回まで反射
                };
                EnemyBulletArray.push(new Bullet(this.EnemyContainer, this.x, this.y, bulletOptions));
            }

            fireAngle = (fireAngle + 35) % 360;
            await wait(0.8 / dm);
        }
        this.CanMoveFlag = true;
    }

    /**
     * スキルを発動する
     */
    async _skilrun(DeltaTime, TargetPlayer, EnemyBulletArray) {
        super._skilrun(DeltaTime);
        if((this.SkillActivate == true) && (this.IsSkillTextShown == false)){
            
            this.IsSkillTextShown = true; 
            this.EnemyContainer.emit('skillActivated', true, 5, 0.1);

            const currentPhase = this.MaxEnemyHPGuage - this.NowEnemyHPGuage;
            const definition = this._getSkillDefinitionForPhase(currentPhase);

            if (definition) {
                this._executeSkill(definition, EnemyBulletArray, TargetPlayer);
            } else {
                console.warn(`Skill definition for phase ${currentPhase} not found.`);
                this.CanMoveFlag = true;
            }
            
            this.SkillText.visible = true;
            this.SkillTimerText.visible = true;
            const finalSafeY = this.SkillText.y;
            const startY = finalSafeY + 20;
            gsap.fromTo(this.SkillText, { y: startY, alpha: 0 }, { y: finalSafeY, alpha: 1, duration: 0.8, ease: "power2.out" });
            const finalTimerY = this.SkillTimerText.y;
            const startTimerY = finalTimerY + 20;
            gsap.fromTo(this.SkillTimerText, { y: startTimerY, alpha: 0 }, { y: finalTimerY, alpha: 1, duration: 0.8, ease: "power2.out" });
        }
    }

    DrawEnemyImagedraw() {
        super.DrawEnemyImage()
    }

    _getSkillDefinitionForPhase(phase) {
        return this.SkillDefinitions[phase];
    }
}