import * as TablerIcons from "react-icons/tb";
import AdminButton from "./AdminButton";

export default function AdminSaveButton({
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
      titlecolor={"text-[var(--black)]"}
      hovertitlecolor={"group-hover:text-[var(--black)]"}
      bgcolor={"bg-[var(--green)]"}
      bordercolor={""}
      hoverbgcolor={"hover:bg-[var(--green-hover)]"}
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
