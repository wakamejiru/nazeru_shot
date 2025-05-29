// ==================================================================
// ★★★ プレイヤー クラスの定義 ★★★
// ==================================================================
import { Bullet } from './bullet.js'; // Bulletクラスもインポート
import { CharacterTypeEnum, SkillTypeEnum, UltTypeEnum, MainBulletEnum, SubBulletEnum, 
	character_info_list, skill_info_list,  ult_info_list, main_bulled_info_list, sub_bulled_info_list, imageAssetPaths} from './game_status.js'; // Bulletクラスもインポート


// 画像の初期化を行う


export class Player {

    // 初期のx座標
    // 初期のy座標
    // canvas キャンパス
    // charactername キャラネーム
    // image_list  初期化した画像のリスト   
    // options その他設定値   
    constructor(initialX, initialY, character_type, asset_manager, canvas)
    {

        this.canvas = canvas; // canvasオブジェクト
		// 初期位置を設定 (引数で渡されたものを優先)
		this.x = initialX !== undefined ? initialX : (this.canvas.width / 2);
		this.y = initialY !== undefined ? initialY : (this.canvas.height * 0.8); // Y座標も適切な初期値を


        this.character_type = character_type; // 例: CharacterTypeEnum.TYPE_1 の「値」("Type1")
        this.asset_manager = asset_manager;   // 画像などのアセットを管理

        // game_status.js からキャラクターの基本データを取得
        const status = character_info_list[this.character_type];

        if (!status) {			
            console.error(`Player Constructor: Character type "${this.character_type}" not found. Using defaults.`);
        } else {
            
			// 固定値で入れているのでエラーチェックは行わない
			this.character_name = status.charachter_name;


			this.avatar_image_key = status.avatar_image_key;
			this.sprite_draw_width = status.sprite_base_draw_width;      // アバターの (ピクセル)
     	   	this.sprite_draw_height = status.sprite_base_draw_height;     // アバターの (ピクセル)
			
        	this.sprite_base_draw_width = status.sprite_base_draw_width;      // アバターの (ピクセル)
     	   	this.sprite_base_draw_height = status.sprite_base_draw_height;     // アバターの (ピクセル)
			
			this.hitpoint_image_key = status.hitpoint_image_key; 
        	this.hitpoint_radius = status.hitpoint_radius;
        	this.hitpoint_base_radius = status.hitpoint_radius;



            this.baseradius = status.character_radius;
            this.radius = status.character_radius;

			this.basespeed = status.character_speed;
			this.speed = status.character_speed;
            
			this.maxHp = status.character_maxhp;
            this.skill1 = status.character_skill1;
			this.ult = status.character_ULT;
			this.m_bullet1_key = status.character_m_bullet1;
			this.m_bullet2_key = status.character_m_bullet2;
			this.s_bullet1_key = status.character_s_bullet1;
			this.s_bullet2_key = status.character_s_bullet2;
			this.s_bullet3_key = status.character_s_bullet3;
			this.s_bullet4_key = status.character_s_bullet4;
			this.s_bullet5_key = status.character_s_bullet5;
        }

		this.slowMoveFactor = 0.2; // 低速移動モードの倍率

        this.hp = this.maxHp;

		// アバター画像（スプライト）を設定
		this.spriteAvator = this.avatar_image_key ? this.asset_manager.getImage(this.avatar_image_key) : null;
		if (this.avatar_image_key && !this.spriteAvator) {
			console.warn(`Player sprite for key "${this.avatar_image_key}" not loaded. Fallback color will be used.`);
		}

		this.spriteHitpoint = this.avatar_image_key ? this.asset_manager.getImage(this.hitpoint_image_key) : null;
		if (this.hitpoint_image_key && !this.spriteHitpoint) {
			console.warn(`Player sprite for key "${this.hitpoint_image_key}" not loaded. Fallback color will be used.`);
		}

		this.m_bullet1infos = this.GetMBulletInfo(this.m_bullet1_key);
		this.m_bullet2infos = this.GetMBulletInfo(this.m_bullet2_key);
		this.s_bullet1infos = this.GetSBulletInfo(this.s_bullet1_key);
		this.s_bullet2infos = this.GetSBulletInfo(this.s_bullet2_key);
		this.s_bullet3infos = this.GetSBulletInfo(this.s_bullet3_key);
		this.s_bullet4infos = this.GetSBulletInfo(this.s_bullet4_key);
		this.s_bullet5infos = this.GetSBulletInfo(this.s_bullet5_key);
		this.waittime_mbullet1=0;
		this.waittime_mbullet2=0;
		this.waittime_sbullet1=0;
		this.waittime_sbullet2=0;
		this.waittime_sbullet3=0;
		this.waittime_sbullet4=0;
		this.waittime_sbullet5=0;
		this.trackingStrengthPower = 0.0 // ここをスキルで能動的に変えられるようにする

		// 移動用
        this.dx = 0;
        this.dy = 0;

        // スケール対応用
        this.currentScaleFactor = 1.0; // 初期スケールファクター
    }

