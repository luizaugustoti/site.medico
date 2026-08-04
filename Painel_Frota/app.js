/* ==========================================================================
   Painel de Frota — app.js
   Front-end puro (sem dependências). Pronto para integração com back-end
   Python (Flask/FastAPI). Todos os pontos de integração estão marcados com
   "🔌 BACK-END:" — troque as funções api* por chamadas reais ao seu servidor.
   ========================================================================== */

// 🔌 BACK-END: endereço base da API Python. Ajuste para o seu servidor.
const API_BASE_URL = "http://localhost:8000/api";

// --------------------------------------------------------------------------
// ESTADO
// --------------------------------------------------------------------------
const state = {
  veiculos: [],   // { id, equipamento, tipo, placa, motorista, cpf, tela, cvv, implemento, rastreador, redundancia, diaria }
  operacoes: [],  // { id, veiculoId, numeroOperacao, data, cte, cliente, destinatario, horario, rastreado, ajudante }
  activeOp: 1,
  online: false,
};

// --------------------------------------------------------------------------
// DADOS DE EXEMPLO (usados apenas se o back-end não responder)
// Extraídos da planilha original para o dia 04/07/2026.
// --------------------------------------------------------------------------
const SEED_VEICULOS = [
  { id: "v1",  equipamento: "1",  tipo: "Fiorino", placa: "PBW-1658", motorista: "Carlos Jorge",       cpf: "584.836.001-00", tela: true,  cvv: true,  implemento: "",            rastreador: "Sascar Full", redundancia: "T4S", diaria: 0 },
  { id: "v2",  equipamento: "2",  tipo: "Van",     placa: "QPS-6C38", motorista: "Maxuel Regis",       cpf: "473.666.481-91", tela: true,  cvv: true,  implemento: "",            rastreador: "Ominilink",   redundancia: "T4S", diaria: 0 },
  { id: "v3",  equipamento: "3",  tipo: "Van",     placa: "QKL-0A42", motorista: "Islan de Oliveira",  cpf: "076.738.001-01", tela: false, cvv: false, implemento: "",            rastreador: "Não",         redundancia: "Não", diaria: 0 },
  { id: "v4",  equipamento: "3",  tipo: "HR",      placa: "FDW-5E12", motorista: "Edson Bispo",        cpf: "003.280.041-03", tela: true,  cvv: true,  implemento: "Refrigerado", rastreador: "Sascar Full", redundancia: "T4S", diaria: 0 },
  { id: "v5",  equipamento: "5",  tipo: "3/4",     placa: "EFV-9132", motorista: "Antonio da Silva",   cpf: "632.404.752-00", tela: true,  cvv: false, implemento: "Plataforma",  rastreador: "Sascar Full", redundancia: "T4S", diaria: 0 },
  { id: "v6",  equipamento: "6",  tipo: "Toco",    placa: "SKB-2B74", motorista: "Marcelo Barros",     cpf: "010.171.661-37", tela: true,  cvv: true,  implemento: "",            rastreador: "T4S",         redundancia: "",    diaria: 0 },
  { id: "v7",  equipamento: "7",  tipo: "Van",     placa: "REF-6J46", motorista: "Creovani de Paula",  cpf: "849.065.291-00", tela: true,  cvv: false, implemento: "",            rastreador: "T4S",         redundancia: "",    diaria: 380 },
  { id: "v8",  equipamento: "8",  tipo: "Fiorino", placa: "OZX-1E53", motorista: "Marcio da Encarnacao",cpf:"051.627.255-10",  tela: true,  cvv: false, implemento: "",            rastreador: "Ominilink",   redundancia: "Não", diaria: 300 },
  { id: "v9",  equipamento: "9",  tipo: "Fiorino", placa: "PAL-3I73", motorista: "Eduardo Inacio",     cpf: "484.453.201-49", tela: false, cvv: false, implemento: "",            rastreador: "Ominilink",   redundancia: "Não", diaria: 300 },
  { id: "v10", equipamento: "10", tipo: "Fiorino", placa: "PQU-5G57", motorista: "Gilmar Goncalves",   cpf: "021.828.471-38", tela: true,  cvv: false, implemento: "",            rastreador: "Sascar Full", redundancia: "Não", diaria: 300 },
  { id: "v11", equipamento: "11", tipo: "Fiorino", placa: "OZY-6A17", motorista: "Erick Lourenco",     cpf: "988.068.401-00", tela: false, cvv: false, implemento: "",            rastreador: "Ominilink",   redundancia: "Não", diaria: 300 },
];

