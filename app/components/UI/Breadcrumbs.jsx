'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TbChevronRight } from "react-icons/tb";

const Breadcrumbs = () => {
  const pathname = usePathname();

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
    // ide írhatod a többi slug jelentését
  };

  const pathSegments = pathname.split('/').filter(Boolean);

  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = '/' + pathSegments.slice(0, index + 1).join('/');
    const label = labelMap[segment] ?? decodeURIComponent(segment).replace(/-/g, ' ');

    return { href, label };
  });

  return (
    <nav aria-label="Breadcrumb" className="text-sm text-[var(--tertiary-text)]">
      <ol className="flex space-x-2 lg:text-lg text-sm">
        <li>
          <Link href="/" className="hover:underline hover:text-[var(--black)]">Kezdőlap</Link>
        </li>
        {breadcrumbs.map((crumb, index) => (
          <li key={crumb.href} className="flex items-center hover:text-[var(--black)]">
            <TbChevronRight className="mr-1 text-xl text-[var(--green)]" />
            {index < breadcrumbs.length - 1 ? (
              <Link href={crumb.href} className="hover:underline">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-[var(--black)]">{crumb.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
