const TEAL = [0, 79, 69];
const TITULO = [0, 54, 47];
const TINTA = [30, 41, 59];
const SUAVE = [71, 85, 105];
const GRIS = [100, 116, 139];
const LINEA = [226, 232, 240];
const FONDO = [248, 250, 252];
const AMBAR = [180, 83, 9];
const AMBAR_SUAVE = [255, 247, 237];
const VERDE = [6, 95, 70];
const VERDE_SUAVE = [236, 253, 245];
const ROSA = [159, 18, 57];
const ROSA_SUAVE = [255, 241, 242];
const CLUSTERS = [
  [15, 118, 110],
  [79, 70, 229],
];

function numero(valor, decimales = 0) {
  const n = Number(valor);
  if (!Number.isFinite(n)) return '—';
  const negativo = n < 0;
  const [entero, frac] = Math.abs(n).toFixed(decimales).split('.');
  const miles = entero.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const texto = decimales > 0 ? `${miles},${frac}` : miles;
  return negativo ? `-${texto}` : texto;
}

function dinero(valor, decimales = 0) {
  const texto = numero(valor, decimales);
  return texto === '—' ? texto : `$${texto}`;
}

function porcentajeFraccion(valor) {
  if (!Number.isFinite(Number(valor))) return '—';
  return `${numero(Number(valor) * 100, 1)}%`;
}

function colorCluster(id) {
  return CLUSTERS[Number(id) % CLUSTERS.length];
}

function fechaLarga(iso) {
  const fecha = iso ? new Date(iso) : new Date();
  if (Number.isNaN(fecha.getTime())) return '';
  return fecha.toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' });
}

function grupoDe(data) {
  return (data.segmentos || []).find((item) => item.cluster === data.cluster) || null;
}

function fraseCercania(distancia) {
  if (!Number.isFinite(Number(distancia))) return 'No hay una medida de parecido con el grupo.';
  if (distancia < 0.8) return 'Está muy cerca del cliente típico de su grupo.';
  if (distancia < 1.5) return 'Está dentro de lo habitual de su grupo.';
  return 'Se aleja del cliente típico de su grupo.';
}

function crearEstado(doc) {
  return {
    doc,
    margen: 46,
    ancho: doc.internal.pageSize.getWidth() - 92,
    y: 58,
    tope: 786,
  };
}

function marco(doc) {
  const ancho = doc.internal.pageSize.getWidth();
  doc.setFillColor(...TEAL);
  doc.rect(0, 0, ancho, 32, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('Minería de Datos   ·   Santo Tomás', 46, 20);
  doc.setFont('helvetica', 'normal');
  doc.text('Informe para decidir un contacto', ancho - 46, 20, { align: 'right' });
}

function pies(doc) {
  const total = doc.internal.getNumberOfPages();
  const ancho = doc.internal.pageSize.getWidth();
  const alto = doc.internal.pageSize.getHeight();
  for (let pagina = 1; pagina <= total; pagina += 1) {
    doc.setPage(pagina);
    doc.setDrawColor(...LINEA);
    doc.setLineWidth(0.7);
    doc.line(46, alto - 34, ancho - 46, alto - 34);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...GRIS);
    doc.text('Lectura simple del resultado. Los números salen del historial de la campaña.', 46, alto - 20);
    doc.text(`${pagina}  /  ${total}`, ancho - 46, alto - 20, { align: 'right' });
  }
}

function saltar(estado, alto) {
  if (estado.y + alto <= estado.tope) return;
  estado.doc.addPage();
  marco(estado.doc);
  estado.y = 58;
}

function medir(doc, texto, ancho, opciones = {}) {
  const tamano = opciones.tamano ?? 10.5;
  const factor = opciones.factor ?? 1.38;
  doc.setFont('helvetica', opciones.estilo || 'normal');
  doc.setFontSize(tamano);
  const lineas = doc.splitTextToSize(String(texto), ancho);
  return lineas.length * tamano * factor;
}

function escribir(doc, texto, x, y, ancho, opciones = {}) {
  const tamano = opciones.tamano ?? 10.5;
  const factor = opciones.factor ?? 1.38;
  doc.setFont('helvetica', opciones.estilo || 'normal');
  doc.setFontSize(tamano);
  doc.setTextColor(...(opciones.color || TINTA));
  const lineas = doc.splitTextToSize(String(texto), ancho);
  doc.text(lineas, x, y, { lineHeightFactor: factor });
  return lineas.length * tamano * factor;
}

