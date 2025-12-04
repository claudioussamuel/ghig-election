"use client"

import { useState, useEffect } from "react"
import VotingStepper from "@/components/voting-stepper"
import Dashboard from "@/components/dashboard"
import PinEntry from "@/components/pin-entry"
import { subscribeToPositions, subscribeToCandidates, Position, Candidate } from "@/lib/firebase/admin-service"
import { subscribeToVoteCounts } from "@/lib/firebase/voting-service"
import { isAuthenticated, hasVoted, clearPinAuth, getCurrentPin } from "@/lib/pin-auth"
import { LogOut } from "lucide-react"

export default function Home() {
  const [isAuth, setIsAuth] = useState(false)
  const [userHasVoted, setUserHasVoted] = useState(false)
  const [positions, setPositions] = useState<Position[]>([])
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [votes, setVotes] = useState<Record<string, Record<string, number>>>({})
  const [currentView, setCurrentView] = useState<"vote" | "dashboard">("vote")
  const [dataLoading, setDataLoading] = useState(true)

  // Check authentication status on mount
  useEffect(() => {
    setIsAuth(isAuthenticated())
    setUserHasVoted(hasVoted())
  }, [])

  // Subscribe to positions, candidates, and vote counts
  useEffect(() => {
    const unsubscribePositions = subscribeToPositions((positions) => {
      setPositions(positions)
      setDataLoading(false)
    })

    const unsubscribeCandidates = subscribeToCandidates((candidates) => {
      setCandidates(candidates)
    })

    const unsubscribeVotes = subscribeToVoteCounts((voteCounts) => {
      setVotes(voteCounts)
    })

    return () => {
      unsubscribePositions()
      unsubscribeCandidates()
      unsubscribeVotes()
    }
  }, [])

  const handlePinSuccess = () => {
    setIsAuth(true)
    setUserHasVoted(hasVoted())
  }

  const handleVoteComplete = async () => {
    setUserHasVoted(true)
  }

  const handleLogout = () => {
    clearPinAuth()
    setIsAuth(false)
    setUserHasVoted(false)
  }

  // Show PIN entry if not authenticated
  if (!isAuth) {
    return <PinEntry onSuccess={handlePinSuccess} />
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Navigation */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">Election Voting Platform</h1>
          <div className="flex gap-2 sm:gap-4 items-center">
            <button
              onClick={() => setCurrentView("vote")}
              className={`px-4 sm:px-6 py-2 rounded-lg font-medium transition-all text-sm sm:text-base ${currentView === "vote"
                ? "bg-primary text-primary-foreground"
                : "bg-card text-foreground hover:bg-muted"
                }`}
            >
              Vote
            </button>
            <button
              onClick={() => setCurrentView("dashboard")}
              className={`px-4 sm:px-6 py-2 rounded-lg font-medium transition-all text-sm sm:text-base ${currentView === "dashboard"
                ? "bg-primary text-primary-foreground"
                : "bg-card text-foreground hover:bg-muted"
                }`}
            >
              Results
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">Logout</span>
            </button>
          </div>
        </div>

        {/* User Info */}
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-card rounded-lg border border-border">
          <p className="text-xs sm:text-sm text-muted-foreground flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
            <span>PIN: <span className="text-foreground font-mono font-medium">{getCurrentPin()}</span></span>
            {userHasVoted && <span className="sm:ml-4 text-green-500 font-medium">✓ You have already voted</span>}
          </p>
        </div>
        {/* Content */}
        {dataLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading voting data...</p>
            </div>
          </div>
        ) : currentView === "vote" ? (
          <VotingStepper
            positions={positions}
            candidates={candidates}
            hasVoted={userHasVoted}
            onVoteComplete={handleVoteComplete}
          />
        ) : (
          <Dashboard
            positions={positions}
            candidates={candidates}
            votes={votes}
          />
        )}
      </div>
    </main>
  )
}
