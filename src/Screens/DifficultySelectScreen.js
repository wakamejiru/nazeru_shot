import { CustomButton } from "../Buttons/ButtonBase.js";
import { ImageAssetPaths } from '../game_status.js'; 
import { BaseScreen, FRAME_DURATION, SCREEN_STATE } from './BaseScreen.js';
// タイトル画面

// 項目は5つ
const ButtonID = Object.freeze({
    Button1: "Easy",
    Button2: "Normal",
    Button3: "Hard",
    Button4: "Lunatic"
});

const TitleButtonSizeWidth = 400;
const TitleButtonSizeHeight = 130;

// --- ボタンの設定 ---
const ButtonConfigs = [
    {
        id: "easy_button",
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
        id: "normal_button",
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
        id: "hard_button",
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
        id: "lunatic_button",
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
    }
];


export const ScreenImages = [
  "titleImageBg"
];

const ButtonDescriptions = {
    "easy_button": "最も攻撃が少なく、穏やかな難易度です.",
    "normal_button": "標準的な難易度です。EazyModeが許されるのはSTG未経験者までだよね～ww",
    "hard_button": "割と自慢できる難易度です。演出を愉しむ余裕など要らないね。",
    "lunactic_button": "いつもの難易度です。意味が分からなければ遊ばない。"
};

export class DifficultySelectScreen extends BaseScreen{
	/**
     * コンストラクタ
     * @param {PIXI.Application} App - メインPixiインスタンス
     * @param {SCREEN_STATE} ScreenState - このインスタンスがどの画面を指すか
     */
    constructor(App, ScreenState){
        super(App, ScreenState);
		this.ScreenTextures = [];
		this.ScreenBackgroundImage = null;
		this.buttons = [];
		this.descriptionContainer = null; // 全体をまとめるコンテナ
        this.descriptionBackground = null;  // 背景パネル
        this.descriptionText = null;        // テキスト

		
		// 現在選択されているボタンを記憶する
		this.NowSelectButton = ButtonID.Button1; // 初期はボタン1
		this.selectedButtonIndex = 0;
        this.InputCooldown = 0;       // キー入力のクールダウンタイマー
        this.COOLDOWN_TIME = 0.2;     // キー入力のクールダウン時間(秒)
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
		await this.LoadScreenAssetsForPixi();

		// 画像を作成
		const ScreenBgTexture = PIXI.Texture.from("titleImageBg");
		this.ScreenBackgroundImage = new PIXI.Sprite(ScreenBgTexture);

		// 画像のアンカーを設定
      	this.ScreenBackgroundImage.anchor.set(0);// 左上が座標
      	this.ScreenBackgroundImage.scale.set(InitialScale); // 初期スケールと画像サイズ調整

		// 画像の位置を調整
      	this.ScreenBackgroundImage.x = 0; // 画面の一番左上に合わせる
      	this.ScreenBackgroundImage.y = 0;

		// 画像を追加
		this.ScreenContainer.addChild(this.ScreenBackgroundImage);
        this.NowSelectButton = ButtonID.Button1; // 初期はボタン1
		
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
			this.ScreenContainer.addChild(button);
			this.buttons.push(button);
		}
		this.updateButtonSelection(); // ボタンの初期位置を設定