function titulo(estado, texto) {
  saltar(estado, 36);
  const { doc, margen } = estado;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(...TITULO);
  doc.text(texto, margen, estado.y);
  doc.setFillColor(0, 156, 136);
  doc.rect(margen, estado.y + 6, 34, 2.4, 'F');
  estado.y += 26;
}

function parrafo(estado, texto, opciones = {}) {
  const tamano = opciones.tamano ?? 10.5;
  const ancho = opciones.ancho ?? estado.ancho;
  const x = opciones.x ?? estado.margen;
  const alto = escribir(estado.doc, texto, x, estado.y, ancho, { ...opciones, tamano });
  estado.y += alto + (opciones.despues ?? 12);
}

function tarjeta(doc, x, y, w, h, relleno) {
  doc.setFillColor(...relleno);
  doc.roundedRect(x, y, w, h, 8, 8, 'F');
}

function kpi(doc, x, y, w, h, etiqueta, valor, ayuda, colorValor) {
  tarjeta(doc, x, y, w, h, FONDO);
  doc.setFillColor(...(colorValor || TEAL));
  doc.roundedRect(x + 12, y + 12, 22, 3, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...GRIS);
  doc.text(etiqueta.toUpperCase(), x + 12, y + 30);
  doc.setFontSize(16);
  doc.setTextColor(...(colorValor || TITULO));
  doc.text(String(valor), x + 12, y + 52);
  escribir(doc, ayuda, x + 12, y + 68, w - 24, { tamano: 8.5, color: SUAVE, factor: 1.3 });
}

function pasos(doc, x, y, ancho, items) {
  const gap = 10;
  const w = (ancho - gap * (items.length - 1)) / items.length;
  items.forEach((item, indice) => {
    const izquierda = x + indice * (w + gap);
    tarjeta(doc, izquierda, y, w, 92, FONDO);
    doc.setFillColor(...TEAL);
    doc.circle(izquierda + 18, y + 20, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(String(indice + 1), izquierda + 18, y + 23, { align: 'center' });
    doc.setTextColor(...TITULO);
    doc.setFontSize(10);
    doc.text(item.titulo, izquierda + 32, y + 24);
    escribir(doc, item.texto, izquierda + 12, y + 44, w - 24, { tamano: 8.5, color: SUAVE, factor: 1.3 });
  });
}

function lecturaCliente(data, grupo) {
  if (!grupo || !data.cliente) return 'El punto ámbar muestra a este cliente entre las demás personas.';
  const ingreso = data.cliente.income >= grupo.income
    ? 'Su ingreso está en el nivel típico del grupo o por encima.'
    : 'Su ingreso está por debajo del ingreso típico del grupo.';
  const gasto = data.cliente.gasto >= grupo.gasto
    ? 'Gasta más que lo típico de ese grupo.'
    : 'Gasta menos que lo típico de ese grupo.';
  return `${ingreso} ${gasto}`;
}

function dispersion(doc, x, y, w, h, data) {
  const puntos = Array.isArray(data.nube) ? data.nube : [];
  const cliente = data.cliente;
  const segmentos = data.segmentos || [];
  tarjeta(doc, x, y, w, h, [255, 255, 255]);
  doc.setDrawColor(...LINEA);
  doc.setLineWidth(0.8);
  doc.roundedRect(x, y, w, h, 8, 8, 'S');

  if (puntos.length === 0) {
    escribir(doc, 'Esta evaluación no trajo la nube de clientes, así que el gráfico no se puede dibujar.', x + 16, y + 28, w - 32, { tamano: 10, color: SUAVE });
    return;
  }

  const pad = { l: 54, r: 16, t: 22, b: 36 };
  const ingresos = puntos.map((punto) => punto.income);
  const gastos = puntos.map((punto) => punto.gasto);
  const minX = Math.min(...ingresos);
  const maxX = Math.max(...ingresos);
  const maxY = Math.max(...gastos, cliente?.gasto || 0, ...segmentos.map((grupo) => grupo.gasto)) * 1.12;
  const plotX = x + pad.l;
  const plotY = y + pad.t;
  const plotW = w - pad.l - pad.r;
  const plotH = h - pad.t - pad.b;
  const xDe = (valor) => plotX + ((Math.min(valor, maxX) - minX) / (maxX - minX || 1)) * plotW;
  const yDe = (valor) => plotY + (1 - Math.min(valor, maxY) / (maxY || 1)) * plotH;

  doc.setDrawColor(241, 245, 249);
  doc.setLineWidth(0.6);
  for (let marca = 0; marca <= 3; marca += 1) {
    const valor = (maxY * marca) / 3;
    const yy = yDe(valor);
    doc.line(plotX, yy, plotX + plotW, yy);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...GRIS);
    doc.text(dinero(valor), plotX - 6, yy + 2, { align: 'right' });
  }
  for (let marca = 0; marca <= 3; marca += 1) {
    const valor = minX + ((maxX - minX) * marca) / 3;
    doc.text(dinero(valor), xDe(valor), y + h - 22, { align: 'center' });
  }

  puntos.forEach((punto) => {
    doc.setFillColor(...colorCluster(punto.cluster));
    doc.circle(xDe(punto.income), yDe(punto.gasto), 1.7, 'F');
  });
  segmentos.forEach((grupo) => {
    const cx = xDe(grupo.income);
    const cy = yDe(grupo.gasto);
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...colorCluster(grupo.cluster));
    doc.setLineWidth(1.1);
    doc.lines([[5, 5], [-5, 5], [-5, -5], [5, -5]], cx, cy - 5, [1, 1], 'FD', true);
  });
  if (cliente) {
    const cx = xDe(cliente.income);
    const cy = yDe(cliente.gasto);
    doc.setFillColor(...AMBAR);
    doc.circle(cx, cy, 3.4, 'F');
    const etiquetaX = Math.min(plotX + plotW - 58, Math.max(plotX, cx - 28));
    const etiquetaY = Math.max(plotY + 2, cy - 18);
    doc.setFillColor(15, 23, 42);
    doc.roundedRect(etiquetaX, etiquetaY, 56, 12, 6, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.text('Este cliente', etiquetaX + 28, etiquetaY + 8.5, { align: 'center' });
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...SUAVE);
  doc.text('Ingreso anual', x + w / 2, y + h - 8, { align: 'center' });
}

