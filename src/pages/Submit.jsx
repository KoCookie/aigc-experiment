// src/pages/Submit.jsx
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import supabase from '../supabaseClient'

export default function Submit() {
  const navigate = useNavigate()
  const participantId = String(localStorage.getItem('participant_id') || '').trim()
  const groupKey = localStorage.getItem('participant_group') || 'GroupA'

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [rows, setRows] = useState([]) // [{id, storage_path, url, status}] // status: 'done' | 'skip' | 'todo'

  useEffect(() => {
    (async () => {
      try {
        if (!participantId) {
          navigate('/', { replace: true })
          return
        }
        setLoading(true); setError(null)

        // 1) Fetch all non-practice experiment images
        const { data: allExp, error: imgErr } = await supabase
          .from('images')
          .select('id, storage_path, is_practice')
          .eq('is_practice', false)
          .order('id', { ascending: true })
        if (imgErr) throw imgErr

        // Only keep images for the current group (aligned with Experiment.jsx filtering)
        const prefixes = [
          `test/Experiment/${groupKey}/`,
          `Experiment/${groupKey}/`,
          `test/${groupKey}/`,
          `${groupKey}/`,
        ]
        const imgs = (allExp || []).filter(r => prefixes.some(p => r.storage_path?.startsWith(p)))

        // 2) Load this participant's responses (main items only)
        const ids = imgs.map(x => String(x.id))
        let doneSet = new Set()
        let skipSet = new Set()
        if (ids.length > 0) {
          // For schema compatibility, select('*') and determine status client-side:
          // "Completed" = not marked skipped AND has answer/overall-style fields
          const { data: resp, error: rErr } = await supabase
            .from('responses')
            .select('*')
            .eq('participant_id', participantId)
            .eq('is_practice', false)
            .in('image_id', ids)
          if (rErr) throw rErr

          for (const r of resp || []) {
            // robustly detect "skip"
            const skipped = (r?.is_skipped === true) || (r?.skip === true);
            // robustly detect "answered"
            const answered =
              (r?.answer !== null && r?.answer !== undefined) ||
              (r?.overall !== null && r?.overall !== undefined) ||
              (r?.is_real !== null && r?.is_real !== undefined) ||
              (r?.label !== null && r?.label !== undefined) ||
              (r?.result !== null && r?.result !== undefined);
            if (skipped) {
              skipSet.add(String(r.image_id));
            } else if (answered) {
              doneSet.add(String(r.image_id));
            }
          }
        }

        // 3) Assemble data for rendering
        const list = imgs.map(img => {
          const idStr = String(img.id);
          const status = skipSet.has(idStr) ? 'skip' : (doneSet.has(idStr) ? 'done' : 'todo');
          return {
            id: img.id,
            storage_path: img.storage_path,
            url: supabase.storage.from('images').getPublicUrl(img.storage_path).data.publicUrl,
            status,
          }
        })
        list.sort((a,b) => a.id - b.id)

        setRows(list)
        setLoading(false)
      } catch (e) {
        console.error('[Submit load error]', e)
        setError(e?.message || String(e))
        setLoading(false)
      }
    })()
  }, [participantId, groupKey, navigate])

  const total = rows.length
  const doneCnt = useMemo(() => rows.filter(r => r.status === 'done').length, [rows])
  const allDone = total > 0 && doneCnt === total

  const gotoItem = (imageId) => {
    // Return to experiment to continue: set resume flag + target item id
    localStorage.setItem('experiment_resume', '1')
    localStorage.setItem('experiment_jump_id', String(imageId))
    navigate('/experiment')
  }

  const backToExperiment = () => {
    // Return to experiment: jump to first unfinished item; if all done, go to first
    const firstTodo = rows.find(r => r.status !== 'done')
    const targetId = firstTodo ? firstTodo.id : (rows[0]?.id ?? null)

    localStorage.setItem('experiment_resume', '1')
    if (targetId != null) {
      localStorage.setItem('experiment_jump_id', String(targetId))
    } else {
      localStorage.removeItem('experiment_jump_id')
    }
    navigate('/experiment')
  }

  const handleSubmit = async () => {
    // Clear helper flags before submit to avoid unintended resume mode
    localStorage.removeItem('experiment_resume')
    localStorage.removeItem('experiment_jump_id')

    if (!allDone) {
      alert('There are unfinished items. Please complete all items before submitting.')
      return
    }
    navigate('/thanks')
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>Final Check &amp; Submit</div>
        <div style={{display:'flex', alignItems:'center', gap:8}}>
          <span style={{color:'#cbd5e1'}}>Progress: {doneCnt} / {total}</span>
          <span style={{
            padding:'2px 8px', borderRadius:999,
            background: allDone ? '#16a34a' : '#4b5563',
            color:'#fff', fontSize:12
          }}>{allDone ? 'Completed' : 'Incomplete'}</span>
        </div>
      </header>

      <main style={styles.centerWrap}>
        <section style={styles.card}>
          {loading && <div style={{padding:24, textAlign:'center'}}>Loading…</div>}
          {error && (
            <div style={{margin:'12px 0', padding:'10px 12px', border:'1px solid #ef4444', background:'rgba(239,68,68,.12)', color:'#fecaca', borderRadius:8}}>
              Load failed: {String(error)}
            </div>
          )}
          {!loading && !error && total === 0 && (
            <div style={{padding:24, color:'#94a3b8'}}>No experiment images found for this group.</div>
          )}

          {!loading && !error && total > 0 && (
            <div style={{display:'flex', flexDirection:'column', gap:10}}>
              {rows.map(item => (
                <div key={item.id} style={styles.row}>
                  <div style={{flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                    {item.storage_path}
                  </div>
                  <div style={{width:70, textAlign:'center'}}>
                    <span style={{
                      display:'inline-block', minWidth:48, padding:'2px 8px',
                      borderRadius:999, fontSize:12,
                      background: item.status === 'done' ? '#16a34a22' : (item.status === 'skip' ? '#f59e0b22' : '#ef444422'),
                      color: item.status === 'done' ? '#16a34a' : (item.status === 'skip' ? '#f59e0b' : '#ef4444'),
                      border:`1px solid ${item.status === 'done' ? '#16a34a66' : (item.status === 'skip' ? '#f59e0b66' : '#ef444466')}`
                    }}>
                      {item.status === 'done' ? 'Done' : (item.status === 'skip' ? 'Skip' : 'Todo')}
                    </span>
                  </div>
                  <div style={{display:'flex', gap:8}}>
                    {item.status === 'done'
                      ? <button style={styles.smallBtn} onClick={() => gotoItem(item.id)}>View</button>
                      : <button style={styles.smallBtn} onClick={() => gotoItem(item.id)}>Complete</button>
                    }
                  </div>
                </div>
              ))}

              <div style={{display:'flex', justifyContent:'space-between', marginTop:8}}>
                <button style={styles.secondaryBtn} onClick={backToExperiment}>Back to continue</button>
                <button
                  style={{...styles.primaryBtn, opacity: allDone ? 1 : .6, cursor: allDone ? 'pointer' : 'not-allowed'}}
                  disabled={!allDone}
                  onClick={handleSubmit}
                >
                  Submit
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

const styles = {
  page:{ minHeight:'100vh', width:'100vw', background:'linear-gradient(90deg,#0b1220,#0f172a)', display:'flex', flexDirection:'column', color:'#e2e8f0' },
  header:{ background:'#0b1220', color:'#e2e8f0', padding:'12px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', fontWeight:800 },
  centerWrap:{ flex:1, width:'100%', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px 16px' },
  card:{ width:'100%', maxWidth:1100, background:'#0f172a', borderRadius:12, boxShadow:'0 10px 30px rgba(0,0,0,.35)', padding:16 },
  row:{
    display:'flex', alignItems:'center', gap:12,
    background:'#0b1220', border:'1px solid #22304a', borderRadius:8, padding:'10px 12px'
  },
  smallBtn:{ padding:'6px 10px', borderRadius:6, border:'1px solid #475569', background:'#111827', color:'#e2e8f0', cursor:'pointer' },
  secondaryBtn:{ padding:'10px 16px', borderRadius:8, border:'1px solid #64748b', background:'#0b1220', color:'#e2e8f0', cursor:'pointer' },
  primaryBtn:{ padding:'10px 16px', borderRadius:8, border:'none', background:'#2563eb', color:'#fff', fontWeight:800, cursor:'pointer' },
}
