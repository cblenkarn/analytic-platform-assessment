// ── Supabase data layer (v3 — fully normalized) ──────────────────────────
// Every table write here is scoped to exactly one row: one pillar, one
// capability, one sub-capability, one vendor, one support cell, one
// rationale note, one library item, one library-capability mapping, one
// assessment, one priority, one sub-need, one assessment use case, one
// use-case-capability mapping. Two editors touching different rows —
// including two different cells in the SAME sub-capability/pillar — never
// collide. All raw DB access lives here; feature/UI code never touches the
// client directly.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cfg = window.APP_CONFIG || {};

export let sb = null;
if (cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY) {
  try { sb = createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY); }
  catch (e) { console.error('Supabase init failed', e); }
}
export const isConfigured = () => !!sb;

function must(error) { if (error) throw error; }
const stamp = () => new Date().toISOString();

// ---------------- pillars ----------------
export async function listPillars() {
  const { data, error } = await sb.from('pillars').select('*').order('sort_order');
  must(error); return data || [];
}
export async function upsertPillar(id, fields, sortOrder) {
  const { error } = await sb.from('pillars').upsert({ id, ...fields, sort_order: sortOrder, updated_at: stamp() });
  must(error);
}
export async function deletePillarRow(id) { const { error } = await sb.from('pillars').delete().eq('id', id); must(error); }

// ---------------- capabilities ----------------
export async function listCapabilities() {
  const { data, error } = await sb.from('capabilities').select('*').order('sort_order');
  must(error); return data || [];
}
export async function upsertCapability(id, fields, sortOrder) {
  const { error } = await sb.from('capabilities').upsert({ id, ...fields, sort_order: sortOrder, updated_at: stamp() });
  must(error);
}
export async function deleteCapabilityRow(id) { const { error } = await sb.from('capabilities').delete().eq('id', id); must(error); }

// ---------------- sub_capabilities ----------------
export async function listSubCapabilities() {
  const { data, error } = await sb.from('sub_capabilities').select('*').order('sort_order');
  must(error); return data || [];
}
export async function upsertSubCapability(id, fields, sortOrder) {
  const { error } = await sb.from('sub_capabilities').upsert({ id, ...fields, sort_order: sortOrder, updated_at: stamp() });
  must(error);
}
export async function deleteSubCapabilityRow(id) { const { error } = await sb.from('sub_capabilities').delete().eq('id', id); must(error); }

// ---------------- vendors ----------------
export async function listVendors() {
  const { data, error } = await sb.from('vendors').select('*').order('sort_order');
  must(error); return data || [];
}
export async function upsertVendor(id, fields, sortOrder) {
  const { error } = await sb.from('vendors').upsert({ id, ...fields, sort_order: sortOrder, updated_at: stamp() });
  must(error);
}
export async function deleteVendorRow(id) { const { error } = await sb.from('vendors').delete().eq('id', id); must(error); }

// ---------------- vendor_support (one row per checkbox cell) ----------------
export async function listVendorSupport() {
  const { data, error } = await sb.from('vendor_support').select('*');
  must(error); return data || [];
}
export async function setVendorSupport(subId, vendorId, supported) {
  const { error } = await sb.from('vendor_support')
    .upsert({ sub_capability_id: subId, vendor_id: vendorId, supported, updated_at: stamp() });
  must(error);
}

// ---------------- rationale (one row per SME note cell) ----------------
export async function listRationale() {
  const { data, error } = await sb.from('rationale').select('*');
  must(error); return data || [];
}
export async function upsertRationale(subId, vendorId, fields) {
  const { error } = await sb.from('rationale')
    .upsert({ sub_capability_id: subId, vendor_id: vendorId, ...fields, updated_at: stamp() });
  must(error);
}
export async function deleteRationale(subId, vendorId) {
  const { error } = await sb.from('rationale').delete().eq('sub_capability_id', subId).eq('vendor_id', vendorId);
  must(error);
}

