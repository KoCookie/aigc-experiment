import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Introduction() {
  const videoRef = useRef(null)
  const navigate = useNavigate()

  const [duration, setDuration] = useState(0)
  const [current, setCurrent] = useState(0)
  const [playedToEnd, setPlayedToEnd] = useState(false)
  const [errMsg, setErrMsg] = useState('')

  // —— 页面切出时自动暂停（可选更严）
  useEffect(() => {
    const h = () => {
      if (document.visibilityState !== 'visible') {
        videoRef.current?.pause()
      }
    }
    document.addEventListener('visibilitychange', h)
    return () => document.removeEventListener('visibilitychange', h)
  }, [])

  // 如果设置了环境变量，则优先使用线上地址（例如 Supabase Storage 的 public URL）；否则回退到本地 public/intro.mp4
  const VIDEO_SRC = import.meta.env.VITE_INTRO_VIDEO_URL || '/intro.mp4'

  const handleLoaded = () => {
    setErrMsg('')
    setDuration(Math.floor(videoRef.current?.duration || 0))
    setCurrent(0)
    setPlayedToEnd(false)
  }

  const handleTimeUpdate = () => {
    const t = videoRef.current?.currentTime || 0
    setCurrent(t)
  }

  const handleEnded = () => {
    setPlayedToEnd(true)
  }

  const handleError = () => {
    setErrMsg('视频加载失败。请确认视频地址有效：若使用本地文件，请保证 /public/intro.mp4 存在且为 H.264/AAC 编码的 MP4；若使用线上链接，请检查环境变量 VITE_INTRO_VIDEO_URL 是否配置正确。')
  }

  const percent = duration ? Math.min(100, Math.floor((current / duration) * 100)) : 0

  return (
    <div style={styles.page}>
      <header style={styles.header}>Introduction</header>

      <main style={styles.centerWrap}>
        <section style={styles.card}>
          <p style={styles.text}>
            请完整观看本段引导视频以了解实验流程。你可以自由拖动进度条回看任何片段。视频结束后按钮将解锁。
          </p>

          <div style={styles.videoWrap}>
            <video
              ref={videoRef}
              src={VIDEO_SRC}
              controls
              playsInline
              preload="metadata"
              onLoadedMetadata={handleLoaded}
              onEnded={handleEnded}
              onError={handleError}
              onTimeUpdate={handleTimeUpdate}
              style={styles.video}
            />
          </div>

          {errMsg ? <div style={styles.error}>{errMsg}</div> : null}

          <button
            onClick={() => navigate('/practice')}
            disabled={!playedToEnd}
            style={{
              ...styles.button,
              backgroundColor: playedToEnd ? '#2563eb' : '#94bff7',
              cursor: playedToEnd ? 'pointer' : 'not-allowed',
            }}
          >
            {playedToEnd ? 'Start Practice' : '请先完整观看视频'}
          </button>
        </section>
      </main>
    </div>
  )
}

/* utils */
function sec(s) {
  const t = Math.floor(s || 0)
  const m = Math.floor(t / 60)
  const r = t % 60
  return `${m}:${String(r).padStart(2, '0')}`
}

/* styles */
const styles = {
  page: {
    minHeight: '100vh',
    width: '100vw',
    background: 'linear-gradient(90deg, #f8fafc, #eef2ff)',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'system-ui, sans-serif',
  },
  header: {
    background: '#1f2937',
    color: '#fff',
    padding: '16px 24px',
    fontSize: 20,
    fontWeight: 700,
  },
  centerWrap: {
    flex: 1,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 16px',
  },
  card: {
    width: '100%',
    maxWidth: 960,
    background: '#fff',
    borderRadius: 12,
    boxShadow: '0 10px 30px rgba(0,0,0,.08)',
    padding: 24,
  },
  text: { color: '#475569', marginBottom: 16 },
  videoWrap: {
    width: '100%',
    background: '#000',
    borderRadius: 8,
    overflow: 'hidden',
  },
  video: { width: '100%', height: 'auto', display: 'block' },
  button: {
    marginTop: 16,
    padding: '12px 18px',
    color: '#fff',
    fontWeight: 700,
    border: 0,
    borderRadius: 8,
    transition: '0.2s ease',
  },
  error: {
    marginTop: 8,
    color: '#b91c1c',
    background: '#fee2e2',
    padding: '8px 10px',
    borderRadius: 6,
    fontSize: 14,
  },
}