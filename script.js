document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const emailInput = document.getElementById('email-input');
    const btnGenerate = document.getElementById('btn-generate');
    const btnClear = document.getElementById('btn-clear');
    const btnVerify = document.getElementById('btn-verify');
    const btnDownload = document.getElementById('btn-download');
    const resultsSection = document.getElementById('results-section');
    const resultsBody = document.getElementById('results-body');
    const themeToggle = document.getElementById('theme-toggle');
    const btnDownloadJson = document.getElementById('btn-download-json');
    const inputSection = document.querySelector('.input-section');
    // Stats Elements
    const statTotal = document.getElementById('stat-total');
    const statValid = document.getElementById('stat-valid');
    const statInvalid = document.getElementById('stat-invalid');
    const statRisky = document.getElementById('stat-risky');
    const barValid = document.getElementById('bar-valid');
    const barInvalid = document.getElementById('bar-invalid');
    const barRisky = document.getElementById('bar-risky');
    // State
    let currentResults = [];
    // Mocks and Constants
    const MOCK_DOMAINS = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'company.net', 'startup.io', 'fake.org'];
    const RISK_KEYWORDS = ['admin', 'info', 'contact', 'support', 'test'];
    // --- Initialization ---
    // Load Theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        updateThemeIcon(true);
    } else {
        updateThemeIcon(false);
    }
    // Load Data
    const savedInput = localStorage.getItem('emailInput');
    if (savedInput) {
        emailInput.value = savedInput;
    }
    // --- Generators ---
    function generateRandomEmail() {
        const names = ['juan', 'maria', 'pedro', 'luis', 'ana', 'carlos', 'sofia', 'dev', 'test.user'];
        const name = names[Math.floor(Math.random() * names.length)];
        const number = Math.floor(Math.random() * 999);
        const domain = MOCK_DOMAINS[Math.floor(Math.random() * MOCK_DOMAINS.length)];
        // Sometimes generate invalid emails
        const rand = Math.random();
        if (rand < 0.1) return `${name}${number}@`; // Missing domain
        if (rand < 0.2) return `${name}@${domain}.`; // Missing tld end
        if (rand < 0.25) return `@${domain}`; // Missing user
        return `${name}${number}@${domain}`;
    }
    function generateTestData() {
        const count = 20;
        const emails = [];
        for (let i = 0; i < count; i++) {
            emails.push(generateRandomEmail());
        }
        // Add some specifically risky ones
        emails.push('admin@company.net');
        emails.push('no-reply@service.io');
        return emails.join('\n');
    }
    // --- Helpers ---
    function updateThemeIcon(isLight) {
        const iconInfo = isLight ? { icon: '☀️', title: 'Cambiar a Modo Oscuro' } : { icon: '🌙', title: 'Cambiar a Modo Claro' };
        themeToggle.querySelector('.icon').textContent = iconInfo.icon;
        themeToggle.title = iconInfo.title;
    }
    function saveState() {
        localStorage.setItem('emailInput', emailInput.value);
    }
    // --- Verification Logic ---
    function analyzeEmail(email) {
        // 1. Syntax Check
        // More robust regex for "Pro" level validation
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            return { email, status: 'invalid', message: 'Formato incorrecto', score: 0 };
        }
        const [user, domain] = email.split('@');
        // 2. Domain Simulation (Some domains are "down")
        if (domain === 'fake.org') {
            return { email, status: 'invalid', message: 'Dominio no existe', score: 10 };
        }
        // 3. Risk Analysis (Generic roles)
        if (RISK_KEYWORDS.some(k => user.includes(k))) {
            return { email, status: 'risky', message: 'Cuenta genérica', score: 60 };
        }
        // 4. Random "Bounce" simulation for otherwise valid emails
        if (Math.random() > 0.9) {
            return { email, status: 'invalid', message: 'Buzón lleno / Rebote', score: 20 };
        }
        return { email, status: 'valid', message: 'OK - SMTP verificado', score: 100 };
    }
    // --- UI Handlers ---
    btnGenerate.addEventListener('click', () => {
        emailInput.value = generateTestData();
        saveState();
    });
    emailInput.addEventListener('input', saveState);
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        const isLight = document.body.classList.contains('light-mode');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
        updateThemeIcon(isLight);
    });
    // Drag & Drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        inputSection.addEventListener(eventName, preventDefaults, false);
    });
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    ['dragenter', 'dragover'].forEach(eventName => {
        inputSection.addEventListener(eventName, highlight, false);
    });
    ['dragleave', 'drop'].forEach(eventName => {
        inputSection.addEventListener(eventName, unhighlight, false);
    });
    function highlight() {
        inputSection.classList.add('drag-active');
    }
    function unhighlight() {
        inputSection.classList.remove('drag-active');
    }
    inputSection.addEventListener('drop', handleDrop, false);
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }
    function handleFiles(files) {
        if ([...files].some(file => file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.csv'))) {
            const reader = new FileReader();
            reader.readAsText(files[0]);
            reader.onload = function (e) {
                if (emailInput.value) {
                    emailInput.value += '\n' + e.target.result;
                } else {
                    emailInput.value = e.target.result;
                }
                saveState();
            }
        } else {
            alert('Por favor sube un archivo de texto (.txt o .csv)');
        }
    }
    btnClear.addEventListener('click', () => {
        emailInput.value = '';
        resultsSection.classList.add('hidden');
        currentResults = [];
        saveState();
    });
    btnDownloadJson.addEventListener('click', () => {
        if (!currentResults.length) return;
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentResults, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `email_verify_results_${new Date().getTime()}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    });
    btnDownload.addEventListener('click', () => {
        if (!currentResults.length) return;
        const headers = ['Email', 'Estado', 'Puntuación', 'Detalle'];
        const csvContent = [
            headers.join(','),
            ...currentResults.map(r => `${r.email},${r.status},${r.score},${r.message}`)
        ].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `email_verify_results_${new Date().getTime()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
    btnVerify.addEventListener('click', async () => {
        const text = emailInput.value.trim();
        if (!text) return;
        // Reset UI & State
        resultsSection.classList.remove('hidden');
        resultsBody.innerHTML = '';
        currentResults = [];
        const emails = text.split('\n').map(e => e.trim()).filter(e => e);
        // Simulating async processing
        btnVerify.disabled = true;
        btnVerify.innerHTML = '<span class="btn-text">Verificando...</span>';
        let counts = { total: 0, valid: 0, invalid: 0, risky: 0 };
        counts.total = emails.length;
        // Process each email with a tiny delay to simulate network
        // Occasional "slow" verify to be more realistic
        for (const email of emails) {
            const delay = Math.random() < 0.05 ? 800 + Math.random() * 500 : 50 + Math.random() * 150;
            await new Promise(r => setTimeout(r, delay));
            const result = analyzeEmail(email);
            currentResults.push(result);
            // Update counts
            if (result.status === 'valid') counts.valid++;
            else if (result.status === 'invalid') counts.invalid++;
            else if (result.status === 'risky') counts.risky++;
            // Render Row
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${result.email}</td>
                <td><span class="status-badge status-${result.status}">${getStatusLabel(result.status)}</span></td>
                <td>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div class="progress-bar" style="width: 50px; background: rgba(255,255,255,0.1);">
                            <div class="fill" style="width: ${result.score}%; background: ${getColorForScore(result.score)}"></div>
                        </div>
                        <span style="font-size: 0.8em; color: var(--text-muted)">${result.score}%</span>
                    </div>
                </td>
                <td style="color: var(--text-muted); font-size: 0.85rem;">${result.message}</td>
            `;
            resultsBody.appendChild(tr);
            // Update Stats on the fly
            updateStats(counts);
        }
        btnVerify.disabled = false;
        btnVerify.innerHTML = '<span class="btn-text">Iniciar Verificación</span><span class="btn-icon">🚀</span>';
    });
    function updateStats(counts) {
        statTotal.textContent = counts.total;
        statValid.textContent = counts.valid;
        statInvalid.textContent = counts.invalid;
        statRisky.textContent = counts.risky;
        if (counts.total > 0) {
            barValid.style.width = `${(counts.valid / counts.total) * 100}%`;
            barInvalid.style.width = `${(counts.invalid / counts.total) * 100}%`;
            barRisky.style.width = `${(counts.risky / counts.total) * 100}%`;
        }
    }
    function getStatusLabel(status) {
        if (status === 'valid') return 'Válido';
        if (status === 'invalid') return 'Inválido';
        if (status === 'risky') return 'Riesgo';
        return status;
    }
    function getColorForScore(score) {
        if (score >= 90) return 'var(--success)';
        if (score >= 50) return 'var(--warning)';
        return 'var(--error)';
    }
});



