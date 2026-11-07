import { describe, expect, test } from 'vitest'
import { findPokemon } from '../data/pokemons.ts'
import { calcByCandy, calcByTargetLevel, expBetween, expToNextLevel } from './levelUp.ts'

describe('calcByTargetLevel (reference values from pokesleep-tool tests, Ralts = 600 type)', () => {
  const ralts = { expType: 600 as const, boost: 'none' as const }
  test.each([
    { from: 10, to: 30, nature: 'expUp', candy: 233, shards: 19376 },
    { from: 10, to: 50, nature: 'expUp', candy: 832, shards: 138736 },
    { from: 12, to: 30, nature: 'expDown', candy: 309, shards: 26383 },
    { from: 12, to: 50, nature: 'expDown', candy: 1165, shards: 196946 },
    { from: 12, to: 50, nature: 'neutral', candy: 975, shards: 165252 },
  ] as const)('Lv$from -> Lv$to ($nature)', ({ from, to, nature, candy, shards }) => {
    expect(calcByTargetLevel({ ...ralts, nature, currentLevel: from }, to)).toEqual({ candy, shards })
  })

  test('Lv12 -> Lv50 with 75 EXP already earned', () => {
    const r = calcByTargetLevel({ ...ralts, nature: 'neutral', currentLevel: 12 }, 50, 75)
    expect(r).toEqual({ candy: 973, shards: 165091 })
  })

  test('Lv1 -> Lv30 matches the wiki cumulative table', () => {
    expect(calcByTargetLevel({ ...ralts, nature: 'neutral', currentLevel: 1 }, 30)).toEqual({
      candy: 312,
      shards: 24072,
    })
  })

  test('target at or below the current level needs nothing', () => {
    expect(calcByTargetLevel({ ...ralts, nature: 'neutral', currentLevel: 30 }, 30)).toEqual({ candy: 0, shards: 0 })
  })
})