function leyenda(doc, x, y, data) {
  const vistos = [];
  (data.nube || []).forEach((punto) => {
    if (!vistos.some((item) => item.cluster === punto.cluster)) {
      vistos.push({ cluster: punto.cluster, nombre: punto.nombre });
    }
  });
  if (vistos.length === 0) {
    (data.segmentos || []).forEach((grupo) => vistos.push({ cluster: grupo.cluster, nombre: grupo.nombre }));
  }
  let cursor = x;
  vistos.forEach((item) => {
    doc.setFillColor(...colorCluster(item.cluster));
    doc.circle(cursor + 4, y - 2, 3.2, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...SUAVE);
    doc.text(item.nombre || 'Grupo', cursor + 12, y);
    cursor += doc.getTextWidth(item.nombre || 'Grupo') + 28;
  });
  doc.setFillColor(...AMBAR);
  doc.circle(cursor + 4, y - 2, 3.2, 'F');
  doc.setTextColor(...SUAVE);
  doc.text('Este cliente', cursor + 12, y);
}

function barrasAceptacion(doc, x, y, ancho, filas) {
  const etiquetaW = 132;
  const valorW = 52;
  const barraW = ancho - etiquetaW - valorW - 8;
  filas.forEach((fila, indice) => {
    const yy = y + indice * 28;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...TINTA);
    doc.text(fila.nombre, x, yy + 8);
    doc.setFillColor(...FONDO);
    doc.roundedRect(x + etiquetaW, yy, barraW, 11, 5, 5, 'F');
    doc.setFillColor(...fila.color);
    const lleno = Math.max(6, barraW * Math.min(fila.valor, 100) / 100);
    doc.roundedRect(x + etiquetaW, yy, lleno, 11, 5, 5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...fila.color);
    doc.text(fila.texto, x + etiquetaW + barraW + 8, yy + 9);
  });
}

