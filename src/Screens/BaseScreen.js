// 画面表示制御の既定クラス

const FRAME_DURATION = 0.033; // (30FPS)

export class BaseScreen{

	/**
 	 * コンストラクタ
	 * @param {PIXI.Application} App - メインPixiインスタンス
	 */
	constructor(App){
		this.App; // メインPixiインスタンス
		// その画面用のコンテナを追加する(ここに描画する)
		this.ScreenContainer = null;
	}

	/**
 	 * 画面の表示/非表示を切り替え
	 * @param {boolean} Visible - true:ON false:OFF
	 */
	SetScreenVisible(Visible){
		if (this.ScreenContainer) {
			this.ScreenContainer.visible = Visible;
		}
	}


	/**
 	 * 初期化を行う
	 * @param {boolean} Visible - true:ON false:OFF
	 */
	InitializeScreen(){

	}

	
	/**
 	 * 画面の開始を行う
	 * @param {boolean} Visible - true:ON false:OFF
	 */
	StartScreen(){
		this.SetScreenVisible(true);
	}

	/**
 	 * 画面の終了を行う
	 * @param {boolean} Visible - true:ON false:OFF
	 */
	EndScreen(){
		this.SetScreenVisible(false);
	}

	/**
 	 * ポーリングにて行う各画面の処理を行う
	 * @param {number} DeltaTime - 前回からの変異時間
	 */
	EventPoll(DeltaTime){

	}

	/**
 	 * 音を鳴らす
	 */
	Sound(){

	}

    /**
 	 * リサイズ処理を行う
	 * @param {PIXI.Application} App - メインPixiインスタンス
     * @param {number} CurrentOverallScale 現在のメイン画面倍率
	 */
	ResizeScreen(App, CurrentOverallScale){

	}
}