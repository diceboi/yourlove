'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { TbChevronRight } from 'react-icons/tb'

/**
 * Optional prop: trail = [{ label: 'Termékek', href: '/termekek' }, ...]
 * Ha van trail, azt rendereljük (pl. kategória NÉVVEL).
 * Ha nincs, a path-ból képezzük (fallback).
 */
export default function Breadcrumbs({ trail }) {
  const pathname = usePathname()

  // fallback címkék (ha nincs trail)
  const labelMap = {
    termekek: 'Termékek',
    about: 'Rólunk',
    ferfiaknak: 'Férfiaknak',
    noknek: 'Nőknek',
    vibratorok: 'Vibrátorok',
    jatekok: 'Játékok',
    drogeria: 'Drogéria',
    contact: 'Kapcsolat',
    blog: 'Blog',
    kaposvar: 'Kaposvár',
  }

  // ha kaptunk trail-t (már nevekkel), azt használjuk
  let crumbs = Array.isArray(trail) && trail.length ? trail : null

  // különben path-ból építünk egyszerű fallbacket
  if (!crumbs) {
    const segments = pathname.split('/').filter(Boolean)
    crumbs = segments.map((segment, index) => {
      const href = '/' + segments.slice(0, index + 1).join('/')
      const label =
        labelMap[segment] ??
        decodeURIComponent(segment).replace(/-/g, ' ')
      return { href, label }
    })
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className="text-sm text-[var(--tertiary-text)] lg:border-0 border-b border-[var(--border)] pb-1"
    >
      <ol className="flex flex-wrap space-x-2 lg:text-lg text-sm">
        <li>
          <Link href="/" className="hover:underline hover:text-[var(--black)]">
            Kezdőlap
          </Link>
        </li>

        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1
          return (
            <li key={crumb.href || index} className="flex items-center hover:text-[var(--black)]">
              <TbChevronRight className="mr-1 text-xl text-[var(--green)]" />
              {isLast ? (
                <span className="text-[var(--black)]">{crumb.label}</span>
              ) : (
                <Link href={crumb.href} className="hover:underline">
                  {crumb.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
