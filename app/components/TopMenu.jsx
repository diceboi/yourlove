"use client"

import { useEffect, useState } from "react"
import MenuText from "./UI/Texts/MenuText"
import Link from "next/link"
import { TbBrandFacebook, TbBrandYoutube, TbBrandTiktok } from "react-icons/tb"

export default function TopMenu() {
  const [announcements, setAnnouncements] = useState([])

  useEffect(() => {
    async function fetchAnnouncements() {
      try {
        const res = await fetch("/api/announcements")
        const data = await res.json()
        if (data.announcements && data.announcements.length > 0) {
          setAnnouncements(data.announcements)
        }
      } catch (error) {
        console.error("Failed to fetch announcements:", error)
      }
    }

    fetchAnnouncements()
  }, [])

  // If no announcements, don't show the marquee
  if (announcements.length === 0) {
    return (
      <div className="bg-[var(--black)] z-[999]">
        <div className="flex flex-nowrap min-h-8 items-center justify-between w-[calc(100%-32px)] xl:w-[calc(100%-96px)] m-auto">
          <div className="flex flex-nowrap gap-4 min-w-fit">
            <div className="flex flex-nowrap gap-2">
              <TbBrandYoutube className="w-5 h-5 text-white" />
              <TbBrandTiktok className="w-5 h-5 text-white" />
              <TbBrandFacebook className="w-5 h-5 text-white" />
            </div>
          </div>

          <div className="flex flex-nowrap gap-4">
            <Link href="/blog">
              <MenuText classname={"text-white hover:underline"}>
                Blog
              </MenuText>
            </Link>
            <Link href="/gyik">
              <MenuText classname={"text-white hover:underline"}>
                Gyik
              </MenuText>
            </Link>
            <Link href="/rolunk">
              <MenuText classname={"text-white hover:underline"}>
                Rólunk
              </MenuText>
            </Link>
            <Link href="/kapcsolat">
              <MenuText classname={"text-white hover:underline"}>
                Kapcsolat
              </MenuText>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const firstAnnouncement = announcements[0]
  // Calculate animation duration based on screen width
  const animationDuration = 25 // seconds

  return (
    <div
      className="z-[999]"
      style={{ backgroundColor: firstAnnouncement.bg_color || 'var(--black)' }}
    >
      <div className="flex flex-nowrap min-h-8 items-center justify-between w-[calc(100%-32px)] xl:w-[calc(100%-96px)] m-auto">
        <div className="flex flex-nowrap gap-4 min-w-fit">
          <div className="flex flex-nowrap gap-2">
            <TbBrandYoutube className="w-5 h-5 text-white" />
            <TbBrandTiktok className="w-5 h-5 text-white" />
            <TbBrandFacebook className="w-5 h-5 text-white" />
          </div>
        </div>

        <div className="relative w-full overflow-hidden h-6">
          <div
            className="absolute top-0 left-0 w-[50px] h-full z-10"
            style={{
              background: `linear-gradient(to right, ${firstAnnouncement.bg_color || 'var(--black)'}, transparent)`
            }}
          ></div>
          <div
            className="absolute top-0 right-0 w-[50px] h-full z-10"
            style={{
              background: `linear-gradient(to left, ${firstAnnouncement.bg_color || 'var(--black)'}, transparent)`
            }}
          ></div>

          {/* Create separate elements for each announcement with staggered delays */}
          {announcements.map((announcement, index) => (
            <div
              key={`${announcement.id}-${index}`}
              className="whitespace-nowrap text-sm absolute top-0"
              style={{
                color: announcement.text_color || 'white',
                animation: `marquee-stagger ${animationDuration}s linear infinite`,
                animationDelay: `${index * (animationDuration / announcements.length)}s`,
                animationFillMode: 'backwards'
              }}
            >
              {announcement.content}
            </div>
          ))}
        </div>

        <div className="flex flex-nowrap gap-4">
          <Link href="/blog">
            <MenuText classname={"text-white hover:underline"}>
              Blog
            </MenuText>
          </Link>
          <Link href="/gyik">
            <MenuText classname={"text-white hover:underline"}>
              Gyik
            </MenuText>
          </Link>
          <Link href="/rolunk">
            <MenuText classname={"text-white hover:underline"}>
              Rólunk
            </MenuText>
          </Link>
          <Link href="/kapcsolat">
            <MenuText classname={"text-white hover:underline"}>
              Kapcsolat
            </MenuText>
          </Link>
        </div>

        <style jsx>{`
          @keyframes marquee-stagger {
            from { left: 100%; }
            to { left: -100%; }
          }
        `}</style>

      </div>

    </div>
  )
}
