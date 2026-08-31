const admin = require('firebase-admin');

async function showHistory(bot, msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const db = admin.database();

    try {
        // উইথড্র হিস্ট্রি চেক করার উদাহরণ
        const withdrawRef = db.ref('withdraws').orderByChild('userId').equalTo(userId);
        const snapshot = await withdrawRef.once('value');

        if (!snapshot.exists()) {
            bot.sendMessage(chatId, '📜 আপনার কোনো উইথড্র বা ট্রানজেকশন হিস্ট্রি নেই।');
            return;
        }

        let historyText = `📜 *আপনার ট্রানজেকশন হিস্ট্রি*\n\n`;
        snapshot.forEach((childSnap) => {
            const data = childSnap.val();
            historyText += `💳 মাধ্যম: ${data.method}\n💵 পরিমাণ: ${data.amount} BDT\n⏳ স্ট্যাটাস: ${data.status}\n-------------------\n`;
        });

        bot.sendMessage(chatId, historyText, { parse_mode: 'Markdown' });
    } catch (error) {
        bot.sendMessage(chatId, '❌ হিস্ট্রি লোড করতে সমস্যা হয়েছে।');
    }
}

module.exports = { showHistory };
