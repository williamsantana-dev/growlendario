const LUA_NOVA_REF = new Date('2025-12-18T20:00:00'); 
const CICLO_LUNAR = 29.530588;

const TAREFAS = {
    NOVA: { nome: "Lua Nova", seiva: "No Solo (Mínima)", nutri: "Radicular", secagem: "Lenta", germ: "15%", risco: "Baixo", icones: "✂️🧹🧘🎶", texto: "Energia nas raízes. Limpeza e podas drásticas." },
    CRESCENTE: { nome: "Lua Crescente", seiva: "Subindo (Ativa)", nutri: "Foliar", secagem: "Moderada", germ: "85%", risco: "Médio", icones: "🌱🪴🍂💦", texto: "Seiva em movimento. Ótimo para plantar e nutrir." },
    CHEIA: { nome: "Lua Cheia", seiva: "No Topo (Máxima)", nutri: "Foliar", secagem: "Rápida", germ: "95%", risco: "Alto", icones: "🌱🐛🧘🎶", texto: "Energia máxima nas flores. Evite podar hoje." },
    MINGUANTE: { nome: "Lua Minguante", seiva: "Descendo", nutri: "Radicular", secagem: "Ideal", germ: "40%", risco: "Baixo", icones: "🪓💎✂️🧘", texto: "Seiva baixando. Colheita para secagem uniforme." }
};

let mesAtual = new Date().getMonth();
let anoAtual = new Date().getFullYear();

function getDadosFase(idade) {
    if (idade < 1.84 || idade > 27.7) return TAREFAS.NOVA;
    if (idade < 13.5) return TAREFAS.CRESCENTE;
    if (idade < 16.6) return TAREFAS.CHEIA;
    return TAREFAS.MINGUANTE;
}

// NOVO: Função para preencher os seletores de mês e ano
function preencherSeletores() {
    const monthSelect = document.getElementById('month-select');
    const yearSelect = document.getElementById('year-select');
    if (!monthSelect || !yearSelect) return;

    const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    meses.forEach((m, i) => {
        let opt = document.createElement('option');
        opt.value = i; opt.innerHTML = m; opt.selected = i === mesAtual;
        monthSelect.appendChild(opt);
    });

    for (let i = 2020; i <= 2030; i++) {
        let opt = document.createElement('option');
        opt.value = i; opt.innerHTML = i; opt.selected = i === anoAtual;
        yearSelect.appendChild(opt);
    }

    monthSelect.onchange = (e) => { mesAtual = parseInt(e.target.value); renderizarGridMensal(); };
    yearSelect.onchange = (e) => { anoAtual = parseInt(e.target.value); renderizarGridMensal(); };
}

function renderizarGridMensal() {
    const grid = document.getElementById('calendar-grid');
    if (!grid) return;
    grid.innerHTML = "";
    const hoje = new Date();
    const ultimoDia = new Date(anoAtual, mesAtual + 1, 0).getDate();

    for (let d = 1; d <= ultimoDia; d++) {
        const dataDia = new Date(anoAtual, mesAtual, d);
        const idade = ((dataDia - LUA_NOVA_REF) / 86400000) % CICLO_LUNAR;
        const dados = getDadosFase(idade);
        const cell = document.createElement('div');
        cell.className = 'day-cell';
        if (d === hoje.getDate() && mesAtual === hoje.getMonth() && anoAtual === hoje.getFullYear()) cell.classList.add('today');
        cell.innerHTML = `<span>${d}</span><small style="font-size:0.5rem">${dados.icones.substring(0,2)}</small>`;
        cell.onclick = () => {
            document.querySelectorAll('.day-cell').forEach(c => c.classList.remove('selected'));
            cell.classList.add('selected');
            atualizarExibicao(dataDia, idade);
        };
        grid.appendChild(cell);
    }
}

function renderizarMoonSVG(idade) {
    const container = document.getElementById('moon-icon-container');
    if (!container) return;
    const percent = (idade / CICLO_LUNAR) * 100;
    const isSouth = document.getElementById('hemisphere-select').value === 'south';
    container.innerHTML = `<svg viewBox="0 0 100 100" style="width:100px;height:100px;transform:${isSouth ? 'scaleX(-1)' : 'scaleX(1)'}"><mask id="m"><path d="${calcularCaminhoFase(percent)}" fill="white"/></mask><circle cx="50" cy="50" r="45" fill="#111"/><circle cx="50" cy="50" r="45" fill="#e0e0e0" mask="url(#m)"/></svg>`;
}

function calcularCaminhoFase(percent) {
    if (percent <= 50) return `M 50 5 A 45 45 0 0 1 50 95 A ${45 - (percent*1.8)} 45 0 0 ${percent < 25 ? 0 : 1} 50 5`;
    return `M 50 5 A ${(percent-50)*1.8} 45 0 0 1 50 95 A 45 45 0 0 1 50 5`;
}

function atualizarExibicao(data, idade) {
    const dados = getDadosFase(idade);
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };
    set('current-date', data.toLocaleDateString('pt-BR', {day:'numeric', month:'long'}));
    set('moon-phase-name', dados.nome);
    set('sap-flow', dados.seiva);
    set('bio-nutri', dados.nutri);
    set('dry-index', dados.secagem);
    set('best-time', (idade < 14 ? "Entardecer" : "Manhã"));
    set('germination-rate', dados.germ);
    set('stress-risk', dados.risco);
    set('mindset-tag', `Mindset: ${idade < 14 ? "Expansão" : "Recolhimento"}`);
    set('cultivation-tip', dados.texto);
    set('day-tasks', dados.icones);
    renderizarMoonSVG(idade);
}

const hemis = document.getElementById('hemisphere-select');
if (hemis) hemis.onchange = () => { 
    renderizarGridMensal(); 
    atualizarExibicao(new Date(anoAtual, mesAtual, 1), ((new Date(anoAtual, mesAtual, 1) - LUA_NOVA_REF) / 86400000) % CICLO_LUNAR); 
};

// Inicialização
preencherSeletores();
renderizarGridMensal();
atualizarExibicao(new Date(), ((new Date() - LUA_NOVA_REF) / 86400000) % CICLO_LUNAR);