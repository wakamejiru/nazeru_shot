// EnemyType3 — ステージ3ボス
// 使役＋力学

// このキャラは，二体の使い魔を使役している
// その使い魔にはターゲットポイントはないが弾の発射元となる
import { EnemyBase } from "./EnemyBase.js";
import { SingleShotFunc, RoundShotFunc, FanShotFunc, CircleAndHomeShotFunc } from "./EnemyShot.js";
import { ChangeActivation, Bullet } from '../bullet.js';
import { DifficultyLevel } from "../Screens/BaseScreen.js";
import { enemy_info_list, EnemyTypeEnum } from '../game_status.js';
import { showBurstWarning } from '../DangerWarning.js';

const wait = (seconds) => new Promise(resolve => setTimeout(resolve, seconds * 1000));

export class EnemyType3 extends EnemyBase {
    constructor(GameScreenContainer, StartShootingX, StartShootingY, StartShootingWidth, StartShootingHeight) {
        const enemyInfo = enemy_info_list[EnemyTypeEnum.E_TYPE_3];
        const BaseConfig = {
            ...enemyInfo,
            enemy_maxhp: enemyInfo.enemy_maxhp * ((0.6 * DifficultyLevel) + 0.4),
            enemy_hp_guage: (DifficultyLevel < 2) ? 2 : 3,
            ETypeTypeID: EnemyTypeEnum.E_TYPE_3
        };
        super(GameScreenContainer, StartShootingX, StartShootingY, StartShootingWidth, StartShootingHeight, BaseConfig);
        this._attackLoopsStarted = false;

        this.SkillDefinitions = {
            0: {
                name: "回転螺旋「渦の中心」",
                NoMoveFlag: false,
                targetX: () => this.StartAreaX + this.NowPlayAreaWidth * 0.5,
                targetY: () => this.StartAreaY + this.NowPlayAreaHeight * 0.2,
                attackFunction: this.AttackSkill1,
                allowMoveAfter: true
            },
            1: {
                name: "追尾「熱源追跡」",
                NoMoveFlag: false,
                targetX: () => this.StartAreaX + this.NowPlayAreaWidth * 0.5,
                targetY: () => this.StartAreaY + this.NowPlayAreaHeight * 0.3,
                attackFunction: this.AttackSkill2,
                allowMoveAfter: true
            },
            2: {
                name: "高速「光速回転」",
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
            this.pattern2_Loop(EnemyBulletArray, TargetPlayer, 2.0);
        }
    }

    /** 風車4方向回転弾 */
    // TODO：変更　風車(6から32方向[難易度により変化])で射出，ある程度まで離れたらその弾は追尾弾としてPlayerの方向に素早く飛んでいく，予測エリアは不要
    // また，使役二体は，扇形にTargetPlayerの方向に向かって中速程度に射出また，扇は3から4本で60度[難易度により変化]，一気に射出するのではなくプレイヤーから遠いほうの角度から1本ずつ射出する
    async pattern1_Loop(EnemyBulletArray, TargetPlayer, initialDelay) {
        await wait(initialDelay);
        let rotAngle = 0;
        while (this.NowHPGuageHP > 0) {
            const dm = 1.0 + DifficultyLevel * 0.5;
            if (this.NowHPGuageHP > 0 && !this.SkillActivate) {
                const arms = 4;
                const speed = 180 * dm;
                for (let i = 0; i < arms; i++) {
                    const a = rotAngle + (i * Math.PI * 2 / arms);
                    EnemyBulletArray.push(new Bullet(this.EnemyContainer, this.x, this.y, {
                        vx: speed * Math.cos(a), vy: speed * Math.sin(a),
                        ax: 0, ay: 0, width: 10, height: 10,
                        damage: 20, life: 15,
                        BulletImageKey: "BulletTypeA", shape: "circle",
                        target: TargetPlayer, trackingStrength: 0
                    }));
                }
                rotAngle += 0.3 / dm;
            }
            await wait(0.2 / dm);
        }
    }

    /** 追尾弾 */
    // TODO：変更　敵はある程度の量を持ちばらつきを持つ弾の集団をTargetPlayerの方向に放つ，感覚としては，歯磨き粉を出したようなイメージ
    // 使い魔はその前にPlayerを中心，画面の上の方に誘導できるようにPlayerの奥側を狙い高速弾を左右からVの字になるように打ち込む
    async pattern2_Loop(EnemyBulletArray, TargetPlayer, initialDelay) {
        await wait(initialDelay);
        while (this.NowHPGuageHP > 0) {
            const dm = 1.0 + DifficultyLevel * 0.4;
            if (this.NowHPGuageHP > 0 && !this.SkillActivate) {
                const n = 2 + Math.floor(DifficultyLevel);
                await showBurstWarning(this.EnemyContainer, this.x, this.y, 45, 0.45);
                if (this.NowHPGuageHP > 0 && !this.SkillActivate) {
                    for (let i = 0; i < n; i++) {
                        const a = (Math.PI * 2 * i / n) + Math.random() * 0.5;
                        EnemyBulletArray.push(new Bullet(this.EnemyContainer, this.x, this.y, {
                            vx: 80 * Math.cos(a), vy: 80 * Math.sin(a),
                            ax: 0, ay: 0, width: 12, height: 12,
                            damage: 30, life: 20,
                            BulletImageKey: "BulletTypeA", shape: "circle",
                            target: TargetPlayer, trackingStrength: 1.5 * dm
                        }));
                    }
                }
            }
            await wait(1.5 / dm);
        }
    }


    // TODO設計する【攻撃パターン4】使い魔が画面中央の左右に移動し．円形に6～32本方向(難易度別)に射出し続ける，本体は上部で動きまくり，ランダムな方向に枯れ葉のように落ちてくる弾をまき散らす


    // TODO設計する【攻撃パターン5】弾をTragetPlaerに向けて直線状に発射する，発射する開始地点を場外に機軸を置き，そこから水平方向にSinで変動させるこの変動は間隔は短く，ほぼ同時発射ぐらいにする
    // 同時に下から上方向に多数の弾が射出され，二次関数上に凸のような軌道を描き下に落ちてくる




    async _skilrun(DeltaTime, TargetPlayer, EnemyBulletArray) {
        super._skilrun(DeltaTime);
        if (this.SkillActivate && !this.IsSkillTextShown) {
            this.IsSkillTextShown = true;
            this.EnemyContainer.emit('skillActivated', true, 5, 0.1);
            const phase = this.MaxEnemyHPGuage - this.NowEnemyHPGuage;
            const def = this._getSkillDefinitionForPhase(phase);
            if (def) this._executeSkill(def, EnemyBulletArray, TargetPlayer);
            else { this.CanMoveFlag = true; }
            this.SkillText.visible = true;
            this.SkillTimerText.visible = true;
            const sy = this.SkillText.y;
            gsap.fromTo(this.SkillText, { y: sy + 20, alpha: 0 }, { y: sy, alpha: 1, duration: 0.8, ease: "power2.out" });
            const ty = this.SkillTimerText.y;
            gsap.fromTo(this.SkillTimerText, { y: ty + 20, alpha: 0 }, { y: ty, alpha: 1, duration: 0.8, ease: "power2.out" });
        }
    }

    /** スペル1: 螺旋弾幕 */
    // TODO 変更:水平方向に中心，縦方向に上部に本体が移動，使い魔はその周囲を回るように楕円で移動しながら下方向に水平弾を打つ
    // これにより網目のドリフト現象のような弾が重なって生成される
    // 本体はTargetPlayerを狙った速い球を打つ，TargetPlayerが移動し続けていたら当たらないはず
    async AttackSkill1(EnemyBulletArray, TargetPlayer) {
        const dm = 1.0 + DifficultyLevel * 0.5;
        let phase = 0;
        while (this.NowHPGuageHP > 0 && this.SkillActivate) {
            const n = 16 + Math.floor(4 * DifficultyLevel);
            for (let i = 0; i < n; i++) {
                const a = phase + (Math.PI * 2 * i / n);
                const spd = 200 * dm;
                EnemyBulletArray.push(new Bullet(this.EnemyContainer, this.x, this.y, {
                    vx: spd * Math.cos(a), vy: spd * Math.sin(a),
                    ax: -5 * Math.cos(a), ay: -5 * Math.sin(a),
                    width: 10, height: 10, damage: 25, life: 18,
                    BulletImageKey: "BulletTypeA", shape: "circle",
                    target: TargetPlayer, trackingStrength: 0
                }));
            }
            phase += 0.15;
            await wait(0.4 / dm);
        }
        this.CanMoveFlag = true;
    }

    /** スペル2: 全方位追尾弾 */
    // TODO 変更:自身はデフォルト位置に移動，球を消さずに，自身の周囲に集める
    // その後，弾を楕円上の動径上において成形し，楕円の中心部分がある程度Playerを追従するように打ち出す
    // 同時に使役キャラは円状と風車状を交互に左右に分かれて射出する
    async AttackSkill2(EnemyBulletArray, TargetPlayer) {
        const dm = 1.0 + DifficultyLevel * 0.5;
        while (this.NowHPGuageHP > 0 && this.SkillActivate) {
            const n = 8 + Math.floor(2 * DifficultyLevel);
            await showBurstWarning(this.EnemyContainer, this.x, this.y, 80, 0.5);
            if (this.NowHPGuageHP > 0 && this.SkillActivate) {
                CircleAndHomeShotFunc(EnemyBulletArray, this.x, this.y, n, 0, 360,
                    { vx: 60, vy: 60, ax: 0, ay: 0, jx: 0, jy: 0, width: 12, height: 12, damage: 35, life: 20, BulletImageKey: "BulletTypeA", shape: "circle" },
                    { ChangeActivation: ChangeActivation.Activate1, vx: 150, vy: 150, ax: 0, ay: 0, jx: 0, jy: 0, LengthParcent: 1.0 },
                    this.NowPlayAreaWidth * 0.12,
                    this.EnemyContainer
                );
            }
            await wait(1.0 / dm);
        }
        this.CanMoveFlag = true;
    }

    // TODO 変更:二重振り子の軌道に変更，本体を一つ目の基本の軸，使役の1つを一つ目の振り子の支店，もう一つの使役を2つ目の振り子の先とする
    // それぞれが円状に玉を発射する　本体は無制限，使役は発出する弾のエリアが決まっており，そのエリアに達すると中心に戻るような挙動をする
    async AttackSkill3(EnemyBulletArray, TargetPlayer) {
        const dm = 1.0 + DifficultyLevel * 0.5;
        let angle = 0;
        let cnt = 1;
        while (this.NowHPGuageHP > 0 && this.SkillActivate) {
            for (let i = 0; i < 6; i++) {
                const a = angle + (i * Math.PI * 2 / 6);
                const spd = 220 * dm;
                EnemyBulletArray.push(new Bullet(this.EnemyContainer, this.x, this.y, {
                    vx: spd * Math.cos(a), vy: spd * Math.sin(a),
                    width: 10, height: 10, damage: 40, life: 18,
                    BulletImageKey: "BulletTypeA", shape: "circle",
                    target: TargetPlayer, trackingStrength: 0
                }));
            }
            angle += 0.08 * Math.log(cnt + 1);
            cnt++;
            await wait(0.1);
        }
        this.CanMoveFlag = true;
    }

    // TODO：ここからhardのみ有効なスペル
    // TODO:スペル4追加，本体がデフォルト位置に移動そこから，風車状で球を発射，また，反対方向に対しても風車状で球を発射，
    // その後，使役キャラが左右に分かれて1体は，Playerのいる方向に三角状になった弾たちを発射
    // 1体は円状に作られた弾たちをPlayer方向に射出する
    // しかしこの使役キャラが撃つ弾たちは非一様な球体のような動きをする，そのため，重心がずれた球体のように加速度が常に変化し続ける
    // 変化する加速度は非常に差が大きくして視覚的にわかるようにする
    
    

    // TODO：ここからLunaticのみ有効なスペル
    // 発動時全弾を消す．使い魔がPLayerを周囲に飛び回るようになる，PLayerに重力を設定，特定の弾(重力弾)が下方向ではなくPLayerの周囲に近づいていくようにする
    // 本体は設定した重力に対して徐々に近づいていく周回軌道になるような速度で射出する重力弾を発射
    // また，追加で通常の円形に射出する弾を打ち出す，本体は左右に移動しながら円形の弾を6発連続で射出(角度は12から32[難易度別])
    // プレイヤーが逃れられなくなるのでそれは塩梅で考える



    _getSkillDefinitionForPhase(phase) { return this.SkillDefinitions[phase]; }
}
