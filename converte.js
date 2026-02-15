const fs = require('fs');
const path = require('path');

// --- CONFIGURAÇÕES ---
const PASTA_ENTRADA = './data';
const PASTA_SAIDA = './biblia original';

// Tua lista completa de 66 livros
const LIVROS = [
    { pt: "Gênesis", en: "genesis", caps: 50 }, { pt: "Êxodo", en: "exodus", caps: 40 },
    { pt: "Levítico", en: "leviticus", caps: 27 }, { pt: "Números", en: "numbers", caps: 36 },
    { pt: "Deuteronômio", en: "deuteronomy", caps: 34 }, { pt: "Josué", en: "joshua", caps: 24 },
    { pt: "Juízes", en: "judges", caps: 21 }, { pt: "Rute", en: "ruth", caps: 4 },
    { pt: "1 Samuel", en: "1_samuel", caps: 31 }, { pt: "2 Samuel", en: "2_samuel", caps: 24 },
    { pt: "1 Reis", en: "1_kings", caps: 22 }, { pt: "2 Reis", en: "2_kings", caps: 25 },
    { pt: "1 Crônicas", en: "1_chronicles", caps: 29 }, { pt: "2 Crônicas", en: "2_chronicles", caps: 36 },
    { pt: "Esdras", en: "ezra", caps: 10 }, { pt: "Neemias", en: "nehemiah", caps: 13 },
    { pt: "Ester", en: "esther", caps: 10 }, { pt: "Jó", en: "job", caps: 42 },
    { pt: "Salmos", en: "psalms", caps: 150 }, { pt: "Provérbios", en: "proverbs", caps: 31 },
    { pt: "Eclesiastes", en: "ecclesiastes", caps: 12 }, { pt: "Cânticos", en: "songs", caps: 8 },
    { pt: "Isaías", en: "isaiah", caps: 66 }, { pt: "Jeremias", en: "jeremiah", caps: 52 },
    { pt: "Lamentações", en: "lamentations", caps: 5 }, { pt: "Ezequiel", en: "ezekiel", caps: 48 },
    { pt: "Daniel", en: "daniel", caps: 12 }, { pt: "Oseias", en: "hosea", caps: 14 },
    { pt: "Joel", en: "joel", caps: 3 }, { pt: "Amós", en: "amos", caps: 9 },
    { pt: "Obadias", en: "obadiah", caps: 1 }, { pt: "Jonas", en: "jonah", caps: 4 },
    { pt: "Miqueias", en: "micah", caps: 7 }, { pt: "Naum", en: "nahum", caps: 3 },
    { pt: "Habacuque", en: "habakkuk", caps: 3 }, { pt: "Sofonias", en: "zephaniah", caps: 3 },
    { pt: "Ageu", en: "haggai", caps: 2 }, { pt: "Zacarias", en: "zechariah", caps: 14 },
    { pt: "Malaquias", en: "malachi", caps: 4 },
    { pt: "Mateus", en: "matthew", caps: 28 }, { pt: "Marcos", en: "mark", caps: 16 },
    { pt: "Lucas", en: "luke", caps: 24 }, { pt: "João", en: "john", caps: 21 },
    { pt: "Atos", en: "acts", caps: 28 }, { pt: "Romanos", en: "romans", caps: 16 },
    { pt: "1 Coríntios", en: "1_corinthians", caps: 16 }, { pt: "2 Coríntios", en: "2_corinthians", caps: 13 },
    { pt: "Gálatas", en: "galatians", caps: 6 }, { pt: "Efésios", en: "ephesians", caps: 6 },
    { pt: "Filipenses", en: "philippians", caps: 4 }, { pt: "Colossenses", en: "colossians", caps: 4 },
    { pt: "1 Tessalonicenses", en: "1_thessalonians", caps: 5}, { pt: "2 Tessalonicenses", en: "2_thessalonians", caps: 3 },
    { pt: "1 Timóteo", en: "1_timothy", caps: 6 }, { pt: "2 Timóteo", en: "2_timothy", caps: 4 },
    { pt: "Tito", en: "titus", caps: 3 }, { pt: "Filemom", en: "philemon", caps: 1 },
    { pt: "Hebreus", en: "hebrews", caps: 13 }, { pt: "Tiago", en: "james", caps: 5 },
    { pt: "1 Pedro", en: "1_peter", caps: 5 }, { pt: "2 Pedro", en: "2_peter", caps: 3 },
    { pt: "1 João", en: "1_john", caps: 5 }, { pt: "2 João", en: "2_john", caps: 1 },
    { pt: "3 João", en: "3_john", caps: 1 }, { pt: "Judas", en: "jude", caps: 1 },
    { pt: "Apocalipse", en: "revelation", caps: 22 }
];

// Garante a pasta de saída
if (!fs.existsSync(PASTA_SAIDA)) fs.mkdirSync(PASTA_SAIDA);

function converterTudo() {
    console.log("🚀 Iniciando processamento da Bíblia Completa...");

    LIVROS.forEach((infoLivro, index) => {
        const nomeArquivo = `${infoLivro.en}.json`;
        const caminhoOrigem = path.join(PASTA_ENTRADA, nomeArquivo);

        if (!fs.existsSync(caminhoOrigem)) {
            console.log(`⚠️ Arquivo não encontrado: ${nomeArquivo}. Pulando...`);
            return;
        }

        try {
            const dadosAntigos = JSON.parse(fs.readFileSync(caminhoOrigem, 'utf-8'));
            
            // Determina se é Antigo ou Novo Testamento
            // Gênesis (index 0) até Malaquias (index 38) = Antigo
            // Mateus (index 39) até Apocalipse (index 65) = Novo
            const testamento = index < 39 ? "Antigo" : "Novo";

            let novoFormato = {
                livro: infoLivro.pt,
                livro_en: infoLivro.en,
                testamento: testamento,
                capitulos: []
            };

            const rawChapters = dadosAntigos.chapters || dadosAntigos.capitulos || [];

            rawChapters.forEach((capArray, idxCap) => {
                let novoCapitulo = {
                    numero: idxCap + 1,
                    versiculos: []
                };

                if (Array.isArray(capArray)) {
                    capArray.forEach((versoArray, idxVerso) => {
                        // Filtra para garantir que só entram versículos com palavras
                        if (Array.isArray(versoArray) && versoArray.length > 0) {
                            novoCapitulo.versiculos.push({
                                numero: idxVerso + 1,
                                palavras: versoArray.map(p => ({
                                    o: p.o || "",
                                    tl: p.tl || "",
                                    t: p.t || "",
                                    m: p.m || p.g || "", // Unifica morfologia para 'm'
                                    s: p.s || ""
                                }))
                            });
                        }
                    });
                }
                novoFormato.capitulos.push(novoCapitulo);
            });

            const caminhoDestino = path.join(PASTA_SAIDA, nomeArquivo);
            fs.writeFileSync(caminhoDestino, JSON.stringify(novoFormato, null, 2));
            console.log(`✅ [${testamento}] ${infoLivro.pt} processado com sucesso.`);

        } catch (e) {
            console.error(`❌ Erro no livro ${infoLivro.pt}:`, e.message);
        }
    });

    console.log("\n✨ Missão cumprida! Pasta 'biblia original' atualizada.");
}

converterTudo();