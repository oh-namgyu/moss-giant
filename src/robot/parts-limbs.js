// Part drawings for arms, legs and the trees growing on the body, and the assembly of all parts.
function buildArmParts(P, { S, panel }) {
  const arms = (s, far) => {
    const o = far ? { d1: 18 } : {};
    P["up" + s] = S(
      "up" + s,
      "up" + s,
      rp(
        [
          [-40, 0],
          [40, 0],
          [46, 168],
          [-46, 168],
        ],
        8,
      ),
      RC.slateD,
      Object.assign(
        {
          res: 1.4,
          moss: far ? 0 : 0.5,
          lines: [seg([-44, 52], [46, 52]), seg([-46, 110], [46, 110])],
          riv: rowR(-30, 60, 30, 60, 4),
        },
        o,
      ),
    );
    P["el" + s] = S("el" + s, "up" + s, ell(0, 190, 46, 46, 22), RC.joint, {
      res: 1.2,
      d1: 14,
      d2: 5,
      lvl: 0.5,
      riv: rowR(-20, 190, 20, 190, 3, 4),
    });
    P["fo" + s] = S(
      "fo" + s,
      "fo" + s,
      rp(
        [
          [-42, -12],
          [42, -12],
          [56, 30],
          [76, 130],
          [70, 216],
          [-70, 216],
          [-76, 130],
          [-56, 30],
        ],
        9,
      ),
      RC.slate,
      Object.assign(
        {
          res: 1.5,
          moss: far ? 0.4 : 0.7,
          d1: 20,
          plates: [
            panel(
              [
                [-92, 46],
                [-12, 34],
                [-8, 224],
                [-92, 224],
              ],
              RC.cream,
              6,
            ),
          ],
          lines: [seg([-72, 176], [72, 176]), seg([40, -8], [60, 212])],
          riv: [...rowR(-58, 58, -24, 54, 3), ...rowR(-62, 196, -18, 196, 3)],
        },
        o,
      ),
    );
    P["ha" + s] = ["palm", "f1", "f2", "f3", "th"].map((k, i) => {
      const pts =
        k === "palm"
          ? rp(
              [
                [-56, -4],
                [56, -4],
                [62, 48],
                [-62, 48],
              ],
              6,
            )
          : k === "th"
            ? rp(
                [
                  [-62, 8],
                  [-40, 8],
                  [-44, 60],
                  [-78, 62],
                  [-78, 30],
                ],
                6,
              )
            : rp(
                [
                  [-54 + (i - 1) * 37, 42],
                  [-20 + (i - 1) * 37, 42],
                  [-16 + (i - 1) * 37, 90],
                  [-22 + (i - 1) * 37, 100],
                  [-52 + (i - 1) * 37, 100],
                  [-58 + (i - 1) * 37, 90],
                ],
                5,
              );
      return S("ha" + s + k, "ha" + s, pts, k === "palm" ? RC.slateD : RC.joint, {
        res: 1.2,
        d1: 9,
        d2: 4,
        rim: 2,
        lvl: 0.7,
        lines: k === "palm" ? [] : [seg([pts[0][0], 72], [pts[0][0] + 34, 72], 3)],
      });
    });
  };
  arms("N", false);
  arms("F", true);
}
function buildLegParts(P, { S, panel }) {
  const legs = (s, far) => {
    P["th" + s] = S(
      "th" + s,
      "thigh" + s,
      rp(
        [
          [-60, -14],
          [60, -14],
          [74, 100],
          [58, 190],
          [-58, 190],
          [-76, 100],
        ],
        11,
      ),
      RC.slate,
      {
        res: 1.5,
        moss: far ? 0.4 : 0.8,
        d1: 22,
        plates: far
          ? []
          : [
              panel(
                [
                  [-92, 20],
                  [-22, 14],
                  [-16, 170],
                  [-92, 176],
                ],
                RC.cream,
                14,
              ),
            ],
        lines: [seg([32, -10], [42, 186]), seg([-66, 120], [60, 120])],
        riv: rowR(-56, 40, -30, 38, 3),
      },
    );
    P["sh" + s] = S(
      "sh" + s,
      "shin" + s,
      rp(
        [
          [-52, 8],
          [52, 8],
          [80, 92],
          [60, 192],
          [-52, 192],
          [-74, 102],
        ],
        10,
      ),
      RC.slate,
      {
        res: 1.5,
        moss: far ? 0.3 : 0.55,
        d1: 24,
        plates: far
          ? []
          : [
              panel(
                [
                  [-96, 40],
                  [-14, 26],
                  [-8, 196],
                  [-96, 196],
                ],
                RC.cream,
                12,
              ),
            ],
        lines: [
          seg([22, 12], [34, 190]),
          seg([-66, 150], [64, 150]),
          seg([32, 60], [70, 66], 3),
          seg([32, 76], [72, 82], 3),
        ],
        riv: rowR(-62, 160, -20, 160, 4),
      },
    );
    P["kn" + s] = S("kn" + s, "shin" + s, ell(-4, 0, 58, 58, 26), RC.cream, {
      res: 1.5,
      moss: far ? 0.3 : 0.8,
      d1: 17,
      riv: rowR(-30, -18, 20, -18, 4),
    });
    P["ft" + s] = S(
      "ft" + s,
      "foot" + s,
      rp(
        [
          [56, -16],
          [66, 34],
          [42, 50],
          [-128, 50],
          [-146, 26],
          [-92, 2],
          [-38, -20],
        ],
        6,
      ),
      RC.slateD,
      {
        res: 1.3,
        moss: far ? 0.3 : 0.6,
        d1: 13,
        plates: [
          panel(
            [
              [-160, 10],
              [-70, 0],
              [-58, 60],
              [-160, 60],
            ],
            RC.cream,
            8,
          ),
        ],
        lines: [seg([-58, 0], [-48, 50])],
        riv: rowR(-118, 34, -78, 34, 3),
      },
    );
  };
  legs("N", false);
  legs("F", true);
}
function buildGrowths(P) {
  const tr = (x0, y0, w, h, res0, fn) => {
    const res = res0 * Math.max(Q, 0.55),
      c = mk(w * res, h * res),
      g = c.getContext("2d");
    g.scale(res, res);
    g.translate(-x0, -y0);
    fn(g);
    return { c, x: x0, y: y0, w, h };
  };
  P.tree = tr(-40, -640, 520, 620, 1.3, (g) => {
    g.save();
    g.translate(176, -262);
    g.rotate(0.42);
    sapling(g, 0, 0, 235, 10, rng(77));
    g.restore();
    g.save();
    g.translate(112, -266);
    g.rotate(0.34);
    sapling(g, 0, 0, 120, -14, rng(78));
    g.restore();
  });
  P.pSap = tr(-210, -300, 360, 300, 1.8, (g) => {
    tuft(g, 40, -92, 60, 7, [MOSSP[2], MOSSP[3]], rng(82), 3);
    fern(g, -60, -84, 70, -2, MOSSP[2], rng(83), MOSSP[3]);
    fern(g, 60, -80, 60, -1.1, MOSSP[3], rng(84), MOSSP[4]);
  });
}
let PARTS = null;
function buildParts() {
  const kit = partKit(),
    P = {};
  buildTrunkParts(P, kit);
  buildHeadPart(P, kit);
  buildShoulderParts(P, kit);
  buildArmParts(P, kit);
  buildLegParts(P, kit);
  buildGrowths(P);
  PARTS = P;
}
