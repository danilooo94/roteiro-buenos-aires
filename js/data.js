/* ===== DADOS =====
   Todo o conteúdo da viagem fica aqui. Para mudar o roteiro, edite só este arquivo;
   o desenho da página fica em app.js. */
const TRIP = {
  tz: "America/Argentina/Buenos_Aires",
  days: [
    { id: "dia-06", date: "2026-12-06", wd: "Domingo", abbr: "dom", title: "San Telmo", photo: "dorrego",
      stops: [
        { t: "12:40", name: "Pouso no Aeroparque (AEP)", minor: true,
          info: "Táxi ou Uber até o Hotel Pleno Madero (~20 min). Check-in só às 15h: deixar as malas na recepção.",
          map: "Hotel Pleno Madero, Buenos Aires" },
        { t: "14:30", name: "Feira e Mercado de San Telmo",
          info: "A pé do hotel (~15 min) ou Uber. Feira das 10h às 17h; almoço no Mercado, aberto das 9h às 20h.",
          list: [["El Hornero", "empanadas"], ["Choripanería", "choripan"], ["Saigón", "vietnamita"],
                 ["The Market Burger", "hambúrguer e cachorro-quente"], ["Dulce de Leche & Co", "doce de leite"],
                 ["La Churretería", "churros salgados e doces"]],
          map: "Mercado de San Telmo, Buenos Aires" },
        { t: "16:00", name: "El Zanjón de Granados", info: "Visita guiada pelos túneis. Defensa 755.",
          price: 121, tags: ["reservar"], map: "El Zanjón de Granados, Defensa 755, Buenos Aires" },
        { t: "17:00", name: "Plaza Dorrego e Paseo de la Historieta", info: "Esculturas dos quadrinhos argentinos pelas calçadas.",
          map: "Plaza Dorrego, San Telmo, Buenos Aires" },
        { t: "17:30", name: "Hotel", minor: true },
        { t: "20:30", name: "Jantar na La Brigada", info: "Parrilla em que a carne é cortada com colher.",
          tags: ["reserva"], map: "La Brigada, Estados Unidos 465, Buenos Aires" }
      ] },

    { id: "dia-07", date: "2026-12-07", wd: "Segunda", abbr: "seg", title: "Centro histórico e Puerto Madero", photo: "barolo",
      badge: "dia não laborável",
      note: "Bancos e repartições fecham; atrações, cafés e shoppings abrem e ficam mais cheios. A Fragata Sarmiento fecha às segundas e foi para quinta.",
      stops: [
        { t: "09:00", name: "Plaza del Congreso", map: "Plaza del Congreso, Buenos Aires" },
        { t: "10:00", name: "Palacio Barolo", info: "Visita guiada de 1h30 com subida ao farol e vista 360°. Av. de Mayo 1370.",
          price: 203, tags: ["ingresso"], map: "Palacio Barolo, Av. de Mayo 1370, Buenos Aires" },
        { t: "11:30", name: "Avenida de Mayo a pé", info: "Sentido Plaza de Mayo.", minor: true },
        { t: "12:30", name: "Almoço no London City", info: "Café histórico. Av. de Mayo 599.",
          map: "London City, Av. de Mayo 599, Buenos Aires" },
        { t: "13:45", name: "Catedral, Plaza de Mayo, Casa Rosada e Cabildo", photo: "rosada", info: "Casa Rosada e Cabildo só por fora.",
          map: "Plaza de Mayo, Buenos Aires" },
        { t: "15:00", name: "Galerías Pacífico", info: "A pé pela Florida. Shopping em prédio histórico com murais na cúpula, aberto das 10h às 21h.",
          tags: ["opcional"], map: "Galerías Pacífico, Florida 753, Buenos Aires" },
        { t: "16:15", name: "Obelisco, Av. Corrientes e sorvete na Cadore", info: "Cadore fica na Corrientes 1695.",
          map: "Heladería Cadore, Av. Corrientes 1695, Buenos Aires" },
        { t: "17:15", name: "Puente de la Mujer", photo: "puente", info: "Uber até Puerto Madero e caminhada pelos diques.",
          map: "Puente de la Mujer, Puerto Madero, Buenos Aires" },
        { t: "18:00", name: "Hotel, descanso e banho", minor: true },
        { t: "21:00", name: "Jantar em Puerto Madero", tags: ["a definir"] }
      ],
      tip: "Sem o shopping, dá para adiantar o Obelisco para as 15h e chegar mais cedo ao hotel." },

    { id: "dia-08", date: "2026-12-08", wd: "Terça", abbr: "ter", title: "Recoleta e Teatro Colón", photo: "recoleta",
      badge: "feriado",
      stops: [
        { t: "09:00", name: "Cemitério da Recoleta", map: "Cementerio de la Recoleta, Buenos Aires" },
        { t: "11:00", name: "Feira da Recoleta", info: "Das 11h às 20h, na Plaza Francia.", map: "Feria de Recoleta, Plaza Francia, Buenos Aires" },
        { t: "12:00", name: "Almoço no La Parolaccia", price: 200, map: "La Parolaccia, Recoleta, Buenos Aires" },
        { t: "13:00", name: "Centro Cultural Recoleta", info: "Aberto das 11h às 21h. Junín 1930.",
          map: "Centro Cultural Recoleta, Junín 1930, Buenos Aires" },
        { t: "14:30", name: "Basílica del Pilar e Museu dos Claustros", info: "Claustros das 14h às 17h.",
          map: "Basílica Nuestra Señora del Pilar, Buenos Aires" },
        { t: "15:30", name: "Café na La Biela", info: "Embaixo do gomero centenário.", map: "La Biela, Recoleta, Buenos Aires" },
        { t: "16:00", name: "Av. Santa Fe", photo: "ateneo", info: "Galería Bond Street, El Ateneo Grand Splendid e sorvete na Rapanui.",
          map: "El Ateneo Grand Splendid, Av. Santa Fe 1860, Buenos Aires" },
        { t: "17:30", name: "Hotel", minor: true },
        { t: "19:20", name: "Teatro Colón", photo: "colon", tags: ["ingresso"], map: "Teatro Colón, Buenos Aires" },
        { t: "22:00", name: "Pizzería Güerrín", info: "Av. Corrientes 1368, a poucos minutos do teatro.",
          map: "Pizzería Güerrín, Av. Corrientes 1368, Buenos Aires" }
      ],
      tip: "A tarde é a parte mais apertada do roteiro. Se atrasar, a Bond Street é o corte mais fácil; em feriado parte das lojas dela pode estar fechada." },

    { id: "dia-09", date: "2026-12-09", wd: "Quarta", abbr: "qua", title: "Palermo e Don Julio", photo: "rosedal",
      note: "Melhor dia para Palermo: o MALBA abre às 11h com ingresso mais barato. São uns 8 km a pé; se o calor apertar, táxi entre os parques. Do hotel, ~20 min de táxi.",
      stops: [
        { t: "10:30", name: "Floralis Genérica", photo: "floralis", map: "Floralis Genérica, Buenos Aires" },
        { t: "11:00", name: "Museo Nacional de Bellas Artes", info: "Ao lado da Floralis. Entrada grátis.",
          map: "Museo Nacional de Bellas Artes, Buenos Aires" },
        { t: "12:00", name: "MALBA", info: "Frida Kahlo, Xul Solar, Berni. Táxi curto ou ~15 min a pé desde o Bellas Artes.",
          price: 24, map: "MALBA, Av. Figueroa Alcorta 3415, Buenos Aires" },
        { t: "13:00", name: "Almoço", tags: ["a definir"] },
        { t: "14:00", name: "Jardim Japonês", photo: "japones", price: 85, map: "Jardín Japonés, Buenos Aires" },
        { t: "15:00", name: "Bosques de Palermo", info: "Rosedal e suas pérgolas, Museu Sívori ao lado e o Planetário.",
          map: "Rosedal de Palermo, Buenos Aires" },
        { t: "17:30", name: "Palermo Soho", info: "Lojinhas, sorvete na Tufic e Plaza Serrano.", map: "Plaza Serrano, Palermo, Buenos Aires" },
        { t: "18:30", name: "Hotel", minor: true },
        { t: "22:30", name: "Don Julio", info: "Guatemala 4699. Molleja inteira, charcutaria da casa e bife de chorizo ou ojo de bife.",
          tags: ["reserva"], map: "Don Julio, Guatemala 4699, Buenos Aires" },
        { t: "00:30", name: "Uptown Bar", info: "Arévalo 2030. Às quartas fecha às 2h.", tags: ["se der tempo"],
          map: "Uptown, Arévalo 2030, Buenos Aires" }
      ] },

    { id: "dia-10", date: "2026-12-10", wd: "Quinta", abbr: "qui", title: "Tigre, Barrio Chino e tango", photo: "tigre",
      note: "As 9h são a saída do hotel, com o barco por volta das 11h. Se o barco já estiver comprado para as 9h, a saída passa para ~7:30 e o resto do dia adianta.",
      stops: [
        { t: "09:00", name: "Saída do hotel para Retiro", info: "Trem até Tigre, cerca de 1h.", minor: true,
          map: "Estación Retiro Mitre, Buenos Aires" },
        { t: "11:00", name: "Passeio de barco pelo Delta", info: "Saindo de Tigre.", map: "Estación Fluvial de Tigre" },
        { t: "12:00", name: "Puerto de Frutos", info: "Em dia de semana há menos lojas abertas.", map: "Puerto de Frutos, Tigre" },
        { t: "13:00", name: "Trem de Tigre até Belgrano C", info: "Cerca de 40 min.", minor: true },
        { t: "14:00", name: "Almoço no Barrio Chino", info: "Dumplings na rua Arribeños.", map: "Barrio Chino, Arribeños, Belgrano, Buenos Aires" },
        { t: "15:00", name: "Barrio Chino", info: "Lojinhas e bubble tea." },
        { t: "16:15", name: "Táxi para Puerto Madero", minor: true },
        { t: "17:00", name: "Fragata Sarmiento", photo: "fragata", info: "Às quintas abre das 13h às 19h. Fecha se chover.",
          map: "Buque Museo Fragata Presidente Sarmiento, Puerto Madero" },
        { t: "18:00", name: "Hotel", minor: true },
        { t: "19:30", name: "Jantar na Cabaña Las Lilas", info: "Na beira do dique, a pé do hotel.",
          tags: ["reserva"], map: "Cabaña Las Lilas, Puerto Madero, Buenos Aires" },
        { t: "21:30", name: "Show de tango no La Ventana", info: "Balcarce 431. Conferir no voucher o horário de chegada.",
          tags: ["ingresso"], map: "La Ventana Tango, Balcarce 431, Buenos Aires" }
      ] },

    { id: "dia-11", date: "2026-12-11", wd: "Sexta", abbr: "sex", title: "La Boca, San Telmo e jazz em Palermo", photo: "caminito",
      note: "O Bebop fica hoje em Palermo Soho, não em San Telmo, por isso o táxi das 19:15.",
      stops: [
        { t: "10:30", name: "Caminito e arredores", info: "Ainda vazio a essa hora.", map: "Caminito, La Boca, Buenos Aires" },
        { t: "11:00", name: "Museu Benito Quinquela Martín", info: "Pedro de Mendoza 1835. Mirante e casa-ateliê do pintor.",
          price: 35, map: "Museo Benito Quinquela Martín, Buenos Aires" },
        { t: "12:00", name: "La Bombonera", photo: "bombonera", info: "Museo de la Pasión Boquense e tour do estádio. Em dia de jogo não há tour.",
          price: 146, tags: ["ingresso"], map: "Museo de la Pasión Boquense, Brandsen 805, Buenos Aires" },
        { t: "13:30", name: "Almoço", info: "Sugestão: bodegón El Obrero, de táxi.", tags: ["a definir"],
          map: "El Obrero, La Boca, Buenos Aires" },
        { t: "15:00", name: "Parque Lezama", info: "E as cúpulas azuis da Igreja Ortodoxa Russa, na Brasil 315.",
          map: "Parque Lezama, Buenos Aires" },
        { t: "17:30", name: "Pulpería Quilapán", map: "Pulpería Quilapán, Defensa 1344, Buenos Aires" },
        { t: "19:15", name: "Táxi para Palermo Soho", info: "25 a 30 min.", minor: true },
        { t: "20:00", name: "Jazz no Bebop Club", info: "Uriarte 1658.", price: 90, tags: ["ingresso"],
          map: "Bebop Club, Uriarte 1658, Buenos Aires" }
      ],
      tip: "Em La Boca, fiquem no circuito turístico e façam de táxi os trechos entre o bairro e o Parque Lezama." },

    { id: "dia-12", date: "2026-12-12", wd: "Sábado", abbr: "sáb", title: "Saída",
      stops: [
        { t: "10:00", name: "Saída do hotel para Ezeiza", info: "Para chegar com 3h de antecedência.", minor: true,
          map: "Aeropuerto Internacional Ezeiza" },
        { t: "14:00", name: "Voo internacional", info: "Aeroporto de Ezeiza (EZE)." }
      ] }
  ],

  places: [
    { cat: "Parrilla", items: [
      { name: "La Brigada", what: "San Telmo. A carne é cortada com colher.", day: "dia-06", when: "dom 20:30" },
      { name: "Don Julio", what: "Palermo. Molleja, charcutaria da casa, bife de chorizo.", day: "dia-09", when: "qua 22:30" },
      { name: "Cabaña Las Lilas", what: "Puerto Madero, na beira do dique.", day: "dia-10", when: "qui 19:30" },
      { name: "Choripanería", what: "Mercado de San Telmo. Choripan.", day: "dia-06", when: "dom almoço" } ] },
    { cat: "Italiano e pizza", items: [
      { name: "La Parolaccia", what: "Recoleta. Massas.", day: "dia-08", when: "ter 12:00" },
      { name: "Pizzería Güerrín", what: "Av. Corrientes 1368. Pizzaria clássica.", day: "dia-08", when: "ter 22:00" } ] },
    { cat: "Mercado de San Telmo", items: [
      { name: "El Hornero", what: "Empanadas.", day: "dia-06", when: "dom almoço" },
      { name: "The Market Burger", what: "Hambúrguer e cachorro-quente.", day: "dia-06", when: "dom almoço" },
      { name: "Saigón", what: "Vietnamita.", day: "dia-06", when: "dom almoço" },
      { name: "La Churretería", what: "Churros salgados e doces.", day: "dia-06", when: "dom almoço" },
      { name: "Dulce de Leche & Co", what: "Variedade de doce de leite.", day: "dia-06", when: "dom almoço" } ] },
    { cat: "Asiático", items: [
      { name: "Barrio Chino", what: "Rua Arribeños. Dumplings e bubble tea.", day: "dia-10", when: "qui 14:00" } ] },
    { cat: "Cafés históricos", items: [
      { name: "London City", what: "Av. de Mayo 599.", day: "dia-07", when: "seg 12:30" },
      { name: "La Biela", what: "Recoleta, embaixo do gomero.", day: "dia-08", when: "ter 15:30" } ] },
    { cat: "Sorveterias", items: [
      { name: "Cadore", what: "Desde 1957. Corrientes 1695. Doce de leite.", day: "dia-07", when: "seg 16:15" },
      { name: "Rapanui", what: "Av. Santa Fe.", day: "dia-08", when: "ter 16:00" },
      { name: "Tufic", what: "Palermo Soho.", day: "dia-09", when: "qua 17:30" },
      { name: "Saverio", what: "Desde 1909, a mais antiga em atividade. Av. San Juan, altura 2700.", tag: "fora do roteiro" },
      { name: "Scannapieco", what: "Fundada em 1938. Av. Álvarez Thomas 10.", tag: "fora do roteiro" } ] },
    { cat: "Bares e shows", items: [
      { name: "Uptown Bar", what: "Palermo. Bar temático de metrô.", day: "dia-09", when: "qua 00:30" },
      { name: "La Ventana", what: "San Telmo. Show de tango.", day: "dia-10", when: "qui 21:30" },
      { name: "Pulpería Quilapán", what: "San Telmo.", day: "dia-11", when: "sex 17:30" },
      { name: "Bebop Club", what: "Palermo Soho. Jazz.", day: "dia-11", when: "sex 20:00" } ] }
  ],

  checklist: [
    { id: "chk-barolo", text: "Barolo: conferir se o ingresso é para segunda às 10h",
      link: ["grade de horários", "https://www.airedesantafe.com.ar/turismo/cuanto-cuesta-visitar-el-palacio-barolo-mayo-2025-buenos-aires-y-que-incluye-el-tour-guiado-n616889"] },
    { id: "chk-zanjon", text: "El Zanjón: reservar a visita guiada de domingo às 16h" },
    { id: "chk-mesas", text: "Reservar mesas: La Brigada (dom 20:30), Don Julio (qua 22:30), Uptown (qua), Cabaña Las Lilas (qui 19:30)" },
    { id: "chk-ventana", text: "La Ventana: conferir no voucher o horário de chegada na quinta" },
    { id: "chk-boca", text: "Boca Juniors: checar se há jogo em casa em 11/12",
      link: ["regras do museu", "https://www.atrapalo.com.ar/actividades/entradas-al-museo-de-la-pasion-boquense_e4928465/"] },
    { id: "chk-bebop", text: "Bebop Club: confirmar o ingresso de sexta às 20h no endereço de Palermo, Uriarte 1658",
      link: ["mudança de endereço", "https://www.cronista.com/clase/gourmet/hay-un-nuevo-bar-de-jazz-en-palermo-y-tiene-los-mejores-vinos-del-pais-elegidos-por-aldo-graziani"] },
    { id: "chk-aberto", text: "Definir o que está em aberto: jantar de segunda, almoços de quarta e sexta" }
  ]
};

