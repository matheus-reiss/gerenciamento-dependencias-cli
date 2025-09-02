import axios from "axios";
import chalk from "chalk";
import { writeFileSync } from "node:fs";

export const API_URL = "https://mocki.io/v1/e3016b7c-0966-47a8-9bc5-514daacfbd93";

export async function main(apiUrl = API_URL) {
    console.log(chalk.blue("Iniciando consumo da API (Mocki) "));
    const { data } = await axios.get(apiUrl, { timeout: 10000 });
    if (!Array.isArray(data)) throw new Error("Resposta inesperada da API (esperado um array).");

    console.log(chalk.yellow("⬇️  Tarefas:"));
    data.forEach(t => {
        const status = t.concluida ? chalk.green("✅ Concluída") : chalk.red("❌ Pendente");
        console.log(`- ${t.titulo} [${status}]`);
    });

    writeFileSync("output.json", JSON.stringify(data, null, 2), "utf-8");
    console.log(chalk.magenta("\n Arquivo salvo em output.json"));
}

// Executa só quando rodado via CLI (não em import para testes)
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch((err) => {
        console.error(chalk.red("❌ Erro:"), err.message);
        process.exit(1);
    });
}