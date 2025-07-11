import nodemailer from 'nodemailer';
import config from '../config/index.js';

/**
 * Email Service for sending subscription-related notifications
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  /**
   * Initialize email transporter
   */
  initializeTransporter() {
    if (!config.email?.enabled) {
      console.log('📧 Email service disabled');
      return;
    }

    try {
      console.log('📧 Initializing email service with config:', {
        host: config.email.host,
        port: config.email.port,
        secure: config.email.secure,
        user: config.email.user,
        hasPassword: !!config.email.password,
        passwordLength: config.email.password ? config.email.password.length : 0
      });

      // Try using Gmail service first (simpler configuration)
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: config.email.user,
          pass: config.email.password,
        },
        pool: true,
        maxConnections: 5,
        maxMessages: 100,
        debug: false, // Disable debug to reduce noise
        logger: false, // Disable logger
      });

      console.log('📧 Email service initialized successfully');
      console.log('📧 Email service ready to send emails (verification will happen on first send)');

    } catch (error) {
      console.error('❌ Failed to initialize email service:', error);
    }
  }

  /**
   * Send payment reminder email
   */
  async sendPaymentReminder(user, subscription, daysUntilPayment) {
    if (!this.transporter) {
      console.log('📧 Email service not available, skipping payment reminder');
      return;
    }

    try {
      const subject = `Payment Reminder - Your ${subscription.planName} subscription renews in ${daysUntilPayment} day(s)`;
      
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Payment Reminder - UNextDoor</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #6FC935; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .amount { font-size: 24px; font-weight: bold; color: #6FC935; }
            .button { display: inline-block; background: #6FC935; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔔 Payment Reminder</h1>
            </div>
            <div class="content">
              <h2>Hi ${user.name || user.email}!</h2>
              
              <p>This is a friendly reminder that your <strong>${subscription.planName}</strong> subscription will be renewed automatically in <strong>${daysUntilPayment} day(s)</strong>.</p>
              
              <div style="background: white; padding: 20px; border-radius: 6px; margin: 20px 0;">
                <h3>Subscription Details:</h3>
                <p><strong>Plan:</strong> ${subscription.planName}</p>
                <p><strong>Amount:</strong> <span class="amount">${subscription.currency === 'INR' ? '₹' : '$'}${(subscription.amount / 100).toFixed(2)}</span></p>
                <p><strong>Renewal Date:</strong> ${new Date(subscription.nextBillingDate).toLocaleDateString()}</p>
                <p><strong>Payment Method:</strong> ${subscription.paymentMethod || 'Card'}</p>
              </div>
              
              <p>No action is required from you. The payment will be processed automatically using your saved payment method.</p>
              
              <p>If you need to update your payment method or cancel your subscription, please visit your account settings:</p>
              
              <a href="${config.app.frontendUrl}/profile/billing" class="button">Manage Subscription</a>
              
              <p><strong>Questions?</strong> Feel free to reach out to our support team at <a href="mailto:support@unextdoor.com">support@unextdoor.com</a></p>
              
              <p>Thank you for being a valued member!</p>
              
              <p>Best regards,<br>The UNextDoor Team</p>
            </div>
            <div class="footer">
              <p>You're receiving this email because you have an active subscription with UNextDoor.</p>
              <p>If you no longer wish to receive these notifications, you can disable them in your account settings.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const mailOptions = {
        from: `"UNextDoor" <${config.email.user}>`,
        to: user.email,
        subject: subject,
        html: html,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`📧 Payment reminder sent to ${user.email}`);
      
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to send payment reminder:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send payment failed notification
   */
  async sendPaymentFailedNotification(user, subscription, failureReason) {
    if (!this.transporter) {
      console.log('📧 Email service not available, skipping payment failed notification');
      return;
    }

    try {
      const subject = `Payment Failed - Action Required for Your ${subscription.planName} Subscription`;
      
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Payment Failed - UNextDoor</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc3545; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .amount { font-size: 24px; font-weight: bold; color: #dc3545; }
            .button { display: inline-block; background: #6FC935; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .alert { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚠️ Payment Failed</h1>
            </div>
            <div class="content">
              <h2>Hi ${user.name || user.email}!</h2>
              
              <p>We were unable to process the payment for your <strong>${subscription.planName}</strong> subscription.</p>
              
              <div class="alert">
                <strong>What happened?</strong><br>
                ${failureReason || 'Your payment method was declined. This could be due to insufficient funds, an expired card, or other payment issues.'}
              </div>
              
              <div style="background: white; padding: 20px; border-radius: 6px; margin: 20px 0;">
                <h3>Subscription Details:</h3>
                <p><strong>Plan:</strong> ${subscription.planName}</p>
                <p><strong>Amount:</strong> <span class="amount">${subscription.currency === 'INR' ? '₹' : '$'}${(subscription.amount / 100).toFixed(2)}</span></p>
                <p><strong>Failed Payment Date:</strong> ${new Date().toLocaleDateString()}</p>
              </div>
              
              <p><strong>Your subscription is still active</strong>, but we'll try to charge your payment method again in 3 days. If the payment continues to fail, your subscription will be cancelled.</p>
              
              <p><strong>To avoid any service interruption:</strong></p>
              <ul>
                <li>Update your payment method</li>
                <li>Ensure sufficient funds are available</li>
                <li>Check that your card hasn't expired</li>
              </ul>
              
              <a href="${config.app.frontendUrl}/profile/billing" class="button">Update Payment Method</a>
              
              <p>If you need help, please contact our support team at <a href="mailto:support@unextdoor.com">support@unextdoor.com</a></p>
              
              <p>Best regards,<br>The UNextDoor Team</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const mailOptions = {
        from: `"UNextDoor" <${config.email.user}>`,
        to: user.email,
        subject: subject,
        html: html,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`📧 Payment failed notification sent to ${user.email}`);
      
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to send payment failed notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send subscription cancelled notification
   */
  async sendSubscriptionCancelledNotification(user, subscription, reason) {
    if (!this.transporter) {
      console.log('📧 Email service not available, skipping cancellation notification');
      return;
    }

    try {
      const subject = `Subscription Cancelled - ${subscription.planName}`;
      
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Subscription Cancelled - UNextDoor</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #6c757d; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #6FC935; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📋 Subscription Cancelled</h1>
            </div>
            <div class="content">
              <h2>Hi ${user.name || user.email}!</h2>
              
              <p>Your <strong>${subscription.planName}</strong> subscription has been cancelled.</p>
              
              <div style="background: white; padding: 20px; border-radius: 6px; margin: 20px 0;">
                <h3>Cancellation Details:</h3>
                <p><strong>Plan:</strong> ${subscription.planName}</p>
                <p><strong>Cancelled On:</strong> ${new Date().toLocaleDateString()}</p>
                <p><strong>Reason:</strong> ${reason || 'User requested'}</p>
                ${subscription.currentPeriodEnd ? `<p><strong>Access Until:</strong> ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}</p>` : ''}
              </div>
              
              ${subscription.currentPeriodEnd ? 
                '<p>You\'ll continue to have access to premium features until the end of your current billing period.</p>' : 
                '<p>Your access to premium features has ended.</p>'
              }
              
              <p>We're sorry to see you go! If you change your mind, you can reactivate your subscription anytime:</p>
              
              <a href="${config.app.frontendUrl}/subscription" class="button">Reactivate Subscription</a>
              
              <p>If you have any feedback about your experience, we'd love to hear from you at <a href="mailto:support@unextdoor.com">support@unextdoor.com</a></p>
              
              <p>Thank you for being part of the UNextDoor community!</p>
              
              <p>Best regards,<br>The UNextDoor Team</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const mailOptions = {
        from: `"UNextDoor" <${config.email.user}>`,
        to: user.email,
        subject: subject,
        html: html,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`📧 Subscription cancelled notification sent to ${user.email}`);
      
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to send cancellation notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send payment success notification
   */
  async sendPaymentSuccessNotification(user, subscription, paymentData) {
    if (!this.transporter) {
      console.log('📧 Email service not available, skipping payment success notification');
      return { success: false, error: 'Email service not initialized' };
    }

    try {
      const subject = `Payment Successful - Your ${subscription.planName} subscription has been renewed`;
      
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2ECC71; margin-bottom: 10px;">✅ Payment Successful!</h1>
            <p style="color: #666; font-size: 16px;">Your subscription has been renewed successfully</p>
          </div>

          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
            <h3 style="color: #333; margin-top: 0;">Subscription Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666;">Plan:</td>
                <td style="padding: 8px 0; color: #333; font-weight: bold;">${subscription.planName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Amount Paid:</td>
                <td style="padding: 8px 0; color: #333; font-weight: bold;">${subscription.currency} ${(subscription.amount / 100).toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Payment ID:</td>
                <td style="padding: 8px 0; color: #333; font-family: monospace;">${paymentData.paymentId}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Next Billing Date:</td>
                <td style="padding: 8px 0; color: #333; font-weight: bold;">${new Date(subscription.nextBillingDate).toLocaleDateString()}</td>
              </tr>
            </table>
          </div>

          <div style="background-color: #e8f5e8; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
            <p style="margin: 0; color: #2d5a2d;">
              <strong>Your subscription is now active until ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}</strong>
            </p>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.CLIENT_URL}/profile/billing" 
               style="background-color: #2ECC71; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Billing Details
            </a>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 12px;">
            <p>Thank you for continuing with UNextDoor!</p>
            <p>© ${new Date().getFullYear()} UNextDoor. All rights reserved.</p>
          </div>
        </div>
      `;

      const result = await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || 'UNextDoor <noreply@unextdoor.com>',
        to: user.email,
        subject: subject,
        html: htmlContent
      });

      console.log(`✅ Payment success notification sent to ${user.email}`);
      return { success: true, messageId: result.messageId };

    } catch (error) {
      console.error('❌ Failed to send payment success notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send manual renewal notification with payment link
   */
  async sendManualRenewalNotification(user, subscription, orderData) {
    if (!this.transporter) {
      console.log('📧 Email service not available, skipping manual renewal notification');
      return { success: false, error: 'Email service not initialized' };
    }

    try {
      const subject = `Action Required: Renew your ${subscription.planName} subscription`;
      const paymentUrl = `${process.env.CLIENT_URL}/payment?orderId=${orderData.id}`;
      
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #f39c12; margin-bottom: 10px;">⏰ Subscription Renewal Required</h1>
            <p style="color: #666; font-size: 16px;">Your subscription is due for renewal</p>
          </div>

          <div style="background-color: #fff3cd; padding: 20px; border-radius: 6px; margin-bottom: 20px; border-left: 4px solid #f39c12;">
            <p style="margin: 0; color: #856404;">
              <strong>Your ${subscription.planName} subscription expires on ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}</strong>
            </p>
          </div>

          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
            <h3 style="color: #333; margin-top: 0;">Renewal Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666;">Plan:</td>
                <td style="padding: 8px 0; color: #333; font-weight: bold;">${subscription.planName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Amount:</td>
                <td style="padding: 8px 0; color: #333; font-weight: bold;">${subscription.currency} ${(subscription.amount / 100).toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Billing Period:</td>
                <td style="padding: 8px 0; color: #333;">${subscription.intervalCount} ${subscription.interval}(s)</td>
              </tr>
            </table>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${paymentUrl}" 
               style="background-color: #2ECC71; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-size: 16px; font-weight: bold;">
              Renew Subscription Now
            </a>
          </div>

          <div style="background-color: #f8d7da; padding: 15px; border-radius: 6px; margin-bottom: 20px; border-left: 4px solid #dc3545;">
            <p style="margin: 0; color: #721c24;">
              <strong>Important:</strong> If not renewed by ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}, your subscription will expire and you'll lose access to premium features.
            </p>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 12px;">
            <p>Need help? Contact our support team.</p>
            <p>© ${new Date().getFullYear()} UNextDoor. All rights reserved.</p>
          </div>
        </div>
      `;

      const result = await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || 'UNextDoor <noreply@unextdoor.com>',
        to: user.email,
        subject: subject,
        html: htmlContent
      });

      console.log(`✅ Manual renewal notification sent to ${user.email}`);
      return { success: true, messageId: result.messageId };

    } catch (error) {
      console.error('❌ Failed to send manual renewal notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send subscription suspended notification
   */
  async sendSubscriptionSuspendedNotification(user, subscription) {
    if (!this.transporter) {
      console.log('📧 Email service not available, skipping suspension notification');
      return { success: false, error: 'Email service not initialized' };
    }

    try {
      const subject = `Subscription Suspended - Multiple payment failures detected`;
      
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #dc3545; margin-bottom: 10px;">⚠️ Subscription Suspended</h1>
            <p style="color: #666; font-size: 16px;">Your subscription has been suspended due to payment issues</p>
          </div>

          <div style="background-color: #f8d7da; padding: 20px; border-radius: 6px; margin-bottom: 20px; border-left: 4px solid #dc3545;">
            <p style="margin: 0; color: #721c24;">
              <strong>Your ${subscription.planName} subscription has been suspended due to multiple failed payment attempts.</strong>
            </p>
          </div>

          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
            <h3 style="color: #333; margin-top: 0;">What This Means</h3>
            <ul style="color: #666; line-height: 1.6;">
              <li>You've lost access to premium features</li>
              <li>Your account has been downgraded to the free plan</li>
              <li>You can reactivate anytime by updating your payment method</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL}/subscription" 
               style="background-color: #2ECC71; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-size: 16px; font-weight: bold;">
              Reactivate Subscription
            </a>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 12px;">
            <p>Questions? Contact our support team for assistance.</p>
            <p>© ${new Date().getFullYear()} UNextDoor. All rights reserved.</p>
          </div>
        </div>
      `;

      const result = await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || 'UNextDoor <noreply@unextdoor.com>',
        to: user.email,
        subject: subject,
        html: htmlContent
      });

      console.log(`✅ Subscription suspended notification sent to ${user.email}`);
      return { success: true, messageId: result.messageId };

    } catch (error) {
      console.error('❌ Failed to send suspension notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send subscription expired notification
   */
  async sendSubscriptionExpiredNotification(user, subscription) {
    if (!this.transporter) {
      console.log('📧 Email service not available, skipping expiration notification');
      return { success: false, error: 'Email service not initialized' };
    }

    try {
      const subject = `Subscription Expired - ${subscription.planName} plan has ended`;
      
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #6c757d; margin-bottom: 10px;">📅 Subscription Expired</h1>
            <p style="color: #666; font-size: 16px;">Your subscription has reached its end date</p>
          </div>

          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin-bottom: 20px; border-left: 4px solid #6c757d;">
            <p style="margin: 0; color: #495057;">
              <strong>Your ${subscription.planName} subscription expired on ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}</strong>
            </p>
          </div>

          <div style="background-color: #e2e3e5; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
            <h3 style="color: #333; margin-top: 0;">What Happens Now</h3>
            <ul style="color: #666; line-height: 1.6;">
              <li>Your account has been moved to the free plan</li>
              <li>Premium features are no longer accessible</li>
              <li>Your learning progress and data are safely preserved</li>
              <li>You can resubscribe anytime to regain full access</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL}/subscription" 
               style="background-color: #2ECC71; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-size: 16px; font-weight: bold;">
              Renew Subscription
            </a>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 12px;">
            <p>Thank you for being part of the UNextDoor community!</p>
            <p>© ${new Date().getFullYear()} UNextDoor. All rights reserved.</p>
          </div>
        </div>
      `;

      const result = await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || 'UNextDoor <noreply@unextdoor.com>',
        to: user.email,
        subject: subject,
        html: htmlContent
      });

      console.log(`✅ Subscription expired notification sent to ${user.email}`);
      return { success: true, messageId: result.messageId };

    } catch (error) {
      console.error('❌ Failed to send expiration notification:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new EmailService();
