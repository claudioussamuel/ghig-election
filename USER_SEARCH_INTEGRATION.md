# User Search Integration - Admin Page

## Overview
The admin page now searches the `users` collection when typing a candidate name and auto-fills all details from the user profile.

## How It Works

### 1. Type Candidate Name
When you start typing in the "Candidate name" field (minimum 2 characters), the system:
- Searches the `users` collection in Firestore
- Matches against `Firstname` and `Surname` fields
- Shows a dropdown with matching users

### 2. Select User from Dropdown
When you click on a user from the dropdown:
- **Name**: Auto-filled with `title + Firstname + Surname` (e.g., "Mr Desmond Karikari Osei")
- **Bio**: Auto-generated from user profile:
  - Profession and Speciality
  - Qualification and University
  - Year of graduation
  - Location (City, Country)
- **Image**: Auto-filled with user's `image_url` from profile
- **User ID**: Linked to the user's `user_id`
- **Email**: Stored from user profile
- **Profession**: Stored from user profile

### 3. Example Auto-filled Bio
```
Geomatic engineer - survey, Geospatial Analysis. Degree from KWAME NKRUMAH UNIVERSITY OF SCIENCE AND TECHNOLOGY (2023-11-01). Based in Accra, Ghana.
```

## Features

### Search Functionality
- ✅ **Real-time search** as you type
- ✅ **Case-insensitive** matching
- ✅ **Searches both** Firstname and Surname
- ✅ **Shows loading spinner** while searching
- ✅ **Limits to 10 results** for performance

### User Dropdown
- ✅ **Profile picture** displayed
- ✅ **Full name** with title
- ✅ **Profession** shown
- ✅ **Email** displayed
- ✅ **Hover effects** for better UX
- ✅ **Scrollable** if many results

### Data Integration
- ✅ **Links to users collection** via `user_id`
- ✅ **Stores email** for reference
- ✅ **Stores profession** for filtering
- ✅ **Uses user's profile image** automatically

## Updated Candidate Structure

```typescript
{
  id: string;
  name: string;              // "Mr Desmond Karikari Osei"
  position: string;          // "President"
  image: string;             // From user's image_url
  bio: string;               // Auto-generated from profile
  user_id: string;           // "1739" (links to users collection)
  email: string;             // "oseidesmond285@gmail.com"
  profession: string;        // "Geomatic engineer"
  created_at: Timestamp;
  updated_at: Timestamp;
}
```

## User Profile Fields Used

From the `users` collection:
- `user_id` - Unique identifier
- `email` - Contact email
- `Firstname` - First name
- `Surname` - Last name
- `title` - Mr/Mrs/Dr/etc
- `image_url` - Profile picture
- `Profession` - Job profession
- `job_title` - Current job title
- `Speciality` - Area of expertise
- `Qualification` - Education level
- `Tertiary` - University name
- `Year_of_graduation` - Graduation year
- `City` - Current city
- `country` - Current country

## Usage Flow

### Adding a Candidate

1. **Click "Add Candidate"** button
2. **Start typing name** in the name field (e.g., "Desmond")
3. **See loading spinner** while searching
4. **View dropdown** with matching users
5. **Click on a user** from the dropdown
6. **All fields auto-fill:**
   - Name: "Mr Desmond Karikari Osei"
   - Bio: Auto-generated professional bio
   - Image: User's profile picture URL
7. **Select position** from dropdown
8. **Click "Add Candidate"** to save

### Editing a Candidate

1. **Click edit icon** on candidate card
2. **Form opens** with existing data
3. **Can search** for different user if needed
4. **Modify any fields** as needed
5. **Click "Update Candidate"** to save

## Search Function Details

```typescript
// Searches users by name
searchUsersByName(searchTerm: string): Promise<UserProfile[]>

// Minimum 2 characters required
// Returns up to 10 matching users
// Searches: Firstname, Surname, and full name combinations
// Case-insensitive matching
```

## Benefits

