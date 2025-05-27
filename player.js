// ==================================================================
// ★★★ プレイヤー クラスの定義 ★★★
// ==================================================================
import { Bullet_PRAYER } from './bullet_prayer.js'; // Bulletクラスもインポート
import { GAME_STATUS } from './game_status.js'; // Bulletクラスもインポート


// 画像の初期化を行う


export class Player {

    // 初期のx座標
    // 初期のy座標
    // canvas キャンパス
    // charactername キャラネーム
    // image_list  初期化した画像のリスト   
    // options その他設定値   
    constructor(character_type, asset_manager, canvas)
    {

        // 初期値は中央
        this.x = (this.canvas.width/2); // Playerの位置X
        this.y = (this.canvas.width/2); // Playerの位置Y
        
        this.canvas = canvas; // canvasオブジェクト
        this.character_type = character_type; // 例: CharacterTypeEnum.TYPE_1 の「値」("Type1")
        this.asset_manager = asset_manager;   // 画像などのアセットを管理

        // game_state.js からキャラクターの基本データを取得
        const stats = characterInfoList[this.characterType];

        if (!stats) {
            console.error(`リスト外が入った要確認`);
        } else {
            // 固定値で入れているのでエラーチェックは行わない
            this.radius = stats.character_radius;
            this.baseSpeed = stats.baseSpeed || 300;
            this.maxHp = stats.maxHp || 100;
            this.color = options.color || stats.color || 'skyblue'; // optionsで上書き可能、なければstats、それもなければデフォルト
            this.avatarImageKey = stats.avatar_image_key;
            this.mainBulletDefineKey = stats.mainBulletKeys ? stats.mainBulletKeys[0] : null; // 例: 最初のメイン弾
            this.subBulletDefineKeys = stats.subBulletKeys || [];
            this.skillKey = stats.skillKey;
            this.ultKey = stats.ultKey;
        }
        this.hp = this.maxHp;

        
        this.charactername = charactername; // // キャラクターネーム
        this.avatar = 
    }

    // ブラウザの解像度比に合わせて動作を変える
    updateScale(newScaleFactor, newCanvas)
    {
        // 以前のスケールに対する現在の相対位置を計算
        
        const relativeX = this.x / (this.canvas.width || BASE_WIDTH); // 0除算を避ける
        const relativeY = this.y / (this.canvas.height || BASE_HEIGHT);

        this.currentScaleFactor = newScaleFactor;
        this.canvas = newCanvas; // 新しいcanvasの参照（主にwidth/height）

        // 新しいcanvasサイズに基づいて位置を再設定
        this.x = relativeX * this.canvas.width;
        this.y = relativeY * this.canvas.height;

        // 境界チェックなどで位置を補正
        this.x = Math.max(0, Math.min(this.x, this.canvas.width - this.getScaledWidth()));
        this.y = Math.max(0, Math.min(this.y, this.canvas.height - this.getScaledHeight()));

        // 横幅も変更する
        this.radius = this.radius * this.currentScaleFactor;

        // スピードも変更する
        this.speed = this.speed * this.currentScaleFactor;
    }

    // プレイヤーの移動ロジック
    move(keys, deltaTime) {

        this.dx = 0;
        this.dy = 0;
        if (keys.ArrowUp && this.y > 0) this.dy = -1;
        else if (keys.ArrowDown && this.y < this.canvas.height - this.getScaledHeight()) this.dy = 1;
        if (keys.ArrowLeft && this.x > 0) this.dx = -1;
        else if (keys.ArrowRight && this.x < this.canvas.width - this.getScaledWidth()) this.dx = 1;

        const magnitude = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
        let moveX = 0;
        let moveY = 0;
        if (magnitude > 0) {
            moveX = (this.dx / magnitude) * this.speed * deltaTime;
            moveY = (this.dy / magnitude) * this.speed * deltaTime;
        }

        this.x += moveX;
        this.y += moveY;

        // 境界からはみ出ないように最終調整
        this.x = Math.max(0, Math.min(this.x, this.canvas.width - this.radius));
        this.y = Math.max(0, Math.min(this.y, this.canvas.height - this.radius));

        if (this.bulletCooldownTimer > 0) {
            this.bulletCooldownTimer -= deltaTime; // タイマーも deltaTime で減算
            if (this.bulletCooldownTimer < 0) this.bulletCooldownTimer = 0;
        }
    }


