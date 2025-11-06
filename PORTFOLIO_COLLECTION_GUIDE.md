# Portfolio Collection Guide

## Overview
This guide explains the portfolio collection structure that references user data from the existing `users` collection.

## Collection Structure

### `portfolio` Collection

Each portfolio document contains:

```typescript
{
  id: string;                    // Auto-generated document ID
  user_id: string;               // References user_id from users collection
  title: string;                 // Portfolio item title
  description: string;           // Detailed description of the work
  category: string;              // "Survey", "Geospatial Analysis", "Research", "Project"
  image_url?: string;            // Optional project image (falls back to user's image_url)
  project_date: string;          // When the project was completed
  location?: string;             // Project location
  skills_used: string[];         // Array of skills/technologies
  client?: string;               // Client name (optional)
  status: 'completed' | 'ongoing' | 'planned';
  featured: boolean;             // Whether to feature this item
  created_at: Timestamp;         // When portfolio item was created
  updated_at: Timestamp;         // Last update time
}
```

## User Data Integration

The portfolio system automatically fetches user data from the `users` collection:

**User fields used:**
- `user_id` - To link portfolio items
- `email` - User's email
- `Firstname` + `Surname` + `title` - Full name (e.g., "Mr Desmond Karikari Osei")
- `image_url` - Profile picture (used if portfolio item has no image)
- `Profession` - User's profession
- `job_title` - Current job title
- `Speciality` - Area of specialization
- `Interest` - Professional interests

## Example Portfolio Item

```typescript
{
  id: "portfolio-123",
  user_id: "1739",
  title: "Geospatial Analysis of Urban Development in Accra",
  description: "Comprehensive survey and geospatial analysis project covering urban expansion patterns in Greater Accra Metropolitan Area.",
  category: "Geospatial Analysis",
  image_url: "https://example.com/project-image.jpg", // Optional
  project_date: "2024-06-15",
  location: "Accra, Ghana",
  skills_used: ["GIS", "Remote Sensing", "AutoCAD", "QGIS", "Survey"],
  client: "Ghana Urban Development Authority",
  status: "completed",
  featured: true,
  created_at: Timestamp,
  updated_at: Timestamp
}
```

When retrieved with user data, it becomes:

```typescript
{
  // ... all portfolio fields above
  user_name: "Mr Desmond Karikari Osei",
  user_image: "https://firebasestorage.googleapis.com/...", // From users collection
  user_profession: "Geomatic engineer",
  user_email: "oseidesmond285@gmail.com"
}
```

## Available Functions

### Create Portfolio Item
```typescript
import { createPortfolioItem } from '@/lib/firebase/portfolio-service';

const portfolioId = await createPortfolioItem({
  user_id: "1739",
  title: "Survey Project",
  description: "Land survey for residential development",
  category: "Survey",
  project_date: "2024-01-15",
  location: "Kumasi, Ghana",
  skills_used: ["Total Station", "GPS", "AutoCAD"],
  client: "ABC Developers",
  status: "completed",
  featured: false
});
```

### Get User's Portfolio
```typescript
import { getUserPortfolio } from '@/lib/firebase/portfolio-service';

const portfolioItems = await getUserPortfolio("1739");
```

### Get All Portfolio with User Data
```typescript
import { getAllPortfolioWithUsers } from '@/lib/firebase/portfolio-service';

const allPortfolio = await getAllPortfolioWithUsers();
// Returns portfolio items with user_name, user_image, user_profession, user_email
```

### Get Featured Portfolio
```typescript
import { getFeaturedPortfolio } from '@/lib/firebase/portfolio-service';

const featured = await getFeaturedPortfolio();
```

### Get Portfolio by Category
```typescript
import { getPortfolioByCategory } from '@/lib/firebase/portfolio-service';

const surveyProjects = await getPortfolioByCategory("Survey");
```

### Update Portfolio Item
```typescript
import { updatePortfolioItem } from '@/lib/firebase/portfolio-service';

await updatePortfolioItem("portfolio-123", {
  featured: true,
  status: "completed"
});
```

