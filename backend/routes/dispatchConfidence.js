const express = require('express');
const router = express.Router();

router.post('/score', (req, res) => {
  const body = req.body || {};
  const forecastMwh = Number(body.forecast_mwh || 0);
  const committedMwh = Number(body.committed_mwh || 0);
  const curtailment = Number(body.curtailment_risk_pct || 0);
  const faultedAssets = Number(body.faulted_assets || 0);
  const margin = forecastMwh - committedMwh;
  const score = Math.max(0, Math.min(100, Math.round(80 + margin * 0.3 - curtailment * 0.7 - faultedAssets * 8)));
  res.json({
    site: body.site || 'site',
    dispatch_confidence: score,
    band: score >= 75 ? 'confident' : score >= 50 ? 'watch' : 'at risk',
    margin_mwh: Number(margin.toFixed(2)),
    actions: [
      margin < 0 ? 'Bid replacement energy or reduce dispatch commitment.' : 'Commitment has positive forecast margin.',
      curtailment > 25 ? 'Model ISO curtailment scenario before final bid.' : 'Curtailment risk is within normal range.',
      faultedAssets > 0 ? 'Confirm fault restoration ETA before gate closure.' : 'No faulted asset derate applied.',
    ],
    generated_at: new Date().toISOString(),
  });
});

module.exports = router;
