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
        // HP、バーを難易度ごとに変更
        const BaseConfig = {
            ...enemyInfo,
            enemy_maxhp: enemyInfo.enemy_maxhp * ((0.6 * DifficultyLevel) + 0.4),
            enemy_hp_guage: (DifficultyLevel  < 2) ? 2 : 3,
            ETypeTypeID: EnemyTypeEnum.E_TYPE_1
        };

        super(GameScreenContainer, StartShootingX, StartShootingY, StartShootingWidth, StartShootingHeight, BaseConfig);

        // 各攻撃ループが開始されたかを管理するフラグ
        this._attackLoopsStarted = false;

        // スキルごとの設定をデータとして定義
        this.SkillDefinitions = {
            0: {
                name: "五月雨",
                // 移動先座標を関数として定義
                // 移動がない場合以下のフラグを無しに
                NoMoveFlag: false,
                targetX: () => this.StartAreaX + (this.NowPlayAreaWidth * 0.5),
                targetY: () => this.StartAreaY + this.NowPlayAreaHeight * 0.25,
                // 実行する攻撃関数を紐付け
                attackFunction: this.AttackSkill1, 
                // スキル終了後、通常移動を許可するか
                allowMoveAfter: true
            },
            1: {
                name: "四重奏のプレリュード",              
                NoMoveFlag: false,
                targetX: () => this.StartAreaX + (this.NowPlayAreaWidth * 0.5),
                targetY: () => this.StartAreaY + this.NowPlayAreaHeight * 0.3,
                attackFunction: this.AttackSkill2, // 新しい攻撃関数
                allowMoveAfter: true // スキル後も移動しない
            },
            2: {
                name: "十字",              
                NoMoveFlag: false,
                targetX: () => this.StartAreaX + (this.NowPlayAreaWidth * 0.5),
                targetY: () => this.StartAreaY + this.NowPlayAreaHeight * 0.5,
                attackFunction: this.AttackSkill3, // 新しい攻撃関数
                allowMoveAfter: true // スキル後も移動しない
            }
        };
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
            const difficultyMultiplier = 1.0 + (DifficultyLevel / 4);

            // HPが0もしくは、スキル中なら行わない
            if ((this.NowHPGuageHP > 0) && (this.SkillActivate == false)) {
                const bulletNumber = 5 * (1.0 + difficultyMultiplier * 0.5);
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
            const difficultyMultiplier = 1.0 + (DifficultyLevel / 4);
            // HPが0もしくは、スキル中なら行わない
            if ((this.NowHPGuageHP > 0) && (this.SkillActivate == false)) {
                const bulletBasicOptions = { vx: 100, vy: 100, ax: 0, ay: 0, jx: 0, jy: 0, width: 80, height: 80, damage: 100, life: 15, target: TargetPlayer, trackingStrength: 0, BulletImageKey: "BulletTypeA", shape: "rectangle" };
                SingleShotFunc(EnemyBulletArray, this.x, this.y, bulletBasicOptions, this.EnemyContainer, TargetPlayer.x, TargetPlayer.y);
            }
            
            // 次の攻撃までの長い待機
            await wait(3.0 / difficultyMultiplier);
        }
    }

    /**
     * スキルを発動する
     * @param {number} DeltaTime - 経過時間
     * @param {instance} TargetPlayer - ターゲットプレイヤのインスタンス
     * @param {LIST} EnemyBulletArray - バレットのアレイ
     */
    async _skilrun(DeltaTime, TargetPlayer, EnemyBulletArray) {
        super._skilrun(DeltaTime);
        if((this.SkillActivate == true) && (this.IsSkillTextShown == false)){
            
            this.IsSkillTextShown = true; 
            // （引数は調整してください）
            this.EnemyContainer.emit('skillActivated', true, 5, 0.1);

            const currentPhase = this.MaxEnemyHPGuage - this.NowEnemyHPGuage;
            const definition = this._getSkillDefinitionForPhase(currentPhase);

            if (definition) {
                // 汎用メソッドを呼び出す
                this._executeSkill(definition, EnemyBulletArray, TargetPlayer);
            } else {
                console.warn(`Skill definition for phase ${currentPhase} not found.`);
                this.CanMoveFlag = true; // 安全のため
            }
            
            // スキル名とタイマーの表示アニメーション（ここは共通なので変更なし）
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
     * スペル1を発動の攻撃を実働させる
     * @param {instance} EnemyBulletArray - 弾のベクタ
     * @param {instance} TargetPlayer - プレイヤーのインスタンス
     */
    async AttackSkill1(EnemyBulletArray, TargetPlayer) {
        const DifficultyMultiplier = 1.0 + (DifficultyLevel * 0.5); // 難易度補正

        // HPが残っている/Spellが有効な間、ループ
        while ((this.NowHPGuageHP > 0) && (this.SkillActivate == true)) {
            
            const BulletNumber = 20 + Math.floor(8 * DifficultyLevel); // 弾の数
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
                    ay: 250 + (Math.random() * 100),

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

    /**
     * スペル2
     * 画面4ヶ所から円形弾を順番に発射し、HPが減るにつれて発射間隔が短くなる。
     * @param {instance} EnemyBulletArray - 弾のベクタ
     * @param {instance} TargetPlayer - プレイヤーのインスタンス
     */
    async AttackSkill2(EnemyBulletArray, TargetPlayer) {
        const difficultyMultiplier = 1.0 + (DifficultyLevel * 0.5);
        this.CanMoveFlag = true; // このスキル中は敵が動き回る

        // --- スキル固有パラメータ ---
        const bulletNumberPerShot = 12 + Math.floor(2 * DifficultyLevel); // 1回に発射する円形弾の数
        const minDelay = 1.6 * (DifficultyLevel / 2); // スキル終了直前の、最小待機時間（秒）
        const maxDelay = minDelay * 1.8; // スキル開始時の、次の発射までの最大待機時間（秒）
        
        // 弾の基本設定
        const bulletOptions = {
            vx: 150 * difficultyMultiplier, vy: 150 * difficultyMultiplier,
            ax: 0, ay: 0, jx: 0, jy: 0,
            width: 10, height: 10, damage: 20, life: 15,
            target: TargetPlayer, trackingStrength: 0,
            BulletImageKey: "BulletTypeA", shape: "circle"
        };
        
        // --- 発射位置の定義 ---
        const positions = [
            { x: this.StartAreaX + this.NowPlayAreaWidth / 4, y: this.StartAreaY + this.NowPlayAreaHeight / 4 },
            { x: this.StartAreaX + this.NowPlayAreaWidth * 3 / 4, y: this.StartAreaY + this.NowPlayAreaHeight / 4 },
            { x: this.StartAreaX + this.NowPlayAreaWidth / 4, y: this.StartAreaY + this.NowPlayAreaHeight * 3 / 4 },
            { x: this.StartAreaX + this.NowPlayAreaWidth * 3 / 4, y: this.StartAreaY + this.NowPlayAreaHeight * 3 / 4 }
        ];

        let currentPositionIndex = 0; // 次に発射する位置のインデックス

        // HPが残っている/Spellが有効な間、ループ
        while ((this.NowHPGuageHP > 0) && (this.SkillActivate == true)) {

            // ■ ポイント1: HPゲージの減少率(0.0～1.0)を計算 ■
            // HP満タンで0.0、HPが0で1.0になる
            const HpProgress = 1.0 - (this.NowHPGuageHP / this.MaxHPGuageHP);
            const  ButtetNumbe = bulletNumberPerShot * HpProgress;
            // 次の発射までの待機時間(Delay)を計算 
            const currentDelay = maxDelay + (minDelay - maxDelay) * HpProgress;
            
            // 現在のインデックスの位置から弾を発射
            const currentPos = positions[currentPositionIndex];
            RoundShotFunc(
                EnemyBulletArray, 
                currentPos.x, 
                currentPos.y, 
                ButtetNumbe, 
                0, // 開始角度
                bulletOptions, 
                360, // 終了角度
                this.EnemyContainer
            );

            // 次の発射位置インデックスを更新
            currentPositionIndex = (currentPositionIndex + 1) % positions.length; // 0, 1, 2, 3 とループさせる

            // 計算した待機時間だけ待つ
            await wait(currentDelay);
        }

        // ループが終了したら（スキル終了後）、再度移動を許可（念のため）
        this.CanMoveFlag = true;
    }

    /**
     * スペル3
     * キャラを中心に移動、4方向に弾を連続発射し、それを回転(難易度によって回転速度が変化)
     * @param {instance} EnemyBulletArray - 弾のベクタ
     * @param {instance} TargetPlayer - プレイヤーのインスタンス
     */
    async AttackSkill3(EnemyBulletArray, TargetPlayer) {
        const difficultyMultiplier = 1.0 + 0.5 * DifficultyLevel;
        const AngleSpeedMag = 0.05 * (10 * difficultyMultiplier); // 角度速度 // 一番右を基準
        let Angle = 0;
        let NowCnt = 1; // log(1) = 0
        // HPが残っている/Spellが有効な間、ループ
        while ((this.NowHPGuageHP > 0) && (this.SkillActivate == true)) {

            const BulletSpeed = 150;
            // 4方向に打ち出し
            for (let i = 0; i < 4; i++) {
                const StartX = this.x;
                const StartY = this.y;

                let NowAngle = Angle +  i * Math.PI / 2; // 直交
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
            
            // 片対数で速度を向上
            const RotationAmount = AngleSpeedMag * Math.log(NowCnt);
            Angle += RotationAmount * (Math.PI / 180);
            NowCnt += 1;
            // 出すぎを防ぐためある程度の間隔をあける
            await wait(0.15);
        }

        // ループが終了したら（スキル終了後）、再度移動を許可（念のため）
        this.CanMoveFlag = true;
    }

    /**
 	 * キャラクターの画像を当たり判定の座標軸と一致させる
	 */
    DrawEnemyImagedraw() {
        super.DrawEnemyImage()
    }

    /**
     * 【実装】EnemyBaseから呼ばれる、スキル定義を返すためのメソッド
     * @param {number} phase 
     * @returns スキル定義
     */
    _getSkillDefinitionForPhase(phase) {
        // 自身の SkillDefinitions から対応する定義を返す
        return this.SkillDefinitions[phase];
    }
}