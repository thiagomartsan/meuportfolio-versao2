# Mapa de atendimento de Santa Catarina — V25

Geometria municipal simplificada do IBGE convertida em SVG local. O recorte de cobertura segue os mapas e a lista de municípios fornecidos pelo responsável da TM21. A figura ilustra uma possibilidade comercial de visita; não declara unidades locais nem uma classificação regional oficial vigente.

Fonte da geometria:
https://servicodados.ibge.gov.br/api/v3/malhas/estados/42?formato=application/vnd.geo+json&qualidade=minima&intrarregiao=municipio

Documentação:
https://servicodados.ibge.gov.br/api/docs/malhas?versao=3

Fonte dos nomes e códigos dos municípios:
https://servicodados.ibge.gov.br/api/v1/localidades/estados/42/municipios

Consulta em 04/10/2026, horário de Brasília. A malha e a consulta de cidade têm os 295 municípios de Santa Catarina.

Nove municípios em azul: Florianópolis, São José, Palhoça, Biguaçu, Santo Amaro da Imperatriz, Governador Celso Ramos, Antônio Carlos, Águas Mornas e São Pedro de Alcântara. Neles, uma visita pode ser avaliada conforme objetivo, agenda, deslocamento e custos de viagem previamente alinhados. O atendimento online está disponível em todos eles.

Os outros 13 municípios da lista regional recebida aparecem como atendimento online: Alfredo Wagner, Angelina, Anitápolis, Canelinha, Garopaba, Leoberto Leal, Major Gercino, Nova Trento, Paulo Lopes, Rancho Queimado, São Bonifácio, São João Batista e Tijucas. Os grupos textuais têm nomes familiares para orientar a consulta, sem pretender reproduzir divisões estatísticas.

Demais municípios: cinza e atendimento online. Não são atribuídos escritórios, coordenadas comerciais ou histórico de visitas em SC. O texto apresenta o presencial como possibilidade sob combinação.

O HTML contém o mapa estadual e uma ampliação dos mesmos nove polígonos; não é uma segunda área de cobertura. `assets/sc-coverage.svg` é a versão estática independente do mapa estadual. Os quatro botões de áreas são equivalentes acessíveis aos cliques do SVG. A busca reconhece nomes sem acentos e o apelido “Floripa”.

O CSS e o JavaScript são compartilhados com o RS. O estado e os textos são obtidos dos dados locais de cada página. Nenhuma API cartográfica é chamada em produção, não há pedido de localização ao navegador e a pesquisa de cidade não é enviada ao Analytics. O controle de pausa e a preferência de movimento reduzido são respeitados.
