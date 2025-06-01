// Type1Enemyのクラス
import { EnemyBase } from "./EnemyBase.js";
import { RoundShotFunc } from "./EnemyShot.js";


import { CharacterTypeEnum, character_info_list, MainBulletEnum, SubBulletEnum, 
    main_bulled_info_list, sub_bulled_info_list, 
    enemy_info_list,
    EnemyTypeEnum} from '../game_status.js';

    export class EnemyType1 extends EnemyBase
    {
        constructor(InitialX, InitialY, AssetManager, ShootingCanvas) {
            
            const myEnemyTypeID = enemy_info_list[EnemyTypeEnum.E_TYPE_1];

            // 一覧になっている情報をここでもらう
            const BaseConfig = {
                ETypeTypeID: EnemyTypeEnum.E_TYPE_1,
                enemy_name: myEnemyTypeID.enemy_name,
                enemy_image_key: myEnemyTypeID.enemy_image_key,
                enemy_width: myEnemyTypeID.enemy_width,
                enemy_height: myEnemyTypeID.enemy_height,
                enemy_speed: myEnemyTypeID.enemy_speed,
                enemy_maxhp: myEnemyTypeID.enemy_maxhp,
                move_wait_duration: myEnemyTypeID.move_wait_duration,
                next_move_interval: myEnemyTypeID.next_move_interval,
                enemy_hp_guage: myEnemyTypeID.enemy_hp_guage,
                enemy_play_ult: myEnemyTypeID.enemy_play_ult,
                attack_variation: myEnemyTypeID.myEnemyTypeID,
                attack_watingtime: myEnemyTypeID.attack_watingtime
            };
            super(InitialX, InitialY, AssetManager, ShootingCanvas, BaseConfig);
            // スキル内容の初期化を行う
            // InitializeSkillSetting();
        }
    

    // 大きさを調整する
    updateScale(NewScaleFactor, NewCanvas, OldGamePlayerSizeHeight, OldGamePlayerSizeWidth)
    {
        // スキルのアップスケールはここで行う
        // 規定クラスコンストラクタで呼び出し
        super.updateScale(NewScaleFactor, NewCanvas, OldGamePlayerSizeHeight, OldGamePlayerSizeWidth);

        // このクラス内でサイズを使っている部分を変更


    }

    // 移動を行う
    move(DeltaTime){
        super.move(DeltaTime);

    }

    // 通常攻撃を放つ
    _shoot(EnemyBulletArray, TargetPlayer, CurrentTime, DeltaTime){
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
                    const BulletNumber = 12;
                    const StartAngle = 0;
                    const DeficitPercent = 0;

                    const BulletOptions = {
                        x_speed: 1000,
                        y_speed: 1000,
                        accel_x: 200,
                        accel_y: 200,
                        jeak_x:  100,
                        jeak_y:  100,
                        bulletRadius: 1000,
                        bulletDamage: 25,
                        bulletHP: 15,
                        bulletMaxSpeed: 250000,
                        playerInstance: TargetPlayer,
                        trackingStrength: 0,
                        BulletImageKey: "bulletTypeA",
                        shape: "rectangle"
                    };

                    // 一巡目のスキル内容を書く
                    // 自分中心から弾を出す
                    RoundShotFunc(EnemyBulletArray, this.x, this.y, 
                                        BulletNumber, StartAngle, DeficitPercent, 
                                        BulletOptions, this.AssetManager);


                    // 攻撃のながさが終わったかを確認する
                    this.AttackDuringTime1 = 3.0;

                    this.NowAttackDuringTime += DeltaTime;
                    // 攻撃区間を終了するかの判定を行う
                    super.isAttackendfuc(this.NowAttackDuringTime, this.AttackDuringTime1, 1);

                   
                    break;

                case 1:
                    // 二巡目のスキル内容を書く
                    this.AttackState = 2;
                    break;

                case 2:
                    // 三巡目のスキル内容を書く
                    this.AttackState = 0;
                    break;

            }
        } 
        // 攻撃カウンタをリセット これは通常攻撃の終わりに実行
        this.NowAttackWatingTime = this.AttackWatingTime;

       
        

    }

     _skilrun()
    {
        // 一定条件下でスキルを使う
        // HP何割削れたかで決める

    }

    draw(ctx){
        super.draw(ctx)
    }

    drawHpBar(ctx, EnemyscaledHpBarHeight){
        super.drawHpBar(ctx, EnemyscaledHpBarHeight);
    }

    }