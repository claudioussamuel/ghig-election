"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Shield, ArrowLeft, Mail, Lock } from "lucide-react"
import { signIn } from "@/lib/firebase/auth"
import { getUserRole } from "@/lib/firebase/admin-service"

export default function AdminAuthPage() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        if (!email || !password) {
            setError("Please fill in all fields")
            setLoading(false)
            return
        }

        try {
            // Sign in with email and password
            const userCredential = await signIn(email, password)

            // Check if user has admin role
            const role = await getUserRole(userCredential.user.uid)

            if (role === "admin") {
                router.push("/admin")
            } else {
                setError("Access denied. You do not have admin privileges.")
                setLoading(false)
            }
        } catch (err: any) {
            setError(err.message || "Authentication failed. Please check your credentials.")
            setLoading(false)
        }
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-md">
                <div className="bg-card rounded-xl border border-border p-6 sm:p-8 shadow-lg">
                    <button
                        onClick={() => router.push("/")}
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm">Back to Home</span>
                    </button>

                    <div className="flex justify-center mb-4 sm:mb-6">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-500/20 rounded-full flex items-center justify-center">
                            <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-blue-500" />
                        </div>
                    </div>

                    <h1 className="text-xl sm:text-2xl font-bold text-foreground text-center mb-2">Admin Access</h1>
                    <p className="text-center text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8">
                        Sign in with your admin credentials
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">
                                <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    Email
                                </div>
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@example.com"
                                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">
                                <div className="flex items-center gap-2">
                                    <Lock className="w-4 h-4" />
                                    Password
                                </div>
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
                                disabled={loading}
                            />
                        </div>

                        {error && (
                            <div className="p-2.5 sm:p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-xs sm:text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 sm:py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                                    <span>Verifying...</span>
                                </>
                            ) : (
                                <>
                                    <Shield className="w-4 h-4" />
                                    <span>Sign In as Admin</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 sm:mt-8 space-y-2">
                        <p className="text-center text-muted-foreground text-xs sm:text-sm">
                            Only authorized administrators can access this area
                        </p>
                        <p className="text-center text-muted-foreground text-xs">
                            Contact your system administrator if you need access
                        </p>
                    </div>
                </div>
            </div>
        </main>
    )
}
