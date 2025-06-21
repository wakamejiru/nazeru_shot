// PlayerBase.js
// Playerの規定クラス
// ここから各キャラごとに派生クラスを作成し制御する

// 必要なインポート
import { 
    main_bulled_info_list, 
    sub_bulled_info_list, 
    MainBulletEnum, 
    SubBulletEnum ,
    SkillTypeEnum,
    ImageAssetPaths} from '../game_status.js';
import { Bullet } from '../bullet.js'; // Bulletクラスもインポート

export class PlayerBase {    
    /**
 	 * コンストラクタ
     * @param {CharacterConfig} CharacterConfig -キャラクターの情報
	 * @param {PixiJS Container} GameScreenContainer - ゲーム操作画面のコンテナ
     * @param {number} StartShootingX シューティング画面の設置サイズのXポジション
     * @param {number} StartShootingY シューティング画面の設置サイズのYポジション
     * @param {number} StartShootingWidth シューティング画面の設置サイズの幅
     * @param {number} StartShootingHeight シューティング画面の設置サイズの高さ
	 */
    constructor(GameScreenContainer, StartShootingX, StartShootingY, StartShootingWidth, StartShootingHeight, CharacterConfig) {
        this.x = StartShootingX + StartShootingWidth/2;
        this.y = StartShootingY + StartShootingHeight*0.8;
        this.GameScreenContainer = GameScreenContainer;

        // キャラクターは自分のコンテナを所有しており、そこに描画する
        this.CharacterContainer = new PIXI.Container();
        this.CurrentScaleFactor = 1.0;

        // IDも所有しておく
        this.CharacterTypeID = CharacterConfig.CharacterTypeID;

        // キャラクターの定義を行う
        this.CharacterName = CharacterConfig.charachter_name;
        this.AvatorImageKey = CharacterConfig.avatar_image_key;
    
        // PixeJSを使い画像を追加する
        const CharacterTexture = PIXI.Texture.from(this.AvatorImageKey);
		this.CharacterImage = new PIXI.Sprite(CharacterTexture);
		// 画像のアンカーを設定
      	this.CharacterImage.anchor.set(0.5);// 中心が座標
      	this.CharacterImage.scale.set(this.CurrentScaleFactor); // 初期スケールと画像サイズ調整

		// 画像の位置を調整
      	this.CharacterImage.x = this.x; // 画面の一番左上に合わせる
      	this.CharacterImage.y = this.y;

        this.BaseSpeed = CharacterConfig.character_speed;
        this.NowSpeed = this.BaseSpeed;
        this.SlowMoveFactor = CharacterConfig.slowMoveFactor; // 一律で半分

        this.MaxHP = CharacterConfig.character_maxhp;
        this.NowHP = this.MaxHP;
        
        // スキル/攻撃パターン管理
        this.BasetrackingStrengthPower = 0.0;
        this.trackingStrengthPower =  0.0; // 追尾性能 
        this.CharacterSkillType1 = CharacterConfig.character_skill1;
        this.CharacterSkillType2 = CharacterConfig.character_skill2;
        this.CharacterULTType = CharacterConfig.character_ULT;
        this.PussivSkillKey = CharacterConfig.passiv_skill;

        // 移動用
        this.dx = 0;
        this.dy = 0;

        // 移動時に移動する量(デバフでここを反転する等もあり)
        this.MoveLengthX = 1;
        this.MoveLengthY = 1;

        // 現在のplaySizeもここに書く
        this.NowPlayAreaWidth = StartShootingWidth;
        this.NowPlayAreaHeight = StartShootingHeight;
        this.StartAreaX = StartShootingX;
        this.StartAreaY = StartShootingY;

        // 弾のinfoを引き出す
		this.MainBulletInfo = this.GetBulletInfo(this.MBulletKey, true);
		this.SubBulletInfo = this.GetBulletInfo(this.SBulletKey, false);
        this.MainBulletWaitTime = 0;
        this.SubBulletWaitTime = 0;

        this.GameScreenContainer.addChild(this.CharacterContainer);
    }

    /**
 	 * Bulletのデータをもらう
     * @param {number} BulletKey -弾情報のキー
	 * @param {boolean} IsMainSub - ture:Main false:Sub
	 */
	GetBulletInfo(BulletKey, IsMainSub)
	{
		const BulletDefinition = (IsMainSub) ? main_bulled_info_list[BulletKey] : sub_bulled_info_list[BulletKey];

        if(!BulletKey)
        {
            return null;
        }
		return { ...BulletDefinition };
	}

    /**
 	 * 弾があるかどうかを判断する
     * @return {boolean} true:情報アリ false情報なし
	 */
	isvalidbulled(bullet_info)
	{
		return bullet_info !== null;
	}

