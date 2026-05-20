const buildCrud = require('./_crudFactory');
module.exports = buildCrud({
  table: 'weather_forecasts',
  fields: ['forecast_id','site','valid_at','wind_mps','irradiance_wm2','temperature_c'],
});