// ---------------- use_case_library ----------------
export async function listLibrary() {
  const { data, error } = await sb.from('use_case_library').select('*').order('sort_order');
  must(error); return data || [];
}
export async function upsertLibraryItem(id, fields, sortOrder) {
  const { error } = await sb.from('use_case_library').upsert({ id, ...fields, sort_order: sortOrder, updated_at: stamp() });
  must(error);
}
export async function deleteLibraryItem(id) { const { error } = await sb.from('use_case_library').delete().eq('id', id); must(error); }

export async function listLibraryCapLinks() {
  const { data, error } = await sb.from('use_case_library_capabilities').select('use_case_id,capability_id');
  must(error); return data || [];
}
export async function addLibraryCapLink(useCaseId, capId) {
  const { error } = await sb.from('use_case_library_capabilities').upsert({ use_case_id: useCaseId, capability_id: capId });
  must(error);
}
export async function removeLibraryCapLink(useCaseId, capId) {
  const { error } = await sb.from('use_case_library_capabilities').delete().eq('use_case_id', useCaseId).eq('capability_id', capId);
  must(error);
}

// ---------------- assessments ----------------
export async function listAssessments() {
  const { data, error } = await sb.from('assessments').select('id,name,client,updated_at').order('updated_at', { ascending: false });
  must(error); return data || [];
}
export async function createAssessment(name, client) {
  const { data, error } = await sb.from('assessments').insert({ name, client }).select('id').single();
  must(error); return data.id;
}
export async function getAssessmentMeta(id) {
  const { data, error } = await sb.from('assessments').select('name,client').eq('id', id).single();
  must(error); return data;
}
export async function delAssessment(id) { const { error } = await sb.from('assessments').delete().eq('id', id); must(error); }

// ---------------- assessment_priorities (MoSCoW per capability) ----------------
export async function listPriorities(assessmentId) {
  const { data, error } = await sb.from('assessment_priorities').select('capability_id,moscow').eq('assessment_id', assessmentId);
  must(error); return data || [];
}
export async function setPriority(assessmentId, capId, moscow) {
  const { error } = await sb.from('assessment_priorities')
    .upsert({ assessment_id: assessmentId, capability_id: capId, moscow, updated_at: stamp() });
  must(error);
}

// ---------------- assessment_sub_needs ("in scope" per sub-capability) ----------------
export async function listSubNeeds(assessmentId) {
  const { data, error } = await sb.from('assessment_sub_needs').select('sub_capability_id,needed').eq('assessment_id', assessmentId);
  must(error); return data || [];
}
export async function setSubNeed(assessmentId, subId, needed) {
  const { error } = await sb.from('assessment_sub_needs')
    .upsert({ assessment_id: assessmentId, sub_capability_id: subId, needed, updated_at: stamp() });
  must(error);
}

// ---------------- assessment_use_cases (client-captured use cases) ----------------
export async function listAssessmentUseCases(assessmentId) {
  const { data, error } = await sb.from('assessment_use_cases').select('*').eq('assessment_id', assessmentId).order('sort_order');
  must(error); return data || [];
}
export async function insertAssessmentUseCase(row) {
  const { error } = await sb.from('assessment_use_cases').upsert(row);
  must(error);
}
export async function updateAssessmentUseCase(id, fields) {
  const { error } = await sb.from('assessment_use_cases').update({ ...fields, updated_at: stamp() }).eq('id', id);
  must(error);
}
export async function deleteAssessmentUseCase(id) { const { error } = await sb.from('assessment_use_cases').delete().eq('id', id); must(error); }

export async function listAssessmentUseCaseCapLinks(assessmentId) {
  const { data, error } = await sb.from('assessment_use_case_capabilities')
    .select('use_case_id,capability_id').eq('assessment_id', assessmentId);
  must(error); return data || [];
}
export async function addUseCaseCapLink(assessmentId, useCaseId, capId) {
  const { error } = await sb.from('assessment_use_case_capabilities')
    .upsert({ assessment_id: assessmentId, use_case_id: useCaseId, capability_id: capId });
  must(error);
}
export async function removeUseCaseCapLink(useCaseId, capId) {
  const { error } = await sb.from('assessment_use_case_capabilities').delete().eq('use_case_id', useCaseId).eq('capability_id', capId);
  must(error);
}
