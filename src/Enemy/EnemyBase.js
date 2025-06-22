// EnemyBase.js
import { Bullet } from '../bullet.js'; 
import { main_bulled_info_list, sub_bulled_info_list, EnemyTypeEnum, EnemySkillTypeEnum } from '../game_status.js';

export class EnemyBase {
    /**
 	 * コンストラクタ
	 * @param {PixiJS Container} GameScreenContainer - ゲーム操作画面のコンテナ
     * @param {number} StartShootingX シューティング画面の設置サイズのXポジション
     * @param {number} StartShootingY シューティング画面の設置サイズのYポジション
     * @param {number} StartShootingWidth シューティング画面の設置サイズの幅
     * @param {number} StartShootingHeight シューティング画面の設置サイズの高さ
     * @param {number} EnemyConfig 敵情報
	 */
    constructor(GameScreenContainer, StartShootingX, StartShootingY, StartShootingWidth, StartShootingHeight, EnemyConfig) {
        this.x = StartShootingX + (StartShootingWidth/2);
        this.y = StartShootingY + StartShootingHeight*0.2;

        // 移動先を宣言
        this.MoveingTargetX = this.x;
        this.MoveingTargetY = this.y;

        this.GameScreenContainer = GameScreenContainer;

        this.CurrentScaleFactor = 1.0;

        this.EnemyConfigBase = EnemyConfig;


        this.EnemyTypeID = EnemyConfig.ETypeTypeID; // 識別用
        this.EnemyName = EnemyConfig.enemy_name;

        this.EnemyImageKey = EnemyConfig.enemy_image_key;
        
        this.EnemyWidth = this.EnemyConfigBase.enemy_width;
        this.EnemyHeight =  this.EnemyConfigBase.enemy_height;
        this.EnemySpeed = this.EnemyConfigBase.enemy_speed;
        
        this.MaxHP = EnemyConfig.enemy_maxhp;
        this.NowHP = this.MaxHP;

        this.EnemyHPGuage = EnemyConfig.enemy_hp_guage;
        this.EnemyPlayULT = EnemyConfig.enemy_play_ult;
        // スペルの発動条件
        this.ELimitBreakPoint = EnemyConfig.e_limit_break_point;

 
        // 弾の発射レートの管理用タイマ
        this.AttackRateTimer = 0;
        this.NowAttackRateTimer = 0;
        this.AttackCounter = 0; // 通常攻撃汎用カウンタ

        this.EnemyContainer = new PIXI.Container();
        this.GameScreenContainer.addChild(this.EnemyContainer);

        // 現在のplaySizeもここに書く
        this.NowPlayAreaWidth = StartShootingWidth;
        this.NowPlayAreaHeight = StartShootingHeight;
        this.StartAreaX = StartShootingX;
        this.StartAreaY = StartShootingY;

        // 移動AI用
        this.MoveAreaTopY = this.StartAreaY + this.EnemyHeight / 2;
        this.MoveAreaBottomY = this.MoveAreaTopY + this.NowPlayAreaHeight / 3 - this.EnemyHeight / 2;
        this.MoveAreaLeftX = this.StartAreaX + this.EnemyWidth / 2;
        this.MoveAreaRightX = this.MoveAreaLeftX +  this.NowPlayAreaWidth - this.EnemyWidth / 2;

        this.MoveWaitTimer = 0; // ターゲット到達後の待機タイマー
        this.MoveWaitDuration = EnemyConfig.move_wait_duration;
        this.NextMoveTargetInterval = EnemyConfig.next_move_interval;
        this.NextMoveTargetTimer = this.NextMoveTargetInterval;


        // 攻撃パターンシーケンス管理
        this.SkillStateNumber = EnemySkillTypeEnum.E_SKILL_1; // game_status.jsからのフェーズ設定
        this.EnemySkillNumber = EnemySkillTypeEnum.shooting_phases_number;


        // 通常攻撃の待機時間
        this.AttackWatingTime = EnemyConfig.attack_watingtime;
        this.NowAttackWatingTime = 1.5; // 最初の待機時間
        this.AttackState = 0;
        this.AttackVariation = EnemyConfig.attack_variation;
        this.SkillActiveFlag = false;

        this.CanMoveFlag = true; // trueの時は移動OK,false時は移動不可
            
        this.NowAttackLimitCnt = 0; // 攻撃の継続時間の情報 

        this.HpBarBackground = null; // HPバーの背景
        this.HpBarFill = null;       // HPバーの中身（ゲージ）
        this.HpLimitMarker = null;   // HPの特定位置を示すマーカー
        this.HpBarBorders = null;    // HPバーの枠線
    
        // HPバーの初期化メソッドを呼び出す
        this.InitializeHpBar();
    }
    /**
 	 * 非同期の初期化メソッドを追加
	 */
    async Initialize() {
        // 1. 必要な画像を読み込む
        await this.LoadScreenAssetsForPixi();
       
        // 2. 読み込み完了後、テクスチャを取得してSpriteを生成する
        const EnemyTexture = PIXI.Texture.from(this.EnemyImageKey);
        this.EnemyImage = new PIXI.Sprite(EnemyTexture);
        
        // 3. Spriteの各種設定を行う
        this.EnemyImage.anchor.set(0.5);
        this.EnemyImage.scale.set(this.CurrentScaleFactor);
        this.EnemyImage.x = this.x;
        this.EnemyImage.y = this.y;
        this.EnemyImage.width = this.EnemyConfigBase.enemy_width * this.CurrentScaleFactor;
        this.EnemyImage.height = this.EnemyConfigBase.enemy_height * this.CurrentScaleFactor;

        // 4. コンテナに追加
        this.CharacterContainer.addChild(this.CharacterImage);
    }


