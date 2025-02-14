Usage Examples

A collection of usage examples for various components in this project.

**Note:** When adding new examples, keep them concise but complete.

## Database Types

Import types from `~/lib/database.types`:

```typescript
import type {
  Tables,
  TablesInsert,
  TablesUpdate,
  Enums,
} from '~/lib/database.types';

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
import { supabase } from '~/lib/supabase';

export default async function PrivatePage() {
  const { data: tickets } = await supabase.from('tickets').select('*');

  // ...
}
```

## Camera

```tsx
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function App() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title='grant permission' />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <Text style={styles.text}>Flip Camera</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});
```

## Video Upload

### Required Fields

- `title`: Video title (required)
- `language`: Language of the content (required)
  - Available options: English (en), Spanish (es), French (fr), German (de), Italian (it), Portuguese (pt), Chinese (zh), Japanese (ja), Korean (ko)
- `difficulty`: Content difficulty level (optional)
  - Based on CEFR levels: A1 (Beginner), A2 (Elementary), B1 (Intermediate), B2 (Upper Intermediate), C1 (Advanced), C2 (Mastery)

### Example Usage

```typescript
import { useCreatorStore } from '~/lib/stores/creator-store';

// Setting video details
const { setVideoDetails } = useCreatorStore();
setVideoDetails({
  title: 'Basic Greetings in Spanish',
  language: 'es',
  difficulty: 'a1',
  description: 'Learn common Spanish greetings for beginners',
});
```

## API Reference

### Data Fetching Hooks

```typescript
/**
 * Hook to fetch user profile data
 * ~param userId - Optional user ID. If not provided, fetches current user's profile
 * ~returns Query object with user data, loading and error states
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
 * ~returns Mutation object for updating user data
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
