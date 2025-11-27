"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";

export async function getUserSession() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    return null;
  }
  return { status: "success", user: data?.user };
}

export async function signUp(formData) {
  const supabase = await createClient();
  
  const email = formData.get("email")?.toString() ?? "";
  const password = formData.get("jelszo")?.toString() ?? "";
  const firstname = formData.get("keresztnev")?.toString() ?? "";
  const lastname = formData.get("vezeteknev")?.toString() ?? "";
  const phone = formData.get("telefonszam")?.toString() ?? "";

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        firstname,
        lastname,
        phone,
      },
    },
  });

  // 1️⃣ Ha a Supabase dob hibát
  if (error) {
    console.error("Supabase signUp error:", error);

    const raw = (error.message || "").toLowerCase();
    let message = "Sikertelen regisztráció. Kérjük, próbáld újra.";

    if (raw.includes("user already registered") || raw.includes("already registered")) {
      // Tipikus Supabase hiba, ha az e-mail már foglalt
      message = "Ezzel az e-mail címmel már létezik felhasználó. Ha nem te regisztráltál, kérj jelszó-visszaállítást.";
    } else if (raw.includes("password")) {
      message = "A jelszónak legalább 6 karakter hosszúnak kell lennie.";
    } else if (raw.includes("rate limit")) {
      message = "Túl sok próbálkozás történt rövid időn belül. Kérjük, próbáld meg később.";
    }

    return {
      status: "error",
      message,
      supabaseMessage: error.message,
    };
  }

  // 2️⃣ Ha nincs error, de az email már be van regisztrálva -> Supabase trükk:
  // ilyenkor data.user létezik, de identities üres.
  if (data?.user?.identities?.length === 0) {
    return {
      status: "error",
      message: "Ezzel az e-mail címmel már regisztráltak. Ha te voltál, kérj új jelszót vagy lépj be.",
    };
  }

  const userId = data.user.id;

  await supabase.from("user_profiles").insert([
    {
      id: userId,
      email,
      firstname,
      lastname,
      phone,
    },
  ]);

  revalidatePath("/", "layout");
  return { status: "success", user: data.user };
}

export async function singIn(formData) {
  const supabase = await createClient();

  const email = formData.get("email")?.toString() ?? "";
  const password = formData.get("jelszo")?.toString() ?? "";

  const { error, data } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Supabase signIn error:", error);

    const raw = (error.message || "").toLowerCase();
    let customMessage = "Sikertelen bejelentkezés. Kérjük, próbáld újra.";

    if (raw.includes("invalid login credentials")) {
      customMessage = "Hibás e-mail cím vagy jelszó.";
    } else if (raw.includes("email not confirmed") || raw.includes("email address not confirmed")) {
      customMessage = "Még nem erősítetted meg az e-mail címed. Kérjük, ellenőrizd a postafiókodat.";
    }

    return {
      status: "error",
      message: customMessage,
    };
  }

  revalidatePath("/", "layout");
  return { status: "success", user: data?.user };
}


export async function signOut() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    redirect("/hiba");
  }

  revalidatePath("/", "layout");
  redirect("/bejelentkezes");
}
