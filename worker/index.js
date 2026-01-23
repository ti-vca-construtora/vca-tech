const { Worker, Queue, QueueEvents } = require('bullmq')
const { chromium } = require('playwright-extra')
const stealth = require('puppeteer-extra-plugin-stealth')()

// Aplicar plugin stealth para evitar detecção de bot
chromium.use(stealth)

// Configuração do Redis
const redisConnection = {
  url: process.env.REDIS_URL,
  maxRetriesPerRequest: null, // Importante para BullMQ
}

const queueEvents = new QueueEvents('simulador-caixa', {
  connection: redisConnection,
})

const http = require('http')
const fs = require('fs')
const path = require('path')

// O Railway injeta a porta automaticamente na variável process.env.PORT
const port = process.env.PORT || 3000

const server = http.createServer(async (req, res) => {
  const baseUrl = `http://${req.headers.host || 'localhost'}`
  const parsedUrl = new URL(req.url || '/', baseUrl)
  const pathname = parsedUrl.pathname

  // Log mínimo para depuração de roteamento
  console.log(`[HTTP] ${req.method} ${req.url} -> ${pathname}`)

  // --- CORS ---
  // Allowlist por env (separado por vírgula) + fallback para o domínio de produção
  const allowListFromEnv = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean)

  const allowedOrigins = new Set([
    'https://tech.vcaconstrutora.com.br',
    ...allowListFromEnv,
  ])

  const requestOrigin = req.headers.origin
  if (requestOrigin && allowedOrigins.has(requestOrigin)) {
    res.setHeader('Access-Control-Allow-Origin', requestOrigin)
    res.setHeader('Vary', 'Origin')
    res.setHeader('Access-Control-Allow-Credentials', 'true')
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    res.end()
    return
  }

  // Rota Health Check
  if (req.method === 'GET' && (pathname === '/' || pathname === '/health')) {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/plain')
    res.end('Worker is active 🚀\n')
    return
  }

  // Rota para adicionar job
  if (
    pathname === '/api/simulador-caixa' ||
    pathname === '/api/simulador-caixa/'
  ) {
    if (req.method !== 'POST') {
      res.statusCode = 405
      res.setHeader('Content-Type', 'application/json')
      res.end(
        JSON.stringify({ error: 'Method Not Allowed', allowed: ['POST'] })
      )
      return
    }

    let body = ''
    req.on('data', (chunk) => {
      body += chunk.toString()
    })
    req.on('end', async () => {
      try {
        const dados = JSON.parse(body)

        // Validação básica
        if (!dados.origemRecurso || !dados.cidade || !dados.valorAvaliacao) {
          res.statusCode = 400
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Dados incompletos' }))
          return
        }

        const job = await simuladorQueue.add(
          'processar-simulacao',
          { dados },
          {
            attempts: 1,
            removeOnComplete: { age: 3600, count: 100 },
            removeOnFail: { age: 7200 },
          }
        )

        try {
          // Aguardar o job terminar (timeout de 2 minutos)
          await job.waitUntilFinished(queueEvents, 120000)

          // O job.returnvalue pode não estar disponível imediatamente na instância do job local
          const completedJob = await simuladorQueue.getJob(job.id)
          const result = completedJob.returnvalue

          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')

          // Retorna resultados + PDF em base64
          const responseData = {
            ...result.resultados,
            pdf: result.pdfBase64,
          }

          res.end(JSON.stringify(responseData))
        } catch (error) {
          console.error('Erro ao aguardar job:', error)

          // Tentar pegar o motivo da falha
          const failedJob = await simuladorQueue.getJob(job.id)
          const reason = failedJob ? failedJob.failedReason : error.message

          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(
            JSON.stringify({ error: 'Erro na simulação', details: reason })
          )
        }
      } catch (error) {
        console.error(error)
        res.statusCode = 500
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: 'Erro ao processar requisição' }))
      }
    })
    return
  }

  // Rota para consultar status
  if (
    req.method === 'GET' &&
    pathname.startsWith('/api/simulador-caixa/status')
  ) {
    const jobId = parsedUrl.searchParams.get('jobId')

    if (!jobId) {
      res.statusCode = 400
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: 'jobId required' }))
      return
    }

    const job = await simuladorQueue.getJob(jobId)
    if (!job) {
      res.statusCode = 404
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: 'Job not found' }))
      return
    }

    const state = await job.getState()
    const progress = job.progress
    const result = job.returnvalue
    const failedReason = job.failedReason

    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ status: state, progress, result, failedReason }))
    return
  }

  res.statusCode = 404
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify({ error: 'Not Found', path: pathname }))
})

server.listen(port, '0.0.0.0', () => {
  console.log(`Health Check server rodando na porta ${port}`)
})

// Criar fila (para adicionar jobs - usado pela API)
const simuladorQueue = new Queue('simulador-caixa', {
  connection: {
    url: process.env.REDIS_URL,
    maxRetriesPerRequest: null,
  },
})

