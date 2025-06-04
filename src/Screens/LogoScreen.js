// ロゴの表示を行う
import { ImageAssetPaths } from '../game_status.js'; 
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


export const InfomationAnimationFrames = [
  "infomationFrame1",
  "infomationFrame2",
  "infomationFrame3",
  "infomationFrame4",
  "infomationFrame5",
  "infomationFrame6",
  "infomationFrame7",
  "infomationFrame8",
  "infomationFrame9",
  "infomationFrame10",
  "infomationFrame11",
  "infomationFrame12",
  "infomationFrame13",
  "infomationFrame14",
  "infomationFrame15",
  "infomationFrame16",
  "infomationFrame17",
  "infomationFrame18",
  "infomationFrame19",
  "infomationFrame20",
  "infomationFrame21",
  "infomationFrame22",
  "infomationFrame23",
  "infomationFrame24",
  "infomationFrame25",
  "infomationFrame26",
  "infomationFrame27",
  "infomationFrame28",
  "infomationFrame29",
  "infomationFrame30",
  "infomationFrame31",
  "infomationFrame32",
  "infomationFrame33",
  "infomationFrame34",
  "infomationFrame35",
  "infomationFrame36",
  "infomationFrame37",
  "infomationFrame38",
  "infomationFrame39",
  "infomationFrame40",
  "infomationFrame41",
  "infomationFrame42",
  "infomationFrame43",
  "infomationFrame44",
  "infomationFrame45",
  "infomationFrame46",
  "infomationFrame47",
  "infomationFrame48",
  "infomationFrame49",
  "infomationFrame50",
  "infomationFrame51",
];


let LogoScreenContainer; // Logoを表示するPixiJSコンテナ
let CurrentLogoFrameIndex = 0; // 現在表示しているロード画面のIndex
let LogoAnimationTimer = 0; // Logoアニメーションの同期用のタイマ
const LOGO_FRAME_DURATION = 0.033; // 30FPS
let LogoScreenAnimationSprites = []; // ロゴアニメーション用Spritesオブジェクト配列

/**
 * ローディング画面の表示/非表示を切り替え
 * @param {boolean} Visible - true:ON false:OFF
 */
export function SetPixiLoadingScreenVisible(Visible) {
	if (LogoScreenContainer) {
		LogoScreenContainer.visible = Visible;
	}
}

/**
 * リサイズ時にローディング画面要素の位置を調整
 * @param {PIXI.Application} App PixiJSアプリケーションインスタンス
 * @param {number} CurrentOverallScale 現在のメイン画面倍率
 */
export function ResizePixiLogoScreen(App, CurrentOverallScale) {
	if (!LogoScreenContainer) return;

	LogoScreenAnimationSprites.forEach(sprite => {
		const BaseTextureWidth = sprite.texture.orig.width;
		const BaseTextureHeight = sprite.texture.orig.height;
		const AspectRatio = BaseTextureWidth / BaseTextureHeight;
		
		// 高さを基準に幅を決める
		let DisplayHeight = BaseTextureHeight * CurrentOverallScale; // 仮の縮小率
		let DisplayWidth = DisplayHeight * AspectRatio;

		sprite.width = DisplayWidth;
		sprite.height = DisplayHeight;
		

		// 一番左上を合わせる
		sprite.x = (App.screen.width  - DisplayWidth)  /2;
		sprite.y = (App.screen.height - DisplayHeight) / 2;
	});
}



/**
 * ロゴ画面コンテナを初期化
 * @param {PIXI.Application} App - PixiJSアプリケーションインスタンス
 * @param {number} InitialScale - 初期スケール
 */
export function InitilizeLogoScreen(App, InitialScale){

}


/**
 * ロゴ画面コンテナをセットアップ
 * @param {PIXI.Application} App - PixiJSアプリケーションインスタンス
 * @param {number} InitialScale - 初期スケール
 */
export function SetupPixiLogoScreen(App, InitialScale) {
	LogoScreenContainer = new PIXI.Container();
	App.stage.addChild(LogoScreenContainer); // メインステージに追加

	LogoScreenAnimationSprites.forEach((sprite, index) => {
		sprite.anchor.set(0); // 画像も左上が座標軸
		sprite.scale.set(InitialScale); // 初期スケールと画像サイズ調整
		sprite.x = 0; // 画面の一番左上に合わせる
		sprite.y = 0;
		sprite.visible = (index === 0); // 最初のフレームのみ表示
		LogoScreenContainer.addChild(sprite);
	});

	LogoScreenContainer.visible = false; // 初期は非表示
}