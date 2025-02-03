 Usage Examples

A collection of usage examples for various components in this project.

**Note:** When adding new examples, keep them concise but complete.

## Database Types

Import types from `@/lib/database.types`:

```typescript
import type {
  Tables,
  TablesInsert,
  TablesUpdate,
  Enums,
} from '@/lib/database.types';

// Row type (full database record)
type Ticket = Tables<'tickets'>;

// Insert type (for creating new records)
type NewTicket = TablesInsert<'tickets'>;

// Update type (for modifying existing records)
type TicketUpdate = TablesUpdate<'tickets'>;

// Enum type (for status, priority, etc)
type TicketStatus = Enums<'ticket_status'>; // 'open' | 'closed' | etc

// Common patterns
type TicketWithRelations = Tables<'tickets'> & {
  contact: Tables<'contacts'>;
  messages: Tables<'messages'>[];
};

// Form data (all fields optional)
type TicketForm = Partial<TablesInsert<'tickets'>>;
```

## Supabase

### Supabase Client

```tsx
import { supabase } from '@/lib/supabase';

export default async function PrivatePage() {
  const { data: tickets } = await supabase.from('tickets').select('*');

  // ...
}
```

## Authentication

### Auth Context & Protected Routes

```tsx
// Using auth context in components
import { useAuth } from '@/lib/providers/auth-provider';

function ProfileButton() {
  const { user, signOut } = useAuth();
  
  if (!user) return null;
  
  return (
    <button onClick={signOut}>
      Sign out {user.email}
    </button>
  );
}

// Protecting routes
import { ProtectedRoute } from '@/components/auth/protected-route';

// In any page that requires authentication:
export default function SecurePage() {
  return (
    <ProtectedRoute>
      <div>
        This content is only visible to authenticated users
      </div>
    </ProtectedRoute>
  );
}

// Custom loading state and redirect
export function AdminPage() {
  return (
    <ProtectedRoute 
      loading={<div>Loading admin panel...</div>}
      redirectTo="/login"
    >
      <div>Admin Dashboard</div>
    </ProtectedRoute>
  );
}
```

### Auth Operations

```tsx
import { useAuth } from '@/lib/providers/auth-provider';

function AuthExample() {
  const { signIn, signUp, signOut, user } = useAuth();

  const handleSignIn = async () => {
    try {
      await signIn('user@example.com', 'password123');
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  };

  const handleSignUp = async () => {
    try {
      await signUp('newuser@example.com', 'password123');
    } catch (error) {
      console.error('Sign up failed:', error);
    }
  };
}
```

## API Reference

### Data Fetching Hooks

```typescript
/**
 * Hook to fetch user profile data
 * @param userId - Optional user ID. If not provided, fetches current user's profile
 * @returns Query object with user data, loading and error states
 */
function useUser(userId?: string): UseQueryResult<{
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}>;
```

### Data Mutation Hooks

```typescript
/**
 * Hook to update the current user's profile
 * @returns Mutation object for updating user data
 */
function useUpdateUser(): UseMutationResult<
  void,
  Error,
  {
    display_name?: string;
    avatar_url?: string;
    bio?: string;
  }
>;
```
