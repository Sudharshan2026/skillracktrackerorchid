/**
 * Copyright (c) 2025 Sudharshan2026
 * Licensed under the MIT License
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
const nodemailer = require('nodemailer');

interface ReportData {
  name: string;
  email: string;
  message: string;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
}

const EMAIL_CONFIG = {
  service: 'gmail',
  user: 'bshanth0206@gmail.com',
  pass: 'rjjn ixsx kfty pgdx',
  adminEmail: 'bshanth0206@gmail.com',
  sendConfirmation: true
};


// Create transporter using environment variables
function createTransporter() {
  return nodemailer.createTransport({
    service:'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

// Validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate report data
function validateReportData(data: any): { isValid: boolean; error?: string } {
  if (!data || typeof data !== 'object') {
    return { isValid: false, error: 'Invalid request data' };
  }

  const { name, email, message } = data;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return { isValid: false, error: 'Name is required' };
  }

  if (!email || typeof email !== 'string' || !isValidEmail(email)) {
    return { isValid: false, error: 'Valid email is required' };
  }

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return { isValid: false, error: 'Message is required' };
  }

  if (message.trim().length < 10) {
    return { isValid: false, error: 'Message must be at least 10 characters long' };
  }

  return { isValid: true };
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    const response: ApiResponse = {
      success: false,
      error: 'Method not allowed'
    };
    res.status(405).json(response);
    return;
  }

  try {
    // Validate environment variables
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('Missing email configuration');
      const response: ApiResponse = {
        success: false,
        error: 'Email service not configured'
      };
      res.status(500).json(response);
      return;
    }

    // Validate request data
    const validation = validateReportData(req.body);
    if (!validation.isValid) {
      const response: ApiResponse = {
        success: false,
        error: validation.error
      };
      res.status(400).json(response);
      return;
    }

    const { name, email, message }: ReportData = req.body;

    // Create email transporter
    const transporter = createTransporter();

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER, // Send to admin or fallback to sender
      subject: `[SkillRack Tracker] Report from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
            New Report from SkillRack Tracker
          </h2>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #495057; margin-top: 0;">Report Details</h3>
            
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <div style="background: #fff; border: 1px solid #dee2e6; padding: 20px; border-radius: 8px;">
            <h3 style="color: #495057; margin-top: 0;">Message</h3>
            <p style="line-height: 1.6; color: #333;">${message.replace(/\n/g, '<br>')}</p>
          </div>
          
          <div style="margin-top: 30px; padding: 15px; background: #e9ecef; border-radius: 8px; font-size: 14px; color: #6c757d;">
            <p><strong>Note:</strong> This report was submitted through the SkillRack Tracker application.</p>
            <p>You can reply directly to this email to respond to ${name}.</p>
          </div>
        </div>
      `,
      text: `
New Report from SkillRack Tracker

Name: ${name}
Email: ${email}
Submitted: ${new Date().toLocaleString()}

Message:
${message}

---
This report was submitted through the SkillRack Tracker application.
You can reply directly to this email to respond to ${name}.
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);

    // Send confirmation email to user (optional)
    if (process.env.SEND_CONFIRMATION === 'true') {
      const confirmationOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Report Received - SkillRack Tracker',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #28a745;">Thank you for your report!</h2>
            
            <p>Hi ${name},</p>
            
            <p>We have received your report and will review it shortly. Our team will get back to you as soon as possible.</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #495057; margin-top: 0;">Your Message</h3>
              <p style="line-height: 1.6;">${message.replace(/\n/g, '<br>')}</p>
            </div>
            
            <p>If you have any additional information or questions, please don't hesitate to contact us.</p>
            
            <p>Best regards,<br>SkillRack Tracker Team</p>
          </div>
        `,
        text: `
Thank you for your report!

Hi ${name},

We have received your report and will review it shortly. Our team will get back to you as soon as possible.

Your Message:
${message}

If you have any additional information or questions, please don't hesitate to contact us.

Best regards,
SkillRack Tracker Team
        `
      };

      await transporter.sendMail(confirmationOptions);
    }

    const response: ApiResponse = {
      success: true,
      message: 'Report submitted successfully'
    };

    res.status(200).json(response);

  } catch (error: any) {
    console.error('Error sending report email:', error);

    let errorMessage = 'Failed to send report';
    
    if (error.code === 'EAUTH') {
      errorMessage = 'Email authentication failed';
    } else if (error.code === 'ECONNECTION') {
      errorMessage = 'Unable to connect to email service';
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage = 'Email service timeout';
    }

    const response: ApiResponse = {
      success: false,
      error: errorMessage
    };

    res.status(500).json(response);
  }
}
