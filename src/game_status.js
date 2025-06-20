// game_status.js
// ゲーム関連の文字列や，各画像のパスや，キャラクター情報を管理するファイル
// ここで作成したものはキャラ一覧などの情報表示で使用する
// この情報は上書きはしない
// ゲームプレイ中はPlayerクラスでコピーしたものを変異させる

// --- Enums ---
export const CharacterTypeEnum = Object.freeze({
  NONE: "NONE",
  TYPE_1: "Type1",
  TYPE_2: "Type2",
  TYPE_3: "Type3",
  TYPE_4: "Type4",
  TYPE_5: "Type5",
  TYPE_6: "Type6",
  TYPE_7: "Type7",
  TYPE_8: "Type8",
  TYPE_9: "Type9",
  TYPE_10: "Type10",
});

export const SkillTypeEnum = Object.freeze({
  NONE: "NONE", 
  SKILL_1: "skill_1", // 小回復
  SKILL_2: "skill_2", // 追尾
});

export const UltTypeEnum = Object.freeze({
  NONE: "NONE",
  ULT_1: "ult_1", // 一定時間無敵
});

export const PassiveTypeEnum = Object.freeze({
    NONE: "NONE",
    Passive_1: "Passive_1", // 一定時間無敵
  });

export const MainBulletEnum = Object.freeze({
  NONE: "NONE",
  M_BULLET_1: "m_bullet_1", // 通常弾
  M_BULLET_2: "m_bullet_2", // 通常弾
  M_BULLET_3: "m_bullet_3", // 通常弾
  M_BULLET_4: "m_bullet_4", // 通常弾
});

