/* 给新手的教练层：
 *  - START：第一课「高效攀岩的 5 个习惯」
 *  - PATH：建议的学习顺序（由浅入深，和教本的章节顺序不同）
 *  - TIPS：每一课的一句话口诀 + 到岩馆怎么练（练习建议是本工具补充的，不是教本原文）
 *  - 课后练习：从每一课自动生成「换你做」的关卡（起点 = 第一帧，目标 = 抓到 NEXT）
 */
(function (root) {
  'use strict';
  const node = typeof module === 'object' && module.exports;
  const C = root.Content || require('./lessons.js');
  const E = root.Engine || require('./engine.js');
  if (node) { require('./lessons2.js'); require('./lessons3.js'); }

  /* ---------------- 第一课 ---------------- */
  const START = {
    id: 'start', group: '新手入门', ch: '从这里开始', title: '高效攀岩的 5 个习惯',
    holds: { A: { x: 122, y: 200, t: 'h' }, B: { x: 178, y: 200, t: 'h' }, F1: { x: 118, y: 54, t: 'f' },
      F2: { x: 182, y: 56, t: 'f' }, N: { x: 200, y: 232, t: 'n' } },
    info: {
      scene: '完全没爬过也没关系。先记住这 5 个习惯，后面每一课都是在教你怎么做到它们。',
      steps: ['用脚爬：脚负责把身体往上推，手只负责引导方向', '腰贴墙：让体重落在脚上', '手臂尽量伸直吊着，不要一直弯着用力', '先移重心、站稳了，再伸手', '用力只有两种：瞬间爆发，或缓慢细腻——不要长时间死撑'],
      key: '攀岩不是引体向上。爬得好的人不是力气最大的人，而是最会「省手」的人：手指的耐力才是真正的瓶颈。',
      points: ['腰贴墙时手臂被迫弯着？垂直壁靠「蹲低」（屈膝、膝盖外开），前倾壁靠「转身」（侧身、垂膝、脚踩高）。真正要把腰贴上去的，只有「往上站、伸手」的那一下；停下来休息时，手臂伸直、腰离墙一点没关系。前倾壁的做法见「不同斜度的攀爬方法」。',
        '建议照着目录上方「学习路线」的顺序学：每课先看动画，再按「换你做」自己摆一次。',
        '安全第一：抱石一定要有垫子，先学会怎么落地（屈膝、往后滚，不要用手撑地）；爬之前先热身手指、肩膀和髋部。',
        '画面上的公斤数是用 60kg 的人估算的，用来比较「哪种做法比较省力」，不是精确的测量。'],
    },
    frames: [
      { hip: [150, 120], LH: 'A', RH: 'B', LF: 'F1', RF: 'F2', hipDist: 12,
        caption: '攀岩不是引体向上。高效的人，靠的是这 5 个习惯。' },
      { arrows: [{ at: 'LF', dir: [0, 1], label: '脚推', color: 'blue', len: 18 }, { at: 'RF', dir: [0, 1], label: '脚推', color: 'blue', len: 18 }],
        caption: '① 用脚爬：现在双脚撑着 {LF}+{RF}kg，双手合计只要 {hand}kg。腿的力量是手的 3 倍以上。' },
      { hipDist: 40, hip: [150, 110], sideFocus: true, caption: '② 腰贴墙：屁股一往后翘（腰离墙 40cm），手的拉力就变成 {H}kg。', badge: 'bad' },
      { hipDist: 8, hip: [150, 120], sideFocus: true, caption: '把腰贴回墙上：拉力只要 {H}kg。看右下角的「侧面看」。', badge: 'good' },
      { hip: [150, 102], hipDist: 10, caption: '③ 手臂伸直吊着：弯着手臂时肌肉一直在出力、血流被压住；伸直了是骨头在挂，前臂可以休息。' },
      { caption: '「腰贴墙」和「手臂伸直」会不会打架？垂直壁上不会：把身体放低——膝盖往两边打开、往下蹲。腰还贴着墙，手臂却是直的。' },
      { turn: 0.6, hipDist: 6, hip: [156, 104], arrows: [{ at: 'hip', dir: [1, 0], label: '一边的腰转向墙', color: 'blue', len: 18 }],
        caption: '另一个办法是侧身：把一边的腰转向墙，肩膀自然离墙远一点，手臂就能伸直。手长的人特别好用；到了前倾壁，蹲低不够，就要靠它。' },
      { hip: [170, 124], turn: 0, hipDist: 8, arrows: [{ at: 'hip', dir: [1, 0.3], label: '先移重心', color: 'red' }],
        caption: '④ 先移重心：要伸右手之前，先把腰移到右脚上方，站稳。左脚几乎不用出力了（{LF}kg）。' },
      { RH: 'N', caption: '……站稳了才伸手。不是「够」过去，是「站」过去。左手只负担 {LH}kg。', badge: 'good' },
      { caption: '⑤ 用力只有两种：瞬间爆发，或缓慢细腻。用最大力气超过 5 秒就会快速疲劳——所以不要死撑。' },
    ],
    compare: {
      bad: { hip: [146, 108], LH: 'A', RH: [196, 226], LF: 'F1', RF: 'F2', hipDist: 36, caption: '✕ 腰离墙、重心没动就伸手：够不到，手的拉力 {H}kg。' },
      good: { hip: [170, 124], LH: 'A', RH: [198, 230], LF: 'F1', RF: 'F2', hipDist: 8, caption: '○ 腰贴墙、重心先移到脚上：轻松够到，拉力 {H}kg。' },
    },
  };
  if (!C.LESSONS.some((l) => l.id === 'start')) C.LESSONS.unshift(START);

  /* ---------------- 学习路线 ---------------- */
  const STAGES = [
    { name: '入门', note: '看懂画面，学会把体重交给脚', ids: ['start', 'terms', 'skill', 'torque', 'hipwall', 'tiptoe', 'balance', 'inside', 'outside', 'deep', 'bow'] },
    { name: '基础', note: '挂旗、移重心、手顺：垂直壁上的全部工具', ids: ['innerflag', 'outerflag', 'flagswitch', 'cogpath', 'highstep', 'accel', 'inertia', 'chain', 'sequence', 'cross', 'multiswap', 'regrip'] },
    { name: '进阶', note: '反作用力、挂脚、前倾壁', ids: ['reaction', 'dropknee', 'stem', 'layback', 'push', 'kneebar', 'hook', 'mantle', 'movebase', 'angles'] },
    { name: '动态', note: '时机与全身协调', ids: ['deadpoint', 'lunge', 'onehand', 'swingby', 'condlunge', 'cypher', 'campus', 'levelup', 'progress'] },
  ];
  const PATH = [];
  const LEVEL = {};
  STAGES.forEach((st) => st.ids.forEach((id) => { if (C.LESSONS.some((l) => l.id === id)) { PATH.push(id); LEVEL[id] = st.name; } }));
  C.LESSONS.forEach((l) => { if (!LEVEL[l.id]) { PATH.push(l.id); LEVEL[l.id] = '进阶'; } });

  /* ---------------- 口诀 + 岩馆练习 ---------------- */
  const TIPS = {
    start: ['脚推、腰贴、臂直、先站再伸、不死撑。', '第一次去岩馆：选最简单的路线，爬的时候只想一件事——「我的脚踩好了吗？」'],
    terms: ['先看谁在撑，再看谁在动。', '看别人爬时，试着说出：哪只是支撑手、哪只是踩脚、重心在哪里。'],
    levelup: ['缺什么，就在哪里掉。', '每次掉下来，问自己是四个要素里的哪一个：抓不住、太远、不平衡，还是太陡？'],
    skill: ['手引导，脚出力。', '在简单路线上「安静地踩」：每一脚都看着踩、踩了就不再挪，尽量不发出声音。'],
    torque: ['重心靠近脚，手就省力。', '在垂直壁上抓两个好点，把腰左右移动，感受哪只手变重、哪只变轻。'],
    inertia: ['动了就别停。', '选一条简单路线，试着中途不停顿地一口气爬完；再爬一次每步都停，比较哪次累。'],
    accel: ['先脚推，后手拉。', '每次要往上之前，先蹲低一点，感觉是腿把你推上去，手只是最后扶一下。'],
    reaction: ['往反方向用力，身体才稳。', '找两个左右分开的脚点，双脚往外撑，感受身体被「卡住」的感觉。'],
    movebase: ['越陡，手越累；所以越陡越要靠技巧。', '同样的动作，在垂直壁和前倾壁各做一次，感受手的负担差多少。'],
    balance: ['同侧会转，对角才稳。', '抓一个好点，只用同侧的手和脚撑着，放开另一只手，感受身体「开门」；再换成对角试一次。'],
    inside: ['先移重心到脚上，再伸手。', '每次出手前默念「腰先过去」，腰到了脚上方才放手。'],
    outside: ['侧身、转腰，手伸得更高。', '在垂直壁上练「侧着爬」：每一手都把同侧的腰转向墙。'],
    deep: ['腿甩得远，手伸得远。', '够不到的时候先别跳：把悬空的腿往反方向多甩一点，再试一次。'],
    innerflag: ['不换脚，腿从身前穿过去。', '在简单路线上规定自己「不准换脚」，只能用挂旗来平衡。'],
    outerflag: ['腿绕到后面，最省事的平衡。', '同上：轮流试内侧挂旗和外侧挂旗，感觉哪个顺。'],
    bow: ['腰往反方向推。', '双脚踩同一个大点，单手抓着，另一只手往旁边伸：先不动腰试一次，再把腰推出去试一次。'],
    flagswitch: ['一只脚踩到底，另一条腿负责平衡。', '找一条手点左右交替的路线，试着用同一只脚连做三手。'],
    hipwall: ['腰贴墙，体重回到脚上。', '爬的时候请朋友从侧面看：你的屁股有没有往后翘？'],
    hook: ['脚跟是第三只手。', '在有大点的前倾壁上，把脚跟挂在腰旁边的大点上，感受手变轻。'],
    highstep: ['脚抬上去，重心也要跟上去。', '踩上高脚点后，把屁股坐到脚跟上，再站起来；不要用手硬拉。'],
    mantle: ['先拉后推，中间不要停。', '在低矮的平台或抱石顶端练习翻上去，注意手从「拉」换成「压」的那一下。'],
    dropknee: ['膝盖往内转，腰就贴墙。', '在前倾壁上找左右分开的两个脚点，试着把一边膝盖往下转，感受腰靠近墙。膝盖不舒服就停。'],
    stem: ['脚撑两边，上半身往前。', '在岩馆的内角，双脚撑住两面墙，试着双手放开站着休息。'],
    layback: ['手拉、脚推，手臂伸直。', '找一条竖直的边或裂缝，手拉脚推往上走三步，注意手臂保持伸直。'],
    kneebar: ['小腿当伸缩杆，用来休息。', '有大点的前倾路线上才找得到；找到就试着双手放开甩一甩。'],
    push: ['推的时候，前臂在休息。', '遇到身体旁边或下面的点，试着用手掌去推，而不是每次都用拉的。'],
    deadpoint: ['在最高点、最轻的一瞬间出手。', '抓两个好点，把身体拉向墙，在最高点松开一只手拍一下上方的墙，再抓回来。'],
    lunge: ['眼睛盯目标，力量从脚来。', '先从很近的距离练起：摆荡两次、第三次跳。一定要确认下面有垫子、落点没有人。'],
    onehand: ['腰沉到支撑手正下方再跳。', '先熟练双手的蹲跳，再试单手；抓到后不要急着放开支撑手。'],
    condlunge: ['不求每一步稳，只求最后稳。', '出发前闭眼想一遍整串动作和最后的姿势，再一口气做完。'],
    swingby: ['先往反方向荡。', '只在肩膀状态好的时候练，幅度从小开始；肩膀不舒服就停。'],
    cypher: ['腿先甩，手慢一拍。', '同侧手脚支撑时，先练「甩腿带起身体」的感觉，不急着抓点。'],
    campus: ['手臂伸直、荡下去、再拉起。', '这是高强度动作：手指和肩膀还没练起来之前，只在这里的挑战关卡体验就好。'],
    sequence: ['出手前，先把手顺想好。', '爬之前站在地上，用手比一遍：左、右、左……哪一手要抓哪个点。'],
    cross: ['重心放低，再交叉。', '在横移的路线上练交叉手：交叉前先看好下一步的脚点。'],
    regrip: ['点到了腰旁边，就从拉换成压。', '抓一个大点一路往上站，感受手的角度变化，在腰旁边时改成往下压。'],
    multiswap: ['手顺错一步，最后一步就卡住。', '在三个靠近的点之间，给自己出题：「怎么换，才能让右手最后抓到最上面？」'],
    cogpath: ['点好就直线冲，点差就先沉到脚上。', '同一个动作做两次：一次直接拉上去，一次先把屁股移到前脚上再站起来，比较手的感觉。'],
    tiptoe: ['腰贴墙，脚尖顶高。', '够不到时先别跳：腰贴上去、踮起脚尖，常常就多出十公分。'],
    chain: ['从脚尖开始启动。', '每个动作都从「转脚尖」开始，感觉力量从脚传到腰、再到手。'],
    angles: ['不同的墙，不同的爬法。', '同一天里爬斜板、垂直壁、前倾壁各一条，记下各自最累的是哪里。'],
    progress: ['每周两次，持续比猛练重要。', '每次去岩馆挑一个这里学到的技巧，当天只专心练它。'],
  };

  /* ---------------- 课后练习（自动生成） ---------------- */
  const merge = (prev, fr) => { const o = {}; for (const k of E.POSE_KEYS) o[k] = fr[k] !== undefined ? fr[k] : prev[k]; return o; };
  function reaching(raw, holds, limb, nKey) {
    const n = holds[nKey];
    const P = E.resolve(Object.assign({}, raw, { [limb]: [n.x, n.y] }), holds);
    const body = E.buildBody(P), res = E.analyze(P, body);
    const ok = !res.rotating && !res.falling && !res.unreachable.length && Math.hypot(body.limbs[limb].end.x - n.x, body.limbs[limb].end.y - n.y) < 3;
    return { ok, load: res.handMax };
  }
  const HAS_OWN = { balance: 'c-diag', innerflag: 'c-flag', deep: 'c-deep', hook: 'c-hook', highstep: 'c-high', bow: 'c-bow',
    deadpoint: 'c-dead', lunge: 'c-lunge', onehand: 'c-onehand', campus: 'c-campus', hipwall: 'c-steep' };
  const SKIP = ['push', 'progress', 'reaction']; // 和别的练习重复，或需要画面上摆不出来的动作
  const PRACTICE = {};   // 课程 id → 挑战 id
  Object.assign(PRACTICE, HAS_OWN);
  for (const ls of C.LESSONS) {
    if (PRACTICE[ls.id] || ls.wallStyle || SKIP.includes(ls.id)) continue;
    let prev = {};
    const raws = ls.frames.map((fr) => (prev = merge(prev, fr)));
    if (raws.some((r) => r.air)) continue;
    const nKey = Object.keys(ls.holds).find((k) => ls.holds[k].t === 'n');
    const last = raws[raws.length - 1], first = raws[0];
    const limb = nKey && ['LH', 'RH'].find((l) => last[l] === nKey);
    if (!limb || typeof first[limb] !== 'string') continue;
    let direct, sol;
    try { direct = reaching(first, ls.holds, limb, nKey); sol = reaching(last, ls.holds, limb, nKey); } catch (e) { continue; }
    const maxLoad = Math.max(25, Math.ceil((sol.load + 8) / 5) * 5);
    if (!sol.ok || (direct.ok && direct.load <= maxLoad)) continue; // 解法要成立；直接伸手不能过关
    const start = {}, solution = {};
    for (const k of E.POSE_KEYS) {
      if (k === 'angle') continue;
      if (first[k] !== undefined) start[k] = first[k];
      if (last[k] !== undefined) solution[k] = last[k];
    }
    const id = 'p-' + ls.id;
    const name = ls.title.split('：')[0];
    C.CHALLENGES.push({
      id, practice: ls.id, title: '练习 · ' + name, angle: last.angle || 0, holds: ls.holds,
      start, solution, goal: { limb, hold: nKey }, maxLoad, allowHipDist: Math.abs((first.hipDist || 20) - (last.hipDist || 20)) > 3,
      text: `照着「${name}」这一课，用${E.NAME[limb]}抓到 NEXT：出手时身体不能旋转，支撑手负担不超过 ${maxLoad}kg。`,
      hint: ls.info.steps.join(' → '),
      explain: ls.info.key,
    });
    PRACTICE[ls.id] = id;
  }

  C.COACH = { STAGES, PATH, LEVEL, TIPS, PRACTICE };
})(typeof self !== 'undefined' ? self : global);
