# Roteiro Buenos Aires

Roteiro dia a dia de uma viagem de 7 dias a Buenos Aires (06 a 12 de dezembro de 2026), em formato de app web para celular. Dá para instalar na tela inicial e usar sem internet.

- **Roteiro**: cada dia é desenhado como uma linha de transporte, com horários, paradas, preços, tags, carrossel de fotos, um texto sobre cada lugar, sugestões para comer por perto e links para o Google Maps. Dá para trocar de dia pelas setas ← → do teclado, pelas setas laterais (computador) ou arrastando o dedo (celular). No topo de cada dia há um mapa com as paradas numeradas.
- **Comer**: restaurantes, cafés, sorveterias e bares por categoria, com atalho para o dia em que aparecem.
- **Antes de ir**: voos e hotel, instalação do app e download das fotos para usar offline, checklist de reservas (salvo no aparelho), soma dos custos anotados e créditos das fotos.

Durante a viagem, a página mostra qual é a próxima parada, usando o fuso de Buenos Aires. No mapa, essa parada aparece em amarelo.

## Como usar

Não precisa instalar nada para testar: abra o `index.html` no navegador. Para instalar como app e usar offline, o site precisa estar publicado em `https` (GitHub Pages, abaixo) ou rodando em `localhost`:

```
python -m http.server 8000
```

e abra `http://localhost:8000`.

## Estrutura

```
index.html             estrutura da página
css/style.css          visual (tema claro e escuro)
js/data.js             todo o conteúdo da viagem: dias, paradas, lugares, checklist e fotos
js/app.js              desenho das telas, carrosséis, mapa e navegação
sw.js                  service worker: guarda o site, as fotos e o mapa para uso offline
manifest.webmanifest   nome, cores e ícones do app instalado
icons/                 ícones do app
```

Para mudar o roteiro, edite só o `js/data.js`. Cada dia aceita `photos` (lista de chaves de `PHOTOS`, que vira o carrossel do topo). Cada parada aceita:

| Campo    | O que é                                         |
|----------|-------------------------------------------------|
| `t`      | horário, `"HH:MM"` (antes das 05:00 conta como madrugada do dia) |
| `name`   | nome da parada                                  |
| `info`   | texto de apoio                                  |
| `price`  | valor, entra na soma de custos                  |
| `tags`   | etiquetas, ex.: `["reserva"]`; `"a definir"` aparece em "Ainda em aberto" |
| `map`    | busca usada no link do Google Maps              |
| `ll`     | `[latitude, longitude]`; a parada entra no mapa do dia |
| `photos` | lista de chaves de fotos em `PHOTOS`; mais de uma vira carrossel |
| `minor`  | `true` para paradas secundárias (deslocamentos, hotel); não entram no mapa |
| `list`   | lista de pares `[nome, descrição]`              |
| `about`  | descrição curta do lugar (aparece como "Sobre o lugar") |
| `eat`    | lugares para comer por perto: `[nome, descrição, endereço]`; também aparecem em Comer → "Perto dos passeios" |
| `hotel`  | `true` nas paradas no hotel; ganham botão para o marcador "H" no mapa |

Para achar as coordenadas de um lugar: no Google Maps, clique com o botão direito no ponto e copie os números que aparecem no topo do menu.

## App e offline

- O site é um PWA. No Android/Chrome, aparece o botão **Instalar app** em "Antes de ir". No iPhone, abra no Safari, toque em **Compartilhar → Adicionar à Tela de Início**.
- Depois da primeira visita, o roteiro funciona sem internet. Fotos e trechos de mapa ficam guardados conforme são vistos; o botão **Baixar fotos para usar offline** guarda todas as fotos de uma vez. Para os mapas, abra o mapa de cada dia uma vez com Wi-Fi antes de viajar.
- Com internet, o app sempre pega a versão mais nova dos arquivos. Se mudar a lista de arquivos em `sw.js`, suba o `VERSION` lá.

## Publicar no GitHub Pages

1. No repositório, vá em **Settings → Pages**.
2. Em **Source**, escolha **Deploy from a branch**, branch `main`, pasta `/ (root)`.
3. Depois de um ou dois minutos, o site fica em `https://<seu-usuario>.github.io/roteiro-buenos-aires/`.

## Créditos

- Fotos da [Wikimedia Commons](https://commons.wikimedia.org/), carregadas direto de lá. Autor e licença de cada uma estão na página do arquivo, linkada no próprio site.
- Mapas: [Leaflet](https://leafletjs.com/) com dados e blocos do © [OpenStreetMap](https://www.openstreetmap.org/copyright).
