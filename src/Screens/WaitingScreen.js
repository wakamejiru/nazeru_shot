import { BaseScreen, FRAME_DURATION, SCREEN_STATE } from './BaseScreen.js';
import { ImageAssetPaths, MusicOrVoicePaths } from '../game_status.js'; 

export const WatingScreenImages = [
  "waitingImage"
];

// playerにクリックさせて音が出るようにする画面
// 同時に何か注意書きぐらいできたらいいなぐらい

export class WaitingScreen extends BaseScreen{
	/**
     * コンストラクタ
     * @param {PIXI.Application} App - メインPixiインスタンス
     * @param {SCREEN_STATE} ScreenState - このインスタンスがどの画面を指すか
     */
    constructor(App, ScreenState){
        super(App, ScreenState);
		this.WaitingTextures = [];
		this.WaitingBackgroundImage = null;
    }

	/**
	 * 初期化を行う
	 * @param {boolean} Visible - true:ON false:OFF
	 */
	async InitializeScreen(InitialScale){
		// 画面を作成する
		this.ScreenContainer = new PIXI.Container();


		this.App.stage.addChild(this.ScreenContainer); // メインステージに追加

		// 画像の読み込みを行う
		await this.LoadWaitScreenAssetsForPixi();

		// 画像を作成
		const WaitingBgTexture = PIXI.Texture.from("waitingImage");
		this.WaitingBackgroundImage = new PIXI.Sprite(WaitingBgTexture);

		// 画像のアンカーを設定
      	this.WaitingBackgroundImage.anchor.set(0);// 左上が座標
      	this.WaitingBackgroundImage.scale.set(InitialScale); // 初期スケールと画像サイズ調整

		// 画像の位置を調整
      	this.WaitingBackgroundImage.x = 0; // 画面の一番左上に合わせる
      	this.WaitingBackgroundImage.y = 0;

		// 画像を追加
		this.ScreenContainer.addChild(this.WaitingBackgroundImage);
		super.SetScreenVisible(false); // 初期は非表示
	}
	
		/**
	   * リサイズ処理を行う
	   * @param {PIXI.Application} App - メインPixiインスタンス
		 * @param {number} CurrentOverallScale 現在のメイン画面倍率
	   */
		ResizeScreen(App, CurrentOverallScale){
			if (!this.ScreenContainer) return;
			const BaseTextureWidth = this.WaitingBackgroundImage.texture.orig.width;
			const BaseTextureHeight = this.WaitingBackgroundImage.texture.orig.height;
			const AspectRatio = BaseTextureWidth / BaseTextureHeight;
			// 高さを基準に幅を決める
			let DisplayHeight = BaseTextureHeight * CurrentOverallScale; // 仮の縮小率
			let DisplayWidth = DisplayHeight * AspectRatio;
	
			this.WaitingBackgroundImage.width = DisplayWidth;
			this.WaitingBackgroundImage.height = DisplayHeight;
				
	
			// 一番左上を合わせる
			this.WaitingBackgroundImage.x = (App.screen.width  - DisplayWidth)  /2;
			this.WaitingBackgroundImage.y = (App.screen.height - DisplayHeight) / 2;
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
     * 画像を読み込み、PixiJSテクスチャを準備する関数
     */
	async LoadWaitScreenAssetsForPixi() {
		const WatingFrameKeysToLoad = WatingScreenImages.filter(key => ImageAssetPaths[key]);
		const AssetsToLoadForPixi = WatingFrameKeysToLoad.map(key => ({ alias: key, src: ImageAssetPaths[key] }));
			if (AssetsToLoadForPixi.length > 0) {
				await PIXI.Assets.load(AssetsToLoadForPixi);

				WatingFrameKeysToLoad.forEach(key => {
				const texture = PIXI.Texture.from(key);
				this.WaitingTextures.push(texture);
				});
			}
	}
	
		/**
	   * ポーリングにて行う各画面の処理を行う
	   * @param {number} DeltaTime - 前回からの変異時間
	   * @param {instance} InputCurrentState - 入力情報
	   * 
	   */
	  EventPoll(DeltaTime, InputCurrentState){
		super.EventPoll(DeltaTime, InputCurrentState);
		
		// Keyの入力が何かあったかを判断する
		if(this.AnyKeyInput == true){
			return SCREEN_STATE.LOGO_SCREEN;
		}

		return this.ScreenState;
	  }
	
	
	  Sound(){
	
	  }
}