function portada(estado, data, contexto, contactar, probabilidad, umbral, retorno) {
  const { doc, margen, ancho } = estado;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...TITULO);
  doc.text('¿Conviene contactar', margen, estado.y);
  doc.text('a este cliente?', margen, estado.y + 26);
  estado.y += 46;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...SUAVE);
  doc.text(`Cliente ${data.id}    ·    ${fechaLarga(data.created_at)}`, margen, estado.y);
  estado.y += 22;
  parrafo(
    estado,
    'Este informe explica, con palabras simples, tres cosas: si vale la pena escribirle, a qué tipo de cliente se parece y qué producto tiene sentido ofrecerle. No hace falta saber de minería de datos para leerlo.',
  );

  const personas = Number.isFinite(Number(contexto?.base_historica))
    ? numero(contexto.base_historica)
    : numero((data.segmentos || []).reduce((suma, grupo) => suma + Number(grupo.clientes || 0), 0));
  const ayudaPersonas = Number.isFinite(Number(contexto?.base_historica))
    ? 'Clientes del historial usados para aprender cómo responde la gente.'
    : 'Personas comparadas al formar los grupos de este análisis.';
  const colorResultado = retorno >= 0 ? VERDE : ROSA;
  const gap = 10;
  const anchoTarjeta = (ancho - gap * 2) / 3;
  const yKpi = estado.y;
  kpi(doc, margen, yKpi, anchoTarjeta, 102, 'Historial', personas, ayudaPersonas, TEAL);
  kpi(doc, margen + anchoTarjeta + gap, yKpi, anchoTarjeta, 102, 'Chance de aceptar', `${numero(probabilidad, 1)}%`, 'Posibilidad calculada solo para este cliente.', TEAL);
  kpi(doc, margen + (anchoTarjeta + gap) * 2, yKpi, anchoTarjeta, 102, 'Después del costo', dinero(retorno, 2), 'Lo que queda al restar los $3 de escribirle.', colorResultado);
  estado.y += 122;

  titulo(estado, 'Qué información se analizó');
  parrafo(
    estado,
    'Se usó el historial de una campaña comercial. De cada persona importan el ingreso, lo que gasta en productos, cuántas veces compra y si antes dijo que sí a una oferta.',
    { despues: 6 },
  );
  parrafo(
    estado,
    'Los productos son vinos, carnes, pescado, frutas, dulces y oro. El gasto los junta en un solo monto. Las compras juntan internet, catálogo, tienda y compras con descuento.',
  );

  titulo(estado, 'Por qué se hizo');
  const costo = dinero(data.costo_contacto ?? contexto?.z_cost ?? 3, 0);
  const premio = dinero(contexto?.z_revenue ?? 11, 0);
  parrafo(
    estado,
    `Escribirle a una persona cuesta ${costo}. Si acepta, la campaña deja ${premio}. No basta con intuir que "podría" aceptar: hay que ver si esa chance alcanza para pagar el contacto.`,
    { despues: 8 },
  );
  const altoLlamado = 72;
  saltar(estado, altoLlamado);
  tarjeta(doc, margen, estado.y, ancho, altoLlamado, AMBAR_SUAVE);
  escribir(doc, 'Punto de equilibrio', margen + 16, estado.y + 20, ancho - 32, { tamano: 9, estilo: 'bold', color: AMBAR });
  escribir(
    doc,
    `Está en ${numero(umbral, 1)}%. Significa que la chance tiene que superar ese número para que, en promedio, escribirle no haga perder dinero. Por debajo, el costo pesa más que lo que la oferta puede dejar.`,
    margen + 16,
    estado.y + 38,
    ancho - 32,
    { tamano: 10, color: TINTA },
  );
  estado.y += altoLlamado + 20;

  titulo(estado, 'Cómo recorrer este informe');
  pasos(doc, margen, estado.y, ancho, [
    { titulo: 'La decisión', texto: 'Si la chance de este cliente paga el costo de escribirle.' },
    { titulo: 'El grupo', texto: 'Con qué personas se parece, según ingreso y gasto.' },
    { titulo: 'La oferta', texto: 'Qué producto suele comprarse junto con lo que ya lleva.' },
  ]);
  estado.y += 108;
}

