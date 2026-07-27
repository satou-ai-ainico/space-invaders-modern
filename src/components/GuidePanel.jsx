import { useState } from 'react';

// 新人ガイド4点セット（判断めやす／用語／質問文／見本写真プレースホルダ）
export default function GuidePanel({ guide }) {
  const [open, setOpen] = useState(false);
  if (!guide) return null;
  const has = guide.meyasu || guide.term || guide.script;
  if (!has) return null;

  return (
    <div className="guide">
      <button className="guide-toggle" onClick={() => setOpen((o) => !o)} type="button">
        {open ? '▲ ガイドを閉じる' : '▼ 新人ガイド（めやす・用語・質問文）'}
      </button>
      {open && (
        <div className="guide-body">
          {guide.meyasu && (
            <div className="guide-item"><span className="g-key meyasu">めやす</span><span>{guide.meyasu}</span></div>
          )}
          {guide.term && (
            <div className="guide-item"><span className="g-key term">用語</span><span>{guide.term}</span></div>
          )}
          {guide.script && (
            <div className="guide-item"><span className="g-key script">質問文</span><span>{guide.script}</span></div>
          )}
          <div className="g-photo">
            <span>見本写真：</span>
            <span className="swatch good" title="良好" />
            <span className="swatch mid" title="経年" />
            <span className="swatch bad" title="要注意" />
            <span>（良好／経年／要注意 ※画像は今後差し込み）</span>
          </div>
        </div>
      )}
    </div>
  );
}
