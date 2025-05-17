"use client"

import MainMenuItem from "./MainMenuItem";

export default function MainMenu() {

  return (
      <div className="flex flex-row items-end justify-start gap-4 border-b border-[var(--border)] w-fit bg-white z-10">
        <MainMenuItem
          title={"Férfiaknak"}
          icon={"/icons/ferfi.svg"}
          onclick={"ferfiaknak"}
        />
        <MainMenuItem
          title={"Nőknek"}
          icon={"/icons/no.svg"}
          onclick={"noknek"}
        />
        <MainMenuItem
          title={"Vibrátorok"}
          icon={"/icons/vibrator.svg"}
          onclick={"vibratorok"}
        />
        <MainMenuItem
          title={"Játékok"}
          icon={"/icons/jatek.svg"}
          onclick={"jatekok"}
        />
        <MainMenuItem
          title={"Drogéria"}
          icon={"/icons/drogeria.svg"}
          onclick={"drogeria"}
        />
        <MainMenuItem title={"GYIK"} onclick={"gyik"} />
        <MainMenuItem title={"Rólunk"} onclick={"rolunk"} />
        <MainMenuItem title={"Kapcsolat"} onclick={"kapcsolat"} />
      </div>
  );
}
