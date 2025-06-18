import { CustomButton } from "../Buttons/ButtonBase.js";
import { ImageAssetPaths } from '../game_status.js'; 
import { BaseScreen, FRAME_DURATION, SCREEN_STATE } from './BaseScreen.js';
// タイトル画面

// このページにボタンは不必要

// 項目は4つ
const ButtonID = Object.freeze({
    
});

const CharaImagePath = Object.freeze({
    CharaSelect1: "CharaSelect1",
    CharaSelect2: "CharaSelect2",
    CharaSelect3: "CharaSelect3",
    CharaSelect4: "CharaSelect4",
    CharaSelect5: "CharaSelect5",
    CharaSelect6: "CharaSelect6",
    CharaSelect7: "CharaSelect7",
    CharaSelect8: "CharaSelect8",
    CharaSelect9: "CharaSelect9",
    CharaSelect10: "CharaSelect10"
});

// --- ボタンの設定 ---
const ButtonConfigs = [
    {
	}
];


export const ScreenImages = [
  "CharaBgScreen",
  "InfomationBgScreen1",
  "InfomationBgScreen2",
  "ArrowImageDown",
  "ArrowImageUp",
];

export class CharaSelectScreen extends BaseScreen{
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
		this.CharaInfoContainer = null;
		this.CharaInfoBgImg1 = null;
		this.CharaInfoBgImg2 = null;
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
		const ScreenBgTexture = PIXI.Texture.from("CharaBgScreen");
		this.ScreenBackgroundImage = new PIXI.Sprite(ScreenBgTexture);
      	this.ScreenBackgroundImage.anchor.set(0);// 左上が座標
      	this.ScreenBackgroundImage.scale.set(InitialScale); // 初期スケールと画像サイズ調整
      	this.ScreenBackgroundImage.x = 0; // 画面の一番左上に合わせる
      	this.ScreenBackgroundImage.y = 0;
		this.ScreenContainer.addChild(this.ScreenBackgroundImage);

		// キャラクターの情報表示用のコンテナを作成する
		this.CharaInfoContainer1 = new PIXI.Container();

		const InfomationBgTexture1 = PIXI.Texture.from("InfomationBgScreen1");
		this.CharaInfoBgImg1 = new PIXI.Sprite(InfomationBgTexture1);
      	this.CharaInfoBgImg1.anchor.set(0);// 左上が座標
      	this.CharaInfoBgImg1.scale.set(InitialScale); // 初期スケールと画像サイズ調整
      	this.CharaInfoBgImg1.x = 0; // 画面の一番左上に合わせる
      	this.CharaInfoBgImg1.y = 0;
		this.CharaInfoContainer1.addChild(this.CharaInfoBgImg1);


		this.CharaInfoContainer2 = new PIXI.Container();
		const InfomationBgTexture2 = PIXI.Texture.from("InfomationBgScreen2");
		this.CharaInfoBgImg2 = new PIXI.Sprite(InfomationBgTexture2);
      	this.CharaInfoBgImg2.anchor.set(0);// 左上が座標
      	this.CharaInfoBgImg2.scale.set(InitialScale); // 初期スケールと画像サイズ調整
      	this.CharaInfoBgImg2.x = 0; // 画面の一番左上に合わせる
      	this.CharaInfoBgImg2.y = 0;
		this.CharaInfoContainer2.addChild(this.CharaInfoBgImg2);


		// 各情報を入れる枠を作る
		const InfomationGraphics = new PIXI.Graphics();
        InfomationGraphics.lineStyle(2, 0xffffff);
		// サブが5つ、メインが2つ、のため
		// 枠は名称、発射レート、威力
		const BulletTextNumber = (5 + 2 + 1)*3;
		// サブスキル2 ULT1 項目が3
		const SkillTextNumber = (2+1+1)*3;

