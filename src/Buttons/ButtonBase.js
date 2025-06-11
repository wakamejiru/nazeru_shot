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
            labelStyle: new PIXI.TextStyle({ fill: '#000000', fontSize: 24, fontWeight: 'bold' }),
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
                duration: 0.2,
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

        this.interactive = true;
        this.cursor = 'pointer';
        this.on('pointerdown', this.#onPress)
             .on('pointerup', this.#onRelease)
             .on('pointerupoutside', this.#onRelease)
             .on('pointerover', this.#onHover)
             .on('pointerout', this.#onLeave);
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

        this.#label = new PIXI.Text(this.#config.label, this.#config.labelStyle);
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

        // ▼▼▼【今回の修正点】以下の if ブロックを削除、またはコメントアウトします ▼▼▼
        /*
        // 非選択時の色更新 ← この処理がマウスホバーの表示を上書きしてしまっていた
        if(!this.#isSelected) {
            this.#background.texture = this.#textures.normal;
        }
        */
        // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲
    }

    hide() {
        this.visible = false;
        this.interactive = false;
    }

    show() {
        this.visible = true;
        this.interactive = true;
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

    // --- イベントハンドラ ---
    
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
        if (!this.#isSelected) {
            this.#background.texture = this.#textures.normal;
        }
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