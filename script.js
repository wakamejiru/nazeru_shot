// script.js
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// キャンバスのサイズ設定
canvas.width = 600;
canvas.height = 800;

// HPバーの設定
const HP_BAR_HEIGHT = 10; // HPバーの太さ（高さ）
const PLAYER_HP_BAR_WIDTH = 100; // プレイヤーHPバーの横幅


// ==================================================================
// ★★★ Player クラスの定義 ★★★
// ==================================================================
class Player {
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
        this.bulletCooldownTimer = 0;

	// 弾のパラメータ
	this.bulletSpeed = options.bulletSpeed !== undefined ? options.bulletSpeed : 7;
	this.bulletCooldown = options.bulletCooldown !== undefined ? options.bulletCooldown : 10;
	this.bulletDamage = options.bulletDamage !== undefined ? options.bulletDamage : 25;
	// プレイヤー弾の半透明化は色指定で行う
	this.bulletColor = options.bulletColor !== undefined ? options.bulletColor : 'rgba(0, 255, 0, 0.5)'; // デフォルトはライムグリーン半透明
	this.bulletWidth = options.bulletWidth !== undefined ? options.bulletWidth : 5;
	this.bulletHeight = options.bulletHeight !== undefined ? options.bulletHeight : 10;

    }

    // プレイヤーの移動ロジック (元の movePlayer 関数に近い)
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

    // プレイヤーの弾発射ロジック (元の playerShoot 関数に近い)
    shoot() {
        if (this.bulletCooldownTimer === 0) {
            playerBullets.push({
                x: this.x + this.width / 2 - this.bulletWidth / 2,
                y: this.y - this.bulletHeight,
                width: this.bulletWidth,
                height: this.bulletHeight,
                color: this.bulletColor, // 自身の弾の色を使用
                speed: this.bulletSpeed, // 自身の弾の速度を使用
                damage: this.bulletDamage, // 自身の弾の威力を使用
                isHit: false
            });
            this.bulletCooldownTimer = this.bulletCooldown;
        }
    }

    // プレイヤーの描画ロジック (元の drawPlayer 関数に近い)
    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    // プレイヤーのHPバー描画ロジック (元の drawPlayerHpBar 関数に近い)
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



// ==================================================================
// ★★★ Enemy クラスの定義 ★★★
// ==================================================================
class Enemy {
    constructor(x, y, options = {}) {
		this.x = x;
        this.y = y;
        this.width = options.width !== undefined ? options.width : 40;
        this.height = options.height !== undefined ? options.height : 40;
        this.speed = options.speed !== undefined ? options.speed : 1;
        this.color = options.color !== undefined ? options.color : 'red';
        this.maxHp = options.maxHp !== undefined ? options.maxHp : 500;
        this.hp = this.maxHp;

        // 弾のパラメータ
        this.bulletRadius = options.bulletRadius !== undefined ? options.bulletRadius : 5;
        this.bulletSpeed = options.bulletSpeed !== undefined ? options.bulletSpeed : 2.5;
        this.bulletInterval = options.bulletInterval !== undefined ? options.bulletInterval : 25;
        this.bulletDamage = options.bulletDamage !== undefined ? options.bulletDamage : 15;
        this.bulletColor = options.bulletColor !== undefined ? options.bulletColor : 'yellow';
        this.bulletAngle = 0;
        this.bulletTimer = 0;
        this.bulletSpreadCount = options.bulletSpreadCount !== undefined ? options.bulletSpreadCount : 12;

        // 移動用プロパティ (移動範囲の計算に自身のサイズを使用するため、サイズ設定後に定義)
        this.moveDirectionX = 0;
        this.moveDirectionY = 0;
        this.moveChangeTimer = 0;
        this.moveChangeInterval = options.moveChangeInterval !== undefined ? options.moveChangeInterval : 100;
        this.moveAreaTopY = 0;
        this.moveAreaBottomY = canvas.height / 5 - this.height; //自身のheightを参照
        this.moveAreaLeftX = 0;
        this.moveAreaRightX = canvas.width - this.width; //自身のwidthを参照
    }

    // 敵の移動ロジック (元の moveEnemy 関数に近い)
    move() {
        if (this.hp <= 0) return;
        this.moveChangeTimer--;
        if (this.moveChangeTimer <= 0) {
            this.moveDirectionX = Math.floor(Math.random() * 3) - 1;
            this.moveDirectionY = Math.floor(Math.random() * 3) - 1;
            if (this.moveDirectionX === 0 && this.moveDirectionY === 0) {
                if (Math.random() < 0.5) this.moveDirectionX = Math.random() < 0.5 ? -1 : 1;
                else this.moveDirectionY = Math.random() < 0.5 ? -1 : 1;
            }
            this.moveChangeTimer = this.moveChangeInterval;
        }
        let nextX = this.x + this.moveDirectionX * this.speed;
        if (nextX < this.moveAreaLeftX) { nextX = this.moveAreaLeftX; this.moveDirectionX *= -1; this.moveChangeTimer = 0; }
        else if (nextX > this.moveAreaRightX) { nextX = this.moveAreaRightX; this.moveDirectionX *= -1; this.moveChangeTimer = 0; }
        this.x = nextX;
        let nextY = this.y + this.moveDirectionY * this.speed;
        if (nextY < this.moveAreaTopY) { nextY = this.moveAreaTopY; this.moveDirectionY *= -1; this.moveChangeTimer = 0; }
        else if (nextY > this.moveAreaBottomY) { nextY = this.moveAreaBottomY; this.moveDirectionY *= -1; this.moveChangeTimer = 0; }
        this.y = nextY;
    }

