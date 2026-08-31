 const http = require('http');
const TelegramBot = require('node-telegram-bot-api');
const admin = require('firebase-admin');
const fs = require('fs');

// রেন্ডার ফ্রি সার্ভিসের জন্য পোর্ট বাইন্ডিং ও HTTP সার্ভার
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot is running successfully!\n');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

// রেন্ডার সিক্রেট পাথ অথবা লোকাল পাথ হ্যান্ডেল করার ব্যবস্থা
const secretPath = '/etc/secrets/firebase-key.json';
const localPath = './firebase-key.json';

let serviceAccount;
if (fs.existsSync(secretPath)) {
  serviceAccount = require(secretPath);
} else {
  serviceAccount = require(localPath);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://bet-baji-vip.firebaseio.com"
});

const token = '8887899305:AAH40jwwtHuX2HeoMjupDkroq5-f5pV9sUA';
const bot = new TelegramBot(token, { polling: true });

const CheckJoin = require('./CheckJoin');
const Balance = require('./Balance');
const Reffer = require('./Reffer');
const Deposit = require('./Deposit');
const Withdraw = require('./Withdraw');
const Mining = require('./Mining');
const Help = require('./Help');
const History = require('./History');
const Account = require('./Account');

bot.on('message', (msg) => {
    const text = msg.text;
    
    if (!text) {
        return;
    }

    if (text.startsWith('/start')) {
        // প্রথমে চেক করবে ইউজার চ্যানেলে জয়েন করেছে কিনা এবং রেফার হ্যান্ডেল করবে
        CheckJoin.startCommand(bot, msg);
        Reffer.handleReferralOnStart(bot, msg);
    } else if (text === '💰 Balance') {
        Balance.showBalance(bot, msg);
    } else if (text === '👥 Refer') {
        Reffer.showRefer(bot, msg);
    } else if (text === '📥 Deposit') {
        Deposit.showDeposit(bot, msg);
    } else if (text === '📤 Withdraw') {
        Withdraw.showWithdraw(bot, msg);
    } else if (text === '⛏️ Mining') {
        Mining.showMining(bot, msg);
    } else if (text === '📞 Help') {
        Help.showHelp(bot, msg);
    } else if (text === '📜 History') {
        History.showHistory(bot, msg);
    } else if (text === '👤 Account') {
        Account.showAccount(bot, msg);
    }
});

bot.on('callback_query', (query) => {
    const data = query.data;

    if (!data) return;

    if (data === 'check_join') {
        CheckJoin.verifyJoin(bot, query);
    } else if (data === 'total_mining' || data === 'custom_mining') {
        Mining.handleMiningCallback(bot, query);
    } else if (data === 'setup_wallet' || data === 'wallet_bkash' || data === 'wallet_nagad' || data === 'edit_wallet' || data === 'do_withdraw') {
        Withdraw.handleWithdrawCallback(bot, query);
    } else if (data === 'dep_bkash' || data === 'dep_nagad' || data === 'copy_num' || data === 'send_trx') {
        Deposit.handleDepositCallback(bot, query);
    }
});
