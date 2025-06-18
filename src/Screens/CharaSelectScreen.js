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


// バレットのインフォメーションテキストを埋めていく
// 3列×8行
export const InfomationBulletTexts = Object.freeze({
  RateOfFire: "発射速度",
  BulletSpeed: "弾の速度",
  MainBulleName1: "メインバレット1",
  MainBulleName2: "メインバレット2"
});


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
		const BulletTextNumber = (5 + 2 + 1)*2;
		// サブスキル2 ULT1 項目が3
		const SkillTextNumber = (2+1+1)*3;

		// 通常テキスト用のスタイル
        const textStyle = new PIXI.TextStyle({
            fontFamily: '"Helvetica Neue", "Arial", "Noto Serif JP"',
            fontSize: 48,
            fill: '#000000', // 黒
            align: 'center',
        });

		this.BulletInfoTexts = [];

		// コンテナを追加する
		for (let i = 0; i < (BulletTextNumber); i++) {
			const text = new PIXI.Text(String("a"), textStyle);
			this.CharaInfoContainer1.addChild(text);
			this.BulletInfoTexts.push(text);
		}

		this.SkillInfoTexts = [];

		// コンテナを追加する
		for (let i = 0; i < (SkillTextNumber); i++) {
			const text = new PIXI.Text(String("a"), textStyle);
			this.CharaInfoContainer2.addChild(text);
			this.SkillInfoTexts.push(text);
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
		this.ScreenContainer.addChild(this.CharaInfoContainer1);
		this.ScreenContainer.addChild(this.CharaInfoContainer2);
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

			// 表示画面の基準位置
			const ScreenStartX = this.ScreenBackgroundImage.x;
			const ScreenStartY = this.ScreenBackgroundImage.y;
			
			// 背景の画像をそのサイズに合うように修正
			// まずは表の設計を行っていく
			// 表の配置は右側，半分を使用する
			// 縦は上2割がキャラ名，バレット説明4割，キャラ説明4割
			// キャラ名表示区間を定義
			const CharaNameHeight = (NewBGScreenHeight * 0.2);
			
			
			
			// 各余白を定義
			const InfoMarginWidth = (NewBGScreenWidht)*0.05;
			const InfoMarginHeight = (NewBGScreenHeight)*0.05;

			const InfoTableSizeW1 = (NewBGScreenWidht /2)  - InfoMarginWidth*2; // 左右で2倍
			const InfoTableSizeH1 = (NewBGScreenHeight * 0.4) - InfoMarginHeight*2; // 左右で2倍

			this.CharaInfoBgImg1.width = InfoTableSizeW1;
			this.CharaInfoBgImg1.height = InfoTableSizeH1;
			this.CharaInfoBgImg1.x = ScreenStartX + (NewBGScreenWidht /2) + InfoMarginWidth;
			this.CharaInfoBgImg1.y = ScreenStartY + CharaNameHeight + InfoMarginHeight;

			this.CharaInfoBgImg2.width = InfoTableSizeW1;
			this.CharaInfoBgImg2.height = InfoTableSizeH1;
			this.CharaInfoBgImg2.x = ScreenStartX + (NewBGScreenWidht /2) + InfoMarginWidth;
			this.CharaInfoBgImg2.y = this.CharaInfoBgImg1.y + this.CharaInfoBgImg1.height + InfoMarginHeight;
			


			


		
		
		
		
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

	/**
     * キャラの情報を更新
     */
	UpdateBulletSkillInfomation(){
		// 間に文字を入れていく
		this.BulletInfoTexts[0].text = "";
		this.BulletInfoTexts[1].text = "発射速度";
		this.BulletInfoTexts[2].text = "威力";

		this.BulletInfoTexts[3].text = "メイン武器1";
		this.BulletInfoTexts[4].text = "メイン武器2";

		this.BulletInfoTexts[5].text = "サブ武器1";
		this.BulletInfoTexts[6].text = "サブ武器2";
		this.BulletInfoTexts[7].text = "サブ武器3";
		this.BulletInfoTexts[8].text = "サブ武器4";
		this.BulletInfoTexts[9].text = "サブ武器5";

		// キャラのBulletの弾速度
		// Main
		this.BulletInfoTexts[10].text = "10.0 m/s";
		this.BulletInfoTexts[11].text = "10.0 m/s";
		// Sub
		this.BulletInfoTexts[12].text = "10.0 m/s";
		this.BulletInfoTexts[13].text = "10.0 m/s";
		this.BulletInfoTexts[14].text = "10.0 m/s";
		this.BulletInfoTexts[15].text = "10.0 m/s";
		this.BulletInfoTexts[16].text = "10.0 m/s";
		
		// キャラのBulletの威力
		// Main
		this.BulletInfoTexts[17].text = "10";
		this.BulletInfoTexts[18].text = "10";
		// Sub
		this.BulletInfoTexts[19].text = "10";
		this.BulletInfoTexts[20].text = "10";
		this.BulletInfoTexts[21].text = "10";
		this.BulletInfoTexts[22].text = "10";
		this.BulletInfoTexts[23].text = "10";

		// 次にスキルの欄を記入する
		this.SkillInfoTexts[1].text = "スキル項目";
		this.SkillInfoTexts[2].text = "効果";
		// スキル種類名
		this.SkillInfoTexts[3].text = "スキル1";
		this.SkillInfoTexts[4].text = "スキル2";
		this.SkillInfoTexts[5].text = "ULT";

		this.SkillInfoTexts[6].text = "15秒ごとに4秒間弾が追尾弾になる";
		this.SkillInfoTexts[7].text = "7秒ごとに100ヒーリング";
		this.SkillInfoTexts[8].text = "ULT効果";
	}

}