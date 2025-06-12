import * as TablerIcons from "react-icons/tb";
import Button from "./Button";

export default function PinkButton({
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
      hovertitlecolor={"group-hover:text-white"}
      bgcolor={"bg-[var(--pink)]"}
      bordercolor={""}
      hoverbgcolor={"hover:bg-[var(--pink-hover)]"}
      onclick={onclick || (() => console.log("Clicked"))}
      beforeicon={null}
      aftericon={
        IconComponent ? (
          <IconComponent className="text-white w-5 h-5" />
        ) : null
      }
    />
  );
}
