const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');

const app = express();
app.use(express.json());

// Inicializar cliente de WhatsApp con sesión persistente
const client = new Client({
    authStrategy: new LocalAuth()
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

// Iniciar servidor local en el puerto 3000
app.listen(3000, () => {
    console.log('Servidor escuchando en http://localhost:3000');
});