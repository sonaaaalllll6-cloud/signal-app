import { useEffect } from 'react'
import { recalculateDemandScores } from '@/services/revenue'

export function useAutoRecalculate() {
  useEffect(() => {
    recalculateDemandScores() // run immediately on mount
    const interval = setInterval(recalculateDemandScores, 30 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])
}
