// ── Master use-case library admin page › events (verbatim branches) ───────
import { store } from '../../model/state.js';
import { markLibChanged, libAddItem, libDeleteItem, libToggleCap } from '../../model/library.js';
import { scheduleLibrarySave } from '../../persistence/granular-save.js';
import { renderLibraryEditor, toggleLibCapPicker, closeLibCapPickers } from './library.view.js';

export function initLibraryEvents(){
  document.addEventListener('click', e => {
    if(e.target.id==='btnAddLibItem'){ libAddItem(); renderLibraryEditor();
      requestAnimationFrame(()=>{const cards=document.querySelectorAll('#libEditor .uc-card'); const last=cards[cards.length-1]; const t=last&&last.querySelector('.uc-title'); if(t)t.focus();});
      return; }
    const led=e.target.closest('[data-libeditdel]'); if(led){ libDeleteItem(led.dataset.libeditdel); renderLibraryEditor(); return; }
    const lrc=e.target.closest('[data-libeditremcap]'); if(lrc){ libToggleCap(lrc.dataset.lib, lrc.dataset.cap); renderLibraryEditor(); return; }
    const lac=e.target.closest('[data-libeditaddcap]'); if(lac){ toggleLibCapPicker(lac); return; }
    const lpick=e.target.closest('[data-libeditpick]'); if(lpick){ libToggleCap(lpick.dataset.lib, lpick.dataset.cap);
      const libId=lpick.dataset.lib; renderLibraryEditor(); const btn=document.querySelector(`[data-libeditaddcap="${libId}"]`); if(btn) toggleLibCapPicker(btn); return; }
    if(e.target.closest('[data-libeditpickclose]')){ closeLibCapPickers(); return; }
    if(!e.target.closest('.uc-cap-pop') && !e.target.closest('[data-libeditaddcap]')) closeLibCapPickers();
  });
  document.addEventListener('blur', e => {
    if(e.target.matches && e.target.matches('[data-libedittitle]')){const id=e.target.dataset.libedittitle,item=store.USE_CASE_LIBRARY.find(i=>i.id===id);
      if(item){item.title=e.target.textContent.trim(); markLibChanged(); scheduleLibrarySave(id);} return;}
    if(e.target.matches && e.target.matches('[data-libeditdesc]')){const id=e.target.dataset.libeditdesc,item=store.USE_CASE_LIBRARY.find(i=>i.id===id);
      if(item){item.desc=e.target.textContent.trim(); markLibChanged(); scheduleLibrarySave(id);} return;}
  }, true);
}
