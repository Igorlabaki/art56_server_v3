import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true, // Habilita o uso de variáveis globais como describe, it, expect
        environment: 'node', // Ou 'jsdom' para testes no ambiente do navegador
        coverage: {
            reporter: ['text', 'json', 'html'], // Tipos de relatórios de cobertura
        },
    },
});