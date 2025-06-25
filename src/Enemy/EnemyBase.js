// EnemyBase.js
import { Bullet, ChangeActivation } from '../bullet.js'; 
import { ImageAssetPaths, main_bulled_info_list, sub_bulled_info_list, EnemyTypeEnum, EnemySkillTypeEnum } from '../game_status.js';

const SKILL_TIMER_MAX = 99;

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

        this.CurrentScaleFactor = 1.0;

        this.EnemyConfigBase = EnemyConfig;


        this.EnemyTypeID = EnemyConfig.ETypeTypeID; // 識別用
        this.EnemyName = EnemyConfig.enemy_name;

        this.EnemyImageKey = EnemyConfig.enemy_image_key;
        
        this.EnemyWidth = this.EnemyConfigBase.enemy_width;
        this.EnemyHeight =  this.EnemyConfigBase.enemy_height;
        this.EnemySpeed = this.EnemyConfigBase.enemy_speed;
        this.EnemyHitPointRadius = this.EnemyConfigBase.enemy_hitpoint_radius;
        
        this.MaxHP = EnemyConfig.enemy_maxhp;

        this.MaxEnemyHPGuage = EnemyConfig.enemy_hp_guage;
        this.NowEnemyHPGuage = EnemyConfig.enemy_hp_guage;
        this.EnemyPlayULT = EnemyConfig.enemy_play_ult;
        this.MaxHPGuageHP = this.MaxHP / this.MaxEnemyHPGuage;
        this.NowHPGuageHP = this.MaxHPGuageHP;
        // スペルの発動条件
        this.ELimitBreakPoint = EnemyConfig.e_limit_break_point;

 
        // 弾の発射レートの管理用タイマ
        this.AttackRateTimer = 0;
        this.NowAttackRateTimer = 0;
        this.AttackCounter = 0; // 通常攻撃汎用カウンタ

        this.EnemyContainer = new PIXI.Container();
        GameScreenContainer.addChild(this.EnemyContainer);

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
        this.AttackState = 5;
        this.AttackVariation = EnemyConfig.attack_variation;
        this.SkillActiveFlag = false;

        this.CanMoveFlag = true; // trueの時は移動OK,false時は移動不可
            
        this.NowAttackLimitCnt = 0; // 攻撃の継続時間の情報 

        this.HpBarBackground = null;
        this.HpBarFill = null;
        this.HpBarLimit = null;

        // Skill発動条件を起動
        this.IsSkillTextShown = false;
        this.SkillActivate = false;
        this.EndSkill = false;
        this.SkillTimer = SKILL_TIMER_MAX;
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
        this.EnemyContainer.addChild(this.EnemyImage);
        
        // HPバーの初期化メソッドを呼び出す
        this.InitializeHpBar();

        // HPゲージ文字列を追加する
        this.HPGuageTextStyle = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 36,
            fill: '#ffff42',
            align: 'right'
        });
        this.HPGuageText = new PIXI.Text(`HP×${this.NowEnemyHPGuage}`, this.HPGuageTextStyle);
        this.HPGuageText.x = 0;
        this.HPGuageText.y = 0;
        this.HPGuageText.anchor.set(0);
        this.EnemyContainer.addChild(this.HPGuageText);

        // skill名文字列を追加する
        this.SkillTextStyle = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 36,
            fill: '#ffffff',
            align: 'right'
        });
        this.SkillText = new PIXI.Text("Skill1Activate", this.SkillTextStyle);
        this.SkillText.x = 0;
        this.SkillText.y = 0;
        this.SkillText.anchor.set(1,0);
        this.SkillText.visible = false;
        this.SkillText.alpha = 0;
        this.EnemyContainer.addChild(this.SkillText);

         this.SkillTimerTextStyle = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 36, // 少し小さくする
            fill: '#ffffff', // 色を変える
            align: 'right'
        });

        this.SkillTimerText = new PIXI.Text(`${Math.ceil(this.SkillTimer)}`, this.SkillTimerTextStyle);
        this.SkillTimerText.anchor.set(1, 0); // 右上を基準にする
        this.SkillTimerText.visible = false;
        this.SkillTimerText.alpha = 0;
        this.EnemyContainer.addChild(this.SkillTimerText);
    }


    /**
 	 * 大きさを更新する
     * @param {number} NewScaleFactor :新しい画面のスケール
     * @param {number} NewShootingStartX :新しい画面の開始位置
     * @param {number} NewShootingStartY :新しい画面の開始位置
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
        this.EnemyHitpointRadius = this.EnemyConfigBase.enemy_hitpoint_radius * NewScaleFactor;


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

        this.DrawHpBar();
        this.HPGuageText.style.fontSize = this.HPGuageTextStyle.fontSize * NewScaleFactor;
        this.HPGuageText.x = this.StartAreaX;
        this.HPGuageText.y = this.StartAreaY;
        const SKILL_MARGIN_Y = 5;
        this.SkillText.style.fontSize = this.SkillTextStyle.fontSize * NewScaleFactor;
        this.SkillText.x = this.StartAreaX + this.NowPlayAreaWidth; // 右端に設定
        this.SkillText.y = this.StartAreaY + SKILL_MARGIN_Y * NewScaleFactor;
        
        this.SkillTimerText.style.fontSize = this.SkillTimerTextStyle.fontSize * NewScaleFactor;
        this.SkillTimerText.x = this.StartAreaX + this.NowPlayAreaWidth; // 右端に設定
        this.SkillTimerText.y = this.SkillText.y + this.SkillText.style.fontSize + (SKILL_MARGIN_Y * NewScaleFactor);
    }


    /**
 	 * 新しい移動先を決定する
	 */
    setNewTarget() {
        const RandomXRange = this.MoveAreaRightX - this.MoveAreaLeftX;
        this.MoveingTargetX = (RandomXRange <= 0) ? (this.MoveAreaLeftX + this.MoveAreaRightX) / 2 : this.MoveAreaLeftX + Math.random() * RandomXRange;
        
        const RandomYRange = this.MoveAreaBottomY - this.MoveAreaTopY;
        this.MoveingTargetY = (RandomYRange <= 0) ? (this.MoveAreaTopY + this.MoveAreaBottomY) / 2 : this.MoveAreaTopY + Math.random() * RandomYRange;
        // 範囲内の確認を行う
        const PositionXY = this.IsAreaIn(this.MoveingTargetX, this.MoveingTargetY);
        this.MoveingTargetX = PositionXY.AreaXPos; 
        this.MoveingTargetY = PositionXY.AreaYPos;     
    }

    /**
 	 * 移動を行う
	 */
    move(DeltaTime) {
        if (this.NowHP <= 0) return;
        if(!DeltaTime) return;

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

            const Dx = this.MoveingTargetX - this.x;
            const Dy = this.MoveingTargetY - this.y;
            const Distance = Math.sqrt(Dx * Dx + Dy * Dy);

            if (Distance < (this.EnemySpeed * DeltaTime) || Distance < 1.0) { // ほぼ到達
                this.x = this.MoveingTargetX;
                this.y = this.MoveingTargetY;
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
     * @param {number} DeltaTime - 時間
	 */
    _skilrun(DeltaTime)
    {
        const HPPercent = this.NowHPGuageHP / this.MaxHPGuageHP;

        if(this.ELimitBreakPoint > HPPercent){
            
            if( (this.IsSkillTextShown == false) && (this.SkillActivate == false)){
                // Skillを起動する
                this.SkillActivate = true;
            }
        }


        if (this.SkillActivate == true) {
            if (this.SkillTimer > 0) {
                this.SkillTimer -= DeltaTime;
            } else {
                this.SkillTimer = 0;
                this.EndSkill = true; // タイマーが0になったらスキル終了
            }
            // タイマーテキストの内容を毎フレーム更新
            this.SkillTimerText.text = `${Math.ceil(this.SkillTimer)}`;
        


            if(this.EndSkill == true){
               
                // Skillが終了したためHPを消し飛ばす
                this.UpdateEndHPGuage();
            }
        }

    }

    /**
 	 * キャラクターの画像を当たり判定の座標軸と一致させる
	 */
    DrawEnemyImage() {
        if (this.NowHP <= 0 || !this.EnemyImage) return;
        this.EnemyImage.x = this.x;
        this.EnemyImage.y = this.y;
        this.DrawHpBar();
    }

    /**
 	 * キャラクターのHPバーを表示する
	 */
    DrawHpBar() {
        if (this.NowHP <= 0 || !this.MaxHP || this.MaxHP <= 0) {
            return;
        }

        // HPバーの位置を敵の画像の位置に合わせる
        const StartPointX = this.x;
        const StartPointY = this.y;

        // グラフィックの描画は、HPバーオブジェクト自体の中心(0,0)を基準に行う
        const Radius = Math.max(this.EnemyWidth, this.EnemyHeight) * 0.6; // スケールを考慮しない半径
        const HPPercent = this.NowHPGuageHP / this.MaxHPGuageHP;
        const StandardAngle = 0; //-Math.PI / 2;
        const EndAngle = -Math.PI / 2;
        const HPLength = Radius*0.05;

        const StartAngle = (EndAngle) - Math.PI * 2 * HPPercent;

        // --- クリア ---
        this.HpBarBackground.clear();
        this.HpBarFill.clear();
        this.HpBarLimit.clear();
        // --- 背景リング ---
        this.HpBarBackground.beginFill(0x444444, 0); // 塗りつぶしは0
        this.HpBarBackground.lineStyle(HPLength, 0x444444, 0.4);
        this.HpBarBackground.arc(StartPointX, StartPointY, Radius, 0, Math.PI * 2);
        this.HpBarBackground.endFill();

        // --- HPゲージ（全円） ---

        // 残りHPを描画する
        this.HpBarFill.beginFill(0xbf1e33, 0); // 塗りつぶしは0
        this.HpBarFill.lineStyle(HPLength, 0xbf1e33, 0.8);
        this.HpBarFill.arc(StartPointX, StartPointY, Radius, StartAngle, EndAngle);
        this.HpBarFill.endFill();

        // スキル使用範囲を記載
        // スキル条件がまだの場合に書く
        if(this.ELimitBreakPoint < HPPercent){
            const SkillAngle = (EndAngle) - Math.PI * 2 * this.ELimitBreakPoint;
            const MarkerLengthRad = Math.PI / 60; // 例えば、円周の1/60 (3度) の長さ
            this.HpBarLimit.beginFill(0x00B16B, 0); // 塗りつぶしは0
            this.HpBarLimit.lineStyle(HPLength, 0x00B16B, 0.8);
            // 3度開けて書く
            this.HpBarLimit.arc(StartPointX, StartPointY, Radius, SkillAngle - MarkerLengthRad, SkillAngle + MarkerLengthRad);
            this.HpBarLimit.endFill();
        }
        
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
        if(this.EnemyImage){
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
        }else{
            const AreaXPos = XPos;
            const AreaYPos = YPos;
            return {AreaXPos, AreaYPos};
        }
    }

    /**
     * HPバーの描画に必要なPIXI.Graphicsオブジェクトを初期化し、コンテナに追加する
     * このメソッドはインスタンス生成時に一度だけ呼び出す
     */
    InitializeHpBar() {
        this.HpBarContainer = new PIXI.Container();
        this.HpBarBackground = new PIXI.Graphics();
        this.HpBarFill = new PIXI.Graphics();
        this.HpBarLimit = new PIXI.Graphics();

        this.HpBarContainer.addChild(this.HpBarBackground);
        this.HpBarContainer.addChild(this.HpBarFill);
        this.HpBarContainer.addChild(this.HpBarLimit);

        this.EnemyContainer.addChild(this.HpBarContainer);
    }

	/**
     * ダメージヒット処理を行う
	 * @param {number} DamageParam - 受けたダメージ
     */
	DamageHit(DamageParam){
		// ダメージを受けた処理を行う
		this.NowHPGuageHP -= DamageParam;
        if(this.NowHPGuageHP <= 0){
            // 0以下の場合次のゲージに移行
            this.UpdateEndHPGuage();
        }
	}


	/**
     *ゲージを削り切った時の処理を行う
     */
    UpdateEndHPGuage(){
        if(this.SkillActivate == true){
            // フラグをリセット
            this.EndSkill = false;
            this.SkillActivate = false;
            this.IsSkillTextShown = false;
            // スキルテキストを非表示にする
            gsap.to(this.SkillText, {
                    alpha: 0,
                    duration: 0.5,
                    ease: "power1.in",
                    onComplete: () => {
                        this.SkillText.visible = false;
                    }
            });

            // タイマーテキストも非表示にする
            gsap.to(this.SkillTimerText, {
                alpha: 0,
                duration: 0.5,
                ease: "power1.in",
                onComplete: () => {
                    this.SkillTimerText.visible = false;
                }
            });
            // タイマーを初期値に戻す
            this.SkillTimer = SKILL_TIMER_MAX;

            console.log("sゲージ処理");
            this.NowHPGuageHP = this.MaxHPGuageHP;
            --this.NowEnemyHPGuage;
            if(this.NowEnemyHPGuage < 0){
                this.NowEnemyHPGuage = 0;
                // ゲームスクリーンのほうで処理を行う
            }else{
                // HPゲージ本数を更新
                this.HPGuageText.text = `HP×${this.NowEnemyHPGuage}`;
                this.EndSkill = true;
            }
        }
    }

}