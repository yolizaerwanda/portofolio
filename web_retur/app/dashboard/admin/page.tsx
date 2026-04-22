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

export default function AdminPage() {
  const [data, setData] = useState<Retur[]>([]);
  const [search, setSearch] = useState("");

  const [filterToko, setFilterToko] = useState("");
  const [filterSales, setFilterSales] = useState("");

  const [showFilter, setShowFilter] = useState(false);

  const [openMenuFor, setOpenMenuFor] = useState<number | null>(null);

  const filterRef = useRef<HTMLDivElement>(null); // ⭐ ref untuk popup filter

  const router = useRouter();
  const role = typeof window !== "undefined" ? localStorage.getItem("role") : null;

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

  // ⭐ jika user klik di luar filter → tutup filter
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

  const handleToggleMenu = (id: number) => {
    setOpenMenuFor(openMenuFor === id ? null : id);
  };

  const handleEdit = (id: number) => {
    setOpenMenuFor(null);
    router.push(`/dashboard/admin/edit/${id}`);
  };

  const handleSelesai = async (id: number) => {
    if (!confirm("Tandai retur ini sebagai 'Sudah dipotong'?")) return;
    const res = await fetch(`/api/retur/${id}`, { method: "PATCH" });
    if (res.ok) fetchData();
    else alert("Gagal ubah status");
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[1200px] px-4">
        <div className="p-8 font-sans bg-gray-50 min-h-screen">

          <div className="flex justify-between items-center mb-6 border-b pb-2">
            <h1 className="text-3xl font-bold">Selamat Datang Admin</h1>

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

          {/* Search + Filter + Tambah */}
          <div className="mb-4">

            {/* BARIS 1: Tambah + Search + Filter */}
            <div className="flex justify-between items-center relative">

              {/* Tombol Tambah */}
              <button
                onClick={() => router.push("/dashboard/admin/tambah")}
                className="border px-5 py-2 rounded-md text-lg font-semibold bg-[#e8f0ff] hover:bg-blue-200 min-w-[192px]"
              >
                Tambah Data
              </button>

              {/* SEARCH + FILTER */}
              <div className="flex gap-3 items-center" ref={filterRef}>

                {/* Search */}
                <input
                  type="text"
                  placeholder="Search"
                  className="border px-3 py-2 rounded-md w-64"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />

                {/* Filter */}
                <button
                  onClick={() => setShowFilter((prev) => !prev)}
                  className="flex items-center gap-2 border px-4 py-2 rounded-lg bg-[#f9fafc] hover:bg-gray-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg"
                    fill="none" viewBox="0 0 24 24"
                    strokeWidth="1.5" stroke="currentColor"
                    className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M3 4.5h18M6 9h12M10 13.5h4M12 18v-4.5" />
                  </svg>
                </button>

                {/* Popup Filter */}
                {showFilter && (
                  <div className="absolute right-0 mt-2 w-64 p-4 rounded-lg shadow-lg border bg-[#f9fafc] z-50">
                    <h3 className="font-semibold mb-3">Filter Data</h3>

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

            {/* BARIS 2: REPORT PDF */}
            <div className="mt-4 flex gap-2 items-center">

              <input
                type="month"
                className="border px-3 py-2 rounded-md"
                id="bulan"
              />

              <button
                onClick={() => {
                  const b = (document.getElementById("bulan") as HTMLInputElement).value;
                  if (!b) return alert("Pilih bulan terlebih dahulu!");

                  window.open(`/api/report/admin?bulan=${b}`, "_blank");
                }}
                className="border px-5 py-2 rounded-md text-lg font-semibold bg-[#e8f0ff] hover:bg-blue-200"
              >
                Download Laporan
              </button>

            </div>

          </div>

          {/* TABLE */}
          <div className="overflow-auto bg-white rounded shadow-sm">
            <table className="min-w-max border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-3 py-3 w-12"></th>
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

                    {/* menu 3 titik */}
                    <td className="border px-2 py-2 relative">
                      <button
                        onClick={() => handleToggleMenu(r.id)}
                        className="p-1"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="5" r="2" fill="#333" />
                          <circle cx="12" cy="12" r="2" fill="#333" />
                          <circle cx="12" cy="19" r="2" fill="#333" />
                        </svg>
                      </button>

                      {openMenuFor === r.id && (
                        <div className="absolute left-0 top-full mt-1 z-10 bg-white border rounded shadow-sm text-left">
                          <button
                            onClick={() => handleEdit(r.id)}
                            className="block px-3 py-2 text-sm hover:bg-gray-100 w-32 text-left"
                          >
                            Edit
                          </button>
                        </div>
                      )}
                    </td>

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
                      ) : (
                        "-"
                      )}
                    </td>

                    <td className="border px-3 py-2">
                      {new Date(r.tgl_terima).toLocaleDateString("id-ID")}
                    </td>

                    <td className="border px-3 py-2">
                      {new Date(r.tgl_retur).toLocaleDateString("id-ID")}
                    </td>

                    <td className="border px-3 py-2">
                      {r.status.toLowerCase() === "belum dipotong" ? (
                        role === "admin" ? (
                          <button
                            onClick={() => handleSelesai(r.id)}
                            className="px-3 py-1 border rounded"
                          >
                            Selesai
                          </button>
                        ) : (
                          <span className="text-orange-600 font-semibold">
                            Belum dipotong
                          </span>
                        )
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
                    <td colSpan={11} className="py-6 text-center text-gray-500">
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
