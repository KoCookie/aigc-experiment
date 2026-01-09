import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Introduction() {
  const [page, setPage] = useState(1)
  const navigate = useNavigate()
  const [modalImg, setModalImg] = useState(null)

  const handlePrev = () => {
    if (page > 1) setPage(page - 1)
  }

  const handleNext = () => {
    if (page < 6) {
      setPage(page + 1)
    } else {
      navigate('/practice')
    }
  }

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }, [page])

  return (
    <div style={styles.page}>
      <header style={styles.header}>Introduction</header>

      <main style={styles.centerWrap}>
        <section style={styles.card}>
          <p style={styles.introText}>First, thank you for taking the time to participate! Please read the guidance below carefully to ensure you fully understand the study before continuing.</p>
          {page === 1 ? (
            <>
              <h2 style={styles.pageTitle}>Overview of the Study Flow</h2>

              <p style={styles.text}>
                In the main study, you will review 600 AI-generated images from different models and identify any anomalies you notice, including overall inconsistencies or specific detail issues.
              </p>

              <p style={styles.text}>
                After this page, you will enter the Practice section (shown in Fig. 1). We provide 11 practice items to help you get familiar with the task.
                (Practice only needs to be completed once. After completion, future logins will take you directly to the Menu page.)
              </p>
              <img
                src="/practice.png"
                alt="Practice page preview"
                style={styles.image}
                onClick={() => setModalImg('/practice.png')}
              />
              <p style={{ ...styles.text, textAlign: 'center' }}>Fig. 1  Practice page preview</p>

              <p style={styles.text}>
                Next you will enter the Menu page (Fig. 2), where you can see the progress and entry points for four batches (Batch 1-4).
                The batch design allows you to take breaks; when you return to an unfinished batch, you will continue from your latest progress.
              </p>
              <img
                src="/menu.png"
                alt="Menu page preview"
                style={styles.image}
                onClick={() => setModalImg('/Menu.png')}
              />
              <p style={{ ...styles.text, textAlign: 'center' }}>Fig. 2  Menu page preview</p>

              <p style={styles.text}>
                After entering a batch, you will begin the experiment (the Experiment page, Fig. 3). Later pages provide more detailed instructions about the interface.
              </p>
              <img
                src="/experiment.png"
                alt="Experiment page preview"
                style={styles.image}
                onClick={() => setModalImg('/experiment.png')}
              />
              <p style={{ ...styles.text, textAlign: 'center' }}>Fig. 3  Experiment page preview</p>

              <p style={styles.text}>
                Each time you exit or finish a batch, you will go to the Result page (Fig. 4). It shows your overall progress and a button to return to the Menu page.
                After finishing a batch, return to the menu to start the next one.
              </p>
              <img
                src="/result.png"
                alt="Result page preview"
                style={styles.image}
                onClick={() => setModalImg('/result.png')}
              />
              <p style={{ ...styles.text, textAlign: 'center' }}>Fig. 4  Result page preview</p>
              <p style={styles.text}>
                You can pause at any time. Before leaving, click "Exit" in the top-right of the Experiment page to go to the Result page, then close the site. When you log in again, you will be taken to the latest unfinished item in that batch.
              </p>
            </>
          ) : page === 2 ? (
            <>
              <h2 style={styles.pageTitle}>Experiment Page Walkthrough</h2>

              <img
                src="/Experiment1.png"
                alt="Experiment step 1"
                style={styles.image}
                onClick={() => setModalImg('/Experiment1.png')}
              />

              <img
                src="/Experiment2.png"
                alt="Experiment step 2"
                style={styles.image}
                onClick={() => setModalImg('/Experiment2.png')}
              />

              <img
                src="/Experiment3.png"
                alt="Experiment step 3"
                style={styles.image}
                onClick={() => setModalImg('/Experiment3.png')}
              />

              <img
                src="/Experiment4.png"
                alt="Experiment step 4"
                style={styles.image}
                onClick={() => setModalImg('/Experiment4.png')}
              />

              <img
                src="/Experiment5.png"
                alt="Experiment step 5"
                style={styles.image}
                onClick={() => setModalImg('/Experiment5.png')}
              />
            </>
          ) : page === 3 ? (
            <>
              <h2 style={styles.pageTitle}>Notes on Reason Options</h2>

              <p style={styles.text}>
                The reason options are best understood through practice. Do not worry about forgetting these notes. You can always review all guidance using the "Tips" button in the top-right of the Experiment page.
              </p>

              <img
                src="/reason1.png"
                alt="Reason example 1"
                style={{ ...styles.image, maxHeight: '69vh' }}
                onClick={() => setModalImg('/reason1.png')}
              />

              <img
                src="/reason2.png"
                alt="Reason example 2"
                style={{ ...styles.image, maxHeight: '37vh' }}
                onClick={() => setModalImg('/reason2.png')}
              />

              <img
                src="/reason3.png"
                alt="Reason example 3"
                style={{ ...styles.image, maxHeight: '57vh' }}
                onClick={() => setModalImg('/reason3.png')}
              />

              <p style={styles.text}>
                1. Face issues are not limited to humans; they can also apply to animals, LEGO figures, or any object with a "face."
              </p>

              <p style={styles.text}>
                2. Hair/fur issues can refer to human hair, animal fur, or even visible fibers on clothing such as sweaters or scarves.
                If the hair or fibers look clearly unnatural in shape, direction, or connection, choose "Hair/Fur Issues."
              </p>

              <p style={styles.text}>
                3. Hand issues refer specifically to human hands. Animal paws are usually considered "Body Issues,"
                and hand-like shapes (e.g., LEGO hands) are generally "Object Issues."
              </p>

              <p style={styles.text}>
                4. Body issues can include the body, torso, and limbs of humans, animals, or toy figures.
              </p>

              <p style={styles.text}>
                5. Object issues cover a broad range, including food, blocks, paintings, and daily items.
              </p>

              <p style={styles.text}>
                6. If none of the above fits well, see "Other Issues," which includes common AI artifacts. This section also provides an "Other" option where you can add a brief text note.
              </p>
            </>
          ) : page === 4 ? (
            <>
              <h2 style={styles.pageTitle}>How to Provide Reasons</h2>

              <p style={styles.text}>
                You may encounter several cases when providing reasons:
              </p>

              <p style={styles.text}>
                1. The image has overall issues (e.g., strange tones or overly strong CG feel) but no obvious detail errors. In this case, provide only overall reasons.
              </p>

              <p style={styles.text}>
                2. The image looks good overall, but there are detail flaws (e.g., body structure, object position). In this case, you can provide detail reasons by clicking only.
              </p>

              <p style={styles.text}>
                3. The image has issues at both overall and detail levels. In this case, provide overall reasons and also click to indicate detail flaws.
              </p>

              <p style={styles.text}>
                4. Some images are so poor (e.g., looks like a painting rather than a real photo, many faces are structurally broken, or all hands blend together) that providing detail reasons is not meaningful. We call these "skippable" images. In this case, provide only overall reasons.
              </p>

              <p style={styles.text}>
                5. Some images look good and you cannot find any flaws. In this case, just check "No obvious flaws."
              </p>

              <p style={styles.text}>
                In general, try to mark flaws as precisely as possible via clicks. For example, if there are four people and each face has issues, the image is still "salvageable" and you should click to report detail reasons. But if there are many people and faces are severely broken to the point where clicking is impractical, you can "skip" detail reasons and provide only overall reasons. There is no limit on the number of clicks.
              </p>

              <p style={styles.text}>
                Most importantly, trust your judgment. There are no "correct" answers. We want your subjective feedback.
              </p>
            </>
          ) : page === 5 ? (
            <>
              <h2 style={styles.pageTitle}>Goals for the Practice Stage</h2>

              <p style={styles.text}>
                In the Practice stage, the expected outcomes include:
              </p>

              <p style={styles.text}>
                1. Become familiar with the interface and overall workflow, and understand how to perform each step in the main study.
              </p>

              <p style={styles.text}>
                2. Learn the meaning of each reason option and practice choosing appropriate reasons for different types of images.
              </p>

              <p style={styles.text}>
                3. Get a feel for which images can be "skipped" for detail marking, for example when overall quality is very poor and details are nearly impossible to click. In such cases, provide only overall reasons.
              </p>

              <p style={styles.text}>
                Reminder: there are no "correct answers" in this study. Your judgments are all valid, and you may even disagree with some flaws or reasons shown in the reference answers.
                What matters most is your genuine perception of the image.
              </p>

              <p style={styles.text}>
                The reference answers in Practice are meant to illustrate the level of detail we expect in the main study, not to judge right or wrong.
              </p>
            </>
          ) : page === 6 ? (
            <>
              <h2 style={styles.pageTitle}>Notes on Clicking the Image</h2>

              <p style={styles.text}>
                1. We use clicks to approximate where your gaze lands. Your click represents where you looked.
                If one click cannot cover the entire flawed area (e.g., an entire finger looks wrong but a single circle is too small, or a horse has disproportional body parts), do not worry.
                You do not need to cover the whole area with multiple clicks. One click in that region is enough to indicate you inspected it.
              </p>

              <p style={styles.text}>
                2. Only the exact click position (the circle center) counts as a valid mark.
                If one circle visually covers multiple flaws, do not be misled by its size. Make sure you click each flawed area separately.
                For example, if both eyes are flawed and you click one eye, the circle may also cover the other eye, but that does not count. You still need to click the other eye.
              </p>

              <p style={styles.text}>
                3. When zooming in or out, circles may appear to drift.
                This is normal. Just keep observing, and use the "Reset" button to realign the circles.
                Any circle misalignment can be fixed with "Reset."
              </p>
            </>
          ) : (
            <p style={styles.text}>Page {page} content will be shown here later.</p>
          )}

          <div style={styles.buttons}>
            <button
              onClick={handlePrev}
              disabled={page === 1}
              style={{
                ...styles.button,
                backgroundColor: page === 1 ? '#374151' : '#2563eb',
                cursor: page === 1 ? 'not-allowed' : 'pointer',
              }}
            >
              Prev
            </button>

            <button
              onClick={handleNext}
              style={{
                ...styles.button,
                backgroundColor: '#2563eb',
                cursor: 'pointer',
              }}
            >
              {page === 6 ? 'Start Practice' : 'Next'}
            </button>
          </div>
        </section>
      </main>
      {modalImg && (
        <div style={styles.modalOverlay} onClick={() => setModalImg(null)}>
          <img src={modalImg} style={styles.modalImage} alt="Zoomed preview" />
        </div>
      )}
    </div>
  )
}

