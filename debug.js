const axios = require('axios');
const cheerio = require('cheerio');

async function debugNovoTestamento() {
    // Vamos testar Mateus 1
    const url = "https://biblehub.com/interlinear/matthew/1.htm";
    console.log(`📡 Investigando Grego em: ${url}...\n`);

    try {
        const { data } = await axios.get(url, { 
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } 
        });
        const $ = cheerio.load(data);

        // Analisando as primeiras 20 tabelas de Mateus
        $('.tablefloat, .tablefloatgrk').slice(0, 20).each((i, el) => {
            const $el = $(el);
            
            // 1. Onde está o número do versículo no Grego?
            const ref = $el.find('.reftop3, .refgrk, .refmain').text().trim();
            
            // 2. Qual é a classe da palavra original?
            const grego = $el.find('.greek, .grk').text().trim();
            
            // 3. Tradução e Transliteração
            const trad = $el.find('.eng').text().trim();
            const translit = $el.find('.translit').text().trim();

            console.log(`Caixa [${i}] | Ref: "${ref}" | Grego: "${grego}" | Trad: "${trad}"`);
        });

    } catch (e) {
        console.error("❌ Erro no debug NT:", e.message);
    }
}

debugNovoTestamento();