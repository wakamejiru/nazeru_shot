// ゲーム関連の文字列や，各画像のパスや，キャラクター情報を管理するファイル

// Player側のクラスを管理する

// AVATERのクラス
// キャラクターネーム
const characters_type_enum = Object.freeze({
  characters_none: "NONE",
  characters_Type1: "Type1",
});

const skill_type_enum = Object.freeze({
  skill_none: "MONE", // NONE 
  skill_Type1: "skill_1", // 回復
});

const ult_type_enum = Object.freeze({
  ult_none: "NONE", // NONE
  ult_Type1: "ult_1", // 一定時間無敵
});

const main_bulled_enum = Object.freeze({
  main_bulled_None: "NONE", // NONE
  main_bulled_Type1: "m_bulled_1", // 通常弾
});

const sub_bulled_enum = Object.freeze({
  sub_bulled_none: "NONE", // NONE
  sub_bulled_Type1: "s_bulled_1", // サブウェポン
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
let character_info_list = {
    "Type1":
    {
        charachter_name:"タイプ1",
        avatar_image_path:"image\avatar\avatar1.svg",
        character_radius:1.0,
        character_spped:50,
        character_maxhp:100,
        character_skill1: skill_info_list[skill_type_enum.skill_Type1],
        character_ULT: ult_info_list[ult_type_enum.ult_Type1],
        character_m_bullet1: main_bulled_info_list[main_bulled_enum.main_bulled_Type1],
        character_m_bullet2: main_bulled_info_list[main_bulled_enum.main_bulled_none],
        character_s_bullet1: sub_bulled_info_list[sub_bulled_enum.sub_bulled_Type1],
        character_s_bullet2: sub_bulled_info_list[sub_bulled_enum.sub_bulled_Type1], 
        character_s_bullet3: sub_bulled_info_list[sub_bulled_enum.sub_bulled_none],
        character_s_bullet4: sub_bulled_info_list[sub_bulled_enum.sub_bulled_none],
        character_s_bullet5: sub_bulled_info_list[sub_bulled_enum.sub_bulled_none]
    }
};


let skill_info_list = {
    "NONE":
    {
        // NONEの場合無視

    },
    "skill_1":
    {
        skill_name:"タイプ1",
        // 効果秒数などをほかのと共通項目はここに書く
    }
};

let ult_info_list = {
    "NONE":
    {
        // NONEの場合無視

    },
    "ult_1":
    {
        skill_name:"タイプ1",
        // 効果秒数などをほかのと共通項目はここに書く

    }
};

// この情報でインスタンスを作るときに左右対称に設置できるようにする(リバースモード)
let main_bulled_info_list = {
    "NONE":
    {
        // NONEの場合無視

    },
    "m_bulled_1":
    {
        skill_name:"メインウエポン1",
        ball_image_path: "image\canon\cirlce1.svg",
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
    }
};
  
// この情報でインスタンスを作るときに左右対称に設置できるようにする(リバースモード)
let sub_bulled_info_list = {
    "NONE":
    {
        // NONEの場合無視

    },
    "s_bulled_1":
    {
        skill_name:"サブウエポン1",
        ball_image_path: "image\canon\cirlce1.svg",
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
    }
};

























// letをつかってプレイヤーを作成する
// 必ず使うときは初期化が必要


