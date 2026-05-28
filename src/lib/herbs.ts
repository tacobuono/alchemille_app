/**
 * Herb catalog — Alison's curriculum progression.
 * Each completed practice plants the next herb in the garden.
 * Order is meaningful — do not reorder without checking with Alison.
 */

export interface Herb {
  slug: string;
  name: string;
  latin: string;
  family: string;
  notes: string;
  /** Index in the curriculum sequence — 0-indexed. */
  order: number;
}

export const HERB_CATALOG: readonly Herb[] = [
  {
    slug: "ladys_mantle",
    name: "Lady's Mantle",
    latin: "Alchemilla vulgaris",
    family: "Rosaceae",
    notes: "The namesake. First plant in the garden.",
    order: 0,
  },
  {
    slug: "nettle",
    name: "Nettle",
    latin: "Urtica dioica",
    family: "Urticaceae",
    notes: "Mineral-rich; nervous-system tonic.",
    order: 1,
  },
  {
    slug: "chamomile",
    name: "Chamomile",
    latin: "Matricaria chamomilla",
    family: "Asteraceae",
    notes: "Nervine. Calms the digestive fire.",
    order: 2,
  },
  {
    slug: "oat_straw",
    name: "Oat Straw",
    latin: "Avena sativa",
    family: "Poaceae",
    notes: "Restores depleted nervous systems.",
    order: 3,
  },
  {
    slug: "rose",
    name: "Rose",
    latin: "Rosa spp.",
    family: "Rosaceae",
    notes: "Heart-opener; cooling and astringent.",
    order: 4,
  },
  {
    slug: "tulsi",
    name: "Tulsi",
    latin: "Ocimum tenuiflorum",
    family: "Lamiaceae",
    notes: "Holy basil. Adaptogen; clarifies the mind.",
    order: 5,
  },
  {
    slug: "ashwagandha",
    name: "Ashwagandha",
    latin: "Withania somnifera",
    family: "Solanaceae",
    notes: "Adaptogen. Restores resilience over time.",
    order: 6,
  },
  {
    slug: "lavender",
    name: "Lavender",
    latin: "Lavandula angustifolia",
    family: "Lamiaceae",
    notes: "Relaxant; settles the sympathetic state.",
    order: 7,
  },
  {
    slug: "calendula",
    name: "Calendula",
    latin: "Calendula officinalis",
    family: "Asteraceae",
    notes: "Solar; vulnerary; lymph mover.",
    order: 8,
  },
  {
    slug: "lemon_balm",
    name: "Lemon Balm",
    latin: "Melissa officinalis",
    family: "Lamiaceae",
    notes: "Gentle nervine; lifts the dispirited.",
    order: 9,
  },
  {
    slug: "mugwort",
    name: "Mugwort",
    latin: "Artemisia vulgaris",
    family: "Asteraceae",
    notes: "Dream-work; threshold plant.",
    order: 10,
  },
  {
    slug: "yarrow",
    name: "Yarrow",
    latin: "Achillea millefolium",
    family: "Asteraceae",
    notes: "Boundary; the wound-knitter.",
    order: 11,
  },
] as const;

export const TOTAL_HERBS = HERB_CATALOG.length;

/**
 * Return the next herb to plant given how many practices the user has already completed.
 * Once all herbs are planted, the garden continues with the first herb again
 * (cohort length is shorter than catalog — leave headroom for future curriculum).
 */
export function nextHerbForPracticeCount(completed: number): Herb {
  const index = completed % HERB_CATALOG.length;
  return HERB_CATALOG[index];
}

export function herbBySlug(slug: string): Herb | undefined {
  return HERB_CATALOG.find((h) => h.slug === slug);
}
