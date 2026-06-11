// EnemyType4 — ステージ4ボス
// テーマ: 幾何学

import { EnemyBase } from "./EnemyBase.js";
import { ChangeActivation, Bullet } from '../bullet.js';
import { SingleShotFunc, RoundShotFunc, FanShotFunc, CircleAndHomeShotFunc } from "./EnemyShot.js";
import { DifficultyLevel } from "../Screens/BaseScreen.js";
import { enemy_info_list, EnemyTypeEnum } from '../game_status.js';
import { showSpotWarning, showBurstWarning, showLineWarning, showAreaWarning } from '../DangerWarning.js';

const wait = (seconds) => new Promise(resolve => setTimeout(resolve, seconds * 1000));

/**
 * 正N角形の頂点座標リストを返す
 */
function polygonVertices(cx, cy, r, n, offsetAngle = 0) {
    const pts = [];
    for (let i = 0; i < n; i++) {
        const a = offsetAngle + (Math.PI * 2 * i / n) - Math.PI / 2;
        pts.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
    }
    return pts;
}

/**
 * 正規分布乱数を生成するヘルパー（Box-Muller法）
 */
function randomNormal(mean = 0, stdDev = 1) {
    const u1 = 1.0 - Math.random();
    const u2 = 1.0 - Math.random();
    const randStdNormal = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(2.0 * Math.PI * u2);
    return mean + stdDev * randStdNormal;
}

export class EnemyType4 extends EnemyBase {
    constructor(GameScreenContainer, StartShootingX, StartShootingY, StartShootingWidth, StartShootingHeight) {
        const enemyInfo = enemy_info_list[EnemyTypeEnum.E_TYPE_4] || enemy_info_list[EnemyTypeEnum.E_TYPE_1];
        const hpGauges = (DifficultyLevel < 1) ? 2 : (DifficultyLevel <= 2) ? 3 : 4;
        const BaseConfig = {
            ...enemyInfo,
            enemy_maxhp: enemyInfo.enemy_maxhp * ((0.6 * DifficultyLevel) + 0.4),
            enemy_hp_guage: hpGauges,
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
            }
        };

