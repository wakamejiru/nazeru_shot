// EnemyBase.js
import { Bullet } from '../bullet.js'; // パスはプロジェクト構成に合わせてください
import { main_bulled_info_list, sub_bulled_info_list, EnemyTypeEnum, EnemySkillTypeEnum } from '../game_status.js';

export class EnemyBase {
    constructor(InitialX, InitialY, AssetManager, ShootingCanvas, EnemyConfig) {
        this.x = InitialX;
        this.y = InitialY;
        this.AssetManager = AssetManager;
        this.Canvas = ShootingCanvas; // ゲームプレイ領域のCanvas
        this.CurrentScaleFactor = 1.0;

        this.EnemyTypeID = EnemyConfig.ETypeTypeID; // 識別用
        this.EnemyName = EnemyConfig.enemy_name;

        this.EnemyImageKey = EnemyConfig.enemy_image_key;
        
        this.BaseEnemyWidth = EnemyConfig.enemy_width;
        this.EnemyWidth = this.BaseEnemyWidth;

        this.BaseEnemyHeight = EnemyConfig.enemy_height;
        this.EnemyHeight = this.BaseEnemyHeight;
        
        this.BaseEnemySpeed = EnemyConfig.enemy_speed;
        this.EnemySpeed = this.BaseEnemySpeed;
        
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


        this.SpriteEnemy = this.EnemyImageKey ? this.AssetManager.getImage(this.EnemyImageKey) : null;
        if (this.EnemyImageKey && !this.SpriteEnemy) {
            console.warn(`Enemy sprite for key "${this.EnemyImageKey}" not loaded.`);
        }

        // 移動AI用
        this.MoveAreaTopY = this.EnemyHeight / 2;
        this.MoveAreaBottomY = this.Canvas.height / 3 - this.EnemyHeight / 2;
        this.MoveAreaLeftX = this.EnemyWidth / 2;
        this.MoveAreaRightX = this.Canvas.width - this.EnemyWidth / 2;

        this.TargetX = this.x;
        this.TargetY = this.y;
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

    }

    // スケールの大きさを変更する
    updateScale(NewScaleFactor, NewGameplayCanvas, BaseGameplayWidth, BaseGameplayHeight) {
        const OldEffectiveGameplayWidth = this.Canvas.width;
        const OldEffectiveGameplayHeight = this.Canvas.height;
        const RelativeX = this.x / OldEffectiveGameplayWidth;
        const RelativeY = this.y / OldEffectiveGameplayHeight;

        const RelativeTargetX = this.TargetX / OldEffectiveGameplayWidth;
        const RelativeTargetY = this.TargetY / OldEffectiveGameplayHeight;

        this.CurrentScaleFactor = NewScaleFactor;
        this.Canvas = NewGameplayCanvas;

        this.EnemyWidth = this.BaseEnemyWidth * NewScaleFactor;
        this.EnemyHeight = this.BaseEnemyHeight * NewScaleFactor;
        this.EnemySpeed = this.BaseEnemySpeed * NewScaleFactor;
        // this.EnemyHitpointRadius = this.BaseEnemyHitpointRadius * newScaleFactor;

        this.x = RelativeX * this.Canvas.width;
        this.y = RelativeY * this.Canvas.height;
        this.TargetX = RelativeTargetX * this.Canvas.width;
        this.TargetY = RelativeTargetY * this.Canvas.height;

        this.x = Math.max(this.EnemyWidth / 2, Math.min(this.x, this.Canvas.width - this.EnemyWidth / 2));
        this.y = Math.max(this.EnemyHeight / 2, Math.min(this.y, this.Canvas.height - this.EnemyHeight / 2));

        // 移動範囲も更新
        this.MoveAreaTopY = this.EnemyHeight / 2;
        this.MoveAreaBottomY = Math.max(this.MoveAreaTopY, this.Canvas.height / 3 - (this.EnemyHeight / 2));
        this.MoveAreaLeftX = this.EnemyWidth / 2;
        this.MoveAreaRightX = Math.max(this.MoveAreaLeftX, this.Canvas.width - (this.EnemyWidth / 2));
        
        this.TargetX = Math.max(this.MoveAreaLeftX, Math.min(this.TargetX, this.MoveAreaRightX));
        this.TargetY = Math.max(this.MoveAreaTopY, Math.min(this.TargetY, this.MoveAreaBottomY));
    }


    // 新しい移動先を指定
    setNewTarget() {
        this.MoveAreaTopY = this.EnemyHeight / 2;
        this.MoveAreaBottomY = Math.max(this.MoveAreaTopY, this.Canvas.height / 3 - (this.EnemyHeight / 2));
        this.MoveAreaLeftX = this.EnemyWidth / 2;
        this.MoveAreaRightX = Math.max(this.MoveAreaLeftX, this.Canvas.width - (this.EnemyWidth / 2));

        const RandomXRange = this.MoveAreaRightX - this.MoveAreaLeftX;
        this.TargetX = (RandomXRange <= 0) ? (this.MoveAreaLeftX + this.MoveAreaRightX) / 2 : this.MoveAreaLeftX + Math.random() * RandomXRange;
        
        const RandomYRange = this.MoveAreaBottomY - this.MoveAreaTopY;
        this.TargetY = (RandomYRange <= 0) ? (this.MoveAreaTopY + this.MoveAreaBottomY) / 2 : this.MoveAreaTopY + Math.random() * RandomYRange;
    }

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

