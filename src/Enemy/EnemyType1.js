// Type1Enemyのクラス
// コンセプト：一般的なシューター

import { EnemyBase } from "./EnemyBase.js";
import { SingleShotFunc, RoundShotFunc, FanShotFunc, windmillshotfunc, CircleAndHomeShotFunc } from "./EnemyShot.js";
import { ChangeActivation, Bullet } from '../bullet.js'; 
import { DifficultyLevel } from "../Screens/BaseScreen.js"
import { CharacterTypeEnum, character_info_list, MainBulletEnum, SubBulletEnum, 
    main_bulled_info_list, sub_bulled_info_list, 
    enemy_info_list,
    EnemyTypeEnum } from '../game_status.js';
import { showLineWarning, showBurstWarning, showSpotWarning, showAreaWarning } from '../DangerWarning.js';

/**
 * 指定された秒数だけ待機するPromiseを返すヘルパー関数
 * @param {number} seconds - 待機する秒数
 */
const wait = (seconds) => new Promise(resolve => setTimeout(resolve, seconds * 1000));

export class EnemyType1 extends EnemyBase {
    constructor(GameScreenContainer, StartShootingX, StartShootingY, StartShootingWidth, StartShootingHeight) {
        
        const enemyInfo = enemy_info_list[EnemyTypeEnum.E_TYPE_1];
        // HP、バーを難易度ごとに変更
        const hpGauges = (DifficultyLevel < 1) ? 2 : (DifficultyLevel <= 2) ? 3 : 4;
        const BaseConfig = {
            ...enemyInfo,
            enemy_maxhp: enemyInfo.enemy_maxhp * ((0.6 * DifficultyLevel) + 0.4),
            enemy_hp_guage: hpGauges,
            ETypeTypeID: EnemyTypeEnum.E_TYPE_1
        };

        super(GameScreenContainer, StartShootingX, StartShootingY, StartShootingWidth, StartShootingHeight, BaseConfig);

        // 各攻撃ループが開始されたかを管理するフラグ
        this._attackLoopsStarted = false;

        // スキルごとの設定をデータとして定義
        this.SkillDefinitions = {
            0: {
                name: "五月雨",
                NoMoveFlag: false,
                targetX: () => this.StartAreaX + (this.NowPlayAreaWidth * 0.5),
                targetY: () => this.StartAreaY + this.NowPlayAreaHeight * 0.25,
                attackFunction: this.AttackSkill1, 
                allowMoveAfter: true
            },
            1: {
                name: "四重奏のプレリュード",              
                NoMoveFlag: false,
                targetX: () => this.StartAreaX + (this.NowPlayAreaWidth * 0.5),
                targetY: () => this.StartAreaY + this.NowPlayAreaHeight * 0.3,
                attackFunction: this.AttackSkill2, 
                allowMoveAfter: true 
            }
        };

        // 難易度別のフェーズ3, 4の設定
        if (DifficultyLevel === 2) {
            // Hard
            this.SkillDefinitions[2] = {
                name: "変則円弧「光芒の雨」",
                NoMoveFlag: false,
                targetX: () => this.StartAreaX + (this.NowPlayAreaWidth * 0.5),
                targetY: () => this.StartAreaY + this.NowPlayAreaHeight * 0.2,
                attackFunction: this.AttackSkill4,
                allowMoveAfter: true
            };
        } else if (DifficultyLevel === 3) {
            // Lunatic
            this.SkillDefinitions[2] = {
                name: "幾何十字「百合の紋章」",
                NoMoveFlag: false,
                targetX: () => this.StartAreaX + (this.NowPlayAreaWidth * 0.5),
                targetY: () => this.StartAreaY + this.NowPlayAreaHeight * 0.5,
                attackFunction: this.AttackSkill3,
                allowMoveAfter: true
            };
            this.SkillDefinitions[3] = {
                name: "分裂「狂気のマトリクス」",
                NoMoveFlag: false,
                targetX: () => this.StartAreaX + (this.NowPlayAreaWidth * 0.5),
                targetY: () => this.StartAreaY + this.NowPlayAreaHeight * 0.2,
                attackFunction: this.AttackSkill5,
                allowMoveAfter: true
            };
        } else if (DifficultyLevel === 1) {
            // Normal
            this.SkillDefinitions[2] = {
                name: "十字",
                NoMoveFlag: false,
                targetX: () => this.StartAreaX + (this.NowPlayAreaWidth * 0.5),
                targetY: () => this.StartAreaY + this.NowPlayAreaHeight * 0.5,
                attackFunction: this.AttackSkill3,
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

    /**
     * 各攻撃パターンを、指定した遅延（位相）で並列に開始させるトリガー
     */
    _shoot(EnemyBulletArray, TargetPlayer, DeltaTime) {
        if (this.NowHPGuageHP <= 0) {
            this._attackLoopsStarted = false; 
            return;
        }

        if (!this._attackLoopsStarted) {
            this._attackLoopsStarted = true;
            
            // 各パターンのループに、開始遅延時間（秒）を渡す
            this.pattern1_Loop(EnemyBulletArray, TargetPlayer, 0.3);  // 0.3秒後に開始
            this.pattern2_Loop(EnemyBulletArray, TargetPlayer, 1.5);  // 1.5秒後に開始
            this.pattern3_Loop(EnemyBulletArray, TargetPlayer, 2.0);  // 2秒後に開始
            this.pattern4_Loop(EnemyBulletArray, TargetPlayer, 2.5);  // 2.5秒後に開始
            this.pattern5_Loop(EnemyBulletArray, TargetPlayer, 3.5);  // 3.5秒後に開始
        }
    }

    /**
     * 【攻撃パターン1】扇形弾の独立した実行ループ
     * @param {number} initialDelay - このループの開始遅延時間（秒）
     */
    async pattern1_Loop(EnemyBulletArray, TargetPlayer, initialDelay) {
        await wait(initialDelay);

        while (this.NowHPGuageHP > 0) {
            const difficultyMultiplier = 1.0 + DifficultyLevel;
            const bulletCountMax = 5 * Math.floor(5 * DifficultyLevel / 4);
            const sequenceCount = Math.ceil(bulletCountMax / 2.0);

            for (let i = 0; i < sequenceCount; i++) {
                const deltaX = TargetPlayer.x - this.x;
                const deltaY = TargetPlayer.y - this.y;
                const centerAngleDegrees = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
                const fanAngle = 90;
                const fanAngleOneStep = fanAngle / bulletCountMax;
                const bulletOptions = {
                    vx: 40, vy: 40, ax: 30, ay: 30, jx: 0, jy: 0,
                    width: 10, height: 10, radius: 1000, damage: 25, life: 15,
                    target: TargetPlayer, trackingStrength: 0,
                    BulletImageKey: "BulletTypeA", shape: "rectangle"
                };
                if ((this.NowHPGuageHP > 0) && (this.SkillActivate == false)) {
                    let bulletNumber = Math.round(bulletCountMax - (2.0 * i));
                    bulletNumber = (bulletNumber < 1) ? 1 : bulletNumber; 
                    FanShotFunc(EnemyBulletArray, this.x, this.y, bulletNumber, fanAngleOneStep, centerAngleDegrees, bulletOptions, this.EnemyContainer);
                    await wait(0.5 / difficultyMultiplier); // 短い待機
                }
            }
            await wait(2.0 / difficultyMultiplier);
        }
    }

    /**
     * 【攻撃パターン2】円形弾の独立した実行ループ
     */
    async pattern2_Loop(EnemyBulletArray, TargetPlayer, initialDelay) {
        await wait(initialDelay);

        while (this.NowHPGuageHP > 0) {
            const difficultyMultiplier = 1.0 + (DifficultyLevel / 4);

            if ((this.NowHPGuageHP > 0) && (this.SkillActivate == false)) {
                const bulletNumber = 5 * (1.0 + difficultyMultiplier * 0.5);
                const bulletBasicOptions = { vx: 100, vy: 100, ax: -5, ay: -5, jx: 0, jy: 0, width: 10, height: 10, damage: 25, life: 15, target: TargetPlayer, trackingStrength: 0, BulletImageKey: "BulletTypeA", shape: "rectangle" };
                const changeOption = { ...bulletBasicOptions, ChangeActivation: ChangeActivation.Activate1, LengthParcent: 0.3 };
                CircleAndHomeShotFunc(EnemyBulletArray, this.x, this.y, bulletNumber, 0, 360, bulletBasicOptions, changeOption, this.NowPlayAreaWidth * 0.1, this.EnemyContainer);
            }
            await wait(3.0 / difficultyMultiplier);
        }
    }

    /**
     * 【攻撃パターン3】単発巨大弾の独立した実行ループ
     */
    async pattern3_Loop(EnemyBulletArray, TargetPlayer, initialDelay) {
        await wait(initialDelay);

        while (this.NowHPGuageHP > 0) {
            const difficultyMultiplier = 1.0 + (DifficultyLevel / 4);
            if ((this.NowHPGuageHP > 0) && (this.SkillActivate == false)) {
                const bulletBasicOptions = { vx: 100, vy: 100, ax: 0, ay: 0, jx: 0, jy: 0, width: 80, height: 80, damage: 100, life: 15, target: TargetPlayer, trackingStrength: 0, BulletImageKey: "BulletTypeA", shape: "rectangle" };
                SingleShotFunc(EnemyBulletArray, this.x, this.y, bulletBasicOptions, this.EnemyContainer, TargetPlayer.x, TargetPlayer.y);
            }
            await wait(3.0 / difficultyMultiplier);
        }
    }

    /**
     * 【攻撃パターン4】非常に速く長い棒状の弾の連続射出（赤色警告線付き）
     */
    async pattern4_Loop(EnemyBulletArray, TargetPlayer, initialDelay) {
        await wait(initialDelay);

        while (this.NowHPGuageHP > 0) {
            const dm = 1.0 + DifficultyLevel * 0.5;
            if ((this.NowHPGuageHP > 0) && (this.SkillActivate == false)) {
                // 自機狙い警告線を表示
                await showLineWarning(this.EnemyContainer, this.x, this.y, TargetPlayer.x, TargetPlayer.y, 20, 1200, 0.6);

                if ((this.NowHPGuageHP > 0) && (this.SkillActivate == false)) {
                    const dx = TargetPlayer.x - this.x;
                    const dy = TargetPlayer.y - this.y;
                    const angle = Math.atan2(dy, dx);

                    const bulletOptions = {
                        vx: 750 * dm * Math.cos(angle),
                        vy: 750 * dm * Math.sin(angle),
                        ax: 0, ay: 0, jx: 0, jy: 0,
                        width: 15, height: 120, damage: 30, life: 15,
                        BulletImageKey: "BulletTypeA", shape: "rectangle",
                        orientation: angle
                    };

                    const bullet = new Bullet(this.EnemyContainer, this.x, this.y, bulletOptions);
                    if (bullet.BulletImage) {
                        bullet.BulletImage.rotation = angle + Math.PI / 2; // スプライトを進行方向に合わせる
                    }
                    EnemyBulletArray.push(bullet);
                }
            }
            await wait(2.5 / dm);
        }
    }

    /**
     * 【攻撃パターン5】円弧状に時間差配置し、一呼吸おいてから高速射出
     */
    async pattern5_Loop(EnemyBulletArray, TargetPlayer, initialDelay) {
        await wait(initialDelay);

        while (this.NowHPGuageHP > 0) {
            const dm = 1.0 + DifficultyLevel * 0.5;
            if ((this.NowHPGuageHP > 0) && (this.SkillActivate == false)) {
                const bulletCount = 5 + Math.floor(DifficultyLevel);
                const spreadAngle = 120;
                const oneStep = spreadAngle / (bulletCount - 1 || 1);
                const startAngle = 90 - spreadAngle / 2; // 下方向中心の円弧

                const centerX = this.x;
                const centerY = this.y + 40; // 少し下にずらした中心座標

                for (let i = 0; i < bulletCount; i++) {
                    if (this.NowHPGuageHP <= 0 || this.SkillActivate) break;
                    
                    const angleRad = (startAngle + i * oneStep) * Math.PI / 180;
                    const bulletOptions = {
                        vx: 20 * Math.cos(angleRad),
                        vy: 20 * Math.sin(angleRad),
                        ax: 0, ay: 0, jx: 0, jy: 0,
                        width: 12, height: 12, damage: 25, life: 15,
                        BulletImageKey: "BulletTypeA", shape: "circle",
                        ActivationLength: 25,
                        PostActivationOptions: {
                            ChangeActivation: ChangeActivation.ActivateFixed,
                            vx: 0,
                            vy: 550 * dm,
                            ax: 0, ay: 0, jx: 0, jy: 0
                        }
                    };
                    EnemyBulletArray.push(new Bullet(this.EnemyContainer, centerX, centerY, bulletOptions));
                    await wait(0.1); // 時間差で1個ずつ配置
                }
            }
            await wait(4.0 / dm);
        }
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

    /**
     * スペル1: 五月雨
     */
    async AttackSkill1(EnemyBulletArray, TargetPlayer) {
        const DifficultyMultiplier = 1.0 + (DifficultyLevel * 0.5);

        while ((this.NowHPGuageHP > 0) && (this.SkillActivate == true)) {
            const BulletNumber = 20 + Math.floor(8 * DifficultyLevel);
            const MaxHorizontalSpeed = 1700;

            for (let i = 0; i < BulletNumber; i++) {
                const StartX = this.x;
                const StartY = this.y;

                const SpeedStep = (MaxHorizontalSpeed * 2) / (BulletNumber - 1);
                const BaseHorizontalSpeed = -MaxHorizontalSpeed + i * SpeedStep;
                const RandomOffset = (Math.random() - 0.5) * SpeedStep * 0.8;
                const FinalHorizontalSpeed = BaseHorizontalSpeed + RandomOffset;

                const IsOchibaMode = true;
                const sine_wave_enabled = IsOchibaMode;
                const sine_amplitude = IsOchibaMode ? (Math.random() * 5) * DifficultyMultiplier : 0;
                const sine_angular_frequency = IsOchibaMode ? Math.PI * (1 + Math.random() * 2) : 0;

                const BulletOptions = {
                    vx: FinalHorizontalSpeed,
                    vy: -850 - (Math.random() * 150), 
                    ax: 0,
                    ay: 250 + (Math.random() * 100),
                    sine_wave_enabled: sine_wave_enabled,
                    sine_amplitude: sine_amplitude,
                    sine_angular_frequency: sine_angular_frequency,
                    sine_axis: "x",
                    width: 12, height: 12, damage: 50, life: 20,
                    BulletImageKey: "BulletTypeA", shape: "circle",
                    target: TargetPlayer, trackingStrength: 0
                };

                EnemyBulletArray.push(new Bullet(this.EnemyContainer, StartX, StartY, BulletOptions));                
            }
            await wait(0.8 / DifficultyMultiplier);
        }
        this.CanMoveFlag = true;
    }

    /**
     * スペル2: 四重奏のプレリュード（複製体ギミック）
     */
    async AttackSkill2(EnemyBulletArray, TargetPlayer) {
        const difficultyMultiplier = 1.0 + (DifficultyLevel * 0.5);
        this.CanMoveFlag = false; // スキル中はボスを特定位置に固定

        // 4つの配置ポイント
        const positions = [
            { x: this.StartAreaX + this.NowPlayAreaWidth / 4, y: this.StartAreaY + this.NowPlayAreaHeight / 4 },
            { x: this.StartAreaX + this.NowPlayAreaWidth * 3 / 4, y: this.StartAreaY + this.NowPlayAreaHeight / 4 },
            { x: this.StartAreaX + this.NowPlayAreaWidth / 4, y: this.StartAreaY + this.NowPlayAreaHeight * 3 / 4 },
            { x: this.StartAreaX + this.NowPlayAreaWidth * 3 / 4, y: this.StartAreaY + this.NowPlayAreaHeight * 3 / 4 }
        ];

        // クローンスプライトの生成
        const texture = PIXI.Texture.from(this.EnemyImageKey);
        const cloneSprites = [];
        for (let i = 0; i < 3; i++) {
            const sprite = new PIXI.Sprite(texture);
            sprite.anchor.set(0.5);
            sprite.scale.set(this.CurrentScaleFactor);
            sprite.width = this.EnemyWidth * this.CurrentScaleFactor;
            sprite.height = this.EnemyHeight * this.CurrentScaleFactor;
            sprite.alpha = 0.8;
            this.EnemyContainer.addChild(sprite);
            cloneSprites.push(sprite);
        }

        this.ActiveClones = [];
        this.ClonesCollidable = (DifficultyLevel < 2); // Easy/Normal のみクローンに当たり判定あり

        const bulletNumberPerShot = 12 + Math.floor(2 * DifficultyLevel);
        const minDelay = 1.6 * (DifficultyLevel / 2 || 0.5);
        const maxDelay = minDelay * 1.8;
        
        const bulletOptions = {
            vx: 150 * difficultyMultiplier, vy: 150 * difficultyMultiplier,
            ax: 0, ay: 0, jx: 0, jy: 0,
            width: 10, height: 10, damage: 20, life: 15,
            target: TargetPlayer, trackingStrength: 0,
            BulletImageKey: "BulletTypeA", shape: "circle"
        };

        let step = 0;

        while ((this.NowHPGuageHP > 0) && (this.SkillActivate == true)) {
            const realIdx = step % 4;
            const realPos = positions[realIdx];

            // 本体の座標を更新
            this.x = realPos.x;
            this.y = realPos.y;

            // クローンを他の3箇所に配置
            this.ActiveClones = [];
            let cloneIdx = 0;
            for (let i = 0; i < 4; i++) {
                if (i !== realIdx) {
                    const pos = positions[i];
                    cloneSprites[cloneIdx].x = pos.x;
                    cloneSprites[cloneIdx].y = pos.y;
                    cloneSprites[cloneIdx].visible = true;
                    this.ActiveClones.push({ x: pos.x, y: pos.y });
                    cloneIdx++;
                }
            }

            const HpProgress = 1.0 - (this.NowHPGuageHP / this.MaxHPGuageHP);
            const BulletNumber = bulletNumberPerShot * (0.5 + HpProgress * 0.5);
            const currentDelay = maxDelay + (minDelay - maxDelay) * HpProgress;

            // 全体（本体＋クローン3体）から一斉に円形弾幕を発動
            for (let i = 0; i < 4; i++) {
                RoundShotFunc(
                    EnemyBulletArray,
                    positions[i].x,
                    positions[i].y,
                    BulletNumber,
                    0,
                    bulletOptions,
                    360,
                    this.EnemyContainer
                );
            }

            step++;
            await wait(currentDelay);
        }

        // クローンの消去
        for (const sprite of cloneSprites) {
            this.EnemyContainer.removeChild(sprite);
            sprite.destroy();
        }
        this.ActiveClones = [];
        this.CanMoveFlag = true;
    }

    /**
     * スペル3: 十字
     */
    async AttackSkill3(EnemyBulletArray, TargetPlayer) {
        const difficultyMultiplier = 1.0 + 0.5 * DifficultyLevel;
        const AngleSpeedMag = 0.05 * (10 * difficultyMultiplier);
        let Angle = 0;
        let NowCnt = 1;

        while ((this.NowHPGuageHP > 0) && (this.SkillActivate == true)) {
            const BulletSpeed = 150;
            for (let i = 0; i < 4; i++) {
                const StartX = this.x;
                const StartY = this.y;

                let NowAngle = Angle +  i * Math.PI / 2;
                const SpeedX = BulletSpeed * Math.cos(NowAngle);
                const SpeedY = BulletSpeed * Math.sin(NowAngle);

                const BulletOptions = {
                    vx: SpeedX,
                    vy: SpeedY,
                    width: 12, height: 12, damage: 50, life: 20,
                    BulletImageKey: "BulletTypeA", shape: "circle",
                    target: TargetPlayer, trackingStrength: 0
                };
                EnemyBulletArray.push(new Bullet(this.EnemyContainer, StartX, StartY, BulletOptions));                
            }
            
            const RotationAmount = AngleSpeedMag * Math.log(NowCnt);
            Angle += RotationAmount * (Math.PI / 180);
            NowCnt += 1;
            await wait(0.15);
        }
        this.CanMoveFlag = true;
    }

    /**
     * スペル4: 変則円弧「光芒の雨」（Hard用）
     */
    async AttackSkill4(EnemyBulletArray, TargetPlayer) {
        const dm = 1.0 + DifficultyLevel * 0.5;
        this.CanMoveFlag = false;

        while ((this.NowHPGuageHP > 0) && (this.SkillActivate == true)) {
            // 上部80%の範囲に警告表示
            await showAreaWarning(
                this.EnemyContainer,
                this.StartAreaX,
                this.StartAreaY,
                this.NowPlayAreaWidth,
                this.NowPlayAreaHeight * 0.8,
                0.6
            );

            if (this.NowHPGuageHP <= 0 || !this.SkillActivate) break;

            const centers = [this.x - 60, this.x + 60];
            const bulletCount = 5;
            const spreadAngle = 120;
            const oneStep = spreadAngle / (bulletCount - 1);
            const startAngle = 90 - spreadAngle / 2;

            const stopDistance = this.NowPlayAreaHeight * 0.6;

            for (const cx of centers) {
                for (let i = 0; i < bulletCount; i++) {
                    const angleRad = (startAngle + i * oneStep) * Math.PI / 180;
                    
                    const isDrifter = (i % 2 === 1);
                    const postOptions = isDrifter ? {
                        ChangeActivation: ChangeActivation.Activate1,
                        vx: 40, vy: 40,
                        ax: 0, ay: 0, jx: 0, jy: 0,
                        trackingStrength: 0.8,
                        maxSpeed: 100,
                        LengthParcent: 1.0
                    } : {
                        ChangeActivation: ChangeActivation.ActivateFixed,
                        vx: 0, vy: 0,
                        ax: 0, ay: 0, jx: 0, jy: 0
                    };

                    const bulletOptions = {
                        vx: 350 * Math.cos(angleRad),
                        vy: 350 * Math.sin(angleRad),
                        ax: 0, ay: 0, jx: 0, jy: 0,
                        width: 14, height: 14, damage: 30, life: 15,
                        BulletImageKey: "BulletTypeA", shape: "circle",
                        ActivationLength: stopDistance,
                        PostActivationOptions: postOptions
                    };

                    EnemyBulletArray.push(new Bullet(this.EnemyContainer, cx, this.y, bulletOptions));
                }
            }
            await wait(2.0 / dm);
        }
        this.CanMoveFlag = true;
    }

    /**
     * スペル5: 分裂「狂気のマトリクス」（Lunatic用）
     */
    async AttackSkill5(EnemyBulletArray, TargetPlayer) {
        this.CanMoveFlag = false;

        while ((this.NowHPGuageHP > 0) && (this.SkillActivate == true)) {
            const directions = 6;
            const steps = 3;
            let currentLayer = [];

            for (let d = 0; d < directions; d++) {
                const angleRad = (d * 360 / directions) * Math.PI / 180;
                for (let s = 1; s <= steps; s++) {
                    const stopDist = s * 60;
                    const bulletOptions = {
                        vx: 250 * Math.cos(angleRad),
                        vy: 250 * Math.sin(angleRad),
                        ax: 0, ay: 0, jx: 0, jy: 0,
                        width: 20, height: 20, damage: 40, life: 1,
                        BulletImageKey: "BulletTypeA", shape: "circle",
                        ActivationLength: stopDist,
                        PostActivationOptions: {
                            ChangeActivation: ChangeActivation.ActivateFixed,
                            vx: 0, vy: 0,
                            ax: 0, ay: 0, jx: 0, jy: 0
                        }
                    };
                    const b = new Bullet(this.EnemyContainer, this.x, this.y, bulletOptions);
                    EnemyBulletArray.push(b);
                    currentLayer.push(b);
                }
            }

            await wait(1.0);

            // 分裂を4回繰り返す
            for (let splitCount = 0; splitCount < 4; splitCount++) {
                if (this.NowHPGuageHP <= 0 || !this.SkillActivate) break;

                const nextLayer = [];
                for (const b of currentLayer) {
                    if (b.isHit) continue;
                    
                    const bx = b.x + b.width / 2;
                    const by = b.y + b.height / 2;
                    b.destroy();

                    for (let i = 0; i < 8; i++) {
                        const aRad = (i * 45) * Math.PI / 180;
                        const subOptions = {
                            vx: 150 * Math.cos(aRad),
                            vy: 150 * Math.sin(aRad),
                            ax: 0, ay: 0, jx: 0, jy: 0,
                            width: 10 - splitCount * 2,
                            height: 10 - splitCount * 2,
                            damage: 15, life: 1,
                            BulletImageKey: "BulletTypeA", shape: "circle",
                            ActivationLength: 40,
                            PostActivationOptions: {
                                ChangeActivation: ChangeActivation.ActivateFixed,
                                vx: 0, vy: 0,
                                ax: 0, ay: 0, jx: 0, jy: 0
                            }
                        };
                        const subB = new Bullet(this.EnemyContainer, bx, by, subOptions);
                        EnemyBulletArray.push(subB);
                        nextLayer.push(subB);
                    }
                }
                currentLayer = nextLayer;
                await wait(0.8);
            }

            for (const b of currentLayer) {
                b.destroy();
            }

            await wait(1.5);
        }
        this.CanMoveFlag = true;
    }

    DrawEnemyImagedraw() {
        super.DrawEnemyImage()
    }

    _getSkillDefinitionForPhase(phase) {
        return this.SkillDefinitions[phase];
    }
}