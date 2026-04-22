import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const bulan = searchParams.get("bulan");

    if (!bulan) {
      return NextResponse.json(
        { error: "Parameter bulan wajib." },
        { status: 400 }
      );
    }

    const [year, month] = bulan.split("-");
    const namaBulan = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ][parseInt(month) - 1];

    const periodeLabel = `${namaBulan} ${year}`;

    const [rows] = await db.query(
      `SELECT * FROM retur WHERE DATE_FORMAT(tgl_terima, '%Y-%m') = ?`,
      [bulan]
    );

    const totalBulan = (rows as any[]).reduce(
      (acc: number, r: any) => acc + Number(r.total_retur),
      0
    );

    const rupiah = (n: number) =>
      new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(n);

    const formatDate = (dateString: string) => {
      if (!dateString) return "-";
      const d = new Date(dateString);
      return `${String(d.getDate()).padStart(2, "0")}-${String(
        d.getMonth() + 1
      ).padStart(2, "0")}-${d.getFullYear()}`;
    };

    // ============== CREATE PDF ==================
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([900, 800]);
    const { width } = page.getSize();

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let y = 760;

    // Judul laporan
    page.drawText("Laporan Retur Bulanan", {
      x: width / 2 - 140,
      y,
      size: 20,
      font: fontBold,
    });

    y -= 45;

    page.drawText(`Periode: ${periodeLabel}`, {
      x: 65,
      y,
      size: 12,
      font,
    });

    y -= 40;

    // ==================== TABLE SETUP =========================

    const colTitles = [
      "No", "No Retur", "Nama Toko", "Alamat Toko", "Nama Sales",
      "Total Retur", "Tgl Terima", "Tgl Retur", "Status"
    ];

    const colWidths = [35, 70, 120, 130, 110, 85, 75, 75, 70];

    const lineColor = rgb(0.2, 0.2, 0.2);
    const totalWidth = colWidths.reduce((a, b) => a + b, 0);
    const tableMarginX = (width - totalWidth) / 2;

    const colX: number[] = [];
    colWidths.reduce((acc, w) => {
      colX.push(acc);
      return acc + w;
    }, tableMarginX);

    const wrapText = (text: string, maxWidth: number, font: any, size: number) => {
      const words = text.split(" ");
      let line = "";
      const lines: string[] = [];

      for (const word of words) {
        const test = line + word + " ";
        if (font.widthOfTextAtSize(test, size) > maxWidth) {
          lines.push(line.trim());
          line = word + " ";
        } else {
          line = test;
        }
      }

      if (line.trim()) lines.push(line.trim());
      return lines;
    };

    const rowHeightBase = 26;

    // ========================= HEADER ==============================

    // Garis atas
    page.drawLine({
      start: { x: tableMarginX, y },
      end: { x: tableMarginX + totalWidth, y },
      color: lineColor,
      thickness: 1,
    });

    y -= rowHeightBase;

    // Header text
    colTitles.forEach((t, i) => {
      page.drawText(t, {
        x: colX[i] + 5,
        y: y + 8,
        size: 10,
        font: fontBold,
      });
    });

    // Garis bawah header
    page.drawLine({
      start: { x: tableMarginX, y },
      end: { x: tableMarginX + totalWidth, y },
      color: lineColor,
      thickness: 1,
    });

    // Garis vertikal header
    colX.forEach((x) =>
      page.drawLine({
        start: { x, y: y + rowHeightBase },
        end: { x, y },
        color: lineColor,
        thickness: 1,
      })
    );

    // Garis kanan header
    page.drawLine({
      start: { x: tableMarginX + totalWidth, y: y + rowHeightBase },
      end: { x: tableMarginX + totalWidth, y },
      color: lineColor,
      thickness: 1,
    });

    y -= rowHeightBase;

    // ========================= ROWS ==============================

    for (let i = 0; i < (rows as any[]).length; i++) {
      const r = (rows as any[])[i];

      const values = [
        i + 1,
        r.no_retur,
        r.nama_toko,
        r.alamat_toko,
        r.nama_sales,
        rupiah(r.total_retur),
        formatDate(r.tgl_terima),
        formatDate(r.tgl_retur),
        r.status,
      ];

      const wrapped = values.map((v, idx) =>
        wrapText(String(v), colWidths[idx] - 10, font, 10)
      );

      const lineHeight = 12;
      const rowHeight =
        Math.max(...wrapped.map((l) => l.length)) * lineHeight + 8;

      // Garis atas row
      page.drawLine({
        start: { x: tableMarginX, y },
        end: { x: tableMarginX + totalWidth, y },
        color: lineColor,
        thickness: 1,
      });

      // Draw text sel
      wrapped.forEach((lines, col) => {
        lines.forEach((line, li) => {
          const textY = y + rowHeight - 16 - li * lineHeight;

          // right alignment untuk angka
          if (col === 0 || col === 5) {
            const tw = font.widthOfTextAtSize(line, 10);
            page.drawText(line, {
              x: colX[col] + colWidths[col] - tw - 20,
              y: textY,
              size: 10,
              font,
            });
          } else {
            // left alignment
            page.drawText(line, {
              x: colX[col] + 5,
              y: textY,
              size: 10,
              font,
            });
          }
        });
      });

      // Garis vertikal row
      colX.forEach((x) =>
        page.drawLine({
          start: { x, y: y + rowHeight },
          end: { x, y },
          color: lineColor,
          thickness: 1,
        })
      );

      // Garis kanan row
      page.drawLine({
        start: { x: tableMarginX + totalWidth, y: y + rowHeight },
        end: { x: tableMarginX + totalWidth, y },
        color: lineColor,
        thickness: 1,
      });

      y -= rowHeight;
    }

    // Garis bawah tabel
    page.drawLine({
      start: { x: tableMarginX, y },
      end: { x: tableMarginX + totalWidth, y },
      color: lineColor,
      thickness: 1,
    });

    y -= 30;

    page.drawText(`Total Retur Bulan Ini: ${rupiah(totalBulan)}`, {
      x: tableMarginX,
      y,
      size: 12,
      font,
    });

    const pdfBytes = await pdfDoc.save();

    return new Response(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="laporan-${bulan}.pdf"`,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Gagal membuat PDF" },
      { status: 500 }
    );
  }
}
