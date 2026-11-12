/* 图鉴：第 2 章 抓法、踩法、挂勾、塞法
 * 每张卡：示意图（原创简图）+ 适用场合 / 做法 / 受力方向 / 身体配合 / 注意。
 * 示意图说明：灰色 = 岩点或岩壁，橙色 = 接触的部位，蓝色箭头 = 你出力的方向。
 */
(function () {
  'use strict';

  /* ---------- 简图零件 ---------- */
  const SKIN = '#f3c6a5', SKIN_D = '#c98b65', HOLD = '#ec5f7c', HOLD_D = '#b93b57', WALL = '#d7e8ee', WALL_D = '#9fb8c3';
  const SHOE = '#2f3552', RUB = '#d9473f', HOT = '#f08c00', BLUE = '#1c7ed6';
  const arrow = (x1, y1, x2, y2, c = BLUE, label = '', lx, ly) =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="5" stroke-linecap="round" marker-end="url(#g_arrow_${c === BLUE ? 'b' : c === HOT ? 'o' : 'r'})"/>` +
    (label ? `<text x="${lx == null ? x2 : lx}" y="${ly == null ? y2 - 8 : ly}" class="g-lab" fill="${c}">${label}</text>` : '');
  const wallBg = () => `<rect width="240" height="160" fill="${WALL}"/>`;
  const tag = (x, y, t) => `<text x="${x}" y="${y}" class="g-tag">${t}</text>`;
  // 侧面看的一根手指（三节）：points 为关节坐标
  const finger = (pts, w = 11) => `<polyline points="${pts.map((p) => p.join(',')).join(' ')}" fill="none" stroke="${SKIN}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<polyline points="${pts.map((p) => p.join(',')).join(' ')}" fill="none" stroke="${SKIN_D}" stroke-width="1" stroke-dasharray="0" opacity=".0"/>` +
    pts.slice(1, -1).map((p) => `<circle cx="${p[0]}" cy="${p[1]}" r="2.2" fill="${SKIN_D}"/>`).join('');
  const shoeSide = (x, y, rot = 0, flip = 1) => `<g transform="translate(${x},${y}) rotate(${rot}) scale(${flip},1)">
      <path d="M-46 -10 Q-48 -26 -30 -28 L6 -26 Q30 -24 40 -8 Q44 2 34 4 L-40 4 Q-48 2 -46 -10Z" fill="${SHOE}"/>
      <path d="M-44 0 L36 0 Q44 0 40 -6 L42 -2 Q40 6 30 6 L-40 6Z" fill="${RUB}"/></g>`;

  const SVG = {
    full_crimp: () => wallBg() + `<rect x="150" y="70" width="90" height="14" fill="${HOLD}" stroke="${HOLD_D}"/>` +
      finger([[40, 150], [92, 92], [126, 60], [152, 70]], 13) + `<circle cx="152" cy="70" r="6" fill="${HOT}"/>` +
      `<ellipse cx="118" cy="82" rx="16" ry="7" fill="${SKIN}" stroke="${SKIN_D}"/>` + tag(40, 112, '拇指压住食指') +
      arrow(150, 98, 150, 140, BLUE, '往下拉', 158, 134) + tag(118, 50, '第二关节高高拱起'),
    half_crimp: () => wallBg() + `<rect x="150" y="70" width="90" height="16" fill="${HOLD}" stroke="${HOLD_D}"/>` +
      finger([[40, 150], [96, 96], [126, 70], [152, 72]], 13) + `<circle cx="150" cy="72" r="6" fill="${HOT}"/>` +
      arrow(150, 100, 150, 140, BLUE, '往下拉', 158, 134) + tag(60, 60, '指尖到第二关节≈与墙平行'),
    open_hand: () => wallBg() + `<path d="M150 56 Q120 70 150 110 L240 110 L240 56Z" fill="${HOLD}" stroke="${HOLD_D}"/>` +
      finger([[40, 150], [92, 112], [118, 88], [140, 72]], 13) + `<path d="M118 88 L140 72" stroke="${HOT}" stroke-width="7" stroke-linecap="round"/>` +
      arrow(130, 112, 130, 148, BLUE, '往下拉', 138, 144) + tag(30, 70, '用指腹的「面」勾住'),
    sloper: () => wallBg() + `<path d="M60 120 Q120 20 200 120Z" fill="${HOLD}" stroke="${HOLD_D}"/>` +
      `<path d="M78 98 Q120 40 182 98" fill="none" stroke="${HOT}" stroke-width="9" stroke-linecap="round" opacity=".85"/>` +
      `<line x1="120" y1="70" x2="120" y2="150" stroke="#e03131" stroke-width="2" stroke-dasharray="4 4"/>` + tag(126, 148, '重心在岩点正下方') +
      arrow(170, 60, 186, 88, BLUE, '手掌往下压、整只手摩擦', 40, 22),
    pinch: () => wallBg() + `<rect x="100" y="30" width="40" height="110" rx="10" fill="${HOLD}" stroke="${HOLD_D}"/>` +
      `<rect x="88" y="50" width="12" height="70" rx="6" fill="${HOT}"/><rect x="140" y="56" width="12" height="54" rx="6" fill="${HOT}"/>` +
      arrow(60, 85, 86, 85, BLUE, '四指', 40, 76) + arrow(190, 85, 154, 85, BLUE, '拇指', 180, 76) + tag(70, 154, '两侧对夹，再转腕往下锁'),
    pocket: () => wallBg() + `<rect x="60" y="40" width="120" height="80" rx="20" fill="${HOLD}" stroke="${HOLD_D}"/>` +
      `<ellipse cx="120" cy="80" rx="26" ry="14" fill="#5a1f2e"/>` + `<rect x="104" y="70" width="12" height="20" rx="5" fill="${HOT}"/><rect x="122" y="70" width="12" height="20" rx="5" fill="${HOT}"/>` +
      tag(40, 150, '常用：中指 + 无名指（关节高度一致）') + arrow(200, 70, 200, 110, BLUE, '往下拉', 206, 106),
    wrap: () => wallBg() + `<path d="M150 40 Q210 40 210 90 Q210 120 180 120 L150 120Z" fill="${HOLD}" stroke="${HOLD_D}"/>` +
      finger([[40, 150], [100, 120], [160, 56], [196, 70], [196, 100]], 13) + `<circle cx="160" cy="56" r="6" fill="${HOT}"/>` +
      tag(30, 40, '以指根（第三关节）挂住') + arrow(110, 140, 80, 150, BLUE, '往身体拉', 30, 130),
    overhand: () => wallBg() + `<polygon points="70,120 170,120 120,70" fill="${HOLD}" stroke="${HOLD_D}"/>` +
      `<ellipse cx="120" cy="66" rx="34" ry="10" fill="${SKIN}" stroke="${SKIN_D}"/>` + arrow(120, 20, 120, 52, BLUE, '掌心朝下往下压', 130, 30),
    tree_finger: () => wallBg() + `<path d="M70 50 Q130 20 180 60 Q200 110 140 130 Q80 130 70 50Z" fill="${HOLD}" stroke="${HOLD_D}"/>` +
      [[96, 58], [146, 50], [120, 118]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="8" fill="${HOT}"/>`).join('') +
      `<polygon points="96,58 146,50 120,118" fill="none" stroke="${HOT}" stroke-dasharray="4 3"/>` + tag(30, 154, '食指、中指、拇指三点撑开，像三脚椅'),
    side_pull: () => wallBg() + `<rect x="150" y="20" width="22" height="120" rx="6" fill="${HOLD}" stroke="${HOLD_D}"/>` +
      `<rect x="138" y="44" width="12" height="70" rx="6" fill="${HOT}"/>` + arrow(130, 80, 70, 80, BLUE, '往身体这边横拉', 20, 70) +
      tag(20, 150, '另一只手、脚也要撑住，防止开门'),
    gaston: () => wallBg() + `<rect x="60" y="20" width="22" height="120" rx="6" fill="${HOLD}" stroke="${HOLD_D}"/>` +
      `<rect x="82" y="44" width="12" height="70" rx="6" fill="${HOT}"/>` + arrow(110, 80, 170, 80, BLUE, '手肘朝外，往外撑开', 120, 66) +
      tag(110, 150, '有效范围≈肩宽；挺胸转体'),
    undercling: () => wallBg() + `<path d="M60 70 L180 70 L170 50 L70 50Z" fill="${HOLD}" stroke="${HOLD_D}"/>` +
      `<rect x="90" y="70" width="60" height="9" rx="4" fill="${HOT}"/>` + arrow(120, 130, 120, 92, BLUE, '掌心朝上往上提', 130, 112) +
      tag(20, 150, '有效高度：胸口到膝盖之间'),
    thumb_assist: () => wallBg() + `<rect x="60" y="60" width="120" height="22" rx="6" fill="${HOLD}" stroke="${HOLD_D}"/>` +
      `<circle cx="120" cy="90" r="7" fill="${HOT}"/>` + arrow(120, 140, 120, 102, BLUE, '拇指从下往上顶', 130, 130),
    figure4: () => wallBg() + tag(20, 30, '一条腿挂在支撑手的手肘上') + `<circle cx="80" cy="70" r="12" fill="${HOLD}"/>` +
      `<line x1="80" y1="70" x2="110" y2="110" stroke="${SKIN}" stroke-width="9" stroke-linecap="round"/>` +
      `<path d="M60 130 Q100 96 140 110" stroke="#f2c230" stroke-width="14" fill="none" stroke-linecap="round"/>` +
      arrow(160, 100, 190, 40, HOT, '抓取手往上', 150, 30),
    // ---- 脚 ----
    edging: () => wallBg() + `<rect x="160" y="96" width="80" height="12" fill="#3fae6a" stroke="#24804a"/>` + shoeSide(116, 96, 0) +
      `<circle cx="154" cy="96" r="6" fill="${HOT}"/>` + arrow(70, 120, 70, 92, BLUE, '脚跟往上提', 20, 140) + tag(20, 30, '脚点<2cm：脚趾收紧、鞋缘卡住'),
    smearing: () => `<rect width="240" height="160" fill="#fff"/><polygon points="0,160 240,160 240,40" fill="${WALL}" stroke="${WALL_D}"/>` +
      shoeSide(140, 104, -27) +
      arrow(150, 60, 160, 92, BLUE, '用力往斜面压', 120, 40) + tag(14, 30, '靠鞋底摩擦，压得越用力越不滑'),
    smedging: () => wallBg() + `<rect x="180" y="0" width="60" height="160" fill="#b9a68e"/><rect x="164" y="98" width="16" height="12" fill="#3fae6a"/>` +
      shoeSide(130, 96, -12) + `<path d="M120 130 A26 26 0 0 0 152 128" stroke="#e03131" stroke-width="3" fill="none" marker-end="url(#g_arrow_r)"/>` +
      tag(10, 30, '贴着墙往下滑、边扭边踩，让岩点角陷进鞋底'),
    front_edge: () => wallBg() + `<rect x="170" y="90" width="70" height="12" fill="#3fae6a"/>` + shoeSide(126, 90, 0) +
      `<path d="M160 86 L170 90" stroke="${HOT}" stroke-width="7" stroke-linecap="round"/>` + tag(14, 30, '用鞋尖附近的侧缘，脚趾缩起来'),
    inside_edge: () => `<rect width="240" height="160" fill="${WALL}"/><rect x="40" y="96" width="160" height="12" fill="#3fae6a"/>` +
      `<g transform="translate(120,90) rotate(90)"><path d="M-40 -16 Q-46 0 -40 16 L30 18 Q48 14 48 0 Q48 -14 30 -18Z" fill="${SHOE}"/></g>` +
      `<circle cx="104" cy="98" r="9" fill="${HOT}"/>` + tag(14, 30, '大拇趾根部（拇趾球）踩在岩点上') + arrow(200, 140, 200, 112, BLUE, '脚跟提起、膝盖下压', 60, 150),
    outside_edge: () => `<rect width="240" height="160" fill="${WALL}"/><rect x="40" y="96" width="160" height="12" fill="#3fae6a"/>` +
      `<g transform="translate(120,90) rotate(90)"><path d="M-40 -16 Q-46 0 -40 16 L30 18 Q48 14 48 0 Q48 -14 30 -18Z" fill="${SHOE}"/></g>` +
      `<circle cx="136" cy="98" r="9" fill="${HOT}"/>` + tag(14, 30, '小趾侧（小趾球）踩，腰更容易贴墙'),
    back_step: () => wallBg() + tag(14, 30, '两脚左右对蹬，后脚用外侧踩在身后的点') + arrow(110, 110, 50, 110, BLUE, '往后蹬', 30, 100) + arrow(130, 110, 190, 110, BLUE, '往前蹬', 160, 100),
    foot_pocket: () => wallBg() + `<rect x="150" y="70" width="90" height="50" rx="14" fill="#3fae6a"/><ellipse cx="170" cy="96" rx="16" ry="10" fill="#1f5f37"/>` +
      shoeSide(118, 98, 0) + tag(14, 30, '鞋尖扣进去，洞大时扭转卡紧'),
    heel_hook: () => `<rect width="240" height="160" fill="${WALL}"/><rect x="0" y="0" width="240" height="26" fill="${WALL_D}"/>` +
      `<rect x="120" y="26" width="70" height="20" rx="6" fill="${HOLD}"/>` + shoeSide(150, 64, 180, 1) + `<circle cx="168" cy="50" r="7" fill="${HOT}"/>` +
      arrow(100, 80, 100, 120, BLUE, '脚跟往下拉→腰往上提', 20, 140) + tag(14, 18, '前倾壁 / 屋顶'),
    toe_hook: () => `<rect width="240" height="160" fill="${WALL}"/><rect x="0" y="0" width="240" height="26" fill="${WALL_D}"/>` +
      `<rect x="120" y="26" width="70" height="20" rx="6" fill="${HOLD}"/>` + shoeSide(140, 58, 0) + `<circle cx="150" cy="46" r="7" fill="${HOT}"/>` +
      arrow(80, 120, 80, 80, BLUE, '腿伸直，用脚背往上勾', 14, 146),
    side_hook: () => wallBg() + `<rect x="170" y="10" width="24" height="140" fill="${WALL_D}"/>` + shoeSide(130, 80, 0) +
      `<circle cx="168" cy="78" r="7" fill="${HOT}"/>` + arrow(120, 110, 70, 110, BLUE, '鞋内侧往身体方向拉', 14, 140),
    foot_swap: () => wallBg() + `<rect x="80" y="110" width="80" height="12" fill="#3fae6a"/>` + shoeSide(110, 108, 0) + shoeSide(122, 86, -8) +
      arrow(70, 104, 30, 104, '#e03131', '下面的脚抽出', 10, 92) + tag(14, 30, '上面的脚贴近叠上，下面的脚快速抽离'),
    // ---- 塞法 ----
    hand_jam: () => `<rect width="240" height="160" fill="${WALL}"/><rect x="100" y="0" width="40" height="160" fill="#3d4a5c"/>` +
      `<rect x="104" y="40" width="32" height="70" rx="10" fill="${SKIN}" stroke="${SKIN_D}"/>` + arrow(96, 76, 60, 76, BLUE, '撑', 50, 66) + arrow(144, 76, 180, 76, BLUE, '撑', 180, 66) +
      tag(14, 150, '拇指根和手背左右挤，产生反作用力'),
    finger_jam: () => `<rect width="240" height="160" fill="${WALL}"/><path d="M118 0 L114 160 L126 160 L122 0Z" fill="#3d4a5c"/>` +
      `<rect x="112" y="60" width="16" height="40" rx="6" fill="${SKIN}"/>` + `<path d="M100 120 A24 24 0 0 0 140 120" stroke="#e03131" stroke-width="3" fill="none" marker-end="url(#g_arrow_r)"/>` +
      tag(14, 150, '拇指朝下插入，扭转卡住'),
    fist_jam: () => `<rect width="240" height="160" fill="${WALL}"/><rect x="92" y="0" width="56" height="160" fill="#3d4a5c"/>` +
      `<rect x="96" y="56" width="48" height="44" rx="12" fill="${SKIN}" stroke="${SKIN_D}"/>` + arrow(88, 78, 52, 78, BLUE, '', 0, 0) + arrow(152, 78, 188, 78, BLUE, '', 0, 0) +
      tag(14, 150, '握拳卡在裂缝最窄处'),
    foot_jam: () => `<rect width="240" height="160" fill="${WALL}"/><rect x="104" y="0" width="32" height="160" fill="#3d4a5c"/>` +
      `<g transform="translate(120,90) rotate(-80)"><path d="M-40 -12 Q-44 0 -40 12 L30 12 Q44 10 44 0 Q44 -10 30 -12Z" fill="${SHOE}"/></g>` +
      `<path d="M90 130 A30 30 0 0 0 150 130" stroke="#e03131" stroke-width="3" fill="none" marker-end="url(#g_arrow_r)"/>` + tag(14, 30, '小趾侧朝下放进去，再往内转卡死'),
    thin_hand: () => `<rect width="240" height="160" fill="${WALL}"/><rect x="106" y="0" width="22" height="160" fill="#3d4a5c"/>` +
      `<rect x="108" y="44" width="18" height="46" rx="6" fill="${SKIN}"/><ellipse cx="96" cy="84" rx="16" ry="9" fill="${SKIN}" stroke="${SKIN_D}"/>` +
      `<circle cx="104" cy="84" r="6" fill="${HOT}"/>` + `<path d="M84 118 A26 26 0 0 0 140 116" stroke="#e03131" stroke-width="3" fill="none" marker-end="url(#g_arrow_r)"/>` +
      tag(140, 40, '手指在裂缝里') + tag(14, 150, '拇指在外面，指腹给反作用力；手掌扭转锁住'),
    ring_lock: () => `<rect width="240" height="160" fill="${WALL}"/><rect x="100" y="0" width="30" height="160" fill="#3d4a5c"/>` +
      `<ellipse cx="115" cy="78" rx="13" ry="22" fill="none" stroke="${SKIN}" stroke-width="9"/><circle cx="115" cy="62" r="6" fill="${HOT}"/>` +
      `<path d="M78 118 A30 30 0 0 0 150 118" stroke="#e03131" stroke-width="3" fill="none" marker-end="url(#g_arrow_r)"/>` +
      tag(140, 40, '食指、中指压在拇指指甲上') + tag(14, 150, '拇指和手指围成一个环，像岩楔一样扭转卡住'),
    stack: () => `<rect width="240" height="160" fill="${WALL}"/><rect x="74" y="0" width="92" height="160" fill="#3d4a5c"/>` +
      `<rect x="78" y="48" width="22" height="66" rx="8" fill="${SKIN}" stroke="${SKIN_D}"/><rect x="102" y="54" width="60" height="54" rx="14" fill="${SKIN}" stroke="${SKIN_D}"/>` +
      `<circle cx="104" cy="80" r="6" fill="${HOT}"/>` + arrow(70, 80, 34, 80, BLUE, '撑', 30, 70) + arrow(170, 80, 206, 80, BLUE, '撑', 200, 70) +
      tag(14, 150, '手掌 + 拳头叠起来，增加厚度（约 10～15cm 宽）'),
    arm_lock: () => `<rect width="240" height="160" fill="${WALL}"/><rect x="70" y="0" width="100" height="160" fill="#3d4a5c"/>` +
      `<path d="M90 140 L104 52 L150 92" fill="none" stroke="${SKIN}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>` +
      `<circle cx="104" cy="52" r="7" fill="${HOT}"/><circle cx="150" cy="92" r="7" fill="${HOT}"/>` +
      arrow(104, 44, 104, 16, BLUE, '肩、上臂顶后墙', 112, 20) + arrow(150, 100, 150, 136, BLUE, '手掌压前墙', 156, 134) +
      tag(10, 156, '手肘整个折起来塞进去，像鸡翅膀'),
    t_stack: () => `<rect width="240" height="160" fill="${WALL}"/><rect x="70" y="0" width="100" height="160" fill="#3d4a5c"/>` +
      `<g transform="translate(120,96)"><rect x="-44" y="-10" width="88" height="20" rx="9" fill="${SHOE}"/><rect x="-10" y="-46" width="20" height="44" rx="9" fill="#4a5378"/></g>` +
      arrow(64, 96, 30, 96, BLUE, '', 0, 0) + arrow(176, 96, 210, 96, BLUE, '', 0, 0) +
      tag(14, 30, '一只脚竖、一只脚横，成「T」字') + tag(14, 150, '双脚往两侧撑（约两个鞋宽的裂缝）'),
    back_foot: () => `<rect width="240" height="160" fill="${WALL}"/><rect x="60" y="0" width="120" height="160" fill="#3d4a5c"/>` +
      `<rect x="60" y="0" width="10" height="160" fill="${WALL_D}"/><rect x="170" y="0" width="10" height="160" fill="${WALL_D}"/>` +
      `<path d="M74 40 L80 100 L150 108 L166 140" fill="none" stroke="${SKIN}" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>` +
      `<circle cx="74" cy="60" r="7" fill="${HOT}"/><circle cx="166" cy="140" r="7" fill="${HOT}"/>` +
      arrow(84, 56, 110, 56, BLUE, '背往后靠', 90, 46) + arrow(156, 132, 132, 118, BLUE, '', 0, 0) + tag(130, 30, '脚往前蹬') +
      tag(14, 156, '烟囱：背靠一面墙，脚（和手）推另一面'),
    crack_chart: () => `<rect width="240" height="160" fill="${WALL}"/>` +
      [['手指', 4], ['薄手', 8], ['手掌', 13], ['拳头', 18], ['堆叠', 26], ['手臂', 34], ['烟囱', 46]].map(([t, w], i) =>
        `<rect x="${12 + i * 32}" y="${110 - w * 1.6}" width="22" height="${w * 1.6}" rx="3" fill="#3d4a5c"/><text x="${23 + i * 32}" y="128" class="g-lab" text-anchor="middle" fill="#3d4a5c">${t}</text>`).join('') +
      tag(12, 150, '裂缝越宽，塞进去的部位越大 →'),
    overhang_load: () => wallBg() + `<line x1="40" y1="140" x2="40" y2="20" stroke="${WALL_D}" stroke-dasharray="4 4"/>` +
      `<line x1="40" y1="140" x2="190" y2="40" stroke="#5c6b78" stroke-width="5"/>` + `<circle cx="40" cy="140" r="6" fill="${HOT}"/>` +
      `<line x1="46" y1="134" x2="150" y2="62" stroke="${SKIN_D}" stroke-width="10" stroke-linecap="round"/>` + `<circle cx="150" cy="62" r="7" fill="${HOT}"/>` +
      arrow(100, 100, 100, 148, '#e03131', '体重', 106, 146) + tag(10, 20, '支点＝脚尖') + tag(120, 30, '手要负担的部分'),
    levers: () => wallBg() + [0, 1, 2].map((i) => {
      const y = 36 + i * 46, pos = [[20, 60, 100], [20, 100, 60], [60, 20, 100]][i];
      const fx = 30 + pos[0], rx = 30 + pos[1], ex = 30 + pos[2];
      return `<line x1="30" y1="${y}" x2="150" y2="${y}" stroke="#5c6b78" stroke-width="5"/>` +
        `<polygon points="${fx},${y + 3} ${fx - 7},${y + 14} ${fx + 7},${y + 14}" fill="${HOT}"/>` +
        arrow(rx, y - 26, rx, y - 6, '#e03131') + arrow(ex, y + 26, ex, y + 6, BLUE) +
        `<text x="160" y="${y + 4}" class="g-tag">第 ${i + 1} 类</text>`;
    }).join('') + tag(14, 156, '▲支点  红＝抗力（体重）  蓝＝施力（肌肉）'),
    daily: () => `<rect width="240" height="160" fill="#f3efe6"/><rect x="10" y="96" width="70" height="8" fill="#a68a64"/><rect x="16" y="104" width="6" height="40" fill="#a68a64"/>` +
      `<line x1="140" y1="20" x2="140" y2="150" stroke="#e03131" stroke-dasharray="4 4"/>` +
      `<circle cx="120" cy="44" r="10" fill="${SKIN}"/><path d="M122 54 L140 88 L170 96" fill="none" stroke="#e8594f" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>` +
      `<path d="M118 60 L70 84" stroke="${SKIN}" stroke-width="7" stroke-linecap="round"/><path d="M140 92 L138 150" stroke="#2f3552" stroke-width="9" stroke-linecap="round"/>` +
      `<path d="M168 96 L214 112" stroke="#2f3552" stroke-width="9" stroke-linecap="round"/>` +
      arrow(84, 30, 54, 30, '#e03131', '手往前伸', 50, 22) + arrow(180, 70, 214, 70, BLUE, '腿往后当配重', 150, 62),
    pump: () => wallBg() + `<path d="M30 110 Q80 70 130 84 Q170 92 210 70" fill="none" stroke="${SKIN}" stroke-width="30" stroke-linecap="round"/>` +
      `<path d="M60 96 Q90 70 128 80" fill="none" stroke="#e03131" stroke-width="10" stroke-linecap="round" opacity=".55"/>` +
      `<text x="70" y="62" class="g-lab" fill="#e03131">屈指肌</text>` + tag(14, 150, '代谢物变多 → 肌肉吸水 → 又硬又肿'),
    fatigue: () => wallBg() + [['5 秒', 60, '#2f9e44'], ['8～10 秒', 110, '#e8a317'], ['更久', 170, '#e03131']].map(([t, w, c], i) =>
      `<rect x="20" y="${30 + i * 36}" width="${w}" height="22" rx="6" fill="${c}"/><text x="${28 + w}" y="${46 + i * 36}" class="g-tag">${t}</text>`).join('') +
      tag(14, 150, '最大力抓点：5 秒开始疲劳，8～10 秒前臂肿胀'),
  };

  /* ---------- 卡片数据（文字为改写，不是原文） ---------- */
  const CARDS = [
    { cat: '手指与前臂', items: [
      { id: 'anatomy', name: '握力来自前臂', en: 'Finger flexors', svg: null,
        scene: '所有抓法的基础。', how: '手指几乎没有大块肌肉：弯曲手指的是前臂内侧的屈指肌，靠肌腱拉动指骨；肌腱被一圈圈像滑轮的腱鞘固定在手指上。',
        force: '屈指肌收缩 → 肌腱被拉 → 手指往掌心弯。', body: '抓点的四个原则：按岩点形状选抓法；善用手指、手掌的摩擦；尽量省力；配合重心和手脚动作。',
        note: '前臂一僵（爆前臂）就抓不住了，所以「省力的抓法」等于「爬得更远」。' },
    ] },
    { cat: '抓法', items: [
      { id: 'full_crimp', name: '封闭式（抠）', en: 'Full Crimp', scene: '很窄、很浅的小边缘。',
        how: '四指并拢，从上方按住边缘，第二关节高高拱起；拇指压在食指上锁紧。', force: '手指往下、往身体拉；拇指往下压食指。',
        body: '让手指沿墙面从上往下「滑落」到岩点上，软组织被压实就不会走位。', note: '抓得最牢，但力臂约 6cm，手指关节和肌腱负担最大，容易受伤。', widget: 'crimp' },
      { id: 'half_crimp', name: '半开式（搭）', en: 'Half Crimp', scene: '比较平、厚度约 1cm 以上的岩点。',
        how: '手指和墙面大致成直角，拇指压在食指上或贴在旁边。', force: '往下拉。',
        body: '力量不够时手肘会自然抬起：以肩为轴、用背阔肌把上臂往下压，可以减轻手指负担。', note: '最常用的折衷抓法。', widget: 'crimp' },
      { id: 'open_hand', name: '开掌式（勾）', en: 'Open Hand', scene: '圆一点、有弧度的岩点。',
        how: '用指腹的「面」勾住岩点，手指比较直，掌心贴向墙。', force: '往下拉，靠摩擦。',
        body: '初学者会觉得像要滑掉而不敢用，熟练后会越用越多。', note: '力臂约 3.5cm：同样负重 30kg，封闭式要 180kg·cm、开掌式只要 105kg·cm，约省 40%。', widget: 'crimp' },
      { id: 'sloper', name: '摩擦式（扒）', en: 'Palming / Sloper', scene: '半球形大圆点、斜面点。',
        how: '五指和整个手掌大幅张开包住岩点，不靠握力，靠整只手的摩擦。', force: '手腕往下弯、手掌往下压。',
        body: '重心要移到岩点正下方；往上移动时手的角度不能变，慢不了就一口气拉上去。', note: '一滑摩擦就没了。有凹处时可以把指尖集中抠进去。' },
      { id: 'pinch', name: '捏', en: 'Pinch', scene: '长条形、可以从两侧夹的岩点。',
        how: '四指在一侧、拇指在另一侧对夹；先捏在偏高处，再转腕往下坐，把掌根锁紧。', force: '拇指和四指相向夹紧。',
        body: '把虎口贴住岩点，多一份摩擦。', note: '拇指力量是关键。' },
      { id: 'pocket', name: '扣（指洞）', en: 'Pocket', scene: '洞状岩点。',
        how: '放进拇指以外的手指；洞深就用指腹贴进去，洞浅就改用抠或勾。', force: '往下拉。',
        body: '两指常用中指 + 无名指（关节高度一样，较稳）；食指 + 中指最有力但留给反撑时用。', note: '手指强度：中指 > 食指 > 小指 > 无名指。单指扣很伤肌腱，要特别小心。' },
      { id: 'wrap', name: '包', en: 'Wrap / Jug', scene: '像门把手的大把手点。',
        how: '以指根（第三关节）挂住，掌心像反手一样朝向自己。', force: '往身体方向拉。',
        body: '掌心相对（包）比掌心朝下（抠）能往后拉得更远。手臂微弯约 90° 时肌力最大（打直约 50%、弯过头约 70%）。', note: '力臂短、最不容易累——就像反手引体向上比正手轻松。' },
      { id: 'overhand', name: '正抓（下压）', en: 'Overhand / Press', scene: '身体已经爬到岩点上方时。',
        how: '掌心朝下，拇指和食指侧贴墙，从上往下压。', force: '往下推，把身体撑上去。', body: '常用在下压（Mantle）的最后阶段。', note: '' },
      { id: 'tree_finger', name: '勾爪扣', en: 'Tree Finger', scene: '形状特别、不规则的岩点。',
        how: '像抓棒球一样，食指、中指、拇指三点分开抓，无名指贴在旁边。', force: '三点一起往下拉。', body: '三点分开能固定手腕，像三脚椅一样不容易倒。', note: '' },
      { id: 'side_pull', name: '侧拉', en: 'Side Pull', scene: '竖直的长条岩点、内角。',
        how: '手从侧面抓住竖边，指腹和掌根夹紧。', force: '横向拉向身体。',
        body: '陡壁上容易开门旋转：另一只手和脚也要撑好，或用脚勾住。', note: '配合 3-5 的「侧身」使用最有效。' },
      { id: 'gaston', name: '反撑', en: 'Gaston', scene: '在身体侧前方、朝外的竖边。',
        how: '拇指朝下、手肘朝外，像要把电梯门撑开。', force: '把岩点往外推开。',
        body: '比拉更重要的是转体：让靠近下一个岩点那一侧的胸口贴近墙，转身的力会自然加到手上。', note: '有效范围大约只有肩宽；前倾壁上很难出力。名字来自法国攀岩家 Gaston Rébuffat。' },
      { id: 'undercling', name: '倒抓', en: 'Undercling', scene: '开口朝下的岩点（逆切点）。',
        how: '手指从下面勾住，掌心朝上；同时用到屈指肌和肱二头肌。', force: '往上提、手肘往后拉。',
        body: '有效高度在胸口到膝盖之间：抓到高处的倒抓点后要尽快把脚抬上来；手肘贴住身体、转腰让身体贴墙。', note: '手低于膝盖时腰会掉、体重全压到手上。' },
      { id: 'thumb_assist', name: '支撑力的辅助', en: 'Thumb / Knee / Push', scene: '岩点不好抓时。',
        how: '拇指从下往上顶住岩点；或把膝盖压在支撑手的手背上；或抬起手肘，把「拉」变成「压」。', force: '加一个往上顶或往下压的力。',
        body: '在拉的动作里加入推的成分，能抑制疲劳。', note: '' },
      { id: 'figure4', name: '4 字式', en: 'Figure-4', scene: '下一个点太远、又没有脚点、不适合跳的时候。',
        how: '把一条腿挂在支撑手的手肘上，用手臂当脚点；另一条腿挂旗平衡，背打直、抓取手那侧的肩膀往上抬。', force: '挂上去的腿往下压，把身体往上送。',
        body: '腰一掉就出不来。', note: '失误率高，当成最后手段，而且下一个点要够好。' },
    ] },
    { cat: '基本脚法', items: [
      { id: 'edging', name: '顶', en: 'Edging', scene: '窄小的边缘、台阶。',
        how: '脚趾收紧、脚跟提起，用鞋缘卡在边缘上；脚往外扭一点「塞」进去，重心会倒向墙。', force: '往下踩、脚跟往上。',
        body: '踩之前一定要看：真正好用的脚点可能只有 1mm²，一开始就要踩在最好的位置。', note: '鞋底越硬越顶得住、但摩擦越低。' },
      { id: 'smearing', name: '摩', en: 'Smearing', scene: '没有脚点的斜面、墙面。',
        how: '把鞋底用力压在墙面上，靠摩擦支撑。', force: '往斜面压——压得越用力，摩擦越大。',
        body: '尽量把体重放到脚上。找斜度比较缓的小凹处、皱褶来踩：摩擦和接触面积无关。', note: '岩鞋对岩面的静摩擦系数约 1.4，所以约 55° 以内的斜面不用手也站得住。一滑就停不下来，因为动摩擦比静摩擦小。', widget: 'smear' },
      { id: 'smedging', name: '蹭', en: 'Smedging', scene: '窄而凸出、硬顶会滑掉的脚点。',
        how: '鞋子贴着墙往下滑来踩，一边扭（脚跟外转）一边卡住，让岩点的角陷进鞋底。', force: '往下 + 扭转。', body: '「顶」和「摩」的结合。', note: '' },
    ] },
    { cat: '踩法', items: [
      { id: 'front_edge', name: '正踩', en: 'Front Edge', scene: '脚点越小、难度越高时的首选。',
        how: '用鞋尖附近的侧缘踩（内正踩或外正踩），注意力放在鞋缘上；脚趾缩起来。', force: '往下踩。',
        body: '', note: '脚趾伸直力臂约 5cm（60kg → 300kg·cm），缩起来约 4cm（240kg·cm），脚趾关节省力约 20%。' },
      { id: 'inside_edge', name: '内侧踩', en: 'Inside Edge', scene: '最常用、最好出力的踩法（对角支撑、内对角）。',
        how: '用大拇趾根部（拇趾球）踩在岩点最好施力的位置。', force: '往下踩，脚跟往上提。',
        body: '往上爬＝把脚跟提起：脚跟高、膝盖往下，腰往脚的方向压，就能一口气站上去。', note: '只用脚尖踩太浅，脚跟会掉、体重落不到脚上。' },
      { id: 'outside_edge', name: '外侧踩', en: 'Outside Edge', scene: '外对角、小幅度的垂膝。',
        how: '用小趾侧（小趾球）踩，脚点小时脚趾像抓东西一样收。', force: '往下踩。',
        body: '比内侧踩更容易让腰贴近墙面。', note: '比内侧踩容易滑，踩之前看清楚。' },
      { id: 'back_step', name: '侧踩', en: 'Back Step', scene: '侧身、垂膝式。',
        how: '身体侧过来，后脚用外侧踩在身后的点上，两脚左右对蹬。', force: '两脚往相反方向蹬（作用力与反作用力）。',
        body: '', note: '脚在身后看不到：往上前一定要先确认位置。' },
      { id: 'foot_pocket', name: '扣（脚）', en: 'Toe Pocket', scene: '洞状脚点。',
        how: '用鞋尖勾进洞里；洞大就扭转鞋子卡紧。', force: '往下踩。', body: '扣太紧时，身体一上移脚的角度会变而滑掉。', note: '' },
      { id: 'foot_swap', name: '换脚', en: 'Foot Swap', scene: '两只脚要轮流用同一个脚点时。',
        how: '上面的脚贴得很近叠上，下面的脚迅速抽出（像敲敲乐积木）。', force: '—',
        body: '双手要尽量张开、抓远一点，重心维持在中间。', note: '动作太大脚会滑掉。' },
    ] },
    { cat: '挂勾', items: [
      { id: 'heel_hook', name: '挂脚（脚跟）', en: 'Heel Hook', scene: '前倾壁、屋顶；脚点在腰附近或更高时。',
        how: '把鞋的脚跟挂在岩点上，由上往下拉。', force: '脚跟往下拉，把腰往上提。',
        body: '重心偏向挂脚那条腿；腰确实上来了再伸手，最后用肩膀往上抬而不是手拉。', note: '手的负担排名：调节平衡 > 高跨步 > 垂膝 > 挂脚（最省手）。手和脚在重心以上是「拉」，以下是「推」。', lesson: 'hook' },
      { id: 'toe_hook', name: '勾脚（脚背）', en: 'Toe Hook', scene: '屋顶边缘、侧边的大岩点。',
        how: '用脚背（鞋面）挂住岩点，整条腿伸直往上勾。', force: '脚背往上、往身体方向拉。', body: '腿弯着不好出力，要伸直。', note: '效果看鞋面橡胶多寡。' },
      { id: 'side_hook', name: '侧挂', en: 'Side Hook', scene: '角落、竖直长条点。',
        how: '用鞋内侧（或外侧）抵住，往身体方向拉。', force: '横向拉向身体。', body: '主要用来取得平衡，另一只脚要踩在附近。', note: '' },
    ] },
    { cat: '塞法（裂缝）', items: [
      { id: 'hand_jam', name: '手掌塞', en: 'Hand Jam', scene: '比手掌略宽的裂缝（最常见）。',
        how: '拇指根部的肉压一侧，手背顶另一侧，左右挤住。', force: '向两侧撑开（反作用力）。', body: '左右手交互往上塞，体重主要交给脚。', note: '手太小时把拇指往掌心弯，让手变厚。' },
      { id: 'finger_jam', name: '手指塞', en: 'Finger Jam', scene: '只放得进手指的薄裂缝。',
        how: '以拇指朝下的反手为主，手指插到底后扭转卡住。', force: '扭转。', body: '', note: '' },
      { id: 'fist_jam', name: '拳头塞', en: 'Fist Jam', scene: '拳头宽的裂缝。',
        how: '握拳卡在裂缝最窄的地方；拳头太小就把拇指伸出来调宽度。', force: '左右卡住。', body: '', note: '更宽的裂缝要双手叠起来（堆叠）、手臂锁定（鸡翅膀），甚至背和脚撑（烟囱）。' },
      { id: 'foot_jam', name: '脚塞', en: 'Foot Jam', scene: '裂缝攀爬的主要推力。',
        how: '小趾那侧朝下把脚放进去，再往内转卡死。', force: '扭转 + 往下踩。', body: '脚的推力比手强，手只负责不让身体往后倒。', note: '会痛，可以穿大一号的鞋。' },
      { id: 'thin_hand', name: '薄手', en: 'Thin Hand', scene: '手指放得进、手掌放不进的裂缝（约 1.5～2.5cm）。',
        how: '手竖着插进去，手指在裂缝里、拇指留在外面；除了弯手指，还要把手掌扭转锁住。', force: '扭转；拇指指腹顶住边缘，给反作用力。',
        body: '上面的手拇指朝下、下面的手拇指朝上，两手不交叉、轮流往上。', note: '理想的分工：脚塞负责往上推，手只负责不让身体离开墙面。' },
      { id: 'ring_lock', name: '环扣', en: 'Ring Lock', scene: '比薄手再宽一点的裂缝。',
        how: '食指、中指的指腹压在拇指指甲上，拇指和手指围成一个环；手指只放到第二关节左右。', force: '像岩楔（Nut）一样在裂缝里扭转卡住。',
        body: '可以左右轮流，也可以交叉，哪个顺就用哪个；也能勾住裂缝的边缘。', note: '' },
      { id: 'stack', name: '堆叠', en: 'Leavittation', scene: '比拳头还宽、单手会滑掉的裂缝（约 10～15cm）。',
        how: '两只手叠在一起增加厚度：手掌 + 手掌、手掌 + 拳头、拳头 + 拳头。', force: '向两侧撑开。',
        body: '双手没办法轮流往上，前进主要靠脚；堆叠的手主要是用来撑住、让身体往上拉。', note: '名称来自加州的攀岩者 Randy Leavitt。' },
      { id: 'arm_lock', name: '单臂锁定', en: 'Arm Lock / Chicken Wing', scene: '塞不进半个身体、又比拳头宽很多的裂缝（约 20～30cm）。',
        how: '手肘整个折起来塞进裂缝：肩膀和上臂顶住后面的墙，手掌压住前面的墙。', force: '上下（前后）对撑，产生反作用力。',
        body: '另一只手掌心朝外压在裂缝边缘稳住，或推着让身体往上；靠腿的屈伸前进。', note: '裂缝再窄一点时，改成手臂伸直的「臂撑（Arm Bar）」。' },
      { id: 't_stack', name: 'T 字脚', en: 'T Stack', scene: '脚横放进去还是会滑、约两个鞋宽的裂缝。',
        how: '一只脚竖放（沿着裂缝）、另一只横放，两脚成「T」字。', force: '两脚往前后两面墙撑开。',
        body: '双脚没办法轮流往上：手撑住时，两只脚一起往上收。', note: '' },
      { id: 'back_foot', name: '背与脚', en: 'Back & Foot', scene: '整个身体都能轻松钻进去的大裂缝（烟囱）。',
        how: '背靠住一面墙，脚（和手）推另一面墙。', force: '背、腰、手、脚，每一对都往前后两面墙撑开。',
        body: '一点一点地挪：手脚推、背往上滑。', note: '很省力，但做这个动作时没办法放保护。' },
      { id: 'crack_chart', name: '裂缝宽度对照', en: 'Crack Width', scene: '看裂缝宽度，选塞进去的部位。',
        how: '手：手指 → 薄手 → 手掌 → 拳头 → 堆叠 → 手臂锁定 → 半个身体 → 烟囱（整个身体）。', force: '脚：脚尖 → 脚跟与脚尖 → 整只小腿 → T 字脚 → 背与脚。',
        body: '', note: '宽度是大约的范围：手的大小不同，适合的裂缝也不同。', labels: ['用途', '手的顺序（由窄到宽）', '脚的顺序（由窄到宽）', ''] },
    ] },
    { cat: '原理与专栏', ref: '第 1 章专栏、3-1、第 3 章专栏', items: [
      { id: 'overhang_load', name: '前倾壁上手的负担', en: '3-1 ②', widget: 'overhang', lesson: 'movebase',
        scene: '墙越陡，就算平衡完美，手也要负担很多体重。', how: '以脚尖为支点，身体像一块板子：比脚尖高的部分越多，手要负担的就越多。手臂的长度会让身体比墙更倾斜。',
        force: '体重 50kg 时：垂直 7kg、20° 16kg、45° 25kg、60° 32kg、70° 50kg（全部体重）。', body: '目标：让手只负担脚负担不了的部分——找到最好的平衡。',
        note: '超过 45°，手就要负担一半以上的体重。这些是物理上的估算，实际感受还会随岩点形状改变。', labels: ['重点', '原理', '教本的估算', '怎么做'] },
      { id: 'levers', name: '肌肉与关节的杠杆', en: '第 1 章专栏', lesson: 'torque',
        scene: '肌肉只会收缩，靠骨骼和关节组成杠杆，才能发出比负重还大的力。', how: '第 1 类：支点在中间。例：屋顶上反手挂住岩点，以手肘为支点。\n第 2 类：抗力在中间。例：踩脚点，脚尖是支点，小腿肌收缩。\n第 3 类：施力在中间。例：侧拉、反撑，手肘是支点，前臂肌收缩。',
        force: '身体里面（肌肉、关节）和外面（身体、岩壁）都按杠杆在运作。', body: '所以符合力矩原理的手法脚法，就是最省力的手法脚法（见 1-3 力矩）。', note: '', labels: ['重点', '三类杠杆', '结论', '和攀岩的关系'] },
      { id: 'daily', name: '日常生活与手法脚法', en: '第 2 章专栏', lesson: 'balance',
        scene: '伸手去拿桌子另一头的东西时，腰会自然往后移，让上下半身平衡；要拿更远的东西，腿还会往后抬当配重。', how: '这就是攀岩的「调节平衡」：手往一边伸，腰和腿往另一边去。',
        force: '腰不动就伸手，要嘛够不到，要嘛得扶着桌子。', body: '在可能会掉的墙上，初学者心理上不习惯，做不出平常就会的动作——所以要刻意练习。', note: '', labels: ['生活中的例子', '在攀岩里', '做错的话', '为什么要练'] },
      { id: 'pump', name: '前臂肿胀的原因', en: '第 3 章专栏', lesson: 'angles',
        scene: '爬一阵子以后，前臂又硬又肿（爆前臂），手就抓不住了。', how: '活动时代谢物浓度升高，肌肉会从周围组织吸水来稀释，结果整块肌肉「灌满了水」。',
        force: '变硬只是疲劳的指标，不是疲劳本身——但还是要尽量避免。', body: '', note: '', labels: ['现象', '原因', '要知道的是', ''] },
      { id: 'fatigue', name: '如何避免肌肉疲劳', en: '第 3 章专栏', lesson: 'angles',
        scene: '重量训练能练出不容易变硬的肌肉；技术上则有四个方法。', how: '① 维持血液循环：用到 50% 以上的肌力时血管会被压迫，80% 以上血会被挤出去。不要长时间弯着手臂吊着。\n② 出力只有两种：瞬间爆发，或缓慢细腻。\n③ 只有 5 秒：用最大支撑力超过 5 秒就会快速疲劳，要尽快换下一个动作或换手。\n④ 不要连续用屈指肌：最大力连续 8～10 秒就会肿胀。',
        force: '两只手轮流各休息几秒，能撑得久 2～3 倍。', body: '在双手能轮替的地方休息；手臂伸直吊着，比弯着省力。', note: '', labels: ['重点', '四个方法', '数字', '实际应用'] },
    ] },
  ];

  /* ---------- 小实验 ---------- */
  const WIDGETS = {
    crimp: {
      title: '算算看：封闭式 vs 开掌式',
      html: `<div class="ctl"><label>手要承担的重量 <span id="wgKgV">30kg</span></label><input type="range" id="wgKg" min="5" max="60" value="30"></div>
        <div class="cmp"><div><b>封闭式</b><small>力臂 6cm</small><span id="wgA"></span></div><div><b>开掌式</b><small>力臂 3.5cm</small><span id="wgB"></span></div></div>
        <p class="note" id="wgNote"></p>`,
      update(root) {
        const kg = +root.querySelector('#wgKg').value;
        root.querySelector('#wgKgV').textContent = kg + 'kg';
        root.querySelector('#wgA').textContent = (kg * 6) + ' kg·cm';
        root.querySelector('#wgB').textContent = Math.round(kg * 3.5) + ' kg·cm';
        root.querySelector('#wgNote').textContent = `手指关节要撑住的力矩，封闭式是开掌式的 ${(6 / 3.5).toFixed(1)} 倍（拇指会帮一点忙，实际差距小一些）。`;
      },
    },
    smear: {
      title: '算算看：摩擦能撑到几度？',
      html: `<div class="ctl"><label>斜面角度 <span id="wgAngV">40°</span></label><input type="range" id="wgAng" min="0" max="80" value="40"></div>
        <svg viewBox="0 0 200 110" class="wg-svg"><polygon id="wgSlope" points="10,100 190,100 190,40" fill="#d7e8ee" stroke="#9fb8c3"/><rect id="wgShoe" width="40" height="12" rx="5" fill="#2f3552"/></svg>
        <p class="note" id="wgNote"></p>`,
      update(root) {
        const a = +root.querySelector('#wgAng').value;
        root.querySelector('#wgAngV').textContent = a + '°';
        const rad = (a * Math.PI) / 180;
        const top = 100 - Math.tan(rad) * 180;
        root.querySelector('#wgSlope').setAttribute('points', `10,100 190,100 190,${Math.max(2, top)}`);
        const sx = 100, sy = 100 - Math.tan(rad) * 90;
        root.querySelector('#wgShoe').setAttribute('transform', `translate(${sx},${sy}) rotate(${-a}) translate(-20,-12)`);
        const need = Math.tan(rad), mu = 1.4;
        root.querySelector('#wgNote').innerHTML = need <= mu
          ? `<b style="color:#2f9e44">站得住</b>：需要的摩擦系数 ${need.toFixed(2)} ≤ 岩鞋约 ${mu}。`
          : `<b style="color:#e03131">会滑下去</b>：需要的摩擦系数 ${need.toFixed(2)} > 岩鞋约 ${mu}，要找脚点或用手。`;
      },
    },
  };

  // 教本 3-1 ② 的估算（体重 50kg）
  const OVH = [[0, 7], [20, 16], [45, 25], [60, 32], [70, 50]];
  WIDGETS.overhang = {
    title: '算算看：墙越陡，手负担多少？',
    html: `<div class="ctl"><label>前倾角度 <span id="wgOvV">45°</span></label><input type="range" id="wgOv" min="0" max="70" value="45"></div>
      <div class="ctl"><label>体重 <span id="wgWV">50kg</span></label><input type="range" id="wgW" min="40" max="90" value="50"></div>
      <div class="cmp"><div><b>手的负担</b><small>两手合计</small><span id="wgOvA"></span></div><div><b>占体重</b><small>比例</small><span id="wgOvB"></span></div></div>
      <p class="note" id="wgNote"></p>`,
    update(root) {
      const a = +root.querySelector('#wgOv').value, w = +root.querySelector('#wgW').value;
      root.querySelector('#wgOvV').textContent = a + '°';
      root.querySelector('#wgWV').textContent = w + 'kg';
      let i = 0;
      while (i < OVH.length - 2 && a > OVH[i + 1][0]) i++;
      const [a0, k0] = OVH[i], [a1, k1] = OVH[i + 1];
      const pct = (k0 + ((k1 - k0) * (a - a0)) / (a1 - a0)) / 50;
      root.querySelector('#wgOvA').textContent = Math.round(pct * w) + ' kg';
      root.querySelector('#wgOvB').textContent = Math.round(pct * 100) + '%';
      root.querySelector('#wgNote').textContent = pct >= 0.5 ? '超过一半的体重压在手上：要用挂脚、垂膝、旋转来分担。' : '大部分体重还在脚上：腰贴墙、相信脚。';
    },
  };

  window.Guide = { CARDS, SVG, WIDGETS };
})();
