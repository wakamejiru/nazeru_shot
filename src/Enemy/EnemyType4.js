// EnemyType4 — ステージ4ボス
// テーマ: 幾何学
import { EnemyBase } from "./EnemyBase.js";
import { Bullet } from '../bullet.js';
import { SingleShotFunc, CircleAndHomeShotFunc } from "./EnemyShot.js";
import { DifficultyLevel } from "../Screens/BaseScreen.js";
import { enemy_info_list, EnemyTypeEnum } from '../game_status.js';
import { showSpotWarning, showBurstWarning } from '../DangerWarning.js';

const wait = (seconds) => new Promise(resolve => setTimeout(resolve, seconds * 1000));

/**
 * 正N角形の頂点座標リストを返す
 * @param {number} cx 中心X
 * @param {number} cy 中心Y
 * @param {number} r 半径
 * @param {number} n 頂点数
 * @param {number} offsetAngle 開始角度オフセット(ラジアン)
 */
function polygonVertices(cx, cy, r, n, offsetAngle = 0) {
    const pts = [];
    for (let i = 0; i < n; i++) {
        const a = offsetAngle + (Math.PI * 2 * i / n) - Math.PI / 2;
        pts.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
    }
    return pts;
}

export class EnemyType4 extends EnemyBase {
    constructor(GameScreenContainer, StartShootingX, StartShootingY, StartShootingWidth, StartShootingHeight) {
        const enemyInfo = enemy_info_list[EnemyTypeEnum.E_TYPE_4];
        const BaseConfig = {
            ...enemyInfo,
            enemy_maxhp: enemyInfo.enemy_maxhp * ((0.6 * DifficultyLevel) + 0.4),
            enemy_hp_guage: (DifficultyLevel < 2) ? 2 : 3,
            ETypeTypeID: EnemyTypeEnum.E_TYPE_4
        };
        super(GameScreenContainer, StartShootingX, StartShootingY, StartShootingWidth, StartShootingHeight, BaseConfig);
        this._attackLoopsStarted = false;

        this.SkillDefinitions = {
            0: {
                name: "幾何「三角の陣」",
                NoMoveFlag: false,
                targetX: () => this.StartAreaX + this.NowPlayAreaWidth * 0.5,
                targetY: () => this.StartAreaY + this.NowPlayAreaHeight * 0.2,
                attackFunction: this.AttackSkill1,
                allowMoveAfter: true
            },
            1: {
                name: "幾何「五芒星散弾」",
                NoMoveFlag: false,
                targetX: () => this.StartAreaX + this.NowPlayAreaWidth * 0.5,
                targetY: () => this.StartAreaY + this.NowPlayAreaHeight * 0.25,
                attackFunction: this.AttackSkill2,
                allowMoveAfter: true
            },
            2: {
                name: "幾何「六芒星」",
                NoMoveFlag: false,
                targetX: () => this.StartAreaX + this.NowPlayAreaWidth * 0.5,
                targetY: () => this.StartAreaY + this.NowPlayAreaHeight * 0.25,
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
            this.pattern2_Loop(EnemyBulletArray, TargetPlayer, 2.5);
        }
    }

    /** 正三角形頂点から放射弾 */
    async pattern1_Loop(EnemyBulletArray, TargetPlayer, initialDelay) {
        await wait(initialDelay);
        let phase = 0;
        while (this.NowHPGuageHP > 0) {
            const dm = 1.0 + DifficultyLevel * 0.5;
            if (!this.SkillActivate) {
                const r = this.NowPlayAreaWidth * 0.06;
                const verts = polygonVertices(this.x, this.y, r, 3, phase);
                for (const v of verts) {
                    const dx = TargetPlayer.x - v.x;
                    const dy = TargetPlayer.y - v.y;
                    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                    const spd = 200 * dm;
                    const n = 3 + Math.floor(DifficultyLevel);
                    for (let i = 0; i < n; i++) {
                        const spread = (i - Math.floor(n / 2)) * 0.15;
                        const baseA = Math.atan2(dy, dx) + spread;
                        EnemyBulletArray.push(new Bullet(this.EnemyContainer, v.x, v.y, {
                            vx: spd * Math.cos(baseA), vy: spd * Math.sin(baseA),
                            ax: 0, ay: 0, width: 10, height: 10,
                            damage: 20, life: 15,
                            BulletImageKey: "BulletTypeA", shape: "circle",
                            target: TargetPlayer, trackingStrength: 0
                        }));
                    }
                }
                phase += 0.2;
            }
            await wait(0.7 / dm);
        }
    }

    /** 正五角形頂点から円形弾 */
    async pattern2_Loop(EnemyBulletArray, TargetPlayer, initialDelay) {
        await wait(initialDelay);
        let phase = 0;
        while (this.NowHPGuageHP > 0) {
            const dm = 1.0 + DifficultyLevel * 0.4;
            if (!this.SkillActivate) {
                const r = this.NowPlayAreaWidth * 0.05;
                const verts = polygonVertices(this.x, this.y, r, 5, phase);
                const warnings = verts.map(v => showSpotWarning(this.EnemyContainer, v.x, v.y, 20, 0.45));
                await Promise.all(warnings);
                if (this.NowHPGuageHP > 0 && !this.SkillActivate) {
                    for (const v of verts) {
                        const n = 5 + Math.floor(DifficultyLevel);
                        for (let i = 0; i < n; i++) {
                            const a = (Math.PI * 2 * i / n);
                            const spd = 150 * dm;
                            EnemyBulletArray.push(new Bullet(this.EnemyContainer, v.x, v.y, {
                                vx: spd * Math.cos(a), vy: spd * Math.sin(a),
                                width: 8, height: 8, damage: 15, life: 15,
                                BulletImageKey: "BulletTypeA", shape: "circle",
                                target: TargetPlayer, trackingStrength: 0
                            }));
                        }
                    }
                }
                phase += 0.3;
            }
            await wait(1.8 / dm);
        }
    }

    // TODO ここでの攻撃は射出方向はTargetPlayerのいる方向にする

    // TODO設計する【攻撃パターン3】扇形に玉を設置し発射，発射時に扇形の中心にして逆方向に射出されるようにする



    // TODO設計する【攻撃パターン4】弾を円弧上に発射する，弾は縦長，尺取虫のように一定間隔で移動する.おそらく速度の変異がCOSになる


    // TODO設計する【攻撃パターン5】弾をTragetPlaerに向けて直線状に発射する，発射する開始地点を場外に機軸を置き，そこから水平方向にSinで変動させるこの変動は間隔は短く，ほぼ同時発射ぐらいにする




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

    /** スペル1: 三角陣 — 三角形頂点から高速弾を連続発射 */
    // TODO 難易度によって1頂点から発射される弾の数が増加，また，各頂点によって弾の速度が変化する，弾のうつ方向はTargetPlayerに向けて撃つ
    async AttackSkill1(EnemyBulletArray, TargetPlayer) {
        const dm = 1.0 + DifficultyLevel * 0.5;
        let phase = 0;
        while (this.NowHPGuageHP > 0 && this.SkillActivate) {
            const r = this.NowPlayAreaWidth * 0.08;
            const verts = polygonVertices(this.x, this.y, r, 3, phase);
            const warnings = verts.map(v => showSpotWarning(this.EnemyContainer, v.x, v.y, 25, 0.45));
            await Promise.all(warnings);
            if (this.NowHPGuageHP > 0 && this.SkillActivate) {
                for (const v of verts) {
                    const n = 12 + Math.floor(4 * DifficultyLevel);
                    for (let i = 0; i < n; i++) {
                        const a = Math.PI * 2 * i / n;
                        const spd = 250 * dm;
                        EnemyBulletArray.push(new Bullet(this.EnemyContainer, v.x, v.y, {
                            vx: spd * Math.cos(a), vy: spd * Math.sin(a),
                            width: 10, height: 10, damage: 30, life: 18,
                            BulletImageKey: "BulletTypeA", shape: "circle",
                            target: TargetPlayer, trackingStrength: 0
                        }));
                    }
                }
            }
            phase += 0.25;
            await wait(0.6 / dm);
        }
        this.CanMoveFlag = true;
    }

    /** スペル2: 五芒星散弾 — 5頂点から放射状に扇形 */
    // TODO 変更，エネミーを囲うように5角形の弾を生成．そこから下のに方向に玉をスライドするような形で射出，かなりの速度で，
    // 射出した5角形の形をした玉たちは徐々に横方向の移動も含まれていくようになる
    async AttackSkill2(EnemyBulletArray, TargetPlayer) {
        const dm = 1.0 + DifficultyLevel * 0.5;
        let phase = 0;
        while (this.NowHPGuageHP > 0 && this.SkillActivate) {
            const r = this.NowPlayAreaWidth * 0.1;
            const verts = polygonVertices(this.x, this.y, r, 5, phase);
            const warnings = verts.map(v => showSpotWarning(this.EnemyContainer, v.x, v.y, 25, 0.4));
            await Promise.all(warnings);
            if (this.NowHPGuageHP > 0 && this.SkillActivate) {
                for (const v of verts) {
                    const dx = TargetPlayer.x - v.x;
                    const dy = TargetPlayer.y - v.y;
                    const ca = Math.atan2(dy, dx);
                    const spread = Math.PI / 6;
                    const n = 5 + Math.floor(DifficultyLevel * 2);
                    for (let i = 0; i < n; i++) {
                        const a = ca - spread + (2 * spread * i / (n - 1));
                        EnemyBulletArray.push(new Bullet(this.EnemyContainer, v.x, v.y, {
                            vx: 200 * dm * Math.cos(a), vy: 200 * dm * Math.sin(a),
                            width: 10, height: 10, damage: 25, life: 18,
                            BulletImageKey: "BulletTypeA", shape: "circle",
                            target: TargetPlayer, trackingStrength: 0
                        }));
                    }
                }
            }
            phase += 0.2;
            await wait(0.5 / dm);
        }
        this.CanMoveFlag = true;
    }

    /** スペル3: 六芒星 — 6方向から弾を発射し徐々に加速 */
    // TODO 若干強い追尾をつける，追尾度合いは，正規分布としてばらけさせる
    // また初速や加速度もばらけさせる正規分布を用いる
    async AttackSkill3(EnemyBulletArray, TargetPlayer) {
        const dm = 1.0 + DifficultyLevel * 0.5;
        let angle = 0;
        while (this.NowHPGuageHP > 0 && this.SkillActivate) {
            for (let i = 0; i < 6; i++) {
                const a = angle + (i * Math.PI / 3);
                EnemyBulletArray.push(new Bullet(this.EnemyContainer, this.x, this.y, {
                    vx: 50 * Math.cos(a), vy: 50 * Math.sin(a),
                    ax: 80 * dm * Math.cos(a), ay: 80 * dm * Math.sin(a),
                    jx: 0, jy: 0,
                    width: 14, height: 14, damage: 35, life: 18,
                    BulletImageKey: "BulletTypeA", shape: "circle",
                    target: TargetPlayer, trackingStrength: 0
                }));
            }
            angle += 0.12;
            await wait(0.18);
        }
        this.CanMoveFlag = true;
    }



    // TODO：ここからhardのみ有効なスペル
    // TODO:スペル4追加，予告線をペンローズ・タイル状に貼っていく，予告が終わるとそこに弾が現れる，ペンローズタイルなので，その後層を増やすようにまた同じく線を増やしていく．
    // Normalは3階層，Hardは4階層，Luinaticは6階層，貼り終わった後，少しだけ形が崩れて停止するようにする
    
    

    // TODO：ここからLunaticのみ有効なスペル
    // エネミーの中心から弾が出てくる最初は12方向の普通の弾だが，球の大きさや密度が変化しモアレパターンとなる
    // モアレパターンとなったところに斜め上から照射されるようにランダム形状に置かれた弾の集団が侵入してくる


    _getSkillDefinitionForPhase(phase) { return this.SkillDefinitions[phase]; }
}
