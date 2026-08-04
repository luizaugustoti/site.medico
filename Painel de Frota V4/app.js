/* ============================================================
   Painel Kanban — Lógica JS com Módulo de Cadastros
   ============================================================ */

const API_BASE_URL = 'http://localhost:8000/api';
const LOCAL_STORAGE_KEY = 'kanban_escala_veiculos_db';
const VEICULOS_KEY = 'kanban_cad_veiculos';
const MOTORISTAS_KEY = 'kanban_cad_motoristas';
const THEME_KEY = 'kanban_theme_pref';

let state = {
  theme: 'dark',
  date: '2026-08-04',
  equipes: [],
  veiculos: [],
  motoristas: []
};

// MOTORISTAS INICIAIS DE EXEMPLO
const defaultMotoristas = [
  { id: 'm-1', nome: 'Carlos Jorge', cpf: '584.836.001-00' },
  { id: 'm-2', nome: 'Maxuel Regis', cpf: '473.666.481-91' },
  { id: 'm-3', nome: 'Islan de Oliveira', cpf: '076.738.001-01' },
  { id: 'm-4', nome: 'Edson Bispo', cpf: '003.280.041-03' },
  { id: 'm-5', nome: 'Antonio da Silva', cpf: '632.404.752-00' },
  { id: 'm-6', nome: 'Marcelo Barros', cpf: '010.171.661-37' },
  { id: 'm-7', nome: 'Creovani de Paula', cpf: '849.065.291-00' },
  { id: 'm-8', nome: 'Marcio da Encarnacao', cpf: '051.627.255-10' },
  { id: 'm-9', nome: 'Eduardo Inacio', cpf: '484.453.201-49' },
  { id: 'm-10', nome: 'Gilmar Goncalves', cpf: '021.828.471-38' },
  { id: 'm-11', nome: 'Erick Lourenco', cpf: '988.068.401-00' }
];

// VEÍCULOS INICIAIS DE EXEMPLO
const defaultVeiculos = [
  { id: 'v-1', tipo: 'Fiorino', placa: 'PBW-1658' },
  { id: 'v-2', tipo: 'Van', placa: 'QPS-6C38' },
  { id: 'v-3', tipo: 'Van', placa: 'QKL-0A42' },
  { id: 'v-4', tipo: 'HR', placa: 'FDW-5E12' },
  { id: 'v-5', tipo: '3/4', placa: 'EFV-9132' },
  { id: 'v-6', tipo: 'Toco', placa: 'SKB-2B74' },
  { id: 'v-7', tipo: 'Van', placa: 'REF-6J46' },
  { id: 'v-8', tipo: 'Fiorino', placa: 'OZX-1E53' },
  { id: 'v-9', tipo: 'Fiorino', placa: 'PAL-3I73' },
  { id: 'v-10', tipo: 'Fiorino', placa: 'PQU-5G57' },
  { id: 'v-11', tipo: 'Fiorino', placa: 'OZY-6A17' }
];

// QUADROS DE EXEMPLO DA PLANILHA
const seedData = [
  {
    "id": "eq-1", "nome": "Equipamento 1", "tipo": "Fiorino", "placa": "PBW-1658", "motorista": "Carlos Jorge",
    "operacoes": [
      { "id": "op-1-16", "bloco": "Primeira Operação", "cte": "12607", "cliente": "KM CARGO", "destinatario": "AMERICANAS", "horario": "08:00", "rastreado": true, "ajudante": false },
      { "id": "op-1-23", "bloco": "Segunda Operação", "cte": "COLETA 43442", "cliente": "IBL", "destinatario": "CLARO", "horario": "08AS17", "rastreado": false, "ajudante": false }
    ]
  },
  {
    "id": "eq-2", "nome": "Equipamento 2", "tipo": "Van", "placa": "QPS-6C38", "motorista": "Maxuel Regis",
    "operacoes": [
      { "id": "op-2-16", "bloco": "Primeira Operação", "cte": "KM CARGO", "cliente": "DUFRY", "destinatario": "KM CARGO", "horario": "07:30", "rastreado": false, "ajudante": false }
    ]
  }
];

const $ = (id) => document.getElementById(id);

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initDate();
  loadCadastros();
  bindEvents();
  fetchKanbanData();
});

/* CARREGA CADASTROS DO STORAGE */
function loadCadastros() {
  const rawV = localStorage.getItem(VEICULOS_KEY);
  state.veiculos = rawV ? JSON.parse(rawV) : defaultVeiculos;

  const rawM = localStorage.getItem(MOTORISTAS_KEY);
  state.motoristas = rawM ? JSON.parse(rawM) : defaultMotoristas;
}

