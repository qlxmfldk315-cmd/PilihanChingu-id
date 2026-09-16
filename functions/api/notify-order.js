export async function onRequestPost({ request, env }) {
  const order = await request.json()

  const itemsList = order.items
    .map((item) => `- ${item.name} (₩${item.priceKRW.toLocaleString()} × ${item.quantity})`)
    .join('<br>')

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'PilihanChingu Orders <onboarding@resend.dev>',
        to: 'pilihanchingu.id@gmail.com',
        subject: `New order from ${order.customerName}`,
        html: `
          <p><strong>${order.customerName}</strong> (${order.whatsappNumber}) just placed an order:</p>
          <p>${itemsList}</p>
          <p><strong>Total: Rp ${Math.round(order.totalIdr).toLocaleString('id-ID')}</strong></p>
          ${order.notes ? `<p>Notes: ${order.notes}</p>` : ''}
        `,
      }),
    })
    return Response.json({ ok: true })
  } catch (err) {
    return Response.json({ ok: false }, { status: 500 })
  }
}