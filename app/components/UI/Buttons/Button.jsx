import ButtonText from "../Texts/ButtonText";

export default function Button({
  title,
  titlecolor,
  hovertitlecolor,
  bgcolor,
  bordercolor,
  hoverbgcolor,
  onclick,
  beforeicon,
  aftericon
}) {
  return (
    <button
      className={`flex flex-nowrap group items-center justify-center gap-2 px-7 h-[44px] rounded-full min-w-fit ${bgcolor} ${hoverbgcolor} ${
        bordercolor ? `border-2 ${bordercolor} hover:${bordercolor}` : ""
      } transition-all cursor-pointer z-10`}
      onClick={onclick}
    >
      {beforeicon}
      <ButtonText classname={`${titlecolor} ${hovertitlecolor}`}>{title}</ButtonText>
      {aftericon}
    </button>
  );
}