/* styles */
const styles = {
  page: {
    minHeight: '100vh',
    width: '100vw',
    background: 'linear-gradient(135deg, #020617, #0f172a)',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'system-ui, sans-serif',
  },
  header: {
    background: '#020617',
    color: '#fff',
    padding: '16px 24px',
    fontSize: 20,
    fontWeight: 700,
  },
  centerWrap: {
    flex: 1,
    width: '100%',
    display: 'block',
    padding: '24px 48px',
  },
  card: {
    width: '100%',
    maxWidth: '100%',
    background: '#020617',
    borderRadius: 12,
    boxShadow: '0 20px 40px rgba(0,0,0,.45)',
    padding: 24,
  },
  pageTitle: {
    color: '#f9fafb',
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 16,
    textAlign: 'left',
  },
  text: {
    color: '#e5e7eb',
    fontSize: 18,
    marginBottom: 24,
    textAlign: 'left',
  },
  introText: {
    color: '#e5e7eb',
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'left',
    lineHeight: 1.6,
  },
  buttons: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  button: {
    padding: '12px 24px',
    color: '#fff',
    fontWeight: 700,
    border: 'none',
    borderRadius: 8,
    transition: '0.2s ease',
  },
  image: {
    width: '100%',
    maxHeight: '80vh',
    objectFit: 'contain',
    borderRadius: 8,
    marginBottom: 32,
    display: 'block',
    cursor: 'zoom-in',
  },
  reasonBlock: {
    marginBottom: 32,
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0,0,0,0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    cursor: 'zoom-out',
  },
  modalImage: {
    maxWidth: '90vw',
    maxHeight: '90vh',
    objectFit: 'contain',
    borderRadius: 12,
  },
}
