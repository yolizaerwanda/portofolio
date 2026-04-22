import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    // Cek input kosong
    if (!username || !password) {
      return NextResponse.json(
        { error: "Username dan password harus diisi" },
        { status: 400 }
      );
    }

    // Cek user di database
    const [rows]: any = await db.query(
      "SELECT id, username, password, role FROM user WHERE username = ? AND password = ?",
      [username, password]
    );

    // Jika user ditemukan
    if (rows.length > 0) {
      const user = rows[0];

      // Kalau kamu mau, bisa buat token manual di sini (tapi opsional)
      // const token = crypto.randomUUID();

      return NextResponse.json({
        message: "Login berhasil",
        user_id: user.id,
        username: user.username,
        role: user.role,
      });
    }

    // Jika tidak ditemukan
    return NextResponse.json(
      { error: "Username atau password salah" },
      { status: 401 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