    /**
 	 * 大きさを更新する
     * @param {number} NewScaleFactor :新しい画面のスケール
     * @param {number} NewShootingStartX :新しい画面の開始位置
     * @param {number} NewShootingStartY :新しい画面のス開始位置
     * @param {number} NewShootingWidth :新しい画面の幅
     * @param {number} NewShootingHeight :新しい画面の縦の大きさ
	 */
    updateScale(NewScaleFactor, NewShootingStartX, NewShootingStartY, NewShootingWidth, NewShootingHeight) {
        // 古いゲーム画面のサイズをもらう
        const oldEffectiveCanvasWidth =   this.NowPlayAreaWidth;
        const oldEffectiveCanvasHeight =  this.NowPlayAreaHeight;
        const relativeCenterX = this.x / oldEffectiveCanvasWidth;
        const relativeCenterY = this.y / oldEffectiveCanvasHeight;

        this.CurrentScaleFactor = NewScaleFactor;

        // 画像のサイズを合わせる
        this.CharacterImage.scale.set( this.CurrentScaleFactor);



        // 新しいサイズの座標に合わせる
        
        this.x = relativeCenterX * NewShootingWidth;
        this.y = relativeCenterY * NewShootingHeight;
        this.NowPlayAreaWidth = NewShootingWidth; 
        this.NowPlayAreaHeight = NewShootingHeight;
        this.StartAreaX = NewShootingStartX;
        this.StartAreaY = NewShootingStartY;

        // キャラクターの描画位置が範囲外になることを防止する
        this.IsAreaIn();
        
        // Bulletの情報もスケール変更する
        const scalebulletProperties = (BulletInfos, BaseBulletList, BulletKey) => {
            if (!this.isvalidbulled(BulletInfos) || !BulletKey) {
                return;
            }

            const BaseInfo = BaseBulletList[BulletKey];
             if (!BaseInfo) {
                console.warn(`弾の情報がない: ${BulletKey}`);
                return;
            }

            

            BulletInfos.bullet_pointRadius = (BaseInfo.bullet_pointRadius || 0) * this.CurrentScaleFactor;

            BulletInfos.x_speed = (BaseInfo.x_speed || 0) * this.CurrentScaleFactor;
            BulletInfos.y_speed = (BaseInfo.y_speed || 0) * this.CurrentScaleFactor; // Y方向の反転はcreateBulletInstanceで行う
            BulletInfos.accel_x = (BaseInfo.accel_x || 0) * this.CurrentScaleFactor;
            BulletInfos.accel_y = (BaseInfo.accel_y || 0) * this.CurrentScaleFactor; // Y方向の反転はcreateBulletInstanceで行う
            BulletInfos.jeak_x = (BaseInfo.jeak_x || 0) * this.CurrentScaleFactor;
            BulletInfos.jeak_y = (BaseInfo.jeak_y || 0) * this.CurrentScaleFactor;   // Y方向の反転はcreateBulletInstanceで行う
            BulletInfos.bulled_maxSpeed = (BaseInfo.bulled_maxSpeed || 10000) * this.CurrentScaleFactor;
            
            const sizeMultiplier = BaseInfo.bulled_size_mag || 1.0;
            BulletInfos.bullet_width = (BaseInfo.bullet_width || 5) * sizeMultiplier * this.CurrentScaleFactor;
            BulletInfos.bullet_height = (BaseInfo.bullet_height || 5) * sizeMultiplier * this.CurrentScaleFactor;
            BulletInfos.sine_amplitude = (BaseInfo.sine_amplitude || 0) * this.CurrentScaleFactor;
        };

        scalebulletProperties(this.MainBulletInfo, main_bulled_info_list, this.MBulletKey);
        scalebulletProperties(this.SubBulletInfo, sub_bulled_info_list, this.SBulletKey);
    }

    /**
 	 * 移動を行う
     * @param {number} Keys :入力情報
     * @param {number} DeltaTime :経過時間
	 */
    move(Keys, DeltaTime) {
        // 初期化
        this.dx = 0;
        this.dy = 0;
        let CurrentAppliedSpeed = this.NowSpeed;
        // Zキーが押されている時は低速モードで処理を行う
        if (Keys['z']) {
            CurrentAppliedSpeed = this.NowSpeed * this.SlowMoveFactor;
        }
        
        // 現在のキャラクターの上下左右の値を取得する
        const HalfScaledWidth = this.CharacterImage.width / 2;
        const HalfScaledHeight = this.CharacterImage.height / 2;

        // キーの入力により移動させる
        if (Keys.ArrowUp && this.y > HalfScaledHeight){
            this.dy = -this.MoveLengthY;
        }
        else if (Keys.ArrowDown && this.y < this.NowPlayAreaHeight - HalfScaledHeight){
            this.dy = this.MoveLengthY;  
        } 
        if (Keys.ArrowLeft && this.x > HalfScaledWidth){
            this.dx = -this.MoveLengthX;
        }
        else if (Keys.ArrowRight && this.x < this.NowPlayAreaWidth - HalfScaledWidth) {
            this.dx = this.MoveLengthX;
        }
        // 移動距離を計算
        const magnitude = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
        if (magnitude > 0) {
            this.x += (this.dx / magnitude) * CurrentAppliedSpeed * DeltaTime;
            this.y += (this.dy / magnitude) * CurrentAppliedSpeed * DeltaTime;
        }

        // 範囲内に収める
        this.IsAreaIn();
    }