export const SubBulletEnum = Object.freeze({
  NONE: "NONE",
  S_BULLET_1: "s_bullet_1", // サブウェポン
  S_BULLET_2: "s_bullet_2", // サブウェポン2
  S_BULLET_3: "s_bullet_3", // サブウェポン3
  S_BULLET_4: "s_bullet_4", // サブウェポン4
 // S_BULLET_5: "s_bullet_5", // サブウェポン5
  //S_BULLET_6: "s_bullet_6", // サブウェポン5
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
    [MainBulletEnum.M_BULLET_1]: // 3方向に扇形に発射
    {
        bullet_number :3, // バレットの数は3
        Bullet_Angle :30, // バレットの放射角度(R)
        z_bullet_angle_mag: 0.5, // 低速モード時の集中率
        // 半径と設置角度からバレットの放出点を計算することができる        
        bullet_pointAngle: 0, //バレットの設置角度(R)
        bullet_pointRadius: 0, // バレットの設置半径
        z_bullet_pointRadius_mag: 0.5, // 低速モード時の集中率

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

        // --- サインカーブ専用パラメータ ---
        sine_wave_enabled: false,       // この弾でサインカーブを有効にするか
        sine_amplitude: 60,          // 波の振幅 (中心線からの最大ズレ幅、ピクセル単位)
        sine_angular_frequency: Math.PI * 4, // 角周波数 (ラジアン/秒)。値が大きいほど波が細かくなる。
                                        // 例: Math.PI * 4 は1秒間に2周期の波
        sine_phase_offset: 0,      // 位相オフセット (波の開始位置をずらす、ラジアン単位、オプション)
        sine_axis: "x",             // "x" ならX軸方向に揺れる、"y"ならY軸方向に揺れる (オプション)
        sine_decay_rate: 0,                // ★NEW: 減衰率。0なら減衰なし。
    },
    [MainBulletEnum.M_BULLET_2]: // 1方向に主砲が2つ
    {
        bullet_number :2, // バレットの数は3
        Bullet_Angle :0, // バレットの放射角度(R)
        z_bullet_angle_mag: 0, // 低速モード時の集中率
        // 半径と設置角度からバレットの放出点を計算することができる        
        bullet_pointAngle: 0, //バレットの設置角度(R)
        bullet_pointRadius: 200, // バレットの設置半径
        z_bullet_pointRadius_mag: 0.5, // 低速モード時の集中率

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

        // --- サインカーブ専用パラメータ ---
        sine_wave_enabled: false,       // この弾でサインカーブを有効にするか
        sine_amplitude: 60,          // 波の振幅 (中心線からの最大ズレ幅、ピクセル単位)
        sine_angular_frequency: Math.PI * 4, // 角周波数 (ラジアン/秒)。値が大きいほど波が細かくなる。
                                        // 例: Math.PI * 4 は1秒間に2周期の波
        sine_phase_offset: 0,      // 位相オフセット (波の開始位置をずらす、ラジアン単位、オプション)
        sine_axis: "x",             // "x" ならX軸方向に揺れる、"y"ならY軸方向に揺れる (オプション)
        sine_decay_rate: 0,                // ★NEW: 減衰率。0なら減衰なし。
    
    },
    [MainBulletEnum.M_BULLET_3]:
    {
        bullet_number :2, // バレットの数は3
        Bullet_Angle :0, // バレットの放射角度(R)
        z_bullet_angle_mag: 0, // 低速モード時の集中率
        // 半径と設置角度からバレットの放出点を計算することができる        
        bullet_pointAngle: 0, //バレットの設置角度(R)
        bullet_pointRadius: 200, // バレットの設置半径
        z_bullet_pointRadius_mag: 0.5, // 低速モード時の集中率

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

        // --- サインカーブ専用パラメータ ---
        sine_wave_enabled: false,       // この弾でサインカーブを有効にするか
        sine_amplitude: 60,          // 波の振幅 (中心線からの最大ズレ幅、ピクセル単位)
        sine_angular_frequency: Math.PI * 4, // 角周波数 (ラジアン/秒)。値が大きいほど波が細かくなる。
                                        // 例: Math.PI * 4 は1秒間に2周期の波
        sine_phase_offset: 0,      // 位相オフセット (波の開始位置をずらす、ラジアン単位、オプション)
        sine_axis: "x",             // "x" ならX軸方向に揺れる、"y"ならY軸方向に揺れる (オプション)
        sine_decay_rate: 0,                // ★NEW: 減衰率。0なら減衰なし。
    
    },
    [MainBulletEnum.M_BULLET_4]:
    {
        bullet_number :2, // バレットの数は3
        Bullet_Angle :0, // バレットの放射角度(R)
        z_bullet_angle_mag: 0, // 低速モード時の集中率
        // 半径と設置角度からバレットの放出点を計算することができる        
        bullet_pointAngle: 0, //バレットの設置角度(R)
        bullet_pointRadius: 200, // バレットの設置半径
        z_bullet_pointRadius_mag: 0.5, // 低速モード時の集中率

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

        // --- サインカーブ専用パラメータ ---
        sine_wave_enabled: false,       // この弾でサインカーブを有効にするか
        sine_amplitude: 60,          // 波の振幅 (中心線からの最大ズレ幅、ピクセル単位)
        sine_angular_frequency: Math.PI * 4, // 角周波数 (ラジアン/秒)。値が大きいほど波が細かくなる。
                                        // 例: Math.PI * 4 は1秒間に2周期の波
        sine_phase_offset: 0,      // 位相オフセット (波の開始位置をずらす、ラジアン単位、オプション)
        sine_axis: "x",             // "x" ならX軸方向に揺れる、"y"ならY軸方向に揺れる (オプション)
        sine_decay_rate: 0,                // ★NEW: 減衰率。0なら減衰なし。
    
    }
};
  

export const  sub_bulled_info_list = {
    [SubBulletEnum.NONE]:
    {
        // NONEの場合無視

    },
    [SubBulletEnum.S_BULLET_1]: // 斜め15度に発射
    {
        bullet_number :6, // バレットの数は3
        Bullet_Angle :60, // バレットの放射角度(R)
        z_bullet_angle_mag: 0.3, // 低速モード時の集中率
        // 半径と設置角度からバレットの放出点を計算することができる        
        bullet_pointAngle: 0, //バレットの設置角度(R)
        bullet_pointRadius: 0, // バレットの設置半径
        z_bullet_pointRadius_mag: 0.3, // 低速モード時の集中率

        ballet_name:"メインウエポン1",
        ball_image_key: "bulletTypeA",
        ball_shape: "circle", // ★形状タイプ: 'rectangle', 'circle', 'ellipse', 'rhombus', 'cone'(当たり判定)
        bullet_width: 8.0,
        bullet_height: 8.0,
        orientation: 0.0, // 回転数
        x_speed:0,
        y_speed:1200,
        accel_x:0,
        accel_y:0,
        jeak_x:0,
        jeak_y:0,
        color: 'rgb(255, 255, 255)',
        damage: 5,
        bulled_life: 3,
        bulled_maxSpeed: 10000,
        rate:0.2,

        // --- サインカーブ専用パラメータ ---
        sine_wave_enabled: false,       // この弾でサインカーブを有効にするか
        sine_amplitude: 60,          // 波の振幅 (中心線からの最大ズレ幅、ピクセル単位)
        sine_angular_frequency: Math.PI * 4, // 角周波数 (ラジアン/秒)。値が大きいほど波が細かくなる。
                                        // 例: Math.PI * 4 は1秒間に2周期の波
        sine_phase_offset: 0,      // 位相オフセット (波の開始位置をずらす、ラジアン単位、オプション)
        sine_axis: "x",             // "x" ならX軸方向に揺れる、"y"ならY軸方向に揺れる (オプション)
        sine_decay_rate: 0,                // ★NEW: 減衰率。0なら減衰なし。
    
    },
    [SubBulletEnum.S_BULLET_2]: // 5方向から発射
    {
        bullet_number :5, // バレットの数は5
        Bullet_Angle :0, // バレットの放射角度(R)
        z_bullet_angle_mag: 0, // 低速モード時の集中率
        // 半径と設置角度からバレットの放出点を計算することができる        
        bullet_pointAngle: 54, //バレットの設置角度(R)
        bullet_pointRadius: 250, // バレットの設置半径
        z_bullet_pointRadius_mag: 0.5, // 低速モード時の集中率

        ballet_name:"メインウエポン1",
        ball_image_key: "bulletTypeA",
        ball_shape: "circle", // ★形状タイプ: 'rectangle', 'circle', 'ellipse', 'rhombus', 'cone'(当たり判定)
        bullet_width: 8.0,
        bullet_height: 8.0,
        orientation: 0.0, // 回転数
        x_speed:0,
        y_speed:1200,
        accel_x:0,
        accel_y:0,
        jeak_x:0,
        jeak_y:0,
        color: 'rgb(255, 255, 255)',
        damage: 5,
        bulled_life: 3,
        bulled_maxSpeed: 10000,
        rate:0.2,

        // --- サインカーブ専用パラメータ ---
        sine_wave_enabled: false,       // この弾でサインカーブを有効にするか
        sine_amplitude: 60,          // 波の振幅 (中心線からの最大ズレ幅、ピクセル単位)
        sine_angular_frequency: Math.PI * 4, // 角周波数 (ラジアン/秒)。値が大きいほど波が細かくなる。
                                        // 例: Math.PI * 4 は1秒間に2周期の波
        sine_phase_offset: 0,      // 位相オフセット (波の開始位置をずらす、ラジアン単位、オプション)
        sine_axis: "x",             // "x" ならX軸方向に揺れる、"y"ならY軸方向に揺れる (オプション)
        sine_decay_rate: 0,                // ★NEW: 減衰率。0なら減衰なし。
    
    },    
    [SubBulletEnum.S_BULLET_3]: // 外側に向かって発射
    {
        bullet_number :5, // バレットの数は5
        Bullet_Angle :72, // バレットの放射角度(R)
        z_bullet_angle_mag: 0, // 低速モード時の集中率
        // 半径と設置角度からバレットの放出点を計算することができる        
        bullet_pointAngle: 0, //バレットの設置角度(R)
        bullet_pointRadius: 150, // バレットの設置半径
        z_bullet_pointRadius_mag: 0.5, // 低速モード時の集中率

        ballet_name:"メインウエポン1",
        ball_image_key: "bulletTypeA",
        ball_shape: "circle", // ★形状タイプ: 'rectangle', 'circle', 'ellipse', 'rhombus', 'cone'(当たり判定)
        bullet_width: 8.0,
        bullet_height: 8.0,
        orientation: 0.0, // 回転数
        x_speed:0,
        y_speed:1200,
        accel_x:0,
        accel_y:0,
        jeak_x:0,
        jeak_y:0,
        color: 'rgb(255, 255, 255)',
        damage: 5,
        bulled_life: 3,
        bulled_maxSpeed: 10000,
        rate:0.2,

        // --- サインカーブ専用パラメータ ---
        sine_wave_enabled: false,       // この弾でサインカーブを有効にするか
        sine_amplitude: 60,          // 波の振幅 (中心線からの最大ズレ幅、ピクセル単位)
        sine_angular_frequency: Math.PI * 4, // 角周波数 (ラジアン/秒)。値が大きいほど波が細かくなる。
                                        // 例: Math.PI * 4 は1秒間に2周期の波
        sine_phase_offset: 0,      // 位相オフセット (波の開始位置をずらす、ラジアン単位、オプション)
        sine_axis: "x",             // "x" ならX軸方向に揺れる、"y"ならY軸方向に揺れる (オプション)
        sine_decay_rate: 0,                // ★NEW: 減衰率。0なら減衰なし。
    
    },
    [SubBulletEnum.S_BULLET_4]: // 外側に向かって発射
    {
        ullet_number :6, // バレットの数は5
        Bullet_Angle :72, // バレットの放射角度(R)
        z_bullet_angle_mag: 0, // 低速モード時の集中率
        // 半径と設置角度からバレットの放出点を計算することができる        
        bullet_pointAngle: 0, //バレットの設置角度(R)
        bullet_pointRadius: 150, // バレットの設置半径
        z_bullet_pointRadius_mag: 0.5, // 低速モード時の集中率

        ballet_name:"メインウエポン1",
        ball_image_key: "bulletTypeA",
        ball_shape: "circle", // ★形状タイプ: 'rectangle', 'circle', 'ellipse', 'rhombus', 'cone'(当たり判定)
        bullet_width: 8.0,
        bullet_height: 8.0,
        orientation: 0.0, // 回転数
        x_speed:0,
        y_speed:1200,
        accel_x:0,
        accel_y:0,
        jeak_x:0,
        jeak_y:0,
        color: 'rgb(255, 255, 255)',
        damage: 5,
        bulled_life: 3,
        bulled_maxSpeed: 10000,
        rate:0.2,

        // --- サインカーブ専用パラメータ ---
        sine_wave_enabled: false,       // この弾でサインカーブを有効にするか
        sine_amplitude: 60,          // 波の振幅 (中心線からの最大ズレ幅、ピクセル単位)
        sine_angular_frequency: Math.PI * 4, // 角周波数 (ラジアン/秒)。値が大きいほど波が細かくなる。
                                        // 例: Math.PI * 4 は1秒間に2周期の波
        sine_phase_offset: 0,      // 位相オフセット (波の開始位置をずらす、ラジアン単位、オプション)
        sine_axis: "x",             // "x" ならX軸方向に揺れる、"y"ならY軸方向に揺れる (オプション)
        sine_decay_rate: 0,                // ★NEW: 減衰率。0なら減衰なし。
    
    },


};

// AssetManagerで使う画像パスのリスト
export const ImageAssetPaths = Object.freeze({
  AvatarTypeA:  "../image/avatar/avator1.png",
  HitImageTypeA: "../image/avatar/HitImage.svg",
  BulletTypeA: "../image/canon/cirlce1.svg",
  EnemyTypeA: "../image/enemy/Enemy1.png",
  infomationImage: "../image/logo/infomation_image.png",
  waitingImage: "../image/wating/waiting_image.png",
  loadingFrame1: "../image/load/load_frame_0001.png",
  loadingFrame2: "../image/load/load_frame_0002.png",
  loadingFrame3: "../image/load/load_frame_0003.png",
  loadingFrame4: "../image/load/load_frame_0004.png",
  loadingFrame5: "../image/load/load_frame_0005.png",
  loadingFrame6: "../image/load/load_frame_0006.png",
  loadingFrame7: "../image/load/load_frame_0007.png",
  loadingFrame8: "../image/load/load_frame_0008.png",
  loadingFrame9: "../image/load/load_frame_0009.png",
  loadingFrame10: "../image/load/load_frame_0010.png",
  loadingFrame11: "../image/load/load_frame_0011.png",
  loadingFrame12: "../image/load/load_frame_0012.png",
  loadingFrame13: "../image/load/load_frame_0013.png",
  loadingFrame14: "../image/load/load_frame_0014.png",
  loadingFrame15: "../image/load/load_frame_0015.png",
  loadingFrame16: "../image/load/load_frame_0016.png",
  loadingFrame17: "../image/load/load_frame_0017.png",
  loadingFrame18: "../image/load/load_frame_0018.png",
  loadingFrame19: "../image/load/load_frame_0019.png",
  loadingFrame20: "../image/load/load_frame_0020.png",
  loadingFrame21: "../image/load/load_frame_0021.png",
  loadingFrame22: "../image/load/load_frame_0022.png",
  loadingFrame23: "../image/load/load_frame_0023.png",
  loadingFrame24: "../image/load/load_frame_0024.png",
  loadingFrame25: "../image/load/load_frame_0025.png",
  loadingFrame26: "../image/load/load_frame_0026.png",
  loadingFrame27: "../image/load/load_frame_0027.png",
  loadingFrame28: "../image/load/load_frame_0028.png",
  loadingFrame29: "../image/load/load_frame_0029.png",
  loadingFrame30: "../image/load/load_frame_0030.png",
  loadingFrame31: "../image/load/load_frame_0031.png",
  loadingFrame32: "../image/load/load_frame_0032.png",
  loadingFrame33: "../image/load/load_frame_0033.png",
  loadingFrame34: "../image/load/load_frame_0034.png",
  loadingFrame35: "../image/load/load_frame_0035.png",
  loadingFrame36: "../image/load/load_frame_0036.png",
  loadingFrame37: "../image/load/load_frame_0037.png",
  loadingFrame38: "../image/load/load_frame_0038.png",
  loadingFrame39: "../image/load/load_frame_0039.png",
  loadingFrame40: "../image/load/load_frame_0040.png",
  loadingFrame41: "../image/load/load_frame_0041.png",
  loadingFrame42: "../image/load/load_frame_0042.png",
  loadingFrame43: "../image/load/load_frame_0043.png",
  loadingFrame44: "../image/load/load_frame_0044.png",
  loadingFrame45: "../image/load/load_frame_0045.png",
  loadingFrame46: "../image/load/load_frame_0046.png",
  loadingFrame47: "../image/load/load_frame_0047.png",
  loadingFrame48: "../image/load/load_frame_0048.png",
  loadingFrame49: "../image/load/load_frame_0049.png",
  loadingFrame50: "../image/load/load_frame_0050.png",
  loadingFrame51: "../image/load/load_frame_0051.png",
    logoFrame1: "../image/logo/logo_anime_0001.png",
  logoFrame2: "../image/logo/logo_anime_0002.png",
  logoFrame3: "../image/logo/logo_anime_0003.png",
  logoFrame4: "../image/logo/logo_anime_0004.png",
  logoFrame5: "../image/logo/logo_anime_0005.png",
  logoFrame6: "../image/logo/logo_anime_0006.png",
  logoFrame7: "../image/logo/logo_anime_0007.png",
  logoFrame8: "../image/logo/logo_anime_0008.png",
  logoFrame9: "../image/logo/logo_anime_0009.png",
  logoFrame10: "../image/logo/logo_anime_0010.png",
  logoFrame11: "../image/logo/logo_anime_0011.png",
  logoFrame12: "../image/logo/logo_anime_0012.png",
  logoFrame13: "../image/logo/logo_anime_0013.png",
  logoFrame14: "../image/logo/logo_anime_0014.png",
  logoFrame15: "../image/logo/logo_anime_0015.png",
  logoFrame16: "../image/logo/logo_anime_0016.png",
  logoFrame17: "../image/logo/logo_anime_0017.png",
  logoFrame18: "../image/logo/logo_anime_0018.png",
  logoFrame19: "../image/logo/logo_anime_0019.png",
  logoFrame20: "../image/logo/logo_anime_0020.png",
  logoFrame21: "../image/logo/logo_anime_0021.png",
  logoFrame22: "../image/logo/logo_anime_0022.png",
  logoFrame23: "../image/logo/logo_anime_0023.png",
  logoFrame24: "../image/logo/logo_anime_0024.png",
  logoFrame25: "../image/logo/logo_anime_0025.png",
  logoFrame26: "../image/logo/logo_anime_0026.png",
  logoFrame27: "../image/logo/logo_anime_0027.png",
  logoFrame28: "../image/logo/logo_anime_0028.png",
  logoFrame29: "../image/logo/logo_anime_0029.png",
  logoFrame30: "../image/logo/logo_anime_0030.png",
  logoFrame31: "../image/logo/logo_anime_0031.png",
  logoFrame32: "../image/logo/logo_anime_0032.png",
  logoFrame33: "../image/logo/logo_anime_0033.png",
  logoFrame34: "../image/logo/logo_anime_0034.png",
  logoFrame35: "../image/logo/logo_anime_0035.png",
  logoFrame36: "../image/logo/logo_anime_0036.png",
  logoFrame37: "../image/logo/logo_anime_0037.png",
  logoFrame38: "../image/logo/logo_anime_0038.png",
  logoFrame39: "../image/logo/logo_anime_0039.png",
  logoFrame40: "../image/logo/logo_anime_0040.png",
  logoFrame41: "../image/logo/logo_anime_0041.png",
  logoFrame42: "../image/logo/logo_anime_0042.png",
  logoFrame43: "../image/logo/logo_anime_0043.png",
  logoFrame44: "../image/logo/logo_anime_0044.png",
  logoFrame45: "../image/logo/logo_anime_0045.png",
  logoFrame46: "../image/logo/logo_anime_0046.png",
  logoFrame47: "../image/logo/logo_anime_0047.png",
  logoFrame48: "../image/logo/logo_anime_0048.png",
  logoFrame49: "../image/logo/logo_anime_0049.png",
  logoFrame50: "../image/logo/logo_anime_0050.png",
  logoFrame51: "../image/logo/logo_anime_0051.png",
  logoFrame52: "../image/logo/logo_anime_0052.png",
  logoFrame53: "../image/logo/logo_anime_0053.png",
  logoFrame54: "../image/logo/logo_anime_0054.png",
  logoFrame55: "../image/logo/logo_anime_0055.png",
  logoFrame56: "../image/logo/logo_anime_0056.png",
  logoFrame57: "../image/logo/logo_anime_0057.png",
  logoFrame58: "../image/logo/logo_anime_0058.png",
  logoFrame59: "../image/logo/logo_anime_0059.png",
  logoFrame60: "../image/logo/logo_anime_0060.png",
  logoFrame61: "../image/logo/logo_anime_0061.png",
  logoFrame62: "../image/logo/logo_anime_0062.png",
  logoFrame63: "../image/logo/logo_anime_0063.png",
  logoFrame64: "../image/logo/logo_anime_0064.png",
  logoFrame65: "../image/logo/logo_anime_0065.png",
  logoFrame66: "../image/logo/logo_anime_0066.png",
  logoFrame67: "../image/logo/logo_anime_0067.png",
  logoFrame68: "../image/logo/logo_anime_0068.png",
  logoFrame69: "../image/logo/logo_anime_0069.png",
  logoFrame70: "../image/logo/logo_anime_0070.png",
  logoFrame71: "../image/logo/logo_anime_0071.png",
  logoFrame72: "../image/logo/logo_anime_0072.png",
  logoFrame73: "../image/logo/logo_anime_0073.png",
  logoFrame74: "../image/logo/logo_anime_0074.png",
  logoFrame75: "../image/logo/logo_anime_0075.png",
  logoFrame76: "../image/logo/logo_anime_0076.png",
  logoFrame77: "../image/logo/logo_anime_0077.png",
  logoFrame78: "../image/logo/logo_anime_0078.png",
  logoFrame79: "../image/logo/logo_anime_0079.png",
  logoFrame80: "../image/logo/logo_anime_0080.png",
  logoFrame81: "../image/logo/logo_anime_0081.png",
  logoFrame82: "../image/logo/logo_anime_0082.png",
  logoFrame83: "../image/logo/logo_anime_0083.png",
  logoFrame84: "../image/logo/logo_anime_0084.png",
  logoFrame85: "../image/logo/logo_anime_0085.png",

  titleImageBg: "../image/title/title_image_bg.png",
  gameLogo: "../image/title/gamelogo.png",
  iconImage1: "../image/icon/chevron_right_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.svg",
  MapImage: "../image/map/map_backscreen.jpg",
  MapBgScreen: "../image/map/MapBG.png",
  CharaSelect1: "../image/chara_select/chara1.png",
  CharaSelect2: "../image/chara_select/chara2.png",
  CharaSelect3: "../image/chara_select/chara3.png",
  CharaSelect4: "../image/chara_select/chara4.png",
  CharaSelect5: "../image/chara_select/chara5.png",
  CharaSelect6: "../image/chara_select/chara6.png",
  CharaSelect7: "../image/chara_select/chara7.png",
  CharaSelect8: "../image/chara_select/chara8.png",
  CharaSelect9: "../image/chara_select/chara9.png",
  CharaSelect10: "../image/chara_select/chara10.png",
  CharaBgScreen: "../image/chara_select/chara_image_bg.png",
  InfomationBgScreen1: "../image/chara_select/InfomationBgScreen1.jpg",
  InfomationBgScreen2: "../image/chara_select/InfomationBgScreen2.jpg",
  ArrowImageDown: "../image/chara_select/ArrowDown.png",
  ArrowImageUp: "../image/chara_select/ArrowUp.png",
  GameBgScreen: "../image/game/game_image_bg.png",
  ShootingScreen: "../image/game/shooting_bg.jpg",
  LogoImage: "../image/game/gamelogo.png",
  ULTBgImg: "../image/game/ult_bg.jpg",
  ScoreBgImg: "../image/game/score_bg.jpg",
  ULTPointImageOn: "../image/game/ult_point_on.png",
  ULTPointImageOff: "../image/game/ult_point_off.png",
});

// 再生する音声ファイルのリスト
export const  MusicOrVoicePaths = Object.freeze({
    imfomation: '../music/logo/infomation/infomation.mp3',
    logo: "../music/logo/infomation/logo.mp3",
    system45: "../music/system/system45.mp3"
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
        avatar_image_key:"AvatarTypeA",
        sprite_base_draw_width: 40,      // アバターの (ピクセル)
        sprite_base_draw_height: 40,     // アバターの (ピクセル)
        hitpoint_image_key: "HitImageTypeA", // ヒットポイントの画像
        hitpoint_radius:8.0,

        character_speed:200,
        character_maxhp:100,
        character_mag:0.5,
        character_skill1: skill_info_list[SkillTypeEnum.SKILL_1],
        character_skill2: skill_info_list[SkillTypeEnum.SKILL_2],
        character_ULT: ult_info_list[UltTypeEnum.ULT_1],
        character_m_bullet: MainBulletEnum.M_BULLET_1,
        character_s_bullet: SubBulletEnum.S_BULLET_1,
    },
    [CharacterTypeEnum.TYPE_2]:
    {
        charachter_name:"タイプ2",
        avatar_image_key:"AvatarTypeA",
        sprite_base_draw_width: 40,      // アバターの (ピクセル)
        sprite_base_draw_height: 40,     // アバターの (ピクセル)
        hitpoint_image_key: "HitImageTypeA", // ヒットポイントの画像
        hitpoint_radius:8.0,

        character_spped:50,
        character_maxhp:100,
        character_mag:0.5,
        character_skill1: skill_info_list[SkillTypeEnum.skill_Type1],
        character_skill2: skill_info_list[SkillTypeEnum.SKILL_2],
        character_ULT: ult_info_list[UltTypeEnum.ult_Type1],
        character_m_bullet1: MainBulletEnum.M_BULLET_1,
        character_m_bullet2: MainBulletEnum.NONE,
        character_s_bullet1: SubBulletEnum.S_BULLET_3,
        character_s_bullet2: SubBulletEnum.S_BULLET_4,
        character_m_bullet: MainBulletEnum.M_BULLET_1,
        character_s_bullet: SubBulletEnum.S_BULLET_1,
    },
    
};


// 敵enemyの宣言を行う

// --- Enums ---
export const EnemyTypeEnum = Object.freeze({
  NONE: "NONE",
  E_TYPE_1: "Type1",
  E_TYPE_2: "Type2",
  E_TYPE_3: "Type3",
  E_TYPE_4: "Type4",
  E_TYPE_5: "Type5",
  E_TYPE_6: "Type6",
  E_TYPE_7: "Type7",
  E_TYPE_8: "Type8",
  E_TYPE_9: "Type9",
});

export const EnemySkillTypeEnum = Object.freeze({
  NONE: "NONE", 
  E_SKILL_1: "skill_1",
  E_SKILL_2: "skill_2",
  E_SKILL_3: "skill_3",
  E_SKILL_4: "skill_4",
  E_SKILL_5: "skill_5",
  E_SKILL_6: "skill_6",
  E_SKILL_7: "skill_7",
  E_SKILL_8: "skill_8",
  E_SKILL_9: "skill_9",
  E_SKILL_10: "skill_10",
  E_SKILL_11: "skill_11",
  E_SKILL_12: "skill_12",
  E_SKILL_13: "skill_13",
  E_SKILL_14: "skill_14",
  E_SKILL_15: "skill_15",
});

export const EnemyUltTypeEnum = Object.freeze({
  NONE: "NONE",
  E_ULT_1: "ult_1", // 一定時間無敵
});

// エネミーのスキルリストを作成する
// そのキャラが度のスキルを何個所持しているかを書く
// そのスキルの威力や動作は他の部分で記述するので、書かない
export const enemys_skill_list =
{
    [EnemyTypeEnum.NONE]:
    {
        skill1: EnemySkillTypeEnum.NONE
    }, [EnemyTypeEnum.E_TYPE_1]:
    {
        skill1: EnemySkillTypeEnum.E_SKILL_1,
        skill2: EnemySkillTypeEnum.E_SKILL_2,
        skill3: EnemySkillTypeEnum.E_SKILL_3,
        skill4: EnemySkillTypeEnum.E_SKILL_4,
        skill5: EnemySkillTypeEnum.E_SKILL_5,
        skill1: EnemySkillTypeEnum.E_SKILL_1,
        skill2: EnemySkillTypeEnum.E_SKILL_2,
        skill3: EnemySkillTypeEnum.E_SKILL_3,
        skill4: EnemySkillTypeEnum.E_SKILL_4,
        skill5: EnemySkillTypeEnum.E_SKILL_5,
    }

}

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
export const  enemy_info_list = {
    [EnemyTypeEnum.NONE]:
    {
        enemy_name:"NONE",
    },
    [EnemyTypeEnum.E_TYPE_1]:
    {
        enemy_name:"ENEMY1",
        enemy_image_key:"EnemyTypeA",
        enemy_hitpoint_radius:100,
        enemy_width:150,
        enemy_height:180,
        enemy_speed:100,
        enemy_maxhp:200000,
        enemy_mag:0,
        e_ult_type: EnemyUltTypeEnum.E_ULT_1,
        e_limit_break_point: 0.6, // スペルカード使用タイミング
        move_wait_duration: 2.0,
        next_move_interval: 2.0,
        shooting_phases_number: 5.0, // 攻撃スキルの数
        enemy_hp_guage: 5, // HPゲージ数
        enemy_play_ult: 0.5, // 発狂タイミング
        // 通常攻撃の種類
        attack_variation: 5,
        attack_watingtime:2.0,
    }



}
