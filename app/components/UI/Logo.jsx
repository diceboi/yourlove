import Image from "next/image";

export default function Logo() {
  return (
    <div id="logo" className="relative min-w-[175px] h-[50px]">
      <Image
        src={"/yourlove-logo.svg"}
        fill
        style={{ objectFit: "contain" }}
        alt="YourLove Logo"
      />
    </div>
  );
}
