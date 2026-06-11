import { CharacterTypeEnum, SkillTypeEnum, UltTypeEnum, MainBulletEnum, SubBulletEnum, 
	character_info_list, skill_info_list,  ult_info_list, main_bulled_info_list, sub_bulled_info_list, ImageAssetPaths} from './game_status.js'; // Bulletクラスもインポート


export const ChangeActivation = Object.freeze({
    Activate1: "一意の相手方向へ移動",
    ActivateFixed: "固定速度へ変更",
    CharaSelect2: "CharaSelect2",
    CharaSelect3: "CharaSelect3",
    CharaSelect4: "CharaSelect4",
    CharaSelect5: "CharaSelect5",
    CharaSelect6: "CharaSelect6",
    CharaSelect7: "CharaSelect7",
    CharaSelect8: "CharaSelect8",
    CharaSelect9: "CharaSelect9",
    CharaSelect10: "CharaSelect10"
});

    
// ==================================================================
// Bullet クラスの定義
// ==================================================================

// 打ち出した，設置した弾自体を制御するクラス
// 打ち出し，設置は各クラスで制御する
export class Bullet {
    /**
 	 * コンストラクタ
     * @arapm {PixiJS} ScreenContainer : PxiiJSコンテナ
     * @param {number} startX :発射スタート位置X
     * @param {number} startY :発射スタート位置Y
     * @param {number} options :弾の情報
	 */
    constructor(ScreenContainer, startX, startY, options = {}) {
        this.BaseConfig = options;
        this.x = startX;
        this.y = startY;
        this.OriginX = this.x;
        this.OriginY = this.y;

        // 速度と加速度 (ベクトルで管理)
        this.vx = options.vx !== undefined ? options.vx : 0; // X方向の初速
        this.vy = options.vy !== undefined ? options.vy : 0; // Y方向の初速
        this.ax = options.ax !== undefined ? options.ax : 0; // X方向の加速度
        this.ay = options.ay !== undefined ? options.ay : 0; // Y方向の加速度
		this.jx = options.jx !== undefined ? options.jx : 0; // X方向の加加速度
        this.jy = options.jy !== undefined ? options.jy : 0; // Y方向の加加速度

        // 見た目の弾丸
        // 画像を使用する
        this.BulletImageKey = options.BulletImageKey;
        // 画像読み込み
		this.spritebullet = this.BulletImageKey ? ImageAssetPaths[this.BulletImageKey] : null;
		if (this.BulletImageKey && !this.spritebullet) {
			console.warn(`Player sprite for key "${this.avatar_image_key}" not loaded. Fallback color will be used.`);
		}
        
        this.BulletImageKey = options.BulletImageKey;
        this.ScreenContainer = ScreenContainer;

        // 1. 画像キーが存在する場合、テクスチャからスプライトを生成
        if (this.BulletImageKey) {
            const texture = PIXI.Texture.from(this.BulletImageKey);
            
            // テクスチャが存在することを確認（事前にPIXI.Assets.loadしている必要があります）
            if (texture && texture !== PIXI.Texture.EMPTY) {
                this.BulletImage = new PIXI.Sprite(texture);
                this.BulletImage.anchor.set(0.5); // スプライトの中心を基準点に設定
                this.BulletImage.width = options.width || 10;
                this.BulletImage.height = options.height || 10;
                this.ScreenContainer.addChild(this.BulletImage);
            }
        }

        this.globalAlpha = options.globalAlpha !== undefined ? options.globalAlpha : 1; // 弾の透明度

        // 形状というより当たり判定
        this.shape = options.shape || 'circle'; // デフォルトは円形
        this.width = options.width || 10;         // 形状に応じた幅 (例: 円形の幅、楕円の横直径)
        this.height = options.height || 10;        // 形状に応じた高さ (例: 円形の高さ、楕円の縦直径)
        this.orientation = options.orientation || 0; // 形状の向き (ラジアン)


        this.color = options.color || 'white';
        this.damage = options.damage || 10;
        this.life = options.life !== undefined ? options.life : 1; // 弾の体力 (時間では減らない現仕様)
        this.isHit = false;

        // 追尾用 (将来の拡張用)
        this.target = options.target || null; // 追尾対象 (Player や Enemy インスタンスなど)
        this.trackingStrength = options.trackingStrength !== undefined ?  options.trackingStrength : 0; // 追尾の強さ (0なら追尾しない)
        this.maxSpeed = options.maxSpeed !== undefined ? options.maxSpeed : 300; // ピクセル/秒
    
        // 挙動変化のフラグ
        this.ActivationLength = options.ActivationLength || null; // 挙動変化が起こる距離 (0なら即時)
        this.PostActivationOptions = options.PostActivationOptions || null; // 変化後の挙動設定
        this.IsActivated = false; // 挙動が変化したかどうかのフラグ

        // 方向変化用 (将来の拡張用)
        this.turnRate = options.turnRate || 0; // 旋回率 (ラジアン/フレーム)
        this.timeToLivePattern = options.timeToLivePattern || Infinity; // パターン変更までの時間
        this.currentPatternTime = 0;

        // サインカーブ用プロパティ
        this.sineWaveEnabled = options.sine_wave_enabled || false;
        this.initialSineAmplitude  = options.sine_amplitude || 0;
        this.sineAngularFrequency = options.sine_angular_frequency || 0;
        this.sinePhaseOffset = options.sine_phase_offset || 0;
        this.sineAxis = options.sine_axis || "x"; // "x"または"y"
        this.pathCenterX = startX; // サインカーブの中心線の初期X座標
        this.pathCenterY = startY; // サインカーブの中心線の初期Y座標
        this.sineDecayRate = options.sine_decay_rate;
        
        this.bulletLifeTimer = 0; // 弾が生成されてからの経過時間（サイン関数の時間入力に使う）

        // 反射設定
        this.bounce = options.bounce || false;
        if (this.bounce) {
            this.minXArea = options.minXArea !== undefined ? options.minXArea : null;
            this.maxXArea = options.maxXArea !== undefined ? options.maxXArea : null;
            this.minYArea = options.minYArea !== undefined ? options.minYArea : null;
            this.maxYArea = options.maxYArea !== undefined ? options.maxYArea : null;
            this.bounceCount = options.bounceCount !== undefined ? options.bounceCount : Infinity;
            this.currentBounceCount = 0;
        }
    }

