export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { z, x, y } = req.query;
  
  if (!z || !x || !y) return res.status(400).end();

  try {
    // ESRI World Imagery satellite tiles
    const url = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`;
    
    const response = await fetch(url, {
      headers: { 'User-Agent': 'TheCaddy/1.0' }
    });

    if (!response.ok) throw new Error(`Tile fetch failed: ${response.status}`);

    const buffer = await response.arrayBuffer();
    
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache 24h
    res.status(200).send(Buffer.from(buffer));
    
  } catch (err) {
    // Fallback to OSM
    try {
      const servers = ['a', 'b', 'c'];
      const s = servers[Math.floor(Math.random() * 3)];
      const osmUrl = `https://${s}.tile.openstreetmap.org/${z}/${x}/${y}.png`;
      const osmRes = await fetch(osmUrl);
      const buf = await osmRes.arrayBuffer();
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.status(200).send(Buffer.from(buf));
    } catch(e) {
      res.status(500).end();
    }
  }
}

