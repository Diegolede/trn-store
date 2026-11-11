/* TRN — catálogo base e información de la tienda.
 * Lo más importante para publicar: STORE_CONFIG.whatsapp (número internacional
 * sin +, por ejemplo 5493410000000). También podés editar productos, precios
 * y datos de transferencia acá, o exportarlos desde el panel #/admin. */

const STORE_CONFIG = {
  name: "TRN",
  tagline: "Periféricos para jugar en serio.",
  transferDiscount: 0.05,
  installments: 6,
  freeShipping: 79990,
  adminPassword: "trn-admin",
  email: "hola@trn.com.ar",
  whatsapp: "5493410000000",
  whatsappDisplay: "341 000-0000",
  instagram: "https://instagram.com/trn.perifericos",
  instagramHandle: "@trn.perifericos",
  tiktok: "https://tiktok.com/@trn.perifericos",
  tiktokHandle: "@trn.perifericos",
  address: "Buenos Aires, Argentina",
  hours: "Lunes a viernes, 10 a 18 h",
  consumerDefense: "https://www.argentina.gob.ar/produccion/defensadelconsumidor",
  receiptHours: 48,
  transfer: {
    titular: "TRN Periféricos",
    cbu: "0000003100098765432101",
    alias: "TRN.PERIFERICOS",
    banco: "Mercado Pago",
    cuit: "20-00000000-0"
  }
};

const CATEGORIES = [
  "Mouse",
  "Teclados",
  "Mousepads",
  "Glasspads",
  "Auriculares in-ear",
  "Mangas",
  "Skates"
];

const CATEGORY_INFO = [
  { name: "Mouse", subtitle: "Sensores precisos, listos para competir" },
  { name: "Teclados", subtitle: "Magnéticos y mecánicos" },
  { name: "Mousepads", subtitle: "Control o velocidad, vos elegís" },
  { name: "Glasspads", subtitle: "Vidrio templado, deslizamiento limpio" },
  { name: "Auriculares in-ear", subtitle: "IEMs pensados para jugar" },
  { name: "Mangas", subtitle: "Menos fricción, más horas de train" },
  { name: "Skates", subtitle: "Glide consistente, cambio rápido" }
];

const FAQ_ITEMS = [
  {
    q: "¿Cómo compro?",
    a: "Elegí el producto en el catálogo y tocá Consultar por WhatsApp. Te confirmamos stock y color, coordinamos el envío y te mandamos el link de Mercado Pago o los datos para transferir (con 5% off). No hay carrito en el sitio: la compra se cierra por WhatsApp."
  },
  {
    q: "¿Hacen envíos a todo el país?",
    a: "Sí. Despachamos a todo Argentina por correo y mensajería. En CABA el plazo habitual es de 1 a 2 días hábiles; en GBA, 2 a 4; en el interior, 3 a 7, según la zona y el servicio. El tiempo exacto te lo confirmamos por WhatsApp, con tu código postal."
  },
  {
    q: "¿Cuánto tarda en salir el pedido?",
    a: "Los pedidos pagos que entran antes de las 13 h salen el mismo día hábil. Si pagás por transferencia, el despacho corre a partir de que confirmamos el comprobante."
  },
  {
    q: "¿Qué medios de pago aceptan?",
    a: "Después de confirmar la consulta por WhatsApp, podés pagar con Mercado Pago (tarjetas de crédito y débito, cuotas, dinero en cuenta y otros medios de la plataforma) o por transferencia bancaria, con 5% de descuento sobre el subtotal."
  },
  {
    q: "¿Cómo funciona el pago por transferencia?",
    a: "Cuando cerramos la compra por WhatsApp te pasamos titular, alias y CBU. Transferí el total dentro de las 48 horas y envianos el comprobante por el mismo chat. Cuando lo validemos, te confirmamos el pago y preparamos el envío."
  },
  {
    q: "¿Puedo cambiar o devolver un producto?",
    a: "Tenés 30 días corridos desde que lo recibís para pedir un cambio o una devolución, si el producto está sin uso, con su embalaje y accesorios. Los gastos de devolución corren por tu cuenta, salvo que el ítem haya llegado fallado o no coincida con lo que compraste."
  },
  {
    q: "¿Qué cubre la garantía?",
    a: "Todos los productos tienen 6 meses de garantía oficial TRN por fallas de fabricación. No cubre desgaste normal, golpes, humedad ni modificaciones. Si hay un defecto, nos ocupamos de la reparación, el reemplazo o la devolución del importe, según el caso."
  },
  {
    q: "¿Emiten factura?",
    a: "Sí. Pedinos los datos fiscales por WhatsApp o mail al confirmar la compra y te la enviamos. Si necesitás una razón social distinta, avisanos antes de que salga el pedido."
  }
];

