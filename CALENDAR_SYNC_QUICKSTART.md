# 🚀 Calendar Sync - Quick Start (3 Steps!)

## ⚡ Setup in 3 Minutes

### Step 1: Run Database Migration

1. Open **Supabase SQL Editor**: https://supabase.com/dashboard
2. Copy ALL contents from `create_calendar_connections_table.sql`
3. Paste and click **Run**
4. ✅ Should see "Success. No rows returned"

### Step 2: Get Your iCal URL

Pick your platform and follow:

**Square:**
- Dashboard → Appointments → Settings → Calendar Sync
- Copy the iCal URL

**Booksy:**
- Settings → Calendar → Export to Calendar
- Copy the iCal URL

**GlossGenius:**
- Settings → Calendar → Calendar Feed
- Copy the iCal URL

💡 **Tip**: Change `webcal://` to `https://` if needed

### Step 3: Connect in Winksy

1. Go to **My Appointments**
2. Click **"Connect Calendar"** (top right)
3. Click **"Add Calendar"**
4. Fill in:
   - Platform (e.g., Square)
   - Name (e.g., "My Square Calendar")
   - Paste the iCal URL
5. Click **"Connect Calendar"**
6. Click the **refresh icon** to sync
7. ✅ Done! Your appointments are now imported

---

## 🎉 What Happens Next?

- ✅ Calendars sync **automatically every hour**
- ✅ New appointments appear in Winksy
- ✅ Duplicates are automatically prevented
- ✅ You can connect **multiple calendars**

---

## 🔍 Where to Find It

### On Appointments Page:
- **"Connect Calendar"** button (top right, next to "Add Appointment")
- **Sync status** shows "Last synced: [time]"

### In Calendar Sync Settings:
- View all connected calendars
- Sync Now, Pause, Resume, Delete
- See sync history and stats

---

## ⚙️ Advanced (Optional)

### Auto-Sync Frequency

By default: **Every hour**

To change, edit `vercel.json`:

```json
"schedule": "0 * * * *"       // Every hour (default)
"schedule": "*/30 * * * *"    // Every 30 minutes
"schedule": "0 */2 * * *"     // Every 2 hours
```

### Manual Sync

Click the **refresh icon** next to any calendar anytime!

---

## ❓ Troubleshooting

**"Failed to fetch calendar feed"**
- Check the URL is correct
- Change `webcal://` to `https://`
- URL might have expired - get a new one

**No appointments showing up**
- Make sure you have future appointments
- Past appointments aren't imported
- Click "Sync Now" manually

**Calendar not syncing automatically**
- Auto-sync only works after deploying to Vercel
- In development, use "Sync Now" manually

---

## 📚 Full Documentation

See **CALENDAR_SYNC_SETUP.md** for detailed instructions!

---

## ✨ You're All Set!

Connect your calendar once, and Winksy will automatically keep your appointments in sync! 🎉


