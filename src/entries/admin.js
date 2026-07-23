// Entry: rubric admin page.
import { setRenderer } from '../ui/render-bus.js';
import { setEditMode } from '../model/rubric.js';
import { initCollapsibles } from '../ui/chrome.js';
import { renderAdminAll } from '../features/admin/render.js';
import { initMatrixEvents } from '../features/admin/matrix.events.js';
import { initRationalePopover } from '../features/admin/rationale-popover.js';
import { loadTables, subscribeTables } from '../persistence/tables-sync.js';
import { isConfigured } from '../persistence/supabase.js';
import { setAuto } from '../persistence/autosave.js';

document.addEventListener('DOMContentLoaded', async () => {
  setEditMode(true);
  setRenderer(renderAdminAll);
  initCollapsibles();
  initMatrixEvents();
  initRationalePopover();

  if (isConfigured()) {
    await loadTables();
    subscribeTables();
  } else {
    renderAdminAll(); // seed rubric, offline
    setAuto('err', 'offline - configure Supabase to save');
  }
});
