// ==================================================================
// ★★★ Bullet クラスの定義 (新規追加) ★★★
// ==================================================================


export class BulletPlayer {
    constructor(startX, startY, options = {}) {
        this.x = startX;
        this.y = startY;

        // 速度と加速度 (ベクトルで管理)
        this.vx = options.vx !== undefined ? options.vx : 0; // X方向の初速
        this.vy = options.vy !== undefined ? options.vy : 0; // Y方向の初速
        this.ax = options.ax !== undefined ? options.ax : 0; // X方向の加速度
        this.ay = options.ay !== undefined ? options.ay : 0; // Y方向の加速度
		this.jx = options.jx !== undefined ? options.jx : 0; // X方向の加加速度
        this.jy = options.jy !== undefined ? options.jy : 0; // Y方向の加加速度

        this.radius = options.radius !== undefined ? options.radius : 5; // 円形弾の場合
        this.width = options.width !== undefined ? options.width : 5;   // 矩形弾の場合
        this.height = options.height !== undefined ? options.height : 10; // 矩形弾の場合
        this.isCircle = options.isCircle !== undefined ? options.isCircle : true; // trueなら円形、falseなら矩形

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
    }
    getScaledWidth() { return this.width * this.currentScaleFactor; }
    getScaledHeight() { return this.height * this.currentScaleFactor; }
    getScaledSpeed() { return this.speed * this.currentScaleFactor; }
    getScaledBulletSpeedX() { return this.bulletSpeedX * this.currentScaleFactor; }
    getScaledBulletSpeedY() { return this.bulletSpeedY * this.currentScaleFactor; }
    getScaledBulletWidth() { return this.bulletWidth * this.currentScaleFactor; }
    getScaledBulletHeight() { return this.BulletHeight * this.currentScaleFactor; }
        // ブラウザの解像度比に合わせて動作を変える
    updateScale(newScaleFactor, newCanvas) {
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

    }


    update(deltaTime, targetPlayer) {
        if (this.isHit) return;

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

        // 5. 位置更新
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
    }

    draw(ctx) {
        if (this.isHit) return;
        ctx.fillStyle = this.color;
        if (this.isCircle) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
        } else {
           // 矩形弾の描画は中心基準に修正
            ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
        }
    }
}