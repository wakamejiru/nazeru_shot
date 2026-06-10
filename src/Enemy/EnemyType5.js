// EnemyType5 — ステージ5ボス
// テーマ: 時間
// 通常攻撃: サインカーブ弾 + 停止→全方位飽和
// スペル: 正弦波弾幕 / 移動→飽和爆発 / 蛇行弾
import { EnemyBase } from "./EnemyBase.js";
import { RoundShotFunc, FanShotFunc } from "./EnemyShot.js";
import { Bullet } from '../bullet.js';
import { DifficultyLevel } from "../Screens/BaseScreen.js";
import { enemy_info_list, EnemyTypeEnum } from '../game_status.js';
import { showBurstWarning, showLineWarning, showFanWarning } from '../DangerWarning.js';


const wait = (seconds) => new Promise(resolve => setTimeout(resolve, seconds * 1000));

export class EnemyType5 extends EnemyBase {
    constructor(GameScreenContainer, StartShootingX, StartShootingY, StartShootingWidth, StartShootingHeight) {
        const enemyInfo = enemy_info_list[EnemyTypeEnum.E_TYPE_5];
        const BaseConfig = {
            ...enemyInfo,
            enemy_maxhp: enemyInfo.enemy_maxhp * ((0.6 * DifficultyLevel) + 0.4),
            enemy_hp_guage: (DifficultyLevel < 2) ? 2 : 3,
            ETypeTypeID: EnemyTypeEnum.E_TYPE_5
        };
        super(GameScreenContainer, StartShootingX, StartShootingY, StartShootingWidth, StartShootingHeight, BaseConfig);
        this._attackLoopsStarted = false;

        this.SkillDefinitions = {
            0: {
                name: "正弦「波動砲弾幕」",
                NoMoveFlag: false,
                targetX: () => this.StartAreaX + this.NowPlayAreaWidth * 0.5,
                targetY: () => this.StartAreaY + this.NowPlayAreaHeight * 0.2,
                attackFunction: this.AttackSkill1,
                allowMoveAfter: true
            },
            1: {
                name: "飽和「移動爆発陣」",
                NoMoveFlag: false,
                targetX: () => this.StartAreaX + this.NowPlayAreaWidth * 0.5,
                targetY: () => this.StartAreaY + this.NowPlayAreaHeight * 0.3,
                attackFunction: this.AttackSkill2,
                allowMoveAfter: true
            },
            2: {
                name: "蛇行「千の蛇道」",
                NoMoveFlag: false,
                targetX: () => this.StartAreaX + this.NowPlayAreaWidth * 0.5,
                targetY: () => this.StartAreaY + this.NowPlayAreaHeight * 0.2,
                attackFunction: this.AttackSkill3,
                allowMoveAfter: true
            }
        };
    }

    updateScale(NewScaleFactor, NewShootingStartX, NewShootingStartY, NewShootingWidth, NewShootingHeight) {
        super.updateScale(NewScaleFactor, NewShootingStartX, NewShootingStartY, NewShootingWidth, NewShootingHeight);
    }

    move(DeltaTime) { super.move(DeltaTime); }

    _shoot(EnemyBulletArray, TargetPlayer, DeltaTime) {
        if (this.NowHPGuageHP <= 0) { this._attackLoopsStarted = false; return; }
        if (!this._attackLoopsStarted) {
            this._attackLoopsStarted = true;
            this.pattern1_Loop(EnemyBulletArray, TargetPlayer, 0.5);
            this.pattern2_Loop(EnemyBulletArray, TargetPlayer, 3.0);
        }
    }

    /** サインカーブ弾を自機方向へ */
    async pattern1_Loop(EnemyBulletArray, TargetPlayer, initialDelay) {
        await wait(initialDelay);
        while (this.NowHPGuageHP > 0) {
            const dm = 1.0 + DifficultyLevel * 0.5;
            if (!this.SkillActivate) {
                const n = 5 + Math.floor(DifficultyLevel * 2);
                const dx = TargetPlayer.x - this.x;
                const dy = TargetPlayer.y - this.y;
                const baseA = Math.atan2(dy, dx);
                const halfSpread = (n - 1) * 0.2 / 2;
                // 扇形警告（射出方向の扇形範囲を示す）
                const dist = Math.sqrt(dx * dx + dy * dy) + 200;
                await showFanWarning(
                    this.EnemyContainer,
                    this.x, this.y, dist,
                    baseA - halfSpread, baseA + halfSpread,
                    0.45
                );
                for (let i = 0; i < n; i++) {
                    const spread = (i - Math.floor(n / 2)) * 0.2;
                    const a = baseA + spread;
                    EnemyBulletArray.push(new Bullet(this.EnemyContainer, this.x, this.y, {
                        vx: 180 * dm * Math.cos(a),
                        vy: 180 * dm * Math.sin(a),
                        ax: 0, ay: 0,
                        sine_wave_enabled: true,
                        sine_amplitude: 40 + Math.random() * 20,
                        sine_angular_frequency: Math.PI * (1.5 + Math.random()),
                        sine_axis: "x",
                        width: 10, height: 10, damage: 25, life: 18,
                        BulletImageKey: "BulletTypeA", shape: "circle",
                        target: TargetPlayer, trackingStrength: 0
                    }));
                }
            }
            await wait(0.6 / dm);
        }
    }

