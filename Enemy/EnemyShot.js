// クラス化せずに淡々と攻撃パターンの関数を作成していく
import { Bullet } from '../bullet.js'; // Bulletクラスもインポート

// 円状に，発出を行う
// 360度方向に対してそれぞれ単純に発出を行う
// 本数
// 開始度
// CenterX,CenterY:開始点
// 欠損パターン(何％落ち)

// vx: ShiftShotXspped,
//                     vy: -BulletInfo.y_speed, 
//                     ax: ShiftShotXaccelX,
//                     ay: -BulletInfo.accel_y,
//                     jx: ShiftShotXjeakX,
//                     jy: -BulletInfo.jeak_y,
//                     BulletImageKey: BulletInfo.ball_image_key,
//                     shape: BulletInfo.ball_shape,
//                     width: BulletInfo.bullet_width, 
//                     height: BulletInfo.bullet_height,
//                     orientation: BulletInfo.orientation,
//                     color: BulletInfo.color, 
//                     damage: BulletInfo.damage, 
//                     life: BulletInfo.bulled_life,
//                     maxSpeed: BulletInfo.bulled_maxSpeed,
//                     target: TargetEnemy, // 追尾する場合
//                     trackingStrength: this.trackingStrengthPower, // 0なら追尾しない。追尾させる場合は0より大きい値
//                     globalAlpha: 0.9,
//                     sine_wave_enabled: BulletInfo.sine_wave_enabled,
//                     sine_amplitude: BulletInfo.sine_amplitude,
//                     sine_angular_frequency: BulletInfo.sine_angular_frequency,
//                     sine_phase_offset: BulletInfo.sine_phase_offset,
//                     sine_axis: BulletInfo.sine_axis || "x",
//                     sine_decay_rate: BulletInfo.sine_decay_rate,


// 必要なもの

function RoundShotFunc(CenterX, CenterY, BulletNumber, StartAngle, DeficitPercent, Opitons){
    // 作ったインスタンスをpushする
    StartPointX = CenterX;
    StartPointX = CenterY;

    // 何度ごとに，射出するかを決める
    const OneStepAngle = 360/BulletNumber;
    const FirstAngle = StartAngle;


    for(let i = 0; i < 360; i++){
        const RadiusAngle = (FirstAngle + (OneStepAngle * i))* Math.PI / 180;
        // 停止条件も変更する必要がある


        // 速度を触る
        const SpeedX = Opitons.x_speed * Math.cos(PointAngleRad);
        const SpeedY = Opitons.y_speed * Math.sin(PointAngleRad);


    }



    PlayerBulletsArray.push(new Bullet(StartPointX, StartPointY, this.AssetManager, bulletOptions));

}