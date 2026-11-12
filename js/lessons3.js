/* 补充课程：第 1 章 1-1～1-3、第 3 章 3-1、3-2 ⑨⑩、3-5 ④、3-6 ④⑤⑥⑨、3-7 ⑦⑧、4-1 ②③
 * 格式同 lessons.js / lessons2.js。课程按教本顺序插到对应位置。
 */
(function (root) {
  'use strict';
  const C = root.Content || require('./lessons.js');
  if (!root.Content) require('./lessons2.js');

  const G1 = '第 1 章 攀岩基础知识';
  const G31 = '第 3 章 3-1 移动的基础知识';
  const G32 = '第 3 章 3-2 调节平衡类';
  const G3 = '第 3 章 3-3～3-5 吊挂・推拉・反作用力';
  const G36 = '第 3 章 3-6～3-7 动态移动・手顺';
  const G4 = '第 4 章 提升攀岩技巧';

  /* ================= 第 1 章 ================= */
  const CH1_A = [
    {
      id: 'levelup', group: G1, ch: '1-1', title: '等级提升：难度来自 4 个要素',
      holds: { A: { x: 120, y: 200, t: 'h' }, B: { x: 180, y: 204, t: 'h' }, F1: { x: 116, y: 50, t: 'f' },
        F2: { x: 184, y: 54, t: 'f' }, N: { x: 262, y: 246, t: 'n' } },
      info: {
        scene: '攀岩就是把身体「卡」在不会动的岩点上。墙不会配合你：缺哪一种能力，就会在哪里掉下来。',
        steps: ['决定难度的 4 个要素：岩点好不好抓、岩点之间的距离、配置好不好平衡、墙面的坡度',
          '升级需要的 3 种身体要素：抓住岩点的握力、完成手法脚法的能力、把身体拉向下一点的拉力',
          '技术和体能缺一不可：差距小时可以互补，要升级就得两边一起进步'],
        key: '常见的「能力不足 → 掉落场景」：耐力不足 → 长路线；最大肌力弱 → 难关；柔软度低 → 远的脚点；爆发力不足 → 跳跃；手臂撑不开 → 远点；腹背无力 → 陡壁上腰往下掉。',
        points: ['引体向上：一般攀岩者约 10 下，顶尖攀岩者常能做到 40 下。', '但只会拉、不会用脚分担体重的人，照样会力竭——这本书重点讲的就是技术。'],
      },
      frames: [
        { hip: [150, 120], LH: 'A', RH: 'B', LF: 'F1', RF: 'F2', hipDist: 12,
          caption: '基本姿势：双手双脚四点支撑，像一个「大」字。' },
        { RH: [236, 232], caption: '要素 ② 距离：NEXT 太远，手怎么伸都够不到。', badge: 'bad' },
        { RH: 'B', angle: 35, caption: '要素 ④ 坡度：同样的姿势，墙变成前倾 35°，手合计要负担 {hand}kg。', sideFocus: true },
        { angle: 0, RF: [196, 30], RH: [210, 216], caption: '要素 ③ 配置：脚点只在左边，只剩同侧手脚撑着，一放手就开门旋转。', badge: 'bad' },
        { RH: 'B', RF: 'F2', caption: '要素 ① 岩点好不好抓也一样。接下来的每一课，都是在教你怎么用技术解决这些问题。', badge: 'good' },
      ],
    },
    {
      id: 'skill', group: G1, ch: '1-2', title: '技巧的结构：脚撑体重，手负责引导',
      holds: { A: { x: 122, y: 200, t: 'h' }, B: { x: 172, y: 204, t: 'h' }, F1: { x: 118, y: 56, t: 'f' },
        F2: { x: 182, y: 58, t: 'f' }, HS: { x: 178, y: 104, t: 'f' }, N: { x: 210, y: 236, t: 'n' } },
      info: {
        scene: '技巧＝帮握力和拉力省力的能力：让原本抓不住的点抓得住，原本拉不到的距离拉得到。',
        steps: ['腰贴墙，让体重落在脚上（不要屈膝、屁股往后翘）', '不要只靠手臂拉：转动全身来推拉', '手负责引导方向，脚负责把身体往上推'],
        key: '脚的力量通常是手的 3 倍以上：引体向上 10 下很辛苦，徒手深蹲 10 下几乎人人做得到。手指的耐力才是攀岩真正的瓶颈。',
        points: ['手法脚法分 4 类：平衡类（调节平衡，靠力矩）、推拉类（高跨步，靠力矩）、反作用力类（垂膝式，靠作用与反作用力）、动态类（跳跃，靠加速度）。', '用哪一种，主要看脚点在哪里；脚点也决定了攀爬的手顺。'],
      },
      frames: [
        { hip: [150, 108], LH: 'A', RH: 'B', LF: 'F1', RF: 'F2', hipDist: 38, angle: 10,
          caption: '✕ 屈膝、腰离墙远：体重压在手上（拉力 {H}kg）。', badge: 'bad', sideFocus: true },
        { hip: [150, 120], hipDist: 10, caption: '○ 腰贴墙：体重落在脚上（拉力 {H}kg）。双脚合计撑了 {LF}+{RF}kg。', badge: 'good', sideFocus: true },
        { hip: [170, 124], LF: [84, 76], caption: '① 平衡类：左手 + 右脚对角支撑，左脚甩出去平衡（靠力矩）。' },
        { RF: 'HS', LF: [158, 66], hip: [172, 150], hipDist: 8, edge: { RF: '内侧踩' }, caption: '② 推拉类：右脚踩高点，把腰移到脚的正上方站起来（高跨步）。' },
        { RF: 'F2', LF: 'F1', hip: [150, 112], knee: { LF: 'in' }, turn: 0.5, edge: { RF: null, LF: '外侧踩' },
          arrows: [{ at: 'LF', dir: [-1, 0], label: '蹬', color: 'blue', len: 18 }, { at: 'RF', dir: [1, 0], label: '蹬', color: 'blue', len: 18 }],
          caption: '③ 反作用力类：双脚往相反方向蹬，卡住身体（垂膝式）。' },
        { knee: { LF: null }, turn: 0, edge: { LF: null }, hip: [170, 160], hipDist: 6, air: true, RH: [204, 232], LF: [130, 74], RF: [194, 76],
          arrows: [{ at: 'hip', dir: [0.4, 1], label: '加速度', color: 'red' }], caption: '④ 动态类：脚蹬出去，靠加速度飞向远点。', dur: 0.6 },
        { RH: 'N', air: false, caption: '四大类的原理，就是 1-3 讲的四个物理要素。', badge: 'good' },
      ],
    },
  ];

  const CH1_B = [
    {
      id: 'inertia', group: G1, ch: '1-3 ②', title: '惯性：一口气连续做完，比停下来省力',
      holds: { H1: { x: 112, y: 196, t: 'h' }, H2: { x: 160, y: 200, t: 'h' }, H3: { x: 168, y: 230, t: 'h', r: 6 },
        N: { x: 176, y: 256, t: 'n' }, F1: { x: 112, y: 62, t: 'f' }, F2: { x: 152, y: 58, t: 'f' } },
      info: {
        scene: '高跨步、下压、跳点、动态、交叉手、静止点——所有需要「流畅连续」的动作。',
        steps: ['动作开始前想好整串手顺', '一旦开始移动，就不要在中途停下', '靠前一动留下来的速度，直接接到下一动'],
        key: '静止的东西想保持静止，运动中的东西想继续运动（惯性定律）。动作一停，下一动就得从静止重新起动——第一动永远最费力。',
        points: ['下压（Mantle）：从「拉」换成「推」时要接续不同的肌肉，一减速就上不去。', '两段跳、时间差跳跃，也都是在借惯性。'],
      },
      frames: [
        { hip: [140, 112], LH: 'H1', RH: 'H2', LF: 'F1', RF: 'F2', hipDist: 14, angle: 10, caption: '目标在上方，中间只有一个小的中继点。' },
        { hip: [146, 132], hipDist: 6, arrows: [{ at: 'hip', dir: [0.2, 1], label: '一口气冲', color: 'orange' }], caption: '脚一蹬，身体开始往上冲。', dur: 0.5 },
        { RH: 'H3', hip: [150, 140], caption: '借着冲势抓中继点……', dur: 0.35 },
        { RH: 'N', hip: [152, 146], caption: '……不停下来，直接接到 NEXT。整串动作一气呵成。', dur: 0.35, badge: 'good' },
      ],
      compare: {
        bad: { hip: [140, 118], LH: 'H1', RH: 'H3', LF: 'F1', RF: 'F2', hipDist: 16, caption: '✕ 在小的中继点上停下来：右手单撑小点 {RH}kg，下一动要从静止重新起动。' },
        good: { hip: [152, 146], LH: 'H1', RH: 'N', LF: 'F1', RF: 'F2', hipDist: 6, caption: '○ 借惯性一口气接到 NEXT：中继点只是路过。' },
      },
    },
    {
      id: 'accel', group: G1, ch: '1-3 ③', title: '加速度：先用脚推，再用手拉',
      holds: { A: { x: 124, y: 190, t: 'h' }, B: { x: 166, y: 192, t: 'h' }, F1: { x: 120, y: 64, t: 'f' },
        F2: { x: 170, y: 62, t: 'f' }, N: { x: 194, y: 244, t: 'n' } },
      info: {
        scene: '每一个往上的动作的起步，尤其是手点不好、距离又远的时候。',
        steps: ['用脚踩好', '第一下用脚推，让身体开始移动', '动起来以后双手再拉，速度越来越快', '最后才伸出单手'],
        key: 'F = m·a：同样的力，持续施加就会让速度一直累加。从静止起动最费力，这一下交给力量最大的腿。',
        points: ['像推车：起步最重，推动以后同样的力会让车越跑越快。', '顺序是 脚尖 → 腿 → 双手 → 单手（就是 4-1 的动力链）。', '常见错误：先用手硬拉，再想到用脚。'],
      },
      frames: [
        { hip: [146, 104], LH: 'A', RH: 'B', LF: 'F1', RF: 'F2', hipDist: 22, caption: '蹲低、用脚踩好。NEXT 在右上方。' },
        { hip: [150, 122], hipDist: 10, chain: { order: ['LF', 'RF', 'hip', 'sh', 'RH'], upto: 2 },
          arrows: [{ at: 'LF', dir: [0, 1], label: '脚推', color: 'blue', len: 18 }, { at: 'RF', dir: [0, 1], label: '脚推', color: 'blue', len: 18 }],
          caption: '① 脚先推：从静止起动最费力的这一下，交给腿。', dur: 0.6 },
        { hip: [156, 140], hipDist: 6, chain: { order: ['LF', 'RF', 'hip', 'sh', 'RH'], upto: 4 },
          arrows: [{ at: 'hip', dir: [0.3, 1], label: '越来越快', color: 'orange' }], caption: '② 动起来了，双手再拉——速度一路累加。', dur: 0.4 },
        { RH: 'N', chain: { order: ['LF', 'RF', 'hip', 'sh', 'RH'], upto: 5 }, caption: '③ 最后单手伸出，抓到原本拉不到的 NEXT。', dur: 0.3, badge: 'good' },
      ],
      compare: {
        bad: { hip: [146, 104], LH: 'A', RH: [190, 236], LF: 'F1', RF: 'F2', hipDist: 22, caption: '✕ 不用脚、直接用手硬拉：手要撑 {LH}kg，还够不到。' },
        good: { hip: [156, 140], LH: 'A', RH: 'N', LF: 'F1', RF: 'F2', hipDist: 6, caption: '○ 先脚推、再手拉：轻松抓到。' },
      },
    },
    {
      id: 'reaction', group: G1, ch: '1-3 ④', title: '作用与反作用：往反方向用力，身体才稳',
      holds: { A: { x: 128, y: 204, t: 'h' }, B: { x: 170, y: 206, t: 'h' }, FL: { x: 92, y: 84, t: 'f' },
        FR: { x: 198, y: 78, t: 'f' }, N: { x: 136, y: 238, t: 'n' } },
      info: {
        scene: '懂了作用力与反作用力，就掌握了一半的手法脚法：垂膝式、侧身、外撑、挂旗都靠它。',
        steps: ['作用力和反作用力在同一直线上，大小相等、方向相反', '对蹬：两脚往相反方向蹬，像伸缩杆卡在墙上', '甩腿也是同一个道理：手往一边伸，腿就往另一边甩（见 3-2「加深对角」）'],
        key: '就像拉一扇很重的门时会用脚抵住地面：借反方向的力，一边维持姿势一边往上移动。',
        points: ['墙（或岩点）要够硬才撑得住：伸缩杆顶在软的墙上就会松掉。', '外撑时脚撑住就前进不了：先放开一只脚，改用同侧的手压墙，对角的手脚互撑才能移动。', '上下方向也一样：手往上伸、脚往下伸，平衡最好。'],
      },
      frames: [
        { hip: [148, 118], LH: 'A', RH: 'B', LF: 'FL', RF: 'FR', hipDist: 22, angle: 20, edge: { RF: '内侧踩', LF: '外侧踩' },
          caption: '前倾 20°，两个脚点左右排开。正面朝墙：手合计要撑 {hand}kg。' },
        { knee: { LF: 'in' }, turn: 0.55, hip: [150, 106], hipDist: 8,
          arrows: [{ at: 'LF', dir: [-1, 0], label: '往后蹬（作用力）', color: 'blue' }, { at: 'RF', dir: [1, 0], label: '往前蹬（反作用力）', color: 'red' }],
          caption: '双脚往相反方向蹬：两股力大小相等、方向相反，像伸缩杆一样把身体卡在墙上。' },
        { arrows: [{ at: 'hip', dir: [0, 1], label: '剩下往上的推力', color: 'orange', len: 20 }],
          caption: '左右的力互相抵消，剩下的就是往上的推力。手合计只要 {hand}kg。' },
        { LH: [136, 246], hip: [146, 126], caption: '所以放开左手也不会旋转（右手 {RH}kg）。' },
        { LH: 'N', caption: '抓到上方的 NEXT。垂膝式、侧身、外撑、甩腿，原理全都一样。', badge: 'good' },
      ],
      compare: {
        bad: { hip: [148, 118], LH: [136, 236], RH: 'B', LF: 'FL', RF: 'FR', hipDist: 22, angle: 20, caption: '✕ 双脚只是踩着、没有对蹬：全靠右手拉（{RH}kg）。' },
        good: { hip: [146, 126], LH: [136, 246], RH: 'B', LF: 'FL', RF: 'FR', hipDist: 8, angle: 20, knee: { LF: 'in' }, turn: 0.55, caption: '○ 双脚对蹬：反作用力帮忙撑住，右手只要 {RH}kg。' },
      },
    },
  ];

  /* ================= 第 3 章 3-1 ================= */
  const CH31 = [
    {
      id: 'movebase', group: G31, ch: '3-1 ① ②', title: '移动的基础：攀岩本来就不平衡',
      sideFocus: true,
      holds: { A: { x: 122, y: 200, t: 'h' }, B: { x: 176, y: 200, t: 'h' }, F1: { x: 118, y: 56, t: 'f' }, F2: { x: 180, y: 56, t: 'f' } },
      info: {
        scene: '所有手法脚法的起点：为什么需要它们？',
        steps: ['走路其实是一连串「失去平衡 → 用脚接住」，只是重复得太自然，感觉不到', '攀岩的岩点间距、大小、位置都不规则，再加上坡度，重力会产生把身体拉离墙面的旋转', '手法脚法，就是用来修正这个不平衡的方法'],
        key: '像爬梯子：缓的梯子靠脚爬、手只是扶着；陡的梯子身体吊在下面，手的负担变大。前倾壁上就算平衡完美，手还是要负担很多——目标是「手只负担脚负担不了的部分」。',
        points: ['教本的估算（体重 50kg，手在头上方）：垂直 0° 手约 7kg（14%）、前倾 20° 约 16kg（32%）、45° 约 25kg（50%）、60° 约 32kg（64%）、70° 约 50kg（100%）。', '超过 45°，手要负担一半以上的体重。到「图鉴 › 原理与专栏」可以拉滑杆试算。', '这个工具的体重设为 60kg，画面上的数字会比教本稍大。'],
      },
      frames: [
        { hip: [150, 120], LH: 'A', RH: 'B', LF: 'F1', RF: 'F2', hipDist: 10, angle: 0, caption: '垂直壁：体重几乎都在脚上，手合计只要 {hand}kg（教本估算：约 14%）。' },
        { angle: 20, caption: '前倾 20°：手合计 {hand}kg（教本：约 32%）。' },
        { angle: 45, caption: '前倾 45°：手合计 {hand}kg（教本：约一半体重）。' },
        { angle: 60, caption: '前倾 60°：手合计 {hand}kg（教本：约 64%）。身体已经吊在脚的下方了。', badge: 'bad' },
        { angle: 0, RF: [166, 30], RH: [204, 214], caption: '坡度之外，岩点的配置也会造成不平衡：只剩同侧手脚时，身体就开门旋转。', badge: 'bad' },
        { RH: 'B', RF: 'F2', caption: '修正这些不平衡的方法，就是第 3 章接下来的各种手法脚法。', badge: 'good' },
      ],
    },
  ];

  /* ================= 第 3 章 3-2 ⑨⑩ ================= */
  const CH32 = [
    {
      id: 'bow', group: G32, ch: '3-2 ⑨', title: '弓身平衡：腰往反方向推，身体像一张弓',
      holds: { R: { x: 180, y: 206, t: 'h' }, A: { x: 140, y: 200, t: 'h' }, F: { x: 174, y: 52, t: 'f', r: 5 }, F2: { x: 184, y: 52, t: 'f', r: 5 }, N: { x: 124, y: 214, t: 'n' } },
      info: {
        scene: '缓的前倾壁或垂直壁上，下一个岩点很近、不需要甩腿时；或旁边有障碍、腿甩不开时。使用率很高。',
        steps: ['右手支撑，准备用左手往左抓', '腰往目标的反方向（右）推出去，身体拱成弓形', '左右的体重平均了，再伸出左手'],
        key: '腰是重心所在，往外推的效果最大：上半身往左、腰往右，像拉开的弓一样用全身分配体重。',
        points: ['先平衡，支撑手不要死命握紧。', '不要死盯着目标：脖子一用力，手反而伸不远，用眼角看就好。', '常见错误：腰留在原地就出手。', '双脚踩同一个点：适合能站两只脚的大脚点。'],
      },
      frames: [
        { hip: [164, 120], LH: 'A', RH: 'R', LF: 'F', RF: 'F2', hipDist: 12, caption: '双脚踩同一个大脚点，右手支撑。NEXT 在左边。' },
        { LH: [112, 212], caption: '腰留在原地就伸左手：重心跑到支撑线左边，身体往左打开。', badge: 'bad' },
        { LH: 'A', caption: '回到岩点。' },
        { hip: [188, 118], arrows: [{ at: 'hip', dir: [1, 0], label: '腰往右推', color: 'red' }], caption: '把腰往右推出去，身体拱成弓形。' },
        { LH: [126, 212], caption: '上半身往左、腰往右，左右平衡：重心回到支撑线上。' },
        { LH: 'N', caption: '抓到 NEXT。右手负担 {RH}kg。', badge: 'good' },
      ],
      compare: {
        bad: { hip: [164, 120], LH: [112, 212], RH: 'R', LF: 'F', RF: 'F2', hipDist: 12, caption: '✕ 腰留在原地：开门旋转。' },
        good: { hip: [188, 118], LH: [126, 212], RH: 'R', LF: 'F', RF: 'F2', hipDist: 12, caption: '○ 弓身：腰往反方向推，左右体重平均。' },
      },
    },
    {
      id: 'flagswitch', group: G32, ch: '3-2 ⑩', title: '挂旗法的切换：不换脚，一路爬上去',
      holds: { H1: { x: 130, y: 196, t: 'h' }, H2: { x: 180, y: 206, t: 'h' }, H3: { x: 128, y: 224, t: 'h' },
        H4: { x: 182, y: 238, t: 'h' }, N: { x: 140, y: 248, t: 'n' }, F: { x: 158, y: 60, t: 'f', r: 6 } },
      info: {
        scene: '只有一个好脚点，手点却左右交替往上排列的路线。',
        steps: ['只用对角支撑的话，每一手都要换脚，很费工夫', '改用挂旗：右脚一直踩着脚点，靠左腿换位置来平衡', '外侧挂旗 → 对角支撑 → 内侧挂旗，依序切换'],
        key: '同一只脚踩到底，左腿在「绕到后面 / 甩到左边 / 穿过身前」之间切换，就能左右手轮流往上。',
        points: ['伸左手时（右手右脚同侧）：左腿要到右边去——外侧挂旗或内侧挂旗。', '伸右手时（左手右脚对角）：左腿回到左边当摆脚。'],
      },
      frames: [
        { hip: [158, 116], LH: 'H1', RH: 'H2', RF: 'F', LF: [108, 40], hipDist: 12, caption: '右脚踩唯一的脚点，左腿垂在左下。' },
        { LF: [196, 34], z: { LF: 'front' }, hip: [166, 124], arrows: [{ at: 'LF', dir: [1, -0.2], label: '绕到后面', color: 'red', len: 18 }],
          caption: '要伸左手 → 右手右脚同侧：左腿从右脚后面绕到右边（外侧挂旗）。' },
        { LH: 'H3', caption: '左手抓到 H3。' },
        { LF: [104, 60], z: { LF: null }, hip: [156, 128], arrows: [{ at: 'LF', dir: [-1, 0], label: '腿往回甩', color: 'red', len: 18 }],
          caption: '要伸右手 → 左手右脚对角：左腿甩回左边当摆脚。' },
        { RH: 'H4', hip: [158, 134], caption: '右手抓到 H4。' },
        { LF: [204, 60], z: { LF: 'back' }, hip: [166, 140], arrows: [{ at: 'LF', dir: [1, 0], label: '穿过身前', color: 'red', len: 18 }],
          caption: '再伸左手：这次让左腿穿过身前甩到右边（内侧挂旗）。' },
        { LH: 'N', caption: '抓到 NEXT——右脚从头到尾都没离开脚点。', badge: 'good' },
      ],
      compare: {
        bad: { hip: [146, 116], LH: [126, 222], RH: 'H2', RF: 'F', LF: [108, 40], hipDist: 12, caption: '✕ 不挂旗直接伸左手：同侧支撑，开门旋转（只能换脚）。' },
        good: { hip: [166, 124], LH: [126, 222], RH: 'H2', RF: 'F', LF: [196, 34], z: { LF: 'front' }, hipDist: 12, caption: '○ 外侧挂旗：不换脚也稳。' },
      },
    },
  ];

  /* ================= 第 3 章 3-5 ④ 锁膝 ================= */
  const KNEEBAR = {
    id: 'kneebar', group: G3, ch: '3-5 ④', title: '锁膝法：小腿当伸缩杆，双手放开休息',
    holds: { A: { x: 130, y: 196, t: 'h' }, B: { x: 186, y: 200, t: 'h' }, K: { x: 205, y: 112, t: 'h', r: 10 },
      FK: { x: 180, y: 62, t: 'f' }, F1: { x: 124, y: 44, t: 'f' } },
    info: {
      scene: '脚点的正上方、刚好在膝盖的高度有一个大点或朝下的点时。主要用来休息。',
      steps: ['脚踩下面的点，把小腿当作轴', '膝盖上方顶进上面那个点的下缘', '用脚踝的角度调整顶住的松紧（等于调整膝盖到脚尖的长度）'],
      key: '脚往下踩、膝盖往上顶，小腿像伸缩杆一样卡在两个岩点之间。小腿的力量很大，锁得好就能双手放开休息。',
      points: ['解锁时要小心：失去平衡的状态下直接解开往上爬，很容易掉。', '真正的岩场上能用到的机会不多，但值得认识。'],
    },
    frames: [
      { hip: [158, 118], LH: 'A', RH: 'B', LF: 'F1', RF: [176, 30], hipDist: 10, caption: '右脚点的正上方、膝盖高度有一个朝下的大点。' },
      { RF: 'FK', hip: [150, 104], caption: '右脚踩上脚点，膝盖顶进大点的下缘。' },
      { oppose: '锁膝', arrows: [{ at: 'RK', dir: [0, 1], label: '膝盖往上顶', color: 'red', len: 18 }, { at: 'RF', dir: [0, -1], label: '脚往下踩', color: 'blue', len: 18 }],
        caption: '脚往下踩、膝盖往上顶：小腿像伸缩杆卡住。' },
      { LH: [132, 150], RH: [190, 150], caption: '锁住了，双手放开甩一甩、休息一下。', badge: 'good' },
      { LH: 'A', RH: 'B', caption: '休息够了先抓回岩点，站稳了再小心解锁。' },
    ],
  };

  /* ================= 第 3 章 3-6 动态补充 ================= */
  const CH36 = [
    {
      id: 'onehand', group: G36, ch: '3-6 ④', title: '单手蹲跳：只有一只手撑得住时',
      holds: { S: { x: 184, y: 196, t: 'h', r: 6 }, F1: { x: 184, y: 64, t: 'f' }, F2: { x: 214, y: 70, t: 'f' }, N: { x: 112, y: 254, t: 'n' } },
      info: {
        scene: '支撑点很小、只放得下一只手，下一个点又很远时；或双手抓着反而不好平衡的位置。',
        steps: ['支撑手抓稳，腰沉到支撑手的正下方（也可以先做深的挂旗）', '抓取手先垂下来，让身体平衡', '双脚蹬出去，抓取手顺着大弧线往上甩', '抓到后，支撑手留在原点稳住摆荡'],
        key: '蹲下去离目标虽然变远，但平衡更好，跳的距离可以靠腿补回来。单手撑时腰的上下弹力不好用，单纯地跳出去就好。',
        points: ['常见错误：身体还没稳就出手；抓到以后支撑手先松开，整个人荡出去。', '距离太远、支撑手非放不可时，就跟在抓取手后面去抓上方的点。'],
      },
      frames: [
        { hip: [188, 110], RH: 'S', LH: [160, 150], LF: 'F1', RF: 'F2', hipDist: 16, angle: 30, caption: '前倾 30°，只有右手的小点撑得住。NEXT 在左上方很远。' },
        { hip: [182, 96], hipDist: 24, LH: [164, 104], arrows: [{ at: 'hip', dir: [0, -1], label: '腰沉到支撑手正下方', color: 'blue', len: 18 }],
          caption: '腰沉到支撑手正下方，左手垂下来让身体平衡。', dur: 0.8, pause: 0.4 },
        { hip: [150, 152], hipDist: 8, air: true, LH: [118, 236], arrows: [{ at: 'hip', dir: [-0.6, 1], label: '双脚蹬出', color: 'red' }, { at: 'LH', dir: [-0.4, 1], label: '大弧线往上甩', color: 'orange', len: 18 }],
          caption: '双脚蹬出去，左手画一个大弧往上甩！', dur: 0.6 },
        { LH: 'N', air: false, hip: [146, 150], LF: [150, 76], RF: [170, 80],
          caption: '抓到！右手留在原点，帮忙稳住摆荡。', badge: 'good' },
      ],
    },
    {
      id: 'condlunge', group: G36, ch: '3-6 ⑤', title: '协调跳跃：一口气跳过不好撑的中继点',
      holds: { P1: { x: 188, y: 176, t: 'h' }, P2: { x: 204, y: 172, t: 'h' }, M: { x: 150, y: 214, t: 'h', r: 5 },
        RS: { x: 186, y: 236, t: 'h' }, N: { x: 118, y: 236, t: 'n' }, F1: { x: 182, y: 60, t: 'f' }, F2: { x: 214, y: 58, t: 'f' }, FS: { x: 110, y: 104, t: 'f' } },
      info: {
        scene: '附近只有一个很差的中继点，后面却接着 2～3 个好点。人工路线很常见。',
        steps: ['出发前，先想好抓到最后一个点时身体会是什么姿势', '左手碰中继点、右手接着往上、左手再接到好点，中间不追求平衡', '最后脚甩上去挂住，整个人稳住'],
        key: '「协调」是身体各部位同时配合的能力，有点像体操：动作没完成前不求平衡，只要最后能稳稳停住。',
        points: ['常见错误：每一步都想停稳——在差的中继点上停下来，一定撑不住。', '身体不要打转：动作之间保持流动，但重心不要甩出支撑范围。'],
      },
      frames: [
        { hip: [184, 104], LH: 'P1', RH: 'P2', LF: 'F1', RF: 'F2', hipDist: 16, angle: 30, caption: '双手在右下方。往左上去，中间只有一个很差的中继点。' },
        { LH: 'M', hip: [176, 138], hipDist: 8, arrows: [{ at: 'LH', dir: [-0.5, 1], label: '①', color: 'blue', len: 16 }], caption: '① 左手只是「碰」一下中继点……', dur: 0.45 },
        { RH: 'RS', hip: [166, 152], air: true, arrows: [{ at: 'RH', dir: [0, 1], label: '②', color: 'red', len: 16 }], caption: '② 右手不停，接着往上抓好点……', dur: 0.4 },
        { LH: 'N', hip: [150, 156], arrows: [{ at: 'LH', dir: [-1, 0.4], label: '③', color: 'blue', len: 16 }], caption: '③ 左手离开中继点，接到左上的好点……', dur: 0.4 },
        { LF: 'FS', RF: [178, 70], hip: [146, 152], air: false, hook: { LF: 'heel' }, arrows: [{ at: 'LF', dir: [-1, 0.6], label: '④ 脚甩上去', color: 'green', len: 16 }],
          caption: '④ 左脚甩到左边挂住——整串一口气完成，身体稳稳停住。', dur: 0.5, badge: 'good' },
      ],
      compare: {
        bad: { hip: [176, 138], LH: 'M', RH: 'P2', LF: 'F1', RF: 'F2', hipDist: 16, angle: 30, caption: '✕ 在中继点上停下来想站稳：小点根本撑不住（左手 {LH}kg）。' },
        good: { hip: [146, 152], LH: 'N', RH: 'RS', LF: 'FS', RF: [178, 70], hook: { LF: 'heel' }, hipDist: 8, angle: 30, caption: '○ 一口气接过去：中继点只是路过。' },
      },
    },
    {
      id: 'swingby', group: G36, ch: '3-6 ⑥', title: '重力助推：先像钟摆一样荡，再横向飞出去',
      holds: { H: { x: 150, y: 200, t: 'h' }, F: { x: 150, y: 58, t: 'f', r: 6 }, N: { x: 252, y: 232, t: 'n' } },
      info: {
        scene: '目标在侧边或斜上方很远的地方。任何坡度都能用。',
        steps: ['双手尽量靠拢，双脚也靠拢', '踩稳脚点，慢慢左右摆（脚点只够一只脚时，另一只脚每摆一次就蹬一下墙）', '摆幅够大时，左手撑住、右手伸出，身体打开成大对角荡出去'],
        key: '横向跳的时候，摆荡的动能比「拉」的动能大：先往反方向多荡一点，再借回来的速度飞出去。',
        points: ['手一放开就不能重来：放手的时机要配合摆动。', '运动伤害约 35% 发生在肩关节：横向的甩动会拉扯肩膀深层的小肌群，要特别小心。'],
      },
      frames: [
        { hip: [150, 118], LH: 'H', RH: 'H', LF: 'F', RF: 'F', hipDist: 12, caption: '双手同一个点、双脚同一个点。先目测到 NEXT 的距离。' },
        { hip: [172, 116], air: true, arrows: [{ at: 'hip', dir: [1, 0], label: '往右摆', color: 'blue', len: 18 }], caption: '慢慢往右摆……', dur: 0.8, pause: 0.2 },
        { hip: [126, 116], arrows: [{ at: 'hip', dir: [-1, 0], label: '反向摆，蓄力', color: 'green' }], caption: '……再往左大一点（反向摆，蓄力）……', dur: 0.9, pause: 0.2 },
        { hip: [198, 146], hipDist: 8, RH: [236, 226], LF: [158, 78], RF: [176, 74], arrows: [{ at: 'hip', dir: [1, 0.5], label: '荡出去', color: 'red' }],
          caption: '……荡回来的速度最快时放开右手，身体打开成大对角飞出去！', dur: 0.6 },
        { RH: 'N', air: false, hip: [204, 150], caption: '抓到 NEXT。左手还留在原点。', badge: 'good' },
      ],
    },
    {
      id: 'campus', group: G36, ch: '3-6 ⑨', title: '指力跳：没有脚点，只靠手臂飞上去',
      holds: { H: { x: 160, y: 196, t: 'h' }, N: { x: 168, y: 276, t: 'n' } },
      info: {
        scene: '双手都抓得稳，但完全没有脚点，下一个点又很远（可以到约 1m）。',
        steps: ['双手像引体向上一样把身体拉高', '往下荡，手臂几乎伸直，借反作用力和肌腱的弹性', '再一口气拉起，最后一刻把「拉」转成「推」', '单手出手抓目标'],
        key: '动态要素最多的手法：背先往后弓、腰再往前顶，身体成「く」字在空中滑行，像单杠的大车轮一样把人带上去。',
        points: ['诀窍：手臂伸直一点、腋下张开。', '常见错误：手臂弯着出力；拉和荡的时机对不上。', '静态的引体向上拉不了这么高，需要另外训练。到「挑战」玩「指力跳」关卡。'],
      },
      frames: [
        { hip: [160, 128], LH: 'H', RH: 'H', LF: [150, 60], RF: [170, 60], hipDist: 10, angle: 30, caption: '前倾 30°，没有脚点。双手抓同一个点，先把身体拉高。' },
        { hip: [158, 92], hipDist: 26, LF: [146, 30], RF: [168, 28], arrows: [{ at: 'hip', dir: [0, -1], label: '往下荡', color: 'blue', len: 18 }],
          caption: '往下荡，手臂几乎伸直——蓄积反作用力。', dur: 0.8, pause: 0.3 },
        { hip: [162, 176], hipDist: 6, air: true, RH: [166, 262], LF: [150, 104], RF: [170, 100],
          arrows: [{ at: 'hip', dir: [0, 1], label: '拉 → 推', color: 'red' }], caption: '一口气拉起，最后转成推：身体飞上去，右手出手！', dur: 0.5 },
        { RH: 'N', air: false, hip: [164, 184], caption: '抓到约 80cm 外的 NEXT。', badge: 'good' },
      ],
    },
  ];

  /* ================= 第 3 章 3-7 ⑦⑧ ================= */
  const CH37 = [
    {
      id: 'regrip', group: G36, ch: '3-7 ⑦', title: '重抓：身体升高后，同一只手换个抓法',
      holds: { G: { x: 184, y: 186, t: 'h', r: 8 }, T: { x: 136, y: 222, t: 'h' }, F1: { x: 126, y: 96, t: 'f' },
        F2: { x: 188, y: 52, t: 'f' }, F3: { x: 200, y: 98, t: 'f' }, N: { x: 140, y: 262, t: 'n' } },
      info: {
        scene: '往上拉身体时，岩点相对于身体的角度一直在变：到了不同高度，就要换不同的抓法。和「换手」不同，这里是同一只手在同一个点上换。',
        steps: ['一开始在肩膀高度，正常往下拉', '身体升高、岩点降到腰旁边时，手翻过来改成从上往下压（推）', '或改成拇指朝下的反抓（倒抓），可以伸得更远'],
        key: '岩点在肩膀以上用「拉」，降到腰附近就换成「推」或「反抓」——同一个点用到最后，移动距离就多出一截。',
        points: ['换抓法要趁身体还有往上的速度时一口气做完。', '反抓（倒抓）能让另一只手伸得更高，见图鉴「倒抓」。'],
      },
      frames: [
        { hip: [160, 124], LH: 'T', RH: 'G', LF: 'F1', RF: 'F2', hipDist: 12, caption: '右手在肩膀高度抓着大点，往下拉。' },
        { hip: [164, 160], hipDist: 6, RF: 'F3', caption: '身体往上升，大点渐渐降到胸口、腰旁边……', dur: 1.0 },
        { palm: { RH: 1 }, arrows: [{ at: 'RH', dir: [0, -1], label: '翻过来往下压', color: 'blue', len: 18 }],
          caption: '右手翻过来改成往下压，手臂撑直——同一个点又多用了一段。' },
        { LH: 'N', hip: [164, 166], caption: '撑高了，左手抓到 NEXT。', badge: 'good' },
      ],
      compare: {
        bad: { hip: [162, 136], LH: [140, 262], RH: 'G', LF: 'F1', RF: 'F2', hipDist: 12, caption: '✕ 一直用「拉」的抓法：岩点到了胸口就拉不上去，手够不到。' },
        good: { hip: [164, 166], LH: 'N', RH: 'G', LF: 'F1', RF: 'F3', hipDist: 6, palm: { RH: 1 }, caption: '○ 重抓成「下压」：撑得高、够得到。' },
      },
    },
    {
      id: 'multiswap', group: G36, ch: '3-7 ⑧', title: '连续换手：先把手顺算好',
      holds: { P1: { x: 188, y: 196, t: 'h' }, P2: { x: 154, y: 208, t: 'h' }, P4: { x: 126, y: 202, t: 'h' },
        P3: { x: 128, y: 236, t: 'h' }, N: { x: 152, y: 258, t: 'n' }, F1: { x: 108, y: 72, t: 'f' }, F2: { x: 198, y: 72, t: 'f' } },
      info: {
        scene: '三个岩点之间要换好几次手，最后让某一只手抓到目标时。',
        steps: ['右手在右边的点、左手在中间的点', '右手交叉越过，抓左上的点', '左手降到左边的低点（让出中间的点）', '右手降回中间的点', '左手往上抓左上的点', '右手抓最上面的目标'],
        key: '手顺一错，就会在最后一步发现「要用的手被挡住了」。出发前先在脑中排一次。',
        points: ['双脚始终大大张开（青蛙步），换手时身体才稳。', '交叉之后先确认脚点再移动：手会挡住视线。'],
      },
      frames: [
        { hip: [154, 128], LH: 'P2', RH: 'P1', LF: 'F1', RF: 'F2', hipDist: 12, caption: '右手在右边、左手在中间。目标：最后让右手抓到最上面的 NEXT。' },
        { RH: 'P3', hip: [142, 140], turn: 0.4, caption: '① 右手交叉越过左手，抓左上的点。' },
        { LH: 'P4', caption: '② 左手降到左边的低点，让出中间的点。' },
        { RH: 'P2', turn: 0, hip: [146, 134], caption: '③ 右手降回中间的点。' },
        { LH: 'P3', hip: [146, 144], caption: '④ 左手往上抓左上的点。' },
        { RH: 'N', hip: [150, 150], caption: '⑤ 右手抓到最上面的 NEXT——手顺一步都没乱。', badge: 'good' },
      ],
    },
  ];

  /* ================= 第 4 章 4-1 ②③ ================= */
  const CH41 = [
    {
      id: 'cogpath', group: G4, ch: '4-1 ②', title: '重心移动：直线冲，或先沉到脚上再推',
      holds: { A: { x: 120, y: 198, t: 'h' }, B: { x: 166, y: 204, t: 'h' }, F1: { x: 116, y: 56, t: 'f' },
        HS: { x: 186, y: 100, t: 'f' }, N: { x: 212, y: 246, t: 'n' } },
      info: {
        scene: '每一次移动重心的路线选择。',
        steps: ['直线：从腰的高处直接冲向目标，速度优先——只有支撑点够好、位置允许时才用', '抛物线：支撑点不好抓时，先把重心沉到前脚的正上方，再用腿推上去'],
        key: '直线最快、最省时间；抛物线绕一点路，却把体重先交给脚，手几乎不用出力。',
        points: ['抛物线不要只做一半：重心还留在后脚就往上推，一样会拉坏手。体重一定要压实在前脚上。'],
      },
      frames: [
        { hip: [142, 114], LH: 'A', RH: 'B', LF: 'F1', RF: 'HS', hipDist: 14, edge: { RF: '内侧踩' }, caption: '右脚已经踩上高点，NEXT 在右上方。' },
        { hip: [172, 148], hipDist: 6, RH: [204, 238], LF: [100, 70], arrows: [{ at: 'hip', dir: [1, 1.1], label: '直线', color: 'green' }],
          caption: '直线：腰从高处直接冲向目标。快，但左手要撑 {LH}kg——支撑点要够好。', dur: 0.5 },
        { hip: [142, 114], RH: 'B', LF: 'F1', hipDist: 14, caption: '回到起点。这次假设左手的点很差。', dur: 0.8 },
        { hip: [176, 112], LF: [150, 54], arrows: [{ at: 'hip', dir: [1, -0.2], label: '先沉到右脚上', color: 'blue' }],
          caption: '抛物线：先把腰往右下沉，移到右脚的正上方——左手只剩 {LH}kg。', dur: 0.9 },
        { hip: [180, 152], hipDist: 6, arrows: [{ at: 'hip', dir: [0, 1], label: '用脚推上去', color: 'red' }], caption: '体重压实在右脚上，用腿推上去。', dur: 0.7 },
        { RH: 'N', caption: '抓到 NEXT，手几乎没出力。', badge: 'good' },
      ],
    },
    {
      id: 'tiptoe', group: G4, ch: '4-1 ③', title: '踮脚：腰贴墙，用脚尖把身体顶高',
      sideFocus: true,
      holds: { A: { x: 124, y: 200, t: 'h' }, B: { x: 172, y: 204, t: 'h' }, F1: { x: 120, y: 58, t: 'f' }, F2: { x: 176, y: 60, t: 'f' }, N: { x: 166, y: 246, t: 'n' } },
      info: {
        scene: '动态的起跳、身体靠墙支撑的时候；路线中途随时可以用，非常万能。',
        steps: ['腰贴墙', '脚尖压住脚点、脚跟提起，把身体顶高', '身体沿着墙伸直，再伸手'],
        key: '在前倾壁上腰贴墙有两个好处：支点（脚）更靠近重心；脚踩在脚点上的角度更容易踮高——两者都减轻手的负担。',
        points: ['腰贴墙时，墙会给一个往外的反作用力，脚自然就踮得起来。', '常见错误：屁股往外翘、膝盖弯着，体重落不到脚上。'],
      },
      frames: [
        { hip: [148, 104], LH: 'A', RH: 'B', LF: 'F1', RF: 'F2', hipDist: 34, angle: 15, caption: '✕ 屁股往外翘、膝盖弯：拉力 {H}kg，NEXT 也够不到。', badge: 'bad' },
        { hipDist: 8, hip: [150, 118], caption: '先把腰贴到墙上：拉力降到 {H}kg。' },
        { hip: [152, 132], arrows: [{ at: 'hip', dir: [0, 1], label: '踮脚顶高', color: 'blue' }], caption: '脚尖压住、脚跟提起：身体沿着墙被顶高。' },
        { RH: 'N', caption: '轻松抓到 NEXT。', badge: 'good' },
      ],
      compare: {
        bad: { hip: [148, 104], LH: 'A', RH: [164, 232], LF: 'F1', RF: 'F2', hipDist: 34, angle: 15, caption: '✕ 腰离墙：体重压在手上（拉力 {H}kg）。' },
        good: { hip: [152, 132], LH: 'A', RH: 'N', LF: 'F1', RF: 'F2', hipDist: 8, angle: 15, caption: '○ 腰贴墙踮脚：体重落在脚上（拉力 {H}kg）。' },
      },
    },
  ];

  /* ---------- 新挑战 ---------- */
  C.CHALLENGES.push(
    {
      id: 'c-bow', title: '第 9 关 · 弓身平衡', angle: 0,
      holds: { R: { x: 180, y: 206, t: 'h' }, A: { x: 140, y: 200, t: 'h' }, F: { x: 174, y: 52, t: 'f', r: 5 }, F2: { x: 184, y: 52, t: 'f', r: 5 }, N: { x: 124, y: 214, t: 'n' } },
      start: { hip: [164, 120], LH: 'A', RH: 'R', LF: 'F', RF: 'F2', hipDist: 12 },
      solution: { hip: [188, 118], LH: 'N', RH: 'R', LF: 'F', RF: 'F2', hipDist: 12 },
      goal: { limb: 'LH', hold: 'N' }, maxLoad: 40,
      text: '双脚只能踩同一个点。用左手抓到左边的 NEXT：不能旋转。',
      hint: '先把腰往右（目标的反方向）推出去，让身体拱成弓形，再伸左手。（3-2 ⑨）',
      explain: '弓身平衡：腰往反方向推，上半身往目标伸，左右体重平均，身体就不会旋转。',
    },
    {
      id: 'c-onehand', title: '第 10 关 · 抓时机：单手蹲跳', type: 'dyno', angle: 30, vTol: 60,
      holds: { S: { x: 184, y: 196, t: 'h', r: 6 }, F1: { x: 184, y: 64, t: 'f' }, F2: { x: 214, y: 70, t: 'f' }, N: { x: 140, y: 252, t: 'n' } },
      start: { hip: [180, 110], RH: 'S', LH: [160, 120], LF: 'F1', RF: 'F2', hipDist: 18 },
      goal: { limb: 'LH', hold: 'N' },
      text: '只有右手撑得住。蓄力跳出去，在最高点用左手抓住左上方的 NEXT。',
      hint: '单手撑的时候不要贪力量：蓄力一半多一点就放开，速度条回到绿色区再抓。（3-6 ④）',
      explain: '单手蹲跳：腰沉到支撑手正下方、抓取手先垂下平衡，再用双脚蹬出去。',
    },
    {
      id: 'c-campus', title: '第 11 关 · 抓时机：指力跳', type: 'dyno', angle: 30, vTol: 45,
      holds: { H: { x: 160, y: 196, t: 'h' }, N: { x: 168, y: 276, t: 'n' } },
      start: { hip: [160, 100], LH: 'H', RH: 'H', LF: [150, 30], RF: [170, 30], hipDist: 22 },
      goal: { limb: 'RH', hold: 'N' },
      text: '没有脚点，只能靠手臂。荡下去、拉起来，在最高点用右手抓住上方的 NEXT（容许的速度最小）。',
      hint: '指力跳全靠手，抓的时机最严格：一看到速度条进入绿色区就马上按「抓！」。（3-6 ⑨）',
      explain: '指力跳：手臂伸直往下荡、借反作用力一口气拉起转成推，在最高点出手。',
    }
  );

  /* ---------- 按教本顺序插入 ---------- */
  function insertAfter(id, items) {
    const i = C.LESSONS.findIndex((l) => l.id === id);
    C.LESSONS.splice(i < 0 ? C.LESSONS.length : i + 1, 0, ...items);
  }
  function insertBefore(id, items) {
    const i = C.LESSONS.findIndex((l) => l.id === id);
    C.LESSONS.splice(i < 0 ? C.LESSONS.length : i, 0, ...items);
  }
  insertAfter('terms', CH1_A);
  insertAfter('torque', CH1_B);
  insertBefore('balance', CH31);
  insertAfter('outerflag', CH32);
  insertBefore('push', [KNEEBAR]);
  const push = C.LESSONS.find((l) => l.id === 'push');
  if (push) push.ch = '3-5 ⑤ ⑥';
  insertAfter('lunge', CH36);
  insertAfter('cross', CH37);
  insertBefore('chain', CH41);
  C.EXTRA = { CH36, CH37, CH41 };
})(typeof self !== 'undefined' ? self : global);
