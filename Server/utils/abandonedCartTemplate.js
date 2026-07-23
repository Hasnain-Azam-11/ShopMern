const abandonedCartTemplate = (userName, cartItems, totalAmount) => {
    // Generate HTML for cart items
    const itemsHtml = cartItems.map(item => `
        <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 12px 8px;">
                <img src="${item.imageURL || 'https://via.placeholder.com/50'}" 
                     alt="${item.name}" 
                     style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;">
            </td>
            <td style="padding: 12px 8px;">${item.name}</td>
            <td style="padding: 12px 8px; text-align: center;">${item.quantity}</td>
            <td style="padding: 12px 8px; text-align: right;">Rs. ${(item.price * item.quantity).toLocaleString()}</td>
        </tr>
    `).join('');

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>You left something behind!</title>
        <style>
            body { font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #FF6B00, #FF8C3A); padding: 30px 20px; text-align: center; }
            .header h1 { color: #ffffff; margin: 0; font-size: 28px; }
            .header p { color: rgba(255,255,255,0.9); margin: 8px 0 0; }
            .content { padding: 30px 25px; }
            .greeting { font-size: 18px; margin-bottom: 16px; }
            .message { color: #555; line-height: 1.6; margin-bottom: 24px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th { background-color: #f5f5f5; padding: 12px 8px; text-align: left; font-weight: 600; color: #333; }
            th:last-child, td:last-child { text-align: right; }
            th:nth-child(3), td:nth-child(3) { text-align: center; }
            .total-row { font-size: 18px; font-weight: bold; border-top: 2px solid #eee; }
            .total-row td { padding: 16px 8px 8px; }
            .total-row td:last-child { color: #FF6B00; font-size: 22px; }
            .button { display: inline-block; background: linear-gradient(135deg, #FF6B00, #FF8C3A); color: #ffffff !important; text-decoration: none; padding: 14px 40px; border-radius: 50px; font-weight: 600; margin: 24px 0 16px; text-align: center; }
            .footer { text-align: center; padding: 20px; color: #999; font-size: 13px; border-top: 1px solid #eee; }
            .footer a { color: #FF6B00; text-decoration: none; }
            .highlight { background-color: #FFF0E6; padding: 16px 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #FF6B00; }
            .highlight strong { color: #FF6B00; }
            @media only screen and (max-width: 480px) {
                .content { padding: 20px 15px; }
                table { font-size: 14px; }
                .button { padding: 12px 30px; font-size: 16px; display: block; text-align: center; }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🛒 You left something behind!</h1>
                <p>Your cart is waiting for you</p>
            </div>

            <div class="content">
                <div class="greeting">
                    Hi <strong>${userName || 'there'}</strong>! 👋
                </div>

                <div class="message">
                    We noticed you added some items to your cart 
                    but didn't complete your order. We're here to help if you have any questions!
                </div>

                <div class="highlight">
                    <strong>📦 Your cart is still saved</strong> — just click the button below to pick up where you left off.
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Name</th>
                            <th>Qty</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                        <tr class="total-row">
                            <td colspan="3" style="text-align: right;">Total Amount:</td>
                            <td>Rs. ${totalAmount.toLocaleString()}</td>
                        </tr>
                    </tbody>
                </table>

                <div style="text-align: center;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/cart" class="button">
                        🛍️ View My Cart
                    </a>
                </div>

                <div style="text-align: center; color: #888; font-size: 14px; margin-top: 8px;">
                    or copy this link: <br>
                    <span style="font-size: 12px; word-break: break-all;">
                        ${process.env.FRONTEND_URL || 'http://localhost:5173'}/cart
                    </span>
                </div>

                <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #eee;">
                    <p style="color: #888; font-size: 14px;">
                        <strong>Need help?</strong> Reply to this email or contact our support team.
                    </p>
                </div>
            </div>

            <div class="footer">
                &copy; ${new Date().getFullYear()} Your Store. All rights reserved.<br>
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}">Visit our store</a>
            </div>
        </div>
    </body>
    </html>
    `;
};

module.exports = { abandonedCartTemplate };