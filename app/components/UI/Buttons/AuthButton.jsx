import React from "react";

const AuthButton = ({
  type,
  loading,
}) => {
  return (
    <button
      disabled={loading}
      type="submit"
      className={`${
        loading ? "bg-[var(--pink-hover)]" : "bg-[var(--pink)]"
      } rounded-md w-full px-12 py-3 font-medium text-white cursor-pointer hover:bg-[var(--pink-hover)]`}
    >
      {loading ? "Loading..." : type}
    </button>
  );
};

export default AuthButton;