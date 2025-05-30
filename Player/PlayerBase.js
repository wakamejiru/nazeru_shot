// PlayerBase.js
// Playerの規定クラス
// ここから各キャラごとに派生クラスを作成し制御する

// 必要なインポート
import { 
    main_bulled_info_list, 
    sub_bulled_info_list, 
    MainBulletEnum, 
    SubBulletEnum } from '../game_status.js';
import { Bullet } from '../bullet.js'; // Bulletクラスもインポート

export class PlayerBase {    
    // コンストラクタ
    constructor(InitialX, InitialY, AssetManager, Canvas, CharacterConfig, NowPlayAreaWidth, NowPlayAreaHeight) {
        this.x = InitialX; //現在のぽじっしょん
        this.y = InitialY;

        this.AssetManager = AssetManager;
        this.Canvas = Canvas;
        this.CurrentScaleFactor = 1.0;

        // IDも所有しておく
        this.CharacterTypeID = CharacterConfig.CharacterTypeID;

        // キャラクターの定義を行う
        this.CharacterName = CharacterConfig.charachter_name;
        this.AvatorImageKey = CharacterConfig.avatar_image_key;
        
        this.SpriteBaseDrawWidth = CharacterConfig.sprite_base_draw_width || 40;
        this.SpriteBaseDrawHeight = CharacterConfig.sprite_base_draw_height || 40;
        
        this.SpriteDrawWidth = this.SpriteBaseDrawWidth;
        this.SpriteDrawHeight = this.SpriteBaseDrawHeight;


        this.HitpointImageKey = CharacterConfig.hitpoint_image_key;
        this.HitpointBaseRadius = CharacterConfig.hitpoint_radius;
        this.HitpointRadius = this.HitpointBaseRadius;

        this.BaseSpeed = CharacterConfig.character_speed;
        this.NowSpeed = this.BaseSpeed;
        this.SlowMoveFactor = CharacterConfig.slowMoveFactor; // 一律で半分

        this.MaxHP = CharacterConfig.character_maxhp;
        this.NowHP = this.MaxHP;
        
        this.SpriteAvator = this.AvatorImageKey ? this.AssetManager.getImage(this.AvatorImageKey) : null;
        this.SpriteHitpoint = this.HitpointImageKey ? this.AssetManager.getImage(this.HitpointImageKey) : null;

        // スキル/攻撃パターン管理

        // 移動用
        this.dx = 0;
        this.dy = 0;

        // 移動時に移動する量(デバフでここを反転する等もあり)
        this.MoveLengthX = 1;
        this.MoveLengthY = 1;

        // 現在のplaySizeもここに書く
        this.NowPlayAreaWidth = NowPlayAreaWidth;
        this.NowPlayAreaHeight = NowPlayAreaHeight;

        // メインの弾とサブの弾のkey
        this.MBulletKey = CharacterConfig.character_m_bullet;
        this.SBulletKey = CharacterConfig.character_s_bullet;
        this.Skill1Key = CharacterConfig.character_skill1;
        this.Skill2Key = CharacterConfig.character_skill2;
        this.PussivSkillKey = CharacterConfig.passiv_skill;
        this.UltKey = CharacterConfig.character_ULT;
        // 弾のinfoを引き出す
		this.MainBulletInfo = this.GetBulletInfo(this.MBulletKey, true);
		this.SubBulletInfo = this.GetBulletInfo(this.SBulletKey, false);
    }

    //  Bulletのデータをもらい受ける
    // IsMainSub ture:Main fa;se:Sub
	GetBulletInfo(BulletKey, IsMainSub)
	{
		const BulletDefinition = (IsMainSub) ? main_bulled_info_list[BulletKey] : sub_bulled_info_list[BulletKey];

        if(!BulletKey)
        {
            return null;
        }

        
		return { ...BulletDefinition };
	}

    // 有効ならtrue
	isvalidbulled(bullet_info)
	{
		return bullet_info !== null;
	}




