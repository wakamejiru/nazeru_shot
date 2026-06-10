// DangerWarning.js
// 弾が出る前にプレイヤーへ危険域を知らせる警告エフェクト群
// すべての関数は await 可能な Promise を返す
// 警告が終わったタイミングで弾を発射することで、避けるヒントを与える

const WARNING_COLOR      = 0xff2222; // 赤
const WARNING_ALPHA_PEAK = 0.45;     // 最大透過度（半透明）
const WARNING_FLASH_COLOR = 0xff6666;// 点滅時の色

/**
 * 警告エフェクトを生成して一時的に表示する内部ヘルパー
 * @param {PIXI.Container} container - 描画コンテナ
 * @param {Function} drawFn - g => void でグラフィックを描く関数
 * @param {number} holdDuration - 警告表示時間(秒)
 * @returns {Promise} 警告が消えたら resolve
 */
function _showWarning(container, drawFn, holdDuration) {
    return new Promise(resolve => {
        const g = new PIXI.Graphics();
        drawFn(g);
        g.alpha = 0;
        container.addChild(g);

        // フェードイン → 保持 → フェードアウト
        gsap.timeline({
            onComplete: () => {
                container.removeChild(g);
                g.destroy();
                resolve();
            }
        })
        .to(g, { alpha: WARNING_ALPHA_PEAK, duration: 0.15, ease: "power1.in" })
        .to(g, { alpha: WARNING_ALPHA_PEAK * 0.6, duration: holdDuration * 0.4, ease: "none" })
        .to(g, { alpha: WARNING_ALPHA_PEAK, duration: holdDuration * 0.3, ease: "none" })
        .to(g, { alpha: 0, duration: 0.2, ease: "power2.out" });
    });
}

/**
 * 線形警告 — 射出元から指定方向へ伸びる赤いビーム
 * 高速直進弾・狙い撃ち弾の前に使用する
 * @param {PIXI.Container} container
 * @param {number} fromX - 発射元X
 * @param {number} fromY - 発射元Y
 * @param {number} toX   - 目標X（プレイヤーの座標など）
 * @param {number} toY   - 目標Y
 * @param {number} beamWidth  - ビーム幅(px) デフォルト30
 * @param {number} beamLength - ビーム長(px) デフォルト画面全域想定で600
 * @param {number} holdDuration - 警告表示時間(秒) デフォルト0.7
 * @returns {Promise}
 */
export function showLineWarning(container, fromX, fromY, toX, toY, beamWidth = 30, beamLength = 600, holdDuration = 0.7) {
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);

    return _showWarning(container, (g) => {
        g.beginFill(WARNING_COLOR, 1);
        // 矩形を角度に合わせて回転させる
        // anchorがないので手動で回転する transform で描く
        // x/y をロール中心として、回転はcontainerのpivotで制御する代わりに
        // GraphicsをContainerでラップする
        // ここでは直接 rotation を使う
        g.drawRect(0, -beamWidth / 2, beamLength, beamWidth);
        g.endFill();
        // グラデーション風: 先端を薄くするために追加の矩形（透明度は親のalphaで制御）
        g.beginFill(0xffffff, 0.3);
        g.drawRect(0, -2, beamLength, 4); // 中心の明るいライン
        g.endFill();

        g.x = fromX;
        g.y = fromY;
        g.rotation = angle;
    }, holdDuration);
}

/**
 * 円形爆発警告 — 指定座標を中心とした半透明赤円
 * 飽和・全方位弾・スキル発動前に使用する
 * @param {PIXI.Container} container
 * @param {number} cx - 中心X
 * @param {number} cy - 中心Y
 * @param {number} radius - 警告円の半径(px)
 * @param {number} holdDuration - 警告表示時間(秒) デフォルト0.8
 * @returns {Promise}
 */