### For Admins
- ✅ **No manual data entry** - Just search and select
- ✅ **Consistent data** - Uses verified user profiles
- ✅ **Professional bios** - Auto-generated from profile
- ✅ **Correct images** - Uses user's actual photo
- ✅ **Fast workflow** - Type, click, done

### For Data Quality
- ✅ **No typos** - Data comes from verified profiles
- ✅ **Linked records** - Can trace back to user
- ✅ **Up-to-date** - Uses latest profile information
- ✅ **Complete information** - All fields populated

### For Users
- ✅ **Their profile used** - Recognition of their profile
- ✅ **Accurate representation** - Correct details
- ✅ **Professional presentation** - Well-formatted bio

## Example Workflow

**Scenario:** Adding Desmond as a Presidential candidate

1. Admin clicks "Add Candidate"
2. Types "Desmond" in name field
3. Sees dropdown with:
   ```
   [Profile Picture]
   Mr Desmond Karikari Osei
   Geomatic engineer
   oseidesmond285@gmail.com
   ```
4. Clicks on the user
5. Form auto-fills:
   - **Name**: Mr Desmond Karikari Osei
   - **Bio**: Geomatic engineer - survey, Geospatial Analysis. Degree from KWAME NKRUMAH UNIVERSITY OF SCIENCE AND TECHNOLOGY (2023-11-01). Based in Accra, Ghana.
   - **Image**: https://firebasestorage.googleapis.com/.../profile_1741591991101.jpg
6. Selects "President" from position dropdown
7. Clicks "Add Candidate"
8. Candidate saved with link to user profile

## Technical Implementation

### Files Modified

1. **`lib/firebase/admin-service.ts`**
   - Added `UserProfile` interface
   - Added `user_id`, `email`, `profession` to `Candidate` interface
   - Added `searchUsersByName()` function
   - Added `getUserByEmail()` function
   - Added `getUserById()` function

2. **`app/admin/page.tsx`**
   - Added user search state variables
   - Added `handleNameChange()` function
   - Added `handleSelectUser()` function
   - Updated name input with dropdown
   - Added loading spinner
   - Added user selection UI

### Search Algorithm

```typescript
// Client-side filtering (Firestore limitation)
1. Fetch all users from collection
2. Convert search term to lowercase
3. Create full name combinations:
   - "Firstname Surname"
   - "Surname Firstname"
4. Check if any match contains search term
5. Return first 10 matches
```

## Firestore Queries

### Search Users
```typescript
// Gets all users, filters client-side
const usersRef = collection(db, 'users');
const querySnapshot = await getDocs(usersRef);
```

### Get User by Email
```typescript
const q = query(usersRef, where('email', '==', email));
```

### Get User by ID
```typescript
const q = query(usersRef, where('user_id', '==', userId));
```

## UI Components

### Search Input
- Text input with onChange handler
- Placeholder: "Start typing candidate name..."
- Triggers search after 2 characters
- Shows loading spinner while searching

### User Dropdown
- Absolute positioned below input
- White background with border
- Max height with scroll
- Each user shows:
  - Profile picture (40x40px, rounded)
  - Full name with title
  - Profession
  - Email
- Hover effect on items
- Click to select

### Loading Indicator
- Small spinner in input field
- Appears while searching
- Positioned on right side

## Future Enhancements

Potential improvements:
- [ ] Debounce search (wait for user to stop typing)
- [ ] Cache search results
- [ ] Add filters (by profession, location)
- [ ] Show user's membership status
- [ ] Add "Create new user" option
- [ ] Algolia integration for better search
- [ ] Search by email or phone number

## Summary

✅ **User search integrated** into admin candidate form
✅ **Auto-fills all fields** from user profile
✅ **Professional bio generation** from profile data
✅ **Real-time search** with dropdown
✅ **Links candidates to users** via user_id
✅ **Improved data quality** and consistency
✅ **Faster workflow** for admins

The admin page now provides a seamless experience for adding candidates by leveraging existing user profiles! 🎉