function preparacionYDecision(estado, data, contexto, contactar, probabilidad, umbral, retorno) {
  const { doc, margen, ancho } = estado;
  titulo(estado, 'Cómo se preparó la información');
  parrafo(
    estado,
    'Antes de evaluar a esta persona, el historial se ordenó para que los clientes fueran comparables. Estas son las tres decisiones que más cambian la lectura.',
    { despues: 8 },
  );
  const preparacion = [
    ['Si faltaba el ingreso', 'No se puso cero. Se usó el ingreso típico de quienes sí lo tenían en los datos de aprendizaje.'],
    ['Gasto y compras', 'El gasto suma los seis productos. Las compras cuentan las veces que compró, no las visitas a la web.'],
    ['Tiempo como cliente', 'La fecha de alta se pasó a días en la empresa, para comparar clientes nuevos y antiguos con la misma regla.'],
  ];
  const gap = 10;
  const w = (ancho - gap * 2) / 3;
  const alto = 118;
  saltar(estado, alto);
  preparacion.forEach((item, indice) => {
    const x = margen + indice * (w + gap);
    tarjeta(doc, x, estado.y, w, alto, FONDO);
    escribir(doc, item[0], x + 12, estado.y + 22, w - 24, { tamano: 10, estilo: 'bold', color: TITULO });
    escribir(doc, item[1], x + 12, estado.y + 42, w - 24, { tamano: 8.5, color: SUAVE, factor: 1.32 });
  });
  estado.y += alto + 22;

  titulo(estado, 'La decisión');
  const bannerTexto = contactar
    ? `La chance de ${numero(probabilidad, 1)}% está por encima del ${numero(umbral, 1)}%. Por eso el contacto deja un resultado positivo.`
    : `La chance de ${numero(probabilidad, 1)}% está por debajo del ${numero(umbral, 1)}%. Por eso el contacto cuesta más de lo que deja.`;
  const bannerAlto = 58 + medir(doc, bannerTexto, ancho - 32, { tamano: 10 });
  saltar(estado, bannerAlto);
  tarjeta(doc, margen, estado.y, ancho, bannerAlto, contactar ? VERDE_SUAVE : ROSA_SUAVE);
  escribir(
    doc,
    contactar ? 'Sí, conviene contactarlo.' : 'Por ahora, no conviene contactarlo.',
    margen + 16,
    estado.y + 24,
    ancho - 32,
    { tamano: 15, estilo: 'bold', color: contactar ? VERDE : ROSA },
  );
  escribir(doc, bannerTexto, margen + 16, estado.y + 46, ancho - 32, { tamano: 10, color: TINTA });
  estado.y += bannerAlto + 16;

  parrafo(estado, 'Posibilidad de que acepte la oferta', { tamano: 9, estilo: 'bold', color: GRIS, despues: 8 });
  const barraY = estado.y;
  doc.setFillColor(...FONDO);
  doc.roundedRect(margen, barraY, ancho, 12, 6, 6, 'F');
  doc.setFillColor(...(contactar ? [16, 185, 129] : [244, 63, 94]));
  doc.roundedRect(margen, barraY, Math.max(8, ancho * Math.min(probabilidad, 100) / 100), 12, 6, 6, 'F');
  const marca = margen + ancho * Math.min(umbral, 100) / 100;
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(1.2);
  doc.line(marca, barraY - 4, marca, barraY + 16);
  estado.y += 28;
  parrafo(
    estado,
    `La barra es la chance de este cliente. La línea marca el ${numero(umbral, 1)}%: desde ahí, escribirle se paga solo.`,
    { tamano: 9, color: SUAVE, despues: 14 },
  );

  const premio = dinero(contexto?.z_revenue ?? 11, 0);
  const cifras = [
    ['Costo de escribirle', dinero(data.costo_contacto ?? 3, 0), 'Se paga aunque la persona diga que no.'],
    ['Si acepta, la campaña deja', premio, 'Es el valor de una aceptación, no una venta futura.'],
    ['Ingreso esperado', dinero(data.ingreso_esperado, 2), 'La chance multiplicada por lo que deja una aceptación.'],
    ['Resultado', dinero(retorno, 2), retorno >= 0 ? 'Queda a favor después de pagar el contacto.' : 'Queda en contra después de pagar el contacto.'],
  ];
  const anchoCifra = (ancho - 10) / 2;
  const altoCifra = 62;
  saltar(estado, altoCifra * 2 + 10);
  cifras.forEach((cifra, indice) => {
    const columna = indice % 2;
    const fila = Math.floor(indice / 2);
    const x = margen + columna * (anchoCifra + 10);
    const y = estado.y + fila * (altoCifra + 10);
    tarjeta(doc, x, y, anchoCifra, altoCifra, FONDO);
    escribir(doc, cifra[0], x + 12, y + 16, anchoCifra - 24, { tamano: 8, color: GRIS });
    escribir(doc, cifra[1], x + 12, y + 34, anchoCifra - 24, { tamano: 13, estilo: 'bold', color: indice === 3 ? (retorno >= 0 ? VERDE : ROSA) : TITULO });
    escribir(doc, cifra[2], x + 12, y + 50, anchoCifra - 24, { tamano: 8, color: SUAVE });
  });
  estado.y += altoCifra * 2 + 24;
  parrafo(
    estado,
    `El ingreso esperado no es plata segura. Es una forma de decir: si se contacta a muchas personas parecidas, en promedio cada una dejaría ${dinero(data.ingreso_esperado, 2)} antes de restar el costo.`,
  );
  const cierre = contactar
    ? 'Conclusión: sí conviene escribirle. La chance supera el punto en el que la campaña se paga sola.'
    : 'Conclusión: por ahora no conviene escribirle. La chance no alcanza para pagar el contacto.';
  saltar(estado, 48);
  tarjeta(doc, margen, estado.y, ancho, 44, contactar ? VERDE_SUAVE : ROSA_SUAVE);
  escribir(doc, cierre, margen + 14, estado.y + 26, ancho - 28, { tamano: 10.5, estilo: 'bold', color: contactar ? VERDE : ROSA });
  estado.y += 60;
}

