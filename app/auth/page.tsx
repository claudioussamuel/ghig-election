"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Lock, AlertCircle } from "lucide-react"
import { useAuth } from "@/lib/context/AuthContext"
import PinInput from "@/components/pin-input"
import { getUserByEmail } from "@/lib/firebase/admin-service"
import { generatePinFromEmail } from "@/lib/firebase/auth"


function AuthContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email")

  const { signInWithPin } = useAuth()
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [checkingUser, setCheckingUser] = useState(true)
  const [isRestricted, setIsRestricted] = useState(false)
  const [restrictionReason, setRestrictionReason] = useState<"student" | "debt" | null>(null)

  useEffect(() => {
    async function checkUser() {
      if (!email) {
        setCheckingUser(false)
        return
      }

      try {
        const user = await getUserByEmail(email)

        if (user) {
          // Check for restrictions
          // Logic from Flutter:
          // final hasFunding = user?.fundingInstitution != null &&
          //     user?.fundingInstitution != "Self" &&
          //     user!.fundingInstitution!.isNotEmpty;

          // final isRestricted = user != null &&
          //     !hasFunding &&
          //     (user.membership == "SMGhIG" ||
          //         (user.debit != null && user.debit! < -10));

          const hasFunding = user.Funding_Institution &&
            user.Funding_Institution !== "Self" &&
            user.Funding_Institution.trim().length > 0;

          if (!hasFunding) {
            if (user.Membership === "SMGhIG") {
              setIsRestricted(true)
              setRestrictionReason("student")
            } else if (user.debit !== undefined && user.debit < -10) {
              setIsRestricted(true)
              setRestrictionReason("debt")
            }
          }
        }
      } catch (err) {
        console.error("Error checking user:", err)
      } finally {
        setCheckingUser(false)
      }
    }

    checkUser()
  }, [email])

  const accessCode = email ? generatePinFromEmail(email) : null

  const handlePinComplete = async (completedPin: string) => {
    setError("")
    setLoading(true)

    try {
      await signInWithPin(completedPin, email || undefined)
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

  if (checkingUser) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!email) {
    return (
      <div className="w-full max-w-md">
        <div className="bg-card rounded-xl border border-destructive/20 p-6 sm:p-8 shadow-lg">
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-destructive" />
            </div>
          </div>
          <h1 className="text-xl font-bold text-foreground text-center mb-2">Access Restricted</h1>
          <p className="text-center text-muted-foreground">
            Please use the official channel or link to access this voting page.
          </p>
        </div>
      </div>
    )
  }

  if (isRestricted) {
    return (
      <div className="w-full max-w-md">
        <div className="bg-card rounded-xl border border-destructive/20 p-6 sm:p-8 shadow-lg">
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-destructive" />
            </div>
          </div>
          <h1 className="text-xl font-bold text-foreground text-center mb-2">Access Restricted</h1>
          <p className="text-center text-muted-foreground">
            {restrictionReason === "student"
              ? "Students are not eligible to vote."
              : "Please clear your outstanding debt to access the election portal."}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-card rounded-xl border border-border p-6 sm:p-8 shadow-lg">
        <div className="flex justify-center mb-4 sm:mb-6">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary/20 rounded-full flex items-center justify-center">
            <Lock className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-foreground text-center mb-2">Election Voting</h1>

        <div className="bg-muted/50 rounded-lg p-4 mb-6 text-center border border-border/50">
          <p className="text-xs text-muted-foreground mb-1">Authenticated as</p>
          <p className="text-sm font-medium text-foreground mb-3">{email}</p>
          <div className="border-t border-border/50 my-2"></div>
          <p className="text-xs text-muted-foreground mb-1">Your Access Code</p>
          <p className="text-2xl font-mono font-bold text-primary tracking-wider">{accessCode}</p>
          <p className="text-[10px] text-muted-foreground mt-1">Enter this code below to vote</p>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <div>
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
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center px-4 py-8">
      <Suspense fallback={
        <div className="flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      }>
        <AuthContent />
        {/* We will let you in when it is time for election */}
      </Suspense>
    </main>
  )
}
