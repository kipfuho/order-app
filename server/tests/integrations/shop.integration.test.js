const { setupCompleteShopData } = require('../integration.util');
const { setupTestDB } = require('../setup');

setupTestDB();
describe('ShopManagement', () => {
  describe('fullsetup', () => {
    it('should setup a shop completely', async () => {
      await setupCompleteShopData();
    });
  });
});