export function showBurstWarning(container, cx, cy, radius, holdDuration = 0.8) {
    return _showWarning(container, (g) => {
        // 外枠（縁取り）
        g.lineStyle(3, WARNING_COLOR, 0.9);
        g.beginFill(WARNING_COLOR, 1);
        g.drawCircle(cx, cy, radius);
        g.endFill();
        // 内側に小さな円（視認性を上げる）
        g.lineStyle(2, 0xffffff, 0.5);
        g.drawCircle(cx, cy, radius * 0.6);
    }, holdDuration);
}

/**
 * 矩形エリア警告 — 上から降る雨弾・水平レーザーなどに使用する
 * @param {PIXI.Container} container
 * @param {number} x - 左上X
 * @param {number} y - 左上Y
 * @param {number} w - 幅(px)
 * @param {number} h - 高さ(px)
 * @param {number} holdDuration - 警告表示時間(秒) デフォルト0.7
 * @returns {Promise}
 */
export function showAreaWarning(container, x, y, w, h, holdDuration = 0.7) {
    return _showWarning(container, (g) => {
        g.lineStyle(3, WARNING_COLOR, 0.9);
        g.beginFill(WARNING_COLOR, 1);
        g.drawRect(x, y, w, h);
        g.endFill();
        // 横縞パターン（危険域をより視覚的に）
        g.lineStyle(1, 0xffffff, 0.2);
        const stripeSpacing = 12;
        for (let i = 0; i * stripeSpacing < h; i++) {
            g.moveTo(x, y + i * stripeSpacing);
            g.lineTo(x + w, y + i * stripeSpacing);
        }
    }, holdDuration);
}

/**
 * スポット警告 — 特定座標に出現する弾（画面外からの奇襲）の前に使用する
 * 小さな点滅する円で出現位置を示す
 * @param {PIXI.Container} container
 * @param {number} cx - 出現X
 * @param {number} cy - 出現Y
 * @param {number} radius - 警告円の半径(px) デフォルト20
 * @param {number} holdDuration - デフォルト0.6
 * @returns {Promise}
 */
export function showSpotWarning(container, cx, cy, radius = 20, holdDuration = 0.6) {
    return _showWarning(container, (g) => {
        g.lineStyle(3, WARNING_COLOR, 1.0);
        g.beginFill(WARNING_COLOR, 1);
        g.drawCircle(cx, cy, radius);
        g.endFill();
        // 中心の×印で「ここに弾が来る」を示す
        const cross = radius * 0.4;
        g.lineStyle(2, 0xffffff, 0.8);
        g.moveTo(cx - cross, cy - cross); g.lineTo(cx + cross, cy + cross);
        g.moveTo(cx + cross, cy - cross); g.lineTo(cx - cross, cy + cross);
    }, holdDuration);
}

/**
 * 扇形警告 — 扇形弾幕の範囲を示す
 * @param {PIXI.Container} container
 * @param {number} cx - 扇の頂点X
 * @param {number} cy - 扇の頂点Y
 * @param {number} radius - 扇の半径
 * @param {number} startAngleRad - 開始角度(ラジアン)
 * @param {number} endAngleRad   - 終了角度(ラジアン)
 * @param {number} holdDuration
 * @returns {Promise}
 */
export function showFanWarning(container, cx, cy, radius, startAngleRad, endAngleRad, holdDuration = 0.7) {
    return _showWarning(container, (g) => {
        g.lineStyle(2, WARNING_COLOR, 0.8);
        g.beginFill(WARNING_COLOR, 1);
        g.moveTo(cx, cy);
        g.arc(cx, cy, radius, startAngleRad, endAngleRad);
        g.lineTo(cx, cy);
        g.endFill();
    }, holdDuration);
}

/**
 * 複数の警告を同時に表示する（並列実行）
 * @param {Array<Promise>} warningPromises - showXxxWarning(...) の戻り値の配列
 * @returns {Promise} 全て終わったら resolve
 */
export function showWarningsParallel(warningPromises) {
    return Promise.all(warningPromises);
}
