import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

/**
 * Egy feltöltött Excel-ből előnézet: sheet-ek neve, sorok száma,
 * fejléc (első sor), nyers első 5 sor. NINCS 'any'.
 */
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const wb = XLSX.read(buf, { type: "buffer" });

    const preview: Array<{
      sheet: string;
      jsonRows: number;
      headers: string[];
      rawFirstRows: unknown[][];
    }> = [];

    for (const sheetName of wb.SheetNames) {
      const sheet = wb.Sheets[sheetName];
      if (!sheet) continue;

      // FEJLÉCES (MÁTRIX) MÓD: unknown[][]
      const table = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
        header: 1,
        defval: "",
      }) as unknown[][];

      const headersRow: unknown[] = table[0] ?? [];
      const headers = headersRow.map((v) => String(v ?? ""));

      preview.push({
        sheet: sheetName,
        jsonRows: table.length,
        headers,
        rawFirstRows: table.slice(0, 5),
      });
    }

    return NextResponse.json({ preview });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: (e as Error)?.message ?? "Ismeretlen hiba" },
      { status: 500 }
    );
  }
}
