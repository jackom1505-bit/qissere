import { useEffect, useRef } from "react";

interface Ember {
  x: number;
  y: number;
  r: number;
  vy: number;
  sway: number;
  phase: number;
  hue: number;
  a: number;
}

interface Bean {
  x: number;
  y: number;
  s: number;
  ang: number;
  spin: number;
  vy: number;
  vx: number;
  a: number;
}

/**
 * A fixed, scroll-reactive canvas: embers rise, roasted beans drift.
 * Scroll velocity pushes everything — fast scroll = the room stirs.
 */
export default function EmberBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    let dpr = 1;
    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const rand = (a: number, b: number) => a + Math.random() * (b - a);

    const embers: Ember[] = Array.from({ length: 80 }, () => ({
      x: rand(0, w),
      y: rand(0, h),
      r: rand(0.8, 2.4),
      vy: rand(12, 34),
      sway: rand(6, 20),
      phase: rand(0, Math.PI * 2),
      hue: rand(18, 38),
      a: rand(0.35, 0.9),
    }));

    const beans: Bean[] = Array.from({ length: 20 }, () => ({
      x: rand(0, w),
      y: rand(0, h),
      s: rand(14, 36),
      ang: rand(0, Math.PI * 2),
      spin: rand(-0.35, 0.35),
      vy: rand(4, 11),
      vx: rand(-4, 4),
      a: rand(0.3, 0.6),
    }));

    let lastScroll = window.scrollY;
    let vel = 0;
    const onScroll = () => {
      const y = window.scrollY;
      vel += (y - lastScroll) * 0.03;
      lastScroll = y;
    };

    const drawBean = (b: Bean) => {
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.ang);
      ctx.globalAlpha = b.a;
      // body
      ctx.beginPath();
      ctx.ellipse(0, 0, b.s * 0.5, b.s * 0.34, 0, 0, Math.PI * 2);
      const g = ctx.createLinearGradient(-b.s * 0.5, 0, b.s * 0.5, 0);
      g.addColorStop(0, "#3a2314");
      g.addColorStop(0.55, "#2a1810");
      g.addColorStop(1, "#1a0f09");
      ctx.fillStyle = g;
      ctx.fill();
      // sheen
      ctx.beginPath();
      ctx.ellipse(-b.s * 0.14, -b.s * 0.1, b.s * 0.16, b.s * 0.07, -0.4, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(240,207,134,0.10)";
      ctx.fill();
      // groove
      ctx.beginPath();
      ctx.moveTo(-b.s * 0.42, 0);
      ctx.quadraticCurveTo(0, b.s * 0.16, b.s * 0.42, 0);
      ctx.strokeStyle = "rgba(120,76,40,0.7)";
      ctx.lineWidth = Math.max(1, b.s * 0.05);
      ctx.stroke();
      ctx.restore();
    };

    let raf = 0;
    let last = performance.now();
    let t = 0;

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      t += dt;
      vel *= 0.9;

      ctx.clearRect(0, 0, w, h);

      // warm bottom glow
      const pulse = 0.1 + Math.sin(t * 0.7) * 0.03;
      const glow = ctx.createRadialGradient(w * 0.5, h * 1.05, 0, w * 0.5, h * 1.05, h * 0.85);
      glow.addColorStop(0, `rgba(242,97,42,${pulse})`);
      glow.addColorStop(0.5, `rgba(196,147,74,${pulse * 0.35})`);
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      // beans
      for (const b of beans) {
        b.y -= (b.vy + vel * 22) * dt;
        b.x += (b.vx + Math.sin(t * 0.4 + b.ang) * 3) * dt;
        b.ang += (b.spin + vel * 0.02) * dt;
        if (b.y < -60) {
          b.y = h + 60;
          b.x = rand(0, w);
        } else if (b.y > h + 80) {
          b.y = -60;
          b.x = rand(0, w);
        }
        if (b.x < -60) b.x = w + 60;
        if (b.x > w + 60) b.x = -60;
        drawBean(b);
      }

      // embers
      ctx.globalCompositeOperation = "lighter";
      for (const e of embers) {
        e.y -= (e.vy + vel * 40) * dt;
        e.x += Math.sin(t * 1.3 + e.phase) * e.sway * dt;
        if (e.y < -20) {
          e.y = h + 20;
          e.x = rand(0, w);
        } else if (e.y > h + 30) {
          e.y = -20;
          e.x = rand(0, w);
        }
        const flick = e.a * (0.65 + Math.sin(t * 6 + e.phase) * 0.35);
        const rg = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.r * 5);
        rg.addColorStop(0, `hsla(${e.hue},100%,70%,${flick})`);
        rg.addColorStop(0.35, `hsla(${e.hue},100%,55%,${flick * 0.45})`);
        rg.addColorStop(1, `hsla(${e.hue},100%,50%,0)`);
        ctx.fillStyle = rg;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r * 5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";

      if (!reduced) raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="fixed inset-0 z-0 pointer-events-none"
      aria-hidden="true"
    />
  );
}