    // 敵の弾発射ロジック (元の enemyShoot 関数に近い)
    shoot() {
        if (this.hp <= 0) return;
        this.bulletTimer++;
        if (this.bulletTimer >= this.bulletInterval) {
            this.bulletTimer = 0;
            const angleStep = (Math.PI * 2) / this.bulletSpreadCount;
            for (let i = 0; i < this.bulletSpreadCount; i++) {
                const angle = this.bulletAngle + i * angleStep;
                bullets.push({
                    x: this.x + this.width / 2,
                    y: this.y + this.height / 2,
                    radius: this.bulletRadius,
                    color: this.bulletColor,    // 自身の弾の色
                    speedX: Math.cos(angle) * this.bulletSpeed, // 自身の弾の速度
                    speedY: Math.sin(angle) * this.bulletSpeed,
                    damage: this.bulletDamage,  // 自身の弾の威力
                    life: 180, // 弾の生存時間
                    isHit: false,
                    // 弾のupdateメソッドもここに定義できる（今回はシンプルに）
                    update: function() {
                        this.x += this.speedX;
                        this.y += this.speedY;
                        this.life--;
                    }
                });
            }
            this.bulletAngle += Math.PI / 36;
        }
    }

    // 敵の描画ロジック (元の drawEnemy 関数に近い)
    draw() {
        if (this.hp <= 0) return; // HP0なら描画しない
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    // 敵のHPバー描画ロジック (元の drawEnemyHpBar 関数に近い)
    drawHpBar() {
        if (this.hp <= 0 && this.maxHp <=0) return; // HP0の敵はバー表示しない (maxHp <=0 は初期化失敗など考慮)
        const barX = 0;
        const barY = 0;
        const barWidth = canvas.width;
        const currentHpWidth = (this.hp / this.maxHp) * barWidth;
        ctx.fillStyle = '#500000';
        ctx.fillRect(barX, barY, barWidth, HP_BAR_HEIGHT);
        ctx.fillStyle = 'red';
        ctx.fillRect(barX, barY, currentHpWidth > 0 ? currentHpWidth : 0, HP_BAR_HEIGHT);
    }
}

// プレイヤーオブジェクト
let player = new Player(canvas.width / 2 - 10, canvas.height - 40, {
    // ここでプレイヤーのパラメータをカスタマイズできます
    // 例:
    color: 'blue',
    maxHp: 150,
    bulletDamage: 30,
    bulletColor: 'rgba(0, 150, 255, 0.6)'
	});

// 敵オブジェクト
let enemy = new Enemy(canvas.width / 2 - 20, 50, {
    // ここで敵のパラメータをカスタマイズできます
    // 例:
    // width: 60,
    // height: 60,
    // color: 'purple',
    // maxHp: 1000,
    // speed: 0.5,
    // bulletSpeed: 3,
    // bulletDamage: 20,
    // bulletInterval: 15,
    // bulletSpreadCount: 16
});

// 弾を格納する配列
let bullets = []; // 敵の弾
let playerBullets = []; //プレイヤーの弾
// キー入力状態
const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
	' ': false // スペースキー (キー名は ' ' または 'Space'、ブラウザにより異なる場合があるので注意)
};

// キーダウンイベント
document.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = true;
    } else if (e.key === ' ') { // 'Spacebar' となるブラウザもあるため、' ' もしくは e.code === 'Space' で判定するとより確実
        keys[' '] = true;
    }
});

// キーアップイベント
document.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = false;
    } else if (e.key === ' ') {
        keys[' '] = false;
    }
});


// 弾の描画
function drawEnemyBullets() {
    bullets.forEach(bullet => {
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
        ctx.fillStyle = bullet.color;
        ctx.fill();
        ctx.closePath();
    });
}

