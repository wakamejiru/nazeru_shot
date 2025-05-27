// ==================================================================
// ★★★ Enemy クラスの定義 ★★★
// ==================================================================

export class Enemy {
    constructor(x, y, options = {}) {
		this.x = x;
        this.y = y;
        this.width = options.width !== undefined ? options.width : 40;
        this.height = options.height !== undefined ? options.height : 40;
        this.speed = options.speed !== undefined ? options.speed : 1;
        this.color = options.color !== undefined ? options.color : 'red';
        this.maxHp = options.maxHp !== undefined ? options.maxHp : 500;
        this.hp = this.maxHp;

        // 弾のパラメータ
        this.bulletRadius = options.bulletRadius !== undefined ? options.bulletRadius : 5;
        this.bulletSpeed = options.bulletSpeed !== undefined ? options.bulletSpeed : 2.5;
        this.bulletInterval = options.bulletInterval !== undefined ? options.bulletInterval : 25;
        this.bulletDamage = options.bulletDamage !== undefined ? options.bulletDamage : 15;
        this.bulletColor = options.bulletColor !== undefined ? options.bulletColor : 'yellow';
        this.bulletAngle = 0;
        this.bulletTimer = 0;
        this.bulletSpreadCount = options.bulletSpreadCount !== undefined ? options.bulletSpreadCount : 12;

        // 移動用プロパティ (移動範囲の計算に自身のサイズを使用するため、サイズ設定後に定義)

        // 停止時間（フレーム数）
        this.waitDuration  = options.waitDuration  !== undefined ?  options.waitDuration  : 60; // default 1秒相当（60fps）
        this.waitTimer  = 0;

        // 移動ターゲット座標
        this.targetX = x;
        this.targetY = y;

        this.moveDirectionX = 0;
        this.moveDirectionY = 0;
        this.moveChangeTimer = 0;
        this.moveChangeInterval = options.moveChangeInterval !== undefined ? options.moveChangeInterval : 100;
        this.moveAreaTopY = 0;
        this.moveAreaBottomY = canvas.height / 5 - this.height; //自身のheightを参照
        this.moveAreaLeftX = 0;
        this.moveAreaRightX = canvas.width - this.width; //自身のwidthを参照
		this.setNewTarget(); // 初期状態を指定 
    }

    setNewTarget() {
        this.targetX = this.moveAreaLeftX + Math.random() * (this.moveAreaRightX - this.moveAreaLeftX);
        this.targetY = this.moveAreaTopY + Math.random() * ((this.moveAreaBottomY - this.moveAreaTopY));
    }


    // 敵の移動ロジック
    move() {
        if (this.hp <= 0) return;

        if (this.waitTimer > 0) {
            this.waitTimer--;
            return;
        }
    
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // distance が非常に小さい場合の対処を追加
        if (distance < this.speed) { // 1フレームの移動量より近い場合は到達とみなす
            this.x = this.targetX;
            this.y = this.targetY;
            this.waitTimer = this.waitDuration;
            this.setNewTarget();
            return; // 到達したのでこのフレームの移動処理は終了
        }
    
        // distance が0でないことを保証（上記のif文でほぼカバーされるが念のため）
        if (distance === 0) { // 万が一 distance が厳密に0なら何もしないか、到達処理
            this.waitTimer = this.waitDuration;
            this.setNewTarget();
            return;
        }

        const stepX = (dx / distance) * this.speed;
        const stepY = (dy / distance) * this.speed;
    
        // 座標更新 (元のロジックで問題ないが、上記で到達判定を強化)
        this.x += stepX;

        this.y += stepY;
    }

    // 敵の弾発射ロジック
    shoot() {
        if (this.hp <= 0 || this.bulletTimer > 0) {
            if(this.bulletTimer > 0) this.bulletTimer--;
            return;
        }
        this.bulletTimer = this.bulletInterval;

        const startX = this.x + this.width / 2;
        const startY = this.y + this.height / 2;

        // --- 発射パターンの例 ---
        const shootPattern = "default_spread"; // "default_spread", "fan_shot", "single_targeted" など切り替え可能に

        if (shootPattern === "default_spread") { // 現在の花火状（全方位）
            const angleStep = (Math.PI * 2) / this.bulletSpreadCount;
            for (let i = 0; i < this.bulletSpreadCount; i++) {
                const angle = this.bulletAngle + i * angleStep;
                const bulletOptions = {
                    vx: Math.cos(angle) * this.bulletSpeed,
                    vy: Math.sin(angle) * this.bulletSpeed,
                    ax: 0.01, // 例: 初期X加速度
    				ay: 0,    // 例: 初期Y加速度
    				jx: 0,    // 例: X加加速度 (0ならX加速度は変化しない)
    				jy: 0.001,// 例: Y加加速度 (Y加速度が毎フレーム0.001ずつ増加)
    				radius: this.bulletRadius,
                    isCircle: true,
                    color: this.bulletColor,
                    damage: this.bulletDamage,
                    life: this.bulletHP,
                    maxSpeed: this.bulletSpeed
                };
                bullets.push(new Bullet(startX, startY, bulletOptions));
            }
            this.bulletAngle += Math.PI / 36; // 全体の発射角度を少しずつ回転
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
    draw() {
        if (this.hp <= 0) return; // HP0なら描画しない
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    // 敵のHPバー描画ロジック
    drawHpBar() {
        if (this.hp <= 0 && this.maxHp <=0) return; // HP0の敵はバー表示しない (maxHp <=0 は初期化失敗など考慮)
        const barX = 0;
        const barY = 0;
        const barWidth = canvas.width;
        const currentHpWidth = (this.hp / this.maxHp) * barWidth;
        ctx.fillStyle = '#500000';
        ctx.fillRect(barX, barY, barWidth, HP_BAR_HEIGHT);
        ctx.fillStyle = 'red';
        ctx.fillRect(barX, barY, currentHpWidth > 0 ? currentHpWidth : 0, HP_BAR_HEIGHT);
    }
}
