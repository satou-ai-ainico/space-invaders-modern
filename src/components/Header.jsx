// 上部バー：タイトル・進捗バー・ステップチップ・テーマ切替
export default function Header({ steps, current, onJump, percent, theme, onToggleTheme }) {
  return (
    <header className="appbar">
      <div className="appbar-row">
        <div>
          <div className="appbar-title">現地調査 入力アシスト</div>
          <div className="appbar-sub">新人ガイド型・全部位スキャン（要件定義 v4）</div>
        </div>
        <div className="appbar-spacer" />
        <button className="theme-btn" onClick={onToggleTheme} type="button" aria-label="テーマ切替">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>

      <div className="progress-wrap">
        <div className="progress-track"><div className="progress-fill" style={{ width: `${percent}%` }} /></div>
        <div className="progress-label">
          <span>{steps[current]?.label}</span>
          <span>{current + 1} / {steps.length}</span>
        </div>
      </div>

      <div className="steps">
        {steps.map((s, i) => {
          const cls = ['step-chip'];
          if (i === current) cls.push('active');
          else if (s.status === 'done') cls.push('done');
          else if (s.status === 'incomplete') cls.push('incomplete');
          return (
            <button key={s.key} type="button" className={cls.join(' ')} onClick={() => onJump(i)}>
              {s.status && <span className="dot" />}{s.short}
            </button>
          );
        })}
      </div>
    </header>
  );
}
