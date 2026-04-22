"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Retur = {
  id: number;
  no_retur: number;
  nama_toko: string;
  alamat_toko: string;
  nama_sales: string;
  total_retur: number;
  foto_nota?: string | null;
  tgl_terima: string;
  tgl_retur: string;
  status: string;
};

export default function SalesPage() {
  const [data, setData] = useState<Retur[]>([]);
  const [search, setSearch] = useState("");

  const [filterToko, setFilterToko] = useState("");
  const [filterSales, setFilterSales] = useState("");

  const [showFilter, setShowFilter] = useState(false);

  const filterRef = useRef<HTMLDivElement>(null); // ⭐ untuk handle klik di luar

  const router = useRouter();

  const fetchData = async () => {
    try {
      const res = await fetch("/api/retur");
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ⭐ Tutup popup filter jika klik di luar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setShowFilter(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fieldsToSearch = [
    "id",
    "no_retur",
    "nama_toko",
    "alamat_toko",
    "nama_sales",
    "total_retur",
    "tgl_terima",
    "tgl_retur",
    "status",
  ];

  const namaTokoList = Array.from(new Set(data.map((d) => d.nama_toko)));
  const namaSalesList = Array.from(new Set(data.map((d) => d.nama_sales)));

  const filtered = data.filter((d) => {
    const matchesSearch = fieldsToSearch.some((field) =>
      (d as any)[field]?.toString().toLowerCase().includes(search.toLowerCase())
    );
    const matchesToko = filterToko ? d.nama_toko === filterToko : true;
    const matchesSales = filterSales ? d.nama_sales === filterSales : true;

    return matchesSearch && matchesToko && matchesSales;
  });

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[1200px] px-4">
        <div className="p-8 font-sans bg-gray-50 min-h-screen">

          {/* HEADER */}
          <div className="flex justify-between items-center mb-6 border-b pb-2">
            <h1 className="text-3xl font-bold">Selamat Datang Sales</h1>

            <button
              onClick={() => {
                localStorage.removeItem("user_id");
                localStorage.removeItem("role");
                router.push("/login");
              }}
              className="text-lg font-semibold hover:underline"
            >
              Logout
            </button>
          </div>

          {/* SEARCH + FILTER */}
          <div className="flex justify-between mb-4 relative" ref={filterRef}>
            {/* Bagian kiri: Download Laporan */}
            <div className="flex gap-2 items-center">
              <select
                id="nama_sales"
                className="border px-3 py-2 rounded-md h-10"
                defaultValue=""
              >
                <option value="">-- Pilih Sales --</option>
                {namaSalesList.map((sales) => (
                  <option key={sales} value={sales}>
                    {sales}
                  </option>
                ))}
              </select>

              <button
                onClick={() => {
                  const sales = (document.getElementById("nama_sales") as HTMLSelectElement).value;
                  if (!sales) return alert("Pilih nama sales terlebih dahulu!");
                  window.open(`/api/report/sales?nama_sales=${encodeURIComponent(sales)}`, "_blank");
                }}
                className="border px-5 py-2 h-10 rounded-md text-lg font-semibold bg-[#e8f0ff] hover:bg-blue-200"
              >
                Download Laporan
              </button>
            </div>

            {/* Bagian kanan: Search & Filter */}
            <div className="flex gap-3 items-center">
              {/* Search */}
              <input
                type="text"
                placeholder="Search"
                className="border px-3 py-2 rounded-md w-64 h-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              {/* Filter Button */}
              <button
                onClick={() => setShowFilter((prev) => !prev)}
                className="flex items-center gap-2 border px-4 py-2 h-10 rounded-lg bg-[#f9fafc] hover:bg-gray-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 4.5h18M6 9h12M10 13.5h4M12 18v-4.5"
                  />
                </svg>
              </button>

              {/* Popup Filter */}
              {showFilter && (
                <div className="absolute right-0 top-12 w-64 p-4 rounded-lg shadow-lg border bg-[#f9fafc] z-50">
                  <h3 className="font-semibold mb-3">Filter Data</h3>

                  {/* Filter Toko */}
                  <label className="block text-sm mb-1">Nama Toko</label>
                  <select
                    className="w-full p-2 border rounded-lg bg-[#f9fafc]"
                    value={filterToko}
                    onChange={(e) => setFilterToko(e.target.value)}
                  >
                    <option value="">Semua Toko</option>
                    {namaTokoList.map((t, i) => (
                      <option key={i} value={t}>{t}</option>
                    ))}
                  </select>

                  {/* Filter Sales */}
                  <label className="block text-sm mt-3 mb-1">Nama Sales</label>
                  <select
                    className="w-full p-2 border rounded-lg bg-[#f9fafc]"
                    value={filterSales}
                    onChange={(e) => setFilterSales(e.target.value)}
                  >
                    <option value="">Semua Sales</option>
                    {namaSalesList.map((s, i) => (
                      <option key={i} value={s}>{s}</option>
                    ))}
                  </select>

                  {/* Reset Filter */}
                  <button
                    onClick={() => {
                      setFilterToko("");
                      setFilterSales("");
                    }}
                    className="mt-3 text-xs text-gray-700 hover:underline"
                  >
                    Reset Filter
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-auto bg-white rounded shadow-sm">
            <table className="min-w-max border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-3 py-3">No</th>
                  <th className="border px-3 py-3">Nomor Retur</th>
                  <th className="border px-3 py-3">Nama Toko</th>
                  <th className="border px-3 py-3">Alamat Toko</th>
                  <th className="border px-3 py-3">Nama Sales</th>
                  <th className="border px-3 py-3">Total Retur</th>
                  <th className="border px-3 py-3">Foto Nota</th>
                  <th className="border px-3 py-3">Tanggal Terima</th>
                  <th className="border px-3 py-3">Tanggal Retur</th>
                  <th className="border px-3 py-3">Status</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((r, index) => (
                  <tr key={r.id} className="text-center hover:bg-gray-50">
                    <td className="border px-3 py-2">{index + 1}</td>
                    <td className="border px-3 py-2">{r.no_retur}</td>
                    <td className="border px-3 py-2">{r.nama_toko}</td>
                    <td className="border px-3 py-2 text-left">{r.alamat_toko}</td>
                    <td className="border px-3 py-2">{r.nama_sales}</td>
                    <td className="border px-3 py-2">
                      Rp. {Number(r.total_retur).toLocaleString("id-ID")}
                    </td>
                    <td className="border px-3 py-2">
                      {r.foto_nota ? (
                        <a
                          href={r.foto_nota}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1 border rounded"
                        >
                          Lihat
                        </a>
                      ) : "-"}
                    </td>
                    <td className="border px-3 py-2">
                      {new Date(r.tgl_terima).toLocaleDateString("id-ID")}
                    </td>
                    <td className="border px-3 py-2">
                      {new Date(r.tgl_retur).toLocaleDateString("id-ID")}
                    </td>
                    <td className="border px-3 py-2">
                      {String(r.status).toLowerCase() === "belum dipotong" ? (
                        <span className="text-orange-600 font-semibold">
                          Belum dipotong
                        </span>
                      ) : (
                        <span className="text-green-600 font-semibold">
                          Sudah dipotong
                        </span>
                      )}
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={10} className="py-6 text-center text-gray-500">
                      Tidak ada data retur ditemukan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}
