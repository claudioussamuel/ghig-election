"use client"

import { useState } from "react"
import { ChevronRight, ChevronLeft, Check } from "lucide-react"
import { Position, Candidate } from "@/lib/firebase/admin-service"
import { submitVotes } from "@/lib/firebase/voting-service"

interface VotingStepperProps {
  positions: Position[]
  candidates: Candidate[]
  hasVoted: boolean
  onVoteComplete: () => Promise<void>
}

export default function VotingStepper({ positions, candidates, hasVoted, onVoteComplete }: VotingStepperProps) {
  const [currentPositionIndex, setCurrentPositionIndex] = useState(0)
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null)
  const [votes, setVotes] = useState<Record<string, { candidateId: string; candidateName: string }>>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const currentPosition = positions[currentPositionIndex]?.name || ""
  const positionCandidates = candidates.filter((c) => c.position === currentPosition)
  const progress = ((currentPositionIndex + 1) / positions.length) * 100

  const handleSelectCandidate = (candidateId: string) => {
    setSelectedCandidateId(candidateId)
  }

  const handleNext = () => {
    if (selectedCandidateId) {
      const candidate = candidates.find((c) => c.id === selectedCandidateId)
      if (candidate) {
        // Save the vote for current position
        setVotes((prev) => ({
          ...prev,
          [currentPosition]: {
            candidateId: selectedCandidateId,
            candidateName: candidate.name,
          },
        }))
        setSelectedCandidateId(null)

        // Move to next position if not the last one
        if (currentPositionIndex < positions.length - 1) {
          setCurrentPositionIndex(currentPositionIndex + 1)
        }
      }
    }
  }

  const handlePrev = () => {
    if (currentPositionIndex > 0) {
      setCurrentPositionIndex(currentPositionIndex - 1)
      const prevPosition = positions[currentPositionIndex - 1]?.name || ""
      setSelectedCandidateId(votes[prevPosition]?.candidateId || null)
    }
  }

  const handleSubmit = async () => {
    // First, save the current selection if there is one
    let finalVotes = { ...votes }
    
    if (selectedCandidateId) {
      const candidate = candidates.find((c) => c.id === selectedCandidateId)
      if (candidate) {
        finalVotes = {
          ...finalVotes,
          [currentPosition]: {
            candidateId: selectedCandidateId,
            candidateName: candidate.name,
          },
        }
      }
    }
    
    console.log('Submit clicked. Final votes:', finalVotes)
    console.log('Positions length:', positions.length)
    console.log('Votes count:', Object.keys(finalVotes).length)
    
    if (Object.keys(finalVotes).length !== positions.length) {
      setError(`Please vote for all ${positions.length} positions. You have voted for ${Object.keys(finalVotes).length}.`)
      return
    }
    
    setSubmitting(true)
    setError("")
    try {
      console.log('Submitting votes to Firebase...')
      await submitVotes(finalVotes)
      console.log('Votes submitted successfully')
      await onVoteComplete()
      console.log('Vote complete callback executed')
    } catch (err: any) {
      console.error('Error submitting votes:', err)
      setError(err.message || "Failed to submit votes. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (hasVoted) {
    return (
      <div className="flex items-center justify-center min-h-[300px] sm:min-h-[500px] px-4">
        <div className="text-center space-y-4 sm:space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-500/20 rounded-full flex items-center justify-center">
              <Check className="w-8 h-8 sm:w-10 sm:h-10 text-green-500" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">Thank You for Voting!</h2>
            <p className="text-sm sm:text-base text-muted-foreground px-4">Your votes have been recorded successfully. You cannot vote again.</p>
          </div>

        </div>
      </div>
    )
  }

  // Show message if no positions or candidates
  if (positions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[300px] sm:min-h-[500px] px-4">
        <div className="text-center space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">No Voting Positions Available</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            The admin hasn't set up any voting positions yet. Please check back later.
          </p>
        </div>
      </div>
    )
  }

  if (positionCandidates.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[300px] sm:min-h-[500px] px-4">
        <div className="text-center space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">No Candidates Available</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            There are no candidates for {currentPosition}. Please contact the admin.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-6 sm:mb-8">
        <div className="flex justify-between items-center mb-2 sm:mb-3">
          <span className="text-xs sm:text-sm font-medium text-muted-foreground">
            Position {currentPositionIndex + 1} of {positions.length}
          </span>
          <span className="text-xs sm:text-sm font-medium text-muted-foreground">{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Position Indicators */}
      <div className="flex justify-between mb-6 sm:mb-12 gap-1 sm:gap-2">
        {positions.map((position, index) => (
          <div key={position.id} className="flex flex-col items-center gap-1 sm:gap-2 flex-1">
            <div
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold transition-all text-sm sm:text-base ${
                index <= currentPositionIndex ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {index + 1}
            </div>
            <span className="text-[10px] sm:text-xs text-muted-foreground text-center leading-tight">{position.name}</span>
          </div>
        ))}
      </div>

      {/* Current Position Title */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center">Vote for {currentPosition}</h2>
        <p className="text-center text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">Select your preferred candidate</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {positionCandidates.map((candidate) => (
          <div
            key={candidate.id}
            onClick={() => handleSelectCandidate(candidate.id)}
            className={`cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${
              selectedCandidateId === candidate.id
                ? "border-primary bg-primary/5 shadow-lg"
                : "border-border hover:border-primary/50 hover:shadow-md"
            }`}
          >
            <div className="aspect-square overflow-hidden bg-muted">
              <img
                src={candidate.image || "/placeholder.svg"}
                alt={candidate.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-3 sm:p-4">
              <h3 className="font-bold text-foreground text-base sm:text-lg">{candidate.name}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">{candidate.bio}</p>
              <div className="mt-3 sm:mt-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSelectCandidate(candidate.id)
                  }}
                  className={`w-full py-2 rounded-lg font-medium transition-all text-sm sm:text-base ${
                    selectedCandidateId === candidate.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground hover:bg-muted/80"
                  }`}
                >
                  {selectedCandidateId === candidate.id ? "✓ Selected" : "Select"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center gap-2 sm:gap-4">
        <button
          onClick={handlePrev}
          disabled={currentPositionIndex === 0}
          className="flex items-center gap-1 sm:gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-card text-foreground rounded-lg font-medium hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Previous</span>
          <span className="sm:hidden">Prev</span>
        </button>

        <div className="flex-1" />

        {error && (
          <div className="col-span-full p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
            {error}
          </div>
        )}

        {currentPositionIndex === positions.length - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={!selectedCandidateId || submitting}
            className="flex items-center gap-1 sm:gap-2 px-4 sm:px-8 py-2 sm:py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <span className="hidden sm:inline">Submit Votes</span>
                <span className="sm:hidden">Submit</span>
                <Check className="w-4 h-4" />
              </>
            )}
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={!selectedCandidateId}
            className="flex items-center gap-1 sm:gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