    /**
	 * ベースからリサイズを行う
	 */
    ReiszeBullets(Magnifacture){
        
    }

    /**
	 * 挙動変更関数
	 */
    UpdateActivation(){
        switch(this.PostActivationOptions.ChangeActivation){
            case ChangeActivation.Activate1:
                // 現在のキャラの方向に向かって一目散に移動
                if(this.target){
                    const TaragetX = this.target.x;
                    const TaragetY = this.target.y;

                    // 今の座標位置から、ターゲット位置までを直線でつなぐような速度に変更する
                    const NowXPos = this.x;
                    const NowYPos = this.y;
                    const LengthX = TaragetX - NowXPos;  
                    const LengthY = TaragetY - NowYPos;
                    const Distance = Math.sqrt(LengthX*LengthX + LengthY*LengthY) * this.PostActivationOptions.LengthParcent;
                    const SIN_TARGET = LengthY / Distance;
                    const COS_TARGET = LengthX / Distance;
                    const NewSpeed = Math.sqrt(this.PostActivationOptions.vx*this.PostActivationOptions.vx + this.PostActivationOptions.vy*this.PostActivationOptions.vy);
                    const NewAccel = Math.sqrt(this.PostActivationOptions.ax*this.PostActivationOptions.ax + this.PostActivationOptions.ay*this.PostActivationOptions.ay); 
                    const NewJeak = Math.sqrt(this.PostActivationOptions.jx*this.PostActivationOptions.jx + this.PostActivationOptions.jy*this.PostActivationOptions.jy); 
                    
                    const ActivateSpeedX = COS_TARGET * NewSpeed;
                    const ActivateSpeedY = SIN_TARGET * NewSpeed;
                    const ActivateAccelX = SIN_TARGET * NewAccel;
                    const ActivateAccelY = COS_TARGET * NewAccel;
                    const ActivateJeakX = SIN_TARGET * NewJeak;
                    const ActivateJeakY = COS_TARGET * NewJeak;
                    this.vx = ActivateSpeedX;
                    this.vy = ActivateSpeedY;
                    this.ax = ActivateAccelX;
                    this.ay = ActivateAccelY;
                    this.jx = ActivateJeakX;
                    this.jy = ActivateJeakY;
                }
                break;
            case ChangeActivation.ActivateFixed:
                this.vx = this.PostActivationOptions.vx !== undefined ? this.PostActivationOptions.vx : this.vx;
                this.vy = this.PostActivationOptions.vy !== undefined ? this.PostActivationOptions.vy : this.vy;
                this.ax = this.PostActivationOptions.ax !== undefined ? this.PostActivationOptions.ax : this.ax;
                this.ay = this.PostActivationOptions.ay !== undefined ? this.PostActivationOptions.ay : this.ay;
                this.jx = this.PostActivationOptions.jx !== undefined ? this.PostActivationOptions.jx : this.jx;
                this.jy = this.PostActivationOptions.jy !== undefined ? this.PostActivationOptions.jy : this.jy;
                if (this.PostActivationOptions.maxSpeed !== undefined) {
                    this.maxSpeed = this.PostActivationOptions.maxSpeed;
                }
                if (this.PostActivationOptions.trackingStrength !== undefined) {
                    this.trackingStrength = this.PostActivationOptions.trackingStrength;
                }
                break;
        }
    }

