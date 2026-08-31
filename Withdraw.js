const admin = require('firebase-admin');

async function showWithdraw(bot, msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const db = admin.database();

    try {
        const userRef = db.ref(`users/${userId}`);
        const snapshot = await userRef.once('value');
        const userData = snapshot.val() || {};

        const currentBalance = userData.currentBalance || 0;
        const miningBalance = userData.miningBalance || 0;
        const savedMethod = userData.withdrawMethod;
        const savedNumber = userData.withdrawNumber;

        if (savedMethod && savedNumber) {
            const withdrawMenu = {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: `${savedMethod}: ${savedNumber}`, callback_data: 'edit_wallet' }],
                        [{ text: 'Withdraw', callback_data: 'do_withdraw' }]
                    ]
                }
            };

            bot.sendMessage(chatId, `📤 উইথড্র প্যানেল\n\n💰 বর্তমান ব্যালেন্স: ${currentBalance} BDT\n⛏️ মাইনিং ব্যালেন্স: ${miningBalance} BDT`, {
                reply_markup: withdrawMenu
            });
        } else {
            const walletMenu = {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Wallet', callback_data: 'setup_wallet' }]
                    ]
                }
            };

            bot.sendMessage(chatId, `📤 উইথড্র প্যানেল\n\n💰 বর্তমান ব্যালেন্স: ${currentBalance} BDT\n⛏️ মাইনিং ব্যালেন্স: ${miningBalance} BDT`, {
                reply_markup: walletMenu
            });
        }
    } catch (error) {
        bot.sendMessage(chatId, '❌ ডাটা লোড করতে সমস্যা হচ্ছে। কিছুক্ষণ পর চেষ্টা করুন।');
    }
}

async function handleWithdrawCallback(bot, query) {
    const chatId = query.message.chat.id;
    const userId = query.from.id;
    const data = query.data;
    const db = admin.database();

    if (data === 'setup_wallet') {
        bot.deleteMessage(chatId, query.message.message_id);

        const methodMenu = {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: 'Bkash', callback_data: 'wallet_bkash' },
                        { text: 'Nagad', callback_data: 'wallet_nagad' }
                    ]
                ]
            }
        };

        bot.sendMessage(chatId, 'পেমেন্ট নেওয়ার জন্য আপনার মাধ্যমটি সিলেক্ট করুন:', methodMenu);

    } else if (data === 'wallet_bkash' || data === 'wallet_nagad') {
        const method = data === 'wallet_bkash' ? 'Bkash' : 'Nagad';
        bot.deleteMessage(chatId, query.message.message_id);

        bot.sendMessage(chatId, `অনুগ্রহ করে আপনার ${method} নম্বরটি লিখুন:`, {
            reply_markup: { force_reply: true }
        }).then(sentMsg => {
            bot.onReplyToMessage(chatId, sentMsg.message_id, async (msg) => {
                const number = msg.text.trim();

                try {
                    const userRef = db.ref(`users/${userId}`);
                    await userRef.update({
                        withdrawMethod: method,
                        withdrawNumber: number
                    });

                    bot.sendMessage(chatId, `✅ আপনার ${method} নম্বর (${number}) সফলভাবে সেভ হয়েছে!`);
                    showWithdraw(bot, msg);
                } catch (error) {
                    bot.sendMessage(chatId, '❌ নম্বর সেভ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
                }
            });
        });

    } else if (data === 'edit_wallet') {
        bot.deleteMessage(chatId, query.message.message_id);

        const methodMenu = {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: 'Bkash', callback_data: 'wallet_bkash' },
                        { text: 'Nagad', callback_data: 'wallet_nagad' }
                    ]
                ]
            }
        };

        bot.sendMessage(chatId, 'আপনার ওয়ালেট পরিবর্তন করতে নতুন মাধ্যম সিলেক্ট করুন:', methodMenu);

    } else if (data === 'do_withdraw') {
        bot.deleteMessage(chatId, query.message.message_id);

        bot.sendMessage(chatId, 'আপনি কত টাকা উইথড্র করতে চান সেই পরিমাণটি লিখে রিপ্লাই দিন:', {
            reply_markup: { force_reply: true }
        }).then(sentMsg => {
            bot.onReplyToMessage(chatId, sentMsg.message_id, async (msg) => {
                const amount = Number(msg.text);

                if (isNaN(amount) || amount <= 0) {
                    bot.sendMessage(chatId, '❌ ভুল অ্যামাউন্ট! সঠিক সংখ্যা লিখুন।');
                    return;
                }

                try {
                    const userRef = db.ref(`users/${userId}`);
                    const userSnap = await userRef.once('value');
                    const userData = userSnap.val() || {};
                    const currentBalance = userData.currentBalance || 0;

                    if (currentBalance < amount) {
                        bot.sendMessage(chatId, '❌ আপনার একাউন্টে পর্যাপ্ত ব্যালেন্স নেই!');
                        return;
                    }

                    // ব্যালেন্স কেটে নেওয়া এবং উইথড্র রিকোয়েস্ট তৈরি করা
                    await userRef.update({
                        currentBalance: currentBalance - amount
                    });

                    const withdrawId = db.ref('withdraws').push().key;
                    await db.ref(`withdraws/${withdrawId}`).set({
                        userId: userId,
                        method: userData.withdrawMethod,
                        number: userData.withdrawNumber,
                        amount: amount,
                        status: 'pending',
                        timestamp: Date.now()
                    });

                    bot.sendMessage(chatId, `✅ আপনার উইথড্র রিকোয়েস্ট সফলভাবে জমা হয়েছে!\n\n💳 মাধ্যম: ${userData.withdrawMethod}\n📱 নম্বর: ${userData.withdrawNumber}\n💵 পরিমাণ: ${amount} BDT\n⏳ স্ট্যাটাস: Pending\n\nঅ্যাডমিন এপ্রুভ করার সাথে সাথে আপনাকে জানিয়ে দেওয়া হবে।`);

                } catch (error) {
                    bot.sendMessage(chatId, '❌ উইথড্র প্রসেস করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
                }
            });
        });
    }
}

module.exports = { showWithdraw, handleWithdrawCallback };