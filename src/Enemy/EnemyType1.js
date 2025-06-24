// Type1Enemyのクラス
import { EnemyBase } from "./EnemyBase.js";
import { RoundShotFunc, FanShotFunc, windmillshotfunc } from "./EnemyShot.js";


import { CharacterTypeEnum, character_info_list, MainBulletEnum, SubBulletEnum, 
    main_bulled_info_list, sub_bulled_info_list, 
    enemy_info_list,
    EnemyTypeEnum} from '../game_status.js';

    export class EnemyType1 extends EnemyBase
    {
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

            // スキル内容の初期化を行う
            // InitializeSkillSetting();
        }
        
    

        /**
         * 大きさを更新する
         * @param {number} NewScaleFactor :新しい画面のスケール
         * @param {number} NewShootingStartX :新しい画面の開始位置
         * @param {number} NewShootingStartY :新しい画面のス開始位置
         * @param {number} NewShootingWidth :新しい画面の幅
         * @param {number} NewShootingHeight :新しい画面の縦の大きさ
         */
        updateScale(NewScaleFactor, NewShootingStartX, NewShootingStartY, NewShootingWidth, NewShootingHeight)
        {
            // スキルのアップスケールはここで行う
            // 規定クラスコンストラクタで呼び出し
            super.updateScale(NewScaleFactor, NewShootingStartX, NewShootingStartY, NewShootingWidth, NewShootingHeight);

            // このクラス内でサイズを使っている部分を変更


        }

        /**
         * 移動を行う
         */
        move(DeltaTime){
            super.move(DeltaTime);

        }

        /**
         * 通常攻撃を放つ
         * @param {number} EnemyBulletArray :弾の配列
         * @param {number} TargetPlayer :プレイヤーのインスタンス
         * @param {number} DeltaTime :経過時間
         */
        _shoot(EnemyBulletArray, TargetPlayer, DeltaTime){
            if (this.NowHP <= 0) {
                return;
            }
            
            // クールダウンを確認する
            if (this.NowAttackWatingTime > 0) { // クールダウン中かチェック
                this.NowAttackWatingTime -= DeltaTime; // クールダウンタイマーを減算
                if (this.NowAttackWatingTime < 0) this.NowAttackWatingTime = 0;
            }else
            {
            this.SkillActiveFlag = true;
            }

            if (this.SkillActiveFlag == true){
                // 攻撃を放出する
                switch(this.AttackState)
                {        
                    case 0:

                        // ここである程度間引いてやらないとビームみたいになる

                        if(this.NowAttackRateTimer < this.AttackRateTimer){
                            this.NowAttackRateTimer += DeltaTime;
                        }else{
                            this.NowAttackRateTimer = 0; // リセット
                            const BulletNumber = 72;
                            const DeficitPercent = 0;
                            this.AttackCounter += 1;
                                                    
                            let StartAngle = (this.AttackCounter % 2 == 0) ? (2) : 0;
                            StartAngle += (this.AttackCounter % 3 == 0) ? (4) : 0;
                            let EndAngle = StartAngle + 360;
                            const BulletOptions = {
                                x_speed: 200,
                                y_speed: 200,
                                accel_x: 0,
                                accel_y: 0,
                                jeak_x:  0,
                                jeak_y:  0,
                                bulletWidht: 10,
                                bulletheight: 10,

                                bulletRadius: 1000,
                                bulletDamage: 25,
                                bulletHP: 15,
                                bulletMaxSpeed: 250000,
                                playerInstance: TargetPlayer,
                                trackingStrength: 0,
                                BulletImageKey: "BulletTypeA",
                                shape: "rectangle"
                            };
                            //発射レート
                            this.AttackRateTimer = 0.2;
                            // 一巡目のスキル内容を書く
                            // 自分中心から弾を出す
                            RoundShotFunc(EnemyBulletArray, this.x, this.y, 
                                                BulletNumber, StartAngle,  
                                                BulletOptions, EndAngle, this.EnemyContainer);
                            this.NowAttackLimitCnt += 1.0;
                            

                        }
                        // 攻撃のながさが終わったかを確認する
                        // 20個打ったら終了
                        this.AttackLimitCnt = 10;

                        // 攻撃区間を終了するかの判定を行う
                        super.isAttackendfuc(this.NowAttackLimitCnt, this.AttackLimitCnt, 1);

                    
                        break;

                    case 1:
                        // 扇型にの処理弾を3発
                        // 発射先は相手の現在の位置

                        // ここである程度間引いてやらないとビームみたいになる

                        if(this.NowAttackRateTimer < this.AttackRateTimer){
                            this.NowAttackRateTimer += DeltaTime;
                        }else{
                            this.NowAttackRateTimer = 0; // リセット
                            const BulletNumberMax = 15; // 扇型にするために徐々に弾を消していかなければならないこの現象がなければバームクーヘンになる
                            const DeficitPercent = 0;
                            
                            const ProprtyCoeffient = 2.0;
                            
                            const BulletNumber = Math.round( (BulletNumberMax -  (ProprtyCoeffient * this.AttackCounter)));

                            // 扇の角度
                            const FanAngle = 60;    
                            const FanAngleOneStep = FanAngle/BulletNumberMax;    


                            // 発射中心は一発ごとに固定
                            if(this.AttackCounter == 0){
                                // 発射位置、発射角度を求める
                                // 発射位置は三回とも変化
                                // とりあえず自分中心でとりあえず書いてみる
                                this.NowPlayerPointX = TargetPlayer.x;
                                this.NowPlayerPointY = TargetPlayer.y;
                                this.NowEnemyPointX = this.x;
                                this.NowEnemyPointY = this.y;
                                this.DeltaX = this.NowPlayerPointX - this.NowEnemyPointX;
                                this.DeltaY = this.NowPlayerPointY - this.NowEnemyPointY;
                                // 角度をラジアンで計算
                                this.AngleRadians = Math.atan2(this.DeltaY, this.DeltaX);
                                // ラジアンを度数に変換
                                this.CalculatedFanCenterAngleDegrees = this.AngleRadians * (180 / Math.PI);
                            }

                            
                            const BulletOptions = {
                                x_speed: 40,
                                y_speed: 40,
                                accel_x: 30,
                                accel_y: 30,
                                jeak_x:  0,
                                jeak_y:  0,
                                bulletWidht: 10,
                                bulletheight: 10,

                                bulletRadius: 1000,
                                bulletDamage: 25,
                                bulletHP: 15,
                                bulletMaxSpeed: 250000,
                                playerInstance: TargetPlayer,
                                trackingStrength: 0,
                                BulletImageKey: "BulletTypeA",
                                shape: "rectangle"
                            };
                            //発射レート
                            this.AttackRateTimer = 0.2;
                            // 一巡目のスキル内容を書く
                            // 自分中心から弾を出す
                            FanShotFunc(EnemyBulletArray, this.NowEnemyPointX, this.NowEnemyPointY, 
                                                BulletNumber, 
                                                FanAngleOneStep, 
                                                this.CalculatedFanCenterAngleDegrees,  // 扇の方向
                                                BulletOptions, this.EnemyContainer);


                            this.AttackCounter += 1;
                            
                            if(BulletNumber == 1){
                                this.AttackCounter = 0;
                                this.NowAttackLimitCnt += 1.0;

                                this.NowAttackRateTimer = 0; // ここを変えておかないと、3連続になる
                                this.AttackRateTimer = 0.5; // 1扇0.5s間隔
                            }


                        }


                        // 弾をすべて打ち出し終わったら終了するように変更する
                        this.AttackLimitCnt = 3; // 3回扇を出す


                        // 攻撃区間を終了するかの判定を行う
                        super.isAttackendfuc(this.NowAttackLimitCnt, this.AttackLimitCnt, 2);

                        break;

                    case 2:
                        // 三巡目のスキル内容を書く
                        // バームクーヘン型に発射する

                        // 扇型にの処理弾を3発
                        // 発射先は相手の現在の位置

                        // ここである程度間引いてやらないとビームみたいになる

                        if(this.NowAttackRateTimer < this.AttackRateTimer){
                            this.NowAttackRateTimer += DeltaTime;
                        }else{
                            this.NowAttackRateTimer = 0; // リセット
                            const BulletNumberMax = 15; // バームクーヘン
                            
                            const ProprtyCoeffient = 2.0;
                            
                            const BulletNumber = BulletNumberMax;

                            // 扇の角度
                            const FanAngle = 60;    
                            const FanAngleOneStep = FanAngle/BulletNumberMax;    


                            // 発射中心は一発ごとに固定
                            if(this.AttackCounter == 0){
                                // 発射位置、発射角度を求める
                                // 発射位置は三回とも変化
                                // とりあえず自分中心でとりあえず書いてみる
                                this.NowPlayerPointX = TargetPlayer.x;
                                this.NowPlayerPointY = TargetPlayer.y;
                                this.NowEnemyPointX = this.x;
                                this.NowEnemyPointY = this.y;
                                this.DeltaX = this.NowPlayerPointX - this.NowEnemyPointX;
                                this.DeltaY = this.NowPlayerPointY - this.NowEnemyPointY;
                                // 角度をラジアンで計算
                                this.AngleRadians = Math.atan2(this.DeltaY, this.DeltaX);
                                // ラジアンを度数に変換
                                this.CalculatedFanCenterAngleDegrees = this.AngleRadians * (180 / Math.PI);
                            }



                            let StartAngle = this.CalculatedFanCenterAngleDegrees - FanAngle/2;
                            let EndAngle = this.CalculatedFanCenterAngleDegrees + FanAngle/2;
                            const BulletOptions = {
                                x_speed: 200,
                                y_speed: 200,
                                accel_x: 0,
                                accel_y: 0,
                                jeak_x:  0,
                                jeak_y:  0,
                                bulletWidht: 10,
                                bulletheight: 10,

                                bulletRadius: 1000,
                                bulletDamage: 25,
                                bulletHP: 15,
                                bulletMaxSpeed: 250000,
                                playerInstance: TargetPlayer,
                                trackingStrength: 0,
                                BulletImageKey: "BulletTypeA",
                                shape: "rectangle"
                            };
                            //発射レート
                            this.AttackRateTimer = 0.2;
                            // 一巡目のスキル内容を書く
                            // 自分中心から弾を出す
                            RoundShotFunc(EnemyBulletArray, this.x, this.y, 
                                                BulletNumber, StartAngle,  
                                                BulletOptions, EndAngle, this.EnemyContainer);


                            this.AttackCounter += 1;
                            
                            if(this.AttackCounter > 5){ // 一回につき5発
                                this.AttackCounter = 0;
                                this.NowAttackLimitCnt += 1.0;

                                this.NowAttackRateTimer = 0; // ここを変えておかないと、3連続になる
                                this.AttackRateTimer = 0.5; // 1バームクーヘン0.5s間隔
                            }


                        }


                        // 弾をすべて打ち出し終わったら終了するように変更する
                        this.AttackLimitCnt = 3; // 3回バームクーヘンを出す


                        // 攻撃区間を終了するかの判定を行う
                        super.isAttackendfuc(this.NowAttackLimitCnt, this.AttackLimitCnt, 4);

                        break;

                    case 4:
                        // 4回目の通常攻撃
                        // 風車上に出す

                        if(this.NowAttackRateTimer < this.AttackRateTimer){
                            this.NowAttackRateTimer += DeltaTime;
                        }else{
                            this.NowAttackRateTimer = 0; // リセット
                            const BulletNumber = 12;
                            const DeficitPercent = 0;
                            this.AttackCounter += 1;
                                                    
                            let StartAngle = 0;
                            let EndAngle = StartAngle + 360;
                            const BulletOptions = {
                                x_speed: 200,
                                y_speed: 200,
                                accel_x: 0,
                                accel_y: 0,
                                jeak_x:  0,
                                jeak_y:  0,
                                bulletWidht: 10,
                                bulletheight: 10,

                                bulletRadius: 1000,
                                bulletDamage: 25,
                                bulletHP: 15,
                                bulletMaxSpeed: 250000,
                                playerInstance: TargetPlayer,
                                trackingStrength: 0,
                                BulletImageKey: "BulletTypeA",
                                shape: "rectangle"
                            };
                            //発射レート
                            this.AttackRateTimer = 0.1;
                            const ccw = true;
                            // 一巡目のスキル内容を書く
                            // 自分中心から弾を出す
                            windmillshotfunc(EnemyBulletArray, this.x, this.y, ccw, 0, null, StartAngle, EndAngle, BulletNumber, 
                                BulletOptions, this.EnemyContainer, this.AttackCounter, 5);
                            this.NowAttackLimitCnt += 1.0;
                            

                        }
                        // 攻撃のながさが終わったかを確認する
                        // 20個打ったら終了
                        this.AttackLimitCnt = 30;

                        // 攻撃区間を終了するかの判定を行う
                        super.isAttackendfuc(this.NowAttackLimitCnt, this.AttackLimitCnt, 0);
                        
                        break;

                }
            }        
            

        }
    
        /**
         * スキルを使用する
         * @param {number} DeltaTime - 時間
         */
        _skilrun(DeltaTime)
        {
            if(this.SkillActivate == true){
                this.SkillText.visible = true;
            }
            // 一定条件下でスキルを使う
            // HP何割削れたかで決める

        }

        /**
         * 描画を更新する
         */
        DrawEnemyImagedraw(){
            super.DrawEnemyImage()
        }
    }