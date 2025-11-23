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

  // 1️⃣ Supabase Auth regisztráció
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

  if (error) {
    return {
      status: "Erősítd meg az email címedet az email fiókodba kapott linkre kattintva.",
      user: null,
    };
  }

  if (data?.user?.identities?.length === 0) {
    return {
      status: "Ezzel az email címmel már létezik felhasználó",
      user: null,
    };
  }

  // 2️⃣ Legfontosabb rész: user ID a válaszból
  const userId = data.user.id;

  // 3️⃣ Insert a saját user_profiles táblába
  await supabase.from("user_profiles").insert([
    {
      id: userId, // ha van uuid meződ
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
    let customMessage = "Sikertelen bejelentkezés. Kérjük, próbáld újra.";

    // Példák – ezek az `error.message`-ből jöhetnek (angolul):
    if (error.message.includes("Invalid login credentials")) {
      customMessage = "Hibás e-mail cím vagy jelszó.";
    } else if (error.message.includes("Email not confirmed")) {
      customMessage = "Még nem erősítetted meg az e-mail címed. Kérjük, ellenőrizd a postafiókodat.";
    } else if (error.message.includes("Email not found")) {
      customMessage = "Ezzel az e-mail címmel nem található felhasználó.";
    }

    return {
      status: customMessage, // ← Ezt fogod kiírni a komponensben
      user: null,
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
