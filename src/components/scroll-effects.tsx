"use client";

import { useEffect, useState, type ReactNode } from "react";

export default function ScrollEffects({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setEnabled(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className={`scroll-effects-root${enabled ? " has-scroll-reveal" : ""}`}>
      {children}
    </div>
  );
}
