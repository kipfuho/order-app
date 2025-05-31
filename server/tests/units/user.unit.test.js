const userService = require('../../src/auth/services/user.service');
const { setupTestDB } = require('../setup');

setupTestDB();
describe('UserService', () => {
  describe('createUser', () => {
    it('should create a user with valid data', async () => {
      const userData = {
        email: 'john@example.com',
        name: 'John Doe',
        password: '1234567b',
      };

      const user = await userService.createUser(userData);

      expect(user).toMatchObject({
        email: 'john@example.com',
        name: 'John Doe',
        role: 'user',
      });
      expect(user.id).toBeDefined();
      expect(user.createdAt).toBeInstanceOf(Date);
    });

    it('should not create a user with invalid data', async () => {
      const user1Data = {
        email: 'john@example.com',
        name: 'John Doe',
        password: '1234567b',
      };

      const user2Data = {
        email: 'john@example.com',
        name: 'John Doe 2',
        password: '1234567b',
      };

      await userService.createUser(user1Data);
      await expect(userService.createUser(user2Data)).rejects.toThrow();
    });
  });
});
