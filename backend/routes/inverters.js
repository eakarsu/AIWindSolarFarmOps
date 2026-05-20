const buildCrud = require('./_crudFactory');
module.exports = buildCrud({
  table: 'inverters',
  fields: ['inverter_id','site','vendor','model','status','last_event'],
});
