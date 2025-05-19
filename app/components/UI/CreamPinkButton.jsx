import * as TablerIcons from "react-icons/tb";
import Button from "./Button";

export default function CreamPinkButton({
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
      hovertitlecolor={"group-hover:text-[var(--black)]"}
      bgcolor={"bg-[var(--cream-pink)]"}
      bordercolor={""}
      hoverbgcolor={"hover:bg-[var(--cream-pink-hover)]"}
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
