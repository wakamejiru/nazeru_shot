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
let enemy = new Enemy(canvas.width / 2 - 20, 50, canvas, {
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


// 弾の描画
function drawEnemyBullets(ctx) {
    bullets.forEach(bullet => bullet.draw(ctx));
}

function drawPlayerBullets(ctx) {
    playerBullets.forEach(bullet => bullet.draw(ctx));
}

// 敵の弾の移動と画面外判定
function moveEnemyBullets() {
    bullets = bullets.filter(bullet => {
        if (bullet.isHit) return false;
        bullet.update(player); // 追尾対象としてplayerインスタンスを渡す例
        // 画面外判定などは bullet.x, bullet.y, bullet.radius/width/height を使う
        return bullet.x > - (bullet.isCircle ? bullet.radius : bullet.width/2) &&
               bullet.x < canvas.width + (bullet.isCircle ? bullet.radius : bullet.width/2) &&
               bullet.y > - (bullet.isCircle ? bullet.radius : bullet.height/2) &&
               bullet.y < canvas.height + (bullet.isCircle ? bullet.radius : bullet.height/2) &&
               (bullet.life > 0);
    });
}

// プレイヤーの弾の移動と画面外判定
function movePlayerBullets() {
    playerBullets = playerBullets.filter(bullet => {
        if (bullet.isHit) return false;
        bullet.update(); // プレイヤー弾が追尾しないなら引数なし
        const b = bullet;
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
            // 衝突条件の判定
        const didCollide = (function() {
            let closestX = Math.max(player.x, Math.min(bullet.x, player.x + player.width));
            let closestY = Math.max(player.y, Math.min(bullet.y, player.y + player.height));

            const distanceX = bullet.x - closestX;
            const distanceY = bullet.y - closestY;
            const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);

            return distanceSquared < (bullet.radius * bullet.radius);
        })();

        if (didCollide) { // ★★★ ここが衝突条件の結果です ★★★
            player.hp -= bullet.damage;
            bullet.isHit = true;
            if (player.hp <= 0) {
                player.hp = 0;
                gameOver();
                return; // gameOverが呼ばれたらこのforEachループ内の処理はこれ以上不要
            }
        }
    });

    // 2. プレイヤーの弾(矩形)と敵(矩形)の当たり判定
    playerBullets.forEach(pBullet => {
        if (pBullet.isHit || !enemy || enemy.hp <= 0 || pBullet.isCircle) return; // 矩形弾のみ対象とする例
        if (!pBullet.isCircle && enemy) { // プレイヤー弾(矩形)と敵(矩形)
                    if (pBullet.x - pBullet.width/2 < enemy.x + enemy.width &&
                        pBullet.x + pBullet.width/2 > enemy.x &&
                        pBullet.y - pBullet.height/2 < enemy.y + enemy.height &&
                        pBullet.y + pBullet.height/2 > enemy.y) {
                        enemy.hp -= pBullet.damage;
                        pBullet.isHit = true;
                        if (enemy.hp <= 0) { enemy.hp = 0; gameWin(); return; }
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
    if (isGameOver || isGameWin) return;
    clearCanvas();

    player.move(keys, canvas); // keysとcanvasを渡す
    if (enemy) enemy.move(canvas);    // canvasを渡す

    player.shoot(playerBullets, Bullet); // playerBullets配列とBulletクラスそのものを渡す
    if (enemy) enemy.shoot(bullets, Bullet, player); // bullets配列、Bulletクラス、追尾対象playerを渡す

    moveEnemyBullets();    // playerインスタンスはbullet.update内で参照される(ようにした前提)
    movePlayerBullets();

    player.draw(ctx);
    if (enemy) enemy.draw(ctx);

    drawEnemyBullets(ctx); // グローバル関数を呼ぶ
    drawPlayerBullets(ctx);  // グローバル関数を呼ぶ

    player.drawHpBar(ctx, canvas, HP_BAR_HEIGHT, PLAYER_HP_BAR_WIDTH);
    if (enemy) enemy.drawHpBar(ctx, canvas, HP_BAR_HEIGHT);

    checkCollisions();
    animationFrameId = requestAnimationFrame(gameLoop);
}
gameLoop();