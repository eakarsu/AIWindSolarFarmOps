const buildCrud = require('./_crudFactory');
module.exports = buildCrud({
  table: 'safety_incidents',
  fields: ['incident_id','site','type','severity','opened_at','status'],
});
