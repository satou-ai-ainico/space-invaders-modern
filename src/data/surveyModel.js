// ============================================================================
// 現地調査ヒアリング 入力UI データモデル（要件定義 v4 準拠）
//
// - 新人ガイド4点セット（判断めやす／用語ミニ解説／質問文／見本写真プレースホルダ）
// - 全部位スキャン：水回り5＋内装3＝8部位
// - アップセル診断3点（設置年数／劣化／型番・現況仕様）は対象外でも必須
// - 寿命めやす超過・「要注意」で提案候補（アップセルの芽）を自動抽出
// - 条件分岐：マンション／旧耐震（築1981以前）で項目が増える
// ============================================================================

// 入力形式
//   text / textarea / number / date / select / multiselect / photo / checklist
// required:
//   true          … 常に必須
//   'target'      … その部位が「対象」のとき必須（第2部の詳細項目）
//   'mansion'     … 物件種別＝マンションのとき必須
//   'prequake'    … 築1981以前（旧耐震）のとき必須
//   false / 省略  … 任意

// ---------------------------------------------------------------------------
// 第1部　共通ヒアリング
// ---------------------------------------------------------------------------
export const part1 = {
  id: 'part1',
  title: '第1部　共通ヒアリング',
  subtitle: '毎回・部位に関係なく確認',
  groups: [
    {
      id: '1-0',
      name: '1-0 基本情報',
      items: [
        { id: '1-0-1a', label: '調査日', type: 'date', required: true },
        { id: '1-0-1b', label: '担当者・同行者', type: 'text', required: true, placeholder: '例）担当◯◯ / 同行◯◯' },
        {
          id: '1-0-2', label: '物件種別', type: 'select', required: true,
          options: ['戸建', 'マンション', '店舗'],
          guide: { meyasu: '以降の分岐の起点。マンションなら管理規約や遮音等級の確認が増えます。' },
        },
        {
          id: '1-0-3', label: '構造', type: 'select', required: true,
          options: ['木造', 'RC', '鉄骨', '不明'],
          guide: { term: 'RC＝鉄筋コンクリート。壁を壊せる範囲が構造で変わります。' },
        },
        {
          id: '1-0-4', label: '築年・竣工年（西暦）', type: 'number', required: true, unit: '年',
          guide: { meyasu: '1981年以前は旧耐震。耐震関連の項目が必須になります。' },
        },
        {
          id: '1-0-5', label: '既存図面の有無', type: 'select', required: true,
          options: ['あり', 'なし', '一部あり'],
          guide: { script: '「新築時の図面はお手元にありますか？」' },
        },
        {
          id: '1-0-6', label: '立会者＝意思決定者か', type: 'select', required: true,
          options: ['はい', 'いいえ', '一部'],
        },
      ],
    },
    {
      id: '1-1',
      name: '1-1 要望・目的（真のニーズの入口）',
      items: [
        {
          id: '1-1-1', label: 'きっかけ・困りごと', type: 'textarea', required: true,
          guide: { script: '「一番気になっているのはどこですか？」', meyasu: 'ヒアリングシートで優先順位を確認しながら。' },
        },
        {
          id: '1-1-2', label: 'お客様が挙げた工事対象', type: 'multiselect', required: true,
          options: ['キッチン', '浴室', '洗面所', 'トイレ', 'クロス', '和室→洋室', '間仕切り壁', '外壁', '屋根', '防水', '給湯機'],
          guide: { meyasu: 'ここで挙がった対象は第2部の初期フラグに反映。挙がっていない部位も全てスキャンします。' },
        },
        {
          id: '1-1-3', label: '目的', type: 'multiselect', required: true,
          options: ['老朽化', '家族構成の変化', '断熱・省エネ', 'デザイン', 'バリアフリー', 'その他'],
        },
        { id: '1-1-4', label: '優先順位・譲れない点', type: 'textarea', required: true },
        { id: '1-1-5', label: '完成イメージ（写真・SNS等）', type: 'photo', required: false, guide: { meyasu: '任意。イメージ写真やURLがあれば。' } },
      ],
    },
    {
      id: '1-2',
      name: '1-2 暮らし・家族',
      items: [
        {
          id: '1-2-1', label: '家族構成・年齢', type: 'textarea', required: true,
          guide: { meyasu: '個人情報につき取扱注意。台帳へは必要範囲で。' },
        },
        {
          id: '1-2-2', label: '将来の変化', type: 'multiselect', required: true,
          options: ['出産', '独立', '同居', '介護', '予定なし'],
          guide: { script: '「今後ご家族構成が変わるご予定はありますか？」' },
        },
        { id: '1-2-3', label: '残す家具家電／買い替え予定', type: 'textarea', required: true, guide: { meyasu: '採寸・搬入と連動。大きな荷物は内装工事にも影響。' } },
        { id: '1-2-4', label: 'ペット・アレルギー配慮', type: 'text', required: false },
      ],
    },
    {
      id: '1-3',
      name: '1-3 予算・資金・スケジュール',
      items: [
        { id: '1-3-1', label: '予算感・上限', type: 'text', required: true, placeholder: '例）〜300万 / 応相談' },
        { id: '1-3-2', label: '資金計画', type: 'select', required: true, options: ['自己資金', 'ローン', '併用', '未定'] },
        {
          id: '1-3-3', label: '補助金・減税の希望', type: 'multiselect', required: true,
          options: ['省エネ', '耐震', '介護', '不要', '要相談'],
          guide: { meyasu: '省エネ・耐震・介護で該当することが多い。' },
        },
        { id: '1-3-4', label: '希望時期／仮住まいの要否', type: 'text', required: true },
        { id: '1-3-5', label: '意思決定者・決裁プロセス', type: 'text', required: true },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// 第2部　全部位スキャン（水回り5＋内装3）
//   各部位に共通のアップセル診断3点（year/decay/model）を自動付与
// ---------------------------------------------------------------------------
export const parts2 = [
  // ---------------- 水回り ----------------
  {
    id: 'ub', name: 'ユニットバス（UB）', category: '水回り', order: 1,
    term: 'UB＝工場製の一体型ユニットバス。', lifespan: 15, lifeLabel: '15〜20年',
    modelLabel: '現況メーカー・型番（ドアの品番シール等）',
    details: [
      { id: 'ub-koho', label: '建築工法', type: 'select', required: 'target', options: ['在来木軸', '2×4', 'プレハブ', 'RC'] },
      {
        id: 'ub-door', label: 'ドア位置と浴槽内寸法（洗面側/浴室側・A・B・C）', type: 'text', required: 'target',
        guide: { meyasu: '必要有効寸法510mm。(B＋C)−A が510より大きいと窓と浴槽が干渉する可能性→お客様に事前連絡。' },
      },
      { id: 'ub-mado', label: '間口の有効寸法（W/H/D）', type: 'text', required: 'target' },
      { id: 'ub-hanning', label: '搬入経路（廊下・玄関 W/H）', type: 'text', required: 'target', guide: { meyasu: '見て搬入可能なら測定は省略可。' } },
      { id: 'ub-nessei', label: '熱源', type: 'select', required: 'target', options: ['ガス給湯器', '温水器', 'エコキュート', 'その他'], guide: { meyasu: '対象外でも熱源の年数・型番はアップセル診断で記録（給湯機提案の起点）。' } },
      { id: 'ub-kyuto', label: '給湯機器設備', type: 'select', required: 'target', options: ['強制循環（1つ穴）', '自然循環（2つ穴）', '落とし込み式'], guide: { meyasu: '穴の数で判別：1つ穴＝強制循環／2つ穴＝自然循環。' } },
      { id: 'ub-kanki', label: '換気設備', type: 'select', required: 'target', options: ['直接換気（中間ダクトファン）', '間接換気（吸込口のみ）'] },
      { id: 'ub-hari', label: '梁の大きさ（マンションで多い）', type: 'text', required: false },
      {
        id: 'ub-nayami', label: 'お悩み（複数可）', type: 'multiselect', required: 'target',
        options: ['掃除しにくい', '洗い場が小さい', '収納がない', '浴槽が小さい', '寒い', 'その他'],
        guide: { script: '「お風呂で困っていることはありますか？」深掘り：掃除→場所・原因、寒い→冷たい場所（床/壁/窓）。' },
      },
    ],
    photos: [
      { id: 'ub-p1', label: '熱源' },
      { id: 'ub-p2', label: '排水桝（トラップ桝か確認）' },
      { id: 'ub-p3', label: '浴槽エプロン外し（必要時）' },
      { id: 'ub-p4', label: 'ドアの品番シール' },
      { id: 'ub-p5', label: '点検口を開けて4面' },
    ],
    script: 'ヒアリングシート冒頭のスクリプト参照リンクを表示（本文は別管理）。',
  },
  {
    id: 'zairai', name: '在来浴室', category: '水回り', order: 2,
    term: '在来浴室＝タイル張りの現場施工の浴室。', lifespan: 15, lifeLabel: '15〜20年',
    modelLabel: '現況の仕様・型番（分かる範囲＋写真）',
    details: [
      { id: 'zr-koho', label: '建築工法', type: 'select', required: 'target', options: ['在来木軸', '2×4', 'プレハブ', 'RC'] },
      { id: 'zr-door', label: 'ドア位置・浴槽内寸法／ドア段差', type: 'text', required: 'target' },
      { id: 'zr-mado', label: '窓（巾/高さ/取付高さ/左右壁から）', type: 'text', required: 'target' },
      { id: 'zr-nessei', label: '熱源', type: 'select', required: 'target', options: ['ガス給湯器', '温水器', 'エコキュート', 'その他'] },
      { id: 'zr-sw', label: 'スイッチ位置（入口から/床から）', type: 'text', required: 'target' },
      { id: 'zr-kyuto', label: '給湯機器方式', type: 'select', required: 'target', options: ['強制循環（1つ穴）', '自然循環（2つ穴）', '落とし込み式'] },
      { id: 'zr-kanki', label: '換気設備', type: 'select', required: 'target', options: ['直接換気', '間接換気'] },
      { id: 'zr-bunden', label: '分電盤（位置/容量）', type: 'text', required: 'target' },
      { id: 'zr-nayami', label: 'お悩み（UBに準じる）', type: 'multiselect', required: 'target', options: ['掃除しにくい', '洗い場が小さい', '収納がない', '浴槽が小さい', '寒い', 'その他'] },
    ],
    photos: [
      { id: 'zr-p1', label: '熱源' },
      { id: 'zr-p2', label: '排水桝（トラップ桝か確認）' },
      { id: 'zr-p3', label: '浴槽エプロン外し（必要時）' },
      { id: 'zr-p4', label: '分電盤' },
    ],
  },
  {
    id: 'kitchen', name: 'キッチン', category: '水回り', order: 3,
    lifespan: 15, lifeLabel: '15〜20年',
    modelLabel: '現況メーカー・型番（キッチン全体＋銘板）',
    details: [
      { id: 'kc-madozunpo', label: '窓寸法（W/H・床壁からの高さ）', type: 'text', required: 'target' },
      { id: 'kc-tsuri', label: '吊り戸棚/巾木/キッチンパネル寸法', type: 'text', required: 'target' },
      { id: 'kc-konro', label: 'コンロ位置', type: 'select', required: 'target', options: ['左コンロ', '右コンロ'] },
      { id: 'kc-gas', label: 'ガス種', type: 'select', required: 'target', options: ['都市ガス', 'プロパン'], guide: { meyasu: '見分け5法：①ステッカー ②ボンベ有無 ③警報機位置(天井=都市ガス/床=プロパン) ④ホース色(白=都市/橙=プロパン) ⑤使用明細。' } },
      { id: 'kc-tenken', label: '床下点検口', type: 'select', required: 'target', options: ['有', '無'] },
      { id: 'kc-shiage', label: '仕上げ材（床/壁/天井）', type: 'text', required: 'target', placeholder: '床:CF/フローリング/フロアタイル 壁:クロス/漆喰/パネル 天井:クロス/漆喰' },
      { id: 'kc-hannyu', label: '搬入経路（玄関〜廊下〜キッチン）', type: 'text', required: 'target' },
      { id: 'kc-type', label: 'キッチン種類', type: 'select', required: 'target', options: ['セパレートキッチン', 'システムキッチン'] },
      { id: 'kc-bunden', label: '分電盤（数字・空き）/コンセント/給排水', type: 'text', required: 'target' },
      { id: 'kc-nayami', label: 'お悩み（複数可）', type: 'multiselect', required: 'target', options: ['収納', '大きさ', '高さ', '掃除しにくい', 'その他'], guide: { script: '深掘り：大きさ→規格(2100/2400/2550)、高さ→希望(80/85/90/95cm)、収納→増やしたい場所。' } },
    ],
    photos: [
      { id: 'kc-p1', label: '分電盤（数字・空き）' },
      { id: 'kc-p2', label: 'コンセント位置' },
      { id: 'kc-p3', label: '給排水位置' },
      { id: 'kc-p4', label: '窓' },
      { id: 'kc-p5', label: 'キッチン品番と全体' },
      { id: 'kc-p6', label: 'レンジフード' },
      { id: 'kc-p7', label: '換気口（外）' },
    ],
    script: 'シートに「スクリプト参照」記載あり。',
  },
  {
    id: 'senmen', name: '洗面所', category: '水回り', order: 4,
    lifespan: 15, lifeLabel: '15〜20年',
    modelLabel: '現況メーカー・型番（洗面台銘板／洗濯機品番）',
    details: [
      { id: 'sm-koho', label: '建築工法', type: 'select', required: 'target', options: ['在来木軸', '2×4', 'プレハブ', 'RC'] },
      { id: 'sm-tategu', label: '入口建具/浴室建具（W/H/段差/枠の出）', type: 'text', required: 'target' },
      { id: 'sm-kyuhai', label: '給水/排水位置（壁/床）', type: 'text', required: 'target' },
      { id: 'sm-tenken', label: '床下点検口（有無・大きさ）/梁', type: 'text', required: 'target' },
      { id: 'sm-shiage', label: '仕上げ材（床/壁）', type: 'text', required: 'target', placeholder: '床:フロアタイル/フローリング/パネル/CF 壁:クロス/タイル/漆喰/パネル' },
      { id: 'sm-pan', label: '洗濯パン寸法（W/D/H）', type: 'text', required: 'target' },
      { id: 'sm-type', label: '種類', type: 'select', required: 'target', options: ['既製品', '造作'], guide: { meyasu: '既製品希望ならショールーム案内。高さめやす＝身長÷2。' } },
      { id: 'sm-nayami', label: 'お悩み（複数可）', type: 'multiselect', required: 'target', options: ['収納', '大きさ', '高さ', '掃除しにくい', 'その他'] },
    ],
    photos: [
      { id: 'sm-p1', label: '内装仕上（床・壁・天井）' },
      { id: 'sm-p2', label: 'コンセント位置' },
      { id: 'sm-p3', label: '給排水位置' },
      { id: 'sm-p4', label: '洗濯機の品番' },
      { id: 'sm-p5', label: '分電盤（空きがわかるように）' },
    ],
    script: 'ヒアリングシートに参照リンクあり。',
  },
  {
    id: 'toilet', name: 'トイレ', category: '水回り', order: 5,
    lifespan: 15, lifeLabel: '便器15〜20年／温水洗浄便座7〜10年',
    modelLabel: '現況メーカー・便器の品番',
    details: [
      { id: 'tl-zunpo', label: '寸法（W/H/D・取付高さ）', type: 'text', required: 'target' },
      { id: 'tl-shiage', label: '壁/床仕上げ材', type: 'text', required: 'target', placeholder: '壁:クロス/タイル/漆喰/パネル 床:CF/タイル/フロアタイル/フローリング' },
      { id: 'tl-kyusui', label: '給水位置（壁/床）', type: 'select', required: 'target', options: ['壁', '床'] },
      { id: 'tl-haisui', label: '排水位置・排水芯（mm）', type: 'text', required: 'target', guide: { meyasu: '壁排水は床から配管中心までを測定。' } },
      { id: 'tl-door', label: 'ドア（段差 室内/外・大きさ W/H/D・引き戸有無）', type: 'text', required: 'target' },
      { id: 'tl-kanki', label: '換気扇', type: 'select', required: 'target', options: ['有', '無'] },
      { id: 'tl-type', label: '種類（v3補完）', type: 'select', required: false, options: ['組合せ', '一体', 'タンクレス', '不明'], guide: { meyasu: '現行シートに明示なし。運用で確定予定。' } },
      { id: 'tl-nayami', label: 'お悩み・付けたい機能', type: 'textarea', required: 'target' },
    ],
    photos: [
      { id: 'tl-p1', label: '便器の品番' },
      { id: 'tl-p2', label: '内装仕上（壁・天井・床）' },
      { id: 'tl-p3', label: 'コンセント位置' },
      { id: 'tl-p4', label: '給排水' },
    ],
    script: '「ご要望にあったトイレが提案できるようヒアリング」。参照：スクリプト／お手洗いヒアリングシート（短縮URL）。',
  },
  // ---------------- 内装 ----------------
  {
    id: 'cross', name: 'クロス（壁紙）', category: '内装', order: 6,
    lifespan: 10, lifeLabel: '張替めやす10年前後',
    modelLabel: '現況の仕上げ材種別・状態写真', modelIsSpec: true,
    yearLabel: '前回張替からの経過年数（概算可）',
    details: [
      { id: 'cr-tenjo', label: '現状材質（天井）', type: 'select', required: 'target', options: ['クロス', '化粧ベニヤ', '塗壁', 'その他'] },
      { id: 'cr-kabe', label: '現状材質（壁）', type: 'select', required: 'target', options: ['クロス', '化粧ベニヤ', '塗壁', '聚楽', 'その他'], guide: { term: '聚楽（じゅらく）＝和室系の塗壁の一種。' } },
      { id: 'cr-tenkai', label: '展開図（窓・建具の大きさ・天井面積）', type: 'text', required: 'target' },
      { id: 'cr-aircon', label: 'エアコン脱着の有無', type: 'select', required: 'target', options: ['有', '無'] },
      { id: 'cr-count', label: 'コンセント個数/スイッチ個数/廻縁有無', type: 'text', required: 'target' },
      { id: 'cr-nimotsu', label: '大きな荷物の個数・大きさ', type: 'text', required: 'target' },
    ],
    photos: [
      { id: 'cr-p1', label: 'コンセント位置' },
      { id: 'cr-p2', label: '窓位置' },
      { id: 'cr-p3', label: 'ドア位置' },
      { id: 'cr-p4', label: '部屋の全景' },
    ],
  },
  {
    id: 'washitsu', name: '和室→洋室', category: '内装', order: 7,
    lifespan: 20, lifeLabel: '内装更新の目安',
    modelLabel: '現況の仕上げ材種別・状態写真', modelIsSpec: true,
    yearLabel: '前回改装からの経過年数（概算可）',
    details: [
      { id: 'ws-dansa', label: '隣室との段差（有:mm/無）/畳の厚み', type: 'text', required: 'target' },
      { id: 'ws-tenjo', label: '天井の種類', type: 'select', required: 'target', options: ['竿縁天井', '格天井', '目透かし天井'], guide: { term: '竿縁/格/目透かし＝和室天井の様式。' } },
      { id: 'ws-kabe', label: '壁材', type: 'select', required: 'target', options: ['砂壁', 'クロス'] },
      { id: 'ws-size', label: '部屋の W/D/H', type: 'text', required: 'target' },
      { id: 'ws-hashira', label: '柱の扱い', type: 'select', required: 'target', options: ['真壁（柱が見える）', '大壁（柱を隠す）'], guide: { term: '真壁＝柱が見える壁／大壁＝柱を隠す壁。' } },
      { id: 'ws-mawari', label: '廻り縁の有無と処置', type: 'text', required: 'target', guide: { meyasu: '色が違う場合があり注意。撤去するか、LDK側と繋げるか。' } },
      { id: 'ws-tategu', label: '既存建具寸法（障子/扉/襖 W/H）・枠の扱い', type: 'text', required: 'target' },
      { id: 'ws-oshiire', label: '押入寸法（W/D/H）・中段撤去', type: 'text', required: 'target' },
    ],
    photos: [
      { id: 'ws-p1', label: '部屋全景' },
      { id: 'ws-p2', label: '天井・柱まわり' },
      { id: 'ws-p3', label: '押入内部' },
    ],
  },
  {
    id: 'majikiri', name: '間仕切り壁', category: '内装', order: 8,
    lifespan: 20, lifeLabel: '—',
    modelLabel: '現況の仕上げ材種別・状態写真', modelIsSpec: true,
    yearLabel: '既存壁の経過年数（新設なら「新設」）',
    details: [
      { id: 'mj-range', label: '新設壁の設置範囲（W/H/D）', type: 'text', required: 'target' },
      { id: 'mj-tobira', label: '扉との干渉（扉本体/建具枠/ドアストッパー）〇✕', type: 'text', required: 'target', guide: { meyasu: '干渉は〇・✕で判定。' } },
      { id: 'mj-denki', label: '電気・設備干渉（コンセント/エアコン/照明SW/カーテンレール/サッシ）', type: 'text', required: 'target' },
      { id: 'mj-zosaku', label: '造作の有無（室内窓/ニッチ/棚/TV/建具）＋寸法', type: 'text', required: 'target' },
      { id: 'mj-hinban', label: '壁紙の品番', type: 'text', required: false },
    ],
    photos: [
      { id: 'mj-p1', label: '部屋全体（360°カメラ）' },
      { id: 'mj-p2', label: '干渉するもの' },
      { id: 'mj-p3', label: 'クロス（壁紙）の品番' },
      { id: 'mj-p4', label: '巾木（メジャーを当てて）' },
    ],
  },
];

// 外装系（今後追加枠）— 表示のみ・入力ゲートには含めない
export const futureParts = [
  { name: '外壁', check: '材質(サイディング/モルタル/ALC)・劣化(チョーキング/クラック/シーリング)・面積・足場条件', life: '塗り替え10年前後' },
  { name: '屋根', check: '屋根材・勾配・雨樋・軒天・棟/谷の劣化', life: '塗装10〜15年／葺き替え20〜30年' },
  { name: '防水', check: '部位(ベランダ/バルコニー/陸屋根)・既存種別(FRP/ウレタン/シート)・排水ドレン・面積', life: '10〜15年／トップコート5年前後' },
  { name: '給湯機（単独）', check: '種類(ガス/エコキュート/石油)・号数/容量・設置場所・リモコン・ガス種/電源', life: '10〜15年（浴室シートの熱源欄で一部カバー）' },
];

export const doujiHints = [
  '外壁＋屋根＋防水：足場を共有でき、まとめると足場代が一度で済む。',
  'トイレ／洗面交換＋内装（クロス・床）：既存撤去で床壁が傷むので同時施工が自然。',
  '浴室（UB交換）＋給湯機：追い焚き・湯量の連携。同時更新で効率的。',
  'キッチン交換＋給排水・電気の見直し：容量／配管を整える好機。',
  '水回りまとめて：配管・工期を集約して効率化。',
];

// アップセル診断3点（全部位に自動付与）
export function upsellItems(part) {
  return [
    {
      id: `${part.id}__year`, label: part.yearLabel || '設置からの年数（概算可）', type: 'number', required: true, unit: '年',
      upsell: true, guide: { meyasu: `寿命めやす：${part.lifeLabel}。対象外でも必ず記録＝追加提案の起点。` },
    },
    {
      id: `${part.id}__decay`, label: '見た目の劣化', type: 'select', required: true,
      options: ['良好', '経年', '要注意'], upsell: true,
      guide: { meyasu: 'ひび割れ・色あせ・シーリング切れ・サビ等があれば「要注意」。' },
    },
    {
      id: `${part.id}__model`, label: part.modelLabel || '現況メーカー・型番（不明可＋写真）', type: 'photo', required: true,
      upsell: true, guide: { meyasu: '不明でも写真だけは必ず撮る（型番ラベル）。対象外でも撮影。' },
    },
  ];
}

// ---------------------------------------------------------------------------
// 第3部　建物・共通現況
// ---------------------------------------------------------------------------
export const part3 = {
  id: 'part3',
  title: '第3部　建物・共通現況',
  subtitle: '部位をまたいで毎回確認（共通シート統合）',
  groups: [
    {
      id: '3-common',
      name: '建物共通',
      items: [
        { id: '3-1', label: '工事箇所・周辺箇所の採寸', type: 'text', required: true, guide: { meyasu: '再利用物を脱着する場合は下地の有無も確認。' } },
        { id: '3-2', label: '構造・基礎・傾き・劣化／基礎位置', type: 'text', required: true, guide: { meyasu: '見本写真：クラックの幅めやす。基礎位置を明確に。' } },
        { id: '3-3', label: 'マス（桝）の位置', type: 'photo', required: true, guide: { meyasu: '必ず記録。' } },
        { id: '3-4', label: '床下点検口', type: 'photo', required: true, guide: { meyasu: '工事予定箇所以外でも必ず撮影。' } },
        { id: '3-5', label: '既存エアコン設置位置', type: 'photo', required: true, guide: { meyasu: '室内機・スリーブ開口・室外機。外部はダクト経路がわかるように。' } },
        { id: '3-6', label: '隣地境界までの距離', type: 'text', required: true, guide: { meyasu: '距離がわかる写真も撮る。' } },
        { id: '3-7', label: '旧耐震か（築1981以前）', type: 'select', required: true, options: ['旧耐震（1981以前）', '新耐震', '不明'], guide: { meyasu: '1-0-4と連動。耐震診断時は2階も間取りを取る。' } },
        { id: '3-8', label: '分電盤の容量・空き回路', type: 'photo', required: true, guide: { meyasu: '扉を開けた状態で撮影。' } },
        { id: '3-9', label: '契約アンペア', type: 'number', required: true, unit: 'A', guide: { meyasu: 'IH・エコキュート導入で重要。' } },
        { id: '3-10', label: '給排水本管・排水経路・老朽化', type: 'text', required: true, guide: { meyasu: '水回り移設の可否に直結。' } },
        { id: '3-11', label: 'サッシ・ガラス（単板/複層）・断熱', type: 'select', required: false, options: ['単板', '複層（ペアガラス）', '不明'], guide: { term: '複層＝ペアガラス。' } },
        { id: '3-12', label: '雨漏り／シロアリ／カビの痕跡', type: 'text', required: true },
        { id: '3-13', label: '360°カメラ撮影／現地写真（寄り・離れ・四方）', type: 'photo', required: true },
      ],
    },
    {
      id: '3-M',
      name: '3-M マンション特有',
      condition: 'mansion',
      items: [
        { id: '3-M-1', label: '管理規約・リフォーム細則の入手', type: 'photo', required: 'mansion', guide: { meyasu: '最重要。' } },
        { id: '3-M-2', label: '専有／共用部の境界', type: 'text', required: 'mansion' },
        { id: '3-M-3', label: '床材の遮音等級規定（LL等）', type: 'select', required: 'mansion', options: ['LL-40', 'LL-45', 'その他', '不明'], guide: { term: 'LL＝床の遮音等級。' } },
        { id: '3-M-4', label: '工事可能時間・搬入制限・EV', type: 'text', required: 'mansion' },
        { id: '3-M-5', label: '管理組合への申請要否・期間', type: 'select', required: 'mansion', options: ['要', '不要', '確認中'] },
        { id: '3-M-6', label: '換気回路', type: 'select', required: 'mansion', options: ['3室換気', '2室換気', '単独換気'], guide: { meyasu: '共通シート（マンション時に確認）。' } },
        { id: '3-M-7', label: '梁の位置・大きさ', type: 'text', required: 'mansion' },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// 第4部　段取り・法規・記録・クロージング
// ---------------------------------------------------------------------------
export const part4 = {
  id: 'part4',
  title: '第4部　段取り・法規・記録',
  subtitle: '写真もれ防止・クロージング',
  groups: [
    {
      id: '4-1',
      name: '4-1 法規・制約',
      items: [
        { id: '4-1-1', label: '旧耐震／耐震診断の要否', type: 'select', required: 'prequake', options: ['要', '不要', '確認中'], guide: { meyasu: '3-7が旧耐震のとき必須。' } },
        { id: '4-1-2', label: '用途地域・防火／準防火', type: 'text', required: false },
        { id: '4-1-3', label: '建ぺい率・容積率の余裕（増築時）', type: 'text', required: false },
      ],
    },
    {
      id: '4-2',
      name: '4-2 工事の段取り',
      items: [
        { id: '4-2-1', label: '搬入経路・駐車', type: 'text', required: true },
        { id: '4-2-2', label: '電気・水道の仮設可否', type: 'text', required: false },
        { id: '4-2-3', label: '工事中の生活', type: 'select', required: true, options: ['住みながら', '空き家', '仮住まい', 'ペット配慮'] },
      ],
    },
    {
      id: '4-4',
      name: '4-4 記録・クロージング',
      items: [
        { id: '4-4-1', label: '議事録に打合せ内容を詳細記録', type: 'select', required: true, options: ['記録済み', '未'] },
        { id: '4-4-2', label: '議事録にお客様の署名', type: 'select', required: true, options: ['取得済み', '未'], guide: { meyasu: '認識のすり合わせ。' } },
        { id: '4-4-3', label: '工事箇所範囲・工事方法の認識すり合わせ', type: 'select', required: true, options: ['完了', '未'] },
        { id: '4-4-4', label: '次回アポ・提案予定日', type: 'text', required: true },
        { id: '4-4-5', label: 'プランの方向性・社内共有事項', type: 'textarea', required: true },
      ],
    },
  ],
};

// 4-3 写真もれ防止リスト（チェックリスト）
export const photoChecklist = {
  id: 'photo-checklist',
  title: '4-3 写真もれ防止リスト',
  items: [
    { id: 'pc-1', label: '建物全景（外観4面）' },
    { id: 'pc-2', label: '各部屋の全体（360°カメラ）' },
    { id: 'pc-3', label: '全部位の型番／品番ラベル（対象外でも）' },
    { id: 'pc-4', label: '分電盤（扉を開けた状態）' },
    { id: 'pc-5', label: '不具合部（雨漏り跡・クラック・シーリング切れ等）' },
    { id: 'pc-6', label: '給排水・配管まわり／マス（桝）の位置' },
    { id: 'pc-7', label: '床下点検口（工事予定外でも）' },
    { id: 'pc-8', label: '既存エアコン（室内外・ダクト経路）' },
    { id: 'pc-9', label: '隣地境界までの距離' },
    { id: 'pc-10', label: '（マンション）管理規約・工事ルール', condition: 'mansion' },
  ],
};

// 推奨調査ルート（第5部）
export const route = [
  '玄関・全体確認（360°）',
  'ヒアリング（第1部）',
  '水回り（キッチン→浴室→洗面→トイレ）',
  '内装（クロス→和室→洋室→間仕切り壁）',
  '建物・共通現況（採寸・分電盤・配管ほか）',
  '外装系（今後追加枠）',
  '段取り確認',
  '完了前サマリー',
  'クロージング（議事録署名）',
];
