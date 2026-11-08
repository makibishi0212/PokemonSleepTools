import { type Dish, findDish } from '../data/dishes.ts'
import { ingredientOrder } from '../data/ingredients.ts'

/** One dish to cook, as entered by the user. */
export type DishPlan = {
  id: number
  /** Dish (English name) */
  dishName: string
  /** How many times to cook it; kept as a raw string so typing is never blocked */
  count: string
}

export type DishPlanValidation = {
  dish: Dish | undefined
  /** null when the count is not a non-negative integer */
  count: number | null
  isValid: boolean
}

/** Non-negative integer, or null. */
export function parseCount(text: string): number | null {
  const trimmed = text.trim()
  return /^\d+$/.test(trimmed) ? Number(trimmed) : null
}

export function validateDishPlan(plan: DishPlan): DishPlanValidation {
  const dish = findDish(plan.dishName)
  const count = parseCount(plan.count)
  return { dish, count, isValid: dish !== undefined && count !== null }
}

export type IngredientTotal = {
  /** Ingredient (English name) */
  name: string
  count: number
}

export type IngredientSummary = {
  /** Ingredients needed (count > 0), most needed first */
  items: IngredientTotal[]
  /** Sum of all ingredient counts */
  total: number
}

/**
 * Ingredients needed to cook every plan; null while any plan has invalid input.
 * Ties are broken by the ingredient data order.
 */
export function sumIngredients(plans: readonly DishPlan[]): IngredientSummary | null {
  const totals = new Map<string, number>()
  for (const plan of plans) {
    const { dish, count } = validateDishPlan(plan)
    if (!dish || count === null) return null
    for (const [name, n] of Object.entries(dish.ingredients)) {
      totals.set(name, (totals.get(name) ?? 0) + n * count)
    }
  }
  const items = [...totals]
    .filter(([, count]) => count > 0)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || ingredientOrder(a.name) - ingredientOrder(b.name))
  return { items, total: items.reduce((sum, i) => sum + i.count, 0) }
}