    /**
 	 * 大きさを更新する
     * @param {number} NewScaleFactor :新しい画面のスケール
     * @param {number} NewShootingStartX :新しい画面の開始位置
     * @param {number} NewShootingStartY :新しい画面のス開始位置
     * @param {number} NewShootingWidth :新しい画面の幅
     * @param {number} NewShootingHeight :新しい画面の縦の大きさ
	 */
    updateScale(NewScaleFactor, NewShootingStartX, NewShootingStartY, NewShootingWidth, NewShootingHeight) {
        const OldEffectiveGameplayWidth = this.NowPlayAreaWidth;
        const OldEffectiveGameplayHeight = this.NowPlayAreaHeight;
        const RelativeX = this.x / OldEffectiveGameplayWidth;
        const RelativeY = this.y / OldEffectiveGameplayHeight;
        const RelativeTargetX = this.MoveingTargetX / OldEffectiveGameplayWidth;
        const RelativeTargetY = this.MoveingTargetY / OldEffectiveGameplayHeight;

        this.CurrentScaleFactor = NewScaleFactor;

        this.EnemyWidth = this.EnemyConfigBase.enemy_width * NewScaleFactor;
        this.EnemyHeight = this.EnemyConfigBase.enemy_height * NewScaleFactor;
        this.EnemySpeed = this.EnemyConfigBase.enemy_speed * NewScaleFactor;
        this.EnemyHitpointRadius = (Math.max(this.EnemyWidth, this.EnemyHeight) /2) * 1.1;


        // キャラクターが指定の範囲内に収まるようにチェック
        const PositionXY = this.IsAreaIn(RelativeX * NewShootingWidth, RelativeY * NewShootingHeight);
        this.x = PositionXY.AreaXPos; 
        this.y = PositionXY.AreaYPos; 
        
        // 旧サイズを捨て更新
        this.NowPlayAreaWidth = NewShootingWidth; 
        this.NowPlayAreaHeight = NewShootingHeight;
        this.StartAreaX = NewShootingStartX;
        this.StartAreaY = NewShootingStartY;


        // 移動範囲も更新
        const MovingPositionXY = this.IsAreaIn(RelativeTargetX * NewShootingWidth, RelativeTargetY * NewShootingHeight);
        this.MoveingTargetX = MovingPositionXY.AreaXPos;
        this.MoveingTargetY = MovingPositionXY.AreaYPos;
        
        // 移動AI用
        this.MoveAreaTopY = this.StartAreaY + this.EnemyHeight / 2;
        this.MoveAreaBottomY = this.MoveAreaTopY + this.NowPlayAreaHeight / 3 - this.EnemyHeight / 2;
        this.MoveAreaLeftX = this.StartAreaX + this.EnemyWidth / 2;
        this.MoveAreaRightX = this.MoveAreaLeftX +  this.NowPlayAreaWidth - this.EnemyWidth / 2;

        // この後に弾のスケーリングも多分必要
    }


