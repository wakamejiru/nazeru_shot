// script.js
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// キャンバスのサイズ設定
canvas.width = 600;
canvas.height = 800;

// ゲームの基本設定
const PLAYER_SIZE = 20;
const PLAYER_SPEED = 5;
const BULLET_RADIUS = 5;
const ENEMY_SIZE = 40;

const PLAYER_BULLET_SPEED = 7; // プレイヤーの弾の速度
const PLAYER_BULLET_COOLDOWN = 10; // プレイヤーの弾の発射間隔 (フレーム)

// HPバーの設定
const HP_BAR_HEIGHT = 10; // HPバーの太さ（高さ）
const PLAYER_HP_BAR_WIDTH = 100; // プレイヤーHPバーの横幅

const PLAYER_BULLET_DAMAGE = 20; // プレイヤーの弾のダメージ
const ENEMY_BULLET_DAMAGE = 10;  // 敵の弾のダメージ

// プレイヤーオブジェクト
let player = {
    x: canvas.width / 2 - PLAYER_SIZE / 2,
    y: canvas.height - PLAYER_SIZE * 2,
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    dx: 0,
    dy: 0,
    color: 'skyblue',
	bulletCooldownTimer: 0, // プレイヤーの弾発射クールダウン用タイマー
    maxHp: 100, // 最大HP
    hp: 100      // 現在のHP
};

// 敵オブジェクト
let enemy = {
    x: canvas.width / 2 - ENEMY_SIZE / 2,
    y: 100,
    width: ENEMY_SIZE,
    height: ENEMY_SIZE,
    color: 'red',
    bulletAngle: 0, // 弾の発射角度
    bulletTimer: 0, // 弾の発射間隔タイマー
    bulletInterval: 20, // 弾の発射間隔 (フレーム数)
	maxHp: 500,  // 追加: 最大HP (例として大きめの値)
    hp: 500       // 追加: 現在のHP
};

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

// プレイヤーの描画
function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

// 敵の描画
function drawEnemy() {
    ctx.fillStyle = enemy.color;
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
}