const PRODUCTS = [
  {
    id: "mouse-pulse-x2",
    name: "TRN Pulse X2 Wireless",
    category: "Mouse",
    price: 89990,
    stock: 14,
    discount: 10,
    discountUntil: "2026-12-31",
    description: "Un inalámbrico liviano, pensado para sesiones largas sin cargar la muñeca. El Pulse X2 combina un sensor de alta precisión con switches ópticos y una shape que acompaña aim controlado, tanto en claw como en fingertip.",
    specs: [
      ["Sensor", "Óptico 26.000 DPI"],
      ["Peso", "58 g"],
      ["Conexión", "Inalámbrico 2,4 GHz y USB-C"],
      ["Polling rate", "Hasta 1.000 Hz"],
      ["Switches", "Ópticos, 80 millones de clics"],
      ["Batería", "Hasta 70 horas"],
      ["Dimensiones", "120 × 61 × 38 mm"]
    ],
    variants: ["Negro", "Blanco", "Rosa"]
  },
  {
    id: "mouse-apex-8k",
    name: "TRN Apex 8K",
    category: "Mouse",
    price: 64990,
    stock: 8,
    description: "Para quienes prefieren ir por cable y no ceder una milésima. El Apex 8K llega a 8.000 Hz de polling, con shape simétrica y un cable paracord que casi no se siente en la mesa.",
    specs: [
      ["Sensor", "Óptico 19.000 DPI"],
      ["Peso", "62 g"],
      ["Conexión", "Cable paracord USB-C"],
      ["Polling rate", "Hasta 8.000 Hz"],
      ["Switches", "Mecánicos, 80 millones de clics"],
      ["Shape", "Simétrica, ambidiestra"],
      ["Dimensiones", "122 × 62 × 38 mm"]
    ],
    variants: ["Negro", "Blanco"]
  },
  {
    id: "mouse-mini-pro",
    name: "TRN Mini Pro",
    category: "Mouse",
    price: 45990,
    stock: 0,
    description: "Formato compacto para palms chicas o claw cerrado. El Mini Pro es liviano, recarga por USB-C y rinde una jornada completa sin pensar en el enchufe.",
    specs: [
      ["Sensor", "Óptico 12.000 DPI"],
      ["Peso", "52 g"],
      ["Conexión", "Inalámbrico 2,4 GHz y USB-C"],
      ["Polling rate", "Hasta 1.000 Hz"],
      ["Switches", "Ópticos, 60 millones de clics"],
      ["Batería", "Hasta 70 horas"],
      ["Dimensiones", "108 × 58 × 36 mm"]
    ],
    variants: ["Negro", "Blanco", "Hielo"]
  },
  {
    id: "kb-circuit-75",
    name: "TRN Circuit 75",
    category: "Teclados",
    price: 189990,
    stock: 6,
    discount: 15,
    description: "Un 75% con gasket mount, keycaps PBT de perfil bajo y knob de volumen. Estable, silencioso y cómodo para escribir o para una ranked, sin ocupar todo el escritorio.",
    specs: [
      ["Formato", "75% (83 teclas)"],
      ["Switches", "Lineales prelubricados"],
      ["Montaje", "Gasket mount"],
      ["Keycaps", "PBT doubleshot"],
      ["Conexión", "Cable USB-C desmontable"],
      ["Extras", "Knob de volumen y teclas multimedia"],
      ["Dimensiones", "330 × 140 × 32 mm"]
    ],
    variants: ["Negro", "Blanco"]
  },
  {
    id: "kb-mono-tkl",
    name: "TRN Mono TKL",
    category: "Teclados",
    price: 149990,
    stock: 11,
    description: "El tenkeyless de todos los días: placa de aluminio, switches lineales ya lubricados y una construcción firme. Un clásico para quienes quieren más espacio para el mouse.",
    specs: [
      ["Formato", "TKL (87 teclas)"],
      ["Switches", "Lineales prelubricados"],
      ["Placa", "Aluminio"],
      ["Keycaps", "PBT"],
      ["Conexión", "USB-C desmontable"],
      ["Estructura", "Top mount"],
      ["Dimensiones", "360 × 135 × 33 mm"]
    ],
    variants: ["Negro", "Grafito"]
  },
  {
    id: "kb-type-60-he",
    name: "TRN Type 60 HE",
    category: "Teclados",
    price: 219990,
    stock: 4,
    description: "60% con switches magnéticos Hall Effect, actuation ajustable y rapid trigger. Hecho para el competitive: corte de movimiento preciso y un formato que deja el pad libre.",
    specs: [
      ["Formato", "60%"],
      ["Switches", "Magnéticos Hall Effect"],
      ["Actuation", "Ajustable, desde 0,1 mm"],
      ["Rapid trigger", "Sí"],
      ["Polling rate", "Hasta 8.000 Hz"],
      ["Conexión", "USB-C desmontable"],
      ["Dimensiones", "300 × 110 × 32 mm"]
    ],
    variants: ["Negro", "Blanco", "Titanio"]
  },
  {
    id: "pad-control-xl",
    name: "TRN Control XL",
    category: "Mousepads",
    price: 32990,
    stock: 22,
    description: "Superficie de tela de control, base antideslizante y formato XL. Paradas firmes y tracking estable, pensado para quienes priorizan precisión sobre velocidad cruda.",
    specs: [
      ["Superficie", "Tela de control, microtejido"],
      ["Base", "Caucho antideslizante"],
      ["Espesor", "4 mm"],
      ["Medidas", "45 × 40 cm"],
      ["Bordes", "Cosidos, bajos"],
      ["Cuidado", "Lavable a mano, secado plano"]
    ],
    variants: ["Negro", "Gris"]
  },
  {
    id: "pad-speed-mid",
    name: "TRN Speed Mid",
    category: "Mousepads",
    price: 24990,
    stock: 18,
    discount: 20,
    discountUntil: "2026-11-30",
    description: "Un weave más rápido, de 3 mm, con bordes cosidos que no enganchan. Equilibrio entre deslizamiento y control, ideal si venís de un pad lento y querés soltar la mano.",
    specs: [
      ["Superficie", "Tela speed, weave cerrado"],
      ["Base", "Caucho antideslizante"],
      ["Espesor", "3 mm"],
      ["Medidas", "40 × 35 cm"],
      ["Bordes", "Cosidos"],
      ["Cuidado", "Lavable a mano"]
    ],
    variants: ["Negro", "Blanco"]
  },
  {
    id: "pad-deskmat-pro",
    name: "TRN Deskmat Pro",
    category: "Mousepads",
    price: 39990,
    stock: 9,
    description: "Un deskmat de 90 × 40 cm para cubrir teclado y mouse con la misma superficie. Base de goma densa y un tejido uniforme que no cambia el glide de un extremo al otro.",
    specs: [
      ["Superficie", "Tela uniforme, control medio"],
      ["Base", "Goma de alta densidad"],
      ["Espesor", "3,5 mm"],
      ["Medidas", "90 × 40 cm"],
      ["Bordes", "Cosidos, reforzados"],
      ["Cuidado", "Lavable a mano"]
    ],
    variants: ["Negro", "Blanco", "Carbón"]
  },
  {
    id: "glass-1",
    name: "TRN Glass 1.0",
    category: "Glasspads",
    price: 79990,
    stock: 7,
    description: "Vidrio templado con un recubrimiento microtexturado que se siente consistente desde el primer uso. Fácil de limpiar y muy estable, para flicks largos sin que el pad se mueva.",
    specs: [
      ["Material", "Vidrio templado 3 mm"],
      ["Superficie", "Microtexturada"],
      ["Medidas", "45 × 40 cm"],
      ["Bordes", "Pulidos, redondeados"],
      ["Base", "Patas de silicona"],
      ["Cuidado", "Paño de microfibra, sin abrasivos"]
    ],
    variants: ["Transparente", "Negro ahumado"]
  },
  {
    id: "glass-frost",
    name: "TRN Frost Pad",
    category: "Glasspads",
    price: 69990,
    stock: 5,
    description: "Un glasspad esmerilado, un poco más de control que el Glass 1.0. Bordes pulidos y patas de silicona que lo dejan plantado, incluso en mesas lisas.",
    specs: [
      ["Material", "Vidrio templado esmerilado 3 mm"],
      ["Superficie", "Frost, control medio"],
      ["Medidas", "40 × 35 cm"],
      ["Bordes", "Pulidos"],
      ["Base", "Patas de silicona"],
      ["Cuidado", "Paño de microfibra"]
    ],
    variants: ["Frost", "Negro"]
  },
  {
    id: "glass-quartz-xl",
    name: "TRN Quartz XL",
    category: "Glasspads",
    price: 94990,
    stock: 3,
    description: "Formato XL en vidrio de 4 mm, con superficie pulida para recorridos largos. Más masa, más estabilidad y el mismo glide de punta a punta.",
    specs: [
      ["Material", "Vidrio templado 4 mm"],
      ["Superficie", "Pulida, speed"],
      ["Medidas", "50 × 42 cm"],
      ["Bordes", "Biselados y pulidos"],
      ["Base", "Silicona de alta adherencia"],
      ["Cuidado", "Paño de microfibra"]
    ],
    variants: ["Claro", "Grafito"]
  },
  {
    id: "ie-1",
    name: "TRN IE-1",
    category: "Auriculares in-ear",
    price: 54990,
    stock: 16,
    description: "In-ears con driver dinámico de 10 mm, aislamiento cómodo y cable desmontable. Sirven para una ranked y para el día a día, sin cansarte la oreja.",
    specs: [
      ["Driver", "Dinámico 10 mm"],
      ["Respuesta", "20 Hz – 20 kHz"],
      ["Impedancia", "16 Ω"],
      ["Cable", "Desmontable, conector 0,78 mm"],
      ["Jack", "3,5 mm chapado"],
      ["Accesorios", "Tips en tres talles y estuche"]
    ],
    variants: ["Negro", "Blanco"]
  },
  {
    id: "ie-studio-buds",
    name: "TRN Studio Buds",
    category: "Auriculares in-ear",
    price: 72990,
    stock: 10,
    description: "Híbridos (dinámico más armature), con una escena más amplia y un estuche de carga. El micrófono se entiende bien en colas y en calls.",
    specs: [
      ["Drivers", "Dinámico 8 mm + balanced armature"],
      ["Conexión", "Bluetooth 5.3 y cable USB-C"],
      ["Autonomía", "Hasta 7 h (28 h con el estuche)"],
      ["Micrófono", "Integrado, con reducción de ruido"],
      ["Carga", "USB-C, 1,5 h"],
      ["Accesorios", "Tips en cuatro talles y estuche"]
    ],
    variants: ["Negro", "Blanco", "Rosa"]
  },
  {
    id: "ie-night-mic",
    name: "TRN Night Mic",
    category: "Auriculares in-ear",
    price: 61990,
    stock: 12,
    description: "Pensados para el voice chat: boom mic desmontable, cable que no se enreda y tips en tres talles. Se escuchan claros y no se caen cuando te inclinás sobre el pad.",
    specs: [
      ["Driver", "Dinámico 10 mm"],
      ["Micrófono", "Boom desmontable, con mute"],
      ["Cable", "Trenzado anti-enredo, 1,2 m"],
      ["Jack", "3,5 mm, splitter incluido"],
      ["Aislamiento", "Pasivo, tips de silicona"],
      ["Accesorios", "Tips en tres talles y clip para la ropa"]
    ],
    variants: ["Negro", "Gris"]
  },
  {
    id: "sleeve-pro",
    name: "TRN Sleeve Pro",
    category: "Mangas",
    price: 12990,
    stock: 30,
    description: "Manga de lycra transpirable, con costura plana y un elástico que no marca. Reduce la fricción contra el pad y se aguanta una sesión larga sin rodar hacia atrás.",
    specs: [
      ["Material", "Lycra transpirable"],
      ["Largo", "40 cm"],
      ["Costura", "Plana, anti-roce"],
      ["Puños", "Elástico suave en ambos extremos"],
      ["Talle", "Único, elástico"],
      ["Cuidado", "Lavable a máquina, secado rápido"]
    ],
    variants: ["Negro", "Blanco", "Gris"]
  },
  {
    id: "sleeve-lite",
    name: "TRN Sleeve Lite",
    category: "Mangas",
    price: 8990,
    stock: 40,
    description: "La versión más liviana y un poco más corta. Ideal para días de calor o para llevar en la mochila sin que ocupe lugar.",
    specs: [
      ["Material", "Lycra liviana"],
      ["Largo", "34 cm"],
      ["Costura", "Plana"],
      ["Talle", "Único, elástico"],
      ["Cuidado", "Lavable a máquina"]
    ],
    variants: ["Negro", "Blanco"]
  },
  {
    id: "sleeve-dual",
    name: "TRN Sleeve Dual Pack",
    category: "Mangas",
    price: 19990,
    stock: 20,
    description: "Dos mangas Pro en un solo pack, para alternar entre partida y lavar. Misma tela, mismo elástico, mismo talle único.",
    specs: [
      ["Contenido", "2 mangas Sleeve Pro"],
      ["Material", "Lycra transpirable"],
      ["Largo", "40 cm"],
      ["Talle", "Único, elástico"],
      ["Cuidado", "Lavable a máquina, secado rápido"]
    ],
    variants: ["Negro", "Mixto"]
  },
  {
    id: "skates-ptfe",
    name: "TRN PTFE Dots",
    category: "Skates",
    price: 7990,
    stock: 48,
    description: "Dots de PTFE puro de 0,8 mm para recuperar el glide original del mouse. Se pegan en minutos y no dejan residuo al cambiarlos.",
    specs: [
      ["Material", "PTFE puro"],
      ["Espesor", "0,8 mm"],
      ["Formato", "Dots, pack de 16"],
      ["Adhesivo", "3M"],
      ["Compatibilidad", "Mayoría de shapes, recorte no necesario"]
    ],
    variants: ["Blanco", "Negro"]
  },
  {
    id: "skates-glass",
    name: "TRN Glass Skates",
    category: "Skates",
    price: 14990,
    stock: 15,
    description: "Skates de vidrio para glasspads y telas rápidas. El deslizamiento es muy parejo desde el primer uso, casi sin break-in.",
    specs: [
      ["Material", "Vidrio pulido"],
      ["Espesor", "0,7 mm"],
      ["Formato", "Dots y curvas, pack mixto"],
      ["Adhesivo", "3M de alta adhesión"],
      ["Uso recomendado", "Glasspads y pads speed"]
    ],
    variants: ["Claro"]
  },
  {
    id: "skates-ultra",
    name: "TRN Ultra Glide",
    category: "Skates",
    price: 9990,
    stock: 26,
    description: "Patines universales recortables, con adhesivo 3M y bordes ya redondeados. Calzan en la mayoría de los shapes sin dejar filo.",
    specs: [
      ["Material", "PTFE de alta densidad"],
      ["Espesor", "0,6 mm"],
      ["Formato", "Láminas recortables"],
      ["Adhesivo", "3M"],
      ["Incluye", "Plantilla y palito de aplicación"]
    ],
    variants: ["Blanco", "Negro"]
  }
];

