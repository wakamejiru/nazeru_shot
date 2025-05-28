// script.js (メインファイル)
import { Player } from './player.js';
import { Enemy } from './enemy.js';
import { Bullet } from './bullet.js'; // Bulletクラスもインポート
import { CharacterTypeEnum, imageAssetPaths } from './game_status.js'; // game_status.js から必要なものをインポート
import { AssetManager } from './asset_manager.js'; // AssetManagerをインポート

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// キャンバスのサイズ設定
const BASE_WIDTH = 800;  // ゲームの基準幅
const BASE_HEIGHT = 1000; // ゲームの基準高さ
let currentWidth = BASE_WIDTH;
let currentHeight = BASE_HEIGHT;
let scaleFactor = 1;     // 現在のスケールファクター

// HPバーの設定
const HP_BAR_HEIGHT = 30; // HPバーの太さ（高さ）
const PLAYER_HP_BAR_WIDTH = 250; // プレイヤーHPバーの横幅

let player;

// 画像のローリングを行う
const assetManager = new AssetManager(imageAssetPaths); // imageAssetPaths は game_status.js からエクスポート


// 初期化を実行する
async function initializeGame() {
    try {
        await assetManager.loadAllAssets();
        console.log("All assets loaded.");

        const selectedCharType = CharacterTypeEnum.TYPE_1; // 例

        player = new Player(
            selectedCharType,
            assetManager,
            canvas
		);

        // Enemy インスタンスの生成 (Player と同様に assetManager や characterType を渡す)
        // enemy = new Enemy( BASE_WIDTH / 2, BASE_HEIGHT * 0.2, canvas, EnemyTypeEnum.TYPE_A, assetManager );


        resizeGame(); // 初期リサイズとスケール設定、Playerの位置もここで調整される
        requestAnimationFrame(gameLoop);

    } catch (error) {
        console.error("Failed to initialize game:", error);
    }
}



// let enemy = new Enemy(canvas.width / 2 - 20, 50, canvas, {
//     width: 60, height: 60, color: 'purple', maxHp: 1000, speed: 30,
//     bulletSpeedY: 170,bulletSpeedX: 0, bulletDamage: 20, bulletInterval: 0.3, bulletSpreadCount: 30
// });

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

function handleResize() {
    // ウィンドウサイズが変わったときに行いたい処理をここに書く
    console.log("ウィンドウサイズが変更されました！");
    console.log("新しい幅:", window.innerWidth, "新しい高さ:", window.innerHeight);

    // 例えば、ここでキャンバスのサイズを調整する関数を呼び出す
    // resizeGame(); // ← あなたのゲームのキャンバスリサイズ関数
}


// 画面リサイズ処理関数
function resizeGame() {
    const aspectRatio = BASE_WIDTH / BASE_HEIGHT;
    let newWindowWidth = window.innerWidth;
    let newWindowHeight = window.innerHeight;
    const windowAspectRatio = newWindowWidth / newWindowHeight;

    if (windowAspectRatio > aspectRatio) {
        // ウィンドウがゲームよりも横長の場合、高さを基準に合わせる
        currentHeight = newWindowHeight;
        currentWidth = currentHeight * aspectRatio;
        scaleFactor = currentHeight / BASE_HEIGHT;
    } else {
        // ウィンドウがゲームよりも縦長（または同じ比率）の場合、幅を基準に合わせる
        currentWidth = newWindowWidth;
        currentHeight = currentWidth / aspectRatio;
        scaleFactor = currentWidth / BASE_WIDTH;
    }

    canvas.width = currentWidth;
    canvas.height = currentHeight;

    // CSSで中央揃えにする場合（例）
    canvas.style.position = 'absolute';
    canvas.style.left = (window.innerWidth - currentWidth) / 2 + 'px';
    canvas.style.top = (window.innerHeight - currentHeight) / 2 + 'px';

    // TODO: 必要であれば、既存のゲームオブジェクトの位置やサイズを再計算
    // (ただし、各オブジェクトが描画時や更新時にスケールファクターやcanvas.{width|height}を
    //  参照するようになっていれば、ここでの大規模な再計算は不要な場合も多い)
    if (player) {
        player.updateScale(scaleFactor, canvas); // Playerクラスにスケール更新メソッドを追加する例
    }
    // if (enemy) {
    //     enemy.updateScale(scaleFactor, canvas);   // Enemyクラスにスケール更新メソッドを追加する例
    // }
}


// 弾の描画
// function drawEnemyBullets(ctx) {
//     bullets.forEach(bullet => bullet.draw(ctx));
// }

// function drawPlayerBullets(ctx) {
//     playerBullets.forEach(bullet => bullet.draw(ctx));
// }

// 敵の弾の移動と画面外判定
// function moveEnemyBullets(deltaTime, playerInstance) {
//     bullets = bullets.filter(bullet => {
//         if (bullet.isHit) return false;
//         bullet.update(deltaTime, playerInstance); // 追尾対象としてplayerインスタンスを渡す例
//         // 画面外判定などは bullet.x, bullet.y, bullet.radius/width/height を使う
//         return bullet.x > - (bullet.isCircle ? bullet.radius : bullet.width/2) &&
//                bullet.x < canvas.width + (bullet.isCircle ? bullet.radius : bullet.width/2) &&
//                bullet.y > - (bullet.isCircle ? bullet.radius : bullet.height/2) &&
//                bullet.y < canvas.height + (bullet.isCircle ? bullet.radius : bullet.height/2) &&
//                (bullet.life > 0);
//     });
// }

