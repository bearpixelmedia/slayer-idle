# Slayer Idle — Pixel Crawler Asset Map
_All assets from the free Pixel Crawler pack by Anokolisa. Confirmed frame counts from actual PNGs._

---

## ✅ CURRENTLY IN USE

### Player Character
| Asset | Sheet | Frames | Use |
|---|---|---|---|
| `player/idle.png` | 256×64 | 4f @ 64px | Player idle loop |
| `player/run.png` | 384×64 | 6f @ 64px | Player running (combat) |
| `player/walk.png` | 384×64 | 6f @ 64px | Player walking (slower) |
| `player/hit.png` | 256×64 | 4f @ 64px | Player hit flash |
| `player/death.png` | 512×64 | 8f @ 64px | Player death anim |
| `player/attack_sword.png` | 512×64 | 8f @ 64px | Sword attack |
| `player/attack_bow.png` | 512×64 | 8f @ 64px | Bow attack |
| `player/body_a/idle.png` | 256×64 | 4f @ 64px | Body layer for equipment compositing |
| `player/body_a/run.png` | 384×64 | 6f @ 64px | Body layer (running) |
| `player/body_a/hit.png` | 256×64 | 4f @ 64px | Body layer (hit) |
| `player/body_a/death.png` | 512×64 | 8f @ 64px | Body layer (death) |
| `player/body_a/slice.png` | 512×64 | 8f @ 64px | Body layer sword swing |
| `player/body_a/pierce.png` | 512×64 | 8f @ 64px | Body layer bow/pierce |
| `player/body_a/crush.png` | 512×64 | 8f @ 64px | Body layer crush (unused weapon) |
| `weapons/hands.png` | 32×96 | 3 rows @ 32px | Skin tone grip overlay (light/mid/dark) |

### Enemies
| Asset | Idle | Run | Death | Current In-Game Name |
|---|---|---|---|---|
| `enemies/skeleton/` | 4f@32 | 6f@64 | 12f@64 | Skeleton |
| `enemies/skeleton_rogue/` | 4f@32 | 6f@64 | 6f@64 | Skeleton Rogue |
| `enemies/skeleton_warrior/` | 4f@32 | 6f@64 | 8f@48 | Skeleton Warrior |
| `enemies/skeleton_mage/` | 4f@32 | 6f@64 | 6f@64 | Skeleton Mage |
| `enemies/orc/` | 4f@32 | 6f@64 | 6f@64 | Orc |
| `enemies/orc_rogue/` | 4f@32 | 6f@64 | 6f@64 | Orc Rogue |
| `enemies/orc_warrior/` | 4f@32 | 6f@64 | 7f@80 | Orc Warrior |
| `enemies/orc_shaman/` | 4f@32 | 6f@64 | 7f@64 | Orc Shaman |

### Heroes (NPCs)
| Asset | Idle | Run | Death | Use |
|---|---|---|---|---|
| `npcs/knight/` | 4f@32 | 6f@64 | 9f@32 | Knight hero, title screen |
| `npcs/rogue/` | 4f@32 | 6f@64 | 12f@32 | Rogue hero, title screen |
| `npcs/wizard/` | 4f@32 | 6f@64 | 12f@32 | Wizard hero, title screen |

### Weapons (Icon Sprites — Sheet-based crop)
**Wood tier** (`weapons/wood.png` — 192×112):
| Key | Coords | Use |
|---|---|---|
| sword | x:0 y:0 16×48 | Main weapon, weapon mode button |
| bow_f1 | x:48 y:48 16×32 | Bow mode button |
| dagger | x:32 y:16 16×32 | Equipment panel |
| hammer | x:16 y:16 16×32 | Equipment panel |
| mace | x:16 y:48 16×32 | Equipment panel |
| axe | x:48 y:16 16×32 | Equipment panel |
| spear | x:64 y:0 16×48 | Equipment panel |
| staff | x:96 y:16 16×48 | Equipment panel (Wizard) |
| quiver | x:80 y:16 16×32 | Equipment panel (Rogue) |
| tower_shield | x:112 y:16 32×32 | Equipment panel / offhand |
| circle_shield | x:128 y:0 16×16 | Equipment panel / offhand |
| kite_shield | x:144 y:0 16×16 | Equipment panel / offhand |

