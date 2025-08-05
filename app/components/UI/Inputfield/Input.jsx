import React from "react";

export default function Input({
  legend,
  handleChange,
  value,
  name,
  placeholder,
  classname,
}) {
  return (
    <fieldset className="flex flex-col group">
      {legend && (
        <legend className="px-2 py-0.5 mb-[1px] text-xs font-bold group-focus-within:bg-[var(--green)] outline outline-white group-focus-within:outline-[var(--green)] group-focus-within:text-white border-b border-[var(--border)] group-focus-within:border-[var(--green)] bg-white rounded-t-lg ">
          {legend || null}
        </legend>
      )}
      <input
        name={name || null}
        value={value}
        onChange={handleChange || null}
        placeholder={placeholder || null}
        className={`py-2 px-2 outline outline-white text-sm focus:outline-[var(--green)] active:outline-[var(--green)] bg-white shadow-sm ${legend ? "rounded-b-lg rounded-tr-lg" : "rounded-lg"} ${classname}`}
      />
    </fieldset>
  );
}
