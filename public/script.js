// Ganti fungsi loadStyles yang lama dengan ini:
async function loadStyles() {
    try {
        const res = await fetch('/api/index');
        
        // Cek jika server mengirim HTML error (bukan JSON)
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Server response was not JSON");
        }

        const data = await res.json();
        
        styleSelect.innerHTML = ''; // Bersihkan dulu
        Object.entries(data.styles).forEach(([key, value]) => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = value;
            styleSelect.appendChild(option);
        });
    } catch (e) {
        console.error('Gagal memuat style, pakai manual:', e);
        // Fallback: Isi manual jika API error agar user tetap bisa pilih
        const fallbackStyles = {
            'flataipro': 'Flat AI Pro',
            'realistic': 'Realistic',
            'ghibli-style': 'Ghibli Style',
            'retro_anime': 'Retro Anime'
        };
        styleSelect.innerHTML = '';
        Object.entries(fallbackStyles).forEach(([key, value]) => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = value;
            styleSelect.appendChild(option);
        });
    }
}
