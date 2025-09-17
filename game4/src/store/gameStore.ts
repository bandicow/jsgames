import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type GameType = 'rock-paper-scissors' | 'number-baseball' | 'memory-card' | 'reaction-test' | '2048' | 'tic-tac-toe'

interface GameScore {
  gameType: GameType
  score: number
  date: string
  playerName?: string
}

interface GameState {
  currentGame: GameType | null
  highScores: Record<GameType, number>
  recentScores: GameScore[]
  soundEnabled: boolean
  vibrationEnabled: boolean
  currentStreak: number
  totalGamesPlayed: number

  // Actions
  setCurrentGame: (game: GameType | null) => void
  updateHighScore: (game: GameType, score: number) => void
  addRecentScore: (score: GameScore) => void
  toggleSound: () => void
  toggleVibration: () => void
  incrementStreak: () => void
  resetStreak: () => void
  incrementTotalGames: () => void
  getHighScore: (game: GameType) => number
  clearGameData: () => void
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      currentGame: null,
      highScores: {
        'rock-paper-scissors': 0,
        'number-baseball': 0,
        'memory-card': 0,
        'reaction-test': 99999, // Lower is better for reaction test
        '2048': 0,
        'tic-tac-toe': 0
      },
      recentScores: [],
      soundEnabled: true,
      vibrationEnabled: true,
      currentStreak: 0,
      totalGamesPlayed: 0,

      setCurrentGame: (game) => set({ currentGame: game }),

      updateHighScore: (game, score) => {
        const current = get().highScores[game]
        const isReactionTest = game === 'reaction-test'

        // For reaction test, lower is better
        const shouldUpdate = isReactionTest
          ? (score < current || current === 99999)
          : score > current

        if (shouldUpdate) {
          set((state) => ({
            highScores: {
              ...state.highScores,
              [game]: score
            }
          }))
        }
      },

      addRecentScore: (score) => {
        set((state) => ({
          recentScores: [score, ...state.recentScores].slice(0, 50) // Keep last 50 scores
        }))

        // Auto-update high score
        get().updateHighScore(score.gameType, score.score)
      },

      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),

      toggleVibration: () => set((state) => ({ vibrationEnabled: !state.vibrationEnabled })),

      incrementStreak: () => set((state) => ({ currentStreak: state.currentStreak + 1 })),

      resetStreak: () => set({ currentStreak: 0 }),

      incrementTotalGames: () => set((state) => ({ totalGamesPlayed: state.totalGamesPlayed + 1 })),

      getHighScore: (game) => get().highScores[game],

      clearGameData: () => set({
        highScores: {
          'rock-paper-scissors': 0,
          'number-baseball': 0,
          'memory-card': 0,
          'reaction-test': 99999,
          '2048': 0,
          'tic-tac-toe': 0
        },
        recentScores: [],
        currentStreak: 0,
        totalGamesPlayed: 0
      })
    }),
    {
      name: 'game-storage',
      partialize: (state) => ({
        highScores: state.highScores,
        recentScores: state.recentScores.slice(0, 10), // Only persist last 10 scores
        soundEnabled: state.soundEnabled,
        vibrationEnabled: state.vibrationEnabled,
        totalGamesPlayed: state.totalGamesPlayed
      })
    }
  )
)