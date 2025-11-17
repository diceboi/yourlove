"use client";

import SocialLogin from "./SocialLogin";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import Link from "next/link";

export default function LoginForm() {
  const router = useRouter();
  const {
    register,
    formState: { errors },
    handleSubmit, // from useForm
  } = useForm();

  const [error, setError] = useState(null);

  async function onFormSubmit(data) {
    try {
      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("password", data.password);

      const response = await doCredentialLogin(formData);
      if (!!response.error) {
        setError(response.error);
      } else {
        toast("Sikeres belépés")
        router.push("/");

      }
    } catch (e) {
      console.error(e);
      setError("A belépési adatok hibásak, kérlek ellenőrizd őket.");
    }
  }

  return (
    <>
      <div>{error && <p role="alert">{error}</p>}</div>
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <input
          className="border"
          type="email"
          {...register("email", { required: "E-mail cím kötelező." })}
          aria-invalid={errors.email ? "true" : "false"}
        />
        {errors.email?.type === "required" && (
          <p role="alert">Az E-mail cím kitöltése kötelező.</p>
        )}

        <input
          type="password"
          className="border"
          {...register("password", { required: "Jelszó kötelező" })}
          aria-invalid={errors.password ? "true" : "false"}
        />
        {errors.password && <p role="alert">{errors.password.message}</p>}

        <input type="submit" />
      </form>
      <SocialLogin />
    </>
  );
}
