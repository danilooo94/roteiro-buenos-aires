# Roteiro Buenos Aires

Roteiro dia a dia de uma viagem de 7 dias a Buenos Aires (06 a 12 de dezembro de 2026), em formato de app web para celular.

- **Roteiro**: cada dia é desenhado como uma linha de transporte, com horários, paradas, preços, tags e links para o Google Maps.
- **Comer**: restaurantes, cafés, sorveterias e bares por categoria, com atalho para o dia em que aparecem.
- **Antes de ir**: voos e hotel, checklist de reservas (salvo no aparelho), soma dos custos anotados e créditos das fotos.

Durante a viagem, a página mostra qual é a próxima parada, usando o fuso de Buenos Aires.

## Como usar

Não precisa instalar nada. Abra o `index.html` no navegador, ou publique pelo GitHub Pages (abaixo).

## Estrutura

```
index.html      estrutura da página
css/style.css   visual (tema claro e escuro)
js/data.js      todo o conteúdo da viagem: dias, paradas, lugares, checklist e fotos
js/app.js       desenho das telas e navegação
```

Para mudar o roteiro, edite só o `js/data.js`. Cada parada aceita:

| Campo   | O que é                                         |
|---------|-------------------------------------------------|
| `t`     | horário, `"HH:MM"` (antes das 05:00 conta como madrugada do dia) |
| `name`  | nome da parada                                  |
| `info`  | texto de apoio                                  |
| `price` | valor, entra na soma de custos                  |
| `tags`  | etiquetas, ex.: `["reserva"]`; `"a definir"` aparece em "Ainda em aberto" |
| `map`   | busca usada no link do Google Maps              |
| `photo` | chave de uma foto em `PHOTOS`                   |
| `minor` | `true` para paradas secundárias (deslocamentos, hotel) |
| `list`  | lista de pares `[nome, descrição]`              |

## Publicar no GitHub Pages

1. No repositório, vá em **Settings → Pages**.
2. Em **Source**, escolha **Deploy from a branch**, branch `main`, pasta `/ (root)`.
3. Depois de um ou dois minutos, o site fica em `https://<seu-usuario>.github.io/roteiro-buenos-aires/`.

## Fotos

As fotos vêm da [Wikimedia Commons](https://commons.wikimedia.org/), carregadas direto de lá. Autor e licença de cada uma estão na página do arquivo, linkada no próprio site.
