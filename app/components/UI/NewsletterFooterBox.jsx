"use client";

import { useState } from "react";
import Paragraph from "@/app/components/UI/Texts/Paragraph";
import Label from "@/app/components/UI/Texts/Label";
import { TbMailbox } from "react-icons/tb";

export default function NewsletterFooterBox() {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function onSubmit(e) {
    e.preventDefault();
    // Itt kösd be az actiont / API-t (fetch/Server Action)
    setSubmitted(true);
  }

  return (
    <div className="w-full max-w-lg rounded-2xl bg-[var(--grey-bg)] p-4 lg:p-6 shadow-special">
      <div className="flex items-start gap-3">
        <TbMailbox className="w-12 h-12 text-[var(--pink)] bg-white rounded-full p-2" />
        <div className="grow">
          <Paragraph classname="font-bold text-[var(--black)]">Iratkozz fel a hírlevelünkre</Paragraph>
          <Paragraph classname="text-sm text-[var(--black)]/70">
            Akciók, újdonságok és hasznos tippek — spam nélkül.
          </Paragraph>
        </div>
      </div>

      {submitted ? (
        <div className="mt-4 rounded-xl bg-[var(--green)] p-3 text-[var(--black)] text-sm">
          Köszönjük, {firstName || "kedves Olvasó"}! Nézd meg a postafiókodat a megerősítő levélért.
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="sm:col-span-1">
            <Label classname="mb-1 block text-xs text-[var(--black)]/80">Keresztnév</Label>
            <input
              type="text"
              name="firstName"
              autoComplete="given-name"
              placeholder="Anna"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full rounded-full border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--black)] outline-none focus:ring-2 focus:ring-[var(--pink)]/20"
            />
          </div>

          <div className="sm:col-span-1">
            <Label classname="mb-1 block text-xs text-[var(--black)]/80">E-mail</Label>
            <input
              type="email"
              name="email"
              inputMode="email"
              autoComplete="email"
              placeholder="te@pelda.hu"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-full border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--black)] outline-none focus:ring-2 focus:ring-[var(--pink)]/20"
            />
          </div>

          <div className="sm:col-span-1 sm:flex sm:items-end">
            <button
              type="submit"
              className="w-full rounded-full bg-[var(--pink)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--pink--hover)] active:translate-y-[1px]"
            >
              Feliratkozás
            </button>
          </div>

          <p className="sm:col-span-3 mt-1 text-[11px] leading-relaxed text-[var(--black)]/60">
            A "Feliratkozás" gombra kattintva elfogadod az{" "}
            <a href="/adatkezelesi-tajekoztato" className="underline text-[var(--pink)] underline-offset-2">
              Adatkezelési tájékoztatót
            </a>.
          </p>
        </form>
      )}
    </div>
  );
}
