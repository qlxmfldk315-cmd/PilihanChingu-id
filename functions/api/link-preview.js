export async function onRequestGet({ request }) {
  const url = new URL(request.url).searchParams.get('url')

  if (!url) {
    return Response.json({ error: 'Missing url' }, { status: 400 })
  }

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
      },
    })
    const html = await res.text()

    const getMeta = (prop) => {
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

    const title = getMeta('og:title')
    const image = getMeta('og:image')
    const priceRaw = getMeta('product:price:amount') || getMeta('og:price:amount')
    const price = priceRaw ? Number(priceRaw.replace(/[^\d.]/g, '')) : null

    return Response.json({
      title,
      image,
      price,
      debug: {
        status: res.status,
        finalUrl: res.url,
        htmlLength: html.length,
        htmlSample: html.slice(0, 300),
      },
    })
  } catch (err) {
    return Response.json({ error: 'Failed to fetch preview', message: String(err) }, { status: 500 })
  }
}