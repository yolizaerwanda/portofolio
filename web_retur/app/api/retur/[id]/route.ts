import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import fs from "fs";
import path from "path";

async function getParams(context: any) {
  return typeof context.params?.then === "function"
    ? await context.params
    : context.params;
}

/* ---------------------- GET DATA ---------------------- */
export async function GET(req: Request, context: any) {
  try {
    const params = await getParams(context);
    const id = Number(params.id);
    if (isNaN(id))
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });

    const [rows]: any = await db.query("SELECT * FROM retur WHERE id = ?", [id]);

    if (!rows.length)
      return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });

    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error("GET /api/retur/[id] error:", err);
    return NextResponse.json({ error: "Gagal memuat data" }, { status: 500 });
  }
}

/* ---------------------- PUT: UPDATE DATA ---------------------- */
export async function PUT(req: Request, context: any) {
  try {
    const params = await getParams(context);
    const id = Number(params.id);
    if (isNaN(id))
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });

    // cek status dulu
    const [cek]: any = await db.query(
      "SELECT status, foto_nota FROM retur WHERE id = ?",
      [id]
    );

    if (!cek.length)
      return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });

    if (cek[0].status === "sudah dipotong") {
      return NextResponse.json(
        { error: "Data tidak bisa diedit karena sudah dipotong" },
        { status: 403 }
      );
    }

    // ambil FormData
    const form = await req.formData();

    const no_retur = form.get("no_retur");
    const nama_toko = form.get("nama_toko");
    const alamat_toko = form.get("alamat_toko");
    const nama_sales = form.get("nama_sales");
    const total_retur = form.get("total_retur");
    const tgl_terima = form.get("tgl_terima");
    const tgl_retur = form.get("tgl_retur");
    const foto_nota_file = form.get("foto_nota");

    let foto_nota = cek[0].foto_nota;

    // upload file baru jika ada
    if (foto_nota_file && typeof foto_nota_file === "object") {
      const bytes = await foto_nota_file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadDir = path.join(process.cwd(), "public/uploads");
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

      const filename = `nota_${Date.now()}.jpg`;
      const filePath = path.join(uploadDir, filename);

      fs.writeFileSync(filePath, buffer);

      foto_nota = `/uploads/${filename}`;
    }

    // UPDATE DATABASE
    await db.query(
      `UPDATE retur SET 
        no_retur = ?, 
        nama_toko = ?, 
        alamat_toko = ?, 
        nama_sales = ?, 
        total_retur = ?, 
        foto_nota = ?, 
        tgl_terima = ?, 
        tgl_retur = ?, 
        updated_at = NOW()
      WHERE id = ?`,
      [
        no_retur,
        nama_toko,
        alamat_toko,
        nama_sales,
        total_retur,
        foto_nota,
        tgl_terima,
        tgl_retur,
        id,
      ]
    );

    return NextResponse.json({ message: "Data retur berhasil diubah" });
  } catch (err) {
    console.error("PUT /api/retur/[id] error:", err);
    return NextResponse.json({ error: "Gagal mengubah data" }, { status: 500 });
  }
}

/* ---------------------- PATCH: SET STATUS ---------------------- */
export async function PATCH(req: Request, context: any) {
  try {
    const params = await getParams(context);
    const id = Number(params.id);

    if (isNaN(id))
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });

    await db.query(
      `UPDATE retur SET status='sudah dipotong', updated_at=NOW() WHERE id=?`,
      [id]
    );

    return NextResponse.json({ message: "Status berhasil diubah" });
  } catch (err) {
    console.error("PATCH /api/retur/[id] error:", err);
    return NextResponse.json({ error: "Gagal mengubah status" }, { status: 500 });
  }
}
