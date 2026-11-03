// The head, the most closely seen drawing: helmet plate, eye lens with a working lid, ear disc and antenna.
function buildHeadPart(P, { S, panel }) {
  P.head = S(
    "head",
    "head",
    rp(
      [
        [36, 4],
        [62, -42],
        [58, -94],
        [26, -124],
        [-26, -128],
        [-64, -100],
        [-76, -64],
        [-66, -30],
        [-46, -4],
        [-8, 6],
      ],
      11,
    ),
    RC.slate,
    {
      res: 3.4,
      moss: 0.62,
      mres: 3.2,
      d1: 15,
      d2: 6,
      rim: 4,
      lvl: 0.9,
      plates: [
        panel(
          [
            [-90, -74],
            [-62, -112],
            [-24, -140],
            [34, -136],
            [72, -96],
            [66, -74],
            [20, -88],
            [-30, -86],
          ],
          RC.cream,
          12,
        ),
      ],
      lines: [
        seg([-58, -24], [-40, -22], 3),
        seg([-60, -14], [-40, -12], 3),
        seg([-6, -30], [20, -32], 3),
        seg([-6, -20], [22, -22], 3),
        seg([-6, -10], [22, -12], 3),
        seg([-2, -128], [0, -90], 4),
      ],
      riv: [...rowR(-54, -92, -20, -96, 3), ...rowR(4, -98, 46, -94, 3)],
      extra: (g, st) => {
        const socket = polyPath(ell(-40, -58, 25, 24, 24));
        g.fillStyle = "#14161f";
        g.fill(socket);
        const on = st.p.eye,
          gl = g.createRadialGradient(-44, -60, 1, -40, -58, 23);
        gl.addColorStop(0, css(mixc(hex("#2a3448"), hex("#f2feff"), on)));
        gl.addColorStop(0.42, css(mixc(hex("#1c2535"), hex("#8fe6f5"), on)));
        gl.addColorStop(1, css(mixc(hex("#0e1119"), hex("#2b8fb0"), on)));
        g.fillStyle = gl;
        g.beginPath();
        g.arc(-40, -58, 19, 0, TAU);
        g.fill();
        g.fillStyle = "rgba(255,255,255,.75)";
        g.beginPath();
        g.arc(-47, -65, 3.2, 0, TAU);
        g.fill();
        g.save();
        g.clip(socket);
        const cut = lerp(-36, -77, on);
        g.fillStyle = css(RC.slateD);
        g.fillRect(-72, -90, 66, cut + 90);
        g.restore();
        inkOpen(g, seg([-65, cut], [-15, cut - 2], 5), 2.6);
        inkClosed(g, ell(-40, -58, 25, 24, 24), 3.2, 3, st.L);
        const ear = ell(20, -54, 25, 25, 20);
        g.fillStyle = css(RC.slateD);
        g.fill(polyPath(ear));
        g.fillStyle = css(RC.joint);
        g.beginPath();
        g.arc(20, -54, 12, 0, TAU);
        g.fill();
        inkClosed(g, ear, 2.8, 5, st.L);
        inkClosed(g, ell(20, -54, 12, 12, 14), 1.8, 6, st.L);
        rib(g, curve(-4, -124, -14, -176, 0.12, 6), 5, 3, "#3a3840");
        g.fillStyle = css(RC.red);
        g.beginPath();
        g.arc(-15, -179, 5.5, 0, TAU);
        g.fill();
      },
    },
  );
}
