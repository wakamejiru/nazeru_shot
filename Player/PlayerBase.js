// PlayerBase.js
// Playerの規定クラス
// ここから各キャラごとに派生クラスを作成し制御する

// 必要なインポート
import { 
    main_bulled_info_list, 
    sub_bulled_info_list, 
    MainBulletEnum, 
    SubBulletEnum } from '../game_status.js';


export class PlayerBase {    
    

    // """charachter_name:"タイプ1",
    //         avatar_image_key:"avatarTypeA",
    //         sprite_base_draw_width: 40,      // アバターの (ピクセル)
    //         sprite_base_draw_height: 40,     // アバターの (ピクセル)
    //         hitpoint_image_key: "HitImageTypeA", // ヒットポイントの画像
    //         hitpoint_radius:8.0,
    
    //         character_spped:50,
    //         character_maxhp:100,
    //         character_mag:0.5,
    //         character_skill1: skill_info_list[SkillTypeEnum.skill_Type1],
    //         character_ULT: ult_info_list[UltTypeEnum.ult_Type1],
    //         character_m_bullet1: MainBulletEnum.M_BULLET_1,
    //         character_m_bullet2: MainBulletEnum.NONE,
    //         character_s_bullet1: SubBulletEnum.S_BULLET_1,
    //         character_s_bullet2: SubBulletEnum.S_BULLET_2,
    //         character_s_bullet3: SubBulletEnum.NONE,
    //         character_s_bullet4: SubBulletEnum.NONE,
    //         character_s_bullet5: SubBulletEnum.NONE
    //         """

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
        
        this.SpriteBaseDrawWidth = characterConfig.sprite_base_draw_width || 40;
        this.SpriteBaseDrawHeight = characterConfig.sprite_base_draw_height || 40;
        
        this.SpriteDrawWidth = this.SpriteBaseDrawWidth;
        this.SpriteDrawHeight = this.SpriteBaseDrawHeight;


        this.HitpointImageKey = characterConfig.hitpoint_image_key;
        this.HitpointBaseRadius = characterConfig.hitpoint_radius;
        this.HitpointRadius = this.HitpointBaseRadius;

        this.BaseSpeed = characterConfig.character_speed;
        this.NowSpeed = this.BaseSpeed;
        this.SlowMoveFactor = 0.5; // 一律で半分

