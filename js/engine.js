/* 攀岩动作实验室 · 物理引擎
 * 简化的 2D 模型：从攀岩者背后看墙（x 向右，y 向上，单位 cm），
 * 再用「侧面」参数（腰离墙距离、墙的坡度）估算手的水平拉力。
 * 计算思路沿用教本第 1 章：杠杆 / 力矩、作用与反作用力。
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Engine = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // 身体尺寸（cm）与体重（kg）
  const B = { W: 60, torso: 52, neck: 8, headR: 11, shoulderHalf: 18, hipHalf: 10,
    upperArm: 30, foreArm: 30, thigh: 44, shin: 44 };
  const REACH = { arm: B.upperArm + B.foreArm, leg: B.thigh + B.shin };
  const LIMBS = ['LH', 'RH', 'LF', 'RF'];
  const NAME = { LH: '左手', RH: '右手', LF: '左脚', RF: '右脚' };
  const isHand = (l) => l[1] === 'H';
  const sideOf = (l) => (l[0] === 'L' ? -1 : 1);

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const avg = (arr) => arr.reduce((s, v) => s + v, 0) / (arr.length || 1);
  const mid = (a, b, t) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });

  /* 两节肢体的反向运动学：根部 → 关节（肘 / 膝）→ 末端 */
  function ik2(rootP, target, L1, L2, side) {
    const dx = target.x - rootP.x, dy = target.y - rootP.y;
    const d = Math.hypot(dx, dy);
    const max = L1 + L2;
    const reachable = d <= max + 1.5;
    const base = Math.atan2(dy, dx);
    const dd = clamp(d, Math.abs(L1 - L2) + 1, max - 0.01);
    const a = Math.acos(clamp((L1 * L1 + dd * dd - L2 * L2) / (2 * L1 * dd), -1, 1));
    const j1 = { x: rootP.x + L1 * Math.cos(base + a), y: rootP.y + L1 * Math.sin(base + a) };
    const j2 = { x: rootP.x + L1 * Math.cos(base - a), y: rootP.y + L1 * Math.sin(base - a) };
    // 肘、膝朝外，并略偏向下方
    const score = (j) => side * j.x - 0.5 * j.y;
    const joint = score(j1) >= score(j2) ? j1 : j2;
    const end = { x: rootP.x + dd * Math.cos(base), y: rootP.y + dd * Math.sin(base) };
    return { joint, end, reachable, d };
  }

  /* 由姿势（腰的位置 + 四肢目标）推出整个身体 */
  function buildBody(P) {
    const hip = P.hip;
    const hx = (P.limbs.LH.x + P.limbs.RH.x) / 2;
    const hy = (P.limbs.LH.y + P.limbs.RH.y) / 2;
    let ang = Math.atan2(hx - hip.x, Math.max(30, hy - hip.y)) * 0.6;
    ang = clamp(ang, -0.55, 0.55);
    const dir = { x: Math.sin(ang), y: Math.cos(ang) };
    const perp = { x: dir.y, y: -dir.x }; // 指向身体右侧
    const ws = 1 - 0.4 * Math.abs(P.turn || 0); // 转身时肩、髋看起来变窄
    const off = (p, k) => ({ x: p.x + perp.x * k, y: p.y + perp.y * k });
    const sc = { x: hip.x + dir.x * B.torso, y: hip.y + dir.y * B.torso };
    const sh = { L: off(sc, -B.shoulderHalf * ws), R: off(sc, B.shoulderHalf * ws) };
    const hj = { L: off(hip, -B.hipHalf * ws), R: off(hip, B.hipHalf * ws) };
    const head = { x: sc.x + dir.x * (B.neck + B.headR), y: sc.y + dir.y * (B.neck + B.headR) };
    const limbs = {};
    for (const l of LIMBS) {
      const hand = isHand(l);
      const rootP = hand ? sh[l[0]] : hj[l[0]];
      const flip = P.limbs[l].knee === 'in' ? -1 : 1; // 垂膝：膝盖往内扣
      const r = ik2(rootP, P.limbs[l], hand ? B.upperArm : B.thigh, hand ? B.foreArm : B.shin, sideOf(l) * flip);
      limbs[l] = { root: rootP, joint: r.joint, end: r.end, reachable: r.reachable, d: r.d };
    }
    return { hip, sc, sh, hj, head, dir, perp, ws, limbs };
  }

  /* 各部位质量比例加权，得到全身重心（甩腿会移动重心 → 挂旗法的原理） */
  function centerOfGravity(body) {
    const parts = [[0.50, mid(body.hip, body.sc, 0.42)], [0.08, body.head]];
    for (const l of LIMBS) {
      const L = body.limbs[l], hand = isHand(l);
      parts.push([hand ? 0.03 : 0.10, mid(L.root, L.joint, 0.45)]);
      parts.push([hand ? 0.022 : 0.06, mid(L.joint, L.end, 0.42)]);
    }
    let s = 0, x = 0, y = 0;
    for (const [w, p] of parts) { s += w; x += w * p.x; y += w * p.y; }
    return { x: x / s, y: y / s };
  }

  /* 竖直方向的力分配：Σf = 体重，Σf·(x−重心x) = 0（不旋转）。
   * 解不唯一时取「最省力」的解：手比脚贵 3 倍（尽量让脚出力）。 */
  function solveVertical(cs, xg, W) {
    const cost = (c) => (c.hand ? 3 : c.hook ? 1.6 : 1);
    let act = cs.map((_, i) => i);
    for (let it = 0; it < 8 && act.length; it++) {
      let S0 = 0, S1 = 0, S2 = 0;
      for (const i of act) {
        const c = cost(cs[i]), dx = cs[i].x - xg;
        S0 += 1 / c; S1 += dx / c; S2 += (dx * dx) / c;
      }
      const f = cs.map(() => 0);
      const det = S0 * S2 - S1 * S1;
      if (Math.abs(det) < 1e-6) {
        for (const i of act) f[i] = (W / cost(cs[i])) / S0;
        return f;
      }
      const lam = (W * S2) / det, mu = (-W * S1) / det;
      let worst = -1, wv = -1e-9;
      for (const i of act) {
        f[i] = (lam + mu * (cs[i].x - xg)) / cost(cs[i]);
        if (f[i] < wv) { wv = f[i]; worst = i; }
      }
      if (worst < 0) return f;
      act = act.filter((i) => i !== worst);
    }
    // 兜底：用重心左右最近的两个点做杠杆分配
    const f = cs.map(() => 0);
    let li = -1, ri = -1;
    cs.forEach((c, i) => {
      if (c.x <= xg && (li < 0 || c.x > cs[li].x)) li = i;
      if (c.x >= xg && (ri < 0 || c.x < cs[ri].x)) ri = i;
    });
    if (li < 0 || ri < 0 || li === ri) { f[li < 0 ? ri : li] = W; return f; }
    const span = cs[ri].x - cs[li].x;
    f[li] = (W * (cs[ri].x - xg)) / span;
    f[ri] = (W * (xg - cs[li].x)) / span;
    return f;
  }

  /* 分析一个姿势：稳不稳、会不会旋转、每个支撑点负担几公斤 */
  function analyze(P, body) {
    const W = B.W;
    const cog = centerOfGravity(body);
    const res = { cog, contacts: [], unreachable: [], rotating: false, falling: false, reason: '',
      torque: 0, rotDir: 0, offset: 0, H: 0, lever: 0, handMax: 0, handSum: 0, support: null,
      pattern: '', flags: [], tips: [] };

    const cs = [];
    for (const l of LIMBS) {
      const L = P.limbs[l];
      if (!L.hold) continue;
      if (!body.limbs[l].reachable) { res.unreachable.push(l); continue; }
      cs.push({ l, x: L.x, y: L.y, hand: isHand(l), hook: !isHand(l) && !!L.hook, v: 0, h: 0, extra: 0, kg: 0 });
    }
    res.contacts = cs;
    res.air = !!P.air;
    const hands = cs.filter((c) => c.hand), feet = cs.filter((c) => !c.hand);
    // 能「拉」的点：手 + 挂脚（脚跟 / 脚尖勾住岩点）
    const pulls = cs.filter((c) => c.hand || c.hook), stands = cs.filter((c) => !c.hand && !c.hook);

    // 挂旗：悬空且明显甩向一侧的脚
    for (const l of ['LF', 'RF']) {
      const L = P.limbs[l];
      if (L.hold && body.limbs[l].reachable) continue;
      const end = body.limbs[l].end;
      if (Math.abs(end.x - body.hip.x) > 22) {
        const crossing = sideOf(l) * (end.x - body.hip.x) < 0;
        res.flags.push({ l, kind: crossing ? (L.z === 'front' ? 'outer' : 'inner') : 'flag' });
      }
    }

    if (!cs.length) {
      if (res.air) { res.tips.push({ type: 'good', text: '腾空中：身体离开岩点的这一瞬间，只能靠起跳的速度。' }); return res; }
      res.falling = true; res.reason = '没有任何支撑点';
      return finish(res, P);
    }

    // 1) 正面：竖直力与旋转
    const xs = cs.map((c) => c.x);
    const minx = Math.min(...xs), maxx = Math.max(...xs);
    // 反作用力类（垂膝 / 外撑 / 侧身）：手脚往相反方向推拉，可以抵消旋转
    const wideFeet = feet.length >= 2 && Math.abs(feet[0].x - feet[1].x) > 40;
    const dropKnee = wideFeet && feet.some((c) => P.limbs[c.l].knee === 'in');
    res.oppose = !!P.oppose || dropKnee;
    res.oppKind = P.oppose || (dropKnee ? '垂膝式' : '');
    // 岩点和手掌、鞋子都有宽度，所以容许几公分的误差
    const TOL = 5;
    const outside = cog.x < minx - TOL || cog.x > maxx + TOL;
    if (outside && (res.air || (hands.length && !feet.length))) {
      // 动态中 / 只靠手吊着：不是「开门」，而是像钟摆一样晃
      res.swing = !res.air;
    } else if (res.oppose && outside) {
      const xb = cog.x < minx ? minx : maxx;
      const ys = cs.map((c) => c.y);
      const span = Math.max(40, Math.max(...ys) - Math.min(...ys));
      res.side = (W * Math.abs(cog.x - xb)) / span * 2; // 手横向拉、脚横向推
    } else if (cog.x < minx - TOL || cog.x > maxx + TOL) {
      const xb = cog.x < minx ? minx - TOL : maxx + TOL;
      res.rotating = true;
      res.offset = Math.abs(cog.x - xb);
      res.torque = W * res.offset;
      res.rotDir = Math.sign(cog.x - xb);
    }
    // 支撑点几乎在同一条竖线上时（例如平行支撑 + 挂旗），按「手贵脚便宜」直接分配
    const f = maxx - minx < 2 * TOL || (outside && (res.oppose || res.swing || res.air))
      ? solveVertical(cs.map((c) => Object.assign({}, c, { x: minx })), minx, W)
      : solveVertical(cs, clamp(cog.x, minx, maxx), W);
    cs.forEach((c, i) => (c.v = f[i]));

    // 2) 侧面：腰离墙 + 坡度 → 手的水平拉力（以踩脚为支点的杠杆）
    const th = ((P.angle || 0) * Math.PI) / 180;
    if (stands.length && pulls.length) {
      const footY = avg(stands.map((c) => c.y)), handY = avg(pulls.map((c) => c.y));
      res.lever = ((cog.y - footY) * Math.sin(th) + P.hipDist * Math.cos(th)) * (res.oppose ? 0.5 : 1);
      const span = Math.max(25, (handY - footY) * Math.cos(th));
      res.H = Math.max(0, (W * res.lever) / span);
      if (th > 0) {
        // 前倾壁：脚能承担的体重变少，转移到手上（对蹬时脚撑得住更多）
        const k = 1 - (res.oppose ? 0.25 : 0.55) * Math.sin(th);
        let moved = 0;
        stands.forEach((c) => { moved += c.v * (1 - k); c.v *= k; });
        const sv = pulls.reduce((s, c) => s + c.v, 0);
        pulls.forEach((c) => (c.v += moved * (sv > 0.01 ? c.v / sv : 1 / pulls.length)));
      }
    } else if (stands.length && !pulls.length) {
      const footY = avg(stands.map((c) => c.y));
      res.lever = (cog.y - footY) * Math.sin(th) + P.hipDist * Math.cos(th);
      if (res.oppose) res.lever = P.hipDist * Math.cos(th) * 0.8;
      if (res.rotating) { res.falling = true; res.reason = '重心不在脚的正上方，人会倒下'; }
      else if (res.lever > 14) { res.falling = true; res.reason = res.oppose ? '上半身离墙太远，重心跑到脚后面，会往后倒' : '没有手拉住，身体会往后倒'; }
    }

    const sv = pulls.reduce((s, c) => s + c.v, 0);
    pulls.forEach((c) => { c.h = res.H * (sv > 0.01 ? c.v / sv : 1 / pulls.length); });

    if (res.rotating) {
      if (!hands.length) {
        res.falling = true; res.reason = res.reason || '重心不在脚的正上方，人会倒下';
      } else {
        // 手必须靠握力去抵抗旋转力矩（大约 30cm 的力臂）
        const main = hands.reduce((a, b) => (a.v >= b.v ? a : b));
        main.extra = res.torque / 30;
      }
    }
    if (res.side) pulls.forEach((c) => { c.h += res.side / pulls.length; });
    cs.forEach((c) => { c.kg = c.hand || c.hook ? Math.hypot(c.v + c.extra, c.h) : c.v; });
    if (res.air && res.falling) { res.falling = false; res.reason = ''; }

    // 支撑方式
    if (hands.length === 1 && feet.length === 1) {
      res.pattern = hands[0].l[0] === feet[0].l[0] ? 'parallel' : 'diagonal';
    } else if (hands.length === 1 && feet.length === 2) res.pattern = 'three';
    else if (hands.length === 2 && feet.length) res.pattern = 'two-hands';
    else if (hands.length && !feet.length) res.pattern = 'hang';
    else if (!hands.length) res.pattern = 'feet';

    if (hands.length === 1 && feet.length) {
      const foot = feet.reduce((a, b) => (a.v >= b.v ? a : b));
      res.support = { hand: hands[0], foot };
    }
    return finish(res, P);
  }

  const PATTERN_NAME = {
    parallel: '平行支撑（同侧手脚）', diagonal: '对角支撑', three: '一手两脚',
    'two-hands': '双手支撑', hang: '只靠手吊着', feet: '只靠脚站着', '': '—',
  };

  function finish(res, P) {
    const hands = res.contacts.filter((c) => c.hand);
    res.handMax = hands.reduce((m, c) => Math.max(m, c.kg), 0);
    res.handSum = hands.reduce((s, c) => s + c.kg, 0);
    const t = res.tips;
    const r0 = (v) => Math.round(v);
    if (res.unreachable.length) {
      t.push({ type: 'warn', text: `${res.unreachable.map((l) => NAME[l]).join('、')}够不到岩点：把腰（重心）往那个方向移近一点。` });
    }
    if (res.falling) {
      t.push({ type: 'bad', text: `会掉下来：${res.reason}。` });
      return res;
    }
    if (res.oppose) t.push({ type: 'good', text: `反作用力（${res.oppKind}）：手脚往相反方向推拉，身体不会旋转${res.side ? `，但手要多出约 ${r0(res.side)}kg 横向拉力` : ''}。` });
    if (res.swing) t.push({ type: 'warn', text: '只靠手吊着，重心不在手的正下方：身体会像钟摆一样晃，要稳住摆荡、尽快把脚放回墙上。' });
    if (res.air) t.push({ type: 'good', text: '动态动作进行中：靠的是速度和时机，不是静态平衡。' });
    const hooks = res.contacts.filter((c) => c.hook);
    if (hooks.length) {
      t.push({ type: 'good', text: `挂脚中：${hooks.map((c) => NAME[c.l]).join('、')}像第三只手一样拉住岩点，负担 ${r0(hooks[0].kg)}kg，手就轻松了。` });
    }
    const flagNames = { inner: '内侧挂旗法', outer: '外侧挂旗法', flag: '挂旗法' };
    const flagTxt = res.flags.length ? `（${res.flags.map((f) => flagNames[f.kind]).join('、')}）` : '';
    if (res.rotating) {
      const extra = r0(res.torque / 30);
      let fix = '把腰移到支撑线上方。';
      if (res.pattern === 'parallel') fix = '试试：①改踩对角那一侧的脚点（对角支撑）②把空着的腿甩到反方向（挂旗法）。';
      else if (res.pattern === 'diagonal') fix = '把空着的腿甩得更远一点，或把腰移向踩脚。';
      t.push({ type: 'bad', text: `身体会旋转（开门）：重心偏离支撑线 ${r0(res.offset)}cm，支撑手要多出约 ${extra}kg 去抵抗。${fix}` });
    } else if (res.pattern === 'diagonal') {
      t.push({ type: 'good', text: `对角支撑${flagTxt}：重心落在支撑线上，身体不会旋转。` });
    } else if (res.pattern === 'parallel') {
      t.push({ type: 'good', text: `平行支撑${flagTxt}：靠甩出去的腿把重心拉回支撑线，所以不旋转。` });
    } else if (res.pattern === 'two-hands' || res.pattern === 'three') {
      t.push({ type: 'good', text: '多点支撑，很稳定。准备出手前，先想好放开哪只手后要靠哪条支撑线。' });
    }
    if (res.H > 8) {
      t.push({ type: 'warn', text: `腰离墙 ${r0(P.hipDist)}cm${P.angle > 0 ? `、前倾 ${r0(P.angle)}°` : ''}：手要额外出约 ${r0(res.H)}kg 的拉力。把腰贴近墙面，体重才会落在脚上。` });
    }
    if (!res.rotating && res.handMax > 25) {
      t.push({ type: 'warn', text: `支撑手负担 ${r0(res.handMax)}kg 偏重：把重心移向踩脚的正上方（缩短力臂）。` });
    } else if (!res.rotating && hands.length && res.handMax <= 14) {
      t.push({ type: 'good', text: '手的负担很轻，体力可以留给后面的动作。' });
    }
    return res;
  }

  /* ---------- 姿势数据 ---------- */
  const LIMB_PROPS = ['z', 'edge', 'knee', 'hook', 'palm'];
  const POSE_KEYS = ['hip', 'LH', 'RH', 'LF', 'RF', 'turn', 'hipDist', 'angle', 'air', 'oppose'].concat(LIMB_PROPS);

  function resolve(fr, holds) {
    const P = { hip: { x: fr.hip[0], y: fr.hip[1] }, turn: fr.turn || 0,
      hipDist: fr.hipDist == null ? 20 : fr.hipDist, angle: fr.angle || 0, air: !!fr.air, oppose: fr.oppose || '', limbs: {} };
    for (const l of LIMBS) {
      const v = fr[l];
      let o;
      if (typeof v === 'string') {
        const h = holds[v];
        if (!h) throw new Error('找不到岩点 ' + v);
        o = { x: h.x, y: h.y, hold: v };
      } else o = { x: v[0], y: v[1], hold: null };
      for (const k of LIMB_PROPS) o[k] = (fr[k] && fr[k][l]) || (k === 'z' ? 'mid' : null);
      P.limbs[l] = o;
    }
    return P;
  }

  const clonePose = (P) => JSON.parse(JSON.stringify(P));

  function lerpPose(A, Bp, t) {
    const P = clonePose(Bp);
    P.hip = { x: lerp(A.hip.x, Bp.hip.x, t), y: lerp(A.hip.y, Bp.hip.y, t) };
    P.turn = lerp(A.turn, Bp.turn, t);
    P.hipDist = lerp(A.hipDist, Bp.hipDist, t);
    P.angle = lerp(A.angle, Bp.angle, t);
    P.air = t < 0.5 ? A.air : Bp.air;
    P.oppose = t < 0.5 ? A.oppose : Bp.oppose;
    for (const l of LIMBS) {
      const a = A.limbs[l], b = Bp.limbs[l], o = P.limbs[l];
      if (a.hold && a.hold === b.hold) continue;
      const moving = Math.abs(a.x - b.x) > 0.5 || Math.abs(a.y - b.y) > 0.5;
      o.x = lerp(a.x, b.x, t);
      o.y = lerp(a.y, b.y, t) + (moving ? Math.sin(Math.PI * t) * 6 : 0);
      o.hold = t >= 0.999 ? b.hold : moving ? null : t < 0.5 ? a.hold : b.hold;
      for (const k of LIMB_PROPS) o[k] = t < 0.5 ? a[k] : b[k];
    }
    return P;
  }

  return { B, REACH, LIMBS, NAME, PATTERN_NAME, POSE_KEYS, LIMB_PROPS, isHand, sideOf, clamp, lerp, dist,
    buildBody, centerOfGravity, analyze, resolve, clonePose, lerpPose };
});
