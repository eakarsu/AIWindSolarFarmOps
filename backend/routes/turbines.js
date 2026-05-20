const buildCrud = require('./_crudFactory');
module.exports = buildCrud({
  table: 'turbines',
  fields: ['turbine_id','site','vendor','model','capacity_mw','status'],
});
