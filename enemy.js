import { Bullet } from './bullet.js'; // Bulletクラスもインポート
import { enemy_info_list, enemys_skill_list, EnemySkillTypeEnum, EnemyUltTypeEnum, EnemyTypeEnum} from './game_status.js'; // Bulletクラスもインポート



// ==================================================================
// ★★★ Enemy クラスの定義 ★★★
// ==================================================================
// こちらはラクダのこぶで作成する(コーディングルール)


export class Enemy {
    constructor(InitialX, InitialY, EnemyType, AssetManager, Canvas) {

        this.Canvas = Canvas
        this.x = InitialX !== undefined ? InitialX:(this.Canvas.width/2);
        this.y = InitialY !== undefined ? InitialY:(this.Canvas.height/2);

        this.EnemyType = EnemyType;
        this.AssetManager = AssetManager;

        // gamestatusからEnemyの情報を取得する
        const status = enemy_info_list[this.EnemyType];
        if (!status) {			
            console.error(`Enemy Constructor: Enemy type "${this.EnemyType}" not found. Using defaults.`);
        } else {
            this.EnemyName = status.enemy_name;
            this.EnemyImageKey = status.enemy_image_key;
            this.BaseEnemyHitpointRadius = status.enemy_hitpoint_radius;
            this.EnemyHitpointRadius = status.BaseEnemyHitpointRadius;

            this.BaseEnemyWidth = status.enemy_width;
            this.EnemyWidth = this.BaseEnemyWidth;

            this.BaseEnemyHeight = status.enemy_height;
            this.EnemyHeight = this.BaseEnemyHeight;

            this.BaseEnemySpeed = status.enemy_speed;
            this.EnemySpeed = this.BaseEnemySpeed;

            this.EnemyMaxHP = status.enemy_maxhp;
            this.EnemyMag = status.enemy_mag;
            this.EnemyUltType = status.e_ult_type;
            this.ELimitBreakPoint = status.e_limit_break_point;
        }

        // アバター画像（スプライト）を設定
		this.spriteEnemy = this.EnemyImageKey ? this.AssetManager.getImage(this.EnemyImageKey) : null;
		if (this.EnemyImageKey && !this.spriteEnemy) {
			console.warn(`Enemy sprite for key "${this.EnemyImageKey}" not loaded. Fallback color will be used.`);
		}

        this.hp = this.EnemyMaxHP;
        
        // 移動用プロパティ
        this.moveAreaTopY = this.EnemyHeight/2;
        this.moveAreaBottomY = this.Canvas.height / 3 - this.EnemyHeight/2;
        this.moveAreaLeftX = this.EnemyWidth/2;
        this.moveAreaRightX = this.Canvas.width - this.EnemyWidth/2;

        this.waitTimer = 2.0; // 停止時間
        this.waitDuration = this.waitTimer;

        // スキルの発動感覚時間
        this.SkillWaitTimer = 1.5; // 難易度依存(E:1.5, N;0.5, H:0)
        this.waitDuration = this.SkillWaitTimer;

        // 初期化ここまで

        // 移動ターゲット座標 (初期値は自身の位置)
        this.targetX = this.x;
        this.targetY = this.y;

        this.skillorUltDoing = false;

    }

    // ブラウザの解像度比に合わせて動作を変える
    updateScale(newScaleFactor, newCanvas, gameBaseWidth, gameBaseHeight) { // ★ 引数に gameBaseWidth, gameBaseHeight を追加
        // 更新前の有効なキャンバスサイズを取得 (0の場合はフォールバックとして基準解像度を使用)
        const oldEffectiveCanvasWidth = this.Canvas.width || gameBaseWidth;
        const oldEffectiveCanvasHeight = this.Canvas.height || gameBaseHeight;

        // 現在の位置の相対的な割合を計算
        const relativeX = this.x / oldEffectiveCanvasWidth;
        const relativeY = this.y / oldEffectiveCanvasHeight;

        // ★ 現在のターゲット位置の相対的な割合も計算
        const relativeTargetX = this.targetX / oldEffectiveCanvasWidth;
        const relativeTargetY = this.targetY / oldEffectiveCanvasHeight;

        // スケールとキャンバス参照を更新
        this.currentScaleFactor = newScaleFactor;
        this.Canvas = newCanvas;

        // Enemyの基本サイズと速度をスケールに合わせて更新
        this.EnemyWidth = this.BaseEnemyWidth * newScaleFactor;
        this.EnemyHeight = this.BaseEnemyHeight * newScaleFactor;
        this.EnemySpeed = this.BaseEnemySpeed * newScaleFactor;
        this.EnemyHitpointRadius = this.BaseEnemyHitpointRadius * newScaleFactor; // ヒットポイント半径もスケール

        // 新しいキャンバスサイズとスケールに基づいて自身の位置を再設定
        this.x = relativeX * this.Canvas.width;
        this.y = relativeY * this.Canvas.height;

        // ★ 新しいキャンバスサイズとスケールに基づいてターゲット位置を再設定
        this.targetX = relativeTargetX * this.Canvas.width;
        this.targetY = relativeTargetY * this.Canvas.height;

        // ----- 自身の位置を境界内にクランプ (中心座標基準) -----
        this.x = Math.max(
            this.EnemyWidth / 2,
            Math.min(this.x, this.Canvas.width - this.EnemyWidth / 2)
        );
        this.y = Math.max(
            this.EnemyHeight / 2,
            Math.min(this.y, this.Canvas.height - this.EnemyHeight / 2)
        );

        // ----- 新しい移動範囲を計算 (setNewTarget と同様のロジック) -----
        const currentMoveAreaTopY = this.EnemyHeight / 2;
        const currentMoveAreaBottomY = Math.max(currentMoveAreaTopY, this.Canvas.height / 3 - (this.EnemyHeight / 2));
        const currentMoveAreaLeftX = this.EnemyWidth / 2;
        const currentMoveAreaRightX = Math.max(currentMoveAreaLeftX, this.Canvas.width - (this.EnemyWidth / 2));

        // ----- スケーリングされたターゲット位置を新しい移動範囲内にクランプ -----
        this.targetX = Math.max(
            currentMoveAreaLeftX,
            Math.min(this.targetX, currentMoveAreaRightX)
        );
        this.targetY = Math.max(
            currentMoveAreaTopY,
            Math.min(this.targetY, currentMoveAreaBottomY)
        );
    }

