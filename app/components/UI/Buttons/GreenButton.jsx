import * as TablerIcons from "react-icons/tb";
import Button from "./Button";

export default function GreenButton({
  title,
  link,
  onclick,
  buttonicon
}) {
  const IconComponent = buttonicon && TablerIcons[buttonicon] ? TablerIcons[buttonicon] : null
  const safeOnClick = typeof onclick === 'function' ? onclick : undefined

  return (
    <Button
      title={title}
      link={link}
      titlecolor={"text-[var(--black)]"}
      hovertitlecolor={"group-hover:text-[var(--black)]"}
      bgcolor={"bg-[var(--green)]"}
      bordercolor={""}
      hoverbgcolor={"hover:bg-[var(--green-hover)]"}
      onclick={safeOnClick}
      beforeicon={null}
      aftericon={
        IconComponent ? (
          <IconComponent className="text-[var(--black)] w-5 h-5" />
        ) : null
      }
    />
  );
}
