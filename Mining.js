const admin = require('firebase-admin');

async function showMining(bot, msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const db = admin.database();

    try {
        const userRef = db.ref(`users/${userId}`);
        const snapshot = await userRef.once('value');
        let userData = snapshot.val() || {};

        if (userData.activeMining) {
            const now = Date.now();
            const startTime = userData.activeMining.startTime;
            const amount = userData.activeMining.amount;
            const passedMs = now - startTime;
            const passedHours = (passedMs / (1000 * 60 * 60)).toFixed(2);

            if (passedMs >= 24 * 60 * 60 * 1000) {
                let newMain = (userData.currentBalance || 0) + amount;
                
                await userRef.update({
                    currentBalance: newMain,
                    activeMining: null
                });
                bot.sendMessage(chatId, `✅ আপনার ২৪ ঘণ্টার মাইনিং শেষ হয়েছে! ${amount} BDT আপনার মেইন ব্যালেন্সে যোগ করা হয়েছে। নতুন করে মাইনিং শুরু করতে আবার মাইনিং এ ক্লিক করুন।`);
            } else {
                bot.sendMessage(chatId, `⛏️ আপনার মাইনিং চলছে...\n\nপরিমাণ: ${amount} BDT\nসময় পার হয়েছে: ${passedHours} ঘণ্টা\n\n(২৪ ঘণ্টা পর ব্যালেন্স অটোমেটিক যোগ হবে)`);
            }
        } else {
            const miningMenu = {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Total Balance Mining', callback_data: 'total_mining' }],
                        [{ text: 'Custom Balance Mining', callback_data: 'custom_mining' }]
                    ]
                }
            };
            bot.sendMessage(chatId, 'আপনি কীভাবে মাইনিং শুরু করতে চান তা নির্বাচন করুন:', miningMenu);
        }
    } catch (error) {
        bot.sendMessage(chatId, '❌ সিস্টেম এরর! কিছুক্ষণ পর আবার চেষ্টা করুন।');
    }
}

async function handleMiningCallback(bot, query) {
    const chatId = query.message.chat.id;
    const userId = query.from.id;
    const db = admin.database();
    const data = query.data;

    if (data === 'total_mining') {
        try {
            const userRef = db.ref(`users/${userId}`);
            const snapshot = await userRef.once('value');
            let userData = snapshot.val() || {};
            let balance = userData.currentBalance || 0;

            const settingsRef = db.ref('settings/minMiningAmount');
            const minSnapshot = await settingsRef.once('value');
            let minAmount = minSnapshot.val() || 10;

            if (balance < minAmount) {
                bot.answerCallbackQuery(query.id, { text: `❌ আপনার ব্যালেন্স কম! সর্বনিম্ন ${minAmount} BDT প্রয়োজন।`, show_alert: true });
                return;
            }

            await userRef.update({
                currentBalance: 0,
                activeMining: {
                    amount: balance,
                    startTime: Date.now()
                }
            });

            bot.deleteMessage(chatId, query.message.message_id);
            bot.sendMessage(chatId, `✅ সফলভাবে ${balance} BDT দিয়ে আপনার টোটাল ব্যালেন্স মাইনিং শুরু হয়েছে!`);
        } catch (error) {
            bot.answerCallbackQuery(query.id, { text: '❌ এরর হয়েছে!', show_alert: true });
        }
    } else if (data === 'custom_mining') {
        bot.deleteMessage(chatId, query.message.message_id);
        bot.sendMessage(chatId, 'কাস্টম মাইনিং শুরু করতে আপনার টাকার পরিমাণ লিখে রিপ্লাই দিন:', {
            reply_markup: {
                force_reply: true
            }
        }).then(sentMsg => {
            bot.onReplyToMessage(chatId, sentMsg.message_id, async (msg) => {
                const amount = Number(msg.text);
                if (isNaN(amount) || amount <= 0) {
                    bot.sendMessage(chatId, '❌ ভুল অ্যামাউন্ট! সঠিক সংখ্যা লিখুন।');
                    return;
                }

                try {
                    const userRef = db.ref(`users/${userId}`);
                    const snapshot = await userRef.once('value');
                    let userData = snapshot.val() || {};
                    let balance = userData.currentBalance || 0;

                    const settingsRef = db.ref('settings/minMiningAmount');
                    const minSnapshot = await settingsRef.once('value');
                    let minAmount = minSnapshot.val() || 10;

                    if (amount < minAmount) {
                        bot.sendMessage(chatId, `❌ সর্বনিম্ন মাইনিং অ্যামাউন্ট ${minAmount} BDT!`);
                        return;
                    }

                    if (balance < amount) {
                        bot.sendMessage(chatId, '❌ আপনার পর্যাপ্ত ব্যালেন্স নেই!');
                        return;
                    }

                    await userRef.update({
                        currentBalance: balance - amount,
                        activeMining: {
                            amount: amount,
                            startTime: Date.now()
                        }
                    });

                    bot.sendMessage(chatId, `✅ সফলভাবে ${amount} BDT দিয়ে আপনার কাস্টম মাইনিং শুরু হয়েছে!`);
                } catch (error) {
                    bot.sendMessage(chatId, '❌ সিস্টেম এরর! আবার চেষ্টা করুন।');
                }
            });
        });
    }
}

module.exports = { showMining, handleMiningCallback };
