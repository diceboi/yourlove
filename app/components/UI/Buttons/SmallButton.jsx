import ButtonText from "../Texts/ButtonText";

export default function SmallButton({
  title,
  titlecolor,
  hovertitlecolor,
  bgcolor,
  bordercolor,
  hoverbordercolor,
  hoverbgcolor,
  onclick,
  beforeicon,
  aftericon
}) {
  return (
    <button
      className={`flex flex-nowrap group items-center justify-center gap-2 px-2 h-[32px] rounded-full min-w-fit w-fit ${bgcolor} ${hoverbgcolor} ${
        bordercolor ? `border-2 ${bordercolor} ${hoverbordercolor}` : ""
      } transition-all cursor-pointer z-10`}
      onClick={onclick}
    >
      {beforeicon}
      <ButtonText classname={`${titlecolor} ${hovertitlecolor}`}>{title}</ButtonText>
      {aftericon}
    </button>
  );
}
