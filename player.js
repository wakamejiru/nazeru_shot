// ==================================================================
// ★★★ プレイヤー クラスの定義 ★★★
// ==================================================================
import { BulletPlayer } from './bullet_player.js'; // Bulletクラスもインポート
import { CharacterTypeEnum, SkillTypeEnum, UltTypeEnum, MainBulletEnum, SubBulletEnum, character_info_list, skill_info_list,  ult_info_list, main_bulled_info_list, sub_bulled_info_list, imageAssetPaths} from './game_status.js'; // Bulletクラスもインポート


// 画像の初期化を行う


export class Player {

    // 初期のx座標
    // 初期のy座標
    // canvas キャンパス
    // charactername キャラネーム
    // image_list  初期化した画像のリスト   
    // options その他設定値   
    constructor(character_type, asset_manager, canvas)
    {

        this.canvas = canvas; // canvasオブジェクト

        // 初期値は中央
        this.x = (this.canvas.width/2); // Playerの位置X
        this.y = (this.canvas.width/2); // Playerの位置Y
        
        this.character_type = character_type; // 例: CharacterTypeEnum.TYPE_1 の「値」("Type1")
        this.asset_manager = asset_manager;   // 画像などのアセットを管理

        // game_state.js からキャラクターの基本データを取得
        const status = characterInfoList[this.characterType];

        if (!status) {
            console.error(`リスト外が入った要確認`);
        } else {
            // 固定値で入れているのでエラーチェックは行わない
			this.character_name = status.charachter_name;
			this.avatar_image_key = status.avatar_image_key;
            this.radius = status.character_radius;
            this.speed = status.character_spped;
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
        this.hp = this.maxHp;

		this.m_bullet1infos = GetMBulletInfo(this.m_bullet1_key);
		this.m_bullet2infos = GetMBulletInfo(this.m_bullet2_key);
		this.s_bullet1infos = GetSBulletInfo(this.s_bullet1_key);
		this.s_bullet2infos = GetSBulletInfo(this.s_bullet2_key);
		this.s_bullet3infos = GetSBulletInfo(this.s_bullet3_key);
		this.s_bullet4infos = GetSBulletInfo(this.s_bullet4_key);
		this.s_bullet5infos = GetSBulletInfo(this.s_bullet5_key);
		this.waittime_mbullet1=0;
		this.waittime_mbullet2=0;
		this.waittime_sbullet1=0;
		this.waittime_sbullet2=0;
		this.waittime_sbullet3=0;
		this.waittime_sbullet4=0;
		this.waittime_sbullet5=0;
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
        
        const relativeX = this.x / (this.canvas.width || BASE_WIDTH); // 0除算を避ける
        const relativeY = this.y / (this.canvas.height || BASE_HEIGHT);

        this.currentScaleFactor = newScaleFactor;
        this.canvas = newCanvas; // 新しいcanvasの参照（主にwidth/height）

        // 新しいcanvasサイズに基づいて位置を再設定
        this.x = relativeX * this.canvas.width;
        this.y = relativeY * this.canvas.height;

        // 境界チェックなどで位置を補正
        this.x = Math.max(0, Math.min(this.x, this.canvas.width - this.getScaledWidth()));
        this.y = Math.max(0, Math.min(this.y, this.canvas.height - this.getScaledHeight()));

        // 横幅も変更する
        this.radius = this.radius * this.currentScaleFactor;

        // スピードも変更する
        this.speed = this.speed * this.currentScaleFactor;


		


		// 弾がある場合は弾のスケールの大きさと速度をいじる
		if(this.isvalidbulled(this.m_bullet1infos) == true){
			this.m_bullet1infos.x_speed = this.m_bullet1infos.x_speed*this.currentScaleFactor;
			this.m_bullet1infos.y_speed = this.m_bullet1infos.y_speed*this.currentScaleFactor;
			this.m_bullet1infos.accel_x = this.m_bullet1infos.accel_x*this.currentScaleFactor;
			this.m_bullet1infos.accel_y = this.m_bullet1infos.accel_y*this.currentScaleFactor;
			this.m_bullet1infos.jeak_x = this.m_bullet1infos.jeak_x*this.currentScaleFactor;
			this.m_bullet1infos.jeak_y = this.m_bullet1infos.jeak_y*this.currentScaleFactor;
			this.m_bullet1infos.bulled_maxSpeed = this.m_bullet1infos.bulled_maxSpeed*this.currentScaleFactor;
			this.m_bullet1infos.bulled_size_mag = this.m_bullet1infos.bulled_size_mag*this.currentScaleFactor;	
		}
		
		// 弾がある場合は弾のスケールの大きさと速度をいじる
		if(this.isvalidbulled(this.m_bullet2infos) == true){
			this.m_bullet2infos.x_speed = this.m_bullet2infos.x_speed*this.currentScaleFactor;
			this.m_bullet2infos.y_speed = this.m_bullet2infos.y_speed*this.currentScaleFactor;
			this.m_bullet2infos.accel_x = this.m_bullet2infos.accel_x*this.currentScaleFactor;
			this.m_bullet2infos.accel_y = this.m_bullet2infos.accel_y*this.currentScaleFactor;
			this.m_bullet2infos.jeak_x = this.m_bullet2infos.jeak_x*this.currentScaleFactor;
			this.m_bullet2infos.jeak_y = this.m_bullet2infos.jeak_y*this.currentScaleFactor;
			this.m_bullet2infos.bulled_maxSpeed = this.m_bullet2infos.bulled_maxSpeed*this.currentScaleFactor;
			this.m_bullet2infos.bulled_size_mag = this.m_bullet2infos.bulled_size_mag*this.currentScaleFactor;	
		}

		// 弾がある場合は弾のスケールの大きさと速度をいじる
		if(this.isvalidbulled(this.s_bullet1infos) == true){
			this.s_bullet1infos.x_speed = this.s_bullet1infos.x_speed*this.currentScaleFactor;
			this.s_bullet1infos.y_speed = this.s_bullet1infos.y_speed*this.currentScaleFactor;
			this.s_bullet1infos.accel_x = this.s_bullet1infos.accel_x*this.currentScaleFactor;
			this.s_bullet1infos.accel_y = this.s_bullet1infos.accel_y*this.currentScaleFactor;
			this.s_bullet1infos.jeak_x = this.s_bullet1infos.jeak_x*this.currentScaleFactor;
			this.s_bullet1infos.jeak_y = this.s_bullet1infos.jeak_y*this.currentScaleFactor;
			this.s_bullet1infos.bulled_maxSpeed = this.s_bullet1infos.bulled_maxSpeed*this.currentScaleFactor;
			this.s_bullet1infos.bulled_size_mag = this.s_bullet1infos.bulled_size_mag*this.currentScaleFactor;	
		}

		if(this.isvalidbulled(this.s_bullet2infos) == true){
			this.s_bullet2infos.x_speed = this.s_bullet2infos.x_speed*this.currentScaleFactor;
			this.s_bullet2infos.y_speed = this.s_bullet2infos.y_speed*this.currentScaleFactor;
			this.s_bullet2infos.accel_x = this.s_bullet2infos.accel_x*this.currentScaleFactor;
			this.s_bullet2infos.accel_y = this.s_bullet2infos.accel_y*this.currentScaleFactor;
			this.s_bullet2infos.jeak_x = this.s_bullet2infos.jeak_x*this.currentScaleFactor;
			this.s_bullet2infos.jeak_y = this.s_bullet2infos.jeak_y*this.currentScaleFactor;
			this.s_bullet2infos.bulled_maxSpeed = this.s_bullet2infos.bulled_maxSpeed*this.currentScaleFactor;
			this.s_bullet2infos.bulled_size_mag = this.s_bullet2infos.bulled_size_mag*this.currentScaleFactor;	
		}

		if(this.isvalidbulled(this.s_bullet3infos) == true){
			this.s_bullet3infos.x_speed = this.s_bullet3infos.x_speed*this.currentScaleFactor;
			this.s_bullet3infos.y_speed = this.s_bullet3infos.y_speed*this.currentScaleFactor;
			this.s_bullet3infos.accel_x = this.s_bullet3infos.accel_x*this.currentScaleFactor;
			this.s_bullet3infos.accel_y = this.s_bullet3infos.accel_y*this.currentScaleFactor;
			this.s_bullet3infos.jeak_x = this.s_bullet3infos.jeak_x*this.currentScaleFactor;
			this.s_bullet3infos.jeak_y = this.s_bullet3infos.jeak_y*this.currentScaleFactor;
			this.s_bullet3infos.bulled_maxSpeed = this.s_bullet3infos.bulled_maxSpeed*this.currentScaleFactor;
			this.s_bullet3infos.bulled_size_mag = this.s_bullet3infos.bulled_size_mag*this.currentScaleFactor;	
		}

		if(this.isvalidbulled(this.s_bullet4infos) == true){ // isvalidbulled は this.isvalidbulled と仮定
            this.s_bullet4infos.x_speed = this.s_bullet4infos.x_speed * this.currentScaleFactor;
            this.s_bullet4infos.y_speed = this.s_bullet4infos.y_speed * this.currentScaleFactor;
            this.s_bullet4infos.accel_x = this.s_bullet4infos.accel_x * this.currentScaleFactor;
            this.s_bullet4infos.accel_y = this.s_bullet4infos.accel_y * this.currentScaleFactor;
            this.s_bullet4infos.jeak_x = this.s_bullet4infos.jeak_x * this.currentScaleFactor; // "jerk" のことかと思われますが、変数名を維持
            this.s_bullet4infos.jeak_y = this.s_bullet4infos.jeak_y * this.currentScaleFactor; // 同上
            this.s_bullet4infos.bulled_maxSpeed = this.s_bullet4infos.bulled_maxSpeed * this.currentScaleFactor;
            this.s_bullet4infos.bulled_size_mag = this.s_bullet4infos.bulled_size_mag * this.currentScaleFactor;
        }


		if(this.isvalidbulled(this.s_bullet5infos) == true){ // isvalidbulled は this.isvalidbulled と仮定
            this.s_bullet5infos.x_speed = this.s_bullet5infos.x_speed * this.currentScaleFactor;
            this.s_bullet5infos.y_speed = this.s_bullet5infos.y_speed * this.currentScaleFactor;
            this.s_bullet5infos.accel_x = this.s_bullet5infos.accel_x * this.currentScaleFactor;
            this.s_bullet5infos.accel_y = this.s_bullet5infos.accel_y * this.currentScaleFactor;
            this.s_bullet5infos.jeak_x = this.s_bullet5infos.jeak_x * this.currentScaleFactor; // "jerk" のことかと思われますが、変数名を維持
            this.s_bullet5infos.jeak_y = this.s_bullet5infos.jeak_y * this.currentScaleFactor; // 同上
            this.s_bullet5infos.bulled_maxSpeed = this.s_bullet5infos.bulled_maxSpeed * this.currentScaleFactor;
            this.s_bullet5infos.bulled_size_mag = this.s_bullet5infos.bulled_size_mag * this.currentScaleFactor;
        }


    }

    // プレイヤーの移動ロジック
    move(keys, deltaTime) {

        this.dx = 0;
        this.dy = 0;

        if (keys.ArrowUp && this.y > 0) this.dy = -1;
        else if (keys.ArrowDown && this.y < this.canvas.height - this.y) this.dy = 1;
        if (keys.ArrowLeft && this.x > 0) this.dx = -1;
        else if (keys.ArrowRight && this.x < this.canvas.width - this.y) this.dx = 1;

        const magnitude = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
        let moveX = 0;
        let moveY = 0;
        if (magnitude > 0) {
            moveX = (this.dx / magnitude) * this.speed * deltaTime;
            moveY = (this.dy / magnitude) * this.speed * deltaTime;
        }

        this.x += moveX;
        this.y += moveY;

        // 境界からはみ出ないように最終調整
        this.x = Math.max(0, Math.min(this.x, this.canvas.width - this.radius));
        this.y = Math.max(0, Math.min(this.y, this.canvas.height - this.radius));

        if (this.bulletCooldownTimer > 0) {
            this.bulletCooldownTimer -= deltaTime; // タイマーも deltaTime で減算
            if (this.bulletCooldownTimer < 0) this.bulletCooldownTimer = 0;
        }
    }

	// main弾のインスタンスを作成する
	// bulletのwaittimeは外でやる
	createBulletInstance(playerBulletsArray, bulletinfos, enemyInstance)
	{
		if(this.isvalidbulled(bulletinfos)==true){
			const scaledBulletWidth = this.getScaledBulletWidth();
			const scaledBulletHeight = this.getScaledBulletHeight();
			const startX = this.x + this.getScaledWidth() / 2;
			const startY = this.y;

			const bulletOptions = {
				vy: -this.getScaledBulletSpeedY(), 
				vx: this.getScaledBulletSpeedX(),
				width: scaledBulletWidth, height: scaledBulletHeight, isCircle: false,
				color: this.bulletColor, damage: this.bulletDamage, life: this.bulletHP,
				maxSpeed: this.getScaledBulletSpeedY(),
				target: enemyInstance, // 追尾する場合
				trackingStrength: 0.0 // 0なら追尾しない。追尾させる場合は0より大きい値
			};

			playerBulletsArray.push(new BulletPlayer(startX, startY - this.bulletHeight / 2, bulletOptions));
		}

	}

	// sub弾のインスタンスを作成する
    shoot(playerBulletsArray, BulletClass, enemyInstance, deltaTime) {

        if (this.hp <= 0) return;


        // 各弾を発射する


		// mainbullet1
		if (this.waittime_mbullet1 > 0) { // クールダウン中かチェック
            this.waittime_mbullet1 -= deltaTime; // クールダウンタイマーを減算
            if (this.waittime_mbullet1 < 0) this.bulletTimer = 0;
        }else
		{
			// m_bullet1が打てる
			this.createBulletInstance(playerBulletsArray, this.m_bullet1infos, enemyInstance);
			this.waittime_mbullet1 = this.m_bullet1infos.rate; // クールダウン再セット
		}

        // mainbullet2
		if (this.waittime_mbullet2 > 0) { // クールダウン中かチェック
            this.waittime_mbullet2 -= deltaTime; // クールダウンタイマーを減算
            if (this.waittime_mbullet2 < 0) this.bulletTimer = 0;
        }else
		{
			// m_bullet1が打てる
			this.createBulletInstance(playerBulletsArray, this.m_bullet2infos, enemyInstance);
			this.waittime_mbullet2 = this.m_bullet2infos.rate; // クールダウン再セット
		}

		 // subbullet1
		 if (this.waittime_sbullet1 > 0) { // クールダウン中かチェック
            this.waittime_sbullet1 -= deltaTime; // クールダウンタイマーを減算
            if (this.waittime_sbullet1 < 0) this.bulletTimer = 0;
        }else
		{
			// m_bullet1が打てる
			this.createBulletInstance(playerBulletsArray, this.s_bullet1infos, enemyInstance);
			this.waittime_sbullet1 = this.s_bullet1infos.rate; // クールダウン再セット
		}

		 // subbullet2
		 if (this.waittime_sbullet2 > 0) { // クールダウン中かチェック
            this.waittime_sbullet2 -= deltaTime; // クールダウンタイマーを減算
            if (this.waittime_sbullet2 < 0) this.bulletTimer = 0;
        }else
		{
			// m_bullet2が打てる
			this.createBulletInstance(playerBulletsArray, this.s_bullet2infos, enemyInstance);
			this.waittime_sbullet2 = this.s_bullet2infos.rate; // クールダウン再セット
		}


		 // subbullet3
		 if (this.waittime_sbullet3 > 0) { // クールダウン中かチェック
            this.waittime_sbullet3 -= deltaTime; // クールダウンタイマーを減算
            if (this.waittime_sbullet3 < 0) this.bulletTimer = 0;
        }else
		{
			// m_bullet3が打てる
			this.createBulletInstance(playerBulletsArray, this.s_bullet3infos, enemyInstance);
			this.waittime_sbullet3 = this.s_bullet3infos.rate; // クールダウン再セット
		}

		 // subbullet4
		 if (this.waittime_sbullet4 > 0) { // クールダウン中かチェック
            this.waittime_sbullet4 -= deltaTime; // クールダウンタイマーを減算
            if (this.waittime_sbullet4 < 0) this.bulletTimer = 0;
        }else
		{
			// m_bullet4が打てる
			this.createBulletInstance(playerBulletsArray, this.s_bullet4infos, enemyInstance);
			this.waittime_sbullet4 = this.s_bullet4infos.rate; // クールダウン再セット
		}
		
		// subbullet5
		if (this.waittime_sbullet5 > 0) { // クールダウン中かチェック
		this.waittime_sbullet5 -= deltaTime; // クールダウンタイマーを減算
		if (this.waittime_sbullet5 < 0) this.bulletTimer = 0;
		}else
		{
			// m_bullet5が打てる
			this.createBulletInstance(playerBulletsArray, this.s_bullet5infos, enemyInstance);
			this.waittime_sbullet5 = this.s_bullet5infos.rate; // クールダウン再セット
		}	

    }

    // プレイヤーの描画ロジック
    draw(ctx) {
        ctx.fillStyle = this.color;
		
        ctx.fillRect(this.x, this.y, this.width, this.height);
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

