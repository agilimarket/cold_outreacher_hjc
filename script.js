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
            // Simulação de fetch de dados - na prática você faria uma requisição CORS
            // Esta é uma simulação para demonstração
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Dados simulados baseados na URL
            const data = {
                hasInstagram: Math.random() > 0.3,
                instagramFollowers: Math.floor(Math.random() * 10000),
                hasBlog: Math.random() > 0.6,
                lastBlogPost: Math.random() > 0.5 ? '2023-10-15' : '2022-05-20',
                loadingSpeed: Math.random() * 3 + 1, // em segundos
                isMobileFriendly: Math.random() > 0.2,
                hasContactForm: Math.random() > 0.4,
                productCount: Math.floor(Math.random() * 100),
                // Novos dados: WhatsApp e Blog URL
                whatsapp: Math.random() > 0.5 ? `55${Math.floor(10 + Math.random() * 90)}${Math.floor(100000000 + Math.random() * 900000000)}` : null,
                blogUrl: Math.random() > 0.5 ? `${url.split('//')[0]}//${url.split('//')[1].split('/')[0]}/blog` : null
            };
            
            return data;
        } catch (error) {
            console.error(`Erro ao buscar dados para ${url}:`, error);
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
            statusText.textContent = `Processando... ${current}/${total} URLs`;
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