    /**
 	 * 新しい移動先を決定する
	 */
    setNewTarget() {
        const RandomXRange = this.MoveAreaRightX - this.MoveAreaLeftX;
        this.TargetX = (RandomXRange <= 0) ? (this.MoveAreaLeftX + this.MoveAreaRightX) / 2 : this.MoveAreaLeftX + Math.random() * RandomXRange;
        
        const RandomYRange = this.MoveAreaBottomY - this.MoveAreaTopY;
        this.TargetY = (RandomYRange <= 0) ? (this.MoveAreaTopY + this.MoveAreaBottomY) / 2 : this.MoveAreaTopY + Math.random() * RandomYRange;
        // 範囲内の確認を行う
        const PositionXY = this.IsAreaIn(this.TargetX, this.TargetY);
        this.TargetX = PositionXY.AreaXPos; 
        this.TargetY = PositionXY.AreaYPos;     
    }

    /**
 	 * 移動を行う
	 */
    move(DeltaTime) {
        if (this.NowHP <= 0) return;

        // 移動不可中は停止
        if(this.CanMoveFlag == false){

        }else{

            this.NextMoveTargetTimer -= DeltaTime;
            if (this.NextMoveTargetTimer <= 0) {
                this.setNewTarget();
                this.NextMoveTargetTimer = this.NextMoveTargetInterval;
                this.MoveWaitTimer = 0; // 新しいターゲットが設定されたら即座に移動開始
            }

            if (this.MoveWaitTimer > 0) {
                this.MoveWaitTimer -= DeltaTime;
                return;
            }

            const Dx = this.TargetX - this.x;
            const Dy = this.TargetY - this.y;
            const Distance = Math.sqrt(Dx * Dx + Dy * Dy);

            if (Distance < (this.EnemySpeed * DeltaTime) || Distance < 1.0) { // ほぼ到達
                this.x = this.TargetX;
                this.y = this.TargetY;
                this.MoveWaitTimer = this.MoveWaitDuration;
                return;
            }

            this.x += (Dx / Distance) * this.EnemySpeed * DeltaTime;
            this.y += (Dy / Distance) * this.EnemySpeed * DeltaTime;

            // 範囲内の確認を行う
            const PositionXY = this.IsAreaIn(this.x, this.y);
            this.x = PositionXY.AreaXPos; 
            this.y = PositionXY.AreaYPos;     
        }
    }

    /**
 	 * 弾を打ち出す
	 */
    _shoot(BulletArray, TargetPlayer, CurrentTime, DeltaTime) {
        if (this.NowHP <= 0) {
            return;
        }

        // 通常攻撃は3パターン用意
        // 
        // 3パターンのうち
    }

    /**
 	 * スキルの実行を行う
	 */
    _skilrun()
    {
        // 一定条件下でスキルを使う
        // HP何割削れたかで決める

    }

    /**
 	 * キャラクターの画像を当たり判定の座標軸と一致させる
	 */
    DrawEnemyImage() {
        if (this.NowHP <= 0 || !this.EnemyImage) return;
        this.EnemyImage.x = this.x;
        this.EnemyImage.y = this.y;
        DrawHpBar();
    }

