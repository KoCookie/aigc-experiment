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
          {/* What you do on each image */}
          <h1 style={styles.h1}>What you do on each image</h1>
          <p style={styles.p}>
            In this experiment, you will see different types of images (including people,
            hands, objects, and scenes). Your task is to carefully observe each image
            and mark any areas that look unnatural, inconsistent, or suspicious.
          </p>
          <ol style={styles.ol}>
            <li>
              Look closely at the entire image.
            </li>
            <li>
              Whenever you notice something that feels <strong>unnatural</strong> or
              "not quite right", <strong>click</strong> directly on that area to mark it.
            </li>
            <li>
              For each marked point, you will <strong>confirm</strong> the position and
              then <strong>choose reasons</strong> that best describe the issue.
            </li>
            <li>
              If you think the <strong>whole image</strong> has a general problem, you can
              add <strong>overall reasons</strong>.
            </li>
            <li>
              If you believe there are <strong>no obvious flaws</strong>, you may check
              <em>"No obvious flaws"</em>.
            </li>
          </ol>

          <p style={styles.note}>
            <strong>Note:</strong> There are no right or wrong answers. We are interested in
            <strong>how you perceive problems in the image</strong>.
          </p>

          {/* How to mark a flaw */}
          <h2 style={styles.h2}>How to mark a flaw</h2>
          <h3 style={styles.h3}>1. Click on the image to add a point</h3>
          <p style={styles.p}>
            Click on the location where you notice a potential flaw. A highlighted circle
            will appear (bright yellow, like a highlighter). This is a <strong>candidate point</strong>.
          </p>

          <h3 style={styles.h3}>2. Confirm and choose reasons</h3>
          <p style={styles.p}>
            After clicking <em>Confirm</em>, a window will appear where you can select one
            or more <strong>reasons</strong> that best match what you see at that point.
            Each point is saved as a separate entry.
          </p>

          <h3 style={styles.h3}>3. Add multiple points</h3>
          <p style={styles.p}>
            If you notice several suspicious areas in the same image, you can repeat the
            process: click, confirm, and choose reasons for each point. There is no fixed
            limit on how many points you can mark.
          </p>

          <h3 style={styles.h3}>4. Edit or delete a point</h3>
          <p style={styles.p}>
            In the panel on the right side of the experiment page:
          </p>
          <ul style={styles.ul}>
            <li>
              <strong>Edit</strong> &mdash; change the reasons for that point.
            </li>
            <li>
              <strong>Delete</strong> &mdash; remove the point completely.
            </li>
            <li>
              <strong>Select</strong> &mdash; highlight the corresponding circle in red so
              you can clearly see which point you are editing.
            </li>
          </ul>

          {/* Overall reasons */}
          <h2 style={styles.h2}>Overall reasons (optional)</h2>
          <p style={styles.p}>
            Sometimes the whole image feels strange or inconsistent, but it is hard to
            describe the problem using only small local points. In such cases, you can add
            <strong>overall reasons</strong>:
          </p>
          <ul style={styles.ul}>
            <li>
              Click <strong>Add</strong> under the "Overall reasons" section.
            </li>
            <li>
              Choose one or more descriptions that match the overall issue you feel.
            </li>
            <li>
              Overall reasons can be used together with multiple local points, or on their own.
            </li>
          </ul>

          {/* No obvious flaws */}
          <h2 style={styles.h2}>"No obvious flaws"</h2>
          <p style={styles.p}>
            If, after careful inspection, you feel the image does not contain any clear or
            meaningful flaws, you may check <strong>"No obvious flaws"</strong>:
          </p>
          <ul style={styles.ul}>
            <li>All local points and overall reasons for this image will be cleared.</li>
            <li>Your final judgment for this image will be recorded as "no obvious flaws".</li>
          </ul>
          <p style={styles.p}>
            If you change your mind later, you can uncheck it and continue to add marks and reasons.
          </p>

          {/* Saving, skipping, navigation */}
          <h2 style={styles.h2}>Saving, skipping, and navigation</h2>

          <h3 style={styles.h3}>1. Save &amp; Next</h3>
          <p style={styles.p}>
            Your responses are saved only when you click <strong>Save &amp; Next</strong>:
          </p>
          <ul style={styles.ul}>
            <li>The system saves all marks, reasons, overall reasons, or "no obvious flaws".</li>
            <li>Then it automatically moves to the next image.</li>
          </ul>

          <h3 style={styles.h3}>2. Skip</h3>
          <p style={styles.p}>
            If you are unsure how to judge an image, or want to come back later, you can
            click <strong>Skip</strong>:
          </p>
          <ul style={styles.ul}>
            <li>The image will be marked as unfinished.</li>
            <li>You can return to it at any time using the Review grid.</li>
          </ul>

          <h3 style={styles.h3}>3. Review grid</h3>
          <p style={styles.p}>
            Click the <strong>Review</strong> button at the top of the experiment page to
            open the grid:
          </p>
          <ul style={styles.ul}>
            <li><strong>Green</strong> &mdash; completed images.</li>
            <li><strong>Red</strong> &mdash; unfinished or skipped images.</li>
            <li><strong>Orange</strong> &mdash; the current image.</li>
            <li>Click any square to jump directly to that image.</li>
          </ul>

          {/* Viewing the image */}
          <h2 style={styles.h2}>Viewing the image</h2>
          <ul style={styles.ul}>
            <li>Use the mouse wheel to <strong>zoom in</strong> and <strong>zoom out</strong>.</li>
            <li>Click and drag to <strong>move</strong> the image when zoomed in.</li>
            <li>Click <strong>Reset</strong> to restore the default view if you get lost.</li>
            <li>
              If the image does not load properly, try refreshing the page. If it still fails,
              you may skip this image and continue.
            </li>
          </ul>

          {/* Common situations & fixes */}
          <h2 style={styles.h2}>Common situations &amp; how to fix them</h2>

          <details style={styles.details} open>
            <summary style={styles.summary}>I clicked the wrong location.</summary>
            <div style={styles.detailBody}>
              Use <strong>Delete</strong> to remove that point and click again at the correct location.
            </div>
          </details>

          <details style={styles.details} open>
            <summary style={styles.summary}>I selected the wrong reasons.</summary>
            <div style={styles.detailBody}>
              Use <strong>Edit</strong> to adjust or replace the reasons for that point.
            </div>
          </details>

          <details style={styles.details} open>
            <summary style={styles.summary}>
              I marked several points but later feel the image is actually fine.
            </summary>
            <div style={styles.detailBody}>
              Check <strong>"No obvious flaws"</strong>. The system will clear all marks and
              overall reasons for this image.
            </div>
          </details>

          <details style={styles.details} open>
            <summary style={styles.summary}>I'm not sure how to judge this image.</summary>
            <div style={styles.detailBody}>
              Use <strong>Skip</strong> and move on. You can come back later from the Review grid.
            </div>
          </details>

          <details style={styles.details} open>
            <summary style={styles.summary}>The image does not load.</summary>
            <div style={styles.detailBody}>
              Try refreshing the page. If it still does not load, skip this image and continue
              with the others.
            </div>
          </details>

          <h2 style={styles.h2}>Reminder</h2>
          <p style={styles.p}>
            You can always return to this Tips page from the experiment header if you feel
            unsure about what to do. Take your time, and focus on marking what looks
            unnatural or inconsistent to you.
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