	//  mainBulletのデータをもらい受ける
	GetMBulletInfo(bullet_key)
	{
		if (!bullet_key || bullet_key === MainBulletEnum.NONE) { // MainBulletEnumもインポートする
			return null;
		}
		const bulletDefinition = main_bulled_info_list[bullet_key];
		return { ...bulletDefinition };
	}

	//  subBulletのデータをもらい受ける
	GetSBulletInfo(bullet_key)
	{
		// MBulletと同じように設計
		if (!bullet_key || bullet_key === SubBulletEnum.NONE) { // SubBulletEnumもインポートする
			return null;
		}
		const bulletDefinition = sub_bulled_info_list[bullet_key];
		return { ...bulletDefinition };
	}

	// 有効ならtrue
	isvalidbulled(bullet_info)
	{
		return bullet_info !== null;
	}

    // ブラウザの解像度比に合わせて動作を変える
    updateScale(newScaleFactor, newCanvas)
    {
        // 以前のスケールに対する現在の相対位置を計算
        
		// 更新前の canvas の幅と高さを取得。0 の場合はフォールバックとして基準解像度を使用。
		// (BASE_WIDTH, BASE_HEIGHT は player.js で利用可能である前提)
		const oldCanvasWidth = this.canvas.width || BASE_WIDTH;  // BASE_WIDTH は script.js からインポートするか、コンストラクタで渡す
		const oldCanvasHeight = this.canvas.height || BASE_HEIGHT; // 同上

		// this.x や this.y が NaN や Infinity でないことを確認
		if (isNaN(this.x) || !isFinite(this.x) || isNaN(this.y) || !isFinite(this.y)) {
			console.warn("Player.updateScale: Initial x/y is NaN or Infinity. Resetting to center.");
			// player.x, player.y が左上基準の場合
			this.x = (oldCanvasWidth - (this.baseWidth * this.currentScaleFactor)) / 2;
			this.y = (oldCanvasHeight - (this.baseHeight * this.currentScaleFactor)) / 2;
		}

		// oldCanvasWidth/Height が0でないことを保証
		const safeOldCanvasWidth = oldCanvasWidth === 0 ? BASE_WIDTH : oldCanvasWidth;
		const safeOldCanvasHeight = oldCanvasHeight === 0 ? BASE_HEIGHT : oldCanvasHeight;

		// プレイヤーの論理的な中心に基づいて相対位置を計算
		const currentLogicalWidth = (this.sprite_draw_width || 20) * this.currentScaleFactor;
		const currentLogicalHeight = (this.sprite_draw_height || 20) * this.currentScaleFactor;
		const currentLogicalCenterX = this.x + currentLogicalWidth / 2;
		const currentLogicalCenterY = this.y + currentLogicalHeight / 2;

		const relativeCenterX = currentLogicalCenterX / safeOldCanvasWidth;
		const relativeCenterY = currentLogicalCenterY / safeOldCanvasHeight;

		this.currentScaleFactor = newScaleFactor;
		this.canvas = newCanvas; // 新しいcanvasの参照

		const newScaledLogicalWidth = (this.baseWidth || 20) * this.currentScaleFactor;
		const newScaledLogicalHeight = (this.baseHeight || 20) * this.currentScaleFactor;

		// 新しいスケールに基づいて左上のx, yを再計算
		this.x = (relativeCenterX * this.canvas.width) - newScaledLogicalWidth / 2;
		this.y = (relativeCenterY * this.canvas.height) - newScaledLogicalHeight / 2;

		// 境界チェックなどで位置を補正 (左上基準で)
		this.x = Math.max(0, Math.min(this.x, this.canvas.width - newScaledLogicalWidth));
		this.y = Math.max(0, Math.min(this.y, this.canvas.height - newScaledLogicalHeight));

		// プレイヤー自身の当たり判定半径や速度も、基本値を元にスケール (既に実装済み)
		this.radius = (this.baseradius || 10) * this.currentScaleFactor;
		this.speed = (this.basespeed || 200) * this.currentScaleFactor;

		// アバターの描画サイズも更新 (既に実装済み)
		this.sprite_draw_width = (this.sprite_base_draw_width || 40) * this.currentScaleFactor;
		this.sprite_draw_height = (this.sprite_base_draw_height || 40) * this.currentScaleFactor;
		this.hitpoint_radius = (this.hitpoint_base_radius || 10) * this.currentScaleFactor;

		// かなりまずった作り方をした

		// 弾がある場合は弾のスケールの大きさと速度をいじる
		if(this.isvalidbulled(this.m_bullet1infos) == true){
			this.m_bullet1infos.start_x_pos =  main_bulled_info_list[this.m_bullet1_key].start_x_pos*this.currentScaleFactor;
			this.m_bullet1infos.start_y_pos =  main_bulled_info_list[this.m_bullet1_key].start_y_pos*this.currentScaleFactor;

			this.m_bullet1infos.x_speed =  main_bulled_info_list[this.m_bullet1_key].x_speed*this.currentScaleFactor;
			this.m_bullet1infos.y_speed = main_bulled_info_list[this.m_bullet1_key].y_speed*this.currentScaleFactor;
			this.m_bullet1infos.accel_x = main_bulled_info_list[this.m_bullet1_key].accel_x*this.currentScaleFactor;
			this.m_bullet1infos.accel_y = main_bulled_info_list[this.m_bullet1_key].accel_y*this.currentScaleFactor;
			this.m_bullet1infos.jeak_x = main_bulled_info_list[this.m_bullet1_key].jeak_x*this.currentScaleFactor;
			this.m_bullet1infos.jeak_y = main_bulled_info_list[this.m_bullet1_key].jeak_y*this.currentScaleFactor;
			this.m_bullet1infos.bulled_maxSpeed = main_bulled_info_list[this.m_bullet1_key].bulled_maxSpeed*this.currentScaleFactor;
			this.m_bullet1infos.bulled_size_mag = main_bulled_info_list[this.m_bullet1_key].bulled_size_mag*this.currentScaleFactor;
			
			this.m_bullet1infos.bullet_width = main_bulled_info_list[this.m_bullet1_key].bullet_width*this.currentScaleFactor;
			this.m_bullet1infos.bullet_height = main_bulled_info_list[this.m_bullet1_key].bullet_height*this.currentScaleFactor;
			this.m_bullet1infos.sine_amplitude = main_bulled_info_list[this.m_bullet1_key].sine_amplitude*this.currentScaleFactor;

		}
		
		// 弾がある場合は弾のスケールの大きさと速度をいじる
		if(this.isvalidbulled(this.m_bullet2infos) == true){
			this.m_bullet2infos.start_x_pos =  main_bulled_info_list[this.m_bullet2_key].start_x_pos*this.currentScaleFactor;
			this.m_bullet2infos.start_y_pos =  main_bulled_info_list[this.m_bullet2_key].start_y_pos*this.currentScaleFactor;


			this.m_bullet2infos.x_speed = main_bulled_info_list[this.m_bullet2_key].x_speed*this.currentScaleFactor;
			this.m_bullet2infos.y_speed = main_bulled_info_list[this.m_bullet2_key].y_speed*this.currentScaleFactor;
			this.m_bullet2infos.accel_x = main_bulled_info_list[this.m_bullet2_key].accel_x*this.currentScaleFactor;
			this.m_bullet2infos.accel_y = main_bulled_info_list[this.m_bullet2_key].accel_y*this.currentScaleFactor;
			this.m_bullet2infos.jeak_x = main_bulled_info_list[this.m_bullet2_key].jeak_x*this.currentScaleFactor;
			this.m_bullet2infos.jeak_y = main_bulled_info_list[this.m_bullet2_key].jeak_y*this.currentScaleFactor;
			this.m_bullet2infos.bulled_maxSpeed = main_bulled_info_list[this.m_bullet2_key].bulled_maxSpeed*this.currentScaleFactor;
			this.m_bullet2infos.bulled_size_mag = main_bulled_info_list[this.m_bullet2_key].bulled_size_mag*this.currentScaleFactor;	
			this.m_bullet2infos.bullet_width = main_bulled_info_list[this.m_bullet2_key].bullet_width*this.currentScaleFactor;
			this.m_bullet2infos.bullet_height = main_bulled_info_list[this.m_bullet2_key].bullet_height*this.currentScaleFactor;
			this.m_bullet2infos.sine_amplitude = main_bulled_info_list[this.m_bullet2_key].sine_amplitude*this.currentScaleFactor;


		}

		// 弾がある場合は弾のスケールの大きさと速度をいじる
		if(this.isvalidbulled(this.s_bullet1infos) == true){
			this.s_bullet1infos.start_x_pos =  sub_bulled_info_list[this.s_bullet1_key].start_x_pos*this.currentScaleFactor;
			this.s_bullet1infos.start_y_pos =  sub_bulled_info_list[this.s_bullet1_key].start_y_pos*this.currentScaleFactor;


			this.s_bullet1infos.x_speed = sub_bulled_info_list[this.s_bullet1_key].x_speed*this.currentScaleFactor;
			this.s_bullet1infos.y_speed = sub_bulled_info_list[this.s_bullet1_key].y_speed*this.currentScaleFactor;
			this.s_bullet1infos.accel_x = sub_bulled_info_list[this.s_bullet1_key].accel_x*this.currentScaleFactor;
			this.s_bullet1infos.accel_y = sub_bulled_info_list[this.s_bullet1_key].accel_y*this.currentScaleFactor;
			this.s_bullet1infos.jeak_x = sub_bulled_info_list[this.s_bullet1_key].jeak_x*this.currentScaleFactor;
			this.s_bullet1infos.jeak_y = sub_bulled_info_list[this.s_bullet1_key].jeak_y*this.currentScaleFactor;
			this.s_bullet1infos.bulled_maxSpeed = sub_bulled_info_list[this.s_bullet1_key].bulled_maxSpeed*this.currentScaleFactor;
			this.s_bullet1infos.bulled_size_mag = sub_bulled_info_list[this.s_bullet1_key].bulled_size_mag*this.currentScaleFactor;	

			this.s_bullet1infos.bullet_width = sub_bulled_info_list[this.s_bullet1_key].bullet_width*this.currentScaleFactor;
			this.s_bullet1infos.bullet_height = sub_bulled_info_list[this.s_bullet1_key].bullet_height*this.currentScaleFactor;	
		}

		if(this.isvalidbulled(this.s_bullet2infos) == true){
			this.s_bullet2infos.start_x_pos =  sub_bulled_info_list[this.s_bullet2_key].start_x_pos*this.currentScaleFactor;
			this.s_bullet2infos.start_y_pos =  sub_bulled_info_list[this.s_bullet2_key].start_y_pos*this.currentScaleFactor;

			this.s_bullet2infos.x_speed = sub_bulled_info_list[this.s_bullet2_key].x_speed*this.currentScaleFactor;
			this.s_bullet2infos.y_speed = sub_bulled_info_list[this.s_bullet2_key].y_speed*this.currentScaleFactor;
			this.s_bullet2infos.accel_x = sub_bulled_info_list[this.s_bullet2_key].accel_x*this.currentScaleFactor;
			this.s_bullet2infos.accel_y = sub_bulled_info_list[this.s_bullet2_key].accel_y*this.currentScaleFactor;
			this.s_bullet2infos.jeak_x = sub_bulled_info_list[this.s_bullet2_key].jeak_x*this.currentScaleFactor;
			this.s_bullet2infos.jeak_y = sub_bulled_info_list[this.s_bullet2_key].jeak_y*this.currentScaleFactor;
			this.s_bullet2infos.bulled_maxSpeed = sub_bulled_info_list[this.s_bullet2_key].bulled_maxSpeed*this.currentScaleFactor;
			this.s_bullet2infos.bulled_size_mag = sub_bulled_info_list[this.s_bullet2_key].bulled_size_mag*this.currentScaleFactor;	
		
			this.s_bullet2infos.bullet_width = sub_bulled_info_list[this.s_bullet2_key].bullet_width*this.currentScaleFactor;
			this.s_bullet2infos.bullet_height = sub_bulled_info_list[this.s_bullet2_key].bullet_height*this.currentScaleFactor;	

		}

		if(this.isvalidbulled(this.s_bullet3infos) == true){
			this.s_bullet3infos.start_x_pos =  sub_bulled_info_list[this.s_bullet3_key].start_x_pos*this.currentScaleFactor;
			this.s_bullet3infos.start_y_pos =  sub_bulled_info_list[this.s_bullet3_key].start_y_pos*this.currentScaleFactor;

			this.s_bullet3infos.x_speed = sub_bulled_info_list[this.s_bullet3_key].x_speed*this.currentScaleFactor;
			this.s_bullet3infos.y_speed = sub_bulled_info_list[this.s_bullet3_key].y_speed*this.currentScaleFactor;
			this.s_bullet3infos.accel_x = sub_bulled_info_list[this.s_bullet3_key].accel_x*this.currentScaleFactor;
			this.s_bullet3infos.accel_y = sub_bulled_info_list[this.s_bullet3_key].accel_y*this.currentScaleFactor;
			this.s_bullet3infos.jeak_x = sub_bulled_info_list[this.s_bullet3_key].jeak_x*this.currentScaleFactor;
			this.s_bullet3infos.jeak_y = sub_bulled_info_list[this.s_bullet3_key].jeak_y*this.currentScaleFactor;
			this.s_bullet3infos.bulled_maxSpeed = sub_bulled_info_list[this.s_bullet3_key].bulled_maxSpeed*this.currentScaleFactor;
			this.s_bullet3infos.bulled_size_mag = sub_bulled_info_list[this.s_bullet3_key].bulled_size_mag*this.currentScaleFactor;	

			this.s_bullet3infos.bullet_width = sub_bulled_info_list[this.s_bullet3_key].bullet_width*this.currentScaleFactor;
			this.s_bullet3infos.bullet_height = sub_bulled_info_list[this.s_bullet3_key].bullet_height*this.currentScaleFactor;	
		}

		if(this.isvalidbulled(this.s_bullet4infos) == true){ 
			this.s_bullet4infos.start_x_pos =  sub_bulled_info_list[this.s_bullet4_key].start_x_pos*this.currentScaleFactor;
			this.s_bullet4infos.start_y_pos =  sub_bulled_info_list[this.s_bullet4_key].start_y_pos*this.currentScaleFactor;


            this.s_bullet4infos.x_speed = sub_bulled_info_list[this.s_bullet4_key].x_speed * this.currentScaleFactor;
            this.s_bullet4infos.y_speed = sub_bulled_info_list[this.s_bullet4_key].y_speed * this.currentScaleFactor;
            this.s_bullet4infos.accel_x = sub_bulled_info_list[this.s_bullet4_key].accel_x * this.currentScaleFactor;
            this.s_bullet4infos.accel_y = sub_bulled_info_list[this.s_bullet4_key].accel_y * this.currentScaleFactor;
            this.s_bullet4infos.jeak_x = sub_bulled_info_list[this.s_bullet4_key].jeak_x * this.currentScaleFactor;
            this.s_bullet4infos.jeak_y = sub_bulled_info_list[this.s_bullet4_key].jeak_y * this.currentScaleFactor;
            this.s_bullet4infos.bulled_maxSpeed = sub_bulled_info_list[this.s_bullet4_key].bulled_maxSpeed * this.currentScaleFactor;
            this.s_bullet4infos.bulled_size_mag = sub_bulled_info_list[this.s_bullet4_key].bulled_size_mag * this.currentScaleFactor;

			this.s_bullet4infos.bullet_width = sub_bulled_info_list[this.s_bullet4_key].bullet_width*this.currentScaleFactor;
			this.s_bullet4infos.bullet_height = sub_bulled_info_list[this.s_bullet4_key].bullet_height*this.currentScaleFactor;	

		}

		if(this.isvalidbulled(this.s_bullet5infos) == true){ 
			this.s_bullet5infos.start_x_pos =  sub_bulled_info_list[this.s_bullet5_key].start_x_pos*this.currentScaleFactor;
			this.s_bullet5infos.start_y_pos =  sub_bulled_info_list[this.s_bullet5_key].start_y_pos*this.currentScaleFactor;

            this.s_bullet5infos.x_speed = sub_bulled_info_list[this.s_bullet5_key].x_speed * this.currentScaleFactor;
            this.s_bullet5infos.y_speed = sub_bulled_info_list[this.s_bullet5_key].y_speed * this.currentScaleFactor;
            this.s_bullet5infos.accel_x = sub_bulled_info_list[this.s_bullet5_key].accel_x * this.currentScaleFactor;
            this.s_bullet5infos.accel_y = sub_bulled_info_list[this.s_bullet5_key].accel_y * this.currentScaleFactor;
            this.s_bullet5infos.jeak_x = sub_bulled_info_list[this.s_bullet5_key].jeak_x * this.currentScaleFactor;
            this.s_bullet5infos.jeak_y = sub_bulled_info_list[this.s_bullet5_key].jeak_y * this.currentScaleFactor;
            this.s_bullet5infos.bulled_maxSpeed = sub_bulled_info_list[this.s_bullet5_key].bulled_maxSpeed * this.currentScaleFactor;
            this.s_bullet5infos.bulled_size_mag = sub_bulled_info_list[this.s_bullet5_key].bulled_size_mag * this.currentScaleFactor;

			this.s_bullet5infos.bullet_width = sub_bulled_info_list[this.s_bullet5_key].bullet_width*this.currentScaleFactor;
			this.s_bullet5infos.bullet_height = sub_bulled_info_list[this.s_bullet5_key].bullet_height*this.currentScaleFactor;	
		}

    }




