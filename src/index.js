import axios from "axios";
import chalk from "chalk";
import { writeFileSync } from "node:fs";

const API_URL = "https://mocki.io/v1/e3016b7c-0966-47a8-9bc5-514daacfbd93";

async function main() {
    console.log(chalk.blue("Iniciando consumo da API (Mocki) "));
    const { data } = await axios.get(API_URL, { timeout: 10000 });
    if (!Array.isArray(data)) throw new Error("Resposta inesperada da API (esperado um array).");

    // -- Filtro por status via CLI: --status=concluida | --status=pendente
    const arg = process.argv.find(a => a.startsWith("--status="));
    const nextIdx = process.argv.indexOf("--status");
    const fromNext = nextIdx >= 0 && process.argv[nextIdx + 1] && !process.argv[nextIdx + 1].startsWith("--")
        ? process.argv[nextIdx + 1]
        : null;
    const fromNpmEnv = process.env.npm_config_status || null;

    const raw = arg ? arg.split("=")[1] : (fromNext ?? fromNpmEnv);
    const filtro = raw ? raw.toLowerCase() : null;
    
    const isDone = (v) => v === true || v === "true" || v === 1 || v === "1";

    const lista = filtro === "concluida" ? data.filter(t => isDone(t.concluida)) : filtro === "pendente" ? data.filter(t => !isDone(t.concluida)) : data;

    if (filtro && lista.length === 0) {
        console.log(chalk.gray("(Nenhuma tarefa encontrada para o filtro informado.)"));
    }

    console.log(chalk.yellow("⬇️  Tarefas:"));
    lista.forEach(t => {
        const done = isDone(t.concluida);
        const status = done ? chalk.green("✅ Concluída") : chalk.red("❌ Pendente");
        console.log(`- ${t.titulo} [${status}]`);
    });

    writeFileSync("output.json", JSON.stringify(lista, null, 2), "utf-8");
    console.log(chalk.magenta("\n Arquivo salvo em output.json"));
}

main().catch(err => {
    console.error(chalk.red("❌ Erro:"), err.message);
});