/* Fotos da Wikimedia Commons, chamadas pelo nome do arquivo.
   Autor e licença de cada uma estão na página do arquivo (link "Foto"). */
const PHOTOS = {
  obelisco:  { file: "Buenos Aires - Obelisco.jpg", alt: "Obelisco de Buenos Aires" },
  dorrego:   { file: "San Telmo Plaza Dorrego.JPG", alt: "Plaza Dorrego, San Telmo" },
  barolo:    { file: "Buenos Aires-Av. de Mayo-Palacio Barolo-1.jpg", alt: "Palacio Barolo, Avenida de Mayo" },
  rosada:    { file: "Casa Rosada, Buenos Aires, Argentina.jpg", alt: "Casa Rosada" },
  puente:    { file: "Puente de la Mujer (5458733237).jpg", alt: "Puente de la Mujer, Puerto Madero" },
  recoleta:  { file: "Cementerio de la Recoleta.jpg", alt: "Cemitério da Recoleta" },
  ateneo:    { file: "El Ateneo Grand Splendid, Buenos Aires (38984631534).jpg", alt: "El Ateneo Grand Splendid" },
  colon:     { file: "Buenos Aires - Teatro Colón - 20051215.jpg", alt: "Teatro Colón" },
  floralis:  { file: "Floralis Genérica (27547134408).jpg", alt: "Floralis Genérica" },
  japones:   { file: "Jardín Japonés de Buenos Aires 01.jpg", alt: "Jardim Japonês de Buenos Aires" },
  rosedal:   { file: "El Rosedal, Palermo 04.jpg", alt: "El Rosedal, Palermo" },
  tigre:     { file: "Delta del Tigre 1.jpg", alt: "Delta do Tigre" },
  fragata:   { file: "Buque Museo Fragata Presidente Sarmiento.jpg", alt: "Fragata Presidente Sarmiento" },
  caminito:  { file: "El Caminito de La Boca - Buenos-Aires.jpg", alt: "Caminito, La Boca" },
  bombonera: { file: "La Bombonera football stadium.jpg", alt: "La Bombonera" }
};