function grupos(estado, data, probabilidad) {
  const { doc, margen, ancho } = estado;
  const grupo = grupoDe(data);
  titulo(estado, 'A qué grupo se parece');
  parrafo(
    estado,
    'Las personas del historial se separaron en grupos parecidos. Para armarlos se usaron tres datos: ingreso, gasto en productos y cantidad de compras. No se usó el nombre ni un dato de contacto.',
  );
  const nombre = data.cluster_nombre || 'sin grupo';
  const aceptan = grupo ? Math.round(Number(grupo.tasa_respuesta) * 100) : null;
  parrafo(
    estado,
    grupo
      ? `Este cliente quedó en ${nombre}. Comparte ese grupo con ${numero(grupo.clientes)} personas. Ahí el ingreso típico es ${dinero(grupo.income)}, el gasto típico es ${dinero(grupo.gasto)} y hacen unas ${numero(grupo.compras, 1)} compras. Cerca de ${aceptan} de cada 100 aceptan la oferta.`
      : `Este cliente quedó en ${nombre}.`,
  );

  const distancia = Number.isFinite(Number(data.distancia_centroide)) ? numero(data.distancia_centroide, 2) : '—';
  const textoDistancia = `Distancia al centro del grupo: ${distancia}. ${fraseCercania(data.distancia_centroide)} Un número más bajo significa más parecido.`;
  const altoDistancia = 40 + medir(doc, textoDistancia, ancho - 28, { tamano: 10 });
  saltar(estado, altoDistancia);
  tarjeta(doc, margen, estado.y, ancho, altoDistancia, FONDO);
  escribir(doc, 'Parecido con el cliente típico del grupo', margen + 14, estado.y + 18, ancho - 28, { tamano: 8, color: GRIS });
  escribir(doc, textoDistancia, margen + 14, estado.y + 36, ancho - 28, { tamano: 10, color: TINTA });
  estado.y += altoDistancia + 16;

  escribir(doc, 'Ingreso y gasto, de un vistazo', margen, estado.y, ancho, { tamano: 12, estilo: 'bold', color: TITULO });
  estado.y += 16;
  parrafo(
    estado,
    'Cada punto es una persona del historial. La posición horizontal es su ingreso anual y la vertical es su gasto en productos. El punto ámbar es este cliente. El rombo blanco es el centro de cada grupo.',
    { tamano: 9.5, color: SUAVE, despues: 8 },
  );
  const altoGrafico = 236;
  saltar(estado, altoGrafico + 28);
  dispersion(doc, margen, estado.y, ancho, altoGrafico, data);
  estado.y += altoGrafico + 16;
  leyenda(doc, margen, estado.y, data);
  estado.y += 16;
  parrafo(estado, `Lectura: ${lecturaCliente(data, grupo)}`, { despues: 8 });

  escribir(doc, 'Quiénes aceptan la oferta', margen, estado.y, ancho, { tamano: 12, estilo: 'bold', color: TITULO });
  estado.y += 16;
  parrafo(
    estado,
    'Las barras comparan el porcentaje de personas que aceptan. El ámbar no es un grupo: es la chance calculada para este cliente.',
    { tamano: 9.5, color: SUAVE, despues: 8 },
  );
  const filas = (data.segmentos || []).map((item) => ({
    nombre: item.cluster === data.cluster ? `${item.nombre} · su grupo` : item.nombre,
    valor: Number(item.tasa_respuesta) * 100,
    texto: porcentajeFraccion(item.tasa_respuesta),
    color: colorCluster(item.cluster),
  }));
  filas.push({
    nombre: 'Este cliente',
    valor: probabilidad,
    texto: `${numero(probabilidad, 1)}%`,
    color: AMBAR,
  });
  saltar(estado, filas.length * 28 + 8);
  barrasAceptacion(doc, margen, estado.y, ancho, filas);
  estado.y += filas.length * 28 + 8;
  const comparacion = grupo
    ? `Conclusión: en ${grupo.nombre} aceptan cerca de ${Math.round(Number(grupo.tasa_respuesta) * 100)} de cada 100. Este cliente está en ${numero(probabilidad, 1)}%.`
    : 'Conclusión: la barra ámbar es la chance de este cliente, al lado de la de cada grupo.';
  parrafo(estado, comparacion, { estilo: 'bold', color: TITULO });
}

