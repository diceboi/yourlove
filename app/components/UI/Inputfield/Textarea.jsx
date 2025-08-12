import React from "react";
import Label from "@/app/components/UI/Texts/Label";

export default function Textarea({
  legend,
  handleChange,
  value,
  name,
  placeholder,
  classname,
  rows
}) {
  return (
    <fieldset className="flex flex-col items-start rounded-md group bg-white shadow-sm">
      {legend && (
        <Label classname="px-2 py-2.5 text-xs font-bold group-focus-within:bg-[var(--green)] outline outline-white group-focus-within:outline-[var(--green)] group-focus-within:text-white bg-white rounded-t-md w-full">
          {legend || null}
        </Label>
      )}
      <textarea
        name={name || null}
        value={value}
        rows={rows}
        onChange={handleChange || null}
        placeholder={placeholder || null}
        className={`w-full py-2 px-2 outline outline-white border-b group-focus-within:border-[var(--green)] border-[var(--border)] text-sm focus:outline-[var(--green)] active:outline-[var(--green)] bg-white rounded-b-md ${classname}`}
      />
    </fieldset>
  );
}




