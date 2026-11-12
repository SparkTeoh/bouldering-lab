/* 攀岩动作实验室 · 画面（SVG）
 * 世界坐标：x 向右、y 向上，墙 320 × 300 cm；SVG 的 y 要翻转。
 */
(function () {
  'use strict';
  const E = window.Engine;

  const COL = {
    shirt: '#e5484d', shirtD: '#b8363b', pants: '#f2c230', pantsD: '#c99a17',
    skin: '#f3c6a5', skinD: '#d9a07c', shoe: '#2f3552', rubber: '#d9473f', hair: '#3a2a22',
    cog: '#e03131', line: '#1c7ed6', good: '#2f9e44', mid: '#e8a317', bad: '#e03131',
  };
  const HOLD = { h: ['#ec5f7c', '#b93b57'], f: ['#3fae6a', '#24804a'], n: ['#22b14c', '#127a33'] };

  const Y = (y) => 300 - y;
  const n1 = (v) => (Math.round(v * 10) / 10).toString();
  const XY = (p) => `${n1(p.x)},${n1(Y(p.y))}`;
  const add = (a, b, k = 1) => ({ x: a.x + b.x * k, y: a.y + b.y * k });
  const sub = (a, b) => ({ x: a.x - b.x, y: a.y - b.y });
  const norm = (v) => { const d = Math.hypot(v.x, v.y) || 1; return { x: v.x / d, y: v.y / d }; };

  const line = (a, b, w, c, ex = '') =>
    `<line x1="${n1(a.x)}" y1="${n1(Y(a.y))}" x2="${n1(b.x)}" y2="${n1(Y(b.y))}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" ${ex}/>`;
  const circle = (p, r, fill, ex = '') => `<circle cx="${n1(p.x)}" cy="${n1(Y(p.y))}" r="${r}" fill="${fill}" ${ex}/>`;
  const text = (p, s, ex = '') => `<text x="${n1(p.x)}" y="${n1(Y(p.y))}" ${ex}>${s}</text>`;
  const poly = (pts, fill, ex = '') => `<polygon points="${pts.map(XY).join(' ')}" fill="${fill}" ${ex}/>`;
  const loadColor = (kg) => (kg < 12 ? COL.good : kg < 24 ? COL.mid : COL.bad);

  function hash(s) { let h = 7; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) | 0; return Math.abs(h); }

  /* ---------- 墙与岩点 ---------- */
  function wall(angle, style) {
    let s = '<rect x="0" y="0" width="320" height="300" fill="url(#wallGrad)"/>';
    if (style && style.type === 'dihedral') {
      // 角落墙（凹角）：中间一条折线，左右两面墙
      const cx = style.x || 160;
      s += `<polygon points="0,0 ${cx},0 ${cx},292 0,292" fill="#bcd3dc" opacity=".55"/>`;
      s += `<line x1="${cx}" y1="0" x2="${cx}" y2="292" stroke="#7d97a3" stroke-width="2"/>`;
      for (let y = 20; y < 292; y += 40) s += `<line x1="${cx - 70}" y1="${y + 18}" x2="${cx}" y2="${y}" stroke="#a9bfc8" stroke-width=".6"/><line x1="${cx + 70}" y1="${y + 18}" x2="${cx}" y2="${y}" stroke="#a9bfc8" stroke-width=".6"/>`;
    }
    if (style && style.type === 'ledge') {
      // 岩壁顶端：上面是平台
      const ly = Y(style.y);
      s += `<rect x="0" y="0" width="320" height="${ly}" fill="#f4efe6"/>`;
      s += `<polygon points="0,${ly} 320,${ly} 320,${ly - 10} 0,${ly - 10}" fill="#d8cdb9"/>`;
      s += `<line x1="0" y1="${ly}" x2="320" y2="${ly}" stroke="#8a7b62" stroke-width="2.2"/>`;
      s += `<text x="314" y="${ly - 16}" class="wall-note" text-anchor="end">岩壁顶端</text>`;
    }
    if (style && style.type === 'crack') {
      const x = style.x || 160;
      s += `<path d="M${x} 0 L${x - 3} 60 L${x + 2} 120 L${x - 2} 190 L${x + 3} 250 L${x} 292" stroke="#3d4a5c" stroke-width="5" fill="none"/>`;
    }
    for (let x = 0; x <= 320; x += 120) s += `<line x1="${x}" y1="0" x2="${x}" y2="292" stroke="#b9cdd6" stroke-width="0.8"/>`;
    s += '<line x1="0" y1="150" x2="320" y2="150" stroke="#b9cdd6" stroke-width="0.8"/>';
    for (let x = 10; x < 320; x += 20) for (let y = 20; y < 292; y += 20) s += `<circle cx="${x}" cy="${y}" r="0.9" fill="#a9bec8"/>`;
    s += '<rect x="0" y="292" width="320" height="8" fill="#3d4a5c"/>';
    const lab = angle > 1 ? `前倾 ${Math.round(angle)}°` : angle < -1 ? `斜板 ${Math.round(-angle)}°` : '垂直壁';
    s += `<text x="6" y="298.4" class="wall-tag">${lab}</text>`;
    return s;
  }

  function holdShape(id, h) {
    const r = h.r || (h.t === 'f' ? 6.5 : 9);
    let seed = hash(id);
    const pts = [];
    for (let i = 0; i < 9; i++) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      const k = 0.8 + ((seed % 1000) / 1000) * 0.36;
      const a = (i / 9) * Math.PI * 2 + 0.4;
      pts.push({ x: h.x + Math.cos(a) * r * k * 1.15, y: h.y + Math.sin(a) * r * k });
    }
    const m = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
    let d = `M${XY(m(pts[0], pts[1]))}`;
    for (let i = 1; i <= 9; i++) d += ` Q${XY(pts[i % 9])} ${XY(m(pts[i % 9], pts[(i + 1) % 9]))}`;
    return d + 'Z';
  }

  function holds(H, edit) {
    let s = '';
    for (const id in H) {
      const h = H[id];
      const [c, cd] = HOLD[h.t] || HOLD.h;
      if (h.t === 'n') s += `<circle cx="${n1(h.x)}" cy="${n1(Y(h.y))}" r="15" class="next-glow"/>`;
      s += `<path d="${holdShape(id, h)}" fill="${c}" stroke="${cd}" stroke-width="1.2" data-hold="${id}" class="hold${edit ? ' editable' : ''}"/>`;
      s += circle({ x: h.x - 2.5, y: h.y + 2.5 }, h.t === 'f' ? 1.6 : 2.2, 'rgba(255,255,255,.55)', 'pointer-events="none"');
      if (h.t === 'n') s += text({ x: h.x, y: h.y + 17 }, 'NEXT', 'class="next-tag"');
    }
    return s;
  }

  /* ---------- 攀岩者（背面） ---------- */
  function shoe(end, kneeP, l, edge, hook) {
    const shin = norm(sub(end, kneeP));
    let toe = { x: E.sideOf(l), y: 0 };
    if (edge === '外侧踩' || edge === '侧踩') toe = { x: -E.sideOf(l), y: 0 };
    if (hook === 'heel') {
      // 脚跟挂：脚跟压在岩点上，脚尖朝外
      const tip = add(end, { x: 9 * (end.x >= kneeP.x ? 1 : -1), y: 3 });
      return line(end, tip, 8, COL.shoe) + circle(end, 4.2, COL.rubber);
    }
    if (hook === 'toe') {
      const tip = add(end, { x: 0, y: 9 });
      return line(add(end, shin, -3), end, 8, COL.shoe) + line(end, tip, 7, COL.shoe) + circle(tip, 3, COL.rubber);
    }
    const heel = add(end, shin, -3);
    const tip = add(add(end, toe, 9), shin, 1.5);
    return line(heel, tip, 8, COL.shoe) + line(add(heel, { x: 0, y: -2.6 }), add(tip, { x: 0, y: -2.6 }), 2.6, COL.rubber);
  }

  function leg(b, l, P, dim) {
    const L = b.limbs[l];
    const pc = dim ? COL.pantsD : COL.pants;
    return line(L.root, L.joint, 15, pc) + line(L.joint, L.end, 12.5, pc) +
      line(L.joint, L.joint, 13, dim ? COL.pantsD : '#e6b521') + shoe(L.end, L.joint, l, P.limbs[l].edge, P.limbs[l].hook);
  }

  function arm(b, l, P) {
    const L = b.limbs[l];
    const sleeve = add(L.root, sub(L.joint, L.root), 0.38);
    const palm = P.limbs[l].palm;
    const hand = palm
      ? `<ellipse cx="${n1(L.end.x)}" cy="${n1(Y(L.end.y))}" rx="7" ry="3.4" fill="${COL.skin}" stroke="${COL.skinD}" stroke-width=".8"/>`
      : circle(L.end, 4.6, COL.skin, `stroke="${COL.skinD}" stroke-width="0.8"`);
    return line(L.root, L.joint, 8.5, COL.skin) + line(L.joint, L.end, 7.5, COL.skin) + line(L.root, sleeve, 12, COL.shirt) + hand;
  }

  function climber(b, P) {
    const { dir, perp, ws } = b;
    let s = '';
    s += arm(b, 'LH', P) + arm(b, 'RH', P);
    const legs = ['LF', 'RF'];
    for (const l of legs) if (P.limbs[l].z === 'back') s += leg(b, l, P, true);
    for (const l of legs) if (P.limbs[l].z === 'mid') s += leg(b, l, P, false);
    // 躯干
    const w = 4 * ws;
    const torso = [
      add(add(b.sh.L, perp, -w), dir, 2), add(add(b.sh.R, perp, w), dir, 2),
      add(add(b.hj.R, perp, 4 * ws), dir, 12), add(add(b.hj.L, perp, -4 * ws), dir, 12),
    ];
    s += poly(torso, COL.shirt, `stroke="${COL.shirtD}" stroke-width="1" stroke-linejoin="round"`);
    s += line(add(b.sc, dir, -6), add(b.hip, dir, 16), 1, COL.shirtD, 'opacity=".5"');
    // 裤头
    const pel = [
      add(add(b.hj.L, perp, -6 * ws), dir, 13), add(add(b.hj.R, perp, 6 * ws), dir, 13),
      add(add(b.hj.R, perp, 7 * ws), dir, -6), add(add(b.hj.L, perp, -7 * ws), dir, -6),
    ];
    s += poly(pel, COL.pants, `stroke="${COL.pantsD}" stroke-width="1" stroke-linejoin="round"`);
    // 粉袋
    s += circle(add(add(b.hip, dir, 6), perp, 6 * ws), 3.4, '#f8f9fa', 'stroke="#868e96" stroke-width=".8"');
    // 脖子与头（看到后脑）
    s += line(b.sc, add(b.sc, dir, B_NECK), 8, COL.skin);
    s += circle(b.head, 11, COL.hair);
    s += circle(add(b.head, perp, -10.5), 2.6, COL.skin) + circle(add(b.head, perp, 10.5), 2.6, COL.skin);
    s += circle(add(b.head, dir, 3), 7, 'rgba(255,255,255,.08)');
    for (const l of legs) if (P.limbs[l].z === 'front') s += leg(b, l, P, false);
    return s;
  }
  const B_NECK = E.B.neck + 2;

  /* ---------- 物理图层 ---------- */
  function overlays(ctx) {
    const { body: b, P, res, meta = {}, opts } = ctx;
    let s = '';
    const ov = meta.overlay || [];

    // 够得到的范围：空着的手
    if (opts.reach) {
      for (const l of ['LH', 'RH']) {
        if (P.limbs[l].hold) continue;
        s += circle(b.limbs[l].root, E.REACH.arm, 'none', 'class="reach"');
      }
    }
    // 够不到
    for (const l of res.unreachable) {
      const L = P.limbs[l];
      s += line(b.limbs[l].end, L, 1.6, COL.bad, 'stroke-dasharray="3 3"');
      s += text({ x: L.x, y: L.y + (E.isHand(l) ? 14 : -16) }, '够不到', 'class="warn-tag"');
    }
    // 支撑线
    if (opts.line && res.support && !res.falling) {
      const a = res.support.hand, f = res.support.foot;
      const d = norm(sub(a, f));
      s += line(add(f, d, -18), add(a, d, 18), 2, COL.line, 'stroke-dasharray="6 4" opacity=".9"');
      s += text(add(add(f, d, -22), { x: 0, y: -4 }), '支撑线', 'class="line-tag"');
    }
    // 杠杆标注（第 1 章的画法）
    if (ov.includes('lever')) s += lever(res);
    // 力的箭头（教本插图的蓝 / 红箭头）
    if (meta.arrows) s += arrows(meta.arrows, ctx);
    // 动力链：依序亮起的身体部位
    if (meta.chain) s += chain(meta.chain, ctx);
    // 重心
    if (opts.cog) {
      s += line(res.cog, { x: res.cog.x, y: 8 }, 1.6, COL.cog, 'stroke-dasharray="4 4" opacity=".8"');
      s += circle(res.cog, 5, COL.cog, 'stroke="#fff" stroke-width="1.6"');
    }
    // 旋转箭头
    if (res.rotating && !res.falling && !res.air) {
      const d = res.rotDir, c = res.cog;
      // 重力只往下拉：重心以支撑线为门轴，往下、往支撑线那边甩（开门）
      const st = { x: c.x + 34 * d, y: c.y + 8 }, en = { x: c.x - 30 * d, y: c.y - 30 };
      s += `<path d="M${XY(st)} A44 44 0 0 ${d > 0 ? 1 : 0} ${XY(en)}" fill="none" stroke="${COL.bad}" stroke-width="6" opacity=".85" marker-end="url(#arrowRed)" class="spin"/>`;
      s += text({ x: c.x + 46 * d, y: c.y + 20 }, '开门旋转！', `class="rot-tag" text-anchor="${d > 0 ? 'start' : 'end'}"`);
    }
    // 负担数字
    if (opts.loads) {
      for (const c of res.contacts) {
        const sd = E.sideOf(c.l), hand = c.hand;
        const p = { x: c.x + sd * 15, y: c.y + (hand ? 13 : -13) };
        const kg = Math.round(c.kg);
        const w = kg >= 100 ? 34 : kg >= 10 ? 29 : 24;
        s += `<g class="pill" transform="translate(${n1(p.x)},${n1(Y(p.y))})"><rect x="${-w / 2}" y="-7.5" width="${w}" height="15" rx="7.5" fill="${hand ? loadColor(kg) : '#495057'}"/><text y="4" text-anchor="middle">${kg}kg</text></g>`;
      }
    }
    // 用语标注 & 焦点
    if (ctx.labels) s += labels(ctx);
    if (meta.focus) s += focus(ctx);
    return s;
  }

  function lever(res) {
    const sup = res.support || {};
    const feet = res.contacts.filter((c) => !c.hand);
    const hands = res.contacts.filter((c) => c.hand);
    if (!feet.length || !hands.length) return '';
    const foot = sup.foot || feet.reduce((a, c) => (c.v > a.v ? c : a));
    const hand = hands.reduce((a, c) => (Math.abs(c.x - foot.x) > Math.abs(a.x - foot.x) ? c : a));
    const y1 = Math.min(foot.y, 40) - 14, y2 = y1 - 13;
    let s = '';
    const dim = (x0, x1, y, label, cls) => {
      const a = { x: x0, y }, b = { x: x1, y };
      return line(a, b, 1.4, '#343a40', 'marker-start="url(#tick)" marker-end="url(#tick)"') +
        `<g class="dim ${cls}" transform="translate(${n1((x0 + x1) / 2)},${n1(Y(y))})"><rect x="-17" y="-7" width="34" height="13" rx="3"/><text y="3.5" text-anchor="middle">${label}</text></g>`;
    };
    s += line({ x: foot.x, y: foot.y }, { x: foot.x, y: y2 - 4 }, 1, '#343a40', 'stroke-dasharray="2 2"');
    s += line({ x: hand.x, y: hand.y }, { x: hand.x, y: y2 - 4 }, 1, '#343a40', 'stroke-dasharray="2 2" opacity=".5"');
    s += dim(foot.x, res.cog.x, y1, `${Math.round(Math.abs(res.cog.x - foot.x))}cm`, 'a');
    s += dim(foot.x, hand.x, y2, `${Math.round(Math.abs(hand.x - foot.x))}cm`, 'b');
    s += `<polygon points="${n1(foot.x)},${n1(Y(foot.y - 7))} ${n1(foot.x - 6)},${n1(Y(foot.y - 16))} ${n1(foot.x + 6)},${n1(Y(foot.y - 16))}" fill="#2f9e44"/>`;
    s += text({ x: foot.x, y: foot.y - 24 }, '支点', 'class="lever-tag" text-anchor="middle"');
    s += text({ x: hand.x + 8, y: hand.y + 26 }, '施力点', 'class="lever-tag"');
    s += text({ x: res.cog.x + 8, y: res.cog.y - 4 }, '抗力点（体重）', 'class="lever-tag"');
    return s;
  }

  const ARROW_COL = { blue: '#1c7ed6', red: '#e03131', green: '#2f9e44', orange: '#f08c00' };
  function arrows(list, ctx) {
    let s = '';
    for (const a of list) {
      const at = Array.isArray(a.at) ? { x: a.at[0], y: a.at[1] } : anchorOf(a.at, ctx);
      if (!at) continue;
      const d = norm({ x: a.dir[0], y: a.dir[1] });
      const len = a.len || 26;
      const o = a.off ? { x: a.off[0], y: a.off[1] } : { x: 0, y: 0 };
      const st = add(add(at, o), d, a.inward ? -len - 6 : 6), en = add(st, d, len);
      const col = ARROW_COL[a.color || 'blue'];
      s += line(st, en, 5.5, col, `opacity=".9" marker-end="url(#arrow_${a.color || 'blue'})"`);
      if (a.label) {
        const lp = add(en, d, 8);
        const anchor = d.x > 0.3 ? 'start' : d.x < -0.3 ? 'end' : 'middle';
        s += text({ x: lp.x, y: lp.y - (d.y < -0.3 ? 6 : 0) + (d.y > 0.3 ? 4 : 0) }, a.label, `class="arrow-tag" fill="${col}" text-anchor="${anchor}"`);
      }
    }
    return s;
  }

  function chain(c, ctx) {
    // c = { order:['RF','knee','hip','shoulder','RH'], upto:n }
    const { body: b } = ctx;
    const pts = {
      LF: b.limbs.LF.end, RF: b.limbs.RF.end, LK: b.limbs.LF.joint, RK: b.limbs.RF.joint,
      hip: b.hip, sh: b.sc, LS: b.sh.L, RS: b.sh.R, LE: b.limbs.LH.joint, RE: b.limbs.RH.joint, LH: b.limbs.LH.end, RH: b.limbs.RH.end,
    };
    let s = '';
    let prev = null;
    c.order.forEach((k, i) => {
      const p = pts[k];
      if (!p) return;
      const on = i < c.upto;
      if (prev && on) s += line(prev, p, 3, '#f08c00', 'opacity=".85" stroke-dasharray="1 5"');
      s += circle(p, on ? 6.5 : 4, on ? '#f08c00' : 'rgba(240,140,0,.25)', 'stroke="#fff" stroke-width="1.4"');
      if (on) s += text({ x: p.x + 8, y: p.y + 3 }, String(i + 1), 'class="chain-tag"');
      prev = p;
    });
    return s;
  }

  function anchorOf(key, ctx) {
    const { body: b, res } = ctx;
    if (key === 'cog') return res.cog;
    if (key === 'hip') return ctx.body.hip;
    if (key === 'sh') return ctx.body.sc;
    if (key === 'LK' || key === 'RK') return ctx.body.limbs[key[0] + 'F'].joint;
    if (key === 'LE' || key === 'RE') return ctx.body.limbs[key[0] + 'H'].joint;
    if (key === 'line') return res.support ? { x: (res.support.hand.x + res.support.foot.x) / 2, y: (res.support.hand.y + res.support.foot.y) / 2 } : res.cog;
    return b.limbs[key] ? b.limbs[key].end : null;
  }

  function labels(ctx) {
    let s = '';
    const lb = ctx.labels;
    const off = { LH: { x: -64, y: 26 }, RH: { x: 34, y: 30 }, LF: { x: -10, y: -44 }, RF: { x: 40, y: -26 }, cog: { x: 60, y: -10 } };
    for (const k in lb) {
      const a = anchorOf(k, ctx);
      if (!a) continue;
      const o = off[k] || { x: 30, y: 20 };
      const p = { x: E.clamp(a.x + o.x, 30, 290), y: E.clamp(a.y + o.y, 14, 290) };
      const on = ctx.meta && ctx.meta.focus === k;
      s += line(a, p, 1, '#495057', 'opacity=".7"');
      const w = lb[k].length * 9 + 12;
      s += `<g class="term${on ? ' on' : ''}" transform="translate(${n1(p.x)},${n1(Y(p.y))})"><rect x="${-w / 2}" y="-9" width="${w}" height="17" rx="4"/><text y="4" text-anchor="middle">${lb[k]}</text></g>`;
    }
    return s;
  }

  function focus(ctx) {
    const a = anchorOf(ctx.meta.focus, ctx);
    return a ? circle(a, 14, 'none', 'class="focus-ring"') : '';
  }

  /* ---------- 拖动把手 ---------- */
  function handles(ctx) {
    const { body: b, P } = ctx;
    let s = '';
    for (const l of E.LIMBS) {
      const p = P.limbs[l].hold ? P.limbs[l] : b.limbs[l].end;
      s += `<circle cx="${n1(p.x)}" cy="${n1(Y(p.y))}" r="9" class="handle" data-h="${l}"/>`;
    }
    for (const l of E.LIMBS) {
      const j = b.limbs[l].joint;
      s += `<circle cx="${n1(j.x)}" cy="${n1(Y(j.y))}" r="6.5" class="handle joint" data-h="J:${l}"/>`;
    }
    s += `<circle cx="${n1(b.hip.x)}" cy="${n1(Y(b.hip.y + 6))}" r="13" class="handle hip" data-h="hip"/>`;
    return s;
  }

  function stage(el, ctx) {
    el.innerHTML = wall(ctx.P.angle, ctx.wallStyle) + holds(ctx.holds, ctx.edit) + climber(ctx.body, ctx.P) + overlays(ctx) + (ctx.handles ? handles(ctx) : '');
  }

  /* ---------- 侧面小图 ---------- */
  function side(el, ctx) {
    const { P, body: b, res } = ctx;
    const th = (P.angle * Math.PI) / 180;
    const k = 0.5;
    const base = { x: 30, y: 140 };
    const u = { x: Math.sin(th), y: Math.cos(th) }, nrm = { x: Math.cos(th), y: -Math.sin(th) };
    const at = (s, d) => ({ x: base.x + (u.x * s + nrm.x * d) * k, y: base.y - (u.y * s + nrm.y * d) * k });
    const L = (a, c, w, col, ex = '') => `<line x1="${n1(a.x)}" y1="${n1(a.y)}" x2="${n1(c.x)}" y2="${n1(c.y)}" stroke="${col}" stroke-width="${w}" stroke-linecap="round" ${ex}/>`;
    const feet = res.contacts.filter((c) => !c.hand), hands = res.contacts.filter((c) => c.hand);
    const footY = feet.length ? feet.reduce((s, c) => s + c.y, 0) / feet.length : b.hip.y - 80;
    const handY = hands.length ? hands.reduce((s, c) => s + c.y, 0) / hands.length : b.sc.y + 40;
    const d = P.hipDist;
    const foot = at(footY, 3), hip = at(b.hip.y, d), sh = at(b.sc.y, d * 0.45 + 10), hand = at(handY, 3);
    const knee = at((footY + b.hip.y) / 2, d + 16);
    const head = at(b.sc.y + 18, d * 0.45 + 16);
    let s = '';
    // 墙
    const w0 = at(-20, 0), w1 = at(280, 0), w2 = at(280, -60), w3 = at(-20, -60);
    s += `<polygon points="${[w0, w1, w2, w3].map((p) => n1(p.x) + ',' + n1(p.y)).join(' ')}" fill="#c9dbe2"/>`;
    s += L(w0, w1, 3, '#5c6f7c');
    s += `<line x1="0" y1="${base.y}" x2="160" y2="${base.y}" stroke="#3d4a5c" stroke-width="3"/>`;
    // 人
    s += L(hip, knee, 9, COL.pants) + L(knee, foot, 7.5, COL.pants) + L(foot, at(footY, 10), 6, COL.shoe);
    s += L(hip, sh, 12, COL.shirt);
    s += L(sh, hand, 5, COL.skin);
    s += `<circle cx="${n1(head.x)}" cy="${n1(head.y)}" r="7" fill="${COL.hair}"/>`;
    // 腰离墙距离
    const wallAtHip = at(b.hip.y, 0);
    s += L(wallAtHip, hip, 1.2, '#343a40', 'stroke-dasharray="2 2"');
    s += `<circle cx="${n1(hip.x)}" cy="${n1(hip.y)}" r="3.4" fill="${COL.cog}" stroke="#fff" stroke-width="1"/>`;
    s += `<line x1="${n1(hip.x)}" y1="${n1(hip.y)}" x2="${n1(hip.x)}" y2="${n1(hip.y + 26)}" stroke="${COL.cog}" stroke-width="2" marker-end="url(#arrowRedS)"/>`;
    // 拉力箭头
    if (res.H > 0.5 && hands.length) {
      const len = Math.min(42, 6 + res.H * 0.9);
      const from = { x: hand.x + nrm.x * len, y: hand.y - nrm.y * len };
      s += `<line x1="${n1(from.x)}" y1="${n1(from.y)}" x2="${n1(hand.x + nrm.x * 4)}" y2="${n1(hand.y - nrm.y * 4)}" stroke="${COL.line}" stroke-width="3" marker-end="url(#arrowBlue)"/>`;
    }
    s += `<text x="${n1(Math.min(150, hip.x + 8))}" y="${n1(hip.y + 4)}" class="side-tag">腰离墙 ${Math.round(d)}cm</text>`;
    s += `<text x="154" y="14" class="side-tag" text-anchor="end">拉力 ${Math.round(res.H)}kg</text>`;
    el.innerHTML = s;
  }

  window.Render = { stage, side, loadColor, COL };
})();
