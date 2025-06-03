// ここまで見に来たということは熱心なナゼルファンなのか
// 熱心な技術ヲタクなのであろう
// といわけで制作秘話をここに乗せる
// 自分は，C++が主な主戦場なので，C++でよく見られる記載を行っている
// インタプリタ言語はかなり苦手なので非効率な面が多い
// 開発は5/20あたりで開始し，6月2日にJSで主要機能を果たせることを確認
// そこから画面構成等を作り出した


// script.js (メインファイル)

// 各import
import { Bullet } from './bullet.js'; // Bulletクラスもインポート
import { CharacterTypeEnum,imageAssetPaths, ImageAssetPaths, character_info_list, EnemyTypeEnum } from './game_status.js'; // game_status.js から必要なものをインポート
import { AssetManager } from './asset_manager.js'; // AssetManagerをインポート
// Playerのクラスを作成する
import { PlayerType1 } from './Player/Type1Player.js';

// 敵のクラスを作成する
import { EnemyType1 } from './Enemy/EnemyType1.js';

import { UpdateLoadingAnimation, PreloadLoadingScreenAssets, DrawLoadingScreen} from './CreatingMainPicture.js';

// 主要ゲーム画面を宣言
const MainCanvas = document.getElementById('shootinggameCanvas');
const MainCtx = MainCanvas.getContext('2d');

// --- 画面状態の定義 ---
const SCREEN_STATE = Object.freeze({
    LOADING: 'loading',
    MODE_SELECT: 'mode_select_settings',
    STAGE_SELECT: 'stage_select',
    CHARACTER_SELECT: 'character_select',
    DIFFICULTY_POPUP: 'difficulty_popup', // これは他の画面上のポップアップとしても実装可能
    GAMEPLAY: 'gameplay',
    GAME_OVER: 'game_over',
    GAME_WIN: 'game_win', 
    TUTORIAL_CANVAS: "Tutorial"
});
let CurrentScreen = SCREEN_STATE.LOADING; // ★ 初期画面 (またはMODE_SELECT)

// --- 基本ゲーム画面のCanvasの基準サイズ---
const OVERALL_BASE_WIDTH = 1920;
const OVERALL_BASE_HEIGHT = 1080;

let CurrentTotalWidth = OVERALL_BASE_WIDTH;   // メインCanvasの現在の実際の幅
let CurrentTotalHeight = OVERALL_BASE_HEIGHT; // メインCanvasの現在の実際の高さ
let MainScaleFactor = 1; // メインCanvas全体のスケールファクター 
const GameplayOffscreenCanvas = document.createElement('canvas');
const GameplayOffscreenCtx = GameplayOffscreenCanvas.getContext('2d');

// 枠
let Player;
let Enemy;
const AssetManagerInstance = new AssetManager(ImageAssetPaths);
// インスタンスを生成しておいておくところ，ロード時に生成してpushしておくのがよい
let PlayerBulletList = [];
let EnemyBulletList = [];
let UpdateLoadingLigicState = 0; // 読み込み順序ステイト
let LoadingFinished = false; // ロード終了フラグ

let LastTime = 0; // 時間管理用カウンタタイマ

// ゲーム画面のリサイジングを行う
// ゲーム画面のサイズの変更時，初期起動時に実行する
function ResizeGame_() {
    // メイン画面は画面いっぱいに表現する
    const ScreenOccupationRatio = 1.0;
    // 画面比率を計算   
    const OverallAspectRatio = OVERALL_BASE_WIDTH / OVERALL_BASE_HEIGHT;
    // ウインドウのサイズから，可能な画面サイズを出す
    let TargetAvailableWidth = window.innerWidth * ScreenOccupationRatio;
    let TargetAvailableHeight = window.innerHeight * ScreenOccupationRatio;
    const WindowAspectRatio = TargetAvailableWidth / TargetAvailableHeight; // アスペクト比を取得

    // どちらの画面サイズが大きいかで優先を付ける
    if (WindowAspectRatio > OverallAspectRatio) {
        CurrentTotalHeight = TargetAvailableHeight;
        CurrentTotalWidth = CurrentTotalHeight * OverallAspectRatio;
    } else {
        CurrentTotalWidth = TargetAvailableWidth;
        CurrentTotalHeight = CurrentTotalWidth / OverallAspectRatio;
    }

    MainCanvas.width = CurrentTotalWidth;
    MainCanvas.height = CurrentTotalHeight;

    MainScaleFactor = CurrentTotalHeight / OVERALL_BASE_HEIGHT; // 全体UIのスケール基準
}

