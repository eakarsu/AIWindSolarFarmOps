const buildCrud = require('./_crudFactory');
module.exports = buildCrud({
  table: 'sensor_streams',
  fields: ['stream_id','asset_id','sensor','units','last_value','last_ts'],
});
