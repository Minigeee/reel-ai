# Reel AI Data Model

This document outlines the data model for Reel AI, including both local filesystem storage and remote database entities.

## Local Storage Model

### Project Structure

Purpose: Represents a video editing project stored locally on the user's device.

Description: A project is the core editing unit in Reel AI. It contains all information needed to edit and process a video, including the original video file, any enhancements, and processing metadata. Projects are stored on the filesystem until published, allowing for efficient local processing and offline editing capabilities.

Key Attributes:
```
{
  id: string                    // Unique project identifier
  created_at: string           // Project creation timestamp
  updated_at: string           // Last modification timestamp
  
  // Video metadata
  title: string                // Project title
  description: string          // Project description
  duration: number             // Video duration in seconds
  
  // File references
  original_video: string       // Path to original video file
  processed_video?: string     // Path to processed preview
  thumbnail?: string           // Path to generated thumbnail
  
  // Enhancements
  enhancements: {
    music?: {
      file: string            // Path to music file
      volume: number          // Music volume (0-1)
      start_time: number      // Start timestamp in seconds
      end_time: number        // End timestamp in seconds
    }
    
    captions?: Array<{
      timestamp: [number, number]  // Start and end time
      text: string                 // Caption text
    }>
    
    overlays?: Array<{
      type: 'text' | 'sticker' | 'effect'
      content: string              // Text content or asset path
      style: Record<string, any>   // Visual styling properties
      timestamp: [number, number]  // Start and end time
      position: { x: number, y: number }  // Screen position
    }>
    
    filters?: Array<{
      type: string                 // Filter type
      parameters: Record<string, any>  // Filter parameters
    }>
  }
}
```

Relationships:
- Maps to a Videos entity when published
- No direct database relationships (filesystem only)

User Interaction:
- Users can create, edit, and delete projects
- All editing operations modify the project file
- Projects can be published to create remote video entries

Security Policies:
- Projects are stored in user-specific directories
- Access controlled by filesystem permissions
- No multi-user access required
- Tauri handles filesystem security

## Remote Database Model

### Users

Purpose: Stores user account information and profile data.

Description: Represents a user account in the system. Handles authentication through Supabase and stores basic profile information. Users can create and publish videos, interact with other users' content, and manage their own content.

Key Attributes:
```
create table users (
  id uuid references auth.users primary key,
  username text unique not null,
  display_name text,
  avatar_url text,
  bio text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

Relationships:
- One-to-many with Videos
- Many-to-many with other Users (follows)

User Interaction:
- Users can update their own profile
- Users can view other users' profiles
- Users can follow/unfollow other users

Security Policies:
- Read: Public access to basic profile data
- Create: Only through auth signup
- Update: Users can only update their own profile
- Delete: Handled through auth system
- Special: Admin access for moderation

### Videos

Purpose: Stores published video content and associated metadata.

Description: Represents a published video on the platform. Created when a user publishes a local project. Contains all necessary information for displaying and playing the video, including enhancement data carried over from the project.

Key Attributes:
```
create table videos (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) not null,
  
  -- Basic metadata
  title text not null,
  description text,
  duration integer not null,
  
  -- Media URLs
  video_url text not null,
  thumbnail_url text,
  
  -- Organization
  category text,
  tags text[],
  
  -- Enhancement metadata
  enhancements jsonb,
  
  -- Status & timestamps
  is_draft boolean default true,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  -- Metrics
  view_count integer default 0,
  like_count integer default 0
);
```

Relationships:
- Belongs to a User
- One-to-many with Comments
- Many-to-many with Users (likes)

User Interaction:
- Creators can publish, edit, and delete their videos
- Viewers can view, like, and comment on videos
- Videos can be discovered through tags and categories

Security Policies:
- Read: Public access to published videos
- Create: Authenticated users only
- Update: Video owner only
- Delete: Video owner only
- Special: Admin access for moderation

### Social Features

Purpose: Handles social interactions between users and content.

Description: These tables manage social features like likes, comments, and follows. They enable user engagement and content discovery through social interactions.

Key Attributes:
```
-- Likes
create table video_likes (
  video_id uuid references videos(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (video_id, user_id)
);

-- Comments
create table comments (
  id uuid primary key default uuid_generate_v4(),
  video_id uuid references videos(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  content text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Follows
create table follows (
  follower_id uuid references users(id) on delete cascade,
  following_id uuid references users(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (follower_id, following_id)
);
```

Relationships:
- Links Users to Videos (likes)
- Links Users to Users (follows)
- Links Users to Videos (comments)

User Interaction:
- Users can like/unlike videos
- Users can follow/unfollow other users
- Users can comment on videos
- Users can view their social activity

Security Policies:
- Likes:
  - Read: Public access
  - Create/Delete: Authenticated users only
  - Update: Not allowed
- Comments:
  - Read: Public access
  - Create: Authenticated users only
  - Update/Delete: Comment owner only
- Follows:
  - Read: Public access
  - Create/Delete: Authenticated users only
  - Update: Not allowed 