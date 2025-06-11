import * as PIXI from 'pixi.js';
import { Sound } from '@pixi/sound';
import { gsap } from 'gsap';

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

        // --- 設定のデフォルト値と統合 ---
        this.#config = {
            id: 'default-button',
            width: 200,
            height: 60,
            label: '',
            labelStyle: new PIXI.TextStyle({ fill: '#FFFFFF', fontSize: 24, fontWeight: 'bold' }),
            shape: {
                cornerRadius: 15,
                // 注: 複雑な形状定義は、下の_createBackgroundTextureで拡張します
            },
            colors: {
                normal: 0xAAAAAA,
                selected: 0xFFFFFF,
                pressed: 0x888888,
            },
            soundPath: null,
            iconPath: null,
            animation: {
                type: 'scale', // 'scale', 'glow', etc.
                duration: 0.2,
            },
            nineSlice: {
                left: 30,
                top: 30,
                right: 30,
                bottom: 30,
            },
            ...config
        };
        
        this.id = this.#config.id;
        this.renderer = renderer; // テクスチャ生成のために保持

        // --- コンテナの基本設定 ---
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
        // --- アセットのロード ---
        const assetsToLoad = [];
        if (this.#config.iconPath) {
            assetsToLoad.push({ alias: `${this.id}_icon`, src: this.#config.iconPath });
        }
        if (this.#config.soundPath) {
            this.#sound = Sound.from(this.#config.soundPath);
        }
        const loadedAssets = await PIXI.Assets.load(assetsToLoad);

        // --- 背景の生成 (9-slice) ---
        const bgTexture = this._createBackgroundTexture();
        this.#background = new PIXI.NineSlicePlane(
            bgTexture,
            this.#config.nineSlice.left,
            this.#config.nineSlice.top,
            this.#config.nineSlice.right,
            this.#config.nineSlice.bottom
        );
        this.#background.width = this.#config.width;
        this.#background.height = this.#config.height;
        this.addChild(this.#background);

        // --- アイコンの追加 (もしあれば) ---
        if (this.#config.iconPath) {
            this.#icon = new PIXI.Sprite(loadedAssets[`${this.id}_icon`]);
            this.#icon.anchor.set(0.5);
            this.addChild(this.#icon);
        }

        // --- ラベルの追加 ---
        this.#label = new PIXI.Text(this.#config.label, this.#config.labelStyle);
        this.#label.anchor.set(0.5);
        this.addChild(this.#label);

        this._updateLayout();
        this.updateState(null); // 初期状態を設定
    }

    /**
     * @private
     * 9-sliceの元となるテクスチャをGraphicsで動的に生成します。
     * ★★★ 複雑な形状にしたい場合は、このメソッドを改造してください ★★★
     */
    _createBackgroundTexture() {
        const g = new PIXI.Graphics();
        // ここでは角丸四角形を描画
        g.beginFill(0xFFFFFF); // tintで色付けするため、元は白で描画
        g.drawRoundedRect(0, 0, 100, 100, this.#config.shape.cornerRadius); // サイズは仮。9-sliceで伸縮させる
        g.endFill();
        
        // Graphicsオブジェクトからテクスチャを生成
        return this.renderer.generateTexture(g);
    }
    
    /**
     * @private
     * アイコンとラベルのレイアウトを更新します
     */
    _updateLayout() {
        const centerX = this.#config.width / 2;
        const centerY = this.#config.height / 2;

        if (this.#icon && this.#label.text) {
            // アイコンとテキストが両方ある場合
            this.#icon.x = centerX - this.#label.width / 2 - 5;
            this.#icon.y = centerY;
            this.#label.x = centerX + this.#icon.width / 2 + 5;
            this.#label.y = centerY;
        } else if (this.#icon) {
            // アイコンのみ
            this.#icon.x = centerX;
            this.#icon.y = centerY;
        } else {
            // ラベルのみ
            this.#label.x = centerX;
            this.#label.y = centerY;
        }
    }


    // --- 外部から呼び出すメソッド ---

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

        // 非選択時の色更新
        if(!this.#isSelected) {
            this.#background.tint = this.#config.colors.normal;
        }
    }

    /**
     * ボタンを非表示にします。
     */
    hide() {
        this.visible = false;
        this.interactive = false;
    }

    /**
     * ボタンを表示します。
     */
    show() {
        this.visible = true;
        this.interactive = true;
    }


    // --- アニメーション関連 ---
    
    _startSelectionAnimation() {
        if (this.#animation) {
            this.#animation.kill();
        }
        this.#background.tint = this.#config.colors.selected;
        
        // GSAPを使ったアニメーション例（スケール）
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
        
        // 停止時は即座に元の状態に戻す
        gsap.to(this.scale, {
            x: 1,
            y: 1,
            duration: this.#config.animation.duration,
            ease: 'power2.out',
        });
        this.#background.tint = this.#config.colors.normal;
    }


    // --- イベントハンドラ ---
    
    #onPress = () => {
        this.#background.tint = this.#config.colors.pressed;
        if (this.#sound) {
            this.#sound.play();
        }
        // 他のクリック処理（例：画面遷移）はここで発火(emit)すると良い
        this.emit('button_click', this.id);
    }
    
    #onRelease = () => {
        if (this.#isSelected) {
            this.#background.tint = this.#config.colors.selected;
        } else {
            this.#background.tint = this.#config.colors.normal;
        }
    }

    #onHover = () => {
        // ポーリングで選択されていない場合でも、マウスホバーで色を変える
        if (!this.#isSelected) {
            this.#background.tint = this.#config.colors.selected;
        }
    }

    #onLeave = () => {
        // ポーリングで選択されていない場合は、元の色に戻す
        if (!this.#isSelected) {
            this.#background.tint = this.#config.colors.normal;
        }
    }
}