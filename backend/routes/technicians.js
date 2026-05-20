const buildCrud = require('./_crudFactory');
module.exports = buildCrud({
  table: 'technicians',
  fields: ['tech_id','name','certifications','base','status','contact'],
});
