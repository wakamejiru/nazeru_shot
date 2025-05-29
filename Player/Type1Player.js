// Type1のキャラクター性能
import { PlayerBase } from './PlayerBase.js';

import { CharacterTypeEnum, character_info_list, MainBulletEnum, SubBulletEnum, 
    main_bulled_info_list, sub_bulled_info_list } from './game_status.js';

export class PlayerType1 extends PlayerBase {
    constructor(InitialX, InitialY, AssetManager, Canvas, NowPlayAreaWidth, NowPlayAreaHeight) {
        const myCharacterConfig = character_info_list[CharacterTypeEnum.TYPE_1];
        // PlayerBaseのコンストラクタに渡すための共通情報を抽出・設定
        const baseConfig = {
            CharacterTypeID: CharacterTypeEnum.TYPE_1,
            charachter_name: myCharacterConfig.charachter_name,
            avatar_image_key: myCharacterConfig.avatar_image_key,
            sprite_base_draw_width: myCharacterConfig.sprite_base_draw_width,
            sprite_base_draw_height: myCharacterConfig.sprite_base_draw_height,
            hitpoint_image_key: myCharacterConfig.hitpoint_image_key,
            hitpoint_radius: myCharacterConfig.hitpoint_radius,
            character_speed: myCharacterConfig.character_spped, // タイプミスに注意
            character_maxhp: myCharacterConfig.character_maxhp,
            slowMoveFactor: 0.5, // Type1固有の低速係数（またはmyCharacterConfigからロード）
        };
        super(InitialX, InitialY, AssetManager, Canvas, baseConfig, NowPlayAreaWidth, NowPlayAreaHeight);

        this.main_bullet_list = [];
        this.sub_bullet_list = [];
        // 弾を作成する
        _createbullettype();
    }

    updateScale(NewScaleFactor, NewCanvas, OldGamePlayerSizeHeight, OldGamePlayerSizeWidth, 
        NewGamePlayerSizeHeight, NewGamePlayerSizeWidth)
    {
        // 規定クラスコンストラクタで呼び出し
        super(NewScaleFactor, NewCanvas, OldGamePlayerSizeHeight, OldGamePlayerSizeWidth, 
        NewGamePlayerSizeHeight, NewGamePlayerSizeWidth);

        // このクラス内でサイズを使っている部分を変更

    }
    
    // 弾を作成する
    _createbullettype()
    {
        // 弾を作成する
        // Mainの弾を作成する
        // 弾は自由度が高いのでここで書いて一括管理は行わない
        this.MainBulletName = "メイン弾!"
        this.MainBulletNumber = 3;
        this.MainBulletMaxAngleRight = 30;
        this.MainBulletMinAngleRight = -30;
        this.MainBulletStartPointX123 = 0; // 3点とも打ち出し箇所は同じ
        this.MainBulletStartPointY123 = 0; // 3点とも打ち出し箇所は同じ
        this.MainBulletDamage = 25;
        this.MainBulletRate = 0.3; // 0.1秒ごとに1つ発射
        this.MainBulletImageKey = "bulletTypeA";
        
        // Upscale必要
        this.BaseMainBulletSpeedX = 0;
        this.MainBulletSpeedX = this.BaseMainBulletSpeedX;
        this.BaseMainBulletSpeedY = 900;
        this.MainBulletSpeedY = this.BaseMainBulletSpeedY;
        this.MainBulletWidth = 10.0;
        this.BaseMainBulletWidth = this.MainBulletWidth;
        this.MainBulletHeight = 10.0;
        this.BaseMainBulletHeight = this.MainBulletHeight;

        // Subの弾を作成する
        // 弾は自由度が高いのでここで書いて一括管理は行わない
        this.SubBulletName = "サブ弾!"
        this.SubBulletNumber = 8;
        this.SubBulletMaxAngleRight = 45;
        this.SubBulletMinAngleRight = -45;
        this.SubBulletStartPointX123 = 0; // 3点とも打ち出し箇所は同じ
        this.SubBulletStartPointY123 = 0; // 3点とも打ち出し箇所は同じ
        this.SubBulletDamage = 5;
        this.SubBulletRate = 0.1; // 0.3秒ごとに1つ発射
        this.SubBulletImageKey = "bulletTypeA";
        
        // Upscale必要
        this.SubBulletSpeedX = 0;
        this.SubBulletSpeedY = 900;
        this.SubBulletWidth = 5.0;
        this.SubBulletHeight = 5.0;
    }


