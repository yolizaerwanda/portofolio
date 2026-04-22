"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TambahReturPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    no_retur: "",
    nama_toko: "",
    alamat_toko: "",
    nama_sales: "",
    total_retur: "",
    tgl_terima: "",
    tgl_retur: "",
  });

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([key, value]) => fd.append(key, value));
      if (file) fd.append("foto_nota", file);

      const res = await fetch("/api/retur", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        alert(data.message);
        router.push("/dashboard/admin");
      } else {
        alert("Gagal menambahkan data: " + (data.error || data.message));
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("Terjadi kesalahan saat mengirim data retur.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center p-8" style={{ backgroundColor: "#e8d9f0" }}>
      <div
        className="w-full max-w-xl p-8 rounded-2xl shadow-md"
        style={{ backgroundColor: "#f9fafc" }}
      >
        <h1 className="text-2xl font-bold mb-4 border-b pb-2 text-center">Tambah Data</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Nomor Retur</label>
            <input
              type="number"
              name="no_retur"
              value={formData.no_retur}
              onChange={handleChange}
              className="border w-full p-2 rounded"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Nama Toko</label>
            <input
              type="text"
              name="nama_toko"
              value={formData.nama_toko}
              onChange={handleChange}
              className="border w-full p-2 rounded"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Alamat Toko</label>
            <textarea
              name="alamat_toko"
              value={formData.alamat_toko}
              onChange={handleChange}
              className="border w-full p-2 rounded"
              required
            ></textarea>
          </div>

          <div>
            <label className="block mb-1 font-medium">Nama Sales</label>
            <input
              type="text"
              name="nama_sales"
              value={formData.nama_sales}
              onChange={handleChange}
              className="border w-full p-2 rounded"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Total Retur (Rp.)</label>
            <input
              type="number"
              name="total_retur"
              value={formData.total_retur}
              onChange={handleChange}
              className="border w-full p-2 rounded"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Foto Nota</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              accept="image/*"
              className="border w-full p-2 rounded bg-white"
            />
            {file && <p className="mt-1 text-sm text-gray-700">{file.name}</p>}
          </div>

          <div>
            <label className="block mb-1 font-medium">Tgl Terima</label>
            <input
              type="date"
              name="tgl_terima"
              value={formData.tgl_terima}
              onChange={handleChange}
              className="border w-full p-2 rounded"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Tgl Retur</label>
            <input
              type="date"
              name="tgl_retur"
              value={formData.tgl_retur}
              onChange={handleChange}
              className="border w-full p-2 rounded"
              required
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
            <button
              type="submit"
              disabled={loading}
              className="border px-5 py-2 rounded bg-black text-white hover:bg-gray-800"
            >
              {loading ? "Menyimpan..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
