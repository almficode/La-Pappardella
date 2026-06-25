const SYSTEM = `Eres el asistente virtual de La Pappardella, restaurante italiano en Puerto Calero, Lanzarote.
Teléfono: +34 928 513 614.
Horarios: todos los días 12:30–15:30h y 18:30–23:00h.
Especialidades: Pappardelle al Ragù (ragù de ternera cocinado 48 horas), Spaghetti alle Vongole con almejas del Atlántico, Pizza della Casa del horno de leña, pasta artesanal elaborada cada mañana.
Vinos: DO Lanzarote (Malvasía volcánica), Barolo, Brunello di Montalcino, Chianti Classico, Franciacorta.
Ubicación: Puerto Calero, marina deportiva de Lanzarote, Islas Canarias.
Más de 25 años de historia en Lanzarote.
Precios: platos principales desde 14€. Opciones vegetarianas y pasta sin gluten disponibles bajo petición.
Para reservas: llamar al +34 928 513 614.
Responde siempre en el mismo idioma que use el usuario. Sé cálido, elegante y conciso (máximo 3 párrafos cortos).`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const { message, history = [] } = req.body || {};
  if (!message?.trim()) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'AI not configured' });
  }

  try {
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 400,
        temperature: 0.7,
        messages: [
          { role: 'system', content: SYSTEM },
          ...history.slice(-8),
          { role: 'user', content: message }
        ]
      })
    });

    if (!resp.ok) {
      const err = await resp.text();
      console.error('OpenAI error:', resp.status, err);
      return res.status(502).json({ error: 'AI unavailable' });
    }

    const data = await resp.json();
    const reply = data.choices?.[0]?.message?.content;
    if (!reply) return res.status(502).json({ error: 'Empty response' });

    res.json({ reply });
  } catch (e) {
    console.error('Handler error:', e);
    res.status(500).json({ error: 'Server error' });
  }
}
