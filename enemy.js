// ==================================================================
// ★★★ Enemy クラスの定義 ★★★
// ==================================================================

export class Enemy {
    constructor(x, y, canvas, options = {}) {
        this.x = x;
        this.y = y;
        this.canvas = canvas;
        this.width = options.width !== undefined ? options.width : 40;
        this.height = options.height !== undefined ? options.height : 40;
        this.speed = options.speed !== undefined ? options.speed : 60;
        this.color = options.color !== undefined ? options.color : 'red';
        this.maxHp = options.maxHp !== undefined ? options.maxHp : 500;
        this.hp = this.maxHp;
        
        // 弾の性能
        this.bulletRadius = options.bulletRadius !== undefined ? options.bulletRadius : 5;
        this.bulletSpeed = options.bulletSpeed !== undefined ? options.bulletSpeed : 500;
        this.bulletInterval = options.bulletInterval !== undefined ? options.bulletInterval : 0.4;
        this.bulletDamage = options.bulletDamage !== undefined ? options.bulletDamage : 15;
        this.bulletColor = options.bulletColor !== undefined ? options.bulletColor : 'yellow';
        this.bulletHP = options.bulletHP !== undefined ? options.bulletHP : 1; // 弾の体力
        this.bulletAngle = 0;
        this.bulletTimer = 0;
        this.bulletSpreadCount = options.bulletSpreadCount !== undefined ? options.bulletSpreadCount : 12;

        // 移動用プロパティ
        this.moveDirectionX = 0;
        this.moveDirectionY = 0;
        this.moveChangeTimer = 0;
        this.moveChangeInterval = options.moveChangeInterval !== undefined ? options.moveChangeInterval : 2.0;
        this.moveAreaTopY = 0;
        this.moveAreaBottomY = this.canvas.height / 5 - this.height;
        this.moveAreaLeftX = 0;
        this.moveAreaRightX = this.canvas.width - this.width;
        // 初期化ここまで

        // 停止時間（フレーム数）
        this.waitDuration  = options.waitDuration  !== undefined ?  options.waitDuration  : 2;
        this.waitTimer  = options.waitTimer !== undefined ? options.waitTimer : 1;

        // 移動ターゲット座標 (初期値は自身の位置)
        this.targetX = x;
        this.targetY = y;
        this.setNewTarget(); // setNewTargetにもcanvasを渡して初期目標を設定
    }

    setNewTarget() {
        // 移動範囲の再計算 (canvas.height や自身のサイズに依存するため)
        this.moveAreaBottomY = this.canvas.height / 5 - this.height;
        this.moveAreaRightX = this.canvas.width - this.width;
        this.targetX = this.moveAreaLeftX + Math.random() * (this.moveAreaRightX - this.moveAreaLeftX);
        this.targetY = this.moveAreaTopY + Math.random() * ((this.moveAreaBottomY - this.moveAreaTopY));
    }


    // 敵の移動ロジック
    move(deltaTime) {
        if (this.hp <= 0) return;
        
        if (this.waitTimer > 0) {
            this.waitTimer -= deltaTime;
            if (this.waitTimer < 0) this.waitTimer = 0;
            return;
        }
        this.moveChangeTimer -= deltaTime;
        if (this.moveChangeTimer <= 0) {
            this.setNewTarget();
            this.moveChangeTimer = this.moveChangeInterval;
        }


        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < (this.speed * deltaTime) || distance === 0) { // 1フレームの移動量より近いか、既に到達
            this.x = this.targetX;
            this.y = this.targetY;
            this.waitTimer = this.waitDuration;
            return;
        }

        const moveX = (dx / distance) * this.speed * deltaTime;
        const moveY = (dy / distance) * this.speed * deltaTime;