function saveCadastros() {
  localStorage.setItem(VEICULOS_KEY, JSON.stringify(state.veiculos));
  localStorage.setItem(MOTORISTAS_KEY, JSON.stringify(state.motoristas));
}

/* POPULA SELECTS DE OPÇÕES NO FORMULÁRIO DO QUADRO */
function populateDropdowns() {
  const selV = $('selectVeiculo');
  selV.innerHTML = '<option value="">-- Selecione para preencher automático --</option>';
  state.veiculos.forEach(v => {
    const opt = document.createElement('option');
    opt.value = v.id;
    opt.textContent = `${v.tipo} — Placa: ${v.placa}`;
    selV.appendChild(opt);
  });

  const selM = $('selectMotorista');
  selM.innerHTML = '<option value="">-- Selecione um Motorista --</option>';
  state.motoristas.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m.nome;
    opt.textContent = m.nome;
    selM.appendChild(opt);
  });
}

/* EVENTOS DE MUDANÇA NO SELECT DO MODAL DE QUADRO */
function bindEvents() {
  $('themeToggleBtn').addEventListener('click', toggleTheme);
  $('btnSync').addEventListener('click', fetchKanbanData);

  // Modais de Cadastros
  $('btnManageVeiculos').addEventListener('click', () => openManageVeiculosModal());
  $('btnCloseVeiculos').addEventListener('click', () => $('modalManageVeiculos').close());
  $('formCadVeiculo').addEventListener('submit', handleCadVeiculoSubmit);

  $('btnManageMotoristas').addEventListener('click', () => openManageMotoristasModal());
  $('btnCloseMotoristas').addEventListener('click', () => $('modalManageMotoristas').close());
  $('formCadMotorista').addEventListener('submit', handleCadMotoristaSubmit);

  // Preenchimento automático de Tipo e Placa ao selecionar Veículo
  $('selectVeiculo').addEventListener('change', (e) => {
    const selectedId = e.target.value;
    const v = state.veiculos.find(item => item.id === selectedId);
    if (v) {
      $('eqTipo').value = v.tipo;
      $('eqPlaca').value = v.placa;
    }
  });

  // Quadros
  $('btnAddEquipe').addEventListener('click', () => openEquipeModal());
  $('btnCancelEquipe').addEventListener('click', () => $('modalEquipe').close());
  $('formEquipe').addEventListener('submit', handleEquipeSubmit);

  // Operações
  $('btnCancelOperacao').addEventListener('click', () => $('modalOperacao').close());
  $('formOperacao').addEventListener('submit', handleOperacaoSubmit);
}

/* GESTÃO DE VEÍCULOS (MODAL) */
function openManageVeiculosModal() {
  renderTabelaVeiculos();
  $('modalManageVeiculos').showModal();
}

function renderTabelaVeiculos() {
  const tbody = $('tblVeiculosBody');
  tbody.innerHTML = '';
  state.veiculos.forEach(v => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(v.tipo)}</td>
      <td><strong>${escapeHtml(v.placa)}</strong></td>
      <td><button class="btn-icon" onclick="deleteCadVeiculo('${v.id}')">🗑️</button></td>
    `;
    tbody.appendChild(tr);
  });
}

function handleCadVeiculoSubmit(e) {
  e.preventDefault();
  const tipo = $('cadTipoVeiculo').value.trim();
  const placa = $('cadPlacaVeiculo').value.trim().toUpperCase();

  state.veiculos.push({ id: 'v-' + Date.now(), tipo, placa });
  saveCadastros();
  renderTabelaVeiculos();
  $('formCadVeiculo').reset();
  render();
}

window.deleteCadVeiculo = function(id) {
  if (confirm('Remover veículo?')) {
    state.veiculos = state.veiculos.filter(v => v.id !== id);
    saveCadastros();
    renderTabelaVeiculos();
    render();
  }
};

/* GESTÃO DE MOTORISTAS (MODAL) */
function openManageMotoristasModal() {
  renderTabelaMotoristas();
  $('modalManageMotoristas').showModal();
}

function renderTabelaMotoristas() {
  const tbody = $('tblMotoristasBody');
  tbody.innerHTML = '';
  state.motoristas.forEach(m => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${escapeHtml(m.nome)}</strong></td>
      <td>${escapeHtml(m.cpf || '-')}</td>
      <td><button class="btn-icon" onclick="deleteCadMotorista('${m.id}')">🗑️</button></td>
    `;
    tbody.appendChild(tr);
  });
}

function handleCadMotoristaSubmit(e) {
  e.preventDefault();
  const nome = $('cadNomeMotorista').value.trim();
  const cpf = $('cadCpfMotorista').value.trim();

  state.motoristas.push({ id: 'm-' + Date.now(), nome, cpf });
  saveCadastros();
  renderTabelaMotoristas();
  $('formCadMotorista').reset();
  render();
}

