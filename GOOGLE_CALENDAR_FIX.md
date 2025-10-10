# 🔧 Google Calendar "Failed to Fetch" - Quick Fix

## ✅ Step-by-Step Fix

### 1. Check Your Google Calendar URL Format

Your URL should look like this:
```
https://calendar.google.com/calendar/ical/YOUR_EMAIL/private-LONG_KEY/basic.ics
```

**Common Issues:**

❌ **WRONG**: `webcal://calendar.google.com/...`  
✅ **CORRECT**: `https://calendar.google.com/...`

❌ **WRONG**: Public calendar URL  
✅ **CORRECT**: Secret address in iCal format

---

### 2. Get the Correct Google Calendar URL

1. Go to **Google Calendar**: https://calendar.google.com
2. In the left sidebar, find **"My calendars"**
3. Hover over your calendar name
4. Click the **three dots (⋮)**
5. Select **"Settings and sharing"**
6. Scroll down to **"Integrate calendar"** section
7. Find **"Secret address in iCal format"**
8. Click the copy icon or **right-click → Copy link address**

**Important:** Don't use the "Public address in iCal format" - use the **SECRET address**!

---

### 3. Make Calendar Accessible

In Google Calendar settings:

1. Go to **"Settings and sharing"** for your calendar
2. Under **"Access permissions for events"**:
   - ✅ Make sure it's NOT completely private if you want to sync
   - ✅ Or keep it private but ensure the secret URL is enabled

3. Under **"Integrate calendar"**:
   - ✅ Verify you can see the "Secret address in iCal format"
   - If you don't see it, you might need to adjust access permissions

---

### 4. Test the URL

Before adding to Winksy, test if the URL works:

1. Copy your Google Calendar iCal URL
2. Paste it in your browser
3. You should see a file download with `.ics` extension
4. ✅ If it downloads → URL is correct!
5. ❌ If you get an error → URL needs to be fixed

---

### 5. Common Error Messages & Fixes

#### "HTTP 404: Not Found"
**Problem:** The calendar URL is incorrect or the calendar doesn't exist

**Fix:**
- Double-check you copied the entire URL
- Make sure you used the "Secret address" not public
- Try regenerating the secret URL in Google Calendar settings

#### "HTTP 401: Unauthorized" or "HTTP 403: Forbidden"
**Problem:** Calendar privacy settings are too restrictive

**Fix:**
- Go to calendar settings → "Access permissions"
- Enable "Make available to public" temporarily to test
- Or ensure the secret URL is properly generated

#### "Failed to parse iCal"
**Problem:** The URL is not pointing to an iCal feed

**Fix:**
- Make sure the URL ends with `.ics`
- Ensure you copied the iCal format (not HTML link)

---

## 🎯 Quick Checklist

Before connecting in Winksy, verify:

- [ ] URL starts with `https://` (not `webcal://`)
- [ ] URL contains `/ical/` in the path
- [ ] URL ends with `.ics`
- [ ] URL is the "Secret address" from Google Calendar
- [ ] Opening URL in browser downloads an .ics file
- [ ] Calendar has at least one future event

---

## 🔄 I Updated the Code!

The sync route now has better error handling:

✅ **Auto-converts** `webcal://` to `https://`  
✅ **Fallback method** if primary fetch fails  
✅ **Better error messages** with hints  
✅ **Works with Google Calendar** secret URLs  

**To apply changes:**
```bash
# If your dev server is running, restart it:
npm run dev
```

---

## 📝 Alternative: Use Manually Created Appointments

If Google Calendar sync still doesn't work, you can:

1. Manually create appointments in Winksy
2. Use other platforms (Square, Booksy) that have better iCal support
3. Wait for OAuth integration (coming soon!)

---

## 🆘 Still Not Working?

### Debug Steps:

1. **Check dev server logs:**
   - Look at your terminal where `npm run dev` is running
   - You should see error details when sync fails

2. **Check browser console:**
   - Open DevTools (F12)
   - Go to Console tab
   - Try syncing and look for errors

3. **Check the database:**
   - Go to Supabase → Table Editor → `calendar_connections`
   - Look at the `last_sync_error` column
   - It will show the exact error message

4. **Test with curl:**
   ```bash
   curl -I "YOUR_GOOGLE_CALENDAR_URL"
   ```
   Should return `200 OK`

---

## 🔐 Security Note

Your Google Calendar secret URL is like a password! 

- ✅ **DO**: Keep it private
- ✅ **DO**: Store it securely in Winksy database
- ❌ **DON'T**: Share it publicly
- ❌ **DON'T**: Post it in screenshots/emails

If compromised, regenerate it:
1. Google Calendar Settings
2. Under "Integrate calendar"
3. Click "Reset" next to the secret address

---

## 📞 Need More Help?

Send me:
1. Screenshot of your Google Calendar "Integrate calendar" section (blur sensitive parts!)
2. Error message from browser console
3. Error from `last_sync_error` in database

Happy syncing! 🎉

