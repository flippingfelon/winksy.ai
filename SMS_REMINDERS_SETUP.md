# 📱 SMS Reminders & Confirmations - Setup Guide

## Overview
Your appointment system now has **text message** functionality! Send confirmations and reminders to clients automatically or manually.

---

## 🎯 Features Implemented

### ✅ **Manual SMS Sending**
From any appointment detail page:
- **Send Confirmation** - Instant appointment confirmation
- **Send Reminder** - 24-hour advance reminder
- **Message Preview** - See exactly what clients receive
- **Status Tracking** - Know when notifications were sent

### ✅ **Message Templates**
Professional, friendly messages:
- ✨ Appointment confirmations
- 🔔 24-hour reminders
- ⏰ 1-hour reminders (template ready)
- ❌ Cancellation notifications
- 📅 Reschedule confirmations
- 💕 Thank you / follow-up messages

### ✅ **Automatic Reminders**
- API endpoint to check and send reminders
- Ready for cron job integration
- Tracks which reminders were sent
- Prevents duplicate messages

---

## 🚀 Setup Instructions

### **Step 1: Get Twilio Account** (Free!)

1. Go to https://www.twilio.com/try-twilio
2. Sign up for free account
3. Get **$15 free credit** (enough for ~1000 SMS)
4. Verify your phone number

### **Step 2: Get Twilio Credentials**

1. From Twilio Console dashboard:
   - **Account SID** (starts with AC...)
   - **Auth Token** (click to reveal)
   
2. Get a Twilio phone number:
   - Click "Get a Twilio phone number"
   - Accept the number they assign
   - Copy the phone number (format: +1234567890)

### **Step 3: Add to Environment Variables**

Create or edit `.env.local` file in your project root:

```bash
# Twilio Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890

# Optional: For automatic reminders API security
CRON_SECRET=your_random_secret_key_here

# Required for automatic reminders
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### **Step 4: Restart Your App**

```bash
# Stop your dev server (Ctrl+C)
# Start it again
npm run dev
```

### **Step 5: Test It!**

1. Go to any appointment: `/dashboard/tech/appointments/[id]`
2. Make sure the client has a phone number
3. Click **"Send Confirmation"**
4. Check your phone! 📱

---

## 📱 **Twilio Trial Mode**

### What Works:
✅ Send to **verified numbers** (free!)
✅ Up to **$15 credit** included
✅ All features work perfectly

### Important Notes:
⚠️ **Trial accounts** can only send to verified numbers
⚠️ Messages will have "Sent from Twilio trial account" prefix

### To Verify a Phone Number (Trial):
1. Go to Twilio Console
2. Click "Verified Caller IDs"
3. Add the phone number
4. Enter verification code

### Upgrade to Paid (Optional):
- Remove trial limitations
- Send to any phone number
- No "trial account" prefix
- Pay as you go (~$0.0075 per SMS)

---

## 🎨 **How to Use**

### **Send Confirmation (Manual)**

1. Open appointment details page
2. Scroll to "Send Text Notifications" section
3. Click **"Send Confirmation"** button
4. Client receives instant confirmation! ✨

**Message includes:**
- Date and time
- Duration
- Lash map/style
- Price
- Business address

### **Send Reminder (Manual)**

1. Open appointment details page
2. Click **"Send Reminder"** button
3. Client receives 24-hour reminder! 🔔

**Message includes:**
- "Tomorrow" reminder
- Date and time
- Lash map/style  
- Business address

### **Automatic Reminders**

Set up a cron job or scheduled task to call:
```
GET /api/sms/check-reminders
Header: x-api-key: your_cron_secret
```

This automatically sends reminders to appointments 24-48 hours away!

---

## 🔧 **Configuration Options**

### **Environment Variables**

| Variable | Required | Description |
|----------|----------|-------------|
| `TWILIO_ACCOUNT_SID` | Yes | Your Twilio Account SID |
| `TWILIO_AUTH_TOKEN` | Yes | Your Twilio Auth Token |
| `TWILIO_PHONE_NUMBER` | Yes | Your Twilio phone number (+1...) |
| `CRON_SECRET` | Optional | API key for automatic reminders |
| `SUPABASE_SERVICE_ROLE_KEY` | For auto reminders | Supabase service role key |

### **Message Customization**

Edit `/src/utils/smsTemplates.ts` to customize:
- Business name
- Message wording
- Add your branding
- Include booking links
- Add cancellation policies

---

## 📊 **Tracking & Analytics**

### **In the App**

- ✅ **"Notification sent"** badge on appointments
- ✅ **Success/error messages** when sending
- ✅ **Message preview** before sending
- ✅ **Phone number validation**

### **In Twilio Dashboard**

- View all sent messages
- See delivery status
- Check message costs
- View error logs

### **In Database**

The `bookings` table tracks:
- `reminder_sent` (boolean) - Has reminder been sent?
- Prevents duplicate reminders
- Easy to query notification stats

---

## 🎯 **Best Practices**

### **Timing**
- ✅ **Confirmation:** Send immediately after booking
- ✅ **24-hour reminder:** Send 1 day before
- ✅ **1-hour reminder:** Send 1 hour before (optional)
- ✅ **Thank you:** Send after appointment

### **Content**
- ✅ Keep messages short and clear
- ✅ Include all key details
- ✅ Add cancellation instructions
- ✅ Use friendly, professional tone
- ✅ Include business name/location

### **Compliance**
- ✅ Only send to clients who provided phone numbers
- ✅ Include opt-out instructions ("Reply STOP")
- ✅ Respect Do Not Disturb hours
- ✅ Don't send too many messages

---

## 🔄 **Automatic Reminders Setup**

### **Option 1: Vercel Cron Jobs** (Recommended)

Add to `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/sms/check-reminders",
    "schedule": "0 9 * * *"
  }]
}
```

Runs daily at 9 AM to check for reminders.

### **Option 2: External Cron Service**

Use a service like:
- **cron-job.org** (free)
- **EasyCron**
- **GitHub Actions**

Configure to call:
```
GET https://your-domain.com/api/sms/check-reminders
Header: x-api-key: your_cron_secret
```

### **Option 3: Manual**

Just click the "Send Reminder" button when needed!

---

## 🚨 **Troubleshooting**

### **Error: "Twilio is not configured"**
- Check `.env.local` has all three Twilio variables
- Restart your dev server after adding variables
- Make sure no typos in variable names

### **Error: "Invalid phone number"**
- Format should be: +1234567890
- Include country code (+1 for US)
- Remove spaces, dashes, parentheses

### **Error: "Phone number not verified"**
- In trial mode, verify the phone number in Twilio Console
- Or upgrade to paid account to send to any number

### **Message not received**
- Check phone number is correct in client profile
- Check Twilio dashboard for delivery status
- Check spam/blocked messages folder
- Verify phone can receive SMS

### **"SMS not configured" message in app**
- Environment variables not loaded
- Restart dev server
- Check .env.local file exists and has values

---

## 💰 **Pricing**

### **Trial Account:**
- **$15 free credit**
- ~1000 free SMS messages
- Good for testing and small volume

### **Paid Account:**
- **~$0.0075 per SMS** (less than 1 cent!)
- **$1 per month** for phone number
- Pay as you go, no minimums
- **Example:** 100 SMS/month = $1.75 total

---

## 📝 **API Reference**

### **Send SMS Endpoint**

```typescript
POST /api/sms/send
Content-Type: application/json

