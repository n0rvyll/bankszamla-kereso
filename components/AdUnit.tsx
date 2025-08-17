"use client";
import { useEffect } from "react";

export default function AdUnit() {
  useEffect(() => {
    try {
      // @ts-expect-error: Adsense global nincs típusozva (window.adsbygoogle)
      (window.adsbygoogle =
        (window as unknown as { adsbygoogle?: unknown[] }).adsbygoogle ||
        []).push({});
    } catch (e) {
      console.error("Adsense error", e);
    }
  }, []);

  return (
    <ins
      className="adsbygoogle block"
      style={{ display: "block" }}
      data-ad-client="ca-pub-9221186825330437"
      data-ad-slot="1234567890"
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
