# Vercel Deployment Guide - SkillRack Tracker Report System

## ✅ Your Gmail Credentials Are Working!

Your local test confirmed that your Gmail App Password is working correctly. The Vercel deployment issue is just a configuration matter.

## 🚀 Deploy to Vercel

### Step 1: Add Environment Variables

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your project**
3. **Go to Settings** → **Environment Variables**
4. **Add these variables**:

```
EMAIL_SERVICE = gmail
EMAIL_USER = bshanth0206@gmail.com
EMAIL_PASS = rjjn ixsx kfty pgdx
ADMIN_EMAIL = bshanth0206@gmail.com
SEND_CONFIRMATION = true
```

### Step 2: Deploy

1. **Push your changes** to GitHub
2. **Vercel will automatically deploy**
3. **Test the report system** on your live site

### Step 3: Test the Live System

1. **Open your deployed site**
2. **Go to the footer** and click "Report a Problem"
3. **Fill out the form** and submit
4. **Check your email** for the report

## 🔧 Alternative: Hardcoded Credentials (Quick Fix)

If environment variables don't work, you can temporarily hardcode the credentials:

```javascript
// In api/report.ts, replace the createTransporter function with:
function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'bshanth0206@gmail.com',
      pass: 'rjjn ixsx kfty pgdx',
    },
    tls: {
      rejectUnauthorized: false
    }
  });
}
```

## 📧 What You'll Receive

When someone submits a report, you'll get:

1. **Professional HTML email** with:
   - User's name and email
   - Detailed problem description
   - Timestamp
   - Formatted layout

2. **User confirmation email** (if enabled):
   - Thank you message
   - Copy of their report
   - Professional branding

## 🎯 Testing Checklist

- [ ] Environment variables added to Vercel
- [ ] Code deployed to Vercel
- [ ] Report form accessible on live site
- [ ] Test report submitted
- [ ] Email received in inbox
- [ ] User confirmation email sent (if enabled)

## 🆘 If You Still Get Errors

1. **Check Vercel logs** for detailed error messages
2. **Verify environment variables** are set correctly
3. **Try the hardcoded credentials** approach
4. **Check Gmail App Password** is still valid

## 🎉 Success!

Once deployed, your users can:
- Report problems from the home page footer
- Report problems from the stats page header
- Receive confirmation emails
- Get professional support experience

Your SkillRack Tracker now has a complete report system! 🚀