    // 打つ弾のスペックを決定する
    character_ballet_type(charactername)
    {
        bullet_instance = [];
        const startX = this.x + this.canvas.width / 2;
        const startY = this.y;
        switch(charactername)
        {
            case characters_Type.characters_Type1:
                // 真上に丸型の弾を発射
                const bulletOptions_main = {
                vy: -2000, 
                vx: 0,
                isCircle: true,
                color: 'rgb(255, 255, 255)',
                damage: 25,
                life: 5,
                maxSpeed: 10000,
                size: 1.0
                };
                bullet_type_main = Bullet_PRAYER.bullet_Type1;

                // 上85度方向に丸型の小型の玉を発射
                const bulletOptions_sub = {
                vy: -2000, 
                vx: 30,
                isCircle: true,
                color: 'rgb(255, 255, 255)',
                damage: 10,
                life: 2,
                maxSpeed: 10000,
                size: 0.5
                };

                 // 反対側
                const bulletOptions_sub_otherside = {
                vy: -2000, 
                vx: -30,
                isCircle: true,
                color: 'rgb(255, 255, 255)',
                damage: 10,
                life: 2,
                maxSpeed: 10000,
                size: 0.5
                };

                bullet_type_sub = Bullet_PRAYER.bullet_Type1;
                
                // return用の配列にpushする
                bullet_instance.push(new BulletClass(startX, startY, bullet_type_main, bulletOptions_main));
                bullet_instance.push(new BulletClass(startX, startY, bullet_type_main, bulletOptions_sub));
                bullet_instance.push(new BulletClass(startX, startY, bullet_type_main, bulletOptions_sub_otherside));
                break;
        }
    }


    shoot(playerBulletsArray, BulletClass, enemyInstance, deltaTime) {

        if (this.hp <= 0 || this.bulletCooldownTimer > 0) return;


        // 今同時に出している弾数の数だけインスタンスを生成する

        const scaledBulletWidth = this.getScaledBulletWidth();
        const scaledBulletHeight = this.getScaledBulletHeight();
        const startX = this.x + this.getScaledWidth() / 2;
        const startY = this.y;


        if (this.bulletTimer > 0) { // クールダウン中かチェック
            this.bulletTimer -= deltaTime; // クールダウンタイマーを減算
            if (this.bulletTimer < 0) this.bulletTimer = 0;
            return;
        }
        this.bulletTimer = this.bulletInterval; // クールダウン再セット

        const bulletOptions = {
            vy: -this.getScaledBulletSpeedY(), 
            vx: this.getScaledBulletSpeedX(),
            width: scaledBulletWidth, height: scaledBulletHeight, isCircle: false,
            color: this.bulletColor, damage: this.bulletDamage, life: this.bulletHP,
            maxSpeed: this.getScaledBulletSpeedY(),
            target: enemyInstance, // 追尾する場合
            trackingStrength: 0.0 // 0なら追尾しない。追尾させる場合は0より大きい値
};
        // BulletClass を使ってインスタンス化
        playerBulletsArray.push(new BulletClass(startX, startY - this.bulletHeight / 2, bulletOptions));
        this.bulletCooldownTimer = this.bulletCooldown;
    }

    // プレイヤーの描画ロジック
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    // プレイヤーのHPバー描画ロジック
    drawHpBar(ctx, scaledHpBarHeight, scaledPlayerHpBarWidth) {
        const barX = 10 * this.currentScaleFactor;
        const barY = this.canvas.height - scaledHpBarHeight - (10 * this.currentScaleFactor);
        const currentHpWidth = this.maxHp > 0 ? (this.hp / this.maxHp) * scaledPlayerHpBarWidth : 0;

        ctx.fillStyle = 'grey';
        ctx.fillRect(barX, barY, scaledPlayerHpBarWidth, scaledHpBarHeight);
        ctx.fillStyle = (this.maxHp > 0 && this.hp / this.maxHp < 0.3) ? 'red' : 'green';
        ctx.fillRect(barX, barY, currentHpWidth > 0 ? currentHpWidth : 0, scaledHpBarHeight);
        ctx.strokeStyle = 'white';
        ctx.strokeRect(barX, barY, scaledPlayerHpBarWidth, scaledHpBarHeight);

    }
}

