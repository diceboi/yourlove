import * as TablerIcons from "react-icons/tb";
import Button from "./Button";

export default function WhiteBorderButton({
  title,
  link,
  onclick,
  buttonicon
}) {
  const IconComponent = TablerIcons[buttonicon] || null;

  return (
    <Button
      title={title}
      link={link}
      titlecolor={"text-white"}
      hovertitlecolor={"group-hover:text-[var(--black)]"}
      bgcolor={"bg-transparent"}
      bordercolor={"border-white"}
      hoverbgcolor={"hover:bg-white"}
      onclick={onclick || (() => console.log("Clicked"))}
      beforeicon={null}
      aftericon={
        IconComponent ? (
          <IconComponent className="text-white group-hover:text-[var(--black)] w-5 h-5" />
        ) : null
      }
    />
  );
}
