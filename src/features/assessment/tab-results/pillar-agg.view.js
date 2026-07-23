// ── Results › coverage-by-pillar table (verbatim port) ────────────────────
import { esc } from '../../../ui/dom.js';
import { store } from '../../../model/state.js';
import { pLetter } from '../../../model/rubric.js';
import { active } from '../../../scoring/coverage.js';
import { compute, pillarAgg } from '../../../scoring/fit.js';
import { anyScope } from '../../../scoring/coverage.js';

export function renderAgg(){const agg=pillarAgg(),rows=compute(),has=anyScope();
  const t=document.getElementById('aggTable'); if(!t)return;
  let head='<thead><tr><th class="lbl">Pillar</th>';active().forEach(p=>head+=`<th>${p.code}</th>`);head+='</tr></thead>';
  let body='<tbody>';
  store.RUBRIC.forEach(p=>{const row=agg[p.key];let lead=-1;
    if(row.inScope)active().forEach(pl=>{if(row[pl.id]>lead)lead=row[pl.id];});
    const nameHtml=`<span class="pl-letter">${pLetter(p.key)}</span><b>${esc(p.name)}</b>${p.retired?' <span class="retired-tag">retired</span>':''}`;
    body+=`<tr class="${p.retired?'row-retired':''}"><td class="lbl">${nameHtml}</td>`;
    active().forEach(pl=>{ if(!row.inScope){body+=`<td class="cov"><span class="cell-na">${p.retired?'— retired':'— out of scope'}</span></td>`;}
      else{const v=row[pl.id];const isLead=v===lead&&lead>0;
        body+=`<td class="cov ${isLead?'leader':''}"><div class="cell-cov"><span class="n">${v}%</span><span class="mini"><i style="width:${v}%"></i></span></div></td>`;}});
    body+='</tr>';});
  body+='</tbody>';
  let foot='<tbody><tr class="total"><td class="lbl">Weighted fit</td>';
  active().forEach(pl=>{const r=rows.find(x=>x.id===pl.id);
    foot+= has?`<td class="cov"><div class="cell-cov"><span class="n">${r.dq?'✕ ':''}${r.fit}%</span><span class="mini"><i style="width:${r.fit}%"></i></span></div></td>`:`<td class="cov"><span class="cell-na">—</span></td>`;});
  foot+='</tr></tbody>'; t.innerHTML=head+body+foot; }