    /**
 	 * キャラクターのHPバーを表示する
	 */
    DrawHpBar() {
        // 必要なオブジェクトがなければ処理を中断
        if (!this.HpBarBackground || this.NowHP <= 0 || !this.MaxHP || this.MaxHP <= 0) {
            // HPが0以下なら、すべての表示をクリア
            this.HpBarBackground?.clear();
            this.HpBarFill?.clear();
            this.HpLimitMarker?.clear();
            this.HpBarBorders?.clear();
            return;
        }

        // --- 1. 描画に必要なパラメータを計算 (元のロジックと同じ) ---
        const HPRingLineWidth = 15;
        const CenterX = this.x;
        const CenterY = this.y;
        const HPWidth = HPRingLineWidth * this.CurrentScaleFactor;
        const LengthMaxSide = (this.EnemyWidth > this.EnemyHeight) ? this.EnemyWidth : this.EnemyHeight;
        const HPRadius = LengthMaxSide * 0.7;
        const CurrentHpPercentage = this.NowHP / this.MaxHP;
        const StartAngle = -Math.PI / 2; // 12時の方向
        const EndAngleCurrentHp = StartAngle + (CurrentHpPercentage * (Math.PI * 2));

        // --- 2. 各パーツを再描画 ---
        // 描画前に一度クリア
        this.HpBarBackground.clear();
        this.HpBarFill.clear();
        this.HpLimitMarker.clear();
        this.HpBarBorders.clear();

        // 2-1. HPバーの背景 (常に全周を描画)
        this.HpBarBackground.lineStyle({
            width: HPWidth,
            color: 0x251A1A, // 'rgba(37, 26, 26, 0.6)'
            alpha: 0.6,
            cap: PIXI.LINE_CAP.ROUND
        });


        this.HpBarBackground.arc(CenterX, CenterY, HPRadius, 0, Math.PI * 2);

        // 2-2. 現在のHPゲージ
        if (CurrentHpPercentage > 0) {
            // HP割合に応じて色を決定
            const fillColor = CurrentHpPercentage > 0.5 ? 0x00FF00 : CurrentHpPercentage > 0.25 ? 0xFFFF00 : 0xFF0000;
            this.HpBarFill.lineStyle({
                width: HPWidth,
                color: fillColor, // 色を動的に変更
                alpha: 0.8,
                cap: PIXI.LINE_CAP.ROUND
            });
            this.HpBarFill.arc(CenterX, CenterY, HPRadius, StartAngle, EndAngleCurrentHp);
        }
    
        // 2-3. リミットブレイク位置のマーカー
        if (this.ELimitBreakPoint < CurrentHpPercentage) {
            const LimitBreakAngle = StartAngle + (this.ELimitBreakPoint * (Math.PI * 2));
            const HpLimitBreakMarkerAngularWidthRad = 1 * (Math.PI / 180);
            const MarkerStartAngle = LimitBreakAngle - (HpLimitBreakMarkerAngularWidthRad / 2);
            const MarkerEndAngle = LimitBreakAngle + (HpLimitBreakMarkerAngularWidthRad / 2);

            this.HpLimitMarker.lineStyle({
                width: HPWidth,
                color: 0x00FF00, // 緑色
                alpha: 0.6,
                cap: PIXI.LINE_CAP.ROUND
            });
            this.HpLimitMarker.arc(CenterX, CenterY, HPRadius, MarkerStartAngle, MarkerEndAngle);
        }

        // 2-4. 内側と外側の枠線
        this.HpBarBorders.lineStyle({
            width: 1 * this.CurrentScaleFactor,
            color: 0x2C2B2B, // 'rgba(44, 43, 43, 0.6)'
            alpha: 0.6
        });
        this.HpBarBorders.arc(CenterX, CenterY, HPRadius - HPWidth / 2, 0, Math.PI * 2); // 内側の枠
        this.HpBarBorders.arc(CenterX, CenterY, HPRadius + HPWidth / 2, 0, Math.PI * 2); // 外側の枠
    }

