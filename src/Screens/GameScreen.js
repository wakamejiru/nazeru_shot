import { CustomButton } from "../Buttons/ButtonBase.js";
import { ImageAssetPaths } from '../game_status.js'; 
import { BaseScreen, FRAME_DURATION, SCREEN_STATE } from './BaseScreen.js';
// タイトル画面

// ボタンはない
const ButtonID = Object.freeze({
});

const ButtonLabel = Object.freeze({
});

const ButtonSizeWidth = 150;
const ButtonSizeHeight = 150;


export const ScreenImages = [
  "GameBgScreen",
  "ShootingScreen",
  "LogoImage",
  "ULTBgImg",
  "ScoreBgImg",
  "ULTPointImageOn",
  "ULTPointImageOff",
];

// 実際のゲーム画面を設計する
export class GameScreen extends BaseScreen{
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
		await this.LoadcreenAssetsForPixi();

		// 画像を作成
		const ScreenBgTexture = PIXI.Texture.from("GameBgScreen");
		this.ScreenBackgroundImage = new PIXI.Sprite(ScreenBgTexture);

		// 画像のアンカーを設定
      	this.ScreenBackgroundImage.anchor.set(0);// 左上が座標
      	this.ScreenBackgroundImage.scale.set(InitialScale); // 初期スケールと画像サイズ調整

		// 画像の位置を調整
      	this.ScreenBackgroundImage.x = 0; // 画面の一番左上に合わせる
      	this.ScreenBackgroundImage.y = 0;
		// 画像を追加
		this.ScreenContainer.addChild(this.ScreenBackgroundImage);

		// 背景に置くロゴを追加
		this.LogoImage = new PIXI.Sprite(PIXI.Texture.from("LogoImage"));
      	this.LogoImage.anchor.set(0);// 左上が座標
      	this.LogoImage.scale.set(InitialScale); // 初期スケールと画像サイズ調整
      	this.LogoImage.x = 0; // 画面の一番左上に合わせる
      	this.LogoImage.y = 0;
		// 画像を追加
		this.ScreenContainer.addChild(this.LogoImage);


		// シューティングゲームの操作画面を作成(コンテナでまとめる)
		// キャラなどはStart時に追加
		this.ShootingContainer = new PIXI.Container();
		this.ShootingBackgroundImage = new PIXI.Sprite(PIXI.Texture.from("ShootingScreen"));
      	this.ShootingBackgroundImage.anchor.set(0);// 左上が座標
      	this.ShootingBackgroundImage.scale.set(InitialScale); // 初期スケールと画像サイズ調整
      	this.ShootingBackgroundImage.x = 0; // 画面の一番左上に合わせる
      	this.ShootingBackgroundImage.y = 0;
		this.ShootingContainer.addChild(this.ShootingBackgroundImage);

		// スコアの背景を追加(コンテナにまとめる)
		this.ScoreContainer = new PIXI.Container();
		// スコア用の文字列と，背景画像
		this.ScoreBackgroundImage = new PIXI.Sprite(PIXI.Texture.from("ScoreBgImg"));
      	this.ScoreBackgroundImage.anchor.set(0);// 左上が座標
      	this.ScoreBackgroundImage.scale.set(InitialScale); // 初期スケールと画像サイズ調整
      	this.ScoreBackgroundImage.x = 0; // 画面の一番左上に合わせる
      	this.ScoreBackgroundImage.y = 0;
		this.ScoreContainer.addChild(this.ScoreBackgroundImage);

