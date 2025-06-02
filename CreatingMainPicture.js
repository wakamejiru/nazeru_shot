import { ImageAssetPaths } from './game_status.js'; 

// ローディングアニメーションフレームのキー配列
export const LoadingAnimationFrames = [
    "loadingFrame1",
    "loadingFrame2",
    "loadingFrame3",
    "loadingFrame4",
    // ... imageAssetPaths に登録したキーを順番に ...
];

let CurrentLoadingFrameIndex = 0;
let LoadingAnimationTimer = 0;
const LOADING_FRAME_DURATION = 0.033; // (30FPS)
let AllMainAssetsLoaded = false; // メインアセット読み込み完了フラグ
let LoadingScreenAnimationImages = []; // ローディングアニメーション用Imageオブジェクト配列

/**
 * ローディング画面のアニメーションフレーム更新
 * @param {number} DeltaTime - 1ループにかかった時間
*/
export function UpdateLoadingAnimation(DeltaTime) {
    if (LoadingScreenAnimationImages.length === 0) return;
    LoadingAnimationTimer += DeltaTime;
    if (LoadingAnimationTimer >= LOADING_FRAME_DURATION) {
        LoadingAnimationTimer -= LOADING_FRAME_DURATION;
        CurrentLoadingFrameIndex = (CurrentLoadingFrameIndex + 1) % LoadingScreenAnimationImages.length;
    }
}

/**
 * ローディングになるようにframの順番ごとに画像を表示していく
 * @param {ctx} NowCtx - 　描画するCTX
 * @param {ctx} NowScale - 　画面の描画倍率
 * @param {ctx} AssetManager - 画像の管理クラスインスタンス
*/
export function DrawLoadingScreen(NowCtx, NowScale, AssetManager) {
    NowCtx.fillStyle = 'black';
    NowCtx.fillRect(0, 0, NowCtx.canvas.width, NowCtx.canvas.height);

    if (LoadingScreenAnimationImages.length > 0 && LoadingScreenAnimationImages[CurrentLoadingFrameIndex]) {
        const Image = LoadingScreenAnimationImages[CurrentLoadingFrameIndex];
        // 画像を中心に、元のサイズで描画する例 (スケールは別途考慮も可)
        const DrawWidth = Image.naturalWidth * NowScale * 0.5; // 例: 少し小さめに表示
        const DrawHeight = Image.naturalHeight * NowScale * 0.5;
        const DrawX = (NowCtx.canvas.width - DrawWidth) / 2;
        const DrawY = (NowCtx.canvas.height - DrawHeight) / 2 - (50 * NowScale); // 少し上に
        NowCtx.DrawImage(Image, DrawX, DrawY, DrawWidth, DrawHeight);
    } else {
        // アニメーション画像がまだない場合のフォールバック
        NowCtx.fillStyle = 'white';
        NowCtx.font = `${20 * NowScale}px Arial`;
        NowCtx.textAlign = 'center';
        NowCtx.fillText("Preparing loading animation...", NowCtx.canvas.width / 2, NowCtx.canvas.height / 2);
    }

    NowCtx.fillStyle = 'white';
    NowCtx.font = `${24 * NowScale}px Arial`;
    NowCtx.textAlign = 'center';
    // メインアセットの読み込み進捗を表示
    const progress = AssetManager ? AssetManager.getLoadingProgress() : 0;

    if (AllMainAssetsLoaded) {
        NowCtx.font = `${20 * scale}px Arial`;
        NowCtx.fillText("Loading Complete! Click to Start", ctx.canvas.width / 2, ctx.canvas.height / 2 + 100 * scale);
        // ここでクリックイベントを待って次の画面に遷移するロジックを追加
    }
}

/**
 * アニメーション用画像のみを先行して読み込む関数
*/
export async function PreloadLoadingScreenAssets() {
    const promises = [];
    for (const FrameKey of LoadingAnimationFrames) { // loadingAnimationFramesはgame_status.jsで定義したキーの配列
        const path = ImageAssetPaths[FrameKey];
        if (path) {
            promises.push(new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    LoadingScreenAnimationImages.push(img); // Imageオブジェクトを格納
                    resolve();
                };
                img.onerror = (err) => {
                    console.error(`Failed to load loading frame ${frameKey}:`, err);
                    resolve(); // エラーでも進行を止めない（一部フレームが欠ける可能性）
                };
                img.src = path;
            }));
        }
    }
    await Promise.all(promises);
    console.log("Loading screen animation frames loaded.");
}


async function initializeGame() {
    currentScreen = SCREEN_STATE.LOADING;
    // 先に requestAnimationFrame を一度開始し、ローディング表示を開始させる
    if (!animationFrameId) {
        lastTime = 0; // gameLoopの初回実行のためにリセット
        animationFrameId = requestAnimationFrame(gameLoop);
    }
    
    try {
        await preloadLoadingScreenAssets(); // ★まずローディングアニメーション用画像を読み込む

        // 次にメインのアセットを非同期で読み込み開始
        // このawait中も、gameLoopはローディングアニメーションを描画し続ける
        await assetManager.loadAllAssets(); 
        console.log("All main game assets loaded.");
        allMainAssetsLoaded = true; // 完了フラグを立てる

        // この後、drawLoadingScreenで表示される「Click to Start」などが押されたら
        // transitionToScreen(SCREEN_STATE.MODE_SELECT); のように遷移する。
        // 例: クリックで遷移
        mainCanvas.addEventListener('click', handleLoadingScreenClick, { once: true });

    } catch (error) {
        console.error("Failed to initialize game assets:", error);
        // エラー処理
    }
}

function handleLoadingScreenClick() {
    if (allMainAssetsLoaded && currentScreen === SCREEN_STATE.LOADING) {
        console.log("Proceeding from loading screen...");
        // (例) モード選択画面へ遷移。適切なオプションを渡す。
        transitionToScreen(SCREEN_STATE.MODE_SELECT); 
    }
}