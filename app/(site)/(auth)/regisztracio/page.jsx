"use client"

import { useState } from "react";
import AuthButton from "@/app/components/UI/Buttons/AuthButton";
import { useRouter } from "next/navigation";
import { signUp } from "@/app/_actions/auth"
import GoogleButton from "@/app/components/auth/GoogleButton";
import H2 from "@/app/components/UI/Texts/H2";
import Paragraph from "@/app/components/UI/Texts/Paragraph";
import { toast } from "react-toastify";

export default function LoginPage() {

  const router = useRouter();

  const [emailError, setEmailError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [generalError, setGeneralError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dial, setDial] = useState('+36');
  const [phone, setPhone] = useState('');

  const HUNGARIAN_PHONE_REGEX = /^\+36\s?(1|20|21|30|31|50|70|71|72|73|75|76|77|78|79)\s?\d{3}\s?\d{3,4}$/;
  const GENERIC_PHONE_REGEX = /^\+\d{2,3}\s?\d{6,12}$/;
  // const router = useRouter();
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setEmailError(null);
    setPasswordError(null);
    setGeneralError(null);
    
    const formData = new FormData(event.currentTarget);
    
    // Add formatted phone to formData
    const fullPhone = phone ? `${dial} ${phone}`.trim() : '';
    formData.set('telefonszam', fullPhone);
    const result = await signUp(formData)

    if (result.status === "success") {
      router.push("/bejelentkezes");
      toast.success("Sikeres regisztráció! Kérjük erősítsd meg az email címedet, az oda küldött linkre kattintva.");
    } else {
      // Determine which field has the error
      const errorMessage = result.message || "Sikertelen regisztráció. Kérjük, próbáld újra.";
      
      if (errorMessage.toLowerCase().includes("email") || errorMessage.toLowerCase().includes("e-mail")) {
        setEmailError(errorMessage);
      } else if (errorMessage.toLowerCase().includes("jelszó") || errorMessage.toLowerCase().includes("password")) {
        setPasswordError(errorMessage);
      } else {
        // General errors (like "user already exists")
        setGeneralError(errorMessage);
      }
    }

    setLoading(false);
  };
  return (
    <div className="w-full xl:pt-28 pt-20 xl:pb-28 pb-20 px-4 xl:px-12">
      <div className="flex flex-col gap-8 items-center">
      <H2 className="flex flex-col items-center text-2xl font-semibold mb-4 self-center">Regisztráció</H2>
      <div className="flex flex-col items-center justify-center w-full">
      <form onSubmit={handleSubmit} className="lg:w-1/2 md:w-3/4 w-full flex flex-col gap-4">
        {generalError && <p className="text-red-500 text-sm">{generalError}</p>}
        <div>
          <label className="block text-sm font-medium text-[var(--secondary-text)]">
            Vezetéknév <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Vezetéknév"
            id="vezeteknev"
            name="vezeteknev"
            required
            className="mt-1 w-full px-4 p-2  h-10 rounded-md border border-[var(--border)] bg-white text-sm text-[var(--tertiary-text)]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--secondary-text)]">
            Keresztnév <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Keresztnév"
            id="keresztnev"
            name="keresztnev"
            required
            className="mt-1 w-full px-4 p-2  h-10 rounded-md border border-[var(--border)] bg-white text-sm text-[var(--tertiary-text)]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--secondary-text)]">
            E-mail cím <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            placeholder="E-mail cím"
            id="Email"
            name="email"
            required
            className="mt-1 w-full px-4 p-2  h-10 rounded-md border border-[var(--border)] bg-white text-sm text-[var(--tertiary-text)]"
          />
          {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--secondary-text)]">
            Jelszó <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            placeholder="Jelszó (min. 6 karakter)"
            name="jelszo"
            id="jelszo"
            required
            minLength={6}
            className="mt-1 w-full px-4 p-2  h-10 rounded-md border border-[var(--border)] bg-white text-sm text-[var(--tertiary-text)]"
          />
          {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--secondary-text)]">
            Telefonszám
          </label>
          <div className="grid grid-cols-3 gap-3 mt-1">
            <select
              className="input min-w-[100px] px-4 p-2 h-10 rounded-md border border-[var(--border)] bg-white text-sm text-[var(--tertiary-text)]"
              value={dial}
              onChange={(e) => setDial(e.target.value)}
              aria-label="Országkód"
            >
              <option value="+36">🇭🇺 +36</option>
              <option value="+43">🇦🇹 +43</option>
              <option value="+421">🇸🇰 +421</option>
              <option value="+40">🇷🇴 +40</option>
              <option value="+49">🇩🇪 +49</option>
            </select>

            <input
              className="input col-span-2 px-4 p-2 h-10 rounded-md border border-[var(--border)] bg-white text-sm text-[var(--tertiary-text)]"
              placeholder={dial === '+36' ? '30 123 4567 vagy 1 234 5678' : 'Telefonszám'}
              value={phone}
              onChange={(e) => {
                let raw = e.target.value.replace(/\D/g, '').slice(0, 9);
                let formatted = raw;

                if (dial === '+36') {
                  if (raw.startsWith('1')) {
                    if (raw.length <= 1) formatted = raw;
                    else if (raw.length <= 4) formatted = `1 ${raw.slice(1)}`;
                    else if (raw.length <= 7)
                      formatted = `1 ${raw.slice(1, 4)} ${raw.slice(4)}`;
                    else formatted = `1 ${raw.slice(1, 4)} ${raw.slice(4, 8)}`;
                  } else {
                    if (raw.length <= 2) formatted = raw;
                    else if (raw.length <= 5)
                      formatted = `${raw.slice(0, 2)} ${raw.slice(2)}`;
                    else if (raw.length <= 8)
                      formatted = `${raw.slice(0, 2)} ${raw.slice(2, 5)} ${raw.slice(5)}`;
                    else formatted = `${raw.slice(0, 2)} ${raw.slice(2, 5)} ${raw.slice(5, 9)}`;
                  }
                } else {
                  if (raw.length > 3)
                    formatted = `${raw.slice(0, 3)} ${raw.slice(3, 6)} ${raw.slice(6)}`;
                }

                setPhone(formatted.trim());
              }}
              inputMode="tel"
              type="tel"
            />
          </div>

          <p className="text-xs text-[var(--tertiary-text)] mt-1">
            {phone ? (
              <>Teljes szám: <span className="font-medium">{`${dial} ${phone}`}</span></>
            ) : (
              'Opcionális, de ajánlott megadni'
            )}
          </p>
        </div>
        <div className="mt-4 space-y-4">
          <AuthButton type="Regisztráció" loading={loading} />
          <div className="relative w-full flex flex-nowrap items-center justify-center gap-2 py-4">
            <div className="flex items-center w-full">
              <div className="flex-grow border-t border-gray-300"></div>
              <Paragraph classname={"mx-4 text-gray-500"}>Vagy</Paragraph>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>
          </div>
          <GoogleButton type={"/"} title={"Bejelentkezés Google-lel"}/>
        </div>
      </form>
      </div>
      </div>
    </div>
  );
};