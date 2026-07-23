// ── Use Cases tab › event handlers (verbatim branches) ────────────────────
import { store } from '../../../model/state.js';
import { markChanged } from '../../../model/rubric.js';
import { addUseCaseFromLibrary, addCustomUseCase, deleteUseCase, toggleUCCap } from '../../../model/usecases.js';
import { renderUseCases, renderUCSelected, toggleUCCapPicker, closeUCCapPickers } from './usecases.view.js';
import { renderFramework } from '../tab-prioritization/framework.view.js';
import { renderUseCaseCoverage } from '../tab-results/usecase-coverage.view.js';

export function initUseCasesEvents() {
  document.addEventListener('click', e => {
    const libAdd=e.target.closest('[data-libadd]'); if(libAdd){ addUseCaseFromLibrary(libAdd.dataset.libadd); renderUseCases(); renderFramework(); renderUseCaseCoverage(); return; }
    if(e.target.id==='btnAddCustomUC'){ addCustomUseCase(); renderUCSelected(); renderUseCaseCoverage();
      requestAnimationFrame(()=>{ const cards=document.querySelectorAll('.uc-card'); const last=cards[cards.length-1]; const t=last&&last.querySelector('.uc-title'); if(t){t.focus();}});
      return; }
    const ucDel=e.target.closest('[data-ucdel]'); if(ucDel){ deleteUseCase(ucDel.dataset.ucdel); renderUseCases(); renderFramework(); renderUseCaseCoverage(); return; }
    const capRem=e.target.closest('[data-uccap-remove]'); if(capRem){ toggleUCCap(capRem.dataset.uc, capRem.dataset.cap); renderUCSelected(); renderFramework(); renderUseCaseCoverage(); return; }
    const ucAddCap=e.target.closest('[data-ucaddcap]'); if(ucAddCap){ toggleUCCapPicker(ucAddCap); return; }
    const ucPick=e.target.closest('[data-ucpick]');
    if(ucPick){ toggleUCCap(ucPick.dataset.uc, ucPick.dataset.cap);
      const ucId=ucPick.dataset.uc; renderUCSelected(); renderFramework(); renderUseCaseCoverage();
      const btn=document.querySelector(`[data-ucaddcap="${ucId}"]`); if(btn) toggleUCCapPicker(btn);
      return; }
    if(e.target.closest('[data-ucpickclose]')){ closeUCCapPickers(); return; }
    if(!e.target.closest('.uc-cap-pop') && !e.target.closest('[data-ucaddcap]') && !e.target.closest('[data-libeditaddcap]')) closeUCCapPickers();
  });

  document.addEventListener('blur', e => {
    if(e.target.matches && e.target.matches('[data-uctitle]')){const id=e.target.dataset.uctitle,uc=store.S.useCases.find(u=>u.id===id);
      if(uc){ uc.title=e.target.textContent.trim(); markChanged(); renderFramework(); renderUseCaseCoverage(); }
      return;}
    if(e.target.matches && e.target.matches('[data-ucdesc]')){const id=e.target.dataset.ucdesc,uc=store.S.useCases.find(u=>u.id===id);
      if(uc){ uc.desc=e.target.textContent.trim(); markChanged(); }
      return;}
  }, true);
}
