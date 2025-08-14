"use client";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { BuildingLibraryIcon, IdentificationIcon, MapPinIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { bankLogos } from "@/components/logos";

const AdUnit = dynamic(() => import("@/components/AdUnit"), { ssr: false });

type Suggestion = {
  fiokkod: string;
  bankName?: string | null;
  branchName?: string | null;
  address?: string | null;
  bic?: string | null;
};
type Result = {
  found: boolean;
  message?: string;
  prefix?: string;
  bankName?: string | null;
  branchName?: string | null;
  address?: string | null;
  bic?: string | null;
  suggestions?: Suggestion[];
  error?: string;
  lastUpdated?: string; // új mező
};

function deriveBankName(branch?: string | null) {
  if (!branch) return null;
  const s = String(branch).trim();
  const cut = s.split(/[.–-]/)[0]?.trim();
  if (cut && cut.length >= 3) return cut;
  const comma = s.split(",")[0]?.trim();
  return comma && comma.length >= 3 ? comma : s;
}

export default function HomePage() {
  // --- Hydration-biztos gate ---
  const formatHu = (iso?: string) => {
  if (!iso) return null;
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat("hu-HU", {
      year: "numeric",
      month: "long",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return null;
  }
};
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // --- Maszkolt input állapot + segédek ---
  const [prefix, setPrefix] = useState(""); // MASZKOLT érték, pl. "100-0200-3"
  const onlyDigits = (s: string) => s.replace(/\D/g, "");
  const formatEight = (raw: string) => {
    const d = onlyDigits(raw).slice(0, 8);
    const a = d.slice(0, 3);
    const b = d.slice(3, 7);
    const c = d.slice(7, 8);
    return [a, b, c].filter(Boolean).join("-");
  };
  const rawEight = (masked: string) => onlyDigits(masked).slice(0, 8);
  const onMaskedChange = (v: string) => setPrefix(formatEight(v));
  const digits = rawEight(prefix);
  const isComplete = digits.length === 8;

  // --- Keresés állapot ---
  const [res, setRes] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<null | "bic" | "addr">(null);

  async function search() {
    const p = rawEight(prefix); // mindig a maszk nélküli 8 számjegy
    if (p.length !== 8) {
      setRes({ found: false, error: "Pontosan 8 számjegyet adj meg." });
      return;
    }
    setLoading(true);
    try {
      const r = await fetch(`/api/lookup?prefix=${p}`);
      const data: Result = await r.json();
      setRes(data);
    } catch {
      setRes({ found: false, error: "Hálózati hiba." });
    } finally {
      setLoading(false);
    }
  }

  const displayBank = (bank?: string | null, branch?: string | null) =>
    bank?.trim() ? bank : deriveBankName(branch) || "N/A";

  const copy = async (text?: string | null, what: "bic" | "addr" = "bic") => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(what);
      setTimeout(() => setCopied(null), 1200);
    } catch {}
  };

  // UI osztályok
  const card =
    "glass rounded-2xl border border-white/30 dark:border-white/10 shadow-sm";
  const panel =
    "rounded-xl border border-white/40 dark:border-white/10 bg-slate-50 dark:bg-slate-900/50 p-3";
  const chip =
    "inline-flex items-center rounded-full border border-white/40 dark:border-white/10 " +
    "bg-white/70 dark:bg-slate-900/60 px-2 py-0.5 text-xs font-medium";

  return (
    <main className="flex flex-col gap-6">
      {/* Kereső kártya */}
      <section className={`${card} p-4 sm:p-6`}>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Bankszámla kereső
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Ezen az oldalon a bankszámla első 8 számjegye alapján tudsz bankot keresni.
        </p>

        {mounted ? (
          <>
            <div className="mt-4 flex flex-col sm:flex-row gap-3 items-center">
              <input
                inputMode="numeric"
                pattern="[0-9]*"
                value={prefix}
                onChange={(e) => onMaskedChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && isComplete && search()}
                placeholder="Számlaszám első 8 számjegye (pl. 100-2000-3)"
                aria-label="Számlaszám első 8 számjegye"
                aria-invalid={!isComplete && digits.length > 0}
                className={[
                  "flex-1 rounded-xl border px-3 py-2 text-lg tabular-nums tracking-widest",
                  "bg-slate-50 dark:bg-slate-900/60",
                  "border-slate-200/70 dark:border-slate-800/70",
                  "text-slate-900 dark:text-slate-100",
                  "focus:outline-none focus:ring-2",
                  isComplete ? "focus:ring-indigo-500" : "focus:ring-amber-500",
                  !isComplete && digits.length > 0 ? "border-amber-400" : "",
                ].join(" ")}
              />

              <button
                onClick={search}
                disabled={!isComplete || loading}
                className="rounded-xl bg-indigo-600 text-white px-4 py-2 text-lg font-semibold
                           shadow-sm hover:shadow-md active:translate-y-px
                           transition-all duration-200 disabled:opacity-50"
                style={{ animation: "morph 3s ease-in-out infinite" }}
              >
                {loading ? "Keresés…" : "Keresés"}
              </button>
            </div>

            {/* élő visszajelzés */}
            {!isComplete && (
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {digits.length === 0
                  ? "Adj meg 8 számjegyet."
                  : `Még ${8 - digits.length} számjegy szükséges.`}
              </p>
            )}

            {/* Számjegy bontás */}
            <div className="mt-3 text-sm grid grid-cols-3 gap-3 text-center">
              <div className="p-2 rounded-lg border border-slate-200/60 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-900/40">
                <div className="text-xs text-slate-500 dark:text-slate-400">Bankkód</div>
                <div className="font-mono text-lg tracking-widest">
                  {digits.slice(0, 3).padEnd(3, "•")}
                </div>
              </div>

              <div className="p-2 rounded-lg border border-slate-200/60 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-900/40">
                <div className="text-xs text-slate-500 dark:text-slate-400">Fiókkód</div>
                <div className="font-mono text-lg tracking-widest">
                  {digits.length >= 3 ? digits.slice(3, 7).padEnd(4, "•") : "••••"}
                </div>
              </div>

              <div className="p-2 rounded-lg border border-slate-200/60 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-900/40">
                <div className="text-xs text-slate-500 dark:text-slate-400">Ellenőrző</div>
                <div className="font-mono text-lg tracking-widest">
                  {digits.length >= 7 ? digits.slice(7, 8).padEnd(1, "•") : "•"}
                </div>
              </div>
            </div>
          </>
        ) : (
          // SSR skeleton – azonos HTML minden rendernél, így nincs mismatch
          <div className="mt-4 space-y-3">
            <div className="h-11 rounded skeleton" />
            <div className="grid grid-cols-3 gap-3">
              <div className="h-16 rounded skeleton" />
              <div className="h-16 rounded skeleton" />
              <div className="h-16 rounded skeleton" />
            </div>
          </div>
        )}

        {res?.error && (
          <p className="mt-4 text-sm text-red-600 dark:text-slate-300">{res.error}</p>
        )}
        {res?.lastUpdated && (
  <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 text-center">
    <i>Forrásadatok utoljára frissítve: {formatHu(res.lastUpdated)}</i>
  </p>
)}
      </section>

      {/* Loading skeleton */}
      {loading && (
        <section className={`${card} p-5`}>
          <div className="h-5 w-24 rounded skeleton mb-3" />
          <div className="h-7 w-2/3 rounded skeleton mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="h-20 rounded skeleton" />
            <div className="h-20 rounded skeleton" />
            <div className="h-20 rounded skeleton sm:col-span-2" />
          </div>
        </section>
      )}

      {/* Találat / nincs találat */}
      {!loading && res && !res.error && (
        <section className={`${card} p-5`}>
          {res.found ? (
            <>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">
                    Találat a keresésedre:
                  </div>
                  <h2 className="mt-1 text-xl font-semibold">
                    {displayBank(res.bankName, res.branchName)}
                  </h2>
                </div>

                {/* Logo a monogram helyén (ha van), különben monogram */}
                {res.bic && bankLogos[res.bic] ? (
                  <Image
                    src={bankLogos[res.bic]}
                    alt={res.bankName || "Bank logó"}
                    width={120}
                    height={120}
                    className="rounded-lg shadow-md bg-white p-1 border border-white/40 dark:border-white/10"
                  />
                ) : (
                  <div
                    className="h-12 w-12 rounded-full grid place-items-center border
                               bg-gradient-to-br from-indigo-50/70 to-sky-50/70
                               dark:from-slate-800/70 dark:to-slate-700/70
                               border-white/40 dark:border-white/10 text-slate-700 dark:text-slate-100"
                  >
                    <span className="font-bold">
                      {(displayBank(res.bankName, res.branchName) ?? "—")
                        .split(" ")
                        .slice(0, 2)
                        .map((w) => w[0])
                        .join("")
                        .toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Ikonos adatblokk + másolás gombok */}
              <div className="flex flex-col items-center">
                <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm w-full">
                  <div className={`flex items-start gap-3 ${panel}`}>
                    <BuildingLibraryIcon className="h-5 w-5 text-slate-500 dark:text-slate-400 mt-0.5" />
                    <div>
                      <dt className="text-slate-600 dark:text-slate-400">Fiók neve</dt>
                      <dd className="font-medium text-slate-900 dark:text-slate-100">
                        {res.branchName || "—"}
                      </dd>
                    </div>
                  </div>

                  <div className={`flex items-start gap-3 ${panel}`}>
                    <IdentificationIcon className="h-5 w-5 text-slate-500 dark:text-slate-400 mt-0.5" />
                    <div className="flex-1">
                      <dt className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                        <span>BIC</span>
                        {res.bic && (
                          <button
                            onClick={() => copy(res.bic!, "bic")}
                            className={`${chip} hover:shadow transition`}
                            title="BIC másolása"
                          >
                            {copied === "bic" ? "Másolva" : "Másolás"}
                          </button>
                        )}
                      </dt>
                      <dd className="font-medium text-slate-900 dark:text-slate-100">
                        {res.bic || "—"}
                      </dd>
                    </div>
                  </div>

                  <div className={`flex items-start gap-3 ${panel} sm:col-span-2`}>
                    <MapPinIcon className="h-5 w-5 text-slate-500 dark:text-slate-400 mt-0.5" />
                    <div className="flex-1">
                      <dt className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                        <span>Cím</span>
                        {res.address && (
                          <button
                            onClick={() => copy(res.address!, "addr")}
                            className={`${chip} hover:shadow transition`}
                            title="Cím másolása"
                          >
                            {copied === "addr" ? "Másolva" : "Másolás"}
                          </button>
                        )}
                      </dt>
                      <dd className="font-medium text-slate-900 dark:text-slate-100">
                        {res.address || "—"}
                      </dd>

                      {/* Megnyitás térképen link */}
                      {res.address && (
                        <a
                          className="mt-1 inline-block text-xs underline text-slate-600 dark:text-slate-300"
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(res.address)}`}
                          target="_blank"
                          rel="noopener nofollow"
                        >
                          Megnyitás térképen
                        </a>
                      )}
                    </div>
                  </div>
                </dl>

                <div className="mt-4 flex flex-wrap gap-2 w-full">
                  <span className={chip}>Fiókkód: {res.prefix}</span>
                  {res.bic && <span className={chip}>BIC: {res.bic}</span>}
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-amber-300/50 bg-amber-50/70 dark:border-amber-900/40 dark:bg-amber-950/40 p-4 text-amber-900 dark:text-amber-200">
              {res.message ||
                "Nincs találat az MNB szűkített hitelesítő táblában ehhez a fiókkódhoz."}
            </div>
          )}
        </section>
      )}

      {/* Javaslatok */}
      {!loading && res && !res.found && res.suggestions?.length ? (
        <section className={`${card} p-4`}>
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">
            A bankkód ({prefix.slice(0, 3)}) alapján találtunk fiókokat:
          </div>
          <ul className="grid sm:grid-cols-2 gap-3">
            {res.suggestions.map((s) => {
              const b = displayBank(s.bankName, s.branchName);
              return (
                <li
                  key={s.fiokkod}
                  className="rounded-xl border border-white/40 dark:border-white/10 p-3
                             bg-slate-50 dark:bg-slate-900/50"
                >
                  <div className="font-medium">{b}</div>
                  <div className="text-sm text-slate-700 dark:text-slate-300">
                    {s.branchName || "Fióknév nem elérhető"}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    {s.address || "Cím nem elérhető"}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    BIC: {s.bic || "—"} · Fiókkód: {s.fiokkod}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <AdUnit />
    </main>
  );
}
