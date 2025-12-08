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
          <p style={styles.introText}>首先，感谢您抽出宝贵的时间配合实验！请您仔细阅读以下的指导说明，确保您对整个实验有完整的了解，方便后续实验的开展。</p>
          {page === 1 ? (
            <>
              <h2 style={styles.pageTitle}>实验整体流程概览</h2>

              <p style={styles.text}>
                在正式实验中，您将观看共 600 张由不同模型生成的AI图像，并针对每张图片指出您认为可能存在的异常之处，包括整体违和感或具体细节问题。
              </p>

              <p style={styles.text}>
                在阅读完本页内容后，您会进入 Practice 练习环节（页面如下图所示），我们将为您提供 11 道练习题让您对实验更加熟悉。
                （Practice 环节只用完成一次，一旦完成，重新登陆账号时您会直接跳转到 Menu 页面）。
              </p>
              <img
                src="/practice.png"
                alt="Practice 页面示意图"
                style={styles.image}
                onClick={() => setModalImg('/practice.png')}
              />

              <p style={styles.text}>
                之后您会进入到 Menu 页面（如下图所示），在该页面您会看到您需要完成的四个批次（Batch1、Batch2、Batch3、Batch4）的题目对应的进度及批次入口。
                批次的设计允许您进行适当的休息，每次回到未完成的批次时，您都将从最新进展继续下去。
              </p>
              <img
                src="/menu.png"
                alt="Menu 页面示意图"
                style={styles.image}
                onClick={() => setModalImg('/Menu.png')}
              />

              <p style={styles.text}>
                进入批次后您将正式开始实验（即 Experiment 页面，如下图所示）。后续页面中我们会对实验界面进行更详细的说明。
              </p>
              <img
                src="/experiment.png"
                alt="Experiment 页面示意图"
                style={styles.image}
                onClick={() => setModalImg('/experiment.png')}
              />

              <p style={styles.text}>
                每次退出或完成某个批次后，您都会进入 Result 页面（如下图所示）。那里将显示您的整体做题进度，以及返回 Menu 页面的按钮。
                每完成一个批次返回菜单开启下一个即可。
              </p>
              <img
                src="/result.png"
                alt="Result 页面示意图"
                style={styles.image}
                onClick={() => setModalImg('/result.png')}
              />
            </>
          ) : page === 2 ? (
            <>
              <h2 style={styles.pageTitle}>实验页面操作介绍</h2>

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
              <h2 style={styles.pageTitle}>有关于理由选项的说明</h2>

              <p style={styles.text}>
                具体的理由选项需要结合练习进一步加深了解。请别担心您会忘记本页中相关的说明，通过实验页面右上角的“Tips”按钮您可以随时回顾指导页面的所有内容。
              </p>

              <img
                src="/reason1.png"
                alt="理由示例 1"
                style={{ ...styles.image, maxHeight: '63vh' }}
                onClick={() => setModalImg('/reason1.png')}
              />

              <img
                src="/reason2.png"
                alt="理由示例 2"
                style={{ ...styles.image, maxHeight: '37vh' }}
                onClick={() => setModalImg('/reason2.png')}
              />

              <img
                src="/reason3.png"
                alt="理由示例 3"
                style={{ ...styles.image, maxHeight: '58vh' }}
                onClick={() => setModalImg('/reason3.png')}
              />

              <p style={styles.text}>
                1、面部问题不仅限于人，还可以是动物、乐高积木人等具有“脸部”的对象。
              </p>

              <p style={styles.text}>
                2、毛发问题可以指人的头发、动物的毛发，甚至毛衣、围巾等织物上明显的毛发；
                如果您感觉这些毛发的形状、走向或连接方式明显不自然，可以选择“毛发问题”。
              </p>

              <p style={styles.text}>
                3、手部问题专指人的手部；动物的手足通常归为“身体问题”，
                其他类似手的形状（例如乐高小人的手）一般归为“物体问题”。
              </p>

              <p style={styles.text}>
                4、身体问题可以包含人、动物或积木人的身体、躯干和肢干。
              </p>

              <p style={styles.text}>
                5、物体问题则覆盖更广，包括食物、积木、绘画、生活用品等。
              </p>

              <p style={styles.text}>
                6、如果以上都不太匹配，您也可以查看“其他问题”部分，这其中包含了常见的AI破绽问题。同时，在这个部分我们还提供了“其他”选项方便您通过文本进行必要的补充说明。
              </p>
            </>
          ) : page === 4 ? (
            <>
              <h2 style={styles.pageTitle}>有关于反馈理由的说明</h2>

              <p style={styles.text}>
                在反馈理由时您可能会遇到几种情况：
              </p>

              <p style={styles.text}>
                1、图片在整体上有破绽或不自然的地方，如色调奇怪、整体 CG 感太重等等，但是细节上没什么错误，此时可以只反馈整体理由。
              </p>

              <p style={styles.text}>
                2、图片在整体上表现良好，但是细节处有破绽，如人体结构、物品位置等等，此时您可以只通过点击反馈细节理由。
              </p>

              <p style={styles.text}>
                3、图片在整体和细节两方面都存在破绽，此时您需要综合考虑，不仅反馈整体层面的问题，也要通过点击反馈细节上的破绽。
              </p>

              <p style={styles.text}>
                4、有一些特殊的图片，表现得实在太差（例如：画面整体呈现油画风而不是真实摄影风格、图片中有大量的人脸都出现结构异常，或者图片中的所有手都没有自己的形状而是交融在一起等等），已经失去了反馈细节理由的意义，我们称之为可“放弃”的图片。此时您也只需反馈整体理由即可。
              </p>

              <p style={styles.text}>
                5、还有一些图片表现得很好，您可能找不出任何破绽，此时您只需要勾选“无明显破绽”即可。
              </p>

              <p style={styles.text}>
                总体来说，请尽量通过点击反馈尽可能详细的破绽（比如，图片中有 4 个人，尽管每个人的人脸都有一些问题，也是可“拯救”的，请通过点击反馈细节理由；但如果图片中有十多个人，每个人的人脸都几乎不完整了，想要点击时根本无从下手，就可以“放弃”它们，只反馈整体理由即可），您的点击数量没有任何限制。
              </p>

              <p style={styles.text}>
                最重要的是，请相信自己的判断。您做出任何判断都是“正确”的，没有所谓的标准答案，我们想要得到的就是您主观感受的反馈。
              </p>
            </>
          ) : page === 5 ? (
            <>
              <h2 style={styles.pageTitle}>在 Practice 阶段您需要达到的效果</h2>

              <p style={styles.text}>
                在 Practice 阶段，您需要达到的预计效果包括以下几个方面：
              </p>

              <p style={styles.text}>
                1、熟悉页面操作和整体实验流程，了解在正式实验中每一步应该如何进行操作。
              </p>

              <p style={styles.text}>
                2、在实践中进一步熟悉各个理由选项的含义，体会在不同类型的图片中应该如何选择合适的理由进行反馈。
              </p>

              <p style={styles.text}>
                3、逐渐感受哪些图片是可以“放弃”的——例如当整体质量已经非常差、细节几乎无从点击时，可以只反馈整体理由而不必纠结每一个细节。
              </p>

              <p style={styles.text}>
                特别提醒：我们再次强调，本实验中没有所谓的“正确答案”！您的判断都是“正确”的，您甚至可以不认可参考答案给出的某些破绽或理由。
                最重要的是根据您对图片的真实感受来进行反馈。
              </p>

              <p style={styles.text}>
                Practice 阶段提供的参考答案，主要是帮助您体会在正式实验中我们希望您进行到怎样的反馈颗粒度，而不是用来评判您的“对错”。
              </p>
            </>
          ) : page === 6 ? (
            <>
              <h2 style={styles.pageTitle}>关于点击图片的特别说明</h2>

              <p style={styles.text}>
                1、首先，您需要知道，我们希望通过点击来模拟您的注视，也就是说，您的点击代表您在图片中注视停留的地方。
                所以当出现单次点击无法覆盖整个破绽的情况时（例如，您觉得整根手指都有结构问题，但是一次点击的小圆圈无法覆盖整根手指；
                或者马匹的上下半身比例不协调，但是一次点击的小圆圈无法覆盖整个马匹的下半身），
                您无需纠结，也无需通过多次点击覆盖整个有问题的部分，只需要保证您有一次点击落在该区域即可，代表您观察了这个部分。
              </p>

              <p style={styles.text}>
                2、其次，在您点击时，只有鼠标所在的位置（即小圆圈的圆心位置）是有效的反馈。
                所以当遇到单次点击覆盖多个破绽的情况时，您不能被圆圈的范围“迷惑”，需要确保点击每一处破绽。
                例如，人脸上两只眼睛都有破绽。
                您点击其中一只，画面中出现的圆圈较大，会同时圈住另一只眼睛，但这并不代表另一只眼睛也被圈选进了有效的反馈范围，
                您仍然需要再次点击另外一只眼睛来进行反馈。
              </p>

              <p style={styles.text}>
                3、在您放大或缩小图片的过程中，圆圈的位置可能会出现“飘移”。
                此时您只需要正常观察，最后通过“Reset”按钮让小圆圈归位。
                任何圆圈位置异常的情况都可以通过“Reset”按钮解决。
              </p>
            </>
          ) : (
            <p style={styles.text}>Page {page} 内容稍后将在这里展示。</p>
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
          <img src={modalImg} style={styles.modalImage} alt="放大预览" />
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