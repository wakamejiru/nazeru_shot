// リザルト画面
import { BaseScreen, SCREEN_STATE, LastScore, LastIsGameClear } from './BaseScreen.js';

export class ResultScreen extends BaseScreen {
	/**
	 * コンストラクタ
	 * @param {PIXI.Application} App
	 * @param {SCREEN_STATE} ScreenState
	 */
	constructor(App, ScreenState) {
		super(App, ScreenState);
		this.InputCooldown = 0;
		this.COOLDOWN_TIME = 0.3;
		this._selectedIndex = 0; // 戻るボタンのみなので常に0
	}

	/**
	 * 初期化
	 */
	async InitializeScreen(InitialScale) {
		this.NowScale = InitialScale;
		this.ScreenContainer = new PIXI.Container();
		this.App.stage.addChild(this.ScreenContainer);

		// ===== 背景 (半透明の暗いオーバーレイ) =====
		this.BgOverlay = new PIXI.Graphics();
		this.ScreenContainer.addChild(this.BgOverlay);

		// ===== パネル (カード) =====
		this.Panel = new PIXI.Graphics();
		this.ScreenContainer.addChild(this.Panel);

		// ===== 結果タイトルテキスト (GAME CLEAR! / GAME OVER) =====
		this.ResultTitleText = new PIXI.Text('', new PIXI.TextStyle({
			fontFamily: 'DotGothic16',
			fontSize: 80,
			fill: '#ffd700',
			align: 'center',
			dropShadow: true,
			dropShadowColor: '#000000',
			dropShadowBlur: 8,
			dropShadowAngle: Math.PI / 4,
			dropShadowDistance: 6,
		}));
		this.ResultTitleText.anchor.set(0.5);
		this.ScreenContainer.addChild(this.ResultTitleText);

		// ===== スコアラベル =====
		this.ScoreLabelText = new PIXI.Text('SCORE', new PIXI.TextStyle({
			fontFamily: 'DotGothic16',
			fontSize: 36,
			fill: '#aaaaaa',
			align: 'center',
		}));
		this.ScoreLabelText.anchor.set(0.5);
		this.ScreenContainer.addChild(this.ScoreLabelText);

		// ===== スコア数値 =====
		this.ScoreValueText = new PIXI.Text('0', new PIXI.TextStyle({
			fontFamily: 'DotGothic16',
			fontSize: 72,
			fill: '#ffffff',
			align: 'center',
			dropShadow: true,
			dropShadowColor: '#000088',
			dropShadowBlur: 6,
			dropShadowAngle: Math.PI / 4,
			dropShadowDistance: 4,
		}));
		this.ScoreValueText.anchor.set(0.5);
		this.ScreenContainer.addChild(this.ScoreValueText);

		// ===== 区切り線 =====
		this.Divider = new PIXI.Graphics();
		this.ScreenContainer.addChild(this.Divider);

		// ===== 戻るボタン =====
		this.BackButtonBg = new PIXI.Graphics();
		this.ScreenContainer.addChild(this.BackButtonBg);

		this.BackButtonText = new PIXI.Text('マップに戻る', new PIXI.TextStyle({
			fontFamily: 'DotGothic16',
			fontSize: 40,
			fill: '#ffffff',
			align: 'center',
		}));
		this.BackButtonText.anchor.set(0.5);
		this.ScreenContainer.addChild(this.BackButtonText);

		// ===== Enterヒント =====
		this.HintText = new PIXI.Text('[ Enter ] で確定', new PIXI.TextStyle({
			fontFamily: 'DotGothic16',
			fontSize: 24,
			fill: '#888888',
			align: 'center',
		}));
		this.HintText.anchor.set(0.5);
		this.ScreenContainer.addChild(this.HintText);

		super.SetScreenVisible(false);

		// ボタン点滅アニメーション用タイマー
		this._blinkTimer = 0;
		this._blinkVisible = true;
	}

