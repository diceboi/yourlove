"use client";

import SearchBarAdmin from "./SearchBarAdmin";
import UserMenu from "./UserMenu";
import MobileToggle from "./MobileToggle";
import { usePathname } from "next/navigation";
import AdminPageLogo from "./UI/AdminPageLogo";

export default function Adminnav() {
  const pathname = usePathname();

  return (
    <div
      className={`z-40 sticky top-0 left-0 bg-white xl:h-[84px] h-[54px] w-full border-b border-[var(--border)]`}
    >
      <div
        className="flex flex-col xl:h-[84px] h-[54px] w-[calc(100%-32px)] xl:w-[calc(100%-96px)] m-auto bg-white lg:border-b border-0 border-[var(--border)]"
      >
        <div className="flex flex-col w-full xl:gap-0 gap-2">
          <div className="flex flex-row w-full justify-between gap-8 z-50 xl:pt-4 pt-2 bg-white">
            <div
              id="desktop-search-logo"
              className="xl:flex hidden flex-row w-fit gap-8 items-center justify-start"
            >
              <AdminPageLogo />
              <SearchBarAdmin />
            </div>
            <div
              id="mobile-logo"
              className={`xl:hidden flex flex-row w-fit gap-8 items-center justify-start`}
            >
              <AdminPageLogo />
            </div>
            <div className="flex flex-row w-fit items-center justify-end">
              <UserMenu />
              <MobileToggle />
            </div>
          </div>
        </div>
      </div>
      <div
        id="mobile-search"
        className="flex xl:hidden bg-white"
      >
        <div className="w-[calc(100%-32px)] mx-auto py-2">
          <SearchBarAdmin />
        </div>
      </div>
    </div>
  );
}
