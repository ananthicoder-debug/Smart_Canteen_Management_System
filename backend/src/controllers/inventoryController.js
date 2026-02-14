// Wrapper: map legacy names to canonical inventory.controller exports
const canonical = require('./inventory.controller');
module.exports = {
  listInventory: canonical.list,
  updateStock: canonical.update
};
