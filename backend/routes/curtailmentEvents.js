const buildCrud = require('./_crudFactory');
module.exports = buildCrud({
  table: 'curtailment_events',
  fields: ['event_id','site','reason','mw_curtailed','start_at','end_at'],
});
