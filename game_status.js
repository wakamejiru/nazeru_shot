// game_status.js
// ゲーム関連の文字列や，各画像のパスや，キャラクター情報を管理するファイル
// ここで作成したものはキャラ一覧などの情報表示で使用する
// この情報は上書きはしない
// ゲームプレイ中はPlayerクラスでコピーしたものを変異させる

// Player側のクラスを管理する

// --- Enums ---
export const CharacterTypeEnum = Object.freeze({
  NONE: "NONE",
  TYPE_1: "Type1",
  TYPE_2: "Type2",
  TYPE_3: "Type3",
  TYPE_4: "Type4",
  TYPE_5: "Type5",
});

export const SkillTypeEnum = Object.freeze({
  NONE: "NONE", 
  SKILL_1: "skill_1", // 回復
});

export const UltTypeEnum = Object.freeze({
  NONE: "NONE",
  ULT_1: "ult_1", // 一定時間無敵
});

export const MainBulletEnum = Object.freeze({
  NONE: "NONE",
  M_BULLET_1: "m_bullet_1", // 通常弾
  M_BULLET_2: "m_bullet_2", // 通常弾
  M_BULLET_3: "m_bullet_2_R", // 通常弾
});

export const SubBulletEnum = Object.freeze({
  NONE: "NONE",
  S_BULLET_1: "s_bullet_1", // サブウェポン
  S_BULLET_2: "s_bullet_1_R", // サブウェポン1のR
  
  S_BULLET_3: "s_bullet_2", // サブウェポン2
  S_BULLET_4: "s_bullet_2_R", // サブウェポン2のR
  
  S_BULLET_5: "s_bullet_3", // サブウェポン3
  S_BULLET_6: "s_bullet_3_R", // サブウェポン3のR

  S_BULLET_7: "s_bullet_4_1", // サブウェポン4
  S_BULLET_8: "s_bullet_4_2", // サブウェポン4
  S_BULLET_9: "s_bullet_4_3", // サブウェポン4
  S_BULLET_10: "s_bullet_4_4", // サブウェポン4
  S_BULLET_11: "s_bullet_4_5", // サブウェポン4
});


export const  skill_info_list = {
    [SkillTypeEnum.NONE]:
    {
        // NONEの場合無視

    },
    [SkillTypeEnum.SKILL_1]:
    {
        skill_name:"スキル1",
        // 効果秒数などをほかのと共通項目はここに書く
    }
};

export const  ult_info_list = {
    [UltTypeEnum.NONE]:
    {
        // NONEの場合無視

    },
    [UltTypeEnum.ULT_1]:
    {
        skill_name:"タイプ1",
        // 効果秒数などをほかのと共通項目はここに書く

    }
};

// この情報でインスタンスを作るときに左右対称に設置できるようにする(リバースモード)
export const  main_bulled_info_list = {
    [MainBulletEnum.NONE]:
    {
        // NONEの場合無視

    },
    [MainBulletEnum.M_BULLET_1]:
    {
        start_x_pos:0,
        start_y_pos:0,
        ballet_name:"メインウエポン1",
        ball_image_key: "bulletTypeA",
        ball_shape: "circle", // ★形状タイプ: 'rectangle', 'circle', 'ellipse', 'rhombus', 'cone'(当たり判定)
        bullet_width: 15.0,
        bullet_height: 15.0,
        orientation: 0.0, // 回転数
        x_speed:0,
        y_speed:1500,
        accel_x:0,
        accel_y:0,
        jeak_x:0,
        jeak_y:0,
        color: 'rgb(255, 255, 255)',
        damage: 25,
        bulled_life: 5,
        bulled_maxSpeed: 10000,
        rate:0.2,
    },
    [MainBulletEnum.M_BULLET_2]:
    {
        start_x_pos:100,
        start_y_pos:0,
        ballet_name:"メインウエポン1",
        ball_image_key: "bulletTypeA",
        ball_shape: "circle", // ★形状タイプ: 'rectangle', 'circle', 'ellipse', 'rhombus', 'cone'(当たり判定)
        bullet_width: 15.0,
        bullet_height: 15.0,
        orientation: 0.0, // 回転数
        x_speed:0,
        y_speed:1500,
        accel_x:0,
        accel_y:0,
        jeak_x:0,
        jeak_y:0,
        color: 'rgb(255, 255, 255)',
        damage: 25,
        bulled_life: 5,
        bulled_maxSpeed: 10000,
        rate:0.1,
    },
    [MainBulletEnum.M_BULLET_3]:
    {
        start_x_pos:-100,
        start_y_pos:0,
        ballet_name:"メインウエポン1",
        ball_image_key: "bulletTypeA",
        ball_shape: "circle", // ★形状タイプ: 'rectangle', 'circle', 'ellipse', 'rhombus', 'cone'(当たり判定)
        bullet_width: 15.0,
        bullet_height: 15.0,
        orientation: 0.0, // 回転数
        x_speed:0,
        y_speed:1500,
        accel_x:0,
        accel_y:0,
        jeak_x:0,
        jeak_y:0,
        color: 'rgb(255, 255, 255)',
        damage: 25,
        bulled_life: 5,
        bulled_maxSpeed: 10000,
        rate:0.1,
    }
};
  