    setNewTarget() {
        // 移動範囲の再計算 (this.EnemyHeight, this.EnemyWidth はスケール済み)
        this.moveAreaTopY = this.EnemyHeight / 2;
        this.moveAreaBottomY = this.Canvas.height / 3 - (this.EnemyHeight / 2);
        this.moveAreaLeftX = this.EnemyWidth / 2;
        this.moveAreaRightX = this.Canvas.width - (this.EnemyWidth / 2);

        // ★ Y座標の下限が上限より小さくならないように調整
        const effectiveMoveAreaBottomY = Math.max(this.moveAreaTopY, this.moveAreaBottomY);

        // X座標のターゲット設定 (移動範囲がない場合は中央に)
        const randomXRange = this.moveAreaRightX - this.moveAreaLeftX;
        if (randomXRange <= 0) { // 等号も含む (範囲が0の場合)
            this.targetX = this.Canvas.width / 2;
        } else {
            this.targetX = this.moveAreaLeftX + Math.random() * randomXRange;
        }

        // Y座標のターゲット設定
        const randomYRange = effectiveMoveAreaBottomY - this.moveAreaTopY;
        if (randomYRange <= 0) { // 等号も含む (範囲が0の場合)
            this.targetY = this.moveAreaTopY; // 範囲がない場合は上限値に設定
        } else {
            this.targetY = this.moveAreaTopY + Math.random() * randomYRange;
        }
    }


    // 敵の移動ロジック
    move(deltaTime) {
        if (this.hp <= 0) return;
        
        if (this.waitTimer > 0) {
            this.waitTimer -= deltaTime;
            if (this.waitTimer < 0)
                {
                    this.waitTimer = 0;
                    this.setNewTarget();
                } 
            return;
        }

        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < (this.EnemySpeed * deltaTime) || distance === 0) { // 1フレームの移動量より近いか、既に到達
            this.x = this.targetX;
            this.y = this.targetY;
            this.waitTimer = this.waitDuration;
            return;
        }

        const moveX = (dx / distance) * this.EnemySpeed * deltaTime;
        const moveY = (dy / distance) * this.EnemySpeed * deltaTime;

        this.x += moveX;
        this.y += moveY;

