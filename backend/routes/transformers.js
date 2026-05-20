const buildCrud = require('./_crudFactory');
module.exports = buildCrud({
  table: 'transformers',
  fields: ['xfmr_id','site','voltage_kv','status','last_inspection','manufacturer'],
});