**Bone tier** (`weapons/bone.png` — 224×144):
| Key | Coords | Use |
|---|---|---|
| sword | x:0 y:32 10×40 | Main weapon |
| bow_f1 | x:144 y:48 10×32 | Bow mode |
| dagger | x:0 y:4 10×24 | Equipment panel |
| club | x:16 y:2 12×28 | Equipment panel |
| mace | x:16 y:48 10×32 | Equipment panel |
| axe | x:48 y:4 16×24 | Equipment panel |
| spear | x:64 y:2 8×78 | Equipment panel |
| staff | x:160 y:0 16×80 | Equipment panel (Wizard) |
| wand | x:192 y:0 16×64 | Equipment panel (Wizard) |
| shield | x:112 y:0 32×40 | Offhand |

### Ability Icons (Environment Animated)
| Asset | Dims | Frames | Use |
|---|---|---|---|
| `environment/animated/bonfire_anim.png` | 128×32 | 4f@32 | Fury (double damage) ability |
| `environment/animated/alchemy.png` | 192×704 | 3f@192 (vertical) | Attract (magnet) ability |
| `environment/animated/fire.png` | 128×48 | 4f@32 wide | Ethereal (auto click) ability |

### Village / Crafting Stations (Animated)
| Asset | Dims | Use |
|---|---|---|
| `environment/animated/anvil_anim.png` | 512×400 | Forge panel animated icon |

---

## 🟡 AVAILABLE BUT NOT YET USED

### Extra Enemy Sprites (Re-skin potential)
| Asset | Notes | Suggested Use |
|---|---|---|
| `enemies/spider/` | 4f@32 idle, 6f@64 run/death | Zone 2 mini-boss, web hazard enemy |
| `enemies/zombie/` | 4f@32 idle, 6f@64 run/death | Zone 1 slow tank variant |
| `enemies/ghost/` | 4f@32 idle, 6f@64 run/death | Zone 2 ethereal dodge-type |
| `enemies/dragon/` | 4f@32 idle, 6f@64 run/death | **Final boss** — Deep Mines zone 4 |

### Static Village Stations
| Asset | Dims | Suggested Use |
|---|---|---|
| `environment/stations/anvil.png` | 272×160 (17×10 @ 16px) | Forge panel background / icon |
| `environment/stations/bonfire.png` | 64×384 (4×24 @ 16px) | Rest/prestige campfire icon |
| `environment/stations/furnace.png` | 192×384 (12×24 @ 16px) | Smelting / upgrade station |
| `environment/stations/workbench.png` | 192×352 (12×22 @ 16px) | Crafting / equipment station |

### Environment Props
| Asset | Dims | Suggested Use |
|---|---|---|
| `environment/props/rocks.png` | 208×304 | Combat lane decoration, parallax layer |
| `environment/props/tree_a.png` | 368×256 | Parallax background trees |
| `environment/props/tree_b.png` | 192×224 | Parallax mid trees |
| `environment/props/tree_c.png` | 400×416 | Parallax foreground trees |
| `environment/props/vegetation.png` | 400×432 | Ground foliage, parallax shrubs |

### Tilesets (16px grid)
| Asset | Tiles | Suggested Use |
|---|---|---|
| `environment/tilesets/floors_tiles.png` | 25×26 | Zone floor texture, village floor |
| `environment/tilesets/dungeon_tiles.png` | 25×25 | Bone Dungeon zone background tiles |
| `environment/tilesets/wall_tiles.png` | 25×25 | Dungeon/mine background walls |
| `environment/tilesets/water_tiles.png` | 25×25 | Zone water/river decoration |

