"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Lock } from "lucide-react"
import { useAuth } from "@/lib/context/AuthContext"
import PinInput from "@/components/pin-input"

export default function AuthPage() {
  const router = useRouter()
  const { signInWithPin } = useAuth()
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handlePinComplete = async (completedPin: string) => {
    setError("")
    setLoading(true)

    try {
      await signInWithPin(completedPin)
      router.push("/")
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please try again.")
      setPin("")
      setLoading(false)
    }
  }

  const handlePinChange = (newPin: string) => {
    setPin(newPin)
    setError("")
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-xl border border-border p-6 sm:p-8 shadow-lg">
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary/20 rounded-full flex items-center justify-center">
              <Lock className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
            </div>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-foreground text-center mb-2">Election Voting</h1>
          <p className="text-center text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8">
            Enter your 6-digit PIN to vote
          </p>

          <div className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-foreground mb-3 sm:mb-4 text-center">
                Enter PIN
              </label>
              <PinInput
                length={6}
                value={pin}
                onChange={handlePinChange}
                onComplete={handlePinComplete}
                disabled={loading}
                error={!!error}
              />
            </div>

            {error && (
              <div className="p-2.5 sm:p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-xs sm:text-sm text-center">
                {error}
              </div>
            )}

            {loading && (
              <div className="flex items-center justify-center gap-2 text-sm sm:text-base text-muted-foreground">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span>Authenticating...</span>
              </div>
            )}
          </div>

          <div className="mt-6 sm:mt-8 space-y-2">
            <p className="text-center text-muted-foreground text-xs sm:text-sm">
              Enter any 6-digit PIN to create or access your account
            </p>
            <p className="text-center text-muted-foreground text-xs">
              Remember your PIN - you'll need it to vote again
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