    // プレイヤーの移動ロジック
    move(keys, deltaTime) {

        this.dx = 0;
        this.dy = 0;
		// 現在の適用速度を決定
        let currentAppliedSpeed = this.speed;
        if (keys['z']) { // 'z' キーが押されていれば低速にする
            currentAppliedSpeed = this.speed * this.slowMoveFactor;
        }
		
		let drawn_width_half = this.sprite_base_draw_width / 2;
		let drawn_height_half = this.sprite_base_draw_height / 2;

        if (keys.ArrowUp && this.y > 0) this.dy = -1;
        else if (keys.ArrowDown && this.y < this.canvas.height -drawn_height_half) this.dy = 1;
        if (keys.ArrowLeft && this.x > 0) this.dx = -1;
        else if (keys.ArrowRight && this.x < this.canvas.width - drawn_width_half) this.dx = 1;

        const magnitude = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
        let moveX = 0;
        let moveY = 0;
        if (magnitude > 0) {
            moveX = (this.dx / magnitude) * currentAppliedSpeed * deltaTime;
            moveY = (this.dy / magnitude) * currentAppliedSpeed * deltaTime;
        }

		
        this.x += moveX;
        this.y += moveY;



        // 境界からはみ出ないように最終調整
        this.x = Math.max(drawn_width_half, Math.min(this.x, this.canvas.width - drawn_width_half));
        this.y = Math.max(drawn_height_half, Math.min(this.y, this.canvas.height - drawn_height_half));

        
    }

