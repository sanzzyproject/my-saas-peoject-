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

    // UI Loading State
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

        const data = await response.json();

        if (data.error) throw new Error(data.error);

        // Success
        const imageUrl = data.images[0];
        resultImage.src = imageUrl;
        downloadLink.href = imageUrl;
        seedInfo.textContent = `Seed: ${data.seed} | Style: ${data.style}`;
        
        resultImage.onload = () => {
            resultSection.classList.remove('hidden');
            setLoading(false);
            // Scroll ke hasil
            resultSection.scrollIntoView({ behavior: 'smooth' });
        };

    } catch (error) {
        alert('Error: ' + error.message);
        setLoading(false);
    }
}

function setLoading(isLoading) {
    generateBtn.disabled = isLoading;
    if (isLoading) {
        loader.style.display = 'inline-block';
        btnText.style.display = 'none';
    } else {
        loader.style.display = 'none';
        btnText.style.display = 'inline';
    }
}

// Init
loadStyles();