const SITE_PAGES = {
  envios: {
    title: "Envíos",
    kicker: "Ayuda",
    body: `
      <p>Despachamos a todo el país, de lunes a viernes. El costo y el plazo se estiman en la ficha del producto con tu código postal y se confirman cuando coordinamos la compra por WhatsApp.</p>
      <h2>Plazos habituales</h2>
      <ul>
        <li>CABA: 1 a 2 días hábiles.</li>
        <li>GBA y alrededores: 2 a 4 días hábiles.</li>
        <li>Interior: 3 a 7 días hábiles, según la localidad.</li>
      </ul>
      <p>Los pedidos pagos ingresados antes de las 13 h salen el mismo día hábil. Si pagás por transferencia, el plazo de despacho empieza cuando confirmamos el comprobante.</p>
      <h2>Envío gratis</h2>
      <p>En compras que llegan al umbral de envío gratis publicado en la ficha, el envío va por nuestra cuenta a todo el país. Si el pedido queda por debajo, el costo se calcula según la zona y te lo confirmamos por WhatsApp.</p>
      <h2>Seguimiento</h2>
      <p>Cuando el paquete sale, te mandamos el número de seguimiento por WhatsApp o al mail que nos hayas pasado. Si hay una demora o una novedad en el destino, escribinos a <a href="mailto:${STORE_CONFIG.email}">${STORE_CONFIG.email}</a> o por el mismo chat y lo vemos juntos.</p>
    `
  },
  cambios: {
    title: "Cambios y devoluciones",
    kicker: "Ayuda",
    body: `
      <p>Queremos que el periférico te sirva. Si no es lo que esperabas, tenés 30 días corridos desde que lo recibís para pedir un cambio o una devolución.</p>
      <h2>Condiciones</h2>
      <ul>
        <li>El producto tiene que estar sin uso, con su embalaje, accesorios y etiquetas.</li>
        <li>Los skates recortados, las mangas usadas y los in-ears que no conserven el precinto higiénico no tienen cambio por arrepentimiento.</li>
        <li>Si el ítem llegó fallado o no coincide con lo que compraste, nos hacemos cargo del retiro y te lo resolvemos con un reemplazo o la devolución del importe.</li>
      </ul>
      <h2>Cómo pedirlo</h2>
      <p>Escribinos a <a href="mailto:${STORE_CONFIG.email}">${STORE_CONFIG.email}</a> o por WhatsApp, con el detalle de lo que compraste y el motivo. Te confirmamos la dirección de devolución y, cuando lo recibimos y revisamos, gestionamos el cambio o el reintegro por el mismo medio de pago, en un plazo de hasta 10 días hábiles.</p>
      <p>Si te arrepentís de la compra dentro de los plazos legales, también podés usar el <a href="#/arrepentimiento">botón de arrepentimiento</a>.</p>
    `
  },
  garantia: {
    title: "Garantía",
    kicker: "Ayuda",
    body: `
      <p>Todos los productos TRN tienen 6 meses de garantía oficial por fallas de fabricación, que se suma a los derechos que te da la Ley de Defensa del Consumidor.</p>
      <h2>Qué cubre</h2>
      <p>Defectos de materiales o de armado que aparezcan con el uso normal: un sensor que falla, un switch que deja de responder, un pad con un despegue de base, un driver sin audio.</p>
      <h2>Qué no cubre</h2>
      <ul>
        <li>Desgaste natural (skates, superficies de tela, tips, cables flexionados).</li>
        <li>Golpes, humedad, líquidos, modificaciones o un uso distinto al indicado.</li>
        <li>Pérdida de accesorios.</li>
      </ul>
      <h2>Cómo iniciarla</h2>
      <p>Contactanos con el número de pedido, una descripción del problema y, si podés, un video corto. Coordinamos la recepción, lo revisamos y te proponemos reparación, reemplazo o reintegro, según corresponda. El tiempo de revisión habitual es de 5 a 10 días hábiles.</p>
    `
  },
  faq: {
    title: "Preguntas frecuentes",
    kicker: "Ayuda",
    body: ""
  },
  contacto: {
    title: "Contacto",
    kicker: "Ayuda",
    body: `
      <p>Estamos en ${STORE_CONFIG.address}. Atendemos ${STORE_CONFIG.hours}.</p>
      <ul>
        <li>Mail: <a href="mailto:${STORE_CONFIG.email}">${STORE_CONFIG.email}</a></li>
        <li>WhatsApp: <a href="https://wa.me/${STORE_CONFIG.whatsapp}?text=${encodeURIComponent("Hola TRN! Quiero hacer una consulta.")}" target="_blank" rel="noopener">${STORE_CONFIG.whatsappDisplay}</a></li>
        <li>Instagram: <a href="${STORE_CONFIG.instagram}" target="_blank" rel="noopener">${STORE_CONFIG.instagramHandle}</a></li>
        <li>TikTok: <a href="${STORE_CONFIG.tiktok}" target="_blank" rel="noopener">${STORE_CONFIG.tiktokHandle}</a></li>
      </ul>
      <p>Si tu consulta es sobre una compra, mencioná el producto, el color y tu nombre así lo vemos más rápido. También podés tocar el botón de WhatsApp en cualquier ficha.</p>
    `
  },
  terminos: {
    title: "Términos y condiciones",
    kicker: "Legal",
    body: `
      <p>Estos términos rigen la compra de productos en el sitio de TRN Periféricos, operado desde Argentina. Al confirmar una compra por WhatsApp, aceptás estas condiciones.</p>
      <h2>Productos y precios</h2>
      <p>Los precios están publicados en pesos argentinos e incluyen impuestos, salvo que se indique otra cosa. Nos reservamos el derecho de corregir errores evidentes de carga y de cancelar un pedido si no hay stock, con el reintegro total.</p>
      <h2>Pedidos y pago</h2>
      <p>La compra se coordina por WhatsApp: confirmamos stock y te enviamos el link de Mercado Pago o los datos de transferencia. El pedido queda confirmado cuando el pago se acredita: al instante si pagás con Mercado Pago, o cuando validamos el comprobante si pagás por transferencia. El 5% de descuento por transferencia se aplica sobre el subtotal de productos.</p>
      <h2>Envíos</h2>
      <p>Los plazos publicados son estimados y se confirman con tu código postal cuando consultás por WhatsApp. El riesgo del transporte lo cubrimos hasta la entrega en el domicilio declarado.</p>
      <h2>Datos personales</h2>
      <p>Tratamos tu información según la <a href="#/privacidad">Política de privacidad</a> y la Ley 25.326.</p>
      <h2>Ley aplicable</h2>
      <p>Este contrato se rige por las leyes de la República Argentina. Para conflictos de consumo rige la Ley 24.240 y normas complementarias. Podés acudir a los mecanismos de <a href="${STORE_CONFIG.consumerDefense}" target="_blank" rel="noopener">Defensa del consumidor</a>.</p>
    `
  },
  privacidad: {
    title: "Política de privacidad",
    kicker: "Legal",
    body: `
      <p>En TRN cuidamos los datos que nos das para atenderte y coordinar tu compra por WhatsApp. El titular responsable es TRN Periféricos, ${STORE_CONFIG.address}. Escribinos a <a href="mailto:${STORE_CONFIG.email}">${STORE_CONFIG.email}</a>.</p>
      <h2>Qué datos pedimos</h2>
      <p>Cuando coordinamos una compra por WhatsApp podemos pedirte nombre, mail, teléfono, domicilio de entrega y, si corresponde, datos fiscales para la factura. Los pagos con tarjeta se procesan en Mercado Pago: este sitio no tiene checkout propio y nosotros no almacenamos el número de tu tarjeta.</p>
      <h2>Para qué los usamos</h2>
      <ul>
        <li>Coordinar la consulta, el pago y el envío.</li>
        <li>Emitir factura y dar soporte de garantía o cambios.</li>
        <li>Enviarte novedades solo si te suscribís al newsletter, con la opción de darte de baja en cualquier momento.</li>
      </ul>
      <h2>Tus derechos</h2>
      <p>Podés acceder, corregir o pedir la supresión de tus datos, y alzar una denuncia ante la Agencia de Acceso a la Información Pública. La venta de datos a terceros no forma parte de nuestra operación.</p>
    `
  },
  arrepentimiento: {
    title: "Botón de arrepentimiento",
    kicker: "Legal",
    body: `
      <p>Si compraste en este sitio y querés revocar la compra, podés hacerlo dentro de los 10 días corridos de recibido el producto, de acuerdo con la Ley 24.240 y normas complementarias. El derecho no aplica a productos que, por su higiene o por haber sido personalizados o recortados, no puedan reutilizarse.</p>
      <p>Completá el formulario con un mail de contacto y el detalle de lo que compraste (o el número de referencia si te lo dimos). También podés escribirnos a <a href="mailto:${STORE_CONFIG.email}">${STORE_CONFIG.email}</a> o por WhatsApp. Te respondemos dentro de las 24 horas hábiles y te indicamos cómo devolver el producto. El reintegro se hace por el mismo medio de pago, una vez que recibimos el ítem en las condiciones acordadas.</p>
      <form data-regret-form class="page-form">
        <label class="field"><span>Nombre y apellido</span><input name="nombre" required autocomplete="name"></label>
        <label class="field"><span>Email</span><input type="email" name="email" required autocomplete="email"></label>
        <label class="field"><span>Referencia de la compra</span><input name="pedido" required placeholder="Producto, color o referencia"></label>
        <label class="field span-2"><span>Motivo (opcional)</span><textarea name="motivo" rows="3"></textarea></label>
        <button class="btn btn-solid" type="submit">Enviar solicitud</button>
      </form>
    `
  }
};
