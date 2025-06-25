// ゲームプレイ画面

import { CustomButton } from "../Buttons/ButtonBase.js";
import { ImageAssetPaths } from '../game_status.js'; 
import { BaseScreen, FRAME_DURATION, SCREEN_STATE, MapIndex,  CharaIndex} from './BaseScreen.js';
import {PlayerType1} from "../Player/Type1Player.js";
import {EnemyType1} from "../Enemy/EnemyType1.js";
import {EnemyType2} from "../Enemy/EnemyType2.js";


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

			
			// ゲーム中の必要なパラメータはここで宣言する
			this.NowULTPoint = 3;
			// プレイヤーと敵のインスタンス	
			this.PlayerInstance = null;
			this.EnemyInstance = null;
			this.PlayerBulletInstances = [];
			this.EnemyBulletInstances = [];
			
		}

		/**
		 * 初期化を行う
		 * @param {boolean} Visible - true:ON false:OFF
		 */
		async InitializeScreen(InitialScale){

			// 画面を作成する
			this.ScreenContainer = new PIXI.Container();

			this.NowScale = InitialScale;


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
			this.LogoImage.anchor.set(0.5);// 左上が座標
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
			this.ScoreText.anchor.set(0, 0.5);
			this.ScoreContainer.addChild(this.ScoreText); // スコアを表示するコンテナに追加

			

			this.hpBarBackground = new PIXI.Graphics(); // HPバーの背景（枠）
			this.hpBarFill = new PIXI.Graphics();       // HPバーの中身（ゲージ）

			this.ScoreContainer.addChild(this.hpBarBackground);
			this.ScoreContainer.addChild(this.hpBarFill);
			this.HPTextStyle = new PIXI.TextStyle({
				fontFamily: 'Arial',
				fontSize: 36,
				fill: '#000000',
				align: 'right'
			});
			this.HPText = new PIXI.Text("HP", this.HPTextStyle);
			this.HPText.x = 0;
			this.HPText.y = 0;
			this.HPText.anchor.set(0, 0.5);
			this.ScoreContainer.addChild(this.HPText);
			
			// ULTポイント画面を作成する
			// ULTコンテナ内に，ULTONコンテナとULTOFFコンテナを作成，ULTを上にしておいて，非表示にすることでOFF状態を作成する
			this.ULTContainer = new PIXI.Container();
			this.ULTContainerOn = new PIXI.Container();
			this.ULTContainerOff = new PIXI.Container();
			this.UltPointOns=[];
			this.UltPointOffs=[]
			for (let i =0; i < 5; ++i){
				this.UltPointOns[i] = new PIXI.Sprite(PIXI.Texture.from("ULTPointImageOn"));
				this.UltPointOns[i].anchor.set(0, 0.5);
				this.UltPointOns[i].scale.set(InitialScale); // 初期スケールと画像サイズ調整
				this.UltPointOns[i].x = 0; // 画面の一番左上に合わせる
				this.UltPointOns[i].y = 0;
				this.ULTContainerOn.addChild(this.UltPointOns[i]);

				this.UltPointOffs[i] = new PIXI.Sprite(PIXI.Texture.from("ULTPointImageOff"));
				this.UltPointOffs[i].anchor.set(0, 0.5);
				this.UltPointOffs[i].scale.set(InitialScale); // 初期スケールと画像サイズ調整
				this.UltPointOffs[i].x = 0; // 画面の一番左上に合わせる
				this.UltPointOffs[i].y = 0;
				this.ULTContainerOff.addChild(this.UltPointOffs[i]);
			}
			
			// ULTの背景を追加
			this.ULTBackgroundImage = new PIXI.Sprite(PIXI.Texture.from("ULTBgImg"));
			this.ULTBackgroundImage.anchor.set(0);// 左上が座標
			this.ULTBackgroundImage.scale.set(InitialScale); // 初期スケールと画像サイズ調整
			this.ULTBackgroundImage.x = 0; // 画面の一番左上に合わせる
			this.ULTBackgroundImage.y = 0;

			this.ULTTextStyle = new PIXI.TextStyle({
				fontFamily: 'Arial',
				fontSize: 36,
				fill: '#000000',
				align: 'right'
			});
			this.ULTText = new PIXI.Text("ULT", this.ULTTextStyle);
			this.ULTText.x = 0;
			this.ULTText.y = 0;
			this.ULTText.anchor.set(0, 0.5);

			this.ULTContainer.addChild(this.ULTBackgroundImage);
			this.ULTContainer.addChild(this.ULTContainerOn);
			this.ULTContainer.addChild(this.ULTContainerOff);
			this.ULTContainer.addChild(this.ULTText);

			// シューティング画面用のマスク
			this.ClippingMask = new PIXI.Graphics();
			this.ScreenContainer.addChild(this.ClippingMask);
			this.ShootingContainer.mask = this.ClippingMask;

			this.ScreenContainer.addChild(this.ShootingContainer);
			this.ScreenContainer.addChild(this.ScoreContainer);
			this.ScreenContainer.addChild(this.ULTContainer);
			super.SetScreenVisible(false); // 初期は非表示
		}
	
		/**
	     * リサイズ処理を行う
	     * @param {PIXI.Application} App - メインPixiインスタンス
		 * @param {number} CurrentOverallScale 現在のメイン画面倍率
	     */
		ResizeScreen(App, CurrentOverallScale){
			if (!this.ScreenContainer) return;
			this.NowScale = CurrentOverallScale;	
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

			// ロゴ画像を合わせる
			BaseTextureWidth = this.LogoImage.texture.orig.width;
			BaseTextureHeight = this.LogoImage.texture.orig.height;
			this.LogoImage.width = BaseTextureWidth * CurrentOverallScale;
			this.LogoImage.height = BaseTextureHeight * CurrentOverallScale;
			this.LogoImage.x = NowStartPointX + NowImageSizeWidth*0.8;
			this.LogoImage.y = NowStartPointY + NowImageSizeHeight*0.75;

			// シューティング画面をリサイズ
			// 画面は7割区域までもっていく 左余白は2割で幅は5割固定
			this.ShootingBackgroundImage.width = NowImageSizeWidth*0.5;
			this.ShootingBackgroundImage.height = NowImageSizeHeight*0.9;
			this.ShootingBackgroundImage.x = NowStartPointX + NowImageSizeWidth*0.1;
			this.ShootingBackgroundImage.y = NowStartPointY + NowImageSizeHeight*0.05;

			this.ClippingMask.clear();
			this.ClippingMask.beginFill(0xFFFFFF);
			// マスクの位置とサイズを前景コンテナと完全に一致させる
			this.ClippingMask.drawRect(this.ShootingBackgroundImage.x, this.ShootingBackgroundImage.y, this.ShootingBackgroundImage.width, this.ShootingBackgroundImage.height);
			this.ClippingMask.endFill();


			// スコアの表示個所を作る
			this.ScoreBackgroundImage.width = NowImageSizeWidth * 0.3
			this.ScoreBackgroundImage.height = NowImageSizeHeight * 0.2
    	  	this.ScoreBackgroundImage.x = this.ShootingBackgroundImage.x + this.ShootingBackgroundImage.width + NowImageSizeWidth*0.05;
	      	this.ScoreBackgroundImage.y = this.ShootingBackgroundImage.y + NowImageSizeHeight * 0.1;

			// スコアの文字列を背景に収める
			this.ScoreText.style.fontSize = this.ScoreTextStyle.fontSize * CurrentOverallScale;
			this.ScoreText.x = this.ScoreBackgroundImage.x + this.ScoreBackgroundImage.width*0.05;
			this.ScoreText.y = this.ScoreBackgroundImage.y + this.ScoreBackgroundImage.height*0.25;

			this.HPText.style.fontSize = this.HPTextStyle.fontSize * CurrentOverallScale;
			this.HPText.x = this.ScoreText.x;
			this.HPText.y = this.ScoreText.y + this.ScoreBackgroundImage.height*0.5;

			// スコア背景の幅を基準に、左右に5%ずつのマージンを設ける（合計90%の幅）
			const HPMargin = (this.ScoreBackgroundImage.width * 0.05);
			const hpBarMaxWidth = this.ScoreBackgroundImage.width * 0.8 - HPMargin;
			const hpBarMarginX = this.ScoreBackgroundImage.width  - hpBarMaxWidth - HPMargin;
			const hpBarHeight = this.ScoreBackgroundImage.height * 0.25; // HPバーの高さ
			
			// HPバーの座標を計算 (スコア背景の下に配置、Y方向に少し間隔をあける)
			const hpBarX = this.ScoreBackgroundImage.x + hpBarMarginX;
			const hpBarY = this.ScoreBackgroundImage.y + this.ScoreBackgroundImage.height * 0.75;

			// HPバーの背景を描画（暗い色）
			this.hpBarBackground.clear();
			this.hpBarBackground.beginFill(0x333333, 0.8); // 色:ダークグレー, 透明度:80%
			this.hpBarBackground.drawRoundedRect(hpBarX, hpBarY - (hpBarHeight * 0.5), hpBarMaxWidth, hpBarHeight, 5 * CurrentOverallScale);
			this.hpBarBackground.endFill();

			// HPバーの中身を描画（緑色） - 初期状態は満タン
			this.hpBarFill.clear();
			this.hpBarFill.beginFill(0x00FF00); // 色:緑
			this.hpBarFill.drawRoundedRect(hpBarX, hpBarY - (hpBarHeight * 0.5), hpBarMaxWidth, hpBarHeight, 5 * CurrentOverallScale);
			this.hpBarFill.endFill();
			
			// 後で更新に使うため、HPバーの寸法を保存しておく
			this.hpBarRect = { x: hpBarX, y: hpBarY, width: hpBarMaxWidth, height: hpBarHeight, cornerRadius: 5 * CurrentOverallScale };


			// ULT用の背景を作成
			this.ULTBackgroundImage.width = this.ScoreBackgroundImage.width;
			this.ULTBackgroundImage.height = NowImageSizeHeight * 0.15;
			this.ULTBackgroundImage.x = this.ScoreBackgroundImage.x;
			this.ULTBackgroundImage.y = this.ScoreBackgroundImage.y + this.ScoreBackgroundImage.height + NowImageSizeHeight * 0.1;

			this.ULTText.style.fontSize = this.ULTTextStyle.fontSize * CurrentOverallScale;
			this.ULTText.x = this.ULTBackgroundImage.x + this.ULTBackgroundImage.width*0.05;
			this.ULTText.y = this.ULTBackgroundImage.y + this.ULTBackgroundImage.height*0.5;

			const ULTPointAreaWidht = this.ULTBackgroundImage.width*0.7;
			const ULTPointAreaStartX = this.ULTBackgroundImage.x + (this.ULTBackgroundImage.width - ULTPointAreaWidht);
			for (let i =0; i < 5; ++i){
				this.UltPointOns[i].scale.set(CurrentOverallScale); // 初期スケールと画像サイズ調整
				this.UltPointOns[i].width = ULTPointAreaWidht/5;
				this.UltPointOns[i].height = this.UltPointOns[i].width; // 5角形なので同じ大きさ
				this.UltPointOns[i].x = ULTPointAreaStartX + (i * this.UltPointOns[i].width);
				this.UltPointOns[i].y = this.ULTBackgroundImage.y + this.ULTBackgroundImage.height / 2;
				this.ULTContainerOn.addChild(this.UltPointOns[i]);


				this.UltPointOffs[i].scale.set(CurrentOverallScale); // 初期スケールと画像サイズ調整
				this.UltPointOffs[i].width = ULTPointAreaWidht/5;
				this.UltPointOffs[i].height = this.UltPointOffs[i].width; // 5角形なので同じ大きさ
				this.UltPointOffs[i].x = ULTPointAreaStartX + (i * this.UltPointOffs[i].width); // 画面の一番左上に合わせる
				this.UltPointOffs[i].y = this.ULTBackgroundImage.y + this.ULTBackgroundImage.height / 2;
				this.ULTContainerOff.addChild(this.UltPointOffs[i]);
			}

			// キャラの更新を行う
			if(this.PlayerInstance){
				this.PlayerInstance.updateScale(CurrentOverallScale, this.ShootingBackgroundImage.x, this.ShootingBackgroundImage.y,
					this.ShootingBackgroundImage.width, this.ShootingBackgroundImage.height)
			}

			if(this.EnemyInstance){
				this.EnemyInstance.updateScale(CurrentOverallScale, this.ShootingBackgroundImage.x, this.ShootingBackgroundImage.y,
					this.ShootingBackgroundImage.width, this.ShootingBackgroundImage.height)
			}
		}
	
		/**
		 * 画面の開始を行う
		 * @param {boolean} Visible - true:ON false:OFF
		 */
	  	async StartScreen(){
			this.NowULTPoint = 3;
			// ULTの表示を反映
			this.UpdateULTPointVeiw();
			await this.CreateEnemyPlayerInstance();
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

		if(this.PlayerInstance){
			// スキルの判定を行う
			this.PlayerInstance._skillrun(DeltaTime);
			// 移動判定を行う
            this.PlayerInstance.move(InputCurrentState, DeltaTime);
			// 弾の発射を行う
			this.PlayerInstance._shoot(InputCurrentState, this.PlayerBulletInstances, this.EnemyInstance, DeltaTime);
        }

		if(this.EnemyInstance){
			// 移動判定を行う
            this.EnemyInstance.move(DeltaTime);
			// 弾の発射を行う
			this.EnemyInstance._shoot(this.EnemyBulletInstances, this.PlayerInstance,  DeltaTime);

			// Skillの実行を行う
			this.EnemyInstance._skilrun(DeltaTime);
        }

		// 両方の描画を行う
		if(this.PlayerInstance){
			this.PlayerInstance.DrawPlayerImage();
        }

		if(this.EnemyInstance){
            this.EnemyInstance.DrawEnemyImage();
        }

		// 味方の放った弾の情報を更新する
		this.PlayerBulletInstances.forEach((bullet, index) => {
            if(bullet){
				bullet.update(DeltaTime);
				bullet.DrwaUpdate();
			}
        });

		// 敵の放った弾の情報を更新する
		this.EnemyBulletInstances.forEach((bullet, index) => {
            if(bullet){
				bullet.update(DeltaTime);
				bullet.DrwaUpdate();
			}
        });

		// 敵の放った弾の情報を更新する（同様に新しい配列に詰め込む）
        const activeEnemyBullets = [];
        const activePlayerBullets = [];


		// X座標が弾がエリアを越していないことを判定 true:超えていない false:超えている
		const IsBulletXArea = (BulletXPos, BulletWidth) => {
            const BulletWidhtHalf = BulletWidth/2;
			const MinXArea = this.ScreenBackgroundImage.x;
			const MaxXArea = this.ScreenBackgroundImage.x + this.ScreenBackgroundImage.width;
			return (MinXArea < (BulletXPos - BulletWidhtHalf) && MaxXArea > (BulletXPos + BulletWidhtHalf));
        };

		// Y座標が弾がエリアを越していないことを判定 true:超えていない false:超えている
		const IsBulletYArea = (BulletYPos, BulletHeight) => {
            const BulletHeightHalf = BulletHeight/2;
			const MinXArea = this.ScreenBackgroundImage.y;
			const MaxXArea = this.ScreenBackgroundImage.y + this.ScreenBackgroundImage.height;
			return (MinXArea < (BulletYPos - BulletHeightHalf) && MaxXArea > (BulletYPos + BulletHeightHalf));
        };

		// 当たったり画面外になった弾は弾く
		this.EnemyBulletInstances.forEach(bullet => {
            if (bullet) {
				bullet.update(DeltaTime);
				bullet.DrwaUpdate();
                if (!bullet.isHit && IsBulletXArea(bullet.BulletImage.x, bullet.BulletImage.width) && 
				IsBulletYArea(bullet.BulletImage.y, bullet.BulletImage.height)) { // isHitしていないかつ、範囲外を出ていない弾をリストに加える
                    activeEnemyBullets.push(bullet);
                } else {
                    // isHitがtrueになった弾はここで実際にdestroyを呼び出す
                    bullet.destroy();
                }
			}
        });

		this.PlayerBulletInstances.forEach(bullet => {
            if (bullet) {
				bullet.update(DeltaTime);
				bullet.DrwaUpdate();
                if (!bullet.isHit && IsBulletXArea(bullet.BulletImage.x, bullet.BulletImage.width) && 
				IsBulletYArea(bullet.BulletImage.y, bullet.BulletImage.height)) { // isHitしていないかつ、範囲外を出ていない弾をリストに加える
                    activePlayerBullets.push(bullet);
                } else {
                    // isHitがtrueになった弾はここで実際にdestroyを呼び出す
                    bullet.destroy();
                }
			}
        });


        this.EnemyBulletInstances = activeEnemyBullets; // 新しいアクティブな弾のリストに置き換え
		this.PlayerBulletInstances = activePlayerBullets;

		this.HitJudgment();



		// Keyの入力が何かあったかを判断する
		// ポーズボタンのみ反応
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

	/**
     * 現在のULTPointの状態を表示に反映させる
     */
	UpdateULTPointVeiw(){
		let nowUltPoint = this.NowULTPoint;
		// いったんすべての表示を解除
		for(let i = 0; i < 5; ++i){
			this.UltPointOffs[i].visible = true;		
		}

		
		for(let i = 0; i < nowUltPoint; ++i){
			this.UltPointOffs[i].visible = false;		
		}
	}

	/**
     * 初期起動時のプレイヤーと敵のインスタンスを生成する
     */
	async CreateEnemyPlayerInstance(){
		const ShootingStartX = this.ShootingBackgroundImage.x;
		const ShootingStartY = this.ShootingBackgroundImage.y;
		const ShootingWidht = this.ShootingBackgroundImage.width;
		const ShootingHeight = this.ShootingBackgroundImage.height;
		switch(CharaIndex){
			case 0:
				this.PlayerInstance =  new PlayerType1(this.ShootingContainer, ShootingStartX, ShootingStartY, ShootingWidht, ShootingHeight);
				await this.PlayerInstance.Initialize();
				this.PlayerInstance.updateScale(this.NowScale, ShootingStartX, ShootingStartY, ShootingWidht, ShootingHeight);
				break;
			default:
				this.PlayerInstance =  new PlayerType1(this.ShootingContainer, ShootingStartX, ShootingStartY, ShootingWidht, ShootingHeight);
				break;
		}


		switch(MapIndex){
			case 0:
				this.EnemyInstance = new EnemyType1(this.ShootingContainer, ShootingStartX, ShootingStartY, ShootingWidht, ShootingHeight);
				await this.EnemyInstance.Initialize();
				this.EnemyInstance.updateScale(this.NowScale, ShootingStartX, ShootingStartY, ShootingWidht, ShootingHeight);
				break;
			default:
				this.EnemyInstance = new EnemyType1(this.ShootingContainer, ShootingStartX, ShootingStartY, ShootingWidht, ShootingHeight);
				this.EnemyInstance.Initialize();
				break;
		}
	}

	/**
     * プレイヤーの現在HPに応じてHPバーの表示を更新する
     */
	updateHpBarView() {
		if (!this.PlayerInstance || !this.hpBarRect) {
			return; // プレイヤーかHPバーの寸法が未定義なら何もしない
		}

		// HPの割合を計算 (0.0 ～ 1.0)
		const hpRatio = Math.max(0, this.PlayerInstance.NowHP / this.PlayerInstance.MaxHP);
		
		// 割合に応じて中身の幅を計算
		const currentFillWidth = this.hpBarRect.width * hpRatio;

		// HPバーの中身を再描画
		this.hpBarFill.clear();
		if (currentFillWidth > 0) {
			// HP残量に応じた色を選択（例：50%以上で緑、30%以上で黄色、それ未満で赤）
			const fillColor = hpRatio > 0.5 ? 0x00FF00 : hpRatio > 0.3 ? 0xFFFF00 : 0xFF0000;
			this.hpBarFill.beginFill(fillColor);
			this.hpBarFill.drawRoundedRect(this.hpBarRect.x, this.hpBarRect.y - (this.hpBarRect.height * 0.5), currentFillWidth, this.hpBarRect.height, this.hpBarRect.cornerRadius);
			this.hpBarFill.endFill();
		}
	}

	/**
     * 当たり判定を行う
     */
	HitJudgment(){
		if (this.PlayerInstance && this.EnemyBulletInstances) {
			// プレイヤーの中心座標と半径を取得 (プレイヤーは常に円形と仮定)
			const playerCenterX = this.PlayerInstance.x;
			const playerCenterY = this.PlayerInstance.y;
			const playerRadius = this.PlayerInstance.HitPointRadius;

			// 敵の弾の配列を逆順でループ
			for (let i = this.EnemyBulletInstances.length - 1; i >= 0; i--) {
				const enemyBullet = this.EnemyBulletInstances[i];
				if (!enemyBullet || !enemyBullet.BulletImage) continue;

				let isHit = false;

				// 弾の形状に応じて当たり判定を分岐
				switch (enemyBullet.shape) {
					case 'circle': // 円形
						isHit = this.checkCircleCircleCollision(
							playerCenterX, playerCenterY, playerRadius,
							enemyBullet.x, enemyBullet.y, enemyBullet.HitPointRadius || (enemyBullet.BulletImage.width / 2)
						);
						break;
					case 'rectangle': // 矩形
						isHit = this.checkCircleRectCollision(
							playerCenterX, playerCenterY, playerRadius,
							enemyBullet.x, enemyBullet.y, enemyBullet.width, enemyBullet.height, enemyBullet.orientation
						);
						break;
					case 'ellipse': // 楕円 (円形との当たり判定は少し複雑になる)
						isHit = this.checkCircleEllipseCollision(
							playerCenterX, playerCenterY, playerRadius,
							enemyBullet.x, enemyBullet.y, enemyBullet.width / 2, enemyBullet.height / 2, enemyBullet.orientation
						);
						break;
					case 'line': // 棒状 (線分と円の当たり判定)
						// 棒状の始点と終点を計算する必要がある
						// 今回はシンプル化のため、棒状の当たり判定は例示のみで、具体的な実装は要検討
						// 例: this.checkCircleLineCollision(...)
						// 現在は、とりあえず矩形として扱うか、最も近い点との距離で判定することも可能
						isHit = this.checkCircleRectCollision(
							playerCenterX, playerCenterY, playerRadius,
							enemyBullet.x, enemyBullet.y, enemyBullet.width, enemyBullet.height, enemyBullet.orientation
						);
						break;
					default: // 定義されていない形状の場合、デフォルトで矩形として扱うか、エラーを出す
						console.warn(`Unknown bullet shape: ${enemyBullet.shape}. Defaulting to rectangle collision.`);
						isHit = this.checkCircleRectCollision(
							playerCenterX, playerCenterY, playerRadius,
							enemyBullet.x, enemyBullet.y, enemyBullet.width, enemyBullet.height, enemyBullet.orientation
						);
						break;
				}

				if (isHit) {
					// --- ヒットした時の共通処理 ---
					this.PlayerInstance.NowHP -= enemyBullet.damage || 10;
					this.updateHpBarView();

					enemyBullet.destroy();
					this.EnemyBulletInstances.splice(i, 1);
					
					//console.log(`Player Hit! HP: ${this.PlayerInstance.NowHP}`);
					
					if(this.PlayerInstance.NowHP <= 0){
						console.log("GAME OVER");
						// TODO: ゲームオーバー処理
					}
					// 無敵時間など
				}
			}
		}

		if (this.EnemyInstance && this.PlayerBulletInstances) { //
			// 敵の中心座標と半径を取得 (敵も円形と仮定)
			const enemyCenterX = this.EnemyInstance.x; //
			const enemyCenterY = this.EnemyInstance.y; //
			const enemyRadius = this.EnemyInstance.EnemyHitPointRadius; // 敵インスタンスが持つ当たり判定半径

			// 味方弾の配列をループ
			for (let i = 0; i < this.PlayerBulletInstances.length; i++) { //
				const playerBullet = this.PlayerBulletInstances[i]; //
				// 弾が存在し、画像があり、まだヒットしていない弾のみを対象
				if (!playerBullet || !playerBullet.BulletImage || playerBullet.isHit) continue; //

				// 弾の中心座標と半径を取得 (弾も円形と仮定)
				// BulletクラスのHitPointRadiusプロパティを使用、なければ画像幅の半分を半径とする
				const bulletCenterX = playerBullet.x; //
				const bulletCenterY = playerBullet.y; //
				const bulletRadius = playerBullet.HitPointRadius || (playerBullet.BulletImage.width / 2); //

				// 円と円の当たり判定
				if (this.checkCircleCircleCollision( //
					enemyCenterX, enemyCenterY, enemyRadius, //
					bulletCenterX, bulletCenterY, bulletRadius //
				)) {
					// ヒットした時の処理

					this.EnemyInstance.DamageHit(playerBullet.damage  || 10);
					// TODO: 敵のHPバー更新処理があれば呼び出す
					
					playerBullet.isHit = true; // 弾をヒット済みにする
					
					//console.log(`Enemy Hit! HP: ${this.EnemyInstance.NowHPGuageHP}`); //
					
					if(this.EnemyInstance.NowEnemyHPGuage <= 0){ //
						console.log("Enemy Defeated!"); //
						// TODO: 敵撃破処理（スコア加算、次の敵の生成、ゲームクリアなど）
					}
					// TODO: 敵の無敵時間や被弾アニメーションなどの処理があれば追加
				}
			}
		}
	}

    // --- 当たり判定ヘルパー関数 ---

    /**
     * 円と円の当たり判定
     * @returns {boolean} 衝突しているか
     */
    checkCircleCircleCollision(c1x, c1y, r1, c2x, c2y, r2) {
        const dx = c1x - c2x;
        const dy = c1y - c2y;
        const distanceSq = dx * dx + dy * dy;
        const radiiSum = r1 + r2;
        const radiiSumSq = radiiSum * radiiSum;
        return distanceSq <= radiiSumSq;
    }

    /**
     * 円と矩形（回転なし）の当たり判定
     * @param {number} circleX 円の中心X
     * @param {number} circleY 円の中心Y
     * @param {number} circleRadius 円の半径
     * @param {number} rectX 矩形の左上X
     * @param {number} rectY 矩形の左上Y
     * @param {number} rectWidth 矩形の幅
     * @param {number} rectHeight 矩形の高さ
     * @returns {boolean} 衝突しているか
     */
    checkCircleRectCollision(circleX, circleY, circleRadius, rectX, rectY, rectWidth, rectHeight, rectOrientation = 0) {
        // 回転がある場合は、円の中心を矩形のローカル座標系に変換し、回転なし矩形との当たり判定を行う
        // ここでは単純化のため、回転なしの矩形として扱います。
        // もし回転矩形が必要な場合、SAT (Separating Axis Theorem) などが必要になります。
        // 今の弾の描画がSpriteのrotationで回転しているだけなら、当たり判定も回転させる必要があります。
        // 複雑なため、今回は未回転の矩形として扱います。
        // 弾のx,yは中心座標のはずなので、矩形の左上座標に変換
        const rectLeft = rectX - rectWidth / 2;
        const rectTop = rectY - rectHeight / 2;
        const rectRight = rectX + rectWidth / 2;
        const rectBottom = rectY + rectHeight / 2;

        // 矩形に最も近い円の中心の点を求める
        const closestX = Math.max(rectLeft, Math.min(circleX, rectRight));
        const closestY = Math.max(rectTop, Math.min(circleY, rectBottom));

        // 最も近い点と円の中心の距離を計算
        const dx = circleX - closestX;
        const dy = circleY - closestY;
        const distanceSq = (dx * dx) + (dy * dy);

        return distanceSq < (circleRadius * circleRadius);
    }

    /**
     * 円と楕円の当たり判定 (概略)
     * 楕円を円で近似するか、より複雑な数学が必要になります。
     * ここでは、最も近い点を見つける方法を適用します。
     * 楕円が回転している場合はさらに複雑になります。
     * @param {number} circleX 円の中心X
     * @param {number} circleY 円の中心Y
     * @param {number} circleRadius 円の半径
     * @param {number} ellipseX 楕円の中心X
     * @param {number} ellipseY 楕円の中心Y
     * @param {number} ellipseRadiusX 楕円の横半径
     * @param {number} ellipseRadiusY 楕円の縦半径
     * @param {number} ellipseOrientation 楕円の回転 (ラジアン)
     * @returns {boolean} 衝突しているか
     */
    checkCircleEllipseCollision(circleX, circleY, circleRadius, ellipseX, ellipseY, ellipseRadiusX, ellipseRadiusY, ellipseOrientation = 0) {
        // 楕円を回転させている場合、円の中心点を逆回転させて、回転していない楕円との衝突判定に持ち込む
        // 簡易的な実装のため、回転を考慮しない場合は orientation = 0 として扱う
        let testX = circleX;
        let testY = circleY;

        // 楕円の中心を原点(0,0)に移動
        testX -= ellipseX;
        testY -= ellipseY;

        // 楕円の回転を逆回転させて、円の相対座標を回転後の楕円座標系に変換
        if (ellipseOrientation !== 0) {
            const cos = Math.cos(-ellipseOrientation);
            const sin = Math.sin(-ellipseOrientation);
            const rotatedX = testX * cos - testY * sin;
            const rotatedY = testX * sin + testY * cos;
            testX = rotatedX;
            testY = rotatedY;
        }

        // 楕円の正規化された座標に変換
        const normalizedX = testX / ellipseRadiusX;
        const normalizedY = testY / ellipseRadiusY;

        // 正規化された円の中心が、半径1の円（楕円を正規化したもの）の内部にあるかチェック
        // これは「最も近い点」を探すアルゴリズムよりも簡易的です
        const distanceToNormalizedEllipseCenterSq = (normalizedX * normalizedX) + (normalizedY * normalizedY);
        // 一旦、ここでは楕円の形状を考慮せず、円の中心が楕円の領域に近づいたらヒットとみなす簡易的なロジックとします。
        // 円の半径を考慮して楕円を「拡大」したような形での判定
        const scaledEllipseRadiusX = ellipseRadiusX + circleRadius;
        const scaledEllipseRadiusY = ellipseRadiusY + circleRadius;
        
        // 拡大された楕円との当たり判定
        return (testX * testX) / (scaledEllipseRadiusX * scaledEllipseRadiusX) +
               (testY * testY) / (scaledEllipseRadiusY * scaledEllipseRadiusY) <= 1;
    }

    /**
     * 円と線分の当たり判定 (今回は実装しませんが、概念として記載)
     * @param {number} circleX 円の中心X
     * @param {number} circleY 円の中心Y
     * @param {number} circleRadius 円の半径
     * @param {number} p1x 線分始点X
     * @param {number} p1y 線分始点Y
     * @param {number} p2x 線分終点X
     * @param {number} p2y 線分終点Y
     * @returns {boolean} 衝突しているか
     */
    // checkCircleLineCollision(circleX, circleY, circleRadius, p1x, p1y, p2x, p2y) {
    //     // 線分に最も近い円の中心の点を求める
    //     // その点と円の中心の距離が半径以下であれば衝突
    //     // 詳細は幾何学的な計算が必要
    //     return false;
    // }


}