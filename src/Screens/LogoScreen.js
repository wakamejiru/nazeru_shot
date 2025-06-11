// ロゴの表示を行う
import { ImageAssetPaths, MusicOrVoicePaths } from '../game_status.js'; 
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
  "logoFrame52",
  "logoFrame53",
  "logoFrame54",
  "logoFrame55",
  "logoFrame56",
  "logoFrame57",
  "logoFrame58",
  "logoFrame59",
  "logoFrame60",
  "logoFrame61",
  "logoFrame62",
  "logoFrame63",
  "logoFrame64",
  "logoFrame65",
  "logoFrame66",
  "logoFrame67",
  "logoFrame68",
  "logoFrame69",
  "logoFrame70",
  "logoFrame71",
  "logoFrame72",
  "logoFrame73",
  "logoFrame74",
  "logoFrame75",
  "logoFrame76",
  "logoFrame77",
  "logoFrame78",
  "logoFrame79",
  "logoFrame80",
];

export const InfomationScreenImages = [
  "infomationImage"
];

// 再生する音声ファイルのリスト
const InfomationMusic = [
    'imfomation',
    'logo'
];


let NowState = 0;
let CurrentHowl = null; // 現在再生中のHowlインスタンス

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
        this.InfomationTextures = [];

		// 何か入力があったフラグ(これでロゴのアニメーションなどがスキップされる)
		this.AnyKeyInput = false;

		// 音声用
		this.CurrentMusicIndex = 0;
		this.CurrentHowl = null;

		this.ChangeLogoScreen = false;
    this.EndLogoScreen = false;

    }

    /**
   * 初期化を行う
   * @param {boolean} Visible - true:ON false:OFF
   */
  async InitializeScreen(InitialScale){
      // 画面を作成する
      this.ScreenContainer = new PIXI.Container();

      // 二個画面を用意する
      this.InfomationContainer = new PIXI.Container();
      this.LogoContainer = new PIXI.Container();
      this.ScreenContainer.addChild(this.InfomationContainer);
      this.ScreenContainer.addChild(this.LogoContainer);

      this.App.stage.addChild(this.ScreenContainer); // メインステージに追加


      // ロゴのアニメーションを作成
      await this.LoadlogoScreenAssetsForPixi();
      // // アニメーションの設定
      this.LogoAnimation = new PIXI.AnimatedSprite(this.LogoScreenAnimationSprites.map(s => s.texture))
      this.LogoAnimation.loop = false;          // ループ再生を有効にする
      this.LogoAnimation.anchor.set(0);      // アンカーを中央に設定 (任意)
      this.LogoAnimation.scale.set(InitialScale); // 初期スケールと画像サイズ調整
      this.LogoAnimation.x = 0;
      this.LogoAnimation.y = 0;
      this.LogoAnimation.onComplete = () => {
          this.EndLogoScreen = true;
      };

      this.LogoContainer.addChild(this.LogoAnimation);

      // アニメーションを停止する
      // 初期Frameで停止
      this.LogoAnimation.gotoAndStop(0);


      // Infomation画像を作成する
      const InfomationBgTexture = PIXI.Texture.from("infomationImage");
      this.InfomationBackgroundImage = new PIXI.Sprite(InfomationBgTexture);
      
      // 画像のアンカーを設定
      this.InfomationBackgroundImage.anchor.set(0);// 左上が座標
      this.InfomationBackgroundImage.scale.set(InitialScale); // 初期スケールと画像サイズ調整

      // 画像の位置を調整
      this.InfomationBackgroundImage.x = 0; // 画面の一番左上に合わせる
      this.InfomationBackgroundImage.y = 0;

      // 画像からみて中央
      this.InfomationContainer.addChild(this.InfomationBackgroundImage);

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

        // Anime画像をリサイズ

        let BaseTextureWidth = this.LogoAnimation.texture.orig.width;
        let BaseTextureHeight = this.LogoAnimation.texture.orig.height;
        let AspectRatio = BaseTextureWidth / BaseTextureHeight;

        let DisplayHeight = BaseTextureHeight * CurrentOverallScale; // 仮の縮小率
        let DisplayWidth = DisplayHeight * AspectRatio;

        this.LogoAnimation.width = DisplayWidth;
        this.LogoAnimation.height = DisplayHeight;
				
	
			// 一番左上を合わせる
			this.LogoAnimation.x = (App.screen.width  - DisplayWidth)  /2;
			this.LogoAnimation.y = (App.screen.height - DisplayHeight) / 2;

      // infomationもリサイズ

      BaseTextureWidth = this.InfomationBackgroundImage.texture.orig.width;
      BaseTextureHeight = this.InfomationBackgroundImage.texture.orig.height;
      AspectRatio = BaseTextureWidth / BaseTextureHeight;

			// 高さを基準に幅を決める
			DisplayHeight = BaseTextureHeight * CurrentOverallScale; // 仮の縮小率
			DisplayWidth = DisplayHeight * AspectRatio;
	
			this.InfomationBackgroundImage.width = DisplayWidth;
			this.InfomationBackgroundImage.height = DisplayHeight;
				
	
			// 一番左上を合わせる
			this.InfomationBackgroundImage.x = (App.screen.width  - DisplayWidth)  /2;
			this.InfomationBackgroundImage.y = (App.screen.height - DisplayHeight) / 2;
    }


    /**
     * 画像を読み込み、PixiJSテクスチャを準備する関数
     */
    async LoadlogoScreenAssetsForPixi() {
        const Textures = [];
        const FrameKeysToLoad = LogoAnimationFrames.filter(key => ImageAssetPaths[key]);
        if (FrameKeysToLoad.length === 0) {
            console.log("No loading animation frames to preload for Pixi.");
            return;
        }
    
        const LogoAnimeAssetsToLoadForPixi = FrameKeysToLoad.map(key => ({ alias: key, src: ImageAssetPaths[key] }));
        if (LogoAnimeAssetsToLoadForPixi.length > 0) {
            await PIXI.Assets.load(LogoAnimeAssetsToLoadForPixi);
            FrameKeysToLoad.forEach(key => Textures.push(PIXI.Texture.from(key)));
        }
    
        this.LogoScreenAnimationSprites = Textures.map(texture => new PIXI.Sprite(texture));
                
        const InfomationFrameKeysToLoad = InfomationScreenImages.filter(key => ImageAssetPaths[key]);
        const AssetsToLoadForPixi = InfomationFrameKeysToLoad.map(key => ({ alias: key, src: ImageAssetPaths[key] }));
        if (AssetsToLoadForPixi.length > 0) {
            await PIXI.Assets.load(AssetsToLoadForPixi);

            InfomationFrameKeysToLoad.forEach(key => {
              const texture = PIXI.Texture.from(key);
              this.InfomationTextures.push(texture);
            });
        }
    }

    /**
   * 画面の開始を行う
   * @param {boolean} Visible - true:ON false:OFF
   */
  StartScreen(){
    this.EndLogoScreen = false;
		this.AnyKeyInput = false;
        this.InfomationContainer.visible = true;
        this.LogoAudioEnd=false;
        super.StartScreen();
  }
    
    /**
   * 画面の終了を行う
   * @param {boolean} Visible - true:ON false:OFF
   */
  EndScreen(){
	this.InfomationContainer.visible = false;
	this.LogoContainer.visible = false;
  this.LogoAnimation.gotoAndStop(0);
	this.NowScreenState = 0;
	this.DebugTime = 0;
        super.EndScreen();
  }

	/**
   * ポーリングにて行う各画面の処理を行う
   * @param {number} DeltaTime - 前回からの変異時間
   * @param {instance} InputCurrentState - 入力情報 
   */
  EventPoll(DeltaTime, InputCurrentState){
      super.EventPoll(DeltaTime, InputCurrentState);
			// ボイスを再生する
      this.LogoAudioEnd == false

        // Keyの入力で切り替える
      if(this.NowScreenState ==0){


        this.ChangeLogoScreen = (this.ChangeLogoScreen == true) ? this.ChangeLogoScreen : this.AnyKeyInput; 
        
        if(this.ChangeLogoScreen == true){
            this.AnyKeyInput = false;
            this.NowScreenState = 1;
            this.InfomationContainer.visible = false;
            this.LogoContainer.visible = true;
            this.StopSound();
            // ロゴアニメに切り替え
            this.LogoContainer.visible = true; 
            this.LogoAnimation.play(); // アニメーションを再生

      			this.Sound();
          }else{
      			this.Sound();
          }
        }else{
            
          if(this.EndLogoScreen == true){
            // 1秒経過で入れ替わる
            
            this.StopSound();
            
            
            return SCREEN_STATE.GAME_TITLE;
          }
        }

        return this.ScreenState;
  }

	/**
   * 音の再生を行う
   */
  Sound(){
	
	const PlayingMusicIndex = this.CurrentMusicIndex;
	this.FilePath = null;
    // 音楽キーを使ってファイルパスを取得

	// 再生中であれば再生しない
	// ここは重ねる場合などはできないので方法を考えたほうがいい
	if(this.CurrentHowl == null){
    if(this.NowScreenState == 0){
				this.FilePath = MusicOrVoicePaths[InfomationMusic[0]];
        // ファイルパスが存在する場合にのみ再生
        if (!this.FilePath) {
          return;
        }else{
          this.CurrentHowl = new Howl({
            src: [this.FilePath],
            html5: true, // 長い音楽ファイルはストリーミング再生が推奨されます
            
            // 再生が終了したときに呼び出される
            onend: () => {
                this.ChangeLogoScreen = true;

                StopSound();
              },
          });
      }
		}
    else{
        this.FilePath = MusicOrVoicePaths[InfomationMusic[1]];
        // ファイルパスが存在する場合にのみ再生
        if (!this.FilePath) {
          return;
        }else{
          this.CurrentHowl = new Howl({
            src: [this.FilePath],
            html5: true, // 長い音楽ファイルはストリーミング再生が推奨されます
            
            // 再生が終了したときに呼び出される
            onend: () => {
                this.StopSound();
              },
          });
        }
      }
			this.CurrentHowl.play();
		}
				
	}

	/**
   * 音の停止を行う
   */
  StopSound(){
    if(this.CurrentHowl){
      this.CurrentHowl.stop();
      this.CurrentHowl.unload();
      this.CurrentHowl = null;
      this.CurrentMusicIndex = 0;
    }
  }

	InitializeSound(){

  }

}