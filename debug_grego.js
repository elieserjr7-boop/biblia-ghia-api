const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function debugGrego() {
    console.log("🔍 Iniciando Debug do Novo Testamento (Mateus 1)...");
    
    // URL de Mateus 1 (Grego Interlinear)
    const url = "https://biblehub.com/interlinear/matthew/1.htm";

    try {
        const { data } = await axios.get(url, { 
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
            }
        });

        const $ = cheerio.load(data);
        
        // Salva o HTML para veres no navegador se quiseres
        fs.writeFileSync('pagina_grego.html', data);
        console.log("📁 Arquivo 'pagina_grego.html' criado.");

        // TESTE DE SELETORES
        console.log("\n--- TESTANDO SELETORES ---");

        // 1. Testando o container do Grego
        const containers = $('.tablefloatgrk').length;
        console.log(`📦 Blocos '.tablefloatgrk' encontrados: ${containers}`);

        // 2. Testando a classe da palavra Grega
        const palavrasGregas = $('.greek').length;
        const palavrasGrk = $('.grk').length;
        console.log(`🔤 Palavras com classe '.greek': ${palavrasGregas}`);
        console.log(`🔤 Palavras com classe '.grk': ${palavrasGrk}`);

        // 3. Testando o Versículo
        const versiculoGrk = $('.refgrk').length;
        const versiculoText = $('.reftext').length;
        console.log(`🔢 Versículos com classe '.refgrk': ${versiculoGrk}`);
        console.log(`🔢 Versículos com classe '.reftext': ${versiculoText}`);

        // 4. Testando a Morfologia
        const morfologia = $('.strongsnt').length;
        console.log(`🧬 Blocos de morfologia: ${morfologia}`);

        // Tenta extrair a primeira palavra de Mateus 1:1
        if (containers > 0) {
            console.log("\n--- AMOSTRA DO PRIMEIRO BLOCO ---");
            const primeiro = $('.tablefloatgrk').first();
            console.log("Grego:", primeiro.find('.greek, .grk').text().trim());
            console.log("Inglês:", primeiro.find('.eng').text().trim());
            console.log("Versículo:", primeiro.find('.refgrk, .reftext').text().trim());
            console.log("Morfologia:", primeiro.find('.strongsnt').text().trim());
        }

    } catch (error) {
        console.error("❌ Erro na conexão:", error.message);
    }
}

debugGrego();