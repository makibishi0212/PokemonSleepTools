import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Served from https://makibishi0212.github.io/PokemonSleepTools/
  base: '/PokemonSleepTools/',
  plugins: [react()],
})
