const admin = require('firebase-admin');

async function showDeposit(bot, msg) {
    const chatId = msg.chat.id;

    const depositMenu = {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: 'Bkash', callback_data: 'dep_bkash' },
                    { text: 'Nagad', callback_data: 'dep_nagad' }
                ]
            ]
        }
    };

    bot.sendMessage(chatId, '📥 ডিপোজিট করতে নিচের যেকোনো একটি মাধ্যম সিলেক্ট করুন:', depositMenu);
}

async function handleDepositCallback(bot, query) {
    const chatId = query.message.chat.id;
    const userId = query.from.id;
    const data = query.data;
    const db = admin.database();

    if (data === 'dep_bkash' || data === 'dep_nagad') {
        const method = data === 'dep_bkash' ? 'Bkash' : 'Nagad';
        bot.deleteMessage(chatId, query.message.message_id);

        bot.sendMessage(chatId, `আপনি ${method} সিলেক্ট করেছেন। আপনি কত টাকা ডিপোজিট করতে চান সেই পরিমাণটি লিখে রিপ্লাই দিন:`, {
            reply_markup: { force_reply: true }
        }).then(sentMsg => {
            bot.onReplyToMessage(chatId, sentMsg.message_id, async (msg) => {
                const amount = Number(msg.text);
                if (isNaN(amount) || amount <= 0) {
                    bot.sendMessage(chatId, '❌ ভুল অ্যামাউন্ট! সঠিক সংখ্যা লিখুন।');
                    return;
                }

                try {
                    const settingsRef = db.ref(`settings/paymentNumbers/${method.toLowerCase()}`);
                    const numSnap = await settingsRef.once('value');
                    const paymentNumber = numSnap.val() || '01XXXXXXXXX';

                    const tempRef = db.ref(`tempDeposit/${userId}`);
                    await tempRef.set({
                        method: method,
                        amount: amount,
                        status: 'waiting_trx'
                    });

                    const paymentMenu = {
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: `📞 নম্বর কপি করুন: ${paymentNumber}`, callback_data: 'copy_num' }],
                                [{ text: 'TrxID দিন', callback_data: 'send_trx' }]
                            ]
                        }
                    };

                    bot.sendMessage(chatId, `💰 ডিপোজিট অ্যামাউন্ট: ${amount} BDT\nমাধ্যম: ${method}\n\nদয়া করে নিচের নম্বরে সেন্ড মনি করুন:\n\`${paymentNumber}\`\n\nটাকা পাঠানো শেষ হলে নিচের "TrxID দিন" বাটনে ক্লিক করুন।`, {
                        parse_mode: 'Markdown',
                        reply_markup: paymentMenu
                    });

                } catch (error) {
                    bot.sendMessage(chatId, '❌ সিস্টেম এরর! আবার চেষ্টা করুন।');
                }
            });
        });
    } else if (data === 'copy_num') {
        bot.answerCallbackQuery(query.id, { text: 'নম্বরটি ট্যাপ করে কপি করে নিন!', show_alert: false });
    } else if (data === 'send_trx') {
        bot.deleteMessage(chatId, query.message.message_id);

        bot.sendMessage(chatId, 'অনুগ্রহ করে আপনার ট্রানজেকশন আইডি (TrxID) টি লিখে রিপ্লাই দিন:', {
            reply_markup: { force_reply: true }
        }).then(sentMsg => {
            bot.onReplyToMessage(chatId, sentMsg.message_id, async (msg) => {
                const trxId = msg.text.trim();
                const tempRef = db.ref(`tempDeposit/${userId}`);
                const tempSnap = await tempRef.once('value');

                if (!tempSnap.exists()) {
                    bot.sendMessage(chatId, '❌ সেশন মেয়াদোত্তীর্ণ হয়ে গেছে। আবার ডিপোজিট শুরু করুন।');
                    return;
                }

                const depositData = tempSnap.val();

                try {
                    const depositId = db.ref('deposits').push().key;
                    await db.ref(`deposits/${depositId}`).set({
                        userId: userId,
                        method: depositData.method,
                        amount: depositData.amount,
                        trxId: trxId,
                        status: 'pending',
                        timestamp: Date.now()
                    });

                    await tempRef.remove();

                    bot.sendMessage(chatId, `✅ আপনার ডিপোজিট রিকোয়েস্ট সফলভাবে জমা হয়েছে!\n\n💳 মাধ্যম: ${depositData.method}\n💵 পরিমাণ: ${depositData.amount} BDT\n🔑 TrxID: ${trxId}\n⏳ স্ট্যাটাস: Pending\n\nঅ্যাডমিন চেক করার পর আপনার মূল ব্যালেন্সে টাকা যোগ করে দেওয়া হবে।`);

                } catch (error) {
                    bot.sendMessage(chatId, '❌ ডিপোজিট সেভ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
                }
            });
        });
    }
}

module.exports = { showDeposit, handleDepositCallback };
