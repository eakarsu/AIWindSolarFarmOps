const buildCrud = require('./_crudFactory');
module.exports = buildCrud({
  table: 'panels',
  fields: ['panel_id','array_name','model','tilt_deg','azimuth','status'],
});
