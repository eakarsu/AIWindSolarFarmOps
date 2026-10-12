import React, { useState } from 'react';
import ReadableAIReport from '../components/AIResultView';
import useNativeAIRequest from '../components/useNativeAIRequest';
import NativeAIControls from '../components/NativeAIControls';
import { dispatchConfidenceScore } from '../services/api';
const fields=[["site","Site","text"],["forecast_mwh","Forecast generation (MWh)","number"],["committed_mwh","Committed generation (MWh)","number"],["curtailment_risk_pct","Curtailment risk (%)","number"],["faulted_assets","Faulted assets","number"]];
const examples=[{"site":"Example: High Plains Hybrid","forecast_mwh":860,"committed_mwh":790,"curtailment_risk_pct":18,"faulted_assets":2},{"site":"Example: Coastal solar","forecast_mwh":640,"committed_mwh":600,"curtailment_risk_pct":8,"faulted_assets":0},{"site":"Example: Storm-limited wind","forecast_mwh":540,"committed_mwh":620,"curtailment_risk_pct":32,"faulted_assets":4}];
export default function AIDispatchConfidencePage() {
  const [form,setForm]=useState(examples[0]); const request=useNativeAIRequest();
  const presets=examples.map((values,index)=>({label:['Baseline scenario','Lower exposure','Higher exposure'][index],values}));
  const payload=()=>Object.fromEntries(fields.map(([key,,type])=>[key,type==='number'?Number(form[key]):form[key]]));
  const valid=fields.every(([key,,type])=>String(form[key]??'').trim()&&(type!=='number'||Number.isFinite(Number(form[key]))&&Number(form[key])>=0));
  const calculate=async event=>{event.preventDefault();if(!valid)return;await request.run(options=>dispatchConfidenceScore(payload(),options));};
  return <section className="page"><header className="page-header"><h2>Dispatch indicator calculator</h2></header><p>AI forecasting is unavailable in this workspace. This calculator uses a fixed formula and requires the calculator service to be available.</p><NativeAIControls request={request} presets={presets} description="Each example fills every planning input. Review it before calculating." onFill={values=>setForm({...values})} /><form className="card" onSubmit={calculate}><div className="form-grid">{fields.map(([key,label,type])=><label key={key} htmlFor={'planning-'+key}>{label}<input id={'planning-'+key} type={type} min={type==='number'?0:undefined} step={type==='number'?'any':undefined} required disabled={request.loading} value={form[key]} onChange={event=>setForm({...form,[key]:event.target.value})} /></label>)}</div><button className="btn btn-primary" type="submit" disabled={!valid||request.loading} style={{marginTop:16}}>{request.loading?'Calculating…':'Calculate local indicator'}</button></form>{request.result&&<ReadableAIReport result={request.result} title="Local formula result" />}</section>;
}
