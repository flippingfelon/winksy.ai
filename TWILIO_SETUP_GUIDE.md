# 📱 Twilio SMS Setup Guide

## Quick Start (5 Minutes)

### Step 1: Create Twilio Account

1. Go to: https://www.twilio.com/try-twilio
2. Sign up (it's free!)
3. Verify your phone number

### Step 2: Get Your Credentials

After logging in to [Twilio Console](https://console.twilio.com/):

#### Get Account SID & Auth Token
- Look at the main dashboard
- You'll see "Account Info" section
- Copy **Account SID** (starts with "AC...")
- Copy **Auth Token** (click "Show" to reveal it)

#### Get a Phone Number
1. Click "Get a Trial Number" button
2. Twilio will assign you a free number
3. Copy the number (format: `+1234567890`)

### Step 3: Update `.env.local`

Open your `.env.local` file and update these lines:

```bash
# Twilio SMS Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  # ← Your Account SID
TWILIO_AUTH_TOKEN=your_32_character_auth_token         # ← Your Auth Token
TWILIO_PHONE_NUMBER=+1234567890                        # ← Your Twilio Number
```

### Step 4: Restart Your Server

```bash
# Stop your dev server (Ctrl+C)
npm run dev
```

---

## Testing SMS

1. Go to any appointment details page
2. Make sure the client has a phone number
3. Click "Send Confirmation" or "Send 24-Hour Reminder"
4. Check the client's phone!

---

## Important Notes

### Free Trial Limitations
- **Verified Numbers Only**: In trial mode, you can only send SMS to phone numbers you've verified in Twilio
- **Trial Message Prefix**: Messages will include "Sent from your Twilio trial account"
- **Free Credits**: You get $15 in trial credits (enough for ~600 messages)

### To Remove Trial Limitations
1. Upgrade your Twilio account (add billing info)
2. You can then send to any phone number
3. Messages won't have the trial prefix

### Adding Verified Numbers (Free Trial)
1. Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/verified
2. Click "Add New Number"
3. Enter the phone number you want to send to
4. Verify with code

---

## Troubleshooting

### "SMS not configured" Error
- Make sure all 3 environment variables are set in `.env.local`
- Restart your dev server after updating `.env.local`

### "Permission to send SMS has not been enabled"
- Your trial account can only send to verified numbers
- Add the client's number to verified numbers in Twilio Console

### "Invalid 'To' phone number"
- Make sure phone numbers are in format: `+1234567890`
- Include country code (+ and country code)
- No spaces or dashes

---

## Need Help?

Check these files:
- `QUICK_START_SMS.md` - Quick testing guide
- `SMS_REMINDERS_SETUP.md` - Full feature documentation
- `.env.local.example` - Environment variable template

Twilio Support:
- Docs: https://www.twilio.com/docs/sms
- Help: https://support.twilio.com

