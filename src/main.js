// ここまで見に来たということは熱心なナゼルファンなのか
// 熱心な技術ヲタクなのであろう
// といわけで制作秘話をここに乗せる
// 自分は，C++が主な主戦場なので，C++でよく見られる記載を行っている
// インタプリタ言語はかなり苦手なので非効率な面が多い
// 開発は5/20あたりで開始し，6月2日にJSで主要機能を果たせることを確認
// そこから画面構成等を作り出した
// 6/3にグラフィックをPixiJS，コントローラ適用のためHTML5にすることを決定し，本格的な開発を開始
// どうやらシャニマスも同様のシステムで動いているらしい，一番プレイ時間が長いゲームに回帰するとは思わなんだ
// https://tech.drecom.co.jp/cedec-2018-shinycolors/#index-cut-topics

// フォントNoto Serif JP Medium


// script.js (メインファイル)

// 各import
//import { AssetManager } from './asset_manager.js'; // AssetManagerをインポート
import * as BaseScreen from './Screens/BaseScreen.js'
import * as LoadScreen from './Screens/LoadScreen.js';
import * as LogoScreen from './Screens/LogoScreen.js';
import * as WatingScreen from './Screens/WaitingScreen.js';


import * as Utils from "./utils.js";
import InputManager from './inputs/InputKeyboard.js';


// const AssetManagerInstance = new AssetManager(ImageAssetPaths);
let PreviousScrren = BaseScreen.SCREEN_STATE.LOADING;
let CurrentScreen = BaseScreen.SCREEN_STATE.LOADING; // ★ 初期画面 (またはMODE_SELECT)
let NextScreen = BaseScreen.SCREEN_STATE.LOADING;

// メインアプリケーションを宣言
// 基本ゲーム画面のCanvasの基準サイズ(16:9)
const OVERALL_BASE_WIDTH = 1920;
const OVERALL_BASE_HEIGHT = 1080;
const OverallAspectRatio = OVERALL_BASE_WIDTH / OVERALL_BASE_HEIGHT; // 画面比率
let CurrentTotalWidth = OVERALL_BASE_WIDTH;   // メインCanvasの現在の実際の幅
let CurrentTotalHeight = OVERALL_BASE_HEIGHT; // メインCanvasの現在の実際の高さ
let MainScaleFactor = CurrentTotalWidth/OVERALL_BASE_WIDTH;
// HTMLファイルで定義されたCanvas要素を取得
const MainGameCanvas = document.getElementById('MainGameCanvas');

const App = new PIXI.Application();
await App.init({view: MainGameCanvas, width: OVERALL_BASE_WIDTH, height: OVERALL_BASE_HEIGHT, background: 'gray', resizeTo: window });

let LastTime = 0; // メインループ時間管理用カウンタタイマ
let UpdateLoadingLigicState = 0; // 初期化に用いるステイと処理

let ScreenList = []

let NowScreenInstance = null;

let fadeOverlay = null; // フェード用の黒い四角形
let isFading = false;   // 現在フェード処理中かどうかのフラグ
const FADE_DURATION = 0.2; // フェードにかける時間 (秒)

const InputManger = new InputManager(); // 入力監視クラスのインスタンス

/**
 * ScreenListの中から指定したインスタンスを取得する
 * @param {number} 指定した画面の種類
 */
function GetScreenInstance(ScreenState){
    for (const Screen of ScreenList) {
        if(Screen.GetScreenKey() == ScreenState){
            return Screen;
        }
    }
}

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
    // すべての画面，及び生成済みのインスタンスにUpscaleを行う

    ScreenList.forEach(Screen => {
        Screen.ResizeScreen(App, MainScaleFactor);
    });
}

/**
 * 初期化を行う関数
 */
