import { ImageAssetPaths } from '../game_status.js'; 
// 初期ロード画面


// ローディングアニメーションフレームのキー配列
export const LoadingAnimationFrames = [
  "loadingFrame1",
  "loadingFrame2",
  "loadingFrame3",
  "loadingFrame4",
  "loadingFrame5",
  "loadingFrame6",
  "loadingFrame7",
  "loadingFrame8",
  "loadingFrame9",
  "loadingFrame10",
  "loadingFrame11",
  "loadingFrame12",
  "loadingFrame13",
  "loadingFrame14",
  "loadingFrame15",
  "loadingFrame16",
  "loadingFrame17",
  "loadingFrame18",
  "loadingFrame19",
  "loadingFrame20",
  "loadingFrame21",
  "loadingFrame22",
  "loadingFrame23",
  "loadingFrame24",
  "loadingFrame25",
  "loadingFrame26",
  "loadingFrame27",
  "loadingFrame28",
  "loadingFrame29",
  "loadingFrame30",
  "loadingFrame31",
  "loadingFrame32",
  "loadingFrame33",
  "loadingFrame34",
  "loadingFrame35",
  "loadingFrame36",
  "loadingFrame37",
  "loadingFrame38",
  "loadingFrame39",
  "loadingFrame40",
  "loadingFrame41",
  "loadingFrame42",
  "loadingFrame43",
  "loadingFrame44",
  "loadingFrame45",
  "loadingFrame46",
  "loadingFrame47",
  "loadingFrame48",
  "loadingFrame49",
  "loadingFrame50",
  "loadingFrame51",
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
export function DrawLoadingScreen(NowCtx, NowScale) {
    NowCtx.fillStyle = 'black';
    NowCtx.fillRect(0, 0, NowCtx.canvas.width, NowCtx.canvas.height);

    if (LoadingScreenAnimationImages.length > 0 && LoadingScreenAnimationImages[CurrentLoadingFrameIndex]) {
        const Image = LoadingScreenAnimationImages[CurrentLoadingFrameIndex];
        // 画像を中心に、元のサイズで描画する例 (スケールは別途考慮も可)
        const DrawWidth = Image.naturalWidth * NowScale * 0.5; // 例: 少し小さめに表示
        const DrawHeight = Image.naturalHeight * NowScale * 0.5;
        const DrawX = (NowCtx.canvas.width - DrawWidth) / 2;
        const DrawY = (NowCtx.canvas.height - DrawHeight) / 2 - (50 * NowScale); // 少し上に
        NowCtx.drawImage(Image, DrawX, DrawY, DrawWidth, DrawHeight);
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

/**
 * ゲームのロードを行う
 */
function UpdateLoadingLogic() {
    // プレイヤーとエネミーの作成も行う
    switch(UpdateLoadingLigicState){
        case 0:

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
        case 6:

            break;
        case 7:

            break;
        case 8:

            break;
        case 9:

            break;
        case 10:
            break;
        case 11:
            break;
        case 12:
            CurrentScreen = SCREEN_STATE.MODE_SELECT;
            break;

    }
    wait(0.1);

   ++UpdateLoadingLigicState;
}
