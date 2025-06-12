import * as TablerIcons from "react-icons/tb";
import SmallButton from "./SmallButton";
import { useRouter } from "next/navigation";

export default function TagButton({
  title,
  link,
  buttonicon,
  iconcolor,
  titlecolor,
  hovertitlecolor,
  bgcolor,
  bordercolor,
  hoverbordercolor,
  hoverbgcolor,
}) {

  const router = useRouter();
  const IconComponent = TablerIcons[buttonicon] || null;

  return (
    <SmallButton
      title={title}
      link={link}
      titlecolor={titlecolor}
      hovertitlecolor={hovertitlecolor}
      bgcolor={bgcolor}
      bordercolor={bordercolor}
      hoverbordercolor={hoverbordercolor}
      hoverbgcolor={hoverbgcolor}
      onclick={() => router.push(link)}
      beforeicon={
        IconComponent ? (
          <IconComponent className={`${iconcolor} ${hovertitlecolor} w-5 h-5`} />
        ) : null
      }
      aftericon={null}
    />
  );
}
