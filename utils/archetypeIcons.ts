// Archetype icon mapping for numerology numbers
export const ARCHETYPE_ICONS = {
  // Life Path Numbers
  1: require("../assets/images/leadership.png"),
  2: require("../assets/images/peacemaker.png"),
  3: require("../assets/images/creator.png"),
  4: require("../assets/images/builder.png"),
  5: require("../assets/images/explorer.png"),
  6: require("../assets/images/nurturer.png"),
  7: require("../assets/images/mystic.png"),
  8: require("../assets/images/powerhouse.png"),
  9: require("../assets/images/humanitarian.png"),
  11: require("../assets/images/visionary.png"),
  22: require("../assets/images/masterbuilder.png"),
  33: require("../assets/images/masterteacher.png"),
} as const;

export const getArchetypeIcon = (number: number | string): any => {
  const num = typeof number === 'string' ? parseInt(number) : number;
  return ARCHETYPE_ICONS[num as keyof typeof ARCHETYPE_ICONS] || ARCHETYPE_ICONS[1];
};

export const ARCHETYPE_NAMES = {
  1: "The Leader",
  2: "The Peacemaker",
  3: "The Creator",
  4: "The Builder",
  5: "The Explorer",
  6: "The Nurturer",
  7: "The Mystic",
  8: "The Powerhouse",
  9: "The Humanitarian",
  11: "The Visionary",
  22: "The Master Builder",
  33: "The Master Teacher",
} as const;

export const getArchetypeName = (number: number | string): string => {
  const num = typeof number === 'string' ? parseInt(number) : number;
  return ARCHETYPE_NAMES[num as keyof typeof ARCHETYPE_NAMES] || "The Seeker";
};
