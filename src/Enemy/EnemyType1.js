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
        
        // 1. 元となる敵の情報を取得
        const enemyInfo = enemy_info_list[EnemyTypeEnum.E_TYPE_1];

        // 2. スプレッド構文(...)を使い、enemyInfoの全プロパティをコピーしつつ、
        //    新しいプロパティを追加する
        const BaseConfig = {
            ...enemyInfo, // enemyInfoオブジェクトの全プロパティをここに展開
            ETypeTypeID: EnemyTypeEnum.E_TYPE_1 // プロパティを追加
        };

        // 3. 親クラスのコンストラクタを呼び出す
        super(GameScreenContainer, StartShootingX, StartShootingY, StartShootingWidth, StartShootingHeight, BaseConfig);

        // 攻撃パターンが実行中かどうかを管理するフラグ
        this._isAttacking = false;
    }

    /**
     * 大きさを更新する
     * @param {number} NewScaleFactor :新しい画面のスケール
     * @param {number} NewShootingStartX :新しい画面の開始位置
     * @param {number} NewShootingStartY :新しい画面のス開始位置
     * @param {number} NewShootingWidth :新しい画面の幅
     * @param {number} NewShootingHeight :新しい画面の縦の大きさ
     */
    updateScale(NewScaleFactor, NewShootingStartX, NewShootingStartY, NewShootingWidth, NewShootingHeight) {
        super.updateScale(NewScaleFactor, NewShootingStartX, NewShootingStartY, NewShootingWidth, NewShootingHeight);
        // このクラス内でサイズを使っている部分を変更
    }

    /**
     * 移動を行う
     */
    move(DeltaTime) {
        super.move(DeltaTime);
    }

    /**
     * 通常攻撃の開始をトリガーする
     * @param {Array} EnemyBulletArray :弾の配列
     * @param {Object} TargetPlayer :プレイヤーのインスタンス
     * @param {number} DeltaTime :経過時間
     */
    _shoot(EnemyBulletArray, TargetPlayer, DeltaTime) {
        if (this.NowHPGuageHP <= 0) {
            this._isAttacking = false; // 念のため攻撃を停止
            return;
        }

        // 既に攻撃パターンが実行中でなければ、新たに開始する
        if (!this._isAttacking) {
            this.startAttackPattern(EnemyBulletArray, TargetPlayer);
        }
    }

    /**
     * 複数の攻撃パターンを順番に、繰り返し実行するメインの非同期関数
     * @param {Array} EnemyBulletArray
     * @param {Object} TargetPlayer
     */
    async startAttackPattern(EnemyBulletArray, TargetPlayer) {
        this._isAttacking = true; // 攻撃開始のフラグを立てる
        const difficultyMultiplier = 1.0 + DifficultyLevel;
        
        // 敵のHPが0より大きい間、攻撃を無限に繰り返す
        if (this.NowHPGuageHP > 0) {
            await this.pattern1_FanShot(EnemyBulletArray, TargetPlayer, difficultyMultiplier);
            await wait(1.5 / difficultyMultiplier);
        }

        // --- パターン2: 円形設置→自機狙い弾 ---
        if (this.NowHPGuageHP > 0) {
            await this.pattern2_CircleAndHomeShot(EnemyBulletArray, TargetPlayer, difficultyMultiplier);
            await wait(2.5 / difficultyMultiplier);
        }

        // --- パターン3: 単発巨大弾 ---
        if (this.NowHPGuageHP > 0) {
            await this.pattern3_SingleBigShot(EnemyBulletArray, TargetPlayer, difficultyMultiplier);
            await wait(2.5 / difficultyMultiplier);
        }


        this._isAttacking = false; // 攻撃終了
    }

    /**
     * 攻撃パターン1: 扇形弾を連続発射
     * @param {Array} EnemyBulletArray
     * @param {Object} TargetPlayer
     * @param {number} difficultyMultiplier
     */
    async pattern1_FanShot(EnemyBulletArray, TargetPlayer, difficultyMultiplier) {
        const bulletCountMax = 5 * difficultyMultiplier; // 扇の最大弾数
        const sequenceCount = Math.ceil(bulletCountMax / 2.0); // 弾が1になるまでの回数

        // 発射の中心角度は最初に一度だけ計算
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
            if (this.NowHPGuageHP <= 0) break; // HPがなくなったら攻撃を即時中断

            // 弾数を徐々に減らす
            let bulletNumber = Math.round(bulletCountMax - (2.0 * i));
            bulletNumber = (bulletNumber < 1) ? 1 : bulletNumber; 

            FanShotFunc(EnemyBulletArray, this.x, this.y,
                bulletNumber,
                fanAngleOneStep,
                centerAngleDegrees,
                bulletOptions, this.EnemyContainer);

            // 次の発射までの待機
            await wait(0.5 / difficultyMultiplier);
        }
    }

    /**
     * 攻撃パターン2: 円形に設置後、プレイヤーに向かう弾
     * @param {Array} EnemyBulletArray
     * @param {Object} TargetPlayer
     * @param {number} difficultyMultiplier
     */
    async pattern2_CircleAndHomeShot(EnemyBulletArray, TargetPlayer, difficultyMultiplier) {
        if (this.NowHPGuageHP <= 0) return;

        const bulletNumber = 20 * (1.0 + difficultyMultiplier * 0.5);
        const bulletBasicOptions = {
            vx: 100, vy: 100, ax: -5, ay: -5, jx: 0, jy: 0,
            width: 10, height: 10, damage: 25, life: 15,
            target: TargetPlayer, trackingStrength: 0,
            BulletImageKey: "BulletTypeA", shape: "rectangle"
        };
        const changeOption = {
            ...bulletBasicOptions,
            ChangeActivation: ChangeActivation.Activate1,
            LengthParcent: 0.7,
        };
        
        CircleAndHomeShotFunc(
            EnemyBulletArray, this.x, this.y,
            bulletNumber, 0, 360,
            bulletBasicOptions, changeOption,
            this.NowPlayAreaWidth * 0.1,
            this.EnemyContainer
        );
        // この攻撃は一度に全弾発射するため、内部での待機は不要
    }

    /**
     * 攻撃パターン3: プレイヤーを狙う単発の巨大弾
     * @param {Array} EnemyBulletArray
     * @param {Object} TargetPlayer
     * @param {number} difficultyMultiplier
     */
    async pattern3_SingleBigShot(EnemyBulletArray, TargetPlayer, difficultyMultiplier) {
        if (this.NowHPGuageHP <= 0) return;

        const bulletBasicOptions = {
            vx: 100, vy: 100, ax: -5, ay: -5, jx: 0, jy: 0,
            width: 80, height: 80, damage: 100, life: 15,
            target: TargetPlayer, trackingStrength: 0,
            BulletImageKey: "BulletTypeA", shape: "rectangle"
        };

        SingleShotFunc(
            EnemyBulletArray, this.x, this.y,
            bulletBasicOptions, this.EnemyContainer,
            TargetPlayer.x, TargetPlayer.y
        );
    }
    
    /**
     * スキルを使用する
     * @param {number} DeltaTime - 時間
     */
    _skilrun(DeltaTime) {
        super._skilrun(DeltaTime);
        if((this.SkillActivate == true) && (this.IsSkillTextShown == false)){
            // これから表示するのでフラグをtrueにし、アニメーションの重複を防ぐ
            this.IsSkillTextShown = true; 
            
            // スキル個数はHPバー依存
            switch(this.NowEnemyHPGuage){
                case 0:
                    this.SkillText.text = "「全方位弾幕」";
                    break;
            }
            
            // テキストを見えるようにする
            this.SkillText.visible = true;
            this.SkillTimerText.visible = true;
            
            // (任意) スキルごとにテキスト内容を変更する場合
            this.SkillText.text = "「全方位弾幕」";

           const finalSafeY = this.SkillText.y;
            const startY = finalSafeY + 20;
            
            gsap.fromTo(this.SkillText, 
                { y: startY, alpha: 0 }, 
                { y: finalSafeY, alpha: 1, duration: 0.8, ease: "power2.out" }
            );

            const finalTimerY = this.SkillTimerText.y;
            const startTimerY = finalTimerY + 20;
            gsap.fromTo(this.SkillTimerText, 
                { y: startTimerY, alpha: 0 },
                { y: finalTimerY, alpha: 1, duration: 0.8, ease: "power2.out" }
            );
        }
    }

    /**
     * 描画を更新する
     */
    DrawEnemyImagedraw() {
        super.DrawEnemyImage()
    }
}