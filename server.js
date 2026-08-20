const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');

const app = express();
app.use(express.json());

// Inicializar cliente de WhatsApp adaptado para entornos en la nube (Render)
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ]
    }
});

let isReady = false;

client.on('qr', (qr) => {
    console.log('Escanea este código QR con tu WhatsApp:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('¡WhatsApp conectado y listo!');
    isReady = true;
});

client.initialize();

// Endpoint que recibirá la alerta de AppSheet o Google Sheets
app.post('/enviar-alerta', async (req, res) => {
    if (!isReady) {
        return res.status(500).send({ error: 'WhatsApp aún no está conectado.' });
    }

    const { mensaje, grupoNombre } = req.body;

    try {
        // Buscar el chat del grupo por su nombre exacto
        const chats = await client.getChats();
        const grupo = chats.find(chat => chat.isGroup && chat.name === grupoNombre);

        if (!grupo) {
            return res.status(404).send({ error: `No se encontró el grupo: ${grupoNombre}` });
        }

        // Enviar el mensaje al grupo
        await grupo.sendMessage(mensaje);
        res.status(200).send({ success: 'Mensaje enviado correctamente al grupo.' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Error al enviar el mensaje.' });
    }
});

// Iniciar servidor en el puerto 3000 o el que asigne Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
