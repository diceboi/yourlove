import * as TablerIcons from "react-icons/tb";
import Button from "./Button";

export default function AddBlogTagButton({ link, onclick, }) {
  const IconComponent = TablerIcons["TbBookmark"] || null;

  return (
    <Button
      title={"Blog címke hozzáadása"}
      link={link}
      titlecolor={"text-black"}
      hovertitlecolor={"group-hover:text-white"}
      bgcolor={"bg-[var(--green)]"}
      bordercolor={""}
      hoverbgcolor={"hover:bg-[var(--green-hover)]"}
      onclick={onclick || (() => console.log("Clicked"))}
      beforeicon={
        IconComponent ? (
          <IconComponent className="text-black group-hover:text-white w-5 h-5" />
        ) : null
      }
      aftericon={null}
    />
  );
}
