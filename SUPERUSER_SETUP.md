# ERP Authentication System - Super User Setup

## Database Configuration

### PostgreSQL Setup Required
```sql
-- Create database
CREATE DATABASE erpdb;

-- Create user
CREATE USER erp_user WITH ENCRYPTED PASSWORD 'erp_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE erpdb TO erp_user;
```

### Connection Details
- **Host**: localhost
- **Port**: 5432
- **Database**: erpdb
- **Username**: erp_user
- **Password**: erp_password

## Super User Credentials

The application will automatically create a super admin user on first startup:

### Super Admin Account
```
Username: superadmin
Password: Admin@123!
Role: SUPER_ADMIN
Status: Enabled
```

## Authentication Features

### Security Implementation
- **Password Encoding**: BCrypt with strength 12
- **Session Management**: Single session per user
- **Authentication Type**: Session-based (no JWT)
- **Authorization**: Role-based access control

### Logging Configuration
- **Framework**: Log4j2
- **Console Logging**: DEBUG level for authentication
- **File Logging**: 
  - General logs: `logs/erp-app.log`
  - Security logs: `logs/security.log`

### Available Roles
- **SUPER_ADMIN**: Full system access
- **ADMIN**: Administrative access
- **USER**: Standard user access

## API Endpoints

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout  
- `GET /api/auth/status` - Check authentication status

### Test Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -d "username=superadmin&password=Admin@123!" \
  -H "Content-Type: application/x-www-form-urlencoded"
```

## Troubleshooting

### Common Issues
1. **Database Connection**: Ensure PostgreSQL is running and accessible
2. **User Creation**: Check logs for DataInitializer execution
3. **Login Failure**: Review security.log for authentication details
4. **Session Issues**: Verify session management configuration

### Debug Logging
Check the following log files for authentication debugging:
- `logs/security.log` - Authentication and authorization events
- `logs/erp-app.log` - General application logs
- Console output - Real-time debugging information

## Running the Application

```bash
# Start PostgreSQL service first
sudo systemctl start postgresql

# Run the application
mvn spring-boot:run

# Application will be available at http://localhost:8080
```

The super admin user will be created automatically when the application starts for the first time.