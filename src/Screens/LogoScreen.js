// ロゴの表示を行う
import { ImageAssetPaths } from '../game_status.js'; 
import { BaseScreen, FRAME_DURATION, SCREEN_STATE } from './BaseScreen.js';
// 初期ロード画面

export const LogoAnimationFrames = [
  "logoFrame1",
  "logoFrame2",
  "logoFrame3",
  "logoFrame4",
  "logoFrame5",
  "logoFrame6",
  "logoFrame7",
  "logoFrame8",
  "logoFrame9",
  "logoFrame10",
  "logoFrame11",
  "logoFrame12",
  "logoFrame13",
  "logoFrame14",
  "logoFrame15",
  "logoFrame16",
  "logoFrame17",
  "logoFrame18",
  "logoFrame19",
  "logoFrame20",
  "logoFrame21",
  "logoFrame22",
  "logoFrame23",
  "logoFrame24",
  "logoFrame25",
  "logoFrame26",
  "logoFrame27",
  "logoFrame28",
  "logoFrame29",
  "logoFrame30",
  "logoFrame31",
  "logoFrame32",
  "logoFrame33",
  "logoFrame34",
  "logoFrame35",
  "logoFrame36",
  "logoFrame37",
  "logoFrame38",
  "logoFrame39",
  "logoFrame40",
  "logoFrame41",
  "logoFrame42",
  "logoFrame43",
  "logoFrame44",
  "logoFrame45",
  "logoFrame46",
  "logoFrame47",
  "logoFrame48",
  "logoFrame49",
  "logoFrame50",
  "logoFrame51",
];


let NowState = 0;
export class LogoScreen extends BaseScreen{
    /**
     * コンストラクタ
     * @param {PIXI.Application} App - メインPixiインスタンス
     * @param {SCREEN_STATE} ScreenState - このインスタンスがどの画面を指すか
     */
    constructor(App, ScreenState){
        super(App, ScreenState);
        this.NowScreenState = 0; // 0の場合infomation // 1の場合LOGO
        this.LogoScreenAnimationSprites=[];
    }

    /**
   * 初期化を行う
   * @param {boolean} Visible - true:ON false:OFF
   */
  InitializeScreen(InitialScale){
      // 画面を作成する
      this.ScreenContainer = new PIXI.Container();

      // 二個画面を用意する
      this.InfomationContainer = new PIXI.Container();
      this.LogoContainer = new PIXI.Container();
      this.ScreenContainer.addChild(this.InfomationContainer);
      this.ScreenContainer.addChild(this.LogoContainer);

      this.App.stage.addChild(this.ScreenContainer); // メインステージに追加

      // ロゴのアニメーションを作成
      // this.LoadlogoScreenAssetsForPixi();
      // // アニメーションの設定
      // this.LogoAnimation = new PIXI.AnimatedSprite(this.LogoScreenAnimationSprites);
      // this.LogoAnimation.loop = false;          // ループ再生を有効にする
      // this.LogoAnimation.anchor.set(0.5);      // アンカーを中央に設定 (任意)
      // this.LogoContainer.addChild(this.LogoAnimation);

      // 白色の背景を追加
      this.LogoBackground = new PIXI.Graphics();
      this.LogoBackground.beginFill(0xffffff); // 塗りつぶし色を白に設定
      this.LogoBackground.drawRect(0, 0, this.App.screen.width, this.App.screen.height); // (0,0)の位置から指定した幅と高さで四角形を描画
      this.LogoBackground.endFill();

      this.LogoContainer.addChild(this.LogoBackground);

      // アニメーションを停止する
      // 初期Frameで停止
      // this.LogoAnimation.gotoAndStop(0);


      // Infomation画像を作成する
      const InfomationBackgroundImagePath = "infomationBackground";
      const InfomationAttentionImagePath = "infomationAttention";
      this.InfomationBackgroundImage = new PIXI.Sprite(InfomationBackgroundImagePath);
      this.InfomationAttentionImage = new PIXI.Sprite(InfomationAttentionImagePath);

      // 画像のアンカーを設定
      this.InfomationBackgroundImage.anchor.set(0);// 左上が座標
      this.InfomationAttentionImage.anchor.set(0);// 左上が座標
      this.InfomationBackgroundImage.scale.set(InitialScale); // 初期スケールと画像サイズ調整
      this.InfomationAttentionImage.scale.set(InitialScale); // 初期スケールと画像サイズ調整

      // 画像の位置を調整
      this.InfomationBackgroundImage.x = 0; // 画面の一番左上に合わせる
      this.InfomationBackgroundImage.y = 0;

      // 画像からみて中央，かつYは上から少し離れた位置にする
      this.InfomationBackgroundImage.x = (this.App.screen.width /2)  - (this.InfomationBackgroundImage.width / 2); // 画面の一番左上に合わせる
      this.InfomationBackgroundImage.y = this.App.screen.Height * 0.1; // 少しずらしておく


      this.InfomationContainer.visible = false;
      this.LogoContainer.visible = false;
      super.SetScreenVisible(false); // 初期は非表示
      this.DebugTime = 0;
  }

