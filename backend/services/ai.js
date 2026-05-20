// AI helper service for AIWindSolarFarmOps
// Reads OPENROUTER_API_KEY and OPENROUTER_MODEL from:
//   1. this project's .env (already loaded by server.js)
//   2. fallback: /Users/erolakarsu/projects/beauty-wellness-ai/.env (canonical source)
// Never overwrites or wipes credentials.

const fs = require('fs');

const FALLBACK_ENV = '/Users/erolakarsu/projects/beauty-wellness-ai/.env';

function readFallbackEnv() {
  try {
    if (!fs.existsSync(FALLBACK_ENV)) return {};
    const raw = fs.readFileSync(FALLBACK_ENV, 'utf8');
    const out = {};
    for (const line of raw.split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      let val = m[2];
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
      out[m[1]] = val;
    }
    return out;
  } catch (e) {
    console.warn('[ai] fallback env read failed:', e.message);
    return {};
  }
}

function getOpenRouterCreds() {
  const fb = readFallbackEnv();
  const key = process.env.OPENROUTER_API_KEY || fb.OPENROUTER_API_KEY || '';
  const model = process.env.OPENROUTER_MODEL || fb.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5';
  return { key, model };
}

const SYSTEM_PROMPT =
  'You are a senior renewable-energy operations analyst supporting a wind/solar farm command center. ' +
  'You provide rigorous, engineering-grade reasoning on turbine and inverter health, curtailment, PPA settlement, ' +
  'maintenance scheduling, weather forecasting, and grid availability. ' +
  'Always return STRICT JSON in the exact schema requested — no markdown, no fenced blocks, no prose outside JSON.';

function callOpenRouter(systemPrompt, userPrompt) {
  return new Promise((resolve) => {
    const { key, model } = getOpenRouterCreds();
    if (!key) {
      return resolve({ error: 'OPENROUTER_API_KEY not configured' });
    }
    const https = require('https');
    const payload = JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.5,
      max_tokens: 2000,
    });

    const options = {
      hostname: 'openrouter.ai',
      path: '/api/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        Authorization: `Bearer ${key}`,
        'HTTP-Referer': 'http://localhost:3062',
        'X-Title': 'AI Wind Solar Farm Ops',
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (parsed.error) {
            return resolve({ error: parsed.error.message || 'OpenRouter error', raw: body });
          }
          const content = parsed.choices?.[0]?.message?.content || '';
          resolve(content);
        } catch (e) {
          resolve({ error: 'AI response parse failed', raw: body });
        }
      });
    });
    req.on('error', (e) => resolve({ error: e.message }));
    req.write(payload);
    req.end();
  });
}

function safeJsonParse(response, fallback) {
  if (response && typeof response === 'object' && response.error) {
    return { ...fallback, error: response.error };
  }
  if (response == null) return { ...fallback, summary: '' };
  if (typeof response === 'object') return response;
  const text = String(response).trim();
  try { return JSON.parse(text); } catch (_) {}
  try {
    const start = text.indexOf('{');
    if (start !== -1) {
      let depth = 0, inStr = false, esc = false;
      for (let i = start; i < text.length; i++) {
        const ch = text[i];
        if (esc) { esc = false; continue; }
        if (ch === '\\') { esc = true; continue; }
        if (ch === '"') { inStr = !inStr; continue; }
        if (inStr) continue;
        if (ch === '{') depth++;
        else if (ch === '}') { depth--; if (depth === 0) return JSON.parse(text.slice(start, i + 1)); }
      }
    }
  } catch (_) {}
  try {
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (fenced && fenced[1]) return JSON.parse(fenced[1].trim());
  } catch (_) {}
  return { ...fallback, summary: text };
}

// ─────────────────────────────────────────────────────────────
// 16 AI verbs for renewable energy operations
// ─────────────────────────────────────────────────────────────

