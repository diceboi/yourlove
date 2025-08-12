import React from "react";
import Label from "@/app/components/UI/Texts/Label";

export default function SmallTextInput({
  legend,
  handleChange,
  value,
  name,
  placeholder,
  classname,
  after
}) {
  return (
    <fieldset className="flex flex-nowrap items-center rounded-md group bg-white shadow-sm relative">
      {legend && (
        <Label classname={"px-2 py-2.5 text-xs font-bold group-focus-within:bg-[var(--green)] outline outline-white group-focus-within:outline-[var(--green)] group-focus-within:text-white bg-white rounded-l-md min-w-fit"}>
          {legend || null}
        </Label>
      )}
      <input
        name={name || null}
        value={value}
        onChange={handleChange || null}
        placeholder={placeholder || null}
        className={`w-full py-2 px-2 outline outline-white border-l group-focus-within:border-[var(--green)] border-[var(--border)] text-sm focus:outline-[var(--green)] active:outline-[var(--green)] bg-white rounded-r-md ${classname}`}
      />
      {after && (
        <Label classname={"absolute top-1/2 right-2 -translate-y-1/2 pl-2.5 border-l border-[var(--border)] bg-white"}>
          {after || null}
        </Label>
      )}
    </fieldset>
  );
}
