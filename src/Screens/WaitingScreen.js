import { BaseScreen, FRAME_DURATION, SCREEN_STATE } from './BaseScreen.js';
import { ImageAssetPaths, MusicOrVoicePaths } from '../game_status.js'; 
import {IsChromeBrowser} from "../utils.js"

export const WatingScreenImages = [
  "waitingImage"
];

// playerにクリックさせて音が出るようにする画面
// 同時に何か注意書きぐらいできたらいいなぐらい
// Chrome以外なら先に進めなくする

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


// 赤色テキスト用のスタイル
        const redTextStyle = new PIXI.TextStyle({
            fontFamily: '"Helvetica Neue", "Arial", "Noto Serif JP"', // フォント
            fontSize: 48, // フォントサイズ
            fill: '#ff4500', // 色 (トマトレッド)
            stroke: { color: '#000000', width: 2 }, // 縁取り（白）
            align: 'center', // 中央揃え
        });

        // 通常テキスト用のスタイル
        const normalTextStyle = new PIXI.TextStyle({
            fontFamily: '"Helvetica Neue", "Arial", "Noto Serif JP"',
            fontSize: 48,
            fill: '#000000', // 黒
            align: 'center',
        });

        // テキストオブジェクト
        this.redText = new PIXI.Text('※Chromeでプレイして♡', redTextStyle);

        this.normalText = new PIXI.Text('何か入力して開始\n(コントローラ(USB)接続でもOK)\n音出ます', normalTextStyle);

        // テキストのアンカー中央
        this.redText.anchor.set(0.5);
        this.normalText.anchor.set(0.5);

        // 画面中央あたりに配置
        this.redText.x = this.App.screen.width / 2;
        this.redText.y = this.App.screen.height / 2 - 50;

        this.normalText.x = this.App.screen.width / 2;
        this.normalText.y = this.App.screen.height / 2 + 50;
        
        // 5. テキストをコンテナに追加して表示します
        this.ScreenContainer.addChild(this.redText);
        this.ScreenContainer.addChild(this.normalText);


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
			const DisplaySizeWidth = this.App.screen.width;
			const DisplaySizeheight = this.App.screen.height;

			const newSize = this.CalculateAspectRatioFit(BaseTextureWidth, BaseTextureHeight, DisplaySizeWidth, DisplaySizeheight);
	
			this.WaitingBackgroundImage.width = newSize.width;
			this.WaitingBackgroundImage.height = newSize.height;
				
	
			// 一番左上を合わせる
			this.WaitingBackgroundImage.x = (App.screen.width  - this.WaitingBackgroundImage.width)  /2;
			this.WaitingBackgroundImage.y = (App.screen.height - this.WaitingBackgroundImage.height) / 2;


			// 画面サイズに合わせてフォントサイズを調整
            this.redText.style.fontSize = 48 * CurrentOverallScale;
            this.normalText.style.fontSize = 48 * CurrentOverallScale;

            // 画面の中央に再配置
            this.redText.x = App.screen.width / 2;
            this.redText.y = App.screen.height / 2 - (50 * CurrentOverallScale); // 間隔もスケールさせる

            this.normalText.x = App.screen.width / 2;
            this.normalText.y = App.screen.height / 2 + (50 * CurrentOverallScale);
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
		// Chromeなら進めさせない
		if((this.AnyKeyInput == true) && (IsChromeBrowser() == true)){
			return SCREEN_STATE.LOGO_SCREEN;
		}

		return this.ScreenState;
	  }
	
	
	  Sound(){
	
	  }
}