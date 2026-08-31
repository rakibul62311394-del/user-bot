 const http = require('http');
const TelegramBot = require('node-telegram-bot-api');
const admin = require('firebase-admin');

// রেন্ডার ফ্রি সার্ভিসের জন্য পোর্ট বাইন্ডিং ও HTTP সার্ভার
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot is running successfully!\n');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

// ফায়ারবেস সরাসরি কনফিগার করা হলো (কোনো ফাইলের ঝামেলা ছাড়াই)
admin.initializeApp({
  credential: admin.credential.cert({
    type: "service_account",
    project_id: "bet-baji-vip",
    private_key_id: "4fce170337507018e43f68d55047af14b42af90d",
    private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCnloOJ6jHu4OZp\nBQbVatRlly4gAy1KQeGUgB6DPBACITLLKWTiRaAW34VPSc49CkdJTpw0pG3hHfcC\nPBOjqLlNwdaHK86cVP9HbiIAsO0LVx3mTGhEu2TxeDpcHwxlv1vE1V4t2bJiK4pw\nqZJpnTfDtdcMWPWySTrmBPo0x75nXuAfSf6OdLaeKsVlXLjh4U9jain0mhV/ZELS\nNhaGRev6bOqYwNA++rTBdrPU5RW6DqkJjCEsVq4rDhir0kDy+hsTwADRk14a8UVQ\nXdyxmL43SmhfH2pDfEJ30O0CRpLETl/zyviUz35IPN5DIOLS1aMUjJJjMdK4bPSF\nMmDZCc8NAgMBAAECggEABChGJhSsBdsxMRy/8SX5DSVFceOXVsrz9oucCmAsI32Y\wvLdo/7N6CeQB2GU1N/q5m2D0sDo81Co9GXKILjRH8T5GAWXk2LCMKLv9htSidl0\nDj51x9EG/l5jIRO948DMT5kaDjt98GIVIOqB3lUBp2xPZ0Bn6PnEc01R1XA/zG+h\naS5XImY5kFeQsqw4M0vImzyvbwGoBzycZTlbAT7G9lKtQMHijrdpA+3nRpf6fR+8\ncFQ7o2OTsnZZ06ND36cDY9Q9agXA5KzgkSk1K9T2kIcjSy7XpfzhQjU9pkgQ6QA4\npSsUFnaLCos6Q3tIQ8iuIpPjgHmRN+L62mCtlG5InwKBgQDStdn3PpWNTUbDOYgR\nGvvc4sGBksznbFPqy6xfxrHlpN+CNt4STR75I3x/v23//sGqD9iVHIe+3CVvXteW\nr7R47BZmZVH3v9soV2gpBB7brwCzhaFSF5Ebn+/eQxh5xawdM7xus3Q5uPQmldAY\ncwItJozYfOnE9eVxqeULzu2P6wKBgQDLm+PqCiuWUyMSJCk72nDjoRid/PoUteOl\AY8cP1Qk9Sulyp18mxrIGUBwCF9GKBTlRgg8KqayhVBE1xLRSRhkm2QSxo5Bepg+\niiHG4+77/knCaEVOJ53ycHh6X9nguDW9lOaychuiiSZ8odab51D6DkAkONTqsalv\nn3GwNfxW5wKBgFZuuBk+d9Q9hbBhMhpqKjRiY6QGFr07Z3Th1TR4adLcfb6JSTDS\np8jksJYqbTHcS46570rDKD+3SDfV/LNYIbyUg1+/Yg8xiPGUYSqqAQp2T+BUCWeG\OUTOp3NRrIGO/1n/NeVnAV8IKkaFn5XX32Wr8YyAONhNUa/9U/IzEKm/AoGBAMlR\numkO5Uodqe+mEZ88vaJVByIvoJYZwpzEjdxAQdLJF/8198HdGv3++dfMb2fO+do5\nBKt5AJpDdrqabeDBhXz0qF5oNQBJV39+1Sby+LnxFL1EnEJKqcGts3JMlAG+ImTx\ndam7adesBIH3A1vjvA2DSaiHCP+F6yKTZLX2qyrBAoGBAMiWaSyRb01f+sQdU8SG\nf0BeFnmU7xoWuyS0fkGx/Ltvf5ewPA/P+LL2sQD5Tuz8x1lFaF0Te7WmsDUtvHzm\4I7LLZe0j39igbtoB5BhBiYSogkmu7OuuyRbLUE5zjvxgm8YRv1XiaBrm2DG9mys\nT3reYRAqM6hJ1A1xX98iP1OE\n-----END PRIVATE KEY-----\n",
    client_email: "firebase-adminsdk-fbsvc@bet-baji-vip.iam.gserviceaccount.com",
    client_id: "106184706095971470150",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40bet-baji-vip.iam.gserviceaccount.com",
    universe_domain: "googleapis.com"
  }),
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
