// src/pages/Experiment.jsx (rev: batch-flow, single-button, flaws-only)
import { useEffect, useLayoutEffect, useMemo, useRef, useState, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import supabase from '../supabaseClient'

/* ---------------- 选项字典（保留你已定稿的结构） ---------------- */
const OVERALL_GROUPS = [
  {
    key: 'overall',
    title: '整体理由 (Overall Reasons)',
    items: [
      {
        key: 'style_unreal',
        label: '整体画面风格不自然',
        example: '油画风、素描风、光线怪异、聚焦异常、画面失真、人物皮肤过于光滑如同假人、动物毛发不自然、主体与背景不融合有“贴图感”、主体边缘模糊或异常、AI感过重、人物表情重复、眼神僵硬空洞等'
      },
      {
        key: 'detail_missing',
        label: '整体画面模糊或细节缺失严重',
        example: '整张图片的大面积细节都模糊、不清晰、缺乏纹理，仿佛被“降清晰度”“过度磨皮”或“整体虚焦”处理过。如，大量人物面部模糊怪异、大量建筑细节缺失、大量自然风景细节缺失、所有文字糊成一团等'
      },
      {
        key: 'many_subject_abnormal',
        label: '大量主体异常',
        example: '多个人的肢体结构或数量异常、多人互动动作不协调、多个动物有多头或多肢体、每一只手的手指数量和手部结构都怪异、画面中多个人或动物的身材比例异常、物品的整体材质或纹理不真实等'
      },
      {
        key: 'many_composition_abnormal',
        label: '大量组合异常',
        example: '画面中大量遮挡、透视关系异常、大量肢体横穿或断裂等'
      },
      {
        key: 'physics_illogical',
        label: '不符合现实世界物理逻辑',
        example: '大部分主体都出现异常，如，大量车辆在道路逆行、所有人都在沙滩上着冬装等'
      },
      {
        key: 'perspective_abnormal',
        label: '画面透视异常',
        example: '透视关系失真、背景与主体距离比例不合逻辑等'
      },
      {
        key: 'large_text_abnormal',
        label: '大片文字异常',
        example: '图片中大面积文字出现异常，包括表意错误、没有逻辑、不是正常语言的文字而是混乱的字符、缺失等'
      },
    ]
  }
]
const FLAW_GROUPS = [
  {
    key: 'face',
    title: '面部问题',
    items: [
      { key: 'eye_structure', label: '眼部结构或位置异常', example: '眼球大小、双眼皮形状、睫毛形状' },
      { key: 'eye_gaze', label: '眼神空洞/注视方向不合理' },
      { key: 'nose_structure', label: '鼻子结构或位置异常' },
      { key: 'mouth_structure', label: '嘴部结构或位置异常' },
      { key: 'teeth_structure', label: '牙齿结构或数量异常' },
      { key: 'ear_structure', label: '耳朵结构或位置异常' },
      { key: 'ear_count', label: '耳朵数量异常' },
      { key: 'eyebrow_shape', label: '眉毛形状怪异' },
      { key: 'feature_mismatch', label: '特征不符', example: '男头女体、猫长出了马的耳朵' },
      { key: 'face_repetition', label: '面部重复', example: '图片中不同人的面部完全一样' },
      { key: 'face_structure', label: '面部整体结构有问题', example: '五官整体位置不协调、面部轮廓畸形等' },
    ],
  },
  {
    key: 'hair',
    title: '毛发问题',
    items: [
      { key: 'hair_shape', label: '头发或毛发形状/纹理异常', example: '不连续、断裂、有断裂感' },
      { key: 'hair_texture', label: '头发或毛发质感不真实' },
    ],
  },
  {
    key: 'hands',
    title: '手部问题',
    items: [
      { key: 'finger_count', label: '手指数量异常' },
      { key: 'hand_pose', label: '手部姿势不自然或不可能' },
      { key: 'nail_detail', label: '指甲/皮纹细节异常' },
      { key: 'hand_structure', label: '手部结构异常' },
    ],
  },
  {
    key: 'body',
    title: '身体问题',
    items: [
      {
        key: 'body_structure',
        label: '身体结构异常',
        example: '关节角度不合理、足背过厚、脚趾形状畸形、鸟类翅膀断裂、斑马身体花纹模糊或走向异常等',
      },
      {
        key: 'body_part_count',
        label: '身体部位数量异常',
        example: '人类肢体数量异常、动物出现多个头部等',
      },
      {
        key: 'body_proportion',
        label: '身体比例不自然',
        example: '脖子过长/肩膀过宽或过窄/四肢过长或过短/上下半身比例失调/四肢粗细异常等',
      },
    ],
  },
  {
    key: 'objects',
    title: '物体问题',
    items: [
      {
        key: 'object_structure',
        label: '物体结构异常',
        example: '衣物纹理异常或不连续、饰品突然断裂、弯曲、扭曲、地面塌陷、树木折断',
      },
      {
        key: 'object_position',
        label: '物体出现位置异常',
        example: '耳饰戴在手上、乐高积木悬空',
      },
      {
        key: 'object_scale',
        label: '物体大小/比例不合理、不自然、不协调',
      },
      {
        key: 'object_color',
        label: '颜色分布异常',
        example: '色块突变、不均匀',
      },
      {
        key: 'object_material',
        label: '材质表现不真实',
        example: '金属反射、玻璃、布料',
      },
    ],
  },
  {
    key: 'others',
    title: '其他问题',
    items: [
      {
        key: 'lighting_shadow',
        label: '光照/阴影异常',
        example: '光线方向奇怪、仅一处亮/暗、阴影不合理、反向或漂浮阴影、聚焦异常、局部虚焦',
      },
      {
        key: 'blur_detail',
        label: '部分画面模糊或细节缺失',
        example: '只有某一个局部区域缺乏细节，而其他区域正常清晰。属于“局部问题”，不是整张图的问题。如，部分文字/图案模糊不清、面部整体清晰但眼部细节缺失、面部整体清晰但牙齿模糊不清、城市场景其余部分清晰但霓虹灯模糊一片等',
      },
      {
        key: 'odd_structures',
        label: '出现突兀、不相关的结构',
      },
      {
        key: 'subject_edges',
        label: '主体边缘异常',
        example: '模糊、与物品或背景融合',
      },
      {
        key: 'physics_logic',
        label: '不符合现实世界物理逻辑',
        example: '部分主体出现怪异情况，如在大部分人都着泳装的沙滩边有一个或几个人穿羽绒服戴围巾',
      },
      { key: 'text_abnormal', label: '文字异常', example: '文字表意错误、毫无逻辑、文字显示不完整、字体异常等' },
      {
        key: 'other',
        label: '其他',
        hasTextInput: true,
      },
    ],
  },
]

/* ---------------- 工具 ---------------- */
const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
const deepClone = (o) => JSON.parse(JSON.stringify(o||{}))
const uid = () => Math.random().toString(36).slice(2,10)

// 标准答案的参与者 ID
const GOLD_PARTICIPANT_ID = '625198e2-aaca-4522-8121-2b0d468422ca' // 标准答案使用的参与者 ID（practice_tracher）

// 将 selected codes 转为分组结构
const buildByGroupFromSelected = (selected = []) => {
  const by = {}
  for (const code of selected || []) {
    const [g, item] = String(code).split(':')
    if (!g || !item) continue
    if (!by[g]) by[g] = []
    if (!by[g].includes(item)) by[g].push(item)
  }
  return by
}

/* ===================================================== */
export default function Practice(){
  const navigate = useNavigate()
  const participantId = localStorage.getItem('participant_id')
  const location = useLocation()
  const participantCohort = localStorage.getItem('participant_cohort') || 'default'

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

  // --- 页面状态 ---
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [itemIds, setItemIds] = useState([]) // 分配的 image_id 顺序
  const [images, setImages] = useState([])   // [{id, url, storage_path}]
  const [answers, setAnswers] = useState({}) // id -> {saved, skipped, no_flaw, flaws:[], overall:{selected,byGroup}, confidence, comment}
  const [idx, setIdx] = useState(0)

  // 画布
  const containerRef = useRef(null)
  const imgRef = useRef(null)
  const updateRects = useCallback(() => {
    if (!imgRef.current || !containerRef.current) return
    const rectImg = imgRef.current.getBoundingClientRect()
    const rectCont = containerRef.current.getBoundingClientRect()
    setImgRect(rectImg)
    setContRect(rectCont)
  }, [])
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({x:0,y:0})
  const [panning, setPanning] = useState(false)
  const panStart = useRef({x:0,y:0}); const offsetStart = useRef({x:0,y:0}); const movedRef = useRef(false)
  const [imgRect, setImgRect] = useState(null); const [contRect, setContRect] = useState(null)

  // 圈点草稿 & 弹窗
  const [draftFlaw, setDraftFlaw] = useState(null)
  const [flawModalOpen, setFlawModalOpen] = useState(false)
  const [flawTemp, setFlawTemp] = useState({selected:[], byGroup:{}})

  const [overallOpen, setOverallOpen] = useState(false)
  const [overallTemp, setOverallTemp] = useState({selected:[], byGroup:{}})

  const [noFlaw, setNoFlaw] = useState(false)
  const [selectedFlawId, setSelectedFlawId] = useState(null)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [doneOpen, setDoneOpen] = useState(false)   // 练习完成弹窗
  const [viewMode, setViewMode] = useState('answer') // 'answer' | 'standard' | 'mine'
  const [startedAt, setStartedAt] = useState(null)

  const [goldAnswers, setGoldAnswers] = useState({}) // 标准答案：image_id -> { no_flaw, overall, flaws }

  const current = images[idx]
  const total = images.length
  const completedCount = useMemo(()=>Object.values(answers).filter(a=>a?.saved && !a?.skipped).length,[answers])
  const skippedCount = useMemo(()=>Object.values(answers).filter(a=>a?.skipped).length,[answers])
  const progress = total ? Math.round((completedCount/total)*100) : 0
  const allDone = total>0 && completedCount===total

  /* ---------------- 加载练习题目（is_practice = true） ---------------- */
  useEffect(() => {
    (async () => {
      try {
        if (!participantId) { navigate('/', { replace: true }); return }
        setLoading(true)
        setError(null)

        // 1) 拉取所有练习图片（is_practice = true）
        const { data: imgs, error: imgErr } = await supabase
          .from('images')
          .select('id, storage_path')
          .eq('is_practice', true)
          .order('id', { ascending: true })
        if (imgErr) throw imgErr

        const ids = (imgs || []).map(row => Number(row.id))
        setItemIds(ids)

        const arr = (imgs || []).map(row => {
          const rawPath = row.storage_path || ''
          const relPath = String(rawPath).replace(/^images\//, '')
          const url = supabase.storage.from('images').getPublicUrl(relPath).data.publicUrl
          return { id: Number(row.id), storage_path: rawPath, rel_path: relPath, url }
        })
        setImages(arr)

        // 2a) 读取已作答记录（responses），仅限 practice = true
        const { data: resps, error: rErr } = await supabase
          .from('responses')
          .select('image_id, is_skip, no_flaw, reasons_overall, reasons_flaws')
          .eq('participant_id', participantId)
          .eq('is_practice', true)
          .in('image_id', ids)
        if (rErr) throw rErr

        // 2b) 读取标准答案（gold-standard），使用固定的 GOLD_PARTICIPANT_ID
        const { data: goldResps, error: gErr } = await supabase
          .from('responses')
          .select('image_id, no_flaw, reasons_overall, reasons_flaws')
          .eq('participant_id', GOLD_PARTICIPANT_ID)
          .eq('is_practice', true)
          .in('image_id', ids)
        if (gErr && gErr.code !== 'PGRST116') throw gErr

        const a = {}
        for (const r of (resps || [])) {
          const overallSelected = Array.isArray(r.reasons_overall) ? r.reasons_overall : []
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
            flaws,
          }
        }
        setAnswers(a)

        // 构建标准答案映射
        const goldMap = {}
        for (const r of (goldResps || [])) {
          const overallSelected = Array.isArray(r.reasons_overall) ? r.reasons_overall : []
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
          goldMap[r.image_id] = {
            no_flaw: !!r.no_flaw,
            overall: { selected: overallSelected, byGroup: buildByGroupFromSelected(overallSelected) },
            flaws,
          }
        }
        setGoldAnswers(goldMap)

        // 3) 起始索引：第一个未完成的 id
        let start = 0
        for (let i = 0; i < ids.length; i++) {
          const id = ids[i]
          const ans = a[id]
          if (!ans?.saved) { start = i; break }
        }
        setIdx(start)
        setStartedAt(Date.now())
        setLoading(false)
      } catch (e) {
        setError(e?.message || String(e))
        setLoading(false)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [participantId])

  // 度量
  useEffect(()=>{
    const measure = () => {
      updateRects()
    }
    measure()
    let ro = null
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(measure)
      if (containerRef.current) ro.observe(containerRef.current)
    }
    window.addEventListener('resize', measure)
    return () => {
      if (ro) ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [updateRects])
  // 在缩放/平移/换题后，等布局稳定再重新测量，避免圈点与图像错位
  useLayoutEffect(() => {
    if (!imgRef.current || !containerRef.current) return;
    const id = requestAnimationFrame(() => {
      updateRects();
    });
    return () => cancelAnimationFrame(id);
  }, [scale, offset, idx, updateRects]);
  useEffect(()=>{ // 切题重置局部状态（不覆盖 noFlaw）
    setDraftFlaw(null); setOverallTemp({selected:[],byGroup:{}})
    setStartedAt(Date.now()); setScale(1); setOffset({x:0,y:0})
    setSelectedFlawId(null);
    setViewMode('answer')
  },[idx])

  // 当进入“参考答案”或“我的标注”视图时，自动重置缩放与平移，避免圈点位置因放大/拖拽而看起来“移位”
  useEffect(() => {
    if (viewMode === 'standard' || viewMode === 'mine') {
      setScale(1);
      setOffset({ x: 0, y: 0 });
    }
  }, [viewMode]);

  // 切题或刷新后，根据已保存记录同步 noFlaw 的勾选状态
  useEffect(()=>{
    const curId = images[idx]?.id
    if(!curId) return
    const a = answers[curId]
    setNoFlaw(!!a?.no_flaw)
  }, [idx, images, answers])

  /* ---------------- 交互：缩放拖拽/圈点 ---------------- */
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

      // 调整偏移量，使得鼠标下的点在缩放前后尽量保持在同一位置
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

  // 鼠标按下：开启拖拽模式 & 记录起点
  const onMouseDown = (e) => {
    if (viewMode !== 'answer') return;
    if (e.button !== 0) return;
    const isImage =
      e.target === imgRef.current || !!e.target.closest('[data-image-overlay]');
    if (!isImage) return;

    setPanning(true);
    panStart.current = { x: e.clientX, y: e.clientY };
    offsetStart.current = { ...offset };
    movedRef.current = false;
  }

  // 鼠标移动：若位移超过阈值则判定为拖拽
  const onMouseMove = (e) => {
    if (!panning) return;
    const dx = e.clientX - panStart.current.x;
    const dy = e.clientY - panStart.current.y;
    if (Math.hypot(dx, dy) > 3) movedRef.current = true; // 超过 3px 认为在拖拽
    setOffset({ x: offsetStart.current.x + dx, y: offsetStart.current.y + dy });
  }

  // 鼠标抬起：如果在 panning 且没有实际移动 => 视为“单击”，创建草稿点
  const onMouseUp = (e) => {
    if (viewMode !== 'answer') return;
    if (!panning) return;

    if (!movedRef.current && imgRef.current && contRect && imgRect) {
      const rect = imgRef.current.getBoundingClientRect();
      const x = e.clientX;
      const y = e.clientY;
      const px = clamp((x - rect.left) / rect.width, 0, 1);
      const py = clamp((y - rect.top) / rect.height, 0, 1);

      // 生成待确认的蓝圈草稿
      setDraftFlaw({ px, py, r: 0.04 });
      // 取消当前选中圈（避免误解）
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

  // 勾选「无明显破绽」后，清空当前题目的所有总体与细节破绽记录，并同步写入本地 answers[current.id].no_flaw，避免 useEffect 的回填把勾选状态覆盖
  const toggleNoFlaw = (checked) => {
    setNoFlaw(checked);
    if (!current) return;

    // 关闭/取消任何正在进行的圈点与弹窗
    if (checked) {
      setDraftFlaw(null);
      setSelectedFlawId(null);
      setFlawModalOpen(false);
      setOverallOpen(false);
    }

    // 同步到本地 answers，防止因依赖 answers 的 useEffect 把勾选状态覆盖回 false
    setAnswers(prev => {
      const cur = prev[current.id] || {};
      const next = { ...cur, no_flaw: checked };
      if (checked) {
        // 勾选时清空总体与细节理由
        next.overall = { selected: [], byGroup: {} };
        next.flaws = [];
      }
      return { ...prev, [current.id]: next };
    });
  };
  /* ---------------- 保存/跳过 ---------------- */
  const canSave = useMemo(()=>{
    if(noFlaw) return true
    const cur = answers[current?.id]
    const hasOverall = !!(cur?.overall?.selected?.length)
    const hasFlaws = (cur?.flaws||[]).length>0
    return hasOverall || hasFlaws
  },[answers, current, noFlaw])

  const handleSave = async()=>{
    if(!current || !participantId) return
    if(!canSave){ alert('请至少提供一个理由（总体或圈点），或勾选「无明显破绽」。'); return }
    try{
      const cur = answers[current.id] || {}
      const duration_ms = startedAt ? (Date.now()-startedAt) : null
      const payload = {
        participant_id: participantId,
        image_id: Number(current.id),
        is_practice: true,
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
      // 用 UPSERT；若后端没建唯一索引，则 fallback 手动 update/insert
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
          .eq('is_practice', true)
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
      // 本地状态：标记当前题已保存，并进入标准答案视图（不立刻跳到下一题）
      setAnswers(prev => ({
        ...prev,
        [current.id]: {
          ...(prev[current.id] || {}),
          saved: true,
          skipped: false,
          no_flaw: !!noFlaw,
        },
      }))
      setViewMode('standard')
    }catch(e){ console.error('[save error]',e); alert('保存失败：'+(e?.message||String(e))) }
  }
  // 复盘模式下“下一题”按钮：
  // 仅当当前为最后一题（例如第 11 题）时，触发练习完成弹窗；
  // 其他题目只顺序切换到下一题。
  const handleNextAfterReview = () => {
    const totalCount = itemIds.length
    const isLast = idx === totalCount - 1

    if (isLast) {
      // 当前是最后一题的标准答案页：弹出“练习完成 → 进入正式实验”逻辑
      setDoneOpen(true)
    } else {
      // 其余情况：顺序进入下一题，并回到作答模式
      const nextIndex = idx + 1
      if (nextIndex < totalCount) {
        setIdx(nextIndex)
        setViewMode('answer')
      }
    }
  }
  const handleSkip = async()=>{
    if(!current || !participantId) return
    try{
      const payload = { participant_id: participantId, image_id:Number(current.id), is_practice:true, is_skip:true }
      let upsertErr=null
      try{ const { error } = await supabase.from('responses').upsert(payload,{ onConflict:'participant_id,image_id,is_practice' }).select('id').single(); if(error) upsertErr=error }catch(e){ upsertErr=e }
      if(upsertErr){
        const { data: existRows } = await supabase
          .from('responses')
          .select('id')
          .eq('participant_id', participantId)
          .eq('image_id', Number(current.id))
          .eq('is_practice', true)
          .limit(1);
        const exist = (existRows && existRows[0]) || null;
        if (exist?.id) {
          await supabase.from('responses').update(payload).eq('id', exist.id).select('id');
        } else {
          await supabase.from('responses').insert(payload).select('id').single();
        }
      }
      setAnswers(prev=>{ const updated={...prev, [current.id]:{ ...(prev[current.id]||{}), saved:false, skipped:true }}; const next=findNext(idx, itemIds, updated, true); if(next!=null) setIdx(next); return updated })
    }catch(e){ console.error('[skip error]',e); alert('跳过失败：'+(e?.message||String(e))) }
  }

  function findNext(curIdx, ids, ans, includeSkipped=false){
    // 顺着 ids 找第一个未保存的（可忽略或包含 skipped）
    for(let i=curIdx+1;i<ids.length;i++){ const id=ids[i]; const a=ans[id]; if(!a?.saved && (includeSkipped || !a?.skipped)) return i }
    for(let i=0;i<=curIdx;i++){ const id=ids[i]; const a=ans[id]; if(!a?.saved && (includeSkipped || !a?.skipped)) return i }
    return null
  }

  const handleFinishPracticeAndGoToMenu = async () => {
    if (!participantId) {
      navigate('/', { replace: true });
      return;
    }
    try {
      await supabase
        .from('participants')
        .update({
          practice_passed: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', participantId);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[practice] failed to mark practice_passed', e);
    }
    setDoneOpen(false);
    if (participantCohort === 'pilot') {
      navigate('/pilot');
    } else {
      navigate('/menu');
    }
  };

  /* ---------------- 渲染 ---------------- */
  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>Practice</div>
        <div style={{display:'flex', alignItems:'center', gap:12}}>
          <ProgressBar percent={progress} />
          <span style={{color:'#cbd5e1'}}>{completedCount}/{total} · {skippedCount} skipped</span>
          <button
            type="button"
            onClick={openTips}
            style={{ ...styles.smallBtn, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
            title="查看操作提示与常见问题（Tips）"
            aria-label="Open tips"
            data-testid="open-tips-button"
          >
            Tips
          </button>
          <button style={styles.smallBtn} onClick={()=>setReviewOpen(true)}>Review</button>
        </div>
      </header>

      <main style={styles.centerWrap}>
        <section style={styles.card}>
          {loading && <div style={{padding:40, textAlign:'center'}}>Loading…</div>}
          {error && <div style={errBox}>加载失败：{String(error)}</div>}

          {!loading && !error && total===0 && (
            <div style={{padding:40, textAlign:'center', color:'#94a3b8'}}>
              未找到练习图片，请联系研究者或返回菜单。
            </div>
          )}

          {!loading && !error && total>0 && current && (
            <>
              <div style={styles.metaRow}>
                <div style={{ width: 80 }} />
                <div style={{ fontWeight: 700 }}>Item {idx + 1} / {total}</div>
                <div style={{ width: 80 }} />
              </div>


              {/* 左：查看器 */}
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
                    onLoad={updateRects}
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

                  {/* 根据模式渲染圈点：支持 standard, mine, answer 三种模式 */}
                  {(() => {
                    if (viewMode === 'standard') {
                      return (goldAnswers[current.id]?.flaws || []).map((f, i) => {
                        const baseStyle = ringStyle(
                          f,
                          imgRect,
                          contRect,
                          HIGHLIGHT_RED,
                          HIGHLIGHT_RED_FILL
                        )
                        const style = {
                          ...baseStyle,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 12,
                          fontWeight: 700,
                          color: '#ffffff',
                        }
                        return (
                          <div key={f.id || i} style={style} title={`gold-flaw-${i + 1}`}>
                            {i + 1}
                          </div>
                        )
                      })
                    }

                    if (viewMode === 'mine') {
                      return (answers[current.id]?.flaws || []).map((f, i) => {
                        const baseStyle = ringStyle(
                          f,
                          imgRect,
                          contRect,
                          HIGHLIGHT_YELLOW,
                          HIGHLIGHT_YELLOW_FILL_SOFT
                        )
                        const style = {
                          ...baseStyle,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 12,
                          fontWeight: 700,
                          color: '#ffffff',
                        }
                        return (
                          <div key={f.id || i} style={style} title={`my-flaw-${i + 1}`}>
                            {i + 1}
                          </div>
                        )
                      })
                    }

                    // Default answer mode (no numbers)
                    return (answers[current.id]?.flaws || []).map(f => {
                      const isSel = selectedFlawId === f.id
                      const style = ringStyle(
                        f,
                        imgRect,
                        contRect,
                        isSel ? HIGHLIGHT_RED : HIGHLIGHT_YELLOW,
                        isSel ? HIGHLIGHT_RED_FILL : HIGHLIGHT_YELLOW_FILL_SOFT
                      )
                      return <div key={f.id} style={style} title="flaw" />
                    })
                  })()}
                  {viewMode === 'answer' && draftFlaw && (
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

                  {/* 提示仍在容器内，但与工具条无重叠 */}
                  <div style={viewer.hint}>滚轮缩放，拖拽平移；单击添加圈点 → 确认位置后选择理由</div>
                </div>
                {/* 工具条：左侧缩放/重置，右侧 Save & Next（仅在作答模式显示） */}
                <div style={viewer.toolbarRow}>
                  <div style={{ display: 'flex', gap: 8 }}>
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
                    <button
                      aria-label="Reset view"
                      style={viewer.fab}
                      onClick={()=>{setScale(1); setOffset({x:0,y:0})}}
                    >
                      Reset
                    </button>
                  </div>
                  {viewMode === 'answer' && (
                    <button
                      style={{ ...styles.primaryBtn, opacity: canSave ? 1 : 0.5 }}
                      disabled={!canSave}
                      onClick={handleSave}
                    >
                      Save & Next
                    </button>
                  )}
                </div>
              </div>

              {/* 右：表单面板 / 标准答案面板 */}
              <div style={panel.panel}>
                {viewMode === 'answer' && (
                  <>
                    {/* 顶部固定：无明显破绽 */}
                    <div style={panel.stickyTop}>
                      <label style={{display:'flex', alignItems:'center', gap:8}}>
                        <input type="checkbox" checked={noFlaw} onChange={e=>toggleNoFlaw(e.target.checked)} /> 无明显破绽（允许 0 点 0 理由）
                      </label>
                    </div>

                    {/* Overall 条目（按是否已有记录切换 Add / Edit+Clear） */}
                    <div style={panel.row}>
                      <div style={panel.head}>总体理由</div>
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
                    <div style={panel.note}>{(answers[current.id]?.overall?.selected?.length||0)} 项</div>

                    {/* Flaws 列表 */}
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

                    {/* Draft 提示 */}
                    {draftFlaw && (
                      <div style={{...panel.item, borderStyle:'dashed'}}>
                        <div>点击位置待确认</div>
                        <div style={{display:'flex', gap:8}}>
                          <button style={styles.smallBtn} onClick={confirmDraftPosition}>Confirm</button>
                          <button style={styles.smallBtn} onClick={()=>{ setDraftFlaw(null) }}>Cancel</button>
                        </div>
                      </div>
                    )}

                    <div style={{flex:1}} />
                  </>
                )}

                {viewMode === 'standard' && (
                  <>
                    <div style={panel.stickyTop}>
                      <div style={{ ...panel.head, fontWeight: 700 }}>参考答案（练习参考）</div>
                      {!goldAnswers[current.id] && (
                        <div style={panel.note}>本题尚未配置参考答案。</div>
                      )}
                    </div>
                    {goldAnswers[current.id] && (
                      <div style={{marginTop:8, fontSize:14}}>
                        <div style={{fontWeight:700, marginBottom:4}}>总体理由：</div>
                        <ul style={{marginTop:0, paddingLeft:18}}>
                          {(goldAnswers[current.id].overall?.selected || []).map(code => (
                            <li key={code}>{labelForOverall(code) || code}</li>
                          ))}
                          {goldAnswers[current.id].overall?.selected?.length === 0 && (
                            <li>（无总体理由）</li>
                          )}
                        </ul>

                        <div style={{fontWeight:700, margin:'10px 0 4px'}}>细节破绽：</div>
                        {(goldAnswers[current.id].flaws || []).length === 0 && (
                          <div style={panel.note}>（无细节破绽）</div>
                        )}
                        {(goldAnswers[current.id].flaws || []).map((f,i) => (
                          <div key={f.id || i} style={{marginBottom:6, padding:'6px 8px', borderRadius:6, border:'1px solid #334155'}}>
                            <div style={{fontWeight:600, marginBottom:2}}>区域 #{i+1}</div>
                            <ul style={{margin:0, paddingLeft:18}}>
                              {(f.reasons?.selected || []).map(code => (
                                <li key={code}>{labelForFlaw(code) || code}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}

                    <div style={{flex:1}} />

                    <div style={panel.stickyBottom}>
                      <button style={styles.secondaryBtn} onClick={() => setViewMode('mine')}>
                        查看我的标注
                      </button>
                      <button style={styles.primaryBtn} onClick={handleNextAfterReview}>
                        下一题
                      </button>
                    </div>
                  </>
                )}

                {viewMode === 'mine' && (
                  <>
                    <div style={panel.stickyTop}>
                      <div style={panel.head}>我的标注（仅查看，不再编辑）</div>
                    </div>
                    <div style={{marginTop:8, fontSize:14}}>
                      <div style={{fontWeight:700, marginBottom:4}}>总体理由：</div>
                      <ul style={{marginTop:0, paddingLeft:18}}>
                        {(answers[current.id]?.overall?.selected || []).map(code => (
                          <li key={code}>{labelForOverall(code) || code}</li>
                        ))}
                        {!(answers[current.id]?.overall?.selected || []).length && (
                          <li>（未选择总体理由）</li>
                        )}
                      </ul>
                      <div style={{fontWeight:700, margin:'10px 0 4px'}}>细节破绽：</div>
                      {(answers[current.id]?.flaws || []).length === 0 && (
                        <div style={panel.note}>（未圈选细节破绽）</div>
                      )}
                      {(answers[current.id]?.flaws || []).map((f,i) => (
                        <div key={f.id || i} style={{marginBottom:6, padding:'6px 8px', borderRadius:6, border:'1px solid #334155'}}>
                          <div style={{fontWeight:600, marginBottom:2}}>Flaw #{i+1}</div>
                          <ul style={{margin:0, paddingLeft:18}}>
                            {(f.reasons?.selected || []).map(code => (
                              <li key={code}>{labelForFlaw(code) || code}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>

                    <div style={{flex:1}} />

                    <div style={panel.stickyBottom}>
                      <button style={styles.primaryBtn} onClick={() => setViewMode('standard')}>
                        返回参考答案
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </section>
      </main>

      {/* Overall 弹窗 */}
      {overallOpen && current && (
        <OverallModal temp={overallTemp} setTemp={setOverallTemp} onClose={()=>setOverallOpen(false)} onConfirm={()=>{ setAnswers(prev=>({ ...prev, [current.id]:{ ...(prev[current.id]||{}), overall: deepClone(overallTemp) } })); setOverallOpen(false) }} />
      )}

      {/* Flaw 弹窗 */}
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

      {doneOpen && (
        <div style={modal.backdrop} onClick={() => setDoneOpen(false)}>
          <div style={modal.box} onClick={e => e.stopPropagation()}>
            <div style={modal.title}>练习已完成</div>
            <div style={{ marginBottom: 16, color: '#cbd5e1', lineHeight: 1.6 }}>
              您已经完成了所有的练习题。接下来将进入正式实验。<br />
              在开始正式实验前，请确保您的环境和状态已准备就绪。
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button style={styles.smallBtn} onClick={() => setDoneOpen(false)}>
                留在当前页面
              </button>
              <button
                style={styles.primaryBtn}
                onClick={handleFinishPracticeAndGoToMenu}
              >
                前往正式实验
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ---------------- 小组件 ---------------- */
function ProgressBar({percent}){ return (<div style={{width:160,height:10,background:'#0b1220',borderRadius:999,overflow:'hidden'}}><div style={{width:`${percent}%`,height:'100%',background:'#22c55e'}} /></div>) }

// 可拖动弹窗的通用逻辑
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
    // 如果点击的是交互元素（复选框、按钮、文字输入等），则不要触发拖动
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
        <div style={modal.title}>
          Overall Reasons（多选）
        </div>
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
                          （{it.example}）
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
        onClick={e => e.stopPropagation()}
        onMouseDown={handleDragMouseDown}
      >
        <div style={modal.title}>
          Flaw Reasons（多选）
        </div>
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
                              （{it.example}）
                            </div>
                          )}
                          {it.hasTextInput && active && (
                            <textarea
                              rows={3}
                              placeholder="请简要说明其他问题…"
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

/* ---------------- 样式 ---------------- */
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
  smallBtn:{ padding:'6px 10px', borderRadius:6, border:'1px solid #475569', background:'#111827', color:'#e2e8f0', cursor:'pointer' },
  tabRow:{ display:'flex', gap:8, margin:'4px 0 8px' },
  tabBtn:{ padding:'4px 10px', borderRadius:999, border:'1px solid #475569', background:'#020617', color:'#e2e8f0', cursor:'pointer', fontSize:13 },
  tabBtnActive:{ padding:'4px 10px', borderRadius:999, border:'1px solid #2563eb', background:'#1d4ed8', color:'#fff', cursor:'pointer', fontSize:13, fontWeight:700 }
}
const viewer={
  wrap:{ display:'flex', flexDirection:'column', alignItems:'flex-start' },
  container:{ position:'relative', width:'100%', height:'min(70vh,720px)', background:'#111827', borderRadius:8, overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', userSelect:'none' },
  image:{ maxWidth:'100%', maxHeight:'100%', willChange:'transform', transition:'transform 60ms linear' },
  overlay:{ position:'absolute', inset:0 },
  fab:{ padding:'8px 10px', borderRadius:8, border:'1px solid #475569', background:'#0b1220cc', color:'#e2e8f0', cursor:'pointer', fontWeight:800, minWidth:56 },
  toolbarRow:{
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 8,
    paddingRight: 4,
  },
  hint:{ position:'absolute', left:12, bottom:12, color:'#cbd5e1', background:'#0b1220cc', padding:'6px 8px', borderRadius:6, fontSize:12 }
}
const panel={
  panel:{ background:'#0b1220', border:'1px solid #22304a', borderRadius:8, padding:12, display:'flex', flexDirection:'column', height:'min(70vh,720px)', overflow:'auto', position:'relative' },
  row:{ display:'flex', alignItems:'center', justifyContent:'space-between' },
  head:{ fontWeight:800, color:'#cbd5e1' },
  note:{ fontSize:12, color:'#9ca3af', marginTop:4 },
  item:{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'#0f172a', border:'1px solid #334155', borderRadius:8, padding:'8px 10px', marginTop:6 },
  stickyTop:{
    position: 'static',
    paddingBottom: 8,
    marginBottom: 8,
    background: 'transparent',
    borderBottom: '1px solid #22304a',
  },
  stickyBottom:{
    position: 'static',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 12,
    padding: '14px 0 0',
    marginTop: 12,
    background: 'transparent',
    borderTop: '1px solid #22304a',
  }
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
    return 'todo' // 未完成或被跳过
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
// reason code 显示标签（标准答案/我的标注视图用）
function labelForOverall(code){
  if(!code) return ''
  const [gKey, itemKey] = String(code).split(':')
  for(const g of OVERALL_GROUPS){
    if(g.key !== gKey) continue
    const it = (g.items || []).find(x => x.key === itemKey)
    if(it) return it.label
  }
  return code
}

function labelForFlaw(code){
  if(!code) return ''
  const [gKey, itemKey] = String(code).split(':')
  for(const g of FLAW_GROUPS){
    if(g.key !== gKey) continue
    const it = (g.items || []).find(x => x.key === itemKey)
    if(it) return it.label
  }
  return code
}