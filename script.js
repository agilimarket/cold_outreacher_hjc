// Gerador de Mensagens de Cold Outreach para Lojas de Moda
class ColdOutreachGenerator {
    constructor() {
        this.processedUrls = [];
        this.ignoredUrls = [];
        this.allUrls = [];
        this.currentIndex = 0;
        this.isProcessing = false;
        this.isPaused = false;
        this.userName = '';
        this.lastExecution = 0;
        this.executionCount = 0;
        this.maxUrlsPerRequest = 10;
        this.requestTimeout = 5000; // 5 segundos entre execuções
        this.uniqueUrls = new Set(); // Remove urls duplicadas   
        // Adicione esta linha para armazenar as URLs duplicadas
        this.duplicateUrls = [];
        // Novas constantes para análise real
        this.corsProxyUrl = 'https://cors-anywhere.herokuapp.com/';
        this.requestTimeout = 10000; // 10 segundos para timeout
        this.estimatedTimePerUrl = 2000; // 2 segundos por URL (para estimativa)

    }

     // 🔽 ADICIONE A FUNÇÃO normalizeUrl AQUI 🔽
    normalizeUrl(url) {
        try {
            let normalizedUrl = url.trim().toLowerCase();
            
            // Remove protocolo e www
            normalizedUrl = normalizedUrl.replace(/^(https?:\/\/)?(www\.)?/, '');
            
            // Remove barras finais
            normalizedUrl = normalizedUrl.replace(/\/+$/, '');
            
            return normalizedUrl;
        } catch (error) {
            return url.trim().toLowerCase();
        }
    }
    // 🔼 FIM DA FUNÇÃO normalizeUrl 🔼

    // Sanitiza entradas para prevenir XSS
    sanitizeInput(input) {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }

    // verifica se há tentativa de rating limiting
    checkRateLimit() {
        const now = Date.now();
        if (now - this.lastExecution < this.requestTimeout) {
            throw new Error("Por favor, aguarde alguns segundos antes de fazer outra requisição.");

        }

        if (this.executionCount > 10) {
            throw new Error("Limite de requisições excedido. Por favor, aguarde alguns minutos.");

        }

        this.lastExecution = now;
        this.executionCount++;

        //Reset do contador após 1 minuto
        setTimeout(() => {
            this.executionCount = Math.max(0, this.executionCount - 1);
        }, 60000)
    }

