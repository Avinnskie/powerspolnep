"use client";

import { motion, useSpring, useTransform } from "framer-motion";
import React, { useRef, useState } from "react";

type MagneticButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  radius?: number;
  strength?: number;
  maxTranslate?: number;
  zonePadding?: number;
  glow?: boolean;
  spring?: {
    stiffness?: number;
    damping?: number;
    mass?: number;
  };
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export const MagneticButton = React.forwardRef<
  HTMLButtonElement,
  MagneticButtonProps
>(
  (
    {
      children,
      radius = 140,
      strength = 0.4,
      maxTranslate = 24,
      zonePadding = 24,
      glow = true,
      spring = { stiffness: 300, damping: 22, mass: 0.5 },
      style,
      ...props
    },
    forwardedRef,
  ) => {
    const areaRef = useRef<HTMLDivElement>(null);

    const x = useSpring(0, spring);
    const y = useSpring(0, spring);

    const proximity = useSpring(0, { stiffness: 200, damping: 24, mass: 0.6 });

    const scale = useTransform(proximity, [0, 1], [1, 1.03]);
    const glowOpacity = useTransform(proximity, [0, 1], [0, 0.85]);

    const [pointerXY, setPointerXY] = useState({ x: 0, y: 0 });

    const onPointerMove = (e: React.PointerEvent) => {
      if (!areaRef.current) return;
      const rect = areaRef.current.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      const cx = rect.width / 2;
      const cy = rect.height / 2;

      const dx = mx - cx;
      const dy = my - cy;
      const dist = Math.hypot(dx, dy);

      setPointerXY({ x: mx, y: my });

      if (dist < radius) {
        const t = 1 - dist / radius;

        const pull = t * strength;

        const tx = clamp(dx * pull, -maxTranslate, maxTranslate);
        const ty = clamp(dy * pull, -maxTranslate, maxTranslate);

        x.set(tx);
        y.set(ty);
        proximity.set(t);
      } else {
        x.set(0);
        y.set(0);
        proximity.set(0);
      }
    };

    const onPointerLeave = () => {
      x.set(0);
      y.set(0);
      proximity.set(0);
    };

    return (
      <div
        ref={areaRef}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        style={{
          display: "inline-block",
          position: "relative",
          padding: zonePadding,
          borderRadius: 16,
          cursor: "default",
        }}
      >
        {glow && (
          <motion.span
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              borderRadius: 16,
              opacity: glowOpacity,
              background: `radial-gradient(220px 160px at ${pointerXY.x}px ${pointerXY.y}px, #FFD500, rgba(99,102,241,0.14), transparent 65%)`,
              filter: "blur(8px)",
              transition: "background-position 60ms linear",
            }}
          />
        )}

        <motion.button
          ref={forwardedRef}
          {...(props as any)}
          style={
            {
              ...style,
              transform: "translateZ(0)",
              x,
              y,
              scale,
              position: "relative",
              padding: "12px 24px",
              borderRadius: 100,
              background: "linear-gradient(180deg, #FFD500 0%, #FFD500 100%)",
              color: "#000",
              cursor: "pointer",
              overflow: "hidden",
              boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
              willChange: "transform",
            } as any
          }
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 } as any}
        >
          <motion.span
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(300px 200px at 50% 0%, #F8FAB4, transparent 60%)",
              mixBlendMode: "screen",
              pointerEvents: "none",
            }}
          />
          <span style={{ position: "relative", zIndex: 1 }}>{children}</span>
        </motion.button>
      </div>
    );
  },
);

MagneticButton.displayName = "MagneticButton";
