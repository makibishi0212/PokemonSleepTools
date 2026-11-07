import pokemonJson from '../../data/pokemon.json'
import namesJa from '../i18n/ja/pokemons.json'

/** EXP type: total EXP from Lv1 to Lv25. Other types need 1.5x / 1.8x / 2.2x of the 600 type. */
export type ExpType = 600 | 900 | 1080 | 1320

export type Pokemon = {
  /** National Pokédex number (shared by alternate forms) */
  readonly id: number
  /** English name; unique, used as the key */
  readonly name: string
  /** Japanese display name */
  readonly nameJa: string
  readonly exp: ExpType
  readonly type: string
}

const names = namesJa as Record<string, string>

/** All Pokémon in Pokédex order. */
export const pokemons: readonly Pokemon[] = (pokemonJson as Omit<Pokemon, 'nameJa'>[])
  .map((p) => ({ ...p, nameJa: names[p.name] ?? p.name }))
  .sort((a, b) => a.id - b.id || a.name.localeCompare(b.name))

const byName = new Map(pokemons.map((p) => [p.name, p]))

export function findPokemon(name: string): Pokemon | undefined {
  return byName.get(name)
}