async function forecastGeneration(site, horizon = {}) {
  const sys = `${SYSTEM_PROMPT} Forecast generation (MWh) for a wind/solar site over the requested horizon. Return strict JSON:
{
  "site": string,
  "horizon_hours": number,
  "hourly_forecast": [{ "hour_offset": number, "mw_expected": number, "confidence_pct": number, "driver": string }],
  "peak_mw": number,
  "trough_mw": number,
  "total_mwh": number,
  "weather_drivers": [string],
  "confidence": number,
  "summary": string
}`;
  const usr = `Site: ${site}\nHorizon / context:\n${JSON.stringify(horizon, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', hourly_forecast: [] });
}

async function faultPrognostic(asset, sensorData = {}) {
  const sys = `${SYSTEM_PROMPT} Predict probable component failure from sensor + fault history. Return strict JSON:
{
  "asset_id": string,
  "component_at_risk": string,
  "failure_probability_pct": number,
  "predicted_window_hours": number,
  "leading_indicators": [{ "signal": string, "value": string, "trend": "rising"|"falling"|"steady", "concern": "low"|"medium"|"high" }],
  "recommended_action": string,
  "urgency": "routine"|"urgent"|"critical",
  "estimated_downtime_hours": number,
  "summary": string
}`;
  const usr = `Asset:\n${JSON.stringify(asset, null, 2)}\n\nSensor data / fault history:\n${JSON.stringify(sensorData, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', leading_indicators: [] });
}

async function curtailmentOptimize(site, context = {}) {
  const sys = `${SYSTEM_PROMPT} Recommend curtailment strategy to maximize revenue under grid + PPA constraints. Return strict JSON:
{
  "site": string,
  "recommended_strategy": string,
  "blocks": [{ "start_hour": number, "end_hour": number, "mw_curtailed": number, "reason": string, "revenue_impact_usd": number }],
  "total_mwh_curtailed": number,
  "total_revenue_protected_usd": number,
  "alternatives": [{ "name": string, "tradeoff": string }],
  "summary": string
}`;
  const usr = `Site: ${site}\nContext:\n${JSON.stringify(context, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', blocks: [] });
}

async function ppaSettlement(ppa, generationData = {}) {
  const sys = `${SYSTEM_PROMPT} Settle a PPA period: compute delivered energy, payable, deviation vs floor/ceiling. Return strict JSON:
{
  "ppa_id": string,
  "counterparty": string,
  "period": string,
  "delivered_mwh": number,
  "contract_price_per_mwh": number,
  "gross_payable_usd": number,
  "deviations": [{ "type": string, "mwh": number, "penalty_usd": number }],
  "net_payable_usd": number,
  "anomalies": [string],
  "summary": string
}`;
  const usr = `PPA:\n${JSON.stringify(ppa, null, 2)}\n\nGeneration:\n${JSON.stringify(generationData, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', deviations: [] });
}

async function scheduleMaintenance(workOrders = [], constraints = {}) {
  const sys = `${SYSTEM_PROMPT} Build an optimized maintenance schedule across crews, weather windows, and lost-revenue. Return strict JSON:
{
  "schedule": [{ "wo_id": string, "asset_id": string, "crew": string, "window_start": string, "window_end": string, "expected_hours": number, "lost_mwh": number, "rationale": string }],
  "deferred": [{ "wo_id": string, "reason": string }],
  "crew_utilization_pct": number,
  "total_lost_mwh": number,
  "summary": string
}`;
  const usr = `Work orders:\n${JSON.stringify(workOrders, null, 2)}\n\nConstraints:\n${JSON.stringify(constraints, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', schedule: [] });
}

async function fleetHealth(assets = []) {
  const sys = `${SYSTEM_PROMPT} Score fleet health and call out worst-offender assets. Return strict JSON:
{
  "fleet_health_score": number,
  "availability_pct": number,
  "capacity_factor_pct": number,
  "worst_assets": [{ "asset_id": string, "site": string, "issue": string, "severity": "low"|"medium"|"high"|"critical" }],
  "by_site": [{ "site": string, "score": number, "narrative": string }],
  "recommendations": [string],
  "summary": string
}`;
  const usr = `Fleet (sample):\n${JSON.stringify(assets, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', worst_assets: [] });
}

async function weatherWindow(site, activity = '', forecast = {}) {
  const sys = `${SYSTEM_PROMPT} Identify safe weather windows for a maintenance activity (e.g. blade work, crane lift). Return strict JSON:
{
  "site": string,
  "activity": string,
  "constraints": [{ "parameter": string, "limit": string }],
  "windows": [{ "start": string, "end": string, "wind_mps": number, "ceiling_m": number, "go_no_go": "go"|"caution"|"no_go", "notes": string }],
  "best_window": { "start": string, "end": string, "rationale": string },
  "summary": string
}`;
  const usr = `Site: ${site}\nActivity: ${activity}\nForecast:\n${JSON.stringify(forecast, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', windows: [] });
}

async function bladeInspectionSummary(inspection = {}) {
  const sys = `${SYSTEM_PROMPT} Summarize a turbine blade inspection (drone imagery / report). Return strict JSON:
{
  "turbine_id": string,
  "blade_count": number,
  "findings": [{ "blade": string, "defect": string, "severity": "low"|"medium"|"high"|"critical", "location": string, "recommended_repair": string }],
  "overall_condition": "good"|"fair"|"poor"|"critical",
  "estimated_repair_cost_usd": number,
  "next_inspection_recommended_in_months": number,
  "summary": string
}`;
  const usr = `Inspection input:\n${JSON.stringify(inspection, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', findings: [] });
}

async function draftWorkOrder(intent, asset = {}) {
  const sys = `${SYSTEM_PROMPT} Draft a complete work order from a natural-language intent. Return strict JSON:
{
  "wo_id_suggested": string,
  "asset_id": string,
  "type": string,
  "priority": "low"|"normal"|"high"|"critical",
  "scope": string,
  "tasks": [{ "step": number, "description": string, "estimated_hours": number, "required_certification": string }],
  "parts_required": [{ "sku": string, "description": string, "qty": number }],
  "ppe_required": [string],
  "lockout_tagout_steps": [string],
  "summary": string
}`;
  const usr = `Intent: ${intent}\nAsset:\n${JSON.stringify(asset, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', tasks: [] });
}

async function executiveBrief(snapshot = {}) {
  const sys = `${SYSTEM_PROMPT} Produce a daily executive operations brief across the renewable fleet. Return strict JSON:
{
  "headline": string,
  "operational_picture": string,
  "availability": { "fleet_pct": number, "narrative": string },
  "production_today_mwh": number,
  "production_vs_forecast_pct": number,
  "active_curtailments": [{ "site": string, "mw": number, "reason": string }],
  "top_issues": [{ "issue": string, "severity": "low"|"medium"|"high"|"critical", "owner": string }],
  "decisions_required": [{ "decision": string, "deadline": string, "options": [string], "recommendation": string }],
  "next_24h_outlook": string,
  "summary": string
}`;
  const usr = `Snapshot:\n${JSON.stringify(snapshot, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response' });
}

async function rampRateStrategy(site, gridRules = {}) {
  const sys = `${SYSTEM_PROMPT} Recommend ramp-rate control settings to satisfy grid code and avoid penalties. Return strict JSON:
{
  "site": string,
  "current_ramp_mw_per_min": number,
  "recommended_ramp_mw_per_min": number,
  "rationale": string,
  "scenarios": [{ "scenario": string, "ramp_mw_per_min": number, "expected_penalty_usd": number }],
  "violation_risk_pct": number,
  "summary": string
}`;
  const usr = `Site: ${site}\nGrid rules:\n${JSON.stringify(gridRules, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', scenarios: [] });
}

async function inverterClippingDetect(inverters = [], context = {}) {
  const sys = `${SYSTEM_PROMPT} Detect inverter clipping and quantify lost energy. Return strict JSON:
{
  "clipping_detected": boolean,
  "affected_inverters": [{ "inverter_id": string, "site": string, "clipping_pct": number, "lost_kwh_today": number, "evidence": string }],
  "site_summary": [{ "site": string, "total_lost_kwh": number, "severity": "low"|"medium"|"high" }],
  "recommendations": [string],
  "summary": string
}`;
  const usr = `Inverters:\n${JSON.stringify(inverters, null, 2)}\n\nContext:\n${JSON.stringify(context, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', affected_inverters: [] });
}

async function turbineAvailability(turbines = [], window = {}) {
  const sys = `${SYSTEM_PROMPT} Compute and explain turbine fleet availability over the window. Return strict JSON:
{
  "window": string,
  "fleet_availability_pct": number,
  "by_turbine": [{ "turbine_id": string, "site": string, "availability_pct": number, "downtime_hours": number, "cause": string }],
  "outage_categories": [{ "category": string, "hours": number, "share_pct": number }],
  "gap_to_contract_pct": number,
  "summary": string
}`;
  const usr = `Turbines:\n${JSON.stringify(turbines, null, 2)}\n\nWindow:\n${JSON.stringify(window, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', by_turbine: [] });
}

async function vendorWarrantyClaim(asset, faultHistory = {}) {
  const sys = `${SYSTEM_PROMPT} Draft a vendor warranty claim package. Return strict JSON:
{
  "asset_id": string,
  "vendor": string,
  "claim_title": string,
  "claim_summary": string,
  "evidence": [{ "type": string, "reference": string, "narrative": string }],
  "estimated_value_usd": number,
  "likelihood_of_approval_pct": number,
  "required_attachments": [string],
  "next_steps": [string],
  "summary": string
}`;
  const usr = `Asset:\n${JSON.stringify(asset, null, 2)}\n\nFault history:\n${JSON.stringify(faultHistory, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', evidence: [] });
}

async function assetDegTrend(asset, history = {}) {
  const sys = `${SYSTEM_PROMPT} Quantify degradation trend for an asset (e.g. solar array soiling, turbine power curve drift). Return strict JSON:
{
  "asset_id": string,
  "metric": string,
  "current_value": number,
  "baseline_value": number,
  "deg_pct_per_year": number,
  "trend": "improving"|"flat"|"degrading"|"accelerating",
  "drivers": [string],
  "projected_eol_years": number,
  "recommended_intervention": string,
  "summary": string
}`;
  const usr = `Asset:\n${JSON.stringify(asset, null, 2)}\n\nHistory:\n${JSON.stringify(history, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', drivers: [] });
}

async function rootCauseAnalyzer(incident, evidence = {}) {
  const sys = `${SYSTEM_PROMPT} Perform a structured root-cause analysis (RCA) on an incident. Return strict JSON:
{
  "incident": string,
  "immediate_cause": string,
  "contributing_factors": [{ "factor": string, "category": "design"|"manufacture"|"install"|"operate"|"maintain"|"environment", "evidence": string }],
  "root_cause": string,
  "5_whys": [string],
  "corrective_actions": [{ "action": string, "owner": string, "due_date": string, "preventive": boolean }],
  "lessons_learned": [string],
  "summary": string
}`;
  const usr = `Incident: ${incident}\nEvidence:\n${JSON.stringify(evidence, null, 2)}`;
  const r = await callOpenRouter(sys, usr);
  return safeJsonParse(r, { summary: typeof r === 'string' ? r : 'No response', contributing_factors: [] });
}

module.exports = {
  callOpenRouter,
  safeJsonParse,
  forecastGeneration,
  faultPrognostic,
  curtailmentOptimize,
  ppaSettlement,
  scheduleMaintenance,
  fleetHealth,
  weatherWindow,
  bladeInspectionSummary,
  draftWorkOrder,
  executiveBrief,
  rampRateStrategy,
  inverterClippingDetect,
  turbineAvailability,
  vendorWarrantyClaim,
  assetDegTrend,
  rootCauseAnalyzer,
};