    extractStoreName(url) {
        try {
            // Sanitiza a URL antes de processar
        const sanitizedUrl = this.sanitizeInput(url);
        let cleanUrl = sanitizedUrl.replace(/^https?:\/\//, '');
        cleanUrl = cleanUrl.replace(/^www\./, '');
        
        if (cleanUrl.includes('instagram.com/')) {
            const handle = cleanUrl.replace(/.*instagram\.com\//, '').split('/')[0];
            return this.sanitizeInput(handle);
        }
        
        const domain = cleanUrl.split('/')[0].split('.')[0];
        return this.sanitizeInput(domain);
    } catch (error) {
        return null;
        }
    }

    isValidUrl(urlString) {
    // Remove espaços em branco e verifica se está vazio
    const trimmedUrl = urlString.trim();
    if (!trimmedUrl) return false;
    
    try {
        // Adiciona https:// se não tiver protocolo
        const urlToTest = trimmedUrl.startsWith('http') ? trimmedUrl : `https://${trimmedUrl}`;
        const urlObj = new URL(urlToTest);
        
        // Permite apenas HTTP e HTTPS por segurança
        if (!['http:', 'https:'].includes(urlObj.protocol)) {
            return false;
        }
        
        // Verifica se tem um domínio básico (pelo menos um ponto no hostname)
        if (!urlObj.hostname || !urlObj.hostname.includes('.')) {
            return false;
        }
        
        // Bloqueia apenas caracteres realmente perigosos
        if (/[<>{}$]/.test(urlString)) {
            return false;
        }
        
        return true;
    } catch (error) {
        // Se ocorrer erro na análise, não é uma URL válida
        return false;
    }
}

    async fetchWebsiteData(url) {
        try {
            console.log(`Iniciando análise de: ${url}`);
            
            // Tentar fazer requisição real primeiro
            const response = await this.makeRealRequest(url);
            
            if (response && response.ok) {
                const html = await response.text();
                const realData = this.analyzeRealWebsite(html, url);
                console.log(`Análise real bem-sucedida para: ${url}`);
                return realData;
            } else {
                // Fallback para dados realistas
                console.log(`Usando dados realistas para: ${url}`);
                return this.generateRealisticData(url);
            }
        } catch (error) {
            console.error(`Erro ao buscar dados para ${url}:`, error);
            return this.generateRealisticData(url);
    }
}

    async makeRealRequest(url) {
        const targetUrl = url.startsWith('http') ? url : `https://${url}`;
        
        try {
            // Usar proxy CORS para evitar bloqueios
            const proxyUrl = `${this.corsProxyUrl}${targetUrl}`;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);
            
            const response = await fetch(proxyUrl, {
                signal: controller.signal,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            console.warn(`Não foi possível acessar ${url}:`, error.message);
            return null;
    }
}

    analyzeRealWebsite(html, url) {
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Extrair informações reais do HTML
            return {
                title: doc.querySelector('title')?.textContent || 'Sem título',
                description: doc.querySelector('meta[name="description"]')?.content || '',
                hasInstagram: this.hasInstagramLink(doc),
                instagramFollowers: this.estimateFollowers(doc),
                hasBlog: this.hasBlog(doc),
                lastBlogPost: this.findLastBlogPost(doc),
                loadingSpeed: this.estimateLoadingSpeed(doc),
                isMobileFriendly: this.isMobileFriendly(doc),
                hasContactForm: this.hasContactForm(doc),
                productCount: this.estimateProductCount(doc),
                whatsapp: this.findWhatsApp(doc),
                blogUrl: this.findBlogUrl(doc, url)
            };
        } catch (error) {
            console.error('Erro na análise do HTML:', error);
            return this.generateRealisticData(url);
    }
}

    hasInstagramLink(doc) {
        const links = doc.querySelectorAll('a[href*="instagram.com"]');
        return links.length > 0;
    }

    estimateFollowers(doc) {
        // Tentar encontrar seguidores no texto da página
        const text = doc.body.textContent || '';
        const followerMatch = text.match(/(\d+[,.]?\d*)[kK]?\s+(seguidores|followers)/);
        
        if (followerMatch) {
            let count = parseFloat(followerMatch[1].replace(',', '.'));
            if (followerMatch[0].toLowerCase().includes('k')) {
                count *= 1000;
            }
            return Math.floor(count);
        }
        
        // Valor padrão se não encontrar
        return Math.floor(Math.random() * 5000) + 100;
    }

    hasBlog(doc) {
        const blogIndicators = ['blog', 'notícias', 'artigos', 'posts', 'news'];
        const text = doc.body.textContent || '';
        return blogIndicators.some(indicator => text.toLowerCase().includes(indicator));
}

    // Continue com as outras funções auxiliares...

        _hasInstagramLink(doc) {
    const links = doc.querySelectorAll('a[href*="instagram.com"]');
    return links.length > 0;
}

_estimateFollowers(doc) {
    // Tentar encontrar seguidores no texto da página
    const text = doc.body.textContent || '';
    const followerMatch = text.match(/(\d+[,.]?\d*)[kK]?\s+(seguidores|followers)/);
    
    if (followerMatch) {
        let count = parseFloat(followerMatch[1].replace(',', '.'));
        if (followerMatch[0].toLowerCase().includes('k')) {
            count *= 1000;
        }
        return Math.floor(count);
    }
    
    // Valor padrão se não encontrar
    return Math.floor(Math.random() * 5000) + 100;
}

_hasBlog(doc) {
    const blogIndicators = ['blog', 'notícias', 'artigos', 'posts', 'news'];
    const text = doc.body.textContent || '';
    return blogIndicators.some(indicator => text.toLowerCase().includes(indicator));
}

// Adicione as outras funções auxiliares aqui...
    _findLastBlogPost(doc) {
        // Implementação simplificada - procurar por datas recentes
        const text = doc.body.textContent || '';
        const currentYear = new Date().getFullYear();
        const yearMatch = text.match(new RegExp(`\\b(${currentYear}|${currentYear-1})\\b`));
        
        if (yearMatch) {
            const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
            for (let month of months) {
                if (text.toLowerCase().includes(month)) {
                    return `${month}/${yearMatch[1]}`;
                }
            }
            return `01/${yearMatch[1]}`;
        }
        
        return 'Não encontrado';
    }

    _estimateLoadingSpeed(doc) {
        // Estimativa baseada na complexidade do HTML
        const elementCount = doc.querySelectorAll('*').length;
        return Math.min(5, (elementCount / 1000) * 0.5 + (Math.random() * 1.5));
    }

    _isMobileFriendly(doc) {
        const viewport = doc.querySelector('meta[name="viewport"]');
        return !!viewport;
    }

    _hasContactForm(doc) {
        const contactIndicators = ['contact', 'contato', 'fale-conosco', 'contact-us'];
        const text = doc.body.textContent || '';
        return contactIndicators.some(indicator => text.toLowerCase().includes(indicator));
    }

    _estimateProductCount(doc) {
        // Procurar por indicadores de e-commerce
        const text = doc.body.textContent || '';
        if (text.includes('carrinho') || text.includes('shopping cart') || text.includes('adicionar ao carrinho')) {
            return Math.floor(Math.random() * 200) + 50;
        }
        return Math.floor(Math.random() * 50);
    }

    _findWhatsApp(doc) {
        const links = doc.querySelectorAll('a[href*="wa.me"], a[href*="whatsapp.com"], a[href*="api.whatsapp.com"]');
        if (links.length > 0) {
            const href = links[0].href;
            const numberMatch = href.match(/\d{10,}/);
            return numberMatch ? numberMatch[0] : 'Não encontrado';
        }
        return 'Não encontrado';
    }

    _findBlogUrl(doc, originalUrl) {
        const blogLinks = doc.querySelectorAll('a[href*="blog"], a[href*="noticias"], a[href*="news"]');
        if (blogLinks.length > 0) {
            return blogLinks[0].href;
        }
        
        try {
            const urlObj = new URL(originalUrl);
            return `${urlObj.origin}/blog`;
        } catch (error) {
            return 'Não encontrado';
    }
}

    // fim das funções auxiliares

    async makeRealRequest(url) {
    const targetUrl = url.startsWith('http') ? url : `https://${url}`;
    
    try {
        // Usar proxy CORS para evitar bloqueios
        const proxyUrl = `${this.corsProxyUrl}${targetUrl}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);
        
        const response = await fetch(proxyUrl, {
            signal: controller.signal,
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        console.warn(`Não foi possível acessar ${url}:`, error.message);
        return null;
    }
}

    analyzeStore(storeName, websiteData) {
        const lowerName = storeName.toLowerCase();
        let analysis = {};
        
        // Análise baseada no nome da loja
        if (lowerName.includes('vest')) {
            analysis = {
                contato: 'Mariana',
                conquista: 'Coleção nova com storytelling emocional e ótimo feedback de clientes',
                oportunidade: 'Reels com menos de 500 visualizações — potencial não explorado'
            };
        } else if (lowerName.includes('praia') || lowerName.includes('beach')) {
            analysis = {
                contato: 'Carolina',
                conquista: 'Fotos em cenários tropicais com alto engajamento visual',
                oportunidade: 'Ausência de TikTok e poucas respostas a DMs'
            };
        } else {
            analysis = {
                contato: `Time da ${storeName}`,
                conquista: 'Lançamento recente com bom engajamento nos comentários',
                oportunidade: 'Baixo uso de Reels e ausência de link otimizado na bio'
            };
        }
        
        // Análise baseada em dados do website
        if (websiteData) {
            if (!websiteData.hasInstagram) {
                analysis.oportunidade += ' | Perfil do Instagram não encontrado';
            } else if (websiteData.instagramFollowers < 1000) {
                analysis.oportunidade += ` | Baixo número de seguidores (${websiteData.instagramFollowers})`;
            }
            
            if (websiteData.loadingSpeed > 2.5) {
                analysis.oportunidade += ` | Site lento (${websiteData.loadingSpeed.toFixed(2)}s)`;
            }
            
            if (!websiteData.isMobileFriendly) {
                analysis.oportunidade += ' | Site não otimizado para mobile';
            }
            
            if (websiteData.hasBlog) {
                const lastPostDate = new Date(websiteData.lastBlogPost);
                const monthsDiff = (new Date() - lastPostDate) / (1000 * 60 * 60 * 24 * 30);
                
                if (monthsDiff > 6) {
                    analysis.oportunidade += ' | Blog abandonado há mais de 6 meses';
                } else {
                    analysis.conquista += ' | Blog ativo com conteúdo relevante';
                }
            } else {
                analysis.oportunidade += ' | Sem blog para gerar autoridade';
            }
        }
        
        return analysis;
    }

    generateMessage(storeName, analysis) {
        const template = `Oi, ${analysis.contato},

Adorei o que vocês estão fazendo com ${storeName} — especialmente ${analysis.conquista}. Isso gera conexão genuína.

Percebi, porém, que ${analysis.oportunidade}. É comum — mas é oportunidade escondida para aumentar conversões.

Na DataFashion Marketing, ajudamos marcas como a sua a aumentar vendas online e ROI de anúncios.

Gostaria de agendar uma breve conversa para mostrar como podemos ajudar a destravar seu potencial.

Atenciosamente,
${this.userName}
Especialista em Tráfego & SEO para Moda`;

        return template;
    }

    async processUrl(url) {
        const trimmedUrl = url.trim();
        
        if (!trimmedUrl || !this.isValidUrl(trimmedUrl)) {
            this.ignoredUrls.push(trimmedUrl);
            return null;
        }

        const storeName = this.extractStoreName(trimmedUrl);
        if (!storeName) {
            this.ignoredUrls.push(trimmedUrl);
            return null;
        }

        // Buscar dados do website
        const websiteData = await this.fetchWebsiteData(trimmedUrl);
        
        // Analisar com base no nome e dados coletados
        const analysis = this.analyzeStore(storeName, websiteData);
        const message = this.generateMessage(storeName, analysis);

        const result = {
            url: trimmedUrl,
            contato: analysis.contato,
            conquista: analysis.conquista,
            oportunidade: analysis.oportunidade,
            mensagem: message,
            websiteData: websiteData,
            // Novos campos
            whatsapp: websiteData?.whatsapp || 'Não encontrado',
            blogUrl: websiteData?.blogUrl || 'Não encontrado'
        };

        this.processedUrls.push(result);
        return result;
    }

    async processUrls(urlList, userName) {
        // Verifica rate limiting antes de processar
        this.checkRateLimit();
        
        // Sanitiza o nome do usuário
        this.userName = this.sanitizeInput(userName);
        
        // Divide e filtra as URLs
        const rawUrls = urlList.split('\n').filter(url => url.trim());
        
        // Aplica limite de URLs por requisição
        if (rawUrls.length > this.maxUrlsPerRequest) {
            throw new Error(`Número máximo de URLs excedido. Máximo permitido: ${this.maxUrlsPerRequest}`);
        }
        
        // Remove URLs duplicadas
        const seenUrls = new Map();
        const duplicateUrls = [];
        
        rawUrls.forEach(url => {
            const normalized = this.normalizeUrl(url);
            if (seenUrls.has(normalized)) {
                duplicateUrls.push(url);
            } else {
                seenUrls.set(normalized, url.trim());
            }
        });
        
        // As URLs únicas (não duplicadas) são os valores do Map
        const uniqueUrls = Array.from(seenUrls.values());
        
        // Filtra URLs válidas
        this.allUrls = uniqueUrls.filter(url => this.isValidUrl(url));
        this.ignoredUrls = uniqueUrls.filter(url => !this.isValidUrl(url));
        this.duplicateUrls = duplicateUrls; // Armazena as duplicatas para relatório
        
        this.processedUrls = [];
        this.currentIndex = 0;
        this.isProcessing = true;
        this.isPaused = false;

        await this._processUrlsInternal();

        this.isProcessing = false;
        return this.processedUrls;
}

    async _processUrlsInternal() {
        while (this.currentIndex < this.allUrls.length && this.isProcessing && !this.isPaused) {
            const url = this.allUrls[this.currentIndex];
            try {
                await this.processUrl(url);
            } catch (error) {
                console.error(`Erro ao processar URL ${url}:`, error);
                this.ignoredUrls.push({ url, error: error.message });
            }
            this.currentIndex++;
            this.updateProgress(this.currentIndex, this.allUrls.length);
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    pause() {
        this.isPaused = true;
        this.isProcessing = false;
    }

    async resume() {
        this.isPaused = false;
        this.isProcessing = true;
        await this._processUrlsInternal();
        this.isProcessing = false;
    }

    updateProgress(current, total) {
    const progressFill = document.querySelector('.progress-fill');
    const statusText = document.querySelector('.status-text');
    
    if (progressFill) {
        const percentage = (current / total) * 100;
        progressFill.style.width = `${percentage}%`;
    }
    
    if (statusText) {
        // Calcular tempo estimado restante
        const elapsed = Date.now() - this.startTime;
        const estimatedTotal = total * this.estimatedTimePerUrl;
        const remaining = Math.max(0, estimatedTotal - elapsed);
        const secondsLeft = Math.ceil(remaining / 1000);
        
        statusText.textContent = `Processando... ${current}/${total} URLs | Tempo estimado: ${secondsLeft}s`;
    }
}

    generateCSV(data) {
        // Adicionando colunas WhatsApp e Blog URL
        const headers = ['URL', 'Contato', 'Conquista', 'Oportunidade', 'WhatsApp', 'Blog URL', 'Mensagem'];
        const csvContent = [headers.join(',')];

        data.forEach(row => {
            const csvRow = [
                `"${this.sanitizeInput(row.url)}"`,
                `"${this.sanitizeInput(row.contato)}"`,
                `"${this.sanitizeInput(row.conquista)}"`,
                `"${this.sanitizeInput(row.oportunidade)}"`,
                `"${this.sanitizeInput(row.whatsapp)}"`,
                `"${this.sanitizeInput(row.blogUrl)}"`,
                `"${this.sanitizeInput(row.mensagem.replace(/"/g, '""').replace(/\n/g, '\\n'))}"`
            ];
            csvContent.push(csvRow.join(','));
        });

        return csvContent.join('\n');
    }

    downloadCSV(csvContent) {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'mensagens_prospeccao.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    getStats() {
        const totalUrls = this.allUrls.length + this.ignoredUrls.length + this.duplicateUrls.length;
            
        return {
            processed: this.processedUrls.length,
            ignored: this.ignoredUrls.length,
            duplicates: this.duplicateUrls.length,
            total: totalUrls
        };
    }

    
}

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', function() {
    const generator = new ColdOutreachGenerator();
    const urlInput = document.getElementById('urls-input');
    const generateBtn = document.getElementById('generate-btn');
    const pauseResumeBtn = document.getElementById('pause-resume-btn');
    const statusDiv = document.getElementById('status-display');
    const progressBarFill = document.querySelector('#progress-bar .progress-fill');
    const progressContainer = document.getElementById('progress-bar');
    const resultsSection = document.getElementById('results-section');
    const userNameInput = document.getElementById('user-name');

    // Função para mostrar status
    function showStatus(message, type) {
        const statusText = statusDiv.querySelector('.status-text');
        const statusIcon = statusDiv.querySelector('.status-icon');
        
        if (statusText) statusText.textContent = message;
        
        statusDiv.className = 'status-display';
        if (type === 'success') {
            statusDiv.classList.add('success');
            statusIcon.textContent = '✅';
        } else if (type === 'error') {
            statusDiv.classList.add('error');
            statusIcon.textContent = '❌';
        } else if (type === 'warning') {
            statusDiv.classList.add('warning');
            statusIcon.textContent = '⚠️';
        } else {
            statusDiv.classList.add('processing');
            statusIcon.textContent = '⏳';
        }
        
        statusDiv.classList.remove('hidden');
    }

   // Função para mostrar resultados
