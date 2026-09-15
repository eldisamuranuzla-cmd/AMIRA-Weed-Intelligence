export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }
  if (req.method !== 'POST') return res.status(405).json({error:'Method not allowed'});
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const { image, mimeType, filename, block, activity, date, width, height } = req.body || {};
  const apiUrl = process.env.DATATURE_API_URL;
  const secret = process.env.DATATURE_SECRET;
  if (!apiUrl || !secret) return res.status(500).json({error:'Datature backend belum dikonfigurasi. Set DATATURE_API_URL dan DATATURE_SECRET di Vercel Environment Variables.'});
  if (!image) return res.status(400).json({error:'image wajib dikirim'});

  const r = await fetch(apiUrl, {
    method:'POST',
    headers:{'Authorization':`Bearer ${secret}`,'Content-Type':'application/json','Accept':'application/json'},
    body: JSON.stringify({image_type:'base_64', data:image})
  });
  const text = await r.text();
  let raw; try { raw = JSON.parse(text); } catch { raw = {raw:text}; }
  if (!r.ok) return res.status(r.status).json({error:'Datature inference error', upstream:raw});

  const preds = Array.isArray(raw) ? raw : (raw.predictions || raw.annotations || raw.results || raw.data || []);
  const arr = Array.isArray(preds) ? preds : [];
  const normalized = arr.map(p => ({
    species: p?.tag?.name || p?.class || p?.label || p?.name || 'UNKNOWN',
    confidence: p?.confidence != null ? Number(p.confidence) : null,
    contour: p?.contour || p?.segmentation || null,
    bound: p?.bound || p?.bbox || null,
    raw:p
  }));
  normalized.sort((a,b)=>(b.confidence||0)-(a.confidence||0));
  const top = normalized[0] || null;
  const counts = {};
  normalized.forEach(p => { counts[p.species]=(counts[p.species]||0)+1; });
  const dominant = Object.entries(counts).sort((a,b)=>b[1]-a[1])[0]?.[0] || top?.species || null;

  // Polygon area estimate. This is a screening estimate until field-calibrated density thresholds are set.
  let maskArea = 0;
  function polyArea(poly){let a=0;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const [x1,y1]=poly[i], [x2,y2]=poly[j];a += x2*y1-x1*y2;}return Math.abs(a)/2;}
  for (const p of normalized) {
    const c=p.contour;
    if (Array.isArray(c)) {
      if (Array.isArray(c[0]) && Array.isArray(c[0][0])) { for(const q of c) if(Array.isArray(q)) maskArea += polyArea(q); }
      else if (Array.isArray(c[0])) maskArea += polyArea(c);
    }
  }
  const imgArea = Number(width||0) * Number(height||0);
  const weedAreaPct = imgArea>0 ? Math.max(0, Math.min(100, maskArea/imgArea*100)) : null;
  let density = null;
  if (weedAreaPct != null) {
    // Initial operational estimate only. Calibrate against AMIRA field ground truth before using as agronomic decision criteria.
    density = weedAreaPct < 5 ? 'LOW' : weedAreaPct < 15 ? 'MEDIUM' : weedAreaPct < 30 ? 'HIGH' : 'VERY HIGH';
  }

  const broadleaf = new Set(['Asystasia gangetika','Kentangan','Bunga Pagoda','Terongan','Caladi sp.','Ciplukan / Physalis angulata','Bandotan / Ageratum conyzoides','Senduduk bulu / Clidemia hirta','Rambusa / Passiflora foetida']);
  const narrowleaf = new Set(['Cyperus kylingia','Cyperus rotundus','Paspalum conjugatum']);
  const groups = new Set(normalized.map(p => broadleaf.has(p.species)?'BROADLEAF':narrowleaf.has(p.species)?'NARROWLEAF':'UNKNOWN').filter(Boolean));
  const group = groups.size===1 ? [...groups][0] : groups.size>1 ? 'MIXED' : null;

  return res.status(200).json({
    model: process.env.AMIRA_MODEL_NAME || 'AMIRA Weed Vision AI',
    status:'AI_PREDICTED',
    species: dominant,
    group,
    density,
    confidence: top?.confidence ?? null,
    weedAreaPct,
    detections: normalized.map(({raw,...x})=>x),
    meta:{filename,mimeType,block,activity,date,width,height},
    raw
  });
}
