import { useState, useEffect, useMemo, useRef } from 'react';
import Header from './components/Header.jsx';
import Field from './components/Field.jsx';
import PartScan from './components/PartScan.jsx';
import Summary from './components/Summary.jsx';
import {
  part1, parts2, part3, part4, photoChecklist, route, futureParts, doujiHints,
} from './data/surveyModel.js';
import { isEmpty, isRequired, isUpsellSeed } from './lib/helpers.js';

const STORAGE_KEY = 'genchi-survey-v4';

// ステップ定義（新人ガイド型ウィザード）
const STEPS = [
  { key: 'intro', label: '調査開始', short: 'START', kind: 'intro' },
  { key: 'part1', label: '第1部　共通ヒアリング', short: 'ヒアリング', kind: 'section', def: part1 },
  ...parts2.map((p) => ({ key: p.id, label: `第2部　${p.name}`, short: p.name, kind: 'part2', part: p })),
  { key: 'part3', label: part3.title, short: '建物現況', kind: 'section', def: part3 },
  { key: 'part4', label: part4.title, short: '段取り・記録', kind: 'part4', def: part4 },
  { key: 'summary', label: '第5部　完了前サマリー', short: 'サマリー', kind: 'summary' },
];
const SUMMARY_INDEX = STEPS.length - 1;
const PART4_INDEX = STEPS.findIndex((s) => s.key === 'part4');