		super.SetScreenVisible(false); // 初期は非表示
	}
	
		/**
	   * リサイズ処理を行う
	   * @param {PIXI.Application} App - メインPixiインスタンス
		 * @param {number} CurrentOverallScale 現在のメイン画面倍率
	   */
		ResizeScreen(App, CurrentOverallScale){
			if (!this.ScreenContainer) return;
			let BaseTextureWidth = this.ScreenBackgroundImage.texture.orig.width;
			let BaseTextureHeight = this.ScreenBackgroundImage.texture.orig.height;
			const DisplaySizeWidth = this.App.screen.width;
			const DisplaySizeheight = this.App.screen.height;
			const newTitleSize = this.CalculateAspectRatioFit(BaseTextureWidth, BaseTextureHeight, DisplaySizeWidth, DisplaySizeheight);
			this.ScreenBackgroundImage.width = newTitleSize.width;
			this.ScreenBackgroundImage.height = newTitleSize.height;	
			// 一番左上を合わせる
			const ScreenStartPointWidth = (App.screen.width  - this.ScreenBackgroundImage.width)  /2;
			const ScreenStartPointheight = (App.screen.height - this.ScreenBackgroundImage.height) / 2;
			this.ScreenBackgroundImage.x = ScreenStartPointWidth;
			this.ScreenBackgroundImage.y = ScreenStartPointheight;

			// ここからはAppのサイズは当てにならないので，バックグラウンドの画像で判断を付ける(バックグラウンドが実質画面サイズ)
			const NowImageSizeWidth = this.ScreenBackgroundImage.width;
			const NowImageSizeHeight = this.ScreenBackgroundImage.height;
			const NowStartPointX = this.ScreenBackgroundImage.x;
			const NowStartPointY = this.ScreenBackgroundImage.y;
			
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
				const baseFontSize = 32;
				const basePadding = 20; // テキストの左右の余白

				// --- スケールを適用した新しいサイズを計算 ---
				// 幅は1/3から，ボタンのお尻まで
				// 高さはボタンの二倍
				const newWidth = (((this.buttons[1].x) + this.buttons[1].width/2)- NowImageSizeWidth / 3) - NowStartPointX;
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
				const screenCenterX = NowImageSizeWidth / 3;
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
	async LoadScreenAssetsForPixi() {
        const FrameKeysToLoad = ScreenImages.filter(key => ImageAssetPaths[key]);
        const AssetsToLoadForPixi = FrameKeysToLoad.map(key => ({ alias: key, src: ImageAssetPaths[key] }));
        if (AssetsToLoadForPixi.length > 0) {
            await PIXI.Assets.load(AssetsToLoadForPixi);

            FrameKeysToLoad.forEach(key => {
            const texture = PIXI.Texture.from(key);
            this.ScreenTextures.push(texture);
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
		 if (this.InputCooldown > 0) {
            this.InputCooldown -= DeltaTime;
        }

		// Keyの入力が何かあったかを判断する
        if (!InputCurrentState || this.InputCooldown > 0) {
            return this.ScreenState;
        }

        let selectionChanged = false;
        let confirmed = false;

        // ▼▼▼【ここから変更】ゲームパッド優先ロジック ▼▼▼

        // 1. ゲームパッドの入力を優先してチェック
        if (InputCurrentState.gamepad) {
            const pad = InputCurrentState.gamepad;

            // --- 十字キーまたは左スティックの上下 ---
            if (pad.dpad.up) {
                this.selectedButtonIndex--;
                if (this.selectedButtonIndex < 0) {
                    this.selectedButtonIndex = this.buttons.length - 1;
                }
                selectionChanged = true;
            } else if (pad.dpad.down) {
                this.selectedButtonIndex++;
                if (this.selectedButtonIndex >= this.buttons.length) {
                    this.selectedButtonIndex = 0;
                }
                selectionChanged = true;
            }

            // --- 決定ボタン (Aボタンなど) ---
            if (pad.confirm) {
                confirmed = true;
            }
        }
        // 2. ゲームパッドの入力がなければ、キーボードをチェック
        else {
            // --- 上矢印キー ---
            if (InputCurrentState.keys.has('ArrowUp')) {
                this.selectedButtonIndex--;
                if (this.selectedButtonIndex < 0) {
                    this.selectedButtonIndex = this.buttons.length - 1;
                }
                selectionChanged = true;
            }
            // --- 下矢印キー ---
            else if (InputCurrentState.keys.has('ArrowDown')) {
                this.selectedButtonIndex++;
                if (this.selectedButtonIndex >= this.buttons.length) {
                    this.selectedButtonIndex = 0;
                }
                selectionChanged = true;
            }
            // --- エンターキー ---
            else if (InputCurrentState.keys.has('Enter')) {
                confirmed = true;
            }
        }

        // --- 入力後の処理を共通化 ---

        // 選択が変更された場合
        if (selectionChanged) {
            this.updateButtonSelection(); // 見た目を更新
            this.InputCooldown = this.COOLDOWN_TIME; // キーリピートによる高速移動を防ぐ
        }
        // 決定が押された場合
        else if (confirmed) {
            const selectedButton = this.buttons[this.selectedButtonIndex];
            if (selectedButton) {
                selectedButton.triggerClick(); // クリックを発火
                this.InputCooldown = this.COOLDOWN_TIME; // 決定後、少し待つ
            }
        }
		
		// Keyの入力が何かあったかを判断する
        return this.ScreenState;
	  }
	
	
	  Sound(){
	
	  }

	  /**
     * ボタンの選択状態と説明文を更新するヘルパー関数
     */
    updateButtonSelection() {
        if (!this.buttons || this.buttons.length === 0) return;

        this.buttons.forEach((button, index) => {
            // 現在のインデックスと一致するかどうかで選択状態を設定
            const isSelected = (index === this.selectedButtonIndex);
            button.setSelected(isSelected);
        });

        // 選択中のボタンの説明文を表示
        const selectedButton = this.buttons[this.selectedButtonIndex];
        if (selectedButton) {
            this.descriptionText.text = ButtonDescriptions[selectedButton.id] || '';
        }
    }
}