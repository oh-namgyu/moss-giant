// Part drawings for the torso, engine, pelvis, head and shoulders, in local joint coordinates.
function rivets(list, col = hex("#4d4a4f")) {
  return list.map((q) => ({ x: q[0], y: q[1], r: q[2] || 3.2, col }));
}
function rowR(x0, y0, x1, y1, n, r = 3.2) {
  const o = [];
  for (let i = 0; i < n; i++) {
    const t = n > 1 ? i / (n - 1) : 0;
    o.push([lerp(x0, x1, t), lerp(y0, y1, t), r]);
  }
  return rivets(o);
}
function partKit() {
  const K = rigOf(KNEEL),
    ang = (n) => K[n][2],
    S = (name, key, pts, col, o = {}) => {
      const P = Object.assign(
          {
            name,
            pts,
            col,
            seed: ((name.length * 37 + pts.length * 11) % 991) + name.charCodeAt(0),
            plates: [],
            lines: [],
            riv: [],
            d1: o.d1 || 16,
            d2: o.d2 || 6,
            rim: o.rim || 3.2,
          },
          o,
        ),
        a = ang(key);
      P.tex = agedTex(pts, col, a, o.res || 1.6, P.seed, o.lvl || 1);
      if (o.moss) P.mo = mossTex(pts, a, o.mres || 1.8, P.seed + 9, o.moss, o.fl !== false);
      P.plates.forEach((q) => {
        q.tex = agedTex(q.pts, q.col, a, o.res || 1.6, P.seed + q.pts.length, 1.1);
      });
      return P;
    };
  const panel = (v, col, rad = 10) => ({ pts: rp(v, rad), col });
  return { S, panel };
}
function buildTrunkParts(P, { S, panel }) {
  P.torso = S(
    "torso",
    "torso",
    rp(
      [
        [-60, -6],
        [-86, -70],
        [-130, -150],
        [-124, -224],
        [-72, -270],
        [40, -278],
        [102, -250],
        [128, -170],
        [104, -66],
        [72, -6],
      ],
      16,
    ),
    RC.slate,
    {
      res: 2.4,
      moss: 0.95,
      d1: 26,
      d2: 9,
      rim: 5,
      plates: [
        panel(
          [
            [-146, -244],
            [-30, -262],
            [-12, -120],
            [-54, -78],
            [-138, -92],
          ],
          RC.cream,
          9,
        ),
        panel(
          [
            [-104, -70],
            [-20, -78],
            [66, -72],
            [80, 0],
            [-76, 0],
          ],
          RC.slateD,
          8,
        ),
        panel(
          [
            [28, -228],
            [92, -222],
            [100, -128],
            [40, -118],
          ],
          RC.slateD,
          10,
        ),
      ],
      lines: [
        seg([12, -268], [24, -90]),
        seg([-14, -120], [66, -112]),
        seg([-84, -52], [64, -50]),
        seg([-82, -36], [66, -34]),
        seg([-78, -20], [70, -18]),
      ],
      riv: [
        ...rowR(-118, -232, -44, -248, 6),
        ...rowR(-114, -104, -36, -98, 5),
        ...rowR(36, -214, 88, -210, 4),
        ...rowR(44, -130, 92, -136, 4),
      ],
    },
  );
  P.pack = S(
    "pack",
    "torso",
    rp(
      [
        [92, -262],
        [150, -284],
        [206, -252],
        [220, -120],
        [196, -56],
        [118, -48],
        [94, -120],
      ],
      14,
    ),
    RC.slateD,
    {
      res: 1.6,
      moss: 1.25,
      d1: 24,
      d2: 8,
      lines: [seg([100, -196], [214, -210]), seg([104, -92], [208, -104]), seg([152, -282], [160, -52])],
      riv: [...rowR(112, -188, 204, -200, 6), ...rowR(112, -84, 198, -94, 6)],
    },
  );
  P.nozzle = S(
    "nozzle",
    "torso",
    rp(
      [
        [128, -54],
        [188, -58],
        [206, -22],
        [112, -16],
      ],
      5,
    ),
    RC.joint,
    { res: 1.4, d1: 10, d2: 4, lvl: 0.5, lines: [seg([116, -34], [202, -38]), seg([112, -20], [206, -24])] },
  );
  P.pelvis = S(
    "pelvis",
    "pelvis",
    rp(
      [
        [-80, -36],
        [76, -36],
        [90, 26],
        [44, 62],
        [-44, 62],
        [-90, 26],
      ],
      18,
    ),
    RC.slateD,
    { res: 1.4, d1: 16, lines: [seg([-60, 20], [60, 20])], riv: rowR(-62, -22, 60, -22, 6) },
  );
  P.neck = S(
    "neck",
    "head",
    rp(
      [
        [-30, 14],
        [30, 14],
        [34, -26],
        [-34, -26],
      ],
      6,
    ),
    RC.joint,
    { res: 1.2, d1: 12, d2: 4, lvl: 0.4, lines: [seg([-30, 0], [30, 0])] },
  );
}
function buildShoulderParts(P, { S, panel }) {
  P.paul = S(
    "paul",
    "paul",
    rp(
      [
        [-100, -30],
        [-74, -82],
        [-16, -106],
        [54, -96],
        [100, -44],
        [106, 28],
        [84, 56],
        [-82, 58],
        [-108, 24],
      ],
      15,
    ),
    RC.cream,
    {
      res: 2.4,
      moss: 0.95,
      mres: 2.2,
      d1: 26,
      d2: 9,
      rim: 5,
      plates: [
        panel(
          [
            [-130, 18],
            [130, 18],
            [130, 80],
            [-130, 80],
          ],
          RC.slateD,
          4,
        ),
      ],
      lines: [seg([-106, 18], [108, 18], 8)],
      riv: [...rowR(-86, 36, 84, 36, 9, 3.6)],
      extra: (g, st) => {
        inkClosed(g, ell(-4, -34, 38, 38, 26), 2.6, 7, st.L);
        g.strokeStyle = css(RC.red, 0.75);
        g.lineWidth = 8;
        g.beginPath();
        g.arc(-4, -34, 27, 0.4, TAU - 0.3);
        g.stroke();
      },
    },
  );
  P.paulF = S(
    "paulF",
    "paulF",
    rp(
      [
        [-96, -30],
        [-70, -78],
        [-14, -100],
        [52, -92],
        [96, -42],
        [100, 26],
        [80, 52],
        [-78, 54],
        [-102, 22],
      ],
      26,
    ),
    RC.cream,
    { res: 1.2, moss: 1, d1: 24, lines: [seg([-100, 18], [100, 18], 8)] },
  );
}
