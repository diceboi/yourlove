"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthButton from "@/app/components/UI/Buttons/AuthButton";
import H2 from "@/app/components/UI/Texts/H2";
import Paragraph from "@/app/components/UI/Texts/Paragraph";
import Link from "next/link";
import { updatePassword } from "./actions";
import { toast } from "react-toastify";
import { TbEye, TbEyeClosed } from "react-icons/tb";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Check if we have a valid token
  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) {
      setError("Érvénytelen vagy lejárt link. Kérj új jelszó-visszaállítási emailt.");
    }
  }, [searchParams]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const password = formData.get("password")?.toString() ?? "";
    const confirmPassword = formData.get("confirmPassword")?.toString() ?? "";

    // Client-side validation
    if (password !== confirmPassword) {
      setError("A két jelszó nem egyezik meg.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("A jelszónak legalább 6 karakter hosszúnak kell lennie.");
      setLoading(false);
      return;
    }

    const result = await updatePassword(formData);

    if (result.status === "success") {
      toast.success("Jelszó sikeresen megváltoztatva!");
      router.push("/bejelentkezes");
    } else {
      setError(result.message || "Hiba történt. Kérjük, próbáld újra.");
    }

    setLoading(false);
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    return strength;
  };

  const handlePasswordChange = (e) => {
    const password = e.target.value;
    setPasswordStrength(calculatePasswordStrength(password));
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 1) return "bg-red-500";
    if (passwordStrength <= 3) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthText = () => {
    if (passwordStrength <= 1) return "Gyenge";
    if (passwordStrength <= 3) return "Közepes";
    return "Erős";
  };

  return (
    <div className="w-full xl:pt-28 pt-20 xl:pb-28 pb-20 px-4 xl:px-12">
      <div className="flex flex-col gap-8 items-center">
        <H2 className="items-center text-2xl font-semibold mb-4">
          Új jelszó beállítása
        </H2>
        <div className="flex flex-col items-center justify-center w-full">
          <form
            onSubmit={handleSubmit}
            className="lg:w-1/2 md:w-3/4 w-full flex flex-col gap-4"
          >
            <Paragraph classname="text-center text-[var(--tertiary-text)] mb-4">
              Add meg az új jelszavad.
            </Paragraph>
            
            <div>
              <label className="block text-sm font-medium text-[var(--secondary-text)]">
                Új jelszó
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Új jelszó"
                  name="password"
                  required
                  onChange={handlePasswordChange}
                  className="mt-1 w-full px-4 p-2 pr-10 h-10 rounded-md border border-[var(--grey-border)] bg-white text-sm text-[var(--tertiary-text)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--tertiary-text)] hover:text-[var(--tertiary-text)] transition-colors"
                  aria-label={showPassword ? "Jelszó elrejtése" : "Jelszó megjelenítése"}
                >
                  {showPassword ? <TbEyeClosed size={20} /> : <TbEye size={20} />}
                </button>
              </div>
              
              {/* Password strength indicator */}
              <div className="mt-2">
                <div className="flex gap-1 h-1.5 mb-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={`flex-1 rounded ${
                        level <= passwordStrength ? getStrengthColor() : "bg-[var(--grey-border)]"
                      }`}
                    />
                  ))}
                </div>
                {passwordStrength > 0 && (
                  <p className="text-xs text-[var(--tertiary-text)]">
                    Jelszó erőssége: {getStrengthText()}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--secondary-text)]">
                Jelszó megerősítése
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Jelszó megerősítése"
                  name="confirmPassword"
                  required
                  className="mt-1 w-full px-4 p-2 pr-10 h-10 rounded-md border border-[var(--grey-border)] bg-white text-sm text-[var(--tertiary-text)]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--tertiary-text)] hover:text-[var(--tertiary-text)] transition-colors"
                  aria-label={showConfirmPassword ? "Jelszó elrejtése" : "Jelszó megjelenítése"}
                >
                  {showConfirmPassword ? <TbEyeClosed size={20} /> : <TbEye size={20} />}
                </button>
              </div>
            </div>

            <div className="mt-4 space-y-4">
              <AuthButton type="Jelszó mentése" loading={loading} />
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
