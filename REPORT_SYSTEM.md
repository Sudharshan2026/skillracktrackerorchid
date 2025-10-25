# Report System Documentation

## Overview

A report system has been added to your SkillRack Tracker application, allowing clients to report problems or send feedback. The system is integrated into both the **Home** and **Stats** pages.

## Features

- **Modal-based Form**: Clean, accessible modal interface for submitting reports
- **Multiple Trigger Styles**: 
  - Link style on Home page footer
  - Icon button on Stats page header
- **Form Validation**: Required fields for name, email, and message
- **Success/Error Feedback**: Visual feedback after submission
- **Responsive Design**: Works seamlessly on mobile and desktop
- **Dark Mode Support**: Automatically adapts to user's theme preference

## Components Added

### 1. ReportForm Component (`src/components/ReportForm.tsx`)
A reusable form component with three trigger variants:
- `button` - Full button with text and icon
- `link` - Text link (used on Home page)
- `icon` - Icon-only button (used on Stats page)

### 2. Integration Points

**Home Page** (`src/components/HomePage.tsx`):
- Report link added to footer
- Accessible from anywhere on the home page

**Stats Page** (`src/components/StatsDisplay.tsx`):
- Report icon button in header
- Always visible while viewing statistics

## Current Implementation

The report system is now integrated with **Nodemailer** for sending emails. The form submits to `/api/report` endpoint which handles email delivery.

### Email Configuration

Set up your environment variables in `.env.local`:

```bash
# Required email configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Optional: Admin email (where reports are sent)
ADMIN_EMAIL=admin@yourdomain.com

# Optional: Send confirmation emails to users
SEND_CONFIRMATION=true
```

### Gmail Setup (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
   - Use this 16-character password as `EMAIL_PASS`

### Other Email Providers

**Outlook/Hotmail:**
```bash
EMAIL_SERVICE=outlook
EMAIL_USER=yourname@outlook.com
EMAIL_PASS=your-password
```

**Yahoo:**
```bash
EMAIL_SERVICE=yahoo
EMAIL_USER=yourname@yahoo.com
EMAIL_PASS=your-app-password
```

**Custom SMTP:**
```bash
EMAIL_SERVICE=smtp
EMAIL_HOST=smtp.your-provider.com
EMAIL_PORT=587
EMAIL_USER=yourname@yourdomain.com
EMAIL_PASS=your-password
```

### Installation

Install the required dependencies:

```bash
npm install nodemailer
npm install --save-dev @types/nodemailer
```

## Form Data Structure

The form collects:
```typescript
{
  name: string;    // User's name
  email: string;   // User's email
  message: string; // Problem description
}
```

## Styling

Custom styles are in `src/components/ReportForm.css`:
- Modal overlay with backdrop blur
- Smooth animations
- Responsive layout
- Dark mode support

You can customize colors, spacing, and animations by modifying the CSS variables.

## Usage Example

```tsx
import { ReportForm } from './components';

// Button variant
<ReportForm variant="button" triggerLabel="Report Issue" />

// Link variant
<ReportForm variant="link" triggerLabel="Report a Problem" />

// Icon variant
<ReportForm variant="icon" />
```

## Testing

### 1. Test Email Configuration

Before testing the full system, verify your email setup:

```bash
# Update the test script with your credentials
node test-email.js
```

This will:
- Verify your email configuration
- Send a test email to yourself
- Show any configuration errors

### 2. Test the Report System

1. **Set up environment variables** in `.env.local`:
   ```bash
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ADMIN_EMAIL=admin@yourdomain.com
   SEND_CONFIRMATION=true
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Test the form**:
   - Open the application
   - Look for "Report a Problem" link in the footer (Home page)
   - Or click the alert icon in the stats page header
   - Fill out the form and submit
   - Check your email for the report

### 3. Troubleshooting

**Common Issues:**

- **Authentication Error**: Use App Password for Gmail, not regular password
- **Connection Error**: Check internet connection and email service settings
- **Email not received**: Check spam folder, verify ADMIN_EMAIL setting
- **Form submission fails**: Check browser console for API errors

## Future Enhancements

Consider adding:
- Captcha verification for spam prevention
- File attachment support
- Categorization (bug, feature request, etc.)
- Priority levels
- Auto-fill user information from profile data
- Email notifications to administrators
- Integration with ticketing systems (e.g., Jira, GitHub Issues)

## Accessibility

The component follows accessibility best practices:
- ARIA labels for icon buttons
- Keyboard navigation support
- Focus management
- Screen reader friendly messages
- Semantic HTML structure

## License

MIT License - See LICENSE file for details

