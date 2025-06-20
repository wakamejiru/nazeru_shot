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
  ...Object.values(CharaImagePath) // ←これでキャラ画像を読み込む
];


// バレットのインフォメーションテキストを埋めていく
const InfoFontSize = 34;
// 通常テキスト用のスタイル
const textStyle = new PIXI.TextStyle({
	fontFamily: '"Helvetica Neue", "Arial", "Noto Serif JP"',
	fontSize: InfoFontSize,
	fill: '#000000', // 黒
	align: 'center',
	wordWrap: false,
    wordWrapWidth: 1, 
	align: 'left', 
});

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
		this.selectedCharaIndex = 0;
        this.InputCooldown = 0;       // キー入力のクールダウンタイマー
        this.COOLDOWN_TIME = 0.2;     // キー入力のクールダウン時間(秒)
		this.CharaInfoContainer = null;
		this.CharaInfoBgImg1 = null;
		this.CharaInfoBgImg2 = null;
		this.RotationCharaNow = false;
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
		const SkillTextNumber = (2+1+1)*2;



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

		// キャラクターの画像の表示を行う
		// まず円形の画像を用意する
		const CharaRadius = this.ScreenBackgroundImage.width - this.ScreenBackgroundImage.width*0.05 - (this.ScreenBackgroundImage.width/2 - 0.1*this.ScreenBackgroundImage.width); // 円の半径
		const CharaCenterX = 0; // 中心X
		const CharaCenterY = this.ScreenBackgroundImage.height/2; // 中心Y

		const CharaImageKeys = Object.values(CharaImagePath);
		const CharaAngleStep = (2 * Math.PI) / CharaImageKeys.length;

		this.ScreenCharaImages = [];

		for (let i = 0; i < CharaImageKeys.length; i++) {
			const Angle = CharaAngleStep * i;
			const x = this.ScreenBackgroundImage.width - (CharaCenterX + CharaRadius * Math.cos(Angle)); // 中心座標軸が異なるため、修正する
			const y = CharaCenterY + CharaRadius * Math.sin(Angle);
			const CharaImageTexture = PIXI.Texture.from(CharaImageKeys[i]);
			const CharaSprite = new PIXI.Sprite(CharaImageTexture);
			CharaSprite.anchor.set(0.5);
			CharaSprite.x = x;
			CharaSprite.y = y;
			CharaSprite.scale.set(InitialScale);
			this.ScreenCharaImages.push(CharaSprite);
			this.CharaImageContainer.addChild(this.ScreenCharaImages[i]);
		}

		this.ClippingMask = new PIXI.Graphics();
		this.ScreenContainer.addChild(this.ClippingMask);
		this.CharaImageContainer.mask = this.ClippingMask; // マスクを追加

		// 矢印のコンテナを作成
		this.ArrowContainer = new PIXI.Container();
		const ArrowUpTexture = PIXI.Texture.from("ArrowImageUp");
		this.ArrowUpImage = new PIXI.Sprite(ArrowUpTexture);
		this.ArrowUpImage.anchor.set(0.5);// 左上が座標
      	this.ArrowUpImage.scale.set(InitialScale); // 初期スケールと画像サイズ調整
      	this.ArrowUpImage.x = 0; // 画面の一番左上に合わせる
      	this.ArrowUpImage.y = 0;
		this.ArrowContainer.addChild(this.ArrowUpImage);

		const ArrowDownTexture = PIXI.Texture.from("ArrowImageDown");
		this.ArrowDownImage = new PIXI.Sprite(ArrowDownTexture);
		this.ArrowDownImage.anchor.set(0.5);// 左上が座標
      	this.ArrowDownImage.scale.set(InitialScale); // 初期スケールと画像サイズ調整
      	this.ArrowDownImage.x = 0; // 画面の一番左上に合わせる
      	this.ArrowDownImage.y = 0;
		this.ArrowContainer.addChild(this.ArrowDownImage);
		
		// アニメを追加
		this.AnimateArrows();

		this.ScreenContainer.addChild(this.CharaImageContainer);
		this.ScreenContainer.addChild(this.CharaInfoContainer1);
		this.ScreenContainer.addChild(this.CharaInfoContainer2);
		this.ScreenContainer.addChild(this.ArrowContainer);
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

			 // リサイズするためにアニメ描写を削除する
			if (this.ArrowUpTween) {
				this.ArrowUpTween.kill();
			}
			if (this.ArrowDownTween) {
				this.ArrowDownTween.kill();
			}
			gsap.killTweensOf(this.ArrowUpImage);
		    gsap.killTweensOf(this.ArrowDownImage);

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
			const CharaInfoHeightParcent = 0.2;
			const BulletInfoHeightParcent = 0.4;
			const SkillInfoHeightParcent = 0.4;
			// キャラ名表示区間を定義
			const CharaNameHeight = (NewBGScreenHeight * CharaInfoHeightParcent);
			
			
			
			// 各余白を定義
			const InfoMarginWidth = (NewBGScreenWidht)*0.05;
			const InfoMarginHeight = (NewBGScreenHeight)*0.05;

			const InfoTableSizeW1 = (NewBGScreenWidht /2)  - InfoMarginWidth*2; // 左右で2倍
			const InfoTableSizeH1 = (NewBGScreenHeight * BulletInfoHeightParcent) - InfoMarginHeight*2; // 左右で2倍

			this.CharaInfoBgImg1.width = InfoTableSizeW1;
			this.CharaInfoBgImg1.height = InfoTableSizeH1;
			this.CharaInfoBgImg1.x = ScreenStartX + (NewBGScreenWidht /2) + InfoMarginWidth;
			this.CharaInfoBgImg1.y = ScreenStartY + CharaNameHeight + InfoMarginHeight;

			this.CharaInfoBgImg2.width = InfoTableSizeW1;
			this.CharaInfoBgImg2.height = InfoTableSizeH1;
			this.CharaInfoBgImg2.x = ScreenStartX + (NewBGScreenWidht /2) + InfoMarginWidth;
			this.CharaInfoBgImg2.y = this.CharaInfoBgImg1.y + this.CharaInfoBgImg1.height + InfoMarginHeight;
			
			// 表になるように文字を配置していく

			// マージン
			const BulletInfoMarginHeight = this.CharaInfoBgImg1.height*0.025;
			const BulletInfoMarginWidth = this.CharaInfoBgImg1.width*0.025;
			// 情報表示の開始位置
			const BulletStartPosX = this.CharaInfoBgImg1.x + BulletInfoMarginWidth;
			const BulletStartPosY = this.CharaInfoBgImg1.y + BulletInfoMarginHeight;

			// バレットの部分は横3つ縦8つのため
			// 縦の長さは8分割
			const BulletInfoHeight = (this.CharaInfoBgImg1.height - BulletInfoMarginHeight*2) / 8;
			// 横は項目ごとに大きさが異なる 
			const BulletInfoWidth = (this.CharaInfoBgImg1.width - BulletInfoMarginWidth*2);
			// 5:2.5:2.5
			const BulletInfoNameWidth = BulletInfoWidth*0.4;
			const BulletInfoRateWidth = BulletInfoWidth*0.3;
			const BulletInfoPowerWidth = BulletInfoWidth*0.3;

			this.BulletInfoTexts[0].x = BulletStartPosX;
			this.BulletInfoTexts[0].y = BulletStartPosY;

			this.BulletInfoTexts[1].x = this.BulletInfoTexts[0].x + BulletInfoNameWidth;
			this.BulletInfoTexts[1].y = BulletStartPosY;

			this.BulletInfoTexts[2].x = this.BulletInfoTexts[1].x + BulletInfoRateWidth;
			this.BulletInfoTexts[2].y = BulletStartPosY;
			
			// 縦一列3から9まで
			// 一列で規則性をもって変化するのでヘルパ関数で処理をする
			const BulletInfoPositionStart = (BulletInfoNamberStart, BulletInfoNamberEnd, StartXPoint, BulletBaseInfoHeight, CurrentOverallScale) => {
				let PreviousPositionY=BulletBaseInfoHeight;
				for (let i = BulletInfoNamberStart; i <=BulletInfoNamberEnd; ++i){
					this.BulletInfoTexts[i].x = StartXPoint;
					this.BulletInfoTexts[i].y = PreviousPositionY + BulletInfoHeight;
					this.BulletInfoTexts[i].style.fontSize = InfoFontSize * CurrentOverallScale;
					PreviousPositionY = this.BulletInfoTexts[i].y;
				}
			};

			// 弾の種類(3から9が同じ)
			BulletInfoPositionStart(3, 9, this.BulletInfoTexts[0].x, this.BulletInfoTexts[0].y, CurrentOverallScale);
			
			// 弾の発射レート
			BulletInfoPositionStart(10, 16, this.BulletInfoTexts[1].x, this.BulletInfoTexts[1].y, CurrentOverallScale);

			// 弾の威力
			BulletInfoPositionStart(17, 23, this.BulletInfoTexts[2].x, this.BulletInfoTexts[2].y, CurrentOverallScale);

			// スキル表も位置作成
			// 半分を書く
			const BulletInfoMarginHeight2 = this.CharaInfoBgImg2.height*0.025;
			const BulletInfoMarginWidth2 = this.CharaInfoBgImg2.width*0.025;
			
			// 情報表示の開始位置
			const BulletStartPosX2 = this.CharaInfoBgImg2.x + BulletInfoMarginHeight2;
			const BulletStartPosY2 = this.CharaInfoBgImg2.y + BulletInfoMarginWidth2;

			// 表の一項目当たりの大きさを宣言
			const SkillInfoHeight = (this.CharaInfoBgImg2.height - BulletInfoMarginHeight2*2) / 4;
			// 横は項目ごとに大きさが異なる 
			const SkillInfoWidth = (this.CharaInfoBgImg1.width - BulletInfoMarginWidth2*2);
			// スキルの項目名と効果の部分で線を分ける
			const SkillNameWidhtParcet =  0.4;
			const SkillContainWidhtParcet =  1 - SkillNameWidhtParcet;
			const SkillNameWidth = SkillInfoWidth*SkillNameWidhtParcet;
			const SkillContainWidth = SkillInfoWidth*SkillContainWidhtParcet;

			this.SkillInfoTexts[0].x = BulletStartPosX2;
			this.SkillInfoTexts[0].y = BulletStartPosY2;

			this.SkillInfoTexts[1].x = this.SkillInfoTexts[0].x + SkillNameWidth;
			this.SkillInfoTexts[1].y = BulletStartPosY2;
			
			// 一列で規則性をもって変化するのでヘルパ関数で処理をする
			const SkillInfoPositionStart = (InfoNamberStart, InfoNamberEnd, StartXPoint, BaseInfoHeight, CurrentOverallScale, WrapWidth) => {
				let PreviousPositionY=BaseInfoHeight;
				for (let i = InfoNamberStart; i <=InfoNamberEnd; ++i){
					this.SkillInfoTexts[i].x = StartXPoint;
					this.SkillInfoTexts[i].y = PreviousPositionY + SkillInfoHeight;
					
					// 謎使用
					// 謎仕様によってインスタンスを作り直さないと反映されない
					const oldText = this.SkillInfoTexts[i];
					const newText = new PIXI.Text(oldText.text, new PIXI.TextStyle({
						fontSize: InfoFontSize * CurrentOverallScale,
						wordWrap: true,
						wordWrapWidth: WrapWidth,
						breakWords: true,
						fill: '#000000',
						fontFamily: oldText.style.fontFamily,
						align: oldText.style.align,
					}));

					newText.x = oldText.x;
					newText.y = oldText.y;
					this.CharaInfoContainer2.removeChild(oldText);
					this.CharaInfoContainer2.addChild(newText);
					this.SkillInfoTexts[i] = newText;
					PreviousPositionY = this.SkillInfoTexts[i].y;
				}
			};

			// スキルの種類
			SkillInfoPositionStart(2, 4, this.SkillInfoTexts[0].x, this.SkillInfoTexts[0].y, CurrentOverallScale, SkillNameWidth);
			
			// スキル効果
			// こちらはフォントサイズをもっと下げる
			const SkillContatinFomatMag = CurrentOverallScale*0.5;
			SkillInfoPositionStart(5, 7, this.SkillInfoTexts[1].x, this.SkillInfoTexts[1].y, SkillContatinFomatMag, SkillContainWidth);
			
			// キャラの画像の再配置を行う


			const CharaCenterX = 0; // 中心X
			const CharaCenterY = NewBGScreenHeight/2; // 中心Y

			const CharaImageKeys = Object.values(CharaImagePath);
			const CharaAngleStep = (2 * Math.PI) / CharaImageKeys.length;

			for (let i = 0; i < CharaImageKeys.length; i++) {
				// 回転軸角度は通常よりπ分だけ早くなっている
				const Angle = Math.PI + CharaAngleStep * i;
				this.ScreenCharaImages[i].scale.set(CurrentOverallScale * 0.6);
				// アンカーが画像の中心なので，半径は画像の幅も用いる
				const CharaImageWidth = this.ScreenCharaImages[i].width;
				const CharaRadius = NewBGScreenWidht - (NewBGScreenWidht*0.05 + CharaImageWidth / 2); // 円の半径

				const x = ScreenStartX + NewBGScreenWidht + (CharaCenterX + CharaRadius * Math.cos(Angle));
				const y = ScreenStartY + CharaCenterY + CharaRadius * Math.sin(Angle);
				this.ScreenCharaImages[i].x = x;
				this.ScreenCharaImages[i].y = y;
			}

			// 回転のコンテナの基準位置を設定する
			// 回転の中心はバックグラウンド画像のX軸は端，Y軸は中心
			const RadiusCenteX = this.ScreenBackgroundImage.x + NewBGScreenWidht;
			const RadiusCenteY = this.ScreenBackgroundImage.y + (NewBGScreenHeight*0.5);

			this.CharaImageContainer.pivot.set(RadiusCenteX, RadiusCenteY); // 回転の中心を設定
			this.CharaImageContainer.position.set(RadiusCenteX, RadiusCenteY); // 表示位置

			this.ClippingMask.clear();
			this.ClippingMask.beginFill(0xFFFFFF);
			// マスクの位置とサイズを前景コンテナと完全に一致させる
			this.ClippingMask.drawRect(this.ScreenBackgroundImage.x, this.ScreenBackgroundImage.y, NewBGScreenWidht, NewBGScreenHeight);
			this.ClippingMask.endFill();

			// 矢印位置を設定する
			// 横幅はキャラの回転半径の場所と同じ
			const CharaRadiusX = ScreenStartX + (NewBGScreenWidht*0.05 + this.ScreenCharaImages[0].width / 2); // 円の半径

			// キャラ画像を合わせる
			BaseTextureWidth = this.ArrowDownImage.texture.orig.width;
			BaseTextureHeight = this.ArrowDownImage.texture.orig.height;

			this.ArrowDownImage.width = BaseTextureWidth * CurrentOverallScale*0.1;
			this.ArrowDownImage.height = BaseTextureHeight * CurrentOverallScale*0.1;
			this.ArrowDownImage.x = CharaRadiusX;
			this.ArrowDownImage.y = ScreenStartY + NewBGScreenHeight*0.8 + (this.ArrowDownImage.height/2);

			BaseTextureWidth = this.ArrowUpImage.texture.orig.width;
			BaseTextureHeight = this.ArrowUpImage.texture.orig.height;

			this.ArrowUpImage.width = BaseTextureWidth * CurrentOverallScale*0.1;
			this.ArrowUpImage.height = BaseTextureHeight * CurrentOverallScale*0.1;
			this.ArrowUpImage.x = CharaRadiusX;
			this.ArrowUpImage.y = ScreenStartY + NewBGScreenHeight*0.2 - (this.ArrowUpImage.height/2);

			this.updateButtonSelection(); // ボタンの初期位置を設定(スクロール状態を更新)
			this.AnimateArrows();
		}
	
		/**
	   * 画面の開始を行う
	   * @param {boolean} Visible - true:ON false:OFF
	   */
	  StartScreen(){
			this.UpdateBulletSkillInfomation();
			this.AnimateArrows();
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
        let DetectionRotation = false;
		// ▼▼▼【ここから変更】ゲームパッド優先ロジック ▼▼▼

        // 1. ゲームパッドの入力を優先してチェック
        if (InputCurrentState.gamepad) {
            const pad = InputCurrentState.gamepad;

            // --- 十字キーまたは左スティックの左右 ---
            if (pad.dpad.up) {
                DetectionRotation = true;
                selectionChanged = true;
            } else if (pad.dpad.down) {
                DetectionRotation = false;
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
            if (InputCurrentState.keys.has('ArrowUp')) {
                DetectionRotation = true;
                selectionChanged = true;
            }
            // --- 下矢印キー ---
            else if (InputCurrentState.keys.has('ArrowDown')) {
                DetectionRotation = false;
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
            // this.updateButtonSelection(); // 見た目を更新
            // キャラ画像の回転を行う
			this.RotateCharaContainer(DetectionRotation);
			
			this.InputCooldown = this.COOLDOWN_TIME; // キーリピートによる高速移動を防ぐ
        }
        // 決定が押された場合
        else if (confirmed) {
			this.InputCooldown = this.COOLDOWN_TIME; // 決定後、少し待つ

			// 押されたボタンに対して遷移先を決定する
			// 現在表示されている回転方向に応じてキャラクターを選択する

			NextScreen = SCREEN_STATE.GAMEPLAY;
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
		this.SkillInfoTexts[0].text = "スキル項目";
		this.SkillInfoTexts[1].text = "効果";
		// スキル種類名
		this.SkillInfoTexts[2].text = "スキル1";
		this.SkillInfoTexts[3].text = "スキル2";
		this.SkillInfoTexts[4].text = "ULT";

		this.SkillInfoTexts[5].text = "15秒ごとに4秒間弾が追尾弾になる";
		this.SkillInfoTexts[6].text = "7秒ごとに100ヒーリング";
		this.SkillInfoTexts[7].text = "ULT効果";
	}

	/**
     * キャラの画像を回転させる
	 * @param {bool} direction  回転方向 true:時計回り false:反時計回り
     */
	RotateCharaContainer(direction) {
		if(this.RotationCharaNow == false){
			const CharaImageKeys = Object.values(CharaImagePath);
			const CharaAngleStep = (2 * Math.PI) / CharaImageKeys.length;

			const targetRotation = this.CharaImageContainer.rotation + (direction ? 1 : -1) * CharaAngleStep;
			this.RotationCharaNow = true;
			gsap.to(this.CharaImageContainer, {
				rotation: targetRotation,
				duration: 0.5,
				ease: "power2.out",
				onComplete: () => {
					// キャラ情報を更新させる
					// 回転運動のキャンセルを行う
					this.RotationCharaNow = false;
				}
			});
		}
	
	}

	/**
     * 矢印のアニメーションを描く
     */
	AnimateArrows() {
		this.ArrowUpTween = gsap.to(this.ArrowUpImage, {
			y: this.ArrowUpImage.y - (this.ArrowUpImage.height*0.1),
			duration: 0.6,
			yoyo: true,
			repeat: -1,
			ease: "sine.inOut",
		});

		this.ArrowDownTween = gsap.to(this.ArrowDownImage, {
			y: this.ArrowDownImage.y + (this.ArrowDownImage.height*0.1),
			duration: 0.6,
			yoyo: true,
			repeat: -1,
			ease: "sine.inOut",
		});
	}

}