import { ImageAssetPaths } from '../game_status.js'; 
import { BaseScreen, FRAME_DURATION, SCREEN_STATE } from './BaseScreen.js';
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

// こいつは非同期処理で用いるので別で置いとかないといけない    
let     LoadingScreenAnimationSprites = [];

export class LoadScreen extends BaseScreen{
    /**
 	 * コンストラクタ
	 * @param {PIXI.Application} App - メインPixiインスタンス
     * @param {SCREEN_STATE} ScreenState - このインスタンスがどの画面を指すか
	 */
    constructor(App, ScreenState){
        super(App, ScreenState);
        this.CurrentLoadingFrameIndex=0;
        this.LoadingAnimationTimer = 0;
        this.AllMainAssetsLoaded = false;
        this.FinishTime = 0;
    }

    /**
 	 * 初期化を行う
	 * @param {boolean} Visible - true:ON false:OFF
	 */
	InitializeScreen(InitialScale){

        // 画面を作成する
        this.ScreenContainer = new PIXI.Container();
        this.App.stage.addChild(this.ScreenContainer); // メインステージに追加

        LoadingScreenAnimationSprites.forEach((sprite, index) => {
            sprite.anchor.set(0); // 画像も左上が座標軸
            sprite.scale.set(InitialScale); // 初期スケールと画像サイズ調整
            sprite.x = 0; // 画面の一番左上に合わせる
            sprite.y = 0;
            sprite.visible = (index === 0); // 最初のフレームのみ表示
            this.ScreenContainer.addChild(sprite);
        });

        super.SetScreenVisible(false); // 初期は非表示
    }

    /**
 	 * リサイズ処理を行う
	 * @param {PIXI.Application} App - メインPixiインスタンス
     * @param {number} CurrentOverallScale 現在のメイン画面倍率
	 */
    ResizeScreen(App, CurrentOverallScale){
        if (!this.ScreenContainer) return;

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
 	 * 画面の開始を行う
	 * @param {boolean} Visible - true:ON false:OFF
	 */
	StartScreen(){
        super.StartScreen();
	}
    
    /**
 	 * 画面の終了を行う
	 * @param {boolean} Visible - true:ON false:OFF
	 */
	EndScreen(){
        super.EndScreen();
        this.FinishTime = 0;
	}

    /**
 	 * ポーリングにて行う各画面の処理を行う
	 * @param {number} DeltaTime - 前回からの変異時間
     * @param {instance} InputCurrentState - 入力情報 
     * 
	 */
	EventPoll(DeltaTime, InputCurrentState){
        super.EventPoll(DeltaTime, InputCurrentState);
        // 画像を紙芝居のように切り替える
        // ふつうはAnimationでやればこんなことしなくていいのだが、Loading画面だけはこんなことしないといけない

        if (LoadingScreenAnimationSprites.length === 0 || !this.ScreenContainer || !this.ScreenContainer.visible) return;

        this.LoadingAnimationTimer += DeltaTime;
        if (this.LoadingAnimationTimer >= FRAME_DURATION) {
            this.LoadingAnimationTimer -= FRAME_DURATION;
            
            LoadingScreenAnimationSprites[this.CurrentLoadingFrameIndex].visible = false; // 今のフレームを無効化
            this.CurrentLoadingFrameIndex = (this.CurrentLoadingFrameIndex + 1) % LoadingScreenAnimationSprites.length; // Indexを1進める
            if (LoadingScreenAnimationSprites[this.CurrentLoadingFrameIndex]) {
                LoadingScreenAnimationSprites[this.CurrentLoadingFrameIndex].visible = true; // 次のフレームを有効化
            }
        }


        this.FinishTime += DeltaTime;
        if(this.FinishTime >= 2.0){
            return SCREEN_STATE.WATING_SCREEN;
        }else{
            return this.ScreenState;
        }
	}
}

/**
 * ローディングアニメーション用画像のみを先行して読み込み、PixiJSテクスチャを準備する関数
 * @returns {Promise<void>}
 * @note async関数のため、非同期で動作する
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
