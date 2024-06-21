"use server";

import { createClient } from "@supabase/supabase-js";

const deleteUser = async (userId: string) => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
  const { data, error } = await supabase.auth.admin.deleteUser(userId);
  if (error) {
    console.error(error);
    return error;
  }
  return data;
};

export default deleteUser;
