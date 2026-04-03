import { useState, useEffect, useRef, useCallback } from "react";

const W = 640, H = 480, PW = 40, PH = 30, PS = 5, BS = 7, EBS = 3;
const COLS = 8, ROWS = 5, GX = 52, GY = 44, BC = 4, BHP = 3, INV = 60;
const WC = [
  { speed: 1, fi: 120 },
  { speed: 1.5, fi: 90 },
  { speed: 2, fi: 60 },
];
const RC = [
  { s: 300, c: "#E24B4A", g: "rgba(226,75,74,0.6)", sz: 18 },
  { s: 200, c: "#EF9F27", g: "rgba(239,159,39,0.6)", sz: 16 },
  { s: 100, c: "#5DCAA5", g: "rgba(93,202,165,0.6)", sz: 14 },
  { s: 100, c: "#5DCAA5", g: "rgba(93,202,165,0.6)", sz: 14 },
  { s: 50, c: "#85B7EB", g: "rgba(133,183,235,0.6)", sz: 12 },
];

export default function Game() {
  const cvs = useRef(null);
  const gRef = useRef(null);
  const keys = useRef({});
  const raf = useRef(null);
  const img = useRef(null);
  const [scr, setScr] = useState("loading");
  const [score, setScore] = useState(0);

  useEffect(() => {
    const i = new Image();
    i.onload = () => {
      img.current = i;
      setScr("title");
    };
    i.onerror = () => {
      console.error("Failed to load /wada.jpg");
      setScr("title");
    };
    i.src = "/wada.jpg";
  }, []);

  function mk(wave) {
    const en = [];
    const sx = (W - (COLS - 1) * GX) / 2, sy = 60;
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++)
        en.push({ x: sx + c * GX, y: sy + r * GY, row: r, alive: true });
    const bars = [];
    const sp = W / (BC + 1);
    for (let i = 0; i < BC; i++) bars.push({ x: sp * (i + 1), y: H - 80, hp: BHP });
    return {
      px: W / 2, py: H - 40, en, dir: 1, eb: [], pb: null, bars,
      sc: wave > 0 && gRef.current ? gRef.current.sc : 0,
      lv: wave > 0 && gRef.current ? gRef.current.lv : 3,
      w: wave, ft: 0, inv: 0, pts: [], shk: 0, over: false, clr: false,
      stars: Array.from({ length: 60 }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        s: Math.random() * 1.5 + 0.5, sp: Math.random() * 0.3 + 0.1, o: Math.random() * 0.5 + 0.3,
      })),
    };
  }

  const start = useCallback(() => { gRef.current = mk(0); setScr("play"); }, []);

  useEffect(() => {
    const kd = (e) => {
      if (e.key === " " && scr === "title") { e.preventDefault(); start(); return; }
      if ((e.key === "r" || e.key === "R") && (scr === "over" || scr === "clear")) {
        e.preventDefault(); gRef.current = mk(0); setScr("play"); return;
      }
      if (e.key === "Escape" && scr === "play") {
        e.preventDefault(); setScr("title"); return;
      }
      keys.current[e.key] = true;
      if (e.key === " ") e.preventDefault();
    };
    const ku = (e) => { keys.current[e.key] = false; };
    window.addEventListener("keydown", kd);
    window.addEventListener("keyup", ku);
    return () => { window.removeEventListener("keydown", kd); window.removeEventListener("keyup", ku); };
  }, [scr, start]);

  useEffect(() => {
    if (scr !== "play") return;
    const c = cvs.current, ctx = c.getContext("2d");
    let on = true;

    function update() {
      const g = gRef.current;
      if (!g || g.over || g.clr) return;
      const k = keys.current, wc = WC[g.w];
      if (k["ArrowLeft"] || k["a"] || k["A"]) g.px = Math.max(PW / 2, g.px - PS);
      if (k["ArrowRight"] || k["d"] || k["D"]) g.px = Math.min(W - PW / 2, g.px + PS);
      if (k[" "] && !g.pb) g.pb = { x: g.px, y: g.py - PH / 2 };
      if (g.pb) { g.pb.y -= BS; if (g.pb.y < 0) g.pb = null; }

      let mnX = W, mxX = 0, mxY = 0;
      g.en.forEach(e => { if (!e.alive) return; if (e.x < mnX) mnX = e.x; if (e.x > mxX) mxX = e.x; if (e.y > mxY) mxY = e.y; });
      const any = g.en.some(e => e.alive);
      if (any) {
        const drop = (g.dir > 0 && mxX + 20 >= W) || (g.dir < 0 && mnX - 20 <= 0);
        g.en.forEach(e => { if (!e.alive) return; if (drop) e.y += 20; else e.x += wc.speed * g.dir; });
        if (drop) g.dir *= -1;
      }

      g.ft++;
      if (g.ft >= wc.fi && any) {
        g.ft = 0;
        const btm = [];
        for (let c2 = 0; c2 < COLS; c2++) {
          for (let r = ROWS - 1; r >= 0; r--) { const idx = r * COLS + c2; if (g.en[idx].alive) { btm.push(g.en[idx]); break; } }
        }
        if (btm.length) { const sh = btm[Math.floor(Math.random() * btm.length)]; g.eb.push({ x: sh.x, y: sh.y + 10 }); }
      }

      g.eb.forEach(b => { b.y += EBS; });
      g.eb = g.eb.filter(b => b.y < H + 10);

      if (g.pb) {
        for (let i = 0; i < g.en.length; i++) {
          const e = g.en[i]; if (!e.alive) continue;
          const sz = RC[e.row].sz;
          if (Math.abs(g.pb.x - e.x) < sz && Math.abs(g.pb.y - e.y) < sz) {
            e.alive = false; g.sc += RC[e.row].s; g.pb = null;
            for (let p = 0; p < 8; p++) { const a = Math.PI * 2 * p / 8; g.pts.push({ x: e.x, y: e.y, vx: Math.cos(a) * 2, vy: Math.sin(a) * 2, life: 30, c: RC[e.row].c }); }
            break;
          }
        }
      }
      if (g.pb) {
        for (let i = 0; i < g.bars.length; i++) {
          const b = g.bars[i]; if (b.hp <= 0) continue;
          if (Math.abs(g.pb.x - b.x) < 20 && Math.abs(g.pb.y - b.y) < 10) { b.hp--; g.pb = null; break; }
        }
      }
      if (g.inv > 0) g.inv--;

      g.eb = g.eb.filter(b => {
        for (let i = 0; i < g.bars.length; i++) { const br = g.bars[i]; if (br.hp <= 0) continue; if (Math.abs(b.x - br.x) < 20 && Math.abs(b.y - br.y) < 10) { br.hp--; return false; } }
        if (g.inv <= 0 && Math.abs(b.x - g.px) < PW / 2 && Math.abs(b.y - g.py) < PH / 2) {
          g.lv--; g.inv = INV; g.shk = 10;
          if (g.lv <= 0) { g.over = true; setScore(g.sc); setScr("over"); }
          return false;
        }
        return true;
      });

      if (any && mxY >= g.py - PH) { g.over = true; g.lv = 0; setScore(g.sc); setScr("over"); }
      if (!g.en.some(e => e.alive)) {
        g.clr = true;
        if (g.w >= 2) { setScore(g.sc); setScr("clear"); }
        else setTimeout(() => { gRef.current = mk(g.w + 1); }, 1000);
      }
      g.pts.forEach(p => { p.x += p.vx; p.y += p.vy; p.life--; });
      g.pts = g.pts.filter(p => p.life > 0);
      g.stars.forEach(s => { s.y += s.sp; if (s.y > H) { s.y = 0; s.x = Math.random() * W; } });
      if (g.shk > 0) g.shk--;
    }

    function draw() {
      const g = gRef.current; if (!g) return;
      ctx.clearRect(0, 0, W, H);
      ctx.save();
      if (g.shk > 0) ctx.translate(Math.random() * 4 - 2, Math.random() * 4 - 2);
      const gr = ctx.createLinearGradient(0, 0, 0, H);
      gr.addColorStop(0, "#050810"); gr.addColorStop(1, "#0a0e1a");
      ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);

      g.stars.forEach(s => { ctx.globalAlpha = s.o; ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(s.x, s.y, s.s, 0, Math.PI * 2); ctx.fill(); });
      ctx.globalAlpha = 1;

      ctx.font = "bold 14px monospace"; ctx.fillStyle = "#fff";
      ctx.fillText("SCORE: " + String(g.sc).padStart(5, "0"), 16, 28);
      ctx.fillStyle = "#EF9F27"; ctx.textAlign = "center";
      ctx.fillText("WAVE " + (g.w + 1), W / 2, 28);
      ctx.textAlign = "right"; ctx.fillStyle = "#E24B4A";
      let lv = ""; for (let i = 0; i < g.lv; i++) lv += "\u2665 ";
      ctx.fillText(lv, W - 16, 28); ctx.textAlign = "left";

      g.en.forEach(e => {
        if (!e.alive) return;
        const rc = RC[e.row];
        ctx.save();
        ctx.shadowColor = rc.g; ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.arc(e.x, e.y, rc.sz + 2, 0, Math.PI * 2);
        ctx.fillStyle = rc.g; ctx.fill(); ctx.shadowBlur = 0;
        ctx.beginPath(); ctx.arc(e.x, e.y, rc.sz, 0, Math.PI * 2); ctx.closePath(); ctx.clip();
        if (img.current) ctx.drawImage(img.current, e.x - rc.sz, e.y - rc.sz, rc.sz * 2, rc.sz * 2);
        else { ctx.fillStyle = rc.c; ctx.fillRect(e.x - rc.sz, e.y - rc.sz, rc.sz * 2, rc.sz * 2); }
        ctx.restore();
        ctx.beginPath(); ctx.arc(e.x, e.y, rc.sz, 0, Math.PI * 2);
        ctx.strokeStyle = rc.c; ctx.lineWidth = 1.5; ctx.stroke();
      });

      g.bars.forEach(b => {
        if (b.hp <= 0) return;
        ctx.globalAlpha = b.hp / BHP; ctx.fillStyle = "#5DCAA5";
        ctx.beginPath(); ctx.moveTo(b.x - 22, b.y + 14); ctx.lineTo(b.x - 22, b.y - 6);
        ctx.quadraticCurveTo(b.x, b.y - 18, b.x + 22, b.y - 6); ctx.lineTo(b.x + 22, b.y + 14);
        ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
      });

      if (!(g.inv > 0 && Math.floor(g.inv / 4) % 2 === 0)) {
        ctx.fillStyle = "#85B7EB"; ctx.shadowColor = "rgba(133,183,235,0.5)"; ctx.shadowBlur = 8;
        ctx.beginPath(); ctx.moveTo(g.px, g.py - PH / 2);
        ctx.lineTo(g.px - PW / 2, g.py + PH / 2); ctx.lineTo(g.px + PW / 2, g.py + PH / 2);
        ctx.closePath(); ctx.fill(); ctx.shadowBlur = 0;
      }

      if (g.pb) {
        ctx.fillStyle = "#fff"; ctx.shadowColor = "rgba(255,255,255,0.8)"; ctx.shadowBlur = 6;
        ctx.fillRect(g.pb.x - 1.5, g.pb.y - 6, 3, 12); ctx.shadowBlur = 0;
      }
      g.eb.forEach(b => {
        ctx.fillStyle = "#E24B4A"; ctx.shadowColor = "rgba(226,75,74,0.8)"; ctx.shadowBlur = 4;
        ctx.fillRect(b.x - 1.5, b.y - 5, 3, 10); ctx.shadowBlur = 0;
      });
      g.pts.forEach(p => {
        ctx.globalAlpha = p.life / 30; ctx.fillStyle = p.c;
        ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 1;

      if (g.clr && g.w < 2) {
        ctx.fillStyle = "rgba(0,0,0,0.5)"; ctx.fillRect(0, 0, W, H);
        ctx.font = "bold 24px sans-serif"; ctx.fillStyle = "#5DCAA5"; ctx.textAlign = "center";
        ctx.fillText("WAVE " + (g.w + 1) + " CLEAR!", W / 2, H / 2 - 10);
        ctx.font = "14px sans-serif"; ctx.fillStyle = "#aaa";
        ctx.fillText("Next wave starting...", W / 2, H / 2 + 20); ctx.textAlign = "left";
      }
      ctx.restore();
    }

    function loop() { if (!on) return; update(); draw(); raf.current = requestAnimationFrame(loop); }
    loop();
    return () => { on = false; if (raf.current) cancelAnimationFrame(raf.current); };
  }, [scr]);

  const ctr = { display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", padding: "1rem 0" };
  const box = {
    width: W, maxWidth: "100%", height: H, background: "linear-gradient(180deg,#050810,#0a0e1a)",
    borderRadius: 8, overflow: "hidden", display: "flex", alignItems: "center",
    justifyContent: "center", flexDirection: "column", position: "relative",
  };

  if (scr === "loading") {
    return (
      <div style={ctr}>
        <div style={box}>
          <div style={{ fontSize: 16, color: "#888" }}>Loading...</div>
        </div>
      </div>
    );
  }

  if (scr === "title") {
    return (
      <div style={ctr}>
        <div style={{ ...box, cursor: "pointer" }} onClick={start} tabIndex={0}
          onKeyDown={e => { if (e.key === " ") start(); }}>
          <div style={{ width: 60, height: 60, borderRadius: "50%", overflow: "hidden", border: "2px solid #E24B4A", boxShadow: "0 0 15px rgba(226,75,74,0.5)", marginBottom: 16 }}>
            <img src="/wada.jpg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div style={{ letterSpacing: 4, fontSize: 28, fontWeight: 700, color: "#fff", marginBottom: 4 }}>
            SPACE INVADERS
          </div>
          <div style={{ fontSize: 16, color: "#EF9F27", fontWeight: 500, letterSpacing: 6, marginBottom: 24 }}>
            MODERN
          </div>
          <div style={{ fontSize: 14, color: "#888" }}>Press SPACE or click to start</div>
          <div style={{ marginTop: 16, fontSize: 12, color: "#555" }}>Wada-san Edition</div>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "#888" }}>
            Arrow keys / A,D: Move | Space: Shoot
          </span>
        </div>
      </div>
    );
  }

  if (scr === "over") {
    return (
      <div style={ctr}>
        <div style={{ ...box, cursor: "pointer" }} onClick={() => { gRef.current = mk(0); setScr("play"); }} tabIndex={0}>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#E24B4A", marginBottom: 8 }}>GAME OVER</div>
          <div style={{ fontSize: 14, color: "#aaa", marginBottom: 4 }}>Your score</div>
          <div style={{ fontSize: 36, fontWeight: 700, color: "#EF9F27", fontFamily: "monospace", marginBottom: 16 }}>
            {score.toLocaleString()}
          </div>
          <div style={{ padding: "8px 24px", border: "1px solid #555", borderRadius: 8, color: "#ccc", fontSize: 14 }}>
            Press R or click to retry
          </div>
        </div>
      </div>
    );
  }

  if (scr === "clear") {
    return (
      <div style={ctr}>
        <div style={{ ...box, cursor: "pointer" }} onClick={() => { gRef.current = mk(0); setScr("play"); }} tabIndex={0}>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#5DCAA5", marginBottom: 8 }}>ALL CLEAR!</div>
          <div style={{ fontSize: 14, color: "#aaa", marginBottom: 4 }}>Congratulations!</div>
          <div style={{ fontSize: 36, fontWeight: 700, color: "#EF9F27", fontFamily: "monospace", marginBottom: 8 }}>
            {score.toLocaleString()}
          </div>
          <div style={{ fontSize: 13, color: "#5DCAA5", marginBottom: 16 }}>All 3 waves defeated</div>
          <div style={{ padding: "8px 24px", border: "1px solid #555", borderRadius: 8, color: "#ccc", fontSize: 14 }}>
            Press R or click to play again
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={ctr}>
      <canvas ref={cvs} width={W} height={H}
        style={{ borderRadius: 8, display: "block", background: "#050810", maxWidth: "100%" }} />
      <div style={{ fontSize: 12, color: "#888" }}>
        Arrow keys / A,D: Move | Space: Shoot | ESC: Quit
      </div>
    </div>
  );
}
