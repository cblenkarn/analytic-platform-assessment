// ── Results › coverage-by-use-case (verbatim port) ────────────────────────
import { esc } from '../../../ui/dom.js';
import { store } from '../../../model/state.js';
import { active, anyScope } from '../../../scoring/coverage.js';
import { useCaseCoverage, useCaseRanking } from '../../../scoring/usecase-coverage.js';
import { capIdStrip as _capIdStrip } from '../../../model/usecases.js';

export function renderUseCaseCoverage(){
  const head = document.getElementById('ucSecHead');
  const wrap = document.getElementById('ucCoverage');
  if(!wrap || !head) return;
  const useCases = store.S.useCases || [];
  const has = anyScope();
  if(!useCases.length || !has){
    head.hidden = true; wrap.hidden = true; wrap.innerHTML = '';
    return;
  }
  head.hidden = false; wrap.hidden = false;

  const ranked = useCaseRanking();
  const winner = ranked.find(r=>r.ucInScope>0);
  let html = '';

  if(winner){
    const parts = [];
    if(winner.full > 0) parts.push(`<b>${winner.full}</b> of ${winner.ucInScope} fully`);
    if(winner.part > 0) parts.push(`<b>${winner.part}</b> partially`);
    if(winner.none > 0) parts.push(`<b>${winner.none}</b> not covered`);
    const covPct = Math.round(winner.avgCov*100);
    const ucStr = winner.ucInScope === 1 ? '1 in-scope use case' : winner.ucInScope + ' in-scope use cases';
    const runner = ranked.filter(r=>r.id!==winner.id && r.ucInScope>0)[0];
    let runnerHtml = '';
    if(runner){
      const rPct = Math.round(runner.avgCov*100);
      const rBits = [];
      if(runner.full>0) rBits.push(`${runner.full} fully delivered`);
      rBits.push(`${rPct}% average coverage`);
      runnerHtml = `<div class="uv-runner">Runner-up: <b>${esc(runner.name)}</b> — ${rBits.join(', ')}.</div>`;
    }
    const winnerFullList = useCases
      .map(uc=>({uc, cv:useCaseCoverage(uc, winner.id)}))
      .filter(x=>x.cv.scoped && x.cv.cov>=0.999)
      .map(x=>x.uc.title||'Untitled');
    let fullListHtml = '';
    if(winnerFullList.length){
      const shown = winnerFullList.slice(0,3).map(t=>esc(t)).join(', ');
      const more = winnerFullList.length>3 ? ` (+${winnerFullList.length-3} more)` : '';
      fullListHtml = `<div class="uv-detail">Fully delivers: <b>${shown}</b>${more}.</div>`;
    }
    html += `<div class="uc-verdict">
      <div class="uv-eyebrow">Best platform for your use cases</div>
      <div class="uv-title">${esc(winner.name)}</div>
      <div class="uv-body">Delivers ${parts.join(', ')} · <b>${covPct}%</b> average coverage across ${ucStr}.</div>
      ${fullListHtml}
      ${runnerHtml}
    </div>`;
  }

  html += `<div class="pill-grid"><table class="agg">`;
  html += '<thead><tr><th class="lbl">Use case</th>';
  active().forEach(p=>html+=`<th>${esc(p.code)}</th>`);
  html += '</tr></thead><tbody>';
  useCases.forEach(uc=>{
    const cells = active().map(pl=>({pl, cv:useCaseCoverage(uc, pl.id)}));
    const capStrip = _capIdStrip(uc);
    const capSub = capStrip ? `<div class="uc-caps-sub">${esc(capStrip)}</div>` : `<div class="uc-caps-sub" style="color:var(--gap);">no capabilities mapped</div>`;
    const scoped = cells.some(c=>c.cv.scoped);
    if(!scoped){
      html += `<tr><td class="lbl"><b>${esc(uc.title||'Untitled')}</b>${capSub}</td>`;
      active().forEach(()=>html+=`<td class="cov"><span class="cell-na">— out of scope</span></td>`);
      html += '</tr>';
      return;
    }
    let lead = -1;
    cells.forEach(c=>{ if(c.cv.scoped && c.cv.cov > lead) lead = c.cv.cov; });
    html += `<tr><td class="lbl"><b>${esc(uc.title||'Untitled')}</b>${capSub}</td>`;
    cells.forEach(c=>{
      const pct = Math.round(c.cv.cov*100);
      const isLead = c.cv.scoped && c.cv.cov === lead && lead > 0;
      html += `<td class="cov ${isLead?'leader':''}"><div class="cell-cov"><span class="n">${pct}%</span><span class="mini"><i style="width:${pct}%"></i></span></div></td>`;
    });
    html += '</tr>';
  });
  html += '<tr class="total"><td class="lbl">Avg. use case coverage</td>';
  active().forEach(pl=>{
    const r = ranked.find(x=>x.id===pl.id);
    const pct = Math.round((r ? r.avgCov : 0) * 100);
    html += `<td class="cov"><div class="cell-cov"><span class="n">${pct}%</span><span class="mini"><i style="width:${pct}%"></i></span></div></td>`;
  });
  html += '</tr></tbody></table></div>';

  wrap.innerHTML = html;
}
