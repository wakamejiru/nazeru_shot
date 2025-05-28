// asset_manager.js

export class AssetManager {
    constructor(imageAssetPaths = {}) {
        this.imagePaths = imageAssetPaths; // { key1: "path/to/image1.svg", key2: "path/to/image2.png", ... }
        this.images = {};         // 読み込んだImageオブジェクトを格納する場所 { key1: ImageObject1, ... }
        this.promises = [];       // 各画像の読み込みPromiseを格納する配列
        this.loadedCount = 0;     // 読み込み完了したアセットの数
        this.totalAssets = Object.keys(this.imagePaths).length; // 全アセット数
    }

    /**
     * 個別の画像を読み込むプライベート風メソッド
     * @param {string} key - アセットを識別するためのキー (例: 'playerSprite')
     * @param {string} path - 画像ファイルのパスまたはData URI
     */
    _loadImage(key, path) {
        const promise = new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.images[key] = img;
                this.loadedCount++;
                // console.log(`AssetManager: Image "${key}" loaded successfully from ${path}`);
                resolve(img);
            };
            img.onerror = (error) => {
                console.error(`AssetManager: Error loading image "${key}" from ${path}`, error);
                reject(new Error(`Failed to load image: ${key} at ${path}`));
            };
            img.src = path;
        });
        this.promises.push(promise);
    }

    /**
     * 定義されたすべての画像を非同期で読み込む
     * @returns {Promise<void>} すべての画像が読み込み試行された後に解決されるPromise
     */
    loadAllAssets() {
        console.log(`AssetManager: Starting to load ${this.totalAssets} assets...`);
        if (this.totalAssets === 0) {
            console.log("AssetManager: No assets to load.");
            return Promise.resolve(); // 読み込むアセットがなければ即座に解決
        }

        for (const key in this.imagePaths) {
            if (this.imagePaths.hasOwnProperty(key)) {
                this._loadImage(key, this.imagePaths[key]);
            }
        }

        // すべての読み込みPromiseが完了するのを待つ
        return Promise.all(this.promises)
            .then(() => {
                console.log("AssetManager: All assets loaded successfully.");
            })
            .catch((error) => {
                console.error("AssetManager: Error loading some assets.", error);
                // エラーが発生しても、一部は読み込めている可能性があるので、
                // ゲームを続行するかどうかは呼び出し側で判断する
                return Promise.reject(error); // エラーを再度スローするか、適切に処理
            });
    }

    /**
     * 読み込み済みのImageオブジェクトをキーで取得する
     * @param {string} key - 取得したいアセットのキー
     * @returns {Image|null} 対応するImageオブジェクト、または見つからなければnull
     */
    getImage(key) {
        const img = this.images[key];
        if (!img) {
            console.warn(`AssetManager: Image with key "${key}" not found or not loaded.`);
            return null;
        }
        return img;
    }

    /**
     * 読み込みの進捗状況を取得する (例)
     * @returns {number} 0.0 から 1.0 の間の進捗率
     */
    getLoadingProgress() {
        if (this.totalAssets === 0) return 1; // アセットがなければ完了扱い
        return this.loadedCount / this.totalAssets;
    }
}