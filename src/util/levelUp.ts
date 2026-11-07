import expJson from '../../data/exp.json'
import shardsJson from '../../data/dreamShards.json'
import type { ExpType } from '../data/pokemons.ts'

/** Candy boost event */
export type Boost = 'none' | 'mini' | 'full'

/** Nature effect on EXP gains */
export type Nature = 'neutral' | 'expDown' | 'expUp'

export const boosts: readonly { value: Boost; label: string }[] = [
  { value: 'none', label: '通常' },
  { value: 'mini', label: 'ミニアメブースト' },
  { value: 'full', label: 'アメブースト' },
]

export type NatureInfo = {
  value: Nature
  label: string
  /** One-character icon used in compact UI */
  icon: string
  description: string
}

export const natures: readonly NatureInfo[] = [
  { value: 'neutral', label: '通常', icon: '－', description: '性格: 通常（アメ1個のEXPは標準）' },
  { value: 'expDown', label: 'EXPダウン', icon: '▼', description: '性格: EXPダウン（アメ1個のEXPが減る）' },
  { value: 'expUp', label: 'EXPアップ', icon: '▲', description: '性格: EXPアップ（アメ1個のEXPが増える）' },
]

export function natureInfo(nature: Nature): NatureInfo {
  return natures.find((n) => n.value === nature) ?? natures[0]
}

/** Required EXP per level, keyed by EXP type then level ("2".."70"), from the wiki's per-type table. */
const expTables = expJson as Record<string, Record<string, number>>
const shardsTable = shardsJson as Record<string, number>

const expTypes: readonly ExpType[] = [600, 900, 1080, 1320]

/** Highest level in the EXP table. */
export const maxLevel = Math.max(...Object.keys(expTables['600']).map(Number))
export const minLevel = 1

/** totalExp[type][level] = EXP from Lv1 to `level`. */
const totalExp: Record<ExpType, number[]> = { 600: [], 900: [], 1080: [], 1320: [] }
for (const type of expTypes) {
  const total = [0, 0]
  for (let level = 2; level <= maxLevel; level++) {
    total[level] = total[level - 1] + expTables[String(type)][String(level)]
  }
  totalExp[type] = total
}

/** shardsPerCandy[level] = dream shards per candy while leveling up to `level`. */
const shardsPerCandy: number[] = [0, 0]
for (let level = 2; level <= maxLevel; level++) {
  shardsPerCandy[level] = shardsTable[String(level)]
}

/** EXP needed to go from `from` to `to` for the given EXP type. */
export function expBetween(from: number, to: number, expType: ExpType): number {
  return totalExp[expType][to] - totalExp[expType][from]
}

/** EXP gained from one candy at `level`. */
export function expPerCandy(level: number, nature: Nature, boost: Boost): number {
  const base =
    level < 25
      ? { neutral: 40, expUp: 47, expDown: 33 }[nature]
      : level < 30
        ? { neutral: 35, expUp: 41, expDown: 29 }[nature]
        : { neutral: 25, expUp: 30, expDown: 21 }[nature]
  return boost === 'none' ? base : base * 2
}

/** Dream shard multiplier during a boost event. */
function shardRate(boost: Boost): number {
  return boost === 'none' ? 1 : boost === 'mini' ? 4 : 5
}

export type PlanInput = {
  expType: ExpType
  nature: Nature
  boost: Boost
  currentLevel: number
}

export type TargetLevelResult = {
  /** Candy required */
  candy: number
  /** Dream shards required */
  shards: number
}

/** EXP still needed to go from `level` to the next one (0 at max level). */
export function expToNextLevel(level: number, expType: ExpType): number {
  if (level < minLevel || level >= maxLevel) return 0
  return expBetween(level, level + 1, expType)
}

/**
 * Candy and dream shards needed to reach `targetLevel`.
 * @param expGot EXP already earned within the current level.
 */
export function calcByTargetLevel(
  input: PlanInput,
  targetLevel: number,
  expGot: number = 0,
): TargetLevelResult {
  const { expType, nature, boost, currentLevel } = input
  if (currentLevel >= targetLevel) {
    return { candy: 0, shards: 0 }
  }
  let candy = 0
  let shards = 0
  let carry = expGot // surplus EXP carried into the next level
  for (let level = currentLevel; level < targetLevel; level++) {
    const required = expBetween(level, level + 1, expType) - carry
    const perCandy = expPerCandy(level, nature, boost)
    const used = Math.ceil(required / perCandy)
    candy += used
    shards += shardsPerCandy[level + 1] * used * shardRate(boost)
    carry = perCandy * used - required
  }
  return { candy, shards }
}

export type CandyResult = {
  /** Level reached after using the candy */
  level: number
  /** Candy actually consumed (stops at maxLevel) */
  candyUsed: number
  /** Dream shards required */
  shards: number
  /** EXP still needed for the next level after using the candy (0 at max level) */
  expToNext: number
}

/**
 * Level reached and dream shards needed when using `candy` candies.
 * @param expGot EXP already earned within the current level.
 */
export function calcByCandy(input: PlanInput, candy: number, expGot: number = 0): CandyResult {
  const { expType, nature, boost, currentLevel } = input
  let candyLeft = Math.max(0, Math.floor(candy))
  let shards = 0
  let carry = expGot
  let level = currentLevel
  while (level < maxLevel && candyLeft > 0) {
    const required = expBetween(level, level + 1, expType) - carry
    const perCandy = expPerCandy(level, nature, boost)
    const needed = Math.ceil(required / perCandy)
    const used = Math.min(needed, candyLeft)
    shards += shardsPerCandy[level + 1] * used * shardRate(boost)
    candyLeft -= used
    if (used < needed) {
      carry += perCandy * used // ran out of candy before the next level
      break
    }
    carry = perCandy * used - required
    level++
  }
  const expToNext = level >= maxLevel ? 0 : expBetween(level, level + 1, expType) - carry
  return { level, candyUsed: Math.max(0, Math.floor(candy)) - candyLeft, shards, expToNext }
}