const SEED_OPERACOES = [
  { id: "o1", veiculoId: "v1", numeroOperacao: 1, data: "2026-07-04", cte: "12607", cliente: "KM CARGO", destinatario: "AMERICANAS", horario: "08:00", rastreado: true, ajudante: false },
  { id: "o2", veiculoId: "v2", numeroOperacao: 1, data: "2026-07-04", cte: "KM CARGO", cliente: "DUFRY", destinatario: "KM CARGO", horario: "07:30", rastreado: true, ajudante: true },
  { id: "o3", veiculoId: "v7", numeroOperacao: 1, data: "2026-07-04", cte: "228455/228451/228448", cliente: "SHUTTLE", destinatario: "BENENUTRI", horario: "08AS15", rastreado: false, ajudante: false },
];

// --------------------------------------------------------------------------
// 🔌 BACK-END: camada de API — troque o corpo destas funções por fetch()
// reais assim que o servidor Python estiver no ar. Os endpoints sugeridos
// já seguem convenção REST para facilitar (ver README ao final).
// --------------------------------------------------------------------------
async function apiListarVeiculos() {
  const res = await fetch(`${API_BASE_URL}/veiculos`);
  if (!res.ok) throw new Error("Falha ao listar veículos");
  return res.json();
}

async function apiSalvarVeiculo(veiculo) {
  const method = veiculo.id && !veiculo.id.startsWith("tmp_") ? "PUT" : "POST";
  const url = method === "PUT" ? `${API_BASE_URL}/veiculos/${veiculo.id}` : `${API_BASE_URL}/veiculos`;
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(veiculo),
  });
  if (!res.ok) throw new Error("Falha ao salvar veículo");
  return res.json();
}

