// クラス化せずに淡々と攻撃パターンの関数を作成していく
import { Bullet } from '../bullet.js'; // Bulletクラスもインポート

// 円状に，発出を行う
// 360度方向に対してそれぞれ単純に発出を行う
// 本数
// 開始度
// CenterX,CenterY:開始点
// 欠損パターン(何％落ち)


// 球の入れ方は、初速の角度を渡すパターンと、指定座標に移動させるパターンを用意
// 後者の場合、移動の加速度は設定できるが、終端速度は設定できない(PID制御を用いる)
// 連続してほかの動作を行う、複雑な処理はStateマシンを使って上から指定を行う、
// しかし、量が多くなると厄介なので、一つのenemyに対して利用量を定めるべき

// 停止した時に何秒か待機できるようにする

export function RoundShotFunc(EnemyBulletList, CenterX, CenterY, BulletNumber, 
    StartAngle, DeficitPercent, Opitons, AssetManager){
    // 作ったインスタンスをpushする
    let StartPointX = CenterX;
    let StartPointY = CenterY;

    // 何度ごとに，射出するかを決める
    const OneStepAngle = 360/BulletNumber;
    const FirstAngle = StartAngle;


    for(let i = 0; i < 360; i++){
        const RadiusAngle = (FirstAngle + (OneStepAngle * i))* Math.PI / 180;
        // 停止条件も変更する必要がある



        // 速度を触る
        const SpeedX = Opitons.x_speed * Math.cos(RadiusAngle);
        const SpeedY = Opitons.y_speed * Math.sin(RadiusAngle);
        const BulletAccelX = Opitons.accel_x * Math.cos(RadiusAngle);
        const BulletAccelY = Opitons.accel_y * Math.sin(RadiusAngle);
        const BulletJerkX = Opitons.jeak_x * Math.cos(RadiusAngle);
        const BulletJerkY = Opitons.jeak_y * Math.sin(RadiusAngle);
// 将来的にかかかそくどまで考慮できるようにする
        ///        const BulletSnapX = Opitons.snap_Y * Math.sin(RadiusAngle);
//        const BulletSnapY = Opitons.snap_Y * Math.sin(RadiusAngle);
            const bulletOptions = {
                vx: SpeedX, // ピクセル/秒
                vy: SpeedY, // ピクセル/秒
                // 後で速度を追記







                width: Opitons.bulletWidht,
                height: Opitons.bulletheight,
                radius: Opitons.bulletRadius,
                
                damage: Opitons.bulletDamage,
                life: Opitons.bulletHP,
                maxSpeed: Opitons.bulletMaxSpeed,

                target: Opitons.playerInstance, // 追尾する場合
                trackingStrength: Opitons.trackingStrength, // 0なら追尾しない。追尾させる場合は0より大きい値

                // 弾の画像と形状
                BulletImageKey: Opitons.BulletImageKey,
                shape: Opitons.shape,

            };
        EnemyBulletList.push(new Bullet(StartPointX, StartPointY, AssetManager, bulletOptions));

    }


}