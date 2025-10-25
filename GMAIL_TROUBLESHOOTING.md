# Gmail Authentication Troubleshooting Guide

## The Error You're Seeing

```
Error: Invalid login: 535-5.7.8 Username and Password not accepted
```

This is a Gmail authentication error. Here are the steps to fix it:

## Step 1: Verify Your Gmail App Password

1. **Go to Google Account Settings**: https://myaccount.google.com/security
2. **Enable 2-Factor Authentication** (if not already enabled)
3. **Generate App Password**:
   - Go to Security → 2-Step Verification → App passwords
   - Select "Mail" as the app
   - Copy the 16-character password (with spaces)

## Step 2: Check Your App Password Format

Your app password should look like: `rjjn ixsx kfty pgdx` (with spaces)

**Common mistakes:**
- ❌ Removing spaces: `rjjnixxkftypgdx`
- ❌ Using regular Gmail password
- ❌ Using wrong app type (not "Mail")

## Step 3: Alternative Gmail Configuration

If the current setup doesn't work, try this alternative configuration:

```javascript
// Alternative Gmail configuration
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'bshanth0206@gmail.com',
    pass: 'rjjn ixsx kfty pgdx'
  }
});
```

## Step 4: Test Your App Password

Create a simple test script to verify your credentials:

```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'bshanth0206@gmail.com',
    pass: 'rjjn ixsx kfty pgdx'
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.log('❌ Error:', error);
  } else {
    console.log('✅ Server is ready to take our messages');
  }
});
```

## Step 5: Gmail Security Settings

Make sure these Gmail settings are correct:

1. **2-Factor Authentication**: Must be enabled
2. **Less Secure Apps**: Not needed (use App Password instead)
3. **App Password**: Must be for "Mail" application
4. **Account Status**: Account must be active and not suspended

## Step 6: Alternative Email Providers

If Gmail continues to have issues, consider these alternatives:

### Outlook/Hotmail
```javascript
const transporter = nodemailer.createTransporter({
  service: 'outlook',
  auth: {
    user: 'yourname@outlook.com',
    pass: 'your-password'
  }
});
```

### SendGrid (Recommended for Production)
```javascript
const transporter = nodemailer.createTransporter({
  service: 'SendGrid',
  auth: {
    user: 'apikey',
    pass: 'your-sendgrid-api-key'
  }
});
```

## Step 7: Vercel Environment Variables

For Vercel deployment, add these environment variables:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   - `EMAIL_SERVICE` = `gmail`
   - `EMAIL_USER` = `bshanth0206@gmail.com`
   - `EMAIL_PASS` = `rjjn ixsx kfty pgdx`
   - `ADMIN_EMAIL` = `bshanth0206@gmail.com`
   - `SEND_CONFIRMATION` = `true`

## Quick Fix for Your Current Issue

The most likely cause is the App Password format. Make sure:

1. ✅ Your App Password is: `rjjn ixsx kfty pgdx` (with spaces)
2. ✅ 2-factor authentication is enabled
3. ✅ App Password is for "Mail" application
4. ✅ Your Gmail account is active

Try redeploying with the updated configuration and let me know if you still get the error!
