"use client";

import { useState } from "react";
import AuthButton from "@/app/components/UI/Buttons/AuthButton";
import H2 from "@/app/components/UI/Texts/H2";
import Paragraph from "@/app/components/UI/Texts/Paragraph";
import Link from "next/link";
import { sendPasswordResetEmail } from "./actions";
import { toast } from "react-toastify";

export default function ForgotPasswordPage() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const result = await sendPasswordResetEmail(formData);

    if (result.status === "success") {
      setEmailSent(true);
      toast.success("Email elküldve! Kérjük, ellenőrizd a postafiókodat.");
    } else {
      setError(result.message || "Hiba történt. Kérjük, próbáld újra.");
    }

    setLoading(false);
  };

  if (emailSent) {
    return (
      <div className="w-full xl:pt-28 pt-20 xl:pb-28 pb-20 px-4 xl:px-12">
        <div className="flex flex-col gap-8 items-center">
          <H2 className="items-center text-2xl font-semibold mb-4">
            Email elküldve
          </H2>
          <div className="flex flex-col items-center justify-center w-full lg:w-1/2 md:w-3/4 gap-6">
            <Paragraph classname="text-center text-[var(--tertiary-text)]">
              Jelszó-visszaállítási emailt küldtünk a megadott címre.
              Kérjük, ellenőrizd a postafiókodat és kattints a linkre az új jelszó beállításához.
            </Paragraph>
            <Paragraph classname="text-center text-[var(--tertiary-text)] text-sm">
              Nem érkezett meg? Ellenőrizd a spam mappát is.
            </Paragraph>
            <Link href="/bejelentkezes" className="w-full text-center">
              <Paragraph classname="text-[var(--pink)] underline">
                Vissza a bejelentkezéshez
              </Paragraph>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full xl:pt-28 pt-20 xl:pb-28 pb-20 px-4 xl:px-12">
      <div className="flex flex-col gap-8 items-center">
        <H2 className="items-center text-2xl font-semibold mb-4">
          Elfelejtett jelszó
        </H2>
        <div className="flex flex-col items-center justify-center w-full">
          <form
            onSubmit={handleSubmit}
            className="lg:w-1/2 md:w-3/4 w-full flex flex-col gap-4"
          >
            <Paragraph classname="text-center text-[var(--tertiary-text)] mb-4">
              Add meg az email címed, és küldünk egy linket a jelszó visszaállításához.
            </Paragraph>
            <div>
              <label className="block text-sm font-medium text-[var(--tertiary-text)]">
                E-mail cím
              </label>
              <input
                type="email"
                placeholder="E-mail cím"
                name="email"
                required
                className="mt-1 w-full px-4 p-2 h-10 rounded-md border border-[var(--grey-border)] bg-white text-sm text-[var(--tertiary-text)]"
              />
            </div>
            <div className="mt-4 space-y-4">
              <AuthButton type="Jelszó visszaállítása" loading={loading} />
              <Link href="/bejelentkezes" className="w-full text-center">
                <Paragraph classname="text-[var(--pink)] underline">
                  Vissza a bejelentkezéshez
                </Paragraph>
              </Link>
            </div>
            {error && <p className="text-red-500">{error}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}