/**
 * ゲームのロードを行う
 */
function UpdateLoadingLogic() {
    // プレイヤーとエネミーの作成も行う
    switch(UpdateLoadingLigicState){
        case 0:
            wait(0.1);
            // Player = new PlayerType1(initialPlayerX, initialPlayerY, assetManager, ShootingCanvas, ShootingCanvas.width, ShootingCanvas.height);
            // PlayerBulletList.push(Player);
            break;
        case 1:

            break;
        case 2:

            break;  
        case 3:

            break;

        case 4:

            break;

        case 5:

            break;

    }
   // ++UpdateLoadingLigicState;
}


// キャンバスのサイズ設定
const BASE_WIDTH = OVERALL_BASE_WIDTH;  // ゲームの基準幅
const BASE_HEIGHT = OVERALL_BASE_HEIGHT; // ゲームの基準高さ

const STATS_AREA_BASE_WIDTH = 200; // ★ 情報表示領域の基準幅 (例: 200px)

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

async function InitializeGame(){
    // 全アセット読み出し後ローディング画面になる(別スレッド処理となるため考慮しない)
    await AssetManagerInstance.loadAllAssets();

    await PreloadLoadingScreenAssets(); // ★まずローディングアニメーション用画像を読み込む
    ResizeGame_();
    // ゲームループを開始
    requestAnimationFrame(GameLoop);

}

// 初期化を実行する
async function initializeGame() {
    
//     try {
//         await assetManager.loadAllAssets();
//         console.log("All assets loaded.");
        
//         // 借り初期値を入れる
//         const initialPlayerX = 0;
//         const initialPlayerY = 0;

//         player = new PlayerType1(initialPlayerX, initialPlayerY, assetManager, ShootingCanvas, ShootingCanvas.width, ShootingCanvas.height);

//         const EnemyType = EnemyTypeEnum.E_TYPE_1;

//         // Enemy インスタンスの生成 (Player と同様に assetManager や characterType を渡す)
// //         enemy = new Enemy( BASE_WIDTH / 2, BASE_HEIGHT * 0.3, EnemyType, assetManager, ShootingCanvas);

//         enemy = new EnemyType1(BASE_WIDTH / 2, BASE_HEIGHT * 0.3, assetManager, ShootingCanvas);

//         resizeGame();

//         // 初期時の場所を変更
//         player.x = ShootingCanvas.width / 2;          // X方向: ShootingCanvasの幅の中心
//         player.y = ShootingCanvas.height * 0.9;       // Y方向: ShootingCanvasの高さの上から90%の位置 (つまり下から10%の位置)


//         requestAnimationFrame(gameLoop);

//     } catch (error) {
//         console.error("Failed to initialize game:", error);
//     }
}


// 弾を格納する配列
let enemybullets = []; // 敵の弾
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
            ShootingCanvas
        );

        // 新しいプレイヤーに現在のゲームスケールを適用
        // Playerコンストラクタは内部スケールを1.0で初期化し、
        // updateScaleで渡されたスケールに基づいて位置やサイズを調整するため、
        // 保存したx,yを渡しても、updateScaleが適切に処理してくれるはずです。
        player.updateScale(scaleFactor, ShootingCanvas); //

        console.log(`Player character changed to ${newCharacterType}.`);

    } catch (error) {
        console.error(`Error changing player character: `, error);
        // エラー発生時、必要であれば元のプレイヤーに戻すなどの処理を追加
    }
}




