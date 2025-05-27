// ==================================================================
// ★★★ プレイヤー クラスの定義 ★★★
// ==================================================================

export class Player {
    constructor(x, y, options = {}) {
        this.x = x;
        this.y = y;
		this.width = options.width !== undefined ? options.width : 20;
        this.height = options.height !== undefined ? options.height : 20;
        this.speed = options.speed !== undefined ? options.speed : 5;
        this.dx = 0;
        this.dy = 0;
        this.color = options.color !== undefined ? options.color : 'skyblue';
        this.maxHp = options.maxHp !== undefined ? options.maxHp : 100;
        this.hp = this.maxHp;
        this.bulletCooldownTimer = options.bulletCooldownTimer !== undefined ? options.bulletCooldownTimer : 0;
        this.bulletHP = options.bulletHP !== undefined ? options.bulletHP : 180;

	// 弾のパラメータ
	this.bulletSpeed = options.bulletSpeed !== undefined ? options.bulletSpeed : 7;
	this.bulletCooldown = options.bulletCooldown !== undefined ? options.bulletCooldown : 10;
	this.bulletDamage = options.bulletDamage !== undefined ? options.bulletDamage : 25;
	// プレイヤー弾の半透明化は色指定で行う
	this.bulletColor = options.bulletColor !== undefined ? options.bulletColor : 'rgba(0, 255, 0, 0.5)'; // デフォルトはライムグリーン半透明
	this.bulletWidth = options.bulletWidth !== undefined ? options.bulletWidth : 5;
	this.bulletHeight = options.bulletHeight !== undefined ? options.bulletHeight : 10;
		
    }

    // プレイヤーの移動ロジック
    move() {
        this.dx = 0;
        this.dy = 0;
        if (keys.ArrowUp && this.y > 0) this.dy = -this.speed;
        if (keys.ArrowDown && this.y < canvas.height - this.height) this.dy = this.speed;
        if (keys.ArrowLeft && this.x > 0) this.dx = -this.speed;
        if (keys.ArrowRight && this.x < canvas.width - this.width) this.dx = this.speed;
        this.x += this.dx;
        this.y += this.dy;

        if (this.bulletCooldownTimer > 0) {
            this.bulletCooldownTimer--;
        }
    }

    shoot() {
        if (this.hp <= 0 || this.bulletCooldownTimer > 0) return;

        // 発射位置 (通常はプレイヤーから)
        conststartX = this.x + this.width / 2;
        const startY = this.y; // プレイヤーの上部から

        // 弾のパラメータ設定
        const bulletOptions = {
            vy: -this.bulletSpeed, // Y方向に負の速度 (上向き)
            vx: 0,                  // X方向の速度は0 (まっすぐ上)
            width: this.bulletWidth,
            height: this.bulletHeight,
            isCircle: false,        // プレイヤーの弾は矩形
            color: this.bulletColor,
            damage: this.bulletDamage,
            life: this.bulletHP,
            maxSpeed: this.bulletSpeed // 直進弾なのでmaxSpeedも同じ
        };

        playerBullets.push(new Bullet(startX, startY - this.bulletHeight / 2, bulletOptions));
        this.bulletCooldownTimer = this.bulletCooldown;
    }

    // プレイヤーの描画ロジック
    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    // プレイヤーのHPバー描画ロジック
    drawHpBar() {
        const barX = 10;
        const barY = canvas.height - HP_BAR_HEIGHT - 10;
        const currentHpWidth = (this.hp / this.maxHp) * PLAYER_HP_BAR_WIDTH;
        ctx.fillStyle = 'grey';
        ctx.fillRect(barX, barY, PLAYER_HP_BAR_WIDTH, HP_BAR_HEIGHT);
        ctx.fillStyle = (this.hp / this.maxHp < 0.3) ? 'red' : 'green';
        ctx.fillRect(barX, barY, currentHpWidth > 0 ? currentHpWidth : 0, HP_BAR_HEIGHT);
        ctx.strokeStyle = 'white';
        ctx.strokeRect(barX, barY, PLAYER_HP_BAR_WIDTH, HP_BAR_HEIGHT);
    }
}

