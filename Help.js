async function showHelp(bot, msg) {
    const chatId = msg.chat.id;

    const helpText = `📞 *হেল্প ও সাপোর্ট সেন্টার*

আপনার যদি বট ব্যবহার করতে কোনো সমস্যা হয় কিংবা ডিপোজিট বা উইথড্র নিয়ে কোনো প্রশ্ন থাকে, তবে নিচে দেওয়া সাপোর্টে যোগাযোগ করুন।

👨‍💻 আমাদের অফিশিয়াল সাপোর্ট: @YourAdminUsername`;

    bot.sendMessage(chatId, helpText, { parse_mode: 'Markdown' });
}

module.exports = { showHelp };