    // 弾を打つ
    _shoot(Keys, PlayerBulletsArray, TargetEnemy, CurrentTime, DeltaTime){
        
        status = this.MainBulletInfo;

        // まずはMainの弾の発射地点から計算する
        




    }


    // PlayerBaseの_setupSkillsAndAttackPatternsをオーバーライドして専用スキルを設定
    _setupSkillsAndAttackPatterns(characterConfig) { // characterConfig は character_info_list[CharacterTypeEnum.TYPE_1]
        const patternsForPhase = [];

        // メイン弾1の設定
        if (characterConfig.character_m_bullet1 && characterConfig.character_m_bullet1 !== MainBulletEnum.NONE) {
            const m1BaseInfo = main_bulled_info_list[characterConfig.character_m_bullet1];
            if (m1BaseInfo) {
                patternsForPhase.push(new CircularAttackSkill(this, {
                    bullet_key: characterConfig.character_m_bullet1,
                    bullets_per_shot: 1, // 単発前方
                    angle_offset_rad: -Math.PI / 2, // 真上
                    shot_speed_multiplier: 1.0, // game_status.jsの弾速をそのまま使う場合
                    cooldown: m1BaseInfo.rate || 0.2,
                    // ...その他CircularAttackSkillが必要とするオプション
                }));
            }
        }
        // サブ弾1の設定 (例としてFanAttackSkillを使う場合)
        if (characterConfig.character_s_bullet1 && characterConfig.character_s_bullet1 !== SubBulletEnum.NONE) {
            const s1BaseInfo = sub_bulled_info_list[characterConfig.character_s_bullet1];
            if (s1BaseInfo) {
                // FanAttackSkill を使うと仮定した場合 (FanAttackSkill.js が別途必要)
                /*
                patternsForPhase.push(new FanAttackSkill(this, {
                    bullet_key: characterConfig.character_s_bullet1,
                    bullets_per_shot: s1BaseInfo.fan_bullets || 3, // fan_bulletsをgame_statusで定義
                    fan_angle_degrees: s1BaseInfo.fan_angle_degrees || 30,
                    target_player: false, // プレイヤーは通常前方を向く
                    fan_base_angle_offset_rad: -Math.PI / 2, // 前方
                    cooldown: s1BaseInfo.rate || 0.5,
                    shot_speed_multiplier: 1.0,
                }));
                */
                // もしサブ弾もCircularAttackSkillで単純に前方に撃つなら:
                 patternsForPhase.push(new CircularAttackSkill(this, {
                     bullet_key: characterConfig.character_s_bullet1,
                     bullets_per_shot: 1,
                     angle_offset_rad: -Math.PI / 2 + 0.1, // メイン弾より少し右
                     cooldown: s1BaseInfo.rate || 0.3,
                     shot_speed_multiplier: 0.8,
                     start_x_offset: (s1BaseInfo.start_x_pos || 0) * this.currentScaleFactor, // 発射位置オフセット
                     start_y_offset: (s1BaseInfo.start_y_pos || 0) * this.currentScaleFactor,
                 }));
            }
        }
        // サブ弾2も同様に...
        if (characterConfig.character_s_bullet2 && characterConfig.character_s_bullet2 !== SubBulletEnum.NONE) {
            const s2BaseInfo = sub_bulled_info_list[characterConfig.character_s_bullet2];
            if (s2BaseInfo) {
                 patternsForPhase.push(new CircularAttackSkill(this, {
                     bullet_key: characterConfig.character_s_bullet2,
                     bullets_per_shot: 1,
                     angle_offset_rad: -Math.PI / 2 - 0.1, // メイン弾より少し左
                     cooldown: s2BaseInfo.rate || 0.3,
                     shot_speed_multiplier: 0.8,
                     start_x_offset: (s2BaseInfo.start_x_pos || 0) * this.currentScaleFactor, // 発射位置オフセット
                     start_y_offset: (s2BaseInfo.start_y_pos || 0) * this.currentScaleFactor,
                 }));
            }
        }


        if (patternsForPhase.length > 0) {
            this.attackPatterns.push({ phase_duration: Infinity, patterns: patternsForPhase }); // プレイヤーは通常1フェーズ
        }
    }
}