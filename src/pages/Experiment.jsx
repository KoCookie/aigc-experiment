// src/pages/Experiment.jsx (rev: batch-flow, single-button, flaws-only)
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import supabase from '../supabaseClient'

/* ---------------- Options dictionary (keep your approved structure) ---------------- */
const OVERALL_GROUPS = [
  {
    key: 'overall',
    title: 'Overall Reasons',
    items: [
      {
        key: 'style_unreal',
        label: 'Overall visual style looks unnatural',
        example: 'Oil-painting look, sketch look, strange lighting, abnormal focus, image distortion, skin overly smooth like a mannequin, unnatural animal fur, subject/background not blending with a "sticker" feel, blurred or abnormal subject edges, overly strong AI look, repeated facial expressions, stiff/blank eyes, etc.'
      },
      {
        key: 'detail_missing',
        label: 'Overall image is blurry or has severe detail loss',
        example: 'Large areas of the image are blurry/unclear and lack texture, as if "reduced sharpness", "over-smoothed", or "globally defocused". For example: many faces are blurry/odd, building details missing, landscape details missing, all text smeared together.'
      },
      {
        key: 'many_subject_abnormal',
        label: 'Many subjects are abnormal',
        example: 'Many people have abnormal limb structure/count, group interactions are uncoordinated, multiple animals have multiple heads/limbs, every hand has weird finger counts/structures, many people/animals have abnormal proportions, overall object materials/textures look unreal, etc.'
      },
      {
        key: 'many_composition_abnormal',
        label: 'Many composition issues',
        example: 'Many occlusions, abnormal perspective relationships, many limbs crossing through or broken, etc.'
      },
      {
        key: 'physics_illogical',
        label: 'Violates real-world physics',
        example: 'Most subjects are abnormal, e.g., many vehicles driving the wrong way, everyone wearing winter clothes on a beach, etc.'
      },
      {
        key: 'perspective_abnormal',
        label: 'Abnormal perspective',
        example: 'Distorted perspective, illogical distance ratios between background and subject, etc.'
      },
      {
        key: 'large_text_abnormal',
        label: 'Large-area text is abnormal',
        example: 'Large areas of text are abnormal, including wrong meaning, no logic, not a real language but garbled characters, missing text, etc.'
      },
    ]
  }
]
const FLAW_GROUPS = [
  {
    key: 'face',
    title: 'Face Issues',
    items: [
      { key: 'eye_structure', label: 'Abnormal eye structure or placement', example: 'Eyeball size, eyelid shape, eyelash shape' },
      { key: 'eye_gaze', label: 'Blank stare / unreasonable gaze direction' },
      { key: 'nose_structure', label: 'Abnormal nose structure or placement' },
      { key: 'mouth_structure', label: 'Abnormal mouth structure or placement' },
      { key: 'teeth_structure', label: 'Abnormal teeth structure or count' },
      { key: 'ear_structure', label: 'Abnormal ear structure or placement' },
      { key: 'ear_count', label: 'Abnormal ear count' },
      { key: 'eyebrow_shape', label: 'Odd eyebrow shape' },
      { key: 'feature_mismatch', label: 'Mismatched features', example: 'Male head on female body, cat with horse ears' },
      { key: 'face_repetition', label: 'Repeated faces', example: 'Different people have exactly the same face' },
      { key: 'face_structure', label: 'Overall facial structure is wrong', example: 'Misaligned facial features, deformed facial contours, etc.' },
    ],
  },
  {
    key: 'hair',
    title: 'Hair/Fur Issues',
    items: [
      { key: 'hair_shape', label: 'Abnormal hair/fur shape or texture', example: 'Discontinuous, broken, looks fractured' },
      { key: 'hair_texture', label: 'Unrealistic hair/fur material/feel' },
    ],
  },
  {
    key: 'hands',
    title: 'Hand Issues',
    items: [
      { key: 'finger_count', label: 'Abnormal finger count' },
      { key: 'hand_pose', label: 'Unnatural or impossible hand pose' },
      { key: 'nail_detail', label: 'Abnormal nail/skin detail' },
      { key: 'hand_structure', label: 'Abnormal hand structure' },
    ],
  },
  {
    key: 'body',
    title: 'Body Issues',
    items: [
      {
        key: 'body_structure',
        label: 'Abnormal body structure',
        example: 'Unreasonable joint angles, overly thick instep, deformed toes, broken bird wings, zebra stripes blurred or running the wrong way, etc.',
      },
      {
        key: 'body_part_count',
        label: 'Abnormal number of body parts',
        example: 'Humans with wrong limb count, animals with multiple heads, etc.',
      },
      {
        key: 'body_proportion',
        label: 'Unnatural body proportions',
        example: 'Neck too long / shoulders too wide or narrow / limbs too long or short / upper vs lower body proportions are off / abnormal limb thickness, etc.',
      },
    ],
  },
  {
    key: 'objects',
    title: 'Object Issues',
    items: [
      {
        key: 'object_structure',
        label: 'Abnormal object structure',
        example: 'Clothing textures abnormal or discontinuous, accessories suddenly broken/bent/twisted, ground collapses, trees snapped',
      },
      {
        key: 'object_position',
        label: 'Object appears in abnormal position',
        example: 'Earrings on hands, LEGO pieces floating',
      },
      {
        key: 'object_scale',
        label: 'Object size/scale unreasonable, unnatural, or inconsistent',
      },
      {
        key: 'object_color',
        label: 'Abnormal color distribution',
        example: 'Abrupt blocks, uneven distribution',
      },
      {
        key: 'object_material',
        label: 'Unrealistic material rendering',
        example: 'Metal reflections, glass, fabric',
      },
    ],
  },
  {
    key: 'others',
    title: 'Other Issues',
    items: [
      {
        key: 'lighting_shadow',
        label: 'Abnormal lighting/shadows',
        example: 'Weird light direction, only one bright/dark spot, unreasonable shadows, inverted/floating shadows, abnormal focus, local defocus',
      },
      {
        key: 'blur_detail',
        label: 'Parts of the image are blurry or missing detail',
        example: 'Only a local area lacks detail while the rest is clear. This is a "local issue", not a whole-image issue. For example: some text/patterns are blurry, face overall clear but eye details missing, face clear but teeth blurry, city scene clear but neon signs blurred, etc.',
      },
      {
        key: 'odd_structures',
        label: 'Abrupt or irrelevant structures appear',
      },
      {
        key: 'subject_edges',
        label: 'Abnormal subject edges',
        example: 'Blurry, blending with objects or background',
      },
      {
        key: 'physics_logic',
        label: 'Violates real-world physics',
        example: 'Some subjects are odd, e.g., one or more people wearing down coats and scarves on a beach where most people are in swimwear',
      },
      { key: 'text_abnormal', label: 'Text abnormalities', example: 'Wrong meaning, nonsensical, incomplete text, abnormal font, etc.' },
      {
        key: 'other',
        label: 'Other',
        hasTextInput: true,
      },
    ],
  },
]

