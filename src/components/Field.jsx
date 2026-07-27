import GuidePanel from './GuidePanel.jsx';
import { isEmpty } from '../lib/helpers.js';

// 1項目の入力UI。入力形式ごとにコントロールを出し分ける。
export default function Field({ item, value, onChange, required, showMissing, fieldRef }) {
  const missing = required && isEmpty(item.type, value);

  const cls = ['field'];
  if (item.upsell) cls.push('upsell');
  if (missing && showMissing) cls.push('missing');

  return (
    <div className={cls.join(' ')} ref={fieldRef} id={`f-${item.id}`}>
      <div className="field-label">
        <span>{item.label}</span>
        {item.upsell && <span className="badge up">アップセル診断</span>}
        {required ? <span className="badge req">必須</span> : <span className="badge opt">任意</span>}
      </div>
      <div className="control">
        <Control item={item} value={value} onChange={onChange} />
      </div>
      <GuidePanel guide={item.guide} />
    </div>
  );
}

function Control({ item, value, onChange }) {
  switch (item.type) {
    case 'textarea':
      return (
        <textarea value={value || ''} placeholder={item.placeholder || ''} onChange={(e) => onChange(e.target.value)} />
      );
    case 'number':
      return (
        <div className="with-unit">
          <input type="number" inputMode="numeric" value={value ?? ''} placeholder={item.placeholder || ''} onChange={(e) => onChange(e.target.value)} />
          {item.unit && <span className="unit">{item.unit}</span>}
        </div>
      );
    case 'date':
      return <input type="date" value={value || ''} onChange={(e) => onChange(e.target.value)} />;
    case 'select':
      return (
        <div className="opts">
          {item.options.map((o) => (
            <button key={o} type="button" className={'opt' + (value === o ? ' sel' : '')} onClick={() => onChange(value === o ? '' : o)}>
              {o}
            </button>
          ))}
        </div>
      );
    case 'multiselect': {
      const arr = Array.isArray(value) ? value : [];
      const toggle = (o) => onChange(arr.includes(o) ? arr.filter((x) => x !== o) : [...arr, o]);
      return (
        <div className="opts">
          {item.options.map((o) => (
            <button key={o} type="button" className={'opt multi' + (arr.includes(o) ? ' sel' : '')} onClick={() => toggle(o)}>
              {arr.includes(o) ? '✓ ' : ''}{o}
            </button>
          ))}
        </div>
      );
    }
    case 'photo': {
      const count = Number(value) || 0;
      return (
        <button type="button" className={'photo-btn' + (count > 0 ? ' captured' : '')} onClick={() => onChange(count + 1)}>
          <span>{count > 0 ? '✓ 撮影済み' : '📷 写真を撮影'}</span>
          {count > 0 && <span className="photo-count">{count}枚（タップで追加）</span>}
        </button>
      );
    }
    default:
      return <input type="text" value={value || ''} placeholder={item.placeholder || ''} onChange={(e) => onChange(e.target.value)} />;
  }
}
