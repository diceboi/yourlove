"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "react-toastify";
import AuthButton from "@/app/components/UI/Buttons/AuthButton";
import { TbEye, TbEyeClosed } from "react-icons/tb";

export default function PasswordChangePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const calculatePasswordStrength = (pass) => {
    let strength = 0;
    if (pass.length >= 6) strength++;
    if (pass.length >= 8) strength++;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) strength++;
    if (/\d/.test(pass)) strength++;
    if (/[^a-zA-Z\d]/.test(pass)) strength++;
    return strength;
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    setPasswordStrength(calculatePasswordStrength(val));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("A jelszónak legalább 6 karakter hosszúnak kell lennie.");
      return;
    }

    if (password !== confirmPassword) {
      setError("A két jelszó nem egyezik.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) {
        throw updateError;
      }

      toast.success("A jelszavad sikeresen megváltozott!");
      setPassword("");
      setConfirmPassword("");
      setPasswordStrength(0);
    } catch (err) {
      console.error("Password update error:", err);
      toast.error("Hiba történt a jelszó módosítása közben.");
      setError("Hiba történt a jelszó módosítása közben.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md">
      <h2 className="text-lg font-semibold mb-4">Jelszó változtatás</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        
        {/* Új jelszó */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Új jelszó
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              value={password}
              onChange={handlePasswordChange}
              className="w-full px-4 p-2 pr-10 h-10 rounded-md border border-gray-300 bg-white text-sm focus:ring-2 focus:ring-[var(--pink)] outline-none"
              placeholder="Legalább 6 karakter"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
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
                    level <= passwordStrength ? getStrengthColor() : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
            {passwordStrength > 0 && (
              <p className="text-xs text-gray-500">
                Jelszó erőssége: {getStrengthText()}
              </p>
            )}
          </div>
        </div>

        {/* Megerősítés */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Új jelszó megerősítése
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 p-2 pr-10 h-10 rounded-md border border-gray-300 bg-white text-sm focus:ring-2 focus:ring-[var(--pink)] outline-none"
              placeholder="Jelszó újra"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
              aria-label={showConfirmPassword ? "Jelszó elrejtése" : "Jelszó megjelenítése"}
            >
              {showConfirmPassword ? <TbEyeClosed size={20} /> : <TbEye size={20} />}
            </button>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="mt-2">
          <AuthButton type="Jelszó mentése" loading={loading} />
        </div>
      </form>
    </div>
  );
}
