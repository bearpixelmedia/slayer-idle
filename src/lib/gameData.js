export const UPGRADES = [
  { id: "sword_1",   name: "Iron Sword",    baseCost: 10,  cps: 0.5,  description: "A basic iron sword." },
  { id: "shield_1",  name: "Wooden Shield", baseCost: 50,  cps: 1,    description: "Blocks some damage." },
  { id: "armor_1",   name: "Leather Armor", baseCost: 150, cps: 2.5,  description: "Basic protection." },
  { id: "bow_1",     name: "Short Bow",     baseCost: 400, cps: 5,    description: "Ranged attacks." },
  { id: "magic_1",   name: "Magic Staff",   baseCost: 900, cps: 10,   description: "Channels magic." },
];

export function getUpgradeCost(upgrade, currentLevel) {
  return Math.floor(upgrade.baseCost * Math.pow(1.15, currentLevel));
}