/* ---------------- Utilities ---------------- */
const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
const deepClone = (o) => JSON.parse(JSON.stringify(o||{}))
const uid = () => Math.random().toString(36).slice(2,10)

/* ===================================================== */
export default function Experiment(){
  const navigate = useNavigate()
  const params = useParams()

  // Support multiple route formats: /batch/:batchNo or /batch/:id or /batch/:batch
  const rawBatch =
    params.batchNo ??
    params.id ??
    params.batch ??
    localStorage.getItem('current_batch_no') ??
    1

  const batchNo = Number(rawBatch) || 1
  const participantId = localStorage.getItem('participant_id')
  const location = useLocation()

  // Keep current_batch_no in sync with batch (restore after refresh)
  useEffect(() => {
    if (!Number.isNaN(batchNo)) {
      localStorage.setItem('current_batch_no', String(batchNo))
    }
  }, [batchNo])

  const openTips = () => {
    try {
      // Prefer SPA navigation and carry full location for Back
      navigate('/tips', { state: { from: location } });
      // Debug footprint to verify clicks are wired
      // eslint-disable-next-line no-console
      console.log('[Experiment] openTips click -> navigate("/tips")', { from: location });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('[Experiment] openTips fallback to hard redirect', err);
      window.location.href = '/tips';
    }
  };

  // --- Page state ---
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [itemIds, setItemIds] = useState([]) // Assigned image_id order
  const [images, setImages] = useState([])   // [{id, url, storage_path}]
  const [answers, setAnswers] = useState({}) // id -> {saved, skipped, no_flaw, flaws:[], overall:{selected,byGroup}, confidence, comment}
  const [idx, setIdx] = useState(0)

  // Canvas
  const containerRef = useRef(null)
  const imgRef = useRef(null)
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({x:0,y:0})
  const [panning, setPanning] = useState(false)
  const panStart = useRef({x:0,y:0}); const offsetStart = useRef({x:0,y:0}); const movedRef = useRef(false)
  const [imgRect, setImgRect] = useState(null); const [contRect, setContRect] = useState(null)

  // Draft markers and modals
  const [draftFlaw, setDraftFlaw] = useState(null)
  const [flawModalOpen, setFlawModalOpen] = useState(false)
  const [flawTemp, setFlawTemp] = useState({selected:[], byGroup:{}})

  const [overallOpen, setOverallOpen] = useState(false)
  const [overallTemp, setOverallTemp] = useState({selected:[], byGroup:{}})

  const [noFlaw, setNoFlaw] = useState(false)
  const [selectedFlawId, setSelectedFlawId] = useState(null)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [startedAt, setStartedAt] = useState(null)

  const current = images[idx]
  const total = images.length
  const completedCount = useMemo(()=>Object.values(answers).filter(a=>a?.saved && !a?.skipped).length,[answers])
  const skippedCount = useMemo(()=>Object.values(answers).filter(a=>a?.skipped).length,[answers])
  const progress = total ? Math.round((completedCount/total)*100) : 0
  const allDone = total>0 && completedCount===total

  /* ---------------- Load assigned items (by batch) ---------------- */
  useEffect(()=>{
    (async()=>{
      try{
        if(!participantId){ navigate('/',{replace:true}); return }
        setLoading(true); setError(null)

        // 1) Get item_ids for this user/batch (ordered array)
        const { data: ubaRows, error: ubaErr } = await supabase
          .from('user_batch_assignments')
          .select('item_ids')
          .eq('user_id', participantId)
          .eq('batch_no', batchNo);
        const uba = (ubaRows && ubaRows[0]) || null;
        if(ubaErr) throw ubaErr
        if(!uba?.item_ids || uba.item_ids.length===0){
          setItemIds([]); setImages([]); setLoading(false)
          return
        }
        const ids = uba.item_ids.map(Number)
        setItemIds(ids)

        // 2) Fetch image metadata (keep ids order)
        const { data: imgs, error: imgErr } = await supabase
          .from('images')
          .select('id, storage_path')
          .in('id', ids)
        if(imgErr) throw imgErr
        const map = new Map(imgs.map(r=>[Number(r.id), r]))
        const arr = ids.map((id) => {
          const rawPath = map.get(id)?.storage_path || '';
          // Keep directory structure. Only strip an occasional leading "images/" (bucket name) if it was stored by mistake.
          const relPath = String(rawPath).replace(/^images\//, '');
          const url = supabase.storage.from('images').getPublicUrl(relPath).data.publicUrl;
          return { id, storage_path: rawPath, rel_path: relPath, url };
        });
        setImages(arr);

        // 3) Load saved responses to restore progress (no_flaw / overall / flaws)
        const { data: resps, error: rErr } = await supabase
          .from('responses')
          .select('image_id, is_skip, no_flaw, reasons_overall, reasons_flaws')
          .eq('participant_id', participantId)
          .eq('is_practice', false)
          .in('image_id', ids)
        if(rErr) throw rErr

        const buildByGroupFromSelected = (selected=[])=>{
          const by = {}
          for(const code of selected){
            const [g,item] = String(code).split(':')
            if(!g || !item) continue
            if(!by[g]) by[g]=[]
            if(!by[g].includes(item)) by[g].push(item)
          }
          return by
        }

        const a = {}
        for(const r of (resps||[])){
          // Restore overall reasons
          const overallSelected = Array.isArray(r.reasons_overall) ? r.reasons_overall : []
          // Restore marker reasons, including other_text
          const flaws = Array.isArray(r.reasons_flaws)
            ? r.reasons_flaws.map(f => {
                const sel = Array.isArray(f.reasons) ? f.reasons : []
                const otherText = typeof f.other_text === 'string' ? f.other_text : ''
                return {
                  id: f.id,
                  px: f.px,
                  py: f.py,
                  r: f.r,
                  reasons: {
                    selected: sel,
                    byGroup: buildByGroupFromSelected(sel),
                    otherText,
                  },
                }
              })
            : []
          a[r.image_id] = {
            saved: !r.is_skip,
            skipped: !!r.is_skip,
            no_flaw: !!r.no_flaw,
            overall: { selected: overallSelected, byGroup: buildByGroupFromSelected(overallSelected) },
            flaws
          }
        }
        setAnswers(a)

        // 4) Starting index: first unfinished id
        let start = 0
        for(let i=0;i<ids.length;i++){ const id=ids[i]; const ans=a[id]; if(!ans?.saved) { start=i; break } }
        setIdx(start)
        setStartedAt(Date.now())
        setLoading(false)
      }catch(e){ setError(e?.message||String(e)); setLoading(false) }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[batchNo])

  // Measurement
  useEffect(()=>{
    const measure=()=>{ if(!imgRef.current||!containerRef.current) return; setImgRect(imgRef.current.getBoundingClientRect()); setContRect(containerRef.current.getBoundingClientRect()); }
    measure();
    let ro = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(measure);
      if (containerRef.current) ro.observe(containerRef.current);
    }
    window.addEventListener('resize', measure);
    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener('resize', measure);
    }
  },[])
  // After zoom/pan/switch, re-measure when layout stabilizes to avoid marker drift
  useLayoutEffect(() => {
    if (!imgRef.current || !containerRef.current) return;
    // Use rAF to ensure transform is applied
    const id = requestAnimationFrame(() => {
      const rectImg = imgRef.current.getBoundingClientRect();
      const rectCont = containerRef.current.getBoundingClientRect();
      setImgRect(rectImg);
      setContRect(rectCont);
    });
    return () => cancelAnimationFrame(id);
  }, [scale, offset, idx]);
  useEffect(()=>{ // Reset local state on item change (do not overwrite noFlaw)
    setDraftFlaw(null); setOverallTemp({selected:[],byGroup:{}})
    setStartedAt(Date.now()); setScale(1); setOffset({x:0,y:0})
    setSelectedFlawId(null);
  },[idx])

  // Sync noFlaw checkbox after switching items or refresh based on saved answers
  useEffect(()=>{
    const curId = images[idx]?.id
    if(!curId) return
    const a = answers[curId]
    setNoFlaw(!!a?.no_flaw)
  }, [idx, images, answers])

  /* ---------------- Interactions: zoom/pan/mark ---------------- */
  // Cursor-anchored zoom
  const zoom = (delta, e) => {
    e.preventDefault();
    if (!containerRef.current) {
      setScale(s => clamp(s + delta, 0.5, 5));
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;

    setScale(prevScale => {
      const oldScale = prevScale;
      const newScale = clamp(oldScale + delta, 0.5, 5);
      if (newScale === oldScale) return oldScale;

      // Adjust offset so that the point under the cursor stays under the cursor
      setOffset(prevOffset => {
        const factor = 1 / newScale - 1 / oldScale;
        return {
          x: prevOffset.x + dx * factor,
          y: prevOffset.y + dy * factor,
        };
      });

      return newScale;
    });
  };

  const onWheel = (e) => {
    const delta = e.deltaY > 0 ? -0.15 : 0.15;
    zoom(delta, e);
  };

  // Mouse down: start panning and record origin
  const onMouseDown = (e) => {
    if (e.button !== 0) return;
    const isImage =
      e.target === imgRef.current || !!e.target.closest('[data-image-overlay]');
    if (!isImage) return;

    setPanning(true);
    panStart.current = { x: e.clientX, y: e.clientY };
    offsetStart.current = { ...offset };
    movedRef.current = false;
  }

  // Mouse move: if moved beyond threshold, treat as pan
  const onMouseMove = (e) => {
    if (!panning) return;
    const dx = e.clientX - panStart.current.x;
    const dy = e.clientY - panStart.current.y;
    if (Math.hypot(dx, dy) > 3) movedRef.current = true; // Treat >3px movement as panning
    setOffset({ x: offsetStart.current.x + dx, y: offsetStart.current.y + dy });
  }

  // Mouse up: if panning with no real movement, treat as click and create draft marker
  const onMouseUp = (e) => {
    if (!panning) return;

    if (!movedRef.current && imgRef.current && contRect && imgRect) {
      const rect = imgRef.current.getBoundingClientRect();
      const x = e.clientX;
      const y = e.clientY;
      const px = clamp((x - rect.left) / rect.width, 0, 1);
      const py = clamp((y - rect.top) / rect.height, 0, 1);

      // Create draft marker to confirm
      setDraftFlaw({ px, py, r: 0.04 });
      // Deselect current ring to avoid confusion
      setSelectedFlawId(null);
    }

    setPanning(false);
  }

  const onMouseLeave = () => setPanning(false)

  const confirmDraftPosition=()=>{ setFlawTemp({selected:[],byGroup:{}}); setFlawModalOpen(true) }
  const cancelDraft=()=> setDraftFlaw(null)
  const commitFlaw=()=>{ 
    if(!current||!draftFlaw) return; 
    const id=draftFlaw.fromId||uid(); 
    setAnswers(prev=>{ 
      const cur=prev[current.id]||{}; 
      const flaws=[...(cur.flaws||[])]; 
      if(draftFlaw.fromId){ 
        const i=flaws.findIndex(f=>f.id===draftFlaw.fromId); 
        if(i>=0) flaws[i]={...flaws[i], px:draftFlaw.px, py:draftFlaw.py, r:draftFlaw.r, reasons:deepClone(flawTemp)} 
      } else { 
        flaws.push({ id, px:draftFlaw.px, py:draftFlaw.py, r:draftFlaw.r, reasons:deepClone(flawTemp) }) 
      } 
      return { ...prev, [current.id]: { ...cur, flaws } }
    });
    setDraftFlaw(null);
    setFlawModalOpen(false)
  }

  // When "No obvious flaws" is checked, clear current overall/detail reasons and sync to answers to prevent checkbox reset
  const toggleNoFlaw = (checked) => {
    setNoFlaw(checked);
    if (!current) return;

    // Close/cancel any active marker or modal
    if (checked) {
      setDraftFlaw(null);
      setSelectedFlawId(null);
      setFlawModalOpen(false);
      setOverallOpen(false);
    }

    // Sync to local answers so dependent useEffect does not flip it back to false
    setAnswers(prev => {
      const cur = prev[current.id] || {};
      const next = { ...cur, no_flaw: checked };
      if (checked) {
        // Clear overall and detail reasons when checked
        next.overall = { selected: [], byGroup: {} };
        next.flaws = [];
      }
      return { ...prev, [current.id]: next };
    });
  };
  /* ---------------- Save/skip ---------------- */
  const canSave = useMemo(()=>{
    if(noFlaw) return true
    const cur = answers[current?.id]
    const hasOverall = !!(cur?.overall?.selected?.length)
    const hasFlaws = (cur?.flaws||[]).length>0
    return hasOverall || hasFlaws
  },[answers, current, noFlaw])

  const handleSave = async()=>{
    if(!current || !participantId) return
    if(!canSave){ alert('Please provide at least one reason (overall or a marker), or check "No obvious flaws".'); return }
    try{
      const cur = answers[current.id] || {}
      const duration_ms = startedAt ? (Date.now()-startedAt) : null
      const payload = {
        participant_id: participantId,
        image_id: Number(current.id),
        is_practice: false,
        is_skip: false,
        no_flaw: !!noFlaw,
        reasons_overall: cur.overall?.selected || [],
        reasons_flaws: (cur.flaws || []).map(f => ({
          id: f.id,
          px: f.px,
          py: f.py,
          r: f.r,
          reasons: f.reasons?.selected || [],
          other_text: f.reasons?.otherText || '',
        })),
        duration_ms
      }
      // Use UPSERT; fall back to manual update/insert if no unique index exists
      let upsertErr=null
      try{
        const { error } = await supabase
          .from('responses')
          .upsert(payload, { onConflict:'participant_id,image_id,is_practice' })
          .select('id')
          .single()
        if(error) upsertErr=error
      }catch(e){ upsertErr=e }
      if(upsertErr){
        const { data: existRows, error: findErr } = await supabase
          .from('responses').select('id')
          .eq('participant_id', participantId)
          .eq('image_id', Number(current.id))
          .eq('is_practice', false)
          .limit(1);
        const exist = (existRows && existRows[0]) || null;
        if(findErr && findErr.code!=='PGRST116') throw findErr
        if(exist?.id){
          const { error: updErr } = await supabase.from('responses').update(payload).eq('id', exist.id).select('id')
          if(updErr) throw updErr
        }else{
          const { error: insErr } = await supabase.from('responses').insert(payload).select('id').single()
          if(insErr) throw insErr
        }
      }
      // Local state: move to next item
      setAnswers(prev=>{ const updated={...prev, [current.id]:{ ...(prev[current.id]||{}), saved:true, skipped:false, no_flaw: !!noFlaw }}; const next=findNext(idx, itemIds, updated); if(next!=null) setIdx(next); return updated })
    }catch(e){ console.error('[save error]',e); alert('Save failed: '+(e?.message||String(e))) }
  }
  const handleSkip = async()=>{
    if(!current || !participantId) return
    try{
      const payload = { participant_id: participantId, image_id:Number(current.id), is_practice:false, is_skip:true }
      let upsertErr=null
      try{ const { error } = await supabase.from('responses').upsert(payload,{ onConflict:'participant_id,image_id,is_practice' }).select('id').single(); if(error) upsertErr=error }catch(e){ upsertErr=e }
      if(upsertErr){
        const { data: existRows } = await supabase
          .from('responses')
          .select('id')
          .eq('participant_id', participantId)
          .eq('image_id', Number(current.id))
          .eq('is_practice', false)
          .limit(1);
        const exist = (existRows && existRows[0]) || null;
        if (exist?.id) {
          await supabase.from('responses').update(payload).eq('id', exist.id).select('id');
        } else {
          await supabase.from('responses').insert(payload).select('id').single();
        }
      }
      setAnswers(prev=>{ const updated={...prev, [current.id]:{ ...(prev[current.id]||{}), saved:false, skipped:true }}; const next=findNext(idx, itemIds, updated, true); if(next!=null) setIdx(next); return updated })
    }catch(e){ console.error('[skip error]',e); alert('Skip failed: '+(e?.message||String(e))) }
  }

  function findNext(curIdx, ids, ans, includeSkipped=false){
    // Find the first unsaved item in order (optionally include skipped)
    for(let i=curIdx+1;i<ids.length;i++){ const id=ids[i]; const a=ans[id]; if(!a?.saved && (includeSkipped || !a?.skipped)) return i }
    for(let i=0;i<=curIdx;i++){ const id=ids[i]; const a=ans[id]; if(!a?.saved && (includeSkipped || !a?.skipped)) return i }
    return null
  }

  /* ---------------- Render ---------------- */
  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>Batch {batchNo}</div>
        <div style={{display:'flex', alignItems:'center', gap:12}}>
          <ProgressBar percent={progress} />
          <span style={{color:'#cbd5e1'}}>{completedCount}/{total} · {skippedCount} skipped</span>
          <button
            type="button"
            onClick={openTips}
            style={{ ...styles.smallBtn, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
            title="View tips and FAQs (Tips)"
            aria-label="Open tips"
            data-testid="open-tips-button"
          >
            Tips
          </button>
          <button style={styles.smallBtn} onClick={()=>setReviewOpen(true)}>Review</button>
          <button style={styles.smallBtn} onClick={()=>navigate(`/result?batch=${batchNo}`)}>Exit</button>
          <button style={{...styles.primaryBtn, opacity: allDone?1:.5}} disabled={!allDone} onClick={()=>navigate('/menu')}>Finish Batch</button>
        </div>
      </header>

      <main style={styles.centerWrap}>
        <section style={styles.card}>
          {loading && <div style={{padding:40, textAlign:'center'}}>Loading…</div>}
          {error && <div style={errBox}>Load failed: {String(error)}</div>}

          {!loading && !error && total===0 && (
            <div style={{padding:40, textAlign:'center', color:'#94a3b8'}}>
              No assignment found for this batch. Please return to the menu.
            </div>
          )}

          {!loading && !error && total>0 && current && (
            <>
              <div style={styles.metaRow}>
                <button style={styles.navBtn} disabled={idx===0} onClick={()=>setIdx(i=>Math.max(0,i-1))}>◀ Prev</button>
                <div style={{fontWeight:700}}>Item {idx+1} / {total}</div>
                <button style={styles.navBtn} disabled={idx===total-1} onClick={()=>setIdx(i=>Math.min(total-1,i+1))}>Next ▶</button>
              </div>

              {/* Left: viewer */}
              <div style={viewer.wrap}>
                <div
                  ref={containerRef}
                  style={viewer.container}
                  onWheel={onWheel}
                  onMouseDown={onMouseDown}
                  onMouseMove={onMouseMove}
                  onMouseUp={onMouseUp}
                  onMouseLeave={onMouseLeave}
                >
                  <img
                    ref={imgRef}
                    src={current.url}
                    alt={current.id}
                    draggable={false}
                    onError={(e)=>{
                      try{
                        // Try one-time fallback: remove "-<id>" right before the extension and retry
                        const rp = current.rel_path || '';
                        const suffix = `-${current.id}`;
                        if (rp.includes(suffix)){
                          const altRel = rp.replace(new RegExp(`-${current.id}(?=\\.[A-Za-z0-9]+$)`), '');
                          if (altRel && altRel !== rp){
                            const altUrl = supabase.storage.from('images').getPublicUrl(altRel).data.publicUrl;
                            // Prevent infinite loop by removing handler before swap
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = altUrl;
                          }
                        }
                      }catch(err){ /* noop */ }
                    }}
                    style={{
                      ...viewer.image,
                      transform: `translate3d(${offset.x}px,${offset.y}px,0) scale(${scale})`,
                      cursor: panning ? 'grabbing' : 'crosshair'
                    }}
                  />
                  <div style={viewer.overlay} data-image-overlay />

                  {(answers[current.id]?.flaws || []).map(f => {
                    const isSel = selectedFlawId === f.id;
                    const style = ringStyle(
                      f,
                      imgRect,
                      contRect,
                      isSel ? HIGHLIGHT_RED : HIGHLIGHT_YELLOW,
                      isSel ? HIGHLIGHT_RED_FILL : HIGHLIGHT_YELLOW_FILL_SOFT
                    );
                    return <div key={f.id} style={style} title="flaw" />;
                  })}
                  {draftFlaw && (
                    <div
                      style={ringStyle(
                        draftFlaw,
                        imgRect,
                        contRect,
                        HIGHLIGHT_YELLOW,
                        HIGHLIGHT_YELLOW_FILL
                      )}
                    />
                  )}

                  {/* Hint stays in container without overlapping toolbar */}
                  <div style={viewer.hint}>Scroll to zoom, drag to pan; click to add a marker, confirm position, then choose reasons</div>
                </div>
                {/* Toolbar moved below container, left aligned, horizontal, no overlap */}
                <div style={viewer.toolbarRow}>
                  <button aria-label="Zoom in" style={viewer.fab} onClick={()=>setScale(s=>clamp(s+0.15,0.5,5))}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <circle cx="11" cy="11" r="7" stroke="#e2e8f0" strokeWidth="2"/>
                      <line x1="21" y1="21" x2="17" y2="17" stroke="#e2e8f0" strokeWidth="2"/>
                      <line x1="11" y1="8" x2="11" y2="14" stroke="#e2e8f0" strokeWidth="2"/>
                      <line x1="8" y1="11" x2="14" y2="11" stroke="#e2e8f0" strokeWidth="2"/>
                    </svg>
                  </button>
                  <button aria-label="Zoom out" style={viewer.fab} onClick={()=>setScale(s=>clamp(s-0.15,0.5,5))}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <circle cx="11" cy="11" r="7" stroke="#e2e8f0" strokeWidth="2"/>
                      <line x1="21" y1="21" x2="17" y2="17" stroke="#e2e8f0" strokeWidth="2"/>
                      <line x1="8" y1="11" x2="14" y2="11" stroke="#e2e8f0" strokeWidth="2"/>
                    </svg>
                  </button>
                  <button aria-label="Reset view" style={viewer.fab} onClick={()=>{setScale(1); setOffset({x:0,y:0})}}>Reset</button>
                </div>
              </div>

              {/* Right: form panel */}
              <div style={panel.panel}>
                {/* Top: no obvious flaws */}
                <div style={panel.stickyTop}>
                  <label style={{display:'flex', alignItems:'center', gap:8}}>
                    <input type="checkbox" checked={noFlaw} onChange={e=>toggleNoFlaw(e.target.checked)} /> No obvious flaws (0 points, 0 reasons allowed)
                  </label>
                </div>

                {/* Overall section (switch Add vs Edit+Clear based on existing data) */}
                <div style={panel.row}>
                  <div style={panel.head}>Overall reasons</div>
                  <div style={{display:'flex', gap:8}}>
                    {(() => {
                      const curOverall = answers[current.id]?.overall || { selected:[], byGroup:{} }
                      const hasOverall = (curOverall.selected?.length || 0) > 0
                      if (!hasOverall) {
                        return (
                          <button
                            style={styles.smallBtn}
                            onClick={() => { setOverallTemp({ selected:[], byGroup:{} }); setOverallOpen(true) }}
                          >
                            Add
                          </button>
                        )
                      }
                      return (
                        <>
                          <button
                            style={styles.smallBtn}
                            onClick={() => { setOverallTemp(deepClone(curOverall)); setOverallOpen(true) }}
                          >
                            Edit
                          </button>
                          <button
                            style={styles.smallBtn}
                            onClick={() => setAnswers(prev => ({
                              ...prev,
                              [current.id]: { ...(prev[current.id] || {}), overall: { selected:[], byGroup:{} } }
                            }))}
                          >
                            Clear
                          </button>
                        </>
                      )
                    })()}
                  </div>
                </div>
                <div style={panel.note}>{(answers[current.id]?.overall?.selected?.length||0)} items</div>

                {/* Flaws list */}
                {(answers[current.id]?.flaws||[]).map((f,i)=> (
                  <div key={f.id} style={panel.item}>
                    <div style={{fontWeight:700}}>Flaw #{i+1}</div>
                    <div style={{display:'flex', gap:8}}>
                      <button style={styles.smallBtn} onClick={()=> setSelectedFlawId(f.id)}>{selectedFlawId===f.id? 'Selected' : 'Select'}</button>
                      <button style={styles.smallBtn} onClick={()=>{ setFlawTemp(deepClone(f.reasons||{selected:[],byGroup:{}})); setDraftFlaw({px:f.px,py:f.py,r:f.r, fromId:f.id}); setFlawModalOpen(true) }}>Edit</button>
                      <button style={styles.smallBtn} onClick={()=> setAnswers(prev=>{ const cur=prev[current.id]||{}; const nextFlaws=(cur.flaws||[]).filter(x=>x.id!==f.id); if(selectedFlawId===f.id) setSelectedFlawId(null); return { ...prev, [current.id]: { ...cur, flaws: nextFlaws } } }) }>Delete</button>
                    </div>
                  </div>
                ))}

                {/* Draft notice */}
                {draftFlaw && (
                  <div style={{...panel.item, borderStyle:'dashed'}}>
                    <div>Click position pending confirmation</div>
                    <div style={{display:'flex', gap:8}}>
                      <button style={styles.smallBtn} onClick={confirmDraftPosition}>Confirm</button>
                      <button style={styles.smallBtn} onClick={()=>{ setDraftFlaw(null) }}>Cancel</button>
                    </div>
                  </div>
                )}

                {/* Spacer before bottom actions */}
                <div style={{flex:1}} />

                {/* Bottom actions */}
                <div style={panel.stickyBottom}>
                  <button style={styles.secondaryBtn} onClick={handleSkip}>Skip</button>
                  <button style={{...styles.primaryBtn, opacity:canSave?1:.5}} disabled={!canSave} onClick={handleSave}>Save & Next</button>
                </div>
              </div>
            </>
          )}
        </section>
      </main>

      {/* Overall modal */}
      {overallOpen && current && (
        <OverallModal temp={overallTemp} setTemp={setOverallTemp} onClose={()=>setOverallOpen(false)} onConfirm={()=>{ setAnswers(prev=>({ ...prev, [current.id]:{ ...(prev[current.id]||{}), overall: deepClone(overallTemp) } })); setOverallOpen(false) }} />
      )}

      {/* Flaw modal */}
      {flawModalOpen && current && (
        <FlawReasonsModal temp={flawTemp} setTemp={setFlawTemp} onClose={()=>setFlawModalOpen(false)} onConfirm={commitFlaw} />
      )}

      {reviewOpen && (
        <ReviewModal
          itemIds={itemIds}
          answers={answers}
          currentIndex={idx}
          onJump={(i)=>{ setIdx(i); setReviewOpen(false) }}
          onClose={()=>setReviewOpen(false)}
        />
      )}
    </div>
  )
}

/* ---------------- Small components ---------------- */
// Reusable draggable modal logic (kept in sync with Practice page)
function useDraggableModal() {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef({ dragging: false, lastX: 0, lastY: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!dragRef.current.dragging) return;
      const dx = e.clientX - dragRef.current.lastX;
      const dy = e.clientY - dragRef.current.lastY;
      dragRef.current.lastX = e.clientX;
      dragRef.current.lastY = e.clientY;
      setOffset((prev) => ({
        x: prev.x + dx,
        y: prev.y + dy,
      }));
    };

    const handleMouseUp = () => {
      if (dragRef.current.dragging) {
        dragRef.current.dragging = false;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleDragMouseDown = (e) => {
    const target = e.target;
    // If clicking on an interactive element (checkbox, button, input, etc.), do not start drag
    if (
      target &&
      typeof target.closest === 'function' &&
      target.closest('input, textarea, button, label, select')
    ) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    dragRef.current.dragging = true;
    dragRef.current.lastX = e.clientX;
    dragRef.current.lastY = e.clientY;
  };

  return { offset, handleDragMouseDown };
}
function ProgressBar({percent}){ return (<div style={{width:160,height:10,background:'#0b1220',borderRadius:999,overflow:'hidden'}}><div style={{width:`${percent}%`,height:'100%',background:'#22c55e'}} /></div>) }

function OverallModal({ temp, setTemp, onClose, onConfirm }) {
  const { offset, handleDragMouseDown } = useDraggableModal();
  const toggle = (g, item) => {
    setTemp(prev => {
      const set = new Set(prev.selected || []);
      const code = `${g}:${item.key}`;
      set.has(code) ? set.delete(code) : set.add(code);
      const by = { ...(prev.byGroup || {}) };
      const s = new Set(by[g] || []);
      s.has(item.key) ? s.delete(item.key) : s.add(item.key);
      by[g] = Array.from(s);
      return { selected: Array.from(set), byGroup: by }
    })
  }
  const count = temp?.selected?.length || 0
  return (
    <div style={modal.backdrop} onClick={onClose}>
      <div
        style={{ ...modal.box, transform: `translate(${offset.x}px, ${offset.y}px)` }}
        onClick={e => e.stopPropagation()}
        onMouseDown={handleDragMouseDown}
      >
        <div style={modal.title}>Overall Reasons (multiple select)</div>
        <div style={{ maxHeight: '60vh', overflow: 'auto', paddingRight: 6 }}>
          {OVERALL_GROUPS.map(g => (
            <div key={g.key} style={{ marginBottom: 12 }}>
              <div style={{ fontWeight: 800, marginBottom: 6 }}>{g.title}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {g.items.map(it => {
                  const code = `${g.key}:${it.key}`;
                  const active = temp?.selected?.includes(code);
                  return (
                    <label
                      key={it.key}
                      style={{
                        border: active ? '2px solid #2563eb' : '1px solid #475569',
                        borderRadius: 8,
                        padding: '8px 10px',
                        cursor: 'pointer',
                        background: active ? '#0b1220' : '#111827',
                        color: '#e2e8f0',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <input
                          type="checkbox"
                          checked={active}
                          onChange={() => toggle(g.key, it)}
                          style={{ marginRight: 8 }}
                        />
                        <div>{it.label}</div>
                      </div>
                      {it.example && (
                        <div style={{ fontSize: 12, marginTop: 2, color: '#cbd5e1', width: '100%' }}>
                          ({it.example})
                        </div>
                      )}
                    </label>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
          <button style={styles.smallBtn} onClick={onClose}>Cancel</button>
          <button style={{ ...styles.primaryBtn, opacity: count ? 1 : .5 }} disabled={!count} onClick={onConfirm}>Confirm ({count})</button>
        </div>
      </div>
    </div>
  )
}

function FlawReasonsModal({ temp, setTemp, onClose, onConfirm }){
  const { offset, handleDragMouseDown } = useDraggableModal();
  const [openGroups, setOpenGroups] = useState(() => {
    const init = {}
    FLAW_GROUPS.forEach(g => { init[g.key] = false })
    return init
  })

  const toggle=(g,item)=>{
    setTemp(prev=>{
      const set = new Set(prev.selected || [])
      const code = `${g}:${item.key}`
      set.has(code) ? set.delete(code) : set.add(code)

      const by = { ...(prev.byGroup || {}) }
      const s = new Set(by[g] || [])
      s.has(item.key) ? s.delete(item.key) : s.add(item.key)
      by[g] = Array.from(s)

      return {
        selected: Array.from(set),
        byGroup: by,
        otherText: prev.otherText || '',
      }
    })
  }

  const toggleGroupOpen = (gKey) => {
    setOpenGroups(prev => ({ ...prev, [gKey]: !prev[gKey] }))
  }

  const count = temp?.selected?.length || 0
  const otherText = temp?.otherText || ''

  return (
    <div style={modal.backdrop} onClick={onClose}>
      <div
        style={{ ...modal.box, width: 'min(95vw,940px)', transform: `translate(${offset.x}px, ${offset.y}px)` }}
        onClick={e=>e.stopPropagation()}
        onMouseDown={handleDragMouseDown}
      >
        <div style={modal.title}>Flaw Reasons (multiple select)</div>
        <div style={{maxHeight:'60vh',overflow:'auto',paddingRight:6}}>
          {FLAW_GROUPS.map(g=> {
            const open = openGroups[g.key]
            return (
              <div key={g.key} style={{marginBottom:12}}>
                <button
                  type="button"
                  onClick={()=>toggleGroupOpen(g.key)}
                  style={{
                    width:'100%',
                    display:'flex',
                    alignItems:'center',
                    justifyContent:'flex-start',
                    gap:6,
                    background:'transparent',
                    border:'none',
                    color:'#e2e8f0',
                    cursor:'pointer',
                    padding:'4px 0',
                    fontWeight:800,
                  }}
                >
                  <span style={{width:16}}>{open ? '▼' : '▶'}</span>
                  <span>{g.title}</span>
                </button>
                {open && (
                  <div style={{display:'flex',flexDirection:'column',gap:8,marginTop:4}}>
                    {g.items.map(it=>{
                      const code=`${g.key}:${it.key}`
                      const active=temp?.selected?.includes(code)
                      return (
                        <label
                          key={it.key}
                          style={{
                            border:active?'2px solid #2563eb':'1px solid #475569',
                            borderRadius:8,
                            padding:'8px 10px',
                            cursor:'pointer',
                            background:active?'#0b1220':'#111827',
                            color:'#e2e8f0',
                            display:'flex',
                            flexDirection:'column',
                            alignItems:'flex-start',
                          }}
                        >
                          <div style={{display:'flex',alignItems:'center'}}>
                            <input
                              type="checkbox"
                              checked={active}
                              onChange={()=>toggle(g.key,it)}
                              style={{marginRight:8}}
                            />
                            <div>{it.label}</div>
                          </div>
                          {it.example && (
                            <div style={{ fontSize: 12, marginTop: 2, color: '#cbd5e1', width: '100%' }}>
                              ({it.example})
                            </div>
                          )}
                          {it.hasTextInput && active && (
                            <textarea
                              rows={3}
                              placeholder="Please briefly describe the other issue..."
                              value={otherText}
                              onChange={e =>
                                setTemp(prev => ({
                                  ...prev,
                                  otherText: e.target.value || '',
                                }))
                              }
                              style={{
                                marginTop: 6,
                                width: '100%',
                                fontSize: 12,
                                padding: '6px 8px',
                                borderRadius: 6,
                                border: '1px solid #475569',
                                background: '#020617',
                                color: '#e2e8f0',
                                resize: 'vertical',
                              }}
                            />
                          )}
                        </label>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
        <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:12}}>
          <button style={styles.smallBtn} onClick={onClose}>Cancel</button>
          <button style={{...styles.primaryBtn, opacity:count?1:.5}} disabled={!count} onClick={onConfirm}>Confirm ({count})</button>
        </div>
      </div>
    </div>
  )
}

/* ---------------- Styles ---------------- */
const HIGHLIGHT_YELLOW = '#fff200'; // Bright Word-like yellow
const HIGHLIGHT_YELLOW_FILL = 'rgba(255, 242, 0, 0.6)'; // stronger fill for draft
const HIGHLIGHT_YELLOW_FILL_SOFT = 'rgba(255, 242, 0, 0.4)'; // softer fill for saved rings

const HIGHLIGHT_RED = '#ff0000'; // Word-like red highlight
const HIGHLIGHT_RED_FILL = 'rgba(255, 0, 0, 0.55)';
const styles={
  page:{ minHeight:'100vh', width:'100vw', background:'linear-gradient(90deg,#0b1220,#0f172a)', display:'flex', flexDirection:'column', color:'#e2e8f0' },
  header:{ background:'#0b1220', color:'#e2e8f0', padding:'12px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', fontWeight:800 },
  centerWrap:{ flex:1, width:'100%', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px 16px' },
  card:{ width:'100%', maxWidth:1200, background:'#0f172a', borderRadius:12, boxShadow:'0 10px 30px rgba(0,0,0,.35)', padding:16, display:'grid', gridTemplateColumns:'1fr 380px', gap:16 },
  metaRow:{ gridColumn:'1 / -1', display:'flex', alignItems:'center', justifyContent:'space-between', color:'#cbd5e1', marginBottom:4 },
  instructionBox:{ gridColumn:'1 / -1', background:'#0b1220', border:'1px solid #22304a', borderRadius:8, padding:'10px 12px', color:'#cbd5e1', margin:'6px 0 8px' },
  navBtn:{ padding:'6px 10px', borderRadius:8, border:'1px solid #334155', background:'#111827', color:'#e2e8f0', cursor:'pointer' },
  secondaryBtn:{ padding:'10px 16px', borderRadius:8, border:'1px solid #64748b', background:'#0b1220', color:'#e2e8f0', cursor:'pointer' },
  primaryBtn:{ padding:'10px 16px', borderRadius:8, border:'none', background:'#2563eb', color:'#fff', fontWeight:800, cursor:'pointer' },
  smallBtn:{ padding:'6px 10px', borderRadius:6, border:'1px solid #475569', background:'#111827', color:'#e2e8f0', cursor:'pointer' }
}
const viewer={
  wrap:{ display:'flex', flexDirection:'column', alignItems:'flex-start' },
  container:{ position:'relative', width:'100%', height:'min(70vh,720px)', background:'#111827', borderRadius:8, overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', userSelect:'none' },
  image:{ maxWidth:'100%', maxHeight:'100%', willChange:'transform', transition:'transform 60ms linear' },
  overlay:{ position:'absolute', inset:0 },
  fab:{ padding:'8px 10px', borderRadius:8, border:'1px solid #475569', background:'#0b1220cc', color:'#e2e8f0', cursor:'pointer', fontWeight:800, minWidth:56 },
  toolbarRow:{ display:'flex', gap:8, marginTop:8 },
  hint:{ position:'absolute', left:12, bottom:12, color:'#cbd5e1', background:'#0b1220cc', padding:'6px 8px', borderRadius:6, fontSize:12 }
}
const panel={
  panel:{ background:'#0b1220', border:'1px solid #22304a', borderRadius:8, padding:12, display:'flex', flexDirection:'column', height:'min(70vh,720px)', overflow:'auto', position:'relative' },
  row:{ display:'flex', alignItems:'center', justifyContent:'space-between' },
  head:{ fontWeight:800, color:'#cbd5e1' },
  note:{ fontSize:12, color:'#9ca3af', marginTop:4 },
  item:{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'#0f172a', border:'1px solid #334155', borderRadius:8, padding:'8px 10px', marginTop:6 },
  stickyTop:{ position:'sticky', top:0, background:'#0b1220', paddingBottom:8, marginBottom:8, zIndex:1, borderBottom:'1px solid #22304a' },
  stickyBottom:{ position:'sticky', bottom:0, display:'flex', justifyContent:'space-between', gap:12, paddingTop:10, marginTop:12, background:'#0b1220', zIndex:1, borderTop:'1px solid #22304a' }
}
const modal={
  backdrop:{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 },
  box:{ width:'min(95vw, 920px)', background:'#0f172a', color:'#e2e8f0', borderRadius:12, padding:16, boxShadow:'0 10px 30px rgba(0,0,0,.5)' },
  title:{ fontWeight:800, marginBottom:12 }
}
const errBox={ margin:'12px 0', padding:'10px 12px', border:'1px solid #ef4444', background:'rgba(239,68,68,.12)', color:'#fecaca', borderRadius:8 }

function ringStyle(f, imgRect, contRect, stroke = '#ef4444', fill = 'transparent') {
  if (!imgRect || !contRect) return { display: 'none' };
  const cx = imgRect.left - contRect.left + f.px * imgRect.width;
  const cy = imgRect.top - contRect.top + f.py * imgRect.height;
  const rPx = (f.r || 0.04) * Math.min(imgRect.width, imgRect.height);

  return {
    position: 'absolute',
    left: cx - rPx,
    top: cy - rPx,
    width: rPx * 2,
    height: rPx * 2,
    borderRadius: '50%',
    border: `2px solid ${stroke}`,
    background: fill,
    pointerEvents: 'none',
    boxShadow: `0 0 12px ${stroke}AA`, // slight glow for highlighter effect
  };
}
function ReviewModal({ itemIds, answers, currentIndex, onJump, onClose }) {
  const getStatus = (i) => {
    if (i === currentIndex) return 'current'
    const id = itemIds[i]
    const a = answers[id]
    if (a?.saved && !a?.skipped) return 'done'
    return 'todo' // Unfinished or skipped
  }
  const colorFor = (s) => s==='done' ? '#22c55e' : s==='current' ? '#f59e0b' : '#ef4444'
  const boxStyle = (s) => ({
    width: 28, height: 28, borderRadius: 6,
    display:'flex', alignItems:'center', justifyContent:'center',
    border: `1px solid ${colorFor(s)}`, color: colorFor(s), background: 'transparent',
    cursor:'pointer', fontWeight:700
  })
  return (
    <div style={modal.backdrop} onClick={onClose}>
      <div style={{...modal.box, width:'min(95vw, 720px)'}} onClick={e=>e.stopPropagation()}>
        <div style={modal.title}>Review</div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(28px, 1fr))', gap:8, maxHeight:'50vh', overflow:'auto', padding:'8px 0'}}>
          {itemIds.map((_, i) => {
            const s = getStatus(i)
            return (
              <button key={i} style={boxStyle(s)} onClick={()=>onJump(i)} title={`Go to ${i+1}`}>
                {i+1}
              </button>
            )
          })}
        </div>
        <div style={{display:'flex', gap:12, justifyContent:'flex-end', marginTop:12}}>
          <div style={{display:'flex', alignItems:'center', gap:6, color:'#e2e8f0'}}>
            <span style={{width:12,height:12,background:'#22c55e',borderRadius:2}}></span> Done
          </div>
          <div style={{display:'flex', alignItems:'center', gap:6, color:'#e2e8f0'}}>
            <span style={{width:12,height:12,background:'#ef4444',borderRadius:2}}></span> Todo/Skipped
          </div>
          <div style={{display:'flex', alignItems:'center', gap:6, color:'#e2e8f0'}}>
            <span style={{width:12,height:12,background:'#f59e0b',borderRadius:2}}></span> Current
          </div>
          <button style={styles.smallBtn} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}
