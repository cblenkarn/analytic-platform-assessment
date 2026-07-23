// ── Supabase data layer ───────────────────────────────────────────────────
// Normalized tables: rubric_pillars (one row/pillar), vendors (one row/vendor),
// use_case_library (one row/use case), assessments (unchanged). Every table
// write is row-scoped, so two editors touching different rows never collide.
// All raw DB access lives here; feature/UI code never touches the client directly.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cfg = window.APP_CONFIG || {};

export let sb = null;
if (cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY) {
  try { sb = createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY); }
  catch (e) { console.error('Supabase init failed', e); }
}
export const isConfigured = () => !!sb;

// ---------------- rubric_pillars ----------------
export async function listPillars() {
  const { data, error } = await sb.from('rubric_pillars').select('key,data,sort_order').order('sort_order', { ascending: true });
  if (error) throw error;
  return data || [];
}
export async function upsertPillar(key, data, sortOrder) {
  const { error } = await sb.from('rubric_pillars').upsert({ key, data, sort_order: sortOrder, updated_at: new Date().toISOString() });
  if (error) throw error;
}
export async function deletePillarRow(key) {
  const { error } = await sb.from('rubric_pillars').delete().eq('key', key);
  if (error) throw error;
}

// ---------------- vendors ----------------
export async function listVendors() {
  const { data, error } = await sb.from('vendors').select('id,data,sort_order').order('sort_order', { ascending: true });
  if (error) throw error;
  return data || [];
}
export async function upsertVendor(id, data, sortOrder) {
  const { error } = await sb.from('vendors').upsert({ id, data, sort_order: sortOrder, updated_at: new Date().toISOString() });
  if (error) throw error;
}
export async function deleteVendorRow(id) {
  const { error } = await sb.from('vendors').delete().eq('id', id);
  if (error) throw error;
}

// ---------------- use_case_library ----------------
export async function listLibrary() {
  const { data, error } = await sb.from('use_case_library').select('id,data,sort_order').order('sort_order', { ascending: true });
  if (error) throw error;
  return data || [];
}
export async function upsertLibraryItem(id, data, sortOrder) {
  const { error } = await sb.from('use_case_library').upsert({ id, data, sort_order: sortOrder, updated_at: new Date().toISOString() });
  if (error) throw error;
}
export async function deleteLibraryItem(id) {
  const { error } = await sb.from('use_case_library').delete().eq('id', id);
  if (error) throw error;
}

// ---------------- assessments (unchanged) ----------------
export async function listAssessments() {
  const { data, error } = await sb.from('assessments')
    .select('id,name,client,updated_at').order('updated_at', { ascending: false });
  if (error) throw error;
  return data || [];
}
export async function createAssessment(name, client) {
  const { data, error } = await sb.from('assessments')
    .insert({ name, client, data: { moscow: {}, needs: {}, useCases: [] } }).select('id').single();
  if (error) throw error;
  return data.id;
}
export async function getAssessment(id) {
  const { data, error } = await sb.from('assessments').select('name,client,data').eq('id', id).single();
  if (error) throw error;
  return data;
}
export async function putSelections(id, sel) {
  const { error } = await sb.from('assessments')
    .update({ data: sel, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
}
export async function delAssessment(id) {
  const { error } = await sb.from('assessments').delete().eq('id', id);
  if (error) throw error;
}
