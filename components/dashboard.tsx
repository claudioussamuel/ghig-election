"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Position, Candidate } from "@/lib/firebase/admin-service"

interface DashboardProps {
  positions: Position[]
  candidates: Candidate[]
  votes: Record<string, Record<string, number>>
}

const CHART_COLORS = [
  "hsl(var(--color-chart-1))",
  "hsl(var(--color-chart-2))",
  "hsl(var(--color-chart-3))",
  "hsl(var(--color-chart-4))",
]

export default function Dashboard({ positions, candidates, votes }: DashboardProps) {
  const positionResults = useMemo(() => {
    return positions.map((position) => {
      const positionVotes = votes[position.name] || {}
      const totalVotes = Object.values(positionVotes).reduce((sum, count) => sum + count, 0)
      const positionCandidates = candidates.filter((c) => c.position === position.name)

      const results = positionCandidates.map((candidate) => ({
        id: candidate.id,
        name: candidate.name,
        image: candidate.image,
        votes: positionVotes[candidate.id] || 0,
        percentage: totalVotes > 0 ? (((positionVotes[candidate.id] || 0) / totalVotes) * 100).toFixed(1) : "0",
      }))

      const winner = results.length > 0 ? results.reduce((prev, current) => (prev.votes > current.votes ? prev : current), results[0]) : null

      return {
        position: position.name,
        results,
        totalVotes,
        winner,
      }
    })
  }, [positions, candidates, votes])

  const totalAllVotes = useMemo(() => {
    return Object.values(votes).reduce((sum, positionVotes) => {
      return sum + Object.values(positionVotes).reduce((s, count) => s + count, 0)
    }, 0)
  }, [votes])

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Total Votes Cast</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-foreground">{totalAllVotes}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">Positions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-foreground">{positions.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Results by Position */}
      {positionResults.map((positionResult) => (
        <div key={positionResult.position} className="space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
            <h3 className="text-xl sm:text-2xl font-bold text-foreground">{positionResult.position}</h3>
            <span className="text-xs sm:text-sm text-muted-foreground">{positionResult.totalVotes} total votes</span>
          </div>

          {/* Candidate Cards with Pictures */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {positionResult.results.map((result, index) => (
              <Card
                key={result.id}
                className={
                  positionResult.winner && result.votes === positionResult.winner.votes && result.votes > 0 ? "border-primary border-2" : ""
                }
              >
                <CardContent className="pt-4 sm:pt-6">
                  <div className="space-y-3 sm:space-y-4">
                    {/* Candidate Image */}
                    <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                      <img
                        src={result.image || "/placeholder.svg"}
                        alt={result.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Candidate Info */}
                    <div>
                      <h4 className="font-bold text-foreground text-base sm:text-lg">{result.name}</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        {result.votes} votes ({result.percentage}%)
                      </p>
                    </div>

                    {/* Vote Bar */}
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${result.percentage}%` }}
                      />
                    </div>

                    {/* Winner Badge */}
                    {positionResult.winner && result.votes === positionResult.winner.votes && result.votes > 0 && (
                      <div className="text-center py-2 bg-primary/10 rounded-lg">
                        <span className="text-xs sm:text-sm font-bold text-primary">🏆 Leading</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <hr className="my-6 sm:my-8" />
        </div>
      ))}
    </div>
  )
}