// Função principal de processamento
async function processSimulacao(job) {
  const { dados } = job.data

  console.log(`\n📋 Processando job: ${job.id}`)
  console.log(`📊 Progresso inicial: ${job.progress}%`)

  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-blink-features=AutomationControlled',
      '--disable-gpu',
      '--disable-software-rasterizer',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
      '--allow-running-insecure-content',
      '--disable-infobars',
      '--window-size=1920,1080',
      '--start-maximized',
    ],
  })

  let context
  let page
  try {
    context = await browser.newContext({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
      permissions: ['geolocation'],
      geolocation: { latitude: -15.7942, longitude: -47.8822 },
      locale: 'pt-BR',
      timezoneId: 'America/Sao_Paulo',
      ignoreHTTPSErrors: true,
      extraHTTPHeaders: {
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-User': '?1',
        'Sec-Fetch-Dest': 'document',
        'Upgrade-Insecure-Requests': '1',
      },
    })
    page = await context.newPage()

    // Remover sinais de webdriver/automação
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      })

      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5],
      })

      Object.defineProperty(navigator, 'languages', {
        get: () => ['pt-BR', 'pt', 'en-US', 'en'],
      })

      window.chrome = {
        runtime: {},
      }

      const originalQuery = window.navigator.permissions.query
      window.navigator.permissions.query = (parameters) =>
        parameters.name === 'notifications'
          ? Promise.resolve({ state: Notification.permission })
          : originalQuery(parameters)
    })

    page.setDefaultTimeout(60000)
    page.setDefaultNavigationTimeout(60000)

    console.log('📝 Dados recebidos:', dados)

    // ========== ETAPA 1: Navegação ==========
    try {
      await job.updateProgress(10)
      console.log('🌐 [ETAPA 1] Iniciando navegação para o simulador...')

      console.log('🔗 [ETAPA 1] Chamando page.goto()...')

      // Delay aleatório para simular comportamento humano
      const delay = Math.random() * 2000 + 1000
      console.log(
        `⏳ [ETAPA 1] Aguardando ${Math.round(delay)}ms (comportamento humano)...`
      )
      await page.waitForTimeout(delay)

      const response = await page.goto(
        'https://www.portaldeempreendimentos.caixa.gov.br/simulador/',
        { waitUntil: 'domcontentloaded', timeout: 60000 }
      )

      const status = response?.status()
      console.log(`📡 [ETAPA 1] Status da resposta: ${status}`)

      if (status === 403) {
        console.error('❌ [ETAPA 1] BLOQUEADO: Servidor retornou 403 Forbidden')
        throw new Error(
          'Acesso bloqueado pelo servidor (403). O site pode estar detectando automação.'
        )
      }

      console.log('✅ [ETAPA 1] page.goto() completado')

      console.log('⏳ [ETAPA 1] Aguardando 3 segundos...')
      await page.waitForTimeout(3000)
      console.log('✅ [ETAPA 1] Espera de 3s concluída')

      // Debug: Tirar screenshot antes de procurar elemento
      console.log('📸 [ETAPA 1] Tentando tirar screenshot para debug...')
      try {
        await page.screenshot({ path: '/tmp/debug-page.png', fullPage: true })
        console.log('✅ [ETAPA 1] Screenshot salvo em /tmp/debug-page.png')
      } catch (e) {
        console.log(
          '⚠️ [ETAPA 1] Não foi possível salvar screenshot:',
          e.message
        )
      }

      // Debug: Verificar se página carregou
      const url = page.url()
      console.log('📍 [ETAPA 1] URL atual:', url)

      const html = await page.content()
      console.log(
        '📄 [ETAPA 1] Tamanho do HTML carregado:',
        html.length,
        'chars'
      )
      console.log('📄 [ETAPA 1] HTML snippet:', html.substring(0, 300))

      console.log('✅ [ETAPA 1] Navegação concluída com sucesso!')
    } catch (error) {
      console.error('❌ [ETAPA 1] ERRO na navegação:', error.message)
      console.error('❌ [ETAPA 1] Stack:', error.stack)
      throw error
    }

    // ========== ETAPA 2: Origem de Recurso ==========
    await job.updateProgress(20)
    console.log(`💰 Selecionando origem de recurso: ${dados.origemRecurso}`)

    // Debug: Verificar se elemento existe
    const seletorEncontrado = await page.evaluate(() => {
      const select = document.getElementById('origemRecurso')
      return select ? 'encontrado' : 'não encontrado'
    })
    console.log(`🔍 Elemento #origemRecurso: ${seletorEncontrado}`)

    await page.waitForSelector('#origemRecurso', {
      state: 'visible',
      timeout: 30000,
    })

    // Focar no select e usar tecla 'F' para FGTS ou 'P' para Poupança/SBPE
    await page.locator('#origemRecurso').focus()
    await page.waitForTimeout(300)

    if (dados.origemRecurso === 'FGTS') {
      await page.keyboard.press('F') // FGTS
    } else {
      await page.keyboard.press('S')
      await page.keyboard.press('S')
    }

    await page.waitForTimeout(1000)

    // Disparar evento change
    await page.evaluate(() => {
      const select = document.getElementById('origemRecurso')
      if (select) {
        select.dispatchEvent(new Event('change', { bubbles: true }))
        select.dispatchEvent(new Event('blur', { bubbles: true }))
      }
    })

    await page.waitForTimeout(1500)
    await page.waitForLoadState('networkidle', { timeout: 15000 })
    await page.waitForTimeout(2000)

    await page.waitForSelector('span:has-text("Avançar")', {
      state: 'visible',
      timeout: 5000,
    })
    await page.locator('span:has-text("Avançar")').first().click()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000) // Aguardar página estabilizar

    // ========== ETAPA 3: Categoria do Imóvel ==========
    await job.updateProgress(30)
    console.log('🏠 Selecionando categoria do imóvel...')
    await page.waitForSelector('#categoriaImovel', {
      state: 'visible',
      timeout: 10000,
    })

    await page.evaluate(() => {
      const select = document.getElementById('categoriaImovel')
      if (select) {
        select.value = '16'
        select.dispatchEvent(new Event('change', { bubbles: true }))
        select.dispatchEvent(new Event('blur', { bubbles: true }))
      }
    })

    await page.waitForTimeout(1500)
    await page.waitForLoadState('networkidle', { timeout: 15000 })

    // ========== ETAPA 4: Cidade ==========
    await job.updateProgress(35)
    const metade = Math.ceil(dados.cidade.length / 2)
    const cidadeParcial = dados.cidade.substring(0, metade)
    console.log(`📍 Preenchendo cidade (parcial): ${cidadeParcial}`)

    await page.locator('//*[@id="cidade"]').fill('')
    for (let i = 0; i < cidadeParcial.length; i++) {
      await page.locator('//*[@id="cidade"]').type(cidadeParcial[i])
      await page.waitForTimeout(80)
    }
    await page.waitForTimeout(1200)
    await page.locator('#cidade\\:menu li').first().click()
    await page.waitForTimeout(800) // Aguardar após selecionar cidade

    // ========== ETAPA 5: Valores ==========
    await job.updateProgress(40)
    console.log(`💵 Preenchendo valores...`)

    let valorAvaliacaoNumeros = dados.valorAvaliacao
    if (typeof valorAvaliacaoNumeros === 'string') {
      valorAvaliacaoNumeros = valorAvaliacaoNumeros
        .replace(/R\$\s?/g, '')
        .replace(/\./g, '')
        .replace(/,/g, '')
    }
    valorAvaliacaoNumeros = Math.floor(
      Number(valorAvaliacaoNumeros) / 100
    ).toString()
    await page.locator('//*[@id="valorImovel"]').fill(valorAvaliacaoNumeros)

    let rendaNumeros = dados.rendaFamiliar
    if (typeof rendaNumeros === 'string') {
      rendaNumeros = rendaNumeros
        .replace(/R\$\s?/g, '')
        .replace(/\./g, '')
        .replace(/,/g, '')
    }
    rendaNumeros = Math.floor(Number(rendaNumeros) / 100).toString()
    await page.locator('//*[@id="renda"]').fill(rendaNumeros)

    // ========== ETAPA 6: Participantes ==========
    await job.updateProgress(50)
    console.log(
      `👥 Selecionando ${dados.quantidadeParticipantes} participantes`
    )

    await page.waitForSelector('#quantidadeParticipantes', {
      state: 'visible',
      timeout: 10000,
    })

    await page.evaluate((qtd) => {
      const select = document.getElementById('quantidadeParticipantes')
      if (select) {
        select.value = qtd.toString()
        select.dispatchEvent(new Event('change', { bubbles: true }))
        select.dispatchEvent(new Event('blur', { bubbles: true }))
      }
    }, dados.quantidadeParticipantes)

    await page.waitForTimeout(1500)

    if (dados.possuiTresAnosFGTS) {
      if (dados.origemRecurso === 'FGTS') {
        console.log('✅ Marcando: 3 anos de FGTS')
        await page.locator('//*[@id="checkbox"]').check()
      } else {
        console.log(
          '⚠️ Ignorando flag "3 anos de FGTS" pois origem não é FGTS (SBPE). Continuando automação...'
        )
      }
    }

    if (dados.jaBeneficiadoSubsidio) {
      console.log('✅ Marcando: Já beneficiado com subsídio')
      await page.locator('//*[@id="checkbox_0"]').check()
    }

    await page.waitForTimeout(500) // Aguardar antes de clicar
    await page.waitForSelector('span:has-text("Avançar")', {
      state: 'visible',
      timeout: 5000,
    })
    await page.locator('span:has-text("Avançar")').first().click()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000) // Aguardar página estabilizar

    await page.waitForSelector('span:has-text("Avançar")', {
      state: 'visible',
      timeout: 5000,
    })
    await page.locator('span:has-text("Avançar")').first().click()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000) // Aguardar página estabilizar

    // ========== ETAPA 7: Dados dos Participantes ==========
    await job.updateProgress(55)
    console.log('📊 Preenchendo dados dos participantes...')

    if (dados.quantidadeParticipantes > 1 && dados.participantes) {
      for (let i = 0; i < dados.participantes.length; i++) {
        const participante = dados.participantes[i]
        const suffix = i === 0 ? '' : `_${i - 1}`

        const data = participante.dataNascimento
        let dataFormatada = data
        if (/^\d{4}-\d{2}-\d{2}$/.test(data)) {
          const [ano, mes, dia] = data.split('-')
          dataFormatada = `${dia}${mes}${ano}`
        }

        await page
          .locator(`//*[@id="pactuacaoRenda${suffix}"]`)
          .fill(participante.pactuacao.toString())

        await page.waitForTimeout(500)

        await page.locator(`//*[@id="dataNascimento${suffix}"]`).fill('')
        await page.waitForTimeout(300)

        for (let k = 0; k < dataFormatada.length; k++) {
          await page
            .locator(`//*[@id="dataNascimento${suffix}"]`)
            .type(dataFormatada[k])
          await page.waitForTimeout(150)
        }

        await page.waitForTimeout(500)
      }
    } else {
      const data = dados.participantes[0].dataNascimento
      let dataFormatada = data
      if (/^\d{4}-\d{2}-\d{2}$/.test(data)) {
        const [ano, mes, dia] = data.split('-')
        dataFormatada = `${dia}${mes}${ano}`
      }

      await page
        .locator('//*[@id="pactuacaoRenda"]')
        .fill(dados.participantes[0].pactuacao.toString())

      await page.waitForTimeout(500)

      await page.locator('//*[@id="dataNascimento"]').fill('')
      await page.waitForTimeout(300)

      for (let k = 0; k < dataFormatada.length; k++) {
        await page.locator('//*[@id="dataNascimento"]').type(dataFormatada[k])
        await page.waitForTimeout(150)
      }

      await page.waitForTimeout(1000)
    }

    if (dados.possuiDependentes) {
      if (dados.origemRecurso === 'FGTS') {
        console.log('✅ Flag possuiDependentes: será aplicada quando o checkbox estiver disponível')
      } else {
        console.log(
          '⚠️ Ignorando flag "Possui dependentes" pois origem não é FGTS (SBPE). Continuando automação...'
        )
      }
    }

    // Tentar marcar o checkbox '#possuiMaisUmParticipante' aqui, após definir participantes.
    // Em algumas versões da página esse checkbox aparece na mesma etapa que o sistema de amortização,
    // mas marcar aqui garante que a preferência do usuário seja aplicada antes.
    if (dados.possuiDependentes && dados.origemRecurso === 'FGTS') {
      try {
        await page.waitForSelector('#possuiMaisUmParticipante', { state: 'visible', timeout: 3000 })
        await page.check('#possuiMaisUmParticipante')
        console.log('✅ Checkbox "possuiMaisUmParticipante" marcado (agora após participantes)')
        await page.waitForTimeout(500)
      } catch (e) {
        console.log('⚠️ Checkbox #possuiMaisUmParticipante não encontrado agora — continuará sem marcação até aparecer')
      }
    }

    await page.waitForTimeout(2000) // Aguardar página processar dados
    console.log('✅ Dados dos participantes preenchidos')

    await page.waitForSelector('span:has-text("Avançar")', {
      state: 'visible',
      timeout: 5000,
    })
    await page.locator('span:has-text("Avançar")').first().click()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000) // Aguardar página estabilizar

    // ========== ETAPA 8: Selecionar código do sistema (SPAN) ==========
    await job.updateProgress(60)
    console.log(
      `🔍 Selecionando código do sistema baseado em origem: ${dados.origemRecurso}`
    )

    // Aguardar a página carregar completamente
    await page.waitForTimeout(3000)
    await page.waitForLoadState('networkidle', { timeout: 15000 })

    const codigoSistema = dados.origemRecurso === 'FGTS' ? '(3280)' : '(1976)'
    console.log(`🎯 Buscando span com código: ${codigoSistema}`)

    // Aguardar o elemento estar visível
    await page.waitForSelector('span', { state: 'visible', timeout: 10000 })
    await page.waitForTimeout(3000)

    const spanSelecionado = await page.evaluate((codigo) => {
      const spans = Array.from(document.querySelectorAll('span'))
      const span = spans.find((s) => s.textContent.includes(codigo))

      if (span) {
        span.click()
        return { sucesso: true, texto: span.textContent.trim() }
      }

      return {
        sucesso: false,
        erro: `Span com código ${codigo} não encontrado`,
      }
    }, codigoSistema)

    if (!spanSelecionado.sucesso) {
      throw new Error(spanSelecionado.erro)
    }

    console.log(`✅ Span selecionado: ${spanSelecionado.texto}`)
    await page.waitForTimeout(2000)

    // ========== ETAPA 9: Sistema de Amortização (SAC/PRICE) ==========
    await job.updateProgress(65)
    console.log(
      `💰 Selecionando sistema de amortização: ${dados.sistemaAmortizacao}`
    )

    await page.waitForSelector('#rcrRge', { state: 'visible', timeout: 5000 })

    const tipoAmortizacao = dados.sistemaAmortizacao
      .toUpperCase()
      .includes('SAC')
      ? 'SAC'
      : 'PRICE'
    console.log(`🎯 Buscando opção com: ${tipoAmortizacao}`)

    const amortizacaoSelecionada = await page.evaluate((tipo) => {
      const select = document.getElementById('rcrRge')
      if (!select) {
        return { sucesso: false, erro: 'Select #rcrRge não encontrado' }
      }

      const options = Array.from(select.options)
      const option = options.find((opt) => opt.text.includes(tipo))

      if (option) {
        select.value = option.value
        select.dispatchEvent(new Event('change', { bubbles: true }))
        return { sucesso: true, texto: option.text }
      }

      return { sucesso: false, erro: `Opção ${tipo} não encontrada` }
    }, tipoAmortizacao)

    if (!amortizacaoSelecionada.sucesso) {
      throw new Error(amortizacaoSelecionada.erro)
    }

    console.log(`✅ Sistema selecionado: ${amortizacaoSelecionada.texto}`)
    await page.waitForTimeout(2000) // Aumentado para aguardar processamento

    // ========== ETAPA 10 e 11: Possui dependentes e Área útil (APENAS PARA FGTS) ==========
    if (dados.origemRecurso === 'FGTS') {
      await job.updateProgress(70)
      console.log(
        `👨‍👩‍👧‍👦 Possui dependentes: ${dados.possuiDependentes ? 'Sim' : 'Não'}`
      )

      // Área útil: permanece nesta etapa
      await job.updateProgress(65)
      console.log('📐 Preenchendo área útil: 0')

      await page.waitForSelector('#areaUtil', {
        state: 'visible',
        timeout: 5000,
      })
      await page.fill('#areaUtil', '0')
      console.log('✅ Área útil preenchida')
      await page.waitForTimeout(500)
    } else {
      console.log(
        '⏭️ Pulando dependentes e área útil (SBPE não possui esses campos)'
      )
      await job.updateProgress(65)
    }

    // ========== ETAPA 12: Clicar em Avançar ==========
    await job.updateProgress(70)
    console.log('➡️ Clicando em Avançar')

    // Aguardar a página estabilizar antes de procurar o botão
    await page.waitForTimeout(2000)
    await page.waitForLoadState('networkidle', { timeout: 15000 })

    // Tentar múltiplas estratégias para encontrar o botão Avançar
    let clicouAvancar = false

    // Estratégia 1: Buscar por span com texto "Avançar"
    const avancar1 = await page.evaluate(() => {
      const spans = Array.from(document.querySelectorAll('span'))
      const span = spans.find((s) => s.textContent.trim() === 'Avançar')

      if (span) {
        span.click()
        return true
      }
      return false
    })

    if (avancar1) {
      clicouAvancar = true
      console.log('✅ Botão Avançar encontrado (estratégia 1: span)')
    }

    // Estratégia 2: Buscar por botão com texto "Avançar"
    if (!clicouAvancar) {
      const avancar2 = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'))
        const button = buttons.find((b) => b.textContent.includes('Avançar'))

        if (button) {
          button.click()
          return true
        }
        return false
      })

      if (avancar2) {
        clicouAvancar = true
        console.log('✅ Botão Avançar encontrado (estratégia 2: button)')
      }
    }

    // Estratégia 3: Buscar qualquer elemento clicável com "Avançar"
    if (!clicouAvancar) {
      const avancar3 = await page.evaluate(() => {
        const elementos = Array.from(document.querySelectorAll('*'))
        const elemento = elementos.find(
          (el) =>
            el.textContent.trim() === 'Avançar' &&
            (el.onclick || el.style.cursor === 'pointer' || el.tagName === 'A')
        )

        if (elemento) {
          elemento.click()
          return true
        }
        return false
      })

      if (avancar3) {
        clicouAvancar = true
        console.log(
          '✅ Botão Avançar encontrado (estratégia 3: qualquer elemento clicável)'
        )
      }
    }

    if (!clicouAvancar) {
      throw new Error(
        'Botão "Avançar" não encontrado após múltiplas tentativas'
      )
    }

    console.log('✅ Avançado para próxima etapa')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // ========== ETAPA 13: Ler prazo máximo e preencher ==========
    await job.updateProgress(90)
    console.log('📅 Lendo prazo máximo')

    const prazoMaximo = await page.evaluate(() => {
      const labels = Array.from(document.querySelectorAll('label'))
      const prazoLabel = labels.find((l) =>
        l.textContent.includes('Prazo Máximo')
      )

      if (prazoLabel && prazoLabel.parentElement) {
        const texto = prazoLabel.parentElement.textContent
        const match = texto.match(/(\d+)\s*meses/)
        return match ? match[1] : null
      }
      return null
    })

    if (!prazoMaximo) {
      throw new Error('Prazo máximo não encontrado')
    }

    console.log(`✅ Prazo máximo lido: ${prazoMaximo} meses`)

    await page.waitForSelector('#prazoObra', {
      state: 'visible',
      timeout: 5000,
    })
    await page.fill('#prazoObra', prazoMaximo)
    console.log(`✅ Prazo da obra preenchido: ${prazoMaximo}`)
    await page.waitForTimeout(1000)

    // ========== ETAPA 14: Calcular e Avançar ==========
    await job.updateProgress(95)
    console.log('🧮 Clicando em Calcular')

    const calcular = await page.evaluate(() => {
      const spans = Array.from(document.querySelectorAll('span'))
      const span = spans.find((s) => s.textContent.trim() === 'Calcular')

      if (span) {
        span.click()
        return true
      }
      return false
    })

    if (!calcular) {
      throw new Error('Botão "Calcular" não encontrado')
    }

    console.log('✅ Cálculo realizado')
    await page.waitForTimeout(2000)

    console.log('➡️ Clicando em Avançar final')
    await page.waitForSelector('a[href="informacronogramaobra.planilhacet"]', {
      state: 'visible',
      timeout: 5000,
    })
    await page.click('a[href="informacronogramaobra.planilhacet"]')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000) // Aguardar após navegação

    // ========== ETAPA 9: Capturar Resultados ==========
    await job.updateProgress(97)
    console.log('📊 Capturando resultados...')
    console.log('📍 URL atual:', page.url())

    // Aguardar a página carregar completamente
    await page.waitForTimeout(3000)

    // Aguardar tabela de resultados
    await page.waitForSelector('table', { timeout: 10000 })
    console.log('✅ Tabela de resultados encontrada')

    const resultados = await page.evaluate(() => {
      // Função auxiliar para extrair apenas números de valor monetário
      const extrairValor = (texto) => {
        if (!texto) return ''
        // Captura o valor após R$
        const match = texto.match(/R\$\s*([\d.,]+)/)
        if (!match) return texto

        // Retorna o valor mantendo pontos e vírgulas como estão
        // O processamento correto será feito no Node.js
        return match[1]
      }

      // Função auxiliar para extrair apenas números de texto
      const extrairNumero = (texto) => {
        if (!texto) return ''
        const match = texto.match(/(\d+)/)
        return match ? match[1] : texto
      }

      // 0. Tipo de Financiamento (label.simulador)
      const tipoFinanciamentoLabel = document.querySelector('label.simulador')
      const tipoFinanciamento = tipoFinanciamentoLabel
        ? tipoFinanciamentoLabel.textContent.trim()
        : ''

      // 1. Valor de Avaliação (Valor do imóvel da página)
      const valorAvaliacaoRow = Array.from(
        document.querySelectorAll('tr')
      ).find((tr) => tr.textContent.includes('Valor do imóvel:'))
      const valorAvaliacao = valorAvaliacaoRow
        ? extrairValor(
            valorAvaliacaoRow.querySelector('td:last-child')?.textContent || ''
          )
        : ''

      // 2. Subsídio (Desconto)
      const subsidioRow = Array.from(document.querySelectorAll('tr')).find(
        (tr) => tr.textContent.includes('Desconto:')
      )
      const subsidio = subsidioRow
        ? extrairValor(
            subsidioRow.querySelector('td:last-child')?.textContent || ''
          )
        : ''

      // 3. Valor Financiado (Valor de Financiamento)
      const valorFinanciadoRow = Array.from(
        document.querySelectorAll('tr')
      ).find((tr) => tr.textContent.includes('Valor de Financiamento'))
      let valorFinanciado = ''
      if (valorFinanciadoRow) {
        const tdText =
          valorFinanciadoRow.querySelector('td:last-child')?.textContent || ''
        // Pegar o primeiro valor monetário que não seja R$ 0,00
        const valores = tdText.match(/R\$\s*([\d.,]+)/g)
        if (valores) {
          for (const val of valores) {
            const numero = extrairValor(val)
            if (numero && numero !== '0,00' && numero !== '0.00') {
              valorFinanciado = numero
              break
            }
          }
        }
      }

      // 4. Prestação (Primeira Prestação da tabela específica)
      let prestacao = ''
      const tables = Array.from(document.querySelectorAll('table'))
      for (const table of tables) {
        const tbody = table.querySelector('tbody')
        if (tbody && tbody.textContent.includes('Primeira Prestação')) {
          // Encontrou a tabela correta, pegar o primeiro td da próxima tr
          const rows = Array.from(tbody.querySelectorAll('tr'))
          for (let i = 0; i < rows.length; i++) {
            if (rows[i].textContent.includes('Primeira Prestação')) {
              // Próxima linha tem os valores
              const nextRow = rows[i + 1]
              if (nextRow) {
                const firstTd = nextRow.querySelector('td')
                if (firstTd) {
                  prestacao = extrairValor(firstTd.textContent.trim())
                  break
                }
              }
            }
          }
          if (prestacao) break
        }
      }

      // 5. Prazo
      const prazoRow = Array.from(document.querySelectorAll('tr')).find((tr) =>
        tr.textContent.includes('Prazo:')
      )
      const prazo = prazoRow
        ? extrairNumero(
            prazoRow.querySelector('td:last-child')?.textContent || ''
          )
        : ''

      return {
        tipoFinanciamento,
        valorAvaliacao,
        subsidio,
        valorFinanciado,
        prestacao,
        prazo: prazo ? prazo + ' meses' : '',
      }
    })

    console.log(
      '✅ Resultados capturados:',
      JSON.stringify(resultados, null, 2)
    )

    // Função auxiliar para converter valor (formato americano OU brasileiro) para número
    const converterValorBrasileiro = (valor) => {
      if (!valor) return 0
      // Remove "R$" e espaços
      let num = valor.replace(/R\$\s*/g, '').trim()

      // Detectar formato: se tem vírgula seguida de 2 dígitos no final, é decimal
      // Ex: "240,000.00" (americano) ou "240.000,00" (brasileiro)
      const temVirgula = num.includes(',')
      const temPonto = num.includes('.')

      if (temVirgula && temPonto) {
        // Formato misto: verificar qual é o separador decimal (último)
        const ultimaVirgula = num.lastIndexOf(',')
        const ultimoPonto = num.lastIndexOf('.')

        if (ultimoPonto > ultimaVirgula) {
          // Formato americano: "240,000.00" - ponto é decimal
          num = num.replace(/,/g, '') // Remove vírgulas (milhares)
        } else {
          // Formato brasileiro: "240.000,00" - vírgula é decimal
          num = num.replace(/\./g, '').replace(',', '.')
        }
      } else if (temVirgula) {
        // Só vírgula: verificar se é decimal ou milhar
        const partes = num.split(',')
        if (partes.length === 2 && partes[1].length <= 2) {
          // Provável decimal: "1234,56"
          num = num.replace(',', '.')
        } else {
          // Provável milhar: "1,234" (americano)
          num = num.replace(/,/g, '')
        }
      }
      // Se só tem ponto, já está ok para parseFloat

      const resultado = parseFloat(num)
      return isNaN(resultado) ? 0 : resultado
    }

    // Função auxiliar para formatar valores como moeda
    const formatarMoeda = (valor) => {
      if (!valor && valor !== 0) return 'R$ 0,00'
      const numero =
        typeof valor === 'number' ? valor : converterValorBrasileiro(valor)
      if (isNaN(numero)) return 'R$ 0,00'
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(numero)
    }

    // Converter valores do input que vêm sem formatação (apenas números)
    // Ex: "17990000" precisa ser dividido por 100 para virar 179900.00
    const valorImovelInput = parseFloat(dados.valorImovel) / 100
    const valorAvaliacaoInput = parseFloat(dados.valorAvaliacao) / 100

    // Valores capturados da página - converter usando formato brasileiro
    let valorFinanciadoNum = converterValorBrasileiro(
      resultados.valorFinanciado
    )
    const subsidioValor = converterValorBrasileiro(resultados.subsidio)

    // Calcular entrada
    let entrada = valorImovelInput - valorFinanciadoNum - subsidioValor

    // Verificar se o valor financiado é maior que o valor do imóvel
    // Isso significa que o banco está financiando mais do que o necessário
    if (valorFinanciadoNum > valorImovelInput) {
      const excedente = valorFinanciadoNum - valorImovelInput
      const sinalMinimo = 3000.0

      // O excedente é abatido do financiamento
      // A entrada fica sendo apenas o sinal mínimo de R$ 3.000,00
      entrada = sinalMinimo

      // Reduzir o valor financiado: abater o excedente + o sinal mínimo
      valorFinanciadoNum = valorFinanciadoNum - excedente - sinalMinimo

      console.log('⚠️ Valor financiado maior que valor do imóvel - Ajustando:')
      console.log(`   Excedente: R$ ${excedente.toFixed(2)}`)
      console.log(`   Sinal mínimo (entrada): R$ ${sinalMinimo.toFixed(2)}`)
      console.log(
        `   Novo valor financiado: R$ ${valorFinanciadoNum.toFixed(2)}`
      )
    }

    console.log('💰 Cálculo da entrada:')
    console.log(`   Valor do Imóvel (input): R$ ${valorImovelInput.toFixed(2)}`)
    console.log(
      `   Valor de Avaliação (input): R$ ${valorAvaliacaoInput.toFixed(2)}`
    )
    console.log(`   Valor Financiado: R$ ${valorFinanciadoNum.toFixed(2)}`)
    console.log(`   Subsídio: R$ ${subsidioValor.toFixed(2)}`)
    console.log(`   Entrada calculada: R$ ${entrada.toFixed(2)}`)

    // Formatar todos os valores como moeda para o frontend
    resultados.entrada = formatarMoeda(entrada)
    resultados.valorAvaliacao = formatarMoeda(
      converterValorBrasileiro(resultados.valorAvaliacao)
    )
    resultados.valorImovel = formatarMoeda(valorImovelInput)
    resultados.subsidio = formatarMoeda(subsidioValor)
    resultados.valorFinanciado = formatarMoeda(valorFinanciadoNum)
    resultados.prestacao = formatarMoeda(
      converterValorBrasileiro(resultados.prestacao)
    )
    // tipoFinanciamento já vem como string, não precisa formatar

    console.log(
      '📦 Resultados formatados:',
      JSON.stringify(resultados, null, 2)
    )

    // ========== ETAPA 10: Gerar PDF ==========
    await job.updateProgress(98)
    console.log('📄 Gerando PDF...')

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px',
      },
    })

    const pdfBase64 = pdfBuffer.toString('base64')
    console.log(`✅ PDF gerado com sucesso (${pdfBuffer.length} bytes)`)

    await context.close()
    await browser.close()

    await job.updateProgress(100)
    console.log('✅ Automação concluída!')

    // Retornar resultado
    return {
      status: 'success',
      timestamp: new Date().toISOString(),
      dados,
      resultados,
      pdfBase64,
      nomeCliente: dados.nomeCliente,
    }
  } catch (error) {
    console.error('❌ Erro ao processar job:', error)

    // Tentar capturar screenshot para debug
    try {
      const screenshotsDir = path.join(__dirname, 'error-screenshots')
      fs.mkdirSync(screenshotsDir, { recursive: true })
      const filename = path.join(screenshotsDir, `${Date.now()}-job-${job.id}.png`)
      if (page && typeof page.screenshot === 'function') {
        await page.screenshot({ path: filename, fullPage: true })
        console.log(`✅ Screenshot de erro salvo: ${filename}`)
      } else if (context && typeof context.pages === 'function') {
        // fallback: tentar pegar a primeira página do contexto
        const pages = await context.pages()
        if (pages && pages[0] && typeof pages[0].screenshot === 'function') {
          await pages[0].screenshot({ path: filename, fullPage: true })
          console.log(`✅ Screenshot de erro salvo (fallback): ${filename}`)
        }
      }
    } catch (sErr) {
      console.error('⚠️ Falha ao salvar screenshot de erro:', sErr)
    }

    try {
      if (context && typeof context.close === 'function') await context.close()
      if (browser && typeof browser.close === 'function') await browser.close()
    } catch (closeErr) {
      console.error('⚠️ Erro ao fechar browser/context após falha:', closeErr)
    }

    // Sempre lançar mensagem padrão para o front
    throw new Error('Erro no processamento dos dados, tente novamente!')
  }
}

const worker = new Worker('simulador-caixa', processSimulacao, {
  connection: {
    url: process.env.REDIS_URL,
    maxRetriesPerRequest: null,
  },
  concurrency: 2,
  limiter: {
    max: 10,
    duration: 60000,
  },
  attempts: 1,
  backoff: {
    type: 'fixed',
    delay: 0,
  },
})

// Event listeners
worker.on('completed', (job) => {
  console.log(`✅ Job ${job.id} completado com sucesso\n`)
})

worker.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} falhou:`, err.message)
})

worker.on('error', (err) => {
  console.error('❌ Erro no worker:', err)
})

console.log('🚀 Worker iniciado e aguardando jobs...')
console.log('⚙️  Concorrência: 2 jobs simultâneos')
console.log('⏱️  Rate limit: 10 jobs/minuto')

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('\n🛑 Recebido SIGTERM, encerrando worker...')
  await worker.close()
  process.exit(0)
})

process.on('SIGINT', async () => {
  console.log('\n🛑 Recebido SIGINT, encerrando worker...')
  await worker.close()
  process.exit(0)
})

module.exports = { simuladorQueue }