// 弾の描画
function drawBullets() {
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

function drawPlayerHpBar() {
    const barX = 10; // 左端からのマージン
    const barY = canvas.height - HP_BAR_HEIGHT - 10; // 下端からのマージン
    const currentHpWidth = (player.hp / player.maxHp) * PLAYER_HP_BAR_WIDTH;

    // HPバー背景
    ctx.fillStyle = 'grey';
    ctx.fillRect(barX, barY, PLAYER_HP_BAR_WIDTH, HP_BAR_HEIGHT);

    // 現在のHP
    ctx.fillStyle = 'green';
    if (player.hp / player.maxHp < 0.3) { // HPが30%未満なら赤色に
        ctx.fillStyle = 'red';
    }
    ctx.fillRect(barX, barY, currentHpWidth > 0 ? currentHpWidth : 0, HP_BAR_HEIGHT); // HPが0未満にならないように

    // HPバー枠線 (任意)
    ctx.strokeStyle = 'white';
    ctx.strokeRect(barX, barY, PLAYER_HP_BAR_WIDTH, HP_BAR_HEIGHT);
}

// 追加: 敵のHPバー描画
function drawEnemyHpBar() {
    const barX = 0; // キャンバスの左端
    const barY = 0; // キャンバスの上端
    const barWidth = canvas.width; // キャンバスの幅いっぱい
    const currentHpWidth = (enemy.hp / enemy.maxHp) * barWidth;

    // HPバー背景 (敵のHPバーなので少し暗めの赤など)
    ctx.fillStyle = '#500000'; // 暗い赤
    ctx.fillRect(barX, barY, barWidth, HP_BAR_HEIGHT);

    // 現在のHP
    ctx.fillStyle = 'red'; // 明るい赤
    ctx.fillRect(barX, barY, currentHpWidth > 0 ? currentHpWidth : 0, HP_BAR_HEIGHT);

    // HPバー枠線 (任意)
    // ctx.strokeStyle = 'black';
    // ctx.strokeRect(barX, barY, barWidth, HP_BAR_HEIGHT);
}


// プレイヤーの移動処理
function movePlayer() {
    player.dx = 0;
    player.dy = 0;

    if (keys.ArrowUp && player.y > 0) {
        player.dy = -PLAYER_SPEED;
    }
    if (keys.ArrowDown && player.y < canvas.height - player.height) {
        player.dy = PLAYER_SPEED;
    }
    if (keys.ArrowLeft && player.x > 0) {
        player.dx = -PLAYER_SPEED;
    }
    if (keys.ArrowRight && player.x < canvas.width - player.width) {
        player.dx = PLAYER_SPEED;
    }

    player.x += player.dx;
    player.y += player.dy;

	// プレイヤーの弾発射クールダウンタイマー更新
	if (player.bulletCooldownTimer > 0) {
		player.bulletCooldownTimer--;
	}
}

// プレイヤーの弾発射処理
function playerShoot() {
    if (player.bulletCooldownTimer === 0) {
        const bulletWidth = 5;
        const bulletHeight = 10;
        playerBullets.push({
            x: player.x + player.width / 2 - bulletWidth / 2, // プレイヤーの中央から発射
            y: player.y - bulletHeight, // プレイヤーの上部から発射
            width: bulletWidth,
            height: bulletHeight,
            color: 'lime',
            speed: PLAYER_BULLET_SPEED
        });
        player.bulletCooldownTimer = PLAYER_BULLET_COOLDOWN; // クールダウン設定
    }
}


// 敵の弾発射ロジック (花火のように広がる)
function enemyShoot() {
    enemy.bulletTimer++;
    if (enemy.bulletTimer >= enemy.bulletInterval) {
        enemy.bulletTimer = 0;
        const spreadCount = 12; // 一度に発射する弾の数 (花火の骨組み)
        const angleStep = (Math.PI * 2) / spreadCount;

        for (let i = 0; i < spreadCount; i++) {
            const angle = enemy.bulletAngle + i * angleStep;
            const speed = 2; // 弾の基本速度

            bullets.push({
                x: enemy.x + enemy.width / 2,
                y: enemy.y + enemy.height / 2,
                radius: BULLET_RADIUS,
                color: 'yellow',
                speedX: Math.cos(angle) * speed,
                speedY: Math.sin(angle) * speed,
                // 弾の挙動を制御するためのプロパティ (例: life, type)
				life: 180,
				age: 0, // 弾が生成されてからの時間
				initialSpeed: 2,
				accelerationTime: 60, // 加速を開始する時間
				acceleratedSpeed: 5,
				type: 'accelerate', // 弾の種類を識別
				update: function() {
					this.age++;
					let currentSpeed = this.initialSpeed;
					if (this.age > this.accelerationTime) {
						currentSpeed = this.acceleratedSpeed;
					}
			
					this.x += Math.cos(this.initialAngle) * currentSpeed; // initialAngle を保存しておく必要あり
					this.y += Math.sin(this.initialAngle) * currentSpeed;
					this.life--;
				},
				initialAngle: angle // 生成時の角度を保存
            });
        }
        // 次の発射角度を少しずらす (回転する花火のような効果)
        enemy.bulletAngle += Math.PI / 36; // 5度ずつ回転
    }
}

// 敵の弾の移動と画面外判定
function moveEnemyBullets() {
    bullets = bullets.filter(bullet => {
		if (bullet.isHit) return false; // 当たった弾は消す
        bullet.update(); // 各弾の独自の更新ロジックを呼び出す
        return bullet.x > -bullet.radius && bullet.x < canvas.width + bullet.radius &&
               bullet.y > -bullet.radius && bullet.y < canvas.height + bullet.radius &&
               bullet.life > 0; // 生存時間もチェック
    });
}

// 追加: プレイヤーの弾の移動と画面外判定
function movePlayerBullets() {
    playerBullets = playerBullets.filter(bullet => {
		if (bullet.isHit) return false; // 当たった弾は消す
        bullet.y -= bullet.speed; // 上に移動
        return bullet.y + bullet.height > 0; // 画面上部から出たら消去
    });
}

// 当たり判定 (プレイヤーと敵の弾)
function checkCollisions() {
    if (isGameOver || isGameWin) return; // ゲーム終了時は当たり判定しない

    // 1. 敵の弾とプレイヤーの当たり判定
    bullets.forEach(bullet => {
        if (bullet.isHit) return; // 既に当たった弾は無視

        // 円(弾)と矩形(プレイヤー)の当たり判定 (既存のロジックを流用)
        const distX = Math.abs(bullet.x - player.x - player.width / 2);
        const distY = Math.abs(bullet.y - player.y - player.height / 2);

        let hit = false;
        if (distX <= (player.width / 2) && distY <= (player.height / 2)) { // 中心点が矩形内
            hit = true;
        } else if (distX <= (player.width / 2) && distY <= (player.height / 2 + bullet.radius)) { // 上下辺
             if (distY <= (player.height / 2)) hit = true;
        } else if (distY <= (player.height / 2) && distX <= (player.width / 2 + bullet.radius) ) { // 左右辺
             if (distX <= (player.width / 2)) hit = true;
        } else {
            // 角との判定
            const dxCorner = distX - player.width / 2;
            const dyCorner = distY - player.height / 2;
            if (dxCorner * dxCorner + dyCorner * dyCorner <= (bullet.radius * bullet.radius)) {
                hit = true;
            }
        }

        if (hit) {
            player.hp -= ENEMY_BULLET_DAMAGE;
            bullet.isHit = true; // 弾に当たったフラグを立てる
            console.log(`プレイヤーHP: ${player.hp}/${player.maxHp}`);

            if (player.hp <= 0) {
                player.hp = 0; // HPがマイナスにならないように
                gameOver();
                return; // ゲームオーバーなので以降の判定は不要
            }
        }
    });


	// 2. プレイヤーの弾と敵の当たり判定
    playerBullets.forEach(pBullet => {
        if (pBullet.isHit) return; // 既に当たった弾は無視
        if (!enemy || enemy.hp <= 0) return; // 敵が存在しない、または既にHP0なら判定しない

        // 矩形(プレイヤー弾)と矩形(敵)の当たり判定
        if (
            pBullet.x < enemy.x + enemy.width &&
            pBullet.x + pBullet.width > enemy.x &&
            pBullet.y < enemy.y + enemy.height &&
            pBullet.y + pBullet.height > enemy.y
        ) {
            enemy.hp -= PLAYER_BULLET_DAMAGE;
            pBullet.isHit = true; // 弾に当たったフラグを立てる
            console.log(`敵HP: ${enemy.hp}/${enemy.maxHp}`);

            if (enemy.hp <= 0) {
                enemy.hp = 0; // HPがマイナスにならないように
                // ここで敵を画面から消す処理などを入れても良い (今回は勝利判定のみ)
                gameWin();
                return; // 勝利なので以降の判定は不要
            }
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
	if (isGameOver || isGameWin) { // ゲーム終了時はループの主要な更新を停止
        requestAnimationFrame(gameLoop); // 終了画面の描画は継続するためループ自体は呼び続けることも考慮
                                      // もし完全に停止でよければここも条件分岐
        return;
    }
    clearCanvas();

    movePlayer();
    enemyShoot(); // 敵が常に弾を撃つ
	playerShoot(); // プレイヤーも常に球を打つ
    moveEnemyBullets();
	movePlayerBullets();  // プレイヤーの弾移動

    drawPlayer();
	
	if (enemy.hp > 0) { // 敵のHPがある場合のみ描画 (任意)
        drawEnemy();
    }

    drawBullets();
	drawPlayerBullets();

    drawPlayerHpBar(); // 追加: プレイヤーHPバー描画
    drawEnemyHpBar();  // 追加: 敵HPバー描画

    checkCollisions();

    animationFrameId = requestAnimationFrame(gameLoop);
}

// ゲーム開始
gameLoop();