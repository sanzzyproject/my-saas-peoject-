// api/index.js
export default async function handler(req, res) {
  // CORS Configuration agar bisa diakses dari frontend
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

  // --- LOGIKA UTAMA ANDA DI SINI ---
  if (req.method === 'POST') {
    try {
      const { inputData } = req.body;

      // Simulasi proses backend (ganti dengan kode logika Anda)
      const result = `Backend Vercel berhasil memproses: "${inputData}"`;
      
      return res.status(200).json({ 
        success: true, 
        message: result,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      return res.status(500).json({ error: 'Terjadi kesalahan pada server' });
    }
  }

  // Default response untuk GET
  return res.status(200).json({ message: "API is running on Vercel!" });
}
