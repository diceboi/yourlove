import Image from "next/image";
import H1 from "./UI/H1";
import H2 from "./UI/H2";
import PinkButton from "./UI/PinkButton";
import GreenButton from "./UI/GreenButton";
import CreamPinkButton from "./UI/CreamPinkButton";
import BlackButton from "./UI/BlackButton";
import WhiteButton from "./UI/WhiteButton";
import BlackBorderButton from "./UI/BlackBorderButton";
import WhiteBorderButton from "./UI/WhiteBorderButton";
import Paragraph from "./UI/Paragraph";

export default function HomeHeroItem({
  title,
  titlescolor,
  subtitle,
  description,
  buttontype,
  buttontitle,
  buttonlink,
  bgimage,
  bgimageoverlay,
  bgimageoverlayopacity,
  bgimagealt,
  buttonicon,
}) {
  return (
    <div className="flex flex-col items-center justify-center relative w-full xl:h-[70vh] h-[60vh] rounded-2xl overflow-hidden">
      <Image
        src={bgimage}
        alt={bgimagealt}
        fill
        style={{ objectFit: "cover", objectPosition: "center" }}
      />
      {bgimageoverlay && (
        <div
          className={`absolute top-0 left-0 w-full h-full ${bgimageoverlayopacity} ${bgimageoverlay}`}
        ></div>
      )}
      <div className="xl:w-8/12 lg:w-10/12 w-full md:px-8 px-4 xl:py-0 py-4 m-auto flex flex-col gap-8 items-start justify-between md:h-8/12 h-full">
        <div className="flex flex-col gap-4 z-10 h-1/2 justify-end">
          <H1 classname={`${titlescolor}`}>{title}</H1>
          {subtitle && (
          <H2 classname={`${titlescolor}`}>{subtitle}</H2>
          )}
          {description && (
            <Paragraph classname={`${titlescolor} md:w-1/2 w-10/12`}>{description}</Paragraph>
          )}
        </div>
        <div className="flex flex-col md:items-start items-end w-full">
          {buttontype === "pink" && (
            <PinkButton
              title={buttontitle}
              link={buttonlink}
              buttonicon={buttonicon}
            />
          )}
          {buttontype === "green" && (
            <GreenButton
              title={buttontitle}
              link={buttonlink}
              buttonicon={buttonicon}
            />
          )}
          {buttontype === "cream-pink" && (
            <CreamPinkButton
              title={buttontitle}
              link={buttonlink}
              buttonicon={buttonicon}
            />
          )}
          {buttontype === "black" && (
            <BlackButton
              title={buttontitle}
              link={buttonlink}
              buttonicon={buttonicon}
            />
          )}
          {buttontype === "white" && (
            <WhiteButton
              title={buttontitle}
              link={buttonlink}
              buttonicon={buttonicon}
            />
          )}
          {buttontype === "black-border" && (
            <BlackBorderButton
              title={buttontitle}
              link={buttonlink}
              buttonicon={buttonicon}
            />
          )}
          {buttontype === "white-border" && (
            <WhiteBorderButton
              title={buttontitle}
              link={buttonlink}
              buttonicon={buttonicon}
            />
          )}
        </div>
      </div>
    </div>
  );
}
