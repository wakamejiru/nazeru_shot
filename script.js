// script.js (メインファイル)
import { Player } from './player.js';
import { Enemy } from './enemy.js';
import { Bullet } from './bullet.js'; // Bulletクラスもインポート
import { CharacterTypeEnum, imageAssetPaths, character_info_list, EnemyTypeEnum } from './game_status.js'; // game_status.js から必要なものをインポート
import { AssetManager } from './asset_manager.js'; // AssetManagerをインポート

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// キャンバスのサイズ設定
const BASE_WIDTH = 600;  // ゲームの基準幅
const BASE_HEIGHT = 800; // ゲームの基準高さ
let currentWidth = BASE_WIDTH;
let currentHeight = BASE_HEIGHT;
let scaleFactor = 1;     // 現在のスケールファクター

// HPバーの設定
const HP_BAR_HEIGHT = 20; // HPバーの太さ（高さ）
const PLAYER_HP_BAR_WIDTH = 150; // プレイヤーHPバーの横幅

let player;
let enemy;

// 画像のローリングを行う
const assetManager = new AssetManager(imageAssetPaths); // imageAssetPaths は game_status.js からエクスポート

// デバッグ用キーとキャラクタータイプをマッピング
const keyToCharacterType = {
    '1': CharacterTypeEnum.TYPE_1,
    '2': CharacterTypeEnum.TYPE_2,
    '3': CharacterTypeEnum.TYPE_3,
    '4': CharacterTypeEnum.TYPE_4,
    '5': CharacterTypeEnum.TYPE_5,
    '6': CharacterTypeEnum.TYPE_6,
    '7': CharacterTypeEnum.TYPE_7,
    '8': CharacterTypeEnum.TYPE_8,
    '9': CharacterTypeEnum.TYPE_9,

};

// 初期化を実行する
async function initializeGame() {
    try {
        await assetManager.loadAllAssets();
        console.log("All assets loaded.");

        const selectedCharType = CharacterTypeEnum.TYPE_7; // 例
        
        // 借り初期値を入れる
        const initialPlayerX = 0;
        const initialPlayerY = 0;

        player = new Player(
            initialPlayerX,
            initialPlayerY,
            selectedCharType,
            assetManager,
            canvas
		);

        const EnemyType = EnemyTypeEnum.E_TYPE_1;

        // Enemy インスタンスの生成 (Player と同様に assetManager や characterType を渡す)
        enemy = new Enemy( BASE_WIDTH / 2, BASE_HEIGHT * 0.2, EnemyType, assetManager, canvas);


        resizeGame();

        // 初期時の場所を変更
        player.x = canvas.width / 2;          // X方向: canvasの幅の中心
        player.y = canvas.height * 0.9;       // Y方向: canvasの高さの上から90%の位置 (つまり下から10%の位置)



        requestAnimationFrame(gameLoop);

    } catch (error) {
        console.error("Failed to initialize game:", error);
    }
}


// 弾を格納する配列
let bullets = []; // 敵の弾
let playerBullets = []; //プレイヤーの弾

// キー入力状態
const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
	' ': false, // スペースキー (キー名は ' ' または 'Space'、ブラウザにより異なる場合があるので注意)
    'z': false, // 'z'キーの状態を追加 (小文字で統一)
};

// キーダウンイベント
document.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = true;
    } else if (keyToCharacterType.hasOwnProperty(e.key)) { // ★ 数字キーの処理を追加
        const newCharacterTypeKey = keyToCharacterType[e.key];
        const targetCharacterType = newCharacterTypeKey; 

        if (targetCharacterType && player && player.character_type !== targetCharacterType) {
            // 既存の character_type (例: "Type1") と比較
            changePlayerCharacter(targetCharacterType);
        } else if (!character_info_list[targetCharacterType]) {
             console.warn(`Character type for key ${e.key} (${targetCharacterType}) is not defined in character_info_list.`);
        }
    }
});

// キーアップイベント
document.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = false;
    }
});

// ★ プレイヤーキャラクターを切り替える関数
async function changePlayerCharacter(newCharacterType) {
    if (!player || !character_info_list[newCharacterType]) {
        console.warn(`Attempted to change to invalid or undefined character type: ${newCharacterType}`);
        return;
    }

    console.log(`Changing player character to: ${newCharacterType}`);

    // 現在の位置とスケールを保持（キャラクター変更後も同じ位置に表示するため）
    const currentX = player.x;
    const currentY = player.y;
    // const globalScaleFactor = scaleFactor; // script.js のグローバルな scaleFactor を使用

    try {
        // 新しいキャラクタータイプでプレイヤーインスタンスを再生成
        // アセットは initializeGame で全てロード済みと仮定
        player = new Player(
            currentX,
            currentY,
            newCharacterType,
            assetManager,
            canvas
        );

        // 新しいプレイヤーに現在のゲームスケールを適用
        // Playerコンストラクタは内部スケールを1.0で初期化し、
        // updateScaleで渡されたスケールに基づいて位置やサイズを調整するため、
        // 保存したx,yを渡しても、updateScaleが適切に処理してくれるはずです。
        player.updateScale(scaleFactor, canvas); //

        console.log(`Player character changed to ${newCharacterType}.`);

    } catch (error) {
        console.error(`Error changing player character: `, error);
        // エラー発生時、必要であれば元のプレイヤーに戻すなどの処理を追加
    }
}




