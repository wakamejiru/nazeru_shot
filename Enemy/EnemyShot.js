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

/**
 * 指定された中心点から扇形に弾を発射する関数
 * @param {Array} bulletList - 生成された弾を追加する配列
 * @param {number} originX - 発射の基点X座標 (扇の要)
 * @param {number} originY - 発射の基点Y座標 (扇の要)
 * @param {number} numberOfBullets - 扇の段数による弾の数(徐々に減少もしくは徐々に増大)
 * @param {number} fanSpreadAngleDegrees - 扇全体の角度 (度数法)
 * @param {number} fanCenterAngleDegrees - 扇の中心線の角度 (度数法)
 * @param {object} baseBulletOptions - 弾の基本設定オブジェクト。
 * @param {AssetManager} assetManager - アセットマネージャーのインスタンス
 */
export function FanShotFunc(
    bulletList, 
    originX, 
    originY, 
    numberOfBullets,
    fanSpreadAngleDegrees, 
    fanCenterAngleDegrees, 
    baseBulletOptions, 
    assetManager
) {
    if (numberOfBullets <= 0) {
        console.warn("FanShotFunc: numberOfBullets must be greater than 0.");
        return;
    }

    const FanSpreadAngleRad = fanSpreadAngleDegrees * Math.PI / 180;
    const FanCenterAngleRad = fanCenterAngleDegrees * Math.PI / 180;

    let FirstBulletAngleRad = fanCenterAngleDegrees;
    let AngleStepRad = 0;

    if (numberOfBullets === 1) {
        // 弾が1つの場合は、扇の中心方向へ発射
        FirstBulletAngleRad = FanCenterAngleRad;
    } else {
        // 複数の弾の場合、扇状に均等に配置
        FirstBulletAngleRad = FanCenterAngleRad - FanSpreadAngleRad / 2;
        AngleStepRad = FanSpreadAngleRad / (numberOfBullets - 1);
    }

    // baseBulletOptions から速度、加速度、ジャークの「大きさ」を取得
    // x_speed, accel_x, jeak_x をそれぞれの大きさとして利用する想定
    // もし、{ speed: X, accel: Y, jerk: Z } のようなプロパティ名が良い場合は、そちらを参照
    // 速度を高い方向にする


    for (let i = 0; i < numberOfBullets; i++) {
        const currentAngleRad = FirstBulletAngleRad + (i * AngleStepRad);

        const cosAngle = Math.cos(currentAngleRad);
        const sinAngle = Math.sin(currentAngleRad);

        // baseBulletOptions をコピーし、方向と速度、加速度、ジャーク成分を上書き
        const finalBulletOptions = {
            ...baseBulletOptions, // 元のオプションをすべてコピー
            vx: cosAngle * baseBulletOptions.x_speed,
            vy: sinAngle * baseBulletOptions.y_speed, // CanvasのY軸は下向きが正なので、sinでそのまま計算してOK
            ax: cosAngle * baseBulletOptions.accel_x,
            ay: sinAngle * baseBulletOptions.accel_y,
            jx: cosAngle * baseBulletOptions.jeak_x,
            jy: sinAngle * baseBulletOptions.jeak_y,
            
            width: baseBulletOptions.bulletWidht,
            height: baseBulletOptions.bulletheight,
            radius: baseBulletOptions.bulletRadius,
            
            damage: baseBulletOptions.bulletDamage,
            life: baseBulletOptions.bulletHP,
            maxSpeed: baseBulletOptions.bulletMaxSpeed,

            target: baseBulletOptions.playerInstance, // 追尾する場合
            trackingStrength: baseBulletOptions.trackingStrength, // 0なら追尾しない。追尾させる場合は0より大きい値

            // 弾の画像と形状
            BulletImageKey: baseBulletOptions.BulletImageKey,
            shape: baseBulletOptions.shape,
        };
        bulletList.push(new Bullet(originX, originY, assetManager, finalBulletOptions));
    }
}