    /**
 	 * 弾の作成を行う
     * @param {number} Keys :現在のキーの入力情報
     * @param {number} PlayerBulletsArray :プレイヤーの放出した弾の配列
     * @param {number} TargetEnemy :敵エネミーの情報
     * @param {number} BulletInfo :弾 の情報
     * @param {number} DeltaTime :現在の経過時間
     * @param {number} NowWaitTime :現在のクール時間タイマ
     * @return {number} 現在のクールタイム時間
	 */
    createBulletInstance(Keys, PlayerBulletsArray, TargetEnemy, BulletInfo, DeltaTime, NowWaitTime)
    {

        // 球のクールタイム計算
        if (NowWaitTime > 0) { // クールダウン中かチェック
            NowWaitTime -= DeltaTime; // クールダウンタイマーを減算
            if (NowWaitTime < 0) NowWaitTime = 0;
            return NowWaitTime;
        }

        // 弾が出る基準点の中心を計算する
        const StartDrawX = this.x;
        const StartDrawY = this.y;
        
        // 各角度を計算する
        // OneThingの角度を計算する

        function getonethingangle(BulletNumber, SettingFullAngle) {
            let OneThingPointRadius = SettingFullAngle / ((BulletNumber == 0) ? 1 : (BulletNumber - 1)); // 0割り防止
            
            // 全周が180度の倍率ではないかつ，偶数本数のときは垂直方向が基準位置にならない
            let StartAngle = 0;
            if ((SettingFullAngle % 180 !== 0) && (BulletNumber %2 !== 0)){
                // 偶数かつ180度方向の場合垂直方向が基準値にならない
                StartAngle = 90 - (Math.floor(BulletNumber/2 - 1) * OneThingPointRadius) - OneThingPointRadius/2 ;
            }
            {
                // 奇数もしくは偶数だけど全周の場合，垂直方向を基準値化できる
                StartAngle = 90 - (Math.floor(BulletNumber/2) * OneThingPointRadius);
            }
            return { OneThingPointRadius, StartAngle};
        }

        // メインの弾から計算する
        const BulletNumber =  BulletInfo.bullet_number;
        // 半径(低速モード時は倍率をかける)
        const BulletPointRadius =  BulletInfo.bullet_pointRadius * ((Keys['z'] == true) ? BulletInfo.z_bullet_pointRadius_mag : 1.0);
        // 一射の角度を計算(ここ再確認)
        const BulletPointAngleFull = BulletInfo.bullet_pointAngle;
        const ResultPointAngle = getonethingangle(BulletNumber, BulletPointAngleFull);
        const OneStepBulletPointAngle = ResultPointAngle.OneThingPointRadius;
        // 最初に書く角度
        const StartPointAngleNumber = ResultPointAngle.StartAngle;

        // 打ち出し角度
        // 打ち出し角度により，横方向の速度を変更する必要がある
        // 基本位置と計算は同じ
        // 一射の角度を計算(ここ再確認)(低速モード時は倍率をかける)
        const ShotBulletAngleFull = BulletInfo.Bullet_Angle * ((Keys["z"] == true) ? BulletInfo.z_bullet_angle_mag : 1.0);
        const ResultShotAngle = getonethingangle(BulletNumber, ShotBulletAngleFull);


        const ShotOneStepBulletAngle = ResultShotAngle.OneThingPointRadius;
        // 最初に書く角度
        const ShotStartAngleNumber = ResultShotAngle.StartAngle;


        // 弾の個数をだけ作成
        for (let i = 0; i < BulletNumber; i++){
            // 打ち出し位置を計算する
            const PointAngleDeg = StartPointAngleNumber + i * OneStepBulletPointAngle;
            const PointAngleRad = PointAngleDeg * Math.PI / 180;
            const StartShiftPosX = BulletPointRadius * Math.cos(PointAngleRad);
            const StartShiftPosY = BulletPointRadius * Math.sin(PointAngleRad);
            const StartPointX = StartDrawX + StartShiftPosX;
            const StartPointY = StartDrawY + StartShiftPosY;

            const ShotAngleDeg = ShotStartAngleNumber + i * ShotOneStepBulletAngle;
            const ShotAngleRad = ShotAngleDeg * Math.PI / 180;
            const ShiftShotXspped = BulletInfo.x_speed + BulletInfo.y_speed * Math.cos(ShotAngleRad);
            const ShiftShotXaccelX = BulletInfo.accel_x + BulletInfo.accel_y * Math.cos(ShotAngleRad);
            const ShiftShotXjeakX = BulletInfo.jeak_x + BulletInfo.jeak_y * Math.cos(ShotAngleRad);
            
            // 上記処理を加速度，加加速度にも行う
            
             const bulletOptions = {
                    vx: ShiftShotXspped,
                    vy: -BulletInfo.y_speed, 
                    ax: ShiftShotXaccelX,
                    ay: -BulletInfo.accel_y,
                    jx: ShiftShotXjeakX,
                    jy: -BulletInfo.jeak_y,
                    BulletImageKey: BulletInfo.ball_image_key,
                    shape: BulletInfo.ball_shape,
                    width: BulletInfo.bullet_width, 
                    height: BulletInfo.bullet_height,
                    orientation: BulletInfo.orientation,
                    color: BulletInfo.color, 
                    damage: BulletInfo.damage, 
                    life: BulletInfo.bulled_life,
                    maxSpeed: BulletInfo.bulled_maxSpeed,
                    target: TargetEnemy, // 追尾する場合
                    trackingStrength: this.trackingStrengthPower, // 0なら追尾しない。追尾させる場合は0より大きい値
                    globalAlpha: 0.9,
                    sine_wave_enabled: BulletInfo.sine_wave_enabled,
                    sine_amplitude: BulletInfo.sine_amplitude,
                    sine_angular_frequency: BulletInfo.sine_angular_frequency,
                    sine_phase_offset: BulletInfo.sine_phase_offset,
                    sine_axis: BulletInfo.sine_axis || "x",
                    sine_decay_rate: BulletInfo.sine_decay_rate,
                };

            // 作ったインスタンスをpushする
            PlayerBulletsArray.push(new Bullet(StartPointX, StartPointY, bulletOptions));
        }

        return BulletInfo.rate; // クールダウン再セット
    }
    
