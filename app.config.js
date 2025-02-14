export default {
  expo: {
    // ... other config
    extra: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    },
    plugins: ['expo-video'],
  },
};
