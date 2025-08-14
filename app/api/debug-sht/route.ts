import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

const SHT_URL = process.env.SHT_URL || "https://www.mnb.hu/letoltes/sht.xlsx";

export async function GET() {
  try {
    const res = await fetch(SHT_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`Letöltési hiba: ${res.status}`);
    const buf = await res.arrayBuffer();
    const wb = XLSX.read(buf, { type: "array" });

    const sheets = wb.SheetNames;
    const preview: any[] = [];

    for (const name of sheets) {
      const sheet = wb.Sheets[name];
      const json = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: "" });
      const headers = json.length ? Object.keys(json[0]) : [];

      // header:1 (nyers mátrix) első 5 sor
      const raw = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1, defval: "" }) as any[][];
      preview.push({
        sheet: name,
        jsonRows: json.length,
        headers,
        rawFirstRows: raw.slice(0, 5),
      });
    }

    return NextResponse.json({ sheets, preview });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Ismeretlen hiba" }, { status: 500 });
  }
}