export default function App() {
  const [answers, setAnswers] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; }
  });
  const [current, setCurrent] = useState(0);
  const [validated, setValidated] = useState(() => new Set());
  const [finished, setFinished] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('genchi-theme') || 'auto');
  const [toast, setToast] = useState('');
  const fieldRefs = useRef({});
  const pendingScroll = useRef(null);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(answers)); } catch { /* ignore */ }
  }, [answers]);

  useEffect(() => {
    if (theme === 'auto') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('genchi-theme', theme);
  }, [theme]);

  // ステップ切替時に上へスクロール（または指定フィールドへ）
  useEffect(() => {
    if (pendingScroll.current) {
      const id = pendingScroll.current; pendingScroll.current = null;
      requestAnimationFrame(() => {
        const el = fieldRefs.current[id];
        if (el && el.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [current]);

  const setAnswer = (id, v) => setAnswers((a) => ({ ...a, [id]: v }));
  // フィールド要素の登録（プロップのref直接変更を避けるため App 側の closure で保持）
  const registerRef = (id) => (el) => { fieldRefs.current[id] = el; };

  // 条件分岐コンテキスト
  const ctx = useMemo(() => {
    const chikunen = Number(answers['1-0-4']);
    const isPreQuake =
      (answers['3-7'] || '').startsWith('旧耐震') ||
      (!Number.isNaN(chikunen) && chikunen > 1000 && chikunen <= 1981);
    return {
      isMansion: answers['1-0-2'] === 'マンション',
      isPreQuake,
    };
  }, [answers]);

  // ---- 未入力・写真もれ・アップセルの芽を計算 ----
  const analysis = useMemo(() => {
    const missing = [];
    const missingByStep = {};
    const bump = (key) => { missingByStep[key] = (missingByStep[key] || 0) + 1; };

    STEPS.forEach((step, idx) => {
      if (step.kind === 'section' || step.kind === 'part4') {
        step.def.groups.forEach((g) => {
          if (g.condition === 'mansion' && !ctx.isMansion) return;
          g.items.forEach((it) => {
            const req = isRequired(it, ctx);
            if (req && isEmpty(it.type, answers[it.id])) {
              missing.push({ id: it.id, label: it.label, stepIndex: idx, stepLabel: step.short });
              bump(step.key);
            }
          });
        });
      } else if (step.kind === 'part2') {
        const p = step.part;
        const target = answers[`${p.id}__target`];
        const reqItems = [
          { id: `${p.id}__target`, label: '対象判定', type: 'select' },
          { id: `${p.id}__year`, label: 'アップセル：設置年数', type: 'number' },
          { id: `${p.id}__decay`, label: 'アップセル：劣化', type: 'select' },
          { id: `${p.id}__model`, label: 'アップセル：型番/現況（写真）', type: 'photo' },
        ];
        reqItems.forEach((r) => {
          if (isEmpty(r.type, answers[r.id])) { missing.push({ ...r, stepIndex: idx, stepLabel: p.name }); bump(step.key); }
        });
        if (target === '対象') {
          p.details.forEach((it) => {
            if (it.required === 'target' && isEmpty(it.type, answers[it.id])) {
              missing.push({ id: it.id, label: it.label, stepIndex: idx, stepLabel: p.name }); bump(step.key);
            }
          });
          (p.photos || []).forEach((ph) => {
            if (isEmpty('photo', answers[ph.id])) {
              missing.push({ id: ph.id, label: `写真：${ph.label}`, stepIndex: idx, stepLabel: p.name }); bump(step.key);
            }
          });
        }
      }
    });

    // 写真もれ防止リスト（第4部ステップに属する）
    const photoMissing = [];
    photoChecklist.items.forEach((it) => {
      if (it.condition === 'mansion' && !ctx.isMansion) return;
      if (answers[it.id] !== true) photoMissing.push({ id: it.id, label: it.label, stepIndex: PART4_INDEX });
    });

    // アップセルの芽
    const seeds = [];
    parts2.forEach((p) => {
      const reasons = isUpsellSeed(p, answers);
      if (reasons.length) seeds.push({ id: p.id, name: p.name, reasons });
    });

    return { missing, missingByStep, photoMissing, seeds };
  }, [answers, ctx]);

  const canFinish = analysis.missing.length === 0 && analysis.photoMissing.length === 0;

  // ステップのステータス（チップ表示用）
  const steps = STEPS.map((s, i) => {
    let status;
    if (s.kind === 'intro' || s.kind === 'summary') status = undefined;
    else {
      const miss = analysis.missingByStep[s.key] || 0;
      const photoMiss = s.kind === 'part4' ? analysis.photoMissing.length : 0;
      status = (miss + photoMiss) === 0 ? 'done' : (validated.has(i) ? 'incomplete' : undefined);
    }
    return { ...s, status };
  });

  const percent = Math.round((current / (STEPS.length - 1)) * 100);

  const goNext = () => {
    setValidated((v) => new Set(v).add(current));
    if (current < SUMMARY_INDEX) setCurrent((c) => c + 1);
  };
  const goPrev = () => { if (current > 0) setCurrent((c) => c - 1); };
  const jump = (i) => setCurrent(i);
  const jumpToField = (i, fieldId) => {
    setValidated((v) => new Set(v).add(i));
    if (fieldId) pendingScroll.current = fieldId;
    setCurrent(i);
  };

  const tryFinish = () => {
    setValidated(new Set(STEPS.map((_, i) => i)));
    if (canFinish) {
      setFinished(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setToast(`未完了：必須${analysis.missing.length}件／写真${analysis.photoMissing.length}件`);
      setTimeout(() => setToast(''), 2600);
      setCurrent(SUMMARY_INDEX);
    }
  };

  const resetAll = () => {
    if (!window.confirm('入力内容をすべてクリアします。よろしいですか？')) return;
    setAnswers({}); setValidated(new Set()); setFinished(false); setCurrent(0);
  };

  const exportJson = useMemo(() => {
    const meta = {
      調査日: answers['1-0-1a'] || '', 物件種別: answers['1-0-2'] || '',
      対象部位: parts2.filter((p) => answers[`${p.id}__target`] === '対象').map((p) => p.name),
      アップセルの芽: analysis.seeds.map((s) => `${s.name}（${s.reasons.join('/')}）`),
    };
    return JSON.stringify({ meta, answers }, null, 2);
  }, [answers, analysis.seeds]);

  const showMissing = validated.has(current);
  const step = STEPS[current];

  return (
    <div className="app">
      <Header
        steps={steps} current={current} onJump={jump} percent={percent}
        theme={theme === 'auto' ? (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : theme}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : t === 'light' ? 'auto' : 'dark'))}
      />

      <main className="main">
        {step.kind === 'intro' && <Intro onReset={resetAll} hasData={Object.keys(answers).length > 0} />}

        {step.kind === 'section' && (
          <Section def={step.def} answers={answers} setAnswer={setAnswer} ctx={ctx} showMissing={showMissing} registerRef={registerRef} />
        )}

        {step.kind === 'part2' && (
          <>
            <div className="screen-head" style={{ marginBottom: 14 }}>
              <h1>第2部　全部位スキャン</h1>
              <p>対象／対象外どちらでもアップセル診断3点は必須です。</p>
            </div>
            <PartScan part={step.part} answers={answers} setAnswer={setAnswer} showMissing={showMissing} registerRef={registerRef} />
          </>
        )}

        {step.kind === 'part4' && (
          <>
            <Section def={step.def} answers={answers} setAnswer={setAnswer} ctx={ctx} showMissing={showMissing} registerRef={registerRef} />
            <PhotoChecklist answers={answers} setAnswer={setAnswer} ctx={ctx} registerRef={registerRef} />
            <FutureNote />
          </>
        )}

        {step.kind === 'summary' && (
          <Summary
            missing={analysis.missing}
            photoMissing={analysis.photoMissing}
            seeds={analysis.seeds}
            hints={doujiHints}
            onJump={(i) => jumpToField(i)}
            canFinish={canFinish}
            onFinish={tryFinish}
            finished={finished}
            exportJson={exportJson}
          />
        )}
      </main>

      {!finished && (
        <nav className="botnav">
          <div className="botnav-inner">
            <button className="btn prev" onClick={goPrev} disabled={current === 0}>← 戻る</button>
            {current < SUMMARY_INDEX && (
              <button className="btn next" onClick={goNext}>
                {current === 0 ? '調査を開始する →' : '次へ →'}
              </button>
            )}
            {current === SUMMARY_INDEX && (
              <button className="btn finish" onClick={tryFinish} disabled={!canFinish}>
                {canFinish ? '✓ 調査完了・台帳へ転記' : '未完了項目があります'}
              </button>
            )}
          </div>
        </nav>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

// ---- 第1部/第3部/第4部の共通セクション描画 ----
function Section({ def, answers, setAnswer, ctx, showMissing, registerRef }) {
  return (
    <div>
      <div className="screen-head">
        <h1>{def.title}</h1>
        {def.subtitle && <p>{def.subtitle}</p>}
      </div>
      {def.groups.map((g) => {
        if (g.condition === 'mansion' && !ctx.isMansion) return null;
        return (
          <div className="group" key={g.id}>
            <div className="group-name">{g.name}</div>
            {g.items.map((it) => (
              <Field
                key={it.id}
                item={it}
                value={answers[it.id]}
                onChange={(v) => setAnswer(it.id, v)}
                required={isRequired(it, ctx)}
                showMissing={showMissing}
                fieldRef={registerRef(it.id)}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ---- 4-3 写真もれ防止リスト ----
function PhotoChecklist({ answers, setAnswer, ctx, registerRef }) {
  const items = photoChecklist.items.filter((it) => !(it.condition === 'mansion' && !ctx.isMansion));
  return (
    <div className="group">
      <div className="group-name">{photoChecklist.title}</div>
      {items.map((it) => {
        const checked = answers[it.id] === true;
        return (
          <div className="field" key={it.id} ref={registerRef(it.id)} id={`f-${it.id}`}>
            <button
              type="button"
              className={'photo-btn' + (checked ? ' captured' : '')}
              onClick={() => setAnswer(it.id, !checked)}
            >
              <span>{checked ? '✓ 撮影済み' : '☐ 未撮影'}</span>
              <span style={{ marginLeft: 8, color: 'var(--text)' }}>{it.label}</span>
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ---- 外装系（今後追加枠）表示 ----
function FutureNote() {
  return (
    <div className="group">
      <div className="group-name">外装系（今後追加枠）</div>
      <div className="detail-collapsed">
        現行シート未整備のため枠のみ確保。完了ゲートには含めません。給湯機は浴室シートの熱源欄で一部カバー。
        <ul style={{ margin: '10px 0 0', paddingLeft: 18 }}>
          {futureParts.map((f) => (
            <li key={f.name} style={{ marginBottom: 4 }}>
              <b>{f.name}</b>：{f.check}<br /><span style={{ color: 'var(--text-dim)' }}>寿命めやす：{f.life}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ---- 開始画面 ----
function Intro({ onReset, hasData }) {
  return (
    <div>
      <div className="intro-card">
        <h2>🏠 現地調査ヒアリング アシスト</h2>
        <p style={{ marginTop: 0, color: 'var(--text-dim)' }}>
          新人でも漏れなく調査できるよう、システムが順に「これを確認しましょう」と案内します。
        </p>
        <div className="pill-row">
          <span className="pill">✅ 前提①：新人でも漏れなく収集</span>
          <span className="pill">✅ 前提②：対象外でもアップセル確認</span>
        </div>

        <h3 style={{ marginBottom: 4, marginTop: 20 }}>推奨調査ルート</h3>
        <ol className="route-list">
          {route.map((r) => <li key={r}>{r}</li>)}
        </ol>

        <div className="pill-row" style={{ marginTop: 16 }}>
          <span className="pill" style={{ background: 'var(--primary-dim)', color: 'var(--primary)' }}>水回り5部位</span>
          <span className="pill" style={{ background: 'var(--ok-dim)', color: 'var(--ok)' }}>内装3部位</span>
          <span className="pill">外装系は今後追加枠</span>
        </div>

        {hasData && (
          <p style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 16 }}>
            前回の入力内容が保存されています（自動保存）。
            <button className="btn ghost" style={{ height: 36, marginLeft: 8, padding: '0 12px', fontSize: 12 }} onClick={onReset}>入力をクリア</button>
          </p>
        )}
      </div>
      <p className="nav-status" style={{ marginTop: 16 }}>下の「調査を開始する」で第1部へ進みます。上のチップからも移動できます。</p>
    </div>
  );
}