    // 大きさを変動する，(スキルや，弾の発射以外なら使える)
    // ここで引数にしているのは実際に弾幕部分のゲーム画面のサイズでcanbvasではない
    updateScale(NewScaleFactor, NewCanvas, OldGamePlayerSizeHeight, OldGamePlayerSizeWidth, 
        NewGamePlayerSizeHeight, NewGamePlayerSizeWidth) {
        // 古いゲーム画面のサイズをもらう
        const oldEffectiveCanvasWidth = OldGamePlayerSizeHeight;
        const oldEffectiveCanvasHeight = OldGamePlayerSizeWidth;
        const relativeCenterX = this.x / oldEffectiveCanvasWidth;
        const relativeCenterY = this.y / oldEffectiveCanvasHeight;

        this.CurrentScaleFactor = NewScaleFactor;
        this.Canvas = NewCanvas;

        // 画像のサイズを合わせる
        this.SpriteDrawWidth = this.SpriteBaseDrawWidth * this.CurrentScaleFactor;
        this.SpriteDrawHeight = this.SpriteBaseDrawHeight * this.CurrentScaleFactor;
        this.hitpoint_radius = this.HitpointBaseRadius * this.CurrentScaleFactor;
        this.NowSpeed = this.BaseSpeed * this.CurrentScaleFactor;

        // 新しいサイズの座標に合わせる
        this.x = relativeCenterX * NewGamePlayerSizeWidth;
        this.y = relativeCenterY * NewGamePlayerSizeHeight;
        this.NowPlayAreaHeight = NewGamePlayerSizeHeight;
        this.NowPlayAreaWidth = NewGamePlayerSizeWidth; 


        // 範囲外になることを防止する
        const HalfScaledWidth = this.SpriteDrawWidth / 2;
        const HalfScaledHeight = this.SpriteDrawHeight / 2;
        this.x = Math.max(HalfScaledWidth, Math.min(this.x, NewGamePlayerSizeWidth - HalfScaledWidth));
        this.y = Math.max(HalfScaledHeight, Math.min(this.y, NewGamePlayerSizeHeight - HalfScaledHeight));
        
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

    // 移動を行う
    // 基本的にこの移動関数で行ってもらう．もしキャラ別に移動を書く場合は，派生クラス先で行ってもらう
    move(Keys, DeltaTime) {
        // 初期化
        this.dx = 0;
        this.dy = 0;
        let CurrentAppliedSpeed = this.NowSpeed;
        // Zキーが押されている時は低速モードで処理を行う
        if (Keys.ArrowZ) {
            CurrentAppliedSpeed = this.NowSpeed * this.SlowMoveFactor;
        }
        
        // 現在のキャラクターの上下左右の値を取得する
        const HalfScaledWidth = this.SpriteDrawWidth / 2;
        const HalfScaledHeight = this.SpriteDrawHeight / 2;

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

        // 範囲内であることを確認
        this.x = Math.max(HalfScaledWidth, Math.min(this.x, this.NowPlayAreaWidth - HalfScaledWidth));
        this.y = Math.max(HalfScaledHeight, Math.min(this.y, this.NowPlayAreaHeight - HalfScaledHeight));
    }

    createBulletInstance(Keys, PlayerBulletsArray, TargetEnemy, BulletInfo, CurrentTime, DeltaTime)
    {
        // 弾が出る基準点の中心を計算する
        const StartDrawX = this.x;
        const StartDrawY = this.y;
        

        // メインの弾から計算する
        const BulletNumber =  BulletInfo.bullet_number;
        // 半径(低速モード時は倍率をかける)
        const BulletPointRadius =  BulletInfo.bullet_pointRadius * ((Keys.ArrowZ == true) ? bulletInfos.z_bullet_pointRadius_mag : 1.0);
        // 一射の角度を計算(ここ再確認)
        const BulletPointAngleFull = BulletInfo.bullet_pointAngle;
        const OneStepBulletPointAngle = BulletPointAngleFull / ((BulletNumber == 0) ? 1 : (BulletNumber - 1));
        // 最初に書く角度
        const StartPointAngleNumber = 90 - BulletPointAngleFull / 2;

        // 打ち出し角度
        // 打ち出し角度により，横方向の速度を変更する必要がある
        // 基本位置と計算は同じ
        // 一射の角度を計算(ここ再確認)(低速モード時は倍率をかける)
        const ShotBulletAngleFull = BulletInfo.Bullet_Angle * ((Keys.ArrowZ == true) ? bulletInfos.z_bullet_angle_mag : 1.0);

        const ShotOneStepBulletAngle = ShotBulletAngleFull / ((BulletNumber == 0) ? 1 : (BulletNumber - 1));
        // 最初に書く角度
        const ShotStartAngleNumber = 90 - ShotOneStepBulletAngle / 2;


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
            PlayerBulletsArray.push(new Bullet(StartPointX, StartPointY, this.AssetManager, bulletOptions));
        }
    }
    
