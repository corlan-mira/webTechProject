# Demo Video Recording Script

## Overview
- **Duration**: 5-7 minutes
- **Format**: Screen recording with voiceover
- **Tools**: OBS Studio, Windows Game Bar, or Loom

---

## Pre-Recording Checklist

- [ ] Application running locally or deployed
- [ ] Test user account created
- [ ] Browser window sized appropriately (1920x1080 recommended)
- [ ] Close unnecessary tabs and applications
- [ ] Disable notifications
- [ ] Prepare sample data (event names, participant names)
- [ ] Test microphone audio
- [ ] Have script nearby for reference

---

## Recording Script

### Scene 1: Introduction (30 seconds)

**Visual**: Landing page or login screen

**Script**:
> "Hello! Today I'm going to demonstrate the Event Attendance Monitoring System, a web application I built for managing event attendance using QR codes and text-based access codes.
>
> This application allows event organizers to create events, generate access codes, and track participant attendance in real-time. Let me show you how it works."

**Actions**:
- Show the landing page
- Briefly show the navigation

---

### Scene 2: User Authentication (30 seconds)

**Visual**: Login page → Dashboard

**Script**:
> "First, I'll log in as an event organizer. The application uses JWT-based authentication for secure access."

**Actions**:
1. Navigate to login page
2. Enter credentials:
   - Email: demo@example.com
   - Password: demo123
3. Click "Sign In"
4. Show dashboard loading

**Script (continued)**:
> "Once logged in, we see the dashboard with statistics about our events and quick action buttons."

---

### Scene 3: Creating an Event Group (45 seconds)

**Visual**: Dashboard → Event Groups page → Create modal

**Script**:
> "Let's create a new event group. I'll click on 'Manage Event Groups' and then 'Create Event Group'."

**Actions**:
1. Click "Manage Event Groups"
2. Click "+ Create Event Group"
3. Fill in form:
   - Name: "Tech Conference 2024"
   - Description: "Annual technology conference"
4. Click "Create"

**Script (continued)**:
> "Event groups help organize multiple related events. For example, a conference might have multiple sessions throughout the day."

**Actions**:
- Show the created event group in the list

---

### Scene 4: Creating an Event (60 seconds)

**Visual**: Event Group Detail → Create Event modal

**Script**:
> "Now I'll create an event within this group. I'll click 'View Events' and then 'Create Event'."

