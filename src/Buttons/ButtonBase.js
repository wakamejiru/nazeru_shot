// ボタンクラス
// 押されたことやアニメーしょんの表示などを一括でここで管理する
// PixJSで書いていくのでこれからのことを考えて変更していく

export class Button{

    // TODO PixiJSに全体的に書き換える

    /**
     * ボタンのコンストラクタ
     * @param {number} StartX - 右上の配置座標X(絶対座標)
     * @param {number} StartY - 右上の配置座標Y(絶対座標)
     * @param {pixijs} Canvas - Pixiの描画インスタンス
     * @param {number} ButtonWidth - ボタンの幅
     * @param {number} ButtonHeight - ボタンの高さ
     * @param {number} ButtonImageKeys - ボタンのアニメーション画像のAssetManegerへのkeyのリストたち
     * @param {number} ButtonID - ボタン全体のID(選択中か押されたかどうかはここで管理される)
     * @param {AssetManager} AssetManager - AssetManager
     * @param {Options} ButtonOptions - その他ボタンの設定(IsAnimation : アニメがあるかどうか(true, false), ButtonAnimationImageKeys:アニメの画像たちへのKey)
     */
    constructor(StartX, StartY, ButtonWidth, ButtonHeight, ButtonAnimationKeys, ButtonID, AssetManager, ButtonOptions) {
        this.StartX = StartX;
        this.StartY = StartY;
        this.ButtonWidth = ButtonWidth;
        this.ButtonHeight = ButtonHeight;
        this.ButtonID = ButtonID;
        this.ButtonAnimationKeys = ButtonImageKeys;
        this.AssetManager = AssetManager;

        this.IsAnimation = (ButtonOptions.IsAnimation !== undefined) ? ButtonOptions.IsAnimation : false;
        this.ButtonAnimationImageKeys = (ButtonOptions.IsAnimation !== true) ? ButtonOptions.ButtonAnimationImageKeys : null;

        this.Initilize();
    }

    Initilize(){
        this.NowSelect = false; // 現在選択されているかどうか


        // 画像/アニメをpixiの引数のcanvas位置に描画する

    }


    Run(){

    }
}