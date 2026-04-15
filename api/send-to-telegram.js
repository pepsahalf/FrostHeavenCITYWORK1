export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      ok: false,
      message: 'Method not allowed',
    });
  }

  try {
    const BOT_TOKEN = process.env.BOT_TOKEN;
    const CHAT_IDS_RAW = process.env.CHAT_IDS || '';

    if (!BOT_TOKEN) {
      return res.status(500).json({
        ok: false,
        message: 'BOT_TOKEN is missing',
      });
    }

    const chatIds = CHAT_IDS_RAW
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);

    if (!chatIds.length) {
      return res.status(500).json({
        ok: false,
        message: 'CHAT_IDS is missing',
      });
    }

    const data = req.body || {};

    const text = [
      '❄️ Новая заявка во Фростхевен',
      '',
      `Ник: ${data.nickname || '-'}`,
      `Дата входа на СПК: ${data.date || '-'}`,
      `Основная работа: ${data.job || '-'}`,
      `Доп. работа: ${Array.isArray(data.extraJobs) && data.extraJobs.length ? data.extraJobs.join(', ') : 'Нет'}`,
      `Сколько готов уделять: ${data.time || '-'}`,
      `Контакт: ${data.contact || '-'}`,
      '',
      'Почему хочет вступить:',
      `${data.about || '-'}`
    ].join('\n');

    for (const chatId of chatIds) {
      const tgResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text
        })
      });

      const tgData = await tgResponse.json().catch(() => ({}));

      if (!tgResponse.ok || tgData.ok === false) {
        return res.status(500).json({
          ok: false,
          message: `Failed to send message to chat ${chatId}`,
          details: tgData
        });
      }
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error.message || 'Unknown server error'
    });
  }
}