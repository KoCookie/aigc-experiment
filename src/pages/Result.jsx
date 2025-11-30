import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient';

// Small helper to read the active participant from localStorage
function useParticipant() {
  const [pid, setPid] = useState(null);
  const [pinfo, setPinfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = window.localStorage.getItem('participant_id');
    if (!id) {
      setLoading(false);
      return;
    }
    setPid(id);
    let isMounted = true;
    (async () => {
      const { data, error } = await supabase
        .from('participants')
        .select('id,name,email')
        .eq('id', id)
        .maybeSingle();
      if (isMounted) {
        if (!error) setPinfo(data);
        setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  return { pid, pinfo, loading };
}

const TOTAL_FALLBACK = 150; // default items per batch if assignment not found

export default function Result() {
  const navigate = useNavigate();
  const { pid, pinfo, loading: loadingP } = useParticipant();

  const [stats, setStats] = useState({}); // { [batch_no]: { total, completed, skipped, pending } }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!pid) {
      setLoading(false);
      return;
    }
    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: rows, error: vErr } = await supabase
          .from('v_user_batch_progress')
          .select('batch_no,total_count,completed_count,skipped_count,progress_percent,is_finished')
          .eq('user_id', pid)
          .order('batch_no', { ascending: true });
        if (vErr) throw vErr;

        const byBatch = {};
        (rows || []).forEach(r => {
          const bn = r.batch_no;
          byBatch[bn] = {
            total: r.total_count ?? TOTAL_FALLBACK,
            completed: r.completed_count ?? 0,
            skipped: r.skipped_count ?? 0,
            pending: Math.max(0, (r.total_count ?? TOTAL_FALLBACK) - ((r.completed_count ?? 0) + (r.skipped_count ?? 0))),
            progress: r.progress_percent ?? Math.round(100 * (((r.completed_count ?? 0) + (r.skipped_count ?? 0)) / Math.max(1, r.total_count ?? TOTAL_FALLBACK)))
          };
        });

        for (let b = 1; b <= 4; b++) {
          if (!byBatch[b]) byBatch[b] = { total: TOTAL_FALLBACK, completed: 0, skipped: 0, pending: TOTAL_FALLBACK, progress: 0 };
        }

        if (isMounted) setStats(byBatch);
      } catch (e) {
        console.error('[Result] load error', e);
        if (isMounted) setError(e.message || 'Load failed');
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [pid]);

  const cards = useMemo(() => {
    return [1, 2, 3, 4].map(b => ({
      batch: b,
      ...(stats[b] || { total: TOTAL_FALLBACK, completed: 0, skipped: 0, pending: TOTAL_FALLBACK, progress: 0 })
    }));
  }, [stats]);

  const goMenu = () => navigate('/menu');

  if (loading || loadingP) {
    return (
      <div className="container" style={{ padding: '32px', color: '#cbd5e1' }}>Loading summary…</div>
    );
  }

  if (!pid) {
    return (
      <div className="container" style={{ padding: '32px', color: '#cbd5e1' }}>
        <h2 style={{ marginBottom: 8 }}>No active participant</h2>
        <button onClick={() => navigate('/')} className="btn">Go to Login</button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1c' }}>
      <div className="container" style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        <header style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 24, color: '#e2e8f0', margin: 0 }}>Your Results</h1>
            <div style={{ color: '#94a3b8', marginTop: 6 }}>
              {pinfo?.name && <span style={{ marginRight: 8 }}>{pinfo.name}</span>}
              {pinfo?.email && <span>({pinfo.email})</span>}
            </div>
          </div>
        </header>

        {error && (
          <div style={{ color: '#fca5a5', marginBottom: 16 }}>Load error: {String(error)}</div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 16 }}>
          {cards.map(({ batch, total, completed, skipped, pending, progress }) => {
            const pct = Math.min(100, Math.round(typeof progress === 'number' ? progress : ((completed + skipped) / Math.max(1, total)) * 100));
            return (
              <div key={batch} style={{ border: '1px solid #23324a', borderRadius: 12, padding: 16, background: '#0f172a' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, color: '#e2e8f0' }}>Batch {batch}</h3>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>{pct}%</span>
                </div>
                <div style={{ height: 6, background: '#1f2937', borderRadius: 4, marginTop: 8, overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: '#3b82f6' }} />
                </div>
                <div style={{ marginTop: 10, fontSize: 14, color: '#94a3b8' }}>
                  <div>{completed}/{total} completed · {skipped} skipped</div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
          <button
            className="btn"
            onClick={goMenu}
            style={{
              background: '#2563eb',
              color: '#ffffff',
              border: '1px solid #1d4ed8',
              padding: '10px 16px',
              borderRadius: 8,
              fontWeight: 600
            }}
          >
            Back to Menu
          </button>
        </div>

        <section style={{ marginTop: 24, color: '#94a3b8', fontSize: 14 }}>
          <p>
            Tip: You can reopen any batch to change answers. Your latest save is what counts. When you are satisfied, you may close the tab or click <em>End Session</em>.
          </p>
        </section>
      </div>
    </div>
  );
}
