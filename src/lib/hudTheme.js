// Single source of truth for all HUD UI styling and layout
export const HUD_THEME = {
  // Z-index layering
  zIndex: {
    background: 10,
    tooltips: 20,
    panels: 30,
    modals: 40,
    overlays: 50,
  },

  // Common HUD styles
  panel: {
    bg: "bg-card/60",
    border: "border border-border",
    backdrop: "backdrop-blur-sm",
    rounded: "rounded-lg",
  },

  // Stats bar styles (outer = viewport positioning; inner = glass panel)
  statsBar: {
    outer: "fixed top-2.5 left-1/2 z-10 w-[min(100%-1rem,40rem)] -translate-x-1/2 pointer-events-none",
    inner:
      "flex w-full flex-wrap items-center justify-between gap-x-2 gap-y-2 rounded-2xl border border-white/10 bg-card/80 px-2.5 py-2 shadow-[0_12px_48px_-8px_rgba(0,0,0,0.65)] backdrop-blur-xl ring-1 ring-inset ring-white/[0.04] sm:gap-x-3 sm:px-3 sm:py-2.5",
  },

  // Ability HUD styles
  abilityHud: {
    container: "fixed left-2 top-20 z-20 flex flex-col gap-2",
    button: {
      size: "w-20 h-20",
      rounded: "rounded-lg",
      border: "border-2",
      active: "hover:brightness-125",
      inactive: "opacity-50 cursor-not-allowed",
    },
  },

  // Menu panel styles
  menuPanel: {
    container: "flex flex-col h-full bg-card/60 border-l border-border overflow-hidden",
    header: "px-4 py-3 border-b border-border/50 flex-shrink-0 flex items-center justify-between gap-2",
    content: "flex-1 overflow-hidden",
    footer: "flex gap-1 px-2 py-2 border-t border-border/50 bg-card/80 flex-shrink-0",
  },

  // Active buffs styles
  buffs: {
    container:
      "fixed top-[6.75rem] left-2 right-2 z-20 flex flex-wrap items-center gap-2 sm:top-28",
    item: "px-2 py-1 rounded-lg border border-border/50 bg-card/60 flex items-center gap-2 text-[10px]",
  },

  // Weapon mode styles
  weaponMode: {
    container: "flex flex-shrink-0 items-center gap-2 px-4 py-2 bg-card/60 border-b border-border",
    button: "flex-1 py-2 rounded-lg border-2 font-pixel text-[8px] transition-all",
  },

  // Buttons
  button: {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-secondary/60 hover:bg-secondary/80",
    muted: "bg-muted/30 text-muted-foreground hover:bg-muted/50",
  },

  // Typography
  text: {
    label: "font-pixel text-[9px]",
    small: "font-pixel text-[8px]",
    xs: "font-pixel text-[7px]",
  },
};

export default HUD_THEME;