		// 通常テキスト用のスタイル
        const textStyle = new PIXI.TextStyle({
            fontFamily: '"Helvetica Neue", "Arial", "Noto Serif JP"',
            fontSize: 48,
            fill: '#000000', // 黒
            align: 'center',
        });

		// コンテナを追加する
		for (let i = 0; i < (BulletTextNumber); i++) {
			const text = new PIXI.Text(String("a"), textStyle);
			this.CharaInfoContainer1.addChild(text);
		}

		// コンテナを追加する
		for (let i = 0; i < (SkillTextNumber); i++) {
			const text = new PIXI.Text(String("a"), textStyle);
			this.CharaInfoContainer2.addChild(text);
		}

		// コンテナに追加するのではなく、キャラ選択ごとにコンテナを作成する
		this.CharaImageContainer = new PIXI.Container();
		// テストとしてキャラ1だけでのみ作成
		const CharaImageTexture = PIXI.Texture.from(CharaImagePath.CharaSelect1);
		this.ScreenChara1Image = new PIXI.Sprite(CharaImageTexture);

		// 画像のアンカーを設定
      	this.ScreenChara1Image.anchor.set(0.5);
      	this.ScreenChara1Image.scale.set(InitialScale); // 初期スケールと画像サイズ調整

		// 画像の位置を調整
      	this.ScreenChara1Image.x = 0; // 画面の一番左上に合わせる
      	this.ScreenChara1Image.y = 0;
		this.CharaImageContainer.addChild(this.ScreenChara1Image);

		// this.ClippingMask = new PIXI.Graphics();
		// this.ScreenContainer.addChild(this.ClippingMask);
		// this.MapContainer.mask = this.ClippingMask; // スプライトにマスクを追加

		this.ScreenContainer.addChild(this.CharaImageContainer);
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
			
			// // 背景の画像をそのサイズに合うように修正
			// // 縦幅でサイズの倍率を調べる
			// this.ScreenMapImage.height = NewBGScreenHeight;
			// // アスペクト比を出す
			// const MapImageAspect = this.ScreenBackgroundImage.texture.orig.width / this.ScreenBackgroundImage.texture.orig.height;
			// this.ScreenMapImage.width = MapImageAspect * this.ScreenBackgroundImage.texture.orig.width;
			// this.ScreenMapImage.x = 0;
			// this.ScreenMapImage.y = 0;


			
			// // ここからはAppのサイズは当てにならないので，バックグラウンドの画像で判断を付ける(バックグラウンドが実質画面サイズ)
			// const MapImageSizeWidth = this.ScreenMapImage.width;
			// const MapImageSizeHeight = this.ScreenMapImage.height;

			// const NowStartPointX = this.ScreenBackgroundImage.x;
			// const NowStartPointY = this.ScreenBackgroundImage.y;

			// this.ScrollPointXMin = ScreenStartPointWidth;
			// this.ScrollPointXMax = ScreenStartPointWidth + NewBGScreenWidht;


			// this.ClippingMask.clear();
			// this.ClippingMask.beginFill(0xFFFFFF);
			// // マスクの位置とサイズを前景コンテナと完全に一致させる
			// this.ClippingMask.drawRect(NowStartPointX, NowStartPointY, NewBGScreenWidht, NewBGScreenHeight);
			// this.ClippingMask.endFill();

			this.updateButtonSelection(); // ボタンの初期位置を設定(スクロール状態を更新)
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
		let NextScreen = this.ScreenState; // 次のスクリーン情報
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
				// 現在表示されている回転方向に応じてキャラクターを選択する
            }
        }
		
		// Keyの入力が何かあったかを判断する
        return NextScreen;
	  }
	
	
	  Sound(){
	
	  }

	/**
     * ボタンの選択状態と説明文を更新するヘルパー関数
     */
    updateButtonSelection() {
        if (!this.buttons || this.buttons.length == 0) return;
		// ボタンをアクティブ状態に変更
		
    }

}