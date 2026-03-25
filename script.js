/**
 * Chmod Calculator - Bidirectional Sync
 * Good Practices: Concise, DRY, Interactive
 */

const CONFIG = {
    map: { '0': '---', '1': '--x', '2': '-w-', '3': '-wx', '4': 'r--', '5': 'r-x', '6': 'rw-', '7': 'rwx' },
    revMap: { '---': 0, '--x': 1, '-w-': 2, '-wx': 3, 'r--': 4, 'r-x': 5, 'rw-': 6, 'rwx': 7 },
    levels: [
        { min: 99, label: "Total", color: "#22d3ee" },
        { min: 66, label: "Alto", color: "#a855f7" },
        { min: 33, label: "Medio", color: "#6366f1" },
        { min: 0, label: "Bajo", color: "#94a3b8" }
    ]
};

const dom = {
    octal: document.getElementById('octal-input'),
    sym: document.getElementById('out-symbolic'),
    selects: ['out-owner', 'out-group', 'out-other'].map(id => document.getElementById(id)),
    circle: document.getElementById('progress-circle'),
    label: document.getElementById('level-text'),
    btnClear: document.getElementById('btn-clear')
};

const circumference = dom.circle.r.baseVal.value * 2 * Math.PI;
dom.circle.style.strokeDasharray = circumference;

const updateProgress = (score) => {
    const percent = (score / 21) * 100;
    dom.circle.style.strokeDashoffset = circumference - (percent / 100 * circumference);
    const config = CONFIG.levels.find(l => percent >= l.min);

    dom.label.textContent = score === 0 ? "Sin Permiso" : config.label;
    document.documentElement.style.setProperty('--level-color', score === 0 ? "#f43f5e" : config.color);
};

const syncFromOctal = () => {
    const val = dom.octal.value.replace(/[^0-7]/g, '').substring(0, 3);
    dom.octal.value = val;
    const digits = val.padEnd(3, '0').split('');

    digits.forEach((d, i) => dom.selects[i].value = d);
    dom.sym.value = digits.map(d => CONFIG.map[d]).join('');
    updateProgress(digits.reduce((a, b) => a + parseInt(b), 0));
};

const syncFromSelects = () => {
    const val = dom.selects.map(s => s.value).join('');
    dom.octal.value = val;
    dom.sym.value = dom.selects.map(s => CONFIG.map[s.value]).join('');
    updateProgress(dom.selects.reduce((a, b) => a + parseInt(b.value), 0));
};

const syncFromSymbolic = () => {
    let val = dom.sym.value.replace(/[^rwx-]/g, '').padEnd(9, '-').substring(0, 9);
    dom.sym.value = val;
    const parts = [val.slice(0, 3), val.slice(3, 6), val.slice(6, 9)];

    const octal = parts.map(p => CONFIG.revMap[p] ?? 0).join('');
    dom.octal.value = octal;
    parts.forEach((p, i) => dom.selects[i].value = CONFIG.revMap[p] ?? 0);
    updateProgress(parts.reduce((a, b) => a + (CONFIG.revMap[b] ?? 0), 0));
};

const clearAll = () => {
    dom.octal.value = '';
    syncFromOctal();
};

dom.octal.addEventListener('input', syncFromOctal);
dom.sym.addEventListener('input', syncFromSymbolic);
dom.selects.forEach(s => s.addEventListener('change', syncFromSelects));
dom.btnClear.addEventListener('click', clearAll);
document.addEventListener('DOMContentLoaded', syncFromOctal);