async function apiExcluirVeiculo(id) {
  const res = await fetch(`${API_BASE_URL}/veiculos/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Falha ao excluir veículo");
}

async function apiListarOperacoes(data, numeroOperacao) {
  const res = await fetch(`${API_BASE_URL}/operacoes?data=${data}&numero=${numeroOperacao}`);
  if (!res.ok) throw new Error("Falha ao listar operações");
  return res.json();
}

async function apiSalvarOperacao(operacao) {
  const method = operacao.id && !operacao.id.startsWith("tmp_") ? "PUT" : "POST";
  const url = method === "PUT" ? `${API_BASE_URL}/operacoes/${operacao.id}` : `${API_BASE_URL}/operacoes`;
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(operacao),
  });
  if (!res.ok) throw new Error("Falha ao salvar operação");
  return res.json();
}

async function apiExcluirOperacao(id) {
  const res = await fetch(`${API_BASE_URL}/operacoes/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Falha ao excluir operação");
}

// --------------------------------------------------------------------------
// CARGA INICIAL — tenta o back-end; se indisponível, usa dados de exemplo
// --------------------------------------------------------------------------
async function carregarDados() {
  try {
    const [veiculos, operacoes] = await Promise.all([
      apiListarVeiculos(),
      apiListarOperacoes(document.getElementById("agenda-date").value, state.activeOp),
    ]);
    state.veiculos = veiculos;
    state.operacoes = operacoes;
    state.online = true;
  } catch (err) {
    console.warn("Back-end indisponível, usando dados de exemplo locais.", err);
    state.veiculos = structuredClone(SEED_VEICULOS);
    state.operacoes = structuredClone(SEED_OPERACOES);
    state.online = false;
  }
  atualizarStatusConexao();
  renderResumo();
  renderVeiculos();
  renderOperacoes();
}

function atualizarStatusConexao() {
  const el = document.getElementById("conn-status");
  el.dataset.state = state.online ? "online" : "offline";
  document.getElementById("conn-text").textContent = state.online ? "back-end conectado" : "back-end não conectado";
}

// --------------------------------------------------------------------------
// RENDER — RESUMO
// --------------------------------------------------------------------------
function renderResumo() {
  const total = state.veiculos.length;
  const comRastreador = state.veiculos.filter(v => v.rastreador && v.rastreador.toLowerCase() !== "não" && v.rastreador.toLowerCase() !== "nao").length;
  const diariaTotal = state.veiculos.reduce((sum, v) => sum + (Number(v.diaria) || 0), 0);
  const opsHoje = state.operacoes.length;

  document.getElementById("summary-bar").innerHTML = `
    <div class="summary-card"><span class="label">Veículos cadastrados</span><span class="value">${total}</span></div>
    <div class="summary-card"><span class="label">Com rastreador ativo</span><span class="value ok">${comRastreador}</span></div>
    <div class="summary-card"><span class="label">Diárias no dia</span><span class="value accent">R$ ${diariaTotal.toLocaleString("pt-BR")}</span></div>
    <div class="summary-card"><span class="label">Operações (aba atual)</span><span class="value">${opsHoje}</span></div>
  `;
}

// --------------------------------------------------------------------------
// RENDER — TABELA DE VEÍCULOS
// --------------------------------------------------------------------------
function pill(valorBooleanoOuTexto) {
  const isYes = valorBooleanoOuTexto === true ||
    (typeof valorBooleanoOuTexto === "string" &&
      !["não", "nao", "", "0", "false"].includes(valorBooleanoOuTexto.toLowerCase()));
  const label = typeof valorBooleanoOuTexto === "boolean" ? (valorBooleanoOuTexto ? "Sim" : "Não") : (valorBooleanoOuTexto || "—");
  return `<span class="pill ${isYes ? "yes" : "no"}">${label}</span>`;
}

function renderVeiculos() {
  const tbody = document.getElementById("veiculos-tbody");
  if (!state.veiculos.length) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="12">Nenhum veículo cadastrado ainda. Clique em "Adicionar veículo".</td></tr>`;
    return;
  }
  tbody.innerHTML = state.veiculos.map(v => `
    <tr data-id="${v.id}">
      <td class="mono">${v.equipamento}</td>
      <td>${v.tipo}</td>
      <td class="mono">${v.placa}</td>
      <td>${v.motorista || "—"}</td>
      <td class="mono">${v.cpf || "—"}</td>
      <td>${pill(v.tela)}</td>
      <td>${pill(v.cvv)}</td>
      <td>${v.implemento || "—"}</td>
      <td>${pill(v.rastreador)}</td>
      <td>${v.redundancia || "—"}</td>
      <td class="col-money">${v.diaria ? "R$ " + Number(v.diaria).toLocaleString("pt-BR") : "—"}</td>
      <td class="col-actions">
        <div class="row-actions">
          <button class="btn-icon edit" title="Editar" onclick="abrirModalVeiculo('${v.id}')">✎</button>
          <button class="btn-icon" title="Excluir" onclick="excluirVeiculo('${v.id}')">✕</button>
        </div>
      </td>
    </tr>
  `).join("");
}

// --------------------------------------------------------------------------
// RENDER — TABELA DE OPERAÇÕES (filtra pela aba ativa: 1ª/2ª/3ª)
// --------------------------------------------------------------------------
function nomeVeiculo(id) {
  const v = state.veiculos.find(v => v.id === id);
  return v ? `${v.equipamento} · ${v.tipo} (${v.placa})` : "—";
}

function renderOperacoes() {
  const lista = state.operacoes.filter(o => o.numeroOperacao === state.activeOp);
  const tbody = document.getElementById("operacoes-tbody");
  if (!lista.length) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="8">Nenhuma operação registrada para esta aba/data.</td></tr>`;
    return;
  }
  tbody.innerHTML = lista.map(o => `
    <tr data-id="${o.id}">
      <td>${nomeVeiculo(o.veiculoId)}</td>
      <td class="mono">${o.cte || "—"}</td>
      <td>${o.cliente || "—"}</td>
      <td>${o.destinatario || "—"}</td>
      <td class="mono">${o.horario || "—"}</td>
      <td>${pill(o.rastreado)}</td>
      <td>${pill(o.ajudante)}</td>
      <td class="col-actions">
        <div class="row-actions">
          <button class="btn-icon edit" title="Editar" onclick="abrirModalOperacao('${o.id}')">✎</button>
          <button class="btn-icon" title="Excluir" onclick="excluirOperacao('${o.id}')">✕</button>
        </div>
      </td>
    </tr>
  `).join("");
}

