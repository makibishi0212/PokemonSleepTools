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

const expTable = expJson as Record<string, number>
const shardsTable = shardsJson as Record<string, number>

/** Highest level in the EXP table. */
export const maxLevel = Math.max(...Object.keys(expTable).map(Number))
export const minLevel = 1

/** totalExp[level] = EXP from Lv1 to `level` for the 600 type. */
const totalExp: number[] = [0, 0]
for (let level = 2; level <= maxLevel; level++) {
  totalExp[level] = totalExp[level - 1] + expTable[String(level)]
}

/** shardsPerCandy[level] = dream shards per candy while leveling up to `level`. */
const shardsPerCandy: number[] = [0, 0]
for (let level = 2; level <= maxLevel; level++) {
  shardsPerCandy[level] = shardsTable[String(level)]
}

const expTypeRate: Record<ExpType, number> = { 600: 1, 900: 1.5, 1080: 1.8, 1320: 2.2 }

/** EXP needed to go from `from` to `to` for the given EXP type. */
export function expBetween(from: number, to: number, expType: ExpType): number {
  const rate = expTypeRate[expType]
  return Math.round(totalExp[to] * rate) - Math.round(totalExp[from] * rate)
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

/** Candy and dream shards needed to reach `targetLevel`. */
export function calcByTargetLevel(input: PlanInput, targetLevel: number): TargetLevelResult {
  const { expType, nature, boost, currentLevel } = input
  if (currentLevel >= targetLevel) {
    return { candy: 0, shards: 0 }
  }
  let candy = 0
  let shards = 0
  let carry = 0 // surplus EXP carried into the next level
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
}

/** Level reached and dream shards needed when using `candy` candies. */
export function calcByCandy(input: PlanInput, candy: number): CandyResult {
  const { expType, nature, boost, currentLevel } = input
  let candyLeft = Math.max(0, Math.floor(candy))
  let shards = 0
  let carry = 0
  let level = currentLevel
  while (level < maxLevel && candyLeft > 0) {
    const required = expBetween(level, level + 1, expType) - carry
    const perCandy = expPerCandy(level, nature, boost)
    const needed = Math.ceil(required / perCandy)
    const used = Math.min(needed, candyLeft)
    shards += shardsPerCandy[level + 1] * used * shardRate(boost)
    candyLeft -= used
    if (used < needed) {
      break // ran out of candy before the next level
    }
    carry = perCandy * used - required
    level++
  }
  return { level, candyUsed: Math.max(0, Math.floor(candy)) - candyLeft, shards }
}
