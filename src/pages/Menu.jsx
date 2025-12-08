import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import supabase from '../supabaseClient'

// 用于生成“乱且固定”的全局随机顺序（所有参与者一致）
const hashStringToSeed = (str) => {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) | 0
  }
  return h >>> 0
}

const mulberry32 = (a) => {
  return function () {
    let t = (a += 0x6D2B79F5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const cardStyle = {
  border: '1px solid #22304a',
  borderRadius: 12,
  padding: 16,
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  width: 280,
  background: '#0b1220',
  boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
  color: '#e2e8f0'
}

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  gap: 16,
  width: '100%',
  maxWidth: 1200,
  margin: '0 auto'
}

const pageStyle = {
  minHeight: '100vh',
  background: '#0a0f1a',
  padding: '40px 24px',
  color: '#e2e8f0'
}

const h1Style = { fontSize: 24, fontWeight: 700, marginBottom: 16 }
const subStyle = { color: '#94a3b8', marginBottom: 24 }
const btnStyle = (primary = false) => ({
  padding: '10px 14px',
  borderRadius: 8,
  border: primary ? 'none' : '1px solid #475569',
  background: primary ? '#2563eb' : 'transparent',
  color: '#e2e8f0',
  cursor: 'pointer',
  fontWeight: 600
})

function ProgressBar({ percent }) {
  const safe = Math.max(0, Math.min(100, Number(percent) || 0))
  return (
    <div style={{ width: '100%', height: 10, background: '#1f2a44', borderRadius: 6 }}>
      <div style={{ width: `${safe}%`, height: '100%', background: '#22c55e', borderRadius: 6 }} />
    </div>
  )
}

export default function Menu() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [progress, setProgress] = useState([])

  const userId = useMemo(() => localStorage.getItem('participant_id') || localStorage.getItem('participantId') || '', [])

  useEffect(() => {
    (async () => {
      try {
        if (!userId) {
          setLoading(false);
          setErr('No participant session found. Please log in again.');
          return;
        }
        setErr('');

        // --- Fast path: use server-side progress view if available ---
        try {
          const { data: pv, error: pvErr } = await supabase
            .from('v_user_batch_progress')
            .select('batch_no, total_count, completed_count, skipped_count, is_finished')
            .eq('user_id', userId)
            .order('batch_no', { ascending: true });

          if (!pvErr && Array.isArray(pv) && pv.length) {
            const aggFromView = pv.map(r => ({
              batch_no: Number(r.batch_no),
              total_count: Number(r.total_count || 0),
              completed_count: Number(r.completed_count || 0),
              skipped_count: Number(r.skipped_count || 0),
              progress_percent: (Number(r.total_count) > 0)
                ? Math.round(((Number(r.completed_count) + Number(r.skipped_count)) / Number(r.total_count)) * 100)
                : 0,
              is_finished: Boolean(r.is_finished)
            }));
            setProgress(aggFromView);
            setLoading(false);
            return; // short-circuit: we trust the view
          }
        } catch (e) {
          console.warn('[Menu] v_user_batch_progress not available, falling back:', e?.message || e);
        }

        // 2) Pull batch assignments (authoritative "ground truth" of which items belong to each batch)
        let { data: assigns, error: aErr } = await supabase
          .from('user_batch_assignments')
          .select('batch_no, item_ids')
          .eq('user_id', userId)
          .order('batch_no', { ascending: true });
        if (aErr) throw aErr;

        // If this user has no batch assignments yet, create a “乱且固定”的 4-batch 分配
        if (!assigns || !assigns.length) {
          // 1）取出所有正式实验图片（不包含 practice / pilot）
          const { data: imgRows, error: imgErr } = await supabase
            .from('images')
            .select('id')
            .eq('is_practice', false)
            .eq('is_pilot', false);

          if (imgErr) throw imgErr;
          if (!imgRows || imgRows.length === 0) {
            throw new Error('No experiment images found for batch assignment');
          }

          // 2）按 id 排序，保证基础顺序稳定
          const baseIds = imgRows
            .map(r => Number(r.id))
            .sort((a, b) => a - b);

          // 3）使用“按用户固定”的伪随机数，对所有 image_id 做一次洗牌
          //    —— 不同参与者使用不同的种子，因此每个人的顺序都不一样，
          //    —— 同一个参与者多次进入时顺序保持稳定
          const seedStr = `experiment-per-user-seed-2025-12-08-${userId}`;
          const seed = hashStringToSeed(seedStr);
          const rng = mulberry32(seed);
          // 使用 Fisher–Yates 洗牌算法生成 per-user 随机顺序
          const shuffled = [...baseIds];
          for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(rng() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
          }

          // 4）将洗牌后的列表平均切成 4 个 batch（顺序固定）
          const BATCH_COUNT = 4;
          const perBatch = Math.ceil(shuffled.length / BATCH_COUNT);
          const payloads = [];

          for (let b = 1; b <= BATCH_COUNT; b++) {
            const start = (b - 1) * perBatch;
            const end = b * perBatch;
            const slice = shuffled.slice(start, end);
            if (!slice.length) continue;
            payloads.push({
              user_id: userId,
              batch_no: b,
              item_ids: slice,
            });
          }

          if (payloads.length) {
            const { error: insErr } = await supabase
              .from('user_batch_assignments')
              .insert(payloads);

            // In dev/StrictMode, the effect may run twice and race,
            // causing a harmless "duplicate key" error. We silently
            // ignore that specific case but surface other errors.
            if (insErr) {
              const msg = String(insErr.message || '');
              if (!msg.includes('duplicate key value violates unique constraint')) {
                throw insErr;
              }
            }
          }

          // 更新 assigns，后续逻辑统一使用
          assigns = payloads;
        }

        const batches = (assigns || []).map(r => ({
          batch_no: Number(r.batch_no),
          item_ids: Array.isArray(r.item_ids) ? r.item_ids.map(Number) : []
        }));

        // No assignments -> nothing to show
        if (!batches.length) {
          setProgress([]);
          setLoading(false);
          return;
        }

        // 3) Read per-item status with robust fallbacks (schema-tolerant)
        const allIds = batches.flatMap(b => b.item_ids);
        let completedById = new Set();
        let skippedById = new Set();

        if (allIds.length) {
          // Helper: try multiple filter-column candidates safely
          const tryFetch = async (table, selectCols, filterColCandidates) => {
            for (const col of filterColCandidates) {
              try {
                const { data, error } = await supabase
                  .from(table)
                  .select(selectCols)
                  .eq(col, userId)
                  .in('image_id', allIds);
                if (!error && Array.isArray(data)) {
                  return { data };
                }
              } catch (e) {
                // continue trying next candidate
              }
            }
            return { data: null };
          };

          // --- Prefer normalized user_item_status if available ---
          // Try several likely column names to identify the user
          let usedNormalized = false;
          try {
            const { data: st } = await tryFetch(
              'user_item_status',
              // keep the projection minimal & safe
              'image_id, status',
              ['user_id', 'participant_id', 'pid']
            );
            if (Array.isArray(st)) {
              usedNormalized = true;
              for (const row of st) {
                const iid = Number(row.image_id);
                const s = (row.status || '').toLowerCase();
                if (s === 'completed' || s === 'done') completedById.add(iid);
                if (s === 'skipped' || s === 'skip') skippedById.add(iid);
              }
            }
          } catch (_) {
            // fall through to responses
          }

          // --- Fallback: use responses table (older / varied schemas) ---
          if (!usedNormalized) {
            // We select '*' to avoid errors on non-existent columns
            // and then detect the right fields dynamically.
            const { data: respsA } = await (async () => {
              // try participant_id
              const a = await supabase
                .from('responses')
                .select('*')
                .eq('participant_id', userId)
                .eq('is_practice', false)
                .in('image_id', allIds);
              if (!a.error && Array.isArray(a.data)) return a;

              // try user_id
              const b = await supabase
                .from('responses')
                .select('*')
                .eq('user_id', userId)
                .eq('is_practice', false)
                .in('image_id', allIds);
              if (!b.error && Array.isArray(b.data)) return b;

              // last try: no user filter (rare), filter client-side
              const c = await supabase
                .from('responses')
                .select('*')
                .eq('is_practice', false)
                .in('image_id', allIds);
              return c;
            })();

            if (Array.isArray(respsA)) {
              for (const r of respsA) {
                // accept multiple possible flags/fields
                const iid = Number(r.image_id);
                const s = (r.status || '').toLowerCase();

                const skipFlag =
                  r.is_skip === true ||
                  r.skip === true ||
                  r.skipped === true ||
                  s === 'skipped' ||
                  s === 'skip';

                if (skipFlag) {
                  skippedById.add(iid);
                } else {
                  completedById.add(iid);
                }
              }
            }
          }
        }

        // 4) Aggregate progress per batch based on sets
        const agg = batches.map(b => {
          const total = b.item_ids.length;
          let completed = 0, skipped = 0;
          for (const id of b.item_ids) {
            if (completedById.has(id)) completed++;
            else if (skippedById.has(id)) skipped++;
          }
          const answered = completed + skipped;
          const percent = total > 0 ? Math.round((answered / total) * 100) : 0;
          const is_finished = total > 0 && answered >= total;
          return {
            batch_no: b.batch_no,
            total_count: total,
            completed_count: completed,
            skipped_count: skipped,
            progress_percent: percent,
            is_finished
          };
        });

        setProgress(agg);
      } catch (e) {
        console.error(e);
        setErr(e.message || 'Failed to load progress');
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  const getBatch = (no) => progress.find(p => Number(p.batch_no) === Number(no)) || {
    batch_no: no,
    total_count: 0,
    completed_count: 0,
    skipped_count: 0,
    progress_percent: 0,
    is_finished: false
  }

  const handleEnter = async (batchNo) => {
    try {
      setErr('');
      // Normalize localStorage keys so route guards see them
      if (userId) {
        localStorage.setItem('participant_id', userId);
      }
      const pid = localStorage.getItem('participant_id');
      if (!pid) {
        setErr('Session missing. Please log in again.');
        navigate('/');
        return;
      }
      const b = getBatch(batchNo);
      if (b.is_finished) {
        // If a batch is fully answered, send to result page so they can decide next.
        navigate(`/result?batch=${batchNo}`);
      } else {
        navigate(`/batch/${batchNo}`);
      }
    } catch (e) {
      console.error(e);
      setErr(e.message || 'Failed to enter batch');
    }
  };

  const renderCard = (no) => {
    const b = getBatch(no)
    const isNotStarted = (Number(b.completed_count) + Number(b.skipped_count)) === 0
    const isFinished = Boolean(b.is_finished)

    return (
      <div key={no} style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 700 }}>Batch {no}</div>
          <div style={{ fontVariantNumeric: 'tabular-nums' }}>{Number(b.progress_percent || 0)}%</div>
        </div>
        <ProgressBar percent={b.progress_percent} />
        <div style={{ color: '#94a3b8', fontSize: 14 }}>
          {Number(b.completed_count)}/{Number(b.total_count)} completed · {Number(b.skipped_count)} skipped
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button
            style={btnStyle(true)}
            onClick={() => handleEnter(no)}
            disabled={loading}
          >
            {isFinished ? 'Review' : (isNotStarted ? 'Start' : 'Continue')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={pageStyle}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h1 style={h1Style}>Your Experiment Progress</h1>
        <div style={subStyle}>Welcome back! Using the same name and email lets you resume where you left off. Each batch supports mid-session exit and per-item Skip.</div>
        {err && (
          <div style={{ background: '#3f1d1d', color: '#fecaca', padding: 12, borderRadius: 8, marginBottom: 16 }}>{err}</div>
        )}
        {loading ? (
          <div>Loading…</div>
        ) : (
          <div style={gridStyle}>
            {renderCard(1)}
            {renderCard(2)}
            {renderCard(3)}
            {renderCard(4)}
          </div>
        )}
      </div>
    </div>
  )
}