    /** 停止 → 全方位飽和 */
    async pattern2_Loop(EnemyBulletArray, TargetPlayer, initialDelay) {
        await wait(initialDelay);
        while (this.NowHPGuageHP > 0) {
            const dm = 1.0 + DifficultyLevel * 0.4;
            if (!this.SkillActivate) {
                // 停止 + 円形警告（«ここから全方位に飽和する»を示す）
                this.CanMoveFlag = false;
                const burstRadius = this.NowPlayAreaWidth * 0.35;
                await showBurstWarning(this.EnemyContainer, this.x, this.y, burstRadius, 1.2);
                // 飽和
                if (this.NowHPGuageHP > 0 && !this.SkillActivate) {
                    const n = 20 + Math.floor(6 * DifficultyLevel);
                    for (let i = 0; i < n; i++) {
                        const a = Math.PI * 2 * i / n;
                        const spd = 220 * dm;
                        EnemyBulletArray.push(new Bullet(this.EnemyContainer, this.x, this.y, {
                            vx: spd * Math.cos(a), vy: spd * Math.sin(a),
                            width: 10, height: 10, damage: 20, life: 15,
                            BulletImageKey: "BulletTypeA", shape: "circle",
                            target: TargetPlayer, trackingStrength: 0
                        }));
                    }
                }
                this.CanMoveFlag = true;
            }
            await wait(3.5 / dm);
        }
    }

    async _skilrun(DeltaTime, TargetPlayer, EnemyBulletArray) {
        super._skilrun(DeltaTime);
        if (this.SkillActivate && !this.IsSkillTextShown) {
            this.IsSkillTextShown = true;
            this.EnemyContainer.emit('skillActivated', true, 5, 0.1);
            const phase = this.MaxEnemyHPGuage - this.NowEnemyHPGuage;
            const def = this._getSkillDefinitionForPhase(phase);
            if (def) this._executeSkill(def, EnemyBulletArray, TargetPlayer);
            else this.CanMoveFlag = true;
            this.SkillText.visible = true;
            this.SkillTimerText.visible = true;
            const sy = this.SkillText.y;
            gsap.fromTo(this.SkillText, { y: sy + 20, alpha: 0 }, { y: sy, alpha: 1, duration: 0.8, ease: "power2.out" });
            const ty = this.SkillTimerText.y;
            gsap.fromTo(this.SkillTimerText, { y: ty + 20, alpha: 0 }, { y: ty, alpha: 1, duration: 0.8, ease: "power2.out" });
        }
    }

    /** スペル1: 正弦波弾幕 */
    // TODO スペル1変更：出ている弾を消すのではなく，プレイアブルキャラも含めて停止(操作不能)，その後弾を円弧上，下方向に4層重ねて設置，射出方向が赤く光り，移動できるようになり，高速に弾が飛んでくる
    // 必ず政界の方向に行けばよけられるようにする，難易度によって円弧の角度が変わる
    async AttackSkill1(EnemyBulletArray, TargetPlayer) {
        const dm = 1.0 + DifficultyLevel * 0.5;
        while (this.NowHPGuageHP > 0 && this.SkillActivate) {
            const n = 8 + Math.floor(4 * DifficultyLevel);
            for (let i = 0; i < n; i++) {
                const a = Math.PI * 2 * i / n;
                EnemyBulletArray.push(new Bullet(this.EnemyContainer, this.x, this.y, {
                    vx: 200 * dm * Math.cos(a), vy: 200 * dm * Math.sin(a),
                    sine_wave_enabled: true,
                    sine_amplitude: 60 * dm,
                    sine_angular_frequency: Math.PI * 2,
                    sine_axis: (i % 2 === 0) ? "x" : "y",
                    width: 12, height: 12, damage: 30, life: 20,
                    BulletImageKey: "BulletTypeA", shape: "circle",
                    target: TargetPlayer, trackingStrength: 0
                }));
            }
            await wait(0.5 / dm);
        }
        this.CanMoveFlag = true;
    }

    /** スペル2: 3箇所移動→飽和 */
    // TODO スペル2変更：敵エネミーが高速でランダムに移動，移動回数が難易度によって変わる
    // 移動したところに弾が設置され，その後置き弾が6方向に2連から5連発射(難易度別で変更)その弾たちはこのスペルが終わるまで，壁に当たっても反射して帰ってくる
    // 弾同士が当たってもそれぞれがぶつかり反射する(球の色は変えるし，大きさもちょっと大きくしてわかりやすくする)