    /**
   * リサイズ処理を行う
   * @param {PIXI.Application} App - メインPixiインスタンス
     * @param {number} CurrentOverallScale 現在のメイン画面倍率
   */
    ResizeScreen(App, CurrentOverallScale){
        if (!this.ScreenContainer) return;

        // LoadingScreenAnimationSprites.forEach(sprite => {
        //     const BaseTextureWidth = sprite.texture.orig.width;
        //     const BaseTextureHeight = sprite.texture.orig.height;
        //     const AspectRatio = BaseTextureWidth / BaseTextureHeight;
            
        //     // 高さを基準に幅を決める
        //     let DisplayHeight = BaseTextureHeight * CurrentOverallScale; // 仮の縮小率
        //     let DisplayWidth = DisplayHeight * AspectRatio;

        //     sprite.width = DisplayWidth;
        //     sprite.height = DisplayHeight;
            

        //     // 一番左上を合わせる
        //     sprite.x = (App.screen.width  - DisplayWidth)  /2;
        //     sprite.y = (App.screen.height - DisplayHeight) / 2;
        // });
    }


    /**
     * ロゴアニメーション用画像を読み込み、PixiJSテクスチャを準備する関数
     * @note async関数のため、非同期で動作する
     */
    LoadlogoScreenAssetsForPixi() {
        const Textures = [];
        const FrameKeysToLoad = LogoAnimationFrames.filter(key => ImageAssetPaths[key]);
        if (FrameKeysToLoad.length === 0) {
            console.log("No loading animation frames to preload for Pixi.");
            return;
        }
    
        const AssetsToLoadForPixi = FrameKeysToLoad.map(key => ({ alias: key, src: ImageAssetPaths[key] }));
        if (AssetsToLoadForPixi.length > 0) {
            PIXI.Assets.load(AssetsToLoadForPixi);
            FrameKeysToLoad.forEach(key => Textures.push(PIXI.Texture.from(key)));
        }
    
        this.LogoScreenAnimationSprites = Textures.map(texture => new PIXI.Sprite(texture));
    }

    /**
   * 画面の開始を行う
   * @param {boolean} Visible - true:ON false:OFF
   */
  StartScreen(){
        this.InfomationContainer.visible = true;
        super.StartScreen();
  }
    
    /**
   * 画面の開始を行う
   * @param {boolean} Visible - true:ON false:OFF
   */
  EndScreen(){
      this.InfomationContainer.visible = false;
      this.LogoContainer.visible = false;
//       this.LogoAnimation.gotoAndStop(0);
this.NowScreenState = 0;
this.DebugTime = 0;
        super.EndScreen();
  }

    /**
   * ポーリングにて行う各画面の処理を行う
   * @param {number} DeltaTime - 前回からの変異時間
   * 
   */
  EventPoll(DeltaTime){
        super.EventPoll(DeltaTime);
          this.DebugTime += DeltaTime;

        // Kye野入力で切り替える
        if(this.NowScreenState ==0){
          // ここが後々キー入力に代わる
          if(this.DebugTime > 3.0){
            this.NowScreenState = 1;
            this.InfomationContainer.visible = false;
            this.LogoContainer.visible = true;
          }
        }else{

           if(this.DebugTime > 2.0){
            return SCREEN_STATE.LOADING;
          }
        }

        return this.ScreenState;
  }

}