window.deleteCadMotorista = function(id) {
  if (confirm('Remover motorista?')) {
    state.motoristas = state.motoristas.filter(m => m.id !== id);
    saveCadastros();
    renderTabelaMotoristas();
    render();
  }
};

/* ABRIR MODAL PARA CRIAR / EDITAR QUADRO KANBAN */
function openEquipeModal(eq = null) {
  populateDropdowns();

  if (eq) {
    $('modalEquipeTitle').textContent = 'Editar Quadro';
    $('eqId').value = eq.id;
    $('eqNome').value = eq.nome;
    $('eqTipo').value = eq.tipo;
    $('eqPlaca').value = eq.placa;
    $('selectMotorista').value = eq.motorista;
  } else {
    $('modalEquipeTitle').textContent = 'Adicionar Quadro';
    $('formEquipe').reset();
    $('eqId').value = '';
  }
  $('modalEquipe').showModal();
}

function handleEquipeSubmit(e) {
  e.preventDefault();
  const id = $('eqId').value;
  const motoristaSelecionado = $('selectMotorista').value;

  if (!motoristaSelecionado) {
    alert('Por favor, selecione um motorista da lista!');
    return;
  }

  if (id) {
    const eq = state.equipes.find(item => item.id === id);
    if (eq) {
      eq.nome = $('eqNome').value.trim();
      eq.tipo = $('eqTipo').value.trim();
      eq.placa = $('eqPlaca').value.trim().toUpperCase();
      eq.motorista = motoristaSelecionado;
    }
  } else {
    state.equipes.push({
      id: 'eq-' + Date.now(),
      nome: $('eqNome').value.trim(),
      tipo: $('eqTipo').value.trim(),
      placa: $('eqPlaca').value.trim().toUpperCase(),
      motorista: motoristaSelecionado,
      operacoes: []
    });
  }

  saveState();
  render();
  $('modalEquipe').close();
}

/* RENDERIZAÇÃO DO KANBAN */
function render() {
  const container = $('kanbanGrid');
  container.innerHTML = '';

  let totalOps = 0;

  state.equipes.forEach(eq => {
    totalOps += eq.operacoes.length;

    const card = document.createElement('div');
    card.className = 'kanban-card';

    card.innerHTML = `
      <div class="kanban-header">
        <div class="kanban-header-top">
          <span class="kanban-badge">${escapeHtml(eq.nome)}</span>
          <div class="row-actions">
            <button class="btn-icon edit" onclick="editEquipe('${eq.id}')" title="Editar Quadro">✏️</button>
            <button class="btn-icon" onclick="deleteEquipe('${eq.id}')" title="Excluir Quadro">🗑️</button>
          </div>
        </div>

        <div class="kanban-info-grid">
          <div class="kanban-info-item">
            <strong>Tipo</strong>
            ${escapeHtml(eq.tipo || '-')}
          </div>
          <div class="kanban-info-item">
            <strong>Placa</strong>
            ${escapeHtml(eq.placa || '-')}
          </div>
          <div class="kanban-info-item" style="grid-column: span 2;">
            <strong>Motorista Escalado</strong>
            ${escapeHtml(eq.motorista || '-')}
          </div>
        </div>
      </div>

      <div class="kanban-body">
        ${eq.operacoes.length === 0 
          ? '<p style="font-size: 10px; color: var(--text-faint); margin: 6px 0; text-align: center;">Sem operações ativas</p>'
          : eq.operacoes.map(op => `
            <div class="op-item">
              <span class="op-bloco-tag">${escapeHtml(op.bloco || 'Operação')}</span>
              <div class="op-header">
                <span class="op-cte">${escapeHtml(op.cte || '—')}</span>
                <span class="op-horario">🕒 ${escapeHtml(op.horario || '—')}</span>
              </div>
              <div class="op-details">
                <div>Cliente: <span>${escapeHtml(op.cliente || '—')}</span></div>
                <div>Destino: <span>${escapeHtml(op.destinatario || '—')}</span></div>
              </div>
              <div class="op-tags">
                ${op.rastreado ? '<span class="pill yes">Rastreado</span>' : ''}
                ${op.ajudante ? '<span class="pill yes">Ajudante</span>' : ''}
              </div>
              <div class="row-actions" style="margin-top: 6px; justify-content: flex-end;">
                <button class="btn-icon edit" onclick="editOperacao('${eq.id}', '${op.id}')" title="Editar Operação">✏️</button>
                <button class="btn-icon" onclick="deleteOperacao('${eq.id}', '${op.id}')" title="Excluir Operação">✕</button>
              </div>
            </div>
          `).join('')}
      </div>

      <div class="kanban-footer">
        <button class="btn btn-ghost" style="width: 100%;" onclick="openOperacaoModal('${eq.id}')">+ Adicionar Operação</button>
      </div>
    `;

    container.appendChild(card);
  });

  $('kpiTotalEquipes').textContent = state.equipes.length;
  $('kpiTotalOperacoes').textContent = totalOps;
  $('kpiTotalVeiculosCadastrados').textContent = state.veiculos.length;
  $('kpiTotalMotoristasCadastrados').textContent = state.motoristas.length;
}

