const admin = require('firebase-admin');

async function showRefer(bot, msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const db = admin.database();

    try {
        const userRef = db.ref(`users/${userId}`);
        const snapshot = await userRef.once('value');
        const userData = snapshot.val() || {};

        const botUsername = 'Mining62552_bot'; 
        const referLink = `https://t.me/${botUsername}?start=ref_${userId}`;

        const bonusPercentage = userData.referBonusPercent || 10; 
        const totalRefer = userData.totalReferral || 0;
        const activeRefer = userData.activeReferral || 0;
        const pendingRefer = userData.pendingReferral || 0;
        const todayCommission = userData.todayCommission || 0;
        const totalCommission = userData.totalCommission || 0;

        const referText = `👥 *রেফার এন্ড আর্ন সিস্টেম*

📌 *প্রতিটি মাইনিং থেকে কমিশন:* ${bonusPercentage}% বোনাস দেওয়া হবে।

🔗 *আপনার রেফার লিঙ্ক:*
\`${referLink}\`

📊 *আপনার রেফার পরিসংখ্যান:*
👥 মোট রেফার: ${totalRefer} জন
🟢 একটিভ রেফার (ডিপোজিট করেছে): ${activeRefer} জন
⏳ পেন্ডিং রেফার (ডিপোজিট করেনি): ${pendingRefer} জন

💰 *কমিশন হিস্ট্রি:*
📅 আজকের কমিশন: ${todayCommission} BDT
💎 মোট কমিশন: ${totalCommission} BDT`;

        bot.sendMessage(chatId, referText, { parse_mode: 'Markdown' });

    } catch (error) {
        bot.sendMessage(chatId, '❌ রেফার ডাটা লোড করতে সমস্যা হচ্ছে। কিছুক্ষণ পর চেষ্টা করুন।');
    }
}

async function handleReferralOnStart(bot, msg, match) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const firstName = msg.from.first_name;
    const db = admin.database();

    const startPayload = msg.text.split(' ')[1];

    if (startPayload && startPayload.startsWith('ref_')) {
        const referrerId = startPayload.replace('ref_', '');

        if (referrerId != userId) {
            try {
                const newUserRef = db.ref(`users/${userId}`);
                const userSnap = await newUserRef.once('value');

                if (!userSnap.exists()) {
                    await newUserRef.set({
                        currentBalance: 0,
                        miningBalance: 0,
                        referredBy: referrerId,
                        createdAt: Date.now()
                    });

                    const referrerRef = db.ref(`users/${referrerId}`);
                    const referrerSnap = await referrerRef.once('value');

                    if (referrerSnap.exists()) {
                        const referrerData = referrerSnap.val();
                        const currentTotalRefer = (referrerData.totalReferral || 0) + 1;
                        const currentPendingRefer = (referrerData.pendingReferral || 0) + 1;

                        await referrerRef.update({
                            totalReferral: currentTotalRefer,
                            pendingReferral: currentPendingRefer
                        });

                        bot.sendMessage(referrerId, `🎉 অভিনন্দন! ${firstName} আপনার রেফার লিঙ্ক ব্যবহার করে বটে জয়েন করেছে।`);
                    }
                }
            } catch (error) {
                console.error(error);
            }
        }
    }
}

module.exports = { showRefer, handleReferralOnStart };
