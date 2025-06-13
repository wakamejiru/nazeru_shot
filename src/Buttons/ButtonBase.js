import { ImageAssetPaths, MusicOrVoicePaths } from '../game_status.js';
const Sound = PIXI.sound.Sound;

/**
 * @class CustomButton
 * @description 9-sliceと動的な要素を組み合わせた高機能なボタンクラス
 * @extends PIXI.Container
 */
export class CustomButton extends PIXI.Container {

    // publicプロパティ
    id;

    // privateプロパティ
    #sound;
    #background;
    #icon;
    #label;
    #config;
    #isSelected = false;
    #animation = null;
    // ▼▼▼【変更点 1/5】状態ごとのテクスチャを保持するプロパティを追加 ▼▼▼
    #textures = {
        normal: null,
        selected: null,
        pressed: null,
    };
    // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

    /**
     * ボタンのインスタンスを非同期で生成します。
     * @param {PIXI.Renderer} renderer - テクスチャ生成に使用するレンダラー
     * @param {object} config - ボタンの設定オブジェクト
     * @returns {Promise<CustomButton>}
     */
    static async create(renderer, config) {
        const button = new CustomButton(renderer, config);
        await button._initialize();
        return button;
    }

    /**
     * @private
     */
    constructor(renderer, config) {
        super();

        const defaultConfig = {
            id: 'default-button',
            width: 200,
            height: 60,
            label: '',
            labelStyle: new PIXI.TextStyle({ fill: '#000000', fontSize: 32, fontWeight: 'bold' }),
            fill_colors: {
                normal: 0xFFFFFF,
                selected: 0x7fffd4,
                pressed: 0x888888,
            },
            stroke: {
                width: 0,
                color: {
                    normal: 0x000000,
                    selected: 0xFFFFFF,
                    pressed: 0x888888,
                },
            },
            shape: {
                cornerRadius: 15,
            },
            soundPath: null,
            iconPath: null,
            animation: {
                type: 'scale',
                duration: 0.5,
            },
            nineSlice: {
                left: 30,
                top: 30,
                right: 30,
                bottom: 30,
            }
        };

        this.#config = deepMerge(defaultConfig, config);
        this.id = this.#config.id;
        this.renderer = renderer;

        this.interactive = false;
        this.cursor = 'pointer';
    }

    /**
     * @private
     * 非同期の初期化処理
     */
    async _initialize() {
        const assetsToLoad = [];
        const imageUrl = ImageAssetPaths[this.#config.iconPath];
        if (this.#config.iconPath) {
            assetsToLoad.push({ alias: `${this.id}_icon`, src: imageUrl });
        }
        if (this.#config.soundPath) {
            this.#sound = Sound.from(this.#config.soundPath);
        }
        const loadedAssets = await PIXI.Assets.load(assetsToLoad);

        // ▼▼▼【変更点 2/5】状態ごとのテクスチャをここで全て生成する ▼▼▼
        this.#textures.normal = this._createBackgroundTexture('normal');
        this.#textures.selected = this._createBackgroundTexture('selected');
        this.#textures.pressed = this._createBackgroundTexture('pressed');

        this.#background = new PIXI.NineSlicePlane(
            this.#textures.normal, // まずは通常状態のテクスチャをセット
            this.#config.nineSlice.left,
            this.#config.nineSlice.top,
            this.#config.nineSlice.right,
            this.#config.nineSlice.bottom
        );
        // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

        this.#background.width = this.#config.width;
        this.#background.height = this.#config.height;
        this.addChild(this.#background);

        if (this.#config.iconPath) {
            this.#icon = new PIXI.Sprite(loadedAssets[`${this.id}_icon`]);
            this.#icon.anchor.set(0.5);
            this.addChild(this.#icon);
        }

        this.#label = new PIXI.Text(this.#config.label, this.#config.labelStyle.clone());
        this.#label.anchor.set(0.5);
        this.addChild(this.#label);

        this._updateLayout();
        this.updateState(null);
    }

    /**
     * @private
     * 9-sliceの元となるテクスチャをGraphicsで動的に生成します。
     * ★★★ 複雑な形状にしたい場合は、このメソッドを改造してください ★★★
     */
    // ▼▼▼【変更点 3/5】どの状態のテクスチャを作るか引数で受け取るようにする ▼▼▼
    _createBackgroundTexture(state) {
        const g = new PIXI.Graphics();
        
        const fillColor = this.#config.fill_colors[state];
        const strokeColor = this.#config.stroke.color[state];

        if (this.#config.stroke.width > 0) {
            g.lineStyle(this.#config.stroke.width, strokeColor, 1);
        }

        g.beginFill(fillColor);

        const offset = this.#config.stroke.width ? this.#config.stroke.width / 2 : 0;
        g.drawRoundedRect(offset, offset, 100 - offset * 2, 100 - offset * 2, this.#config.shape.cornerRadius);

        g.endFill();
        return this.renderer.generateTexture(g);
    }
    // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

    /**
     * @private
     * アイコンとラベルのレイアウトを更新します
     */
    _updateLayout() {
        const centerX = this.#config.width / 2;
        const centerY = this.#config.height / 2;

        if (this.#icon && this.#label.text) {
            this.#icon.x = centerX - this.#label.width / 2 - 5;
            this.#icon.y = centerY;
            this.#label.x = centerX + this.#icon.width / 2 + 5;
            this.#label.y = centerY;
        } else if (this.#icon) {
            this.#icon.x = centerX;
            this.#icon.y = centerY;
        } else {
            this.#label.x = centerX;
            this.#label.y = centerY;
        }
    }

    /**
     * ボタンの選択状態を外部から設定します。
     * @param {boolean} isSelected - 選択状態にする場合はtrue、解除する場合はfalse
     */
    setSelected(isSelected) {
        // 既に同じ状態なら何もしない
        if (this.#isSelected === isSelected) return;

        this.#isSelected = isSelected;

        if (this.#isSelected) {
            // アニメーションを開始し、選択状態のテクスチャを適用
            this._startSelectionAnimation();
        } else {
            // アニメーションを停止し、通常状態のテクスチャに戻す
            this._stopSelectionAnimation();
        }
    }

    /**
     * ボタンのクリック動作をプログラムから実行します。
     */
    triggerClick() {
        // 押された時の見た目を一瞬だけ適用
        this.#background.texture = this.#textures.pressed;
        
        // 元の見た目に戻す（選択状態なら選択、非選択なら通常）
        if (this.#isSelected) {
            this.#onRelease();
        } else {
            // 選択されていないボタンがEnterで押された場合も
            // 通常状態に戻す
            this.#background.texture = this.#textures.normal;
        }

        // サウンド再生とイベント発行
        if (this.#sound) {
            this.#sound.play();
        }
        this.emit('button_click', this.id);
        console.log(`${this.id} がプログラムによりクリックされました！`);
    }

   
    /**
     * ボタンの状態を更新します（ポーリング用）。
     * @param {string | null} selectedId - 現在選択されているボタンのID
     */
    updateState(selectedId) {
        const wasSelected = this.#isSelected;
        this.#isSelected = this.id === selectedId;

        if (this.#isSelected && !wasSelected) {
            // 非選択 -> 選択 になった
            this._startSelectionAnimation();
        } else if (!this.#isSelected && wasSelected) {
            // 選択 -> 非選択 になった
            this._stopSelectionAnimation();
        }
    }

    hide() {
        this.visible = false;
        this.interactive = false;
    }

    show() {
        this.visible = true;
        this.interactive = true;
    }

    /**
     * リサイズ処理を行う
     * @param {PIXI.Application} App - メインPixiインスタンス
     * @param {number} CurrentOverallScale 現在のメイン画面倍率
    */
    resizeButton(App, CurrentOverallScale) {

        const newWidth = this.#config.width * CurrentOverallScale;
        const newHeight = this.#config.height * CurrentOverallScale;

        // --- 背景のリサイズ ---
        this.#background.width = newWidth;
        this.#background.height = newHeight;

        // --- ラベルのリサイズ ---
        if (this.#label) {
            // [!] ここでも必ず初期設定を基準に計算します
            const newFontSize = this.#config.labelStyle.fontSize * CurrentOverallScale; 
            this.#label.style.fontSize = newFontSize;
        }

        // --- レイアウトとPivotの更新 ---
        const centerX = newWidth / 2;
        const centerY = newHeight / 2;
        if (this.#label) {
            this.#label.x = centerX;
            this.#label.y = centerY;
        }
        this.pivot.set(newWidth / 2, newHeight / 2);

        // TitleScreenでの位置計算のために新しいサイズを返す
        return { width: newWidth, height: newHeight };
    }

    // --- アニメーション関連 ---
    
    _startSelectionAnimation() {
        if (this.#animation) {
            this.#animation.kill();
        }
        // ▼▼▼【変更点 5/5】ここから下のイベント処理も、tintをtexture差し替えに変更 ▼▼▼
        this.#background.texture = this.#textures.selected;
        
        this.#animation = gsap.to(this.scale, {
            x: 1.05,
            y: 1.05,
            duration: this.#config.animation.duration,
            ease: 'power2.out',
            yoyo: true,
            repeat: -1,
        });
    }

    _stopSelectionAnimation() {
        if (this.#animation) {
            this.#animation.kill();
            this.#animation = null;
        }
        
        gsap.to(this.scale, {
            x: 1,
            y: 1,
            duration: this.#config.animation.duration,
            ease: 'power2.out',
        });
        this.#background.texture = this.#textures.normal;
    }

    // --- イベントハンドラ ---(まとめ関数と化してる)
    
    #onPress = () => {
        this.#background.texture = this.#textures.pressed;
        if (this.#sound) {
            this.#sound.play();
        }
        this.emit('button_click', this.id);
    }
    
    #onRelease = () => {
        if (this.#isSelected) {
            this.#background.texture = this.#textures.selected;
        } else {
            this.#background.texture = this.#textures.normal;
        }
    }

    #onHover = () => {
        if (!this.#isSelected) {
            this.#background.texture = this.#textures.selected;
        }
    }

    #onLeave = () => {
        // ▼▼▼【ここから変更 2/2】▼▼▼
        // マウスが離れても、キーボードで選択されている場合はテクスチャを戻さない
        if (!this.#isSelected) {
            this.#background.texture = this.#textures.normal;
        }
        // ▲▲▲【ここまで変更 2/2】▲▲▲
    }
}
// ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

// deepMerge関数は変更ありません
function deepMerge(target, source) {
    const output = { ...target };
    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach(key => {
            if (isObject(source[key])) {
                if (!(key in target))
                    Object.assign(output, { [key]: source[key] });
                else
                    output[key] = deepMerge(target[key], source[key]);
            } else {
                Object.assign(output, { [key]: source[key] });
            }
        });
    }
    return output;
}
function isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item));
}