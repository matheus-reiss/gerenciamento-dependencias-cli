
#  Gerenciamento de Dependências – CLI de Tarefas

Uma CLI em **Node.js** para demonstrar **gerenciamento de dependências** com npm e **build automatizado** com esbuild.
Consome a API pública **Mocki**  ([endpoint](https://mocki.io/v1/d9180db7-b6b3-4a1e-be6d-c46d85a8fd08)) com tarefas em PT-BR, exibe no terminal (chalk) e gera `output.json`

##  Construído com
**Ambiente de execução e gerenciador de pacotes**
- Node.js 18+, npm
**Dependências de execução**
- axios — requisições HTTP
- chalk — cores no terminal
**Dependências de desenvolvimento (build)**
- esbuild — bundle `dist/bundle.js`


## Funcionalidades

- Requisição HTTP à API do Mocki (tarefas em PT-BR)
- Exibição colorida no terminal (✅ concluída / ❌ pendente)
- Geração do arquivo `output.json` com os dados recebidos
- Build com esbuild gerando `dist/bundle.js` (artefato final)


## Pré-requisitos

- Node.js 18+ e npm

Verificar:
```bash
  node -v
  npm -v
```

Instalação

```bash
  npm install
```

Executar
    
```bash
  npm start
```


Build (artefato)

```bash
  npm run build   
```

Executar o artefato final:
```bash
  npm run run:dist  
```

## Documentação da API

**Endpoint**
- https://mocki.io/v1/d9180db7-b6b3-4a1e-be6d-c46d85a8fd08

**Formato esperado**
```json
[
[{"id":1,"titulo":"Estudar Node.js","concluida":false},{"id":2,"titulo":"Fazer exercício de Engenharia de Software","concluida":true}

```
Para trocar a fonte de dados, altere a constante API_URL em src/index.js.

**Saida esperada**
```json
Iniciando consumo da API (Mocki) 
⬇️  Tarefas:
- Estudar Banco de dados [❌ Pendente]
- Fazer exercício de Engenharia de Software [✅ Concluída]

 Arquivo salvo em output.json
```