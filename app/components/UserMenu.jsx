"use client";

import { TbUser } from "react-icons/tb";
import Paragraph from "./UI/Texts/Paragraph";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect, useContext } from "react";
import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Caveat } from "next/font/google";
import { MenuContext } from "@/app/MenuContext";

const caveat = Caveat({ subsets: ["latin"], weight: ["400", "700"] });

export default function UserMenu() {
  const router = useRouter();
  const { setActiveDrawer } = useContext(MenuContext);
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [showWave, setShowWave] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    // Load user once
    supabase.auth.getUser().then(async ({ data }) => {
      const authUser = data?.user ?? null;
      setUser(authUser);

      if (authUser?.id) {
        // 2️⃣ PROFILE betöltése ID alapján
        const { data: profile, error } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", authUser.id)
          .maybeSingle();

        if (!error && profile) {
          setUserProfile(profile);
        } else if (error) {
          console.error("Profile fetch error:", error);
        }
        setProfileLoading(false); // Profile betöltés befejezve (akár volt, akár nem)
      } else {
        setProfileLoading(false); // Nincs user, tehát nincs mit betölteni
      }
    });

    // Listen for future changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setUserProfile(null); // új login esetén reseteljük a profilt
        setProfileLoading(true); // Újra töltjük
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // Wave animation cycle
  useEffect(() => {
    if (!user) return;

    // First wave shortly after load
    const firstWaveTimeout = setTimeout(() => {
      setShowWave(true);
      setTimeout(() => {
        setShowWave(false);
      }, 2500); // Wave stays for 2.5s then goes away
    }, 1000); // 1 second after load

    // Then repeat every 8 seconds
    const interval = setInterval(() => {
      setShowWave(true);
      setTimeout(() => {
        setShowWave(false);
      }, 2500); // Wave stays for 2.5s then goes away
    }, 8000); // Every 8 seconds

    return () => {
      clearTimeout(firstWaveTimeout);
      clearInterval(interval);
    };
  }, [user]);

  const firstWord = (s) =>
    (s ?? '').trim().split(/\s+/)[0] || '';

  // Csak akkor használj fallbacket (email-es név), ha már biztosan betöltött a profil és nincs firstname
  const displayName = 
    userProfile?.firstname ||  // Ha van profil keresztnév, mindig azt használd
    (!profileLoading && user ? (  // Csak ha már betöltött minden és nincs firstname
      firstWord(user?.user_metadata?.name) ||
      firstWord((user?.email || '').split('@')[0]) ||
      'Felhasználó'
    ) : '...');  // Betöltés alatt


  return (
    <div className="relative z-50 lg:w-full">
      <button
        onClick={() => {
          if (!user) {
            router.push("/bejelentkezes");
          } else {
            setActiveDrawer('user');
          }
        }}
        className="flex flex-nowrap gap-2 items-center justify-center xl:px-6 xl:py-2 hover:bg-[var(--border)] xl:h-[44px] h-[40px] xl:w-auto w-[40px] rounded-full cursor-pointer overflow-hidden"
      >
        {!user ? (
          <>
            <TbUser className="xl:w-5 xl:h-5 w-6 h-6 text-[var(--pink)]" />
            <Paragraph classname={"xl:flex hidden"}>Bejelentkezés</Paragraph>
          </>
        ) : (
          <>
            <div className="relative xl:w-6 xl:h-6 w-6 h-6">
              <AnimatePresence mode="wait">
                {!showWave ? (
                  <motion.div
                    key="icon"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="absolute inset-0"
                  >
                    {user.user_metadata?.avatar_url ? (
                      <Image
                        src={user.user_metadata?.avatar_url}
                        alt={`${user.email} profilképe`}
                        width={30}
                        height={30}
                        className="rounded-full"
                      />
                    ) : (
                      <TbUser className="w-full h-full text-[var(--pink)]" />
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="wave"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{
                      y: 0,
                      opacity: 1,
                      rotate: [0, 0, 20, -10, 25, 0] // Smoother waving with more keyframes
                    }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{
                      y: { duration: 0.5, ease: "easeInOut" },
                      opacity: { duration: 0.5 },
                      rotate: {
                        duration: 1.4,
                        times: [0, 0.36, 0.5, 0.64, 0.78, 0.86, 0.93, 1], // More gradual timing
                        ease: [0.4, 0, 0.2, 1] // Custom smooth easing
                      }
                    }}
                    className="absolute inset-0 flex items-center justify-center text-xl"
                    style={{ transformOrigin: '50% 85%' }} // Rotation point at palm
                  >
                    🖐️
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Paragraph classname={`${caveat.className} xl:flex items-center hidden min-w-fit text-xl font-bold`}>
              Szia <span className={`ml-1 text-[var(--pink)] `}>{displayName}</span>
            </Paragraph>
          </>
        )}
      </button>
    </div>
  );
}
