const buildCrud = require('./_crudFactory');
module.exports = buildCrud({
  table: 'faults',
  fields: ['fault_id','asset_id','code','severity','opened_at','status'],
});
