export interface Candidate {
  id: string
  name: string
  position: string
  image: string
  bio: string
}

export const CANDIDATES: Candidate[] = [
  // President
  {
    id: "pres-1",
    name: "Sarah Johnson",
    position: "President",
    image: "/professional-woman-president.jpg",
    bio: "Experienced leader with 15 years in public service",
  },
  {
    id: "pres-2",
    name: "Michael Chen",
    position: "President",
    image: "/professional-man-president.jpg",
    bio: "Business executive focused on economic growth",
  },
  {
    id: "pres-3",
    name: "Emma Rodriguez",
    position: "President",
    image: "/professional-woman-leader.png",
    bio: "Community organizer dedicated to social justice",
  },

  // Vice President
  {
    id: "vp-1",
    name: "James Wilson",
    position: "Vice President",
    image: "/professional-man-vice-president.jpg",
    bio: "Policy expert with diplomatic experience",
  },
  {
    id: "vp-2",
    name: "Lisa Anderson",
    position: "Vice President",
    image: "/professional-woman-vice-president.jpg",
    bio: "Healthcare advocate and reform specialist",
  },
  {
    id: "vp-3",
    name: "David Martinez",
    position: "Vice President",
    image: "/professional-man-leader.jpg",
    bio: "Environmental scientist and sustainability expert",
  },

  // Secretary
  {
    id: "sec-1",
    name: "Patricia Lee",
    position: "Secretary",
    image: "/professional-woman-secretary.jpg",
    bio: "Administrative professional with 20 years experience",
  },
  {
    id: "sec-2",
    name: "Robert Taylor",
    position: "Secretary",
    image: "/professional-man-secretary.jpg",
    bio: "Communications specialist and public relations expert",
  },
  {
    id: "sec-3",
    name: "Jennifer White",
    position: "Secretary",
    image: "/professional-woman-administrator.jpg",
    bio: "Organizational development consultant",
  },

  // Treasurer
  {
    id: "treas-1",
    name: "Thomas Brown",
    position: "Treasurer",
    image: "/professional-man-treasurer.jpg",
    bio: "Financial analyst with expertise in budgeting",
  },
  {
    id: "treas-2",
    name: "Amanda Garcia",
    position: "Treasurer",
    image: "/professional-woman-treasurer.jpg",
    bio: "Accountant specializing in fiscal management",
  },
  {
    id: "treas-3",
    name: "Christopher Davis",
    position: "Treasurer",
    image: "/professional-man-finance.png",
    bio: "Investment advisor and financial strategist",
  },
]

export const POSITIONS = ["President", "Vice President", "Secretary", "Treasurer"]