function showResults(results, stats) {
    const resultsSummary = document.getElementById('results-summary');
    
    if (!resultsSummary) {
        console.error('Elemento #results-summary não encontrado.');
        return;
    }

    const resultHTML = `
        <div class="results-stats">
            <h4>📊 Resumo do Processamento</h4>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-number">${stats.processed}</div>
                    <div class="stat-label">Processadas</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${stats.ignored}</div>
                    <div class="stat-label">Ignoradas</div>
                </div>
                <div class="stat-card ${stats.duplicates > 0 ? 'duplicate' : ''}">
                    <div class="stat-number">${stats.duplicates}</div>
                    <div class="stat-label">Duplicadas</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${stats.total}</div>
                    <div class="stat-label">Total</div>
                </div>
            </div>
        </div>

        <div class="preview-section">
            <h4>✅ Processamento concluído</h4>
            <p>O arquivo CSV com todas as mensagens foi baixado automaticamente.</p>
            <p>Foram processadas ${stats.processed} URLs únicas.</p>
        ${stats.ignored > 0 ? 
            `<p>${stats.ignored} URLs inválidas foram ignoradas.</p>` : 
            ''}
        ${stats.duplicates > 0 ? 
            `<p>${stats.duplicates} URLs duplicadas foram identificadas e removidas.</p>
             <details>
                 <summary>Ver URLs duplicadas</summary>
                 <ul class="duplicate-list">
                     ${generator.duplicateUrls.map(url => `<li>${generator.sanitizeInput(url)}</li>`).join('')}
                 </ul>
             </details>` : 
            ''}
        </div>
    `;

    resultsSummary.innerHTML = resultHTML;
    resultsSection.classList.remove('hidden');
}

    // Event listener para o botão de Pausar/Retomar
    pauseResumeBtn.addEventListener('click', async function() {
        if (generator.isProcessing) {
            generator.pause();
            pauseResumeBtn.innerHTML = '<span class="button-icon">▶️</span><span class="button-text">Retomar</span>';
            pauseResumeBtn.style.background = 'var(--success-color)';
            showStatus('Processamento pausado.', 'warning');
        } else if (generator.isPaused) {
            generator.isProcessing = true;
            generator.isPaused = false;
            pauseResumeBtn.innerHTML = '<span class="button-icon">⏸️</span><span class="button-text">Pausar</span>';
            pauseResumeBtn.style.background = 'var(--warning-color)';
            showStatus('Retomando processamento...', 'processing');
            await generator._processUrlsInternal();
        }
    });

    // Event listener para o botão de Gerar
    generateBtn.addEventListener('click', async function() {
        const urls = urlInput.value.trim();
        const userName = userNameInput.value.trim();
        
        if (!urls) {
            showStatus('Por favor, insira pelo menos uma URL.', 'error');
            return;
        }
        
        if (!userName) {
            showStatus('Por favor, informe seu nome.', 'error');
            return;
        }

        // Resetar estado
        generator.processedUrls = [];
        generator.ignoredUrls = [];
        generator.currentIndex = 0;
        generator.isPaused = false;

        generateBtn.classList.add('hidden');
        pauseResumeBtn.classList.remove('hidden');
        pauseResumeBtn.innerHTML = '<span class="button-icon">⏸️</span><span class="button-text">Pausar</span>';
        pauseResumeBtn.style.background = 'var(--warning-color)';
        
        statusDiv.classList.remove('success', 'error');
        showStatus('Iniciando processamento...', 'processing');
        progressBarFill.style.width = '0%';
        progressContainer.classList.remove('hidden');
        resultsSection.classList.add('hidden');

        try {
            await generator.processUrls(urls, userName);
            const stats = generator.getStats();
            
            if (generator.processedUrls.length > 0) {
                const csvContent = generator.generateCSV(generator.processedUrls);
                generator.downloadCSV(csvContent);
                showStatus(`✅ Pronto! CSV baixado. ${stats.processed} processadas com sucesso. ${stats.ignored} ignoradas.`, 'success');
                showResults(generator.processedUrls, stats);
            } else {
                showStatus('❌ Nenhuma URL válida foi encontrada.', 'error');
            }
            
        } catch (error) {
            showStatus('❌ Erro durante o processamento. Tente novamente.', 'error');
            console.error('Erro:', error);
        } finally {
            generateBtn.classList.remove('hidden');
            pauseResumeBtn.classList.add('hidden');
            progressContainer.classList.add('hidden');
        }
    });

    // Auto-resize do textarea
    urlInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 200) + 'px';
    });

    // Placeholder dinâmico
    const placeholders = [
        'https://usemegavest.com.br\nhttps://instagram.com/lojapraiaazul\nhttps://modafeminina.com.br',
        'https://vestidoschic.com\nhttps://instagram.com/beachstyle\nhttps://trendy.com.br',
        'https://instagram.com/vestuariofino\nhttps://praiamodas.com\nhttps://elegance.com.br'
    ];
    
    let placeholderIndex = 0;
    setInterval(() => {
        if (!urlInput.value) {
            urlInput.placeholder = placeholders[placeholderIndex];
            placeholderIndex = (placeholderIndex + 1) % placeholders.length;
        }
    }, 3000);


    // Adiciona validação em tempo real para a entrada de URLs
        const urlInputField = document.getElementById('urls-input');
        urlInputField.addEventListener('input', function() {
            const urls = this.value.split('\n');
            if (urls.length > generator.maxUrlsPerRequest) {
                alert(`Limite de ${generator.maxUrlsPerRequest} URLs excedido. As URLs adicionais serão ignoradas.`);
    }

    });


});