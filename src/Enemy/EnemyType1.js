// Type1Enemyのクラス
import { EnemyBase } from "./EnemyBase.js";
import { SingleShotFunc, RoundShotFunc, FanShotFunc, windmillshotfunc, CircleAndHomeShotFunc } from "./EnemyShot.js";
import { ChangeActivation, Bullet } from '../bullet.js'; 
import { DifficultyLevel } from "../Screens/BaseScreen.js"
import { CharacterTypeEnum, character_info_list, MainBulletEnum, SubBulletEnum, 
    main_bulled_info_list, sub_bulled_info_list, 
    enemy_info_list,
    EnemyTypeEnum } from '../game_status.js';

/**
 * 指定された秒数だけ待機するPromiseを返すヘルパー関数
 * @param {number} seconds - 待機する秒数
 */
const wait = (seconds) => new Promise(resolve => setTimeout(resolve, seconds * 1000));

export class EnemyType1 extends EnemyBase {
    constructor(GameScreenContainer, StartShootingX, StartShootingY, StartShootingWidth, StartShootingHeight) {
        
        const enemyInfo = enemy_info_list[EnemyTypeEnum.E_TYPE_1];
        const BaseConfig = {
            ...enemyInfo,
            ETypeTypeID: EnemyTypeEnum.E_TYPE_1
        };
        super(GameScreenContainer, StartShootingX, StartShootingY, StartShootingWidth, StartShootingHeight, BaseConfig);

        // 各攻撃ループが開始されたかを管理するフラグ
        this._attackLoopsStarted = false;
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
            this.pattern3_Loop(EnemyBulletArray, TargetPlayer, 2);  // 2秒後に開始
        }
    }

    /**
     * 【攻撃パターン1】扇形弾の独立した実行ループ
     * @param {number} initialDelay - このループの開始遅延時間（秒）
     */
    async pattern1_Loop(EnemyBulletArray, TargetPlayer, initialDelay) {
        // ★修正点★: 指定された時間だけ待機してからループを開始
        await wait(initialDelay);

        // HPゲージが残っている間、ループし続ける
        while (this.NowHPGuageHP > 0) {
            const difficultyMultiplier = 1.0 + DifficultyLevel;
            
            // --- 扇形弾の1シーケンス（このブロックは一度始まると最後まで実行される） ---
            const bulletCountMax = 5 * difficultyMultiplier;
            const sequenceCount = Math.ceil(bulletCountMax / 2.0);
            const deltaX = TargetPlayer.x - this.x;
            const deltaY = TargetPlayer.y - this.y;
            const centerAngleDegrees = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
            const fanAngle = 60;
            const fanAngleOneStep = fanAngle / bulletCountMax;
            const bulletOptions = {
                vx: 40, vy: 40, ax: 30, ay: 30, jx: 0, jy: 0,
                width: 10, height: 10, radius: 1000, damage: 25, life: 15,
                target: TargetPlayer, trackingStrength: 0,
                BulletImageKey: "BulletTypeA", shape: "rectangle"
            };

            for (let i = 0; i < sequenceCount; i++) {
                // HPが0もしくは、スキル中なら行わない
                if ((this.NowHPGuageHP > 0) && (this.SkillActivate == false)) {
                    console.log("ShotPattern1");
                    let bulletNumber = Math.round(bulletCountMax - (2.0 * i));
                    bulletNumber = (bulletNumber < 1) ? 1 : bulletNumber; 
                    FanShotFunc(EnemyBulletArray, this.x, this.y, bulletNumber, fanAngleOneStep, centerAngleDegrees, bulletOptions, this.EnemyContainer);
                    await wait(0.5 / difficultyMultiplier); // 短い待機
                }
            }
            // --- シーケンス終了 ---

            // 次のシーケンスまでの長い待機
            await wait(2.0 / difficultyMultiplier);
        }
    }

    /**
     * 【攻撃パターン2】円形弾の独立した実行ループ
     * @param {number} initialDelay - このループの開始遅延時間（秒）
     */
    async pattern2_Loop(EnemyBulletArray, TargetPlayer, initialDelay) {
        await wait(initialDelay);

        while (this.NowHPGuageHP > 0) {
            const difficultyMultiplier = 1.0 + DifficultyLevel;

            // HPが0もしくは、スキル中なら行わない
            if ((this.NowHPGuageHP > 0) && (this.SkillActivate == false)) {
                const bulletNumber = 10 * (1.0 + difficultyMultiplier * 0.5);
                const bulletBasicOptions = { vx: 100, vy: 100, ax: -5, ay: -5, jx: 0, jy: 0, width: 10, height: 10, damage: 25, life: 15, target: TargetPlayer, trackingStrength: 0, BulletImageKey: "BulletTypeA", shape: "rectangle" };
                const changeOption = { ...bulletBasicOptions, ChangeActivation: ChangeActivation.Activate1, LengthParcent: 0.3 };
                CircleAndHomeShotFunc(EnemyBulletArray, this.x, this.y, bulletNumber, 0, 360, bulletBasicOptions, changeOption, this.NowPlayAreaWidth * 0.1, this.EnemyContainer);
            }

            // 次の攻撃までの長い待機
            await wait(3.0 / difficultyMultiplier);
        }
    }

    /**
     * 【攻撃パターン3】単発巨大弾の独立した実行ループ
     * @param {number} initialDelay - このループの開始遅延時間（秒）
     */
    async pattern3_Loop(EnemyBulletArray, TargetPlayer, initialDelay) {
        await wait(initialDelay);

        while (this.NowHPGuageHP > 0) {
            const difficultyMultiplier = 1.0 + DifficultyLevel;
            
            // HPが0もしくは、スキル中なら行わない
            if ((this.NowHPGuageHP > 0) && (this.SkillActivate == false)) {
                const bulletBasicOptions = { vx: 100, vy: 100, ax: -5, ay: -5, jx: 0, jy: 0, width: 80, height: 80, damage: 100, life: 15, target: TargetPlayer, trackingStrength: 0, BulletImageKey: "BulletTypeA", shape: "rectangle" };
                SingleShotFunc(EnemyBulletArray, this.x, this.y, bulletBasicOptions, this.EnemyContainer, TargetPlayer.x, TargetPlayer.y);
            }
            
            // 次の攻撃までの長い待機
            await wait(3.0 / difficultyMultiplier);
        }
    }
    
    async _skilrun(DeltaTime, TargetPlayer, EnemyBulletArray, PlayerBulletArray) {
        super._skilrun(DeltaTime, EnemyBulletArray, PlayerBulletArray);
        if((this.SkillActivate == true) && (this.IsSkillTextShown == false)){
            // スキル発動時は弾を全削除


            this.IsSkillTextShown = true; 
            switch(this.MaxEnemyHPGuage - this.NowEnemyHPGuage){
                case 0:
                    this.SkillRun1(EnemyBulletArray, TargetPlayer);
                    break;
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
     * スペル1を発動
     * @param {number} EnemyBulletArray - 弾の配列
     * @param {instance} TargetPlayer - プレイヤーインスタンス
     */
    async SkillRun1(EnemyBulletArray, TargetPlayer){
        // 攻撃と移動を停止
        // X中心Y0.2に移動
        const TargetX = this.StartAreaX + (this.NowPlayAreaWidth * 0.5);
        const TargetY = this.StartAreaY + this.NowPlayAreaHeight * 0.25;
        this.SkillText.text = "五月雨";
        // 指定位置に移動

         const movePromise = new Promise(resolve => {
            gsap.to(this, { // ★対象を this.EnemyImage から this に変更
                x: TargetX,
                y: TargetY,
                duration: 1.5,
                ease: "power2.inOut",
                onUpdate: () => {
                    // onUpdateは不要になるが、念のため描画更新を入れても良い
                    this.DrawEnemyImage(); 
                },
                onComplete: () => {
                    resolve(); // アニメーション完了時にPromiseを解決
                }
            });
        });

        // Promiseの完了を await で待つ
        await movePromise;

        // awaitの後（移動完了後）に攻撃を開始する
        this.x = this.EnemyImage.x;
        this.y = this.EnemyImage.y;
        await this.AttackSkill1(EnemyBulletArray, TargetPlayer); 
    }

    /**
     * スペル1を発動の攻撃を実働させる
     * @param {instance} EnemyBulletArray - 弾のベクタ
     * @param {instance} TargetPlayer - プレイヤーのインスタンス
     */
    async AttackSkill1(EnemyBulletArray, TargetPlayer) {
        const DifficultyMultiplier = 1.0 + (DifficultyLevel * 0.5); // 難易度補正

        // HPが残っている/Spellが有効な間、ループ
        while ((this.NowHPGuageHP > 0) && (this.SkillActivate == true)) {
            
            const BulletNumber = 20 + Math.floor(15 * DifficultyLevel); // 弾の数
            const MaxHorizontalSpeed = 1700; // 横方向への広がりを決める最大速度

            for (let i = 0; i < BulletNumber; i++) {
                const StartX = this.x;
                const StartY = this.y;

                const SpeedStep = (MaxHorizontalSpeed * 2) / (BulletNumber - 1);
                const BaseHorizontalSpeed = -MaxHorizontalSpeed + i * SpeedStep;

                const RandomOffset = (Math.random() - 0.5) * SpeedStep * 0.8; // 係数0.8で揺らぎを調整

                const FinalHorizontalSpeed = BaseHorizontalSpeed + RandomOffset;

                const IsOchibaMode = true;
                const sine_wave_enabled = IsOchibaMode;
                const sine_amplitude = IsOchibaMode ? (Math.random() * 5) * DifficultyMultiplier : 0;
                const sine_angular_frequency = IsOchibaMode ? Math.PI * (1 + Math.random() * 2) : 0;

                const BulletOptions = {
                    vx: FinalHorizontalSpeed,
                    vy: -850 - (Math.random() * 150), 
                    ax: 0,
                    ay: 350 + (Math.random() * 100),

                    // ( ... 以下、元のコードと同じ ... )
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

            // 次の弾幕までの待機時間
            await wait(0.8 / DifficultyMultiplier);
        }
        this.CanMoveFlag  = true;
    }

    DrawEnemyImagedraw() {
        super.DrawEnemyImage()
    }
}