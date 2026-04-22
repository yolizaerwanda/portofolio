"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login gagal");
        setLoading(false);
        return;
      }

      // Simpan user_id & role ke localStorage
      localStorage.setItem("user_id", data.user_id);
      localStorage.setItem("role", data.role);

      // Arahkan ke dashboard sesuai role
      if (data.role === "admin") {
        router.push("/dashboard/admin");
      } else {
        router.push("/dashboard/sales");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Terjadi kesalahan server");
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="flex items-center justify-center min-h-screen">
    <form
      onSubmit={handleLogin}
      className="p-8 w-full max-w-xl"
    >
      <h1 className="text-3xl font-bold text-center mb-16">
        Selamat Datang Di Sistem Retur
      </h1>

      {error && (
        <div className="bg-red-100 text-red-600 p-2 rounded mb-6 text-center">
          {error}
        </div>
      )}

      {/* Username */}
      <div className="grid grid-cols-3 items-center mb-6">
        <label className="text-xl font-semibold">Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="col-span-2 border bg-gray px-3 py-2 rounded focus:outline-none"
          required
        />
      </div>

      {/* Password */}
      <div className="grid grid-cols-3 items-center mb-10 relative">
        <label className="text-xl font-semibold">Password</label>

        <div className="col-span-2 relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border bg-gray px-3 py-2 rounded focus:outline-none"
            required
          />

          {/* Tombol Show/Hide */}
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
          >
            {showPassword ? (
              /* ikon mata terbuka */
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5 text-gray-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            ) : (
              /* ikon mata tertutup */
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-gray-700"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 3l18 18M10.5 10.5A3 3 0 0112 9a3 3 0 013 3c0 .53-.14 1.03-.39 1.46M6.72 6.72C4.7 8.07 3 12 3 12s4 7.5 9 7.5c1.6 0 3.07-.42 4.34-1.14M17.28 17.28C19.3 15.93 21 12 21 12s-4-7.5-9-7.5c-.96 0-1.88.16-2.76.45"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Button */}
      <div className="flex justify-center">
        <button
          type="submit"
          disabled={loading}
          className={`px-8 py-2 border text-lg rounded transition font-bold ${
            loading
              ? "opacity-60 cursor-not-allowed bg-gray-200"
              : "bg-gray-200 hover:bg-white"
          }`}
        >
          {loading ? "Memproses..." : "Log In"}
        </button>
      </div>
    </form>
  </div>
);
}
