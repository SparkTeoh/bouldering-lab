// 用法：node tools/audit.js
// 找「设计漏洞」：
//  1) 标成 ✕ 的帧其实没问题、标成 ○ 的帧其实不稳
//  2) 不用这一课的技巧，直接伸手就能抓到 NEXT（技巧变得多余）
//  3) 画面上有多余的脚点：两只脚都踩在脚点上就能稳稳抓到（像「加深对角」原本的漏洞）
const E = require('../js/engine.js');
const C = require('../js/lessons.js');
require('../js/lessons2.js');
require('../js/lessons3.js');
require('../js/coach.js');

const r = Math.round;
function merge(prev, fr) {
  const o = {};
  for (const k of E.POSE_KEYS) o[k] = fr[k] !== undefined ? fr[k] : prev[k];
  return o;
}
function look(raw, holds) {
  const P = E.resolve(raw, holds);
  const body = E.buildBody(P);
  return { P, body, res: E.analyze(P, body) };
}
const stable = (a, maxLoad) => !a.res.rotating && !a.res.falling && !a.res.unreachable.length && a.res.handMax <= maxLoad;
// 出手中（手还没抓到）：手伸得到 NEXT，而且这段时间身体稳
const reachOK = (a, limb, n) => stable(a, a.max) && Math.hypot(a.body.limbs[limb].end.x - n.x, a.body.limbs[limb].end.y - n.y) < 3;
const reaching = (raw, holds, limb, nKey, maxLoad) => {
  const n = holds[nKey];
  const a = look(Object.assign({}, raw, { [limb]: [n.x, n.y] }), holds);
  a.max = maxLoad;
  return reachOK(a, limb, n) ? a : null;
};

// 两只脚都踩在脚点上、另一只手不动、腰随便放：能不能稳稳抓到？
function lazy(base, holds, limb, nKey, maxLoad) {
  const feet = Object.keys(holds).filter((k) => holds[k].t === 'f');
  const n = holds[nKey];
  let best = null;
  for (const lf of feet) for (const rf of feet) {
    if (lf === rf) continue;
    if (holds[lf].x > holds[rf].x + 30) continue; // 不交叉脚
    for (let hx = n.x - 110; hx <= n.x + 110; hx += 6) for (let hy = 70; hy <= 190; hy += 6) {
      const raw = Object.assign({}, base, { hip: [hx, hy], LF: lf, RF: rf, knee: {}, hook: {}, z: {}, oppose: '', air: false, turn: 0 });
      let a;
      try { a = reaching(raw, holds, limb, nKey, maxLoad); } catch (e) { continue; }
      if (!a || a.res.oppose) continue;
      if (!best || a.res.handMax < best.load) best = { lf, rf, hip: [hx, hy], load: r(a.res.handMax) };
    }
  }
  return best;
}

let problems = 0;
const flag = (s) => { problems++; console.log('  ⚠ ' + s); };

for (const ls of C.LESSONS) {
  console.log(`\n[${ls.id}] ${ls.title}`);
  let prev = {};
  const poses = ls.frames.map((fr) => { prev = merge(prev, fr); return { raw: prev, fr }; });
  poses.forEach(({ raw, fr }, i) => {
    const a = look(raw, ls.holds);
    const bad = a.res.rotating || a.res.falling || a.res.unreachable.length || !['LH', 'RH'].every((l) => a.P.limbs[l].hold || a.body.limbs[l].reachable);
    if (fr.badge === 'good' && (a.res.rotating || a.res.falling || a.res.unreachable.length)) flag(`帧${i + 1} 标成 ○ 但其实不稳`);
    if (fr.badge === 'bad' && !bad && a.res.handSum < 35 && a.res.H < 18) flag(`帧${i + 1} 标成 ✕ 但引擎看不出问题（手 ${r(a.res.handSum)}kg，拉力 ${r(a.res.H)}kg）`);
  });
  if (ls.compare) {
    const base = merge({}, ls.frames[0]);
    const g = look(merge(base, ls.compare.good), ls.holds), b = look(merge(base, ls.compare.bad), ls.holds);
    if (g.res.rotating || g.res.falling || g.res.unreachable.length) flag('○ 对比其实不稳');
    const bBad = b.res.rotating || b.res.falling || b.res.unreachable.length || !['LH', 'RH'].every((l) => b.P.limbs[l].hold || b.body.limbs[l].reachable);
    if (!bBad && b.res.handSum <= g.res.handSum + 3 && b.res.H <= g.res.H + 3) flag(`✕ 对比看不出比 ○ 差（✕手 ${r(b.res.handSum)} / ○手 ${r(g.res.handSum)}）`);
  }
  // 目标：最后一帧抓到 NEXT 的那只手
  const last = poses[poses.length - 1].raw, first = poses[0].raw;
  const nKey = Object.keys(ls.holds).find((k) => ls.holds[k].t === 'n');
  const limb = nKey && ['LH', 'RH'].find((l) => last[l] === nKey);
  if (!limb || poses.some((p) => p.raw.air) || ls.wallStyle) continue;
  const direct = reaching(first, ls.holds, limb, nKey, 30);
  if (direct) flag(`不用技巧：从第一帧直接伸${E.NAME[limb]}就能稳稳抓到 NEXT（手 ${r(direct.res.handMax)}kg）`);
  const usesFreeFoot = typeof last.LF !== 'string' || typeof last.RF !== 'string' || last.knee && Object.values(last.knee).some(Boolean) || last.hook && Object.values(last.hook).some(Boolean);
  if (usesFreeFoot) {
    const lz = lazy(first, ls.holds, limb, nKey, 30);
    if (lz) flag(`有多余的脚点：双脚踩 ${lz.lf}+${lz.rf}、腰放 (${lz.hip}) 就能抓到（手 ${lz.load}kg）`);
  }
}

for (const ch of C.CHALLENGES) {
  if (ch.type === 'dyno') continue;
  console.log(`\n[${ch.id}] ${ch.title}`);
  const start = Object.assign({ angle: ch.angle }, ch.start);
  const direct = reaching(start, ch.holds, ch.goal.limb, ch.goal.hold, ch.maxLoad);
  if (direct) flag(`不用动脑：从起始姿势直接伸手就过关（手 ${r(direct.res.handMax)}kg）`);
  const sol = reaching(Object.assign({ angle: ch.angle }, ch.solution), ch.holds, ch.goal.limb, ch.goal.hold, ch.maxLoad);
  if (!sol) flag('示范解法自己过不了关');
  const s = ch.solution;
  const usesFreeFoot = typeof s.LF !== 'string' || typeof s.RF !== 'string' || s.hook;
  if (usesFreeFoot) {
    const lz = lazy(start, ch.holds, ch.goal.limb, ch.goal.hold, ch.maxLoad);
    if (lz) flag(`有捷径：双脚踩 ${lz.lf}+${lz.rf}、腰放 (${lz.hip}) 就过关（手 ${lz.load}kg）`);
  }
}
console.log(`\n共 ${problems} 个可疑的地方`);
