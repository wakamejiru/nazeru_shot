import { BaseScreen, FRAME_DURATION, SCREEN_STATE } from './BaseScreen.js';


// playerにクリックさせて音が出るようにする画面
// 同時に何か注意書きぐらいできたらいいなぐらい

export class WaitingScreen extends BaseScreen{
	/**
     * コンストラクタ
     * @param {PIXI.Application} App - メインPixiインスタンス
     * @param {SCREEN_STATE} ScreenState - このインスタンスがどの画面を指すか
     */
    constructor(App, ScreenState){
        super(App, ScreenState);


    }

	/**
	 * 初期化を行う
	 * @param {boolean} Visible - true:ON false:OFF
	 */
	async InitializeScreen(InitialScale){
		// 画面を作成する
		this.ScreenContainer = new PIXI.Container();


		this.App.stage.addChild(this.ScreenContainer); // メインステージに追加

		// 白色の背景を追加
		this.WaintBackground = new PIXI.Graphics();
		this.WaintBackground.beginFill(0xffffff); // 塗りつぶし色を白に設定
		this.WaintBackground.drawRect(0, 0, this.App.screen.width, this.App.screen.height); // (0,0)の位置から指定した幅と高さで四角形を描画
		this.WaintBackground.endFill();

		this.ScreenContainer.addChild(this.WaintBackground);
		super.SetScreenVisible(false); // 初期は非表示
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
	   * ポーリングにて行う各画面の処理を行う
	   * @param {number} DeltaTime - 前回からの変異時間
	   * @param {instance} InputCurrentState - 入力情報
	   * 
	   */
	  EventPoll(DeltaTime, InputCurrentState){
		super.EventPoll(DeltaTime, InputCurrentState);
		
		// Keyの入力が何かあったかを判断する
		if(this.AnyKeyInput == true){
			return SCREEN_STATE.LOGO_SCREEN;
		}

		return this.ScreenState;
	  }
	
	
	  Sound(){
	
	  }
}