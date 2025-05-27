// ==================================================================
// ★★★ Enemy クラスの定義 ★★★
// ==================================================================

export class Enemy {
    constructor(x, y, canvas, options = {}) {
        // ... (Enemyクラスのコンストラクタ内容はそのまま) ...
        this.x = x;
        this.y = y;
        this.width = options.width !== undefined ? options.width : 40;
        this.height = options.height !== undefined ? options.height : 40;
        this.speed = options.speed !== undefined ? options.speed : 1;
        this.color = options.color !== undefined ? options.color : 'red';
        this.maxHp = options.maxHp !== undefined ? options.maxHp : 500;
        this.hp = this.maxHp;
        
        // 弾の性能
        this.bulletRadius = options.bulletRadius !== undefined ? options.bulletRadius : 5;
        this.bulletSpeed = options.bulletSpeed !== undefined ? options.bulletSpeed : 2.5;
        this.bulletInterval = options.bulletInterval !== undefined ? options.bulletInterval : 25;
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
        this.moveChangeInterval = options.moveChangeInterval !== undefined ? options.moveChangeInterval : 100;
        this.moveAreaTopY = 0;
        // ★★★ ここで canvas を使って正しく初期化 ★★★
        this.moveAreaBottomY = canvas.height / 5 - this.height;
        this.moveAreaLeftX = 0;
        this.moveAreaRightX = canvas.width - this.width;
        // ★★★ 初期化ここまで ★★★

        // 停止時間（フレーム数）
        this.waitDuration  = options.waitDuration  !== undefined ?  options.waitDuration  : 60;
        this.waitTimer  = 0;

        // 移動ターゲット座標 (初期値は自身の位置)
        this.targetX = x;
        this.targetY = y;
        this.setNewTarget(canvas); // setNewTargetにもcanvasを渡して初期目標を設定
    }

    setNewTarget(canvas) {
        // 移動範囲の再計算 (canvas.height や自身のサイズに依存するため)
        this.moveAreaBottomY = canvas.height / 5 - this.height;
        this.moveAreaRightX = canvas.width - this.width;
        this.targetX = this.moveAreaLeftX + Math.random() * (this.moveAreaRightX - this.moveAreaLeftX);
        this.targetY = this.moveAreaTopY + Math.random() * ((this.moveAreaBottomY - this.moveAreaTopY));
    }


    // 敵の移動ロジック
    // 依存する外部変数 (canvas, player) はメソッドの引数で受け取る
    move(canvas) {
        if (this.hp <= 0) return;
        
        // 移動範囲の再計算 (canvas.height や自身のサイズに依存するため)
        this.moveAreaBottomY = canvas.height / 5 - this.height;
        this.moveAreaRightX = canvas.width - this.width;

        // ... (Enemyクラスのmoveメソッド内容はそのまま、ただし this.moveArea... の値を使う) ...
        this.moveChangeTimer--;
        if (this.moveChangeTimer <= 0) {
            this.moveDirectionX = Math.floor(Math.random() * 3) - 1;
            this.moveDirectionY = Math.floor(Math.random() * 3) - 1;
            if (this.moveDirectionX === 0 && this.moveDirectionY === 0) {
                if (Math.random() < 0.5) this.moveDirectionX = Math.random() < 0.5 ? -1 : 1;
                else this.moveDirectionY = Math.random() < 0.5 ? -1 : 1;
            }
            this.moveChangeTimer = this.moveChangeInterval;
        }
        let nextX = this.x + this.moveDirectionX * this.speed;
        if (nextX < this.moveAreaLeftX) { nextX = this.moveAreaLeftX; this.moveDirectionX *= -1; this.moveChangeTimer = 0; }
        else if (nextX > this.moveAreaRightX) { nextX = this.moveAreaRightX; this.moveDirectionX *= -1; this.moveChangeTimer = 0; }
        this.x = nextX;
        let nextY = this.y + this.moveDirectionY * this.speed;
        if (nextY < this.moveAreaTopY) { nextY = this.moveAreaTopY; this.moveDirectionY *= -1; this.moveChangeTimer = 0; }
        else if (nextY > this.moveAreaBottomY) { nextY = this.moveAreaBottomY; this.moveDirectionY *= -1; this.moveChangeTimer = 0; }
        this.y = nextY;
    }

    shoot(enemyBulletsArray, BulletClass, playerInstance) { // 依存するものを引数で
        if (this.hp <= 0 || this.bulletTimer > 0) {
            if(this.bulletTimer > 0) this.bulletTimer--;
            return;
        }
        this.bulletTimer = this.bulletInterval;
        const startX = this.x + this.width / 2;
        const startY = this.y + this.height / 2;
        const shootPattern = "default_spread";

        if (shootPattern === "default_spread") {
            const angleStep = (Math.PI * 2) / this.bulletSpreadCount;
            for (let i = 0; i < this.bulletSpreadCount; i++) {
                const angle = this.bulletAngle + i * angleStep;
                const bulletOptions = {
                    vx: Math.cos(angle) * this.bulletSpeed, vy: Math.sin(angle) * this.bulletSpeed,
                    radius: this.bulletRadius, isCircle: true, color: this.bulletColor,
                    damage: this.bulletDamage, life: this.bulletHP, maxSpeed: this.bulletSpeed
                };
                enemyBulletsArray.push(new BulletClass(startX, startY, bulletOptions));
            }
            this.bulletAngle += Math.PI / 36;
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
    drawHpBar(ctx, canvas, HP_BAR_HEIGHT) {
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
