import * as TablerIcons from "react-icons/tb";
import SmallButton from "./SmallButton";

export default function FilterChipButton({
  title,
  link,
  onclick,
  buttonicon
}) {
  const IconComponent = TablerIcons[buttonicon] || null;

  return (
    <SmallButton
      title={title}
      link={link || null}
      titlecolor={"text-[var(--black)]"}
      hovertitlecolor={""}
      bgcolor={"bg-[var(--border)]"}
      bordercolor={"border-[var(--border)]"}
      hoverbgcolor={""}
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