		// 文字列を追加する
		this.ScoreTextStyle = new PIXI.TextStyle({
			fontFamily: 'Arial',
			fontSize: 36,
			fill: '#000000',
			align: 'right'
		});
		this.ScoreText = new PIXI.Text('Score: 0', this.ScoreTextStyle);
		this.ScoreText.x = 0;
		this.ScoreText.y = 0;
		this.ScoreContainer.addChild(this.ScoreText); // スコアを表示するコンテナに追加

		
		// ULTポイント画面を作成する
		// ULTコンテナ内に，ULTONコンテナとULTOFFコンテナを作成，ULTを上にしておいて，非表示にすることでOFF状態を作成する
		this.ULTContainer = new PIXI.Container();
		this.ULTContainerOn = new PIXI.Container();
		this.ULTContainerOff = new PIXI.Container();
		this.UltPointOns=[];
		this.UltPointOffs=[]
		for (let i =0; i < 5; ++i){
			this.UltPointOns[i] = new PIXI.Sprite(PIXI.Texture.from("ULTPointImageOn"));
			this.UltPointOns[i].anchor.set(0);// 左上が座標
			this.UltPointOns[i].scale.set(InitialScale); // 初期スケールと画像サイズ調整
			this.UltPointOns[i].x = 0; // 画面の一番左上に合わせる
			this.UltPointOns[i].y = 0;
			this.ULTContainerOn.addChild(this.UltPointOns[i]);

			this.UltPointOffs[i] = new PIXI.Sprite(PIXI.Texture.from("ULTPointImageOff"));
			this.UltPointOffs[i].anchor.set(0);// 左上が座標
			this.UltPointOffs[i].scale.set(InitialScale); // 初期スケールと画像サイズ調整
			this.UltPointOffs[i].x = 0; // 画面の一番左上に合わせる
			this.UltPointOffs[i].y = 0;
			this.ULTContainerOff.addChild(this.UltPointOffs[i]);
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
			let BaseTextureWidth = this.ScreenBackgroundImage.texture.orig.width;
			let BaseTextureHeight = this.ScreenBackgroundImage.texture.orig.height;
			const DisplaySizeWidth = this.App.screen.width;
			const DisplaySizeheight = this.App.screen.height;
			const newTitleSize = this.CalculateAspectRatioFit(BaseTextureWidth, BaseTextureHeight, DisplaySizeWidth, DisplaySizeheight);
			this.ScreenBackgroundImage.width = newTitleSize.width;
			this.ScreenBackgroundImage.height = newTitleSize.height;

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
			BaseTextureWidth = this.LogoImage.texture.orig.width;
			BaseTextureHeight = this.LogoImage.texture.orig.height;
			this.LogoImage.width = BaseTextureWidth * CurrentOverallScale;
			this.LogoImage.height = BaseTextureHeight * CurrentOverallScale;
			this.LogoImage.x = NowStartPointX + NowImageSizeWidth*0.75;
			this.LogoImage.y = NowStartPointY + NowImageSizeHeight*0.75;

			// シューティング画面をリサイズ
			this.ShootingBackgroundImage.width = NowImageSizeWidth*0.4;
			this.ShootingBackgroundImage.height = NowImageSizeHeight*0.4;
			this.ShootingBackgroundImage.x = NowStartPointX + NowImageSizeWidth*0.5*0.05;
			this.ShootingBackgroundImage.y = NowStartPointY + NowImageSizeHeight*0.5*0.05;

			// const StartButtonY = NowImageSizeHeight * 0.1;
			// const ButtonDuringPoint = NowImageSizeHeight * 0.05;

			// // 登録されているボタンのリサイズを行う
			// this.buttons.forEach((button, i) => {
			// 	// 1. 各ボタンのリサイズ関数を呼び出す
			// 	button.resizeButton(App, CurrentOverallScale);

			// 	// 2. ボタンの位置を再計算する
			// 	button.x = ScreenStartPointWidth + NowImageSizeWidth - ((NowImageSizeWidth / 10 ) + button.width/2);
			// 	button.y = ScreenStartPointheight + StartButtonY + (i* (button.height + ButtonDuringPoint));
			// });

			// if (this.descriptionContainer) {
			// 	// --- 基準サイズを定義 ---
			// 	const baseFontSize = 32;
			// 	const basePadding = 20; // テキストの左右の余白

			// 	// --- スケールを適用した新しいサイズを計算 ---
			// 	// 幅は1/3から，ボタンのお尻まで
			// 	// 高さはボタンの二倍
			// 	const newWidth = (((this.buttons[1].x) + this.buttons[1].width/2)- NowImageSizeWidth / 3) - NowStartPointX;
			// 	const newHeight = this.buttons[1].height * 1;
			// 	const newFontSize = baseFontSize * CurrentOverallScale;
			// 	const newPadding = basePadding * CurrentOverallScale;

			// 	// 1. 背景パネルを再描画
			// 	this.descriptionBackground.clear(); // 以前の描画をクリア
			// 	this.descriptionBackground.roundRect(0, 0, newWidth, newHeight, 15 * CurrentOverallScale);
			// 	this.descriptionBackground.fill({ color: 0xffffff, alpha: 0.85 });
			// 	this.descriptionBackground.stroke({ width: 4 * CurrentOverallScale, color: 0x333333, alpha: 0.9 });

			// 	// 2. テキストスタイルを更新
			// 	this.descriptionText.style.fontSize = newFontSize;
			// 	this.descriptionText.style.lineHeight = newFontSize * 1.25;
			// 	this.descriptionText.style.wordWrapWidth = newWidth - (newPadding * 2);
				
			// 	// 3. テキストを再中央化
			// 	this.descriptionText.x = newWidth / 2;
			// 	this.descriptionText.y = newHeight / 2;

			// 	// 4. コンテナ全体の位置を調整（例：画面下部中央）
			// 	const screenCenterX = NowImageSizeWidth / 3;
			// 	const bottomMargin = NowImageSizeHeight * 0.05; // 画面下から5%の位置
			// 	this.descriptionContainer.x = NowStartPointX + screenCenterX;
			// 	this.descriptionContainer.y = NowStartPointY + NowImageSizeHeight - newHeight - bottomMargin;
			//}
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
	async LoadcreenAssetsForPixi() {
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
		 if (this.InputCooldown > 0) {
            this.InputCooldown -= DeltaTime;
        }

		// Keyの入力が何かあったかを判断する
        if (!InputCurrentState || this.InputCooldown > 0) {
            return this.ScreenState;
        }

		let NextScreen = this.ScreenState; // 次のスクリーン情報
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

				// 押されたボタンに対して遷移先を決定する
				switch(selectedButton.id){
					case "game_start":
						NextScreen = SCREEN_STATE.DIFFICULTY_SELECT;
						break; 
				}
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