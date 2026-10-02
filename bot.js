const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');
const pino = require('pino');

// Global Bot Links & Support Admins
global.botInfo = {
    groupLink: 'https://chat.whatsapp.com/DwZ7Q71aZloG1z91g1e5yd',
    channelLink: 'https://whatsapp.com/channel/0029VbDpsxYGZNCm8ABVkG0M',
    groupInviteCode: 'DwZ7Q71aZloG1z91g1e5yd',
    teamName: 'RUDE-CYBER-TEAM',
    admins: ['923297112041', '923026912592', '923458071063'], // Updated Admin Numbers
    adminButtons: [
        { name: 'Samar Hayat', link: 'https://wa.me/923297112041' },
        { name: 'Abdul Rauf Najmi', link: 'https://wa.me/923026912592' },
        { name: 'Qamar Abbas', link: 'https://wa.me/923458071063' }
    ]
};

global.statusview = true;
global.autoreact = true;
global.statusDelay = 5000;
global.fixedreact = null;

global.customCommands = {};

const emojis = [
    '🔥', '❤️', '👍', '💥', '✨', '⚡', '😎', '👑', '💯', '🚀', '🖤', '☠️', '🎯', '🦁',
    '🤩', '🥳', '🥹', '🤤', '😏', '🤪', '😜', '😝', '😛', '😬', '🥺', '😔', '🫪', '🤬', '😡', '😠', '😤', '😮‍💨', '😈',
    '🚳', '🚭', '❌', '⭕', '❗', '❔', '💭', '🗨️', '🔇', '🔕', '🔞', '📵', '🚷', '🚱', '🚯', '⛔', '📛', '♨️', '▶️', '🔽', '🔼', '📲', '📳', '☢️', '☣️', '⚠️', '🚸', '✅', '❎', '✔️', '☑️',
    '⬆️', '↗️', '➡️', '↘️️', '⬇️', '↙️', '🆗', '0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '🆙', '🆓', '🆕', '🚻', '🏧', '🚰', '👁️‍🗨️', '✖️', '➕', '➖', '➗', '🟰', '🎵', '🎶', '🎼', '®️', '©️️',
    '🏁', '🚩', '🎌', '🏴', '🏳️', '🏳️‍🌈', '🏳️‍⚧️', '🏴‍☠️', '🇵🇰', '☎️'
];

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('session');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        auth: state,
        browser: ['Rude-Cyber-Team', 'Chrome', '1.0.0']
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('[RUDE-CYBER-TEAM] Connection closed. Reconnecting...', shouldReconnect);
            if (shouldReconnect) startBot();
        } else if (connection === 'open') {
            console.log('====================================');
            console.log('🤖 RUDE-CYBER-TEAM BOT IS ONLINE!');
            console.log('📢 Channel: ' + global.botInfo.channelLink);
            console.log('👥 Group: ' + global.botInfo.groupLink);
            console.log('====================================');

            try {
                await sock.groupAcceptInvite(global.botInfo.groupInviteCode);
                console.log('[AUTO JOIN] Joined Rude-Cyber-Team Group!');
            } catch (err) {
                console.log('[AUTO JOIN] Already in group or invite error:', err.message);
            }
        }
    });

    sock.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const msg = chatUpdate.messages[0];
            if (!msg || !msg.message) return;

            const from = msg.key.remoteJid;
            const sender = msg.key.participant || msg.key.remoteJid;
            const senderNumber = sender.replace(/[^0-9]/g, '');

            const body = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
            const isAdmin = global.botInfo.admins.some(admin => senderNumber.includes(admin)) || msg.key.fromMe;

            if (body.startsWith('.')) {
                const args = body.slice(1).trim().split(/ +/);
                const command = args.shift().toLowerCase();

                if (isAdmin) {
                    if (command === 'addcmd') {
                        const cmdName = args[0]?.toLowerCase();
                        const responseText = args.slice(1).join(' ');

                        if (!cmdName || !responseText) {
                            await sock.sendMessage(from, { text: '❌ Usage: *.addcmd [cmd_name] [reply_text]*' });
                        } else {
                            global.customCommands[cmdName] = responseText;
                            await sock.sendMessage(from, { text: `✅ Command *${cmdName}* successfully added!` });
                        }
                    }

                    else if (command === 'delcmd') {
                        const cmdName = args[0]?.toLowerCase();
                        if (global.customCommands[cmdName]) {
                            delete global.customCommands[cmdName];
                            await sock.sendMessage(from, { text: `🗑️ Command *${cmdName}* deleted!` });
                        } else {
                            await sock.sendMessage(from, { text: '❌ Command not found!' });
                        }
                    }

                    else if (command === 'statusview') {
                        const opt = args[0]?.toLowerCase();
                        if (opt === 'on') global.statusview = true;
                        if (opt === 'off') global.statusview = false;
                        await sock.sendMessage(from, { text: `✅ Status View is now: *${global.statusview ? 'ON' : 'OFF'}*` });
                    }

                    else if (command === 'setdelay') {
                        const sec = parseInt(args[0]);
                        if (!isNaN(sec)) {
                            global.statusDelay = sec * 1000;
                            await sock.sendMessage(from, { text: `⏱️ Status Delay updated to: *${sec} seconds*` });
                        } else {
                            await sock.sendMessage(from, { text: `❌ Use format: *.setdelay 5*` });
                        }
                    }

                    else if (command === 'setreact') {
                        const emoji = args[0];
                        if (emoji === 'off' || emoji === 'random') {
                            global.fixedreact = null;
                            await sock.sendMessage(from, { text: `🔀 Reaction mode set to: *RANDOM EMOJIS*` });
                        } else if (emoji) {
                            global.fixedreact = emoji;
                            await sock.sendMessage(from, { text: `📌 Fixed Reaction set to: ${emoji}` });
                        }
                    }
                }

                if (command === 'menu' || command === 'help') {
                    let customCmdList = Object.keys(global.customCommands).map(c => `🔹 *.${c}*`).join('\n') || 'No custom commands added yet.';
                    let adminList = global.botInfo.adminButtons.map(a => `👤 *${a.name}*: ${a.link}`).join('\n');

                    const menuText = `
⚙️ *RUDE-CYBER-TEAM CONTROL MENU* ⚙️

👑 *Admin Contact Buttons:*
${adminList}

👑 *Admin Commands:*
🔹 *.addcmd [name] [text]* - Create new command
🔹 *.delcmd [name]* - Delete command
🔹 *.statusview on/off* - Status auto-view toggle
🔹 *.setdelay [sec]* - Set delay in seconds
🔹 *.setreact [emoji/random]* - Custom status reaction

📝 *Custom Active Commands:*
${customCmdList}

_Created by Rude-Cyber-Team_
                    `;
                    await sock.sendMessage(from, { text: menuText });
                }

                else if (command === 'owner' || command === 'admin') {
                    let adminList = global.botInfo.adminButtons.map(a => `💬 *${a.name}*: ${a.link}`).join('\n');
                    await sock.sendMessage(from, { text: `📞 *Official Support Admins:*\n\n${adminList}` });
                }

                else if (global.customCommands[command]) {
                    await sock.sendMessage(from, { text: global.customCommands[command] });
                }
            }

            if (from === 'status@broadcast') {
                if (global.statusview) {
                    await new Promise(resolve => setTimeout(resolve, global.statusDelay));
                    await sock.readMessages([msg.key]);

                    if (global.autoreact) {
                        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                        const emojiToUse = global.fixedreact || randomEmoji;

                        await sock.sendMessage(
                            'status@broadcast',
                            { react: { text: emojiToUse, key: msg.key } },
                            { statusJidList: [msg.key.participant] }
                        );
                    }
                }
            }
        } catch (err) {
            console.error('Error in message handler:', err);
        }
    });

    return sock;
}

module.exports = { startBot };