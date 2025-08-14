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
    <ins
      className="adsbygoogle block my-6"
      style={{ display: "block" }}
      data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
      data-ad-slot="YYYYYYYYYY"
      data-ad-format="auto"
      data-full-width-responsive="true"
      ref={ref}
    />
  );
}