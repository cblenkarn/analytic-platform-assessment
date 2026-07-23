// Entry: use-case library admin page.
import { setRenderer } from '../ui/render-bus.js';
import { initCollapsibles } from '../ui/chrome.js';
import { renderLibraryEditor } from '../features/usecases-library/library.view.js';
import { initLibraryEvents } from '../features/usecases-library/library.events.js';
import { loadTables, subscribeTables } from '../persistence/tables-sync.js';
import { isConfigured } from '../persistence/supabase.js';
import { setAuto } from '../persistence/autosave.js';

document.addEventListener('DOMContentLoaded', async () => {
  setRenderer(renderLibraryEditor);
  initCollapsibles();
  initLibraryEvents();

  if (isConfigured()) {
    await loadTables({ onLoaded: renderLibraryEditor });
    subscribeTables({ onLoaded: renderLibraryEditor });
  } else {
    renderLibraryEditor(); // seed library, offline
    setAuto('err', 'offline - configure Supabase to save');
  }
});
