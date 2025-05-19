import * as TablerIcons from "react-icons/tb";
import Button from "./Button";

export default function BlackBorderButton({
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
      titlecolor={"text-[var(--black)]"}
      hovertitlecolor={"group-hover:text-white"}
      bgcolor={"bg-transparent"}
      bordercolor={"border-[var(--black)]"}
      hoverbgcolor={"hover:bg-[var(--black)]"}
      onclick={onclick || (() => console.log("Clicked"))}
      beforeicon={null}
      aftericon={
        IconComponent ? (
          <IconComponent className="text-[var(--black)] group-hover:text-white w-5 h-5" />
        ) : null
      }
    />
  );
}
