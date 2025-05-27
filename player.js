// ==================================================================
// ★★★ プレイヤー クラスの定義 ★★★
// ==================================================================

export class Player {
    constructor(x, y, canvas, options = {}) {
        this.x = x;
        this.y = y;
        this.canvas = canvas; // canvasオブジェクトを保持
        this.width = options.width !== undefined ? options.width : 20;
        this.height = options.height !== undefined ? options.height : 20;
        this.speed = options.speed !== undefined ? options.speed : 300; // ピクセル/秒
        this.dx = 0; // 移動方向ベクトルX (-1, 0, 1)
        this.dy = 0; // 移動方向ベクトルY (-1, 0, 1)
        this.color = options.color !== undefined ? options.color : 'skyblue';
        this.maxHp = options.maxHp !== undefined ? options.maxHp : 100;
        this.hp = this.maxHp;
        this.bulletHP = options.bulletHP !== undefined ? options.bulletHP : 1;

        // 弾のパラメータ
        this.bulletRadius = options.bulletRadius !== undefined ? options.bulletRadius : 5;        
        this.bulletSpeed = options.bulletSpeed !== undefined ? options.bulletSpeed : 450; // ピクセル/秒
        this.bulletInterval = options.bulletInterval !== undefined ? options.bulletInterval : 0.4;
        this.bulletDamage = options.bulletDamage !== undefined ? options.bulletDamage : 25;
        this.bulletColor = options.bulletColor !== undefined ? options.bulletColor : 'rgba(0, 255, 0, 0.5)';
        this.bulletHP = options.bulletHP !== undefined ? options.bulletHP : 1; // 弾の体力
        this.bulletAngle = 0;
        this.bulletTimer = 0;
        this.bulletWidth = options.bulletWidth !== undefined ? options.bulletWidth : 5;
        this.bulletHeight = options.bulletHeight !== undefined ? options.bulletHeight : 10;
    }

    // プレイヤーの移動ロジック
    move(keys, deltaTime) {
        this.dx = 0;
        this.dy = 0;
        if (keys.ArrowUp && this.y > 0) this.dy = -1; else if (keys.ArrowDown && this.y < this.canvas.height - this.height) this.dy = 1;
        if (keys.ArrowLeft && this.x > 0) this.dx = -1; else if (keys.ArrowRight && this.x < this.canvas.width - this.width) this.dx = 1;

        // 正規化して斜め移動も同じ速度にする（任意）
        const magnitude = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
        if (magnitude > 0) {
            this.dx /= magnitude;
            this.dy /= magnitude;
        }

        this.x += this.dx * this.speed * deltaTime; // ★ 速度に deltaTime を掛ける
        this.y += this.dy * this.speed * deltaTime; // ★ 速度に deltaTime を掛ける

        if (this.bulletCooldownTimer > 0) {
            this.bulletCooldownTimer -= deltaTime; // ★ タイマーも deltaTime で減算
        }
    }

    shoot(playerBulletsArray, BulletClass, enemyInstance, deltaTime) {
        if (this.bulletTimer > 0) { // ★ クールダウン中かチェック
            this.bulletTimer -= deltaTime; // ★ クールダウンタイマーを減算
            if (this.bulletTimer < 0) this.bulletTimer = 0;
            return;
        }
        this.bulletTimer = this.bulletInterval; // ★ クールダウン再セット

        const startX = this.x + this.width / 2;
        const startY = this.y;

        const bulletOptions = {
            vy: -this.bulletSpeed, 
            vx: 0,
            width: this.bulletWidth, height: this.bulletHeight, isCircle: false,
            color: this.bulletColor, damage: this.bulletDamage, life: this.bulletHP,
            maxSpeed: this.bulletSpeed,
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
    drawHpBar(ctx, HP_BAR_HEIGHT, PLAYER_HP_BAR_WIDTH) {
        const barX = 10;
        const barY = this.canvas.height - HP_BAR_HEIGHT - 10;
        const currentHpWidth = (this.hp / this.maxHp) * PLAYER_HP_BAR_WIDTH;
        ctx.fillStyle = 'grey';
        ctx.fillRect(barX, barY, PLAYER_HP_BAR_WIDTH, HP_BAR_HEIGHT);
        ctx.fillStyle = (this.hp / this.maxHp < 0.3) ? 'red' : 'green';
        ctx.fillRect(barX, barY, currentHpWidth > 0 ? currentHpWidth : 0, HP_BAR_HEIGHT);
        ctx.strokeStyle = 'white';
        ctx.strokeRect(barX, barY, PLAYER_HP_BAR_WIDTH, HP_BAR_HEIGHT);
    }
}

