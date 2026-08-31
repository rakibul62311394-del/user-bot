const admin = require('firebase-admin');

async function showBalance(bot, msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const db = admin.database();
    
    try {
        const userRef = db.ref(`users/${userId}`);
        const snapshot = await userRef.once('value');
        
        let currentBalance = 0;
        let miningBalance = 0;

        if (snapshot.exists()) {
            const userData = snapshot.val();
            if (userData.currentBalance) {
                currentBalance = userData.currentBalance;
            }
            if (userData.miningBalance) {
                miningBalance = userData.miningBalance;
            }
        }

        const messageText = `Current balance ${currentBalance} BDT\nMining balance ${miningBalance} BDT`;

        bot.sendMessage(chatId, messageText);

    } catch (error) {
        bot.sendMessage(chatId, '❌ ব্যালেন্স দেখতে সমস্যা হচ্ছে। কিছুক্ষণ পর আবার চেষ্টা করুন।');
    }
}

module.exports = { showBalance };
