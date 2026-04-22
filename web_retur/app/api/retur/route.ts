// app/api/retur/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import fs from "fs";

export async function GET() {
  try {
    const [rows]: any = await db.query(
      `SELECT id, no_retur, nama_toko, alamat_toko, nama_sales, total_retur, foto_nota, 
              tgl_terima, tgl_retur, status, created_at, updated_at
       FROM retur
       ORDER BY id DESC`
    );
    return NextResponse.json(rows);
  } catch (err: any) {
    console.error("GET /api/retur error:", err);
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const no_retur = parseInt(formData.get("no_retur") as string, 10);
    const nama_toko = formData.get("nama_toko") as string;
    const alamat_toko = formData.get("alamat_toko") as string;
    const nama_sales = formData.get("nama_sales") as string;
    const total_retur = parseInt(formData.get("total_retur") as string, 10);
    const tgl_terima = formData.get("tgl_terima") as string;
    const tgl_retur = formData.get("tgl_retur") as string;
    const foto = formData.get("foto_nota") as File | null;

    if (!no_retur || !nama_toko || !nama_sales || !total_retur) {
      return NextResponse.json({ error: "Field wajib tidak boleh kosong" }, { status: 400 });
    }

    // Cek duplikasi nomor retur
    const [existing]: any = await db.query(
      "SELECT id FROM retur WHERE no_retur = ?",
      [no_retur]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Nomor retur sudah digunakan, silakan cek kembali" },
        { status: 400 }
      );
    }

    // Upload foto
    let fotoPath: string | null = null;
    if (foto && foto.name) {
      const uploadDir = path.join(process.cwd(), "public/uploads");
      await mkdir(uploadDir, { recursive: true });
      const fileName = `${Date.now()}_${foto.name.replace(/\s+/g, "_")}`;
      const arrayBuffer = await foto.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      await writeFile(path.join(uploadDir, fileName), buffer);
      fotoPath = `/uploads/${fileName}`;
    }

    // Insert ke DB
    await db.query(
      `INSERT INTO retur
       (no_retur, nama_toko, alamat_toko, nama_sales, total_retur, foto_nota, tgl_terima, tgl_retur, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'belum dipotong', NOW(), NOW())`,
      [no_retur, nama_toko, alamat_toko, nama_sales, total_retur, fotoPath, tgl_terima, tgl_retur]
    );

    return NextResponse.json({ message: "Data retur berhasil ditambahkan" }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/retur error:", err);
    return NextResponse.json(
      { error: err?.message || "Gagal menambah data" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const formData = await req.formData();
    const id = formData.get("id");
    const no_retur = formData.get("no_retur");
    const nama_toko = formData.get("nama_toko");
    const alamat_toko = formData.get("alamat_toko");
    const nama_sales = formData.get("nama_sales");
    const total_retur = formData.get("total_retur");
    const tgl_terima = formData.get("tgl_terima");
    const tgl_retur = formData.get("tgl_retur");

    let foto_nota = formData.get("foto_nota") as File | null;
    let fotoPath = null;

    if (foto_nota && foto_nota.size > 0) {
      const buffer = Buffer.from(await foto_nota.arrayBuffer());
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

      const filename = `${Date.now()}_${foto_nota.name}`;
      const filePath = path.join(uploadDir, filename);
      await fs.promises.writeFile(filePath, buffer);
      fotoPath = `/uploads/${filename}`;
    }

    let query = `
      UPDATE retur 
      SET no_retur=?, nama_toko=?, alamat_toko=?, nama_sales=?, 
          total_retur=?, tgl_terima=?, tgl_retur=? ${fotoPath ? ", foto_nota=?" : ""}
      WHERE id=?`;

    const values = [
      no_retur,
      nama_toko,
      alamat_toko,
      nama_sales,
      total_retur,
      tgl_terima,
      tgl_retur,
      ...(fotoPath ? [fotoPath] : []),
      id,
    ];

    await db.query(query, values);

    return NextResponse.json({ message: "Data retur berhasil diperbarui" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