    async AttackSkill2(EnemyBulletArray, TargetPlayer) {
        const dm = 1.0 + DifficultyLevel * 0.5;
        const points = [
            { x: this.StartAreaX + this.NowPlayAreaWidth * 0.25, y: this.StartAreaY + this.NowPlayAreaHeight * 0.2 },
            { x: this.StartAreaX + this.NowPlayAreaWidth * 0.75, y: this.StartAreaY + this.NowPlayAreaHeight * 0.2 },
            { x: this.StartAreaX + this.NowPlayAreaWidth * 0.5,  y: this.StartAreaY + this.NowPlayAreaHeight * 0.35 },
        ];
        let idx = 0;
        while (this.NowHPGuageHP > 0 && this.SkillActivate) {
            const pt = points[idx % points.length];
            // 移動
            await new Promise(r => gsap.to(this, { x: pt.x, y: pt.y, duration: 0.8, ease: "power2.inOut", onComplete: r }));
            // 飽和前に警告円を表示
            const burstR = this.NowPlayAreaWidth * 0.3;
            await showBurstWarning(this.EnemyContainer, this.x, this.y, burstR, 0.6);
            const n = 24 + Math.floor(6 * DifficultyLevel);
            for (let i = 0; i < n; i++) {
                const a = Math.PI * 2 * i / n;
                EnemyBulletArray.push(new Bullet(this.EnemyContainer, this.x, this.y, {
                    vx: 250 * dm * Math.cos(a), vy: 250 * dm * Math.sin(a),
                    width: 10, height: 10, damage: 35, life: 18,
                    BulletImageKey: "BulletTypeA", shape: "circle",
                    target: TargetPlayer, trackingStrength: 0
                }));
            }
            idx++;
            await wait(0.8 / dm);
        }
        this.CanMoveFlag = true;
    }

    /** スペル3: 蛇行弾 */
    // TODO スペル3変更：倍速となるこのスペルでは通常攻撃が基礎となり，攻撃の頻度や移動の頻度ががる
    // 難易度によって速度の速さが変わり，tanのように増えていく
    // このスペル時は速度がちゃんと上がっているように視認させる何かが必要⇒TVの倍速機能のようなイメージだから


    async AttackSkill3(EnemyBulletArray, TargetPlayer) {
        const dm = 1.0 + DifficultyLevel * 0.5;
        let t = 0;
        while (this.NowHPGuageHP > 0 && this.SkillActivate) {
            const n = 3 + Math.floor(DifficultyLevel);
            for (let i = 0; i < n; i++) {
                const baseA = Math.PI / 2; // 下方向
                const offset = (i - Math.floor(n / 2)) * 0.3;
                EnemyBulletArray.push(new Bullet(this.EnemyContainer, this.x, this.y, {
                    vx: 100 * dm * Math.cos(baseA + offset),
                    vy: 100 * dm * Math.sin(baseA + offset),
                    ax: 0, ay: 0,
                    sine_wave_enabled: true,
                    sine_amplitude: 80 + 30 * Math.sin(t),
                    sine_angular_frequency: Math.PI * (2 + Math.sin(t * 0.3)),
                    sine_axis: "x",
                    width: 14, height: 14, damage: 30, life: 20,
                    BulletImageKey: "BulletTypeA", shape: "circle",
                    target: TargetPlayer, trackingStrength: 0
                }));
            }
            t += 0.2;
            await wait(0.25 / dm);
        }
        this.CanMoveFlag = true;
    }

    // TODO：ここからhardのみ有効なスペル
    // TODO:スペル4追加，簡単に言えばキングクリムゾン，弾を基本的な自身を中心とした螺旋状に射出，それを出し続ける．途中でいったん弾が止まるタイミングを作成し，そこから急に時間が進んだように弾の移動を行う
    

    // このキャラだけNomarl以上このスペルを解禁，難易度によってさかのぼる時間が変動
    // Easy 10 Normal 20 Hard 45 Lunatic スペルの上限時間いっぱい，このスペルの場合，スペルの有効時間がその時間に合わせて設計されるLunaticの場合通常と同一
    // TODO：スペル5追加，今射出している弾をいったん画面上からすべて削除，打っていた弾を最後から順に自身に戻ってくるように逆再生を行う
    // また加えて逆再生⇒順再生を繰り返すようにする，する際には，背景が一度反転するようにする
    // hard以上の場合，順再生，逆再生の際に0.5倍速～4倍速(難易度別)まで再生速度が変動する
    // 0.5倍など1倍以下の再生速度の場合，順再生，逆再生のサイクルが短くなる
    // 再生速度は反転するたびに決定される



    _getSkillDefinitionForPhase(phase) { return this.SkillDefinitions[phase]; }
}
