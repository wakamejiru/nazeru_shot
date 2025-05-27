// script.js (メインファイル)
import { Player } from './player.js';
import { Enemy } from './enemy.js';
import { Bullet } from './bullet.js'; // Bulletクラスもインポート

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// キャンバスのサイズ設定
canvas.width = 600;
canvas.height = 800;

// HPバーの設定
const HP_BAR_HEIGHT = 10; // HPバーの太さ（高さ）
const PLAYER_HP_BAR_WIDTH = 100; // プレイヤーHPバーの横幅

// --- インスタンス生成 ---
let player = new Player(canvas.width / 2 - 10, canvas.height - 40, {
    color: 'blue', maxHp: 150, bulletDamage: 30, bulletColor: 'rgba(0, 150, 255, 0.6)'
});
let enemy = new Enemy(canvas.width / 2 - 20, 50, {
    width: 60, height: 60, color: 'purple', maxHp: 1000, speed: 0.5,
    bulletSpeed: 3, bulletDamage: 20, bulletInterval: 15, bulletSpreadCount: 16
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

function createBullet(x, y, direction, speed, options = {}) {
    return {
        x,
        y,
        direction, // {x: dx, y: dy}
        speed,
        variation: options.variation || { x: 0, y: 0 },
        radius: options.radius || 5,
        color: options.color || 'yellow',
        damage: options.damage || 10,
        life: options.life || 300,
        isHit: false,
        update: function () {
            this.x += (this.direction.x + this.variation.x) * this.speed;
            this.y += (this.direction.y + this.variation.y) * this.speed;
            this.life--;
        }
    };
}

// 弾の描画
function drawEnemyBullets() {
    bullets.forEach(bullet => bullet.draw());
}

function drawPlayerBullets() {
    playerBullets.forEach(bullet => bullet.draw());
}

// 敵の弾の移動と画面外判定
function moveEnemyBullets() {
	bullets = bullets.filter(bullet => {
        if (bullet.isHit) return false;
        bullet.update();
        return bullet.x > -bullet.radius && bullet.x < canvas.width + bullet.radius && // 画面外判定 (円形弾用)
               bullet.y > -bullet.radius && bullet.y < canvas.height + bullet.radius &&
               (bullet.life > 0); // 体力が0より大きい
    });
}

// プレイヤーの弾の移動と画面外判定
function movePlayerBullets() {
    playerBullets = playerBullets.filter(bullet => {
        if (bullet.isHit) return false;
        bullet.update();
        // プレイヤー弾は矩形なので、当たり判定用の幅/高さで画面外判定
        const b = bullet; // エイリアス
        return b.x + b.width/2 > 0 && b.x - b.width/2 < canvas.width &&
               b.y + b.height/2 > 0 && b.y - b.height/2 < canvas.height &&
               (b.life > 0);
    });
}

// 当たり判定 (プレイヤーと敵の弾)
function checkCollisions() {
	if (isGameOver || isGameWin) return;

    // 1. 敵の弾(円形)とプレイヤー(矩形)の当たり判定
    bullets.forEach(bullet => {
        if (bullet.isHit || player.hp <= 0 || !bullet.isCircle) return; // 円形弾のみ対象とする例
        // (以前の円と矩形の当たり判定ロジックをここに記述、bullet.radius, player.width, player.height を使用)
        // 簡単な例:
        if (player.x < bullet.x + bullet.radius &&
            player.x + player.width > bullet.x - bullet.radius &&
            player.y < bullet.y + bullet.radius &&
            player.y + player.height > bullet.y - bullet.radius) {
                // より正確な判定が必要
                const distX = Math.abs(bullet.x - player.x - player.width / 2);
                const distY = Math.abs(bullet.y - player.y - player.height / 2);
                if (distX <= (player.width / 2 + bullet.radius) && distY <= (player.height / 2 + bullet.radius)) { // 大まかな接触
                     // ここでさらに詳細な判定（角との距離など）を入れるのが望ましい
                    if (distX <= player.width / 2 || distY <= player.height / 2) { // 中心軸上が近い
                        player.hp -= bullet.damage;
                        bullet.isHit = true;
                        if (player.hp <= 0) { player.hp = 0; gameOver(); return; }
                    } else { // 角の場合
                        const dxCorner = distX - player.width / 2;
                        const dyCorner = distY - player.height / 2;
                        if (dxCorner * dxCorner + dyCorner * dyCorner <= (bullet.radius * bullet.radius)) {
                            player.hp -= bullet.damage;
                            bullet.isHit = true;
                            if (player.hp <= 0) { player.hp = 0; gameOver(); return; }
                        }
                    }
                }
        }
    });

    // 2. プレイヤーの弾(矩形)と敵(矩形)の当たり判定
    playerBullets.forEach(pBullet => {
        if (pBullet.isHit || !enemy || enemy.hp <= 0 || pBullet.isCircle) return; // 矩形弾のみ対象とする例
        if (
            pBullet.x - pBullet.width/2 < enemy.x + enemy.width &&
            pBullet.x + pBullet.width/2 > enemy.x &&
            pBullet.y - pBullet.height/2 < enemy.y + enemy.height &&
            pBullet.y + pBullet.height/2 > enemy.y
        ) {
            enemy.hp -= pBullet.damage;
            pBullet.isHit = true;
            if (enemy.hp <= 0) { enemy.hp = 0; gameWin(); return; }
        }
    });
}

let isGameOver = false; // 追加: ゲームオーバー状態フラグ
let isGameWin = false;  // 追加: ゲーム勝利状態フラグ
function gameOver() { isGameOver = true; cancelAnimationFrame(animationFrameId); /* 画面表示 */ }
function gameWin() { isGameWin = true; cancelAnimationFrame(animationFrameId); /* 画面表示 */ }
function clearCanvas() { ctx.clearRect(0, 0, canvas.width, canvas.height); }

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
    if (isGameOver || isGameWin) return;
    clearCanvas();

    player.move();
    if (enemy) enemy.move();

    player.shoot();
    if (enemy) enemy.shoot();

    moveEnemyBullets();
    movePlayerBullets();

    player.draw();
    if (enemy) enemy.draw();

    drawEnemyBullets();
    drawPlayerBullets();

    player.drawHpBar();
    if (enemy) enemy.drawHpBar();

    checkCollisions();
    animationFrameId = requestAnimationFrame(gameLoop);
}
gameLoop();