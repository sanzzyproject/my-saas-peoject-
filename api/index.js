const axios = require('axios');

// Daftar Style sesuai kode Anda
const STYLES = {
  flataipro: 'Flat AI Pro',
  flatai: 'Flat AI Base',
  runware_quality: 'Standard',
  runware_new_quality: 'Quality+',
  realistic: 'Realistic',
  photo_skin: 'Real Skin',
  cinema: 'Cinematic',
  retro_anime: 'Retro Anime',
  'ghibli-style': 'Ghibli Style',
  midjourney_art: 'Midjourney Art',
  fantasy_armor: 'Fantasy Armor',
  robot_cyborg: 'Robot & Cyborg',
  disney_princess: 'Princess',
  amateurp: 'Daily Life',
  scifi_enviroments: 'Sci-Fi Environments',
  mythic_fantasy: 'Mythic Fantasy',
  pixel_art: 'Pixel Art',
  watercolor_painting: 'Watercolor Painting',
  diesel_punk: 'Diesel Punk',
  architectural: 'Architectural',
  style_1930s: '1930s',
  flat_anime: 'Flat Anime',
  mystical_realms: 'Mystical Realms',
  ecommerce: 'E-Commerce',
  cinema_style: 'Cinema'
};

async function getNonce() {
  try {
    const { data } = await axios.get('https://flatai.org/ai-image-generator-free-no-signup/');
    const nonce =
      data.match(/ai_generate_image_nonce["']\s*:\s*["']([a-f0-9]{10})["']/i)?.[1] ||
      data.match(/"nonce"\s*:\s*"([a-f0-9]{10})"/i)?.[1];
    
    if (!nonce) throw new Error('Nonce not found');
    return nonce;
  } catch (e) {
    throw new Error('Failed to fetch nonce');
  }
}

async function flatai(prompt, style, options = {}) {
  const { aspect_ratio = '1:1', seed = Math.floor(Math.random() * 4294967295) } = options;
  
  const nonce = await getNonce();

  const headers = {
    'user-agent': 'Mozilla/5.0 (Linux; Android 10)',
    'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'x-requested-with': 'XMLHttpRequest',
    origin: 'https://flatai.org',
    referer: 'https://flatai.org/ai-image-generator-free-no-signup/'
  };

  const body = new URLSearchParams({
    action: 'ai_generate_image',
    nonce,
    prompt,
    aspect_ratio,
    seed,
    style_model: style
  }).toString();

  const res = await axios.post('https://flatai.org/wp-admin/admin-ajax.php', body, { headers });

  if (!res.data?.success) {
    throw new Error(res.data?.data?.message || 'Generation failed');
  }

  return {
    style,
    prompt: res.data.data.prompt,
    seed: res.data.data.seed,
    images: res.data.data.images
  };
}

// Handler utama Vercel
module.exports = async (req, res) => {
  // Setup CORS agar bisa diakses
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Jika Request ke GET /api/index (untuk ambil list styles)
  if (req.method === 'GET') {
    return res.status(200).json({ styles: STYLES });
  }

  // Jika Request ke POST (Generate Image)
  if (req.method === 'POST') {
    const { prompt, style, aspect_ratio } = req.body;

    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });
    if (!style || !STYLES[style]) return res.status(400).json({ error: 'Invalid style' });

    try {
      const result = await flatai(prompt, style, { aspect_ratio });
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
};
