const buildCrud = require('./_crudFactory');
module.exports = buildCrud({
  table: 'spare_parts',
  fields: ['part_id','sku','description','qty_on_hand','location','reorder_point'],
});
