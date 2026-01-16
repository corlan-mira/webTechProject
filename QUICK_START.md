# 🚀 Quick Start Guide - Event Attendance System

## Prerequisites

Before you begin, ensure you have:
- ✅ Node.js 18+ installed ([Download](https://nodejs.org/))
- ✅ PostgreSQL or MySQL installed and running
- ✅ Git installed

## Step 1: Backend Setup (5 minutes)

### 1.1 Navigate to Backend
```powershell
cd backend
```

### 1.2 Install Dependencies
```powershell
npm install
```

### 1.3 Configure Environment
```powershell
# Copy the example environment file
copy .env.example .env

# Edit .env file with your database credentials
# Update these values:
# - DB_USERNAME=your_postgres_username
# - DB_PASSWORD=your_postgres_password
# - DB_NAME=event_attendance_system
# - JWT_SECRET=change_this_to_a_random_string
```

### 1.4 Create Database
```powershell
# For PostgreSQL
psql -U postgres
CREATE DATABASE event_attendance_system;
\q

# For MySQL
mysql -u root -p
CREATE DATABASE event_attendance_system;
exit
```

### 1.5 Run Migrations
```powershell
npm run migrate
```

### 1.6 Start Backend Server
```powershell
npm run dev
```

You should see:
```
✓ Database connection established
✓ Database synced
✓ Event state job: initialized
✓ Server running on port 5000
```

**Keep this terminal open!**

---

## Step 2: Frontend Setup (3 minutes)

### 2.1 Open New Terminal
Open a new PowerShell/Command Prompt window

### 2.2 Navigate to Frontend
```powershell
cd frontend
```

### 2.3 Install Dependencies
```powershell
npm install
```

This will install:
- React & React DOM
- React Router
- Axios
- Bootstrap & React Bootstrap
- html5-qrcode
- React Hook Form
- Vite

### 2.4 Configure Environment
```powershell
# Copy the example environment file
copy .env.example .env

# The default configuration should work:
# VITE_API_URL=http://localhost:5000/api
```

### 2.5 Start Frontend Server
```powershell
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

---

## Step 3: Test the Application (10 minutes)

### 3.1 Open Browser
Navigate to: **http://localhost:3000**

### 3.2 Register a New User
1. Click **"Register"** in the navbar
2. Fill in:
   - Name: `Test User`
   - Email: `test@example.com`
   - Password: `password123`
3. Click **"Create Account"**
4. You'll be redirected to login

### 3.3 Login
1. Enter your credentials
2. Click **"Sign In"**
3. You'll be redirected to the Dashboard

### 3.4 Create an Event Group
1. Click **"+ Create Event Group"** button
2. Fill in:
   - Group Name: `Test Conference 2024`
   - Description: `My first event group`
3. Click **"Create"**

### 3.5 Create an Event
1. Click **"View Events"** on your event group
2. Click **"+ Create Event"** button
3. Fill in:
   - Event Name: `Opening Session`
   - Description: `Welcome and introduction`
   - Start Date: Select today's date and time
   - End Date: Select a time 2 hours from now
4. Click **"Create Event"**

### 3.6 View Event Details
1. Click **"Details"** on your event
2. You'll see:
   - Event information
   - Access code (e.g., `ABC123`)
   - QR code image
   - Empty attendance list

### 3.7 Test Check-In (Text Code)
1. Open a **new incognito/private browser window**
2. Go to: **http://localhost:3000/check-in**
3. On the **"Text Code"** tab:
   - Enter the access code from step 3.6
   - Enter your name: `John Doe`
   - Enter email (optional): `john@example.com`
4. Click **"Check In"**
5. You should see: **"✓ Check-in successful!"**

### 3.8 Test Check-In (QR Code)
1. In the same incognito window, refresh the page
2. Click the **"QR Code"** tab
3. Click **"Allow"** when prompted for camera access
4. Point your camera at the QR code from step 3.6
5. The code will be scanned automatically
6. Enter your name: `Jane Smith`
7. Click **"Complete Check In"**

### 3.9 Verify Attendance
1. Go back to your main browser window (logged in)
2. Navigate to the event details page
3. You should see both check-ins in the attendance table:
   - John Doe (TEXT method)
   - Jane Smith (QR method)

### 3.10 Test Export
1. Click **"Export CSV"** - a CSV file should download
2. Click **"Export XLSX"** - an Excel file should download
3. Open the files to verify attendance data

---

## 🎉 Success!

Your Event Attendance System is now fully functional!

---

## Common Issues & Solutions

### Issue: PowerShell script execution error
**Error**: `npm : File C:\Program Files\nodejs\npm.ps1 cannot be loaded`

**Solution**: Run PowerShell as Administrator and execute:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Issue: Database connection failed
**Error**: `Database connection error`

**Solution**:
1. Verify PostgreSQL/MySQL is running
2. Check credentials in `backend/.env`
3. Ensure database exists

### Issue: Port already in use
**Error**: `Port 5000 is already in use`

**Solution**:
1. Find and kill the process using port 5000:
```powershell
netstat -ano | findstr :5000
taskkill /PID <process_id> /F
```
2. Or change the port in `backend/.env`: `PORT=5001`

### Issue: Cannot connect to backend
**Error**: Network error in browser console

**Solution**:
1. Verify backend is running on port 5000
2. Check `frontend/.env` has correct API URL
3. Restart both servers

### Issue: QR scanner not working
**Error**: Camera not accessible

**Solution**:
1. Grant camera permissions in browser
2. Use HTTPS in production (required for camera)
3. Fallback to text code method

---

## Next Steps

### For Development
- Modify components in `frontend/src/`
- Add new API endpoints in `backend/routes/`
- Customize styling in `frontend/src/index.css`

### For Production Deployment
See the [Implementation Plan](file:///C:/Users/lucia/.gemini/antigravity/brain/d83c0d5c-0c46-4bda-81c8-a31952026d6c/implementation_plan.md) for deployment instructions.

---

## File Structure

```
webTechProject/
├── backend/              ✅ Complete
│   ├── models/          (4 models)
│   ├── routes/          (5 route files)
│   ├── controllers/     (4 controllers)
│   ├── services/        (QR, export)
│   └── server.js
│
└── frontend/            ✅ Complete
    ├── src/
    │   ├── components/  (4 components)
    │   ├── pages/       (8 pages)
    │   ├── services/    (5 services)
    │   ├── context/     (AuthContext)
    │   └── utils/       (3 utility files)
    ├── index.html
    └── vite.config.js
```

---

## Support

- **Backend Docs**: `backend/README.md`
- **Frontend Docs**: `frontend/README.md`
- **API Documentation**: `docs/API.md`
- **Walkthrough**: See artifacts

---

**Happy coding! 🚀**
