# 🔧 Fix: "Error fetching appointments"

## The Issue
You're seeing: `Error fetching appointments: {}`

**What it means:** The database needs to be updated with new columns for the appointments feature.

**Good news:** This is a quick 2-minute fix! ✅

---

## ✅ The Fix (Copy & Paste)

### **Step 1: Open Supabase SQL Editor**
1. Go to https://app.supabase.com
2. Select your project
3. Click **"SQL Editor"** (left sidebar)
4. Click **"New query"**

### **Step 2: Copy This SQL**

**Select ALL the SQL below** ⬇️ (from `-- Update bookings` to the end)

```sql
-- Update bookings table for appointment management system

-- Add new columns to bookings table
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 120,
ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS lash_map_id UUID REFERENCES public.lash_maps(id) ON DELETE SET NULL;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS bookings_client_id_idx ON public.bookings(client_id);
CREATE INDEX IF NOT EXISTS bookings_lash_map_id_idx ON public.bookings(lash_map_id);
CREATE INDEX IF NOT EXISTS bookings_booking_date_idx ON public.bookings(booking_date);
CREATE INDEX IF NOT EXISTS bookings_status_idx ON public.bookings(status);
CREATE INDEX IF NOT EXISTS bookings_reminder_sent_idx ON public.bookings(reminder_sent);

-- Add check constraint for status
ALTER TABLE public.bookings 
DROP CONSTRAINT IF EXISTS bookings_status_check;

ALTER TABLE public.bookings 
ADD CONSTRAINT bookings_status_check 
CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled'));

-- Update RLS policies for bookings (techs can manage their own appointments)
DROP POLICY IF EXISTS "Techs can view their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Techs can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Techs can update their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Techs can delete their own bookings" ON public.bookings;

CREATE POLICY "Techs can view their own bookings" ON public.bookings
  FOR SELECT USING (
    auth.uid() = tech_id OR auth.uid() = user_id
  );

CREATE POLICY "Techs can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (
    auth.uid() = tech_id
  );

CREATE POLICY "Techs can update their own bookings" ON public.bookings
  FOR UPDATE USING (
    auth.uid() = tech_id
  );

CREATE POLICY "Techs can delete their own bookings" ON public.bookings
  FOR DELETE USING (
    auth.uid() = tech_id
  );

-- Create function to automatically update completed_at when status changes
CREATE OR REPLACE FUNCTION update_booking_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at = timezone('utc'::text, now());
  END IF;
  
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    NEW.cancelled_at = timezone('utc'::text, now());
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS booking_completion_trigger ON public.bookings;

CREATE TRIGGER booking_completion_trigger
BEFORE UPDATE ON public.bookings
FOR EACH ROW 
EXECUTE FUNCTION update_booking_completion();

-- Create view for upcoming appointments needing reminders
CREATE OR REPLACE VIEW upcoming_appointments_for_reminders AS
SELECT 
  b.*,
  p.full_name as client_name,
  p.email as client_email,
  c.phone as client_phone
FROM public.bookings b
LEFT JOIN public.profiles p ON b.user_id = p.id
LEFT JOIN public.clients c ON b.client_id = c.id
WHERE 
  b.status IN ('pending', 'confirmed')
  AND b.reminder_sent = false
  AND b.booking_date >= CURRENT_DATE
  AND b.booking_date <= CURRENT_DATE + INTERVAL '2 days';
```

### **Step 3: Run the SQL**
1. Paste the SQL into Supabase SQL Editor
2. Click **"Run"** (or press Cmd/Ctrl + Enter)
3. Wait for: ✅ **"Success. No rows returned"**

### **Step 4: Test**
1. Go back to `/dashboard/tech/appointments`
2. **Refresh the page** (Cmd/Ctrl + R)
3. Error should be gone! 🎉
4. You'll see the appointments page (empty for now)

---

## 📸 Visual Guide

```
┌─────────────────────────────────────┐
│  Supabase Dashboard                 │
│  ┌──────────────────────────────┐   │
│  │ [SQL Editor Tab]             │   │
│  │                              │   │
│  │ [Paste SQL here]             │   │
│  │                              │   │
│  │                              │   │
│  └──────────────────────────────┘   │
│  [Run] ← Click this!               │
└─────────────────────────────────────┘
```

---

## ✅ What Gets Added

After running the SQL, you'll have:

### New Features:
- ✅ **Duration tracking** - How long appointments take
- ✅ **Client linking** - Connect appointments to clients
- ✅ **Lash map integration** - Tag appointments with lash maps
- ✅ **Reminder system** - Track which appointments need reminders
- ✅ **Completion tracking** - Know when appointments were done
- ✅ **Cancellation reasons** - Track why appointments were cancelled

### Performance:
- ✅ **Fast queries** with indexed columns
- ✅ **Secure access** with RLS policies
- ✅ **Auto-timestamps** for completion/cancellation

---

## 🎯 After Setup

Once the SQL runs successfully, you can:

1. **Create appointments** - Click "Add Appointment"
2. **View calendar** - See appointments on dates
3. **Track status** - Pending, confirmed, completed, cancelled
4. **Link clients** - Associate appointments with your clients
5. **Tag lash maps** - Remember which style was used

---

## 🚨 Troubleshooting

### Still seeing the error?
1. **Check SQL ran successfully** - Look for green "Success" message
2. **Refresh the page** - Hard refresh (Cmd/Ctrl + Shift + R)
3. **Clear cache** - Sometimes needed for database changes
4. **Check console** - More detailed error messages there

### SQL fails to run?
1. **Copy ALL the SQL** - Don't miss any lines
2. **Run as one query** - Don't split it up
3. **Check for errors** - Red error messages will show what's wrong

### "Table doesn't exist" error?
- The `bookings` table needs to exist first
- If using an old database, you may need to run initial migrations
- Check `APPOINTMENTS_SETUP.md` for full setup

---

## 📝 Alternative: Use the File

Instead of copying from above, you can also:

1. Open the file: **`update_bookings_table.sql`** (in project root)
2. Copy **ALL** contents (Cmd/Ctrl + A, then Cmd/Ctrl + C)
3. Paste into Supabase SQL Editor
4. Run

---

## 🎉 Success!

Once you see **"Success. No rows returned"**, you're done!

The appointments feature will now work perfectly. Go ahead and:

1. Refresh `/dashboard/tech/appointments`
2. Click **"Add Appointment"**
3. Create your first booking! 📅

---

## 📖 More Help

- **Full Setup:** `APPOINTMENTS_SETUP.md`
- **Feature Overview:** `APPOINTMENTS_FEATURE_SUMMARY.md`
- **SQL File:** `update_bookings_table.sql`

---

**The fix takes 2 minutes. Let's get your appointments working!** 🚀


