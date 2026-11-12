/* 攀岩动作实验室 · 界面与互动 */
(function () {
  'use strict';
  const E = window.Engine, R = window.Render, C = window.Content, GD = window.Guide;
  const $ = (s) => document.querySelector(s);
  const svg = $('#stage'), scene = $('#scene'), sideScene = $('#sideScene');
  const ui = { list: $('#list'), panel: $('#panel'), caption: $('#caption'), controls: $('#controls'),
    badge: $('#badge'), chip: $('#chip'), modal: $('#modal'), inset: $('#inset'), stageBox: $('#stageBox') };

  const store = {
    get(k, d) { try { const v = localStorage.getItem('climb.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('climb.' + k, JSON.stringify(v)); } catch (e) { /* 无法存储时忽略 */ } },
  };

  const S = {
    mode: 'learn', li: 0, ci: 0, step: 0, frames: [], holds: {}, P: null, meta: {}, playing: false,
    anim: null, wait: 0, free: false, drag: null, body: null, res: null,
    opts: Object.assign({ cog: true, line: true, loads: true, reach: true }, store.get('opts', {})),
    lab: { edit: false, holdType: 'h', n: 0 }, ch: null,
    done: store.get('done', {}), seen: store.get('seen', {}),
  };

  const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  const r0 = Math.round;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function mergeRaw(prev, fr) {
    const o = {};
    for (const k of E.POSE_KEYS) o[k] = fr[k] !== undefined ? fr[k] : prev[k];
    return o;
  }

  /* ---------- 文字模板：{RH} {dx} {H} ---------- */
  function fill(tpl, res) {
    if (!tpl) return '';
    return tpl.replace(/\{(\w+)\}/g, (m, k) => {
      if (k === 'H') return r0(res.H);
      if (k === 'hand') return r0(res.handSum);
      if (k === 'dx') {
        const feet = res.contacts.filter((c) => !c.hand);
        if (!feet.length) return '—';
        const f = res.support ? res.support.foot : feet.reduce((a, c) => (c.v > a.v ? c : a));
        return r0(Math.abs(res.cog.x - f.x));
      }
      const c = res.contacts.find((x) => x.l === k);
      return c ? r0(c.kg) : '—';
    });
  }

  /* =========================================================
   * 模式切换
   * ========================================================= */
  function setMode(m) {
    S.mode = m;
    document.querySelectorAll('#tabs button').forEach((b) => b.classList.toggle('on', b.dataset.mode === m));
    hideModal();
    document.body.classList.toggle('guide-mode', m === 'guide');
    $('#hud').hidden = true;
    $('#guideView').hidden = m !== 'guide';
    if (m === 'guide') return loadGuide(S.gi || 'full_crimp');
    if (m === 'learn') loadLesson(S.li);
    if (m === 'lab') loadLab();
    if (m === 'challenge') loadChallenge(S.ci);
    store.set('mode', m);
  }
  $('#tabs').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) setMode(b.dataset.mode); });

  /* ---------- 左侧目录 ---------- */
  function buildList() {
    let h = '';
    if (S.mode === 'learn') {
      let g = '';
      const nx = nextLesson();
      const nSeen = K.PATH.filter((id) => lessonDone(id)).length;
      h += `<div class="path-card"><b>学习路线</b><span>已学 ${nSeen} / ${K.PATH.length} 课</span>
        <div class="track"><div class="fill" style="width:${(nSeen / K.PATH.length) * 100}%"></div></div>
        ${nx >= 0 ? `<button class="btn primary" data-i="${nx}">${nSeen ? '继续' : '开始'}：${esc(C.LESSONS[nx].title.split('：')[0])} →</button>` : '<span>全部学完了！</span>'}</div>`;
      C.LESSONS.forEach((ls, i) => {
        if (ls.group !== g) { g = ls.group; h += `<div class="group-title">${esc(g)}</div>`; }
        h += `<button class="item${i === S.li ? ' on' : ''}" data-i="${i}"><span class="tag">${esc(ls.ch)}</span><span>${esc(ls.title)}</span><span class="lvl l${K.STAGES.findIndex((st) => st.name === K.LEVEL[ls.id])}">${esc(K.LEVEL[ls.id])}</span>${lessonDone(ls.id) ? '<span class="done">✓</span>' : ''}</button>`;
      });
      for (const c of C.COMING) {
        h += `<div class="group-title">${esc(c.group)} · 即将推出</div>`;
        for (const it of c.items) h += `<div class="item soon"><span class="tag">稍后</span><span>${esc(it)}</span></div>`;
      }
    } else if (S.mode === 'guide') {
      for (const g of GD.CARDS) {
        h += `<div class="group-title">${esc(g.cat)}</div>`;
        for (const it of g.items) h += `<button class="item${it.id === S.gi ? ' on' : ''}" data-g="${it.id}"><span>${esc(it.name)}</span><small style="margin-left:auto;color:var(--muted)">${esc(it.en)}</small></button>`;
      }
    } else if (S.mode === 'challenge') {
      h += '<div class="group-title">挑战关卡</div>';
      let pr = false;
      C.CHALLENGES.forEach((c, i) => {
        if (c.practice && !pr) { pr = true; h += '<div class="group-title">课后练习（每课一题）</div>'; }
        h += `<button class="item${i === S.ci ? ' on' : ''}" data-i="${i}"><span>${esc(c.title)}</span>${S.done[c.id] ? '<span class="done">✓</span>' : ''}</button>`;
      });
    } else {
      h += '<div class="group-title">载入墙面</div>';
      h += `<button class="item" data-lab="default"><span class="tag">自由</span><span>练习墙（很多岩点）</span></button>`;
      C.LESSONS.forEach((ls, i) => {
        h += `<button class="item" data-lab="${i}"><span class="tag">${esc(ls.ch)}</span><span>${esc(ls.title)}</span></button>`;
      });
    }
    ui.list.innerHTML = h;
    const on = ui.list.querySelector('.item.on');
    if (on) ui.list.scrollLeft = Math.max(0, on.offsetLeft - ui.list.clientWidth / 2 + on.offsetWidth / 2);
  }
  ui.list.addEventListener('click', (e) => {
    const b = e.target.closest('button.item, .path-card button');
    if (!b) return;
    if (S.mode === 'guide') loadGuide(b.dataset.g);
    else if (S.mode === 'learn') loadLesson(+b.dataset.i);
    else if (S.mode === 'challenge') loadChallenge(+b.dataset.i);
    else if (b.dataset.lab === 'default') loadLab();
    else loadLab(C.LESSONS[+b.dataset.lab]);
  });

  /* =========================================================
   * 课程
   * ========================================================= */
  const K = C.COACH;
  // 一课算「学完」：动画看到最后一步；有课后练习的话，还要练习过关
  function lessonDone(id) {
    const pid = K.PRACTICE[id];
    return pid ? !!S.done[pid] : !!S.seen[id];
  }
  function nextLesson() {
    const id = K.PATH.find((x) => !lessonDone(x));
    return id ? C.LESSONS.findIndex((l) => l.id === id) : -1;
  }
  function pathNext(id) {
    const k = K.PATH.indexOf(id);
    const nid = K.PATH[k + 1];
    return nid ? C.LESSONS.findIndex((l) => l.id === nid) : -1;
  }
  function practiceIndex(id) {
    const pid = K.PRACTICE[id];
    return pid ? C.CHALLENGES.findIndex((c) => c.id === pid) : -1;
  }
  function lessonOfChallenge(cid) {
    const id = Object.keys(K.PRACTICE).find((k) => K.PRACTICE[k] === cid);
    return id ? C.LESSONS.findIndex((l) => l.id === id) : -1;
  }

  function loadLesson(i) {
    S.li = i; store.set('li', i);
    const ls = C.LESSONS[i];
    S.holds = ls.holds;
    S.wallStyle = ls.wallStyle || null;
    let prev = {};
    S.frames = ls.frames.map((fr) => { prev = mergeRaw(prev, fr); return { raw: prev, pose: E.resolve(prev, ls.holds), meta: fr }; });
    S.step = 0; S.P = E.clonePose(S.frames[0].pose); S.meta = S.frames[0].meta;
    S.anim = null; S.free = false; S.playing = false; S.wait = 0;
    ui.inset.classList.toggle('big', !!ls.sideFocus);
    buildList(); buildLearnPanel(); buildLearnControls(); setBadge(S.meta.badge);
    // 打开课程后自动播放
    S.playing = true; S.wait = 1.6;
  }

  function goStep(k) {
    k = E.clamp(k, 0, S.frames.length - 1);
    S.step = k;
    const fr = S.frames[k];
    S.anim = { from: E.clonePose(S.P), to: fr.pose, t: 0, dur: fr.meta.dur || 1.2 };
    S.meta = fr.meta; S.free = false;
    setBadge(null);
    updateLearnControls();
    if (k === S.frames.length - 1) {
      const id = C.LESSONS[S.li].id;
      if (!S.seen[id]) { S.seen[id] = true; store.set('seen', S.seen); buildList(); buildLearnPanel(); }
    }
  }

  function showCompare(which) {
    const ls = C.LESSONS[S.li];
    if (!ls.compare) return;
    const fr = ls.compare[which];
    const raw = mergeRaw(S.frames[0].raw, fr);
    S.playing = false;
    S.anim = { from: E.clonePose(S.P), to: E.resolve(raw, ls.holds), t: 0, dur: 0.9 };
    S.meta = Object.assign({}, fr, { badge: which, isCompare: true });
    S.free = false;
    setBadge(null);
    updateLearnControls();
  }

  function buildLearnPanel() {
    const ls = C.LESSONS[S.li], inf = ls.info;
    const tip = K.TIPS[ls.id], k = K.PATH.indexOf(ls.id), pi = practiceIndex(ls.id), nx = pathNext(ls.id);
    const pDone = pi >= 0 && S.done[C.CHALLENGES[pi].id];
    ui.panel.innerHTML = `
      <h2>${esc(ls.title)}</h2>
      <div class="ref">对应教本 ${esc(ls.ch)} · <span class="lvl l${K.STAGES.findIndex((st) => st.name === K.LEVEL[ls.id])}">${esc(K.LEVEL[ls.id])}</span> · 学习路线第 ${k + 1} / ${K.PATH.length} 课</div>
      ${tip ? `<div class="say"><b>一句话记住</b><p>${esc(tip[0])}</p></div>` : ''}
      <div class="sec scene"><h4>适用场合</h4><p>${esc(inf.scene)}</p></div>
      <div class="sec steps"><h4>步骤</h4><ol>${inf.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol></div>
      <div class="sec key"><h4>技巧要素</h4><p>${esc(inf.key)}</p></div>
      <div class="point"><b>POINT</b>${inf.points.map((p) => `<p>${esc(p)}</p>`).join('')}</div>
      <div class="todo">
        <h4>学这一课的三步</h4>
        <ol>
          <li class="${S.seen[ls.id] ? 'ok' : ''}">看动画到最后一步</li>
          <li>${ls.compare ? '按「错误做法 / 正确做法」比较，再' : ''}自己拖动手、脚、腰试试看</li>
          ${pi >= 0 ? `<li class="${pDone ? 'ok' : ''}">换你做：自己摆出来过关</li>` : ''}
        </ol>
        ${pi >= 0 ? `<button class="btn primary" data-practice="${pi}">✋ 换你做${pDone ? '（已过关）' : ''}</button>` : ''}
        ${nx >= 0 ? `<button class="btn" data-next="${nx}">下一课：${esc(C.LESSONS[nx].title.split('：')[0])} →</button>` : ''}
      </div>
      ${tip ? `<div class="sec gym"><h4>到岩馆这样练</h4><p>${esc(tip[1])}</p><p class="note">练习建议是本工具补充的，不是教本原文。</p></div>` : ''}
      <div class="readout" id="readout"></div>`;
    lastReadout = '';
  }

  function buildLearnControls() {
    const ls = C.LESSONS[S.li];
    ui.controls.innerHTML = `
      <button class="btn" data-a="prev" title="上一步">◀</button>
      <button class="btn primary" data-a="play" id="playBtn">▶ 播放</button>
      <button class="btn" data-a="next" title="下一步">▶|</button>
      <div class="dots" id="dots">${S.frames.map((_, i) => `<i data-k="${i}"></i>`).join('')}</div>
      <button class="btn" data-a="replay">↺ 重播</button>
      <span class="spacer"></span>
      ${ls.compare ? '<button class="btn bad" data-a="bad">✕ 错误做法</button><button class="btn good" data-a="good">○ 正确做法</button>' : ''}
      ${practiceIndex(ls.id) >= 0 ? '<button class="btn primary" data-a="practice">✋ 换你做</button>' : ''}
      <button class="btn" data-a="tolab">🧪 在实验室打开</button>`;
    updateLearnControls();
  }

  function updateLearnControls() {
    if (S.mode !== 'learn') return;
    const pb = $('#playBtn');
    if (pb) pb.textContent = S.playing ? '❚❚ 暂停' : '▶ 播放';
    document.querySelectorAll('#dots i').forEach((d, i) => d.classList.toggle('on', i === S.step && !S.free));
  }

  ui.controls.addEventListener('click', (e) => {
    const t = e.target.closest('[data-a],[data-k]');
    if (!t) return;
    if (t.dataset.k != null) { S.playing = false; goStep(+t.dataset.k); return; }
    const a = t.dataset.a;
    if (S.mode === 'learn') {
      if (a === 'prev') { S.playing = false; goStep(S.step - 1); }
      if (a === 'next') { S.playing = false; goStep(S.step + 1); }
      if (a === 'play') {
        S.playing = !S.playing;
        if (S.playing) {
          if (S.free || S.step >= S.frames.length - 1) goStep(S.free ? S.step : 0);
          else if (!S.anim) S.wait = 0.01;
        }
        updateLearnControls();
      }
      if (a === 'replay') { S.P = E.clonePose(S.frames[0].pose); S.playing = true; goStep(0); }
      if (a === 'bad' || a === 'good') showCompare(a);
      if (a === 'tolab') loadLab(C.LESSONS[S.li], S.P);
      if (a === 'practice') { S.ci = practiceIndex(C.LESSONS[S.li].id); setMode('challenge'); }
    } else if (S.mode === 'challenge') {
      if (a === 'retry') loadChallenge(S.ci);
      if (a === 'hint') { S.ch.showHint = true; S.ch.def.type === 'dyno' ? buildDynoPanel() : buildChallengePanel(); }
      if (a === 'demo') playDemo();
    } else if (S.mode === 'lab') {
      if (a === 'reset') loadLab(S.lab.src);
    }
  });

  function setBadge(b) {
    if (!b) { ui.badge.hidden = true; return; }
    ui.badge.hidden = false;
    ui.badge.className = 'badge ' + b;
    ui.badge.textContent = b === 'good' ? '○' : '✕';
  }

  /* =========================================================
   * 图鉴
   * ========================================================= */
  const GDEFS = `<defs>${[['b', '#1c7ed6'], ['o', '#f08c00'], ['r', '#e03131']].map(([k, c]) => `<marker id="g_arrow_${k}" viewBox="0 0 10 10" refX="4" refY="5" markerWidth="3" markerHeight="3" orient="auto"><path d="M0 0L10 5L0 10z" fill="${c}"/></marker>`).join('')}</defs>`;
  function findCard(id) {
    for (const g of GD.CARDS) for (const it of g.items) if (it.id === id) return { it, cat: g.cat };
    return null;
  }
  function loadGuide(id) {
    S.mode = 'guide'; S.gi = id; store.set('gi', id);
    const f = findCard(id) || findCard('full_crimp');
    const it = f.it;
    const pic = GD.SVG[it.id] ? `<svg class="g-pic" viewBox="0 0 240 160">${GDEFS}${GD.SVG[it.id]()}</svg>
      <div class="g-legend"><i style="background:#f08c00"></i>接触的部位<i style="background:#1c7ed6"></i>出力的方向</div>` : '';
    const sec = (cls, t, v) => (v ? `<div class="sec ${cls}"><h4>${t}</h4><p>${esc(v)}</p></div>` : '');
    const cat = GD.CARDS.find((g) => g.items.includes(it));
    $('#guideView').innerHTML = `
      <div class="g-head"><span class="cat">${esc(f.cat)}</span><h2>${esc(it.name)}</h2><span class="en">${esc(it.en)}</span></div>
      ${pic}
      ${(() => { const L = it.labels || ['适用场合', '做法', '受力方向', '身体配合']; return sec('scene', L[0], it.scene) + sec('steps', L[1], it.how) + sec('key', L[2], it.force) + sec('scene', L[3], it.body); })()}
      ${it.note ? `<div class="point"><b>POINT</b><p>${esc(it.note)}</p></div>` : ''}
      <div class="group-title">同类的其他技巧</div>
      <div class="g-grid">${cat.items.map((x) => `<button class="g-card${x.id === it.id ? ' on' : ''}" data-g="${x.id}">${GD.SVG[x.id] ? `<svg viewBox="0 0 240 160">${GD.SVG[x.id]()}</svg>` : ''}<b>${esc(x.name)}</b><small>${esc(x.en)}</small></button>`).join('')}</div>`;
    const W = it.widget && GD.WIDGETS[it.widget];
    const lessonIdx = it.lesson ? C.LESSONS.findIndex((l) => l.id === it.lesson) : -1;
    ui.panel.innerHTML = `<h2>图鉴</h2><div class="ref">对应教本${esc(cat.ref || '第 2 章「攀岩基本动作」')}</div>
      ${W ? `<div class="sec key"><h4>${esc(W.title)}</h4><div id="widget">${W.html}</div></div>` : '<p class="note">从左边选一张卡片，看它怎么用、往哪个方向出力。</p>'}
      ${lessonIdx >= 0 ? `<button class="btn primary" data-lesson="${lessonIdx}">📖 看「${esc(C.LESSONS[lessonIdx].title)}」课程</button>` : ''}
      ${cat.ref ? '' : `<div class="sec scene"><h4>抓点的四个原则</h4><ol><li>按岩点形状选抓法</li><li>善用手指和手掌的摩擦</li><li>尽量省力</li><li>配合重心和手脚动作调整</li></ol></div>
      <div class="sec key"><h4>踩之前一定要看</h4><p>手点靠触感，脚点靠眼睛：隔着鞋子感觉很迟钝，真正好用的位置可能只有 1mm²。</p></div>`}`;
    if (W) { const root = $('#widget'); W.update(root); root.addEventListener('input', () => W.update(root)); }
    buildList();
  }
  $('#guideView').addEventListener('click', (e) => { const b = e.target.closest('[data-g]'); if (b) { loadGuide(b.dataset.g); window.scrollTo({ top: 0, behavior: 'smooth' }); } });

  /* =========================================================
   * 实验室
   * ========================================================= */
  function loadLab(src, pose) {
    S.mode = 'lab';
    document.querySelectorAll('#tabs button').forEach((b) => b.classList.toggle('on', b.dataset.mode === 'lab'));
    S.lab.src = src || null;
    S.holds = JSON.parse(JSON.stringify(src ? src.holds : C.LAB.holds));
    S.wallStyle = src && src.wallStyle ? src.wallStyle : null;
    if (pose) S.P = E.clonePose(pose);
    else if (src) { let prev = {}; prev = mergeRaw(prev, src.frames[0]); S.P = E.resolve(prev, S.holds); }
    else S.P = E.resolve(C.LAB.start, S.holds);
    S.meta = {}; S.anim = null; S.playing = false; S.free = true;
    ui.inset.classList.remove('big');
    setBadge(null); hideModal();
    buildList(); buildLabPanel(); buildLabControls();
  }

  function buildLabControls() {
    ui.controls.innerHTML = `
      <button class="btn" data-a="reset">↺ 重置姿势</button>
      <span class="spacer"></span>
      <span class="note">拖动手、脚、腰、膝盖、手肘（虚线圈）。脚放在比腰高的点上＝挂脚；双击脚＝垂膝。</span>`;
  }

  function buildLabPanel() {
    const P = S.P, o = S.opts;
    const angles = [[-10, '斜板'], [0, '垂直'], [20, '前倾 20°'], [40, '前倾 40°']];
    ui.panel.innerHTML = `
      <h2>实验室</h2>
      <div class="ref">自己摆姿势，看重心、支撑线和手的负担怎么变化。</div>
      <div class="ctl"><label>墙的坡度</label><div class="seg" id="angleSeg">${angles.map(([a, n]) => `<button data-v="${a}" class="${r0(P.angle) === a ? 'on' : ''}">${n}</button>`).join('')}</div></div>
      <div class="ctl"><label>腰离墙 <span id="hdV">${r0(P.hipDist)}cm</span></label><input type="range" id="hd" min="5" max="50" value="${r0(P.hipDist)}"></div>
      <div class="ctl"><label>转身（侧身贴墙） <span id="tnV">${r0(P.turn * 100)}%</span></label><input type="range" id="tn" min="0" max="100" value="${r0(P.turn * 100)}"></div>
      <div class="ctl"><label>显示</label><div class="checks">
        <label><input type="checkbox" data-o="cog" ${o.cog ? 'checked' : ''}>重心线</label>
        <label><input type="checkbox" data-o="line" ${o.line ? 'checked' : ''}>支撑线</label>
        <label><input type="checkbox" data-o="loads" ${o.loads ? 'checked' : ''}>负担数字</label>
        <label><input type="checkbox" data-o="reach" ${o.reach ? 'checked' : ''}>手够得到的范围</label>
      </div></div>
      <div class="ctl"><label>编辑岩点</label>
        <div class="seg" id="editSeg">
          <button data-v="off" class="${!S.lab.edit ? 'on' : ''}">关闭</button>
          <button data-v="h" class="${S.lab.edit && S.lab.holdType === 'h' ? 'on' : ''}">＋手点</button>
          <button data-v="f" class="${S.lab.edit && S.lab.holdType === 'f' ? 'on' : ''}">＋脚点</button>
          <button data-v="n" class="${S.lab.edit && S.lab.holdType === 'n' ? 'on' : ''}">＋目标</button>
        </div>
        <div class="note">编辑时：点空白处加岩点，点岩点删除。</div>
      </div>
      <div class="ctl"><label>试试看</label>
        <ol class="note" style="padding-left:18px;margin:0">
          <li>放开右手（拖到空中），看身体会不会旋转。</li>
          <li>把右脚换到对角的脚点，再放开右手。</li>
          <li>把一只脚甩到反方向，观察重心红点移动。</li>
          <li>切到「前倾 40°」，拉动「腰离墙」。</li>
        </ol>
      </div>
      <div class="readout" id="readout"></div>`;
    lastReadout = '';
  }

  ui.panel.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.lesson) { S.li = +b.dataset.lesson; setMode('learn'); return; }
    if (b.dataset.next) { loadLesson(+b.dataset.next); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    if (b.dataset.practice) { S.ci = +b.dataset.practice; setMode('challenge'); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    if (b.parentElement.id === 'angleSeg') { S.P.angle = +b.dataset.v; buildLabPanel(); }
    if (b.parentElement.id === 'editSeg') {
      S.lab.edit = b.dataset.v !== 'off';
      if (S.lab.edit) S.lab.holdType = b.dataset.v;
      buildLabPanel();
    }
    if (b.dataset.a === 'hint') { S.ch.showHint = true; buildChallengePanel(); }
    if (b.dataset.a === 'retry') loadChallenge(S.ci);
    if (b.dataset.a === 'demo') playDemo();
  });
  ui.panel.addEventListener('input', (e) => {
    const t = e.target;
    if (t.id === 'hd') { S.P.hipDist = +t.value; const v = $('#hdV'); if (v) v.textContent = t.value + 'cm'; }
    if (t.id === 'tn') { S.P.turn = +t.value / 100; const v = $('#tnV'); if (v) v.textContent = t.value + '%'; }
    if (t.dataset.o) { S.opts[t.dataset.o] = t.checked; store.set('opts', S.opts); }
  });

  /* =========================================================
   * 挑战
   * ========================================================= */
  function loadChallenge(i) {
    S.mode = 'challenge';
    S.ci = i;
    const c = C.CHALLENGES[i];
    S.holds = c.holds;
    S.P = E.resolve(Object.assign({ angle: c.angle }, c.start), c.holds);
    S.meta = {}; S.anim = null; S.playing = false; S.free = true;
    S.ch = { def: c, track: null, pump: 100, over: false, showHint: false, demo: false };
    S.dy = null;
    $('#hud').hidden = c.type !== 'dyno';
    S.wallStyle = c.wallStyle || null;
    ui.inset.classList.toggle('big', !!c.allowHipDist);
    setBadge(null); hideModal();
    buildList();
    if (c.type === 'dyno') return loadDyno(c);
    buildChallengePanel();
    ui.controls.innerHTML = `
      <button class="btn" data-a="retry">↺ 重来</button>
      <button class="btn" data-a="hint">💡 提示</button>
      <button class="btn" data-a="demo">▶ 看示范</button>
      <span class="spacer"></span>
      <span class="note">先摆好脚和腰，再把${E.NAME[c.goal.limb]}拖到 NEXT。</span>`;
  }

  function buildChallengePanel() {
    const c = S.ch.def;
    ui.panel.innerHTML = `
      <h2>${esc(c.title)}</h2>
      <div class="goal">${esc(c.text)}</div>
      <ul class="rules">
        <li>把${E.NAME[c.goal.limb]}放到绿色的 NEXT 上</li>
        <li>${E.NAME[c.goal.limb]}离开岩点的整段时间，身体都不能旋转</li>
        <li>出手时支撑手负担 ≤ ${c.maxLoad}kg</li>
        <li>前臂体力不能耗光（手的负担太大时会快速下降）</li>
      </ul>
      <div class="pump"><label class="kv"><span>前臂体力</span><b id="pumpV">100%</b></label><div class="track"><div class="fill" id="pumpBar"></div></div></div>
      ${c.allowHipDist ? `<div class="ctl"><label>腰离墙 <span id="hdV">${r0(S.P.hipDist)}cm</span></label><input type="range" id="hd" min="5" max="50" value="${r0(S.P.hipDist)}"></div>` : ''}
      ${S.ch.showHint ? `<div class="hint">💡 ${esc(c.hint)}</div>` : ''}
      ${lessonOfChallenge(c.id) >= 0 ? `<button class="btn" data-lesson="${lessonOfChallenge(c.id)}">📖 回去看这一课</button>` : ''}
      <div class="readout" id="readout"></div>`;
    lastReadout = '';
  }

  function trackChallenge(res, dt) {
    const ch = S.ch;
    if (!ch || ch.over || ch.demo || ch.def.type === 'dyno') return;
    const g = ch.def.goal, L = S.P.limbs[g.limb];
    if (!L.hold) {
      if (!ch.track) ch.track = { rot: false, max: 0 };
      if (res.rotating) ch.track.rot = true;
      // 出手中：支撑手的负担
      ch.track.max = Math.max(ch.track.max, res.handMax);
      if (res.falling) ch.track.fall = res.reason;
    } else if (L.hold !== g.hold) ch.track = null;

    // 前臂体力
    const load = res.handSum;
    if (load > 26) ch.pump -= (load - 26) * 0.22 * dt;
    else ch.pump += 7 * dt;
    ch.pump = E.clamp(ch.pump, 0, 100);
    const bar = $('#pumpBar'), v = $('#pumpV');
    if (bar) { bar.style.width = ch.pump + '%'; bar.style.background = ch.pump > 50 ? '#2f9e44' : ch.pump > 25 ? '#e8a317' : '#e03131'; }
    if (v) v.textContent = r0(ch.pump) + '%';
    if (ch.pump <= 0) finishChallenge(false, '前臂体力耗光（爆前臂）了，人掉了下来。手的负担太久太重——把体重交给脚。');
  }

  /* ---------- 动态挑战：抓时机（静止点 / 蹲跳） ---------- */
  const G = 980 * 0.55;   // 沿起跳方向的有效重力（cm/s²）
  const SLOW = 0.42;      // 慢动作，方便抓时机
  function loadDyno(c) {
    const n = c.holds[c.goal.hold];
    const hip0 = { x: S.P.hip.x, y: S.P.hip.y };
    const u = (() => { const dx = n.x - hip0.x, dy = n.y - (hip0.y + 70); const d = Math.hypot(dx, dy) || 1; return { x: dx / d, y: dy / d }; })();
    // 找出「手刚好够得到 NEXT」需要移动的距离
    let sReq = 0;
    for (let s = 0; s < 260; s += 1) {
      const P = E.clonePose(S.P);
      P.hip = { x: hip0.x + u.x * s, y: hip0.y + u.y * s };
      P.limbs[c.goal.limb].x = n.x; P.limbs[c.goal.limb].y = n.y;
      const b = E.buildBody(P);
      if (b.limbs[c.goal.limb].d <= E.REACH.arm - 2) { sReq = s; break; }
    }
    const zone = document.querySelector('#hud i.v span');
    if (zone) { zone.style.left = (50 - c.vTol / 6) + '%'; zone.style.width = (c.vTol / 3) + '%'; }
    S.dy = { c, n, hip0, u, sReq, base: E.clonePose(S.P), phase: 'ready', charge: 0, cdir: 1, t: 0, v0: 0, s: 0, v: 0, tries: 0 };
    S.ch.track = null;
    buildDynoPanel();
    ui.controls.innerHTML = `
      <button class="btn primary" id="dynoBtn" style="min-width:180px">按住蓄力，放开起跳</button>
      <button class="btn" data-a="retry">↺ 重来</button>
      <button class="btn" data-a="hint">💡 提示</button>
      <button class="btn" data-a="demo">▶ 看示范</button>
      <span class="spacer"></span>
      <span class="note">也可以用空格键：按住蓄力 → 放开起跳 → 再按一下抓。</span>`;
    const btn = $('#dynoBtn');
    btn.addEventListener('pointerdown', (e) => { e.preventDefault(); dynoPress(); });
    btn.addEventListener('pointerup', (e) => { e.preventDefault(); dynoRelease(); });
    btn.addEventListener('pointerleave', () => { if (S.dy && S.dy.phase === 'charge') dynoRelease(); });
  }

  function buildDynoPanel() {
    const c = S.ch.def;
    ui.panel.innerHTML = `
      <h2>${esc(c.title)}</h2>
      <div class="goal">${esc(c.text)}</div>
      <ul class="rules">
        <li>按住按钮蓄力：腰往下沉，力量条会来回跑</li>
        <li>放开就起跳：力量太小够不到，太大会冲过头</li>
        <li>在身体升到最高点、几乎静止的一瞬间按「抓！」</li>
      </ul>
      <div class="pump"><label class="kv"><span>蓄力</span><b id="chV">0%</b></label><div class="track"><div class="fill" id="chBar" style="background:#f08c00;width:0"></div></div></div>
      <div class="pump"><label class="kv"><span>身体上升速度</span><b id="velV">—</b></label>
        <div class="track" style="position:relative"><div style="position:absolute;left:${50 - (c.vTol / 6)}%;width:${c.vTol / 3}%;top:0;bottom:0;background:rgba(47,158,68,.35)"></div><div class="fill" id="velBar" style="width:4px;background:#1f2933;position:absolute;left:50%"></div></div>
        <div class="note">绿色区＝速度接近 0（静止点），在这里抓最稳。</div></div>
      ${S.ch.showHint ? `<div class="hint">💡 ${esc(c.hint)}</div>` : ''}
      <div class="readout" id="readout"></div>`;
    lastReadout = '';
  }

  function dynoPress() {
    const d = S.dy;
    if (!d || S.ch.over) return;
    if (d.phase === 'ready') { d.phase = 'charge'; d.charge = 0; d.cdir = 1; $('#dynoBtn').textContent = '放开 → 起跳！'; }
    else if (d.phase === 'fly') dynoCatch();
  }
  function dynoRelease() {
    const d = S.dy;
    if (!d || d.phase !== 'charge') return;
    d.phase = 'fly'; d.t = 0; d.tries++;
    d.v0 = Math.sqrt(2 * G * Math.max(8, d.sReq)) * (0.7 + 0.6 * d.charge);
    d.sink = d.charge * 18;
    $('#dynoBtn').textContent = '抓！';
  }

  function dynoPose(d) {
    const c = d.c, P = E.clonePose(d.base);
    const sink = d.phase === 'charge' ? d.charge * 18 : d.phase === 'ready' ? 0 : Math.max(0, d.sink * (1 - d.t * 6));
    P.hip = { x: d.hip0.x + d.u.x * d.s, y: d.hip0.y + d.u.y * d.s - sink };
    const g = P.limbs[c.goal.limb];
    if (d.phase === 'caught') { g.x = d.n.x; g.y = d.n.y; g.hold = c.goal.hold; }
    else if (d.phase === 'fly' || d.phase === 'fail') {
      g.hold = null;
      const b0 = E.buildBody(Object.assign(E.clonePose(P), {}));
      const root = b0.limbs[c.goal.limb].root;
      const dx = d.n.x - root.x, dy = d.n.y - root.y, dd = Math.hypot(dx, dy) || 1;
      const k = Math.min(dd, E.REACH.arm - 1) / dd;
      g.x = root.x + dx * k; g.y = root.y + dy * k;
    }
    // 其他手脚：够不到就离开岩点
    const b = E.buildBody(P);
    let any = false;
    for (const l of E.LIMBS) {
      if (l === c.goal.limb) continue;
      const L = P.limbs[l];
      if (L.hold && !b.limbs[l].reachable) { L.hold = null; L.x = b.limbs[l].end.x; L.y = b.limbs[l].end.y - (E.isHand(l) ? 0 : 6); }
      if (L.hold) any = true;
    }
    P.air = d.phase === 'fly'; // 起跳中：动态动作，不算「开门」
    void any;
    return P;
  }

  function dynoTick(dt) {
    const d = S.dy;
    if (!d) return;
    if (d.phase === 'charge') {
      d.charge += d.cdir * dt / 1.1;
      if (d.charge >= 1) { d.charge = 1; d.cdir = -1; }
      if (d.charge <= 0) { d.charge = 0; d.cdir = 1; }
    }
    if (d.phase === 'fly') {
      d.t += dt * SLOW;
      d.s = d.v0 * d.t - 0.5 * G * d.t * d.t;
      d.v = d.v0 - G * d.t;
      if (S.ch.demo && d.v <= 8 && d.s >= d.sReq) dynoCatch();
      if (d.s <= 0 && d.t > 0.05) { d.s = 0; dynoFail('错过了时机：身体已经掉回原位。要在升到最高点的那一瞬间出手。'); }
    }
    S.P = dynoPose(d);
    const chB = $('#chBar'), chV = $('#chV'), vb = $('#velBar'), vv = $('#velV');
    if (chB) chB.style.width = (d.charge * 100) + '%';
    if (chV) chV.textContent = r0(d.charge * 100) + '%';
    const hc = $('#hudC'), hv = $('#hudV');
    if (hc) hc.style.width = (d.charge * 100) + '%';
    if (hv) hv.style.left = E.clamp(50 + (d.phase === 'fly' ? d.v : 0) / 6, 0, 98) + '%';
    if (vb && vv) {
      const v = d.phase === 'fly' ? d.v : 0;
      vb.style.left = E.clamp(50 + v / 6, 0, 99) + '%';
      vv.textContent = d.phase === 'fly' ? (v > 0 ? `↑ ${r0(v)} cm/s` : `↓ ${r0(-v)} cm/s`) : '—';
    }
  }

  function dynoCatch() {
    const d = S.dy, c = d.c;
    const P = dynoPose(d);
    const b = E.buildBody(Object.assign(E.clonePose(P), { limbs: Object.assign({}, P.limbs, { [c.goal.limb]: Object.assign({}, P.limbs[c.goal.limb], { x: d.n.x, y: d.n.y }) }) }));
    const reach = b.limbs[c.goal.limb].d <= E.REACH.arm + 1.5;
    if (!reach) {
      const apex = d.v0 * d.v0 / (2 * G);
      return dynoFail(apex < d.sReq ? `力量不够（蓄力 ${r0(d.charge * 100)}%）：最高点还够不到 NEXT，蓄力多一点。` : d.v > 0 ? '出手太早：身体还没升到够得到的高度。' : '没抓到：手已经够不到 NEXT 了。');
    }
    if (Math.abs(d.v) > c.vTol) {
      return dynoFail(d.v > 0 ? `抓的时候身体还在往上冲（${r0(d.v)} cm/s）：冲击太大，手被弹开。蓄力少一点，或等到最高点再抓。` : `太晚了：身体已经开始往下掉（${r0(-d.v)} cm/s），整个体重一下子压在手指上。`);
    }
    d.phase = 'caught';
    S.P = dynoPose(d);
    if (S.ch.demo) { S.ch.demo = false; S.demoCap = ''; ui.caption.dataset.k = ''; finishChallenge(true, '示范：在最高点、身体几乎静止时抓住。现在换你试试。'); S.done[c.id] = S.done[c.id] || false; return; }
    finishChallenge(true, c.explain + `（抓的时候速度只有 ${r0(Math.abs(d.v))} cm/s）`);
  }
  function dynoFail(msg) {
    const d = S.dy;
    d.phase = 'fail';
    S.ch.demo = false;
    finishChallenge(false, msg);
  }

  function evaluateChallenge() {
    const ch = S.ch, c = ch.def;
    const tr = ch.track || { rot: false, max: 0 };
    if (tr.fall) return finishChallenge(false, `出手时${tr.fall}。`);
    if (tr.rot) return finishChallenge(false, '出手的时候身体旋转了（开门）。放手之前，要先让重心落在支撑线上。');
    if (tr.max > c.maxLoad) return finishChallenge(false, `出手时支撑手负担达到 ${r0(tr.max)}kg，超过 ${c.maxLoad}kg。把重心移近踩脚、腰贴近墙面。`);
    finishChallenge(true, c.explain);
  }

  function finishChallenge(ok, msg) {
    const ch = S.ch;
    ch.over = true;
    if (ok) { S.done[ch.def.id] = true; store.set('done', S.done); buildList(); }
    const hasNext = S.ci < C.CHALLENGES.length - 1;
    ui.modal.innerHTML = `<div class="box">
      <h3 class="${ok ? 'good' : 'bad'}">${ok ? '○ 成功！' : '✕ 失败'}</h3>
      <p>${esc(msg)}</p>
      ${!ok ? `<p class="note">提示：${esc(ch.def.hint)}</p>` : ''}
      <div class="row">
        <button class="btn" data-m="retry">↺ 再试一次</button>
        ${!ok ? '<button class="btn" data-m="demo">▶ 看示范</button>' : ''}
        ${(() => { const li = lessonOfChallenge(ch.def.id); if (li < 0) return ''; const nx = pathNext(C.LESSONS[li].id);
          return `<button class="btn" data-m="lesson" data-li="${li}">📖 回到课程</button>` + (ok && nx >= 0 ? `<button class="btn primary" data-m="lesson" data-li="${nx}">下一课：${esc(C.LESSONS[nx].title.split('：')[0])} →</button>` : ''); })()}
        ${ok && hasNext && !ch.def.practice ? '<button class="btn primary" data-m="next">下一关 →</button>' : ''}
      </div></div>`;
    ui.modal.hidden = false;
    setBadge(ok ? 'good' : 'bad');
  }
  function hideModal() { ui.modal.hidden = true; }
  ui.modal.addEventListener('click', (e) => {
    const b = e.target.closest('[data-m]');
    if (!b) return;
    if (b.dataset.m === 'retry') loadChallenge(S.ci);
    if (b.dataset.m === 'next') loadChallenge(S.ci + 1);
    if (b.dataset.m === 'lesson') { S.li = +b.dataset.li; setMode('learn'); }
    if (b.dataset.m === 'demo') { loadChallenge(S.ci); playDemo(); }
  });

  /* 示范：起始 → 摆好脚和腰（手还在起始点）→ 出手 → 抓到 */
  function playDemo() {
    const c = S.ch.def;
    hideModal();
    if (c.type === 'dyno') {
      loadChallenge(S.ci);
      const d = S.dy;
      S.ch.demo = true;
      d.phase = 'charge'; d.charge = 0; d.cdir = 1;
      const target = 0.55;
      const iv = setInterval(() => { if (!S.dy || S.dy !== d) return clearInterval(iv); if (d.charge >= target) { clearInterval(iv); dynoRelease(); } }, 16);
      return;
    }
    const start = Object.assign({ angle: c.angle }, c.start);
    const sol = Object.assign({ angle: c.angle }, c.solution);
    const n = c.holds[c.goal.hold];
    const setup = Object.assign({}, sol, { [c.goal.limb]: start[c.goal.limb] });
    const reach = Object.assign({}, sol, { [c.goal.limb]: [n.x - 5, n.y - 4] });
    S.P = E.resolve(start, c.holds);
    S.ch.demo = true; S.ch.over = false;
    S.demoQueue = [setup, reach, sol].map((raw) => E.resolve(raw, c.holds));
    S.demoCaps = ['先摆好：脚、腰都到位，手还抓着起始点。', '确认稳了才出手：身体没有旋转。', '抓到 NEXT！现在换你试试。'];
    S.wait = 0.6;
    ui.caption.innerHTML = '<span class="step-no">示范</span><span>看一次正确的做法…</span>';
  }

  /* =========================================================
   * 拖动
   * ========================================================= */
  function toWorld(evt) {
    const pt = svg.createSVGPoint();
    pt.x = evt.clientX; pt.y = evt.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    return { x: p.x, y: 300 - p.y };
  }

  svg.addEventListener('pointerdown', (e) => {
    const w = toWorld(e);
    const h = e.target.closest('[data-h]');
    if (S.mode === 'challenge' && (S.ch.over || S.ch.demo)) return;
    if (S.mode === 'lab' && S.lab.edit && !h) {
      const hold = e.target.closest('[data-hold]');
      if (hold) deleteHold(hold.dataset.hold); else addHold(w);
      return;
    }
    if (!h) return;
    e.preventDefault();
    svg.setPointerCapture(e.pointerId);
    S.drag = { h: h.dataset.h, id: e.pointerId };
    svg.classList.add('dragging');
    if (S.mode === 'learn') enterFreeMode();
  });

  svg.addEventListener('pointermove', (e) => {
    if (!S.drag || e.pointerId !== S.drag.id) return;
    const w = toWorld(e);
    if (S.drag.h === 'hip') {
      S.P.hip = { x: E.clamp(w.x, 20, 300), y: E.clamp(w.y, 40, 240) };
    } else if (S.drag.h.startsWith('J:')) {
      dragJoint(S.drag.h.slice(2), w);
    } else {
      const L = S.P.limbs[S.drag.h];
      L.hold = null; L.x = E.clamp(w.x, 0, 320); L.y = E.clamp(w.y, 4, 300);
    }
  });

  /* 拖动膝盖 / 手肘：
   * - 手脚悬空时：大腿（上臂）指向手指的位置，小腿（前臂）自然下垂 → 可以自由折膝、抬膝
   * - 手脚踩在岩点上时：弯曲程度由腰到脚的距离决定，只能把膝盖翻到另一侧（例如往内扣＝垂膝） */
  let jointTipShown = false;
  function dragJoint(l, w) {
    const L = S.P.limbs[l], hand = E.isHand(l);
    const L1 = hand ? E.B.upperArm : E.B.thigh, L2 = hand ? E.B.foreArm : E.B.shin;
    let b = E.buildBody(S.P);
    const root = b.limbs[l].root;
    let want = w;
    if (!L.hold) {
      const dx = w.x - root.x, dy = w.y - root.y, d = Math.hypot(dx, dy) || 1;
      const j = { x: root.x + (dx / d) * L1, y: root.y + (dy / d) * L1 };
      want = j;
      // 末端自然下垂；若会和根部重叠就稍微往外偏
      L.x = j.x + E.sideOf(l) * 4; L.y = j.y - L2 * 0.97;
      b = E.buildBody(S.P);
    }
    // 关节要在手指的那一侧：不对就翻边
    const lb = b.limbs[l];
    const side = (p) => (lb.end.x - lb.root.x) * (p.y - lb.root.y) - (lb.end.y - lb.root.y) * (p.x - lb.root.x);
    if (Math.abs(side(want)) > 30 && Math.sign(side(want)) !== Math.sign(side(lb.joint))) {
      L.knee = L.knee === 'in' ? null : 'in';
      if (!hand) L.edge = L.knee ? '外侧踩' : null;
    }
    if (L.hold && !jointTipShown) {
      jointTipShown = true;
      flashCaption(`${E.NAME[l]}踩在岩点上：${hand ? '手肘' : '膝盖'}弯多少由腰的位置决定——把腰往下拖，${hand ? '手肘' : '膝盖'}就会弯。拖到另一侧可以翻边${hand ? '' : '（往内扣＝垂膝）'}。`);
    }
  }

  function endDrag(e) {
    if (!S.drag || e.pointerId !== S.drag.id) return;
    const l = S.drag.h;
    S.drag = null;
    svg.classList.remove('dragging');
    if (l === 'hip') return;
    if (l.startsWith('J:')) return;
    const L = S.P.limbs[l];
    const body = E.buildBody(S.P);
    const root = body.limbs[l].root;
    const reach = E.isHand(l) ? E.REACH.arm : E.REACH.leg;
    let best = null, bd = 1e9;
    for (const id in S.holds) {
      const h = S.holds[id];
      const d = Math.hypot(h.x - L.x, h.y - L.y);
      if (d < (h.t === 'f' ? 13 : 15) && d < bd) { bd = d; best = id; }
    }
    if (best && Math.hypot(S.holds[best].x - root.x, S.holds[best].y - root.y) <= reach + 1.5) {
      L.hold = best; L.x = S.holds[best].x; L.y = S.holds[best].y;
      // 脚放在比腰还高的岩点上 → 自动变成挂脚
      if (!E.isHand(l)) L.hook = L.y > S.P.hip.y - 5 ? 'heel' : null;
      if (!E.isHand(l) && L.hook) flashCaption(`${E.NAME[l]}比腰高 → 变成「挂脚」：脚跟由上往下拉，像第三只手。`);
    } else {
      // 停在够得到的位置（悬空）
      const end = body.limbs[l].end;
      L.x = end.x; L.y = end.y;
      L.hook = null;
      if (best) flashCaption(`${E.NAME[l]}够不到那个岩点——先把腰移近一点。`);
    }
    if (S.mode === 'challenge' && l === S.ch.def.goal.limb && L.hold === S.ch.def.goal.hold && !S.ch.over) {
      // 用抓到前一刻的状态判断
      evaluateChallenge();
    }
  }
  svg.addEventListener('pointerup', endDrag);
  svg.addEventListener('dblclick', (e) => {
    const h = e.target.closest('[data-h]');
    if (!h || E.isHand(h.dataset.h) || h.dataset.h === 'hip') return;
    if (S.mode === 'learn') enterFreeMode();
    const L = S.P.limbs[h.dataset.h];
    L.knee = L.knee === 'in' ? null : 'in';
    L.edge = L.knee ? '外侧踩' : null;
    flashCaption(L.knee ? `${E.NAME[h.dataset.h]}：垂膝（膝盖往内扣、外侧踩）。两脚分开踩住时，会产生前后对蹬的反作用力。` : `${E.NAME[h.dataset.h]}：恢复一般踩法。`);
  });
  svg.addEventListener('pointercancel', endDrag);

  function enterFreeMode() {
    S.playing = false; S.anim = null; S.free = true;
    S.meta = { overlay: S.meta.overlay };
    setBadge(null);
    updateLearnControls();
  }

  let flashUntil = 0, flashText = '';
  function flashCaption(t) { flashText = t; flashUntil = performance.now() + 2600; }

  function addHold(w) {
    const id = 'u' + (++S.lab.n) + '_' + Date.now().toString(36);
    S.holds[id] = { x: r0(w.x), y: r0(w.y), t: S.lab.holdType };
  }
  function deleteHold(id) {
    for (const l of E.LIMBS) {
      const L = S.P.limbs[l];
      if (L.hold === id) L.hold = null;
    }
    delete S.holds[id];
  }

  /* =========================================================
   * 画面更新
   * ========================================================= */
  let lastReadout = '', lastCaption = '', lastChip = '';

  function readoutHTML(res) {
    const P = S.P;
    let st;
    if (res.air) st = ['warn', res.contacts.length ? '⚡ 动态动作中' : '⚡ 腾空中'];
    else if (res.swing) st = ['warn', '〜 摆荡中'];
    else if (res.falling) st = ['bad', '✕ 会掉下来'];
    else if (res.rotating) st = ['bad', '⟲ 身体会旋转（开门）'];
    else if (res.unreachable.length) st = ['warn', '△ 有手脚够不到岩点'];
    else st = ['good', '✓ 稳定'];
    let h = `<h4>实时数据</h4><div class="status ${st[0]}">${st[1]}</div>`;
    for (const l of E.LIMBS) {
      const c = res.contacts.find((x) => x.l === l);
      const L = P.limbs[l];
      let state = '悬空';
      if (c) state = L.edge || (E.isHand(l) ? '抓住岩点' : '踩住岩点');
      else if (res.unreachable.includes(l)) state = '够不到';
      else if (res.flags.find((f) => f.l === l)) state = '挂旗';
      else if (!L.hold && E.isHand(l)) state = '伸出去';
      const kg = c ? c.kg : 0;
      const col = c ? (c.hand ? R.loadColor(kg) : '#868e96') : 'transparent';
      h += `<div class="limb"><b>${E.NAME[l]}</b><span class="st">${state}</span><div class="bar"><i style="width:${Math.min(100, (kg / 60) * 100)}%;background:${col}"></i></div><span class="kg">${c ? r0(kg) + 'kg' : '—'}</span></div>`;
    }
    h += `<div class="kv"><span>支撑方式</span><b>${E.PATTERN_NAME[res.pattern] || '—'}</b></div>`;
    h += `<div class="kv"><span>手的负担合计</span><b>${r0(res.handSum)}kg</b></div>`;
    h += `<div class="kv"><span>腰离墙 / 手的水平拉力</span><b>${r0(P.hipDist)}cm / ${r0(res.H)}kg</b></div>`;
    if (res.tips.length) h += `<ul class="tips">${res.tips.map((t) => `<li class="${t.type}">${esc(t.text)}</li>`).join('')}</ul>`;
    return h;
  }

  function draw(dt) {
    if (S.mode === 'guide') return;
    const body = E.buildBody(S.P);
    const res = E.analyze(S.P, body);
    S.body = body; S.res = res;
    const ls = S.mode === 'learn' ? C.LESSONS[S.li] : null;
    R.stage(scene, {
      holds: S.holds, P: S.P, body, res, opts: S.opts,
      meta: ls && ls.overlay && !S.meta.overlay ? Object.assign({ overlay: ls.overlay }, S.meta) : S.meta,
      labels: ls && ls.labels && !S.free ? ls.labels : null,
      handles: !(S.mode === 'challenge' && (S.ch.over || S.ch.demo || S.ch.def.type === 'dyno')),
      wallStyle: S.wallStyle,
      edit: S.mode === 'lab' && S.lab.edit,
    });
    R.side(sideScene, { P: S.P, body, res });

    // 状态标签
    let chip = '';
    if (res.air) chip = `<div class="chip warn">${res.contacts.length ? '动态中' : '腾空中'}</div>`;
    else if (res.swing) chip = '<div class="chip warn">摆荡中</div>';
    else if (res.falling) chip = '<div class="chip bad">会掉下来</div>';
    else if (res.rotating) chip = '<div class="chip bad">⟲ 旋转中</div>';
    else if (res.unreachable.length) chip = '<div class="chip warn">够不到</div>';
    else chip = '<div class="chip good">✓ 稳定</div>';
    if (chip !== lastChip) { ui.chip.outerHTML = chip; ui.chip = $('.chip'); lastChip = chip; }

    // 字幕
    let cap;
    if (performance.now() < flashUntil) cap = `<span class="step-no">提示</span><span>${esc(flashText)}</span>`;
    else if (S.mode === 'learn') {
      if (S.free) cap = '<span class="step-no">自由实验</span><span>拖动手、脚、腰、膝盖、手肘试试看。按「重播」回到教学。</span>';
      else {
        const no = S.meta.isCompare ? '对比' : `${S.step + 1} / ${S.frames.length}`;
        cap = `<span class="step-no">${no}</span><span>${esc(fill(S.meta.caption, res))}</span>`;
      }
    } else if (S.mode === 'lab') {
      cap = `<span class="step-no">实验室</span><span>${esc(res.tips[0] ? res.tips[0].text : '拖动手、脚、腰，观察画面的变化。')}</span>`;
    } else if (S.mode === 'challenge') {
      if (S.ch.demo) cap = `<span class="step-no">示范</span><span>${esc(S.demoCap || '看一次正确的做法…')}</span>`;
      else cap = `<span class="step-no">挑战</span><span>${esc(S.ch.def.text)}</span>`;
    }
    if (cap !== lastCaption) { ui.caption.innerHTML = cap; lastCaption = cap; }

    const ro = readoutHTML(res);
    if (ro !== lastReadout) { const el = $('#readout'); if (el) el.innerHTML = ro; lastReadout = ro; }

    if (S.mode === 'challenge') trackChallenge(res, dt);
  }

  /* 动画主循环 */
  let last = performance.now();
  function tick(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (S.anim) {
      S.anim.t += dt / S.anim.dur;
      const t = Math.min(1, S.anim.t);
      S.P = E.lerpPose(S.anim.from, S.anim.to, ease(t));
      if (t >= 1) {
        S.P = E.clonePose(S.anim.to);
        S.anim = null;
        if (S.meta.badge) setBadge(S.meta.badge);
        if (S.playing) S.wait = S.meta.pause || 2.8;
      }
    } else if (S.mode === 'learn' && S.playing && S.wait > 0) {
      S.wait -= dt;
      if (S.wait <= 0) {
        if (S.step < S.frames.length - 1) goStep(S.step + 1);
        else { S.playing = false; updateLearnControls(); }
      }
    } else if (S.mode === 'challenge' && S.ch && S.ch.demo && S.wait > 0) {
      S.wait -= dt;
      if (S.wait <= 0) {
        if (S.demoQueue.length) {
          S.demoCap = S.demoCaps.shift();
          S.anim = { from: E.clonePose(S.P), to: S.demoQueue.shift(), t: 0, dur: 1.3 };
          S.wait = 2.2;
        } else {
          S.ch.demo = false; S.demoCap = '';
          setTimeout(() => { if (S.mode === 'challenge') loadChallenge(S.ci); }, 600);
        }
      }
    }
    if (S.mode === 'challenge' && S.ch && S.ch.def.type === 'dyno') dynoTick(dt);
    draw(dt);
    requestAnimationFrame(tick);
  }

  document.addEventListener('keydown', (e) => {
    if (e.code !== 'Space' || e.repeat || S.mode !== 'challenge' || !S.dy || S.ch.def.type !== 'dyno') return;
    e.preventDefault(); dynoPress();
  });
  document.addEventListener('keyup', (e) => {
    if (e.code !== 'Space' || S.mode !== 'challenge' || !S.dy || S.ch.def.type !== 'dyno') return;
    e.preventDefault(); dynoRelease();
  });
  document.querySelector('.inset-title').addEventListener('click', () => ui.inset.classList.toggle('min'));

  /* 启动 */
  S.li = Math.min(store.get('li', 0), C.LESSONS.length - 1);
  S.gi = store.get('gi', 'full_crimp');
  setMode(store.get('mode', 'learn'));
  requestAnimationFrame(tick);
})();
