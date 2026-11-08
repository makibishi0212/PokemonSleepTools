import ingredientJson from '../../data/ingredients.json'
import namesJa from '../i18n/ja/ingredients.json'

export type Ingredient = {
  /** English name; unique, used as the key */
  readonly name: string
  /** Japanese display name */
  readonly nameJa: string
  /** Base strength (energy) of one ingredient */
  readonly power: number
}

const names = namesJa as Record<string, string>

/** All ingredients in data order. */
export const ingredients: readonly Ingredient[] = (ingredientJson as Omit<Ingredient, 'nameJa'>[]).map(
  (i) => ({ ...i, nameJa: names[i.name] ?? i.name }),
)

const byName = new Map(ingredients.map((i) => [i.name, i]))

export function findIngredient(name: string): Ingredient | undefined {
  return byName.get(name)
}

/** Position of an ingredient in the data order (unknown names sort last). */
export function ingredientOrder(name: string): number {
  const i = ingredients.findIndex((x) => x.name === name)
  return i < 0 ? ingredients.length : i
}
