const buildCrud = require('./_crudFactory');
module.exports = buildCrud({
  table: 'work_orders',
  fields: ['wo_id','asset_id','type','priority','assignee','status'],
});