    // 攻撃実行のメインロジック
    _shoot(Keys, PlayerBulletsArray, TargetEnemy, CurrentTime, DeltaTime) {
        // 大体はこちらで設計可能

        // メインに対して処理を行う
        this.createBulletInstance(Keys, PlayerBulletsArray, TargetEnemy, this.MainBulletInfo, CurrentTime, DeltaTime);
            
        // サブに対して処理を行う
        //this.createBulletInstance(Keys, PlayerBulletsArray, TargetEnemy, this.SubBulletInfo, CurrentTime, DeltaTime);
                
    }

    // skillの発動の確認を行う
    _skillrun()
    {
        // 中身は各クラスで作成する
    }

    // skill1の発動を行う
    _skillrun1()
    {
        // 中身は各クラスで作成する
    }

    // skill2の発動を行う
    _skillrun2()
    {
        // 中身は各クラスで作成する
    }

    // パッシブスキルの発動
    _passiveskillrun()
    {

    } 

    // ULTを発動する
    _playULT(){
        
    }

    // キャラクター情報を取得する
    _getplayerinfo()
    {
        // キャラクター情報を取得する
        // 中身は各クラスで作成する
    }


    // キャラクターを描画する
    draw(ctx, Keys) {
        // 将来的に左右上下移動時に画像を変える
        // キャラクターの下に魔法陣のような表記を付ける
        const ScaledDrawWidth = this.SpriteDrawWidth;
        const ScaledDrawHeight = this.SpriteDrawHeight;
        const AvatorDrawX = this.x - ScaledDrawWidth / 2;
        const AvatorDrawY = this.y - ScaledDrawHeight / 2;
        if (this.SpriteAvator) {
            ctx.drawImage(this.SpriteAvator, AvatorDrawX, AvatorDrawY, ScaledDrawWidth, ScaledDrawHeight);
        }

        const HitpointDrawRadius = this.HitpointRadius;
        const HitpointDrawX = this.x - HitpointDrawRadius / 2;
        const HitpointDrawY = this.y - HitpointDrawRadius / 2;
        if (this.SpriteHitpoint) { // 低速移動中は表示
             if(Keys.ArrowZ){ 
                ctx.drawImage(this.SpriteHitpoint, HitpointDrawX, HitpointDrawY, 
                    HitpointDrawRadius, HitpointDrawRadius);
             }
        }
    }

    // HPバーを記載する
    drawHpBar(ctx, ScaledHpBarHeight, ScaledPlayerHpBarWidth) {
        const barX = 10 * this.CurrentScaleFactor;
        const barY = this.NowPlayAreaHeight - ScaledHpBarHeight - (10 * this.CurrentScaleFactor);
        const CurrentHpWidth = this.MaxHP > 0 ? (this.NowHP / this.MaxHP) * ScaledPlayerHpBarWidth : 0;

        ctx.fillStyle = 'grey';
        ctx.fillRect(barX, barY, ScaledPlayerHpBarWidth, ScaledHpBarHeight);
        ctx.fillStyle = (this.MaxHP > 0 && this.NowHP / this.MaxHP < 0.3) ? 'red' : 'green';
        ctx.fillRect(barX, barY, CurrentHpWidth > 0 ? CurrentHpWidth : 0, ScaledHpBarHeight);
        ctx.strokeStyle = 'white';
        ctx.strokeRect(barX, barY, ScaledPlayerHpBarWidth, ScaledHpBarHeight);
    }
}