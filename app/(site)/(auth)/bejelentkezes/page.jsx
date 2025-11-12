"use client";

import { singIn } from "@/app/_actions/auth";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthButton from "@/app/components/UI/Buttons/AuthButton";
import { toast } from "react-toastify";
import GoogleButton from "@/app/components/auth/GoogleButton";
import H2 from "@/app/components/UI/Texts/H2";

export default function LoginPage() {
  const router = useRouter();

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);

    const result = await singIn(formData);

    if (result.status === "success") {
      toast.success("Sikeres bejelentkezés!");
      window.location.href = "/";
    } else {
      setError(result.status);
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
          <div className="mt-4 space-y-4">
            <AuthButton type="Bejelentkezés" loading={loading} />
            <GoogleButton type={"/"} title={"Bejelentkezés Google-lel"}/>
          </div>
          {error && <p className="text-red-500">{error}</p>}
        </form>
      </div>
      </div>
    </div>
  );
}
