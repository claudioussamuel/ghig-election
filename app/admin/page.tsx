"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, Edit2, LogOut, ArrowLeft } from "lucide-react"
import { useAuth } from "@/lib/context/AuthContext"
import {
  Position,
  Candidate,
  UserProfile,
  subscribeToPositions,
  subscribeToCandidates,
  createPosition,
  updatePosition,
  deletePosition,
  createCandidate,
  updateCandidate,
  deleteCandidate,
  searchUsersByName,
} from "@/lib/firebase/admin-service"

export default function AdminPage() {
  const router = useRouter()
  const { user, loading, isAdmin, logOut } = useAuth()
  const [positions, setPositions] = useState<Position[]>([])
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [showPositionForm, setShowPositionForm] = useState(false)
  const [showCandidateForm, setShowCandidateForm] = useState(false)
  const [editingPosition, setEditingPosition] = useState<Position | null>(null)
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null)
  const [newPosition, setNewPosition] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    bio: "",
    image: "",
    user_id: "",
    email: "",
    profession: "",
  })
  const [dataLoading, setDataLoading] = useState(true)
  const [error, setError] = useState("")
  const [userSearchResults, setUserSearchResults] = useState<UserProfile[]>([])
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [searchingUsers, setSearchingUsers] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth")
    } else if (!loading && user && !isAdmin) {
      // Redirect non-admin users to home page
      router.push("/")
    }
  }, [user, loading, isAdmin, router])

  // Subscribe to positions and candidates
  useEffect(() => {
    if (!user || !isAdmin) return

    const unsubscribePositions = subscribeToPositions((positions) => {
      setPositions(positions)
      setDataLoading(false)
    })

    const unsubscribeCandidates = subscribeToCandidates((candidates) => {
      setCandidates(candidates)
    })

    return () => {
      unsubscribePositions()
      unsubscribeCandidates()
    }
  }, [user])

  const handleLogout = async () => {
    await logOut()
    router.push("/auth")
  }

  const handleAddPosition = async () => {
    if (newPosition.trim()) {
      try {
        setError("")
        await createPosition(newPosition, positions.length)
        setNewPosition("")
        setShowPositionForm(false)
      } catch (err: any) {
        setError(err.message || "Failed to create position")
      }
    }
  }

  const handleDeletePosition = async (id: string) => {
    try {
      setError("")
      await deletePosition(id)
    } catch (err: any) {
      setError(err.message || "Failed to delete position")
    }
  }

  const handleAddCandidate = async () => {
    if (formData.name && formData.position && formData.bio) {
      try {
        setError("")
        await createCandidate({
          name: formData.name,
          position: formData.position,
          bio: formData.bio,
          image: formData.image || "/placeholder.svg",
          user_id: formData.user_id,
          email: formData.email,
          profession: formData.profession,
        })
        setFormData({ name: "", position: "", bio: "", image: "", user_id: "", email: "", profession: "" })
        setShowCandidateForm(false)
        setUserSearchResults([])
        setShowUserDropdown(false)
      } catch (err: any) {
        setError(err.message || "Failed to create candidate")
      }
    }
  }

  const handleUpdateCandidate = async () => {
    if (editingCandidate && formData.name && formData.position && formData.bio) {
      try {
        setError("")
        await updateCandidate(editingCandidate.id, {
          name: formData.name,
          position: formData.position,
          bio: formData.bio,
          image: formData.image || editingCandidate.image,
          user_id: formData.user_id,
          email: formData.email,
          profession: formData.profession,
        })
        setEditingCandidate(null)
        setFormData({ name: "", position: "", bio: "", image: "", user_id: "", email: "", profession: "" })
        setShowCandidateForm(false)
        setUserSearchResults([])
        setShowUserDropdown(false)
      } catch (err: any) {
        setError(err.message || "Failed to update candidate")
      }
    }
  }

  const handleDeleteCandidate = async (id: string) => {
    try {
      setError("")
      await deleteCandidate(id)
    } catch (err: any) {
      setError(err.message || "Failed to delete candidate")
    }
  }

  const handleEditCandidate = (candidate: Candidate) => {
    setEditingCandidate(candidate)
    setFormData({
      name: candidate.name,
      position: candidate.position,
      bio: candidate.bio,
      image: candidate.image,
      user_id: candidate.user_id || "",
      email: candidate.email || "",
      profession: candidate.profession || "",
    })
    setShowCandidateForm(true)
  }

  // Handle user search
  const handleNameChange = async (value: string) => {
    setFormData({ ...formData, name: value })
    
    if (value.trim().length >= 2) {
      setSearchingUsers(true)
      try {
        const results = await searchUsersByName(value)
        setUserSearchResults(results)
        setShowUserDropdown(results.length > 0)
      } catch (err) {
        console.error('Error searching users:', err)
      } finally {
        setSearchingUsers(false)
      }
    } else {
      setUserSearchResults([])
      setShowUserDropdown(false)
    }
  }

  // Handle user selection from dropdown
  const handleSelectUser = (user: UserProfile) => {
    setFormData({
      ...formData,
      name: `${user.title} ${user.Firstname} ${user.Surname}`,
      bio: `${user.Profession} - ${user.Speciality}. ${user.Qualification} from ${user.Tertiary} (${user.Year_of_graduation}). Based in ${user.City}, ${user.country}.`,
      image: user.image_url,
      user_id: user.user_id,
      email: user.email,
      profession: user.Profession,
    })
    setUserSearchResults([])
    setShowUserDropdown(false)
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

  // Show loading while checking admin status
  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </button>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">Admin Dashboard</h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors text-sm sm:text-base"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm sm:text-base">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
          {/* Positions Section */}
          <div className="bg-card rounded-xl border border-border p-4 sm:p-6">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-foreground">Positions</h2>
              <button
                onClick={() => setShowPositionForm(!showPositionForm)}
                className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm sm:text-base"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Position</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>

            {showPositionForm && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-muted rounded-lg space-y-2 sm:space-y-3">
                <input
                  type="text"
                  value={newPosition}
                  onChange={(e) => setNewPosition(e.target.value)}
                  placeholder="Position name"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddPosition}
                    className="flex-1 px-3 sm:px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm sm:text-base"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setShowPositionForm(false)}
                    className="flex-1 px-3 sm:px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {positions.map((position) => (
                <div key={position.id} className="flex justify-between items-center p-2.5 sm:p-3 bg-muted rounded-lg">
                  <span className="text-foreground font-medium text-sm sm:text-base">{position.name}</span>
                  <button
                    onClick={() => handleDeletePosition(position.id)}
                    className="p-1.5 sm:p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Candidates Section */}
          <div className="bg-card rounded-xl border border-border p-4 sm:p-6">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-foreground">Candidates</h2>
              <button
                onClick={() => {
                  setEditingCandidate(null)
                  setFormData({ name: "", position: "", bio: "", image: "", user_id: "", email: "", profession: "" })
                  setShowCandidateForm(!showCandidateForm)
                  setUserSearchResults([])
                  setShowUserDropdown(false)
                }}
                className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm sm:text-base"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Candidate</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>

            {showCandidateForm && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-muted rounded-lg space-y-2 sm:space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Start typing candidate name..."
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
                  />
                  {searchingUsers && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                  {showUserDropdown && userSearchResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {userSearchResults.map((user) => (
                        <button
                          key={user.user_id}
                          onClick={() => handleSelectUser(user)}
                          className="w-full px-3 py-2 text-left hover:bg-muted transition-colors flex items-center gap-3 border-b border-border last:border-b-0"
                        >
                          <img
                            src={user.image_url}
                            alt={`${user.Firstname} ${user.Surname}`}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-foreground text-sm">
                              {user.title} {user.Firstname} {user.Surname}
                            </p>
                            <p className="text-xs text-muted-foreground">{user.Profession}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <select
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
                >
                  <option value="">Select Position</option>
                  {positions.map((pos) => (
                    <option key={pos.id} value={pos.name}>
                      {pos.name}
                    </option>
                  ))}
                </select>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Candidate bio"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
                  rows={2}
                />
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="Image URL"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
                />
                <div className="flex gap-2">
                  <button
                    onClick={editingCandidate ? handleUpdateCandidate : handleAddCandidate}
                    className="flex-1 px-3 sm:px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity text-sm sm:text-base"
                  >
                    {editingCandidate ? "Update" : "Save"}
                  </button>
                  <button
                    onClick={() => setShowCandidateForm(false)}
                    className="flex-1 px-3 sm:px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {candidates.map((candidate) => (
                <div key={candidate.id} className="flex justify-between items-center p-2.5 sm:p-3 bg-muted rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground font-medium text-sm sm:text-base truncate">{candidate.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{candidate.position}</p>
                  </div>
                  <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleEditCandidate(candidate)}
                      className="p-1.5 sm:p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCandidate(candidate.id)}
                      className="p-1.5 sm:p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
