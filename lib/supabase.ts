// TODO GH-2 : remplacer ce stub par le vrai client dès que Supabase est disponible
// Commandes d'install : npx expo install @supabase/supabase-js react-native-url-polyfill
// puis : npx expo install expo-sqlite (pour localStorage)
// Référence de config : https://supabase.com/docs/guides/auth/social-login/auth-react-native

export const supabase = {
  from: (_table: string) => ({
    insert: (_data: object): Promise<{ error: null }> => Promise.resolve({ error: null }),
    upsert: (_data: object): Promise<{ error: null }> => Promise.resolve({ error: null }),
    select: (_columns?: string): Promise<{ data: never[]; error: null }> =>
      Promise.resolve({ data: [], error: null }),
    update: (_data: object) => ({
      eq: (_col: string, _val: string): Promise<{ error: null }> =>
        Promise.resolve({ error: null }),
    }),
  }),
  auth: {
    getUser: (): Promise<{ data: { user: null }; error: null }> =>
      Promise.resolve({ data: { user: null }, error: null }),
  },
};
