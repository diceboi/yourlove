"use client"

import { useState } from "react";
import AuthButton from "@/app/components/UI/Buttons/AuthButton";
import { useRouter } from "next/navigation";
import { signUp } from "@/app/_actions/auth"
import GoogleButton from "@/app/components/auth/GoogleButton";
import H2 from "@/app/components/UI/Texts/H2";
import Paragraph from "@/app/components/UI/Texts/Paragraph";

export default function LoginPage() {

  const router = useRouter();

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  // const router = useRouter();
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(event.currentTarget);
    const result = await signUp(formData)

    if (result.status === "success") {
      router.push("/bejelentkezes");
    } else {
      setError(result.status);
    }

    setLoading(false);
  };
  return (
    <div className="w-full xl:pt-28 pt-20 xl:pb-28 pb-20 px-4 xl:px-12">
      <div className="flex flex-col gap-8 items-center">
      <H2 className="flex flex-col items-center text-2xl font-semibold mb-4 self-center">Regisztráció</H2>
      <div className="flex flex-col items-center justify-center w-full">
      <form onSubmit={handleSubmit} className="lg:w-1/2 md:w-3/4 w-full flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-200">
            Vezetéknév
          </label>
          <input
            type="lastname"
            placeholder="Vezetéknév"
            id="vezeteknev"
            name="vezeteknev"
            className="mt-1 w-full px-4 p-2  h-10 rounded-md border border-gray-200 bg-white text-sm text-gray-700"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-200">
            Keresztnév
          </label>
          <input
            type="firstname"
            placeholder="Keresztnév"
            id="keresztnev"
            name="keresztnev"
            className="mt-1 w-full px-4 p-2  h-10 rounded-md border border-gray-200 bg-white text-sm text-gray-700"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-200">
            E-mail cím
          </label>
          <input
            type="email"
            placeholder="E-mail cím"
            id="Email"
            name="email"
            className="mt-1 w-full px-4 p-2  h-10 rounded-md border border-gray-200 bg-white text-sm text-gray-700"
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
            id="jelszo"
            className="mt-1 w-full px-4 p-2  h-10 rounded-md border border-gray-200 bg-white text-sm text-gray-700"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-200">
            Telefonszám
          </label>
          <input
            type="tel"
            placeholder="Telefonszám"
            name="telefonszam"
            id="telefonszam"
            className="mt-1 w-full px-4 p-2  h-10 rounded-md border border-gray-200 bg-white text-sm text-gray-700"
          />
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
        {error && <p className="text-red-500">{error}</p>}
      </form>
      </div>
      </div>
    </div>
  );
};