function handleResize() {
    // ウィンドウサイズが変わったときに行いたい処理をここに書く
    //resizeGame(); // ← あなたのゲームのキャンバスリサイズ関数
}


// 画面リサイズ処理関数
function resizeGame() {

    // 基準値
    const NowScaleCanvasWidth = BASE_WIDTH ;//ShootingCanvas.width;
    const NowScaleCanvasHeight = BASE_HEIGHT;//ShootingCanvas.height;


    const screenOccupationRatio = 1.0; // ★ キャンバスを画面の8割の大きさにするための比率
    const aspectRatio = NowScaleCanvasWidth / NowScaleCanvasHeight;

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

    ShootingCanvas.width = currentWidth;
    ShootingCanvas.height = currentHeight;

    // スケールファクターの計算
    // (最終的なキャンバスの幅 / ゲームの基準幅) または (最終的なキャンバスの高さ / ゲームの基準高さ)
    scaleFactor = currentWidth / NowScaleCanvasWidth;

    // 既存のゲームオブジェクトの位置やサイズを再計算
    if (player) {
        player.updateScale(scaleFactor, ShootingCanvas, NowScaleCanvasWidth, NowScaleCanvasHeight); // Playerクラスにスケール更新メソッドを追加する例
    }
    if (enemy) {
        enemy.updateScale(scaleFactor, ShootingCanvas, NowScaleCanvasWidth, NowScaleCanvasHeight);   // Enemyクラスにスケール更新メソッドを追加する例
    }
}


// 弾の描画
function drawEnemyBullets(ctx) {
    enemybullets.forEach(bullet => bullet.draw(ctx));
}

  function drawPlayerBullets(ctx) {
     playerBullets.forEach(bullet => bullet.draw(ctx));
 }

// 敵の弾の移動と画面外判定
function moveEnemyBullets(deltaTime, playerInstance) {
    enemybullets = enemybullets.filter(bullet => {
        if (bullet.isHit) return false;
        bullet.update(deltaTime, playerInstance); // 追尾対象としてplayerインスタンスを渡す例
        // 画面外判定などは bullet.x, bullet.y, bullet.radius/width/height を使う
        return bullet.x > - (bullet.isCircle ? bullet.radius : bullet.width/2) &&
               bullet.x < ShootingCanvas.width + (bullet.isCircle ? bullet.radius : bullet.width/2) &&
               bullet.y > - (bullet.isCircle ? bullet.radius : bullet.height/2) &&
               bullet.y < ShootingCanvas.height + (bullet.isCircle ? bullet.radius : bullet.height/2) &&
               (bullet.life > 0);
    });
}