        // ★ 移動後に座標をクランプ (境界を超えないように)
        this.x = Math.max(this.moveAreaLeftX, Math.min(this.x, this.moveAreaRightX));
        this.y = Math.max(this.moveAreaTopY, Math.min(this.y, this.moveAreaBottomY));
    }

     shoot(enemyBulletsArray, playerInstance, deltaTime) { // deltaTime は直接使わないが、クールダウンはdeltaTimeで管理
        if (this.hp <= 0) return;

        // 発射はスキルで発射されるようなシステムにする
          if (this.SkillWaitTimer > 0) {
            this.SkillWaitTimer -= deltaTime;
            if (this.SkillWaitTimer < 0)
                {
                    this.waitTimer = 0; // スキルの待ち時間はスキル発動時の有効タイミングで行う
                    this.setNewTarget();
                } 
            return;
        }

        // スキルの発動を行う






        // if (this.bulletTimer > 0) { // ★ クールダウン中かチェック
        //     this.bulletTimer -= deltaTime; // ★ クールダウンタイマーを減算
        //     if (this.bulletTimer < 0) this.bulletTimer = 0;
        //     return;
        // }
        // this.bulletTimer = this.bulletInterval; // ★ クールダウン再セット

        // const startX = this.x + this.width / 2;
        // const startY = this.y + this.height / 2;
        // const shootPattern = "default_spread"; // 将来的に変更可能

        // if (shootPattern === "default_spread") {
        //     const angleStep = (Math.PI * 2) / this.bulletSpreadCount;
        //     for (let i = 0; i < this.bulletSpreadCount; i++) {
        //         const angle = this.bulletAngle + i * angleStep;
        //         const bulletOptions = {
        //             vx: Math.cos(angle) * this.bulletSpeed, // ピクセル/秒
        //             vy: Math.sin(angle) * this.bulletSpeed, // ピクセル/秒
        //             radius: this.bulletRadius,
        //             isCircle: true,
        //             color: this.bulletColor,
        //             damage: this.bulletDamage,
        //             life: this.bulletHP,
        //             maxSpeed: this.bulletSpeed,
        //             // ax, ay, jx, jy なども必要ならここで設定
        //             target: playerInstance, // 追尾する場合
        //             trackingStrength: 0.0 // 0なら追尾しない。追尾させる場合は0より大きい値
        //         };
        //         enemyBulletsArray.push(new BulletClass(startX, startY, bulletOptions));
        //     }
        //     this.bulletAngle += (Math.PI / 180) * 200 * deltaTime; // 例: 1秒間に200度回転
        // }
        // // --- ここから将来的な拡張のための発射パターン例 (コメントアウト) ---
        // /*
        // else if (shootPattern === "fan_shot") { // 扇形発射
        //     const numBulletsInFan = this.bulletSpreadCount > 1 ? this.bulletSpreadCount : 5; // 扇の弾数
        //     const baseAngle = Math.atan2(player.y + player.height/2 - startY, player.x + player.width/2 - startX); // プレイヤーへの角度を基準
        //     const angleStep = this.fanAngleRange / (numBulletsInFan -1 );
        //     const startAngle = baseAngle - this.fanAngleRange / 2;

        //     for (let i = 0; i < numBulletsInFan; i++) {
        //         const angle = (numBulletsInFan === 1) ? baseAngle : startAngle + i * angleStep; // 1発なら中央へ
        //         const bulletOptions = {
        //             vx: Math.cos(angle) * this.bulletSpeed,
        //             vy: Math.sin(angle) * this.bulletSpeed,
        //             radius: this.bulletRadius, isCircle: true, color: this.bulletColor,
        //             damage: this.bulletDamage, life: this.bulletHP, maxSpeed: this.bulletSpeed
        //         };
        //         bullets.push(new Bullet(startX, startY, bulletOptions));
        //     }
        // }
        // else if (shootPattern === "single_targeted") { // 単発自機狙い弾 (追尾オプション付き)
        //     const angleToPlayer = Math.atan2(player.y + player.height/2 - startY, player.x + player.width/2 - startX);
        //     const bulletOptions = {
        //         vx: Math.cos(angleToPlayer) * this.bulletSpeed,
        //         vy: Math.sin(angleToPlayer) * this.bulletSpeed,
        //         radius: this.bulletRadius, isCircle: true, color: 'orange', // 色を変えてみる
        //         damage: this.bulletDamage, life: this.bulletHP, maxSpeed: this.bulletSpeed,
        //         target: player, // プレイヤーを追尾対象に設定
        //         trackingStrength: 0.5 // 追尾の強さ (0に近いほど弱い、1くらいでも結構追う)
        //     };
        //     bullets.push(new Bullet(startX, startY, bulletOptions));
        // }
        // */
    }

    // 敵の描画ロジック
    draw(ctx) {
        
        if (this.hp <= 0) return; // HP0なら描画しない		
        const scaledDrawWidth = this.EnemyWidth; // 描画用のスケーリングされた幅
        const scaledDrawHeight = this.EnemyHeight; // 描画用のスケーリングされた高さ	
		
		// 中心描画に変更
		const EnemyDrawX = this.x - scaledDrawWidth / 2;
        const EnemyDrawY = this.y - scaledDrawHeight / 2;
		
        // アバターを書く 
        ctx.drawImage(this.spriteEnemy, EnemyDrawX, EnemyDrawY, scaledDrawWidth, scaledDrawHeight);
    }

    // 敵のHPバー描画ロジック
    drawHpBar(ctx, HP_BAR_HEIGHT_PARAM) {
        if (this.hp <= 0 && (!this.maxHp || this.maxHp <=0)) return;
        const barX = 0;
        const barY = 0;
        const barWidth = this.Canvas.width;
        const currentHpPercentage = this.maxHp > 0 ? (this.hp / this.maxHp) : 0;
        const currentHpWidth = currentHpPercentage * barWidth;

        ctx.fillStyle = '#500000';
        ctx.fillRect(barX, barY, barWidth, HP_BAR_HEIGHT_PARAM);
        ctx.fillStyle = 'red';
        ctx.fillRect(barX, barY, currentHpWidth > 0 ? currentHpWidth : 0, HP_BAR_HEIGHT_PARAM);
    }
}