// --------------------------------------------------------------------------
// MODAIS — VEÍCULO
// --------------------------------------------------------------------------
const modalVeiculo = document.getElementById("modal-veiculo");

function abrirModalVeiculo(id) {
  const v = id ? state.veiculos.find(v => v.id === id) : null;
  document.getElementById("modal-veiculo-title").textContent = v ? "Editar veículo" : "Adicionar veículo";
  document.getElementById("v-id").value = v ? v.id : "";
  document.getElementById("v-equipamento").value = v ? v.equipamento : "";
  document.getElementById("v-tipo").value = v ? v.tipo : "";
  document.getElementById("v-placa").value = v ? v.placa : "";
  document.getElementById("v-motorista").value = v ? v.motorista : "";
  document.getElementById("v-cpf").value = v ? v.cpf : "";
  document.getElementById("v-implemento").value = v ? v.implemento : "";
  document.getElementById("v-rastreador").value = v ? v.rastreador : "";
  document.getElementById("v-redundancia").value = v ? v.redundancia : "";
  document.getElementById("v-diaria").value = v ? v.diaria : "";
  document.getElementById("v-tela").checked = v ? !!v.tela : false;
  document.getElementById("v-cvv").checked = v ? !!v.cvv : false;
  modalVeiculo.showModal();
}

document.getElementById("btn-add-veiculo").addEventListener("click", () => abrirModalVeiculo(null));
document.getElementById("btn-cancel-veiculo").addEventListener("click", () => modalVeiculo.close());

document.getElementById("form-veiculo").addEventListener("submit", async (e) => {
  e.preventDefault();
  const idExistente = document.getElementById("v-id").value;
  const veiculo = {
    id: idExistente || "tmp_" + crypto.randomUUID(),
    equipamento: document.getElementById("v-equipamento").value.trim(),
    tipo: document.getElementById("v-tipo").value.trim(),
    placa: document.getElementById("v-placa").value.trim(),
    motorista: document.getElementById("v-motorista").value.trim(),
    cpf: document.getElementById("v-cpf").value.trim(),
    implemento: document.getElementById("v-implemento").value.trim(),
    rastreador: document.getElementById("v-rastreador").value.trim(),
    redundancia: document.getElementById("v-redundancia").value.trim(),
    diaria: Number(document.getElementById("v-diaria").value) || 0,
    tela: document.getElementById("v-tela").checked,
    cvv: document.getElementById("v-cvv").checked,
  };

  try {
    const salvo = state.online ? await apiSalvarVeiculo(veiculo) : veiculo;
    const idx = state.veiculos.findIndex(v => v.id === idExistente);
    if (idx >= 0) state.veiculos[idx] = salvo; else state.veiculos.push(salvo);
    setStatus(`Veículo ${salvo.equipamento} salvo${state.online ? "" : " localmente (back-end offline)"}.`);
  } catch (err) {
    setStatus("Erro ao salvar veículo: " + err.message, true);
  }
  modalVeiculo.close();
  renderResumo();
  renderVeiculos();
});

async function excluirVeiculo(id) {
  if (!confirm("Excluir este veículo?")) return;
  try {
    if (state.online) await apiExcluirVeiculo(id);
    state.veiculos = state.veiculos.filter(v => v.id !== id);
    state.operacoes = state.operacoes.filter(o => o.veiculoId !== id);
    setStatus("Veículo excluído.");
  } catch (err) {
    setStatus("Erro ao excluir veículo: " + err.message, true);
  }
  renderResumo();
  renderVeiculos();
  renderOperacoes();
}

// --------------------------------------------------------------------------
// MODAIS — OPERAÇÃO
// --------------------------------------------------------------------------
const modalOperacao = document.getElementById("modal-operacao");

function preencherSelectVeiculos(selecionadoId) {
  const select = document.getElementById("o-veiculo-id");
  select.innerHTML = state.veiculos.map(v =>
    `<option value="${v.id}" ${v.id === selecionadoId ? "selected" : ""}>${v.equipamento} · ${v.tipo} (${v.placa})</option>`
  ).join("");
}

