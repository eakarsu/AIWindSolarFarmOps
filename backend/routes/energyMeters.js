const buildCrud = require('./_crudFactory');
module.exports = buildCrud({
  table: 'energy_meters',
  fields: ['meter_id','site','reading_kwh','reading_at','status','comm_status'],
});
