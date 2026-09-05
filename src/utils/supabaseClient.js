import { createClient } from '@supabase/supabase-js';

export const supabase = {
  from: () => ({
    select: () => ({ data: null, error: null }),
    insert: () => ({ data: null, error: null }),
    update: () => ({ data: null, error: null }),
  }),
  auth: {
    signIn: async () => ({ user: null, error: null }),
    signOut: async () => ({ error: null }),
  }
};
