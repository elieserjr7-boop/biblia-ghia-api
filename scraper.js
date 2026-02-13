const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

// Configurações de tempo
const DELAY_ENTRE_CAPITULOS = 3000; 
const DELAY_ENTRE_LIVROS = 5000;

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

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function scrapeCapitulo(livroEn, cap) {
    const url = `https://biblehub.com/interlinear/${livroEn}/${cap}.htm`;
    
    try {
        const { data } = await axios.get(url, { 
            headers: { 'User-Agent': 'Mozilla/5.0 ...' }, // Mantém os headers anteriores
            timeout: 15000 
        });

        const $ = cheerio.load(data);
        let capituloDados = [];
        let versoAtualIndex = -1;

        // Procuramos por .tablefloat (Grego) ou .tablefloatheb (Hebraico)
        $('.tablefloat, .tablefloatheb, .tablefloatgrk').each((i, el) => {
            const $el = $(el);
            
            // 1. Identificar o Versículo (Tenta vários seletores do BibleHub)
            const refText = $el.find('.reftop3, .refheb, .refgrk, .refmain').first().text().trim();
            if (refText) {
                const numVerso = parseInt(refText.replace(/\D/g, ""));
                if (!isNaN(numVerso) && numVerso > 0) {
                    versoAtualIndex = numVerso - 1;
                    if (!capituloDados[versoAtualIndex]) capituloDados[versoAtualIndex] = [];
                }
            }

            // 2. Extrair dados da palavra
            // Original: pode ser .greek ou .hebrew
            const original = $el.find('.greek, .hebrew, .grk, .heb').first().text().trim();
            
            // Tradução: classe .eng
            const eng = $el.find('.eng').first().text().trim();
            
            if ((original || eng) && versoAtualIndex !== -1) {
                const translit = $el.find('.translit').first().text().trim();
                
                // Strong: No grego está em .pos, no hebraico em .strongs
                const strong = $el.find('.pos a, .strongs a').first().text().trim() || 
                               $el.find('.pos, .strongs').first().text().trim();
                
                // Morfologia: No grego é .strongsnt2, no hebraico .strongsnt
                // No grego, pegamos o último .strongsnt2 porque o primeiro é apenas o link "[e]"
                let morfologia = "";
                const morfoElementos = $el.find('.strongsnt2, .strongsnt');
                if (morfoElementos.length > 1) {
                    morfologia = $(morfoElementos).last().text().trim();
                } else {
                    morfologia = morfoElementos.text().trim();
                }

                // Limpeza para evitar duplicados no mesmo bloco
                const jaExiste = capituloDados[versoAtualIndex].find(p => p.o === original && p.t === eng);
                
                if (!jaExiste && original !== "") {
                    capituloDados[versoAtualIndex].push({
                        o: original,
                        t: eng,
                        tl: translit,
                        s: strong,
                        m: morfologia
                    });
                }
            }
        });

        return capituloDados.filter(v => v && v.length > 0);

    } catch (e) {
        console.error(`   ❌ Erro Cap ${cap}: ${e.message}`);
        return null;
    }
}

async function iniciar() {
    if (!fs.existsSync('./data')) fs.mkdirSync('./data');

    for (let livro of LIVROS) {
        const path = `./data/${livro.en}.json`;
        
        if (fs.existsSync(path) && fs.statSync(path).size > 500) {
            console.log(`⏩ ${livro.pt} já existe. Pulando...`);
            continue;
        }

        console.log(`\n>>> Baixando: ${livro.pt}...`);
        let livroDados = { nome: livro.pt, chapters: [] };
        
        for (let c = 1; c <= livro.caps; c++) {
            let cap = await scrapeCapitulo(livro.en, c);
            
            // Retry simples
            if (!cap || cap.length === 0) {
                console.log(`   ⚠️ Cap ${c} veio vazio. Tentando de novo em 5s...`);
                await wait(5000);
                cap = await scrapeCapitulo(livro.en, c);
            }

            if (cap && cap.length > 0) {
                livroDados.chapters.push(cap);
                console.log(`   Cap ${c} ok (${cap.length} versículos)`);
            } else {
                console.log(`   ❌ Falha definitiva no Cap ${c}`);
                livroDados.chapters.push([]);
            }

            await wait(DELAY_ENTRE_CAPITULOS);
        }
        
        fs.writeFileSync(path, JSON.stringify(livroDados, null, 2));
        console.log(`✅ Livro ${livro.pt} salvo!`);
        await wait(DELAY_ENTRE_LIVROS);
    }
}

iniciar();