async function InitializeGame(){
    // 画像の情報は各クラスもしくは各ファイルで所有させるためここでの一括ロードは行わない
    // しかし，Initial時に全て読み出すので，あまり重さは変わらないはず
    // 全アセット読み出し後ローディング画面になる(別スレッド処理となるため考慮しない)
    // await AssetManagerInstance.loadAllAssets();
    
    
    await LoadScreen.PreloadLoadingScreenAssetsForPixi() // ローディングアニメーション用画像を読み込む

    Utils.Wait(0.2); // 上記のロードが終わらないと，ResizeGameでlistが完成しておらず仕様を満たさない
    
    // ロードスクリーンの画面だけインスタンスを作成して初期化
    ScreenList.push(new LoadScreen.LoadScreen(App, BaseScreen.SCREEN_STATE.LOADING));
    CurrentScreen = BaseScreen.SCREEN_STATE.LOADING;
    NowScreenInstance = GetScreenInstance(CurrentScreen);
    NowScreenInstance.InitializeScreen(MainScaleFactor);
    NowScreenInstance.StartScreen();


    ResizeGame();
    // ゲームループを開始
    requestAnimationFrame(GameLoop);
}

/**
 * 画面切り替え用のフェード処理を実装する予定
 * @note ここで使用するクラスのシングルトンインスタンスを全て生成する
 */



/**
 * ゲームのロードを行う
 * @note ここで使用するクラスのシングルトンインスタンスを全て生成する
 */
function UpdateLoadingLogic() {
    // プレイヤーとエネミーの作成も行う
    switch(UpdateLoadingLigicState){
        case 0:

            ScreenList.push(new LogoScreen.LogoScreen(App, BaseScreen.SCREEN_STATE.LOGO_SCREEN));
            GetScreenInstance(BaseScreen.SCREEN_STATE.LOGO_SCREEN).InitializeScreen(MainScaleFactor);

            break;
        case 1:
            ScreenList.push(new WatingScreen.WaitingScreen(App, BaseScreen.SCREEN_STATE.WATING_SCREEN));
            GetScreenInstance(BaseScreen.SCREEN_STATE.WATING_SCREEN).InitializeScreen(MainScaleFactor);
            break;
        case 2:

            break;  
        case 3:

            break;

        case 4:

            break;

        case 5:

            break;
        case 6:

            break;
        case 7:

            break;
        case 8:

            break;
        case 9:

            break;
        case 10:

            break;
        case 11:
            
            break;
        case 12:

            break;

    }

   ++UpdateLoadingLigicState;
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


/**
 * 画面リサイズ処理関数
 */
function HandleResize() {
    ResizeGame()
}

/**
 * ゲームを進行するノーマルループ
 * @param {number} CurrentTime - 現在の経過時間
 */
function GameLoop(CurrentTime){
    // 現在の経過時間から差分を求める
    const DeltaTime = (CurrentTime - LastTime) / 1000; // 秒単位
    LastTime = CurrentTime;

    // ゼロ除算や極端なdeltaTimeを防ぐ（ブラウザがバックグラウンドになった場合など）
    const ClampedDeltaTime = Math.min(DeltaTime, 0.1); // 例: 最大0.1秒に制限

    const InputCurrentState = InputManger.getState();

    if(CurrentScreen == BaseScreen.SCREEN_STATE.LOADING){
        // ロード画面の際は特殊な操作が必要
        NextScreen = NowScreenInstance.EventPoll(ClampedDeltaTime, InputCurrentState);
        UpdateLoadingLogic();        
    }else{
        NextScreen = NowScreenInstance.EventPoll(ClampedDeltaTime, InputCurrentState);
    }

    if(NextScreen != CurrentScreen){
        // 遷移するので処理を行う
        PreviousScrren = CurrentScreen;
        CurrentScreen = NextScreen;
        // フェード開始

        NowScreenInstance.EndScreen();
        NowScreenInstance = GetScreenInstance(CurrentScreen);
        NowScreenInstance.StartScreen();

        // フェード停止




    }

    requestAnimationFrame(GameLoop); // 再起によりMainループが回る
}

// --- 初期化処理 ---
// リサイズしたときに自動的にリスナーが走る
window.addEventListener('resize', HandleResize);
InitializeGame();