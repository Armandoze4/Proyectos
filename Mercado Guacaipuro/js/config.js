/*
 * Mercado Guaicaipuro
 * Contenido configurable del sitio.
 *
 * Este archivo es la única fuente de datos de la página: marca, textos,
 * combos, servicios, contacto y créditos. Para actualizar el sitio no hace
 * falta tocar index.html, estilos.css ni app.js.
 *
 * Los campos marcados como "pendiente" o "demo" son deliberadamente
 * incompletos: deben confirmarse con el negocio antes de publicar.
 */
window.MERCADO_CONFIG = {
  brand: {
    name: "Mercado Guaicaipuro",
    slogan: "Tus compras del día, más fáciles y a tu alcance.",
    market: "Mercado Municipal de Guaicaipuro",
    city: "Caracas, Venezuela",
  },

  currency: {
    symbol: "$",
    code: "USD",
    locale: "es-VE",
  },

  nav: [
    { label: "Combos", href: "#combos" },
    { label: "Nosotros", href: "#nosotros" },
    { label: "Servicios", href: "#servicios" },
    { label: "Ubicación", href: "#contacto" },
  ],

  navAction: { label: "Pedir", href: "#pedido" },

  theme: {
    light: "Activar modo claro",
    dark: "Activar modo oscuro",
  },

  hero: {
    titleLines: ["Tus compras del día,", "más fáciles"],
    lead:
      "Y a tu alcance: productos de la cesta básica, combos, delivery y retiro en el Mercado Municipal de Guaicaipuro.",
    primary: { label: "Hacer mi pedido", href: "#pedido" },
    secondary: { label: "Ver los combos", href: "#combos" },
    note:
      "Precios de demostración. Puesto y redes por confirmar. Fotografía de referencia de la fachada del mercado, no del puesto.",
    photos: [
      {
        key: "facade",
        src: "assets/img/mercado-de-guaicaipuro.jpg",
        width: 1600,
        height: 1200,
      },
      {
        key: "plantains",
        src: "assets/img/plantains.jpg",
        width: 1200,
        height: 1600,
      },
      {
        key: "coffee",
        src: "assets/img/roasted-coffee-beans.jpg",
        width: 1200,
        height: 900,
      },
      {
        key: "beans",
        src: "assets/img/black-beans-uncooked-2024-11-27.jpg",
        width: 1600,
        height: 2400,
      },
      {
        key: "corn",
        src: "assets/img/corn-flour.jpg",
        width: 900,
        height: 1200,
      },
    ],
  },

  combos: {
    title: "Cinco combos, una compra",
    intro:
      "Opciones para el día a día, la semana o el desayuno. Revisa lo que incluye cada uno y marca tus productos para encontrar el que más te conviene.",
    note:
      "Contenidos y precios de demostración. Las imágenes son de referencia de los productos, no de los combos. Todo se confirma al momento de pedir.",
    priceLabel: "Precio de demostración",
    orderLabel: "Pedir",
    helper: {
      title: "Arma tu lista",
      text:
        "Marca lo que necesitas y te decimos qué combo lo cubre. No envía ningún pedido.",
      legend: "Marca lo que necesitas",
      clear: "Limpiar lista",
      idle: "Marca lo que necesitas y te decimos qué combo lo cubre.",
      none:
        "Ningún combo de demostración incluye todos esos productos. Consúltanos para armarlo a tu medida.",
      result: "El combo {combo} cubre {n} de {total} productos que marcaste.",
      extra: "El resto se puede consultar por separado.",
      matchLabel: "Cubre {n} de {total}",
      items: [
        { id: "arroz", label: "Arroz" },
        { id: "harina", label: "Harina de maíz" },
        { id: "aceite", label: "Aceite" },
        { id: "azucar", label: "Azúcar" },
        { id: "caraotas", label: "Caraotas" },
        { id: "cafe", label: "Café" },
        { id: "pasta", label: "Pasta" },
        { id: "platano", label: "Plátano" },
      ],
    },
    items: [
      {
        id: "basico",
        name: "Básico",
        tagline: "Para el día a día",
        price: 12,
        image: {
          src: "assets/img/bowl-of-white-rice-01.jpg",
          width: 960,
          height: 812,
          alt: "Arroz blanco en un bol",
        },
        contents: [
          { id: "arroz", label: "Arroz", qty: "1 kg" },
          { id: "harina", label: "Harina de maíz", qty: "1 kg" },
          { id: "aceite", label: "Aceite", qty: "1 L" },
          { id: "azucar", label: "Azúcar", qty: "1 kg" },
          { id: "pasta", label: "Pasta", qty: "500 g" },
          { id: "sal", label: "Sal", qty: "500 g" },
        ],
      },
      {
        id: "familiar",
        name: "Familiar",
        tagline: "Para compartir en casa",
        price: 24,
        image: {
          src: "assets/img/black-beans-uncooked-2024-11-27.jpg",
          width: 1600,
          height: 2400,
          alt: "Caraotas negras crudas vistas de cerca",
        },
        contents: [
          { id: "arroz", label: "Arroz", qty: "2 kg" },
          { id: "caraotas", label: "Caraotas", qty: "1 kg" },
          { id: "harina", label: "Harina de maíz", qty: "2 kg" },
          { id: "aceite", label: "Aceite", qty: "1 L" },
          { id: "azucar", label: "Azúcar", qty: "1 kg" },
          { id: "cafe", label: "Café", qty: "250 g" },
          { id: "pasta", label: "Pasta", qty: "1 kg" },
          { id: "atun", label: "Atún", qty: "2 latas" },
        ],
      },
      {
        id: "rendidor",
        name: "Rendidor",
        tagline: "Para resolver la semana",
        price: 38,
        featured: true,
        image: {
          src: "assets/img/corn-flour.jpg",
          width: 900,
          height: 1200,
          alt: "Harina de maíz en un puesto de mercado",
        },
        contents: [
          { id: "arroz", label: "Arroz", qty: "3 kg" },
          { id: "caraotas", label: "Caraotas", qty: "2 kg" },
          { id: "harina", label: "Harina de maíz", qty: "3 kg" },
          { id: "aceite", label: "Aceite", qty: "2 L" },
          { id: "azucar", label: "Azúcar", qty: "2 kg" },
          { id: "cafe", label: "Café", qty: "500 g" },
          { id: "pasta", label: "Pasta", qty: "2 kg" },
          { id: "atun", label: "Atún", qty: "3 latas" },
          { id: "leche", label: "Leche en polvo", qty: "1 kg" },
        ],
      },
      {
        id: "desayuno",
        name: "Desayuno",
        tagline: "Para empezar el día",
        price: 10,
        image: {
          src: "assets/img/roasted-coffee-beans.jpg",
          width: 1200,
          height: 900,
          alt: "Granos de café tostado",
        },
        contents: [
          { id: "harina", label: "Harina de maíz", qty: "1 kg" },
          { id: "cafe", label: "Café", qty: "250 g" },
          { id: "azucar", label: "Azúcar", qty: "1 kg" },
          { id: "leche", label: "Leche en polvo", qty: "500 g" },
          { id: "panela", label: "Panela", qty: "250 g" },
          { id: "mantequilla", label: "Mantequilla", qty: "250 g" },
        ],
      },
      {
        id: "ahorro",
        name: "Ahorro",
        tagline: "Lo esencial, sin extra",
        price: 9,
        image: {
          src: "assets/img/plantains.jpg",
          width: 1200,
          height: 1600,
          alt: "Plátanos verdes en una caja de cartón",
        },
        contents: [
          { id: "arroz", label: "Arroz", qty: "1 kg" },
          { id: "caraotas", label: "Caraotas", qty: "500 g" },
          { id: "platano", label: "Plátanos", qty: "1 kg" },
          { id: "azucar", label: "Azúcar", qty: "1 kg" },
          { id: "aceite", label: "Aceite", qty: "500 ml" },
        ],
      },
    ],
  },

  order: {
    title: "Haz tu pedido",
    intro:
      "Elige uno o varios combos, completa tus datos y envía el pedido por WhatsApp. Te confirmamos disponibilidad, total y forma de entrega.",
    rate: {
      label: "Tasa del día",
      base: "1$",
      currency: "Bs.",
      endpoint: "https://ve.dolarapi.com/v1/dolares/oficial",
      loading: "Consultando la tasa…",
      error: "No se pudo cargar la tasa. Intenta de nuevo más tarde.",
      updatedPrefix: "Actualizada:",
      updatedFallback: "Tasa oficial de referencia.",
      source: "Oficial",
      timeZone: "America/Caracas",
      refreshMs: 900000,
      timeout: 8000,
    },
    whatsapp: "584129378763",
    submit: "Enviar pedido por WhatsApp",
    pending:
      "No se pudo preparar el enlace de WhatsApp. Revisa el número de contacto.",
    readyNote:
      "Se abrirá WhatsApp con tu pedido. Revisa el mensaje antes de enviarlo.",
    review: "Revisa los campos marcados.",
    opening: "Abriendo WhatsApp…",
    openLabel: "Abrir WhatsApp",
    demoNote:
      "Precios de demostración. El total y la disponibilidad se confirman por WhatsApp.",
    deliveryNote:
      "Delivery sujeto a cobertura. La entrega se coordina por WhatsApp.",
    consent:
      "Entiendo que el pedido se enviará por WhatsApp y que el negocio usará mis datos para coordinar la entrega.",
    privacyLabel: "Ver aviso de privacidad",
    combosTitle: "Tus combos",
    combosHint:
      "Usa − y + para indicar cuántos combos quieres. Puedes combinar varios.",
    dataTitle: "Tus datos",
    summaryTitle: "Resumen",
    totalLabel: "Total",
    summaryRateNote:
      "Montos en Bs. referenciales, calculados con la tasa del día (1$ = {rate}).",
    summaryRatePending: "Calculando el monto en bolívares…",
    summaryRateError:
      "El monto en Bs. no está disponible. Se confirma por WhatsApp.",
    empty: "Todavía no has elegido ningún combo.",
    selectedLabel: "{n} en el pedido",
    add: "Agregar un combo {combo}",
    remove: "Quitar un combo {combo}",
    qtyLabel: "Cantidad de combos {combo}",
    messageIntro: "Hola, quiero hacer un pedido en Mercado Guaicaipuro.",
    messageFooter: "Pedido enviado desde la página web.",
    fields: {
      name: {
        label: "Nombre completo",
        placeholder: "Ej. María Pérez",
        error: "Escribe tu nombre completo.",
      },
      phone: {
        label: "Teléfono",
        placeholder: "0412 123 4567",
        hint: "Número venezolano. Ej. 0412 123 4567.",
        error:
          "Escribe un teléfono venezolano válido, por ejemplo 0412 123 4567.",
      },
      id: {
        label: "Cédula (opcional)",
        placeholder: "V-12345678",
        hint: "Si la prefieres dejar en blanco, no hace falta.",
        error: "Revisa la cédula: debe tener entre 6 y 9 números.",
      },
      address: {
        label: "Dirección exacta",
        placeholder: "Calle, edificio, piso, apartamento y punto de referencia.",
        hint: "La usamos para coordinar la entrega.",
        error: "Escribe la dirección exacta de entrega.",
      },
      notes: {
        label: "Comentarios o notas (opcional)",
        placeholder: "Horario preferido, indicaciones para llegar, etc.",
        hint: "",
        error: "",
      },
      combos: {
        legend: "Combos",
        error: "Elige al menos un combo.",
      },
      consent: {
        error: "Confirma que aceptas el envío por WhatsApp.",
      },
    },
  },

  catalog: {
    enabled: false,
    sheetId: "",
    sheetName: "Combos",
    timeout: 7000,
  },

  about: {
    title: "Nosotros",
    lead: "Del mercado a tu mesa, sin complicaciones.",
    paragraphs: [
      "Somos un puesto en el Mercado Municipal de Guaicaipuro, Caracas. Ofrecemos productos de la cesta básica y artículos esenciales para el hogar, con opciones prácticas para las compras diarias y combos pensados para diferentes necesidades y presupuestos.",
      "Queremos hacer tus compras más sencillas: atención cercana, información clara y una forma cómoda de realizar tus pedidos.",
      "Cada combo se arma con productos de uso diario. El contenido y los precios se confirman al momento de pedir, para que sepas exactamente lo que llevas.",
    ],
    highlight: "productos de la cesta básica",
    signature: "El equipo de Mercado Guaicaipuro",
    role: "Puesto de mercado · Caracas, Venezuela",
  },

  services: {
    title: "Nuestros servicios",
    items: [
      {
        name: "Combos de mercado",
        text: "Opciones prácticas para organizar tus compras y ahorrar tiempo.",
      },
      {
        name: "Delivery a domicilio",
        text: "Consulta la disponibilidad de entrega en tu zona.",
      },
      {
        name: "Retiro en local",
        text: "Realiza tu pedido y coordínalo para recogerlo en el mercado.",
      },
      {
        name: "Pedidos por WhatsApp",
        text: "Consulta productos, precios y disponibilidad antes de pedir.",
      },
      {
        name: "Atención personalizada",
        text: "Te orientamos para elegir los productos que necesitas.",
      },
    ],
  },

  contact: {
    title: "Ubicación y contacto",
    intro:
      "Estamos en el Mercado Municipal de Guaicaipuro, Caracas. Usa el mapa para ubicar el mercado; la referencia exacta del puesto se confirma por WhatsApp.",
    venue: "Mercado Municipal de Guaicaipuro",
    city: "Caracas, Venezuela",
    stall: { label: "Puesto y referencia", value: "Por confirmar" },
    details: [
      {
        label: "Horario",
        value: "Lunes a viernes: 8:00 a. m. – 8:00 p. m.",
        note: "Sábados: 8:00 a. m. – 4:00 p. m. Domingos: cerrado.",
      },
      {
        label: "WhatsApp",
        value: "+58 412 937 8763",
        href: "https://wa.me/584129378763",
        note: "Pedidos y consultas.",
      },
      {
        label: "Redes sociales",
        value: "Por confirmar",
        note: "Perfiles oficiales.",
        pending: true,
      },
      {
        label: "Delivery",
        value: "Sujeto a cobertura",
        note: "Zona por confirmar.",
      },
    ],
    map: {
      title: "Mapa de ubicación del Mercado Guaicaipuro",
      src:
        "https://www.google.com/maps/embed?origin=mfe&pb=!1m3!2m1!1s10.503952,-66.896356!6i16",
      href: "https://maps.app.goo.gl/kpiPEbp9Uqp1W31V7",
      linkLabel: "Abrir en Google Maps",
      caption:
        "Mapa de referencia. La referencia exacta del puesto se confirma por WhatsApp.",
    },
    image: {
      src: "assets/img/mercado-de-guaicaipuro.jpg",
      width: 1600,
      height: 1200,
      alt: "Fachada del Mercado Municipal de Guaicaipuro, en Caracas, con su aviso rojo sobre la entrada",
      caption:
        "Fachada del Mercado Municipal de Guaicaipuro, Caracas. Imagen de referencia del mercado, no del puesto.",
      credit: "Foto: JoseGre12, CC BY-SA 4.0, Wikimedia Commons.",
      creditHref:
        "https://commons.wikimedia.org/wiki/File:Mercado_de_Guaicaipuro.jpg",
    },
    note:
      "Precios y disponibilidad sujetos a confirmación al momento de realizar el pedido. La entrega a domicilio depende de la zona y de la disponibilidad del servicio.",
  },

  footer: {
    image: {
      src: "assets/img/black-beans-uncooked-2024-11-27.jpg",
      width: 1600,
      height: 2400,
    },
    contact: [
      "Caracas, Venezuela",
      "Horario: lun–vie 8:00 a. m.–8:00 p. m.; sáb 8:00 a. m.–4:00 p. m.",
      "WhatsApp: +58 412 937 8763",
      "Redes sociales: por confirmar",
    ],
    legal:
      "© {year} Mercado Guaicaipuro. Precios y disponibilidad de demostración. Delivery según cobertura.",
    privacy: {
      title: "Aviso de privacidad",
      text:
        "El formulario de pedido no envía datos a un servidor: prepara un mensaje y abre WhatsApp, y el negocio usará los datos para coordinar la entrega. La página no instala cookies propias de seguimiento ni analítica. La preferencia de tema claro/oscuro se guarda en el almacenamiento local del navegador y no se envía a ningún servidor. El mapa se inserta desde Google Maps como iframe; al cargarse, Google puede registrar la solicitud y usar cookies propias. Si el catálogo está conectado a Google Sheets, se leen datos públicos de la hoja (combos y fotos); no se envían datos personales a Google. La tipografía Switzer se carga desde Fontshare, un servicio externo que puede registrar la solicitud.",
    },
    creditsTitle: "Créditos de las imágenes",
    creditsNote:
      "Imágenes de referencia de productos y del mercado, redimensionadas para la web. No son fotografías del puesto ni de los combos.",
    credits: [
      {
        title: "Mercado de Guaicaipuro",
        creator: "JoseGre12",
        license: "CC BY-SA 4.0",
        href: "https://commons.wikimedia.org/wiki/File:Mercado_de_Guaicaipuro.jpg",
      },
      {
        title: "Plantains",
        creator: "Daegis",
        license: "CC BY-SA 3.0",
        href: "https://commons.wikimedia.org/w/index.php?curid=5215401",
      },
      {
        title: "Black beans, uncooked",
        creator: "Bean appreciator",
        license: "CC0",
        href: "https://commons.wikimedia.org/wiki/File:Black_beans,_uncooked,_2024-11-27.jpg",
      },
      {
        title: "Roasted coffee beans",
        creator: "MarkSweep",
        license: "Dominio público",
        href: "https://commons.wikimedia.org/wiki/File:Roasted_coffee_beans.jpg",
      },
      {
        title: "Bowl of white rice 01",
        creator: "Douglas Perkins",
        license: "CC0",
        href: "https://commons.wikimedia.org/wiki/File:Bowl_of_white_rice_01.jpg",
      },
      {
        title: "Corn flour",
        creator: "Achiri Bitamsimli",
        license: "CC BY-SA 4.0",
        href: "https://commons.wikimedia.org/w/index.php?curid=100304475",
      },
    ],
  },
};
