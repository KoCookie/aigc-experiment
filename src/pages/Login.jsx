import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import supabase from '../supabaseClient'

// 简单的前端哈希函数（SHA-256），用于生成 password_hash
async function hashPassword(password) {
  const enc = new TextEncoder()
  const data = enc.encode(password)
  const digest = await window.crypto.subtle.digest('SHA-256', data)
  const bytes = Array.from(new Uint8Array(digest))
  return bytes.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Login / Sign-up page
 * - 支持创建新账号（Sign up）与已有账号登录（Log in）
 * - 每个账号需要设置密码；密码哈希存入 participants.password_hash
 *
 * ⚠ 安全提示：这只是一个科研实验用的简易账号系统，
 *   不适合作为真正的生产级用户认证方案。
 */
export default function Login() {
  const navigate = useNavigate()

  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [cohort, setCohort] = useState('main')   // 批次名，可自定义
  const [loading, setLoading] = useState(false)
  const [errMsg, setErrMsg] = useState('')

  const isSignup = mode === 'signup'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrMsg('')

    const cleanName = name.trim()
    const cleanEmail = email.trim()
    const cleanCohort = cohort.trim()
    const cleanPassword = password.trim()

    if (!cleanEmail || !cleanPassword || (isSignup && !cleanName)) {
      setErrMsg(isSignup ? '请填写姓名、邮箱和密码' : '请填写邮箱和密码')
      return
    }

    // 密码格式校验：方案 B
    // 要求：至少 8 位，且同时包含字母和数字
    const pwd = cleanPassword
    if (
      pwd.length < 8 ||
      !/[A-Za-z]/.test(pwd) ||
      !/[0-9]/.test(pwd)
    ) {
      setErrMsg('密码至少 8 位，并包含字母和数字')
      return
    }

    setLoading(true)
    console.log('[Login] submit start', { mode, cleanName, cleanEmail })

    try {
      if (isSignup) {
        // ---------- 注册逻辑 ----------
        // 1) 检查 email 是否已存在
        const { data: existing, error: queryErr } = await supabase
          .from('participants')
          .select('id')
          .eq('email', cleanEmail)
          .maybeSingle()

        if (queryErr) throw queryErr
        if (existing) {
          setErrMsg('该邮箱已注册，请直接登录或更换邮箱')
          return
        }

        // 2) 生成密码哈希并插入新用户
        const passwordHash = await hashPassword(cleanPassword)

        const { data: inserted, error: insertErr } = await supabase
          .from('participants')
          .insert({
            name: cleanName,
            email: cleanEmail,
            cohort: cleanCohort,
            password_hash: passwordHash,
          })
          .select('id')
          .single()

        if (insertErr) throw insertErr
        const pid = inserted?.id
        if (!pid) throw new Error('创建参与者失败')

        // 3) 本地缓存 + 跳转 Intro（新用户）
        localStorage.setItem('participant_id', String(pid))
        localStorage.setItem('participant_name', cleanName)
        localStorage.setItem('participant_email', cleanEmail)
        localStorage.setItem('participant_cohort', cleanCohort)

        console.log('[Login] sign up success, navigate to /intro', { pid })
        navigate('/intro', { replace: true })
      } else {
        // ---------- 登录逻辑 ----------
        // 1) 根据 email 查找该邮箱下的所有账号记录（可能属于不同 cohort）
        const { data: rows, error: queryErr } = await supabase
          .from('participants')
          .select('id, name, password_hash, cohort, practice_passed')
          .eq('email', cleanEmail)

        if (queryErr) throw queryErr
        if (!rows || rows.length === 0) {
          setErrMsg('未找到该邮箱的账号，请先创建账号')
          return
        }

        // 2) 使用第一条记录作为“基准账号”，用于密码校验与默认姓名
        const base = rows[0]

        if (!base.password_hash) {
          setErrMsg('该账号尚未设置密码，请联系实验组织者')
          return
        }

        const hash = await hashPassword(cleanPassword)
        if (hash !== base.password_hash) {
          setErrMsg('密码错误，请重试')
          return
        }

        // 3) 确定本次登录的目标 cohort：
        //    - 如果用户在表单中填写了 cohort，则以该值为准；
        //    - 否则退回到已有记录中的 cohort 或 'test'
        const targetCohort = (cleanCohort || base.cohort || 'test').trim()

        // 4) 在已有记录中查找是否已经存在相同 (email, cohort) 组合
        let participant = rows.find(
          (row) => (row.cohort || '').trim() === targetCohort
        )

        // 5) 可选：如果用户在登录时提供了新姓名，则更新该邮箱下所有记录的姓名
        const existingName = (base.name || '').trim()
        const finalName = (cleanName || existingName || '').trim()

        if (finalName && finalName !== existingName) {
          await supabase
            .from('participants')
            .update({ name: finalName })
            .eq('email', cleanEmail)
        }

        // 6) 如果不存在该 cohort 对应的 participants 记录，则为该 (email, cohort) 创建一条新记录
        if (!participant) {
          const { data: inserted, error: insertErr } = await supabase
            .from('participants')
            .insert({
              name: finalName,
              email: cleanEmail,
              cohort: targetCohort,
              password_hash: base.password_hash,
            })
            .select('id, name, cohort, practice_passed')
            .single()

          if (insertErr) throw insertErr
          participant = inserted
        }

        if (!participant) {
          throw new Error('登录失败：未能获取参与者信息')
        }

        // 7) 本地缓存当前 cohort 对应的 participant 信息
        localStorage.setItem('participant_id', String(participant.id))
        localStorage.setItem('participant_name', finalName)
        localStorage.setItem('participant_email', cleanEmail)
        localStorage.setItem('participant_cohort', targetCohort)

        // 8) 根据该 cohort 下的 practice_passed 决定跳转逻辑
        const practicePassed = !!participant.practice_passed

        if (practicePassed) {
          // 已完成所有练习题
          if (targetCohort === 'pilot') {
            // pilot 批次：直接进入 Pilot 预实验页面（会自动恢复未完成题目）
            navigate('/pilot', { replace: true })
          } else {
            // 其他批次：进入正式实验菜单
            navigate('/menu', { replace: true })
          }
        } else {
          // 未完成练习题：先从 Introduction 开始
          navigate('/intro', { replace: true })
        }
        return // prevent falling through
      }
    } catch (err) {
      console.error(err)
      setErrMsg(err.message || '操作失败，请稍后再试')
    } finally {
      setLoading(false)
    }
  }

  const toggleMode = () => {
    setMode(isSignup ? 'login' : 'signup')
    setErrMsg('')
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Welcome to the Experiment</h1>
        <p style={styles.desc}>
          {isSignup
            ? 'Create your account with name, email, and password. You can use the same account later to resume your progress.'
            : 'Enter your email and password to log in. Use the same account to resume your previous progress.'}
        </p>

        <form onSubmit={handleSubmit} noValidate style={styles.form}>
          {/* 姓名：仅在注册时必填，但登录时也允许填写（用于更新显示名） */}
          <input
            style={styles.input}
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            style={styles.input}
            type="email"
            placeholder="Your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            style={styles.input}
            type="text"
            placeholder="Batch / Cohort (e.g. pilot)"
            value={cohort}
            onChange={(e) => setCohort(e.target.value)}
          />

          {errMsg && <div style={styles.error}>{errMsg}</div>}

          <button
            type="submit"
            data-testid="login-submit"
            style={styles.button}
            disabled={loading}
          >
            {loading ? 'Submitting…' : isSignup ? 'Create Account' : 'Login'}
          </button>
        </form>

        <div style={styles.switchRow}>
          {isSignup ? 'Already have an account?' : "Don't have an account yet?"}{' '}
          <button type="button" onClick={toggleMode} style={styles.switchBtn}>
            {isSignup ? 'Log in' : 'Create account'}
          </button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0b1220',
    color: '#fff',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 520,
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 24,
    boxShadow: '0 8px 30px rgba(0,0,0,0.35)',
  },
  title: {
    margin: '0 0 8px 0',
    fontSize: 24,
    fontWeight: 700,
  },
  desc: {
    margin: '0 0 20px 0',
    opacity: 0.85,
    fontSize: 14,
    lineHeight: 1.6,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  input: {
    width: '100%',
    height: 44,
    padding: '0 12px',
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.18)',
    background: 'rgba(255,255,255,0.06)',
    color: '#fff',
    fontSize: 14,
  },
  error: {
    color: '#ffb4b4',
    background: 'rgba(255,80,80,.1)',
    border: '1px solid rgba(255,80,80,.25)',
    padding: '10px 12px',
    borderRadius: 8,
    fontSize: 14,
  },
  button: {
    width: '100%',
    height: 46,
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.2)',
    background: '#3153e0',
    color: '#fff',
    fontWeight: 700,
    fontSize: 15,
    cursor: 'pointer',
  },
  switchRow: {
    marginTop: 16,
    fontSize: 13,
    opacity: 0.9,
  },
  switchBtn: {
    background: 'none',
    border: 'none',
    color: '#7fa3ff',
    cursor: 'pointer',
    padding: 0,
    marginLeft: 4,
    fontSize: 13,
    textDecoration: 'underline',
  },
}