import React from "react";
import { useNavigate } from "react-router-dom";

/**
 * Unified thank-you page styling (same dark + rounded card style as other pages)
 * - Uses Tailwind class names
 * - Also provides minimal inline styles as fallback (layout stays intact without Tailwind)
 */
export default function Thanks() {
  const navigate = useNavigate();

  return (
    <div
      className="fixed inset-0 grid place-items-center bg-gray-900 text-white p-6"
      style={{ position: 'fixed', inset: 0, display: 'grid', placeItems: 'center', background: '#0f172a', color: '#fff', padding: '1.5rem' }}
    >
      <div
        className="bg-gray-800 p-10 rounded-xl shadow-lg w-full max-w-2xl text-left"
        style={{
          background: "rgba(30,41,59,0.9)",
          padding: "2.5rem",
          borderRadius: "0.75rem",
          boxShadow: "0 10px 25px rgba(0,0,0,0.35)",
          maxWidth: "48rem",
          width: "100%",
        }}
      >
        <h1 className="text-3xl font-bold mb-4" style={{ fontSize: "1.875rem", fontWeight: 700 }}>
          Thank you for participating!
        </h1>

        <p
          className="text-lg text-gray-300 leading-relaxed mb-8"
          style={{ color: "rgba(226,232,240,0.9)", lineHeight: 1.8, fontSize: "1.125rem", marginBottom: "2rem" }}
        >
          You have successfully completed this pilot study. Thank you for taking the time to participate.
        </p>

        <button
          onClick={() => navigate("/")}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition"
          style={{
            padding: "0.5rem 1.25rem",
            background: "#2563eb",
            borderRadius: "0.5rem",
            fontWeight: 600,
            transition: "all .2s ease",
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = "#1d4ed8")}
          onMouseOut={(e) => (e.currentTarget.style.background = "#2563eb")}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}