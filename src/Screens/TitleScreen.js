import { CustomButton } from "../Buttons/ButtonBase.js";
import { ImageAssetPaths } from '../game_status.js'; 
import { BaseScreen, FRAME_DURATION, SCREEN_STATE } from './BaseScreen.js';
// タイトル画面

// 項目は5つ
const ButtonID = Object.freeze({
    Button1: "Game Start",
    Button2: "Extra Mode",
    Button3: "Gallery",
    Button4: "Audio Room",
    Button5: "OPTION",
});

// --- ボタンの設定 ---
const ButtonConfigs = [
    {
        id: "game_start",
        width: 300,
        height: 70,
        label: ButtonID.Button1,
        iconPath: 'iconImage1',
        soundPath: 'system45',
		colors: { normal: 0x333333, selected: 0x5555FF },
        shape: {
			cornerRadius: 20
		},
		fill_colors: {
			normal: 0xFFFFFF,
			selected: 0x7fffd4,
			pressed: 0x888888,
		},
		stroke:{
			width: 5,
			color: {
				normal: 0x000000,
				selected: 0xFFFFFF,
				pressed: 0x888888,
			},
		},
			
    },
	{
        id: "extra_mode",
        width: 300,
        height: 70,
        label: ButtonID.Button2,
        iconPath: 'iconImage1',
        soundPath: 'system45',
        shape: { cornerRadius: 35 }
    },
	{
        id: "gallery",
        width: 300,
        height: 70,
        label: ButtonID.Button3,
        iconPath: 'iconImage1',
        soundPath: 'system45',
        shape: { cornerRadius: 35 }
    },
	{
        id: "audio_room",
        width: 300,
        height: 70,
        label: ButtonID.Button4,
        iconPath: 'iconImage1',
        soundPath: 'system45',
        shape: { cornerRadius: 35 }
    },
	{
        id: "option",
        width: 300,
        height: 70,
        label: ButtonID.Button5,
        iconPath: 'iconImage1',
        soundPath: 'system45',
        shape: { cornerRadius: 35 }
    }
];

let CurrentFrameIndex = 0;
let LoadingAnimationTimer = 0;
const LOADING_FRAME_DURATION = 0.033; // (30FPS)
let LoadingScreenAnimationImages = []; // ローディングアニメーション用Imageオブジェクト配列

// 現在選択されているボタンを記憶する
let NowSelectButton = ButtonID.Button1; // 初期はボタン1

export const TitleScreenImages = [
  "titleImageBg"
];

export class TitileScreen extends BaseScreen{
	/**
     * コンストラクタ
     * @param {PIXI.Application} App - メインPixiインスタンス
     * @param {SCREEN_STATE} ScreenState - このインスタンスがどの画面を指すか
     */
    constructor(App, ScreenState){
        super(App, ScreenState);
		this.TitleTextures = [];
		this.TitleBackgroundImage = null;
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
		await this.LoadTitleScreenAssetsForPixi();

		// 画像を作成
		const TitleBgTexture = PIXI.Texture.from("titleImageBg");
		this.TitleBackgroundImage = new PIXI.Sprite(TitleBgTexture);

		// 画像のアンカーを設定
      	this.TitleBackgroundImage.anchor.set(0);// 左上が座標
      	this.TitleBackgroundImage.scale.set(InitialScale); // 初期スケールと画像サイズ調整

		// 画像の位置を調整
      	this.TitleBackgroundImage.x = 0; // 画面の一番左上に合わせる
      	this.TitleBackgroundImage.y = 0;

		// 画像を追加
		this.ScreenContainer.addChild(this.TitleBackgroundImage);
        NowSelectButton = ButtonID.Button1; // 初期はボタン1

		const buttons = [];
		for (let i = 0; i < ButtonConfigs.length; i++) {
			const config = ButtonConfigs[i];
			// app.rendererを渡してボタンを非同期で生成
			const button = await CustomButton.create(this.App.renderer, config);
			button.x = this.App.screen.width - ((this.App.screen.width / 10) + config.width/2);
			button.y = 150 + i * 100;
			button.pivot.set(button.width / 2, button.height / 2); // 中央を基点にする
			
			// クリック時のイベントリスナー
			button.on('button_click', (id) => {
				console.log(`${id} がクリックされました！`);
			});

			this.ScreenContainer.addChild(button);
			buttons.push(button);
		}



		super.SetScreenVisible(false); // 初期は非表示
	}
	
		/**
	   * リサイズ処理を行う
	   * @param {PIXI.Application} App - メインPixiインスタンス
		 * @param {number} CurrentOverallScale 現在のメイン画面倍率
	   */
		ResizeScreen(App, CurrentOverallScale){
			if (!this.ScreenContainer) return;
			const BaseTextureWidth = this.TitleBackgroundImage.texture.orig.width;
			const BaseTextureHeight = this.TitleBackgroundImage.texture.orig.height;
			const AspectRatio = BaseTextureWidth / BaseTextureHeight;
			// 高さを基準に幅を決める
			let DisplayHeight = BaseTextureHeight * CurrentOverallScale; // 仮の縮小率
			let DisplayWidth = DisplayHeight * AspectRatio;
	
			this.TitleBackgroundImage.width = DisplayWidth;
			this.TitleBackgroundImage.height = DisplayHeight;
				
	
			// 一番左上を合わせる
			this.TitleBackgroundImage.x = (App.screen.width  - DisplayWidth)  /2;
			this.TitleBackgroundImage.y = (App.screen.height - DisplayHeight) / 2;
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
	async LoadTitleScreenAssetsForPixi() {
        const TitleFrameKeysToLoad = TitleScreenImages.filter(key => ImageAssetPaths[key]);
        const AssetsToLoadForPixi = TitleFrameKeysToLoad.map(key => ({ alias: key, src: ImageAssetPaths[key] }));
        if (AssetsToLoadForPixi.length > 0) {
            await PIXI.Assets.load(AssetsToLoadForPixi);

            TitleFrameKeysToLoad.forEach(key => {
            const texture = PIXI.Texture.from(key);
            this.TitleTextures.push(texture);
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
        return this.ScreenState;
	  }
	
	
	  Sound(){
	
	  }
}