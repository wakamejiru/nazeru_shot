// Type1Enemyのクラス
import { EnemyBase } from "./EnemyBase.js";

import { CharacterTypeEnum, character_info_list, MainBulletEnum, SubBulletEnum, 
    main_bulled_info_list, sub_bulled_info_list, 
    enemy_info_list,
    EnemyTypeEnum} from '../game_status.js';

    export class EnemyType1 extends EnemyBase
    {
        constructor(InitialX, InitialY, AssetManager, ShootingCanvas, EnemyConfig, ETypeTypeID) {
            
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
            super(InitialX, InitialY, AssetManager, ShootingCanvas, EnemyConfig);
            // スキル内容の初期化を行う
            // InitializeSkillSetting();
        }
    

    // 大きさを調整する
    updateScale(NewScaleFactor, NewCanvas, OldGamePlayerSizeHeight, OldGamePlayerSizeWidth)
    {
        // スキルのアップスケールはここで行う
        // 規定クラスコンストラクタで呼び出し
        super.updateScale(NewScaleFactor, NewCanvas, OldGamePlayerSizeHeight);

        // このクラス内でサイズを使っている部分を変更


    }

    move(DeltaTime){
        super.move(DeltaTime);

    }

    _shoot(BulletArray, TargetPlayer, CurrentTime, DeltaTime){
        if (this.NowHP <= 0) {
            return;
        }
        
        // クールダウンを確認する
        if (this.NowAttackWatingTime > 0) { // クールダウン中かチェック
            this.NowAttackWatingTime -= DeltaTime; // クールダウンタイマーを減算
            if (this.NowAttackWatingTime < 0) this.NowAttackWatingTime = 0;
        }else
        {
            // 攻撃カウンタをリセット
            this.NowAttackWatingTime = this.AttackWatingTime;

            // 攻撃を放出する
            switch(this.AttackState)
            {        
                case 0:
                    // 一巡目のスキル内容を書く

                    // 次のアタックシーケンスに移行させる
                    this.AttackState = 1;
                    break;
                case 1:

                    break;

            }
		}
        

    }

     _skilrun()
    {
        // 一定条件下でスキルを使う
        // HP何割削れたかで決める

    }

    }