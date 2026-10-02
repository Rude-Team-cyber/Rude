const express = require('express');
const path = require('path');
const { startBot } = require('./bot');

const app = express();
const PORT = process.env.PORT || 3000;

let sock;

app.use(express.static(path.join(__dirname, 'views')));

app.get('/code', async (req, res) => {
    let num = req.query.number;
    if (!num) return res.send({ status: false, message: 'Phone number required!' });

    num = num.replace(/[^0-9]/g, '');

    try {
        if (!sock.authState.creds.registered) {
            await new Promise(resolve => setTimeout(resolve, 3000));
            let code = await sock.requestPairingCode(num);
            code = code?.match(/.{1,4}/g)?.join('-') || code;
            return res.send({ code });
        } else {
            return res.send({ code: 'Already Connected!' });
        }
    } catch (error) {
        console.error('Error requesting pairing code:', error);
        return res.send({ status: false, message: 'Error! Please try again.' });
    }
});

app.get('/info', (req, res) => {
    res.json({
        groupLink: 'https://chat.whatsapp.com/DwZ7Q71aZloG1z91g1e5yd',
        channelLink: 'https://whatsapp.com/channel/0029VbDpsxYGZNCm8ABVkG0M'
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.listen(PORT, async () => {
    console.log(`[RUDE-CYBER-TEAM] Server running on port ${PORT}`);
    sock = await startBot();
});