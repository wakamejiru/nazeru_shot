# NAZERU SHOT — ゲーム仕様書

> **対象リポジトリ:** `nazeru_shot`  
> **エンジン:** PixiJS v8 + GSAP 3.12 + Howler.js 2.2  
> **対応環境:** Webブラウザ (Chrome 推奨、ES Modules 使用)  
> **基準解像度:** 1920×1080 (16:9)

---

## 1. ゲーム概要

縦スクロール型弾幕シューティングゲーム。  
プレイヤーはキャラクターを選択し、ステージを選択後、ボス敵と戦闘する。  
敵のHPゲージを全て削り取ることがクリア条件。

---

## 2. アーキテクチャ

### 2.1 ファイル構成

```
nazeru_shot/
├── index.html              # エントリポイント
├── style.css               # グローバルCSS
├── src/
│   ├── main.js             # アプリ初期化・ゲームループ管理
│   ├── game_status.js      # マスタデータ（定数・Enum・キャラ/弾/敵情報）
│   ├── asset_manager.js    # 画像アセット管理クラス（現在は未使用）
│   ├── bullet.js           # Bullet クラス（弾の挙動）
│   ├── utils.js            # ユーティリティ関数（Wait, IsChromeBrowser）
│   ├── Buttons/
│   │   └── ButtonBase.js   # CustomButton クラス
│   ├── Enemy/
│   │   ├── EnemyBase.js    # 敵基底クラス
│   │   ├── EnemyType1.js   # 敵タイプ1（実装済み）
│   │   ├── EnemyType2.js   # 敵タイプ2
│   │   └── EnemyShot.js    # 敵弾発射パターン関数群
│   ├── Player/
│   │   ├── PlayerBase.js   # プレイヤー基底クラス
│   │   └── Type1Player.js  # プレイヤータイプ1（実装済み）
│   ├── Screens/
│   │   ├── BaseScreen.js   # 画面基底クラス・SCREEN_STATE Enum
│   │   ├── LoadScreen.js   # ロード画面
│   │   ├── LogoScreen.js   # ロゴ演出画面
│   │   ├── WaitingScreen.js # ウェイト画面
│   │   ├── TitleScreen.js  # タイトル画面
│   │   ├── DifficultySelectScreen.js # 難易度選択画面
│   │   ├── MapScreen.js    # ステージ選択画面
│   │   ├── CharaSelectScreen.js # キャラクター選択画面
│   │   └── GameScreen.js   # ゲームプレイ画面
│   └── inputs/
│       └── InputManager.js # 入力管理クラス（キーボード・マウス・ゲームパッド）
├── image/                  # 画像アセット
└── music/                  # 音楽・音声アセット
```

### 2.2 ゲームループ

```
InitializeGame()
  └─ LoadScreen インスタンス作成・表示
  └─ requestAnimationFrame(GameLoop)

GameLoop(CurrentTime)
  ├─ DeltaTime 計算（最大 0.1 秒にクランプ）
  ├─ InputManager.getState() → InputCurrentState
  ├─ LOADING 中: UpdateLoadingLogic() を実行（非同期で全画面インスタンスを順次生成）
  ├─ NowScreenInstance.EventPoll(DeltaTime, InputCurrentState) → NextScreen
  ├─ 画面遷移検出時:
  │   ├─ EndScreen() で現在画面を非表示
  │   ├─ StartScreen() で次の画面を表示
  │   └─ 入力ラグタイマーをリセット
  └─ requestAnimationFrame(GameLoop)  // 再帰ループ
```

### 2.3 画面遷移フロー

```
LOADING → LOGO_SCREEN → WATING_SCREEN → GAME_TITLE
  → DIFFICULTY_SELECT → STAGE_SELECT → CHARACTER_SELECT → GAMEPLAY
```

---

## 3. 画面仕様

### 3.1 SCREEN_STATE（定数）

| 定数名 | 値 | 説明 |
|---|---|---|
| `LOADING` | `'loading'` | ロード画面 |
| `WATING_SCREEN` | `'Wating'` | ウェイト画面 |
| `LOGO_SCREEN` | `'logo_screen'` | ロゴアニメーション |
| `GAME_TITLE` | `'game_title'` | タイトル画面 |
| `MODE_SELECT` | `'mode_select_settings'` | モード選択（未使用） |
| `DIFFICULTY_SELECT` | `'difficulty_setting'` | 難易度選択 |
| `STAGE_SELECT` | `'stage_select'` | ステージ選択 |
| `CHARACTER_SELECT` | `'character_select'` | キャラ選択 |
| `GAMEPLAY` | `'gameplay'` | ゲームプレイ |

