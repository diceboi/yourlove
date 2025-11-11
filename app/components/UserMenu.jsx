"use client";

import { TbUser } from "react-icons/tb";
import Paragraph from "./UI/Texts/Paragraph";
import Image from "next/image";
import MenuText from "./UI/Texts/MenuText";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "react-toastify";
import Label from "./UI/Texts/Label";

export default function UserMenu() {
  const router = useRouter();
  const menuRef = useRef(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const supabase = createClient();

    // Load user once
    supabase.auth.getUser().then(async ({ data }) => {
      const authUser = data?.user ?? null;
      setUser(authUser);

      if (authUser?.email) {
        // 2️⃣ PROFILE betöltése külön táblából
        const { data: profile, error } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("email", authUser.email)
          .single();

        if (!error) {
          setUserProfile(profile);
        } else {
          console.error("Profile fetch error:", error);
        }
      }
    });

    // Listen for future changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setUserProfile(null); // új login esetén reseteljük a profilt
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleMouseEnter = () => {
    if (user) setDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    if (user) setDropdownOpen(false);
  };

  const doLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.info("Sikeres kijelentkezés!");
    router.push("/bejelentkezes"); // Refresh UI
    setUser(null);
  };

  const firstWord = (s) =>
  (s ?? '').trim().split(/\s+/)[0] || '';

  const displayName =
  userProfile?.firstname
  || firstWord(user?.user_metadata?.name)
  || firstWord((user?.email || '').split('@')[0])  // végső fallback
  || 'Felhasználó';

  return (
    <div
      ref={menuRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative z-50 lg:w-full"
    >
      <button
        onClick={!user ? () => router.push("/bejelentkezes") : null}
        className="flex flex-nowrap gap-2 items-center justify-center xl:px-6 xl:py-2 hover:bg-[var(--border)] xl:h-[44px] h-[40px] xl:w-auto w-[40px] rounded-full cursor-pointer"
      >
        {!user ? (
          <>
            <TbUser className="xl:w-5 xl:h-5 w-6 h-6 text-[var(--pink)]" />
            <Paragraph classname={"xl:flex hidden"}>Bejelentkezés</Paragraph>
          </>
        ) : (
          <>
            {user.user_metadata?.avatar_url ? (
              <Image
                src={user.user_metadata?.avatar_url}
                alt={`${user.email} profilképe`}
                width={20}
                height={20}
                className="rounded-full"
              />
            ) : (
              <TbUser className="xl:min-w-5 xl:min-h-5 min-w-6 min-h-6 text-[var(--pink)]" />
            )}
            <Paragraph className="xl:flex hidden min-w-fit">
              {`Szia, ${displayName}`}
            </Paragraph>
          </>
        )}
      </button>

      {dropdownOpen && user && (
        <div className="absolute flex flex-col mt-[44px] left-0 top-0 w-full min-w-fit rounded-xl bg-white border border-[var(--border)] overflow-hidden p-2">
          <button
            onClick={() => router.push("/admin")}
            className="px-6 py-2 hover:bg-[var(--grey-bg)] group rounded-lg"
          >
            <Label>Admin felület</Label>
          </button>
          <button 
            onClick={() => router.push("/fiok")}
            className="px-6 py-2 hover:bg-[var(--grey-bg)] group rounded-lg">
              <Label>Fiók</Label>
          </button>
          <button className="px-6 py-2 hover:bg-[var(--grey-bg)] group rounded-lg">
            <Label>Rendelések</Label>
          </button>
          <button className="px-6 py-2 hover:bg-[var(--grey-bg)] group rounded-lg">
            <Label>Kedvencek</Label>
          </button>
          <button
            onClick={doLogout}
            className="px-6 py-2 hover:bg-[var(--grey-bg)] group rounded-lg"
          >
            <Label>Kijelentkezés</Label>
          </button>
        </div>
      )}
    </div>
  );
}
