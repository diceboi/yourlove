"use server";

import { createClient } from "@/utils/supabase/server";

export async function updatePassword(formData) {
  const supabase = await createClient();
  
  const password = formData.get("password")?.toString() ?? "";

  if (!password) {
    return {
      status: "error",
      message: "Kérjük, add meg az új jelszót.",
    };
  }

  if (password.length < 6) {
    return {
      status: "error",
      message: "A jelszónak legalább 6 karakter hosszúnak kell lennie.",
    };
  }

  const { data, error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    console.error("Supabase updateUser error:", error);

    let message = "Hiba történt a jelszó megváltoztatása során. Kérjük, próbáld újra.";

    // Check error.code first (Supabase auth errors have specific codes)
    if (error.code === 'same_password') {
      message = "Nem használhatod a régi jelszavadat. Kérlek, válassz egy új jelszót.";
    } else if (error.status === 401 || error.code === 'session_not_found') {
      message = "Érvénytelen vagy lejárt link. Kérj új jelszó-visszaállítási emailt.";
    } else if (error.message) {
      // Fallback to message parsing if code is not specific
      const rawMessage = error.message.toLowerCase();
      if (rawMessage.includes("session") || rawMessage.includes("not authenticated")) {
        message = "Érvénytelen vagy lejárt link. Kérj új jelszó-visszaállítási emailt.";
      } else if (rawMessage.includes("same") && rawMessage.includes("password")) {
        message = "Nem használhatod a régi jelszavadat. Kérlek, válassz egy új jelszót.";
      } else if (rawMessage.includes("weak") || rawMessage.includes("short")) {
        message = "A jelszónak legalább 6 karakter hosszúnak kell lennie.";
      }
    }

    return {
      status: "error",
      message,
      supabaseMessage: error.message,
      supabaseCode: error.code,
    };
  }

  return { 
    status: "success",
    user: data?.user
  };
}
