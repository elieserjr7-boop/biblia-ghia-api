const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

// --- CONFIGURAÇÕES ---
const PASTA_ALVO = './biblia original';
const DELAY_SCRAPE = 3000; // 3 segundos para não ser bloqueado

// Lista oficial dos 39 livros do Antigo Testamento (BibleHub URL slugs)
const LIVROS_AT = [
    "genesis", "exodus", "leviticus", "numbers", "deuteronomy", "joshua", "judges",
    "ruth", "1_samuel", "2_samuel", "1_kings", "2_kings", "1_chronicles", "2_chronicles",
    "ezra", "nehemiah", "esther", "job", "psalms", "proverbs", "ecclesiastes",
    "song_of_songs", "isaiah", "jeremiah", "lamentations", "ezekiel", "daniel",
    "hosea", "joel", "amos", "obadiah", "jonah", "micah", "nahum", "habakkuk",
    "zephaniah", "haggai", "zechariah", "malachi"
];

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Verifica se a palavra é conteúdo real (tem letras Hebraicas ou Latinas)
function ehConteudoReal(texto) {
    if (!texto) return false;
    return /[a-zA-Z\u0590-\u05FF]/.test(texto);
}

async function buscarDadosOficiais(livroEn, numCap) {
    const url = `https://biblehub.com/interlinear/${livroEn}/${numCap}.htm`;
    try {
        const { data } = await axios.get(url, { 
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } 
        });
        const $ = cheerio.load(data);
        let mapa = {};
        let vAtual = 1;

        $('table').each((i, el) => {
            const $el = $(el);
            const textoBruto = $el.text().trim();

            // Identifica o número do versículo (ex: "6way" ou apenas "6")
            const matchV = textoBruto.match(/(?:^|\s)(\d+)[a-zA-Z\u0590-\u05FF]/) || textoBruto.match(/^(\d+)$/);
            if (matchV) vAtual = parseInt(matchV[1]);

            const original = $el.find('.heb, .hebrew').text().trim();
            const traducao = $el.find('.eng').text().trim();

            // SÓ ADICIONA SE FOR PALAVRA REAL (Ignora as vírgulas solitárias)
            if (ehConteudoReal(original) || ehConteudoReal(traducao)) {
                if (!mapa[vAtual]) mapa[vAtual] = [];
                
                mapa[vAtual].push({
                    o: original.replace(/\d+/g, '').trim(), // Limpa números residuais
                    tl: $el.find('.translit').text().trim().replace(/\d+/g, ''),
                    t: traducao.replace(/\d+/g, '').trim(),
                    m: $el.find('[class^="strongsnt"], .strongs').last().text().trim(),
                    s: $el.find('.strongs a').first().text().trim()
                });
            }
        });
        return mapa;
    } catch (e) {
        console.log(`      ❌ Erro ao baixar ${livroEn} ${numCap}: ${e.message}`);
        return null;
    }
}

async function processarAntigoTestamento() {
    console.log("🛡️  Iniciando Restauração do Antigo Testamento...");

    for (let livroRef of LIVROS_AT) {
        // Tenta encontrar o arquivo JSON correspondente na pasta
        const arquivo = fs.readdirSync(PASTA_ALVO).find(f => f.toLowerCase().includes(livroRef.replace('_', ' ')));
        
        if (!arquivo) continue;

        const caminho = path.join(PASTA_ALVO, arquivo);
        let dados = JSON.parse(fs.readFileSync(caminho, 'utf-8'));
        let livroAlterado = false;

        console.log(`\n📖 Analisando: ${dados.livro}...`);

        for (let cap of dados.capitulos) {
            // Critério de erro: versículo vazio ou que só contém 1 "palavra" que é apenas pontuação
            const precisaReparo = cap.versiculos.some(v => 
                v.palavras.length === 0 || 
                (v.palavras.length === 1 && !ehConteudoReal(v.palavras[0].o))
            );

            if (precisaReparo) {
                console.log(`   ⚠️  Capítulo ${cap.numero} com falhas. Baixando dados limpos...`);
                const novosDados = await buscarDadosOficiais(livroRef, cap.numero);

                if (novosDados) {
                    cap.versiculos.forEach(v => {
                        if (novosDados[v.numero]) {
                            v.palavras = novosDados[v.numero];
                            livroAlterado = true;
                        }
                    });
                }
                await wait(DELAY_SCRAPE);
            }
        }

        if (livroAlterado) {
            fs.writeFileSync(caminho, JSON.stringify(dados, null, 2));
            console.log(`   ✅ ${dados.livro} atualizado e salvo!`);
        } else {
            console.log(`   ✨ ${dados.livro} já está íntegro.`);
        }
    }
    console.log("\n🏁 Restauração concluída para todo o Antigo Testamento!");
}

processarAntigoTestamento();