// ==================================================================
// ★★★ プレイヤー クラスの定義 ★★★
// ==================================================================

export class Player {
    constructor(x, y, canvas, options = {}) {

        this.x = x; // Playerの位置X
        this.y = y; // Playerの位置Y
        this.canvas = canvas; // canvasオブジェクト
        this.width = options.width !== undefined ? options.width : 20; // Playerの幅
        this.height = options.height !== undefined ? options.height : 20; // Playerの高さ
        this.speed = options.speed !== undefined ? options.speed : 300; //  Playerの移動速度
        this.dx = 0; // 移動方向ベクトルX (-1, 0, 1)
        this.dy = 0; // 移動方向ベクトルY (-1, 0, 1)
        this.color = options.color !== undefined ? options.color : 'skyblue'; // Playerの色
        this.maxHp = options.maxHp !== undefined ? options.maxHp : 100; // PlayerのHP
        this.hp = this.maxHp; // 現在のPlayerのHP

        // 弾のパラメータ
        this.bulletHP = options.bulletHP !== undefined ? options.bulletHP : 1; // 弾のHP
        this.bulletRadius = options.bulletRadius !== undefined ? options.bulletRadius : 5; // 弾の半径       
        this.bulletSpeedY = options.bulletSpeed_y !== undefined ? options.bulletSpeed_y : 450; // 弾の縦方向の移動速度ピクセル/秒
        this.bulletSpeedX = options.bulletSpeed_x !== undefined ? options.bulletSpeed_x : 450; // 弾の縦方向の移動速度ピクセル/秒
        this.bulletInterval = options.bulletInterval !== undefined ? options.bulletInterval : 0.4; // 弾の出る間隔
        this.bulletDamage = options.bulletDamage !== undefined ? options.bulletDamage : 25; // 弾の一発のダメージ
        this.bulletColor = options.bulletColor !== undefined ? options.bulletColor : 'rgba(0, 255, 0, 0.5)'; // 弾の色
        this.bulletHP = options.bulletHP !== undefined ? options.bulletHP : 1; // 弾の体力
        this.bulletAngle = 0; // 弾の出力角度
        this.bulletTimer = 0; // 弾の生き残る時間
        this.bulletWidth = options.bulletWidth !== undefined ? options.bulletWidth : 5; // 弾の幅
        this.bulletHeight = options.bulletHeight !== undefined ? options.bulletHeight : 10; // 弾の縦幅
    }

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

    getScaledWidth() { return this.width * this.currentScaleFactor; }
    getScaledHeight() { return this.height * this.currentScaleFactor; }
    getScaledSpeed() { return this.speed * this.currentScaleFactor; }
    getScaledBulletSpeedX() { return this.bulletSpeedX * this.currentScaleFactor; }
    getScaledBulletSpeedY() { return this.bulletSpeedY * this.currentScaleFactor; }
    getScaledBulletWidth() { return this.bulletWidth * this.currentScaleFactor; }
    getScaledBulletHeight() { return this.BulletHeight * this.currentScaleFactor; }


    // プレイヤーの移動ロジック
    move(keys, deltaTime) {
        this.dx = 0;
        this.dy = 0;
        if (keys.ArrowUp && this.y > 0) this.dy = -1;
        else if (keys.ArrowDown && this.y < this.canvas.height - this.getScaledHeight()) this.dy = 1;
        if (keys.ArrowLeft && this.x > 0) this.dx = -1;
        else if (keys.ArrowRight && this.x < this.canvas.width - this.getScaledWidth()) this.dx = 1;

        const magnitude = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
        let moveX = 0;
        let moveY = 0;
        if (magnitude > 0) {
            moveX = (this.dx / magnitude) * this.getScaledSpeedX() * deltaTime;
            moveY = (this.dy / magnitude) * this.getScaledSpeedY() * deltaTime;
        }
        this.x += moveX;
        this.y += moveY;

        // 境界からはみ出ないように最終調整
        this.x = Math.max(0, Math.min(this.x, this.canvas.width - this.getScaledWidth()));
        this.y = Math.max(0, Math.min(this.y, this.canvas.height - this.getScaledHeight()));

        if (this.bulletCooldownTimer > 0) {
            this.bulletCooldownTimer -= deltaTime; // タイマーも deltaTime で減算
            if (this.bulletCooldownTimer < 0) this.bulletCooldownTimer = 0;
        }
    }

    shoot(playerBulletsArray, BulletClass, enemyInstance, deltaTime) {

        if (this.hp <= 0 || this.bulletCooldownTimer > 0) return;

        const scaledBulletWidth = this.getScaledBulletWidth();
        const scaledBulletHeight = this.getScaledBulletHeight();
        const startX = this.x + this.getScaledWidth() / 2;
        const startY = this.y;


        if (this.bulletTimer > 0) { // クールダウン中かチェック
            this.bulletTimer -= deltaTime; // クールダウンタイマーを減算
            if (this.bulletTimer < 0) this.bulletTimer = 0;
            return;
        }
        this.bulletTimer = this.bulletInterval; // クールダウン再セット

        const bulletOptions = {
            vy: -this.getScaledBulletSpeedY(), 
            vx: this.getScaledBulletSpeedX(),
            width: scaledBulletWidth, height: scaledBulletHeight, isCircle: false,
            color: this.bulletColor, damage: this.bulletDamage, life: this.bulletHP,
            maxSpeed: this.getScaledBulletSpeedY(),
            target: enemyInstance, // 追尾する場合
            trackingStrength: 0.0 // 0なら追尾しない。追尾させる場合は0より大きい値
};
        // BulletClass を使ってインスタンス化
        playerBulletsArray.push(new BulletClass(startX, startY - this.bulletHeight / 2, bulletOptions));
        this.bulletCooldownTimer = this.bulletCooldown;
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