{
  "to": "+1234567890",
  "message": "Your message here",
  "appointmentId": "uuid",
  "type": "confirmation" | "reminder"
}

Response:
{
  "success": true,
  "messageSid": "SMxxxxxx",
  "configured": true
}
```

### **Check Reminders Endpoint**

```typescript
GET /api/sms/check-reminders
Header: x-api-key: your_cron_secret

Response:
{
  "message": "Sent 5 of 5 reminders",
  "reminders_sent": 5,
  "results": [...],
  "configured": true
}
```

---

## 📚 **Message Templates Available**

### **Ready to Use:**
1. ✨ Appointment Confirmation
2. 🔔 24-Hour Reminder
3. ⏰ 1-Hour Reminder
4. ❌ Cancellation Notice
5. 📅 Reschedule Confirmation
6. 💕 Thank You Message

### **Customizable:**
All templates in `/src/utils/smsTemplates.ts`

---

## ✅ **Success Checklist**

Before going live:

- [ ] Twilio account created
- [ ] Phone number obtained
- [ ] Environment variables added
- [ ] `.env.local` file created
- [ ] Dev server restarted
- [ ] Test message sent successfully
- [ ] Client phone numbers added
- [ ] Message templates customized
- [ ] Automatic reminders configured (optional)

---

## 🎉 **You're All Set!**

Your appointment system now has professional SMS notifications!

**Next steps:**
1. Add phone numbers to your clients
2. Send some test messages
3. Set up automatic reminders
4. Enjoy happy, reminded clients! 📱✨

---

## 📖 **More Resources**

- **Twilio Docs:** https://www.twilio.com/docs/sms
- **Template Customization:** Edit `src/utils/smsTemplates.ts`
- **API Routes:** `src/app/api/sms/`

---

**Questions?** Check the Twilio dashboard for detailed logs and delivery status!


