import { useEffect, useState } from "react";
import { getCombatSlotNominalPx } from "@/lib/combatSlotNominal";

/** Re-read when viewport crosses the same breakpoints as the shared hitbox Tailwind classes. */
export function useCombatSlotNominalPx() {
  const [px, setPx] = useState(getCombatSlotNominalPx);

  useEffect(() => {
    const upd = () => setPx(getCombatSlotNominalPx());
    upd();
    window.addEventListener("resize", upd);
    const m640 = window.matchMedia("(min-width: 640px)");
    const m768 = window.matchMedia("(min-width: 768px)");
    const onMq = () => upd();
    m640.addEventListener("change", onMq);
    m768.addEventListener("change", onMq);
    return () => {
      window.removeEventListener("resize", upd);
      m640.removeEventListener("change", onMq);
      m768.removeEventListener("change", onMq);
    };
  }, []);

  return px;
}
