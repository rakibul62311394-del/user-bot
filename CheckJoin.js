const channelUsername = '@dk_win1025';

const mainMenu = {
    reply_markup: {
        keyboard: [
            ['💰 Balance', '⛏️ Mining'],
            ['📥 Deposit', '📤 Withdraw'],
            ['👥 Refer']
        ],
        resize_keyboard: true,
        is_persistent: true
    }
};

const joinMenu = {
    reply_markup: {
        inline_keyboard: [
            [{ text: '📢 জয়েন চ্যানেল', url: `https://t.me/${channelUsername.replace('@', '')}` }],
            [{ text: '✅ আমি জয়েন করেছি', callback_data: 'check_join' }]
        ]
    }
};

async function startCommand(bot, msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    
    try {
        const member = await bot.getChatMember(channelUsername, userId);
        const status = member.status;
        
        if (status === 'member' || status === 'administrator' || status === 'creator') {
            bot.sendMessage(chatId, `স্বাগতম ${msg.from.first_name}! আমাদের মাইনিং বটে আপনাকে স্বাগতম।`, mainMenu);
        } else {
            bot.sendMessage(chatId, '❌ আমাদের বট ব্যবহার করতে হলে আপনাকে আগে আমাদের অফিশিয়াল চ্যানেলে জয়েন করতে হবে। নিচের বাটনে ক্লিক করে জয়েন করুন:', joinMenu);
        }
    } catch (error) {
        bot.sendMessage(chatId, '❌ আমাদের বট ব্যবহার করতে হলে আপনাকে আগে আমাদের অফিশিয়াল চ্যানেলে জয়েন করতে হবে। নিচের বাটনে ক্লিক করে জয়েন করুন:', joinMenu);
    }
}

async function verifyJoin(bot, query) {
    const chatId = query.message.chat.id;
    const userId = query.from.id;
    
    try {
        const member = await bot.getChatMember(channelUsername, userId);
        const status = member.status;
        
        if (status === 'member' || status === 'administrator' || status === 'creator') {
            bot.deleteMessage(chatId, query.message.message_id);
            bot.sendMessage(chatId, `✅ ভেরিফিকেশন সফল হয়েছে! স্বাগতম ${query.from.first_name}।`, mainMenu);
        } else {
            bot.answerCallbackQuery(query.id, { text: '❌ আপনি এখনো চ্যানেলে জয়েন করেননি! আগে জয়েন করুন।', show_alert: true });
        }
    } catch (error) {
         bot.answerCallbackQuery(query.id, { text: '❌ আপনি এখনো চ্যানেলে জয়েন করেননি! আগে জয়েন করুন।', show_alert: true });
    }
}

module.exports = { startCommand, verifyJoin };