describe('calcByCandy (in-game observations, no boost)', () => {
  /** Start mid-level: EXP already earned = required for the level - EXP still shown as remaining. */
  function fromGame(name: string, level: number, expRemaining: number) {
    const pokemon = findPokemon(name)
    if (!pokemon) throw new Error(`unknown pokemon: ${name}`)
    const expGot = expToNextLevel(level, pokemon.exp) - expRemaining
    return { expType: pokemon.exp, currentLevel: level, expGot }
  }

  // Verified in game twice. Implies 900 type Lv62 -> Lv63 = 4,465 (the wiki table says 4,466);
  // data/exp.json carries the in-game value.
  test('Tyranitar (900 type) Lv60, 1,866 EXP to go, neutral, 358 candies', () => {
    const { expType, currentLevel, expGot } = fromGame('Tyranitar', 60, 1866)
    const r = calcByCandy({ expType, nature: 'neutral', boost: 'none', currentLevel }, 358, expGot)
    expect(r).toEqual({ level: 62, candyUsed: 358, shards: 251975, expToNext: 1764 })
  })

  test('Dragonite (900 type) Lv42, 1,225 EXP to go, EXP up, 451 candies', () => {
    const { expType, currentLevel, expGot } = fromGame('Dragonite', 42, 1225)
    const r = calcByCandy({ expType, nature: 'expUp', boost: 'none', currentLevel }, 451, expGot)
    expect(r).toEqual({ level: 50, candyUsed: 451, shards: 115798, expToNext: 390 })
  })

  test('Ivysaur (600 type) Lv16, 421 EXP to go, EXP down, 1,042 candies', () => {
    const { expType, currentLevel, expGot } = fromGame('Ivysaur', 16, 421)
    const r = calcByCandy({ expType, nature: 'expDown', boost: 'none', currentLevel }, 1042, expGot)
    expect(r).toEqual({ level: 48, candyUsed: 1042, shards: 173409, expToNext: 420 })
  })

  test('Latios (1080 type) Lv29, 1,275 EXP to go, EXP down, 329 candies', () => {
    const { expType, currentLevel, expGot } = fromGame('Latios', 29, 1275)
    expect(expGot).toBe(0) // 1,275 is exactly the Lv29 -> Lv30 requirement for the 1080 type
    const r = calcByCandy({ expType, nature: 'expDown', boost: 'none', currentLevel }, 329, expGot)
    expect(r).toEqual({ level: 34, candyUsed: 329, shards: 42165, expToNext: 909 })
  })

  test('Latios (1080 type) Lv30, 1,111 EXP to go, EXP up, 329 candies', () => {
    const { expType, currentLevel, expGot } = fromGame('Latios', 30, 1111)
    const r = calcByCandy({ expType, nature: 'expUp', boost: 'none', currentLevel }, 329, expGot)
    expect(r).toEqual({ level: 37, candyUsed: 329, shards: 45960, expToNext: 1355 })
  })

  // Covers 900-type Lv52 and Lv56, where the wiki table deviates from "600 type x 1.5".
  test('Dragonite (900 type) Lv51, 1,754 EXP to go, neutral, 451 candies', () => {
    const { expType, currentLevel, expGot } = fromGame('Dragonite', 51, 1754)
    const r = calcByCandy({ expType, nature: 'neutral', boost: 'none', currentLevel }, 451, expGot)
    expect(r).toEqual({ level: 55, candyUsed: 451, shards: 159398, expToNext: 2730 })
  })

  test('Blastoise (600 type) Lv63, 393 EXP to go, EXP up, 288 candies', () => {
    const { expType, currentLevel, expGot } = fromGame('Blastoise', 63, 393)
    const r = calcByCandy({ expType, nature: 'expUp', boost: 'none', currentLevel }, 288, expGot)
    expect(r).toEqual({ level: 66, candyUsed: 288, shards: 264860, expToNext: 1041 })
  })

  test('using exactly the candy needed for a target reaches it with the same shards', () => {
    const input = { expType: 600 as const, nature: 'neutral' as const, boost: 'none' as const, currentLevel: 12 }
    const t = calcByTargetLevel(input, 50)
    const c = calcByCandy(input, t.candy)
    expect(c.level).toBe(50)
    expect(c.shards).toBe(t.shards)
    expect(c.candyUsed).toBe(t.candy)
  })

  test('stops at max level and reports the leftover candy', () => {
    const input = { expType: 600 as const, nature: 'neutral' as const, boost: 'none' as const, currentLevel: 69 }
    const c = calcByCandy(input, 10000)
    expect(c.level).toBe(70)
    expect(c.candyUsed).toBeLessThan(10000)
    expect(c.expToNext).toBe(0)
  })
})

describe('EXP tables', () => {
  test('per-type requirements come from the wiki table (not a plain multiple of the 600 type)', () => {
    expect(expBetween(4, 5, 600)).toBe(128)
    expect(expBetween(4, 5, 900)).toBe(192) // wiki example: 128 x 1.5
    expect(expBetween(2, 3, 900)).toBe(107) // 71 x 1.5 = 106.5 -> 107
    expect(expBetween(29, 30, 1080)).toBe(1275)
    expect(expBetween(1, 2, 1320)).toBe(119)
    expect(expBetween(62, 63, 900)).toBe(4465) // in-game value; wiki lists 4,466
    // Lv1 -> Lv25 totals that give the types their names
    expect(expBetween(1, 25, 600)).toBe(8668)
  })

  test('boosts double candy EXP and multiply shards by 4 (mini) or 5 (full)', () => {
    const base = { expType: 600 as const, nature: 'neutral' as const, currentLevel: 12 }
    const none = calcByTargetLevel({ ...base, boost: 'none' }, 50)
    const mini = calcByTargetLevel({ ...base, boost: 'mini' }, 50)
    const full = calcByTargetLevel({ ...base, boost: 'full' }, 50)
    expect(mini.candy).toBe(488)
    expect(mini.candy).toBe(full.candy)
    expect(full.shards / 5).toBe(mini.shards / 4)
    expect(mini.candy).toBeLessThan(none.candy)
  })
})
