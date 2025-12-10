"use client";

import { singIn } from "@/app/_actions/auth";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthButton from "@/app/components/UI/Buttons/AuthButton";
import { toast } from "react-toastify";
import GoogleButton from "@/app/components/auth/GoogleButton";
import AppleButton from "@/app/components/auth/AppleButton";
import H2 from "@/app/components/UI/Texts/H2";
import Paragraph from "@/app/components/UI/Texts/Paragraph";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const [emailError, setEmailError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setEmailError(null);
    setPasswordError(null);

    const formData = new FormData(event.currentTarget);

    const result = await singIn(formData);

    if (result.status === "success") {
      toast.success("Sikeres bejelentkezés!");
      window.dispatchEvent(new Event('auth:changed'));
      window.location.href = "/";
    } else {
      // Determine which field has the error
      const errorMessage = result.message || "Sikertelen bejelentkezés. Kérjük, próbáld újra.";
      
      if (errorMessage.toLowerCase().includes("email") || errorMessage.toLowerCase().includes("e-mail")) {
        setEmailError(errorMessage);
      } else if (errorMessage.toLowerCase().includes("jelszó") || errorMessage.toLowerCase().includes("password")) {
        setPasswordError(errorMessage);
      } else {
        // If we can't determine, show on password field (last field)
        setPasswordError(errorMessage);
      }
    }

    setLoading(false);
  };

  return (
    <div className="w-full xl:pt-28 pt-20 xl:pb-28 pb-20 px-4 xl:px-12">
      <div className="flex flex-col gap-8 items-center w-full">
        <H2 className="items-center text-2xl font-semibold mb-4">Bejelentkezés</H2>
        <div className="flex flex-col items-center justify-center w-full">
          <form onSubmit={handleSubmit} className="lg:w-1/2 md:w-3/4 w-full flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-200">
                E-mail cím
              </label>
              <input
                type="email"
                placeholder="E-mail cím"
                name="email"
                className="mt-1 w-full px-4 p-2 h-10 rounded-md border border-gray-200 bg-white text-sm text-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-200">
                Jelszó
              </label>
              <input
                type="password"
                placeholder="Jelszó"
                name="jelszo"
                className="mt-1 w-full px-4 p-2 h-10 rounded-md border border-gray-200 bg-white text-sm text-gray-700"
              />
            </div>
            {emailError && <p className="text-red-500 text-sm mt-1 text-center">{emailError}</p>}
            {passwordError && <p className="text-red-500 text-sm mt-1 text-center">{passwordError}</p>}
            <div className="mt-4 space-y-4">
              <AuthButton type="Bejelentkezés" loading={loading} />
              <div className="relative w-full flex flex-nowrap items-center justify-center gap-2 py-4">
                <div className="flex items-center w-full">
                  <div className="flex-grow border-t border-gray-300"></div>
                  <Paragraph classname={"mx-4 text-gray-500"}>Vagy</Paragraph>
                  <div className="flex-grow border-t border-gray-300"></div>
                </div>
              </div>
              <GoogleButton type={"/"} title={"Bejelentkezés Google-lel"} />
              {/*<AppleButton type={"/"} title={"Bejelentkezés Apple-lel"} />*/}
              <Link href={"/regisztracio"} className="w-full text-center">
                <Paragraph classname={"text-[var(--pink)] underline"}>Regisztráció</Paragraph>
              </Link>
              <Link href={"/elfelejtett-jelszo"} className="w-full text-center">
                <Paragraph classname={"text-[var(--pink)] underline"}>Elfelejtett jelszó?</Paragraph>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
