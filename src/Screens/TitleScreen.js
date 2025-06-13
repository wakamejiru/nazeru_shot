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

const TitleButtonSizeWidth = 400;
const TitleButtonSizeHeight = 130;

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

// 現在選択されているボタンを記憶する
let NowSelectButton = ButtonID.Button1; // 初期はボタン1

export const TitleScreenImages = [
  "titleImageBg",
  "gameLogo"
];

const ButtonDescriptions = {
    "game_start": "メインゲームです．",
    "extra_mode": "メインゲームクリア後に行える、特別なモードです。",
    "gallery": "イラストや動画，開発者の愚痴を鑑賞できます。",
    "audio_room": "ゲーム内で使用されているBGMを聴くことができます。",
    "option": "操作方法など，ゲームの各種設定を変更します。"
};

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
		this.descriptionContainer = null; // 全体をまとめるコンテナ
        this.descriptionBackground = null;  // 背景パネル
        this.descriptionText = null;        // テキスト
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

		// キャラ画像を選択
		const TitleLogoTexture = PIXI.Texture.from("gameLogo");
		this.TitleLogoImage = new PIXI.Sprite(TitleLogoTexture);
		// 画像のアンカーを設定
      	this.TitleLogoImage.anchor.set(0.5);
      	this.TitleLogoImage.scale.set(InitialScale); // 初期スケールと画像サイズ調整
		// 画像の位置を調整
      	this.TitleLogoImage.x = this.TitleBackgroundImage.width / 10 + this.TitleLogoImage.width / 2; // 画面の一番左上に合わせる
      	this.TitleLogoImage.y = this.TitleBackgroundImage.height/2;
		// 画像を追加
		this.ScreenContainer.addChild(this.TitleLogoImage);
		
		this.descriptionContainer = new PIXI.Container();

		// 1. 背景パネルをGraphicsで描画
		const baseDescWidth = 800;  // 背景の基準となる幅
		const baseDescHeight = 120; // 背景の基準となる高さ
		this.descriptionBackground = new PIXI.Graphics();
		this.descriptionBackground.roundRect(0, 0, baseDescWidth, baseDescHeight, 15); // x, y, width, height, cornerRadius
		this.descriptionBackground.fill({ color: 0xffffff, alpha: 0.85 }); // 半透明の白で塗りつぶし
		this.descriptionBackground.stroke({ width: 4, color: 0x333333, alpha: 0.9 });      // 枠線
		this.descriptionContainer.addChild(this.descriptionBackground);

		// 2. テキストを作成
		const descriptionStyle = new PIXI.TextStyle({
			fontSize: 32,
			fill: '#000000', // テキストの色を黒に変更
			wordWrap: true,
			// 折り返し幅は、背景の幅から左右の余白を引いたサイズに
			wordWrapWidth: baseDescWidth - 40, 
			lineHeight: 40,
			align: 'left', // 左揃え
		});
		this.descriptionText = new PIXI.Text('ボタンにカーソルを合わせると説明が表示されます。', descriptionStyle);
		this.descriptionText.anchor.set(0.5); // テキスト自体のアンカーは中央
		// テキストを背景パネルの中央に配置
		this.descriptionText.x = baseDescWidth / 2;
		this.descriptionText.y = baseDescHeight / 2;
		this.descriptionContainer.addChild(this.descriptionText);

		// 3. 画面に説明文コンテナを追加
		this.ScreenContainer.addChild(this.descriptionContainer);

		for (let i = 0; i < ButtonConfigs.length; i++) {
			let baseConfig  = ButtonConfigs[i];
			// 幅を更新する(現在の大きさに合わせてサイズを変更して入れる) // デフォは1920*1080想定で設計
			// 幅を新しく設定
			baseConfig.width = this.TitleBackgroundImage.texture.orig.width * 0.27;
			baseConfig.height = ((this.TitleBackgroundImage.texture.orig.height * 0.7) / ButtonConfigs.length) - (this.TitleBackgroundImage.texture.orig.height * 0.05);
			// app.rendererを渡してボタンを非同期で生成
			const button = await CustomButton.create(this.App.renderer, baseConfig);
			button.x = 0;
			// Y座標：初期位置を基準に、画面全体のスケールに合わせて調整
			button.y = 0;

			button.pivot.set(button.width / 2, button.height / 2); // 中央を基点にする
			
			// クリック時のイベントリスナー
			button.on('button_click', (id) => {
				console.log(`${id} がクリックされました！`);
			});

			button.on('pointerover', () => {
				// IDを元に説明文データを探してテキストを更新
				this.descriptionText.text = ButtonDescriptions[button.id] || ''; 
			});

			// カーソルが外れた時のイベント
			button.on('pointerout', () => {
				// デフォルトのテキストに戻す
				this.descriptionText.text = 'ボタンにカーソルを合わせると説明が表示されます。';
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
			let BaseTextureWidth = this.TitleBackgroundImage.texture.orig.width;
			let BaseTextureHeight = this.TitleBackgroundImage.texture.orig.height;
			const DisplaySizeWidth = this.App.screen.width;
			const DisplaySizeheight = this.App.screen.height;
			const newTitleSize = this.CalculateAspectRatioFit(BaseTextureWidth, BaseTextureHeight, DisplaySizeWidth, DisplaySizeheight);
			this.TitleBackgroundImage.width = newTitleSize.width;
			this.TitleBackgroundImage.height = newTitleSize.height;	
			// 一番左上を合わせる
			const ScreenStartPointWidth = (App.screen.width  - this.TitleBackgroundImage.width)  /2;
			const ScreenStartPointheight = (App.screen.height - this.TitleBackgroundImage.height) / 2;
			this.TitleBackgroundImage.x = ScreenStartPointWidth;
			this.TitleBackgroundImage.y = ScreenStartPointheight;

			// ここからはAppのサイズは当てにならないので，バックグラウンドの画像で判断を付ける(バックグラウンドが実質画面サイズ)
			const NowImageSizeWidth = this.TitleBackgroundImage.width;
			const NowImageSizeHeight = this.TitleBackgroundImage.height;
			const NowStartPointX = this.TitleBackgroundImage.x;
			const NowStartPointY = this.TitleBackgroundImage.y;

			// キャラ画像を合わせる
			BaseTextureWidth = this.TitleLogoImage.texture.orig.width;
			BaseTextureHeight = this.TitleLogoImage.texture.orig.height;

			this.TitleLogoImage.width = BaseTextureWidth * CurrentOverallScale;
			this.TitleLogoImage.height = BaseTextureHeight * CurrentOverallScale;

			this.TitleLogoImage.x = NowStartPointX + (NowImageSizeWidth / 10 + this.TitleLogoImage.width / 2);
			this.TitleLogoImage.y = NowStartPointY + (NowImageSizeHeight * 0.1);

			
			const StartButtonY = NowImageSizeHeight * 0.1;
			const ButtonDuringPoint = NowImageSizeHeight * 0.05;

			// 登録されているボタンのリサイズを行う
			this.buttons.forEach((button, i) => {
				// 1. 各ボタンのリサイズ関数を呼び出す
				button.resizeButton(App, CurrentOverallScale);

				// 2. ボタンの位置を再計算する
				button.x = ScreenStartPointWidth + NowImageSizeWidth - ((NowImageSizeWidth / 10 ) + button.width/2);
				button.y = ScreenStartPointheight + StartButtonY + (i* (button.height + ButtonDuringPoint));
			});

			if (this.descriptionContainer) {
				// --- 基準サイズを定義 ---
				const baseDescWidth = 800;
				const baseDescHeight = 120;
				const baseFontSize = 32;
				const basePadding = 20; // テキストの左右の余白

				// --- スケールを適用した新しいサイズを計算 ---
				// 幅は半分から，ボタンのお尻まで
				// 高さはボタンの二倍
				const newWidth = ((this.buttons[1].x) - NowImageSizeWidth / 2);
				const newHeight = this.buttons[1].height * 1;
				const newFontSize = baseFontSize * CurrentOverallScale;
				const newPadding = basePadding * CurrentOverallScale;

				// 1. 背景パネルを再描画
				this.descriptionBackground.clear(); // 以前の描画をクリア
				this.descriptionBackground.roundRect(0, 0, newWidth, newHeight, 15 * CurrentOverallScale);
				this.descriptionBackground.fill({ color: 0xffffff, alpha: 0.85 });
				this.descriptionBackground.stroke({ width: 4 * CurrentOverallScale, color: 0x333333, alpha: 0.9 });

				// 2. テキストスタイルを更新
				this.descriptionText.style.fontSize = newFontSize;
				this.descriptionText.style.lineHeight = newFontSize * 1.25;
				this.descriptionText.style.wordWrapWidth = newWidth - (newPadding * 2);
				
				// 3. テキストを再中央化
				this.descriptionText.x = newWidth / 2;
				this.descriptionText.y = newHeight / 2;

				// 4. コンテナ全体の位置を調整（例：画面下部中央）
				const screenCenterX = NowImageSizeWidth / 2;
				const bottomMargin = NowImageSizeHeight * 0.05; // 画面下から5%の位置
				this.descriptionContainer.x = NowStartPointX + screenCenterX;
				this.descriptionContainer.y = NowStartPointY + NowImageSizeHeight - newHeight - bottomMargin;
			}
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