    update(deltaTime) {
        if (this.isHit) return;
        this.bulletLifeTimer += deltaTime;
        
        if(this.ActivationLength){
            if (!this.IsActivated) {
                if (this.ActivationLength > 0) {
                    const DistanceSq = (this.x - this.OriginX)**2 + (this.y - this.OriginY)**2;
                    if (DistanceSq >= this.ActivationLength**2) {
                        this.IsActivated = true;
                        // ここで新しい挙動を定義しておく
                        // 挙動は複数種類用意上で定義している
                        this.UpdateActivation();
                    }
                }
            }
        }// else if 距離による差動
        

       if (this.target && this.trackingStrength > 0) { // targetPlayerの代わりにthis.targetを使う
            const targetCenterX = this.target.x + (this.target.width ? this.target.width / 2 : 0);
            const targetCenterY = this.target.y + (this.target.height ? this.target.height / 2 : 0);
            const targetDx = targetCenterX - this.x;
            const targetDy = targetCenterY - this.y;
            const angleToTarget = Math.atan2(targetDy, targetDx);

            // 現在の進行方向の角度
            let currentAngle = Math.atan2(this.vy, this.vx);

            // ターゲットへの角度と現在の角度の差
            let angleDiff = angleToTarget - currentAngle;
            // 角度差を -PI から PI の範囲に正規化
            while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
            while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

            // ===================== ★ここから修正 =====================
            // trackingStrength を「1秒間に回転できる最大ラジアン（最大旋回角速度）」として扱います。
            // このフレームで回転できる最大角度を計算します。
            const maxTurnThisFrame = this.trackingStrength * deltaTime;

            // ターゲットへの角度差が、このフレームで回転できる最大角度を超えないように補正量を制限します。
            const effectiveTurn = Math.max(-maxTurnThisFrame, Math.min(maxTurnThisFrame, angleDiff));
            // ===================== ★ここまで修正 =====================

            currentAngle += effectiveTurn;

            const speedMagnitude = Math.sqrt(this.vx**2 + this.vy**2) || this.maxSpeed;

            this.vx = Math.cos(currentAngle) * speedMagnitude;
            this.vy = Math.sin(currentAngle) * speedMagnitude;
        }

		// 2. 加加速度による加速度の変化
		this.ax += this.jx * deltaTime;
		this.ay += this.jy * deltaTime;
		
        // 3. 加速度による速度変化
        this.vx += this.ax * deltaTime;
        this.vy += this.ay * deltaTime;

        // (オプション) 最大速度制限
        const currentSpeedSq = this.vx**2 + this.vy**2;
        if (this.maxSpeed > 0 && currentSpeedSq > this.maxSpeed**2 ) {
             const currentSpeed = Math.sqrt(currentSpeedSq);
             this.vx = (this.vx / currentSpeed) * this.maxSpeed;
             this.vy = (this.vy / currentSpeed) * this.maxSpeed;
        }


        // 4. 時間経過による方向変化 (自律旋回など、将来的に実装)
        if (this.turnRate !== 0) {
            const angleChange = this.turnRate * deltaTime;
            const cosVal = Math.cos(angleChange);
            const sinVal = Math.sin(angleChange);
            const newVx = this.vx * cosVal - this.vy * sinVal;
            const newVy = this.vx * sinVal + this.vy * cosVal;
            this.vx = newVx;
            this.vy = newVy;
        }

        // sin値による値の変化
        this.pathCenterX += this.vx * deltaTime;
        this.pathCenterY += this.vy * deltaTime;

        // 反射（バウンド）の境界チェックと反射処理
        if (this.bounce) {
            const halfW = this.width / 2;
            const halfH = this.height / 2;
            if (this.minXArea !== null && this.pathCenterX - halfW < this.minXArea) {
                this.vx = Math.abs(this.vx);
                this.ax = Math.abs(this.ax);
                this.pathCenterX = this.minXArea + halfW;
                this.currentBounceCount++;
            } else if (this.maxXArea !== null && this.pathCenterX + halfW > this.maxXArea) {
                this.vx = -Math.abs(this.vx);
                this.ax = -Math.abs(this.ax);
                this.pathCenterX = this.maxXArea - halfW;
                this.currentBounceCount++;
            }
            if (this.minYArea !== null && this.pathCenterY - halfH < this.minYArea) {
                this.vy = Math.abs(this.vy);
                this.ay = Math.abs(this.ay);
                this.pathCenterY = this.minYArea + halfH;
                this.currentBounceCount++;
            } else if (this.maxYArea !== null && this.pathCenterY + halfH > this.maxYArea) {
                this.vy = -Math.abs(this.vy);
                this.ay = -Math.abs(this.ay);
                this.pathCenterY = this.maxYArea - halfH;
                this.currentBounceCount++;
            }

            if (this.currentBounceCount >= this.bounceCount) {
                this.bounce = false;
            }
        }

        // 3. 最終的な描画位置 (this.x, this.y は左上) を計算
        let finalDrawX = this.pathCenterX - this.width / 2;
        let finalDrawY = this.pathCenterY - this.height / 2;

        if (this.sineWaveEnabled && this.initialSineAmplitude !== 0) {
            // ★現在の振幅を計算 (指数関数的減衰)
            let currentAmplitude = this.initialSineAmplitude;
            if (this.sineDecayRate > 0) {
                currentAmplitude = this.initialSineAmplitude * Math.exp(-this.sineDecayRate * this.bulletLifeTimer);
            }

            // 振幅が非常に小さくなったら、波の計算を省略してもよい (パフォーマンスのため)
            if (currentAmplitude > 0.01) { // 例: 0.01ピクセル未満は無視
                // X軸方向に揺れるサインカーブと仮定
                const offsetX = currentAmplitude * Math.sin(this.sineAngularFrequency * this.bulletLifeTimer + this.sinePhaseOffset);
                finalDrawX += offsetX;
            } else {
                // 振幅がほぼ0になったら、以降はサインカーブを無効にしても良い
                // this.sineWaveEnabled = false; 
            }
        }

        // 5. 位置更新
        this.x = finalDrawX;
        this.y = finalDrawY;
    }

