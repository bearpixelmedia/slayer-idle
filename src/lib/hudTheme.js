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

  // Stats bar styles
  statsBar: {
    container: "fixed top-2 left-2 right-2 z-10 flex flex-wrap items-center justify-between gap-2 px-3 py-2",
    bg: "bg-card/80 backdrop-blur-md",
    border: "border border-border",
    rounded: "rounded-lg",
    pointerEvents: "pointer-events-none",
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
    container: "fixed top-20 left-2 right-2 z-20 flex flex-wrap items-center gap-2",
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