/* DEMAIS FUNÇÕES DE OPERAÇÃO E TEMA */
function initTheme() {
  const saved = localStorage.getItem(THEME_KEY) || 'dark';
  applyTheme(saved);
}

function applyTheme(theme) {
  state.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
  $('themeIcon').textContent = theme === 'light' ? '☀️' : '🌙';
  $('themeLabel').textContent = theme === 'light' ? 'Claro' : 'Escuro';
}

function toggleTheme() {
  applyTheme(state.theme === 'dark' ? 'light' : 'dark');
}

function initDate() {
  $('inputDate').value = state.date;
  $('inputDate').addEventListener('change', (e) => {
    state.date = e.target.value;
    fetchKanbanData();
  });
}

async function fetchKanbanData() {
  const connStatus = $('connStatus');
  const connLabel = $('connLabel');
  try {
    const res = await fetch(`${API_BASE_URL}/kanban?data=${state.date}`);
    if (!res.ok) throw new Error();
    state.equipes = await res.json();
    connStatus.setAttribute('data-state', 'online');
    connLabel.textContent = 'API Conectada';
  } catch (err) {
    connStatus.setAttribute('data-state', 'offline');
    connLabel.textContent = 'Modo Local';
    loadLocalData();
  }
  render();
}

function loadLocalData() {
  const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
  state.equipes = raw ? JSON.parse(raw) : structuredClone(seedData);
}

function saveState() {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state.equipes));
}

window.editEquipe = function(id) {
  const eq = state.equipes.find(item => item.id === id);
  if (eq) openEquipeModal(eq);
};

window.deleteEquipe = function(id) {
  if (confirm('Excluir quadro?')) {
    state.equipes = state.equipes.filter(item => item.id !== id);
    saveState();
    render();
  }
};

function openOperacaoModal(equipeId, op = null) {
  $('opEquipeId').value = equipeId;
  if (op) {
    $('modalOperacaoTitle').textContent = 'Editar Operação';
    $('opId').value = op.id;
    $('opBloco').value = op.bloco || 'Primeira Operação';
    $('opCte').value = op.cte || '';
    $('opCliente').value = op.cliente || '';
    $('opDestinatario').value = op.destinatario || '';
    $('opHorario').value = op.horario || '';
    $('opRastreado').checked = !!op.rastreado;
    $('opAjudante').checked = !!op.ajudante;
  } else {
    $('modalOperacaoTitle').textContent = 'Adicionar Operação';
    $('formOperacao').reset();
    $('opId').value = '';
  }
  $('modalOperacao').showModal();
}

function handleOperacaoSubmit(e) {
  e.preventDefault();
  const equipeId = $('opEquipeId').value;
  const opId = $('opId').value;

  const eq = state.equipes.find(item => item.id === equipeId);
  if (!eq) return;

  const dataOp = {
    id: opId || 'op-' + Date.now(),
    bloco: $('opBloco').value,
    cte: $('opCte').value.trim(),
    cliente: $('opCliente').value.trim(),
    destinatario: $('opDestinatario').value.trim(),
    horario: $('opHorario').value.trim(),
    rastreado: $('opRastreado').checked,
    ajudante: $('opAjudante').checked
  };

  if (opId) {
    const idx = eq.operacoes.findIndex(o => o.id === opId);
    if (idx !== -1) eq.operacoes[idx] = dataOp;
  } else {
    eq.operacoes.push(dataOp);
  }

  saveState();
  render();
  $('modalOperacao').close();
}

window.editOperacao = function(equipeId, opId) {
  const eq = state.equipes.find(item => item.id === equipeId);
  if (!eq) return;
  const op = eq.operacoes.find(o => o.id === opId);
  if (op) openOperacaoModal(equipeId, op);
};

window.deleteOperacao = function(equipeId, opId) {
  const eq = state.equipes.find(item => item.id === equipeId);
  if (!eq) return;
  if (confirm('Excluir operação?')) {
    eq.operacoes = eq.operacoes.filter(o => o.id !== opId);
    saveState();
    render();
  }
};

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}