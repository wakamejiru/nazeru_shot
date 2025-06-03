import { ImageAssetPaths } from '../game_status.js'; 
// 初期ロード画面
// 画面はクラス化をしない(多胎化をできるのが，upscaleぐらいなので)

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
let LoadingScreenContainer; // Loadを表示するpixiJSコンテナ
let CurrentLoadingFrameIndex = 0;  // 現在表示しているロード画像のIndex
let LoadingAnimationTimer = 0; // Loadアニメーション同期用のタイマ
const LOADING_FRAME_DURATION = 0.033; // (30FPS)
let AllMainAssetsLoaded = false; // メインアセット読み込み完了フラグ
let LoadingScreenAnimationSprites = []; // ローディングアニメーション用Spritesオブジェクト配列

/**
 * ローディング画面の表示/非表示を切り替え
 * @param {boolean} Visible - true:ON false:OFF
 */
export function setPixiLoadingScreenVisible(Visible) {
    if (LoadingScreenContainer) {
        LoadingScreenContainer.visible = Visible;
    }
}

/**
 * リサイズ時にローディング画面要素の位置を調整
 * @param {PIXI.Application} App PixiJSアプリケーションインスタンス
 * @param {number} CurrentOverallScale 現在のメイン画面倍率
 */
export function ResizePixiLoadingScreen(App, CurrentOverallScale) {
    if (!LoadingScreenContainer) return;

    LoadingScreenAnimationSprites.forEach(sprite => {
        const BaseTextureWidth = sprite.texture.orig.width;
        const BaseTextureHeight = sprite.texture.orig.height;
        const AspectRatio = BaseTextureWidth / BaseTextureHeight;
        
        // 高さを基準に幅を決める
        let DisplayHeight = BaseTextureHeight * CurrentOverallScale; // 仮の縮小率
        let DisplayWidth = DisplayHeight * AspectRatio;

        sprite.width = DisplayWidth;
        sprite.height = DisplayHeight;
        

        // 一番左上を合わせる
        sprite.x = (App.screen.width  - DisplayWidth)  /2;
        sprite.y = (App.screen.height - DisplayHeight) / 2;
    });
}



/**
 * PixiJSのローディング画面コンテナをセットアップ
 * @param {PIXI.Application} App - PixiJSアプリケーションインスタンス
 * @param {number} InitialScale - 初期スケール
 */
export function SetupPixiLoadingScreen(App, InitialScale) {
    LoadingScreenContainer = new PIXI.Container();
    App.stage.addChild(LoadingScreenContainer); // メインステージに追加

    LoadingScreenAnimationSprites.forEach((sprite, index) => {
        sprite.anchor.set(0); // 画像も左上が座標軸
        sprite.scale.set(InitialScale); // 初期スケールと画像サイズ調整
        sprite.x = 0; // 画面の一番左上に合わせる
        sprite.y = 0;
        sprite.visible = (index === 0); // 最初のフレームのみ表示
        LoadingScreenContainer.addChild(sprite);
    });

    LoadingScreenContainer.visible = false; // 初期は非表示
}

/**
 * ローディングアニメーションのフレームを更新
 * @param {number} DeltaTime - 前フレームからの経過時間(秒)
 * @note 通常不要であるが，今回同時実行しているインスタンスを生成する処理はシングルスレッドで動作しているため
 * @note このように同期をとる処理をしなければ固まる
 */
export function UpdatePixiLoadingAnimation(DeltaTime) {
    if (LoadingScreenAnimationSprites.length === 0 || !LoadingScreenContainer || !LoadingScreenContainer.visible) return;

    LoadingAnimationTimer += DeltaTime;
    if (LoadingAnimationTimer >= LOADING_FRAME_DURATION) {
        LoadingAnimationTimer -= LOADING_FRAME_DURATION;
        
        LoadingScreenAnimationSprites[CurrentLoadingFrameIndex].visible = false; // 今のフレームを無効化
        CurrentLoadingFrameIndex = (CurrentLoadingFrameIndex + 1) % LoadingScreenAnimationSprites.length; // Indexを1進める
        if (LoadingScreenAnimationSprites[CurrentLoadingFrameIndex]) {
             LoadingScreenAnimationSprites[CurrentLoadingFrameIndex].visible = true; // 次のフレームを有効化
        }
    }
}

/**
 * ローディングアニメーション用画像のみを先行して読み込み、PixiJSテクスチャを準備する関数
 * @returns {Promise<void>}
 */
export async function PreloadLoadingScreenAssetsForPixi() {
     const textures = [];
     const frameKeysToLoad = LoadingAnimationFrames.filter(key => ImageAssetPaths[key]);
    if (frameKeysToLoad.length === 0) {
        console.log("No loading animation frames to preload for Pixi.");
        return;
    }

    const AssetsToLoadForPixi = frameKeysToLoad.map(key => ({ alias: key, src: ImageAssetPaths[key] }));
    if (AssetsToLoadForPixi.length > 0) {
        await PIXI.Assets.load(AssetsToLoadForPixi);
        frameKeysToLoad.forEach(key => textures.push(PIXI.Texture.from(key)));
    }

    LoadingScreenAnimationSprites = textures.map(texture => new PIXI.Sprite(texture));
}