// プレイヤーの弾の移動と画面外判定
function movePlayerBullets(deltaTime, playerInstance) {
    playerBullets = playerBullets.filter(bullet => {
        if (bullet.isHit) return false;
        bullet.update(deltaTime, playerInstance); // プレイヤー弾が追尾しないなら引数なし
        const b = bullet;
        return b.x + b.width/2 > 0 && b.x - b.width/2 < ShootingCanvas.width &&
               b.y + b.height/2 > 0 && b.y - b.height/2 < ShootingCanvas.height &&
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
    ctx.fillRect(0, 0, ShootingCanvas.width, ShootingCanvas.height);
    ctx.font = '40px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', ShootingCanvas.width / 2, ShootingCanvas.height / 2);
}

// ゲーム勝利処理
function gameWin() {
    if (isGameWin) return; // 既に勝利なら何もしない
    isGameWin = true;
    console.log("勝利！");
    cancelAnimationFrame(animationFrameId);
    ctx.fillStyle = 'rgba(0, 128, 0, 0.7)'; // 緑っぽい背景
    ctx.fillRect(0, 0, ShootingCanvas.width, ShootingCanvas.height);
    ctx.font = '60px Arial';
    ctx.fillStyle = 'yellow';
    ctx.textAlign = 'center';
    ctx.fillText('勝利！', ShootingCanvas.width / 2, ShootingCanvas.height / 2);
}

// 描画のクリア
function clearCanvas() {
    ctx.clearRect(0, 0, ShootingCanvas.width, ShootingCanvas.height);
}

let animationFrameId; // ゲームループのIDを保持
// 画面のリフレッシュレート違いによる問題を解消
let lastTime = 0;


/**
 * ゲームを進行するノーマルループ
 * @param {number} CurrentTime - 現在の経過時間
 * @param {number} centerX - 発射の基点X座標
 * @param {number} centerY - 発射の基点Y座標
 * @param {bool}  ccw true:時計回り false反時計回り
 * @param {number}  WindmillPointRadius 打ち出し半径の長さ
 * @param {number}  WindmillPointRadiusfunc 打ち出し半径の長さの変異処理の関数
 * @param {number}  bulletAngleStart 開始角度(度数法)
 * @param {number}  bulletAngleEnd 終了角度(度数法)
 * @param {number} numberOfBullets - 球の数
 * @param {object} baseBulletOptions - 弾の基本設定オブジェクト。
 * @param {AssetManager} assetManager - アセットマネージャーのインスタンス
 * @param {AssetManager} shotCnt - ここの数値をずらしていくことで、発射角度がshitし、風車方になる
 * @param {AssetManager} shotAngleSpeed - shotCntにつけるシフト量回転の速度を表す
 */
function GameLoop(CurrentTime){
    // 現在の経過時間から差分を求める
    const deltaTime = (CurrentTime - LastTime) / 1000; // 秒単位
    LastTime = CurrentTime;

    // ゼロ除算や極端なdeltaTimeを防ぐ（ブラウザがバックグラウンドになった場合など）
    const ClampedDeltaTime = Math.min(deltaTime, 0.1); // 例: 最大0.1秒に制限

     switch (CurrentScreen) {
        case SCREEN_STATE.LOADING:
            UpdateLoadingLogic();
            UpdateLoadingAnimation(ClampedDeltaTime);
            DrawLoadingScreen(MainCtx ,MainScaleFactor);
            break;
        case SCREEN_STATE.MODE_SELECT:
            break;
    }

    requestAnimationFrame(GameLoop); // ★ ここで GameLoop を再帰的に呼び出す
}


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

    // Playerのスキル判定を行う
    player._skillrun(clampedDeltaTime);

    player.move(keys, clampedDeltaTime);
    if (enemy) enemy.move(clampedDeltaTime);

    player._shoot(keys, playerBullets, enemy, clampedDeltaTime);

    if (enemy) enemy._shoot(enemybullets, player, clampedDeltaTime); // 追尾用にplayer, タイマー更新用にdeltaTime

    moveEnemyBullets(clampedDeltaTime, player); // 追尾対象としてplayerを渡す
    movePlayerBullets(clampedDeltaTime, player);

    player.draw(ctx, keys);
    if (enemy) enemy.draw(ctx);

    drawEnemyBullets(ctx);
    drawPlayerBullets(ctx);

    // HPバーのスケール変更はここで行う
    const scaledHpBarHeight = HP_BAR_HEIGHT * scaleFactor;
    const scaledPlayerHpBarWidth = PLAYER_HP_BAR_WIDTH * scaleFactor;
    player.drawHpBar(ctx, scaledHpBarHeight, scaledPlayerHpBarWidth);
    const EnemyscaledHpBarHeight = 7.0; //HPバーの幅
    if (enemy) enemy.drawHpBar(ctx, EnemyscaledHpBarHeight);


    


        // 当たり判定
    //    checkCollisions(); // deltaTimeは通常不要

    animationFrameId = requestAnimationFrame(gameLoop);
}

// --- 初期化処理 ---
// リサイズしたときに自動的にリスナーが走る
window.addEventListener('resize', handleResize);
InitializeGame();

/**
 * 指定された秒数だけ待機する関数
 * @param {number} seconds - 待機する秒数
 * @returns {Promise<void>} 待機後に解決されるPromise
 */
function wait(seconds) {
  return new Promise(resolve => {
    setTimeout(resolve, seconds * 1000); // setTimeoutはミリ秒単位で指定
  });
}