// ==========================================================================
// APP.JS - CORE INTERACTIVE LOGIC FOR NPS HUB
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initNavigation();
    initCountdown();
    initCochranTable();
    initFriedmanTable();
    initDurbinTable();
    toggleDistParams();
    initCorrelationTables();
});

// ==========================================================================
// NAVIGATION & UI
// ==========================================================================
function initNavigation() {
    // Main sidebar tabs
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = item.getAttribute('data-tab');
            switchTab(tabId);
        });
    });

    // Sub-tabs under material sections
    const subTabBtns = document.querySelectorAll('.sub-tab-btn');
    subTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const subtabId = btn.getAttribute('data-subtab');
            const parentPane = btn.closest('.tab-pane');
            
            // Deactivate all subtab buttons in this pane
            parentPane.querySelectorAll('.sub-tab-btn').forEach(b => b.classList.remove('active'));
            // Deactivate all subtab contents in this pane
            parentPane.querySelectorAll('.subtab-content').forEach(c => c.classList.remove('active'));
            
            // Activate selected
            btn.classList.add('active');
            parentPane.querySelector(`#subtab-${subtabId}`).classList.add('active');
        });
    });
}

function switchTab(tabId) {
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        if (item.getAttribute('data-tab') === tabId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Update active tab pane
    document.querySelectorAll('.tab-pane').forEach(pane => {
        if (pane.id === `tab-${tabId}`) {
            pane.classList.add('active');
        } else {
            pane.classList.remove('active');
        }
    });

    // Update header title & description
    const titleEl = document.getElementById('current-tab-title');
    const descEl = document.getElementById('current-tab-desc');
    
    const titles = {
        'dashboard': ['Dashboard Utama', 'Pusat pembelajaran interaktif Statistika Non-Parametrik.'],
        'kruskal-wallis': ['Uji Kruskal-Wallis', 'Uji komparatif k-sampel independen dengan Ties, serta uji lanjut Dunn & Conover-Iman.'],
        'mcnemar': ['Uji McNemar', 'Menguji perbedaan proporsi berpasangan untuk data biner (2x2).'],
        'cochran': ['Uji Cochran Q', 'Perluasan uji McNemar untuk k-sampel berhubungan dengan respon biner (0/1).'],
        'friedman': ['Uji Friedman', 'Uji komparatif k-sampel berhubungan dengan skala ordinal (ANOVA 2-arah non-parametrik).'],
        'durbin': ['Uji Durbin', 'Uji komparatif kelompok tidak lengkap seimbang (BIBD) ketika kapasitas blok terbatas.'],
        'kolmogorov-cramer': ['KS & Cramér-von Mises', 'Uji kecocokan model distribusi data (goodness-of-fit) dan normalitas Lilliefors.'],
        'korelasi': ['Koefisien Korelasi Non-Parametrik', 'Mengukur keeratan hubungan asosiasi menggunakan Spearman Rank, Kendall\'s Tau, dan Koefisien Kontingensi.'],
        'uas-bank': ['Bank Soal & Cheat Sheet', 'Kumpulan soal ujian tahun sebelumnya beserta pembahasan dan pembuktian matematis.']
    };
    
    if (titles[tabId]) {
        titleEl.textContent = titles[tabId][0];
        descEl.textContent = titles[tabId][1];
    }

    // Scroll main content to top
    document.querySelector('.main-content').scrollTop = 0;
}

// Theme initialization and toggler
function initTheme() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        const themeIcon = themeToggleBtn.querySelector('.theme-icon');
        const themeText = themeToggleBtn.querySelector('.theme-text');
        
        if (savedTheme === 'light') {
            document.body.classList.add('light-theme');
            if (themeIcon) themeIcon.textContent = '🌙';
            if (themeText) themeText.textContent = 'Dark Mode';
        } else {
            document.body.classList.remove('light-theme');
            if (themeIcon) themeIcon.textContent = '☀️';
            if (themeText) themeText.textContent = 'Light Mode';
        }
        
        themeToggleBtn.addEventListener('click', () => {
            const isLight = document.body.classList.toggle('light-theme');
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
            
            const currentIcon = themeToggleBtn.querySelector('.theme-icon');
            const currentText = themeToggleBtn.querySelector('.theme-text');
            
            if (isLight) {
                if (currentIcon) currentIcon.textContent = '🌙';
                if (currentText) currentText.textContent = 'Dark Mode';
            } else {
                if (currentIcon) currentIcon.textContent = '☀️';
                if (currentText) currentText.textContent = 'Light Mode';
            }
        });
    }
}