function abrirModalOperacao(id) {
  const o = id ? state.operacoes.find(o => o.id === id) : null;
  document.getElementById("modal-operacao-title").textContent = o ? "Editar operação" : `Adicionar operação (${state.activeOp}ª)`;
  document.getElementById("o-id").value = o ? o.id : "";
  preencherSelectVeiculos(o ? o.veiculoId : state.veiculos[0]?.id);
  document.getElementById("o-cte").value = o ? o.cte : "";
  document.getElementById("o-cliente").value = o ? o.cliente : "";
  document.getElementById("o-destinatario").value = o ? o.destinatario : "";
  document.getElementById("o-horario").value = o ? o.horario : "";
  document.getElementById("o-rastreado").checked = o ? !!o.rastreado : false;
  document.getElementById("o-ajudante").checked = o ? !!o.ajudante : false;
  modalOperacao.showModal();
}

document.querySelectorAll(".op-tab").forEach(tab => {
  tab.addEventListener("click", async () => {
    document.querySelectorAll(".op-tab").forEach(t => t.classList.remove("is-active"));
    tab.classList.add("is-active");
    state.activeOp = Number(tab.dataset.op);
    if (state.online) {
      state.operacoes = await apiListarOperacoes(document.getElementById("agenda-date").value, state.activeOp);
    }
    renderResumo();
    renderOperacoes();
  });
});

document.getElementById("btn-cancel-operacao").addEventListener("click", () => modalOperacao.close());

document.getElementById("form-operacao").addEventListener("submit", async (e) => {
  e.preventDefault();
  const idExistente = document.getElementById("o-id").value;
  const operacao = {
    id: idExistente || "tmp_" + crypto.randomUUID(),
    veiculoId: document.getElementById("o-veiculo-id").value,
    numeroOperacao: state.activeOp,
    data: document.getElementById("agenda-date").value,
    cte: document.getElementById("o-cte").value.trim(),
    cliente: document.getElementById("o-cliente").value.trim(),
    destinatario: document.getElementById("o-destinatario").value.trim(),
    horario: document.getElementById("o-horario").value.trim(),
    rastreado: document.getElementById("o-rastreado").checked,
    ajudante: document.getElementById("o-ajudante").checked,
  };

  try {
    const salvo = state.online ? await apiSalvarOperacao(operacao) : operacao;
    const idx = state.operacoes.findIndex(o => o.id === idExistente);
    if (idx >= 0) state.operacoes[idx] = salvo; else state.operacoes.push(salvo);
    setStatus(`Operação salva${state.online ? "" : " localmente (back-end offline)"}.`);
  } catch (err) {
    setStatus("Erro ao salvar operação: " + err.message, true);
  }
  modalOperacao.close();
  renderResumo();
  renderOperacoes();
});

async function excluirOperacao(id) {
  if (!confirm("Excluir esta operação?")) return;
  try {
    if (state.online) await apiExcluirOperacao(id);
    state.operacoes = state.operacoes.filter(o => o.id !== id);
    setStatus("Operação excluída.");
  } catch (err) {
    setStatus("Erro ao excluir operação: " + err.message, true);
  }
  renderResumo();
  renderOperacoes();
}

// --------------------------------------------------------------------------
// SALVAR TUDO / TROCA DE DATA / STATUS
// --------------------------------------------------------------------------
document.getElementById("btn-save-all").addEventListener("click", async () => {
  if (!state.online) {
    setStatus("Não é possível salvar: back-end não conectado. Configure API_BASE_URL em app.js.", true);
    return;
  }
  try {
    await Promise.all(state.veiculos.map(apiSalvarVeiculo));
    await Promise.all(state.operacoes.map(apiSalvarOperacao));
    setStatus("Tudo salvo no servidor.");
  } catch (err) {
    setStatus("Erro ao salvar: " + err.message, true);
  }
});

document.getElementById("agenda-date").addEventListener("change", carregarDados);

function setStatus(msg, isError = false) {
  const el = document.getElementById("status-msg");
  el.textContent = msg;
  el.style.color = isError ? "var(--red)" : "var(--text-faint)";
}

// --------------------------------------------------------------------------
// INICIALIZAÇÃO
// --------------------------------------------------------------------------
carregarDados();