### 3.2 各画面の役割

| 画面 | クラス | 役割 |
|---|---|---|
| LoadScreen | `LoadScreen` | アニメーション付きロード演出。全画面インスタンスが揃ったらLOGOへ遷移 |
| LogoScreen | `LogoScreen` | ロゴアニメーション(85フレーム)。何かキーを押すとスキップしWATINGへ |
| WaitingScreen | `WaitingScreen` | 待機画像表示。キー入力でTITLEへ遷移 |
| TitleScreen | `TitleScreen` | タイトル＋ゲームスタートボタン → DIFFICULTY_SELECT |
| DifficultySelectScreen | `DifficultySelectScreen` | 難易度0(Easy)/1/2 選択。`DifficultyLevel`グローバル変数に設定 |
| MapScreen | `MapScreen` | ステージ選択。`MapIndex` グローバル変数に設定 |
| CharaSelectScreen | `CharaSelectScreen` | キャラ選択。`CharaIndex` グローバル変数に設定 |
| GameScreen | `GameScreen` | ゲームプレイ本体 |

---

## 4. ゲームプレイ仕様（GameScreen）

### 4.1 レイアウト

| 領域 | 位置・サイズ |
|---|---|
| 全体背景 | アスペクト比維持で画面フィット |
| シューティング画面 | 全体幅の50%・高さ90%、左オフセット10% |
| スコアパネル | 右側30%×20% |
| ULTパネル | スコアパネル下 |

### 4.2 表示要素

- **シューティングエリア**: プレイヤー・敵・弾が存在する領域、クリッピングマスクで区切られる
- **スコア表示**: `Score: 0` テキスト（現在スコア加算ロジックは未実装）
- **HPバー**: プレイヤーのHP残量をゲージで表示（緑/黄/赤に変化）
- **ULTポイント**: 星形アイコン5個（ON/OFFで表示切替）

### 4.3 プレイヤーHPバーの色変化

| HP割合 | 色 |
|---|---|
| 50%以上 | 緑 (0x00FF00) |
| 30%以上50%未満 | 黄 (0xFFFF00) |
| 30%未満 | 赤 (0xFF0000) |

---

## 5. プレイヤー仕様

### 5.1 PlayerBase（基底クラス）

| プロパティ | 説明 |
|---|---|
| `x`, `y` | プレイヤー位置（シューティングエリア中央下80%に初期配置） |
| `BaseSpeed` | 基本速度 (px/秒) |
| `SlowMoveFactor` | Z/LT押下時の速度倍率（Type1: 0.5） |
| `MaxHP`, `NowHP` | 最大HP・現在HP |
| `MBulletKey`, `SBulletKey` | メイン/サブ弾のEnum値 |
| `trackingStrengthPower` | 弾の追尾強度 |

**操作:**
- 移動: 矢印キー / 左スティック / D-Pad
- 低速移動: Z キー / 左トリガー(Button6) → `SlowMoveFactor`倍の速度、当たり判定円表示
- 射撃: 常時自動射撃（`EventPoll`内で毎フレーム `_shoot` 呼び出し）

**移動制限:**
- シューティングエリア内に常時クランプ（`IsAreaIn()`）

### 5.2 Type1Player

| パラメータ | 値 |
|---|---|
| 基本速度 | 200 px/秒 |
| 最大HP | 1,000,000 |
| 倍率 | 0.5 |
| メイン弾 | M_BULLET_1（3方向扇形） |
| サブ弾 | S_BULLET_1（6方向広角） |

**スキル:**

| スキル | 種別 | 効果 | クールダウン |
|---|---|---|---|
| スキル1 | 小回復 | HP +20（MaxHP上限） | 6秒 |
| スキル2 | 追尾付与 | trackingStrengthPower = 2.5、5秒間持続 | 10秒 |
| パッシブ | HP閾値ダメカ | HP 50%以上でダメージカット50% | 常時 |
| ULT | 無敵 | 5秒間（フラグ管理のみ、実際の無敵処理は未実装） | - |

---

## 6. 弾 仕様（Bullet クラス）

### 6.1 弾パラメータ

