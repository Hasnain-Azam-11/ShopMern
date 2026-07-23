const cron = require('node-cron');
const mongoose = require('mongoose');
const Cart = require('../models/Cart');
const User = require('../models/User');
const { sendAbandonedCartEmail } = require('../utils/emailService');

// ===== CONFIGURATION =====
const ABANDON_THRESHOLD_MINUTES = 3;   // send reminder 3 minutes after last cart activity
const CRON_SCHEDULE = '*/1 * * * *';   // check every 1 minute (must be frequent enough to catch a 3-min window)

/**
 * Find carts that:
 * - have at least 1 item
 * - haven't been touched in the last ABANDON_THRESHOLD_MINUTES
 * - haven't already been reminded for their current items
 */
const findAbandonedCarts = async () => {
    const thresholdDate = new Date(Date.now() - ABANDON_THRESHOLD_MINUTES * 60 * 1000);

    const abandonedCarts = await Cart.find({
        'items.0': { $exists: true },
        lastActivityAt: { $lte: thresholdDate },
        reminderSent: false
    });

    return abandonedCarts;
};

const processAbandonedCarts = async () => {
    try {
        console.log('Checking for abandoned carts...');

        const abandonedCarts = await findAbandonedCarts();

        if (abandonedCarts.length === 0) {
            console.log('No abandoned carts found.');
            return;
        }

        console.log(`Found ${abandonedCarts.length} abandoned cart(s) to process.`);

        let successCount = 0;
        let failCount = 0;

        for (const cart of abandonedCarts) {
            try {
                // Guard against any bad/placeholder userId values instead of crashing
                if (!mongoose.Types.ObjectId.isValid(cart.userId)) {
                    console.log(`Skipping cart ${cart._id}: invalid userId "${cart.userId}"`);
                    continue;
                }

                const user = await User.findById(cart.userId, 'email firstName lastName');

                if (!user || !user.email) {
                    console.log(`Skipping cart ${cart._id}: no user or email found`);
                    continue;
                }

                const emailSent = await sendAbandonedCartEmail(
                    user.email,
                    user.firstName || user.email.split('@')[0],
                    cart.items,
                    cart.totalAmount
                );

                if (emailSent) {
                    cart.reminderSent = true;
                    cart.reminderSentAt = new Date();
                    // Bypass the pre-save hook's reminderSent reset logic since items
                    // aren't being modified here — only save the reminder fields.
                    await Cart.updateOne(
                        { _id: cart._id },
                        { $set: { reminderSent: true, reminderSentAt: new Date() } }
                    );
                    successCount++;
                    console.log(`✅ Reminder sent to ${user.email}`);
                } else {
                    failCount++;
                    console.log(`❌ Failed to send reminder to ${user.email}`);
                }

                // small delay between emails to avoid rate limits
                await new Promise(resolve => setTimeout(resolve, 500));

            } catch (error) {
                failCount++;
                console.error(`Error processing cart ${cart._id}:`, error.message);
            }
        }

        console.log(`Summary: ${successCount} sent, ${failCount} failed`);

    } catch (error) {
        console.error('Error in abandoned cart job:', error);
    }
};

const startAbandonedCartJob = () => {
    cron.schedule(CRON_SCHEDULE, () => {
        processAbandonedCarts();
    });

    console.log(`Abandoned cart reminder job scheduled (${CRON_SCHEDULE})`);
    console.log(`Threshold: ${ABANDON_THRESHOLD_MINUTES} minute(s) of inactivity`);
};

module.exports = {
    startAbandonedCartJob,
    processAbandonedCarts
};