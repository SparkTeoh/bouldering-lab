// 用法：node tools/check-lessons.js
// 逐帧检查课程与挑战：四肢够不够得到、稳不稳、各点负担几公斤。
const E = require('../js/engine.js');
const C = require('../js/lessons.js');
require('../js/lessons2.js');
require('../js/lessons3.js');
require('../js/coach.js');

const r = (v) => Math.round(v);
function report(label, raw, holds) {
  const P = E.resolve(raw, holds);
  const body = E.buildBody(P);
  const res = E.analyze(P, body);
  const loads = res.contacts.map((c) => `${c.l}:${r(c.kg)}`).join(' ');
  const flags = [];
  if (res.unreachable.length) flags.push('够不到:' + res.unreachable.join(','));
  if (res.rotating) flags.push(`旋转 偏${r(res.offset)}cm`);
  if (res.falling) flags.push('掉落:' + res.reason);
  if (res.air) flags.push('腾空');
  if (res.oppose) flags.push('对抗:' + res.oppKind);
  // 自由的手：离岩点 N 还差多少
  const freeReach = ['LH', 'RH'].filter((l) => !P.limbs[l].hold).map((l) => {
    const b = body.limbs[l];
    return `${l}伸到(${r(b.end.x)},${r(b.end.y)})${b.reachable ? '' : '[伸到极限]'}`;
  });
  console.log(`  ${label.padEnd(8)} cog=(${r(res.cog.x)},${r(res.cog.y)}) ${res.pattern.padEnd(9)} ${loads}  H=${r(res.H)} ${flags.join(' ')} ${freeReach.join(' ')}`);
}

function merge(prev, fr) {
  const o = {};
  for (const k of E.POSE_KEYS) o[k] = fr[k] !== undefined ? fr[k] : prev[k];
  return o;
}

for (const ls of C.LESSONS) {
  console.log(`\n[${ls.id}] ${ls.title}`);
  let prev = {};
  ls.frames.forEach((fr, i) => { prev = merge(prev, fr); report('帧' + (i + 1), prev, ls.holds); });
  if (ls.compare) {
    const base = merge({}, ls.frames[0]);
    report('✕对比', merge(base, ls.compare.bad), ls.holds);
    report('○对比', merge(base, ls.compare.good), ls.holds);
  }
}
for (const ch of C.CHALLENGES) {
  console.log(`\n[${ch.id}] ${ch.title}`);
  report('起始', Object.assign({ angle: ch.angle }, ch.start), ch.holds);
  if (ch.solution) {
    const sol = Object.assign({ angle: ch.angle }, ch.solution);
    const n = ch.holds[ch.goal.hold];
    report('出手中', Object.assign({}, sol, { [ch.goal.limb]: [n.x - 4, n.y - 3] }), ch.holds);
    report('抓到', sol, ch.holds);
  }
}
console.log('\n[lab]');
report('起始', C.LAB.start, C.LAB.holds);
