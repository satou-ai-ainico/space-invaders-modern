// 第5部：完了前サマリー ＋ 完了ゲート
export default function Summary({ missing, photoMissing, seeds, hints, onJump, canFinish, finished, exportJson }) {
  if (finished) {
    return (
      <div className="done-hero">
        <div className="check">✓</div>
        <h1>調査完了・台帳へ転記しました</h1>
        <p>全部位スキャン・写真もれ防止・必須項目をすべてクリアしました。</p>
        <div className="summary-card" style={{ marginTop: 20, textAlign: 'left' }}>
          <h3>台帳転記データ（プレビュー）</h3>
          <textarea className="export-box" readOnly value={exportJson} />
          <p style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 8 }}>
            ※ 実運用ではスプレッドシート台帳へ自動転記されます（第6部 自動化ルール6）。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="screen-head">
        <h1>完了前サマリー</h1>
        <p>送信前の最終チェック。赤が残っていると調査完了にできません。</p>
      </div>

      {/* 未入力の必須項目 */}
      <div className={'summary-card ' + (missing.length === 0 ? 'ok' : '')}>
        <h3>
          未入力の必須項目
          <span className={'count-chip ' + (missing.length === 0 ? 'good' : 'bad')}>{missing.length === 0 ? 'OK' : `${missing.length}件`}</span>
        </h3>
        {missing.length === 0 ? (
          <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: 13 }}>すべて入力済みです。</p>
        ) : (
          <ul className="miss-list">
            {missing.map((m) => (
              <li key={m.id} onClick={() => onJump(m.stepIndex)}>▶ {m.stepLabel}：{m.label}</li>
            ))}
          </ul>
        )}
      </div>

      {/* 撮り忘れ写真 */}
      <div className={'summary-card ' + (photoMissing.length === 0 ? 'ok' : 'warn-c')}>
        <h3>
          撮り忘れ写真（もれ防止リスト）
          <span className={'count-chip ' + (photoMissing.length === 0 ? 'good' : 'warn')}>{photoMissing.length === 0 ? 'OK' : `${photoMissing.length}件`}</span>
        </h3>
        {photoMissing.length === 0 ? (
          <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: 13 }}>チェック済みです。</p>
        ) : (
          <ul className="miss-list">
            {photoMissing.map((m) => (
              <li key={m.id} className="photo" onClick={() => onJump(m.stepIndex)}>📷 {m.label}</li>
            ))}
          </ul>
        )}
      </div>

      {/* アップセルの芽 */}
      <div className="summary-card">
        <h3>
          アップセルの芽（提案候補）
          <span className={'count-chip ' + (seeds.length === 0 ? 'good' : 'warn')}>{seeds.length}件</span>
        </h3>
        {seeds.length === 0 ? (
          <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: 13 }}>寿命超過・要注意の部位はありません。</p>
        ) : (
          <ul className="seed-list">
            {seeds.map((s) => (
              <li key={s.id}>🌱 <b>{s.name}</b><span className="seed-why">{s.reasons.join(' / ')}</span></li>
            ))}
          </ul>
        )}
      </div>

      {/* 同時施工ヒント */}
      <div className="summary-card">
        <h3>同時施工の相性ヒント</h3>
        <ul className="hint-list">
          {hints.map((h, i) => <li key={i}>{h}</li>)}
        </ul>
      </div>

      {!canFinish && (
        <p className="nav-status">未入力の必須項目・撮り忘れ写真を解消すると「調査完了」できます。</p>
      )}
    </div>
  );
}
