// Type1Enemyのクラス
import { EnemyBase } from "./EnemyBase.js";
import { SingleShotFunc, RoundShotFunc, FanShotFunc, windmillshotfunc, CircleAndHomeShotFunc } from "./EnemyShot.js";
import { ChangeActivation } from '../bullet.js'; 
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
            
            // ★修正点★
            // 各パターンのループに、開始遅延時間（秒）を渡す
            this.pattern1_Loop(EnemyBulletArray, TargetPlayer, 0.5);  // 0.5秒後に開始
            this.pattern2_Loop(EnemyBulletArray, TargetPlayer, 1.5);  // 1.5秒後に開始
            this.pattern3_Loop(EnemyBulletArray, TargetPlayer, 2.5);  // 2.5秒後に開始
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
                if(this.NowHPGuageHP > 0){
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

            // 発射前に一度だけHPをチェック
            if (this.NowHPGuageHP > 0) {
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
            
            if (this.NowHPGuageHP > 0) {
                const bulletBasicOptions = { vx: 100, vy: 100, ax: -5, ay: -5, jx: 0, jy: 0, width: 80, height: 80, damage: 100, life: 15, target: TargetPlayer, trackingStrength: 0, BulletImageKey: "BulletTypeA", shape: "rectangle" };
                SingleShotFunc(EnemyBulletArray, this.x, this.y, bulletBasicOptions, this.EnemyContainer, TargetPlayer.x, TargetPlayer.y);
            }
            
            // 次の攻撃までの長い待機
            await wait(3.0 / difficultyMultiplier);
        }
    }
    
    _skilrun(DeltaTime, TargetPlayer) {
        super._skilrun(DeltaTime);
        if((this.SkillActivate == true) && (this.IsSkillTextShown == false)){
            this.IsSkillTextShown = true; 
            switch(this.NowEnemyHPGuage){
                case 0:
                    this.SkillText.text = "「全方位弾幕」";
                    break;
            }
            this.SkillText.visible = true;
            this.SkillTimerText.visible = true;
            this.SkillText.text = "「全方位弾幕」";
            const finalSafeY = this.SkillText.y;
            const startY = finalSafeY + 20;
            gsap.fromTo(this.SkillText, { y: startY, alpha: 0 }, { y: finalSafeY, alpha: 1, duration: 0.8, ease: "power2.out" });
            const finalTimerY = this.SkillTimerText.y;
            const startTimerY = finalTimerY + 20;
            gsap.fromTo(this.SkillTimerText, { y: startTimerY, alpha: 0 }, { y: finalTimerY, alpha: 1, duration: 0.8, ease: "power2.out" });
        }
    }

    SkillRun1(EnemyBulletArray, TargetPlayer){

    }

    DrawEnemyImagedraw() {
        super.DrawEnemyImage()
    }
}