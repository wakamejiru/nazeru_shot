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

/**
 * 1弾の打ち出しを行う関数
 * @param {number} EnemyBulletList :弾の配列
 * @param {number} CenterX :打ち出し中心位置
 * @param {number} CenterY :打ち出し中心位置
 * @param {number} Opitons :弾の情報
 * @param {Pixi} ScrreenContainer :Pixiコンテナ
 * @param {Pixi} TargetX :打ち出し方向のX座標
 * @param {Pixi} TargetY :打ち出し方向のY座標
 */
export function SingleShotFunc(EnemyBulletList, CenterX, CenterY, Opitons, ScrreenContainer, TargetX, TargetY){
    // 作ったインスタンスをpushする
    let StartPointX = CenterX;
    let StartPointY = CenterY;

    // 速度のベクトルを決定する
    const LengthX = TargetX - StartPointX;  
    const LengthY = TargetY - StartPointY;
    const Distance = Math.sqrt(LengthX*LengthX + LengthY*LengthY);
    const SIN_TARGET = LengthY / Distance;
    const COS_TARGET = LengthX / Distance;
    const NewSpeed = Math.sqrt(Opitons.vx*Opitons.vx + Opitons.vy*Opitons.vy);
    const NewAccel = Math.sqrt(Opitons.ax*Opitons.ax + Opitons.ay*Opitons.ay); 
    const NewJeak = Math.sqrt(Opitons.jx*Opitons.jx + Opitons.jy*Opitons.jy); 
    
    const SpeedX = COS_TARGET * NewSpeed;
    const SpeedY = SIN_TARGET * NewSpeed;
    const AccelX = SIN_TARGET * NewAccel;
    const AccelY = COS_TARGET * NewAccel;
    const JeakX = SIN_TARGET * NewJeak;
    const JeakY = COS_TARGET * NewJeak;


    const bulletOptions = {
        ...Opitons, // 元のオプションをすべてコピー
        vx: SpeedX, // ピクセル/秒
        vy: SpeedY, // ピクセル/秒
        ax: AccelX,
        ay: AccelY,
        jx: JeakX,
        jy: JeakX,
    };

    EnemyBulletList.push(new Bullet(ScrreenContainer, StartPointX, StartPointY, bulletOptions));

}


/**
 * 円状に弾の打ち出しを行う関数
 * @param {number} EnemyBulletList :弾の配列
 * @param {number} CenterX :打ち出し中心位置
 * @param {number} CenterY :打ち出し中心位置
 * @param {number} BulletNumber :弾の数
 * @param {number} StartAngle :開始角度
 * @param {number} Opitons :弾の情報
 * @param {number} EndAngle :終了角度
 * @param {Pixi} ScrreenContainer :Pixiコンテナ
 */