**Actions**:
1. Click "View Events" on the event group
2. Click "+ Create Event"
3. Fill in form:
   - Name: "Opening Keynote"
   - Description: "Welcome and introduction"
   - Start Date: [Today's date, current time]
   - End Date: [Today's date, +2 hours]
4. Click "Create Event"

**Script (continued)**:
> "The system automatically generates a unique access code for each event. Notice the access code here - participants will use this to check in."

**Actions**:
- Point out the access code
- Show the event card with OPEN/CLOSED badge

**Script (continued)**:
> "I can also toggle the event state between OPEN and CLOSED to control when check-ins are accepted."

---

### Scene 5: Viewing Event Details (45 seconds)

**Visual**: Event Detail page

**Script**:
> "Let me click on 'Details' to see the full event information."

**Actions**:
1. Click "Details" button
2. Show event details page

**Script (continued)**:
> "Here we can see the event details, the access code displayed prominently, and the QR code that participants can scan. The QR code is generated automatically using an external API."

**Actions**:
- Scroll to show access code
- Show QR code
- Point out the empty attendance list

**Script (continued)**:
> "Currently, no one has checked in yet. Let's change that."

---

### Scene 6: Participant Check-In (Text Code) (60 seconds)

**Visual**: Check-in page (new window/incognito)

**Script**:
> "Now I'll switch to the participant view. Participants don't need an account - they just go to the check-in page."

**Actions**:
1. Open new incognito window
2. Navigate to check-in page
3. Show the two tabs (Text Code and QR Code)

**Script (continued)**:
> "There are two ways to check in. First, let me demonstrate the text code method."

**Actions**:
1. Stay on "Text Code" tab
2. Enter the access code from the event
3. Fill in:
   - Name: "John Smith"
   - Email: "john@example.com"
4. Click "Check In"

**Script (continued)**:
> "After entering the access code and my information, I click 'Check In' and receive immediate confirmation."

**Actions**:
- Show success message

---

### Scene 7: Participant Check-In (QR Code) (45 seconds)

**Visual**: Check-in page (QR tab)

**Script**:
> "The second method is QR code scanning. I'll click the QR Code tab."

**Actions**:
1. Click "QR Code" tab
2. Allow camera access if prompted
3. Show QR scanner interface

**Script (continued)**:
> "The application uses the device camera to scan the QR code. In a real scenario, I would point my phone at the QR code displayed by the organizer."

**Actions**:
- If possible, scan the QR code from the other window
- Or explain: "For this demo, I'll use the text method again"
- Complete check-in with:
  - Name: "Jane Doe"
  - Email: "jane@example.com"

---

### Scene 8: Viewing Attendance (45 seconds)

**Visual**: Event Detail page with attendance

**Script**:
> "Now let's go back to the organizer view and see the attendance list."

**Actions**:
1. Switch back to organizer window
2. Refresh or navigate back to event details
3. Scroll to attendance section

**Script (continued)**:
> "Here we can see both participants who checked in, along with their check-in method and timestamp. The organizer can see this information in real-time."

**Actions**:
- Point out the attendance table
- Show the check-in method badges (TEXT/QR)
- Show timestamps

---

### Scene 9: Filtering and Exporting (45 seconds)

**Visual**: Attendance page with filters

**Script**:
> "The system also provides filtering and export capabilities. I can search by name or filter by check-in method."

**Actions**:
1. If on attendance page, show search box
2. Type a name to demonstrate search
3. Show filter dropdown

**Script (continued)**:
> "For reporting purposes, I can export the attendance data to CSV or Excel format."

**Actions**:
1. Click "Export CSV" button
2. Show file downloading
3. Optionally click "Export XLSX"

**Script (continued)**:
> "These files can be opened in Excel or Google Sheets for further analysis or record-keeping."

---

### Scene 10: Responsive Design (30 seconds)

**Visual**: Browser DevTools responsive mode

**Script**:
> "The application is fully responsive and works on mobile devices, tablets, and desktops."

**Actions**:
1. Open browser DevTools (F12)
2. Toggle device toolbar
3. Switch between mobile, tablet, and desktop views
4. Show how the layout adapts

**Script (continued)**:
> "The interface automatically adapts to different screen sizes, making it accessible from any device."

---

### Scene 11: Conclusion (30 seconds)

**Visual**: Dashboard or final screen

**Script**:
> "To summarize, the Event Attendance Monitoring System provides:
> - Easy event creation and management
> - Dual check-in methods for flexibility
> - Real-time attendance tracking
> - Data export capabilities
> - Responsive design for any device
>
> The application is built with React, Node.js, and PostgreSQL, and is deployed on Vercel and Railway for production use.
>
> Thank you for watching this demonstration!"

**Actions**:
- Show dashboard one final time
- Optionally show GitHub repository or deployment URL

---

## Post-Recording

### Editing Checklist
- [ ] Trim any dead air at beginning/end
- [ ] Add title card with project name
- [ ] Add end card with contact info/links
- [ ] Check audio levels (normalize if needed)
- [ ] Add background music (optional, low volume)
- [ ] Add captions/subtitles (optional but recommended)

### Export Settings
- **Format**: MP4
- **Resolution**: 1920x1080 (1080p)
- **Frame Rate**: 30 fps
- **Bitrate**: 5-10 Mbps

### Publishing
- [ ] Upload to YouTube (unlisted or public)
- [ ] Add to project documentation
- [ ] Share link with professor/team

---

## Tips for Great Recording

1. **Speak Clearly**: Enunciate and speak at moderate pace
2. **Pause Between Sections**: Makes editing easier
3. **Show, Don't Just Tell**: Let viewers see the features
4. **Keep It Concise**: 5-7 minutes is ideal
5. **Practice First**: Do a dry run before recording
6. **Use Zoom**: Zoom in on important UI elements
7. **Smooth Transitions**: Don't rush between screens
8. **Fix Mistakes**: Re-record sections if needed

---

## Alternative: Slide-Based Demo

If screen recording is difficult, create a video presentation:
1. Export slides as images
2. Add voiceover to each slide
3. Use video editing software to combine
4. Add transitions between slides

---

**Good luck with your recording! 🎬**
