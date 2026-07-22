module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    return res.status(500).json({ error: 'Missing STRIPE_SECRET_KEY environment variable' });
  }

  try {
    let parsedBody = req.body || {};
    if (typeof req.body === 'string') {
      try {
        parsedBody = JSON.parse(req.body || '{}');
      } catch {
        return res.status(400).json({ error: 'Invalid JSON payload.' });
      }
    }
    const body = parsedBody;
    const beats = Array.isArray(body.beats) ? body.beats : [];
    const origin = typeof body.origin === 'string' && /^https?:\/\//.test(body.origin)
      ? body.origin
      : 'https://marcdbeats.com';
    const buildClientReferenceId = (beats, maxLength = 100) => {
      let reference = '';
      for (const beat of beats) {
        const id = String(beat?.id || '').trim();
        if (!id) continue;
        const candidate = reference ? `${reference}_${id}` : id;
        if (candidate.length > maxLength) break;
        reference = candidate;
      }
      return reference;
    };
    const memberId = typeof body.memberId === 'string' ? body.memberId : '';
    const unitAmount = Number.isFinite(body.unitAmount) ? Math.round(body.unitAmount) : 1999;

    if (beats.length === 0) {
      return res.status(400).json({ error: 'At least one beat is required.' });
    }

    const safeBeats = beats
      .map((beat) => ({
        id: String(beat?.id || '').trim(),
        title: String(beat?.title || '').trim(),
        artist: String(beat?.artist || 'MarcDBeats').trim()
      }))
      .filter((beat) => beat.id && beat.title);

    if (safeBeats.length === 0) {
      return res.status(400).json({ error: 'No valid beats were provided.' });
    }
    const requestedReference = typeof body.clientReferenceId === 'string' ? body.clientReferenceId : '';
    const safeReference = buildClientReferenceId(safeBeats);
    const clientReferenceId = requestedReference && requestedReference.length <= 100 ? requestedReference : safeReference;

    const params = new URLSearchParams();
    params.append('mode', 'payment');
    params.append('success_url', `${origin}/?checkout=success`);
    params.append('cancel_url', `${origin}/?checkout=cancel`);
    if (clientReferenceId) params.append('client_reference_id', clientReferenceId);

    safeBeats.forEach((beat, index) => {
      params.append(`line_items[${index}][quantity]`, '1');
      params.append(`line_items[${index}][price_data][currency]`, 'usd');
      params.append(`line_items[${index}][price_data][unit_amount]`, String(unitAmount));
      params.append(`line_items[${index}][price_data][product_data][name]`, beat.title);
      params.append(`line_items[${index}][price_data][product_data][description]`, `${beat.artist} • Standard License`);
    });

    params.append('metadata[license_type]', 'standard');
    params.append('metadata[item_count]', String(safeBeats.length));
    params.append('metadata[beat_ids]', safeBeats.map((beat) => beat.id).join(','));
    params.append('metadata[beat_titles]', safeBeats.map((beat) => beat.title).join(' | '));
    if (memberId) params.append('metadata[member_id]', memberId);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + stripeSecretKey,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString(),
      signal: controller.signal
    }).finally(() => clearTimeout(timeoutId));

    const stripeData = await stripeResponse.json();

    if (!stripeResponse.ok || !stripeData?.id) {
      return res.status(502).json({
        error: stripeData?.error?.message || 'Failed to create checkout session.'
      });
    }

    return res.status(200).json({ sessionId: stripeData.id, url: stripeData.url || null });
  } catch (error) {
    return res.status(500).json({ error: error?.message || 'Unexpected server error' });
  }
};