### Delete Portfolio Item
```typescript
import { deletePortfolioItem } from '@/lib/firebase/portfolio-service';

await deletePortfolioItem("portfolio-123");
```

### Get User Profile
```typescript
import { getUserProfile, getUserProfileByEmail } from '@/lib/firebase/portfolio-service';

// By user_id
const user = await getUserProfile("1739");

// By email
const user = await getUserProfileByEmail("oseidesmond285@gmail.com");
```

## Portfolio Categories

Suggested categories based on user specialties:
- **Survey** - Land surveys, topographic surveys, cadastral surveys
- **Geospatial Analysis** - GIS projects, spatial data analysis
- **Research** - Academic research, technical papers
- **Project** - General engineering projects
- **Mapping** - Cartography, map production
- **Remote Sensing** - Satellite imagery analysis
- **Urban Planning** - City planning, development projects

## Image Handling

**Priority:**
1. If `image_url` is set on portfolio item → Use project image
2. If `image_url` is empty → Fall back to user's `image_url` from users collection

**Example:**
```typescript
// Portfolio item with project image
{
  image_url: "https://example.com/project.jpg" // Uses this
}

// Portfolio item without project image
{
  image_url: undefined // Falls back to user's profile image
}
```

## Firestore Security Rules

Add these rules to your Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Portfolio collection
    match /portfolio/{portfolioId} {
      // Anyone can read portfolio items
      allow read: if true;
      
      // Only authenticated users can create
      allow create: if request.auth != null;
      
      // Only the owner can update/delete their portfolio items
      allow update, delete: if request.auth != null 
                             && request.auth.uid == resource.data.user_id;
    }
    
    // Users collection (read-only for portfolio integration)
    match /users/{userId} {
      allow read: if true; // Public read for portfolio display
      allow write: if request.auth != null; // Only authenticated users can write
    }
  }
}
```

## Usage Example: Portfolio Display Component

```typescript
"use client"

import { useEffect, useState } from 'react';
import { getAllPortfolioWithUsers, PortfolioWithUser } from '@/lib/firebase/portfolio-service';

export default function PortfolioGallery() {
  const [portfolio, setPortfolio] = useState<PortfolioWithUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const items = await getAllPortfolioWithUsers();
        setPortfolio(items);
      } catch (error) {
        console.error('Error fetching portfolio:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {portfolio.map((item) => (
        <div key={item.id} className="border rounded-lg p-4">
          <img 
            src={item.user_image} 
            alt={item.user_name}
            className="w-full h-48 object-cover rounded"
          />
          <h3 className="text-xl font-bold mt-4">{item.title}</h3>
          <p className="text-sm text-gray-600">{item.category}</p>
          <p className="mt-2">{item.description}</p>
          <div className="mt-4 flex items-center gap-2">
            <img 
              src={item.user_image} 
              alt={item.user_name}
              className="w-8 h-8 rounded-full"
            />
            <div>
              <p className="font-medium">{item.user_name}</p>
              <p className="text-sm text-gray-600">{item.user_profession}</p>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {item.skills_used.map((skill, i) => (
              <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                {skill}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

## Database Indexes

Create these indexes in Firestore for optimal performance:

1. **Portfolio by user_id and created_at:**
   - Collection: `portfolio`
   - Fields: `user_id` (Ascending), `created_at` (Descending)

2. **Portfolio by featured and created_at:**
   - Collection: `portfolio`
   - Fields: `featured` (Ascending), `created_at` (Descending)

3. **Portfolio by category and created_at:**
   - Collection: `portfolio`
   - Fields: `category` (Ascending), `created_at` (Descending)

4. **Users by email:**
   - Collection: `users`
   - Fields: `email` (Ascending)

## Summary

✅ **Portfolio collection** stores project/work items
✅ **References users collection** via `user_id`
✅ **Automatically fetches user data** (name, image, profession)
✅ **Falls back to user profile image** if no project image
✅ **Supports filtering** by category, featured status, user
✅ **Full CRUD operations** with proper error handling
✅ **TypeScript interfaces** for type safety

The system is ready to use! Just create portfolio items and they'll automatically pull user information from the existing users collection.
