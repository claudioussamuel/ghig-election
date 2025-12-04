"use client"

import { useState } from "react"
import { Lock } from "lucide-react"
import { isValidPin, setPinAuth } from "@/lib/pin-auth"

interface PinEntryProps {
    onSuccess: () => void
}

export default function PinEntry({ onSuccess }: PinEntryProps) {
    const [pin, setPin] = useState("")
    const [error, setError] = useState("")

    const handlePinChange = (value: string) => {
        // Only allow digits
        const digitsOnly = value.replace(/\D/g, "")
        // Limit to 6 digits
        setPin(digitsOnly.slice(0, 6))
        setError("")
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!isValidPin(pin)) {
            setError("Please enter a 6-digit PIN")
            return
        }

        try {
            setPinAuth(pin)
            onSuccess()
        } catch (err: any) {
            setError(err.message || "Invalid PIN")
        }
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
                        Enter your 6-digit PIN to access the voting platform
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-foreground mb-2">
                                PIN Code
                            </label>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={pin}
                                onChange={(e) => handlePinChange(e.target.value)}
                                placeholder="000000"
                                maxLength={6}
                                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-center text-2xl tracking-widest font-mono"
                                autoFocus
                            />
                            <p className="text-xs text-muted-foreground mt-2 text-center">
                                {pin.length}/6 digits
                            </p>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm text-center">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={pin.length !== 6}
                            className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed text-base"
                        >
                            Continue
                        </button>
                    </form>

                    <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                        <p className="text-xs text-muted-foreground text-center">
                            🔒 Your PIN is used to identify you and prevent duplicate voting.
                            Keep it secure and don't share it with others.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    )
}