        this.x += moveX;
        this.y += moveY;
    }

     shoot(enemyBulletsArray, BulletClass, playerInstance, deltaTime) { // deltaTime は直接使わないが、クールダウンはdeltaTimeで管理
        if (this.hp <= 0) return;

        if (this.bulletTimer > 0) { // ★ クールダウン中かチェック
            this.bulletTimer -= deltaTime; // ★ クールダウンタイマーを減算
            if (this.bulletTimer < 0) this.bulletTimer = 0;
            return;
        }
        this.bulletTimer = this.bulletInterval; // ★ クールダウン再セット

        const startX = this.x + this.width / 2;
        const startY = this.y + this.height / 2;
        const shootPattern = "default_spread"; // 将来的に変更可能

        if (shootPattern === "default_spread") {
            const angleStep = (Math.PI * 2) / this.bulletSpreadCount;
            for (let i = 0; i < this.bulletSpreadCount; i++) {
                const angle = this.bulletAngle + i * angleStep;
                const bulletOptions = {
                    vx: Math.cos(angle) * this.bulletSpeed, // ピクセル/秒
                    vy: Math.sin(angle) * this.bulletSpeed, // ピクセル/秒
                    radius: this.bulletRadius,
                    isCircle: true,
                    color: this.bulletColor,
                    damage: this.bulletDamage,
                    life: this.bulletHP,
                    maxSpeed: this.bulletSpeed,
                    // ax, ay, jx, jy なども必要ならここで設定
                    target: playerInstance, // 追尾する場合
                    trackingStrength: 0.0 // 0なら追尾しない。追尾させる場合は0より大きい値
                };
                enemyBulletsArray.push(new BulletClass(startX, startY, bulletOptions));
            }
            this.bulletAngle += (Math.PI / 180) * 200 * deltaTime; // 例: 1秒間に200度回転
        }
        // --- ここから将来的な拡張のための発射パターン例 (コメントアウト) ---
        /*
        else if (shootPattern === "fan_shot") { // 扇形発射
            const numBulletsInFan = this.bulletSpreadCount > 1 ? this.bulletSpreadCount : 5; // 扇の弾数
            const baseAngle = Math.atan2(player.y + player.height/2 - startY, player.x + player.width/2 - startX); // プレイヤーへの角度を基準
            const angleStep = this.fanAngleRange / (numBulletsInFan -1 );
            const startAngle = baseAngle - this.fanAngleRange / 2;

            for (let i = 0; i < numBulletsInFan; i++) {
                const angle = (numBulletsInFan === 1) ? baseAngle : startAngle + i * angleStep; // 1発なら中央へ
                const bulletOptions = {
                    vx: Math.cos(angle) * this.bulletSpeed,
                    vy: Math.sin(angle) * this.bulletSpeed,
                    radius: this.bulletRadius, isCircle: true, color: this.bulletColor,
                    damage: this.bulletDamage, life: this.bulletHP, maxSpeed: this.bulletSpeed
                };
                bullets.push(new Bullet(startX, startY, bulletOptions));
            }
        }
        else if (shootPattern === "single_targeted") { // 単発自機狙い弾 (追尾オプション付き)
            const angleToPlayer = Math.atan2(player.y + player.height/2 - startY, player.x + player.width/2 - startX);
            const bulletOptions = {
                vx: Math.cos(angleToPlayer) * this.bulletSpeed,
                vy: Math.sin(angleToPlayer) * this.bulletSpeed,
                radius: this.bulletRadius, isCircle: true, color: 'orange', // 色を変えてみる
                damage: this.bulletDamage, life: this.bulletHP, maxSpeed: this.bulletSpeed,
                target: player, // プレイヤーを追尾対象に設定
                trackingStrength: 0.5 // 追尾の強さ (0に近いほど弱い、1くらいでも結構追う)
            };
            bullets.push(new Bullet(startX, startY, bulletOptions));
        }
        */
    }

    // 敵の描画ロジック
    draw(ctx) {
        
        if (this.hp <= 0) return; // HP0なら描画しない
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    // 敵のHPバー描画ロジック
    drawHpBar(ctx, HP_BAR_HEIGHT_PARAM) {
        if (this.hp <= 0 && (!this.maxHp || this.maxHp <=0)) return;
        const barX = 0;
        const barY = 0;
        const barWidth = this.canvas.width;
        const currentHpPercentage = this.maxHp > 0 ? (this.hp / this.maxHp) : 0;
        const currentHpWidth = currentHpPercentage * barWidth;

        ctx.fillStyle = '#500000';
        ctx.fillRect(barX, barY, barWidth, HP_BAR_HEIGHT_PARAM);
        ctx.fillStyle = 'red';
        ctx.fillRect(barX, barY, currentHpWidth > 0 ? currentHpWidth : 0, HP_BAR_HEIGHT_PARAM);
    }
}
