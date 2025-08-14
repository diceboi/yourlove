import * as TablerIcons from "react-icons/tb";
import AdminButton from "./AdminButton";

export default function AdminCancelButton({
  title,
  link,
  onclick,
  buttonicon
}) {
  const IconComponent = TablerIcons[buttonicon] || null;

  return (
    <AdminButton
      title={title}
      link={link}
      titlecolor={"text-white"}
      hovertitlecolor={"group-hover:text-white"}
      bgcolor={"bg-[var(--error)]"}
      bordercolor={""}
      hoverbgcolor={"hover:bg-[var(--error-hover)]"}
      onclick={onclick || (() => console.log("Clicked"))}
      beforeicon={null}
      aftericon={
        IconComponent ? (
          <IconComponent className="text-[var(--black)] w-5 h-5" />
        ) : null
      }
    />
  );
}
