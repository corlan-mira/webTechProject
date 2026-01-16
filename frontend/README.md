# Event Attendance System - Frontend

React-based Single Page Application for the Event Attendance Monitoring System.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ LTS
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
copy .env.example .env

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable components
│   │   ├── Navbar.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── LoadingSpinner.jsx
│   │   └── ErrorAlert.jsx
│   ├── pages/              # Page components
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── EventGroupsPage.jsx
│   │   ├── EventGroupDetailPage.jsx
│   │   ├── EventDetailPage.jsx
│   │   ├── CheckInPage.jsx
│   │   └── AttendancePage.jsx
│   ├── services/           # API services
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── eventGroupService.js
│   │   ├── eventService.js
│   │   └── attendanceService.js
│   ├── context/            # React Context
│   │   └── AuthContext.jsx
│   ├── utils/              # Utility functions
│   │   ├── constants.js
│   │   ├── validators.js
│   │   └── formatters.js
│   ├── App.jsx             # Main app component
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles
├── public/
├── index.html
├── vite.config.js
└── package.json
```

## 🎯 Features

### Authentication
- User registration
- User login with JWT
- Protected routes
- Automatic token refresh

### Event Management
- Create/Edit/Delete event groups
- Create/Edit/Delete events
- Toggle event state (OPEN/CLOSED)
- View access codes and QR codes

### Check-In
- Text code check-in
- QR code scanner check-in
- No authentication required for participants

### Attendance
- Real-time attendance list
- Filter by check-in method
- Search by name/email
- Export to CSV/XLSX

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:5000/api
```

For production, update the API URL to your deployed backend.

## 📦 Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🎨 Design System

The application uses a modern design system with:
- CSS variables for theming
- Responsive design (mobile, tablet, desktop)
- Bootstrap 5 components
- Custom animations and transitions
- Premium color palette

## 🔐 Authentication Flow

1. User registers with email/password
2. User logs in and receives JWT token
3. Token is stored in localStorage
4. Token is automatically attached to API requests
5. Protected routes check for valid token

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (< 768px)

## 🧪 Testing

### Manual Testing Checklist

**Authentication:**
- [ ] Register new user
- [ ] Login with credentials
- [ ] Logout
- [ ] Access protected routes

**Event Groups:**
- [ ] Create event group
- [ ] Edit event group
- [ ] Delete event group
- [ ] View event group details

**Events:**
- [ ] Create event
- [ ] View event details
- [ ] Toggle event state
- [ ] Delete event

**Check-In:**
- [ ] Check in with text code
- [ ] Check in with QR code
- [ ] Verify attendance appears in list

**Export:**
- [ ] Export attendance to CSV
- [ ] Export attendance to XLSX

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized build in the `dist/` directory.

### Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel deploy --prod
```

### Deploy to Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

## 🔗 API Integration

The frontend communicates with the backend API at the URL specified in `VITE_API_URL`.

All API calls are made through the services in `src/services/`:
- `authService.js` - Authentication
- `eventGroupService.js` - Event groups
- `eventService.js` - Events
- `attendanceService.js` - Check-in and attendance

## 📝 Notes

- QR code scanning requires camera permissions
- The application uses localStorage for token persistence
- All dates are formatted in local timezone
- Export functionality downloads files directly to browser

## 🐛 Troubleshooting

**Issue: Cannot connect to backend**
- Verify backend is running on port 5000
- Check VITE_API_URL in .env file
- Ensure CORS is configured on backend

**Issue: QR scanner not working**
- Grant camera permissions in browser
- Use HTTPS in production (required for camera access)
- Fallback to text code if camera unavailable

**Issue: Build fails**
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`

## 📄 License

Educational project for Web Technology course.
