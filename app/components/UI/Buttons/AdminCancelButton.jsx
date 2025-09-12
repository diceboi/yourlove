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
      titlecolor={"text-[var(--error)]"}
      hovertitlecolor={""}
      bgcolor={"bg-transparent"}
      bordercolor={"border-[var(--error)]"}
      hoverbgcolor={"hover:bg-[var(--border)]"}
      onclick={onclick || (() => console.log("Clicked"))}
      beforeicon={
        IconComponent ? (
          <IconComponent className="text-[var(--error)] w-5 h-5" />
        ) : null
      }
      aftericon={null}
    />
  );
}
