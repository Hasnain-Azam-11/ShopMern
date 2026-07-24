const nodemailer = require('nodemailer');
const { abandonedCartTemplate } = require('./abandonedCartTemplate');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Verify transporter connection
transporter.verify((error, success) => {
    if (error) {
        console.log('❌ Email connection failed:', error.message);
    } else {
        console.log('✅ Email service ready to send emails');
    }
});

const sendOrderConfirmationEmail = async (order) => {
    try {
        const { customerInfo, items, orderNumber, subtotal, shipping, tax, discount, total, paymentMethod, shippingMethod } = order;

        // Build items HTML with proper image handling and SAFE FALLBACKS
        const itemsHTML = items.map(item => {
            // 🔥 SAFE FALLBACKS for every field
            const name = item.name || 'Product';
            const price = item.price || 0;
            const quantity = item.quantity || 1;
            
            // Handle imageURL - could be string or array
            const image = Array.isArray(item.imageURL) 
                ? item.imageURL[0] 
                : (item.imageURL || 'https://via.placeholder.com/60x72/cccccc/ffffff?text=No+Image');
            
            // Handle selected attributes
            const attributes = item.selectedAttributes || {};
            const attributeText = Object.entries(attributes)
                .map(([key, val]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${val}`)
                .join(' | ');

            return `
                <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <img src="${image}" alt="${name}" 
                                 style="width: 60px; height: 72px; object-fit: cover; border-radius: 4px;" />
                            <div>
                                <p style="margin: 0; font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">${name}</p>
                                ${attributeText ? `<p style="margin: 4px 0 0; color: #888; font-size: 12px;">${attributeText}</p>` : ''}
                                <p style="margin: 4px 0 0; color: #888; font-size: 12px;">Qty: ${quantity}</p>
                            </div>
                        </div>
                    </td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; text-align: right; font-weight: 600; font-size: 13px; vertical-align: top; padding-top: 20px;">
                        Rs. ${(price * quantity).toLocaleString()}
                    </td>
                </tr>
            `;
        }).join('');

        const shippingLabels = { 
            standard: 'Standard (3–5 days)', 
            express: 'Express (1–2 days)', 
            overnight: 'Overnight' 
        };

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
    <div style="max-width: 580px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">

        <!-- Header -->
        <div style="background-color: #1a1a2e; padding: 32px 40px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase;">
                Order Confirmed
            </h1>
            <p style="color: #aaaacc; margin: 8px 0 0; font-size: 13px; letter-spacing: 0.05em;">
                Thank you for your order, ${customerInfo.firstName}!
            </p>
        </div>

        <!-- Order Number Banner -->
        <div style="background-color: #f9f9f9; border-bottom: 1px solid #eeeeee; padding: 16px 40px; text-align: center;">
            <p style="margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #888;">Order Number</p>
            <p style="margin: 4px 0 0; font-size: 18px; font-weight: 700; color: #1a1a2e; letter-spacing: 0.08em;">${orderNumber}</p>
        </div>

        <!-- Body -->
        <div style="padding: 32px 40px;">

            <!-- Tracking CTA -->
            <div style="text-align: center; margin-bottom: 32px;">
                <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/order/tracking/${order._id}"
                   style="display: inline-block; background-color: #1a1a2e; color: #ffffff; text-decoration: none;
                          padding: 14px 32px; font-size: 11px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase;
                          border-radius: 4px;">
                    Track My Order
                </a>
            </div>

            <!-- Items -->
            <h2 style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #888; margin: 0 0 12px; border-bottom: 1px solid #eeeeee; padding-bottom: 10px;">
                Order Items (${items.length})
            </h2>
            <table style="width: 100%; border-collapse: collapse;">
                ${itemsHTML}
            </table>

            <!-- Totals -->
            <div style="margin-top: 20px; border-top: 2px solid #1a1a2e; padding-top: 16px;">
                <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                    <tr>
                        <td style="padding: 4px 0; color: #888;">Subtotal</td>
                        <td style="padding: 4px 0; text-align: right;">Rs. ${subtotal.toLocaleString()}</td>
                    </tr>
                    <tr>
                        <td style="padding: 4px 0; color: #888;">Shipping (${shippingLabels[shippingMethod] || shippingMethod})</td>
                        <td style="padding: 4px 0; text-align: right;">Rs. ${shipping.toLocaleString()}</td>
                    </tr>
                    <tr>
                        <td style="padding: 4px 0; color: #888;">Tax (10%)</td>
                        <td style="padding: 4px 0; text-align: right;">Rs. ${tax.toLocaleString()}</td>
                    </tr>
                    ${discount > 0 ? `
                    <tr>
                        <td style="padding: 4px 0; color: #16a34a;">Discount</td>
                        <td style="padding: 4px 0; text-align: right; color: #16a34a;">- Rs. ${discount.toLocaleString()}</td>
                    </tr>` : ''}
                    <tr>
                        <td style="padding: 12px 0 4px; font-weight: 700; font-size: 15px; text-transform: uppercase; letter-spacing: 0.05em;">Total</td>
                        <td style="padding: 12px 0 4px; text-align: right; font-weight: 700; font-size: 15px;">Rs. ${total.toLocaleString()}</td>
                    </tr>
                </table>
            </div>

            <!-- Shipping & Payment Info -->
            <div style="display: flex; gap: 20px; margin-top: 28px; flex-wrap: wrap;">
                <div style="flex: 1; min-width: 180px; background: #f9f9f9; padding: 16px 20px; border-radius: 4px;">
                    <p style="margin: 0 0 6px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #888;">Shipping To</p>
                    <p style="margin: 0; font-size: 13px; color: #1a1a2e; line-height: 1.6;">
                        ${customerInfo.firstName} ${customerInfo.lastName}<br/>
                        ${customerInfo.address}${customerInfo.apartment ? ', ' + customerInfo.apartment : ''}<br/>
                        ${customerInfo.city}, ${customerInfo.postalCode}<br/>
                        ${customerInfo.country}
                    </p>
                </div>
                <div style="flex: 1; min-width: 180px; background: #f9f9f9; padding: 16px 20px; border-radius: 4px;">
                    <p style="margin: 0 0 6px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #888;">Payment</p>
                    <p style="margin: 0; font-size: 13px; color: #1a1a2e; line-height: 1.6;">
                        ${paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card Payment'}<br/>
                        <span style="color: #888; font-size: 12px;">
                            ${paymentMethod === 'cod' ? 'Pay when you receive' : 'Payment confirmed'}
                        </span>
                    </p>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div style="background: #f9f9f9; border-top: 1px solid #eeeeee; padding: 24px 40px; text-align: center;">
            <p style="margin: 0; font-size: 11px; color: #aaa; letter-spacing: 0.05em;">
                Questions? Reply to this email or contact our support team.
            </p>
            <p style="margin: 8px 0 0; font-size: 10px; color: #ccc; text-transform: uppercase; letter-spacing: 0.1em;">
                © ${new Date().getFullYear()} ShopMern. All rights reserved.
            </p>
        </div>

    </div>
</body>
</html>`;

        await transporter.sendMail({
            from: `"ShopMern" <${process.env.EMAIL_USER}>`,
            to: customerInfo.email,
            subject: `Order Confirmed — ${orderNumber}`,
            html
        });

        console.log(`✅ Order confirmation email sent to ${customerInfo.email}`);
        return true;

    } catch (error) {
        console.error('❌ Error sending order confirmation email:', error);
        throw error;
    }
};

// Send Contact Email
const sendContactEmail = async (data) => {
    try {
        const { name, email, subject, message } = data;

        const mailOptions = {
            from: `"ShopMern" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject: `Contact Form: ${subject}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                    <h2 style="color: #1a1a2e;">New Contact Message</h2>
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Subject:</strong> ${subject}</p>
                    <p><strong>Message:</strong></p>
                    <div style="background: #f5f5f5; padding: 15px; border-radius: 4px; margin-top: 10px;">
                        ${message}
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`Contact email received from ${email}`);
        return true;

    } catch (error) {
        console.error(' Error sending contact email:', error);
        throw error;
    }
};

// Send Newsletter Email
const sendNewsletterEmail = async (email) => {
    try {
        const mailOptions = {
            from: `"ShopMern" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Welcome to ShopMern Newsletter!',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                    <h1 style="color: #1a1a2e; text-align: center;">Welcome to ShopMern!</h1>
                    <p style="text-align: center; color: #666;">Thank you for subscribing to our newsletter.</p>
                    <div style="background: #f5f5f5; padding: 15px; border-radius: 4px; margin: 20px 0;">
                        <p style="margin: 0; color: #333;">You'll receive updates on:</p>
                        <ul style="color: #666; margin-top: 10px;">
                            <li>New product arrivals</li>
                            <li>Exclusive offers and discounts</li>
                            <li>Seasonal sales</li>
                        </ul>
                    </div>
                    <p style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">
                        You can unsubscribe at any time by clicking the link in our emails.
                    </p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(` Newsletter email sent to ${email}`);
        return true;

    } catch (error) {
        console.error(' Error sending newsletter email:', error);
        throw error;
    }
};

// NEW - Send Abandoned Cart Reminder Email
const sendAbandonedCartEmail = async (email, userName, cartItems, totalAmount) => {
    try {
        const html = abandonedCartTemplate(userName, cartItems, totalAmount);

        await transporter.sendMail({
            from: `"ShopMern" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: '🛒 You left items in your cart!',
            html: html,
            text: `Hi ${userName || 'there'},\n\nYou left items in your cart! Your cart total is Rs. ${totalAmount.toLocaleString()}. Visit our store to complete your order.\n\n${process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173'}/cart`
        });

        console.log(` Abandoned cart email sent to ${email}`);
        return true;

    } catch (error) {
        console.error('Failed to send abandoned cart email:', error.message);
        return false;
    }
};

module.exports = { 
    sendOrderConfirmationEmail,
    sendContactEmail,
    sendNewsletterEmail,
    sendAbandonedCartEmail
};