    /**
 	 * ダメージを受けた時の処理
     * @param amount - 受けたダメージの総量
	 */
    takeDamage(amount) {
        this.NowHP -= amount;
        if (this.NowHP < 0) this.NowHP = 0;
        // (オプション) ダメージエフェクトやヒット時処理
    }

    /**
 	 * 攻撃終了を判定する
     * @param NowAttack - 今の経過時間
     * @param AttackLimitTh - 攻撃最大時間
     * @param NextState - 次のアタックシーケンス
	 */
    isAttackendfuc(NowAttack, AttackLimitTh, NextState){
        
        if(NowAttack > AttackLimitTh){
                    
            // 次のアタックシーケンスに移行させる
            this.AttackState = NextState;
            this.SkillActiveFlag = false;
            // カウンタをリセット
            this.NowAttackLimitCnt = 0;

            // 攻撃終了にあたり，攻撃の間隔タイマもりセット
            this.NowAttackWatingTime = this.AttackWatingTime;

            // 攻撃汎用カウンタも削除
            this.AttackCounter = 0;
        }
    }

    /**
     * 画像を読み込み、PixiJSテクスチャを準備する関数
     */
    async LoadScreenAssetsForPixi() {
        // この処理は非同期で行われる
        this.ScreenImages = [];
        this.ScreenImages.push(this.EnemyImageKey);
        this.ScreenTextures=[];

        const FrameKeysToLoad = this.ScreenImages.filter(key => ImageAssetPaths[key]);
        const AssetsToLoadForPixi = FrameKeysToLoad.map(key => ({ alias: key, src: ImageAssetPaths[key] }));
        if (AssetsToLoadForPixi.length > 0) {
            await PIXI.Assets.load(AssetsToLoadForPixi);

            FrameKeysToLoad.forEach(key => {
            const texture = PIXI.Texture.from(key);
            this.ScreenTextures.push(texture);
            });
        }
    }

    /**
	 * キャラが描画範囲内にあるように調整をする
	 */
   IsAreaIn(XPos, YPos) {
        const halfWidth = this.EnemyImage.width / 2;
        const halfHeight = this.EnemyImage.height / 2;

        // 正しいX座標の境界（左端と右端）を計算
        const minX = this.StartAreaX + halfWidth;
        const maxX = this.StartAreaX + this.NowPlayAreaWidth - halfWidth;

        // 正しいY座標の境界（上端と下端）を計算
        const minY = this.StartAreaY + halfHeight;
        const maxY = this.StartAreaY + this.NowPlayAreaHeight - halfHeight;

        // プレイヤーの座標(XPos, YPos)を、計算した境界内に収める
        const AreaXPos = Math.max(minX, Math.min(XPos, maxX));
        const AreaYPos = Math.max(minY, Math.min(YPos, maxY));
        return {AreaXPos, AreaYPos};
    }

    /**
     * HPバーの描画に必要なPIXI.Graphicsオブジェクトを初期化し、コンテナに追加する
     * このメソッドはインスタンス生成時に一度だけ呼び出す
     */
    InitializeHpBar() {
        this.HpBarBackground = new PIXI.Graphics();
        this.HpBarFill = new PIXI.Graphics();
        this.HpLimitMarker = new PIXI.Graphics();
        this.HhpBarBorders = new PIXI.Graphics();

        // 描画順序を考慮してコンテナに追加（後に追加したものが手前に表示される）
        this.EnemyContainer.addChild(this.HpBarBackground);
        this.EnemyContainer.addChild(this.HpBarFill);
        this.EnemyContainer.addChild(this.HpLimitMarker);
        this.EnemyContainer.addChild(this.HpBarBorders);
    }
}