function ofertaYCierre(estado, data, contexto, contactar, probabilidad, umbral, retorno) {
  const { doc, margen, ancho } = estado;
  const grupo = grupoDe(data);
  titulo(estado, 'Qué conviene ofrecerle');
  parrafo(
    estado,
    'Se buscaron productos que se compran juntos más de lo normal. La idea no es adivinar un gusto: es repetir una combinación que ya aparece en el historial.',
  );

  saltar(estado, 78);
  tarjeta(doc, margen, estado.y, ancho, 74, FONDO);
  escribir(doc, 'Tres palabras que van a aparecer', margen + 14, estado.y + 18, ancho - 28, { tamano: 10, estilo: 'bold', color: TITULO });
  escribir(
    doc,
    'Soporte: en qué parte del historial ocurre la combinación. Confianza: de quienes ya compran lo primero, qué parte también compra lo segundo. Lift: cuántas veces más ocurre de lo que pasaría por azar. Si el lift es mayor que 1, los productos van juntos de verdad.',
    margen + 14,
    estado.y + 36,
    ancho - 28,
    { tamano: 9.5, color: SUAVE },
  );
  estado.y += 90;

  const reglas = data.productos_cruzados || [];
  if (reglas.length === 0) {
    parrafo(estado, 'Para este perfil no apareció una oferta cruzada clara.');
  }
  reglas.forEach((regla, indice) => {
    const origen = (regla.antecedente || []).join(' y ') || 'lo que ya compra';
    const destino = (regla.consecuente || []).join(' y ') || 'otro producto';
    const texto = indice === 0
      ? `La oferta principal es ${destino}. Tiene sentido porque ya compra ${origen} por encima de lo habitual.`
      : `Otra combinación del historial: quien compra ${origen} también suele llevar ${destino}.`;
    const altoTexto = medir(doc, texto, ancho - 28, { tamano: 10.5, estilo: 'bold' });
    const alto = 84 + altoTexto;
    saltar(estado, alto);
    tarjeta(doc, margen, estado.y, ancho, alto, indice === 0 ? AMBAR_SUAVE : FONDO);
    escribir(doc, indice === 0 ? 'Oferta principal' : 'Otra pista', margen + 14, estado.y + 18, 160, { tamano: 8, estilo: 'bold', color: indice === 0 ? AMBAR : GRIS });
    escribir(doc, texto, margen + 14, estado.y + 36, ancho - 28, { tamano: 10.5, estilo: 'bold', color: TINTA });
    const metricas = [
      ['Soporte', porcentajeFraccion(regla.soporte)],
      ['Confianza', porcentajeFraccion(regla.confianza)],
      ['Lift', `${numero(regla.lift, 2)} veces`],
    ];
    const metricaY = estado.y + 46 + altoTexto;
    const mw = 108;
    metricas.forEach((metrica, m) => {
      const mx = margen + 14 + m * (mw + 8);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(mx, metricaY, mw, 26, 6, 6, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...GRIS);
      doc.text(metrica[0].toUpperCase(), mx + 8, metricaY + 10);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...(m === 2 ? AMBAR : TITULO));
      doc.text(metrica[1], mx + 8, metricaY + 22);
    });
    estado.y += alto + 10;
  });

  titulo(estado, 'Conclusiones');
  const conclusiones = [
    contactar
      ? `Conviene contactar al cliente ${data.id}. Su chance es ${numero(probabilidad, 1)}%, sobre el ${numero(umbral, 1)}% en el que la campaña se paga. Después del costo quedan ${dinero(retorno, 2)}.`
      : `Por ahora no conviene contactar al cliente ${data.id}. Su chance es ${numero(probabilidad, 1)}%, bajo el ${numero(umbral, 1)}%. Después del costo el resultado es ${dinero(retorno, 2)}.`,
    grupo
      ? `Se parece al grupo ${grupo.nombre}. En ese grupo el gasto típico es ${dinero(grupo.gasto)} y aceptan cerca de ${Math.round(Number(grupo.tasa_respuesta) * 100)} de cada 100.`
      : 'No fue posible comparar su grupo con el resto.',
    reglas[0]
      ? `Si se le escribe, la oferta más clara es ${(reglas[0].consecuente || []).join(' y ')}, porque ya compra ${(reglas[0].antecedente || []).join(' y ')} por encima de lo habitual.`
      : 'No hay un producto cruzado claro para sumar a la oferta.',
  ];
  conclusiones.forEach((texto, indice) => {
    const altoTexto = medir(doc, texto, ancho - 52, { tamano: 10 });
    const alto = Math.max(44, altoTexto + 28);
    saltar(estado, alto);
    tarjeta(doc, margen, estado.y, ancho, alto, FONDO);
    doc.setFillColor(...TEAL);
    doc.circle(margen + 18, estado.y + alto / 2, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(String(indice + 1), margen + 18, estado.y + alto / 2 + 3, { align: 'center' });
    escribir(doc, texto, margen + 36, estado.y + 20, ancho - 52, { tamano: 10, color: TINTA });
    estado.y += alto + 8;
  });

  estado.y += 8;
  const nota = 'Nota breve. La chance la estima un árbol de decisión: una serie de preguntas sobre gasto, antigüedad y otros datos del cliente. Los grupos juntan personas parecidas. Las ofertas salen de productos que aparecen juntos más de lo normal. El equilibrio sale de dividir el costo del contacto por lo que deja una aceptación.';
  const contextoNota = Number.isFinite(Number(contexto?.tasa_aceptacion))
    ? ` En el historial completo, acepta cerca del ${numero(contexto.tasa_aceptacion, 1)}% de las personas. Por eso no se contacta a todo el mundo.`
    : '';
  parrafo(estado, nota + contextoNota, { tamano: 8.5, color: GRIS, despues: 0 });
}

