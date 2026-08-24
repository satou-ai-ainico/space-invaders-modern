import Field from './Field.jsx';
import { upsellItems } from '../data/surveyModel.js';
import { partState, isUpsellSeed } from '../lib/helpers.js';

// 第2部：1部位のスキャンカード
// 対象判定（共-a） → アップセル診断3点（共-b/c/d, 対象外でも必須） → 詳細（対象時のみ）
export default function PartScan({ part, answers, setAnswer, showMissing, registerRef }) {
  const st = partState(part, answers);
  const isTarget = st.target === '対象';
  const seeds = isUpsellSeed(part, answers);
  const catClass = part.category === '水回り' ? 'water' : 'interior';

  const targetItem = {
    id: `${part.id}__target`, label: '対象判定', type: 'select',
    options: ['対象', '対象外', '要検討'], required: true,
    guide: { meyasu: '依頼の有無に関わらず全部位を確認済みに。対象外でもアップセル診断3点は必須です。' },
  };
  const ups = upsellItems(part);

  return (
    <div className="part-card">
      <div className="part-head">
        <span className={`part-cat ${catClass}`}>{part.category}</span>
        <span className="part-name">{part.order}. {part.name}</span>
        <span className="part-life">寿命めやす<br />{part.lifeLabel}</span>
      </div>
      <div className="part-body">
        {part.term && <div className="term-line">💡 {part.term}</div>}

        {/* 対象判定 */}
        <Field
          item={targetItem}
          value={answers[targetItem.id]}
          onChange={(v) => setAnswer(targetItem.id, v)}
          required
          showMissing={showMissing}
          fieldRef={registerRef && registerRef(targetItem.id)}
        />

        {/* アップセル診断3点（常に必須） */}
        <div className="upsell-note">★ 対象外でも「年数・劣化・型番」は必ず記録 → 追加提案のタネを残します</div>
        {ups.map((it) => (
          <Field
            key={it.id}
            item={it}
            value={answers[it.id]}
            onChange={(v) => setAnswer(it.id, v)}
            required
            showMissing={showMissing}
            fieldRef={registerRef && registerRef(it.id)}
          />
        ))}

        {seeds.length > 0 && (
          <div className="flag-seed">🌱 提案候補：{seeds.join(' / ')}</div>
        )}

        {/* 詳細（対象のときのみ展開） */}
        {isTarget ? (
          <>
            <div className="section-tag">実測・仕様確認／ヒアリング</div>
            {part.details.map((it) => (
              <Field
                key={it.id}
                item={it}
                value={answers[it.id]}
                onChange={(v) => setAnswer(it.id, v)}
                required={it.required === 'target'}
                showMissing={showMissing}
                fieldRef={registerRef && registerRef(it.id)}
              />
            ))}

            {part.photos && part.photos.length > 0 && (
              <>
                <div className="section-tag">写真撮影箇所</div>
                <div className="photo-grid">
                  {part.photos.map((p) => (
                    <Field
                      key={p.id}
                      item={{ ...p, type: 'photo' }}
                      value={answers[p.id]}
                      onChange={(v) => setAnswer(p.id, v)}
                      required
                      showMissing={showMissing}
                      fieldRef={registerRef && registerRef(p.id)}
                    />
                  ))}
                </div>
              </>
            )}

            {part.script && <div className="detail-collapsed" style={{ marginTop: 12 }}>🗒 スクリプト参照：{part.script}</div>}
          </>
        ) : st.target ? (
          <div className="detail-collapsed">「{st.target}」のため詳細入力はスキップ。アップセル診断3点のみ記録します。</div>
        ) : null}
      </div>
    </div>
  );
}