### Extra Weapon Assets (Not wired up yet)
| Asset | Notes | Suggested Use |
|---|---|---|
| `weapons/extracted/wood_bow_f2.png` | Second bow frame | Bow animation frame 2 |
| `weapons/extracted/bone_bow_f2.png` | Second bow frame | Bone bow anim f2 |
| `weapons/extracted/bone_bow_f3.png` | Third bow frame | Bone bow anim f3 |
| `weapons/extracted/bone_scythe.png` | Scythe icon | Bone tier prestige weapon |
| `weapons/extracted/bone_sickle.png` | Sickle icon | Bone tier weapon |
| `weapons/extracted/wood_sickle.png` | Sickle icon | Wood tier weapon |
| `weapons/extracted/wood_pickaxe.png` | Pickaxe icon | Mine zone thematic weapon |
| `weapons/extracted/bone_staff_trident.png` | Trident staff | Bone tier magic weapon |
| `weapons/extracted/bone_book.png` | Book icon | Wizard offhand |
| `weapons/extracted/wood_book.png` | Book icon | Wizard offhand (wood) |
| `weapons/extracted/bone_quiver.png` | Quiver icon | Bow offhand slot |
| `weapons/hands.png` | 32×96, 3 skin rows | Already in use for weapon rig |

---

## 📋 FULL IN-GAME USE PLAN

### Enemies → Zones
```
Zone 1: Whispering Forest (stages 0-4)
  → Skeleton, Skeleton Rogue  (+ Zombie as variant with CSS desaturate)

Zone 2: Bone Dungeon (stages 5-9)
  → Skeleton Warrior, Skeleton Mage  (+ Ghost as spectral variant)

Zone 3: Orcish Caverns (stages 10-14)
  → Orc, Orc Rogue  (+ Spider as dungeon hazard)

Zone 4: Deep Mines (stages 15-19)
  → Orc Warrior, Orc Shaman  (Dragon as zone 4 boss)
```

### Village Panel → Stations
```
Forge (weapon upgrades)    → anvil_anim.png (animated) + anvil.png (static)
Bonfire (prestige/rest)    → bonfire_anim.png (animated) + bonfire.png (static)
Workshop (equipment)       → workbench.png
Furnace (soul upgrades)    → furnace.png
```

### Environment → Parallax Layers
```
Far background:   mountains (ParallaxMountainSilhouettes - already CSS)
Mid background:   tree_a.png, tree_b.png
Near foreground:  tree_c.png, vegetation.png
Ground props:     rocks.png (scattered on the ground lane)
```

### Weapon Tiers → Equipment System
```
Tier 1 (Wood):   sword, bow, dagger, axe, spear, mace, staff, quiver
Tier 2 (Bone):   sword, bow, dagger, axe, spear, mace, staff, wand, scythe
Tier 3+:         Need paid pack (iron, steel, etc.)
```

### Tilesets → Zone Backgrounds
```
Whispering Forest:  floors_tiles.png (grass/dirt floor rows)
Bone Dungeon:       dungeon_tiles.png + wall_tiles.png
Orcish Caverns:     dungeon_tiles.png (darker filter)
Deep Mines:         wall_tiles.png + floors_tiles.png (coal/stone rows)
```

---

## ❌ ASSETS TO CLEAN UP (Legacy / Redundant)
| Asset | Notes |
|---|---|
| `weapons/bone_r0_c0.png` through `bone_r2_c2.png` | Old cell-by-cell extractions — superseded by `weapons/extracted/` |
| `weapons/wood_r0_c0.png` through `wood_r2_c2.png` | Same — superseded |
| `weapons/bone_extracted/bone_00.png` | Old single-cell test extract |
| `weapons/wood_extracted/wood_00.png` | Same |
| `weapons/bone_icon.png` | Old icon test |
| `weapons/wood_icon.png` | Old icon test |
