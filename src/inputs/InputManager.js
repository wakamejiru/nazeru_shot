/**
 * キーボード、マウス、ゲームパッドの入力を管理するクラス
 * イベントリスナーとポーリングで入力状態を常に記録し、
 * getState()メソッドで現在の状態をいつでも取得できるようにする。
 */
export default class InputManager {
    constructor() {
        // --- キーボード状態 ---
        this.keys = new Set();

        // --- マウス状態 ---
        this.mouse = { left: false, middle: false, right: false };
        this.mousePosition = { x: 0, y: 0 };

        // ▼▼▼【ここから追加】ゲームパッド状態 ▼▼▼
        this.gamepads = {}; // 接続中のゲームパッドを保持するオブジェクト
        this.activeGamepadIndex = null; // 操作対象のゲームパッドのindex
        // ▲▲▲【ここまで追加】▲▲▲

        // イベントハンドラのthisを束縛
        this._onKeyDown = this._onKeyDown.bind(this);
        this._onKeyUp = this._onKeyUp.bind(this);
        this._onMouseDown = this._onMouseDown.bind(this);
        this._onMouseUp = this._onMouseUp.bind(this);
        this._onMouseMove = this._onMouseMove.bind(this);
        // ▼▼▼【ここから追加】ゲームパッドイベントの束縛 ▼▼▼
        this._onGamepadConnected = this._onGamepadConnected.bind(this);
        this._onGamepadDisconnected = this._onGamepadDisconnected.bind(this);
        // ▲▲▲【ここまで追加】▲▲▲
        
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
        // ▼▼▼【ここから追加】ゲームパッドのイベントリスナー登録 ▼▼▼
        window.addEventListener('gamepadconnected', this._onGamepadConnected);
        window.addEventListener('gamepaddisconnected', this._onGamepadDisconnected);
        // ▲▲▲【ここまで追加】▲▲▲
    }

    // --- キーボード・マウスのイベントハンドラ（変更なし） ---
    _onKeyDown(event) { this.keys.add(event.code); }
    _onKeyUp(event) { this.keys.delete(event.code); }
    _onMouseDown(event) { /* ...既存のコード... */ }
    _onMouseUp(event) { /* ...既存のコード... */ }
    _onMouseMove(event) { /* ...既存のコード... */ }

    // ▼▼▼【ここから追加】ゲームパッドのイベントハンドラ ▼▼▼
    /**
     * `gamepadconnected`イベントのハンドラ
     * @param {GamepadEvent} event
     */
    _onGamepadConnected(event) {
        console.log(`Gamepad connected: index=${event.gamepad.index}, id="${event.gamepad.id}"`);
        this.gamepads[event.gamepad.index] = event.gamepad;
        // 最初に接続されたゲームパッドをアクティブにする
        if (this.activeGamepadIndex === null) {
            this.activeGamepadIndex = event.gamepad.index;
        }
    }

    /**
     * `gamepaddisconnected`イベントのハンドラ
     * @param {GamepadEvent} event
     */
    _onGamepadDisconnected(event) {
        console.log(`Gamepad disconnected: index=${event.gamepad.index}, id="${event.gamepad.id}"`);
        delete this.gamepads[event.gamepad.index];
        // アクティブなパッドが切断された場合、他のパッドを探す
        if (this.activeGamepadIndex === event.gamepad.index) {
            this.activeGamepadIndex = null;
            const remainingIndices = Object.keys(this.gamepads);
            if (remainingIndices.length > 0) {
                this.activeGamepadIndex = parseInt(remainingIndices[0], 10);
            }
        }
    }
    // ▲▲▲【ここまで追加】▲▲▲

    /**
     * 【ポーリング用】現在の入力状態をまとめて取得する関数
     * @returns {{keys: Set<string>, mouse: object, position: object, gamepad: object|null}}
     */
    getState() {
        // ▼▼▼【ここから変更】ゲームパッドの状態を取得・加工して追加 ▼▼▼
        const gamepads = navigator.getGamepads();
        let gamepadState = null;

        if (this.activeGamepadIndex !== null && gamepads[this.activeGamepadIndex]) {
            const pad = gamepads[this.activeGamepadIndex];
            const DEAD_ZONE = 0.5; // スティックの遊び（この値以下の入力は無視）

            gamepadState = {
                buttons: pad.buttons.map(b => ({ pressed: b.pressed, value: b.value })),
                axes: [...pad.axes],
                // --- 便利な抽象化プロパティを追加 ---
                dpad: {
                    up: pad.buttons[12]?.pressed || pad.axes[1] < -DEAD_ZONE,
                    down: pad.buttons[13]?.pressed || pad.axes[1] > DEAD_ZONE,
                    left: pad.buttons[14]?.pressed || pad.axes[0] < -DEAD_ZONE,
                    right: pad.buttons[15]?.pressed || pad.axes[0] > DEAD_ZONE,
                },
                confirm: pad.buttons[0]?.pressed, // Aボタン (0)
                cancel: pad.buttons[1]?.pressed,  // Bボタン (1)
            };
        }

        return {
            keys: this.keys,
            mouse: this.mouse,
            position: this.mousePosition,
            gamepad: gamepadState, // ゲームパッドの状態を追加
        };
        // ▲▲▲【ここまで変更】▲▲▲
    }

    /**
     * 画面遷移時に押されっぱなしの場合にクリアを行う関数
     */
    clearInputState(){
        this.keys.clear();
        this.mouse.left = false;
        this.mouse.middle = false;
        this.mouse.right = false;
        // ゲームパッドの状態はポーリングで更新されるため、ここではクリア不要
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
        // ▼▼▼【ここから追加】ゲームパッドのイベントリスナー解除 ▼▼▼
        window.removeEventListener('gamepadconnected', this._onGamepadConnected);
        window.removeEventListener('gamepaddisconnected', this._onGamepadDisconnected);
        // ▲▲▲【ここまで追加】▲▲▲
    }
}

// IsAnyInputActive 関数は現状のままでも動作しますが、
// ゲームパッドも判定対象に含める場合は以下のように変更します。
export function IsAnyInputActive(state) {
    const isKeyDown = state.keys.size > 0;
    const isMouseDown = state.mouse.left || state.mouse.middle || state.mouse.right;
    // ゲームパッドの何らかの入力があったか
    const isGamepadActive = state.gamepad ? (state.gamepad.dpad.up || state.gamepad.dpad.down || state.gamepad.dpad.left || state.gamepad.dpad.right || state.gamepad.confirm || state.gamepad.cancel) : false;
    return isKeyDown || isMouseDown || isGamepadActive;
}