function handleResize() {
    // ウィンドウサイズが変わったときに行いたい処理をここに書く
    resizeGame(); // ← あなたのゲームのキャンバスリサイズ関数
}


// 画面リサイズ処理関数
function resizeGame() {
    const screenOccupationRatio = 0.8; // ★ キャンバスを画面の8割の大きさにするための比率
    const aspectRatio = BASE_WIDTH / BASE_HEIGHT;

    // キャンバスが利用可能な「目標の」最大幅と高さを計算 (実際のウィンドウサイズの8割)
    let targetAvailableWidth = window.innerWidth * screenOccupationRatio;
    let targetAvailableHeight = window.innerHeight * screenOccupationRatio;

    // 目標とする利用可能領域の縦横比
    const targetAvailableAspectRatio = targetAvailableWidth / targetAvailableHeight;

    let newCanvasWidth;
    let newCanvasHeight;

    if (targetAvailableAspectRatio > aspectRatio) {
        // 目標利用可能領域がゲームの縦横比よりも横長の場合、高さを基準に合わせる
        newCanvasHeight = targetAvailableHeight;
        newCanvasWidth = newCanvasHeight * aspectRatio;
    } else {
        // 目標利用可能領域がゲームの縦横比よりも縦長（または同じ比率）の場合、幅を基準に合わせる
        newCanvasWidth = targetAvailableWidth;
        newCanvasHeight = newCanvasWidth / aspectRatio;
    }

    // グローバル変数を更新 (または、これらの値を関数の戻り値として処理することも可能)
    currentWidth = newCanvasWidth;
    currentHeight = newCanvasHeight;

    canvas.width = currentWidth;
    canvas.height = currentHeight;

    // スケールファクターの計算
    // (最終的なキャンバスの幅 / ゲームの基準幅) または (最終的なキャンバスの高さ / ゲームの基準高さ)
    // 縦横比が維持されていれば、どちらで計算しても同じ値になる
    scaleFactor = currentWidth / BASE_WIDTH;
    // もし詳細に分岐するなら:
    // if (targetAvailableAspectRatio > aspectRatio) {
    //     scaleFactor = currentHeight / BASE_HEIGHT;
    // } else {
    //     scaleFactor = currentWidth / BASE_WIDTH;
    // }

    // 既存のゲームオブジェクトの位置やサイズを再計算
    if (player) {
        player.updateScale(scaleFactor, canvas); // Playerクラスにスケール更新メソッドを追加する例
    }
    if (enemy) {
        enemy.updateScale(scaleFactor, canvas);   // Enemyクラスにスケール更新メソッドを追加する例
    }
}


// 弾の描画
// function drawEnemyBullets(ctx) {
//     bullets.forEach(bullet => bullet.draw(ctx));
// }

  function drawPlayerBullets(ctx) {
     playerBullets.forEach(bullet => bullet.draw(ctx));
 }

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
function movePlayerBullets(deltaTime, playerInstance) {
    playerBullets = playerBullets.filter(bullet => {
        if (bullet.isHit) return false;
        bullet.update(deltaTime, playerInstance); // プレイヤー弾が追尾しないなら引数なし
        const b = bullet;
        return b.x + b.width/2 > 0 && b.x - b.width/2 < canvas.width &&
               b.y + b.height/2 > 0 && b.y - b.height/2 < canvas.height &&
               (b.life > 0);
    });
}

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
    if (enemy) enemy.move(clampedDeltaTime);

    player.shoot(keys, playerBullets, player, clampedDeltaTime);

    //if (enemy) enemy.shoot(bullets, Bullet, player, clampedDeltaTime); // 追尾用にplayer, タイマー更新用にdeltaTime

    //moveEnemyBullets(clampedDeltaTime, player); // 追尾対象としてplayerを渡す
    movePlayerBullets(clampedDeltaTime, player);

    player.draw(ctx);
    if (enemy) enemy.draw(ctx);

    //drawEnemyBullets(ctx);
    drawPlayerBullets(ctx);

    // HPバーのスケール変更はここで行う
    const scaledHpBarHeight = HP_BAR_HEIGHT * scaleFactor;
    const scaledPlayerHpBarWidth = PLAYER_HP_BAR_WIDTH * scaleFactor;
    player.drawHpBar(ctx, scaledHpBarHeight, scaledPlayerHpBarWidth);
    if (enemy) enemy.drawHpBar(ctx, HP_BAR_HEIGHT);

        // 当たり判定
//    checkCollisions(); // deltaTimeは通常不要

    animationFrameId = requestAnimationFrame(gameLoop);
}

// --- 初期化処理 ---
// リサイズしたときに自動的にリスナーが走る
window.addEventListener('resize', handleResize);
initializeGame();