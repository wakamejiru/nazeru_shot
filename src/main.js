// ここまで見に来たということは熱心なナゼルファンなのか
// 熱心な技術ヲタクなのであろう
// といわけで制作秘話をここに乗せる
// 自分は，C++が主な主戦場なので，C++でよく見られる記載を行っている
// インタプリタ言語はかなり苦手なので非効率な面が多い
// 開発は5/20あたりで開始し，6月2日にJSで主要機能を果たせることを確認
// そこから画面構成等を作り出した
// 6/3にグラフィックをPixiJSにすることを決定し，本格的な開発を開始

// フォントNoto Serif JP Medium


// script.js (メインファイル)

// 各import
import { AssetManager } from './asset_manager.js'; // AssetManagerをインポート

import { UpdateLoadingAnimation, PreloadLoadingScreenAssets, DrawLoadingScreen} from './CreatingMainPicture.js';
// 使用する画面の一覧(State)
const SCREEN_STATE = Object.freeze({
    LOADING: 'loading',
    GAME_TITLE: 'game_title',
    MODE_SELECT: 'mode_select_settings',
    DIFFICULTY_SELECT: 'difficulty_setting', // これは他の画面上のポップアップとしても実装可能
    STAGE_SELECT: 'stage_select',
    CHARACTER_SELECT: 'character_select',
    GAMEPLAY: 'gameplay',
    GAME_OVER: 'game_over',
    GAME_WIN: 'game_win', 
    TUTORIAL_CANVAS: "Tutorial"
});

const AssetManagerInstance = new AssetManager(ImageAssetPaths);

let CurrentScreen = SCREEN_STATE.LOADING; // ★ 初期画面 (またはMODE_SELECT)

// メインアプリケーションを宣言
// 基本ゲーム画面のCanvasの基準サイズ(16:9)
const OVERALL_BASE_WIDTH = 1920;
const OVERALL_BASE_HEIGHT = 1080;
const OverallAspectRatio = OVERALL_BASE_WIDTH / OVERALL_BASE_HEIGHT; // 画面比率
let CurrentTotalWidth = OVERALL_BASE_WIDTH;   // メインCanvasの現在の実際の幅
let CurrentTotalHeight = OVERALL_BASE_HEIGHT; // メインCanvasの現在の実際の高さ
let MainScaleFactor = CurrentTotalWidth/OVERALL_BASE_WIDTH;
const App = new PIXI.Application({ width: OVERALL_BASE_WIDTH, height: OVERALL_BASE_HEIGHT });
document.body.appendChild(App.view);

let LastTime = 0; // メインループ時間管理用カウンタタイマ

/**
 * ゲーム画面のリサイジングを行う
 */
function ResizeGame() {
    // 現在の画面の大きさを取得
    const NowWindowWidth = window.innerWidth;
    const NowWindowHeight = window.innerHeight;

    // メイン画面は画面いっぱいに表現する
    const ScreenOccupationRatio = 1.0;

    // ウインドウのサイズから，可能な画面サイズを出す
    let TargetAvailableWidth = NowWindowWidth * ScreenOccupationRatio;
    let TargetAvailableHeight = NowWindowHeight * ScreenOccupationRatio;
    const WindowAspectRatio = TargetAvailableWidth / TargetAvailableHeight; // アスペクト比を取得

    // どちらの画面サイズが大きいかで優先を付ける
    if (WindowAspectRatio > OverallAspectRatio) {
        CurrentTotalHeight = TargetAvailableHeight;
        CurrentTotalWidth = CurrentTotalHeight * OverallAspectRatio;
    } else {
        CurrentTotalWidth = TargetAvailableWidth;
        CurrentTotalHeight = CurrentTotalWidth / OverallAspectRatio;
    }

    App.renderer.resize(CurrentTotalWidth, CurrentTotalHeight);

    MainScaleFactor = CurrentTotalHeight / OVERALL_BASE_HEIGHT; // 全体UIのスケール基準
    // すべての生成済みインスタンスにUpscaleを行う
}

/**
 * 初期化を行う関数
 */
async function InitializeGame(){
    // 全アセット読み出し後ローディング画面になる(別スレッド処理となるため考慮しない)
    await AssetManagerInstance.loadAllAssets();

    await PreloadLoadingScreenAssets(); // ★まずローディングアニメーション用画像を読み込む
    ResizeGame();
    // ゲームループを開始
    requestAnimationFrame(GameLoop);
}

// キー入力状態
const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
	' ': false, // スペースキー (キー名は ' ' または 'Space'、ブラウザにより異なる場合があるので注意)
    'z': false, // 'z'キーの状態を追加 (小文字で統一)
};

// キーダウンイベント
document.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = true;
    }
});

// キーアップイベント
document.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = false;
    }
});


/**
 * 画面リサイズ処理関数
 */
function HandleResize() {
    ResizeGame()
}

// 描画のクリア
function clearCanvas() {
    ctx.clearRect(0, 0, ShootingCanvas.width, ShootingCanvas.height);
}

/**
 * ゲームを進行するノーマルループ
 * @param {number} CurrentTime - 現在の経過時間
 */
function GameLoop(CurrentTime){
    // 現在の経過時間から差分を求める
    const deltaTime = (CurrentTime - LastTime) / 1000; // 秒単位
    LastTime = CurrentTime;

    // ゼロ除算や極端なdeltaTimeを防ぐ（ブラウザがバックグラウンドになった場合など）
    const ClampedDeltaTime = Math.min(deltaTime, 0.1); // 例: 最大0.1秒に制限

     switch (CurrentScreen) {
        case SCREEN_STATE.LOADING:
            UpdateLoadingLogic();
            UpdateLoadingAnimation(ClampedDeltaTime);
            DrawLoadingScreen(MainCtx ,MainScaleFactor);
            break;
        case SCREEN_STATE.GAME_TITLE:



            break;
        case SCREEN_STATE.MODE_SELECT:



            break;
    }

    requestAnimationFrame(GameLoop); // 再起によりMainループが回る
}

// --- 初期化処理 ---
// リサイズしたときに自動的にリスナーが走る
window.addEventListener('resize', HandleResize);
InitializeGame();