| フィールド | 説明 |
|---|---|
| `vx`, `vy` | 初速 (px/秒) |
| `ax`, `ay` | 加速度 (px/秒²) |
| `jx`, `jy` | 加加速度 (px/秒³) |
| `maxSpeed` | 最大速度 |
| `damage` | ダメージ量 |
| `life` | 弾の耐久値（時間ではなくヒット数基準） |
| `shape` | 当たり判定形状: `'circle'` / `'rectangle'` / `'ellipse'` |
| `width`, `height` | 当たり判定サイズ |
| `BulletImageKey` | `ImageAssetPaths` のキー名 |
| `trackingStrength` | 追尾性能（0=追尾なし, >0=1秒あたりの旋回ラジアン） |
| `target` | 追尾対象インスタンス |

### 6.2 弾の挙動（毎フレーム update()）

1. `ActivationLength` 距離到達で挙動変化（`UpdateActivation()`）
2. 追尾計算（`trackingStrength > 0` 時）
3. 加加速度 → 加速度 → 速度 → 位置の順で積分
4. サインカーブ揺れ（`sine_wave_enabled` が true 時）
5. 表示位置更新（`DrwaUpdate()`）

### 6.3 弾削除条件

- `isHit === true`
- シューティングエリア外 に出た

### 6.4 プレイヤー弾 定義（game_status.js）

| キー | 弾数 | 説明 |
|---|---|---|
| M_BULLET_1 | 3 | 扇形3方向 |
| M_BULLET_2 | 2 | 左右2点から平行 |
| M_BULLET_3 | 2 | 左右2点から平行（M_BULLET_2 と同パラメータ） |
| M_BULLET_4 | 2 | 左右2点から平行（M_BULLET_2 と同パラメータ） |
| S_BULLET_1 | 6 | 広角6方向 |
| S_BULLET_2 | 5 | 正五角形配置から平行 |
| S_BULLET_3 | 5 | 中心から放射 |
| S_BULLET_4 | 6 | 中心から放射（S_BULLET_3の別設定） |

---

## 7. 敵 仕様

### 7.1 EnemyBase（基底クラス）

| プロパティ | 説明 |
|---|---|
| `x`, `y` | 初期位置（シューティングエリア上部20%） |
| `MaxHP` | 最大HP |
| `MaxEnemyHPGuage` | HPゲージ本数 |
| `EnemyHitPointRadius` | 当たり判定半径 |
| `ELimitBreakPoint` | スキル発動HPパーセント閾値（0.0～1.0） |

**移動AI:**
- `NextMoveTargetInterval` 秒ごとに新しい移動先を選択
- 移動先はエリア上1/3内のランダム座標
- 到達後 `MoveWaitDuration` 秒停止
- `CanMoveFlag = false` で移動停止（スキル発動中）

**HPゲージシステム:**
- ゲージが0になると `gaugeBroken` イベントを発行
- 全ゲージ消滅で敵撃破
- 各ゲージ破壊時に弾が消える演出あり（`TriggerEmphasisEffect`）

**スキルシステム:**
- HP閾値（`ELimitBreakPoint`）到達で `SkillActivate = true`
- `SkillTimer`（99秒）カウントダウン開始
- タイマー切れまたはゲージ破壊で次フェーズへ

### 7.2 EnemyType1 固有仕様

**難易度別HP:**
- `enemy_maxhp × (0.6 × DifficultyLevel + 0.4)`

**難易度別ゲージ数:**
- DifficultyLevel < 2: 2本
- DifficultyLevel ≥ 2: 3本

**通常攻撃（3パターン並列 async ループ）:**

| パターン | 内容 | 初期遅延 |
|---|---|---|
| Pattern1 | 扇形弾（プレイヤー追尾方向へ） | 0.3秒 |
| Pattern2 | 円形弾（4点から順番に放射）+ 挙動変化 | 1.5秒 |
| Pattern3 | 単発大型弾（プレイヤー狙い） | 2.0秒 |

**スキル（フェーズ別）:**

| フェーズ | スキル名 | 内容 |
|---|---|---|
| 0 | 五月雨 | 上下揺れ付き多数弾をばら撒く弾幕 |
| 1 | 四重奏のプレリュード | 4地点から円形弾を順次発射、HP減少で間隔短縮 |
| 2 | 十字 | 中心から4方向へ、対数加速で回転する十字弾 |

---

## 8. 入力仕様（InputManager）

### 8.1 対応デバイス

