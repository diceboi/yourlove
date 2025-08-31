import * as TablerIcons from "react-icons/tb";
import Button from "./Button";

export default function AddCategoryButton({ link, onclick, }) {
  const IconComponent = TablerIcons["TbFolders"] || null;

  return (
    <Button
      title={"Termékkategória hozzáadása"}
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
