import { describe, expect, test } from 'vitest'
import { parseCount, sumIngredients, validateDishPlan } from './dishPlan.ts'

describe('sumIngredients', () => {
  test('adds up the ingredients of every dish times its count', () => {
    const s = sumIngredients([
      { id: 1, dishName: 'Dream Eater Butter Curry', count: '3' }, // ぜったいねむりバターカレー
      { id: 2, dishName: 'Ninja Curry', count: '1' },
    ])
    expect(s).not.toBeNull()
    const byName = Object.fromEntries(s!.items.map((i) => [i.name, i.count]))
    expect(byName).toEqual({
      'Soft Potato': 54,
      'Snoozy Tomato': 45,
      'Soothing Cacao': 36,
      'Moomoo Milk': 30,
      'Greengrass Soybeans': 24,
      'Large Leek': 12,
      'Bean Sausage': 9,
      'Tasty Mushroom': 5,
    })
    expect(s!.total).toBe(54 + 45 + 36 + 30 + 24 + 12 + 9 + 5)
    // Most needed first
    expect(s!.items.map((i) => i.count)).toEqual([...s!.items.map((i) => i.count)].sort((a, b) => b - a))
  })

  test('a count of 0 contributes nothing; an empty plan list is empty', () => {
    expect(sumIngredients([{ id: 1, dishName: 'Ninja Curry', count: '0' }])).toEqual({ items: [], total: 0 })
    expect(sumIngredients([])).toEqual({ items: [], total: 0 })
  })

  test('invalid input makes the summary unknown', () => {
    expect(sumIngredients([{ id: 1, dishName: 'Ninja Curry', count: '' }])).toBeNull()
    expect(sumIngredients([{ id: 1, dishName: 'Ninja Curry', count: '-1' }])).toBeNull()
    expect(sumIngredients([{ id: 1, dishName: 'No Such Dish', count: '1' }])).toBeNull()
  })
})

test('parseCount / validateDishPlan', () => {
  expect(parseCount(' 12 ')).toBe(12)
  expect(parseCount('1.5')).toBeNull()
  expect(validateDishPlan({ id: 1, dishName: 'Ninja Curry', count: '2' }).isValid).toBe(true)
  expect(validateDishPlan({ id: 1, dishName: 'Ninja Curry', count: 'x' }).isValid).toBe(false)
})
