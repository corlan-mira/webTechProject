 Event State Logic - Quick Reference

Status:  COMPLETE  
Files:  core files +  index updates +  server update  
Date: December 

---

  Files Generated

 Core Implementation

| File | Purpose | Lines |
|------|---------|-------|
| `services/eventStateService.js` | State calculation & management | + |
| `jobs/eventStateJob.js` | Cron scheduling & execution | + |

 Updated Files

| File | Changes |
|------|---------|
| `services/index.js` | Added eventStateService export |
| `jobs/index.js` | Added eventStateJob export |
| `server.js` | Initialize job on startup |

---

  Core Functions

 Service: `eventStateService`

```javascript
// Calculate state for an event
calculateEventState(event) → 'OPEN' | 'CLOSED'

// Get events needing update
getEventsNeedingUpdate() → Promise<Array>

// Update single event
updateEventState(eventId, newState) → Promise<Event>

// Update multiple events
batchUpdateEventStates(updates) → Promise<Result>

// Sync all events
syncAllEventStates() → Promise<SyncResult>

// Get detailed info
getEventStateDetails(eventId) → Promise<Details>

// Health check
healthCheck() → Promise<Health>
```

 Job: `eventStateJob`

```javascript
// Start the cron job
initEventStateJob() → Object

// Stop the job
stopEventStateJob() → Object

// Check if running
isEventStateJobRunning() → boolean

// Get job status
getEventStateJobStatus() → Object

// Manual trigger
triggerEventStateSync() → Promise<Result>

// Alternative: Use setInterval
initEventStateJobWithInterval(ms) → Object

// Shutdown procedure
gracefulShutdown() → void
```

---

  State Logic

 Rules

```javascript
if (now < start_time) {
  state = 'CLOSED'  // Not yet started
} else if (now >= start_time && now < end_time) {
  state = 'OPEN'    // In progress
} else {
  state = 'CLOSED'  // Finished
}

// Where: end_time = start_time + (duration_minutes   seconds)
```

 Timeline

```
    CLOSED        OPEN          CLOSED
      │             │              │
    ──┴──────────┬──┴──┬─────────┬─┘
      Before   Start    During   End   After
```

---

  Schedule

Execution: Every minute (at  seconds)  
Cron Pattern: `'     '`  
Scope: All non-DRAFT events

---

  Usage Examples

 Start the Service

```javascript
// Automatic in server.js
const { eventStateJob } = require('./jobs');
eventStateJob.initEventStateJob();
```

 Calculate State

```javascript
const { eventStateService } = require('./services');

const state = eventStateService.calculateEventState({
  start_time: new Date('--T::Z'),
  duration_minutes: 
});
```

 Manual Sync

```javascript
const result = await eventStateService.syncAllEventStates();
console.log(`Updated: ${result.eventsUpdated} events`);
```

 Check Status

```javascript
const status = eventStateJob.getEventStateJobStatus();
console.log(status.nextExecution);
```

 Get Event Details

```javascript
const details = await eventStateService.getEventStateDetails(eventId);
console.log(details.timing);
```

---

  What Happens Each Minute

```
Minute  seconds:
  ├─ Health check database
  ├─ Query events needing update
  ├─ Calculate correct states
  ├─ Batch update database
  ├─ Log results
  └─ Wait  seconds

Result (if updates):
  [exec-id] ✓ Event state sync completed: X events updated (Yms)
```

---

  Error Handling

-  Invalid event objects → default to 'CLOSED'
-  Database errors → logged, continue processing
-  Job startup failure → logged with error details
-  Health check fails → skip sync, don't crash
-  Graceful shutdown → properly close cron job

---

  Integration Points

 Server Startup
```javascript
// server.js
const { eventStateJob } = require('./jobs');
const jobStatus = eventStateJob.initEventStateJob();
```

 Server Shutdown
```javascript
process.on('SIGTERM', () => {
  eventStateJob.gracefulShutdown();
  // ... rest of cleanup
});
```

 Controllers (Optional)
```javascript
// Can manually trigger in event creation/update
const result = await eventStateJob.triggerEventStateSync();
```

---

  Performance

| Metric | Value |
|--------|-------|
| Execution Frequency | Every  seconds |
| Typical Duration | -ms |
| Memory Impact | Negligible |
| Database Queries |  per minute |
| Max Events Processed | Unlimited |

---

  Quick Test

```javascript
// Test the calculation
const { eventStateService } = require('./services');

// Create test event (starts now,  min duration)
const now = new Date();
const event = {
  start_time: now,
  duration_minutes: 
};

const state = eventStateService.calculateEventState(event);
console.log(state); // Should output: 'OPEN'
```

---

  Complete Request Flow

```
. Server starts
   ├─ Database connection
   ├─ Initialize eventStateJob
   └─ Start cron scheduler

. Every minute (at : seconds)
   ├─ executeEventStateSync() triggered
   ├─ Health check
   └─ If healthy:
      ├─ Get events needing update
      ├─ Calculate states
      ├─ Batch update database
      └─ Log results

. Server shutdown
   ├─ Receive SIGTERM
   ├─ Stop cron job
   ├─ Close database
   └─ Exit process
```

---

  Dependencies

```json
{
  "node-cron": "^..",
  "sequelize": "^.."
}
```

Both already included in `package.json` 

---

  Key Concepts

 State Calculation
- Pure function: Same input = same output
- Current time based: Uses actual system time
- Safe defaults: Returns 'CLOSED' on errors

 Background Job
- Non-blocking: Runs separately from requests
- Scheduled: Fixed -minute interval
- Fault-tolerant: Errors don't crash server
- Graceful: Proper shutdown sequence

 Database Updates
- Batch operation: Updates multiple events efficiently
- Conditional: Only updates if state actually changed
- Logged: All changes recorded in console

---

  Next Enhancement Ideas

. Webhooks: Notify external systems on state changes
. Notifications: Email/SMS when event opens/closes
. History: Track state change timestamps
. Analytics: Monitor state transition patterns
. Dashboard: Real-time state visualization

---

  FAQ

Q: How often do states update?  
A: Every minute automatically via cron scheduler.

Q: What if I need real-time updates?  
A: Change cron pattern to `'/     '` for every  seconds.

Q: Does this affect API performance?  
A: No, job runs in background on separate schedule.

Q: What happens if database is down?  
A: Health check fails, sync skipped, job continues.

Q: Can I manually trigger a sync?  
A: Yes, use `eventStateJob.triggerEventStateSync()`.

---

  Implementation Status

-  State calculation logic
-  Service functions ( core functions)
-  Background job with cron
-  Error handling & logging
-  Server integration
-  Graceful shutdown
-  Fallback method (setInterval)
-  Health monitoring
-  Documentation
-  Ready for production

---

Event State Logic:  FULLY IMPLEMENTED

Events now automatically manage their state based on scheduled time!

