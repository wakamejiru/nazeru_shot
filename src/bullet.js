import { CharacterTypeEnum, SkillTypeEnum, UltTypeEnum, MainBulletEnum, SubBulletEnum, 
	character_info_list, skill_info_list,  ult_info_list, main_bulled_info_list, sub_bulled_info_list, imageAssetPaths} from './game_status.js'; // Bulletクラスもインポート

// ==================================================================
// Bullet クラスの定義
// ==================================================================

// 打ち出した，設置した弾自体を制御するクラス
// 打ち出し，設置は各クラスで制御する
export class Bullet {
    // ひし形や三角，楕円の弾も扱えるようにする
    constructor(startX, startY, asset_manager, options = {}) {
        this.x = startX - options.width/2;
        this.y = startY;

        // 速度と加速度 (ベクトルで管理)
        this.vx = options.vx !== undefined ? options.vx : 0; // X方向の初速
        this.vy = options.vy !== undefined ? options.vy : 0; // Y方向の初速
        this.ax = options.ax !== undefined ? options.ax : 0; // X方向の加速度
        this.ay = options.ay !== undefined ? options.ay : 0; // Y方向の加速度
		this.jx = options.jx !== undefined ? options.jx : 0; // X方向の加加速度
        this.jy = options.jy !== undefined ? options.jy : 0; // Y方向の加加速度

        // 見た目の弾丸
        // 画像を使用する
        this.asset_manager = asset_manager;   // 画像などのアセットを管理
        this.BulletImageKey = options.BulletImageKey;
        // 画像読み込み
		this.spritebullet = this.BulletImageKey ? this.asset_manager.getImage(this.BulletImageKey) : null;
		if (this.BulletImageKey && !this.spritebullet) {
			console.warn(`Player sprite for key "${this.avatar_image_key}" not loaded. Fallback color will be used.`);
		}
        
        this.globalAlpha = options.globalAlpha !== undefined ? options.globalAlpha : 1; // 弾の透明度

        // 形状というより当たり判定
        this.shape = options.shape || 'rectangle'; // デフォルトは長方形
        this.width = options.width || 10;         // 形状に応じた幅 (例: 長方形の幅、楕円の横直径)
        this.height = options.height || 10;        // 形状に応じた高さ (例: 長方形の高さ、楕円の縦直径)
        this.orientation = options.orientation || 0; // 形状の向き (ラジアン)


        this.color = options.color || 'white';
        this.damage = options.damage || 10;
        this.life = options.life !== undefined ? options.life : 1; // 弾の体力 (時間では減らない現仕様)
        this.isHit = false;

        // 追尾用 (将来の拡張用)
        this.target = options.target || null; // 追尾対象 (Player や Enemy インスタンスなど)
        this.trackingStrength = options.trackingStrength !== undefined ?  options.trackingStrength : 0; // 追尾の強さ (0なら追尾しない)
        this.maxSpeed = options.maxSpeed !== undefined ? options.maxSpeed : 300; // ピクセル/秒


        // 方向変化用 (将来の拡張用)
        this.turnRate = options.turnRate || 0; // 旋回率 (ラジアン/フレーム)
        this.timeToLivePattern = options.timeToLivePattern || Infinity; // パターン変更までの時間
        this.currentPatternTime = 0;

        // サインカーブ用プロパティ
        this.sineWaveEnabled = options.sine_wave_enabled || false;
        this.initialSineAmplitude  = options.sine_amplitude || 0;
        this.sineAngularFrequency = options.sine_angular_frequency || 0;
        this.sinePhaseOffset = options.sine_phase_offset || 0;
        this.sineAxis = options.sine_axis || "x"; // "x"または"y"
        this.pathCenterX = startX; // サインカーブの中心線の初期X座標
        this.pathCenterY = startY; // サインカーブの中心線の初期Y座標
        this.sineDecayRate = options.sine_decay_rate;
        
        this.bulletLifeTimer = 0; // 弾が生成されてからの経過時間（サイン関数の時間入力に使う）

    }

