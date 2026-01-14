const promptInput = document.getElementById('promptInput');
const styleSelect = document.getElementById('styleSelect');
const ratioSelect = document.getElementById('ratioSelect');
const generateBtn = document.getElementById('generateBtn');
const resultSection = document.getElementById('resultSection');
const resultImage = document.getElementById('resultImage');
const downloadLink = document.getElementById('downloadLink');
const seedInfo = document.getElementById('seedInfo');
const loader = document.querySelector('.loader');
const btnText = document.querySelector('.btn-text');

// Load styles from API on startup
async function loadStyles() {
    try {
        const res = await fetch('/api/index');
        const data = await res.json();
        
        // Populate Select
        Object.entries(data.styles).forEach(([key, value]) => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = value;
            styleSelect.appendChild(option);
        });
    } catch (e) {
        console.error('Gagal memuat style, pakai default.');
    }
}
async function generateImage() {
    const prompt = promptInput.value.trim();
    if (!prompt) {
        alert('Tulis prompt dulu bos!');
        return;
    }

    setLoading(true);
    resultSection.classList.add('hidden');

    try {
        const response = await fetch('/api/index', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: prompt,
                style: styleSelect.value,
                aspect_ratio: ratioSelect.value
            })
        });

        // 1. Ambil respon sebagai text dulu, jangan langsung .json()
        const text = await response.text();
        let data;

        // 2. Coba parsing JSON secara manual
        try {
            data = JSON.parse(text);
        } catch (err) {
            // Jika gagal parse JSON, berarti Vercel mengirim HTML Error (Timeout)
            console.error("Server Response Not JSON:", text.substring(0, 100));
            throw new Error("Server sedang sibuk (Timeout). Coba lagi dalam beberapa detik.");
        }

        // 3. Cek error dari API Backend kita
        if (!response.ok || data.error) {
            throw new Error(data.error || 'Gagal memproses gambar.');
        }

        // Sukses
        const imageUrl = data.images[0];
        resultImage.src = imageUrl;
        downloadLink.href = imageUrl;
        seedInfo.textContent = `Seed: ${data.seed} | Style: ${data.style}`;
        
        resultImage.onload = () => {
            resultSection.classList.remove('hidden');
            setLoading(false);
            resultSection.scrollIntoView({ behavior: 'smooth' });
        };
        // Backup jika onload macet
        setTimeout(() => setLoading(false), 5000);

    } catch (error) {
        // Tampilkan error dengan alert atau UI text
        alert('⚠️ ' + error.message);
        setLoading(false);
    }
}

