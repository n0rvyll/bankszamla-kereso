// app/api/lookup/route.ts
import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

/**
 * Beállítások
 */
const SHT_URL = process.env.SHT_URL || "https://www.mnb.hu/letoltes/sht.xlsx";
const ONE_DAY = 86400000;

/**
 * Típusok
 */
type Row = {
  fiokkod: string | null;
  banknev: string | null;
  fioknev: string | null;
  cim: string | null;
  bic: string | null;
};

type Suggestion = {
  fiokkod: string;
  bankName?: string | null;
  branchName?: string | null;
  address?: string | null;
  bic?: string | null;
};

/**
 * Fejléc variációk – magyar és angol oszlopnevek
 */
const CAND = {
  fioKod: [
    // HU
    "Fiókkód",
    "Fiók kód",
    "Fiokkod",
    "Fiok kod",
    "GIRO fiókkód",
    "GIRO fiók kód",
    "Fióktelep GIRO kód",
    "Fióktelep azonosító (GIRO fiókkód)",
    "Fióktelep azonosító",
    "Fióktelep kód",
    "Fiókazonosító",
    // EN
    "Branch office code",
  ],
  bankNev: [
    "Pénzforgalmi szolgáltató neve",
    "Intézmény neve",
    "Bank neve",
    "Hitelesítő tábla szerinti név",
  ],
  fiokNev: [
    "Fiók megnevezése",
    "Fiók név",
    "Fióktelep megnevezése",
    "Fióktelep neve",
    // EN
    "Name of the branch office",
  ],
  cim: [
    "Cím",
    "Fiók címe",
    "Fióktelep címe",
    "Telephely címe",
    "Székhely címe",
    "Postai cím",
    // EN
    "Address of the branch office",
  ],
  bic: [
    "BIC",
    "BIC kód",
    "Belföldi BIC",
    // EN
    "BIC code",
  ],
};

/**
 * Segédfüggvények
 */
const norm = (s: string) => s.replace(/\s+/g, "").toLowerCase();

function findIndex(headers: string[], candidates: string[]) {
  const H = headers.map(norm);
  const C = candidates.map(norm);
  for (let i = 0; i < H.length; i++) if (C.includes(H[i])) return i;
  return -1;
}

function extractEightDigits(val: any): string | null {
  if (val == null) return null;
  const m = String(val).match(/\d{8}/);
  return m ? m[0] : null;
}

/**
 * Memória cache
 */
let CACHE: { ts: number; rows: Row[] } | null = null;

/** Mindig adunk vissza ISO időt – ha nincs cache, a mostanit */
function getLastUpdatedISO() {
  return new Date(CACHE?.ts ?? Date.now()).toISOString();
}

/**
 * XLSX betöltése + parse → Row[]
 */
async function loadAllRows(): Promise<Row[]> {
  // Friss cache elfogadása
  if (CACHE && Date.now() - CACHE.ts < ONE_DAY) return CACHE.rows;

  // Letöltés
  const res = await fetch(SHT_URL, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Letöltési hiba: ${res.status} ${res.statusText}`);
  }

  const buf = await res.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });

  const out: Row[] = [];

  for (const sheetName of wb.SheetNames) {
    const sheet = wb.Sheets[sheetName];
    if (!sheet) continue;

    // Próbáljuk meg fejléces módban
    const json = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: "" });
    if (json.length) {
      const headers = Object.keys(json[0] ?? {});
      const idxFio = findIndex(headers, CAND.fioKod);
      const idxFiok = findIndex(headers, CAND.fiokNev);
      const idxCim = findIndex(headers, CAND.cim);
      const idxBic = findIndex(headers, CAND.bic);
      const idxBank = findIndex(headers, CAND.bankNev);

      // Ha legalább a fiókkód oszlop megvan, fejléces feldolgozás
      if (idxFio !== -1) {
        for (const r of json) {
          const vals = headers.map((h) => r[h]);
          const code8 = extractEightDigits(vals[idxFio]);
          if (!code8) continue;
          out.push({
            fiokkod: code8,
            banknev: idxBank !== -1 ? String(vals[idxBank] ?? "").trim() || null : null,
            fioknev: idxFiok !== -1 ? String(vals[idxFiok] ?? "").trim() || null : null,
            cim: idxCim !== -1 ? String(vals[idxCim] ?? "").trim() || null : null,
            bic: idxBic !== -1 ? String(vals[idxBic] ?? "").trim() || null : null,
          });
        }
        continue; // következő sheet
      }
    }

    // Fallback: nyers mátrix mód (header nélkül)
    const rows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1, defval: "" }) as any[][];
    for (const r of rows) {
      if (!Array.isArray(r)) continue;
      let code8: string | null = null;
      for (const cell of r) {
        const m = extractEightDigits(cell);
        if (m) {
          code8 = m;
          break;
        }
      }
      if (!code8) continue;
      out.push({
        fiokkod: code8,
        banknev: null,
        fioknev: null,
        cim: String(r.join(" ")).trim() || null,
        bic: null,
      });
    }
  }

  // Egyedisítés fiókkód szerint
  const seen = new Set<string>();
  const uniq = out.filter((r) => {
    if (!r.fiokkod) return false;
    if (seen.has(r.fiokkod)) return false;
    seen.add(r.fiokkod);
    return true;
  });

  CACHE = { ts: Date.now(), rows: uniq };
  return uniq;
}

/**
 * API – GET /api/lookup?prefix=XXXXXXXX
 */
export async function GET(req: NextRequest) {
  const prefix = (new URL(req.url).searchParams.get("prefix") || "").replace(/\D/g, "");

  // Input validáció – rögtön lastUpdated-et is adunk
  if (!/^\d{8}$/.test(prefix)) {
    return NextResponse.json(
      { error: "Adj meg pontosan 8 számjegyet.", lastUpdated: getLastUpdatedISO() },
      { status: 400 }
    );
  }

  try {
    const rows = await loadAllRows();
    const lastUpdated = getLastUpdatedISO();
    const hit = rows.find((r) => r.fiokkod === prefix);

    if (!hit) {
      const bank3 = prefix.slice(0, 3);
      const suggestions: Suggestion[] = rows
        .filter((r) => r.fiokkod?.startsWith(bank3))
        .slice(0, 10)
        .map((s) => ({
          fiokkod: s.fiokkod!,
          bankName: s.banknev,
          branchName: s.fioknev,
          address: s.cim,
          bic: s.bic,
        }));

      return NextResponse.json(
        {
          found: false,
          message: "Nincs pontos egyezés ehhez a fiókkódhoz.",
          suggestions,
          lastUpdated,
        },
        { status: 200 }
      );
    }

    // Találat
    return NextResponse.json(
      {
        found: true,
        prefix,
        bankName: hit.banknev,
        branchName: hit.fioknev,
        address: hit.cim,
        bic: hit.bic,
        lastUpdated,
      },
      { status: 200 }
    );
  } catch (e: any) {
  
    return NextResponse.json(
      {
        found: false,
        error: e?.message ?? "Ismeretlen hiba.",
        lastUpdated: getLastUpdatedISO(),
      },
      { status: 500 }
    );
  }
}
