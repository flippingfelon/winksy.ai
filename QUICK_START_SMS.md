# 📱 Quick Start: SMS Reminders (5 Minutes)

## What You Get

Send text message confirmations and reminders to your clients! ✨

**Features:**
- ✅ Instant appointment confirmations
- ✅ 24-hour advance reminders
- ✅ Beautiful message templates
- ✅ Automatic or manual sending
- ✅ Tracks which messages were sent

---

## ⚡ Quick Setup (5 Minutes)

### **Step 1: Get Free Twilio Account**

1. Go to: https://www.twilio.com/try-twilio
2. Sign up (it's free!)
3. You get **$15 credit** = ~1000 free texts!
4. Verify your phone number

### **Step 2: Get Your Credentials**

From Twilio dashboard, copy these 3 things:

1. **Account SID** (starts with AC...)
2. **Auth Token** (click to reveal)
3. **Phone Number** (click "Get a number", accept what they give you)

### **Step 3: Add to Your App**

Create file `.env.local` in your project root:

```bash
# Add these 3 lines (use your actual values!)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

### **Step 4: Restart**

```bash
# Stop your server (Ctrl+C)
# Start it again
npm run dev
```

### **Step 5: Test It!**

1. Go to any appointment
2. Make sure client has a phone number
3. Click **"Send Confirmation"**
4. Check your phone! 📱

---

## 🎯 How to Use

### **Send Confirmation**
1. Open appointment details
2. Click **"Send Confirmation"** button
3. Done! Client gets instant text ✨

### **Send Reminder**
1. Open appointment details
2. Click **"Send Reminder"** button
3. Done! Client gets 24-hour reminder 🔔

### **Check Status**
- Green "✓ Notification sent" badge shows on appointment
- Success message appears after sending
- View all messages in Twilio dashboard

---

## ⚠️ Trial Mode Important Notes

### **In Trial Mode (Free):**

✅ Send to **verified numbers only**
✅ Messages work perfectly
✅ $15 free credit included

⚠️ **Must verify phone numbers first:**
1. Go to Twilio Console
2. Click "Verified Caller IDs"
3. Add phone number
4. Enter code they text you

### **Upgrade to Remove Limits:**

💰 ~$0.0075 per text (less than 1 cent!)
💰 $1/month for phone number
💰 No minimums, pay as you go

---

## 📱 Message Preview

### **Confirmation Message:**
```
✨ Appointment Confirmed!

Hello Sarah,

Your lash appointment with Jane is confirmed:

📅 Mon, Dec 15, 2024
🕐 2:00 PM (120 min)
💎 Style: Natural Wispy
💰 $85.00

📍 Winksy Lash Studio

See you soon! Reply CANCEL to cancel.
```

### **Reminder Message:**
```
🔔 Reminder: Lash Appointment Tomorrow

Hi Sarah!

This is a friendly reminder about your appointment:

📅 Tomorrow, Mon, Dec 15, 2024
🕐 2:00 PM
💎 Natural Wispy

📍 Winksy Lash Studio

We can't wait to see you! Reply CONFIRM or CANCEL.
```

---

## 🔧 Troubleshooting

### **"Twilio not configured"**
- Check `.env.local` has all 3 variables
- Restart your dev server
- No typos in variable names

### **"Phone number not verified"**
- In trial mode, must verify in Twilio Console
- Go to "Verified Caller IDs"
- Add and verify the number

### **"Invalid phone number"**
- Format: +1234567890
- Include country code
- No spaces or dashes

---

## 🎨 Customize Messages

Edit: `/src/utils/smsTemplates.ts`

Change:
- Business name
- Message wording
- Add your branding
- Include booking links

---

## ✅ Quick Checklist

- [ ] Twilio account created
- [ ] Got Account SID, Auth Token, Phone Number
- [ ] Added to `.env.local`
- [ ] Restarted dev server
- [ ] Added client phone numbers
- [ ] Sent test message
- [ ] Received it on your phone!

---

## 🚀 You're Done!

That's it! Your appointment system now has professional SMS notifications.

**What's next?**
- Add phone numbers to clients
- Send confirmations after bookings
- Send reminders before appointments
- Watch clients show up on time! ⏰

---

## 📖 Need More Help?

See full docs: `SMS_REMINDERS_SETUP.md`

**Common questions:**
- How to set up automatic reminders
- How to customize messages
- Pricing and costs
- API documentation

---

**Happy texting!** 📱✨