// この情報でインスタンスを作るときに左右対称に設置できるようにする(リバースモード)
export const  sub_bulled_info_list = {
    [SubBulletEnum.NONE]:
    {
        // NONEの場合無視

    },
    [SubBulletEnum.S_BULLET_1]: // 斜め15度に発射
    {
        start_x_pos:5,
        start_y_pos:0,
        ballet_name:"サブウエポン1",
        ball_image_key: "bulletTypeA",
        x_speed:100,
        y_speed:800,
        accel_x:0,
        accel_y:0,
        jeak_x:0,
        jeak_y:0,
        ball_shape: "circle", // ★形状タイプ: 'rectangle', 'circle', 'ellipse', 'rhombus', 'cone'(当たり判定)
        bullet_width: 5.0,
        bullet_height: 5.0,
        orientation: 0.0, // 回転数
        color: 'rgba(255, 0, 0, 0.7)',
        damage: 5,
        bulled_life: 1,
        bulled_maxSpeed: 10000,
        bulled_size_mag: 0.5,
        rate:0.3
    },
    [SubBulletEnum.S_BULLET_2]: // 斜め-15度に発射 // 加速無し
    {
        start_x_pos:-5,
        start_y_pos:0,
        ballet_name:"サブウエポン1R",
        ball_image_key: "bulletTypeA",
        x_speed:-100,
        y_speed:800,
        accel_x:0,
        accel_y:0,
        jeak_x:0,
        jeak_y:0,
        ball_shape: "circle", // ★形状タイプ: 'rectangle', 'circle', 'ellipse', 'rhombus', 'cone'(当たり判定)
        bullet_width: 5.0,
        bullet_height: 5.0,
        orientation: 0.0, // 回転数
        color: 'rgb(255, 255, 255)',
        damage: 5,
        bulled_life: 1,
        bulled_maxSpeed: 10000,
        bulled_size_mag: 0.5,
        rate:0.3
    },    
    [SubBulletEnum.S_BULLET_3]: // 斜め-15度に加速しながら発射
    {
        start_x_pos:5,
        start_y_pos:0,
        ballet_name:"サブウエポン2",
        ball_image_key: "bulletTypeA",
        x_speed:10,
        y_speed:0,
        accel_x:3,
        accel_y:0,
        jeak_x:0,
        jeak_y:130,
        ball_shape: "circle", // ★形状タイプ: 'rectangle', 'circle', 'ellipse', 'rhombus', 'cone'(当たり判定)
        bullet_width: 5.0,
        bullet_height: 5.0,
        orientation: 0.0, // 回転数
        color: 'rgb(255, 255, 255)',
        damage: 5,
        bulled_life: 1,
        bulled_maxSpeed: 10000,
        bulled_size_mag: 0.5,
        rate:0.3
    },
    [SubBulletEnum.S_BULLET_4]: // 斜め-15度に加速しながら発射
    {
        start_x_pos:-5,
        start_y_pos:0,
        ballet_name:"サブウエポン2R",
        ball_image_key: "bulletTypeA",
        x_speed:-10,
        y_speed:0,
        accel_x:-3,
        accel_y:0,
        jeak_x:0,
        jeak_y:130,
        ball_shape: "circle", // ★形状タイプ: 'rectangle', 'circle', 'ellipse', 'rhombus', 'cone'(当たり判定)
        bullet_width: 5.0,
        bullet_height: 5.0,
        orientation: 0.0, // 回転数
        color: 'rgb(255, 255, 255)',
        damage: 5,
        bulled_life: 1,
        bulled_maxSpeed: 10000,
        bulled_size_mag: 0.5,
        rate:0.3
    },
    [SubBulletEnum.S_BULLET_5]: // 斜め30度に加速しながら発射
    {
        start_x_pos:5,
        start_y_pos:0,
        ballet_name:"サブウエポン3",
        ball_image_key: "bulletTypeA",
        x_speed:500,
        y_speed:500,
        accel_x:-650,
        accel_y:0,
        jeak_x:0,
        jeak_y:0,
        ball_shape: "circle", // ★形状タイプ: 'rectangle', 'circle', 'ellipse', 'rhombus', 'cone'(当たり判定)
        bullet_width: 5.0,
        bullet_height: 5.0,
        orientation: 0.0, // 回転数
        color: 'rgb(255, 255, 255)',
        damage: 1,
        bulled_life: 1,
        bulled_maxSpeed: 10000,
        bulled_size_mag: 0.5,
        rate:0.1
    },
    [SubBulletEnum.S_BULLET_6]: // 斜め-15度に加速しながら発射
    {
        start_x_pos:-5,
        start_y_pos:0,
        ballet_name:"サブウエポン3R",
        ball_image_key: "bulletTypeA",
        x_speed:-500,
        y_speed:500,
        accel_x:650,
        accel_y:0,
        jeak_x:0,
        jeak_y:0,
        ball_shape: "circle", // ★形状タイプ: 'rectangle', 'circle', 'ellipse', 'rhombus', 'cone'(当たり判定)
        bullet_width: 5.0,
        bullet_height: 5.0,
        orientation: 0.0, // 回転数
        color: 'rgb(255, 255, 255)',
        damage: 1,
        bulled_life: 1,
        bulled_maxSpeed: 10000,
        bulled_size_mag: 0.5,
        rate:0.1
    },[SubBulletEnum.S_BULLET_7]: // 5角形
    {
        start_x_pos:0,
        start_y_pos:200,
        ballet_name:"サブウエポン4",
        ball_image_key: "bulletTypeA",
        x_speed:0,
        y_speed:900,
        accel_x:0,
        accel_y:0,
        jeak_x:0,
        jeak_y:0,
        ball_shape: "circle", // ★形状タイプ: 'rectangle', 'circle', 'ellipse', 'rhombus', 'cone'(当たり判定)
        bullet_width: 3.0,
        bullet_height: 3.0,
        orientation: 0.0, // 回転数
        color: 'rgb(255, 255, 255)',
        damage: 1,
        bulled_life: 1,
        bulled_maxSpeed: 10000,
        bulled_size_mag: 0.5,
        rate:0.1
    },[SubBulletEnum.S_BULLET_8]: // 5角形
    {
        start_x_pos: 95.11,
        start_y_pos:130.90,
        ballet_name:"サブウエポン3R",
        ball_image_key: "bulletTypeA",
        x_speed:0,
        y_speed:900,
        accel_x:0,
        accel_y:0,
        jeak_x:0,
        jeak_y:0,
        ball_shape: "circle", // ★形状タイプ: 'rectangle', 'circle', 'ellipse', 'rhombus', 'cone'(当たり判定)
        bullet_width: 3.0,
        bullet_height: 3.0,
        orientation: 0.0, // 回転数
        color: 'rgb(255, 255, 255)',
        damage: 1,
        bulled_life: 1,
        bulled_maxSpeed: 10000,
        bulled_size_mag: 0.5,
        rate:0.1
    },[SubBulletEnum.S_BULLET_9]: // 5角形
    {
        start_x_pos:58.78,
        start_y_pos:20.90,
        ballet_name:"サブウエポン3R",
        ball_image_key: "bulletTypeA",
        x_speed:0,
        y_speed:900,
        accel_x:0,
        accel_y:0,
        jeak_x:0,
        jeak_y:0,
        ball_shape: "circle", // ★形状タイプ: 'rectangle', 'circle', 'ellipse', 'rhombus', 'cone'(当たり判定)
        bullet_width: 3.0,
        bullet_height: 3.0,
        orientation: 0.0, // 回転数
        color: 'rgb(255, 255, 255)',
        damage: 1,
        bulled_life: 1,
        bulled_maxSpeed: 10000,
        bulled_size_mag: 0.5,
        rate:0.1
    },[SubBulletEnum.S_BULLET_10]: // 5角形
    {
        start_x_pos:-58.78,
        start_y_pos:20.90,
        ballet_name:"サブウエポン3R",
        ball_image_key: "bulletTypeA",
        x_speed:0,
        y_speed:900,
        accel_x:0,
        accel_y:0,
        jeak_x:0,
        jeak_y:0,
        ball_shape: "circle", // ★形状タイプ: 'rectangle', 'circle', 'ellipse', 'rhombus', 'cone'(当たり判定)
        bullet_width: 3.0,
        bullet_height: 3.0,
        orientation: 0.0, // 回転数
        color: 'rgb(255, 255, 255)',
        damage: 1,
        bulled_life: 1,
        bulled_maxSpeed: 10000,
        bulled_size_mag: 0.5,
        rate:0.1
    },[SubBulletEnum.S_BULLET_11]: // 5角形
    {
        start_x_pos:-95.11,
        start_y_pos:130.90,
        ballet_name:"サブウエポン3R",
        ball_image_key: "bulletTypeA",
        x_speed:0,
        y_speed:900,
        accel_x:0,
        accel_y:0,
        jeak_x:0,
        jeak_y:0,
        ball_shape: "circle", // ★形状タイプ: 'rectangle', 'circle', 'ellipse', 'rhombus', 'cone'(当たり判定)
        bullet_width: 3.0,
        bullet_height: 3.0,
        orientation: 0.0, // 回転数
        color: 'rgb(255, 255, 255)',
        damage: 1,
        bulled_life: 1,
        bulled_maxSpeed: 10000,
        bulled_size_mag: 0.5,
        rate:0.1
    }


};

