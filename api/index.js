const axios = require('axios');

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

// User Agent palsu agar tidak dianggap bot
const USER_AGENT = 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';

async function getNonce() {
  try {
    const { data } = await axios.get('https://flatai.org/ai-image-generator-free-no-signup/', {
      headers: { 'User-Agent': USER_AGENT },
      timeout: 5000 // Maksimal 5 detik cari nonce
    });

    const nonce =
      data.match(/ai_generate_image_nonce["']\s*:\s*["']([a-f0-9]{10})["']/i)?.[1] ||
      data.match(/"nonce"\s*:\s*"([a-f0-9]{10})"/i)?.[1];
    
    if (!nonce) throw new Error('Nonce not found');
    return nonce;
  } catch (e) {
    console.error("Nonce Error:", e.message);
    throw new Error('Gagal menghubungi server AI (Nonce). Coba lagi.');
  }
}

async function flatai(prompt, style, options = {}) {
  const { aspect_ratio = '1:1', seed = Math.floor(Math.random() * 4294967295) } = options;
  
  const nonce = await getNonce();

  const body = new URLSearchParams({
    action: 'ai_generate_image',
    nonce,
    prompt,
    aspect_ratio,
    seed,
    style_model: style
  }).toString();

  // Kita set timeout 9 detik (Vercel limit 10 detik) agar kita bisa handle errornya sendiri
  const res = await axios.post('https://flatai.org/wp-admin/admin-ajax.php', body, { 
    headers: {
      'User-Agent': USER_AGENT,
      'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'x-requested-with': 'XMLHttpRequest',
      origin: 'https://flatai.org',
      referer: 'https://flatai.org/ai-image-generator-free-no-signup/'
    },
    timeout: 9000 
  });

  if (!res.data?.success) {
    // Cek pesan error dari sana
    const msg = res.data?.data?.message || 'Gagal generate';
    if (msg.includes('Guard')) {
        throw new Error('Prompt diblokir filter keamanan (NSFW/Sensitif). Ganti kata-katanya.');
    }
    throw new Error(msg);
  }

  return {
    style,
    prompt: res.data.data.prompt,
    seed: res.data.data.seed,
    images: res.data.data.images
  };
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    return res.status(200).json({ styles: STYLES });
  }

  if (req.method === 'POST') {
    const { prompt, style, aspect_ratio } = req.body;

    if (!prompt) return res.status(400).json({ error: 'Isi prompt dulu!' });

    try {
      const result = await flatai(prompt, style, { aspect_ratio });
      return res.status(200).json(result);
    } catch (error) {
      console.error("API Error:", error.message);
      
      // Jika error karena timeout
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
         return res.status(504).json({ error: 'Server AI sedang sibuk/lambat. Silakan coba lagi.' });
      }

      return res.status(500).json({ error: error.message });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
};
