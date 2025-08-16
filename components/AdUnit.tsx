"use client";
import { useEffect, useRef } from "react";

export default function AdUnit() {
  const ref = useRef<HTMLModElement>(null); // <ins> elem HTMLModElement

  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {}
  }, []);

  return (
      <div className="flex flex-col items-center my-6">
      <div className="text-xs text-gray-400 mb-2"><i>Hirdetés</i></div>
    <ins
      className="adsbygoogle block my-6"
      style={{ display: "block" }}
      data-ad-client="ca-pub-9221186825330437"
      data-ad-slot="8698339328"
      data-ad-format="auto"
      data-full-width-responsive="true"
      data-adtest="on" // 👉 TESZT HIRDETÉS BEKAPCSOLVA
      ref={ref}
    />
    </div>
  );
}