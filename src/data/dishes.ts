import dishJson from '../../data/dishes.json'
import namesJa from '../i18n/ja/dishes.json'

export type Dish = {
  /** English name; unique, used as the key */
  readonly name: string
  /** Japanese display name */
  readonly nameJa: string
  /** Ingredient (English name) -> count needed for one dish */
  readonly ingredients: Readonly<Record<string, number>>
}

const names = namesJa as Record<string, string>

// The JSON import is typed as a union of every recipe's literal shape, so widen it first.
const raw = dishJson as unknown as readonly Omit<Dish, 'nameJa'>[]

/** All dishes in data order (curries, salads, desserts / drinks). */
export const dishes: readonly Dish[] = raw.map((d) => ({ ...d, nameJa: names[d.name] ?? d.name }))

const byName = new Map(dishes.map((d) => [d.name, d]))

export function findDish(name: string): Dish | undefined {
  return byName.get(name)
}
