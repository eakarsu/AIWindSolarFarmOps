const buildCrud = require('./_crudFactory');
module.exports = buildCrud({
  table: 'performance_kpis',
  fields: ['kpi_id','site','kpi','value','period','target'],
});
