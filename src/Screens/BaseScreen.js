// 画面表示制御の既定クラス



export class BaseScreen{
	constructor(App){
		this.App; // メインPixiインスタンス
		// その画面用のコンテナを追加する(ここに描画する)
		this.ScreenContainer = new SetPixiLoadingScreenVisible.PIXI();
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
}