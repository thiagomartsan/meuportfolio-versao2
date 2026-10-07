# TM21 — V26

Pacote de 05/10/2026. Esta versão parte da V25 atualmente publicada e concentra três frentes: reconstrução comercial da página nacional `/criacao-de-sites/`, identidade regional mais forte em RS/SC e redução do caminho crítico de renderização da home e das demais páginas.

## O que muda na V26

### Página nacional — `/criacao-de-sites/`
- Reestruturada como página comercial para atendimento remoto em todo o Brasil.
- Novo hero com fotografia do Rio de Janeiro/Cristo Redentor em segundo plano, escurecida para não competir com a mensagem principal.
- Bandeira do Brasil usada como elemento de apoio, não como decoração dominante.
- Mapa das cinco regiões adaptado à paleta TM21, com Sul em maior destaque e as demais regiões organizadas em variações de azul/cinza.
- Blocos de valor, formatos de projeto, processo remoto, SEO/descoberta, projetos, FAQ e CTAs distribuídos ao longo da jornada.
- Explica que a TM21 atende remotamente em todo o Brasil e mantém páginas próprias de RS e SC para contextos regionais reais.
- Links internos reforçados para landing pages, sites institucionais, RS, SC, blog sobre Google e artigo sobre Instagram x site.
- Metadados e dados estruturados revisados. A página evita estratégia de “trocar apenas o nome da cidade” e não promete ranking.

### Rio Grande do Sul — `/rio-grande-do-sul/`
- Hero com Porto Alegre em segundo plano e baixa opacidade, preservando o texto como protagonista.
- Mantidos mapa, consulta por municípios, cobertura regional, CTAs e regra de visita presencial sob combinação.
- Custos de deslocamento continuam sujeitos a alinhamento prévio e não entram automaticamente no orçamento do site.

### Santa Catarina — `/santa-catarina/`
- Hero com Ponte Hercílio Luz em segundo plano e baixa opacidade.
- Mapa detalhado da Grande Florianópolis recebeu reforço visual para separar a Ilha de Santa Catarina do continente.
- O detalhe identifica “ILHA” e “CONTINENTE” e mantém os municípios destacados para avaliação de visita sob combinação.
- Mantidos atendimento online para todo o estado, consulta por município e regra de despesas de viagem.

### Performance
- Removido o preloader que segurava a primeira pintura da página.
- Google Fonts deixa de bloquear a renderização inicial: carregamento assíncrono com fallback `noscript`.
- `consent.js` passou a usar `defer`.
- Conteúdo da primeira dobra deixa de depender da animação de reveal para aparecer.
- Seções longas abaixo da dobra usam `content-visibility` onde apropriado para reduzir trabalho inicial de renderização.
- Imagens de hero foram convertidas para WebP e possuem versões menores para mobile.
- A Política de Privacidade foi ajustada para remover a referência ao armazenamento de sessão do preloader, que não existe mais.

> A meta é reduzir FCP/LCP e aproximar o desempenho mobile da faixa 95–99 observada como objetivo. A nota final precisa ser confirmada no PageSpeed Insights **depois do deploy**, porque rede, cache, CDN e ambiente do Lighthouse influenciam o resultado. Não tratar 95–99 como garantia fixa.

## Imagens da V26

Arquivos publicados:
- `assets/hero-br.webp` / `hero-br-mobile.webp` — hero Brasil.
- `assets/hero-rs.webp` / `hero-rs-mobile.webp` — hero Rio Grande do Sul.
- `assets/hero-sc.webp` / `hero-sc-mobile.webp` — hero Santa Catarina.
- `assets/br-regions-tm21.webp` — mapa das regiões na paleta TM21.

As imagens foram fornecidas pelo responsável do projeto. A captura do Flickr/Grêmio foi usada apenas como referência de composição e **não foi publicada como asset do site**. Antes de manter fotografias de terceiros em produção, confirmar licença/direito de uso quando necessário.

## Publicar a V26

1. Extraia `tm21-portfolio-v26.zip`.
2. Copie o conteúdo da pasta `tm21-portfolio` para dentro do repositório local existente, aceitando substituir os arquivos.
3. **Preserve a pasta `.git`** do repositório local. Ela não vem no ZIP.
4. Use um dos dois métodos abaixo.

### Método rápido
Execute `ATUALIZAR-V26.cmd` dentro da pasta do repositório. Ele mostra o status, adiciona as alterações, cria o commit da V26 e envia para o GitHub.

### Método manual — Git CMD

```cmd
cd /d "C:\Users\Admin\Desktop\Currículos\Thiago\Sites\Portfólio - Thiago\tm21-portfolio"
git status
git add .
git commit -m "Atualiza pagina Brasil, heroes regionais e performance para V26"
git push
```

Depois do deploy da Vercel, use `Ctrl + F5` e confira principalmente:
- `/`
- `/criacao-de-sites/`
- `/rio-grande-do-sul/`
- `/santa-catarina/`
- `/privacidade/`

## QA executado antes de empacotar

Checagens estáticas e de código:

```bash
python scripts/validate_site.py
node --check js/main.js
node --check js/regions.js
node --check js/analytics.js
node --check js/consent.js
```

Também foram conferidos localmente: arquivos e links internos, IDs duplicados, referências a assets, ausência do preloader, existência das versões WebP, metadados das páginas principais e sitemap.

**Limite desta validação:** o ambiente usado para fechar a V26 não permitiu abrir o site local em Chromium por política de rede. Portanto, a V26 não deve ser descrita como “render real completo em todos os breakpoints” antes do deploy. A V25 já tinha QA visual anterior; nesta revisão foram feitas validações estáticas e de estrutura. Após publicar, revisar desktop + mobile real e repetir PageSpeed.

## Estratégia de SEO regional

A arquitetura adotada é:

`Brasil / criação de sites` → hub nacional útil  
`Rio Grande do Sul` → página regional com conteúdo e cobertura próprios  
`Santa Catarina` → página regional com conteúdo e cobertura próprios

Não criar centenas de páginas municipais quase idênticas apenas trocando cidade. Novas páginas locais só devem existir quando houver conteúdo, oferta, evidência ou contexto realmente específico para aquele local.

O SEO técnico e o conteúdo aumentam a capacidade de descoberta, mas não garantem indexação imediata, posição específica, lead ou venda.


## V28 — performance da home
- CSS crítico da primeira dobra embutido; stylesheet completo passa a carregar sem bloquear a primeira pintura.
- Imagens da home com srcset/sizes e variantes 320/480/768 quando aplicável.
- Mosaico visual da hero usa lazy loading para não disputar rede com o texto principal no mobile.
- Removidas mutações de transition-delay em massa no carregamento inicial.
- Alterações concentradas na home; páginas comerciais mantidas.

## Ajuste de portfólio — v30
- Emily Sehn e Amigo Bicho passaram a usar screenshots reais em desktop + mobile;
- os dois projetos abrem a seleção principal lado a lado;
- a hero do portfólio agora destaca Emily, Amigo Bicho e Penafiel;
- demais páginas, Blog e rotas existentes foram preservadas.