function drawPlayerBullets() {
    playerBullets.forEach(bullet => {
        ctx.fillStyle = bullet.color; // プレイヤーの弾の色
        // プレイヤーの弾を四角形として描画する場合
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
}

// 敵の弾の移動と画面外判定
function moveEnemyBullets() {
    bullets = bullets.filter(bullet => {
        if (bullet.isHit) return false;
        if (bullet.update) bullet.update(); // 弾固有のupdateがあれば実行
        else { // デフォルトの直線移動
            bullet.x += bullet.speedX;
            bullet.y += bullet.speedY;
            if(bullet.life) bullet.life--; // lifeがあれば減算
        }
        return bullet.x > -bullet.radius && bullet.x < canvas.width + bullet.radius &&
               bullet.y > -bullet.radius && bullet.y < canvas.height + bullet.radius &&
               (bullet.life === undefined || bullet.life > 0); // lifeが未定義か0より大きい
    });
}

// プレイヤーの弾の移動と画面外判定
function movePlayerBullets() {
    playerBullets = playerBullets.filter(bullet => {
        if (bullet.isHit) return false;
        bullet.y -= bullet.speed;
        return bullet.y + bullet.height > 0;
    });
}

// 当たり判定 (プレイヤーと敵の弾)
function checkCollisions() {
	if (isGameOver || isGameWin) return;

    // 1. 敵の弾とプレイヤーの当たり判定
    bullets.forEach(bullet => {
        if (bullet.isHit || player.hp <= 0) return;
        // ... (当たり判定ロジックは player.width, player.height を参照) ...
        const distX = Math.abs(bullet.x - player.x - player.width / 2);
        const distY = Math.abs(bullet.y - player.y - player.height / 2);
        // (簡易的な当たり判定のまま。必要なら以前のより詳細なものに戻す)
        if (distX < player.width / 2 + bullet.radius && distY < player.height / 2 + bullet.radius) {
            // もう少し正確な円と矩形の接触判定が必要な場合は以前のロジックを参考にしてください
            // ここでは簡易的に中心間の距離である程度代用
            const dx = bullet.x - (player.x + player.width / 2);
            const dy = bullet.y - (player.y + player.height / 2);
            const distance = Math.sqrt(dx*dx + dy*dy);
            // 実際にはもっとちゃんとした円と矩形の衝突判定が必要です
            // ここでは弾の中心がプレイヤー矩形内にあるかで判定を簡略化
            if (bullet.x > player.x && bullet.x < player.x + player.width &&
                bullet.y > player.y && bullet.y < player.y + player.height) {
                player.hp -= bullet.damage; // ★ 弾オブジェクトの威力を使用
                bullet.isHit = true;
                if (player.hp <= 0) { player.hp = 0; gameOver(); return; }
            }
        }
    });

    // 2. プレイヤーの弾と敵の当たり判定
    playerBullets.forEach(pBullet => {
        if (pBullet.isHit || !enemy || enemy.hp <= 0) return;
        if (
            pBullet.x < enemy.x + enemy.width &&
            pBullet.x + pBullet.width > enemy.x &&
            pBullet.y < enemy.y + enemy.height &&
            pBullet.y + pBullet.height > enemy.y
        ) {
            enemy.hp -= pBullet.damage; // ★ 弾オブジェクトの威力を使用
            pBullet.isHit = true;
            if (enemy.hp <= 0) { enemy.hp = 0; gameWin(); return; }
        }
    });
}

let isGameOver = false; // 追加: ゲームオーバー状態フラグ
let isGameWin = false;  // 追加: ゲーム勝利状態フラグ

// ゲームオーバー処理
function gameOver() {
   if (isGameOver) return; // 既にゲームオーバーなら何もしない
    isGameOver = true;
    console.log("ゲームオーバー！");
    cancelAnimationFrame(animationFrameId);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = '40px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText('ゲームオーバー', canvas.width / 2, canvas.height / 2);
}

// ゲーム勝利処理
function gameWin() {
    if (isGameWin) return; // 既に勝利なら何もしない
    isGameWin = true;
    console.log("勝利！");
    cancelAnimationFrame(animationFrameId);
    ctx.fillStyle = 'rgba(0, 128, 0, 0.7)'; // 緑っぽい背景
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = '60px Arial';
    ctx.fillStyle = 'yellow';
    ctx.textAlign = 'center';
    ctx.fillText('勝利！', canvas.width / 2, canvas.height / 2);
}

// 描画のクリア
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

let animationFrameId; // ゲームループのIDを保持

// ゲームループ
function gameLoop() {
	if (isGameOver || isGameWin) {
        // requestAnimationFrame(gameLoop); // 終了画面描画のためループは継続しても良い
        return;
    }
    clearCanvas();

    player.move();
    if (enemy) enemy.move(); // 敵が存在すれば動かす

    player.shoot();
    if (enemy) enemy.shoot(); // 敵が存在すれば撃つ

    moveEnemyBullets();
    movePlayerBullets();

    player.draw();
    if (enemy) enemy.draw(); // 敵が存在すれば描画

    drawEnemyBullets(); // 敵の弾描画関数名を変更
    drawPlayerBullets();

    player.drawHpBar();
    if (enemy) enemy.drawHpBar(); // 敵が存在すればHPバー描画

    checkCollisions();

    animationFrameId = requestAnimationFrame(gameLoop);
}

// ゲーム開始
gameLoop();