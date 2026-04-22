"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";

export default function EditReturPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();

  const [id, setId] = useState<string>("");
  const [data, setData] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Ambil ID dari params (karena sekarang params adalah Promise)
  useEffect(() => {
    async function loadParams() {
      const p = await params;
      setId(p.id);
    }
    loadParams();
  }, [params]);

  // Ambil data lama setelah ID sudah ada
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      const res = await fetch(`/api/retur/${id}`);
      const result = await res.json();

      if (!res.ok) {
        alert(result.error);
        router.push("/dashboard/admin");
        return;
      }

      // FIX TANGGAL – memastikan format YYYY-MM-DD
      setData({
        ...result,
        tgl_terima: result.tgl_terima ? dayjs(result.tgl_terima).format("YYYY-MM-DD") : "",
        tgl_retur: result.tgl_retur ? dayjs(result.tgl_retur).format("YYYY-MM-DD") : "",
      });

    };

    fetchData();
  }, [id, router]);

  if (!data) return <p>Loading...</p>;

  const isLocked = data.status === "sudah dipotong";

  const handleChange = (e: any) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    const fd = new FormData();
    Object.entries(data).forEach(([key, value]: any) => {
      if (key !== "foto_nota") fd.append(key, value);
    });

    if (file) fd.append("foto_nota", file);

    const res = await fetch(`/api/retur/${id}`, {
      method: "PUT",
      body: fd,
    });

    const result = await res.json();
    setLoading(false);

    if (res.ok) {
      alert(result.message);
      router.push("/dashboard/admin");
    } else {
      alert(result.error);
    }
  };

  return (
    <div
      className="min-h-screen flex justify-center items-center p-8"
      style={{ backgroundColor: "#e8d9f0" }}
    >
      <div
        className="w-full max-w-xl p-8 rounded-2xl shadow-md"
        style={{ backgroundColor: "#f9fafc" }}
      >
        <h1 className="text-2xl font-bold mb-4 border-b pb-2 text-center">
          Edit Data
        </h1>

        {isLocked && (
          <p className="text-red-600 font-semibold mb-4 text-center">
            Status sudah dipotong — data tidak bisa diedit.
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="id" value={id} />

          <div>
            <label>Nomor Retur</label>

            {/* FIX number: tidak lagi dibulatkan browser */}
            <input
              type="tel"
              name="no_retur"
              value={data.no_retur}
              onChange={(e) => {
                const onlyNum = e.target.value.replace(/\D/g, "");
                setData({ ...data, no_retur: onlyNum });
              }}
              disabled={isLocked}
              className="border w-full p-2 rounded"
            />
          </div>

          <div>
            <label>Nama Toko</label>
            <input
              type="text"
              name="nama_toko"
              value={data.nama_toko}
              onChange={handleChange}
              disabled={isLocked}
              className="border w-full p-2 rounded"
            />
          </div>

          <div>
            <label>Alamat Toko</label>
            <textarea
              name="alamat_toko"
              value={data.alamat_toko}
              onChange={handleChange}
              disabled={isLocked}
              className="border w-full p-2 rounded"
            ></textarea>
          </div>

          <div>
            <label>Nama Sales</label>
            <input
              type="text"
              name="nama_sales"
              value={data.nama_sales}
              onChange={handleChange}
              disabled={isLocked}
              className="border w-full p-2 rounded"
            />
          </div>

          <div>
            <label>Total Retur</label>
            <input
              type="number"
              name="total_retur"
              value={data.total_retur}
              onChange={handleChange}
              disabled={isLocked}
              className="border w-full p-2 rounded"
            />
          </div>

          <div>
            <label>Foto Nota Sekarang:</label>
            <img src={data.foto_nota} className="w-32 mb-2" />
            <input
              type="file"
              disabled={isLocked}
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              accept="image/*"
              className="border w-full p-2 rounded"
            />
          </div>

          <div>
            <label>Tgl Terima</label>
            <input
              type="date"
              name="tgl_terima"
              value={data.tgl_terima}
              onChange={handleChange}
              disabled={isLocked}
              className="border w-full p-2 rounded"
            />
          </div>

          <div>
            <label>Tgl Retur</label>
            <input
              type="date"
              name="tgl_retur"
              value={data.tgl_retur}
              onChange={handleChange}
              disabled={isLocked}
              className="border w-full p-2 rounded"
            />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.push("/dashboard/admin")}
              className="border px-5 py-2 rounded hover:bg-gray-100"
            >
              Kembali
            </button>

            {!isLocked && (
              <button
                type="submit"
                disabled={loading}
                className="border px-5 py-2 rounded bg-black text-white hover:bg-gray-800"
              >
                {loading ? "Menyimpan..." : "Update"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