	// main弾のインスタンスを作成する
	// bulletのwaittimeは外でやる
	createBulletInstance(keys, playerBulletsArray, bulletinfos, enemyInstance)
	{	
		// 中心描画に変更
		let AvatorDrawX = this.x;
		const AvatorDrawY = this.y - this.sprite_draw_height / 2;

		let startX = AvatorDrawX + bulletinfos.start_x_pos;
		
		const startY = AvatorDrawY + bulletinfos.start_y_pos - bulletinfos.bullet_height / 2;





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

		playerBulletsArray.push(new Bullet(startX, startY, this.asset_manager, bulletOptions));
	}

	// sub弾のインスタンスを作成する
    shoot(keys, playerBulletsArray, enemyInstance, deltaTime) {

        if (this.hp <= 0) return;


        // 各弾を発射する


		// mainbullet1
		if(this.isvalidbulled(this.m_bullet1infos)==true){
			if (this.waittime_mbullet1 > 0) { // クールダウン中かチェック
				this.waittime_mbullet1 -= deltaTime; // クールダウンタイマーを減算
				if (this.waittime_mbullet1 < 0) this.bulletTimer = 0;
			}else
			{
				// m_bullet1が打てる
				this.createBulletInstance(keys, playerBulletsArray, this.m_bullet1infos, enemyInstance);
				this.waittime_mbullet1 = this.m_bullet1infos.rate; // クールダウン再セット
			}
		}

        // mainbullet2
		if(this.isvalidbulled(this.m_bullet2infos)==true){
			if (this.waittime_mbullet2 > 0) { // クールダウン中かチェック
				this.waittime_mbullet2 -= deltaTime; // クールダウンタイマーを減算
				if (this.waittime_mbullet2 < 0) this.bulletTimer = 0;
			}else
			{
				// m_bullet1が打てる
				this.createBulletInstance(keys, playerBulletsArray, this.m_bullet2infos, enemyInstance);
				this.waittime_mbullet2 = this.m_bullet2infos.rate; // クールダウン再セット
			}
		}

		 // subbullet1
		 if(this.isvalidbulled(this.s_bullet1infos)==true){
			if (this.waittime_sbullet1 > 0) { // クールダウン中かチェック
				this.waittime_sbullet1 -= deltaTime; // クールダウンタイマーを減算
				if (this.waittime_sbullet1 < 0) this.bulletTimer = 0;
				}else
				{
					// m_bullet1が打てる
					this.createBulletInstance(keys, playerBulletsArray, this.s_bullet1infos, enemyInstance);
					this.waittime_sbullet1 = this.s_bullet1infos.rate; // クールダウン再セット
				}
		}

		 // subbullet2
		if(this.isvalidbulled(this.s_bullet2infos)==true){
			if (this.waittime_sbullet2 > 0) { // クールダウン中かチェック
				this.waittime_sbullet2 -= deltaTime; // クールダウンタイマーを減算
				if (this.waittime_sbullet2 < 0) this.bulletTimer = 0;
			}else
			{
				// m_bullet2が打てる
				this.createBulletInstance(keys, playerBulletsArray, this.s_bullet2infos, enemyInstance);
				this.waittime_sbullet2 = this.s_bullet2infos.rate; // クールダウン再セット
			}
		}


		 // subbullet3
		 if(this.isvalidbulled(this.s_bullet3infos)==true){
			if (this.waittime_sbullet3 > 0) { // クールダウン中かチェック
				this.waittime_sbullet3 -= deltaTime; // クールダウンタイマーを減算
				if (this.waittime_sbullet3 < 0) this.bulletTimer = 0;
			}else
			{
				// m_bullet3が打てる
				this.createBulletInstance(keys, playerBulletsArray, this.s_bullet3infos, enemyInstance);
				this.waittime_sbullet3 = this.s_bullet3infos.rate; // クールダウン再セット
			}
		}

		 // subbullet4
		 if(this.isvalidbulled(this.s_bullet4infos)==true){
			if (this.waittime_sbullet4 > 0) { // クールダウン中かチェック
				this.waittime_sbullet4 -= deltaTime; // クールダウンタイマーを減算
				if (this.waittime_sbullet4 < 0) this.bulletTimer = 0;
			}else
			{
				// m_bullet4が打てる
				this.createBulletInstance(keys, playerBulletsArray, this.s_bullet4infos, enemyInstance);
				this.waittime_sbullet4 = this.s_bullet4infos.rate; // クールダウン再セット
			}
		}
		
		// subbullet5
		if(this.isvalidbulled(this.s_bullet5infos)==true){
			if (this.waittime_sbullet5 > 0) { // クールダウン中かチェック
			this.waittime_sbullet5 -= deltaTime; // クールダウンタイマーを減算
			if (this.waittime_sbullet5 < 0) this.bulletTimer = 0;
			}else
			{
				// m_bullet5が打てる
				this.createBulletInstance(keys, playerBulletsArray, this.s_bullet5infos, enemyInstance);
				this.waittime_sbullet5 = this.s_bullet5infos.rate; // クールダウン再セット
			}	
		}

    }

