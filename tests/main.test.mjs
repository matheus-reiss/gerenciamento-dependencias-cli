import { jest } from "@jest/globals";
import axios from "axios";
import nock from "nock";
import { readFileSync, existsSync, unlinkSync } from "node:fs";
import path from "node:path";
import { main, API_URL } from "../src/index.js";


const { origin, pathname } = new URL(API_URL);
const outputPath = path.resolve("output.json");

jest.setTimeout(20000);
beforeAll(() => nock.disableNetConnect());
afterAll(() => nock.enableNetConnect());
afterEach(() => nock.cleanAll());

// Cleanup
afterEach(() => {
    if (existsSync(outputPath)) {
        unlinkSync(outputPath);
    }
})


describe("Testes positivos da função main", () => {
    test("Deve consumir a API e salvar output.json", async () => {
        nock(origin).get(pathname).reply(200, [{ titulo: "Tarefa 1", concluida: true }]);
        await main();
        expect(existsSync(outputPath)).toBe(true);
    });

    test("Arquivo deve conter JSON válido", async () => {
        nock(origin).get(pathname).reply(200, [{ titulo: "Teste JSON", concluida: false }]);
        await main();
        const content = JSON.parse(readFileSync(outputPath, "utf-8"));
        expect(content).toEqual([{ titulo: "Teste JSON", concluida: false }]);
    });

    test("Deve imprimir tarefas concluídas como ✅", async () => {
        const logSpy = jest.spyOn(console, "log").mockImplementation(() => { });
        nock(origin).get(pathname).reply(200, [{ titulo: "Concluída", concluida: true }]);
        await main();
        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("✅ Concluída"));
        logSpy.mockRestore();
    });

    test("Deve imprimir tarefas pendentes como ❌", async () => {
        const logSpy = jest.spyOn(console, "log").mockImplementation(() => { });
        nock(origin).get(pathname).reply(200, [{ titulo: "Pendente", concluida: false }]);
        await main();
        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("❌ Pendente"));
        logSpy.mockRestore();
    });

    test("Deve lidar com múltiplas tarefas", async () => {
        nock(origin).get(pathname).reply(200, [
            { titulo: "T1", concluida: true },
            { titulo: "T2", concluida: false },
        ]);
        await main();
        const data = JSON.parse(readFileSync(outputPath, "utf-8"));
        expect(data.length).toBe(2);
    });

    test("Output deve ser formatado com indentação", async () => {
        nock(origin).get(pathname).reply(200, [{ titulo: "Format", concluida: true }]);
        await main();
        const raw = readFileSync(outputPath, "utf-8");
        expect(raw.includes("\n")).toBe(true);
    });

    test("Deve não lançar erro com lista vazia", async () => {
        nock(origin).get(pathname).reply(200, []);
        await expect(main()).resolves.not.toThrow();
    });

    test("Deve registrar início do consumo da API", async () => {
        const logSpy = jest.spyOn(console, "log").mockImplementation(() => { });
        nock(origin).get(pathname).reply(200, []);
        await main();
        expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Iniciando consumo da API"));
        logSpy.mockRestore();
    });

    test("Deve criar output.json mesmo com dados vazios", async () => {
        nock(origin).get(pathname).reply(200, []);
        await main();
        expect(existsSync(outputPath)).toBe(true);
    });

    test("Deve salvar corretamente caracteres especiais", async () => {
        const titulo = "Tarefa com acento é ç";
        nock(origin).get(pathname).reply(200, [{ titulo, concluida: true }]);
        await main();
        const saved = JSON.parse(readFileSync(outputPath, "utf-8"));
        expect(saved[0].titulo).toBe(titulo);
    });
});

describe("Testes negativos da função main", () => {
    test("Deve lançar erro se a API retornar objeto em vez de array", async () => {
        nock(origin).get(pathname).reply(200, { titulo: "obj" });
        await expect(main()).rejects.toThrow("Resposta inesperada da API");
    });

    test("Deve capturar erro de rede (500)", async () => {
        nock(origin).get(pathname).reply(500);
        await expect(main()).rejects.toThrow();
    });

    test("Deve capturar erro de timeout", async () => {
        nock(origin).get(pathname).delay(11000).reply(200, []);
        await expect(main()).rejects.toThrow();
    });

    test("Deve falhar se a API responder 204 (sem conteúdo)", async () => {
        nock(origin).get(pathname).reply(204);
        await expect(main()).rejects.toThrow();
    });

    test("Deve falhar se resposta da API for null", async () => {
        nock(origin).get(pathname).reply(200, null);
        await expect(main()).rejects.toThrow();
    });

    test("Deve falhar se resposta da API for string", async () => {
        nock(origin).get(pathname).reply(200, "string");
        await expect(main()).rejects.toThrow();
    });

    test("Deve falhar se axios não conseguir resolver DNS", async () => {
        // com rede desabilitada pelo nock, também falha — o objetivo é falhar
        await expect(axios.get("http://dominioinexistente.teste")).rejects.toThrow();
    });

    test("Detecta item sem título no output (sem lançar erro)", async () => {
        nock(origin).get(pathname).reply(200, [{ concluida: true }]);
        await main();
        const saved = JSON.parse(readFileSync(outputPath, "utf-8"));
        expect(saved[0].titulo).toBeUndefined();
    });

    test("Detecta 'concluida' não booleana (sem lançar erro)", async () => {
        nock(origin).get(pathname).reply(200, [{ titulo: "Inválida", concluida: "sim" }]);
        await main();
        const saved = JSON.parse(readFileSync(outputPath, "utf-8"));
        expect(typeof saved[0].concluida).not.toBe("boolean");
    });

    test("Manipula array muito grande  (sem lançar erro)", async () => {
        const bigArray = Array.from({ length: 1001 }, (_, i) => ({ titulo: `T${i}`, concluida: false }));
        nock(origin).get(pathname).reply(200, bigArray);
        await main();
        const saved = JSON.parse(readFileSync(outputPath, "utf-8"));
        expect(saved.length).toBeGreaterThan(1000);
    });
});