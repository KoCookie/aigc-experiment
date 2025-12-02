import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * Tips Page — dark style, aligned with Experiment layout
 * Focus: how to operate on each image (mark, edit, save, navigate).
 */
export default function Tips() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    try {
      window.scrollTo({ top: 0, behavior: "instant" });
    } catch {
      window.scrollTo(0, 0);
    }
  }, []);

  const handleBack = () => {
    const from = location.state?.from;
    if (from) navigate(from);
    else if (window.history.length > 1) navigate(-1);
    else navigate("/menu", { replace: true });
  };

  return (
    <div style={styles.page} aria-label="Tips page">
      <header style={styles.header}>
        <button
          type="button"
          onClick={handleBack}
          style={styles.smallBtn}
          aria-label="Back"
        >
          ← Back
        </button>
        <div style={{ fontWeight: 800 }}>Tips &amp; Help</div>
        <div style={{ width: 72 }} />
      </header>

      <main style={styles.centerWrap}>
        <section style={styles.card}>
          <h1 style={styles.h1}>提示与帮助（Tips）</h1>

          <h2 style={styles.h2}>实验整体流程概览</h2>
          <p style={styles.p}>
            在阅读完说明后，您会进入 Practice 阶段，我们将提供 11 道练习题帮助您熟悉实验流程。
            Practice 只需完成一次，之后再次登录将直接进入 Menu 页面。
          </p>
          <p style={styles.p}>
            在 Menu 页面您可以看到 4 个批次的进度（Batch1–Batch4），可以自由选择继续未完成的批次。
            每次回到未完成的批次时，系统会从最新的进度继续。
          </p>
          <p style={styles.p}>
            进入批次后，您将正式开始实验。在完成或退出某个批次后，您将进入 Result 页面查看整体进度。
          </p>

          <h2 style={styles.h2}>有关于理由选项的说明</h2>
          <p style={styles.p}>面部问题：不仅限于人，也可能是动物、乐高积木人等具有“脸部”的对象。</p>
          <p style={styles.p}>毛发问题：可以指人的头发、动物毛发、衣物纤维（如毛衣、围巾）。</p>
          <p style={styles.p}>手部问题：仅指人的手；动物的手足属于身体问题；类似“手”的玩具形状（如积木人）属于物体问题。</p>
          <p style={styles.p}>身体问题：人、动物、积木人的身体/躯干/肢干结构问题。</p>
          <p style={styles.p}>物体问题：范围较广，包括食物、积木、绘画、生活用品等。</p>
          <p style={styles.p}>其他问题：最通用的选项，可覆盖所有无法归类的问题，也可用文字补充。</p>

          <h2 style={styles.h2}>在反馈理由时您可能遇到的情况</h2>
          <p style={styles.p}>1. 图片整体存在不自然之处（如色调奇怪、CG 感强），但细节无明显错误 → 可只选整体理由。</p>
          <p style={styles.p}>2. 图片整体良好，但局部存在破绽（人体结构、物体位置等） → 可只选细节理由。</p>
          <p style={styles.p}>3. 整体与细节都存在破绽 → 需同时反馈整体与细节理由。</p>
          <p style={styles.p}>
            4. 图片质量极差（如整体油画感、人脸大量结构异常、手部融合成团等） → 无需反馈细节，可只选整体理由。
          </p>
          <p style={styles.p}>
            请尽量通过点击反馈尽可能详细的破绽；当破绽太多无法逐一点击时，可“放弃”该图，仅反馈整体理由。
          </p>
          <p style={styles.p}><strong>请相信自己的判断，没有标准答案，我们需要的就是您的主观感受。</strong></p>

          <h2 style={styles.h2}>Practice 阶段目标</h2>
          <p style={styles.p}>1. 熟悉实验流程与页面操作。</p>
          <p style={styles.p}>2. 熟悉各项理由选项的含义与适用情况。</p>
          <p style={styles.p}>3. 体会哪些图片可以“放弃”。</p>
          <p style={styles.p}>
            Practice 的参考答案并不是“标准答案”，它只是帮助您理解正式实验中反馈的颗粒度。您的判断永远是正确的。
          </p>

          <h2 style={styles.h2}>关于点击图片的特别说明</h2>
          <p style={styles.p}>
            点击代表您的注视。若一次点击无法覆盖整个破绽（如整根手指、马匹整个下半身），无需多次点击，确保一次点击落在该区域即可。
          </p>
          <p style={styles.p}>
            若一个圆圈覆盖多个破绽（例如两只眼睛同时被圈住），请分别点击每一处破绽，因为只有圆圈中心的位置才是有效反馈。
          </p>
          <p style={styles.p}>
            当您放大或缩小图片后，圆圈的位置可能出现“飘移”，请使用 Reset 按钮恢复准确位置。
          </p>

          <h2 style={styles.h2}>提醒</h2>
          <p style={styles.p}>
            如果在实验过程中忘记任何内容，都可以随时点击右上角的 Tips 查看本说明。
            请根据您的真实主观感受进行反馈即可。
          </p>
        </section>
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    width: "100vw",
    background: "linear-gradient(90deg,#0b1220,#0f172a)",
    display: "flex",
    flexDirection: "column",
    color: "#e2e8f0",
  },
  header: {
    background: "#0b1220",
    color: "#e2e8f0",
    padding: "12px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    fontWeight: 800,
    position: "sticky",
    top: 0,
    zIndex: 10,
    borderBottom: "1px solid #22304a",
  },
  centerWrap: {
    flex: 1,
    width: "100%",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    padding: "24px 16px",
  },
  card: {
    width: "100%",
    maxWidth: 980,
    background: "#0f172a",
    borderRadius: 12,
    boxShadow: "0 10px 30px rgba(0,0,0,.35)",
    padding: 20,
    color: "#e2e8f0",
  },
  h1: { fontSize: 28, margin: "0 0 12px", fontWeight: 800 },
  h2: { fontSize: 18, margin: "18px 0 8px", fontWeight: 800, color: "#cbd5e1" },
  h3: { fontSize: 15, margin: "12px 0 6px", fontWeight: 700, color: "#e5e7eb" },
  p: { margin: "4px 0 8px", lineHeight: 1.6, fontSize: 14 },
  ol: { paddingLeft: 18, lineHeight: 1.6, margin: "0 0 10px", fontSize: 14 },
  ul: { paddingLeft: 18, lineHeight: 1.6, margin: "0 0 8px", fontSize: 14 },
  note: {
    margin: "6px 0 10px",
    background: "#0b1220",
    border: "1px solid #22304a",
    borderRadius: 8,
    padding: "8px 10px",
    color: "#cbd5e1",
    fontSize: 13,
  },
  smallBtn: {
    padding: "6px 10px",
    borderRadius: 6,
    border: "1px solid #475569",
    background: "#111827",
    color: "#e2e8f0",
    cursor: "pointer",
    fontSize: 13,
  },
  details: {
    background: "#0b1220",
    border: "1px solid #22304a",
    borderRadius: 8,
    padding: "6px 10px",
    marginBottom: 6,
    fontSize: 14,
  },
  summary: { cursor: "pointer", fontWeight: 700 },
  detailBody: { color: "#cbd5e1", paddingTop: 6, fontSize: 14 },
};