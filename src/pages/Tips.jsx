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
          <h1 style={styles.h1}>Tips &amp; Help</h1>

          <h2 style={styles.h2}>Overview of the Study Flow</h2>
          <p style={styles.p}>
            After reading the instructions, you will enter the Practice stage with 11 practice items to help you get familiar with the workflow.
            Practice only needs to be completed once. After that, future logins will go directly to the Menu page.
          </p>
          <p style={styles.p}>
            On the Menu page you can see progress for four batches (Batch 1–4) and freely resume any unfinished batch.
            Each time you return, the system continues from your latest progress.
          </p>
          <p style={styles.p}>
            Once you enter a batch, the experiment begins. After finishing or exiting a batch, you will be taken to the Result page to review your overall progress.
          </p>

          <h2 style={styles.h2}>Notes on Reason Options</h2>
          <p style={styles.p}>Face issues: not limited to humans; can also apply to animals, LEGO figures, or any object with a "face."</p>
          <p style={styles.p}>Hair/fur issues: includes human hair, animal fur, and clothing fibers (e.g., sweaters or scarves).</p>
          <p style={styles.p}>Hand issues: human hands only; animal paws belong to body issues; hand-like toy shapes (e.g., LEGO hands) are object issues.</p>
          <p style={styles.p}>Body issues: structural problems of bodies/torso/limbs in humans, animals, or toy figures.</p>
          <p style={styles.p}>Object issues: a broad category, including food, blocks, paintings, and everyday items.</p>
          <p style={styles.p}>Other issues: the most general option; covers anything not classified above and supports text notes.</p>

          <h2 style={styles.h2}>Cases You May Encounter</h2>
          <p style={styles.p}>1. Overall issues (e.g., strange tone, strong CG feel) but no obvious detail errors → choose overall reasons only.</p>
          <p style={styles.p}>2. Good overall, but local flaws (body structure, object position, etc.) → choose detail reasons only.</p>
          <p style={styles.p}>3. Both overall and detail flaws → provide both overall and detail reasons.</p>
          <p style={styles.p}>
            4. Very poor image quality (e.g., painterly look, many faces structurally broken, hands merged) → no need to mark details; choose overall reasons only.
          </p>
          <p style={styles.p}>
            Try to mark flaws as precisely as possible with clicks. If there are too many flaws to mark individually, you may "skip" detail marking and provide only overall reasons.
          </p>
          <p style={styles.p}><strong>Trust your judgment. There are no correct answers. We want your subjective impressions.</strong></p>

          <h2 style={styles.h2}>Practice Stage Goals</h2>
          <p style={styles.p}>1. Get familiar with the workflow and interface.</p>
          <p style={styles.p}>2. Learn the meaning and usage of each reason option.</p>
          <p style={styles.p}>3. Understand which images can be "skipped" for detail marking.</p>
          <p style={styles.p}>
            The Practice reference answers are not "correct answers." They simply illustrate the expected level of detail. Your judgment is always valid.
          </p>

          <h2 style={styles.h2}>Notes on Clicking the Image</h2>
          <p style={styles.p}>
            A click represents where you looked. If one click cannot cover the entire flaw (e.g., a whole finger or a horse's lower body), do not click repeatedly; one click in the area is enough.
          </p>
          <p style={styles.p}>
            If one circle visually covers multiple flaws (e.g., both eyes), click each flawed area separately. Only the circle center counts as valid feedback.
          </p>
          <p style={styles.p}>
            When zooming in or out, circles may appear to drift. Use the Reset button to restore accurate positioning.
          </p>

          <h2 style={styles.h2}>Reminder</h2>
          <p style={styles.p}>
            If you forget anything during the experiment, you can always click Tips in the top-right to review this guidance.
            Please provide feedback based on your genuine impressions.
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
