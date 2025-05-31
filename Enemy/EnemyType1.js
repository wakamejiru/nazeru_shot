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
                

            };



            super(InitialX, InitialY, AssetManager, ShootingCanvas, EnemyConfig);
        }
    }