import { supabase } from '@/lib/supabase';

export function getStorageUrl(bucket: string, path: string) {
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(path);
  
  return publicUrl;
} 