// AssetManagerで使う画像パスのリスト
export const imageAssetPaths = Object.freeze({
    avatarTypeA: "image/avatar/avator1.png",
    HitImageTypeA: "image/avatar/HitImage.svg",
    bulletTypeA: "image/canon/cirlce1.svg",
});


// キャラクター情報から作成する
// 一番上から名前
// キャラクター画像
// 表示される中心円の半径(当たり判定っぽいやつ)
// プレイヤーの移動速度
// MaxHP
// スキル1の情報
// ULTの情報
// M通常弾1の情報
// M通常弾2の情報 // ない場合はデフォルト
// S通常弾1の情報
// S通常弾2の情報 // ない場合はデフォルト
// S通常弾3の情報 // ない場合はデフォルト
// S通常弾4の情報 // ない場合はデフォルト
// S通常弾5の情報 // ない場合はデフォルト
export const  character_info_list = {
    [CharacterTypeEnum.NONE]:
    {
        charachter_name:"NONE",
        avatar_image_key:"",
        character_radius:0,
        character_speed:0,
        character_maxhp:0,
        character_mag:0,
        character_skill1: skill_info_list[SkillTypeEnum.NONE],
        character_ULT: ult_info_list[UltTypeEnum.NONE],
        character_m_bullet1: MainBulletEnum.NONE,
        character_m_bullet2: MainBulletEnum.NONE,
        character_s_bullet1: SubBulletEnum.NONE,
        character_s_bullet2: SubBulletEnum.NONE,
        character_s_bullet3: SubBulletEnum.NONE,
        character_s_bullet4: SubBulletEnum.NONE,
        character_s_bullet5: SubBulletEnum.NONE
    },
    [CharacterTypeEnum.TYPE_1]:
    {
        charachter_name:"タイプ1",
        avatar_image_key:"avatarTypeA",
        sprite_base_draw_width: 40,      // アバターの (ピクセル)
        sprite_base_draw_height: 40,     // アバターの (ピクセル)
        hitpoint_image_key: "HitImageTypeA", // ヒットポイントの画像
        hitpoint_radius:8.0,

        character_spped:50,
        character_maxhp:100,
        character_mag:0.5,
        character_skill1: skill_info_list[SkillTypeEnum.skill_Type1],
        character_ULT: ult_info_list[UltTypeEnum.ult_Type1],
        character_m_bullet1: MainBulletEnum.M_BULLET_1,
        character_m_bullet2: MainBulletEnum.NONE,
        character_s_bullet1: SubBulletEnum.S_BULLET_1,
        character_s_bullet2: SubBulletEnum.S_BULLET_2,
        character_s_bullet3: SubBulletEnum.NONE,
        character_s_bullet4: SubBulletEnum.NONE,
        character_s_bullet5: SubBulletEnum.NONE
    },
    [CharacterTypeEnum.TYPE_2]:
    {
        charachter_name:"タイプ2",
        avatar_image_key:"avatarTypeA",
        sprite_base_draw_width: 40,      // アバターの (ピクセル)
        sprite_base_draw_height: 40,     // アバターの (ピクセル)
        hitpoint_image_key: "HitImageTypeA", // ヒットポイントの画像
        hitpoint_radius:8.0,

        character_spped:50,
        character_maxhp:100,
        character_mag:0.5,
        character_skill1: skill_info_list[SkillTypeEnum.skill_Type1],
        character_ULT: ult_info_list[UltTypeEnum.ult_Type1],
        character_m_bullet1: MainBulletEnum.M_BULLET_1,
        character_m_bullet2: MainBulletEnum.NONE,
        character_s_bullet1: SubBulletEnum.S_BULLET_3,
        character_s_bullet2: SubBulletEnum.S_BULLET_4,
        character_s_bullet3: SubBulletEnum.NONE,
        character_s_bullet4: SubBulletEnum.NONE,
        character_s_bullet5: SubBulletEnum.NONE
    },
    [CharacterTypeEnum.TYPE_3]:
    {
        charachter_name:"タイプ3",
        avatar_image_key:"avatarTypeA",
        sprite_base_draw_width: 40,      // アバターの (ピクセル)
        sprite_base_draw_height: 40,     // アバターの (ピクセル)
        hitpoint_image_key: "HitImageTypeA", // ヒットポイントの画像
        hitpoint_radius:8.0,

        character_spped:50,
        character_maxhp:100,
        character_mag:0.5,
        character_skill1: skill_info_list[SkillTypeEnum.skill_Type1],
        character_ULT: ult_info_list[UltTypeEnum.ult_Type1],
        character_m_bullet1: MainBulletEnum.M_BULLET_1,
        character_m_bullet2: MainBulletEnum.NONE,
        character_s_bullet1: SubBulletEnum.S_BULLET_5,
        character_s_bullet2: SubBulletEnum.S_BULLET_6,
        character_s_bullet3: SubBulletEnum.NONE,
        character_s_bullet4: SubBulletEnum.NONE,
        character_s_bullet5: SubBulletEnum.NONE
    },
    [CharacterTypeEnum.TYPE_4]:
    {
        charachter_name:"タイプ4",
        avatar_image_key:"avatarTypeA",
        sprite_base_draw_width: 40,      // アバターの (ピクセル)
        sprite_base_draw_height: 40,     // アバターの (ピクセル)
        hitpoint_image_key: "HitImageTypeA", // ヒットポイントの画像
        hitpoint_radius:8.0,

        character_spped:50,
        character_maxhp:100,
        character_mag:0.5,
        character_skill1: skill_info_list[SkillTypeEnum.skill_Type1],
        character_ULT: ult_info_list[UltTypeEnum.ult_Type1],
        character_m_bullet1: MainBulletEnum.M_BULLET_2,
        character_m_bullet2: MainBulletEnum.M_BULLET_3,
        character_s_bullet1: SubBulletEnum.NONE,
        character_s_bullet2: SubBulletEnum.NONE,
        character_s_bullet3: SubBulletEnum.NONE,
        character_s_bullet4: SubBulletEnum.NONE,
        character_s_bullet5: SubBulletEnum.NONE
    },
    [CharacterTypeEnum.TYPE_5]:
    {
        charachter_name:"タイプ5",
        avatar_image_key:"avatarTypeA",
        sprite_base_draw_width: 40,      // アバターの (ピクセル)
        sprite_base_draw_height: 40,     // アバターの (ピクセル)
        hitpoint_image_key: "HitImageTypeA", // ヒットポイントの画像
        hitpoint_radius:8.0,

        character_spped:50,
        character_maxhp:100,
        character_mag:0.5,
        character_skill1: skill_info_list[SkillTypeEnum.skill_Type1],
        character_ULT: ult_info_list[UltTypeEnum.ult_Type1],
        character_m_bullet1: MainBulletEnum.NONE,
        character_m_bullet2: MainBulletEnum.NONE,
        character_s_bullet1: SubBulletEnum.S_BULLET_7,
        character_s_bullet2: SubBulletEnum.S_BULLET_8,
        character_s_bullet3: SubBulletEnum.S_BULLET_9,
        character_s_bullet4: SubBulletEnum.S_BULLET_10,
        character_s_bullet5: SubBulletEnum.S_BULLET_11
    }
};


