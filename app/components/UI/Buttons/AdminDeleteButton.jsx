import { useState, useEffect } from "react";
import * as TablerIcons from "react-icons/tb";
import AdminButton from "./AdminButton";

export default function AdminDeleteButton({
  title = "Törlés",
  onconfirm,                 // a tényleges törlés függvénye
  buttonicon = "TbTrash",
  timeout = 4000,           // 2. kattintásra várakozás (ms)
}) {
  const [confirming, setConfirming] = useState(false);
  const IconComponent = TablerIcons[buttonicon] || TablerIcons.TbTrash;

  useEffect(() => {
    if (!confirming) return;
    const t = setTimeout(() => setConfirming(false), timeout);
    return () => clearTimeout(t);
  }, [confirming, timeout]);

  const handleClick = () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setConfirming(false);
    onconfirm?.();
  };

  return (
    <AdminButton
      title={confirming ? "Biztosan törlöd? Kattints újra!" : title}
      link={""}
      titlecolor={"text-white"}
      hovertitlecolor={"group-hover:text-white"}
      // alapból az error színedet használja; megerősítésnél sötétít
      bgcolor={confirming ? "bg-red-700" : "bg-[var(--error)]"}
      bordercolor={confirming ? "border border-red-800" : ""}
      hoverbgcolor={confirming ? "hover:bg-red-800" : "hover:bg-[var(--error-hover)]"}
      onclick={handleClick}
      beforeicon={<IconComponent className="text-white w-5 h-5" />}
      aftericon={null}
    />
  );
}
