const express = require('express');
const app = express();
app.use(express.json());

const VERIFY_TOKEN = 'redinvest123';

// Webhook verification
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Receive messages
app.post('/webhook', async (req, res) => {
  const body = req.body;
  if (body.object === 'whatsapp_business_account') {
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const message = changes?.value?.messages?.[0];
    if (message) {
      const from = message.from;
      const text = message?.text?.body || '';
      console.log(`Message from ${from}: ${text}`);

      // Auto reply
      await sendMessage(from, `Ողջույն, բարի գալուստ RedInvest։ Ծանոթացե՛ք մեր նախագծերին՝ https://redinvest.am`);

      // TODO: Bitrix24 lead creation will be added here
    }
  }
  res.sendStatus(200);
});

async function sendMessage(to, text) {
  const fetch = (await import('node-fetch')).default;
  const response = await fetch(
    `https://graph.facebook.com/v22.0/${process.env.PHONE_NUMBER_ID}/messages`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: to,
        type: 'text',
        text: { body: text },
      }),
    }
  );
  const data = await response.json();
  console.log('Sent:', JSON.stringify(data));
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
