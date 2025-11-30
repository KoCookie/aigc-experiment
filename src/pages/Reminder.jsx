import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Reminder Page — unified with other pages (dark gradient, card, spacing)
 * Appears before Login; clicking the button navigates to /login
 */
export default function Reminder() {
  const navigate = useNavigate();

  useEffect(() => {
    try {
      window.scrollTo({ top: 0, behavior: "instant" });
    } catch {
      window.scrollTo(0, 0);
    }
    document.title = "Reminder • AIGC Experiment";
  }, []);

  const handleAcknowledge = () => {
    navigate("/login", { replace: true, state: { from: "/reminder" } });
  };

  return (
    <div
      className="min-h-screen w-full bg-gradient-to-br from-[#0b1220] to-[#0f172a] text-slate-100 flex flex-col"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0b1220 0%, #0f172a 100%)",
        color: "#e5e7eb",
      }}
    >
      {/* Top header bar for visual unity */}
      <header
        className="sticky top-0 z-10 flex items-center justify-between border-b border-[#22304a] bg-[#0b1220]/90 px-6 py-4 backdrop-blur"
        style={{
          borderBottom: "1px solid #22304a",
          background: "rgba(11, 18, 32, 0.9)",
          padding: "16px 24px",
        }}
      >
        <div className="font-extrabold tracking-tight" style={{ fontWeight: 800 }}>Reminder</div>
        <div className="text-sm text-slate-400" style={{ color: "#94a3b8" }}>Environment setup</div>
      </header>

      <main className="flex-1 px-4 sm:px-6 py-8" style={{ padding: "32px 24px" }}>
        <div className="mx-auto w-full max-w-4xl" style={{ margin: "0 auto", maxWidth: 1024 }}>
          <section
            className="rounded-2xl border border-[#22304a] bg-[#0f172a] shadow-xl"
            style={{
              border: "1px solid #22304a",
              background: "#0f172a",
              borderRadius: 16,
              boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
            }}
          >
            <div className="p-6 sm:p-8" style={{ padding: 24 }}>
              <h1
                className="text-2xl sm:text-3xl font-extrabold tracking-tight"
                style={{ fontSize: 24, fontWeight: 800, margin: 0 }}
              >
                观看环境提醒
              </h1>
              <p
                className="mt-2 text-slate-300 leading-relaxed"
                style={{ marginTop: 8, color: "#cbd5e1", lineHeight: 1.7 }}
              >
                为了能让您更准确地评估图片质量，请您花一点时间做以下简单调整：
              </p>

              <ol
                className="mt-5 list-decimal pl-5 space-y-3 leading-relaxed text-slate-200"
                style={{ marginTop: 20, paddingLeft: 20, color: "#e2e8f0", lineHeight: 1.7 }}
              >
                <li>
                  为了保证图片显示效果更加稳定，我们
                  <span className="font-medium" style={{ fontWeight: 600 }}>推荐使用 Chrome 或 Edge 浏览器</span>
                  打开本网站。如果您目前使用的是其他浏览器，且条件允许，辛苦您尽量改用 Chrome / Edge 重新打开本页面。
                </li>
                <li>
                  请在
                  <span className="font-medium" style={{ fontWeight: 600 }}>较为明亮、接近自然日光的环境下</span>
                  进行实验，并尽量避免屏幕上出现明显的灯光或窗户反光，以便您可以更清楚地看到图像细节。
                </li>
              </ol>

              <p
                className="mt-6 text-slate-300"
                style={{ marginTop: 24, color: "#cbd5e1" }}
              >
                感谢您的配合！一个中性的观看环境能让您的评估结果更可靠。
              </p>

              <div className="mt-8 flex items-center gap-3" style={{ marginTop: 32, display: "flex", alignItems: "center", gap: 12 }}>
                <button
                  type="button"
                  onClick={handleAcknowledge}
                  className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-[#0f172a] transition-colors"
                  style={{
                    background: "#4f46e5",
                    color: "white",
                    borderRadius: 8,
                    padding: "10px 20px",
                    fontWeight: 600,
                  }}
                >
                  我已了解
                </button>
                <span className="text-xs text-slate-400" style={{ fontSize: 12, color: "#94a3b8" }}>
                  点击“我已了解”将进入登录页面
                </span>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
