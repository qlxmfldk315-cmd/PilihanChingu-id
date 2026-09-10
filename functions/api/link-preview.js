export async function onRequestGet({ request }) {
  const url = new URL(request.url).searchParams.get('url')

  if (!url) {
    return Response.json({ error: 'Missing url' }, { status: 400 })
  }

  try {
    const res = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}`)
    const json = await res.json()

    if (json.status !== 'success') {
      return Response.json({ title: null, image: null, price: null })
    }

    const data = json.data

    return Response.json({
      title: data.title || null,
      image: data.image?.url || data.logo?.url || null,
      price: null, // price varies too much per site to extract reliably — left for manual entry
    })
  } catch (err) {
    return Response.json({ error: 'Failed to fetch preview' }, { status: 500 })
  }
}