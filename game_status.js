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
  // TYPE_2: "Type2",
});

export const SkillTypeEnum = Object.freeze({
  NONE: "NONE", // タイプミス修正: MONE -> NONE
  SKILL_1: "skill_1", // 回復
});

export const UltTypeEnum = Object.freeze({
  NONE: "NONE",
  ULT_1: "ult_1", // 一定時間無敵
});

export const MainBulletEnum = Object.freeze({
  NONE: "NONE",
  M_BULLET_1: "m_bullet_1", // 通常弾
});

export const SubBulletEnum = Object.freeze({
  NONE: "NONE",
  S_BULLET_1: "s_bullet_1", // サブウェポン
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
        ballet_name:"メインウエポン1",
        ball_image_key: "bulletTypeA",
        x_speed:0,
        y_speed:-2000,
        accel_x:0,
        accel_y:0,
        jeak_x:0,
        jeak_y:0,
        color: 'rgb(255, 255, 255)',
        damage: 25,
        bulled_life: 5,
        bulled_maxSpeed: 10000,
        bulled_size_mag: 1.0,
        rate:2.0
    }
};
  
// この情報でインスタンスを作るときに左右対称に設置できるようにする(リバースモード)
export const  sub_bulled_info_list = {
    [SubBulletEnum.NONE]:
    {
        // NONEの場合無視

    },
    [SubBulletEnum.S_BULLET_1]:
    {
        ballet_name:"サブウエポン1",
        ball_image_key: "bulletTypeA",
        x_speed:100,
        y_speed:-3500,
        accel_x:0,
        accel_y:0,
        jeak_x:0,
        jeak_y:0,
        color: 'rgb(255, 255, 255)',
        damage: 5,
        bulled_life: 1,
        bulled_maxSpeed: 10000,
        bulled_size_mag: 0.5,
        rate:2.0
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
        hitpoint_radius:1.0,

        character_spped:50,
        character_maxhp:100,
        character_mag:0.5,
        character_skill1: skill_info_list[SkillTypeEnum.skill_Type1],
        character_ULT: ult_info_list[UltTypeEnum.ult_Type1],
        character_m_bullet1: MainBulletEnum.M_BULLET_1,
        character_m_bullet2: MainBulletEnum.NONE,
        character_s_bullet1: SubBulletEnum.S_BULLET_1,
        character_s_bullet2: SubBulletEnum.S_BULLET_1, // 左右反転を忘れない
        character_s_bullet3: SubBulletEnum.NONE,
        character_s_bullet4: SubBulletEnum.NONE,
        character_s_bullet5: SubBulletEnum.NONE
    }
};


