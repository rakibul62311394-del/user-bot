const admin = require('firebase-admin');

async function showAccount(bot, msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const firstName = msg.from.first_name || 'N/A';
    const lastName = msg.from.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim();
    const username = msg.from.username ? `@${msg.from.username}` : 'N/A';
    const db = admin.database();

    try {
        const userRef = db.ref(`users/${userId}`);
        const snapshot = await userRef.once('value');
        let userData = snapshot.val() || {};

        const currentBalance = userData.currentBalance || 0;
        const miningBalance = userData.miningBalance || 0;
        const totalRefer = userData.totalReferral || 0;
        const createdAt = userData.createdAt ? new Date(userData.createdAt).toLocaleDateString('bn-BD') : 'N/A';

        const accountText = `👤 *অ্যাকাউন্ট ইনফরমেশন*

📌 *নাম:* ${fullName}
🆔 *ইউজার আইডি (Chat ID):* \`${userId}\`
🔗 *ইউজারনেম:* ${username}
💰 *মেইন ব্যালেন্স:* ${currentBalance} BDT
⛏️ *মাইনিং ব্যালেন্স:* ${miningBalance} BDT
👥 *মোট রেফার:* ${totalRefer} জন
📅 *একাউন্ট খোলার তারিখ:* ${createdAt}`;

        bot.sendMessage(chatId, accountText, { parse_mode: 'Markdown' });

    } catch (error) {
        bot.sendMessage(chatId, '❌ একাউন্ট ইনফরমেশন লোড করতে সমস্যা হচ্ছে। কিছুক্ষণ পর চেষ্টা করুন।');
    }
}

module.exports = { showAccount };
