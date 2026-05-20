const buildCrud = require('./_crudFactory');
module.exports = buildCrud({
  table: 'ppa_contracts',
  fields: ['ppa_id','counterparty','term_years','price_per_mwh','start_date','status'],
});
