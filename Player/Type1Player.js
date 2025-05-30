// Type1のキャラクター性能
import { PlayerBase } from './PlayerBase.js';

import { CharacterTypeEnum, character_info_list, MainBulletEnum, SubBulletEnum, 
    main_bulled_info_list, sub_bulled_info_list } from '../game_status.js';

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
            character_speed: myCharacterConfig.character_speed,
            character_maxhp: myCharacterConfig.character_maxhp,
            slowMoveFactor: 0.5, // Type1固有の低速係数（またはmyCharacterConfigからロード）

            character_skill1: myCharacterConfig.character_skill1,
            character_ULT: myCharacterConfig.character_ULT,
            character_m_bullet: myCharacterConfig.character_m_bullet,
            character_s_bullet: myCharacterConfig.character_s_bullet,
        };
        super(InitialX, InitialY, AssetManager, Canvas, baseConfig, NowPlayAreaWidth, NowPlayAreaHeight);

        this.main_bullet_list = [];
        this.sub_bullet_list = [];

    }

    updateScale(NewScaleFactor, NewCanvas, OldGamePlayerSizeHeight, OldGamePlayerSizeWidth, 
        NewGamePlayerSizeHeight, NewGamePlayerSizeWidth)
    {
        // 規定クラスコンストラクタで呼び出し
        super.updateScale(NewScaleFactor, NewCanvas, OldGamePlayerSizeHeight, OldGamePlayerSizeWidth, 
        NewGamePlayerSizeHeight, NewGamePlayerSizeWidth);

        // このクラス内でサイズを使っている部分を変更

    }

    // 弾を打つ
    _shoot(Keys, PlayerBulletsArray, TargetEnemy, CurrentTime, DeltaTime){
        
        status = this.MainBulletInfo;
        // Type1は既定クラスのshotをそのまま使える
        super._shoot(Keys, PlayerBulletsArray, TargetEnemy, CurrentTime, DeltaTime);

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