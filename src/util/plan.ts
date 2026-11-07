import type { ExpType } from '../data/pokemons.ts'
import { type Nature, expToNextLevel, maxLevel, minLevel } from './levelUp.ts'

/** How the amount of leveling is specified. */
export type PlanMode = 'candy' | 'target'

/**
 * One leveling plan as entered by the user.
 * Numeric fields are kept as raw strings so typing is never blocked;
 * `validatePlan` turns them into numbers or flags them as errors.
 */
export type Plan = {
  id: number
  pokemonName: string
  nature: Nature
  currentLevel: string
  mode: PlanMode
  /** Candy to use (mode === 'candy') */
  candy: string
  /** Level to reach (mode === 'target') */
  targetLevel: string
  /** EXP still needed for the next level ('' = not set, i.e. just leveled up) */
  expToNext: string
}

/** Computed values of a plan. */
export type PlanResult = {
  /** Level after leveling */
  level: number
  /** Candy required / consumed */
  candy: number
  /** Dream shards required */
  shards: number
}

/** Parsed input values; `null` means the field is invalid. */
export type PlanValidation = {
  currentLevel: number | null
  /** Only meaningful when mode === 'target' */
  targetLevel: number | null
  /** Only meaningful when mode === 'candy' */
  candy: number | null
  /** EXP already earned within the current level (0 when not set); null when invalid */
  expGot: number | null
  /** true when every field used by the current mode is valid */
  isValid: boolean
}

function parseInteger(text: string): number | null {
  const trimmed = text.trim()
  return /^\d+$/.test(trimmed) ? Number(trimmed) : null
}

/** Integer level within [minLevel, maxLevel], or null. */
export function parseLevel(text: string): number | null {
  const n = parseInteger(text)
  return n !== null && n >= minLevel && n <= maxLevel ? n : null
}

/** Non-negative integer count, or null. */
export function parseCount(text: string): number | null {
  return parseInteger(text)
}

export function validatePlan(plan: Plan, expType: ExpType): PlanValidation {
  const currentLevel = parseLevel(plan.currentLevel)
  let targetLevel: number | null = null
  let candy: number | null = null
  let isValid = currentLevel !== null

  // Optional detail: EXP still needed for the next level, within 1..required.
  let expGot: number | null = 0
  if (plan.expToNext.trim() !== '') {
    const required = currentLevel === null ? 0 : expToNextLevel(currentLevel, expType)
    const n = parseInteger(plan.expToNext)
    expGot = required > 0 && n !== null && n >= 1 && n <= required ? required - n : null
    isValid &&= expGot !== null
  }

  if (plan.mode === 'target') {
    targetLevel = parseLevel(plan.targetLevel)
    // The target must not be below the current level (equal = nothing to do).
    if (targetLevel !== null && currentLevel !== null && targetLevel < currentLevel) {
      targetLevel = null
    }
    isValid &&= targetLevel !== null
  } else {
    candy = parseCount(plan.candy)
    isValid &&= candy !== null
  }

  return { currentLevel, targetLevel, candy, expGot, isValid }
}
