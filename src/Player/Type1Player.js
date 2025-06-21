// Type1のキャラクター性能
import { PlayerBase } from './PlayerBase.js';

import { CharacterTypeEnum, character_info_list, MainBulletEnum, SubBulletEnum, 
    main_bulled_info_list, sub_bulled_info_list } from '../game_status.js';

export class PlayerType1 extends PlayerBase {
    constructor(GameScreenContainer, StartShootingX, StartShootingY, StartShootingWidth, StartShootingHeight) {
        const myCharacterConfig = character_info_list[CharacterTypeEnum.TYPE_1];
        // PlayerBaseのコンストラクタに渡すための共通情報を抽出・設定
        const baseConfig = {
            CharacterTypeID: CharacterTypeEnum.TYPE_1,
            ...myCharacterConfig,
            slowMoveFactor: 0.5, // Type1固有の低速係数（またはmyCharacterConfigからロード）
        };

        super(GameScreenContainer, StartShootingX, StartShootingY, StartShootingWidth, StartShootingHeight, baseConfig);

        this.main_bullet_list = [];
        this.sub_bullet_list = [];

        // スキルの内容は基本自由にさせたいので各クラスで別々に書く
        // スキルによっては発動有効時間が置かれる
        this.skill1WaitTime = 6.0; // 6秒
        this.skill1NowWaitTime = this.skill1WaitTime; // カウンタ
        
        this.skill2WaitTime = 10.0; // 6秒
        this.skill2NowWaitTime = this.skill2WaitTime; // カウンタ
        this.skill2DuringTime = 5.0;
        this.skill2NowDuringTime = 0; // カウンタ
        this.WakeUpSkill2 = false;

        this.Skill1HPRecovery = 20;

        this.BasePassiveSkillTh = 0.5;
        this.PassiveSkillTh = this.BasePassiveSkillTh;
        this.BasePassiveSkillDemageCut = 0.5;
        this.PassiveSkillDemageCut = this.BasePassiveSkillDemageCut;

        this.ULTDuringTime = 5.0;
        this.ULTNowDuringTime = 0; // カウンタ
        this.WakeUpULT = false;
        
    }

    /**
 	 * 非同期の初期化メソッドを追加
	 */
    async Initialize() {
        super.Initialize();
    }

    updateScale(NewScaleFactor, NewCanvas, OldGamePlayerSizeHeight, OldGamePlayerSizeWidth)
    {
        // 規定クラスコンストラクタで呼び出し
        super.updateScale(NewScaleFactor, NewCanvas, OldGamePlayerSizeHeight, OldGamePlayerSizeWidth);

        // このクラス内でサイズを使っている部分を変更

    }

    // 弾を打つ
    _shoot(Keys, PlayerBulletsArray, TargetEnemy, DeltaTime){
        
        // Type1は既定クラスのshotをそのまま使える
        super._shoot(Keys, PlayerBulletsArray, TargetEnemy, DeltaTime);

    }


    // skillの発動の確認を行う
    _skillrun(DeltaTime)
    {
        // Skill1の判定&処理を行う
        this._skillrun1(DeltaTime);
        // Skill2の判定&処理を行う
        this._skillrun2(DeltaTime);
        // ULTの判定&処理を行う
        this._playULT(DeltaTime);
        // Passiveskillの処理
        this._passiveskillrun();

    }

    

    // skill1の発動を行う
    _skillrun1(DeltaTime)
    {

        // クールダウンを確認する
		if(super.isvalidskill(this.CharacterSkillType1)==true){
			if (this.skill1NowWaitTime > 0) { // クールダウン中かチェック
				this.skill1NowWaitTime -= DeltaTime; // クールダウンタイマーを減算
				if (this.skill1NowWaitTime < 0) this.skill1NowWaitTime = 0;
			}else
			{

                this.NowHP += this.Skill1HPRecovery;
                this.NowHP = Math.min(this.NowHP, this.MaxHP); // NowHP と MaxHP のうち、小さい方を選択

                this.skill1NowWaitTime = this.skill1WaitTime; // クールダウン再セット
			}
		}
    }

    // skill2の発動を行う
    _skillrun2(DeltaTime)
    {
        // クールダウンを確認する
		if(super.isvalidskill(this.CharacterSkillType2)==true){
			if (this.skill2NowWaitTime > 0) { // クールダウン中かチェック
				this.skill2NowWaitTime -= DeltaTime; // クールダウンタイマーを減算
				if (this.skill2NowWaitTime < 0) this.skill2NowWaitTime = 0;
			}else
			{
                // 発動                
                this.WakeUpSkill2 = true;

                // たまに追尾性能を追加
                this.trackingStrengthPower = 2.5;
            }
		}

        if(this.WakeUpSkill2 == true){
            // 発動時間が終わったかを確認する
            if(this.skill2NowDuringTime > this.skill2DuringTime){
                this.WakeUpSkill2 = false;
                // 発動時間のカウンタをリセット
                this.skill2NowDuringTime = 0;
                // 発動間隔のカウンタをリセット
                this.skill2NowWaitTime = this.skill2WaitTime; // クールダウン再セット

                // 変更したパラメータをもとに戻す
                this.trackingStrengthPower = this.BasetrackingStrengthPower;

            }else{
                // 発動中のためカウンタを変更する
                this.skill2NowDuringTime += DeltaTime;
            }
        }
    }

    // パッシブスキルの発動
    _passiveskillrun()
    {
        // HPが半分以上ならダメカ50%
        if(this.PassiveSkillTh * this.MaxHP < this.NowHP){
            this.PassiveSkillDemageCut = this.BasePassiveSkillDemageCut;
        }else{
            this.PassiveSkillDemageCut = 0.0;
        }
    } 

    // ULTを発動する
    _playULT(DeltaTime){
        // ボタンを押したか確認
		

        if(this.WakeUpULT == true){
            // 発動時間が終わったかを確認する
            if(this.ULTNowDuringTime > this.ULTDuringTime){
                this.WakeUpULT = false;
                // 発動時間のカウンタをリセット
                this.ULTNowDuringTime = 0;

                // 変更したパラメータをもとに戻す
                this.trackingStrengthPower = this.BasetrackingStrengthPower;

            }else{
                // 発動中のためカウンタを変更する
                this.ULTNowDuringTime += DeltaTime;
            }
        }
    }
}