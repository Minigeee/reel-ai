export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          operationName?: string;
          query?: string;
          variables?: Json;
          extensions?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      comment_likes: {
        Row: {
          comment_id: string;
          created_at: string | null;
          user_id: string;
        };
        Insert: {
          comment_id: string;
          created_at?: string | null;
          user_id: string;
        };
        Update: {
          comment_id?: string;
          created_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'comment_likes_comment_id_fkey';
            columns: ['comment_id'];
            isOneToOne: false;
            referencedRelation: 'comments';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'comment_likes_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      comments: {
        Row: {
          content: string;
          created_at: string | null;
          id: string;
          like_count: number | null;
          parent_id: string | null;
          reply_count: number | null;
          updated_at: string | null;
          user_id: string;
          video_id: string;
        };
        Insert: {
          content: string;
          created_at?: string | null;
          id?: string;
          like_count?: number | null;
          parent_id?: string | null;
          reply_count?: number | null;
          updated_at?: string | null;
          user_id: string;
          video_id: string;
        };
        Update: {
          content?: string;
          created_at?: string | null;
          id?: string;
          like_count?: number | null;
          parent_id?: string | null;
          reply_count?: number | null;
          updated_at?: string | null;
          user_id?: string;
          video_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'comments_parent_id_fkey';
            columns: ['parent_id'];
            isOneToOne: false;
            referencedRelation: 'comments';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'comments_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'comments_video_id_fkey';
            columns: ['video_id'];
            isOneToOne: false;
            referencedRelation: 'videos';
            referencedColumns: ['id'];
          },
        ];
      };
      dictionary: {
        Row: {
          created_at: string | null;
          definitions: Json;
          extra: Json | null;
          id: string;
          language: string;
          metadata: Json | null;
          part_of_speech: string;
          updated_at: string | null;
          word: string;
        };
        Insert: {
          created_at?: string | null;
          definitions: Json;
          extra?: Json | null;
          id?: string;
          language: string;
          metadata?: Json | null;
          part_of_speech: string;
          updated_at?: string | null;
          word: string;
        };
        Update: {
          created_at?: string | null;
          definitions?: Json;
          extra?: Json | null;
          id?: string;
          language?: string;
          metadata?: Json | null;
          part_of_speech?: string;
          updated_at?: string | null;
          word?: string;
        };
        Relationships: [];
      };
      flashcards: {
        Row: {
          created_at: string;
          id: string;
          language: string;
          last_reviewed_at: string | null;
          review_count: number | null;
          user_id: string;
          word: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          language?: string;
          last_reviewed_at?: string | null;
          review_count?: number | null;
          user_id: string;
          word: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          language?: string;
          last_reviewed_at?: string | null;
          review_count?: number | null;
          user_id?: string;
          word?: string;
        };
        Relationships: [];
      };
      follows: {
        Row: {
          created_at: string | null;
          follower_id: string;
          following_id: string;
        };
        Insert: {
          created_at?: string | null;
          follower_id: string;
          following_id: string;
        };
        Update: {
          created_at?: string | null;
          follower_id?: string;
          following_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'follows_follower_id_fkey';
            columns: ['follower_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'follows_following_id_fkey';
            columns: ['following_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      subtitles: {
        Row: {
          created_at: string;
          error_message: string | null;
          id: string;
          language: string;
          segments: Json | null;
          status: Database['public']['Enums']['subtitle_status'];
          updated_at: string;
          video_id: string;
        };
        Insert: {
          created_at?: string;
          error_message?: string | null;
          id?: string;
          language?: string;
          segments?: Json | null;
          status?: Database['public']['Enums']['subtitle_status'];
          updated_at?: string;
          video_id: string;
        };
        Update: {
          created_at?: string;
          error_message?: string | null;
          id?: string;
          language?: string;
          segments?: Json | null;
          status?: Database['public']['Enums']['subtitle_status'];
          updated_at?: string;
          video_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'subtitles_video_id_fkey';
            columns: ['video_id'];
            isOneToOne: false;
            referencedRelation: 'videos';
            referencedColumns: ['id'];
          },
        ];
      };
      users: {
        Row: {
          avatar_url: string | null;
          bio: string | null;
          created_at: string | null;
          display_name: string | null;
          email: string;
          id: string;
          updated_at: string | null;
          username: string;
        };
        Insert: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string | null;
          display_name?: string | null;
          email: string;
          id: string;
          updated_at?: string | null;
          username: string;
        };
        Update: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string | null;
          display_name?: string | null;
          email?: string;
          id?: string;
          updated_at?: string | null;
          username?: string;
        };
        Relationships: [];
      };
      video_likes: {
        Row: {
          created_at: string | null;
          user_id: string;
          video_id: string;
        };
        Insert: {
          created_at?: string | null;
          user_id: string;
          video_id: string;
        };
        Update: {
          created_at?: string | null;
          user_id?: string;
          video_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'video_likes_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'video_likes_video_id_fkey';
            columns: ['video_id'];
            isOneToOne: false;
            referencedRelation: 'videos';
            referencedColumns: ['id'];
          },
        ];
      };
      videos: {
        Row: {
          category: string | null;
          comment_count: number | null;
          created_at: string | null;
          description: string | null;
          difficulty: Database['public']['Enums']['language_level'] | null;
          duration: number;
          enhancements: Json | null;
          id: string;
          language: string;
          like_count: number | null;
          published_at: string | null;
          status: Database['public']['Enums']['video_status'] | null;
          tags: string[] | null;
          thumbnail_url: string | null;
          title: string;
          updated_at: string | null;
          user_id: string;
          video_url: string;
          view_count: number | null;
        };
        Insert: {
          category?: string | null;
          comment_count?: number | null;
          created_at?: string | null;
          description?: string | null;
          difficulty?: Database['public']['Enums']['language_level'] | null;
          duration: number;
          enhancements?: Json | null;
          id?: string;
          language?: string;
          like_count?: number | null;
          published_at?: string | null;
          status?: Database['public']['Enums']['video_status'] | null;
          tags?: string[] | null;
          thumbnail_url?: string | null;
          title: string;
          updated_at?: string | null;
          user_id: string;
          video_url: string;
          view_count?: number | null;
        };
        Update: {
          category?: string | null;
          comment_count?: number | null;
          created_at?: string | null;
          description?: string | null;
          difficulty?: Database['public']['Enums']['language_level'] | null;
          duration?: number;
          enhancements?: Json | null;
          id?: string;
          language?: string;
          like_count?: number | null;
          published_at?: string | null;
          status?: Database['public']['Enums']['video_status'] | null;
          tags?: string[] | null;
          thumbnail_url?: string | null;
          title?: string;
          updated_at?: string | null;
          user_id?: string;
          video_url?: string;
          view_count?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'videos_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_current_user_id: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      get_follower_count: {
        Args: {
          user_id: string;
        };
        Returns: number;
      };
      get_following_count: {
        Args: {
          user_id: string;
        };
        Returns: number;
      };
      is_comment_owner: {
        Args: {
          comment_id: string;
        };
        Returns: boolean;
      };
      is_video_owner: {
        Args: {
          video_id: string;
        };
        Returns: boolean;
      };
      toggle_video_like: {
        Args: {
          video_id: string;
        };
        Returns: undefined;
      };
    };
    Enums: {
      language_level: 'a1' | 'a2' | 'b1' | 'b2' | 'c1' | 'c2';
      overlay_type: 'text' | 'sticker' | 'effect';
      subtitle_status: 'pending' | 'processing' | 'completed' | 'error';
      video_status: 'draft' | 'published' | 'processing' | 'failed';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema['Tables'] & PublicSchema['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] &
        PublicSchema['Views'])
    ? (PublicSchema['Tables'] &
        PublicSchema['Views'])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema['Enums']
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
    ? PublicSchema['Enums'][PublicEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema['CompositeTypes']
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema['CompositeTypes']
    ? PublicSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;
