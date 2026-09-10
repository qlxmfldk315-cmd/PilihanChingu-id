export async function onRequestGet({ request }) {
  const url = new URL(request.url).searchParams.get('url')
  if (!url) {
    return Response.json({ error: 'Missing url' }, { status: 400 })
  }

  const getMeta = (html, prop) => {
    const patterns = [
      new RegExp(`<meta[^>]+property=["']${prop}["'][^>]+content=["']([^"']+)["']`, 'i'),
      new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${prop}["']`, 'i'),
    ]
    for (const pattern of patterns) {
      const match = html.match(pattern)
      if (match) return match[1]
    }
    return null
  }

  // Attempt 1: fetch the page directly — works for Daiso/ZigZag, and can also pull price
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
      },
    })
    if (res.ok) {
      const html = await res.text()
      const title = getMeta(html, 'og:title')
      const image = getMeta(html, 'og:image')
      const priceRaw = getMeta(html, 'product:price:amount') || getMeta(html, 'og:price:amount')
      const price = priceRaw ? Number(priceRaw.replace(/[^\d.]/g, '')) : null
      if (title || image) {
        return Response.json({ title, image, price })
      }
    }
  } catch {
    // fall through to attempt 2
  }

  // Attempt 2: site blocked the direct fetch (e.g. Olive Young) — try Microlink as a fallback
  try {
    const res = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}`)
    const json = await res.json()
    if (json.status === 'success') {
      return Response.json({
        title: json.data.title || null,
        image: json.data.image?.url || json.data.logo?.url || null,
        price: null,
      })
    }
  } catch {
    // both attempts failed
  }

  return Response.json({ title: null, image: null, price: null })
}