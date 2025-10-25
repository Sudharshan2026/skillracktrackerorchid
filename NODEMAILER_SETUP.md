# Nodemailer Setup Guide for SkillRack Tracker

## Quick Setup

### 1. Install Dependencies
```bash
npm install nodemailer @types/nodemailer
```

### 2. Configure Environment Variables

Create `.env.local` file in your project root:

```bash
# Required
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Optional
ADMIN_EMAIL=admin@yourdomain.com
SEND_CONFIRMATION=true
```

### 3. Gmail Setup (Recommended)

1. **Enable 2-Factor Authentication**
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Turn on 2-Step Verification

2. **Generate App Password**
   - Go to Security → 2-Step Verification → App passwords
   - Select "Mail" as the app
   - Copy the 16-character password
   - Use this as `EMAIL_PASS` (not your regular Gmail password)

### 4. Test Configuration

```bash
# Update test-email.js with your credentials first
node test-email.js
```

### 5. Deploy

For Vercel deployment, add environment variables in your Vercel dashboard:
- Go to Project Settings → Environment Variables
- Add all the variables from your `.env.local`

## Alternative Email Providers

### Outlook/Hotmail
```bash
EMAIL_SERVICE=outlook
EMAIL_USER=yourname@outlook.com
EMAIL_PASS=your-password
```

### Yahoo
```bash
EMAIL_SERVICE=yahoo
EMAIL_USER=yourname@yahoo.com
EMAIL_PASS=your-app-password
```

### Custom SMTP
```bash
EMAIL_SERVICE=smtp
EMAIL_HOST=smtp.your-provider.com
EMAIL_PORT=587
EMAIL_USER=yourname@yourdomain.com
EMAIL_PASS=your-password
```

## Features

✅ **Professional Email Templates**: HTML and text versions  
✅ **User Confirmation**: Optional confirmation emails to users  
✅ **Error Handling**: Comprehensive error messages  
✅ **Validation**: Form validation and email format checking  
✅ **Security**: Environment variable protection  
✅ **Responsive**: Works on all devices  

## API Endpoint

The system creates `/api/report` endpoint that:
- Validates form data
- Sends formatted emails
- Handles errors gracefully
- Supports CORS for frontend integration

## Support

If you encounter issues:
1. Check the test script output
2. Verify environment variables
3. Check email provider documentation
4. Review error messages in browser console
