import { ImageAssetPaths } from '../game_status.js'; 
// タイトル画面

// 項目は二つ
const ButtonID = Object.freeze({
    Button1: "Game Start",
    Button2: "Extra Mode",
    Button3: "Gallery",
    Button4: "Audio Room",
    Button5: "OPTION",
});

let CurrentFrameIndex = 0;
let LoadingAnimationTimer = 0;
const LOADING_FRAME_DURATION = 0.033; // (30FPS)
// let AllMainAssetsLoaded = false; // メインアセット読み込み完了フラグ
let LoadingScreenAnimationImages = []; // ローディングアニメーション用Imageオブジェクト配列

// この画面に存在するボタン
export const NowPictureButtons = Object.freeze({
    Button1:"Play",
    Button2: "Setting"
});

// 現在選択されているボタンを記憶する
let NowSelectButton = NowPictureButtons.Button1; // 初期はボタン1


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