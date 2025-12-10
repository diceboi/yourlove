"use server";

import { createClient } from "@/utils/supabase/server";

export async function sendPasswordResetEmail(formData) {
  const supabase = await createClient();
  
  const email = formData.get("email")?.toString() ?? "";

  if (!email) {
    return {
      status: "error",
      message: "Kérjük, add meg az email címed.",
    };
  }

  // Get the current origin for the redirect URL
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/uj-jelszo`,
  });

  if (error) {
    console.error("Supabase resetPasswordForEmail error:", error);

    const raw = (error.message || "").toLowerCase();
    let message = "Hiba történt. Kérjük, próbáld újra.";

    if (raw.includes("rate limit")) {
      message = "Túl sok próbálkozás történt rövid időn belül. Kérjük, próbáld meg később.";
    }

    return {
      status: "error",
      message,
      supabaseMessage: error.message,
    };
  }

  // Supabase always returns success even if email doesn't exist (security best practice)
  return { 
    status: "success",
    message: "Ha ez az email cím regisztrálva van, akkor küldtünk egy jelszó-visszaállítási linket."
  };
}