export function RoundShotFunc(EnemyBulletList, CenterX, CenterY, BulletNumber, 
    StartAngle,  Opitons, EndAngle, ScrreenContainer){
    // 作ったインスタンスをpushする
    let StartPointX = CenterX;
    let StartPointY = CenterY;

    // 何度ごとに，射出するかを決める
    const OneStepAngle = (EndAngle - StartAngle)/BulletNumber;
    const FirstAngle = StartAngle;


    for(let i = 0; i < BulletNumber; i++){
        const RadiusAngle = (FirstAngle + (OneStepAngle * i))* Math.PI / 180;
        // 停止条件も変更する必要がある
        // 速度を触る
        const SpeedX = Opitons.vx * Math.cos(RadiusAngle);
        const SpeedY = Opitons.vy * Math.sin(RadiusAngle);
        const BulletAccelX = Opitons.ax * Math.cos(RadiusAngle);
        const BulletAccelY = Opitons.ay * Math.sin(RadiusAngle);
        const BulletJerkX = Opitons.jx * Math.cos(RadiusAngle);
        const BulletJerkY = Opitons.jy * Math.sin(RadiusAngle);
        
            const bulletOptions = {
                vx: SpeedX, // ピクセル/秒
                vy: SpeedY, // ピクセル/秒
                ax: BulletAccelX,
                ay: BulletAccelY,
                jx: BulletJerkX,
                jy: BulletJerkY,


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

        EnemyBulletList.push(new Bullet(ScrreenContainer, StartPointX, StartPointY, bulletOptions));

    }
}

/**
 * 指定された中心点から扇形に弾を発射する関数
 * @param {Array} bulletList - 生成された弾を追加する配列
 * @param {number} originX - 発射の基点X座標 (扇の要)
 * @param {number} originY - 発射の基点Y座標 (扇の要)
 * @param {number} numberOfBullets - 扇の段数による弾の数(徐々に減少もしくは徐々に増大)
 * @param {number} fanSpreadAngleDegrees - 弾数最大値の時の1弾当たりの角度
 * @param {number} fanCenterAngleDegrees - 扇の中心線の角度 (度数法)
 * @param {object} baseBulletOptions - 弾の基本設定オブジェクト。
 * @param {Pixi} ScrreenContainer - Pixiコンテナ
 */
export function FanShotFunc(
    bulletList, 
    originX, 
    originY, 
    numberOfBullets,
    fanSpreadAngleDegrees, 
    fanCenterAngleDegrees, 
    baseBulletOptions, 
    ScrreenContainer
) {
    if (numberOfBullets <= 0) {
        console.warn("FanShotFunc: numberOfBullets must be greater than 0.");
        return;
    }

    const FanSpreadAngleRad = fanSpreadAngleDegrees * Math.PI / 180;
    const FanCenterAngleRad = fanCenterAngleDegrees * Math.PI / 180;

    let FirstBulletAngleRad = FanCenterAngleRad;
    let AngleStepRad = 0;

    if (numberOfBullets === 1) {
        // 弾が1つの場合は、扇の中心方向へ発射
        FirstBulletAngleRad = FanCenterAngleRad;
    } else {
        // 複数の弾の場合、扇状に均等に配置
        FirstBulletAngleRad = FanCenterAngleRad - FanSpreadAngleRad *  numberOfBullets/ 2;

        AngleStepRad = FanSpreadAngleRad;
    }




    for (let i = 0; i < numberOfBullets; i++) {
        const RadiusAngle = FirstBulletAngleRad + (i * AngleStepRad);

        const SpeedX = ChakcUndefined(baseBulletOptions.vx) * Math.cos(RadiusAngle);
        const SpeedY = ChakcUndefined(baseBulletOptions.vy) * Math.sin(RadiusAngle);        
        const BulletAccelX = ChakcUndefined(baseBulletOptions.ax) * Math.cos(RadiusAngle);
        const BulletAccelY = ChakcUndefined(baseBulletOptions.ay) * Math.sin(RadiusAngle);
        const BulletJerkX = ChakcUndefined(baseBulletOptions.jx) * Math.cos(RadiusAngle);
        const BulletJerkY = ChakcUndefined(baseBulletOptions.jy) * Math.sin(RadiusAngle);

        // baseBulletOptions をコピーし、方向と速度、加速度、ジャーク成分を上書き
        const finalBulletOptions = {
            ...baseBulletOptions, // 元のオプションをすべてコピー
            vx: SpeedX,
            vy: SpeedY, // CanvasのY軸は下向きが正なので、sinでそのまま計算してOK
            ax: BulletAccelX,
            ay: BulletAccelY,
            jx: BulletJerkX,
            jy: BulletJerkY,
        };
        bulletList.push(new Bullet(ScrreenContainer, originX, originY, finalBulletOptions));
    }
}


/**
 * 指定された中心点から風車状に弾を発射する関数
 * @param {Array} bulletList - 生成された弾を追加する配列
 * @param {number} centerX - 発射の基点X座標
 * @param {number} centerY - 発射の基点Y座標
 * @param {bool}  ccw true:時計回り false反時計回り
 * @param {number}  WindmillPointRadius 打ち出し半径の長さ
 * @param {number}  WindmillPointRadiusfunc 打ち出し半径の長さの変異処理の関数
 * @param {number}  bulletAngleStart 開始角度(度数法)
 * @param {number}  bulletAngleEnd 終了角度(度数法)
 * @param {number} numberOfBullets - 球の数
 * @param {object} baseBulletOptions - 弾の基本設定オブジェクト。
 * @param {Pixi} ScrreenContainer - アセットマネージャーのインスタンス
 * @param {number} shotCnt - ここの数値をずらしていくことで、発射角度がshitし、風車方になる
 * @param {number} shotAngleSpeed - shotCntにつけるシフト量回転の速度を表す
 */
export function windmillshotfunc(EnemyBulletList, centerX, centerY, ccw, WindmillPointRadius,
    WindmillPointRadiusfunc, bulletAngleStart, bulletAngleEnd, numberOfBullets ,Opitons,
    ScrreenContainer, shotCnt, shotAngleSpeed
){
     // 作ったインスタンスをpushする
    let StartPointX = centerX;
    let StartPointY = centerY;

    let BulletNumber = numberOfBullets;

    // 何度ごとに，射出するかを決める
    const OneStepAngle = (bulletAngleStart - bulletAngleEnd) / BulletNumber;

    const FirstAngle = bulletAngleStart + shotCnt*shotAngleSpeed;

    const StartRoopNumber = (ccw == true)? 0 :  BulletNumber;
    const EndRoopNumber = (ccw == true)? BulletNumber :  0; 
    const ShitRoopNumber = (ccw == true) ? 1 : -1;

    for(let i = StartRoopNumber; i < EndRoopNumber; i+=ShitRoopNumber){
        const RadiusAngle = (FirstAngle + (OneStepAngle * i))* Math.PI / 180;
        // 停止条件も変更する必要がある

        // 打ち出し距離を設定されたRadiusで変化させる
        StartPointX += WindmillPointRadius * Math.cos(RadiusAngle);
        StartPointY += WindmillPointRadius * Math.sin(RadiusAngle);

        // 速度を触る
        const SpeedX = Opitons.x_speed * Math.cos(RadiusAngle);
        const SpeedY = Opitons.y_speed * Math.sin(RadiusAngle);
        const BulletAccelX = Opitons.accel_x * Math.cos(RadiusAngle);
        const BulletAccelY = Opitons.accel_y * Math.sin(RadiusAngle);
        const BulletJerkX = Opitons.jeak_x * Math.cos(RadiusAngle);
        const BulletJerkY = Opitons.jeak_y * Math.sin(RadiusAngle);
// 将来的にかかかそくどまで考慮できるようにする
        // const BulletSnapX = Opitons.snap_Y * Math.sin(RadiusAngle);
        // const BulletSnapY = Opitons.snap_Y * Math.sin(RadiusAngle);
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
        EnemyBulletList.push(new Bullet(ScrreenContainer, StartPointX, StartPointY, bulletOptions));

    }
}

/**
 * 中心から円形に発射される弾
 * @param {Array} EnemyBulletList - 弾の配列
 * @param {number} CenterX - 打ち出し中心位置X
 * @param {number} CenterY - 打ち出し中心位置Y
 * @param {number} BulletNumber - 弾の数
 * @param {number} StartAngle - 開始角度 (度数法)
 * @param {number} EndAngle - 終了角度 (度数法)
 * @param {object} Opitons - 弾の基本設定
 * @param {object} NextOpitons - 移動後の弾の設定
 * @param {number} ActivationSpeed - 挙動が変化する速度
 * @param {PIXI.Container} ScrreenContainer - Pixiコンテナ
 */
export function CircleAndHomeShotFunc(
    EnemyBulletList, 
    CenterX, 
    CenterY, 
    BulletNumber, 
    StartAngle,
    EndAngle,
    Opitons, 
    NextOpitons,
    ActivationLength,
    ScrreenContainer
) {
    let StartPointX = CenterX;
    let StartPointY = CenterY;

    const OneStepAngle = (EndAngle - StartAngle) / BulletNumber;
    const FirstAngle = StartAngle;

    for (let i = 0; i < BulletNumber; i++) {
        const RadiusAngle = (FirstAngle + (OneStepAngle * i)) * Math.PI / 180;
        
        const SpeedX = ChakcUndefined(Opitons.vx) * Math.cos(RadiusAngle);
        const SpeedY = ChakcUndefined(Opitons.vy) * Math.sin(RadiusAngle);        
        const BulletAccelX = ChakcUndefined(Opitons.ax) * Math.cos(RadiusAngle);
        const BulletAccelY = ChakcUndefined(Opitons.ay) * Math.sin(RadiusAngle);
        const BulletJerkX = ChakcUndefined(Opitons.jx) * Math.cos(RadiusAngle);
        const BulletJerkY = ChakcUndefined(Opitons.jy) * Math.sin(RadiusAngle);
        
        // Bulletコンストラクタに渡すオプションを作成
        const bulletOptions = {
            // 基本的な弾の性能
            ...Opitons, // 渡されたOpitonsをすべてコピー

            // 向きと初速を設定
            vx: SpeedX,
            vy: SpeedY,
            ax:BulletAccelX,
            ay:BulletAccelY,
            jx:BulletJerkX,
            jy:BulletJerkY,

            // 挙動変化の条件と、変化後の設定を渡す
            ActivationLength: ActivationLength,
            PostActivationOptions: {
                ...NextOpitons
            },
        };

        EnemyBulletList.push(new Bullet(ScrreenContainer, StartPointX, StartPointY, bulletOptions));
    }
}

// 未定義かどうかを判断する
// 未定義なら0
function ChakcUndefined(Param){
    return Param !== undefined ? Param : 0;
}