    update(deltaTime, targetPlayer) {
        if (this.isHit) return;
        this.bulletLifeTimer += deltaTime;
        // 1. 追尾処理 (将来的に実装)
        if (this.target && this.trackingStrength > 0) { // targetPlayerの代わりにthis.targetを使う
            const targetCenterX = this.target.x + (this.target.width ? this.target.width / 2 : 0);
            const targetCenterY = this.target.y + (this.target.height ? this.target.height / 2 : 0);
            const targetDx = targetCenterX - this.x;
            const targetDy = targetCenterY - this.y;
            const angleToTarget = Math.atan2(targetDy, targetDx);

            // 現在の進行方向の角度
            let currentAngle = Math.atan2(this.vy, this.vx);

            // ターゲットへの角度と現在の角度の差
            let angleDiff = angleToTarget - currentAngle;
            // 角度差を -PI から PI の範囲に正規化
            while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
            while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

            // trackingStrength を「1秒間にどれだけターゲットに近づくか」の割合とするか、
            // 「1秒間に回転できる最大ラジアン」とするかで挙動が変わります。
            // ここでは「1秒間に angleDiff の trackingStrength 分だけ角度を補正する」イメージ
            let effectiveTurn = angleDiff * this.trackingStrength * deltaTime; // trackingStrengthが割合の場合
            // もしくは、最大旋回角速度として trackingStrength をラジアン/秒で定義する場合
            // let maxTurnThisFrame = this.trackingStrength * deltaTime;
            // let effectiveTurn = Math.max(-maxTurnThisFrame, Math.min(maxTurnThisFrame, angleDiff));

            currentAngle += effectiveTurn;

            const speedMagnitude = Math.sqrt(this.vx**2 + this.vy**2) || this.maxSpeed;

            this.vx = Math.cos(currentAngle) * speedMagnitude;
            this.vy = Math.sin(currentAngle) * speedMagnitude;
        }

		// 2. 加加速度による加速度の変化
		this.ax += this.jx * deltaTime;
		this.ay += this.jy * deltaTime;
		
        // 3. 加速度による速度変化
        this.vx += this.ax * deltaTime;
        this.vy += this.ay * deltaTime;

        // (オプション) 最大速度制限
        const currentSpeedSq = this.vx**2 + this.vy**2;
        if (this.maxSpeed > 0 && currentSpeedSq > this.maxSpeed**2 ) {
             const currentSpeed = Math.sqrt(currentSpeedSq);
             this.vx = (this.vx / currentSpeed) * this.maxSpeed;
             this.vy = (this.vy / currentSpeed) * this.maxSpeed;
        }


        // 4. 時間経過による方向変化 (自律旋回など、将来的に実装)
        if (this.turnRate !== 0) {
            const angleChange = this.turnRate * deltaTime;
            const cosVal = Math.cos(angleChange);
            const sinVal = Math.sin(angleChange);
            const newVx = this.vx * cosVal - this.vy * sinVal;
            const newVy = this.vx * sinVal + this.vy * cosVal;
            this.vx = newVx;
            this.vy = newVy;
        }

        // sin値による値の変化
        this.pathCenterX += this.vx * deltaTime;
        this.pathCenterY += this.vy * deltaTime;

        // 3. 最終的な描画位置 (this.x, this.y は左上) を計算
        let finalDrawX = this.pathCenterX - this.width / 2;
        let finalDrawY = this.pathCenterY - this.height / 2;

        if (this.sineWaveEnabled && this.initialSineAmplitude !== 0) {
            // ★現在の振幅を計算 (指数関数的減衰)
            let currentAmplitude = this.initialSineAmplitude;
            if (this.sineDecayRate > 0) {
                currentAmplitude = this.initialSineAmplitude * Math.exp(-this.sineDecayRate * this.bulletLifeTimer);
            }

            // 振幅が非常に小さくなったら、波の計算を省略してもよい (パフォーマンスのため)
            if (currentAmplitude > 0.01) { // 例: 0.01ピクセル未満は無視
                // X軸方向に揺れるサインカーブと仮定
                const offsetX = currentAmplitude * Math.sin(this.sineAngularFrequency * this.bulletLifeTimer + this.sinePhaseOffset);
                finalDrawX += offsetX;
            } else {
                // 振幅がほぼ0になったら、以降はサインカーブを無効にしても良い
                // this.sineWaveEnabled = false; 
            }
        }

        // 5. 位置更新
        this.x = finalDrawX;
        this.y = finalDrawY;
    }

    draw(ctx) {
        
        if (this.isHit) return;
        ctx.save(); // 現在の描画コンテキストの状態を保存する (globalAlphaなどの設定も含む)

        ctx.globalAlpha = this.globalAlpha;
        ctx.fillStyle = this.color;
        ctx.drawImage(this.spritebullet, this.x, this.y, this.width, this.height);

        ctx.restore();// 設定復活
    }
}