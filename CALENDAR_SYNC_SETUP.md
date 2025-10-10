# 📅 Calendar Sync Setup Guide

## Overview

The Calendar Sync feature allows you to automatically import appointments from external booking platforms like Square, Booksy, and GlossGenius into your Winksy appointments system.

---

## 🚀 Quick Start

### 1. Run Database Migration

First, create the database tables:

1. Go to your Supabase project: https://supabase.com/dashboard
2. Click **SQL Editor** in the left sidebar
3. Open the file `create_calendar_connections_table.sql`
4. Copy the **entire contents** of the file
5. Paste it into the SQL Editor
6. Click **Run** (or press Cmd/Ctrl + Enter)

✅ You should see "Success. No rows returned"

### 2. Get Your iCal Feed URL

Choose your platform:

#### **Square**

1. Log in to [Square Dashboard](https://squareup.com/dashboard)
2. Navigate to **Appointments** → **Settings**
3. Scroll to **Calendar Sync** section
4. Look for **iCal Feed** or **Export Calendar**
5. Copy the URL (starts with `webcal://` or `https://`)
6. If it starts with `webcal://`, change it to `https://`

#### **Booksy**

1. Open **Booksy for Business** app or web dashboard
2. Go to **Settings** → **Calendar Settings**
3. Find **Export to Calendar** or **Calendar Feed**
4. Select **iCal Format**
5. Copy the provided URL

#### **GlossGenius**

1. Log in to [GlossGenius](https://www.glossgenius.com/)
2. Go to **Settings** → **Calendar**
3. Find **Calendar Feed** or **Sync with External Calendar**
4. Copy the iCal URL

### 3. Connect Your Calendar

1. Go to **My Appointments** page
2. Click **Connect Calendar** button (top right)
3. Click **Add Calendar**
4. Fill in the form:
   - **Platform**: Select your booking platform
   - **Calendar Name**: Give it a friendly name (e.g., "My Square Calendar")
   - **iCal Feed URL**: Paste the URL you copied
5. Click **Connect Calendar**
6. Click **Sync Now** (refresh icon) to import your first appointments

✅ Done! Your appointments should now appear in Winksy.

---

## 📋 Features

### ✨ What Gets Imported

- ✅ Appointment date and time
- ✅ Duration
- ✅ Title/description
- ✅ Status (imported as "confirmed")

### 🔄 Automatic Sync

- Calendars sync **automatically every hour**
- You can also click **Sync Now** anytime
- Duplicate appointments are automatically prevented
- Updated appointments are synced

### 🎛️ Management

- **Pause/Resume**: Temporarily stop syncing without deleting the connection
- **View Stats**: See last sync time and number of appointments imported
- **Delete**: Remove a calendar connection (doesn't delete appointments)

---

## 🔧 Troubleshooting

### "Failed to fetch calendar feed"

**Problem**: The iCal URL is incorrect or expired

**Solutions**:
- Double-check the URL is correct
- Make sure it starts with `https://` (not `webcal://`)
- The URL might have expired - get a new one from your platform
- Check if your booking platform requires authentication

### "No appointments imported"

**Problem**: The calendar is empty or appointments are in the past

**Solutions**:
- Make sure you have upcoming appointments in your external calendar
- Past appointments are not imported by default
- Check the date range in your external calendar settings

### Appointments are duplicated

**Problem**: Same appointment imported twice

**Solutions**:
- This shouldn't happen - the system tracks external event IDs
- If you see duplicates, one might be manually created
- Check the appointment details - imported ones have "Import Source" tag

### Calendar not syncing automatically

**Problem**: Auto-sync cron job not running

**Solutions**:
- Auto-sync requires deployment to Vercel with the `vercel.json` configuration
- In development, you need to manually click "Sync Now"
- Check Vercel dashboard for cron job logs

---

## 🔐 Security

- iCal feed URLs should be kept private (they contain access tokens)
- URLs are stored securely in the database
- Only you can see your calendar connections
- In production, consider encrypting the `connection_url` field

---

## 🎨 Customization

### Change Auto-Sync Frequency

Edit `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/calendar/auto-sync",
      "schedule": "0 * * * *"  // Every hour (default)
      // "schedule": "*/30 * * * *"  // Every 30 minutes
      // "schedule": "0 */2 * * *"  // Every 2 hours
    }
  ]
}
```

Cron format: `minute hour day month weekday`

### Manual Sync via API

You can trigger a sync manually:

```bash
curl -X POST https://your-domain.com/api/calendar/sync \
  -H "Content-Type: application/json" \
  -d '{"connectionId": "your-connection-id"}'
```

---

## 📊 Database Schema

### `calendar_connections` Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `tech_id` | UUID | User/tech ID |
| `platform` | TEXT | Platform name (square, booksy, etc.) |
| `connection_name` | TEXT | User-friendly name |
| `connection_url` | TEXT | iCal feed URL |
| `is_active` | BOOLEAN | Whether sync is enabled |
| `last_synced_at` | TIMESTAMP | Last successful sync time |
| `sync_frequency_minutes` | INTEGER | How often to sync (default: 60) |
| `appointments_imported` | INTEGER | Total count imported |

### `bookings` Table (New Columns)

| Column | Type | Description |
|--------|------|-------------|
| `import_source` | TEXT | Where it came from (manual, square, booksy) |
| `external_event_id` | TEXT | External calendar event ID |
| `calendar_connection_id` | UUID | Link to calendar connection |

---

## 🚧 Future Enhancements

- [ ] Google Calendar OAuth integration
- [ ] Two-way sync (create appointments in external calendar)
- [ ] Import client contact info from appointments
- [ ] Conflict detection (double bookings)
- [ ] Custom field mapping
- [ ] Import past appointments
- [ ] Calendar color coding by source

---

## ❓ FAQ

**Q: Can I connect multiple calendars?**  
A: Yes! You can connect as many calendars as you want.

**Q: Will it sync past appointments?**  
A: Currently no, only future appointments are synced. This is by design to avoid cluttering your calendar.

**Q: Can I sync TO external calendars (two-way)?**  
A: Not yet. Currently it's import-only. Two-way sync is planned for a future update.

**Q: What happens if I delete a connection?**  
A: The connection is removed, but previously imported appointments remain in your system.

**Q: Do I need to re-connect if the URL changes?**  
A: Yes, if your platform generates a new feed URL, you'll need to update it in the settings.

**Q: Can clients see which platform the appointment came from?**  
A: No, this is only visible to you in the admin interface.

---

## 📞 Support

Need help?

- Check the [Troubleshooting](#-troubleshooting) section above
- Review the setup instructions for your specific platform
- Make sure your database migration is complete
- Check browser console for errors

---

## 📝 Notes

- The iCal standard (RFC 5545) is used for parsing
- Sync happens in the background and doesn't block the UI
- Failed syncs are logged and can be retried
- The system prevents duplicate imports using external event IDs

---

**Happy Syncing! 🎉**