    /**
 	 * 弾の発射を行う
     * @param {number} Keys :現在のキーの入力情報
     * @param {number} PlayerBulletsArray :プレイヤーの放出した弾の配列
     * @param {number} TargetEnemy :敵エネミーの情報
     * @param {number} BulletInfo :弾 の情報
     * @param {number} DeltaTime :現在の経過時間
	 */
    _shoot(Keys, PlayerBulletsArray, TargetEnemy, DeltaTime) {
        // 大体はこちらで設計可能

       
        this.MainBulletWaitTime = this.createBulletInstance(Keys, PlayerBulletsArray, TargetEnemy, this.MainBulletInfo, DeltaTime, this.MainBulletWaitTime);
            
        // サブに対して処理を行う
        this.SubBulletWaitTime = this.createBulletInstance(Keys, PlayerBulletsArray, TargetEnemy, this.SubBulletInfo, DeltaTime, this.SubBulletWaitTime);
                
    }

    /**
 	 * スキルの発動を行う
	 */
    _skillrun()
    {
        // 中身は各クラスで作成する
    }

    /**
 	 * スキル1の発動を行う
	 */
    _skillrun1()
    {
        // 中身は各クラスで作成する
    }

    /**
 	 * スキル2の発動を行う
	 */
    _skillrun2()
    {
        // 中身は各クラスで作成する
    }

    /**
 	 * パッシブスキルの発動
	 */
    _passiveskillrun()
    {

    } 

    /**
 	 * ULTを発動する
	 */
    _playULT(){
        
    }

    /**
 	 * キャラクター情報を取得する
	 */
    _getplayerinfo()
    {
        // キャラクター情報を取得する
        // 中身は各クラスで作成する
    }

    // trueならスキルが有効
    /**
 	 * キャラクター情報を取得する
     * @param {SkillTypeEnum} skilltypekey-スキル情報
     * @return true:あり，false:無し
	 */
    isvalidskill(skilltypekey){
        return (skilltypekey !== SkillTypeEnum.NONE);
    }

	/**
	 * キャラが描画範囲内にあるように調整をする
	 */
    IsAreaIn(){
        const HalfScaledWidth = this.CharacterImage.width / 2;
        const HalfScaledHeight = this.CharacterImage.height / 2;
        this.x = Math.max(this.StartAreaX + HalfScaledWidth, Math.min(this.x + this.StartAreaX, this.StartAreaX + this.CharacterImage.width  - HalfScaledWidth));
        this.y = Math.max(this.StartAreaY + HalfScaledHeight, Math.min(this.StartAreaY + this.y,  this.StartAreaY + this.NowPlayAreaHeight - HalfScaledHeight));
    }
}