// Countdown timer to UAS
function initCountdown() {
    // Set UAS target date to next week or specific target
    const uasDate = new Date();
    uasDate.setDate(uasDate.getDate() + 5); // 5 days from now
    uasDate.setHours(9, 0, 0, 0); // 9:00 AM
    
    function updateCountdown() {
        const now = new Date().getTime();
        const distance = uasDate - now;
        
        if (distance < 0) {
            document.getElementById('countdown').textContent = "SEKARANG UJIAN!";
            return;
        }
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        document.getElementById('countdown').textContent = `${days}h ${hours}m ${minutes}m ${seconds}s`;
    }
    
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// ==========================================================================
// MATH STATISTICAL UTILITIES (LOOKUP TABLES & PROBABILITY EXPANSIONS)
// ==========================================================================

// Standard Normal CDF (Rational Approximation)
function normalCDF(z) {
    if (z < 0) return 1 - normalCDF(-z);
    // Rational approximation for erf
    const d1 = 0.0498673470;
    const d2 = 0.0211410061;
    const d3 = 0.0032776263;
    const d4 = 0.0000380036;
    const d5 = 0.0000488906;
    const d6 = 0.0000053830;
    
    const sum = 1 + d1*z + d2*Math.pow(z,2) + d3*Math.pow(z,3) + d4*Math.pow(z,4) + d5*Math.pow(z,5) + d6*Math.pow(z,6);
    return 1 - 0.5 * Math.pow(sum, -16);
}

// Inverse Standard Normal (for critical values) using Peter J. Acklam's algorithm
function normalInverse(p) {
    if (p <= 0 || p >= 1) return 0;
    
    // Coefficients
    const a0 = 2.50662823884, a1 = -18.61500062529, a2 = 41.39119773534, a3 = -25.44106049637;
    const b1 = -8.47351093090, b2 = 23.08336743743, b3 = -21.06224101826, b4 = 3.13082909833;
    const c0 = -2.78718931138, c1 = -2.29796479134, c2 = 4.85014127135, c3 = 2.32121276858;
    const d1 = 3.54388924762, d2 = 1.63706781897;

    const split = 0.42;
    const q = p - 0.5;
    let r, ppnd;

    if (Math.abs(q) <= split) {
        r = q * q;
        ppnd = q * (((a3 * r + a2) * r + a1) * r + a0) / 
               ((((b4 * r + b3) * r + b2) * r + b1) * r + 1);
    } else {
        r = p;
        if (q > 0) r = 1 - p;
        if (r > 0) {
            r = Math.sqrt(-Math.log(r));
            ppnd = (((c3 * r + c2) * r + c1) * r + c0) / 
                   ((d2 * r + d1) * r + 1);
            if (q < 0) ppnd = -ppnd;
        } else {
            ppnd = 0;
        }
    }
    return ppnd;
}

// Student-t CDF (Exact Series Expansions)
function studentTCDF(t, df) {
    if (t < 0) return 1 - studentTCDF(-t, df);
    
    if (df === 1) {
        return 0.5 + Math.atan(t) / Math.PI;
    }
    
    const x = df / (df + t * t);
    let sum = 1.0;
    
    if (df % 2 === 0) { // df even
        let term = 1.0;
        const limit = df / 2 - 1;
        for (let j = 1; j <= limit; j++) {
            term = term * (2 * j - 1) / (2 * j) * (1 - x);
            sum += term;
        }
        return 0.5 + 0.5 * t / Math.sqrt(df + t * t) * sum;
    } else { // df odd
        let term = 1.0;
        const limit = (df - 3) / 2;
        for (let j = 1; j <= limit; j++) {
            term = term * (2 * j) / (2 * j + 1) * (1 - x);
            sum += term;
        }
        const term1 = t / Math.sqrt(df + t * t);
        const term2 = term1 * sum;
        return 0.5 + (Math.atan(t / Math.sqrt(df)) + term1 * Math.sqrt(x) * sum) / Math.PI;
    }
}

// Inverse Student-t (bisection method)
function studentTInverse(p, df) {
    if (p <= 0 || p >= 1) return 0;
    let low = -10.0;
    let high = 10.0;
    let mid = 0.0;
    
    for (let i = 0; i < 40; i++) {
        mid = (low + high) / 2;
        const val = studentTCDF(mid, df);
        if (val < p) {
            low = mid;
        } else {
            high = mid;
        }
    }
    return mid;
}

// Chi-Square Critical Value Lookup (df: 1-30, alpha: 0.01, 0.05, 0.10)
// With Wilson-Hilferty approximation for larger df
const chiSquareTable = {
    1: { 0.10: 2.706, 0.05: 3.841, 0.01: 6.635 },
    2: { 0.10: 4.605, 0.05: 5.991, 0.01: 9.210 },
    3: { 0.10: 6.251, 0.05: 7.815, 0.01: 11.345 },
    4: { 0.10: 7.779, 0.05: 9.488, 0.01: 13.277 },
    5: { 0.10: 9.236, 0.05: 11.070, 0.01: 15.086 },
    6: { 0.10: 10.645, 0.05: 12.592, 0.01: 16.812 },
    7: { 0.10: 12.017, 0.05: 14.067, 0.01: 18.475 },
    8: { 0.10: 13.362, 0.05: 15.507, 0.01: 20.090 },
    9: { 0.10: 14.682, 0.05: 16.919, 0.01: 21.666 },
    10: { 0.10: 15.987, 0.05: 18.307, 0.01: 23.209 },
    11: { 0.10: 17.275, 0.05: 19.675, 0.01: 24.725 },
    12: { 0.10: 18.549, 0.05: 21.026, 0.01: 26.217 },
    13: { 0.10: 19.812, 0.05: 22.362, 0.01: 27.688 },
    14: { 0.10: 21.064, 0.05: 23.685, 0.01: 29.141 },
    15: { 0.10: 22.307, 0.05: 24.996, 0.01: 30.578 },
    16: { 0.10: 23.542, 0.05: 26.296, 0.01: 32.000 },
    17: { 0.10: 24.769, 0.05: 27.587, 0.01: 33.409 },
    18: { 0.10: 25.989, 0.05: 28.869, 0.01: 34.805 },
    19: { 0.10: 27.204, 0.05: 30.144, 0.01: 36.191 },
    20: { 0.10: 28.412, 0.05: 31.410, 0.01: 37.566 },
    21: { 0.10: 29.615, 0.05: 32.671, 0.01: 38.932 },
    22: { 0.10: 30.813, 0.05: 33.924, 0.01: 40.289 },
    23: { 0.10: 32.007, 0.05: 35.172, 0.01: 41.638 },
    24: { 0.10: 33.196, 0.05: 36.415, 0.01: 42.980 },
    25: { 0.10: 34.382, 0.05: 37.652, 0.01: 44.314 },
    26: { 0.10: 35.563, 0.05: 38.885, 0.01: 45.642 },
    27: { 0.10: 36.741, 0.05: 40.113, 0.01: 46.963 },
    28: { 0.10: 37.916, 0.05: 41.337, 0.01: 48.278 },
    29: { 0.10: 39.087, 0.05: 42.557, 0.01: 49.588 },
    30: { 0.10: 40.256, 0.05: 43.773, 0.01: 50.892 }
};

function getChiSquareCriticalValue(df, alpha) {
    if (chiSquareTable[df] && chiSquareTable[df][alpha]) {
        return chiSquareTable[df][alpha];
    }
    // Wilson-Hilferty Approximation
    const z = normalInverse(1 - alpha);
    const term = 1 - 2 / (9 * df) + z * Math.sqrt(2 / (9 * df));
    return df * Math.pow(term, 3);
}

// Binomial PMF & CDF for McNemar Exact test
function binomialCDF(k, n, p = 0.5) {
    let sum = 0;
    for (let i = 0; i <= k; i++) {
        sum += combination(n, i) * Math.pow(p, i) * Math.pow(1 - p, n - i);
    }
    return sum;
}

function combination(n, k) {
    if (k < 0 || k > n) return 0;
    if (k === 0 || k === n) return 1;
    let prod = 1;
    for (let i = 1; i <= k; i++) {
        prod = prod * (n - k + i) / i;
    }
    return Math.round(prod);
}

// Rank computation helper (returns ranks array and handles ties via average ranking)
function getRanks(flatData) {
    const sorted = flatData.slice().sort((a, b) => a.val - b.val);
    const ranksMap = new Map();
    
    let i = 0;
    while (i < sorted.length) {
        let j = i + 1;
        while (j < sorted.length && sorted[j].val === sorted[i].val) {
            j++;
        }
        
        // Sum ranks for the ties
        const sumRanks = ((i + 1) + j) * (j - i) / 2;
        const avgRank = sumRanks / (j - i);
        
        for (let k = i; k < j; k++) {
            ranksMap.set(sorted[k].id, avgRank);
        }
        
        i = j;
    }
    
    return ranksMap;
}

// Helper to format statistical step blocks
function makeStep(title, content) {
    return `
        <div class="step-report">
            <div class="step-title">${title}</div>
            <div class="step-detail">${content}</div>
        </div>
    `;
}

// ==========================================================================
// 1. KRUSKAL-WALLIS CALCULATOR LOGIC
// ==========================================================================
let kwGroupId = 4;

function addKWGroup() {
    kwGroupId++;
    const container = document.getElementById('kw-input-container');
    const row = document.createElement('div');
    row.className = 'group-input-row';
    row.setAttribute('data-group', kwGroupId);
    row.innerHTML = `
        <span class="group-badge">Kelompok ${kwGroupId}</span>
        <input type="text" class="kw-data-input form-control" placeholder="Ketik data dipisah koma...">
        <button class="btn-remove-row" onclick="removeKWGroup(this)">✕</button>
    `;
    container.appendChild(row);
}

function removeKWGroup(btn) {
    const rows = document.querySelectorAll('.group-input-row');
    if (rows.length <= 2) {
        alert("Uji Kruskal-Wallis membutuhkan minimal 2 kelompok!");
        return;
    }
    btn.closest('.group-input-row').remove();
}

function calculateKruskalWallis() {
    const rows = document.querySelectorAll('.group-input-row');
    const alpha = parseFloat(document.getElementById('kw-alpha').value);
    
    const groupsData = [];
    let hasInvalid = false;
    
    rows.forEach((row, idx) => {
        const inputVal = row.querySelector('.kw-data-input').value;
        const parsed = inputVal.split(',')
                               .map(x => x.trim())
                               .filter(x => x !== "")
                               .map(Number);
                               
        if (parsed.some(isNaN) || parsed.length === 0) {
            hasInvalid = true;
            row.classList.add('error-border');
        } else {
            row.classList.remove('error-border');
            groupsData.push({
                index: idx + 1,
                name: `Kelompok ${idx + 1}`,
                data: parsed
            });
        }
    });
    
    if (hasInvalid) {
        alert("Pastikan semua kelompok memiliki data numerik yang valid (dipisahkan koma)!");
        return;
    }
    
    // Process ranking
    const flatData = [];
    groupsData.forEach(g => {
        g.data.forEach((val, i) => {
            flatData.push({
                id: `${g.index}_${i}`,
                groupIndex: g.index,
                val: val
            });
        });
    });
    
    const N = flatData.length;
    const k = groupsData.length;
    const ranksMap = getRanks(flatData);
    
    // Map ranks back to groups
    groupsData.forEach(g => {
        g.ranks = g.data.map((_, i) => ranksMap.get(`${g.index}_${i}`));
        g.Rj = g.ranks.reduce((a, b) => a + b, 0);
        g.nj = g.data.length;
        g.Rj_mean = g.Rj / g.nj;
        g.Rj2_div_n = (g.Rj * g.Rj) / g.nj;
    });
    
    // Sum of Rj^2 / nj
    const sum_R2_div_n = groupsData.reduce((acc, g) => acc + g.Rj2_div_n, 0);
    
    // Uncorrected H
    const H = (12 / (N * (N + 1))) * sum_R2_div_n - 3 * (N + 1);
    
    // Ties counting
    const valCounts = {};
    flatData.forEach(d => {
        valCounts[d.val] = (valCounts[d.val] || 0) + 1;
    });
    
    let sum_t3_t = 0;
    const tiesGroup = [];
    Object.keys(valCounts).forEach(val => {
        const count = valCounts[val];
        if (count > 1) {
            sum_t3_t += (count * count * count - count);
            tiesGroup.push(`Nilai <strong>${val}</strong> muncul <strong>${count}</strong> kali.`);
        }
    });
    
    const C_ties = 1 - sum_t3_t / (Math.pow(N, 3) - N);
    const Hc = H / C_ties;
    
    // Critical Value
    const df = k - 1;
    const critVal = getChiSquareCriticalValue(df, alpha);
    const isSignificant = Hc >= critVal;
    
    // Compile output
    let html = "";
    
    // Step 1: Hipotesis
    html += makeStep("Langkah 1: Rumusan Hipotesis", `
        $H_0: M_1 = M_2 = \\dots = M_${k}$ (Semua kelompok memiliki median hasil yang sama)<br>
        $H_1$: Minimal terdapat satu kelompok yang memiliki median hasil berbeda.
    `);
    
    // Step 2: Taraf Signifikansi
    html += makeStep("Langkah 2: Taraf Signifikansi", `
        $\\alpha = ${alpha * 100}\\%$
    `);
    
    // Step 3: Statistik Uji & Rumus
    html += makeStep("Langkah 3: Statistik Uji", `
        Menggunakan Uji Kruskal-Wallis dengan Koreksi Ties:<br>
        $$H = \\frac{12}{N(N+1)} \\sum_{j=1}^k \\frac{R_j^2}{n_j} - 3(N+1)$$
        $$C = 1 - \\frac{\\sum (t_i^3 - t_i)}{N^3 - N}$$
        $$H_c = \\frac{H}{C}$$
    `);
    
    // Step 4: Daerah Kritis
    html += makeStep("Langkah 4: Daerah Kritis / Kriteria Uji", `
        Tolak $H_0$ jika $H_c \\ge \\chi^2_{(1-\\alpha, \\text{df}=${df})} = ${critVal.toFixed(3)}$
    `);
    
    // Step 5: Pengolahan Data
    let dataTableRows = "";
    groupsData.forEach(g => {
        dataTableRows += `
            <tr>
                <td><strong>Kelompok ${g.index}</strong></td>
                <td>${g.data.join(', ')}</td>
                <td>${g.ranks.map(r => r.toFixed(1)).join(', ')}</td>
                <td>$n_{${g.index}} = ${g.nj}$</td>
                <td>$R_{${g.index}} = ${g.Rj.toFixed(1)}$</td>
                <td>$\\bar{R}_{${g.index}} = ${g.Rj_mean.toFixed(3)}$</td>
            </tr>
        `;
    });
    
    let tiesInfo = "Tidak ditemukan angka kembar (no ties).";
    if (tiesGroup.length > 0) {
        tiesInfo = `
            Ditemukan angka kembar:<br>
            <ul>${tiesGroup.map(t => `<li>${t}</li>`).join('')}</ul>
            $$\\sum (t_i^3 - t_i) = ${sum_t3_t}$$
            $$C = 1 - \\frac{${sum_t3_t}}{${N}^3 - ${N}} = ${C_ties.toFixed(6)}$$
        `;
    }
    
    html += makeStep("Langkah 5: Pengolahan Data", `
        <table class="table-calc">
            <thead>
                <tr>
                    <th>Kelompok</th>
                    <th>Data Asli</th>
                    <th>Peringkat (Ranks)</th>
                    <th>n</th>
                    <th>Jumlah Rank (R)</th>
                    <th>Rata-rata Rank</th>
                </tr>
            </thead>
            <tbody>
                ${dataTableRows}
            </tbody>
        </table>
        <br>
        Total data ($N$) = ${N}<br>
        ${tiesInfo}
        <br>
        Perhitungan nilai $H$ uncorrected:<br>
        $$H = \\frac{12}{${N}(${N}+1)} \\left[ ${groupsData.map(g => `\\frac{${g.Rj}^2}{${g.nj}}`).join(' + ')} \\right] - 3(${N}+1)$$
        $$H = \\frac{12}{${N * (N+1)}} \\left[ ${groupsData.map(g => `${g.Rj2_div_n.toFixed(2)}`).join(' + ')} \\right] - ${3 * (N + 1)}$$
        $$H = ${H.toFixed(4)}$$
        <br>
        Perhitungan nilai $H_c$ terkoreksi Ties:<br>
        $$H_c = \\frac{H}{C} = \\frac{${H.toFixed(4)}}{${C_ties.toFixed(6)}} = ${Hc.toFixed(4)}$$
    `);
    
    // Step 6: Keputusan
    const badgeClass = isSignificant ? 'badge-danger' : 'badge-success';
    const badgeText = isSignificant ? 'Tolak H0' : 'Gagal Tolak H0';
    html += makeStep("Langkah 6: Keputusan", `
        <span class="report-badge ${badgeClass}">${badgeText}</span><br>
        Karena nilai $H_{hitung} = ${Hc.toFixed(4)}$ ${isSignificant ? '\\ge' : '<'} \\chi^2_{table} = ${critVal.toFixed(3)}$.
    `);
    
    // Step 7: Kesimpulan
    const kesimpulanText = isSignificant 
        ? `Pada taraf signifikansi ${alpha * 100}%, terdapat cukup bukti untuk menolak $H_0$. Artinya, terdapat perbedaan rata-rata/median hasil yang signifikan di antara kelompok-kelompok tersebut.<br><br><strong>Jadi,</strong> karena kita menolak $H_0$, terdapat perbedaan peringkat median yang signifikan secara statistik di antara kelompok-kelompok yang diuji.`
        : `Pada taraf signifikansi ${alpha * 100}%, tidak terdapat cukup bukti untuk menolak $H_0$. Artinya, rata-rata/median hasil di antara kelompok-kelompok tersebut secara statistik dianggap sama (perbedaan yang terjadi murni karena variasi acak sampel).<br><br><strong>Jadi,</strong> karena kita gagal menolak $H_0$, secara statistik tidak terdapat perbedaan median peringkat yang nyata (signifikan) di antara kelompok-kelompok yang diuji.`;
        
    html += makeStep("Langkah 7: Kesimpulan", kesimpulanText);
    
    // Add Post-Hoc Dunn and Conover-Iman if Significant
    if (isSignificant) {
        html += `<div style="margin-top: 30px; border-top: 2px dashed rgba(255,255,255,0.1); padding-top: 20px;">
            <h3>Uji Lanjut (Post-Hoc Pairwise Comparisons)</h3>
            <p>Karena uji Kruskal-Wallis menyatakan terdapat perbedaan yang nyata, kita jalankan uji perbandingan berpasangan menggunakan metode Dunn dan Conover-Iman.</p>
        </div>`;
        
        // Compute S^2 for Conover-Iman
        const sum_ranks_sq = Array.from(ranksMap.values()).reduce((acc, r) => acc + r*r, 0);
        const s2 = (1 / (N - 1)) * (sum_ranks_sq - N * Math.pow(N + 1, 2) / 4);
        
        let postHocRows = "";
        const numComparisons = k * (k - 1) / 2;
        const bonfAlpha = alpha / numComparisons;
        
        // Z critical for Dunn
        const z_crit_no_bonf = normalInverse(1 - alpha / 2);
        const z_crit_bonf = normalInverse(1 - bonfAlpha / 2);
        
        // t critical for Conover-Iman
        const t_crit_no_bonf = studentTInverse(1 - alpha / 2, N - k);
        const t_crit_bonf = studentTInverse(1 - bonfAlpha / 2, N - k);
        
        // Variance for Dunn
        const var_dunn = (N * (N + 1)) / 12 - sum_t3_t / (12 * (N - 1));
        
        const sigDunn = [];
        const sigConover = [];
        for (let i = 0; i < k; i++) {
            for (let j = i + 1; j < k; j++) {
                const gA = groupsData[i];
                const gB = groupsData[j];
                const diff = Math.abs(gA.Rj_mean - gB.Rj_mean);
                
                // 1. Dunn
                const se_dunn = Math.sqrt(var_dunn * (1 / gA.nj + 1 / gB.nj));
                const z_stat = diff / se_dunn;
                const p_val_dunn = 2 * (1 - normalCDF(z_stat));
                const is_diff_dunn = z_stat >= z_crit_bonf;
                if (is_diff_dunn) {
                    sigDunn.push(`K${gA.index} vs K${gB.index}`);
                }
                
                // 2. Conover-Iman
                const se_conover = Math.sqrt(s2 * ((N - 1 - Hc) / (N - k)) * (1 / gA.nj + 1 / gB.nj));
                const t_stat = diff / se_conover;
                const p_val_conover = 2 * (1 - studentTCDF(t_stat, N - k));
                const is_diff_conover = t_stat >= t_crit_bonf;
                if (is_diff_conover) {
                    sigConover.push(`K${gA.index} vs K${gB.index}`);
                }
                
                postHocRows += `
                    <tr>
                        <td><strong>K${gA.index} vs K${gB.index}</strong></td>
                        <td>${diff.toFixed(3)}</td>
                        
                        <!-- Dunn columns -->
                        <td>${z_stat.toFixed(3)}</td>
                        <td>${p_val_dunn.toFixed(5)}</td>
                        <td><span class="report-badge ${is_diff_dunn ? 'badge-danger' : 'badge-success'}">${is_diff_dunn ? 'Berbeda' : 'Sama'}</span></td>
                        
                        <!-- Conover columns -->
                        <td>${t_stat.toFixed(3)}</td>
                        <td>${p_val_conover.toFixed(5)}</td>
                        <td><span class="report-badge ${is_diff_conover ? 'badge-danger' : 'badge-success'}">${is_diff_conover ? 'Berbeda' : 'Sama'}</span></td>
                    </tr>
                `;
            }
        }
        
        const dunnText = sigDunn.length > 0 ? `<strong>${sigDunn.join(', ')}</strong>` : 'tidak ada pasangan kelompok yang berbeda nyata';
        const conoverText = sigConover.length > 0 ? `<strong>${sigConover.join(', ')}</strong>` : 'tidak ada pasangan kelompok yang berbeda nyata';
        
        const postHocConclusion = `
            <div style="margin-top: 15px;">
                <strong>Jadi,</strong> berdasarkan hasil uji perbandingan berpasangan (post-hoc) dengan koreksi Bonferroni:
                <ul>
                    <li>Pada <strong>Uji Dunn</strong>: kelompok yang berbeda secara signifikan adalah ${dunnText}.</li>
                    <li>Pada <strong>Uji Conover-Iman</strong>: kelompok yang berbeda secara signifikan adalah ${conoverText}.</li>
                </ul>
            </div>
        `;
        
        html += `
            <div class="glass-box">
                <h5>Hasil Perbandingan Pasangan (Post-Hoc)</h5>
                <p>Uji lanjut ini menggunakan <strong>koreksi Bonferroni</strong> dengan jumlah perbandingan $m = ${numComparisons}$. Taraf signifikansi terkoreksi $\\alpha' = \\alpha / ${numComparisons} = ${bonfAlpha.toFixed(5)}$.</p>
                
                <table class="table-calc">
                    <thead>
                        <tr>
                            <th rowspan="2">Pasangan Kelompok</th>
                            <th rowspan="2">Selisih Mean Rank</th>
                            <th colspan="3" style="text-align: center; border-bottom: 1px solid var(--border-glass);">Uji Dunn</th>
                            <th colspan="3" style="text-align: center; border-bottom: 1px solid var(--border-glass);">Uji Conover-Iman (df = ${N-k})</th>
                        </tr>
                        <tr>
                            <th>Statistik Z</th>
                            <th>p-value</th>
                            <th>Hasil</th>
                            <th>Statistik t</th>
                            <th>p-value</th>
                            <th>Hasil</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${postHocRows}
                    </tbody>
                </table>
                ${postHocConclusion}
                <br>
                <p><em>Catatan: "Berbeda" berarti terdapat perbedaan median/lokasi yang signifikan secara statistik antara kedua kelompok pada tingkat kepercayaan ${(1 - alpha)*100}%.</em></p>
            </div>
        `;
    }
    
    const outputSection = document.getElementById('kw-output-section');
    outputSection.querySelector('.calculation-steps').innerHTML = html;
    outputSection.classList.remove('hidden');
    
    // Trigger KaTeX rendering for dynamic content
    renderMathInElement(outputSection, {
        delimiters: [
            {left: '$$', right: '$$', display: true},
            {left: '$', right: '$', display: false}
        ]
    });
}

// ==========================================================================
// 2. MCNEMAR CALCULATOR LOGIC
// ==========================================================================
function loadMcNemarExample() {
    document.getElementById('mn-cell-a').value = 22;
    document.getElementById('mn-cell-b').value = 24;
    document.getElementById('mn-cell-c').value = 18;
    document.getElementById('mn-cell-d').value = 15;
}

function calculateMcNemar() {
    const a = parseInt(document.getElementById('mn-cell-a').value);
    const b = parseInt(document.getElementById('mn-cell-b').value);
    const c = parseInt(document.getElementById('mn-cell-c').value);
    const d = parseInt(document.getElementById('mn-cell-d').value);
    const alpha = parseFloat(document.getElementById('mn-alpha').value);
    
    if (isNaN(a) || isNaN(b) || isNaN(c) || isNaN(d) || a<0 || b<0 || c<0 || d<0) {
        alert("Semua sel harus diisi dengan angka non-negatif!");
        return;
    }
    
    const total = a + b + c + d;
    const diskoranSum = b + c;
    
    let html = "";
    
    // Step 1: Hipotesis
    html += makeStep("Langkah 1: Rumusan Hipotesis", `
        $H_0: P_b = P_c$ (Tidak ada perbedaan proporsi efek sebelum dan sesudah perlakuan)<br>
        $H_1: P_b \\neq P_c$ (Terdapat perbedaan proporsi efek sebelum dan sesudah perlakuan)
    `);
    
    // Step 2: Taraf Signifikansi
    html += makeStep("Langkah 2: Taraf Signifikansi", `
        $\\alpha = ${alpha * 100}\\%$
    `);
    
    // Step 3: Statistik Uji
    html += makeStep("Langkah 3: Statistik Uji & Aturan Sampel", `
        Untuk Uji McNemar:<br>
        - Jika $b+c > 25$: Pendekatan Chi-Square ($df = 1$) dengan atau tanpa Koreksi Yates.<br>
        - Jika $b+c \\le 25$: Uji Eksak Binomial.<br>
        Pada data ini: $b + c = ${b} + ${c} = ${diskoranSum}$.
    `);
    
    if (diskoranSum > 25) {
        // Chi-Square approximation
        const T1 = Math.pow(b - c, 2) / diskoranSum;
        const T_corr = Math.pow(Math.abs(b - c) - 1, 2) / diskoranSum;
        
        // Critical Value Chi2 df=1
        const critVal = getChiSquareCriticalValue(1, alpha);
        const p_val = 1 - normalCDF(Math.sqrt(T1)); // standard normal squared is chi-square df=1
        const p_val_corr = 1 - normalCDF(Math.sqrt(T_corr));
        
        const isSig = T1 >= critVal;
        const isSigCorr = T_corr >= critVal;
        
        html += makeStep("Langkah 4: Daerah Kritis / Kriteria Uji", `
            Tolak $H_0$ jika $T_{hitung} \\ge \\chi^2_{(1-\\alpha, \\text{df}=1)} = ${critVal.toFixed(3)}$
        `);
        
        html += makeStep("Langkah 5: Pengolahan Data", `
            <strong>1. Tanpa Koreksi Yates:</strong>
            $$T_1 = \\frac{(b - c)^2}{b + c} = \\frac{(${b} - ${c})^2}{${b} + ${c}} = \\frac{${Math.pow(b - c, 2)}}{${diskoranSum}} = ${T1.toFixed(4)}$$
            $$p\\text{-value} \\approx ${p_val.toFixed(5)}$$
            
            <br>
            <strong>2. Dengan Koreksi Yates:</strong>
            $$T_{corr} = \\frac{(|b - c| - 1)^2}{b + c} = \\frac{(|${b} - ${c}| - 1)^2}{${b} + ${c}} = \\frac{${Math.pow(Math.abs(b - c) - 1, 2)}}{${diskoranSum}} = ${T_corr.toFixed(4)}$$
            $$p\\text{-value (Yates)} \\approx ${p_val_corr.toFixed(5)}$$
        `);
        
        const badgeClass = isSigCorr ? 'badge-danger' : 'badge-success';
        const badgeText = isSigCorr ? 'Tolak H0' : 'Gagal Tolak H0';
        
        html += makeStep("Langkah 6: Keputusan (Acuan Uji Yates)", `
            <span class="report-badge ${badgeClass}">${badgeText}</span><br>
            Berdasarkan Uji McNemar terkoruksi Yates: nilai $T_{corr} = ${T_corr.toFixed(4)}$ ${isSigCorr ? '\\ge' : '<'} \\chi^2_{table} = ${critVal.toFixed(3)}$.
        `);
        
        const kesimpulan = isSigCorr 
            ? `Pada taraf signifikansi ${alpha*100}%, terdapat cukup bukti untuk menolak $H_0$. Artinya, terdapat perubahan proporsi yang signifikan akibat perlakuan tersebut.<br><br><strong>Jadi,</strong> karena kita menolak $H_0$, terdapat perubahan proporsi/efek yang nyata (signifikan) akibat pemberian perlakuan tersebut.`
            : `Pada taraf signifikansi ${alpha*100}%, tidak terdapat cukup bukti untuk menolak $H_0$. Artinya, perlakuan secara statistik dianggap tidak memberikan efek perubahan yang signifikan.<br><br><strong>Jadi,</strong> karena kita gagal menolak $H_0$, tidak terdapat perubahan proporsi/efek yang nyata (signifikan) akibat pemberian perlakuan tersebut.`;
        
        html += makeStep("Langkah 7: Kesimpulan", kesimpulan);
        
    } else {
        // Binomial exact test
        const smaller = Math.min(b, c);
        // Two-sided p-value: sum of probabilities <= smaller and >= larger
        let p_val = 0;
        for (let i = 0; i <= smaller; i++) {
            p_val += combination(diskoranSum, i) * Math.pow(0.5, diskoranSum);
        }
        p_val = p_val * 2; // double for two-tailed
        if (p_val > 1.0) p_val = 1.0;
        
        const isSig = p_val <= alpha;
        
        html += makeStep("Langkah 4: Daerah Kritis / Kriteria Uji", `
            Karena sampel kecil ($b+c \\le 25$), uji dilakukan secara eksak berbasis distribusi Binomial.
            Tolak $H_0$ jika nilai $p\\text{-value} \\le \\alpha = ${alpha}$.
        `);
        
        html += makeStep("Langkah 5: Pengolahan Data (Uji Eksak Binomial)", `
            Jumlah diskoran ($n$) = $b + c = ${diskoranSum}$<br>
            Nilai terkecil ($k$) = $\\min(b, c) = ${smaller}$<br>
            <br>
            Mencari probabilitas kumulatif binomial $P(X \\le ${smaller})$ dengan $p=0.5$:
            $$P(X \\le ${smaller}) = \\sum_{i=0}^{${smaller}} \\binom{${diskoranSum}}{i} (0.5)^{${diskoranSum}}$$
            $$P(X \\le ${smaller}) = ${ (p_val/2).toFixed(6) }$$
            
            $$p\\text{-value (2-tailed)} = 2 \\times P(X \\le ${smaller}) = ${p_val.toFixed(5)}$$
        `);
        
        const badgeClass = isSig ? 'badge-danger' : 'badge-success';
        const badgeText = isSig ? 'Tolak H0' : 'Gagal Tolak H0';
        
        html += makeStep("Langkah 6: Keputusan", `
            <span class="report-badge ${badgeClass}">${badgeText}</span><br>
            Karena $p\\text{-value} = ${p_val.toFixed(5)}$ ${isSig ? '\\le' : '>'} \\alpha = ${alpha}$.
        `);
        
        const kesimpulan = isSig 
            ? `Pada taraf signifikansi ${alpha*100}%, terdapat perbedaan proporsi yang signifikan (Tolak $H_0$).<br><br><strong>Jadi,</strong> karena kita menolak $H_0$, terdapat perbedaan proporsi/efek yang nyata (signifikan) akibat pemberian perlakuan tersebut.`
            : `Pada taraf signifikansi ${alpha*100}%, tidak terdapat perbedaan proporsi yang signifikan (Gagal Tolak $H_0$).<br><br><strong>Jadi,</strong> karena kita gagal menolak $H_0$, tidak terdapat perbedaan proporsi/efek yang nyata (signifikan) akibat pemberian perlakuan tersebut.`;
            
        html += makeStep("Langkah 7: Kesimpulan", kesimpulan);
    }
    
    const outputSection = document.getElementById('mn-output-section');
    outputSection.querySelector('.calculation-steps').innerHTML = html;
    outputSection.classList.remove('hidden');
    
    renderMathInElement(outputSection, {
        delimiters: [
            {left: '$$', right: '$$', display: true},
            {left: '$', right: '$', display: false}
        ]
    });
}

// ==========================================================================
// 3. COCHRAN Q CALCULATOR LOGIC
// ==========================================================================
let cochranCols = 3;
let cochranRows = 12;

function initCochranTable() {
    const table = document.getElementById('cochran-table');
    const thead = table.querySelector('thead tr');
    const tbody = table.querySelector('tbody');
    
    thead.innerHTML = '<th>Blok / Responden</th>';
    for (let j = 1; j <= cochranCols; j++) {
        thead.innerHTML += `<th>Perlakuan ${String.fromCharCode(64 + j)}</th>`;
    }
    
    tbody.innerHTML = '';
    const initialData = [
        [0, 0, 0], [0, 0, 1], [0, 1, 0], [0, 1, 0],
        [1, 1, 0], [1, 1, 0], [1, 1, 0], [1, 1, 0],
        [1, 1, 1], [1, 1, 1], [1, 1, 1], [1, 1, 1]
    ];
    
    for (let i = 1; i <= cochranRows; i++) {
        let cellsHtml = `<td><strong>Responden ${i}</strong></td>`;
        for (let j = 1; j <= cochranCols; j++) {
            const val = (initialData[i-1] && initialData[i-1][j-1] !== undefined) ? initialData[i-1][j-1] : 0;
            cellsHtml += `<td><input type="number" class="cell-input cochran-cell" data-row="${i}" data-col="${j}" value="${val}" min="0" max="1"></td>`;
        }
        const tr = document.createElement('tr');
        tr.innerHTML = cellsHtml;
        tbody.appendChild(tr);
    }
}

function addCochranRow() {
    cochranRows++;
    const tbody = document.querySelector('#cochran-table tbody');
    const tr = document.createElement('tr');
    let cellsHtml = `<td><strong>Responden ${cochranRows}</strong></td>`;
    for (let j = 1; j <= cochranCols; j++) {
        cellsHtml += `<td><input type="number" class="cell-input cochran-cell" data-row="${cochranRows}" data-col="${j}" value="0" min="0" max="1"></td>`;
    }
    tr.innerHTML = cellsHtml;
    tbody.appendChild(tr);
}

function removeCochranRow() {
    if (cochranRows <= 3) {
        alert("Butuh minimal 3 baris!");
        return;
    }
    const tbody = document.querySelector('#cochran-table tbody');
    tbody.lastElementChild.remove();
    cochranRows--;
}

function addCochranCol() {
    if (cochranCols >= 10) {
        alert("Maksimal 10 kolom!");
        return;
    }
    cochranCols++;
    const thead = document.querySelector('#cochran-table thead tr');
    thead.innerHTML += `<th>Perlakuan ${String.fromCharCode(64 + cochranCols)}</th>`;
    
    const rows = document.querySelectorAll('#cochran-table tbody tr');
    rows.forEach((row, i) => {
        const td = document.createElement('td');
        td.innerHTML = `<input type="number" class="cell-input cochran-cell" data-row="${i+1}" data-col="${cochranCols}" value="0" min="0" max="1">`;
        row.appendChild(td);
    });
}

function removeCochranCol() {
    if (cochranCols <= 3) {
        alert("Butuh minimal 3 perlakuan!");
        return;
    }
    const thead = document.querySelector('#cochran-table thead tr');
    thead.lastElementChild.remove();
    
    const rows = document.querySelectorAll('#cochran-table tbody tr');
    rows.forEach(row => {
        row.lastElementChild.remove();
    });
    cochranCols--;
}

function loadCochranExample1() {
    cochranCols = 4;
    cochranRows = 6;
    
    const table = document.getElementById('cochran-table');
    const thead = table.querySelector('thead tr');
    const tbody = table.querySelector('tbody');
    
    thead.innerHTML = '<th>Pabrik / Blok</th>';
    for (let j = 1; j <= cochranCols; j++) {
        thead.innerHTML += `<th>Metode ${String.fromCharCode(64 + j)}</th>`;
    }
    
    const exData = [
        [1, 1, 0, 0],
        [1, 1, 0, 1],
        [1, 0, 0, 0],
        [1, 1, 1, 0],
        [1, 1, 0, 1],
        [1, 1, 0, 1]
    ];
    
    tbody.innerHTML = '';
    for (let i = 1; i <= cochranRows; i++) {
        let cellsHtml = `<td><strong>Pabrik ${i}</strong></td>`;
        for (let j = 1; j <= cochranCols; j++) {
            cellsHtml += `<td><input type="number" class="cell-input cochran-cell" data-row="${i}" data-col="${j}" value="${exData[i-1][j-1]}" min="0" max="1"></td>`;
        }
        const tr = document.createElement('tr');
        tr.innerHTML = cellsHtml;
        tbody.appendChild(tr);
    }
}

function loadCochranExample2() {
    cochranCols = 3;
    cochranRows = 12;
    initCochranTable();
}

function calculateCochran() {
    const inputs = document.querySelectorAll('.cochran-cell');
    const alpha = parseFloat(document.getElementById('co-alpha').value);
    
    // Parse grid
    const matrix = Array(cochranRows).fill(0).map(() => Array(cochranCols).fill(0));
    let hasInvalid = false;
    
    inputs.forEach(inp => {
        const r = parseInt(inp.getAttribute('data-row')) - 1;
        const c = parseInt(inp.getAttribute('data-col')) - 1;
        const val = parseInt(inp.value);
        if (isNaN(val) || (val !== 0 && val !== 1)) {
            hasInvalid = true;
            inp.classList.add('error-border');
        } else {
            inp.classList.remove('error-border');
            matrix[r][c] = val;
        }
    });
    
    if (hasInvalid) {
        alert("Semua data Cochran harus berupa biner: 0 atau 1!");
        return;
    }
    
    // Row sums Ri and squared row sums Ri^2
    const Ri = [];
    const Ri2 = [];
    for (let i = 0; i < cochranRows; i++) {
        let sum = 0;
        for (let j = 0; j < cochranCols; j++) {
            sum += matrix[i][j];
        }
        Ri.push(sum);
        Ri2.push(sum * sum);
    }
    
    // Column sums Cj and squared column sums Cj^2
    const Cj = [];
    const Cj2 = [];
    for (let j = 0; j < cochranCols; j++) {
        let sum = 0;
        for (let i = 0; i < cochranRows; i++) {
            sum += matrix[i][j];
        }
        Cj.push(sum);
        Cj2.push(sum * sum);
    }
    
    const N = Cj.reduce((a, b) => a + b, 0);
    const sum_Cj2 = Cj2.reduce((a, b) => a + b, 0);
    const sum_Ri2 = Ri2.reduce((a, b) => a + b, 0);
    
    // Calculate Cochran Q
    const numerator = cochranCols * (cochranCols - 1) * sum_Cj2 - (cochranCols - 1) * (N * N);
    const denominator = cochranCols * N - sum_Ri2;
    
    const Q = numerator / denominator;
    
    const df = cochranCols - 1;
    const critVal = getChiSquareCriticalValue(df, alpha);
    const isSignificant = Q >= critVal;
    
    let html = "";
    
    // Step 1: Hipotesis
    html += makeStep("Langkah 1: Rumusan Hipotesis", `
        $H_0: P_1 = P_2 = \\dots = P_${cochranCols}$ (Semua perlakuan memiliki proporsi sukses yang sama/sama-sama efektif)<br>
        $H_1$: Minimal ada satu perlakuan yang memiliki proporsi sukses berbeda.
    `);
    
    // Step 2: Taraf Signifikansi
    html += makeStep("Langkah 2: Taraf Signifikansi", `
        $\\alpha = ${alpha * 100}\\%$
    `);
    
    // Step 3: Statistik Uji
    html += makeStep("Langkah 3: Statistik Uji & Rumus", `
        Menggunakan Uji Cochran Q:<br>
        $$Q = \\frac{c(c-1) \\sum_{j=1}^c C_j^2 - (c-1) N^2}{c N - \\sum_{i=1}^r R_i^2}$$
    `);
    
    // Step 4: Daerah Kritis
    html += makeStep("Langkah 4: Daerah Kritis / Kriteria Uji", `
        Tolak $H_0$ jika $Q \\ge \\chi^2_{(1-\\alpha, \\text{df}=${df})} = ${critVal.toFixed(3)}$
    `);
    
    // Step 5: Pengolahan Data
    let gridRowsHtml = "";
    for (let i = 0; i < cochranRows; i++) {
        let colsHtml = "";
        for (let j = 0; j < cochranCols; j++) {
            colsHtml += `<td>${matrix[i][j]}</td>`;
        }
        gridRowsHtml += `
            <tr>
                <td><strong>Responden ${i+1}</strong></td>
                ${colsHtml}
                <td><strong>$R_{${i+1}} = ${Ri[i]}$</strong></td>
                <td>$R_{${i+1}}^2 = ${Ri2[i]}$</td>
            </tr>
        `;
    }
    
    html += makeStep("Langkah 5: Pengolahan Data", `
        <table class="table-calc">
            <thead>
                <tr>
                    <th>Blok</th>
                    ${Array(cochranCols).fill(0).map((_, idx) => `<th>Perlakuan ${String.fromCharCode(64 + idx + 1)}</th>`).join('')}
                    <th>Total Ri</th>
                    <th>Ri^2</th>
                </tr>
            </thead>
            <tbody>
                ${gridRowsHtml}
                <tr style="background: rgba(99, 102, 241, 0.1); border-top: 2px solid var(--accent-indigo);">
                    <td><strong>Total Cj</strong></td>
                    ${Cj.map(c => `<td><strong>${c}</strong></td>`).join('')}
                    <td><strong>$N = ${N}$</strong></td>
                    <td>$\\sum R_i^2 = ${sum_Ri2}$</td>
                </tr>
                <tr>
                    <td><strong>Cj^2</strong></td>
                    ${Cj2.map(c => `<td>${c}</td>`).join('')}
                    <td colspan="2">$\\sum C_j^2 = ${sum_Cj2}$</td>
                </tr>
            </tbody>
        </table>
        <br>
        Masukkan nilai ke rumus Cochran Q:<br>
        $$Q = \\frac{${cochranCols}(${cochranCols}-1)(${sum_Cj2}) - (${cochranCols}-1)(${N}^2)}{${cochranCols}(${N}) - ${sum_Ri2}}$$
        $$Q = \\frac{${cochranCols * (cochranCols - 1)} \\times ${sum_Cj2} - ${cochranCols - 1} \\times ${N * N}}{${cochranCols * N} - ${sum_Ri2}}$$
        $$Q = \\frac{${cochranCols * (cochranCols - 1) * sum_Cj2} - ${(cochranCols - 1) * N * N}}{${cochranCols * N - sum_Ri2}}$$
        $$Q = \\frac{${numerator}}{${denominator}} = ${Q.toFixed(4)}$$
    `);
    
    // Step 6: Keputusan
    const badgeClass = isSignificant ? 'badge-danger' : 'badge-success';
    const badgeText = isSignificant ? 'Tolak H0' : 'Gagal Tolak H0';
    html += makeStep("Langkah 6: Keputusan", `
        <span class="report-badge ${badgeClass}">${badgeText}</span><br>
        Karena nilai $Q_{hitung} = ${Q.toFixed(4)}$ ${isSignificant ? '\\ge' : '<'} \\chi^2_{table} = ${critVal.toFixed(3)}$.
    `);
    
    // Step 7: Kesimpulan
    const kesimpulanText = isSignificant
        ? `Pada taraf signifikansi ${alpha * 100}%, terdapat cukup bukti untuk menolak $H_0$. Artinya, minimal ada satu perlakuan yang memiliki tingkat efektivitas/kesulitan yang berbeda secara signifikan.<br><br><strong>Jadi,</strong> karena kita menolak $H_0$, terdapat perbedaan efektivitas/proporsi sukses yang nyata (signifikan) di antara perlakuan-perlakuan yang diuji.`
        : `Pada taraf signifikansi ${alpha * 100}%, tidak terdapat cukup bukti untuk menolak $H_0$. Artinya, semua perlakuan secara statistik dianggap memberikan tingkat efektivitas/kesulitan yang sama.<br><br><strong>Jadi,</strong> karena kita gagal menolak $H_0$, secara statistik semua perlakuan dianggap memberikan tingkat efektivitas/proporsi sukses yang sama (tidak berbeda nyata).`;
        
    html += makeStep("Langkah 7: Kesimpulan", kesimpulanText);
    
    // Uji Lanjut (Post-Hoc McNemar) if Significant
    if (isSignificant) {
        html += `<div style="margin-top: 30px; border-top: 2px dashed rgba(255,255,255,0.1); padding-top: 20px;">
            <h3>Uji Lanjut Cochran Q (Pairwise McNemar Comparisons)</h3>
            <p>Karena uji Cochran Q menyatakan terdapat perbedaan proporsi yang signifikan di antara perlakuan, kita lakukan perbandingan berpasangan menggunakan <strong>Uji McNemar</strong> dengan koreksi Bonferroni.</p>
        </div>`;
        
        let postHocRows = "";
        const numComparisons = cochranCols * (cochranCols - 1) / 2;
        const bonfAlpha = alpha / numComparisons;
        const sigCochran = [];
        
        for (let j1 = 0; j1 < cochranCols; j1++) {
            for (let j2 = j1 + 1; j2 < cochranCols; j2++) {
                let b_count = 0; // Treatment j1 is 1, Treatment j2 is 0
                let c_count = 0; // Treatment j1 is 0, Treatment j2 is 1
                for (let i = 0; i < cochranRows; i++) {
                    const val1 = matrix[i][j1];
                    const val2 = matrix[i][j2];
                    if (val1 === 1 && val2 === 0) b_count++;
                    if (val1 === 0 && val2 === 1) c_count++;
                }
                
                const sum_dis = b_count + c_count;
                let statVal = 0;
                let p_val = 1.0;
                
                const colName1 = String.fromCharCode(64 + j1 + 1);
                const colName2 = String.fromCharCode(64 + j2 + 1);
                
                if (sum_dis > 0) {
                    statVal = Math.pow(Math.abs(b_count - c_count) - 1, 2) / sum_dis;
                    if (statVal < 0) statVal = 0;
                    p_val = 1 - normalCDF(Math.sqrt(statVal));
                }
                
                const isDiff = p_val <= bonfAlpha;
                if (isDiff) {
                    sigCochran.push(`Perlakuan ${colName1} vs ${colName2}`);
                }
                
                postHocRows += `
                    <tr>
                        <td><strong>Perlakuan ${colName1} vs ${colName2}</strong></td>
                        <td>$b = ${b_count}$, $c = ${c_count}$</td>
                        <td>${statVal.toFixed(3)}</td>
                        <td>${p_val.toFixed(5)}</td>
                        <td><span class="report-badge ${isDiff ? 'badge-danger' : 'badge-success'}">${isDiff ? 'Berbeda' : 'Sama'}</span></td>
                    </tr>
                `;
            }
        }
        
        let postHocConclusion = "";
        if (sigCochran.length > 0) {
            postHocConclusion = `<p style="margin-top: 15px;"><strong>Jadi,</strong> berdasarkan hasil uji lanjut McNemar berpasangan dengan koreksi Bonferroni, terdapat perbedaan proporsi sukses yang signifikan secara statistik antara pasangan: <strong>${sigCochran.join(', ')}</strong>.</p>`;
        } else {
            postHocConclusion = `<p style="margin-top: 15px;"><strong>Jadi,</strong> berdasarkan hasil uji lanjut McNemar berpasangan dengan koreksi Bonferroni, tidak ada pasangan perlakuan yang memiliki perbedaan proporsi sukses secara signifikan.</p>`;
        }
        
        html += `
            <div class="glass-box">
                <h5>Hasil Perbandingan Pasangan (Post-Hoc McNemar)</h5>
                <p>Jumlah perbandingan $m = ${numComparisons}$. Taraf signifikansi terkoreksi Bonferroni $\\alpha' = \\alpha / ${numComparisons} = ${bonfAlpha.toFixed(5)}$.</p>
                
                <table class="table-calc">
                    <thead>
                        <tr>
                            <th>Pasangan Perlakuan</th>
                            <th>Discordant (b, c)</th>
                            <th>Statistik McNemar ($\\chi^2$)</th>
                            <th>p-value</th>
                            <th>Hasil</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${postHocRows}
                    </tbody>
                </table>
                ${postHocConclusion}
                <br>
                <p><em>Catatan: "Berbeda" menunjukkan terdapat perbedaan proporsi yang signifikan setelah koreksi tingkat kesalahan tipe I.</em></p>
            </div>
        `;
    }
    
    const outputSection = document.getElementById('co-output-section');
    outputSection.querySelector('.calculation-steps').innerHTML = html;
    outputSection.classList.remove('hidden');
    
    renderMathInElement(outputSection, {
        delimiters: [
            {left: '$$', right: '$$', display: true},
            {left: '$', right: '$', display: false}
        ]
    });
}

// ==========================================================================
// 4. FRIEDMAN CALCULATOR LOGIC
// ==========================================================================
let friedmanCols = 3;
let friedmanRows = 9;

function initFriedmanTable() {
    const table = document.getElementById('friedman-table');
    const thead = table.querySelector('thead tr');
    const tbody = table.querySelector('tbody');
    
    thead.innerHTML = '<th>Blok / Responden</th>';
    for (let j = 1; j <= friedmanCols; j++) {
        thead.innerHTML += `<th>Perlakuan ${String.fromCharCode(64 + j)}</th>`;
    }
    
    tbody.innerHTML = '';
    const initialData = [
        [4000, 3210, 6120], [1600, 1040, 2410], [1600, 647, 2210],
        [1200, 570, 2060], [840, 445, 1400], [352, 156, 249],
        [224, 155, 224], [200, 99, 208], [184, 70, 227]
    ];
    
    for (let i = 1; i <= friedmanRows; i++) {
        let cellsHtml = `<td><strong>Blok ${i}</strong></td>`;
        for (let j = 1; j <= friedmanCols; j++) {
            const val = (initialData[i-1] && initialData[i-1][j-1] !== undefined) ? initialData[i-1][j-1] : 0;
            cellsHtml += `<td><input type="number" class="cell-input friedman-cell" data-row="${i}" data-col="${j}" value="${val}"></td>`;
        }
        const tr = document.createElement('tr');
        tr.innerHTML = cellsHtml;
        tbody.appendChild(tr);
    }
}

function addFriedmanRow() {
    friedmanRows++;
    const tbody = document.querySelector('#friedman-table tbody');
    const tr = document.createElement('tr');
    let cellsHtml = `<td><strong>Blok ${friedmanRows}</strong></td>`;
    for (let j = 1; j <= friedmanCols; j++) {
        cellsHtml += `<td><input type="number" class="cell-input friedman-cell" data-row="${friedmanRows}" data-col="${j}" value="0"></td>`;
    }
    tr.innerHTML = cellsHtml;
    tbody.appendChild(tr);
}

function removeFriedmanRow() {
    if (friedmanRows <= 3) {
        alert("Butuh minimal 3 baris!");
        return;
    }
    const tbody = document.querySelector('#friedman-table tbody');
    tbody.lastElementChild.remove();
    friedmanRows--;
}

function addFriedmanCol() {
    if (friedmanCols >= 10) {
        alert("Maksimal 10 kolom!");
        return;
    }
    friedmanCols++;
    const thead = document.querySelector('#friedman-table thead tr');
    thead.innerHTML += `<th>Perlakuan ${String.fromCharCode(64 + friedmanCols)}</th>`;
    
    const rows = document.querySelectorAll('#friedman-table tbody tr');
    rows.forEach((row, i) => {
        const td = document.createElement('td');
        td.innerHTML = `<input type="number" class="cell-input friedman-cell" data-row="${i+1}" data-col="${friedmanCols}" value="0">`;
        row.appendChild(td);
    });
}

function removeFriedmanCol() {
    if (friedmanCols <= 3) {
        alert("Butuh minimal 3 perlakuan!");
        return;
    }
    const thead = document.querySelector('#friedman-table thead tr');
    thead.lastElementChild.remove();
    
    const rows = document.querySelectorAll('#friedman-table tbody tr');
    rows.forEach(row => {
        row.lastElementChild.remove();
    });
    friedmanCols--;
}

function loadFriedmanExample1() {
    friedmanCols = 3;
    friedmanRows = 9;
    initFriedmanTable();
}

function loadFriedmanExample2() {
    friedmanCols = 4;
    friedmanRows = 12;
    
    const table = document.getElementById('friedman-table');
    const thead = table.querySelector('thead tr');
    const tbody = table.querySelector('tbody');
    
    thead.innerHTML = '<th>Blok / Responden</th>';
    for (let j = 1; j <= friedmanCols; j++) {
        thead.innerHTML += `<th>Mobil ${String.fromCharCode(64 + j)}</th>`;
    }
    
    const exData = [
        [4, 2, 3, 1],
        [4, 2, 3, 1],
        [3, 1, 2, 4],
        [3, 1, 2, 4],
        [4, 2, 1, 3],
        [4, 1, 2, 3],
        [4, 1, 2, 3],
        [4, 2, 1, 3],
        [3, 1, 2, 4],
        [4, 1, 3, 2],
        [4, 2, 3, 1],
        [3, 1, 2, 4]
    ];
    
    tbody.innerHTML = '';
    for (let i = 1; i <= friedmanRows; i++) {
        let cellsHtml = `<td><strong>Responden ${i}</strong></td>`;
        for (let j = 1; j <= friedmanCols; j++) {
            cellsHtml += `<td><input type="number" class="cell-input friedman-cell" data-row="${i}" data-col="${j}" value="${exData[i-1][j-1]}"></td>`;
        }
        const tr = document.createElement('tr');
        tr.innerHTML = cellsHtml;
        tbody.appendChild(tr);
    }
}

function calculateFriedman() {
    const inputs = document.querySelectorAll('.friedman-cell');
    const alpha = parseFloat(document.getElementById('fr-alpha').value);
    
    const matrix = Array(friedmanRows).fill(0).map(() => Array(friedmanCols).fill(0));
    let hasInvalid = false;
    
    inputs.forEach(inp => {
        const r = parseInt(inp.getAttribute('data-row')) - 1;
        const c = parseInt(inp.getAttribute('data-col')) - 1;
        const val = parseFloat(inp.value);
        if (isNaN(val)) {
            hasInvalid = true;
            inp.classList.add('error-border');
        } else {
            inp.classList.remove('error-border');
            matrix[r][c] = val;
        }
    });
    
    if (hasInvalid) {
        alert("Semua data Friedman harus berupa angka valid!");
        return;
    }
    
    const b = friedmanRows;
    const k = friedmanCols;
    
    // Rank within each row (block)
    const rankedMatrix = Array(b).fill(0).map(() => Array(k).fill(0));
    const tiesInBlocks = [];
    let total_t3_t_all_blocks = 0;
    
    for (let i = 0; i < b; i++) {
        const rowData = matrix[i].map((val, idx) => ({ idx: idx, val: val }));
        const sorted = rowData.slice().sort((x, y) => x.val - y.val);
        
        let j = 0;
        const tempRanks = Array(k).fill(0);
        while (j < k) {
            let m = j + 1;
            while (m < k && sorted[m].val === sorted[j].val) {
                m++;
            }
            const sumR = ((j + 1) + m) * (m - j) / 2;
            const avgR = sumR / (m - j);
            for (let idx = j; idx < m; idx++) {
                tempRanks[sorted[idx].idx] = avgR;
            }
            if (m - j > 1) {
                total_t3_t_all_blocks += (Math.pow(m - j, 3) - (m - j));
                tiesInBlocks.push(`Blok ${i+1}: Nilai ${sorted[j].val} kembar ${m-j} kali.`);
            }
            j = m;
        }
        rankedMatrix[i] = tempRanks;
    }
    
    // Column rank sums Rj
    const Rj = Array(k).fill(0);
    const Rj2 = Array(k).fill(0);
    for (let j = 0; j < k; j++) {
        let sum = 0;
        for (let i = 0; i < b; i++) {
            sum += rankedMatrix[i][j];
        }
        Rj[j] = sum;
        Rj2[j] = sum * sum;
    }
    
    const sum_Rj2 = Rj2.reduce((x, y) => x + y, 0);
    const expected_Rj = b * (k + 1) / 2;
    
    // Sum [Rj - expected]^2
    const sum_dev_sq = Rj.reduce((acc, r) => acc + Math.pow(r - expected_Rj, 2), 0);
    
    // Test statistic T (Friedman)
    // T = (12 / (b * k * (k + 1))) * sum_Rj^2 - 3 * b * (k + 1)
    const T = (12 / (b * k * (k + 1))) * sum_Rj2 - 3 * b * (k + 1);
    
    // Kendall's W (Concordance)
    // W = (12 * sum [Rj - meanRj]^2) / (b^2 * k * (k^2 - 1))
    // With ties: W = 12 * sum [Rj - expected]^2 / (b^2 * k * (k^2 - 1) - b * sum(t3-t))
    const W_denom = (Math.pow(b, 2) * k * (k * k - 1)) - b * total_t3_t_all_blocks;
    const W = (12 * sum_dev_sq) / W_denom;
    
    const df = k - 1;
    const critVal = getChiSquareCriticalValue(df, alpha);
    const isSignificant = T >= critVal;
    
    let html = "";
    
    // Step 1: Hipotesis
    html += makeStep("Langkah 1: Rumusan Hipotesis", `
        $H_0: M_1 = M_2 = \\dots = M_${k}$ (Semua perlakuan memberikan efek yang sama/median yang sama)<br>
        $H_1$: Minimal terdapat satu perlakuan yang memberikan efek berbeda.
    `);
    
    // Step 2: Taraf Signifikansi
    html += makeStep("Langkah 2: Taraf Signifikansi", `
        $\\alpha = ${alpha * 100}\\%$
    `);
    
    // Step 3: Statistik Uji & Rumus
    html += makeStep("Langkah 3: Statistik Uji", `
        Menggunakan Uji Friedman:<br>
        $$T = \\frac{12}{bk(k+1)} \\sum_{j=1}^k R_j^2 - 3b(k+1)$$
        $$T = \\frac{12}{bk(k+1)} \\sum_{j=1}^k \\left[ R_j - \\frac{b(k+1)}{2} \\right]^2$$
        Koefisien Konkordansi Kendall $W$ (mengukur kesepakatan antar-blok):<br>
        $$W = \\frac{12 \\sum \\left[ R_j - \\frac{b(k+1)}{2} \\right]^2}{b^2 k(k^2-1) - b \\sum(t^3-t)}$$
    `);
    
    // Step 4: Daerah Kritis
    html += makeStep("Langkah 4: Daerah Kritis / Kriteria Uji", `
        Tolak $H_0$ jika $T \\ge \\chi^2_{(1-\\alpha, \\text{df}=${df})} = ${critVal.toFixed(3)}$
    `);
    
    // Step 5: Pengolahan Data
    let gridRowsHtml = "";
    for (let i = 0; i < b; i++) {
        let colsOriginalHtml = "";
        let colsRanksHtml = "";
        for (let j = 0; j < k; j++) {
            colsOriginalHtml += `<td>${matrix[i][j]}</td>`;
            colsRanksHtml += `<td><strong>${rankedMatrix[i][j].toFixed(1)}</strong></td>`;
        }
        gridRowsHtml += `
            <tr>
                <td><strong>Blok ${i+1}</strong></td>
                ${colsOriginalHtml}
                <td style="border-left: 2px solid var(--border-glass);"></td>
                ${colsRanksHtml}
            </tr>
        `;
    }
    
    html += makeStep("Langkah 5: Pengolahan Data (Perangkingan)", `
        <table class="table-calc">
            <thead>
                <tr>
                    <th rowspan="2">Blok</th>
                    <th colspan="${k}" style="text-align: center; border-bottom: 1px solid var(--border-glass);">Data Asli</th>
                    <th style="border-left: 2px solid var(--border-glass);"></th>
                    <th colspan="${k}" style="text-align: center; border-bottom: 1px solid var(--border-glass);">Peringkat (Ranks)</th>
                </tr>
                <tr>
                    ${Array(k).fill(0).map((_, idx) => `<th>P${String.fromCharCode(64 + idx + 1)}</th>`).join('')}
                    <th style="border-left: 2px solid var(--border-glass);"></th>
                    ${Array(k).fill(0).map((_, idx) => `<th>R_${String.fromCharCode(64 + idx + 1)}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
                ${gridRowsHtml}
                <tr style="background: rgba(99, 102, 241, 0.1); border-top: 2px solid var(--accent-indigo);">
                    <td><strong>Jumlah Rj</strong></td>
                    ${Array(k).fill(0).map(() => `<td>-</td>`).join('')}
                    <td style="border-left: 2px solid var(--border-glass);"></td>
                    ${Rj.map(r => `<td><strong>${r.toFixed(1)}</strong></td>`).join('')}
                </tr>
                <tr>
                    <td><strong>(Rj - ${expected_Rj.toFixed(1)})^2</strong></td>
                    ${Array(k).fill(0).map(() => `<td>-</td>`).join('')}
                    <td style="border-left: 2px solid var(--border-glass);"></td>
                    ${Rj.map(r => `<td>${Math.pow(r - expected_Rj, 2).toFixed(2)}</td>`).join('')}
                </tr>
            </tbody>
        </table>
        <br>
        Rata-rata peringkat teoritis = $\\frac{b(k+1)}{2} = \\frac{${b}(${k}+1)}{2} = ${expected_Rj.toFixed(1)}$<br>
        Jumlah kuadrat deviasi $\\sum \\left[ R_j - \\frac{b(k+1)}{2} \\right]^2 = ${sum_dev_sq.toFixed(2)}$<br>
        Jumlah kuadrat rank $\\sum R_j^2 = ${sum_Rj2.toFixed(2)}$<br>
        <br>
        Masukkan nilai ke rumus Friedman $T$ (Rumus Komputasi):<br>
        $$T = \\frac{12}{b k (k + 1)} \\sum_{j=1}^k R_j^2 - 3b(k+1)$$
        $$T = \\frac{12}{${b} \\times ${k} \\times (${k}+1)} \\times ${sum_Rj2.toFixed(2)} - 3 \\times ${b} \\times (${k}+1)$$
        $$T = \\frac{12}{${b * k * (k+1)}} \\times ${sum_Rj2.toFixed(2)} - ${3 * b * (k+1)}$$
        $$T = ${((12 / (b * k * (k+1))) * sum_Rj2).toFixed(4)} - ${3 * b * (k+1)} = ${T.toFixed(4)}$$
        <br>
        Masukkan nilai ke rumus Kendall $W$:<br>
        ${tiesInBlocks.length > 0 ? `Ties ditemukan: ${tiesInBlocks.length} ties. $\\sum(t^3-t) = ${total_t3_t_all_blocks}$.<br>` : ''}
        $$W = \\frac{12 \\times ${sum_dev_sq.toFixed(2)}}{${b}^2 \\times ${k} \\times (${k * k - 1}) ${total_t3_t_all_blocks > 0 ? `- ${b} \\times ${total_t3_t_all_blocks}` : ''}}$$
        $$W = \\frac{${12 * sum_dev_sq}}{${W_denom}} = ${W.toFixed(4)}$$
        <br>
        <div class="glass-box" style="margin-top: 15px; border-left: 4px solid var(--accent-indigo); padding-left: 15px;">
            <strong>💡 Hubungan Uji Friedman $T$ & Koefisien Konkordansi Kendall $W$:</strong><br>
            <ul>
                <li><strong>Uji Friedman $T$ (${T.toFixed(4)})</strong>: Digunakan untuk <strong>pengujian hipotesis</strong>. Nilai ini diuji terhadap distribusi Chi-Square untuk menentukan apakah terdapat perbedaan preferensi/efek perlakuan yang signifikan secara statistik di antara kolom.</li>
                <li><strong>Kendall's $W$ (${W.toFixed(4)})</strong>: Bertindak sebagai <strong>effect size (ukuran kekuatan efek)</strong>. Koefisien ini mengukur kekuatan kesepakatan/konsensus di antara para penilai (blok). Nilai $W$ berkisar antara $0$ (tidak ada kesepakatan sama sekali) hingga $1$ (kesepakatan bulat/sempurna).</li>
                <li><strong>Hubungan Matematis</strong>: Keduanya saling terhubung secara linier melalui persamaan:
                    $$W = \\frac{T}{b(k-1)}$$
                    $$W = \\frac{${T.toFixed(4)}}{${b} \\times (${k}-1)} = \\frac{${T.toFixed(4)}}{${b * (k - 1)}} = ${(T / (b * (k - 1))).toFixed(4)}$$
                </li>
                <li><strong>Interpretasi Efek ($W = ${W.toFixed(4)}$)</strong>: Menunjukkan derajat kesepakatan di antara para responden berada dalam kategori <strong>${W < 0.3 ? 'Lemah (Weak)' : W < 0.6 ? 'Sedang (Moderate)' : W < 0.8 ? 'Kuat (Strong)' : 'Sangat Kuat (Very Strong)'}</strong>.</li>
            </ul>
        </div>
    `);
    
    // Step 6: Keputusan
    const badgeClass = isSignificant ? 'badge-danger' : 'badge-success';
    const badgeText = isSignificant ? 'Tolak H0' : 'Gagal Tolak H0';
    html += makeStep("Langkah 6: Keputusan", `
        <span class="report-badge ${badgeClass}">${badgeText}</span><br>
        Karena nilai $T_{hitung} = ${T.toFixed(4)}$ ${isSignificant ? '\\ge' : '<'} \\chi^2_{table} = ${critVal.toFixed(3)}$.
    `);
    
    // Step 7: Kesimpulan
    const kesimpulanText = isSignificant
        ? `Pada taraf signifikansi ${alpha * 100}%, terdapat cukup bukti untuk menolak $H_0$. Artinya, terdapat perbedaan efek perlakuan yang signifikan secara statistik di antara kelompok-kelompok tersebut.<br><br><strong>Jadi,</strong> karena kita menolak $H_0$, terdapat perbedaan efek/peringkat respon yang nyata (signifikan) di antara perlakuan-perlakuan yang diuji.`
        : `Pada taraf signifikansi ${alpha * 100}%, tidak terdapat cukup bukti untuk menolak $H_0$. Artinya, perlakuan-perlakuan tersebut secara statistik dianggap memberikan efek yang sama.<br><br><strong>Jadi,</strong> karena kita gagal menolak $H_0$, secara statistik semua perlakuan dianggap memberikan efek/peringkat respon yang sama (tidak berbeda nyata).`;
        
    html += makeStep("Langkah 7: Kesimpulan", kesimpulanText);
    
    // Post-hoc for Friedman if Significant
    if (isSignificant) {
        html += `<div style="margin-top: 30px; border-top: 2px dashed rgba(255,255,255,0.1); padding-top: 20px;">
            <h3>Uji Lanjut (Post-Hoc Pairwise Comparisons)</h3>
            <p>Untuk membandingkan pasangan perlakuan, kita hitung batas perbedaan kritis (Critical Difference) dengan koreksi Bonferroni.</p>
        </div>`;
        
        const numComparisons = k * (k - 1) / 2;
        const z_val = normalInverse(1 - alpha / numComparisons); // UAS formula: alpha / (k*(k-1)/2)
        
        const SE = Math.sqrt((b * k * (k + 1)) / 6);
        const CD = z_val * SE;
        
        let postHocRows = "";
        const sigPairs = [];
        for (let i = 0; i < k; i++) {
            for (let j = i + 1; j < k; j++) {
                const diff = Math.abs(Rj[i] - Rj[j]);
                const isSigPair = diff >= CD;
                const pairLabel = `Perlakuan ${String.fromCharCode(64 + i + 1)} vs ${String.fromCharCode(64 + j + 1)}`;
                if (isSigPair) {
                    sigPairs.push(pairLabel);
                }
                postHocRows += `
                    <tr>
                        <td><strong>${pairLabel}</strong></td>
                        <td>$|R_{${String.fromCharCode(64 + i + 1)}} - R_{${String.fromCharCode(64 + j + 1)}}| = |${Rj[i].toFixed(1)} - ${Rj[j].toFixed(1)}| = ${diff.toFixed(1)}$</td>
                        <td>${diff >= CD ? '$\\ge$' : '$<$'}</td>
                        <td>${CD.toFixed(3)}</td>
                        <td><span class="report-badge ${isSigPair ? 'badge-danger' : 'badge-success'}">${isSigPair ? 'Berbeda' : 'Sama'}</span></td>
                    </tr>
                `;
            }
        }
        
        let postHocConclusion = "";
        if (sigPairs.length > 0) {
            postHocConclusion = `<p style="margin-top: 15px;"><strong>Jadi,</strong> berdasarkan uji lanjut (post-hoc) dengan batas kritis $CD = ${CD.toFixed(3)}$, terdapat perbedaan efek yang signifikan secara statistik antara pasangan: <strong>${sigPairs.join(', ')}</strong>.</p>`;
        } else {
            postHocConclusion = `<p style="margin-top: 15px;"><strong>Jadi,</strong> berdasarkan uji lanjut (post-hoc) dengan batas kritis $CD = ${CD.toFixed(3)}$, tidak ada pasangan perlakuan yang memiliki perbedaan efek secara signifikan setelah koreksi Bonferroni.</p>`;
        }
        
        html += `
            <div class="glass-box">
                <h5>Batas Perbedaan Kritis (Critical Difference)</h5>
                <p>Formula Batas Kritis:
                $$CD = z_{\\left(1 - \\frac{\\alpha}{k(k-1)/2}\\right)} \\sqrt{\\frac{bk(k+1)}{6}}$$
                $$z_{\\left(1 - \\frac{0.05}{${k}(${k}-1)/2}\\right)} = z_{${(1 - alpha/numComparisons).toFixed(5)}} = ${z_val.toFixed(3)}$$
                $$CD = ${z_val.toFixed(3)} \\times \\sqrt{\\frac{${b} \\times ${k} \\times (${k}+1)}{6}} = ${z_val.toFixed(3)} \\times \\sqrt{${(b*k*(k+1)/6).toFixed(2)}} = ${CD.toFixed(3)}$$
                </p>
                
                <table class="table-calc" style="margin-top: 15px;">
                    <thead>
                        <tr>
                            <th>Pasangan Perlakuan</th>
                            <th>Selisih Rj Absolut</th>
                            <th>Arah</th>
                            <th>Batas Kritis (CD)</th>
                            <th>Keputusan</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${postHocRows}
                    </tbody>
                </table>
                ${postHocConclusion}
            </div>
        `;
    }
    
    const outputSection = document.getElementById('fr-output-section');
    outputSection.querySelector('.calculation-steps').innerHTML = html;
    outputSection.classList.remove('hidden');
    
    renderMathInElement(outputSection, {
        delimiters: [
            {left: '$$', right: '$$', display: true},
            {left: '$', right: '$', display: false}
        ]
    });
}

// ==========================================================================
// 5. DURBIN (BIBD) CALCULATOR LOGIC
// ==========================================================================
let durbinCols = 7;
let durbinRows = 7;

function initDurbinTable() {
    const table = document.getElementById('durbin-table');
    const thead = table.querySelector('thead');
    const tbody = table.querySelector('tbody');
    
    // Create header: t=7 treatments
    let headHtml = '<tr><th>Blok / Responden</th>';
    for (let j = 1; j <= durbinCols; j++) {
        headHtml += `<th>Perlakuan ${String.fromCharCode(64 + j)}</th>`;
    }
    headHtml += '</tr>';
    thead.innerHTML = headHtml;
    
    // Initial data from slide (t=7, b=7, k=3, r=3, lambda=1)
    const initialData = [
        [0.465, 0.343, null, 0.396, null, null, null],
        [0.602, null, 0.873, null, 0.634, null, null],
        [null, null, 0.875, 0.325, null, null, 0.426],
        [0.423, null, null, null, null, 0.987, 0.330],
        [null, 0.652, null, null, 0.409, 0.989, null],
        [null, 0.536, 1.142, null, null, null, 0.309],
        [null, null, null, 0.609, 0.417, 0.931, null]
    ];
    
    tbody.innerHTML = '';
    for (let i = 1; i <= durbinRows; i++) {
        let cellsHtml = `<td><strong>Blok ${i}</strong></td>`;
        for (let j = 1; j <= durbinCols; j++) {
            const val = initialData[i-1][j-1];
            const valStr = (val === null || val === undefined) ? '' : val;
            cellsHtml += `<td><input type="text" class="cell-input durbin-cell" data-row="${i}" data-col="${j}" value="${valStr}" placeholder="-"></td>`;
        }
        const tr = document.createElement('tr');
        tr.innerHTML = cellsHtml;
        tbody.appendChild(tr);
    }
}

function loadDurbinExample1() {
    durbinCols = 7;
    durbinRows = 7;
    initDurbinTable();
}

function loadDurbinExample2() {
    durbinCols = 7;
    durbinRows = 7;
    
    const table = document.getElementById('durbin-table');
    const thead = table.querySelector('thead');
    const tbody = table.querySelector('tbody');
    
    let headHtml = '<tr><th>Pengemudi</th>';
    for (let j = 1; j <= durbinCols; j++) {
        headHtml += `<th>Ban ${String.fromCharCode(64 + j)}</th>`;
    }
    headHtml += '</tr>';
    thead.innerHTML = headHtml;
    
    // Proyek Ban Mobil (t=7, b=7, k=4, r=4, lambda=2)
    // Nilai asli daya tahan ban (satuan: skor/indeks ketahanan)
    // Data dari Proyek SNP — setiap blok hanya 4 ban yang diuji
    // Baris = Pengemudi (blok), Kolom = Jenis Ban (perlakuan)
    // Nilai dalam blok akan di-rank 1-4 otomatis oleh kalkulator
    const exData = [
        [null, null, 12.4, null,  9.1, 15.3, 10.8], // Sopir 1: C, E, F, G
        [8.5,  null, null, 14.2, null, 16.1, 11.7], // Sopir 2: A, D, F, G
        [9.3,  7.6,  null, null, 13.5, null, 17.2], // Sopir 3: A, B, E, G
        [7.1,  9.8,  15.6, null, null, 12.3, null], // Sopir 4: A, B, C, F
        [null, 6.4,  13.7, 11.5, null, null,  8.9], // Sopir 5: B, C, D, G
        [10.2, null, 14.8,  8.3, 12.9, null, null], // Sopir 6: A, C, D, E
        [null, 8.1,  null, 10.5, 13.2, 16.7, null]  // Sopir 7: B, D, E, F
    ];
    
    tbody.innerHTML = '';
    for (let i = 1; i <= durbinRows; i++) {
        let cellsHtml = `<td><strong>Sopir ${i}</strong></td>`;
        for (let j = 1; j <= durbinCols; j++) {
            const val = exData[i-1][j-1];
            const valStr = (val === null || val === undefined) ? '' : val;
            cellsHtml += `<td><input type="text" class="cell-input durbin-cell" data-row="${i}" data-col="${j}" value="${valStr}" placeholder="-"></td>`;
        }
        const tr = document.createElement('tr');
        tr.innerHTML = cellsHtml;
        tbody.appendChild(tr);
    }
}


function addDurbinRow() {
    durbinRows++;
    const tbody = document.querySelector('#durbin-table tbody');
    const tr = document.createElement('tr');
    let cellsHtml = `<td><strong>Blok ${durbinRows}</strong></td>`;
    for (let j = 1; j <= durbinCols; j++) {
        cellsHtml += `<td><input type="text" class="cell-input durbin-cell" data-row="${durbinRows}" data-col="${j}" value="" placeholder="-"></td>`;
    }
    tr.innerHTML = cellsHtml;
    tbody.appendChild(tr);
}

function removeDurbinRow() {
    if (durbinRows <= 3) {
        alert("Butuh minimal 3 baris!");
        return;
    }
    const tbody = document.querySelector('#durbin-table tbody');
    tbody.lastElementChild.remove();
    durbinRows--;
}

function addDurbinCol() {
    if (durbinCols >= 10) {
        alert("Maksimal 10 kolom!");
        return;
    }
    durbinCols++;
    const thead = document.querySelector('#durbin-table thead tr');
    thead.innerHTML += `<th>Perlakuan ${String.fromCharCode(64 + durbinCols)}</th>`;
    
    const rows = document.querySelectorAll('#durbin-table tbody tr');
    rows.forEach((row, i) => {
        const td = document.createElement('td');
        td.innerHTML = `<input type="text" class="cell-input durbin-cell" data-row="${i+1}" data-col="${durbinCols}" value="" placeholder="-">`;
        row.appendChild(td);
    });
}

function removeDurbinCol() {
    if (durbinCols <= 3) {
        alert("Butuh minimal 3 perlakuan!");
        return;
    }
    const thead = document.querySelector('#durbin-table thead tr');
    thead.lastElementChild.remove();
    
    const rows = document.querySelectorAll('#durbin-table tbody tr');
    rows.forEach(row => {
        row.lastElementChild.remove();
    });
    durbinCols--;
}

function calculateDurbin() {
    const inputs = document.querySelectorAll('.durbin-cell');
    const alpha = parseFloat(document.getElementById('du-alpha').value);
    
    // Parse grid
    const matrix = Array(durbinRows).fill(0).map(() => Array(durbinCols).fill(null));
    let hasInvalid = false;
    
    inputs.forEach(inp => {
        const r = parseInt(inp.getAttribute('data-row')) - 1;
        const c = parseInt(inp.getAttribute('data-col')) - 1;
        const valStr = inp.value.trim();
        if (valStr !== "") {
            const val = parseFloat(valStr);
            if (isNaN(val)) {
                hasInvalid = true;
                inp.classList.add('error-border');
            } else {
                inp.classList.remove('error-border');
                matrix[r][c] = val;
            }
        } else {
            inp.classList.remove('error-border');
            matrix[r][c] = null;
        }
    });
    
    if (hasInvalid) {
        alert("Semua input Durbin yang terisi harus berupa angka valid!");
        return;
    }
    
    const t = durbinCols;
    const b = durbinRows;
    
    // Verify BIBD properties and calculate k, r, lambda
    // Check block sizes (k)
    const k_list = [];
    for (let i = 0; i < b; i++) {
        let count = 0;
        for (let j = 0; j < t; j++) {
            if (matrix[i][j] !== null) count++;
        }
        k_list.push(count);
    }
    
    // Are block sizes equal?
    const k = k_list[0];
    const equal_k = k_list.every(x => x === k);
    if (!equal_k) {
        alert("Desain tidak lengkap tidak seimbang! Setiap blok (baris) harus berisi jumlah perlakuan terisi yang sama (k konstan).");
        return;
    }
    
    // Check treatment replications (r)
    const r_list = [];
    for (let j = 0; j < t; j++) {
        let count = 0;
        for (let i = 0; i < b; i++) {
            if (matrix[i][j] !== null) count++;
        }
        r_list.push(count);
    }
    
    const r = r_list[0];
    const equal_r = r_list.every(x => x === r);
    if (!equal_r) {
        alert("Desain tidak lengkap tidak seimbang! Setiap perlakuan (kolom) harus muncul dalam jumlah blok yang sama (r konstan).");
        return;
    }
    
    // Check lambda
    const lambda_matrix = Array(t).fill(0).map(() => Array(t).fill(0));
    for (let j1 = 0; j1 < t; j1++) {
        for (let j2 = 0; j2 < t; j2++) {
            if (j1 === j2) continue;
            let count = 0;
            for (let i = 0; i < b; i++) {
                if (matrix[i][j1] !== null && matrix[i][j2] !== null) {
                    count++;
                }
            }
            lambda_matrix[j1][j2] = count;
        }
    }
    
    const lambda = r * (k - 1) / (t - 1);
    const lambda_rounded = Math.round(lambda * 1000) / 1000; // round to 3 decimal places for float safety
    let equal_lambda = true;
    for (let j1 = 0; j1 < t; j1++) {
        for (let j2 = j1+1; j2 < t; j2++) {
            if (Math.abs(lambda_matrix[j1][j2] - lambda_rounded) > 0.5) {
                equal_lambda = false;
            }
        }
    }
    
    const isImperfectBIBD = !equal_lambda;
    
    // BIBD parameters verification
    const kb_check = k * b;
    const rt_check = r * t;
    if (kb_check !== rt_check) {
        alert(`BIBD parameter error: kb = ${kb_check} tidak sama dengan rt = ${rt_check}!`);
        return;
    }
    
    // Rank within each block (only non-null elements)
    const rankedMatrix = Array(b).fill(0).map(() => Array(t).fill(null));
    for (let i = 0; i < b; i++) {
        const rowData = [];
        for (let j = 0; j < t; j++) {
            if (matrix[i][j] !== null) {
                rowData.push({ colIndex: j, val: matrix[i][j] });
            }
        }
        // Sort non-empty
        const sorted = rowData.slice().sort((x, y) => x.val - y.val);
        
        let j = 0;
        while (j < k) {
            let m = j + 1;
            while (m < k && sorted[m].val === sorted[j].val) {
                m++;
            }
            const sumR = ((j + 1) + m) * (m - j) / 2;
            const avgR = sumR / (m - j);
            for (let idx = j; idx < m; idx++) {
                rankedMatrix[i][sorted[idx].colIndex] = avgR;
            }
            j = m;
        }
    }
    
    // Sum ranks for each treatment Rj
    const Rj = Array(t).fill(0);
    for (let j = 0; j < t; j++) {
        let sum = 0;
        for (let i = 0; i < b; i++) {
            if (rankedMatrix[i][j] !== null) {
                sum += rankedMatrix[i][j];
            }
        }
        Rj[j] = sum;
    }
    
    const expected_Rj = r * (k + 1) / 2;
    const sum_dev_sq = Rj.reduce((acc, r_val) => acc + Math.pow(r_val - expected_Rj, 2), 0);
    
    // Durbin statistic T
    const multiplier = (12 * (t - 1)) / (r * t * (k - 1) * (k + 1));
    const T_stat = multiplier * sum_dev_sq;
    
    const df = t - 1;
    const critVal = getChiSquareCriticalValue(df, alpha);
    const isSignificant = T_stat >= critVal;
    
    let html = "";
    
    // Step 1: Hipotesis
    html += makeStep("Langkah 1: Rumusan Hipotesis", `
        $H_0$: Semua perlakuan memiliki efek yang sama (lokasi median perlakuan sama)<br>
        $H_1$: Setidaknya ada satu perlakuan yang memiliki efek berbeda.
    `);
    
    // Step 2: Taraf Signifikansi
    html += makeStep("Langkah 2: Taraf Signifikansi", `
        $\\alpha = ${alpha * 100}\\%$
    `);
    
    // Step 3: Statistik Uji
    html += makeStep("Langkah 3: Statistik Uji & Rumus", `
        Menggunakan Uji Durbin (BIBD):<br>
        $$T = \\frac{12(t-1)}{rt(k-1)(k+1)} \\sum_{j=1}^t \\left[ R_j - \\frac{r(k+1)}{2} \\right]^2$$
    `);
    
    // Step 4: Kriteria Uji
    html += makeStep("Langkah 4: Kriteria Keputusan", `
        Tolak $H_0$ jika $T \\ge \\chi^2_{(1-\\alpha, \\text{df}=${df})} = ${critVal.toFixed(3)}$
    `);
    
    // Step 5: Pengolahan Data
    let gridRowsHtml = "";
    for (let i = 0; i < b; i++) {
        let colsOriginalHtml = "";
        let colsRanksHtml = "";
        for (let j = 0; j < t; j++) {
            const v = matrix[i][j];
            const r = rankedMatrix[i][j];
            colsOriginalHtml += `<td>${v === null ? '-' : v}</td>`;
            colsRanksHtml += `<td><strong>${r === null ? '-' : r.toFixed(1)}</strong></td>`;
        }
        gridRowsHtml += `
            <tr>
                <td><strong>Blok ${i+1}</strong></td>
                ${colsOriginalHtml}
                <td style="border-left: 2px solid var(--border-glass);"></td>
                ${colsRanksHtml}
            </tr>
        `;
    }
    // Generate pair co-occurrence list
    let coOccurrenceDetails = "";
    for (let j1 = 0; j1 < t; j1++) {
        for (let j2 = j1 + 1; j2 < t; j2++) {
            const blocksWithBoth = [];
            for (let i = 0; i < b; i++) {
                if (matrix[i][j1] !== null && matrix[i][j2] !== null) {
                    blocksWithBoth.push(`Blok ${i + 1}`);
                }
            }
            const label1 = String.fromCharCode(65 + j1);
            const label2 = String.fromCharCode(65 + j2);
            coOccurrenceDetails += `<li>Pasangan <strong>P_${label1}</strong> & <strong>P_${label2}</strong> muncul bersama di: ${blocksWithBoth.join(', ')} (Total: ${blocksWithBoth.length} kali)</li>`;
        }
    }

    html += makeStep("Langkah 5: Pengolahan Data", `
        <strong>Verifikasi Parameter Desain:</strong><br>
        - Jumlah Perlakuan ($t$) = ${t}<br>
        - Jumlah Blok ($b$) = ${b}<br>
        - Ukuran Blok ($k$) = ${k}<br>
        - Replikasi Perlakuan ($r$) = ${r}<br>
        - Replikasi Pasangan ($\\lambda$) = ${lambda}<br>
        Hubungan parameter: $kb = rt \\implies ${k} \\times ${b} = ${r} \\times ${t} = ${k*b}$ (Terpenuhi)<br>
        $\\lambda(t-1) = r(k-1) \\implies ${lambda} \\times ${t-1} = ${r} \\times ${k-1} = ${lambda*(t-1)}$ (Terpenuhi)
        <br>
        <div class="glass-box" style="margin-top: 15px; border-left: 4px solid var(--accent-red); background: rgba(239, 68, 68, 0.02); padding: 15px;">
            <h5 style="color: var(--accent-red); font-size: 1rem; margin-bottom: 8px;">💡 Arti dari Lambda ($\\lambda = ${lambda.toFixed(2)}$):</h5>
            ${isImperfectBIBD ? `
            <p style="margin-bottom: 10px; color: var(--accent-yellow); font-weight: bold;">⚠️ Peringatan Desain Tidak Sempurna (Imperfect BIBD):</p>
            <p style="margin-bottom: 10px;">Secara teoritis, rancangan seimbang ini membutuhkan $\\lambda = ${lambda.toFixed(0)}$. Namun, data input memiliki ketidakseimbangan empiris (beberapa pasangan perlakuan muncul bersama sebanyak 0 atau 2 kali). Ini terjadi karena adanya <em>typo</em> penyusunan tabel di modul perkuliahan asli Anda. Perhitungan tetap dilanjutkan menggunakan rumus standar Durbin agar hasilnya sama dengan modul perkuliahan Anda.</p>
            ` : `
            <p style="margin-bottom: 10px;">Nilai $\\lambda = ${lambda}$ berarti <strong>setiap pasangan perlakuan muncul bersama-sama dalam blok yang sama sebanyak tepat ${lambda} kali</strong> untuk diuji bersama. Hal ini menjamin bahwa seluruh perlakuan dibandingkan secara adil dan seimbang (Balanced).</p>
            `}
            <details style="margin-top: 10px; cursor: pointer;">
                <summary style="font-weight: 700; color: var(--accent-indigo);">🔍 Klik untuk melihat pembuktian kemunculan semua pasangan perlakuan</summary>
                <ul style="margin-top: 8px; padding-left: 20px; font-size: 0.85rem; list-style-type: disc; max-height: 200px; overflow-y: auto;">
                    ${coOccurrenceDetails}
                </ul>
            </details>
        </div>
        <br>
        <strong>Tabel Peringkat Blok:</strong><br>
        <table class="table-calc">
            <thead>
                <tr>
                    <th rowspan="2">Blok</th>
                    <th colspan="${t}" style="text-align: center; border-bottom: 1px solid var(--border-glass);">Data Asli</th>
                    <th style="border-left: 2px solid var(--border-glass);"></th>
                    <th colspan="${t}" style="text-align: center; border-bottom: 1px solid var(--border-glass);">Peringkat (Ranks)</th>
                </tr>
                <tr>
                    ${Array(t).fill(0).map((_, idx) => `<th>P${String.fromCharCode(64 + idx + 1)}</th>`).join('')}
                    <th style="border-left: 2px solid var(--border-glass);"></th>
                    ${Array(t).fill(0).map((_, idx) => `<th>R_${String.fromCharCode(64 + idx + 1)}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
                ${gridRowsHtml}
                <tr style="background: rgba(99, 102, 241, 0.1); border-top: 2px solid var(--accent-indigo);">
                    <td><strong>Jumlah Rj</strong></td>
                    ${Array(t).fill(0).map(() => `<td>-</td>`).join('')}
                    <td style="border-left: 2px solid var(--border-glass);"></td>
                    ${Rj.map(r => `<td><strong>${r.toFixed(1)}</strong></td>`).join('')}
                </tr>
                <tr>
                    <td><strong>(Rj - ${expected_Rj.toFixed(1)})^2</strong></td>
                    ${Array(t).fill(0).map(() => `<td>-</td>`).join('')}
                    <td style="border-left: 2px solid var(--border-glass);"></td>
                    ${Rj.map(r => `<td>${Math.pow(r - expected_Rj, 2).toFixed(2)}</td>`).join('')}
                </tr>
            </tbody>
        </table>
        <br>
        Rata-rata peringkat teoritis = $\\frac{r(k+1)}{2} = \\frac{${r}(${k}+1)}{2} = ${expected_Rj.toFixed(1)}$<br>
        Jumlah kuadrat deviasi $\\sum [R_j - \\text{expected}]^2 = ${sum_dev_sq.toFixed(2)}$<br>
        <br>
        Masukkan nilai ke rumus Durbin $T$:<br>
        $$T = \\frac{12(${t}-1)}{${r} \\times ${t} \\times (${k}-1) \\times (${k}+1)} \\sum \\left[ R_j - ${expected_Rj.toFixed(1)} \\right]^2$$
        $$T = \\frac{12 \\times ${t-1}}{${r * t * (k-1) * (k+1)}} \\times ${sum_dev_sq.toFixed(2)}$$
        $$T = ${multiplier.toFixed(6)} \\times ${sum_dev_sq.toFixed(2)} = ${T_stat.toFixed(4)}$$
    `);
    
    // Step 6: Keputusan
    const badgeClass = isSignificant ? 'badge-danger' : 'badge-success';
    const badgeText = isSignificant ? 'Tolak H0' : 'Gagal Tolak H0';
    html += makeStep("Langkah 6: Keputusan", `
        <span class="report-badge ${badgeClass}">${badgeText}</span><br>
        Karena nilai $T_{hitung} = ${T_stat.toFixed(4)}$ ${isSignificant ? '\\ge' : '<'} \\chi^2_{table} = ${critVal.toFixed(3)}$.
    `);
    
    // Step 7: Kesimpulan
    const kesimpulanText = isSignificant
        ? `Pada taraf signifikansi ${alpha * 100}%, terdapat cukup bukti untuk menolak $H_0$. Artinya, terdapat perbedaan efek perlakuan yang signifikan secara statistik (misal: kualitas ban atau keampuhan bahan kimia berbeda nyata).<br><br><strong>Jadi,</strong> karena kita menolak $H_0$, terdapat perbedaan efek/peringkat respon yang nyata (signifikan) di antara perlakuan-perlakuan BIBD yang diuji.`
        : `Pada taraf signifikansi ${alpha * 100}%, tidak terdapat cukup bukti untuk menolak $H_0$. Artinya, secara statistik semua perlakuan dianggap memberikan efek yang sama.<br><br><strong>Jadi,</strong> karena kita gagal menolak $H_0$, secara statistik semua perlakuan dianggap memberikan efek/peringkat respon yang sama (tidak berbeda nyata).`;
        
    html += makeStep("Langkah 7: Kesimpulan", kesimpulanText);
    
    const outputSection = document.getElementById('du-output-section');
    outputSection.querySelector('.calculation-steps').innerHTML = html;
    outputSection.classList.remove('hidden');
    
    renderMathInElement(outputSection, {
        delimiters: [
            {left: '$$', right: '$$', display: true},
            {left: '$', right: '$', display: false}
        ]
    });
}

// ==========================================================================
// 6. KOLMOGOROV-SMIRNOV & CRAMER-VON MISES CALCULATOR LOGIC
// ==========================================================================
function toggleDistParams() {
    const distType = document.getElementById('kc-dist').value;
    const container = document.getElementById('normal-params-container');
    if (distType === 'normal-known') {
        container.classList.remove('hidden');
    } else {
        container.classList.add('hidden');
    }
}

function loadKSExample1() {
    document.getElementById('kc-data').value = "0.44, 0.81, 0.14, 0.05, 0.93";
    document.getElementById('kc-dist').value = "uniform";
    toggleDistParams();
}

function loadKSExample2() {
    document.getElementById('kc-data').value = "7, 5, 2, 4, 7, 8, 3, 8, 6, 2";
    document.getElementById('kc-dist').value = "normal-lilliefors";
    toggleDistParams();
}

// Special critical values table for Lilliefors (Normalitas, n: 4-30)
// Source: Lilliefors (1967), Conover (1999)
const lillieforsCritTable = {
    // alpha: 0.10, 0.05, 0.01
    4:  { 0.10: 0.352, 0.05: 0.381, 0.01: 0.417 },
    5:  { 0.10: 0.315, 0.05: 0.337, 0.01: 0.405 },
    6:  { 0.10: 0.294, 0.05: 0.319, 0.01: 0.364 },
    7:  { 0.10: 0.276, 0.05: 0.300, 0.01: 0.348 },
    8:  { 0.10: 0.261, 0.05: 0.285, 0.01: 0.331 },
    9:  { 0.10: 0.249, 0.05: 0.271, 0.01: 0.311 },
    10: { 0.10: 0.239, 0.05: 0.258, 0.01: 0.294 },
    11: { 0.10: 0.230, 0.05: 0.249, 0.01: 0.284 },
    12: { 0.10: 0.223, 0.05: 0.242, 0.01: 0.275 },
    13: { 0.10: 0.214, 0.05: 0.234, 0.01: 0.268 },
    14: { 0.10: 0.207, 0.05: 0.227, 0.01: 0.261 },
    15: { 0.10: 0.201, 0.05: 0.220, 0.01: 0.257 },
    16: { 0.10: 0.195, 0.05: 0.213, 0.01: 0.250 },
    17: { 0.10: 0.189, 0.05: 0.206, 0.01: 0.245 },
    18: { 0.10: 0.184, 0.05: 0.200, 0.01: 0.239 },
    19: { 0.10: 0.179, 0.05: 0.195, 0.01: 0.235 },
    20: { 0.10: 0.174, 0.05: 0.190, 0.01: 0.231 },
    25: { 0.10: 0.158, 0.05: 0.173, 0.01: 0.200 },
    30: { 0.10: 0.144, 0.05: 0.161, 0.01: 0.187 }
};

function getLillieforsCriticalValue(n, alpha) {
    const alphaKey = parseFloat(alpha);
    if (n <= 30) {
        if (lillieforsCritTable[n] && lillieforsCritTable[n][alphaKey] !== undefined) {
            return lillieforsCritTable[n][alphaKey];
        }
        // Linear interpolation if n not exact
        let keys = Object.keys(lillieforsCritTable).map(Number).sort((a, b) => a - b);
        for (let i = 0; i < keys.length - 1; i++) {
            if (n > keys[i] && n < keys[i + 1]) {
                const k1 = keys[i];
                const k2 = keys[i + 1];
                const v1 = lillieforsCritTable[k1][alphaKey] || lillieforsCritTable[k1][0.05];
                const v2 = lillieforsCritTable[k2][alphaKey] || lillieforsCritTable[k2][0.05];
                return v1 + (v2 - v1) * (n - k1) / (k2 - k1);
            }
        }
        return lillieforsCritTable[30][alphaKey] || 0.161; // fallback
    }
    // For n > 30: approximation varies by alpha
    if (alphaKey === 0.01) return 1.031 / Math.sqrt(n);
    if (alphaKey === 0.10) return 0.819 / Math.sqrt(n);
    return 0.886 / Math.sqrt(n); // default alpha = 0.05
}

// General Kolmogorov critical value lookup (two-sided)
// Source: Conover (1999), Massey (1951)
function getKSCriticalValue(n, alpha) {
    // Standard table values for two-sided KS test
    const ksTables = {
        0.10: {
            1: 0.950, 2: 0.776, 3: 0.642, 4: 0.564, 5: 0.510, 6: 0.470, 7: 0.438, 8: 0.411, 9: 0.388, 10: 0.368,
            11: 0.352, 12: 0.338, 13: 0.325, 14: 0.314, 15: 0.304, 16: 0.295, 17: 0.286, 18: 0.278, 19: 0.272, 20: 0.264,
            21: 0.259, 22: 0.253, 23: 0.247, 24: 0.242, 25: 0.238, 26: 0.233, 27: 0.229, 28: 0.225, 29: 0.221, 30: 0.218
        },
        0.05: {
            1: 0.975, 2: 0.842, 3: 0.708, 4: 0.624, 5: 0.563, 6: 0.519, 7: 0.483, 8: 0.454, 9: 0.430, 10: 0.409,
            11: 0.391, 12: 0.375, 13: 0.361, 14: 0.349, 15: 0.338, 16: 0.327, 17: 0.318, 18: 0.309, 19: 0.301, 20: 0.294,
            21: 0.287, 22: 0.281, 23: 0.275, 24: 0.269, 25: 0.264, 26: 0.259, 27: 0.253, 28: 0.247, 29: 0.242, 30: 0.238
        },
        0.01: {
            1: 0.995, 2: 0.929, 3: 0.828, 4: 0.733, 5: 0.669, 6: 0.618, 7: 0.577, 8: 0.543, 9: 0.514, 10: 0.489,
            11: 0.468, 12: 0.450, 13: 0.433, 14: 0.418, 15: 0.404, 16: 0.392, 17: 0.381, 18: 0.371, 19: 0.363, 20: 0.356,
            21: 0.349, 22: 0.342, 23: 0.337, 24: 0.331, 25: 0.325, 26: 0.320, 27: 0.314, 28: 0.309, 29: 0.305, 30: 0.301
        }
    };
    const alphaKey = parseFloat(alpha);
    const table = ksTables[alphaKey] || ksTables[0.05];
    if (n <= 30) return table[n] || table[30];
    // Large sample approximation
    if (alphaKey === 0.01) return 1.63 / Math.sqrt(n);
    if (alphaKey === 0.10) return 1.22 / Math.sqrt(n);
    return 1.36 / Math.sqrt(n); // alpha = 0.05
}

// Cramer-von Mises critical value lookup (alpha=0.05)
function getCvMCriticalValue(alpha) {
    const cvmTable = { 0.10: 0.347, 0.05: 0.461, 0.01: 0.743 };
    return cvmTable[alpha] || 0.461;
}

function calculateGoodnessOfFit() {
    const inputVal = document.getElementById('kc-data').value;
    const distType = document.getElementById('kc-dist').value;
    const alpha = parseFloat(document.getElementById('kc-alpha').value);
    
    const parsed = inputVal.split(',')
                           .map(x => x.trim())
                           .filter(x => x !== "")
                           .map(Number);
                           
    if (parsed.some(isNaN) || parsed.length === 0) {
        alert("Masukkan data numerik yang valid dipisahkan dengan koma!");
        return;
    }
    
    const n = parsed.length;
    
    // Sort data
    const sorted = parsed.slice().sort((a, b) => a - b);
    
    // Parameters estimation or definition
    let mean = 0;
    let sd = 1;
    let distLabel = "";
    
    if (distType === 'uniform') {
        distLabel = "Uniform (0, 1)";
    } else if (distType === 'normal-lilliefors') {
        // Estimate from sample
        mean = sorted.reduce((a, b) => a + b, 0) / n;
        const sqDevSum = sorted.reduce((acc, x) => acc + Math.pow(x - mean, 2), 0);
        sd = Math.sqrt(sqDevSum / (n - 1));
        distLabel = `Normal dengan parameter diduga (Lilliefors Uji): Mean = ${mean.toFixed(3)}, SD = ${sd.toFixed(3)}`;
    } else if (distType === 'normal-known') {
        mean = parseFloat(document.getElementById('normal-mean').value);
        sd = parseFloat(document.getElementById('normal-sd').value);
        if (isNaN(mean) || isNaN(sd) || sd <= 0) {
            alert("Masukkan nilai Mean dan SD yang valid!");
            return;
        }
        distLabel = `Normal (Mean = ${mean}, SD = ${sd})`;
    }
    
    // Table calculation
    const rows = [];
    let D_max = 0;
    let D_max_i = 0;
    let D_max_type = ""; // "+" or "-"
    let cvm_sum = 0;
    
    for (let i = 0; i < n; i++) {
        const x_val = sorted[i];
        
        // Theoretical CDF F*(x)
        let F_star = 0;
        if (distType === 'uniform') {
            F_star = x_val; // For Uniform on (0, 1)
            if (F_star < 0) F_star = 0;
            if (F_star > 1) F_star = 1;
        } else {
            // Normal CDF
            const z = (x_val - mean) / sd;
            F_star = normalCDF(z);
        }
        
        const S_x = (i + 1) / n;
        const S_x_minus = i / n;
        
        const D_plus = S_x - F_star;
        const D_minus = F_star - S_x_minus;
        
        const D_plus_abs = Math.abs(D_plus);
        const D_minus_abs = Math.abs(D_minus);
        
        if (D_plus_abs > D_max) {
            D_max = D_plus_abs;
            D_max_i = i + 1;
            D_max_type = "+";
        }
        
        if (D_minus_abs > D_max) {
            D_max = D_minus_abs;
            D_max_i = i + 1;
            D_max_type = "-";
        }
        
        // CvM term: (F*(x_i) - (2i-1)/2n)^2
        const cvm_term_val = (2 * (i + 1) - 1) / (2 * n);
        const cvm_term = Math.pow(F_star - cvm_term_val, 2);
        cvm_sum += cvm_term;
        
        rows.push({
            i: i + 1,
            x: x_val,
            F_star: F_star,
            S_x: S_x,
            S_x_minus: S_x_minus,
            D_plus: D_plus,
            D_minus: D_minus,
            cvm_term_val: cvm_term_val,
            cvm_term: cvm_term
        });
    }
    
    // CvM statistic
    const T_cvm = 1 / (12 * n) + cvm_sum;
    
    // Critical Values
    let ks_crit = 0;
    let is_lilliefors = (distType === 'normal-lilliefors');
    
    if (is_lilliefors) {
        ks_crit = getLillieforsCriticalValue(n, alpha);
    } else {
        ks_crit = getKSCriticalValue(n, alpha);
    }
    
    const cvm_crit = getCvMCriticalValue(alpha);
    
    const ks_rejected = D_max >= ks_crit;
    const cvm_rejected = T_cvm >= cvm_crit;
    
    // HTML Output Generation
    let html = "";
    
    // Step 1: Hipotesis
    html += makeStep("Langkah 1: Rumusan Hipotesis", `
        $H_0: F(x) = F^*(x)$ (Data sampel berdistribusi ${distType === 'uniform' ? 'Seragam (0,1)' : 'Normal'})<br>
        $H_1: F(x) \\neq F^*(x)$ (Data sampel tidak berdistribusi ${distType === 'uniform' ? 'Seragam (0,1)' : 'Normal'})
    `);
    
    // Step 2: Taraf Signifikansi
    html += makeStep("Langkah 2: Taraf Signifikansi", `
        $\\alpha = ${alpha * 100}\\%$
    `);
    
    // Step 3: Statistik Uji & Rumus
    html += makeStep("Langkah 3: Statistik Uji", `
        <strong>1. Uji Kolmogorov-Smirnov:</strong>
        $$D = \\max_{1 \\le i \\le n} \\left[ \\max \\left( \\frac{i}{n} - F^*(x_{(i)}), F^*(x_{(i)}) - \\frac{i-1}{n} \\right) \\right]$$
        <br>
        <strong>2. Uji Cramér-von Mises:</strong>
        $$T = \\frac{1}{12n} + \\sum_{i=1}^n \\left[ F^*(x_{(i)}) - \\frac{2i-1}{2n} \\right]^2$$
    `);
    
    // Step 4: Daerah Kritis
    html += makeStep("Langkah 4: Daerah Kritis / Kriteria Uji", `
        - <strong>Kolmogorov-Smirnov ${is_lilliefors ? '(Lilliefors)' : ''}:</strong> Tolak $H_0$ jika $D \\ge D_{crit} = ${ks_crit.toFixed(3)}$<br>
        - <strong>Cramér-von Mises:</strong> Tolak $H_0$ jika $T \\ge T_{crit} = ${cvm_crit.toFixed(3)}$
    `);
    
    // Step 5: Pengolahan Data Table
    let tableRowsHtml = "";
    rows.forEach(r => {
        const isMaxRow = r.i === D_max_i;
        const rowStyle = isMaxRow ? `style="background: rgba(239, 68, 68, 0.08);"` : "";
        tableRowsHtml += `
            <tr ${rowStyle}>
                <td>${r.i}</td>
                <td>${r.x.toFixed(3)}</td>
                <td>${r.F_star.toFixed(4)}</td>
                <td>${r.S_x.toFixed(3)}</td>
                <td>${r.S_x_minus.toFixed(3)}</td>
                <td>${r.D_plus.toFixed(4)}</td>
                <td>${r.D_minus.toFixed(4)}</td>
                <td>${r.cvm_term_val.toFixed(4)}</td>
                <td>${r.cvm_term.toFixed(6)}</td>
            </tr>
        `;
    });
    
    html += makeStep("Langkah 5: Pengolahan Data", `
        Distribusi Hipotesis: <strong>${distLabel}</strong><br><br>
        <table class="table-calc" style="font-size: 0.8rem;">
            <thead>
                <tr>
                    <th>i</th>
                    <th>x(i)</th>
                    <th>F*(x(i))</th>
                    <th>i/n</th>
                    <th>(i-1)/n</th>
                    <th>D_i(+)</th>
                    <th>D_i(-)</th>
                    <th>(2i-1)/2n</th>
                    <th>CvM Term</th>
                </tr>
            </thead>
            <tbody>
                ${tableRowsHtml}
            </tbody>
        </table>
        <br>
        <strong>Perhitungan Kolmogorov-Smirnov:</strong><br>
        Nilai maksimum absolute deviasi $D$ berada pada data ke-<strong>${D_max_i}</strong> ($x = ${sorted[D_max_i-1]}$) yaitu:
        $$D = ${D_max.toFixed(4)}$$
        <br>
        <strong>Perhitungan Cramér-von Mises:</strong><br>
        $$\\sum \\left[ F^*(x_{(i)}) - \\frac{2i-1}{2n} \\right]^2 = ${cvm_sum.toFixed(6)}$$
        $$T = \\frac{1}{12 \\times ${n}} + ${cvm_sum.toFixed(6)}$$
        $$T = ${ (1/(12*n)).toFixed(6) } + ${cvm_sum.toFixed(6)} = ${T_cvm.toFixed(4)}$$
    `);
    
    // Step 6: Keputusan
    const badgeKS = ks_rejected ? 'badge-danger' : 'badge-success';
    const textKS = ks_rejected ? 'Tolak H0' : 'Gagal Tolak H0';
    const badgeCvM = cvm_rejected ? 'badge-danger' : 'badge-success';
    const textCvM = cvm_rejected ? 'Tolak H0' : 'Gagal Tolak H0';
    
    html += makeStep("Langkah 6: Keputusan Uji", `
        - <strong>Kolmogorov-Smirnov ${is_lilliefors ? '(Lilliefors)' : ''}:</strong> 
          <span class="report-badge ${badgeKS}">${textKS}</span> karena $D_{hitung} = ${D_max.toFixed(4)}$ ${ks_rejected ? '\\ge' : '<'} D_{crit} = ${ks_crit.toFixed(3)}$<br>
        - <strong>Cramér-von Mises:</strong> 
          <span class="report-badge ${badgeCvM}">${textCvM}</span> karena $T_{hitung} = ${T_cvm.toFixed(4)}$ ${cvm_rejected ? '\\ge' : '<'} T_{crit} = ${cvm_crit.toFixed(3)}$
    `);
    
    // Step 7: Kesimpulan
    const ks_conclusion = ks_rejected
        ? `Berdasarkan uji Kolmogorov-Smirnov, data <strong>TIDAK MENGIKUTI</strong> distribusi teoritis ${distLabel} (terdapat perbedaan signifikan).<br><strong>Jadi,</strong> karena uji KS menolak $H_0$, disimpulkan bahwa data secara signifikan tidak mengikuti distribusi teoritis.`
        : `Berdasarkan uji Kolmogorov-Smirnov, data <strong>MENGIKUTI</strong> distribusi teoritis ${distLabel} (tidak terdapat perbedaan signifikan).<br><strong>Jadi,</strong> karena uji KS gagal menolak $H_0$, disimpulkan bahwa data secara statistik mengikuti distribusi teoritis.`;
        
    const cvm_conclusion = cvm_rejected
        ? `Berdasarkan uji Cramér-von Mises, data <strong>TIDAK MENGIKUTI</strong> distribusi teoritis ${distLabel}.<br><strong>Jadi,</strong> karena uji CvM menolak $H_0$, disimpulkan bahwa data secara signifikan tidak mengikuti distribusi teoritis.`
        : `Berdasarkan uji Cramér-von Mises, data <strong>MENGIKUTI</strong> distribusi teoritis ${distLabel}.<br><strong>Jadi,</strong> karena uji CvM gagal menolak $H_0$, disimpulkan bahwa data secara statistik mengikuti distribusi teoritis.`;
        
    html += makeStep("Langkah 7: Kesimpulan Akhir", `
        ${ks_conclusion}<br><br>
        ${cvm_conclusion}
    `);
    
    const outputSection = document.getElementById('kc-output-section');
    outputSection.querySelector('.calculation-steps').innerHTML = html;
    outputSection.classList.remove('hidden');
    
    // Draw ECDF SVG Plot
    drawECDFPlot(sorted, mean, sd, distType);
    
    renderMathInElement(outputSection, {
        delimiters: [
            {left: '$$', right: '$$', display: true},
            {left: '$', right: '$', display: false}
        ]
    });
}

function drawECDFPlot(sortedData, mean, sd, distType) {
    const container = document.getElementById('ecdf-plot-container');
    container.innerHTML = ""; // Clear
    
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 400 300");
    svg.setAttribute("class", "ecdf-svg");
    
    const width = 400;
    const height = 300;
    const padding = 40;
    
    // Min/Max of data for axis scaling
    const minX = sortedData[0];
    const maxX = sortedData[sortedData.length - 1];
    const rangeX = maxX - minX || 1.0;
    
    const xMinLimit = minX - rangeX * 0.15;
    const xMaxLimit = maxX + rangeX * 0.15;
    const xScale = (x) => padding + ((x - xMinLimit) / (xMaxLimit - xMinLimit)) * (width - 2 * padding);
    const yScale = (y) => height - padding - (y * (height - 2 * padding));
    
    // Draw Grid & Axes
    // X Axis
    const xAxis = document.createElementNS(svgNS, "line");
    xAxis.setAttribute("x1", padding);
    xAxis.setAttribute("y1", height - padding);
    xAxis.setAttribute("x2", width - padding);
    xAxis.setAttribute("y2", height - padding);
    xAxis.setAttribute("class", "plot-axis");
    svg.appendChild(xAxis);
    
    // Y Axis
    const yAxis = document.createElementNS(svgNS, "line");
    yAxis.setAttribute("x1", padding);
    yAxis.setAttribute("y1", padding);
    yAxis.setAttribute("x2", padding);
    yAxis.setAttribute("y2", height - padding);
    yAxis.setAttribute("class", "plot-axis");
    svg.appendChild(yAxis);
    
    // Grid Lines & Labels
    for (let yVal = 0.0; yVal <= 1.0; yVal += 0.2) {
        const y = yScale(yVal);
        const grid = document.createElementNS(svgNS, "line");
        grid.setAttribute("x1", padding);
        grid.setAttribute("y1", y);
        grid.setAttribute("x2", width - padding);
        grid.setAttribute("y2", y);
        grid.setAttribute("class", "plot-grid");
        svg.appendChild(grid);
        
        const label = document.createElementNS(svgNS, "text");
        label.setAttribute("x", padding - 10);
        label.setAttribute("y", y + 4);
        label.setAttribute("text-anchor", "end");
        label.setAttribute("class", "plot-label");
        label.textContent = yVal.toFixed(1);
        svg.appendChild(label);
    }
    
    // X axis ticks
    const xTicks = 5;
    for (let i = 0; i < xTicks; i++) {
        const xVal = xMinLimit + (i / (xTicks - 1)) * (xMaxLimit - xMinLimit);
        const x = xScale(xVal);
        
        const tick = document.createElementNS(svgNS, "line");
        tick.setAttribute("x1", x);
        tick.setAttribute("y1", height - padding);
        tick.setAttribute("x2", x);
        tick.setAttribute("y2", height - padding + 5);
        tick.setAttribute("class", "plot-axis");
        svg.appendChild(tick);
        
        const label = document.createElementNS(svgNS, "text");
        label.setAttribute("x", x);
        label.setAttribute("y", height - padding + 18);
        label.setAttribute("text-anchor", "middle");
        label.setAttribute("class", "plot-label");
        label.textContent = xVal.toFixed(2);
        svg.appendChild(label);
    }
    
    // 1. Draw Theoretical CDF Curve
    let theoryPath = "";
    const steps = 100;
    for (let i = 0; i <= steps; i++) {
        const xVal = xMinLimit + (i / steps) * (xMaxLimit - xMinLimit);
        let F_star = 0;
        if (distType === 'uniform') {
            F_star = xVal;
            if (F_star < 0) F_star = 0;
            if (F_star > 1) F_star = 1;
        } else {
            const z = (xVal - mean) / sd;
            F_star = normalCDF(z);
        }
        
        const x = xScale(xVal);
        const y = yScale(F_star);
        
        if (i === 0) {
            theoryPath += `M ${x} ${y}`;
        } else {
            theoryPath += ` L ${x} ${y}`;
        }
    }
    
    const theoryCurve = document.createElementNS(svgNS, "path");
    theoryCurve.setAttribute("d", theoryPath);
    theoryCurve.setAttribute("class", "plot-theory");
    svg.appendChild(theoryCurve);
    
    // 2. Draw Empirical ECDF steps
    const n = sortedData.length;
    let stepPath = `M ${xScale(xMinLimit)} ${yScale(0)}`;
    
    let lastX = xMinLimit;
    let lastY = 0;
    
    for (let i = 0; i < n; i++) {
        const xVal = sortedData[i];
        const nextY = (i + 1) / n;
        
        // Draw horizontal line to current value
        stepPath += ` L ${xScale(xVal)} ${yScale(lastY)}`;
        // Draw vertical step up
        stepPath += ` L ${xScale(xVal)} ${yScale(nextY)}`;
        
        lastX = xVal;
        lastY = nextY;
    }
    stepPath += ` L ${xScale(xMaxLimit)} ${yScale(1)}`;
    
    const stepCurve = document.createElementNS(svgNS, "path");
    stepCurve.setAttribute("d", stepPath);
    stepCurve.setAttribute("class", "plot-em-step");
    svg.appendChild(stepCurve);
    
    container.appendChild(svg);
}

// ==========================================================================
// 7. UAS & CHEAT SHEET INTERACTIONS
// ==========================================================================
function openUAS1InFriedman() {
    switchTab('friedman');
    // Load exact mobil data (UAS 2025 Nomer 1)
    friedmanCols = 4;
    friedmanRows = 12;
    
    const table = document.getElementById('friedman-table');
    const thead = table.querySelector('thead tr');
    const tbody = table.querySelector('tbody');
    
    thead.innerHTML = '<th>Responden</th>';
    for (let j = 1; j <= friedmanCols; j++) {
        thead.innerHTML += `<th>Mobil ${String.fromCharCode(64 + j)}</th>`;
    }
    
    // UAS 2025 Nomer 1 actual data
    const uas1Data = [
        [4, 2, 3, 1], // Resp 1
        [4, 2, 3, 1], // Resp 2
        [3, 1, 2, 4], // Resp 3
        [3, 1, 2, 4], // Resp 4
        [4, 2, 1, 3], // Resp 5
        [4, 1, 2, 3], // Resp 6
        [4, 1, 2, 3], // Resp 7
        [4, 2, 1, 3], // Resp 8
        [3, 1, 2, 4], // Resp 9
        [4, 1, 3, 2], // Resp 10
        [4, 2, 3, 1], // Resp 11
        [3, 1, 2, 4]  // Resp 12
    ];
    
    tbody.innerHTML = '';
    for (let i = 1; i <= friedmanRows; i++) {
        let cellsHtml = `<td><strong>Resp ${i}</strong></td>`;
        for (let j = 1; j <= friedmanCols; j++) {
            cellsHtml += `<td><input type="number" class="cell-input friedman-cell" data-row="${i}" data-col="${j}" value="${uas1Data[i-1][j-1]}"></td>`;
        }
        const tr = document.createElement('tr');
        tr.innerHTML = cellsHtml;
        tbody.appendChild(tr);
    }
    
    // Activate subtab-kalkulator
    const parentPane = document.getElementById('tab-friedman');
    parentPane.querySelectorAll('.sub-tab-btn').forEach(b => b.classList.remove('active'));
    parentPane.querySelectorAll('.subtab-content').forEach(c => c.classList.remove('active'));
    
    parentPane.querySelector('[data-subtab="fr-kalkulator"]').classList.add('active');
    parentPane.querySelector('#subtab-fr-kalkulator').classList.add('active');
    
    calculateFriedman();
}

function openUAS2InCochran() {
    switchTab('cochran');
    cochranCols = 3;
    cochranRows = 12;
    initCochranTable();
    
    // Activate subtab-kalkulator
    const parentPane = document.getElementById('tab-cochran');
    parentPane.querySelectorAll('.sub-tab-btn').forEach(b => b.classList.remove('active'));
    parentPane.querySelectorAll('.subtab-content').forEach(c => c.classList.remove('active'));
    
    parentPane.querySelector('[data-subtab="co-kalkulator"]').classList.add('active');
    parentPane.querySelector('#subtab-co-kalkulator').classList.add('active');
    
    calculateCochran();
}

function openProyekInDurbin() {
    switchTab('durbin');
    durbinCols = 7;
    durbinRows = 7;
    
    const table = document.getElementById('durbin-table');
    const thead = table.querySelector('thead');
    const tbody = table.querySelector('tbody');
    
    let headHtml = '<tr><th>Sopir</th>';
    for (let j = 1; j <= durbinCols; j++) {
        headHtml += `<th>Ban ${String.fromCharCode(64 + j)}</th>`;
    }
    headHtml += '</tr>';
    thead.innerHTML = headHtml;
    
    // Proyek Ban Mobil (t=7, b=7, k=4, r=4, lambda=2)
    // Nilai asli daya tahan ban — kalkulator akan me-rank per blok otomatis
    const actualUasData = [
        [null, null, 12.4, null,  9.1, 15.3, 10.8], // Sopir 1: C, E, F, G
        [8.5,  null, null, 14.2, null, 16.1, 11.7], // Sopir 2: A, D, F, G
        [9.3,  7.6,  null, null, 13.5, null, 17.2], // Sopir 3: A, B, E, G
        [7.1,  9.8,  15.6, null, null, 12.3, null], // Sopir 4: A, B, C, F
        [null, 6.4,  13.7, 11.5, null, null,  8.9], // Sopir 5: B, C, D, G
        [10.2, null, 14.8,  8.3, 12.9, null, null], // Sopir 6: A, C, D, E
        [null, 8.1,  null, 10.5, 13.2, 16.7, null]  // Sopir 7: B, D, E, F
    ];
    
    tbody.innerHTML = '';
    for (let i = 1; i <= durbinRows; i++) {
        let cellsHtml = `<td><strong>Sopir ${i}</strong></td>`;
        for (let j = 1; j <= durbinCols; j++) {
            const val = actualUasData[i-1][j-1];
            const valStr = (val === null || val === undefined) ? '' : val;
            cellsHtml += `<td><input type="text" class="cell-input durbin-cell" data-row="${i}" data-col="${j}" value="${valStr}"></td>`;
        }
        const tr = document.createElement('tr');
        tr.innerHTML = cellsHtml;
        tbody.appendChild(tr);
    }
    
    // Activate subtab-kalkulator
    const parentPane = document.getElementById('tab-durbin');
    parentPane.querySelectorAll('.sub-tab-btn').forEach(b => b.classList.remove('active'));
    parentPane.querySelectorAll('.subtab-content').forEach(c => c.classList.remove('active'));
    
    parentPane.querySelector('[data-subtab="du-kalkulator"]').classList.add('active');
    parentPane.querySelector('#subtab-du-kalkulator').classList.add('active');
    
    calculateDurbin();
}

// ==========================================================================
// 8. KOEFISIEN KORELASI CALCULATOR LOGIC
// ==========================================================================
let pairedRows = 10;
let contingencyRows = 3;
let contingencyCols = 3;

function initCorrelationTables() {
    initPairedTable();
    initContingencyTable();
}

function initPairedTable() {
    const tbody = document.querySelector('#kor-paired-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    const initX = [9, 5, 10, 1, 8, 7, 3, 4, 2, 6];
    const initY = [8, 3, 9, 2, 7, 10, 4, 6, 1, 5];
    
    for (let i = 1; i <= pairedRows; i++) {
        const tr = document.createElement('tr');
        const xVal = initX[i-1] !== undefined ? initX[i-1] : '';
        const yVal = initY[i-1] !== undefined ? initY[i-1] : '';
        tr.innerHTML = `
            <td>${i}</td>
            <td><input type="number" class="cell-input kor-paired-x" data-row="${i}" value="${xVal}"></td>
            <td><input type="number" class="cell-input kor-paired-y" data-row="${i}" value="${yVal}"></td>
        `;
        tbody.appendChild(tr);
    }
}

function initContingencyTable() {
    const table = document.getElementById('kor-contingency-table');
    if (!table) return;
    const thead = table.querySelector('thead');
    const tbody = table.querySelector('tbody');
    
    let headHtml = '<tr><th>Baris \\ Kolom</th>';
    for (let j = 1; j <= contingencyCols; j++) {
        headHtml += `<th>Kolom ${j}</th>`;
    }
    headHtml += '</tr>';
    thead.innerHTML = headHtml;
    
    const initVals = [
        [82, 65, 12],
        [59, 112, 24],
        [37, 94, 42]
    ];
    
    tbody.innerHTML = '';
    for (let i = 1; i <= contingencyRows; i++) {
        const tr = document.createElement('tr');
        let cellsHtml = `<td><strong>Baris ${i}</strong></td>`;
        for (let j = 1; j <= contingencyCols; j++) {
            const val = (initVals[i-1] && initVals[i-1][j-1] !== undefined) ? initVals[i-1][j-1] : 0;
            cellsHtml += `<td><input type="number" class="cell-input kor-cont-cell" data-row="${i}" data-col="${j}" value="${val}" min="0"></td>`;
        }
        tr.innerHTML = cellsHtml;
        tbody.appendChild(tr);
    }
}

function toggleCorrelationInput() {
    const type = document.getElementById('kor-type').value;
    const pairedCont = document.getElementById('kor-paired-container');
    const contingencyCont = document.getElementById('kor-contingency-container');
    
    if (type === 'paired') {
        pairedCont.classList.remove('hidden');
        contingencyCont.classList.add('hidden');
    } else {
        pairedCont.classList.add('hidden');
        contingencyCont.classList.remove('hidden');
    }
}

function addPairedRow() {
    pairedRows++;
    const tbody = document.querySelector('#kor-paired-table tbody');
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>${pairedRows}</td>
        <td><input type="number" class="cell-input kor-paired-x" data-row="${pairedRows}" value=""></td>
        <td><input type="number" class="cell-input kor-paired-y" data-row="${pairedRows}" value=""></td>
    `;
    tbody.appendChild(tr);
}

function removePairedRow() {
    if (pairedRows <= 3) {
        alert("Butuh minimal 3 data pasangan!");
        return;
    }
    const tbody = document.querySelector('#kor-paired-table tbody');
    tbody.lastElementChild.remove();
    pairedRows--;
}

function addContingencyRow() {
    contingencyRows++;
    const tbody = document.querySelector('#kor-contingency-table tbody');
    const tr = document.createElement('tr');
    let cellsHtml = `<td><strong>Baris ${contingencyRows}</strong></td>`;
    for (let j = 1; j <= contingencyCols; j++) {
        cellsHtml += `<td><input type="number" class="cell-input kor-cont-cell" data-row="${contingencyRows}" data-col="${j}" value="0" min="0"></td>`;
    }
    tr.innerHTML = cellsHtml;
    tbody.appendChild(tr);
}

function removeContingencyRow() {
    if (contingencyRows <= 2) {
        alert("Butuh minimal 2 baris!");
        return;
    }
    const tbody = document.querySelector('#kor-contingency-table tbody');
    tbody.lastElementChild.remove();
    contingencyRows--;
}

function addContingencyCol() {
    if (contingencyCols >= 10) {
        alert("Maksimal 10 kolom!");
        return;
    }
    contingencyCols++;
    const thead = document.querySelector('#kor-contingency-table thead tr');
    thead.innerHTML += `<th>Kolom ${contingencyCols}</th>`;
    
    const rows = document.querySelectorAll('#kor-contingency-table tbody tr');
    rows.forEach((row, i) => {
        const td = document.createElement('td');
        td.innerHTML = `<input type="number" class="cell-input kor-cont-cell" data-row="${i+1}" data-col="${contingencyCols}" value="0" min="0">`;
        row.appendChild(td);
    });
}

function removeContingencyCol() {
    if (contingencyCols <= 2) {
        alert("Butuh minimal 2 kolom!");
        return;
    }
    const thead = document.querySelector('#kor-contingency-table thead tr');
    thead.lastElementChild.remove();
    
    const rows = document.querySelectorAll('#kor-contingency-table tbody tr');
    rows.forEach(row => {
        row.lastElementChild.remove();
    });
    contingencyCols--;
}

function loadPairedExample1() {
    pairedRows = 10;
    initPairedTable();
}

function loadPairedExample2() {
    pairedRows = 10;
    const initX = [48, 32, 40, 34, 30, 50, 26, 50, 22, 43];
    const initY = [312, 164, 280, 196, 200, 288, 146, 361, 149, 252];
    
    const tbody = document.querySelector('#kor-paired-table tbody');
    tbody.innerHTML = '';
    for (let i = 1; i <= pairedRows; i++) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${i}</td>
            <td><input type="number" class="cell-input kor-paired-x" data-row="${i}" value="${initX[i-1]}"></td>
            <td><input type="number" class="cell-input kor-paired-y" data-row="${i}" value="${initY[i-1]}"></td>
        `;
        tbody.appendChild(tr);
    }
}

function loadPairedExample3() {
    pairedRows = 5;
    const initX = [141.8, 140.2, 131.8, 132.5, 141.2];
    const initY = [89.7, 74.4, 83.5, 77.8, 86.5];
    
    const tbody = document.querySelector('#kor-paired-table tbody');
    tbody.innerHTML = '';
    for (let i = 1; i <= pairedRows; i++) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${i}</td>
            <td><input type="number" class="cell-input kor-paired-x" data-row="${i}" value="${initX[i-1]}"></td>
            <td><input type="number" class="cell-input kor-paired-y" data-row="${i}" value="${initY[i-1]}"></td>
        `;
        tbody.appendChild(tr);
    }
}

function loadContingencyExample1() {
    contingencyRows = 3;
    contingencyCols = 3;
    
    const table = document.getElementById('kor-contingency-table');
    const thead = table.querySelector('thead');
    const tbody = table.querySelector('tbody');
    
    thead.innerHTML = '<tr><th>Pendidikan \\ Konsumsi Protein</th><th>Rendah</th><th>Sedang</th><th>Tinggi</th></tr>';
    
    const data = [
        [82, 65, 12],
        [59, 112, 24],
        [37, 94, 42]
    ];
    
    tbody.innerHTML = '';
    const rowLabels = ['SD (Rendah)', 'SMP/SMA (Sedang)', 'PT (Tinggi)'];
    for (let i = 1; i <= contingencyRows; i++) {
        const tr = document.createElement('tr');
        let cellsHtml = `<td><strong>${rowLabels[i-1]}</strong></td>`;
        for (let j = 1; j <= contingencyCols; j++) {
            cellsHtml += `<td><input type="number" class="cell-input kor-cont-cell" data-row="${i}" data-col="${j}" value="${data[i-1][j-1]}" min="0"></td>`;
        }
        tr.innerHTML = cellsHtml;
        tbody.appendChild(tr);
    }
}

function loadContingencyExample2() {
    contingencyRows = 2;
    contingencyCols = 3;
    
    const table = document.getElementById('kor-contingency-table');
    const thead = table.querySelector('thead');
    const tbody = table.querySelector('tbody');
    
    thead.innerHTML = '<tr><th>Tingkat Daging \\ Pendidikan</th><th>SMP</th><th>SLA</th><th>PT</th></tr>';
    
    const data = [
        [25, 13, 10],
        [5, 17, 20]
    ];
    
    tbody.innerHTML = '';
    for (let i = 1; i <= contingencyRows; i++) {
        const tr = document.createElement('tr');
        const rowLabel = i === 1 ? 'Rendah' : 'Tinggi';
        let cellsHtml = `<td><strong>${rowLabel}</strong></td>`;
        for (let j = 1; j <= contingencyCols; j++) {
            cellsHtml += `<td><input type="number" class="cell-input kor-cont-cell" data-row="${i}" data-col="${j}" value="${data[i-1][j-1]}" min="0"></td>`;
        }
        tr.innerHTML = cellsHtml;
        tbody.appendChild(tr);
    }
}

function calculateCorrelation() {
    const type = document.getElementById('kor-type').value;
    const alpha = parseFloat(document.getElementById('kor-alpha').value);
    let html = "";
    
    if (type === 'paired') {
        const inputsX = document.querySelectorAll('.kor-paired-x');
        const inputsY = document.querySelectorAll('.kor-paired-y');
        
        const dataX = [];
        const dataY = [];
        let hasInvalid = false;
        
        for (let i = 0; i < inputsX.length; i++) {
            const valX = parseFloat(inputsX[i].value);
            const valY = parseFloat(inputsY[i].value);
            
            if (isNaN(valX) || isNaN(valY)) {
                hasInvalid = true;
                inputsX[i].classList.add('error-border');
                inputsY[i].classList.add('error-border');
            } else {
                inputsX[i].classList.remove('error-border');
                inputsY[i].classList.remove('error-border');
                dataX.push(valX);
                dataY.push(valY);
            }
        }
        
        if (hasInvalid) {
            alert("Semua data pasangan harus diisi dengan angka valid!");
            return;
        }
        
        const n = dataX.length;
        if (n < 3) {
            alert("Butuh minimal 3 data pasangan untuk analisis!");
            return;
        }
        
        const indexedX = dataX.map((val, idx) => ({ val: val, idx: idx }));
        const indexedY = dataY.map((val, idx) => ({ val: val, idx: idx }));
        
        const ranksX = Array(n).fill(0);
        const ranksY = Array(n).fill(0);
        
        const sortedX = indexedX.slice().sort((a, b) => a.val - b.val);
        let i = 0;
        let hasTiesX = false;
        while (i < n) {
            let j = i + 1;
            while (j < n && sortedX[j].val === sortedX[i].val) {
                j++;
            }
            const sumR = ((i + 1) + j) * (j - i) / 2;
            const avgR = sumR / (j - i);
            for (let k = i; k < j; k++) {
                ranksX[sortedX[k].idx] = avgR;
            }
            if (j - i > 1) hasTiesX = true;
            i = j;
        }
        
        const sortedY = indexedY.slice().sort((a, b) => a.val - b.val);
        i = 0;
        let hasTiesY = false;
        while (i < n) {
            let j = i + 1;
            while (j < n && sortedY[j].val === sortedY[i].val) {
                j++;
            }
            const sumR = ((i + 1) + j) * (j - i) / 2;
            const avgR = sumR / (j - i);
            for (let k = i; k < j; k++) {
                ranksY[sortedY[k].idx] = avgR;
            }
            if (j - i > 1) hasTiesY = true;
            i = j;
        }
        
        const di = [];
        const di2 = [];
        for (let idx = 0; idx < n; idx++) {
            const d = ranksX[idx] - ranksY[idx];
            di.push(d);
            di2.push(d * d);
        }
        
        const sum_di2 = di2.reduce((a, b) => a + b, 0);
        
        const rs_uncorrected = 1 - (6 * sum_di2) / (n * (n * n - 1));
        
        const meanX = ranksX.reduce((a, b) => a + b, 0) / n;
        const meanY = ranksY.reduce((a, b) => a + b, 0) / n;
        
        let cov = 0;
        let varX = 0;
        let varY = 0;
        for (let idx = 0; idx < n; idx++) {
            const dx = ranksX[idx] - meanX;
            const dy = ranksY[idx] - meanY;
            cov += dx * dy;
            varX += dx * dx;
            varY += dy * dy;
        }
        
        const rs_corrected = cov / Math.sqrt(varX * varY);
        const rs = (hasTiesX || hasTiesY) ? rs_corrected : rs_uncorrected;
        
        let sigInfo = "";
        let isSig = false;
        if (n > 30) {
            const Z = rs * Math.sqrt(n - 1);
            const z_crit = normalInverse(1 - alpha / 2);
            isSig = Math.abs(Z) >= z_crit;
            sigInfo = `
                Karena $n = ${n} > 30$, kita gunakan pendekatan normal standar $Z$:<br>
                $$Z_{hitung} = r_s \\sqrt{n-1} = ${rs.toFixed(4)} \\times \\sqrt{${n-1}} = ${Z.toFixed(4)}$$
                Kuantil kritis $z_{(1 - \\alpha/2)} = z_{${1 - alpha/2}} = ${z_crit.toFixed(3)}$<br>
                Hasil uji signifikansi: <span class="report-badge ${isSig ? 'badge-danger' : 'badge-success'}">${isSig ? 'Tolak H0' : 'Gagal Tolak H0'}</span><br>
                Karena $|Z_{hitung}| = ${Math.abs(Z).toFixed(4)} ${isSig ? '\\ge' : '<'} z_{table} = ${z_crit.toFixed(3)}$.
            `;
        } else {
            const t_stat = rs * Math.sqrt((n - 2) / (1 - rs * rs));
            const t_crit = studentTInverse(1 - alpha / 2, n - 2);
            isSig = Math.abs(t_stat) >= t_crit;
            sigInfo = `
                Karena $n = ${n} \\le 30$, kita uji signifikansi menggunakan distribusi t-Student (df = $n-2 = ${n-2}$):<br>
                $$t_{hitung} = r_s \\sqrt{\\frac{n-2}{1 - r_s^2}} = ${rs.toFixed(4)} \\times \\sqrt{\\frac{${n-2}}{1 - ${rs.toFixed(4)}^2}} = ${t_stat.toFixed(4)}$$
                Kuantil kritis $t_{(${1 - alpha/2}, ${n-2})} = ${t_crit.toFixed(3)}$<br>
                Hasil uji signifikansi: <span class="report-badge ${isSig ? 'badge-danger' : 'badge-success'}">${isSig ? 'Tolak H0' : 'Gagal Tolak H0'}</span><br>
                Karena $|t_{hitung}| = ${Math.abs(t_stat).toFixed(4)} ${isSig ? '\\ge' : '<'} t_{table} = ${t_crit.toFixed(3)}$.
            `;
        }
        
        let P = 0;
        let Q = 0;
        const pairedData = dataX.map((x, idx) => ({ x: x, y: dataY[idx] }));
        
        for (let idx1 = 0; idx1 < n; idx1++) {
            for (let idx2 = idx1 + 1; idx2 < n; idx2++) {
                const dx = pairedData[idx1].x - pairedData[idx2].x;
                const dy = pairedData[idx1].y - pairedData[idx2].y;
                if (dx * dy > 0) P++;
                if (dx * dy < 0) Q++;
            }
        }
        
        const S = P - Q;
        
        const valXCounts = {};
        const valYCounts = {};
        dataX.forEach(x => valXCounts[x] = (valXCounts[x] || 0) + 1);
        dataY.forEach(y => valYCounts[y] = (valYCounts[y] || 0) + 1);
        
        let Tx = 0;
        Object.values(valXCounts).forEach(c => {
            if (c > 1) Tx += c * (c - 1) / 2;
        });
        
        let Ty = 0;
        Object.values(valYCounts).forEach(c => {
            if (c > 1) Ty += c * (c - 1) / 2;
        });
        
        const tau_a = S / (n * (n - 1) / 2);
        const tau_b = S / Math.sqrt((n * (n - 1) / 2 - Tx) * (n * (n - 1) / 2 - Ty));
        
        html += makeStep("Langkah 1: Perangkingan Data", `
            Mengurutkan data dan menghitung peringkat untuk masing-masing peubah acak.<br>
            Ties (kembar) akan diberikan nilai peringkat rata-rata.<br>
            <table class="table-calc">
                <thead>
                    <tr>
                        <th>No</th>
                        <th>X</th>
                        <th>Rank X</th>
                        <th>Y</th>
                        <th>Rank Y</th>
                        <th>Selisih (d_i)</th>
                        <th>d_i^2</th>
                    </tr>
                </thead>
                <tbody>
                    ${dataX.map((x, idx) => `
                        <tr>
                            <td>${idx+1}</td>
                            <td>${x}</td>
                            <td>${ranksX[idx].toFixed(1)}</td>
                            <td>${dataY[idx]}</td>
                            <td>${ranksY[idx].toFixed(1)}</td>
                            <td>${di[idx].toFixed(1)}</td>
                            <td>${di2[idx].toFixed(2)}</td>
                        </tr>
                    `).join('')}
                    <tr style="background: rgba(99,102,241,0.08); border-top: 1.5px solid var(--accent-indigo);">
                        <td colspan="5"><strong>Jumlah</strong></td>
                        <td>-</td>
                        <td><strong>$\\sum d_i^2 = ${sum_di2.toFixed(2)}$</strong></td>
                    </tr>
                </tbody>
            </table>
        `);
        
        html += makeStep("Langkah 2: Korelasi Peringkat Spearman (r_s)", `
            <strong>Perhitungan Koefisien:</strong><br>
            ${(hasTiesX || hasTiesY) ? `
                Ditemukan ties pada peubah $X$ atau $Y$. Koefisien dihitung menggunakan korelasi Pearson peringkat:<br>
                $$r_s = \\frac{\\sum (R(X_i) - \\bar{R}_x)(R(Y_i) - \\bar{R}_y)}{\\sqrt{\\sum (R(X_i) - \\bar{R}_x)^2 \\sum (R(Y_i) - \\bar{R}_y)^2}} = ${rs.toFixed(4)}$$
                <em>(Jika menggunakan rumus uncorrected tanpa ties: $r_{s,\\text{uncorrected}} = 1 - \\frac{6 \\sum d_i^2}{n(n^2-1)} = ${rs_uncorrected.toFixed(4)}$)</em>
            ` : `
                Tidak ditemukan ties pada peubah. Koefisien dihitung menggunakan rumus Spearman standard:<br>
                $$r_s = 1 - \\frac{6 \\sum d_i^2}{n(n^2 - 1)}$$
                $$r_s = 1 - \\frac{6 \\times ${sum_di2.toFixed(2)}}{${n}(${n}^2 - 1)}$$
                $$r_s = 1 - \\frac{${6 * sum_di2}}{${n * (n*n - 1)}} = ${rs.toFixed(4)}$$
            `}
            <br>
            <strong>Pengujian Hipotesis ($H_0: \\rho = 0$):</strong><br>
            ${sigInfo}
        `);
        
        html += makeStep("Langkah 3: Korelasi Tau Kendall (\\tau)", `
            Mengukur hubungan menggunakan proporsi pasangan konkordan ($P$) dan diskordan ($Q$).<br>
            - Jumlah pasangan konkordan ($P$) = ${P}<br>
            - Jumlah pasangan diskordan ($Q$) = ${Q}<br>
            - Selisih ($S = P - Q$) = ${S}<br>
            - Total seluruh pasangan kemungkinan = $\\frac{n(n-1)}{2} = ${n*(n-1)/2}$
            <br><br>
            <strong>Koefisien Tanpa Koreksi (\\tau_a):</strong><br>
            $$\\tau_a = \\frac{P - Q}{n(n-1)/2} = \\frac{${S}}{${n*(n-1)/2}} = ${tau_a.toFixed(4)}$$
            <br>
            <strong>Koefisien Terkoreksi Ties (\\tau_b):</strong><br>
            Faktor koreksi ties: $T_x = ${Tx}$, $T_y = ${Ty}$.<br>
            $$\\tau_b = \\frac{S}{\\sqrt{(\\frac{n(n-1)}{2} - T_x)(\\frac{n(n-1)}{2} - T_y)}}$$
            $$\\tau_b = \\frac{${S}}{\\sqrt{(${n*(n-1)/2} - ${Tx})(${n*(n-1)/2} - ${Ty})}} = ${tau_b.toFixed(4)}$$
        `);
        
        html += makeStep("Langkah 4: Kesimpulan Akhir", `
            <strong>Jadi,</strong> dari hasil perhitungan diperoleh koefisien korelasi peringkat Spearman $r_s = ${rs.toFixed(4)}$ dan koefisien korelasi Tau Kendall $\\tau = ${tau_b.toFixed(4)}$.
            Berdasarkan pengujian signifikansi korelasi Spearman pada tingkat signifikansi ${alpha*100}%, hubungan/korelasi antara kedua peubah tersebut bersifat <strong>${isSig ? 'signifikan secara statistik' : 'tidak signifikan secara statistik'}</strong>.
        `);
        
    } else {
        const inputs = document.querySelectorAll('.kor-cont-cell');
        const matrix = Array(contingencyRows).fill(0).map(() => Array(contingencyCols).fill(0));
        let hasInvalid = false;
        
        inputs.forEach(inp => {
            const r = parseInt(inp.getAttribute('data-row')) - 1;
            const c = parseInt(inp.getAttribute('data-col')) - 1;
            const val = parseInt(inp.value);
            if (isNaN(val) || val < 0) {
                hasInvalid = true;
                inp.classList.add('error-border');
            } else {
                inp.classList.remove('error-border');
                matrix[r][c] = val;
            }
        });
        
        if (hasInvalid) {
            alert("Semua sel tabel kontingensi harus diisi dengan angka non-negatif!");
            return;
        }
        
        const Ri = Array(contingencyRows).fill(0);
        const Cj = Array(contingencyCols).fill(0);
        let N = 0;
        
        for (let i = 0; i < contingencyRows; i++) {
            for (let j = 0; j < contingencyCols; j++) {
                Ri[i] += matrix[i][j];
                Cj[j] += matrix[i][j];
                N += matrix[i][j];
            }
        }
        
        if (N === 0) {
            alert("Tabel tidak boleh kosong!");
            return;
        }
        
        let chi2 = 0;
        const expected = Array(contingencyRows).fill(0).map(() => Array(contingencyCols).fill(0));
        let expectedGridRowsHtml = "";
        
        for (let i = 0; i < contingencyRows; i++) {
            let colsHtml = "";
            for (let j = 0; j < contingencyCols; j++) {
                expected[i][j] = (Ri[i] * Cj[j]) / N;
                const diff = matrix[i][j] - expected[i][j];
                chi2 += expected[i][j] > 0 ? (diff * diff) / expected[i][j] : 0;
                colsHtml += `<td>${matrix[i][j]} (E: ${expected[i][j].toFixed(2)})</td>`;
            }
            expectedGridRowsHtml += `
                <tr>
                    <td><strong>Baris ${i+1}</strong></td>
                    ${colsHtml}
                    <td><strong>${Ri[i]}</strong></td>
                </tr>
            `;
        }
        
        const Cc = Math.sqrt(chi2 / (chi2 + N));
        const k = Math.min(contingencyRows, contingencyCols);
        const Cmax = Math.sqrt((k - 1) / k);
        const r_rel = Cmax > 0 ? Cc / Cmax : 0;
        
        const df = (contingencyRows - 1) * (contingencyCols - 1);
        const critVal = getChiSquareCriticalValue(df, alpha);
        const isSignificant = chi2 >= critVal;
        
        let P = 0;
        let Q = 0;
        
        for (let i = 0; i < contingencyRows; i++) {
            for (let j = 0; j < contingencyCols; j++) {
                const count = matrix[i][j];
                if (count === 0) continue;
                
                let concordantSum = 0;
                for (let i2 = i + 1; i2 < contingencyRows; i2++) {
                    for (let j2 = j + 1; j2 < contingencyCols; j2++) {
                        concordantSum += matrix[i2][j2];
                    }
                }
                P += count * concordantSum;
                
                let discordantSum = 0;
                for (let i2 = i + 1; i2 < contingencyRows; i2++) {
                    for (let j2 = 0; j2 < j; j2++) {
                        discordantSum += matrix[i2][j2];
                    }
                }
                Q += count * discordantSum;
            }
        }
        
        const S = P - Q;
        
        let Tx = 0;
        Ri.forEach(r_sum => Tx += r_sum * (r_sum - 1) / 2);
        
        let Ty = 0;
        Cj.forEach(c_sum => Ty += c_sum * (c_sum - 1) / 2);
        
        const totalPairs = N * (N - 1) / 2;
        const tau_b = S / Math.sqrt((totalPairs - Tx) * (totalPairs - Ty));
        
        let interpretText = "";
        if (r_rel < 0.5) interpretText = "Hubungan Lemah";
        else if (r_rel < 0.75) interpretText = "Hubungan Cukup Kuat";
        else if (r_rel < 0.90) interpretText = "Hubungan Kuat";
        else if (r_rel < 1.0) interpretText = "Hubungan Sangat Kuat";
        else interpretText = "Hubungan Sempurna";
        
        html += makeStep("Langkah 1: Matriks Observasi & Harapan (Expected)", `
            Kita bandingkan frekuensi pengamatan ($O$) dengan frekuensi harapan ($E$):<br>
            <table class="table-calc">
                <thead>
                    <tr>
                        <th>Kategori</th>
                        ${Array(contingencyCols).fill(0).map((_, idx) => `<th>Kolom ${idx+1}</th>`).join('')}
                        <th>Jumlah Baris</th>
                    </tr>
                </thead>
                <tbody>
                    ${expectedGridRowsHtml}
                    <tr style="background: rgba(99,102,241,0.08); border-top: 1.5px solid var(--accent-indigo);">
                        <td><strong>Jumlah Kolom</strong></td>
                        ${Cj.map(c => `<td><strong>${c}</strong></td>`).join('')}
                        <td><strong>N = ${N}</strong></td>
                    </tr>
                </tbody>
            </table>
        `);
        
        html += makeStep("Langkah 2: Uji Chi-Square (\\chi^2)", `
            Menghitung statistik Chi-Square untuk uji independensi:<br>
            $$\\chi^2 = \\sum \\frac{(O_{ij} - E_{ij})^2}{E_{ij}}$$
            $$\\chi^2 = ${chi2.toFixed(4)}$$
            Derajat bebas (df) = $(r-1)(c-1) = (${contingencyRows}-1)(${contingencyCols}-1) = ${df}$<br>
            Kuantil kritis $\\chi^2_{(1-\\alpha, \\text{df}=${df})} = ${critVal.toFixed(3)}$<br>
            <br>
            Keputusan Uji Independensi:<br>
            <span class="report-badge ${isSignificant ? 'badge-danger' : 'badge-success'}">${isSignificant ? 'Tolak H0' : 'Gagal Tolak H0'}</span><br>
            Karena $\\chi^2_{hitung} = ${chi2.toFixed(4)} ${isSignificant ? '\\ge' : '<'} \\chi^2_{table} = ${critVal.toFixed(3)}$.<br>
            Artinya, kedua peubah acak kualitatif tersebut <strong>${isSignificant ? 'saling berhubungan/dependen secara signifikan' : 'tidak berhubungan/independen'}</strong>.
        `);
        
        html += makeStep("Langkah 3: Koefisien Kontingensi (C_c) & Korelasi Relatif (r)", `
            Mengukur keeratan hubungan nominal:<br>
            $$C_c = \\sqrt{\\frac{\\chi^2}{\\chi^2 + N}} = \\sqrt{\\frac{${chi2.toFixed(4)}}{${chi2.toFixed(4)} + ${N}}} = ${Cc.toFixed(4)}$$
            <br>
            Nilai koefisien kontingensi maksimum:<br>
            $$C_{max} = \\sqrt{\\frac{k-1}{k}} = \\sqrt{\\frac{${k}-1}{${k}}} = ${Cmax.toFixed(4)}$$
            <br>
            Koefisien Korelasi Relatif ($r$):<br>
            $$r = \\frac{C_c}{C_{max}} = \\frac{${Cc.toFixed(4)}}{${Cmax.toFixed(4)}} = ${r_rel.toFixed(4)}$$
            <br>
            <strong>Interpretasi:</strong> Hubungan keeratan berada pada kategori <strong>"${interpretText}"</strong>.
        `);
        
        html += makeStep("Langkah 4: Asosiasi Kendall's Tau-b untuk Tabel Kontingensi", `
            Menghitung pasangan searah dan berlawanan arah berdasarkan sel-sel tabel kontingensi:<br>
            - Pasangan Konkordan ($P$) = ${P}<br>
            - Pasangan Diskordan ($Q$) = ${Q}<br>
            - Selisih ($S = P - Q$) = ${S}<br>
            - Total Pasangan = $\\frac{N(N-1)}{2} = ${totalPairs}$<br>
            - Koreksi Ties Baris ($T_x$) = ${Tx}<br>
            - Koreksi Ties Kolom ($T_y$) = ${Ty}<br>
            <br>
            <strong>Koefisien Asosiasi Kendall's $\\tau_b$:</strong><br>
            $$\\tau_b = \\frac{S}{\\sqrt{(\\frac{N(N-1)}{2} - T_x)(\\frac{N(N-1)}{2} - T_y)}} = ${tau_b.toFixed(4)}$$
        `);
        
        html += makeStep("Langkah 5: Kesimpulan Akhir", `
            <strong>Jadi,</strong> karena $\\chi^2_{hitung} = ${chi2.toFixed(4)}$ ${isSignificant ? '\\ge' : '<'} $\\chi^2_{table} = ${critVal.toFixed(3)}$, kita <strong>${isSignificant ? 'menolak' : 'gagal menolak'} $H_0$</strong>.
            Hal ini menyimpulkan bahwa terdapat hubungan yang <strong>${isSignificant ? 'signifikan (dependen)' : 'tidak signifikan (independen)'}</strong> antara kedua peubah kategori tersebut dengan keeratan hubungan berkategori <strong>"${interpretText}"</strong> ($r = ${r_rel.toFixed(4)}$) dan koefisien asosiasi Kendall's $\\tau_b = ${tau_b.toFixed(4)}$.
        `);
    }
    
    const outputSection = document.getElementById('kor-output-section');
    outputSection.querySelector('.calculation-steps').innerHTML = html;
    outputSection.classList.remove('hidden');
    
    renderMathInElement(outputSection, {
        delimiters: [
            {left: '$$', right: '$$', display: true},
            {left: '$', right: '$', display: false}
        ]
    });
}
