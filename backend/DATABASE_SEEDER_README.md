# Database Seeder

This feature automatically creates default admin users when the NestJS application starts for the first time.

## 🚀 Features

- **Automatic Admin Creation**: Creates a default admin user on first startup
- **Default User Roles**: Creates editor and viewer users for testing
- **Configurable Credentials**: All default credentials can be customized via environment variables
- **Safe Operation**: Only creates users if they don't already exist
- **Database Connection Handling**: Includes retry logic for database connection issues

## 📋 Default Users Created

| Role | Email | Password | Name |
|------|-------|----------|------|
| Admin | admin@example.com | admin123 | System Administrator |
| Editor | editor@example.com | editor123 | Default Editor |
| Viewer | viewer@example.com | viewer123 | Default Viewer |

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the backend directory with the following variables:

```bash
# Default Admin Users
DEFAULT_ADMIN_EMAIL=admin@example.com
DEFAULT_ADMIN_PASSWORD=admin123
DEFAULT_ADMIN_NAME=System Administrator

# Default Editor User
DEFAULT_EDITOR_EMAIL=editor@example.com
DEFAULT_EDITOR_PASSWORD=editor123

# Default Viewer User
DEFAULT_VIEWER_EMAIL=viewer@example.com
DEFAULT_VIEWER_PASSWORD=viewer123
```

### Configuration File

The seeder uses the configuration structure defined in `src/config/admin.config.ts`:

```typescript
export default () => ({
  admin: {
    defaultEmail: process.env.DEFAULT_ADMIN_EMAIL || 'admin@example.com',
    defaultPassword: process.env.DEFAULT_ADMIN_PASSWORD || 'admin123',
    defaultName: process.env.DEFAULT_ADMIN_NAME || 'System Administrator',
    // ... more config
  },
});
```

## 🔧 How It Works

1. **Application Startup**: When the NestJS app starts, the `DatabaseSeederModule` initializes
2. **Database Connection**: Waits for database connection to be established
3. **User Check**: Checks if admin users already exist
4. **User Creation**: Creates default users only if they don't exist
5. **Logging**: Provides detailed logging of the seeding process

## 📁 File Structure

```
src/database/
├── database.module.ts          # Database module with repositories
├── database-seeder.module.ts   # Main seeder module (runs on startup)
├── seeder.service.ts           # Seeding logic service
└── seeder.service.spec.ts      # Unit tests for seeder service
```

## 🧪 Testing

Run the seeder tests:

```bash
# Run all tests
npm test

# Run only seeder tests
npm test -- --testPathPattern=seeder.service.spec.ts

# Run tests with coverage
npm run test:cov
```

## 🐳 Docker Integration

The seeder is automatically included in Docker builds and will run when the container starts.

### Docker Build

```bash
# Build with tests
docker build --target test -t backend-test .

# Build production image
docker build -t backend .
```

### Docker Run

```bash
# Run container
docker run -p 3000:3000 backend

# Check logs for seeding information
docker logs <container_id>
```

## 🔍 Monitoring

The seeder provides detailed logging:

```
🌱 Starting database seeding...
👥 Seeding admin users...
✅ Created admin user: admin@example.com
✅ Created default user: editor@example.com
✅ Created default user: viewer@example.com
✅ Database seeding completed successfully!
```

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Ensure PostgreSQL is running
   - Check database credentials in `.env`
   - Verify database exists

2. **Seeding Errors**
   - Check application logs
   - Verify database permissions
   - Ensure entities are properly configured

3. **Users Not Created**
   - Check if users already exist
   - Verify environment variables
   - Check database logs

### Debug Mode

Enable debug logging by setting the log level in your application configuration.

## 🔒 Security Notes

- **Change Default Passwords**: Always change default passwords in production
- **Environment Variables**: Use strong, unique passwords in production
- **Access Control**: Limit access to admin accounts
- **Audit Logging**: Monitor user creation and access

## 📚 API Usage

After seeding, you can use the default admin account to:

1. **Login**: `POST /auth/login` with admin credentials
2. **Create Users**: Use admin role to create additional users
3. **Manage System**: Access admin-only endpoints

## 🔄 Customization

### Adding More Default Users

Modify the `createDefaultUsers()` method in `seeder.service.ts`:

```typescript
private async createDefaultUsers() {
  const defaultUsers = [
    // ... existing users
    {
      email: 'custom@example.com',
      password: 'custom123',
      name: 'Custom User',
      role: UserRole.EDITOR,
      isActive: true,
    },
  ];
  // ... rest of the method
}
```

### Custom Seeding Logic

Extend the `SeederService` to add more seeding methods:

```typescript
async seed() {
  await this.seedAdminUsers();
  await this.seedCustomData();  // Add your custom seeding
  await this.seedOtherData();   // Add more seeding methods
}
```

## 📞 Support

For issues or questions about the database seeder:

1. Check the application logs
2. Verify database connectivity
3. Review environment configuration
4. Check unit tests for expected behavior