async function leerDiagnostico() {
  try {
    const respuesta = await fetch('/api/diagnostico', { cache: 'no-store' });
    if (!respuesta.ok) return null;
    return await respuesta.json();
  } catch {
    return null;
  }
}

export async function crearInforme(data, contexto = null) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const contactar = data.supera_umbral ?? data.decision === 'CONTACTAR';
  const probabilidad = Math.round((data.probabilidad ?? 0) * 1000) / 10;
  const umbral = Math.round((data.umbral ?? 0.273) * 1000) / 10;
  const retorno = Number(data.ingreso_esperado ?? 0) - Number(data.costo_contacto ?? 3);
  doc.setProperties({
    title: `Informe del cliente ${data.id}`,
    subject: 'Evaluación de contacto, grupo y oferta',
    author: 'Minería de Datos · Santo Tomás',
  });

  const estado = crearEstado(doc);
  marco(doc);
  portada(estado, data, contexto, contactar, probabilidad, umbral, retorno);
  doc.addPage();
  marco(doc);
  estado.y = 58;
  preparacionYDecision(estado, data, contexto, contactar, probabilidad, umbral, retorno);
  doc.addPage();
  marco(doc);
  estado.y = 58;
  grupos(estado, data, probabilidad);
  doc.addPage();
  marco(doc);
  estado.y = 58;
  ofertaYCierre(estado, data, contexto, contactar, probabilidad, umbral, retorno);
  pies(doc);
  return doc;
}

export async function descargarInforme(data) {
  const contexto = await leerDiagnostico();
  const doc = await crearInforme(data, contexto);
  doc.save(`informe-cliente-${data.id}.pdf`);
}
