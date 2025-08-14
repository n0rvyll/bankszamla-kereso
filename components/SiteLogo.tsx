"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { MouseEvent } from "react";

type Props = {
  size?: number;
  withText?: boolean;
  className?: string;
  onHomeClick?: () => void; // ha már a "/"-on vagyunk, ezzel resetelünk
};

export default function SiteLogo({
  size = 28,
  withText = false,
  className = "",
  onHomeClick,
}: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/") {
      // Már a kezdőoldalon vagyunk → ne navigáljunk, csak reseteljünk
      e.preventDefault();
      onHomeClick?.();
      // opcionális: felgörgetés a tetejére
      try {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch {}
    } else {
      // Más oldalon vagyunk → normál navigáció a főoldalra
      e.preventDefault();
      router.push("/");
    }
  };

  return (
    <Link
      href="/"
      onClick={handleClick}
      aria-label="Bankszámlaszám kereső – Kezdőlap"
      className={`inline-flex items-center gap-2 group ${className}`}
    >
      <span className="relative inline-block">
        <Image
          src="/logo.svg"       // vagy /logo.png
          alt=""
          width={size}
          height={size}
          priority
          className="rounded-md shadow-sm border border-white/40 dark:border-white/10 bg-white"
        />
      </span>
      {withText && (
        <span className="font-semibold text-slate-900 dark:text-slate-100 group-hover:opacity-90 transition">
          Bankszámla kereső
        </span>
      )}
    </Link>
  );
}
