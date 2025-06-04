// ロゴの表示を行う
import { ImageAssetPaths } from '../game_status.js'; 
import { BaseScreen, FRAME_DURATION } from './BaseScreen.js';
// 初期ロード画面

export const LogoAnimationFrames = [
  "logoFrame1",
  "logoFrame2",
  "logoFrame3",
  "logoFrame4",
  "logoFrame5",
  "logoFrame6",
  "logoFrame7",
  "logoFrame8",
  "logoFrame9",
  "logoFrame10",
  "logoFrame11",
  "logoFrame12",
  "logoFrame13",
  "logoFrame14",
  "logoFrame15",
  "logoFrame16",
  "logoFrame17",
  "logoFrame18",
  "logoFrame19",
  "logoFrame20",
  "logoFrame21",
  "logoFrame22",
  "logoFrame23",
  "logoFrame24",
  "logoFrame25",
  "logoFrame26",
  "logoFrame27",
  "logoFrame28",
  "logoFrame29",
  "logoFrame30",
  "logoFrame31",
  "logoFrame32",
  "logoFrame33",
  "logoFrame34",
  "logoFrame35",
  "logoFrame36",
  "logoFrame37",
  "logoFrame38",
  "logoFrame39",
  "logoFrame40",
  "logoFrame41",
  "logoFrame42",
  "logoFrame43",
  "logoFrame44",
  "logoFrame45",
  "logoFrame46",
  "logoFrame47",
  "logoFrame48",
  "logoFrame49",
  "logoFrame50",
  "logoFrame51",
];


let NowState = 0;
export class LogoScreen extends BaseScreen{
    /**
     * コンストラクタ
     * @param {PIXI.Application} App - メインPixiインスタンス
     * @param {SCREEN_STATE} ScreenState - このインスタンスがどの画面を指すか
     */
    constructor(App, ScreenState){
        super(App, ScreenState);
        this.NowScreenState = 0; // 0の場合infomation // 1の場合LOGO
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
   * 画面の開始を行う
   * @param {boolean} Visible - true:ON false:OFF
   */
  EndScreen(){
        super.EndScreen();
  }

    /**
   * ポーリングにて行う各画面の処理を行う
   * @param {number} DeltaTime - 前回からの変異時間
   */
  EventPoll(DeltaTime){
        super.EventPoll(DeltaTime);
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
  }
}

/**
 * ローディング画面の表示/非表示を切り替え
 * @param {boolean} Visible - true:ON false:OFF
 */
export function SetPixiLoadingScreenVisible(Visible) {
	if (LogoScreenContainer) {
		LogoScreenContainer.visible = Visible;
	}
}

/**
 * リサイズ時にローディング画面要素の位置を調整
 * @param {PIXI.Application} App PixiJSアプリケーションインスタンス
 * @param {number} CurrentOverallScale 現在のメイン画面倍率
 */
export function ResizePixiLogoScreen(App, CurrentOverallScale) {
	if (!LogoScreenContainer) return;

	LogoScreenAnimationSprites.forEach(sprite => {
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
 * ロゴ画面コンテナを初期化
 * @param {PIXI.Application} App - PixiJSアプリケーションインスタンス
 * @param {number} InitialScale - 初期スケール
 */
export function InitilizeLogoScreen(App, InitialScale){

}


/**
 * ロゴ画面コンテナをセットアップ
 * @param {PIXI.Application} App - PixiJSアプリケーションインスタンス
 * @param {number} InitialScale - 初期スケール
 */
export function SetupPixiLogoScreen(App, InitialScale) {
	LogoScreenContainer = new PIXI.Container();
	App.stage.addChild(LogoScreenContainer); // メインステージに追加

	LogoScreenAnimationSprites.forEach((sprite, index) => {
		sprite.anchor.set(0); // 画像も左上が座標軸
		sprite.scale.set(InitialScale); // 初期スケールと画像サイズ調整
		sprite.x = 0; // 画面の一番左上に合わせる
		sprite.y = 0;
		sprite.visible = (index === 0); // 最初のフレームのみ表示
		LogoScreenContainer.addChild(sprite);
	});

	LogoScreenContainer.visible = false; // 初期は非表示
}