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

const TitleButtonSizeWidth = 300;
const TitleButtonSizeHeight = 70;

// --- ボタンの設定 ---
const ButtonConfigs = [
    {
        id: "game_start",
        width: TitleButtonSizeWidth,
        height: TitleButtonSizeHeight,
        label: ButtonID.Button1,
        iconPath: '',
        soundPath: 'system45',
        shape: {
			cornerRadius: 20
		},
		fill_colors: {
			normal: 0xFFFFFF,
			selected: 0x7fffd4,
			pressed: 0x48d1cc,
		},
		stroke:{
			width: 3,
			color: {
				normal:   0x000000,
				selected: 0xFFFFFF,
				pressed:  0x48d1cc,
			},
		},
			
    },
	{
        id: "extra_mode",
        width: TitleButtonSizeWidth,
        height: TitleButtonSizeHeight,
        label: ButtonID.Button2,
        iconPath: '',
        soundPath: 'system45',
        shape: {
			cornerRadius: 20
		},
		fill_colors: {
			normal: 0xFFFFFF,
			selected: 0x7fffd4,
			pressed: 0x48d1cc,
		},
		stroke:{
			width: 3,
			color: {
				normal:   0x000000,
				selected: 0xFFFFFF,
				pressed:  0x48d1cc,
			},
		},
    },
	{
        id: "gallery",
        width: TitleButtonSizeWidth,
        height: TitleButtonSizeHeight,
        label: ButtonID.Button3,
        iconPath: '',
        soundPath: 'system45',
        shape: {
			cornerRadius: 20
		},
		fill_colors: {
			normal: 0xFFFFFF,
			selected: 0x7fffd4,
			pressed: 0x48d1cc,
		},
		stroke:{
			width: 3,
			color: {
				normal:   0x000000,
				selected: 0xFFFFFF,
				pressed:  0x48d1cc,
			},
		},
    },
	{
        id: "audio_room",
        width: TitleButtonSizeWidth,
        height: TitleButtonSizeHeight,
        label: ButtonID.Button4,
        iconPath: '',
        soundPath: 'system45',
        shape: {
			cornerRadius: 20
		},
		fill_colors: {
			normal: 0xFFFFFF,
			selected: 0x7fffd4,
			pressed: 0x48d1cc,
		},
		stroke:{
			width: 3,
			color: {
				normal:   0x000000,
				selected: 0xFFFFFF,
				pressed:  0x48d1cc,
			},
		},
    },
	{
        id: "option",
        width: TitleButtonSizeWidth,
        height: TitleButtonSizeHeight,
        label: ButtonID.Button5,
        iconPath: '',
        soundPath: 'system45',
        shape: {
			cornerRadius: 20
		},
		fill_colors: {
			normal: 0xFFFFFF,
			selected: 0x7fffd4,
			pressed: 0x48d1cc,
		},
		stroke:{
			width: 3,
			color: {
				normal:   0x000000,
				selected: 0xFFFFFF,
				pressed:  0x48d1cc,
			},
		},
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
		this.buttons = [];
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

		for (let i = 0; i < ButtonConfigs.length; i++) {
			const baseConfig  = ButtonConfigs[i];
			// 幅を更新する(現在の大きさに合わせてサイズを変更して入れる) // デフォは1920*1080想定で設計

			// app.rendererを渡してボタンを非同期で生成
			const button = await CustomButton.create(this.App.renderer, baseConfig);
			button.x = this.TitleBackgroundImage.texture.orig.width - ((this.TitleBackgroundImage.texture.orig.width / 10) + baseConfig.width / 2);

			// Y座標：初期位置を基準に、画面全体のスケールに合わせて調整
			button.y = 150 + (i * 50 + ((i-1) * button.height));

			button.pivot.set(button.width / 2, button.height / 2); // 中央を基点にする
			
			// クリック時のイベントリスナー
			button.on('button_click', (id) => {
				console.log(`${id} がクリックされました！`);
			});

			this.ScreenContainer.addChild(button);
			this.buttons.push(button);
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
			const ScreenStartPointWidth = (App.screen.width  - DisplayWidth)  /2;
			const ScreenStartPointheight = (App.screen.height - DisplayHeight) / 2;

			this.TitleBackgroundImage.x = ScreenStartPointWidth;
			this.TitleBackgroundImage.y = ScreenStartPointheight;

			// 登録されているボタンのリサイズを行う
			this.buttons.forEach((button, i) => {
				// 1. 各ボタンのリサイズ関数を呼び出す
				button.resizeButton(App, CurrentOverallScale);

				// 2. ボタンの位置を再計算する
				button.x = ScreenStartPointWidth + this.TitleBackgroundImage.width - ((this.TitleBackgroundImage.width / 10 ) + button.width/2);
				button.y = ScreenStartPointheight + (this.TitleBackgroundImage.height *  (150 / 1080)) + i * (button.height + this.TitleBackgroundImage.height* (50 / 1080));
				console.log(`[After] Button ${i}:`, { 
					x: button.x, 
					y: button.y, 
					width: button.width, 
					height: button.height,
					visible: button.visible 
				});
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