    /**
 	 * 現在の弾の位置情報から、弾の画像場所を更新する
	 */
    DrwaUpdate() {
        
        if (this.isHit) return;
        this.BulletImage.x = this.x;
        this.BulletImage.y = this.y;
    }

     /**
     * 弾のアセット（画像）をまとめて読み込むための静的メソッド
     * @param {Array<object>} bulletInfoLists - 弾情報のリストが入った配列 (例: [main_bulled_info_list, sub_bulled_info_list])
     */
    static async loadAssets(bulletInfoLists) {
        const assetKeysToLoad = new Set();

        // 渡された弾情報リストをすべてループ
        for (const infoList of bulletInfoLists) {
            // 各リストの中の弾情報をループ
            for (const key in infoList) {
                const bulletInfo = infoList[key];
                if (bulletInfo && bulletInfo.ball_image_key) {
                    assetKeysToLoad.add(bulletInfo.ball_image_key);
                }
            }
        }

        if (assetKeysToLoad.size === 0) {
            console.log("No bullet assets to load.");
            return;
        }

        // PixiJSが要求する形式に変換
        const assetsForPixi = [];
        for (const key of assetKeysToLoad) {
            if (ImageAssetPaths[key]) {
                assetsForPixi.push({ alias: key, src: ImageAssetPaths[key] });
            } else {
                console.warn(`Asset key "${key}" not found in ImageAssetPaths.`);
            }
        }

        // アセットをまとめて読み込む
        if (assetsForPixi.length > 0) {
            await PIXI.Assets.load(assetsForPixi);
            console.log('Bullet assets loaded:', assetKeysToLoad);
        }
    }

    /**
     * 弾を破棄し、関連するリソースを解放する
     */
    destroy() {
        if (this.BulletImage) {
            // 親コンテナからスプライトを削除
            if (this.BulletImage.parent) {
                this.BulletImage.parent.removeChild(this.BulletImage);
            }
            // スプライトを破棄し、関連するテクスチャも解放（必要に応じて）
            // true を渡すと、ベーステクスチャも破棄されるため、他のスプライトで同じテクスチャを使用している場合は注意が必要です。
            // 弾ごとの専用テクスチャであれば true で問題ありません。
            // 共有テクスチャの場合は false に設定します。
            this.BulletImage.destroy({ children: true, texture: false, baseTexture: false }); 
            this.BulletImage = null; // 参照をクリア
        }

        // その他のプロパティもクリアしてガベージコレクションを助ける
        this.ScreenContainer = null;
        this.target = null;
        this.isHit = true; // 既にヒット済みとしてマーク
    }
}