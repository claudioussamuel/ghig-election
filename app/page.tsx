"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import VotingStepper from "@/components/voting-stepper"
import Dashboard from "@/components/dashboard"
import { LogOut, Settings } from "lucide-react"
import { useAuth } from "@/lib/context/AuthContext"
import { subscribeToPositions, subscribeToCandidates, Position, Candidate } from "@/lib/firebase/admin-service"
import { subscribeToVoteCounts } from "@/lib/firebase/voting-service"

export default function Home() {
  const router = useRouter()
  const { user, loading, hasVoted, logOut, checkVoteStatus } = useAuth()
  const [positions, setPositions] = useState<Position[]>([])
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [votes, setVotes] = useState<Record<string, Record<string, number>>>({})
  const [currentView, setCurrentView] = useState<"vote" | "dashboard">("vote")
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth")
    }
  }, [user, loading, router])

  // Subscribe to positions, candidates, and vote counts
  useEffect(() => {
    if (!user) return

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
  }, [user])

  // Refresh vote status when returning to page
  useEffect(() => {
    if (user) {
      checkVoteStatus()
    }
  }, [user, checkVoteStatus])

  const handleVoteComplete = async () => {
    // Refresh vote status after voting
    await checkVoteStatus()
  }

  const handleLogout = async () => {
    await logOut()
    router.push("/auth")
  }

  const handleGoToAdmin = () => {
    router.push("/admin")
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Navigation */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">Election Voting Platform</h1>
          <div className="flex flex-wrap gap-2 sm:gap-4 items-center w-full sm:w-auto">
            <div className="flex gap-2 sm:gap-4 flex-1 sm:flex-initial">
              <button
                onClick={() => setCurrentView("vote")}
                className={`flex-1 sm:flex-initial px-4 sm:px-6 py-2 rounded-lg font-medium transition-all text-sm sm:text-base ${
                  currentView === "vote"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-foreground hover:bg-muted"
                }`}
              >
                Vote
              </button>
              <button
                onClick={() => setCurrentView("dashboard")}
                className={`flex-1 sm:flex-initial px-4 sm:px-6 py-2 rounded-lg font-medium transition-all text-sm sm:text-base ${
                  currentView === "dashboard"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-foreground hover:bg-muted"
                }`}
              >
                Results
              </button>
            </div>
            <button
              onClick={handleGoToAdmin}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 transition-colors"
              title="Admin Panel"
            >
              <Settings className="w-4 h-4" />
              <span className="sm:hidden text-sm">Admin</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="sm:hidden text-sm">Logout</span>
            </button>
          </div>
        </div>

        {/* User Info */}
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-card rounded-lg border border-border">
          <p className="text-xs sm:text-sm text-muted-foreground flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
            <span>Logged in as: <span className="text-foreground font-medium">{user?.email || 'Unknown'}</span></span>
            {hasVoted && <span className="sm:ml-4 text-green-500 font-medium">✓ You have already voted</span>}
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
            hasVoted={hasVoted} 
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