        this.MaxHP = characterConfig.character_maxhp;
        this.NowHP = characterConfig.slowMoveFactor;
        
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
        this.MBulletKey = characterConfig.character_m_bullet;
        this.SBulletKey = characterConfig.character_s_bullet;
        this.Skill1Key = characterConfig.character_skill1;
        this.Skill2Key = characterConfig.character_skill2;
        this.PussivSkillKey = characterConfig.passiv_skill;
        this.UltKey = characterConfig.character_ULT;
        // 弾のinfoを引き出す
		this.MainBulletInfo = this.GetBulletInfo(this.MBulletKey, true);
		this.SubBulletInfo = this.GetBulletInfo(this.SBulletKey, false);
    }

    //  Bulletのデータをもらい受ける
    // IsMainSub ture:Main fa;se:Sub
	GetBulletInfo(BulletKey, IsMainSub)
	{
        if(!BulletKey || BulletKey == (IsMainSub) ? MainBulletEnum.NONE : SubBulletEnum.NONE)
        {
            return null;
        }

		const BulletDefinition = (IsMainSub) ? main_bulled_info_list[BulletKey] : sub_bulled_info_list[BulletKey];
        
		return { ...BulletDefinition };
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
        this.SpriteDrawWidth = this.SpriteBaseDrawWidth * this.currentScaleFactor;
        this.SpriteDrawHeight = this.SpriteBaseDrawHeight * this.currentScaleFactor;
        this.hitpoint_radius = this.HitpointBaseRadius * this.currentScaleFactor;
        this.NowSpeed = this.BaseSpeed * this.currentScaleFactor;

        // 新しいサイズの座標に合わせる
        this.x = relativeCenterX * NewGamePlayerSizeWidth;
        this.y = relativeCenterY * NewGamePlayerSizeHeight;
        this.NowPlayAreaHeight = NewGamePlayerSizeHeight;
        this.NowPlayAreaWidth = NewGamePlayerSizeWidth; 


        // 範囲外になることを防止する
        const HalfScaledWidth = this.SpriteDrawWidth / 2;
        const HalfScaledHeight = this.SpriteDrawHeight / 2;
        this.x = Math.max(HalfScaledWidth, Math.min(this.x, NewGamePlayerSizeWidth - HalfScaledWidth));
        this.y = Math.max(HalfScaledHeight, Math.min(this.y, NewPlayerSizeHeight - HalfScaledHeight));
        
        // Bulletの情報もスケール変更する
        const scalebulletProperties = (BulletInfos, BaseBulletList, BulletKey) => {
            if (!this.isvalidbulled(BulletInfos) || !BulletKey || BulletKey === MainBulletEnum.NONE || bulletKey === SubBulletEnum.NONE) {
                return;
            }

            const BaseInfo = BaseBulletList[BulletKey];
             if (!baseInfo) {
                console.warn(`弾の情報がない: ${BulletKey}`);
                return;
            }

            bulletInfos.start_x_pos = (BaseInfo.bullet_pointRadius || 0) * this.bullet_pointRadius;

            bulletInfos.x_speed = (BaseInfo.x_speed || 0) * this.currentScaleFactor;
            bulletInfos.y_speed = (BaseInfo.y_speed || 0) * this.currentScaleFactor; // Y方向の反転はcreateBulletInstanceで行う
            bulletInfos.accel_x = (BaseInfo.accel_x || 0) * this.currentScaleFactor;
            bulletInfos.accel_y = (BaseInfo.accel_y || 0) * this.currentScaleFactor; // Y方向の反転はcreateBulletInstanceで行う
            bulletInfos.jeak_x = (BaseInfo.jeak_x || 0) * this.currentScaleFactor;
            bulletInfos.jeak_y = (BaseInfo.jeak_y || 0) * this.currentScaleFactor;   // Y方向の反転はcreateBulletInstanceで行う
            bulletInfos.bulled_maxSpeed = (BaseInfo.bulled_maxSpeed || 10000) * this.currentScaleFactor;
            
            const sizeMultiplier = BaseInfo.bulled_size_mag || 1.0;
            bulletInfos.bullet_width = (BaseInfo.bullet_width || 5) * sizeMultiplier * this.currentScaleFactor;
            bulletInfos.bullet_height = (BaseInfo.bullet_height || 5) * sizeMultiplier * this.currentScaleFactor;
            bulletInfos.sine_amplitude = (BaseInfo.sine_amplitude || 0) * this.currentScaleFactor;
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
            this.dy = -MoveLengthY;
        }
        else if (Keys.ArrowDown && this.y < this.NowPlayAreaHeight - HalfScaledHeight){
            this.dy = MoveLengthY;  
        } 
        if (Keys.ArrowLeft && this.x > HalfScaledWidth){
            this.dx = -MoveLengthX;
        }
        else if (Keys.ArrowRight && this.x < this.NowPlayAreaWidth - HalfScaledWidth) {
            this.dx = MoveLengthX;
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
        const StartDrawX = this.x - BulletInfo.SpriteDrawWidth / 2;
        const StartDrawY = this.y - BulletInfo.SpriteDrawHeight / 2;
        

        // メインの弾から計算する
        const BulletNumber =  BulletInfo.bullet_namber;
        // 半径(低速モード時は倍率をかける)
        const BulletPointRadius =  BulletInfo.bullet_pointRadius * (Keys.ArrowZ == true) ? bulletInfos.z_bullet_pointRadius_mag : 1.0;
        // 一射の角度を計算(ここ再確認)
        const BulletPointAngleFull = BulletInfo.bullet_pointAngle;
        const OneStepBulletPointAngle = BulletPointAngleFull / BulletNumber;
        // 最初に書く角度
        const StartPointAngleNumber = 90 - BulletPointAngleFull / 2;

        // 打ち出し角度
        // 打ち出し角度により，横方向の速度を変更する必要がある
        // 基本位置と計算は同じ
        // 一射の角度を計算(ここ再確認)(低速モード時は倍率をかける)
        const ShotBulletAngleFull = BulletInfo.Bullet_Angle * (Keys.ArrowZ == true) ? bulletInfos.z_bullet_angle_mag : 1.0;;

        const ShotOneStepBulletAngle = ShotBulletAngleFull / BulletNumber;
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
            // 上記処理を加速度，加加速度にも行う
            
             const bulletOptions = {
                    vx: bulletinfos.x_speed,
                    vy: -bulletinfos.y_speed, 
                    ax: bulletinfos.accel_x,
                    ay: -bulletinfos.accel_y,
                    jx: bulletinfos.jeak_x,
                    jy: -bulletinfos.jeak_y,
                    BulletImageKey: bulletinfos.ball_image_key,
                    shape: bulletinfos.ball_shape,
                    width: bulletinfos.bullet_width, 
                    height: bulletinfos.bullet_height,
                    orientation: bulletinfos.orientation,
                    color: bulletinfos.color, 
                    damage: bulletinfos.damage, 
                    life: bulletinfos.bulled_life,
                    maxSpeed: bulletinfos.bulled_maxSpeed,
                    target: enemyInstance, // 追尾する場合
                    trackingStrength: this.trackingStrengthPower, // 0なら追尾しない。追尾させる場合は0より大きい値
                    globalAlpha: 0.9,
                     sine_wave_enabled: bulletinfos.sine_wave_enabled,
                    sine_amplitude: bulletinfos.sine_amplitude,
                    sine_angular_frequency: bulletinfos.sine_angular_frequency,
                    sine_phase_offset: bulletinfos.sine_phase_offset,
                    sine_axis: bulletinfos.sine_axis || "x",
                    sine_decay_rate: bulletinfos.sine_decay_rate,
                };

            // 作ったインスタンスをpushする
            playerBulletsArray.push(new Bullet(StartPointX, StartPointY, this.AssetManager, bulletOptions));
        }
    }
    
    // 攻撃実行のメインロジック
    _shoot(Keys, PlayerBulletsArray, TargetEnemy
        , CurrentTime, DeltaTime) {
        // 大体はこちらで設計可能



        // メインに対して処理を行う
        this.MainBulletInfo;
        
        
               
        
                // Zが押されていた場合集中するような処理をとる
                if (keys['z']) {
                    if(bulletinfos.sine_wave_enabled == true)
                    {
                        bulletOptions.sine_decay_rate =1.5;
                    }else
                    {
                        startX = AvatorDrawX + (bulletinfos.start_x_pos / 3);
                    }
                }
        
                

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