        if (DifficultyLevel === 2) {
            // Hard
            this.SkillDefinitions[2] = {
                name: "予告「ペンローズ・タイル」",
                NoMoveFlag: false,
                targetX: () => this.StartAreaX + this.NowPlayAreaWidth * 0.5,
                targetY: () => this.StartAreaY + this.NowPlayAreaHeight * 0.2,
                attackFunction: this.AttackSkill4,
                allowMoveAfter: true
            };
        } else if (DifficultyLevel === 3) {
            // Lunatic
            this.SkillDefinitions[2] = {
                name: "予告「ペンローズ・タイル」",
                NoMoveFlag: false,
                targetX: () => this.StartAreaX + this.NowPlayAreaWidth * 0.5,
                targetY: () => this.StartAreaY + this.NowPlayAreaHeight * 0.2,
                attackFunction: this.AttackSkill4,
                allowMoveAfter: true
            };
            this.SkillDefinitions[3] = {
                name: "干渉「モアレ・マトリクス」",
                NoMoveFlag: false,
                targetX: () => this.StartAreaX + this.NowPlayAreaWidth * 0.5,
                targetY: () => this.StartAreaY + this.NowPlayAreaHeight * 0.25,
                attackFunction: this.AttackSkill5,
                allowMoveAfter: true
            };
        } else if (DifficultyLevel === 1) {
            // Normal
            this.SkillDefinitions[2] = {
                name: "幾何「六芒星」",
                NoMoveFlag: false,
                targetX: () => this.StartAreaX + this.NowPlayAreaWidth * 0.5,
                targetY: () => this.StartAreaY + this.NowPlayAreaHeight * 0.25,
                attackFunction: this.AttackSkill3,
                allowMoveAfter: true
            };
        }
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
            this.pattern2_Loop(EnemyBulletArray, TargetPlayer, 1.8);
            this.pattern3_Loop(EnemyBulletArray, TargetPlayer, 2.5);
            this.pattern4_Loop(EnemyBulletArray, TargetPlayer, 3.5);
            this.pattern5_Loop(EnemyBulletArray, TargetPlayer, 4.5);
        }
    }

    /**
     * 【通常パターン1】正三角形頂点からの自機狙い拡散弾
     */
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
                    const spd = 200 * dm;
                    const n = 3 + Math.floor(DifficultyLevel);
                    
                    const angleDeg = Math.atan2(dy, dx) * 180 / Math.PI;
                    const opt = { vx: spd, vy: spd, width: 10, height: 10, damage: 20, life: 15, BulletImageKey: "BulletTypeA", shape: "circle" };
                    FanShotFunc(EnemyBulletArray, v.x, v.y, n, 10, angleDeg, opt, this.EnemyContainer);
                }
                phase += 0.2;
            }
            await wait(0.8 / dm);
        }
    }

    /**
     * 【通常パターン2】正五角形頂点からの全方位弾
     */
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
                        const n = 6 + Math.floor(DifficultyLevel * 2);
                        const opt = { vx: 150 * dm, vy: 150 * dm, width: 8, height: 8, damage: 15, life: 15, BulletImageKey: "BulletTypeA", shape: "circle" };
                        RoundShotFunc(EnemyBulletArray, v.x, v.y, n, 0, opt, 360, this.EnemyContainer);
                    }
                }
                phase += 0.3;
            }
            await wait(2.0 / dm);
        }
    }

    /**
     * 【通常パターン3】逆走する自機狙い扇形弾
     */
    async pattern3_Loop(EnemyBulletArray, TargetPlayer, initialDelay) {
        await wait(initialDelay);
        while (this.NowHPGuageHP > 0) {
            const dm = 1.0 + DifficultyLevel * 0.5;
            if (!this.SkillActivate) {
                const dx = TargetPlayer.x - this.x;
                const dy = TargetPlayer.y - this.y;
                // ターゲットと180度反対の方向
                const revAngleDegrees = (Math.atan2(dy, dx) + Math.PI) * 180 / Math.PI;

                const bulletCount = 5 + Math.floor(DifficultyLevel * 2);
                const opt = {
                    vx: 180 * dm, vy: 180 * dm,
                    width: 12, height: 12, damage: 20, life: 15,
                    BulletImageKey: "BulletTypeA", shape: "circle"
                };
                
                // 反対側に撃ち出す
                FanShotFunc(EnemyBulletArray, this.x, this.y, bulletCount, 12, revAngleDegrees, opt, this.EnemyContainer);
            }
            await wait(1.8 / dm);
        }
    }

    /**
     * 【通常パターン4】尺取虫コサイン伸縮弾
     */
    async pattern4_Loop(EnemyBulletArray, TargetPlayer, initialDelay) {
        await wait(initialDelay);
        while (this.NowHPGuageHP > 0) {
            const dm = 1.0 + DifficultyLevel * 0.4;
            if (!this.SkillActivate) {
                const bulletCount = 8 + Math.floor(DifficultyLevel * 2);
                const spreadAngle = 100;
                const oneStep = spreadAngle / (bulletCount - 1);
                const startAngle = 90 - spreadAngle / 2;

                for (let i = 0; i < bulletCount; i++) {
                    const angleRad = (startAngle + i * oneStep) * Math.PI / 180;
                    
                    // Y座標を進行方向上でコサイン伸縮させる
                    EnemyBulletArray.push(new Bullet(this.EnemyContainer, this.x, this.y, {
                        vx: 120 * dm * Math.cos(angleRad),
                        vy: 120 * dm * Math.sin(angleRad),
                        sine_wave_enabled: true,
                        sine_amplitude: 35,
                        sine_angular_frequency: Math.PI * 2.2, // 伸縮周期
                        sine_axis: "y", // Y軸方向への揺らぎ
                        width: 10, height: 35, damage: 20, life: 15,
                        BulletImageKey: "BulletTypeA", shape: "circle"
                    }));
                }
            }
            await wait(2.8 / dm);
        }
    }

    /**
     * 【通常パターン5】場外軸往復サイン狙撃弾
     */
    async pattern5_Loop(EnemyBulletArray, TargetPlayer, initialDelay) {
        await wait(initialDelay);
        let time = 0;
        while (this.NowHPGuageHP > 0) {
            const dm = 1.0 + DifficultyLevel * 0.5;
            if (!this.SkillActivate) {
                // 発射元が上端で左右にSin波を描いて往復
                const emitterX = this.StartAreaX + this.NowPlayAreaWidth * 0.5 + (this.NowPlayAreaWidth * 0.45) * Math.sin(time * 3);
                const emitterY = this.StartAreaY;

                const dx = TargetPlayer.x - emitterX;
                const dy = TargetPlayer.y - emitterY;
                const angle = Math.atan2(dy, dx);
                const speed = 250 * dm;

                EnemyBulletArray.push(new Bullet(this.EnemyContainer, emitterX, emitterY, {
                    vx: speed * Math.cos(angle), vy: speed * Math.sin(angle),
                    width: 10, height: 10, damage: 15, life: 10,
                    BulletImageKey: "BulletTypeA", shape: "circle"
                }));
            }
            time += 0.15;
            await wait(0.15);
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

    /**
     * スペル1: 幾何「三角の陣」
     */
    async AttackSkill1(EnemyBulletArray, TargetPlayer) {
        const dm = 1.0 + DifficultyLevel * 0.5;
        let phase = 0;
        while (this.NowHPGuageHP > 0 && this.SkillActivate) {
            const r = this.NowPlayAreaWidth * 0.08;
            const verts = polygonVertices(this.x, this.y, r, 3, phase);
            const warnings = verts.map(v => showSpotWarning(this.EnemyContainer, v.x, v.y, 25, 0.45));
            await Promise.all(warnings);
            
            if (this.NowHPGuageHP > 0 && this.SkillActivate) {
                // 頂点ごとに速度をずらして射出
                let vIdx = 0;
                for (const v of verts) {
                    const dx = TargetPlayer.x - v.x;
                    const dy = TargetPlayer.y - v.y;
                    const angleDeg = Math.atan2(dy, dx) * 180 / Math.PI;
                    
                    const speed = (200 + vIdx * 40) * dm;
                    const n = 6 + Math.floor(DifficultyLevel * 2);
                    const opt = { vx: speed, vy: speed, width: 10, height: 10, damage: 30, life: 18, BulletImageKey: "BulletTypeA", shape: "circle" };
                    FanShotFunc(EnemyBulletArray, v.x, v.y, n, 8, angleDeg, opt, this.EnemyContainer);
                    vIdx++;
                }
            }
            phase += 0.25;
            await wait(0.7 / dm);
        }
        this.CanMoveFlag = true;
    }

    /**
     * スペル2: 幾何「五芒星散弾」（五角形スライド＋ドリフト）
     */
    async AttackSkill2(EnemyBulletArray, TargetPlayer) {
        const dm = 1.0 + DifficultyLevel * 0.5;
        let phase = 0;
        let time = 0;
        while (this.NowHPGuageHP > 0 && this.SkillActivate) {
            time += 0.5;
            const r = this.NowPlayAreaWidth * 0.08;
            const verts = polygonVertices(this.x, this.y, r, 5, phase);
            const warnings = verts.map(v => showSpotWarning(this.EnemyContainer, v.x, v.y, 25, 0.4));
            await Promise.all(warnings);

            if (this.NowHPGuageHP > 0 && this.SkillActivate) {
                // スライド移動＋ドリフト加速度付き
                for (const v of verts) {
                    const opt = {
                        vx: 0,
                        vy: 420 * dm,
                        ax: 150 * Math.sin(time) * dm, // 横方向へのうねり
                        ay: 0,
                        width: 10, height: 10, damage: 25, life: 18,
                        BulletImageKey: "BulletTypeA", shape: "circle"
                    };
                    EnemyBulletArray.push(new Bullet(this.EnemyContainer, v.x, v.y, opt));
                }
            }
            phase += 0.2;
            await wait(0.5 / dm);
        }
        this.CanMoveFlag = true;
    }

    /**
     * スペル3: 幾何「六芒星」（正規分布ばらつき）
     */
    async AttackSkill3(EnemyBulletArray, TargetPlayer) {
        const dm = 1.0 + DifficultyLevel * 0.5;
        let angle = 0;
        while (this.NowHPGuageHP > 0 && this.SkillActivate) {
            const baseCount = 6;
            for (let i = 0; i < baseCount; i++) {
                const a = angle + (i * Math.PI / 3);
                
                // 初速、加速度、追尾強度のすべてを正規分布で揺らす
                const speed = randomNormal(120, 30) * dm;
                const accel = randomNormal(60, 15) * dm;
                const tracking = randomNormal(1.6, 0.3) * dm;

                EnemyBulletArray.push(new Bullet(this.EnemyContainer, this.x, this.y, {
                    vx: speed * Math.cos(a), vy: speed * Math.sin(a),
                    ax: accel * Math.cos(a), ay: accel * Math.sin(a),
                    width: 12, height: 12, damage: 25, life: 18,
                    BulletImageKey: "BulletTypeA", shape: "circle",
                    target: TargetPlayer,
                    trackingStrength: Math.max(0, tracking),
                    maxSpeed: 280
                }));
            }
            angle += 0.12;
            await wait(0.2);
        }
        this.CanMoveFlag = true;
    }

    /**
     * スペル4: 予告「ペンローズ・タイル」
     */
    async AttackSkill4(EnemyBulletArray, TargetPlayer) {
        const dm = 1.0 + DifficultyLevel * 0.5;
        this.CanMoveFlag = false;

        const maxLayers = (DifficultyLevel === 2) ? 4 : 6; // Hard:4, Lunatic:6

        while (this.NowHPGuageHP > 0 && this.SkillActivate) {
            const cx = this.x;
            const cy = this.y + 120;
            const layers = [];

            // 1. 各階層のペンローズ星形グリッド警告線を表示
            for (let layer = 1; layer <= maxLayers; layer++) {
                const radius = layer * 45;
                const vertices = polygonVertices(cx, cy, radius, 5, layer * 0.4);
                
                const warningLines = [];
                for (let i = 0; i < 5; i++) {
                    const v1 = vertices[i];
                    const v2 = vertices[(i + 2) % 5]; // 五芒星を描く結びつき
                    warningLines.push(showLineWarning(this.EnemyContainer, v1.x, v1.y, v2.x, v2.y, 10, radius * 1.8, 0.65));
                }
                layers.push({ vertices, radius });
                await Promise.all(warningLines);
                await wait(0.1);
            }

            if (this.NowHPGuageHP <= 0 || !this.SkillActivate) break;

            // 2. 警告が終わった交点に実体弾を配置して、わずかに崩れて停止
            for (const lay of layers) {
                for (const v of lay.vertices) {
                    const angleRad = Math.atan2(v.y - cy, v.x - cx);
                    const bulletOptions = {
                        vx: 120 * Math.cos(angleRad),
                        vy: 120 * Math.sin(angleRad),
                        width: 12, height: 12, damage: 30, life: 20,
                        BulletImageKey: "BulletTypeA", shape: "circle",
                        // 20px進んだあと完全停止
                        ActivationLength: 20,
                        PostActivationOptions: {
                            ChangeActivation: ChangeActivation.ActivateFixed,
                            vx: 0, vy: 0,
                            ax: 0, ay: 0, jx: 0, jy: 0
                        }
                    };
                    EnemyBulletArray.push(new Bullet(this.EnemyContainer, v.x, v.y, bulletOptions));
                }
            }

            await wait(2.8);
        }
        this.CanMoveFlag = true;
    }

    /**
     * スペル5: 干渉「モアレ・マトリクス」
     */
    async AttackSkill5(EnemyBulletArray, TargetPlayer) {
        const dm = 1.0 + DifficultyLevel * 0.5;
        this.CanMoveFlag = false;

        let time = 0;
        while (this.NowHPGuageHP > 0 && this.SkillActivate) {
            time += 0.08 * dm;

            // 1. 同心円状の回転速度差リングを射出してモアレ干渉を誘発
            if (Math.floor(time * 10) % 6 === 0) {
                const count1 = 16;
                const opt1 = { vx: 130, vy: 130, width: 10, height: 10, damage: 20, life: 20, BulletImageKey: "BulletTypeA", shape: "circle" };
                RoundShotFunc(EnemyBulletArray, this.x, this.y, count1, time * 20, opt1, 360, this.EnemyContainer);

                const count2 = 18;
                const opt2 = { vx: 100, vy: 100, width: 10, height: 10, damage: 20, life: 20, BulletImageKey: "BulletTypeA", shape: "circle" };
                RoundShotFunc(EnemyBulletArray, this.x, this.y, count2, -time * 15, opt2, 360, this.EnemyContainer);
            }

            // 2. 斜め上からのランダム格子状の乱入弾
            if (Math.floor(time * 10) % 15 === 0) {
                const countDiagonal = 5;
                for (let i = 0; i < countDiagonal; i++) {
                    const startX = this.StartAreaX + (this.NowPlayAreaWidth * i) / countDiagonal + (Math.random() - 0.5) * 40;
                    const startY = this.StartAreaY;
                    EnemyBulletArray.push(new Bullet(this.EnemyContainer, startX, startY, {
                        vx: 120 * dm,
                        vy: 200 * dm,
                        width: 14, height: 14, damage: 20, life: 15,
                        BulletImageKey: "BulletTypeA", shape: "circle"
                    }));
                }
            }

            await wait(0.08);
        }
        this.CanMoveFlag = true;
    }

    _getSkillDefinitionForPhase(phase) { return this.SkillDefinitions[phase]; }
}