    // プレイヤーの描画ロジック
    draw(ctx) {
        const scaledDrawWidth = this.sprite_draw_width; // 描画用のスケーリングされた幅
        const scaledDrawHeight = this.sprite_draw_height; // 描画用のスケーリングされた高さ	
		
		// 中心描画に変更
		const AvatorDrawX = this.x - scaledDrawWidth / 2;
        const AvatorDrawY = this.y - scaledDrawHeight / 2;
		// プレイヤーのx,yを左上基準として画像を描画
		ctx.drawImage(this.spriteAvator, AvatorDrawX, AvatorDrawY, scaledDrawWidth, scaledDrawHeight);

		// 当たり判定を描画
		const hitpoint_radius_drawn = this.hitpoint_radius; // 描画用のスケーリングされた幅
		// 中心描画に変更
		const HitpointDrawX = this.x - hitpoint_radius_drawn / 2;
        const HitpointDrawY = this.y - hitpoint_radius_drawn / 2;

		ctx.drawImage(this.spriteHitpoint, HitpointDrawX, HitpointDrawY, hitpoint_radius_drawn, hitpoint_radius_drawn);

		// 中心にさらに点を表示
		ctx.fillStyle = 'Black'; // 
		ctx.fillRect(this.x - 2, this.y - 2, 8, 8); // this.x, this.y に点を描画
    }

    // プレイヤーのHPバー描画ロジック
    drawHpBar(ctx, scaledHpBarHeight, scaledPlayerHpBarWidth) {
        const barX = 10 * this.currentScaleFactor;
        const barY = this.canvas.height - scaledHpBarHeight - (10 * this.currentScaleFactor);
        const currentHpWidth = this.maxHp > 0 ? (this.hp / this.maxHp) * scaledPlayerHpBarWidth : 0;

        ctx.fillStyle = 'grey';
        ctx.fillRect(barX, barY, scaledPlayerHpBarWidth, scaledHpBarHeight);
        ctx.fillStyle = (this.maxHp > 0 && this.hp / this.maxHp < 0.3) ? 'red' : 'green';
        ctx.fillRect(barX, barY, currentHpWidth > 0 ? currentHpWidth : 0, scaledHpBarHeight);
        ctx.strokeStyle = 'white';
        ctx.strokeRect(barX, barY, scaledPlayerHpBarWidth, scaledHpBarHeight);

    }
}

