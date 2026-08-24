// 値の空判定・必須判定・進捗計算などの共通ロジック

export function isEmpty(type, value) {
  if (type === 'multiselect') return !Array.isArray(value) || value.length === 0;
  if (type === 'photo') return !value; // 撮影枚数 0 / undefined
  return value === undefined || value === null || value === '';
}

// 条件付き必須を、現在の回答（answers）から解決して真偽にする
export function isRequired(item, ctx) {
  const r = item.required;
  if (r === true) return true;
  if (r === 'target') return ctx.target === '対象';
  if (r === 'mansion') return ctx.isMansion;
  if (r === 'prequake') return ctx.isPreQuake;
  return false;
}

// 部位の対象判定・アップセル3点の値取得
export function partState(part, answers) {
  return {
    target: answers[`${part.id}__target`],
    year: answers[`${part.id}__year`],
    decay: answers[`${part.id}__decay`],
    model: answers[`${part.id}__model`],
  };
}

// アップセルの芽か？（設置年数＞めやす or 劣化=要注意）
export function isUpsellSeed(part, answers) {
  const s = partState(part, answers);
  const reasons = [];
  const yr = Number(s.year);
  if (s.year !== undefined && s.year !== '' && !Number.isNaN(yr) && yr > part.lifespan) {
    reasons.push(`設置${yr}年（めやす${part.lifespan}年超）`);
  }
  if (s.decay === '要注意') reasons.push('劣化「要注意」');
  return reasons;
}
