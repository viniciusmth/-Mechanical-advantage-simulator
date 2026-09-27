import { defineConfig } from 'vite';
import obfuscatorPlugin from 'vite-plugin-javascript-obfuscator';

export default defineConfig({
    plugins: [
        obfuscatorPlugin({
            include: ['src/**/*.js', 'main.js'],
            exclude: [/node_modules/],
            apply: 'build', // Aplica a ofuscação apenas ao gerar a versão final
            options: {
                compact: true,
                controlFlowFlattening: true, // Quebra a estrutura lógica de leitura
                controlFlowFlatteningThreshold: 1,
                numbersToExpressions: true, // Oculta números importantes (como MA, pesos)
                simplify: true,
                stringArray: true,
                stringArrayEncoding: ['rc4'], // Criptografa strings (nomes de variáveis e componentes)
                stringArrayThreshold: 1,
                unicodeEscapeSequence: false,
                // TRAVA DE DOMÍNIO: Adicione seu domínio real abaixo
                domainLock: ['https://mechanical-advantage-simulator.vercel.app/', 'http://localhost:5173/'], // Domínios permitidos
                domainLockRedirectUrl: 'about:blank' // Para onde mandar se for roubado
            }
        })
    ]
});