// プレイヤーの弾の移動と画面外判定
// function movePlayerBullets(deltaTime, playerInstance) {
//     playerBullets = playerBullets.filter(bullet => {
//         if (bullet.isHit) return false;
//         bullet.update(deltaTime, playerInstance); // プレイヤー弾が追尾しないなら引数なし
//         const b = bullet;
//         return b.x + b.width/2 > 0 && b.x - b.width/2 < canvas.width &&
//                b.y + b.height/2 > 0 && b.y - b.height/2 < canvas.height &&
//                (b.life > 0);
//     });
// }

// 当たり判定 (プレイヤーと敵の弾)
// function checkCollisions() {
// 	if (isGameOver || isGameWin) return;

//     // 1. 敵の弾(円形)とプレイヤー(矩形)の当たり判定
//     bullets.forEach(bullet => {
//         if (isGameOver || isGameWin) return; // 円形弾のみ対象とする例
//         // (以前の円と矩形の当たり判定ロジックをここに記述、bullet.radius, player.width, player.height を使用)
//         if (bullet.isCircle) { // 敵の弾は円形と仮定
//             const scaledBulletRadius = bullet.getBaseRadius() * scaleFactor;
//             const scaledPlayerWidth = player.getBaseWidth() * scaleFactor;
//             const scaledPlayerHeight = player.getBaseHeight() * scaleFactor;

//             const didCollide = (function() {
//                 let closestX = Math.max(player.x, Math.min(bullet.x, player.x + scaledPlayerWidth));
//                 let closestY = Math.max(player.y, Math.min(bullet.y, player.y + scaledPlayerHeight));
//                 const distanceX = bullet.x - closestX;
//                 const distanceY = bullet.y - closestY;
//                 const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);
//                 return distanceSquared < (scaledBulletRadius * scaledBulletRadius);
//             })();
        

//             if (didCollide) { // ★★★ ここが衝突条件の結果です ★★★
//                 player.hp -= bullet.damage;
//                 bullet.isHit = true;
//                 if (player.hp <= 0) {
//                     player.hp = 0;
//                     gameOver();
//                     return; // gameOverが呼ばれたらこのforEachループ内の処理はこれ以上不要
//                 }
//             }
//         }
//     });

//     // 2. プレイヤーの弾(矩形)と敵(矩形)の当たり判定
//     playerBullets.forEach(pBullet => {
//         if (pBullet.isHit || !enemy || enemy.hp <= 0) return;
//         if (!pBullet.isCircle && enemy) { // プレイヤー弾(矩形)と敵(矩形)
//             const scaledPBulletWidth = pBullet.getBaseWidth() * scaleFactor;
//             const scaledPBulletHeight = pBullet.getBaseHeight() * scaleFactor;
//             const scaledEnemyWidth = enemy.getBaseWidth() * scaleFactor;
//             const scaledEnemyHeight = enemy.getBaseHeight() * scaleFactor;

//             if (pBullet.x - scaledPBulletWidth/2 < enemy.x + scaledEnemyWidth &&
//                 pBullet.x + scaledPBulletWidth/2 > enemy.x &&
//                 pBullet.y - scaledPBulletHeight/2 < enemy.y + scaledEnemyHeight &&
//                 pBullet.y + scaledPBulletHeight/2 > enemy.y) {
//                         enemy.hp -= pBullet.damage;
//                         pBullet.isHit = true;
//                         if (enemy.hp <= 0) { enemy.hp = 0; gameWin(); return; }
//                     }
//                 }
//     });
// }

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
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2);
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
// 画面のリフレッシュレート違いによる問題を解消
let lastTime = 0;

function gameLoop(currentTime) {
    if (isGameOver || isGameWin) {
        requestAnimationFrame(gameLoop); // 終了画面のためループを続ける場合
        return;
    }

    if (!lastTime) { // 最初のフレームの初期化
        lastTime = currentTime;
        requestAnimationFrame(gameLoop);
        return;
    }
    const deltaTime = (currentTime - lastTime) / 1000; // 秒単位
    lastTime = currentTime;

    // ゼロ除算や極端なdeltaTimeを防ぐ（ブラウザがバックグラウンドになった場合など）
    const clampedDeltaTime = Math.min(deltaTime, 0.1); // 例: 最大0.1秒に制限

    clearCanvas();

    player.move(keys, clampedDeltaTime);
    //if (enemy) enemy.move(clampedDeltaTime);

    //player.shoot(playerBullets, Bullet, enemy, clampedDeltaTime); // deltaTimeは直接不要（クールダウンはmoveで処理）
    //if (enemy) enemy.shoot(bullets, Bullet, player, clampedDeltaTime); // 追尾用にplayer, タイマー更新用にdeltaTime

    //moveEnemyBullets(clampedDeltaTime, player); // 追尾対象としてplayerを渡す
    //movePlayerBullets(clampedDeltaTime, enemy);

    player.draw(ctx);
   // if (enemy) enemy.draw(ctx);

    //drawEnemyBullets(ctx);
   // drawPlayerBullets(ctx);

    player.drawHpBar(ctx, HP_BAR_HEIGHT, PLAYER_HP_BAR_WIDTH);
    //if (enemy) enemy.drawHpBar(ctx, HP_BAR_HEIGHT);

//    checkCollisions(); // deltaTimeは通常不要

    animationFrameId = requestAnimationFrame(gameLoop);
}

// --- 初期化処理 ---
// リサイズしたときに自動的にリスナーが走る
window.addEventListener('resize', handleResize);
initializeGame();