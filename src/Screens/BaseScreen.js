// 画面表示制御の既定クラス

export const FRAME_DURATION = 0.033; // (30FPS)
// 使用する画面の一覧(State)
export const SCREEN_STATE = Object.freeze({
    LOADING: 'loading',
    LOGO_SCREEN: 'logo_screen',
    GAME_TITLE: 'game_title',
    MODE_SELECT: 'mode_select_settings',
    DIFFICULTY_SELECT: 'difficulty_setting', // これは他の画面上のポップアップとしても実装可能
    STAGE_SELECT: 'stage_select',
    CHARACTER_SELECT: 'character_select',
    GAMEPLAY: 'gameplay'
});

export class BaseScreen{

	/**
 	 * コンストラクタ
	 * @param {PIXI.Application} App - メインPixiインスタンス
	 * @param {SCREEN_STATE} ScreenState - このインスタンスがどの画面を指すか
	 */
	constructor(App, ScreenState){
		this.App = App; // メインPixiインスタンス
		this.ScreenState = ScreenState;
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
    /**
 	 * 現在登録されている画面のステイトを返す
	 * @return {SCREEN_STATE} ScreenState - 現在の画面のステイト
	 */
	GetScreenKey(){
		return this.ScreenState;
	}
}