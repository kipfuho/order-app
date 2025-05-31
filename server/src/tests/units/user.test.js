import userService from '../../auth/services/user.service';

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

    it('should create admin user when role is specified', async () => {
      const userData = {
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'ADMIN',
      };

      const user = await userService.createUser(userData);

      expect(user.role).toBe('ADMIN');
    });

    it('should throw error for duplicate email', async () => {
      const userData = {
        email: 'duplicate@example.com',
        name: 'First User',
      };

      await userService.createUser(userData);

      await expect(
        userService.createUser({
          email: 'duplicate@example.com',
          name: 'Second User',
        })
      ).rejects.toThrow();
    });
  });
});
