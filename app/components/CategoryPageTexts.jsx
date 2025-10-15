import H2 from "@/app/components/UI/Texts/H2";
import Paragraph from "@/app/components/UI/Texts/Paragraph";

export default function CategoryPageTexts({category}) {
  return (
    <>
      <H2>{category.nev}</H2>
      <Paragraph classname={"xl:w-8/12 w-full"}>
        {category.leiras_lent}
      </Paragraph>
    </>
  );
}
