#!/bin/bash
echo "=== ERP Authentication Test Script with PostgreSQL ==="
echo "Testing authentication with PostgreSQL database..."
echo ""

# Check if PostgreSQL is running
echo "1. Checking PostgreSQL connection..."
pg_isready -h localhost -p 5432 -U erp_user -d erpdb
if [ $? -ne 0 ]; then
    echo "ERROR: PostgreSQL is not running or database/user not configured"
    echo "Please run the following SQL commands first:"
    echo "CREATE DATABASE erpdb;"
    echo "CREATE USER erp_user WITH ENCRYPTED PASSWORD 'erp_password';"
    echo "GRANT ALL PRIVILEGES ON DATABASE erpdb TO erp_user;"
    exit 1
fi

echo "PostgreSQL connection successful!"
echo ""

# Start the application in background
echo "2. Starting Spring Boot application..."
mvn spring-boot:run &
APP_PID=$!

echo "Application started with PID: $APP_PID"
echo "Waiting 45 seconds for application startup and database initialization..."
sleep 45

echo ""
echo "=== Testing Authentication ==="
echo ""

# Test 1: Check if application is running
echo "3. Testing application health..."
curl -s http://localhost:8080/api/auth/status || echo "Application not responding"

echo ""
echo ""

# Test 2: Test login with super admin
echo "4. Testing login with super admin credentials..."
echo "Username: superadmin"
echo "Password: Admin@123!"

LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -d "username=superadmin&password=Admin@123!" \
  -H "Content-Type: application/x-www-form-urlencoded")

echo "Login Response: $LOGIN_RESPONSE"

echo ""
echo ""

# Test 3: Check application logs
echo "5. Checking authentication logs..."
if [ -f logs/security.log ]; then
    echo "Security log contents:"
    tail -10 logs/security.log
else
    echo "Security log not found"
fi

echo ""
echo ""

# Clean up
echo "Stopping application..."
kill $APP_PID

echo "=== Test Complete ==="