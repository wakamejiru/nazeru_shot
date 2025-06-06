/**
 * キーボードとマウスの入力を管理するクラス
 * イベントリスナーで入力状態を常に記録し、
 * getState()メソッドで現在の状態をいつでも取得できるようにする。
 */
export default class InputManager {
    constructor() {
        // 現在押されているキーを保持するSetオブジェクト
        this.keys = new Set();

        // 現在押されているマウスボタンの状態
        this.mouse = {
            left: false,   // 左ボタン
            middle: false, // 中央ボタン
            right: false,  // 右ボタン
        };
        
        // マウスカーソルの現在の位置
        this.mousePosition = { x: 0, y: 0 };

        // イベントハンドラ内の`this`がクラスインスタンスを指すように束縛(bind)
        this._onKeyDown = this._onKeyDown.bind(this);
        this._onKeyUp = this._onKeyUp.bind(this);
        this._onMouseDown = this._onMouseDown.bind(this);
        this._onMouseUp = this._onMouseUp.bind(this);
        this._onMouseMove = this._onMouseMove.bind(this);
        
        // イベントリスナーを登録
        this.attachListeners();
    }

    /**
     * イベントリスナーをウィンドウに登録する
     */
    attachListeners() {
        window.addEventListener('keydown', this._onKeyDown);
        window.addEventListener('keyup', this._onKeyUp);
        window.addEventListener('mousedown', this._onMouseDown);
        window.addEventListener('mouseup', this._onMouseUp);
        window.addEventListener('mousemove', this._onMouseMove);
    }

    /**
     * `keydown`イベントのハンドラ
     * @param {KeyboardEvent} event
     */
    _onKeyDown(event) {
        this.keys.add(event.code);
    }

    /**
     * `keyup`イベントのハンドラ
     * @param {KeyboardEvent} event
     */
    _onKeyUp(event) {
        this.keys.delete(event.code);
    }

    /**
     * `mousedown`イベントのハンドラ
     * @param {MouseEvent} event
     */
    _onMouseDown(event) {
        switch (event.button) {
            case 0: this.mouse.left = true; break;
            case 1: this.mouse.middle = true; break;
            case 2: this.mouse.right = true; break;
        }
    }

    /**
     * `mouseup`イベントのハンドラ
     * @param {MouseEvent} event
     */
    _onMouseUp(event) {
        switch (event.button) {
            case 0: this.mouse.left = false; break;
            case 1: this.mouse.middle = false; break;
            case 2: this.mouse.right = false; break;
        }
    }
    
    /**
     * `mousemove`イベントのハンドラ
     * @param {MouseEvent} event
     */
    _onMouseMove(event) {
        this.mousePosition.x = event.clientX;
        this.mousePosition.y = event.clientY;
    }

    /**
     * 【ポーリング用】現在の入力状態をまとめて取得する関数
     * @returns {{keys: Set<string>, mouse: {left: boolean, middle: boolean, right: boolean}, position: {x: number, y: number}}}
     */
    getState() {
        return {
            keys: this.keys,
            mouse: this.mouse,
            position: this.mousePosition,
        };
    }

    /**
     * 画面遷移遷移時に押されっぱなしの場合にクリアを行う関数
     */
    clearInputState(){
        this.keys.clear();
        this.mouse.left = false;
        this.mouse.middle = false;
        this.mouse.right = false;
        this.mousePosition = { x: 0, y: 0 };
    }


    /**
     * 不要になった際にイベントリスナーをクリーンアップするメソッド
     */
    dispose() {
        window.removeEventListener('keydown', this._onKeyDown);
        window.removeEventListener('keyup', this._onKeyUp);
        window.removeEventListener('mousedown', this._onMouseDown);
        window.removeEventListener('mouseup', this._onMouseUp);
        window.removeEventListener('mousemove', this._onMouseMove);
    }
}

/**
 * 何かキーまたはマウスボタンが押されているかを判定する関数
 * @param {object} state - input.getState()で取得したオブジェクト
 * @returns {boolean}
 */
export function IsAnyInputActive(state) {
    const isKeyDown = state.keys.size > 0;
    const isMouseDown = state.mouse.left || state.mouse.middle || state.mouse.right;
    return isKeyDown || isMouseDown;
}