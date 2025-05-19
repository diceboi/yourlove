import Image from "next/image";

export default function Logo() {
  return (
    <div id="logo" className="relative xl:min-w-[175px] min-w-[125px] xl:h-[50px] h-[40px]">
      <Image
        src={"/yourlove-logo.svg"}
        fill
        style={{ objectFit: "contain" }}
        alt="YourLove Logo"
      />
    </div>
  );
}