            // 念のため移動後もクランプ
            this.x = Math.max(this.MoveAreaLeftX, Math.min(this.x, this.MoveAreaRightX));
            this.y = Math.max(this.MoveAreaTopY, Math.min(this.y, this.MoveAreaBottomY));
        }
    }

    

    // 弾を打ち出す
    _shoot(BulletArray, TargetPlayer, CurrentTime, DeltaTime) {
        if (this.NowHP <= 0) {
            return;
        }

        // 通常攻撃は3パターン用意
        // 
        // 3パターンのうち
    }

    _skilrun()
    {
        // 一定条件下でスキルを使う
        // HP何割削れたかで決める

    }

    // 描く
    draw(ctx) {
        if (this.NowHP <= 0 || !this.SpriteEnemy) return;
        const DrawX = this.x - this.EnemyWidth / 2;
        const DrawY = this.y - this.EnemyHeight / 2;
        ctx.drawImage(this.SpriteEnemy, DrawX, DrawY, this.EnemyWidth, this.EnemyHeight);
    }

    // HPバーを描く
    drawHpBar(ctx, HPRingLineWidth) { // HP_BAR_HEIGHT_PARAM から変更
        if (this.NowHP <= 0 || !this.MaxHP || this.MaxHP <= 0) return;

        // HPバーを相手のキャラの周囲を円を描くような体力表示に変更
        const CenterX = this.x;
        const CenterY = this.y;

        const HPWidth = HPRingLineWidth * this.CurrentScaleFactor;

        // キャラクターのwidthとheightの長いほうを有効にして
        const LengthMaxSide = (this.EnemyWidth > this.EnemyHeight) ? this.EnemyWidth : this.EnemyHeight;
        const HPRadius = LengthMaxSide * 0.7;

        const CurrentHpPercentage = this.NowHP / this.MaxHP;

        // 円弧の開始角度と終了角度
        const StartAngle = -Math.PI / 2; // 円の上部 (12時の方向)
        const EndAngleFullCircle = StartAngle + (Math.PI * 2); // 背景用の完全な円
        const EndAngleCurrentHp = StartAngle + (CurrentHpPercentage * (Math.PI * 2)); // 現在のHPの割合に応じた角度

        ctx.save();
        ctx.lineCap = 'round';

        // 1. HPバーの背景 (常に描画)
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(37, 26, 26, 0.6)';
        ctx.lineWidth = HPWidth;
        ctx.arc(CenterX, CenterY, HPRadius, 0, Math.PI * 2, false); // 全周
        ctx.stroke();

        // 2. 次に現在のHPを表示する
         if (CurrentHpPercentage > 0) {
            ctx.beginPath();
            
            // ★ HPの割合に応じて前景色を決定
            let CurrentForegroundColor;
                CurrentForegroundColor = 'rgba(255, 0, 0, 0.6)';  // 通常時の色 (赤)

            ctx.strokeStyle = CurrentForegroundColor;
            ctx.lineWidth = HPWidth;
            ctx.arc(CenterX, CenterY, HPRadius, StartAngle, EndAngleCurrentHp, false);
            ctx.stroke();
        }

        // リミット位置に達していない場合表記を行う
        if (this.ELimitBreakPoint < CurrentHpPercentage) {
            const LimitBreakAngle = StartAngle + (this.ELimitBreakPoint * (Math.PI * 2));
            
            
            // HPマーカーの角度幅(Radiusにする)
            const HpLimitBreakMarkerAngularWidthRad = 1 * (Math.PI / 180);
            const MarkerStartAngle = LimitBreakAngle - (HpLimitBreakMarkerAngularWidthRad / 2);
            const MarkerEndAngle = LimitBreakAngle + (HpLimitBreakMarkerAngularWidthRad / 2);

            ctx.beginPath();
            ctx.strokeStyle = 'rgba(0, 255, 0, 0.6)'; // 緑色
            ctx.lineWidth = HPWidth; // HPバーと同じ太さ
            ctx.arc(CenterX, CenterY, HPRadius, MarkerStartAngle, MarkerEndAngle, false);
            ctx.stroke();
        }

        // 背景や枠を書く
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(44, 43, 43, 0.6)';
        ctx.lineWidth = 1 * this.CurrentScaleFactor; // 枠線の太さもスケール
        ctx.arc(CenterX, CenterY, HPRadius - HPWidth / 2, 0, Math.PI * 2, false); // 内側の枠
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(CenterX, CenterY, HPRadius + HPWidth / 2, 0, Math.PI * 2, false); // 外側の枠
        ctx.stroke();

        ctx.restore(); // 保存した描画設定を元に戻す
    }

    // ダメージを受けた時の処理
    takeDamage(amount) {
        this.NowHP -= amount;
        if (this.NowHP < 0) this.NowHP = 0;
        // (オプション) ダメージエフェクトやヒット時処理
    }

    // 攻撃終了フラグを計算する
    // return 次のステイと(攻撃区間が変わっていない間はstateは移動しないようにする)
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
}