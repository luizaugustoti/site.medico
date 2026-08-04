# Painel de Frota — Front-end

Front-end pronto (HTML + CSS + JS puro, sem build) para substituir a planilha
de controle diário de veículos e operações. Já funciona sozinho com dados de
exemplo e está preparado para plugar num back-end Python.

## Como abrir
Abra `index.html` no navegador (ou sirva a pasta com `python -m http.server`).
Sem back-end, ele carrega dados de exemplo automaticamente e mostra
"back-end não conectado" no topo.

## Arquivos
- `index.html` — estrutura (tabela de veículos, tabela de operações com abas 1ª/2ª/3ª, modais de cadastro)
- `style.css` — identidade visual (tema "mesa de despacho")
- `app.js` — estado, renderização e a camada de API

## Contrato esperado do back-end (Flask/FastAPI)
Ajuste `API_BASE_URL` no topo de `app.js`. Os endpoints esperados:

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/veiculos` | lista todos os veículos |
| POST | `/api/veiculos` | cria veículo (JSON do objeto veículo) |
| PUT | `/api/veiculos/{id}` | atualiza veículo |
| DELETE | `/api/veiculos/{id}` | remove veículo |
| GET | `/api/operacoes?data=YYYY-MM-DD&numero=1` | lista operações da data/aba |
| POST | `/api/operacoes` | cria operação |
| PUT | `/api/operacoes/{id}` | atualiza operação |
| DELETE | `/api/operacoes/{id}` | remove operação |

### Objeto veículo
```json
{
  "id": "v1",
  "equipamento": "1",
  "tipo": "Fiorino",
  "placa": "PBW-1658",
  "motorista": "Carlos Jorge",
  "cpf": "584.836.001-00",
  "tela": true,
  "cvv": true,
  "implemento": "",
  "rastreador": "Sascar Full",
  "redundancia": "T4S",
  "diaria": 0
}
```

### Objeto operação
```json
{
  "id": "o1",
  "veiculoId": "v1",
  "numeroOperacao": 1,
  "data": "2026-07-04",
  "cte": "12607",
  "cliente": "KM CARGO",
  "destinatario": "AMERICANAS",
  "horario": "08:00",
  "rastreado": true,
  "ajudante": false
}
```

Habilite CORS no back-end para o domínio onde este front-end for servido.


