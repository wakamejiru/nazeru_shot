import { CustomButton } from "../Buttons/ButtonBase.js";
import { ImageAssetPaths } from '../game_status.js'; 
import { BaseScreen, FRAME_DURATION, SCREEN_STATE } from './BaseScreen.js';
// タイトル画面

// 項目は4つ
const ButtonID = Object.freeze({
    Button1: "ButtonStage1",
    Button2: "ButtonStage2",
    Button3: "ButtonStage3",
    Button4: "ButtonStage4",
    Button5: "ButtonStage5",
    Button6: "ButtonStage6",
    Button7: "ButtonStage7",
    Button8: "ButtonStage8",
    Button9: "ButtonStage9",
    Button10: "ButtonStage10",
    Button11: "ButtonStage11",
    Button12: "ButtonStage12",
    Button13: "ButtonStage13",
});

const TitleButtonSizeWidth = 100
const TitleButtonSizeHeight = 100;

// --- ボタンの設定 ---
const ButtonConfigs = [
    {
        id: ButtonID.Button1,
        width: TitleButtonSizeWidth,
        height: TitleButtonSizeHeight,
        iconPath: '',
        soundPath: 'system45',
        shape: {
			cornerRadius: 20
		},
		fill_colors: {
			normal: 0xFFFFFF,
			selected: 0xff00ff,
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
        id: ButtonID.Button2,
        width: TitleButtonSizeWidth,
        height: TitleButtonSizeHeight,
        iconPath: '',
        soundPath: 'system45',
        shape: {
			cornerRadius: 20
		},
		fill_colors: {
			normal: 0xFFFFFF,
			selected: 0xff00ff,
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
        id: ButtonID.Button3,
        width: TitleButtonSizeWidth,
        height: TitleButtonSizeHeight,
        iconPath: '',
        soundPath: 'system45',
        shape: {
			cornerRadius: 20
		},
		fill_colors: {
			normal: 0xFFFFFF,
			selected: 0xff00ff,
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
        id: ButtonID.Button4,
        width: TitleButtonSizeWidth,
        height: TitleButtonSizeHeight,
        iconPath: '',
        soundPath: 'system45',
        shape: {
			cornerRadius: 20
		},
		fill_colors: {
			normal: 0xFFFFFF,
			selected: 0xff00ff,
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
        id: ButtonID.Button5,
        width: TitleButtonSizeWidth,
        height: TitleButtonSizeHeight,
        iconPath: '',
        soundPath: 'system45',
        shape: {
			cornerRadius: 20
		},
		fill_colors: {
			normal: 0xFFFFFF,
			selected: 0xff00ff,
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
        id: ButtonID.Button6,
        width: TitleButtonSizeWidth,
        height: TitleButtonSizeHeight,
        iconPath: '',
        soundPath: 'system45',
        shape: {
			cornerRadius: 20
		},
		fill_colors: {
			normal: 0xFFFFFF,
			selected: 0xff00ff,
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
        id: ButtonID.Button7,
        width: TitleButtonSizeWidth,
        height: TitleButtonSizeHeight,
        iconPath: '',
        soundPath: 'system45',
        shape: {
			cornerRadius: 20
		},
		fill_colors: {
			normal: 0xFFFFFF,
			selected: 0xff00ff,
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
        id: ButtonID.Button8,
        width: TitleButtonSizeWidth,
        height: TitleButtonSizeHeight,
        iconPath: '',
        soundPath: 'system45',
        shape: {
			cornerRadius: 20
		},
		fill_colors: {
			normal: 0xFFFFFF,
			selected: 0xff00ff,
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
        id: ButtonID.Button9,
        width: TitleButtonSizeWidth,
        height: TitleButtonSizeHeight,
        iconPath: '',
        soundPath: 'system45',
        shape: {
			cornerRadius: 20
		},
		fill_colors: {
			normal: 0xFFFFFF,
			selected: 0xff00ff,
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
        id: ButtonID.Button10,
        width: TitleButtonSizeWidth,
        height: TitleButtonSizeHeight,
        iconPath: '',
        soundPath: 'system45',
        shape: {
			cornerRadius: 20
		},
		fill_colors: {
			normal: 0xFFFFFF,
			selected: 0xff00ff,
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
        id: ButtonID.Button11,
        width: TitleButtonSizeWidth,
        height: TitleButtonSizeHeight,
        iconPath: '',
        soundPath: 'system45',
        shape: {
			cornerRadius: 20
		},
		fill_colors: {
			normal: 0xFFFFFF,
			selected: 0xff00ff,
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
        id: ButtonID.Button12,
        width: TitleButtonSizeWidth,
        height: TitleButtonSizeHeight,
        iconPath: '',
        soundPath: 'system45',
        shape: {
			cornerRadius: 20
		},
		fill_colors: {
			normal: 0xFFFFFF,
			selected: 0xff00ff,
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
        id: ButtonID.Button13,
        width: TitleButtonSizeWidth,
        height: TitleButtonSizeHeight,
        iconPath: '',
        soundPath: 'system45',
        shape: {
			cornerRadius: 20
		},
		fill_colors: {
			normal: 0xFFFFFF,
			selected: 0xff00ff,
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
  "MapBgScreen",
  "MapImage"
];

export class MapScreen extends BaseScreen{
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
		this.scrollSpeed = 8; // スクロール速度
		
		// 現在選択されているボタンを記憶する
		this.NowSelectButton = ButtonID.Button1; // 初期はボタン1
		this.selectedButtonIndex = 0;
        this.InputCooldown = 0;       // キー入力のクールダウンタイマー
        this.COOLDOWN_TIME = 0.2;     // キー入力のクールダウン時間(秒)

		this.ScrollPointXMin = 0;
		this.ScrollPointXMax = 0;

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
		const ScreenBgTexture = PIXI.Texture.from("MapBgScreen");
		this.ScreenBackgroundImage = new PIXI.Sprite(ScreenBgTexture);

		// 画像のアンカーを設定
      	this.ScreenBackgroundImage.anchor.set(0);// 左上が座標
      	this.ScreenBackgroundImage.scale.set(InitialScale); // 初期スケールと画像サイズ調整

		// 画像の位置を調整
      	this.ScreenBackgroundImage.x = 0; // 画面の一番左上に合わせる
      	this.ScreenBackgroundImage.y = 0;
		this.ScreenContainer.addChild(this.ScreenBackgroundImage);

		// 背景画像をコンテナに追加するのではなく、コンテナそのものに背景画像を追加する
		this.MapContainer = new PIXI.Container();

		const MapImageTexture = PIXI.Texture.from("MapImage");
		this.ScreenMapImage = new PIXI.Sprite(MapImageTexture);

		// 画像のアンカーを設定
      	this.ScreenMapImage.anchor.set(0);// 左上が座標
      	this.ScreenMapImage.scale.set(InitialScale); // 初期スケールと画像サイズ調整

		// 画像の位置を調整
      	this.ScreenMapImage.x = 0; // 画面の一番左上に合わせる
      	this.ScreenMapImage.y = 0;
		this.MapContainer.addChild(this.ScreenMapImage);

		for (const baseConfig of ButtonConfigs) {
			const button = await CustomButton.create(this.App.renderer, baseConfig);

            // ▼▼▼【変更点】▼▼▼
            // 設定ファイルから読み込んだマップ座標にボタンを配置
			button.x = this.ScreenBackgroundImage.width / ButtonConfigs.length;
			button.y = this.ScreenBackgroundImage.height / 2;

			// button.pivot.set(button.width / 2, button.height / 2); // 必要であれば設定
			this.MapContainer.addChild(button);
			this.buttons.push(button);
		}

		this.ClippingMask = new PIXI.Graphics();
		this.ScreenContainer.addChild(this.ClippingMask);
		this.ScreenMapImage.mask = this.ClippingMask; // スプライトにマスクを追加

		this.ScreenContainer.addChild(this.MapContainer);

		super.SetScreenVisible(false); // 初期は非表示
	}
	
		/**
	   * リサイズ処理を行う
	   * @param {PIXI.Application} App - メインPixiインスタンス
		 * @param {number} CurrentOverallScale 現在のメイン画面倍率
	   */
		ResizeScreen(App, CurrentOverallScale){
			if (!this.ScreenContainer) return;

			// 背景の黒い画像を用意する
			const DisplaySizeWidth = this.App.screen.width;
			const DisplaySizeheight = this.App.screen.height;
			let BaseTextureWidth = this.ScreenBackgroundImage.texture.orig.width;
			let BaseTextureHeight = this.ScreenBackgroundImage.texture.orig.height;
			const newTitleSize = this.CalculateAspectRatioFit(BaseTextureWidth, BaseTextureHeight, DisplaySizeWidth, DisplaySizeheight);
			this.ScreenBackgroundImage.width = newTitleSize.width;
			this.ScreenBackgroundImage.height = newTitleSize.height;	
			// 一番左上を合わせる
			const ScreenStartPointWidth = (App.screen.width  - this.ScreenBackgroundImage.width)  /2;
			const ScreenStartPointheight = (App.screen.height - this.ScreenBackgroundImage.height) / 2;
			this.ScreenBackgroundImage.x = ScreenStartPointWidth;
			this.ScreenBackgroundImage.y = ScreenStartPointheight;

			// 今回の表示方法は一味違う
			// 1 16:9の画像を入れて、現在表示できる画面の横幅、縦幅をもらう
			// 縦をめいいっぱい表示する
			const NewBGScreenWidht = this.ScreenBackgroundImage.width;
			const NewBGScreenHeight = this.ScreenBackgroundImage.height;
			
			// 背景の画像をそのサイズに合うように修正
			// 縦幅でサイズの倍率を調べる
			this.ScreenMapImage.height = NewBGScreenHeight;
			// アスペクト比を出す
			const MapImageAspect = this.ScreenBackgroundImage.texture.orig.width / this.ScreenBackgroundImage.texture.orig.height;
			this.ScreenMapImage.width = MapImageAspect * this.ScreenBackgroundImage.texture.orig.width;
			this.ScreenMapImage.x = this.ScreenBackgroundImage.x;
			this.ScreenMapImage.y = this.ScreenBackgroundImage.y;


			
			// ここからはAppのサイズは当てにならないので，バックグラウンドの画像で判断を付ける(バックグラウンドが実質画面サイズ)
			const MapImageSizeWidth = this.ScreenMapImage.width;
			const MapImageSizeHeight = this.ScreenMapImage.height;

			const NowStartPointX = this.ScreenBackgroundImage.x;
			const NowStartPointY = this.ScreenBackgroundImage.y;
			
			const StartButtonX = MapImageSizeWidth * 0.05;
			const StartButtonY = MapImageSizeHeight * 0.5;

			// 登録されているボタンのリサイズを行う
			this.buttons.forEach((button, i) => {
				// 1. 各ボタンのリサイズ関数を呼び出す
				button.resizeButton(App, CurrentOverallScale);

				// 2. ボタンの位置を再計算する
				// 真ん中に再配置
				button.x = ScreenStartPointWidth + StartButtonX + i * ((MapImageSizeWidth-StartButtonX) / ButtonConfigs.length);
				button.y = ScreenStartPointheight + StartButtonY + ((i%2 == 0)? +(MapImageSizeHeight*0.25) : -(MapImageSizeHeight*0.25));
			});

			this.ScrollPointXMin = ScreenStartPointWidth;
			this.ScrollPointXMax = ScreenStartPointWidth + NewBGScreenWidht;


			this.ClippingMask.clear();
			this.ClippingMask.beginFill(0xFFFFFF);
			// マスクの位置とサイズを前景コンテナと完全に一致させる
			this.ClippingMask.drawRect(NowStartPointX, NowStartPointY, NewBGScreenWidht, NewBGScreenHeight);
			this.ClippingMask.endFill();
			
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

            // --- 十字キーまたは左スティックの左右 ---
            if (pad.dpad.left) {
                this.selectedButtonIndex--;
                if (this.selectedButtonIndex < 0) {
                    this.selectedButtonIndex = this.buttons.length - 1;
                }
                selectionChanged = true;
            } else if (pad.dpad.right) {
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
            // --- 左矢印キー ---
            if (InputCurrentState.keys.has('ArrowLeft')) {
                this.selectedButtonIndex--;
                if (this.selectedButtonIndex < 0) {
                    this.selectedButtonIndex = this.buttons.length - 1;
                }
                selectionChanged = true;
            }
            // --- 下矢印キー ---
            else if (InputCurrentState.keys.has('ArrowRight')) {
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

				// 押されたボタンに対して遷移先を決定する
				switch(selectedButton){
					case ButtonID.Button1:
						break; 
				}
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
		// 今回はボタンに加えて，背景が移動する
		// 新しく選択したボタンのNumberを取得
		const NowSelectButtonIndex = this.selectedButtonIndex;

		// 今のボタンが表示できる範囲を求める
		const NowSelectButton = this.buttons[NowSelectButtonIndex];
		const NowButtonX = NowSelectButton.x;
		let ShiftNumberX = 0;
		// 今のX座標が表示されているかを見る
		if(NowButtonX > this.ScrollPointXMin && NowButtonX < this.ScrollPointXMax){
			// ボタンが現在の座標の間にある場合は，スクロールを行わない
		}else{
			// スクロールを行う 表示したいボタンと，現在の位置の差分:1.5倍を移動させる
			// 右に表示しきれていないか，左に表示しきれていないかで引く値が変化する
			ShiftNumberX = (NowButtonX - ((NowButtonX > this.ScrollPointXMin) ? this.ScrollPointXMax : this.ScrollPointXMin)) * 1.5;
		}

		// マップ画像の最大側を超えていないかを確認する
		if (ShiftNumberX +  this.ScrollPointXMax > this.ScreenMapImage.width) {
			// 超えていた場合　this.ScrollPointXMaxを最大値に，this.ScrollPointXMinをMaxから逆算した値に
			this.ScrollPointXMax = this.ScreenMapImage.width;
			this.ScrollPointXMin = this.ScrollPointXMax - this.ScreenBackgroundImage.width;
		}
		// 次にマップ画像の最小側を超えていないかを確認する 
		else if(ShiftNumberX +  this.ScrollPointXMin < 0){
			// 超えていた場合 this.ScrollPointXMinを最小値にthis.ScrollPointXMaxをそこから逆算した値に
			this.ScrollPointXMax = this.ScreenBackgroundImage.width;
			this.ScrollPointXMin = 0;
		}else{
			this.ScrollPointXMax += ShiftNumberX;
			this.ScrollPointXMin -= ShiftNumberX;
		}

		// マスク部分もずらす必要がある


		this.MapContainer.x = this.ScrollPointXMin;
    }

}