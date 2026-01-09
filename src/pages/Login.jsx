import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import supabase from '../supabaseClient'

// Simple client-side hash function (SHA-256) to generate password_hash
async function hashPassword(password) {
  const enc = new TextEncoder()
  const data = enc.encode(password)
  const digest = await window.crypto.subtle.digest('SHA-256', data)
  const bytes = Array.from(new Uint8Array(digest))
  return bytes.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Login / Sign-up page
 * - Supports creating a new account (sign up) and logging in with an existing account
 * - Each account requires a password; password hash is stored in participants.password_hash
 *
 * ⚠ Security note: this is a lightweight account system for research only,
 *   not suitable for production-grade authentication.
 */
export default function Login() {
  const navigate = useNavigate()

  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [cohort, setCohort] = useState('main')   // Batch name, customizable
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
      setErrMsg(isSignup ? 'Please enter name, email, and password' : 'Please enter email and password')
      return
    }

    // Password format check (Scheme B)
    // Requirement: at least 8 characters, includes both letters and numbers
    const pwd = cleanPassword
    if (
      pwd.length < 8 ||
      !/[A-Za-z]/.test(pwd) ||
      !/[0-9]/.test(pwd)
    ) {
      setErrMsg('Password must be at least 8 characters and include letters and numbers')
      return
    }

    setLoading(true)
    console.log('[Login] submit start', { mode, cleanName, cleanEmail })

    try {
      if (isSignup) {
        // ---------- Sign-up flow ----------
        // 1) Check if email already exists
        const { data: existing, error: queryErr } = await supabase
          .from('participants')
          .select('id')
          .eq('email', cleanEmail)
          .maybeSingle()

        if (queryErr) throw queryErr
        if (existing) {
          setErrMsg('This email is already registered. Please log in or use a different email.')
          return
        }

        // 2) Generate password hash and insert new user
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
        if (!pid) throw new Error('Failed to create participant')

        // 3) Cache locally + go to Intro (new user)
        localStorage.setItem('participant_id', String(pid))
        localStorage.setItem('participant_name', cleanName)
        localStorage.setItem('participant_email', cleanEmail)
        localStorage.setItem('participant_cohort', cleanCohort)

        console.log('[Login] sign up success, navigate to /intro', { pid })
        navigate('/intro', { replace: true })
      } else {
        // ---------- Log-in flow ----------
        // 1) Find all accounts under this email (may belong to different cohorts)
        const { data: rows, error: queryErr } = await supabase
          .from('participants')
          .select('id, name, password_hash, cohort, practice_passed')
          .eq('email', cleanEmail)

        if (queryErr) throw queryErr
        if (!rows || rows.length === 0) {
          setErrMsg('No account found for this email. Please create an account first.')
          return
        }

        // 2) Use the first record as the "base account" for password check and default name
        const base = rows[0]

        if (!base.password_hash) {
          setErrMsg('This account has no password set. Please contact the study coordinator.')
          return
        }

        const hash = await hashPassword(cleanPassword)
        if (hash !== base.password_hash) {
          setErrMsg('Incorrect password. Please try again.')
          return
        }

        // 3) Determine target cohort for this login:
        //    - If user provided cohort in the form, use it;
        //    - Otherwise fall back to existing cohort or 'test'
        const targetCohort = (cleanCohort || base.cohort || 'test').trim()

        // 4) Check for an existing (email, cohort) record
        let participant = rows.find(
          (row) => (row.cohort || '').trim() === targetCohort
        )

        // 5) Optional: if user provides a new name at login, update name for all records under this email
        const existingName = (base.name || '').trim()
        const finalName = (cleanName || existingName || '').trim()

        if (finalName && finalName !== existingName) {
          await supabase
            .from('participants')
            .update({ name: finalName })
            .eq('email', cleanEmail)
        }

        // 6) If no participants record exists for this cohort, create a new (email, cohort) record
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
          throw new Error('Login failed: could not retrieve participant info')
        }

        // 7) Cache participant info for the current cohort
        localStorage.setItem('participant_id', String(participant.id))
        localStorage.setItem('participant_name', finalName)
        localStorage.setItem('participant_email', cleanEmail)
        localStorage.setItem('participant_cohort', targetCohort)

        // 8) Decide navigation based on practice_passed for this cohort
        const practicePassed = !!participant.practice_passed

        if (practicePassed) {
          // Practice completed
          if (targetCohort === 'pilot') {
            // Pilot cohort: go directly to the Pilot pre-study page (auto-resumes unfinished items)
            navigate('/pilot', { replace: true })
          } else {
            // Other cohorts: go to main menu
            navigate('/menu', { replace: true })
          }
        } else {
          // Practice not completed: start from Introduction
          navigate('/intro', { replace: true })
        }
        return // prevent falling through
      }
    } catch (err) {
      console.error(err)
      setErrMsg(err.message || 'Operation failed. Please try again later.')
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
          {/* Name: required for sign-up, optional for login (to update display name) */}
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
