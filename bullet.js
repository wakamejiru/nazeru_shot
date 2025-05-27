// ==================================================================
// ★★★ Bullet クラスの定義 (新規追加) ★★★
// ==================================================================
export class Bullet {
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
        this.trackingStrength = options.trackingStrength || 0; // 追尾の強さ (0なら追尾しない)
        this.maxSpeed = options.maxSpeed || Math.sqrt(this.vx**2 + this.vy**2) || 5; // 追尾時の最大速度など

        // 方向変化用 (将来の拡張用)
        this.turnRate = options.turnRate || 0; // 旋回率 (ラジアン/フレーム)
        this.timeToLivePattern = options.timeToLivePattern || Infinity; // パターン変更までの時間
        this.currentPatternTime = 0;
    }

    update() {
        if (this.isHit) return;

        // 1. 追尾処理 (将来的に実装)
        if (this.target && this.trackingStrength > 0) {
            const targetDx = this.target.x + (this.target.width ? this.target.width / 2 : 0) - this.x;
            const targetDy = this.target.y + (this.target.height ? this.target.height / 2 : 0) - this.y;
            const angleToTarget = Math.atan2(targetDy, targetDx);

            // 現在の進行方向の角度
            let currentAngle = Math.atan2(this.vy, this.vx);

            // ターゲットへの角度と現在の角度の差
            let angleDiff = angleToTarget - currentAngle;
            // 角度差を -PI から PI の範囲に正規化
            while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
            while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

            // 追尾強度に基づいて旋回
            let turnStep = this.trackingStrength * (Math.PI / 180); // 例: trackingStrengthが1なら1度/フレーム
            if (Math.abs(angleDiff) < turnStep) {
                currentAngle = angleToTarget;
            } else {
                currentAngle += Math.sign(angleDiff) * turnStep;
            }
            const speedMagnitude = Math.sqrt(this.vx**2 + this.vy**2) || this.maxSpeed; // 現在の速度か最大速度
            this.vx = Math.cos(currentAngle) * speedMagnitude;
            this.vy = Math.sin(currentAngle) * speedMagnitude;
        }

		// 2. 加加速度による加速度の変化
		this.ax += this.jx;
		this.ay += this.jy;
		
        // 3. 加速度による速度変化
        this.vx += this.ax;
        this.vy += this.ay;

        // (オプション) 最大速度制限
        const currentSpeedSq = this.vx**2 + this.vy**2;
        if (currentSpeedSq > this.maxSpeed**2 && this.maxSpeed > 0) {
             const currentSpeed = Math.sqrt(currentSpeedSq);
             this.vx = (this.vx / currentSpeed) * this.maxSpeed;
             this.vy = (this.vy / currentSpeed) * this.maxSpeed;
        }


        // 4. 時間経過による方向変化 (旋回など、将来的に実装)
        if (this.turnRate !== 0) {
            const cos = Math.cos(this.turnRate);
            const sin = Math.sin(this.turnRate);
            const newVx = this.vx * cos - this.vy * sin;
            const newVy = this.vx * sin + this.vy * cos;
            this.vx = newVx;
            this.vy = newVy;
        }

        // 5. 位置更新
        this.x += this.vx;
        this.y += this.vy;
    }

    draw() {
        if (this.isHit) return;
        ctx.fillStyle = this.color;
        if (this.isCircle) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.closePath();
        } else {
            ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
        }
    }
}