| デバイス | 状態取得方法 |
|---|---|
| キーボード | `event.code` で `Set` 管理（keydown/keyup） |
| マウス | left/middle/right ボタン、位置 |
| ゲームパッド | `navigator.getGamepads()` ポーリング、接続/切断イベント |

### 8.2 キー割り当て（プレイヤー）

| キー | ゲームパッド | 動作 |
|---|---|---|
| 矢印キー | 左スティック / D-Pad | 移動 |
| Z | 左トリガー (Button6) | 低速移動 |
| Enter | A ボタン (Button0) | 決定 |

### 8.3 デッドゾーン

- スティック: 0.25（移動判定）/ 0.5（入力有無判定）

---

## 9. 当たり判定仕様

### 9.1 プレイヤー vs 敵弾

- プレイヤーは常に**円形**（`HitPointRadius`）
- 敵弾の形状に応じて分岐:
  - `circle`: 円-円判定
  - `rectangle`: 円-矩形判定
  - `ellipse`: 円-楕円判定
  - `line`: 円-矩形判定（仮実装）
  - 未定義: 矩形判定（警告出力）

### 9.2 敵 vs プレイヤー弾

- 敵も常に**円形**（`EnemyHitPointRadius`）
- 弾は常に円形として判定

### 9.3 ヒット時処理

**プレイヤー被弾:**
1. HP -= `bullet.damage`
2. HPバー更新
3. 弾破棄・配列削除
4. HP ≤ 0 → GAME OVER ログ（処理は未実装）

**敵被弾:**
1. `DamageHit(damage)` → `NowHPGuageHP -= damage`
2. ゲージ枯渇 → `UpdateEndHPGuage()`
3. 弾を `isHit = true` に（次フレームで除去）
4. 全ゲージ消滅 → 敵撃破ログ（処理は未実装）

---

## 10. リサイズ仕様

- `window.resize` イベント → `ResizeGame()` → 全 Screen の `ResizeScreen()` を呼び出し
- スケール基準: **幅1920pxを基準値（OVERALL_BASE_WIDTH）** とする `MainScaleFactor`
- 全 Sprite のサイズ・位置を `MainScaleFactor` 乗算で再計算
- プレイヤー/敵の論理座標は相対位置（旧サイズの比率）で保持し変換

---

## 11. アセット管理

### 11.1 画像ロード方式

- 弾アセット: `main.js` 起動時に `Bullet.loadAssets()` で一括ロード（`PIXI.Assets.load`）
- 各画面固有アセット: 各 Screen の `InitializeScreen()` 内で個別ロード
- 画像パスは全て `game_status.js` の `ImageAssetPaths` オブジェクトで管理

### 11.2 音声

- `game_status.js` の `MusicOrVoicePaths` で管理
- Howler.js を使用（現状はボタン SE のみ実装）

---

## 12. 既知の問題・未実装項目

| 項目 | 状態 |
|---|---|
| ゲームオーバー処理 | ログ出力のみ（`console.log("GAME OVER")`） |
| 敵撃破後の処理 | ログ出力のみ |
| スコア加算 | UI のみ、実際の加算ロジックなし |
| プレイヤー無敵時間 | ULT のフラグ管理のみ |
| フェードイン/アウト | 変数宣言はあるが未実装 |
| AssetManager | クラスは実装済みだが main.js では未使用 |
| EnemyType2 | ファイル存在、内容は独自実装 |
| `bulled_life` | `bullet_life` のタイポ（game_status.js・PlayerBase.js 間で一致しているため動作上は問題なし） |
| `DrwaUpdate()` | `DrawUpdate()` のタイポ（動作上は問題なし） |
| `jeak_x/y` | `jerk_x/y` のタイポ（動作上は問題なし） |
| `UpdateLoadingLigicState` | `UpdateLoadingLogicState` のタイポ |
| `WatingScreen` import | `WaitingScreen` のタイポ（動作上は問題なし） |
| `TitileScreen` import | `TitleScreen` のタイポ（動作上は問題なし） |
| `S_BULLET_4` の `bullet_number` | `ullet_number` のタイポ（先頭 `b` が欠落） |
| `isAttackendfuc` の `AttackWWatingTime` | `AttackWatingTime` のタイポ（ダブル `W`）|
| `utils.js Wait()` | 内部で `await waitfunc()` を呼ぶが、呼び出し元で `await` していない箇所がある |

---

*このドキュメントは 2026-06-08 にソースコードより自動解析して生成。*
