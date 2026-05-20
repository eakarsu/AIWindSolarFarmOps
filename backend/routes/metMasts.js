const buildCrud = require('./_crudFactory');
module.exports = buildCrud({
  table: 'met_masts',
  fields: ['mast_id','site','height_m','instruments','status','last_calibration'],
});