	/**
	 * リサイズ処理
	 */
	ResizeScreen(App, CurrentOverallScale) {
		if (!this.ScreenContainer) return;
		this.NowScale = CurrentOverallScale;

		const W = App.screen.width;
		const H = App.screen.height;

		// 背景オーバーレイ
		this.BgOverlay.clear();
		this.BgOverlay.beginFill(0x000000, 0.75);
		this.BgOverlay.drawRect(0, 0, W, H);
		this.BgOverlay.endFill();

		// パネルサイズ
		const panelW = Math.min(W * 0.65, 900 * CurrentOverallScale);
		const panelH = Math.min(H * 0.72, 600 * CurrentOverallScale);
		const panelX = W / 2 - panelW / 2;
		const panelY = H / 2 - panelH / 2;
		const radius = 24 * CurrentOverallScale;

		this.Panel.clear();
		// グラデーション風の2層描画
		this.Panel.beginFill(0x1a1a2e, 0.97);
		this.Panel.drawRoundedRect(panelX, panelY, panelW, panelH, radius);
		this.Panel.endFill();
		// 枠線
		this.Panel.lineStyle(3 * CurrentOverallScale, 0x4444aa, 1);
		this.Panel.drawRoundedRect(panelX, panelY, panelW, panelH, radius);
		this.Panel.lineStyle(0);

		// 上部の色帯（クリア:金、ゲームオーバー:赤）
		const isGameClear = LastIsGameClear;
		const accentColor = isGameClear ? 0xffd700 : 0xcc2222;
		this.Panel.beginFill(accentColor, 0.18);
		this.Panel.drawRoundedRect(panelX, panelY, panelW, panelH * 0.38, radius);
		this.Panel.endFill();

		// 結果タイトル
		this.ResultTitleText.style.fontSize = 70 * CurrentOverallScale;
		this.ResultTitleText.x = W / 2;
		this.ResultTitleText.y = panelY + panelH * 0.16;

		// スコアラベル
		this.ScoreLabelText.style.fontSize = 30 * CurrentOverallScale;
		this.ScoreLabelText.x = W / 2;
		this.ScoreLabelText.y = panelY + panelH * 0.45;

		// スコア数値
		this.ScoreValueText.style.fontSize = 64 * CurrentOverallScale;
		this.ScoreValueText.x = W / 2;
		this.ScoreValueText.y = panelY + panelH * 0.58;

		// 区切り線
		this.Divider.clear();
		this.Divider.lineStyle(2 * CurrentOverallScale, 0x444488, 0.8);
		this.Divider.moveTo(panelX + panelW * 0.1, panelY + panelH * 0.37);
		this.Divider.lineTo(panelX + panelW * 0.9, panelY + panelH * 0.37);
		this.Divider.lineStyle(0);

		// 戻るボタン
		const btnW = panelW * 0.55;
		const btnH = panelH * 0.12;
		const btnX = W / 2 - btnW / 2;
		const btnY = panelY + panelH * 0.74;
		const btnRadius = 12 * CurrentOverallScale;

		this.BackButtonBg.clear();
		this.BackButtonBg.beginFill(0x2255cc, 1);
		this.BackButtonBg.drawRoundedRect(btnX, btnY, btnW, btnH, btnRadius);
		this.BackButtonBg.endFill();
		this.BackButtonBg.lineStyle(3 * CurrentOverallScale, 0x88aaff, 1);
		this.BackButtonBg.drawRoundedRect(btnX, btnY, btnW, btnH, btnRadius);
		this.BackButtonBg.lineStyle(0);

		this.BackButtonText.style.fontSize = 36 * CurrentOverallScale;
		this.BackButtonText.x = W / 2;
		this.BackButtonText.y = btnY + btnH / 2;

		// Enterヒント
		this.HintText.style.fontSize = 22 * CurrentOverallScale;
		this.HintText.x = W / 2;
		this.HintText.y = panelY + panelH * 0.91;

		// 保存しておく（StartScreenからも使う）
		this._layout = { W, H, panelX, panelY, panelW, panelH, btnW, btnH, btnX, btnY, btnRadius, accentColor, radius, CurrentOverallScale };
	}

	/**
	 * 画面開始
	 */
	async StartScreen() {
		this.InputCooldown = this.COOLDOWN_TIME;
		this._blinkTimer = 0;
		this._blinkVisible = true;

		// 最新のスコアとクリア結果を反映
		const isGameClear = LastIsGameClear;
		this.ResultTitleText.text = isGameClear ? 'GAME CLEAR!' : 'GAME OVER';
		this.ResultTitleText.style.fill = isGameClear ? '#ffd700' : '#ff4444';
		this.ResultTitleText.style.dropShadowColor = isGameClear ? '#aa6600' : '#660000';

		this.ScoreValueText.text = `${LastScore}`;
		this.BackButtonText.text = 'マップに戻る';

		// 表示を更新
		if (this._layout) {
			this.ResizeScreen(this.App, this._layout.CurrentOverallScale);
		}

		super.StartScreen();
	}

	/**
	 * 画面終了
	 */
	EndScreen() {
		super.EndScreen();
	}

	/**
	 * ポーリング処理
	 */
	EventPoll(DeltaTime, InputCurrentState) {
		super.EventPoll(DeltaTime, InputCurrentState);

		if (this.InputCooldown > 0) {
			this.InputCooldown -= DeltaTime;
		}

		// ボタン点滅
		this._blinkTimer += DeltaTime;
		if (this._blinkTimer > 0.55) {
			this._blinkTimer = 0;
			this._blinkVisible = !this._blinkVisible;
			this.BackButtonBg.alpha = this._blinkVisible ? 1.0 : 0.6;
			this.BackButtonText.alpha = this._blinkVisible ? 1.0 : 0.7;
		}

		if (!InputCurrentState || this.InputCooldown > 0) {
			return this.ScreenState;
		}

		// Enter または ゲームパッド決定で Map 画面へ
		let confirmed = false;
		if (InputCurrentState.gamepad?.confirm) {
			confirmed = true;
		} else if (InputCurrentState.keys.has('Enter')) {
			confirmed = true;
		}

		if (confirmed) {
			this.InputCooldown = this.COOLDOWN_TIME;
			return SCREEN_STATE.STAGE_SELECT;
		}

		return this.ScreenState;
	}
}
