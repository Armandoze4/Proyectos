# Mercado Guaicaipuro — página web (fase 2)

Página estática del puesto **Mercado Guaicaipuro**, en el Mercado Municipal de Guaicaipuro, Caracas. No usa framework, backend ni paso de compilación. Incluye:

- catálogo local de cinco combos;
- flujo de pedido en el navegador: varios combos, cantidades, datos del cliente y total;
- envío del pedido por WhatsApp cuando el número esté configurado;
- tarjeta de tasa oficial del dólar, actualizada desde DolarAPI;
- catálogo opcional de solo lectura desde Google Sheets;
- validación accesible del formulario y aviso de privacidad.

> El nombre visible es **Mercado Guaicaipuro** (con i). La carpeta del proyecto conserva el nombre `Mercado Guacaipuro` tal como estaba en el encargo.

## Abrir la página

1. Abre `index.html` con doble clic en Chrome, Edge o Firefox.
2. Opcional, para servirla por HTTP:
   - `npx serve .` (Node; descarga el servidor la primera vez), o
   - `python -m http.server 8000`.
   - Luego abre la dirección que indique el comando.
3. No hay que compilar ni instalar dependencias. La tipografía Switzer se carga desde Fontshare; sin internet se usa la fuente del sistema. El HTML, el CSS, el JS y las imágenes son locales.
4. La tarjeta de tasa del dólar consulta DolarAPI y necesita internet. Si la API no responde, la tarjeta muestra un aviso y el pedido sigue disponible.
5. Para revisarla en móvil, usa la vista responsive del navegador. 390 px es un buen ancho de prueba.

Si se activa Google Sheets, la página necesita internet para leer la hoja. Si la hoja no responde o no tiene datos válidos, vuelve automáticamente al catálogo de `js/config.js`.

## Estructura

| Archivo | Para qué sirve |
| --- | --- |
| `index.html` | Estructura, metadatos, JSON-LD, enlace de salto y resumen `<noscript>`. |
| `css/estilos.css` | Sistema visual, composición split stage, formulario, esquinas redondeadas y responsive. |
| `js/config.js` | **Contenido editable**: marca, textos, combos, pedido, catálogo, servicios, contacto, pie y créditos. |
| `js/app.js` | Render, comparador «Arma tu lista», formulario, total, mensaje de WhatsApp, tasa del día, lector de Google Sheets, revelado y cambio de foto. |
| `datos/combos-ejemplo.csv` | Plantilla para importar el catálogo en Google Sheets. |
| `assets/img/` | Fotos y `credits.json` con la ficha de cada una. |

No se usan frameworks, librerías de UI ni dependencias de JavaScript. Los recursos externos son la tipografía de Fontshare, la consulta a DolarAPI para la tasa, el mapa embebido de Google Maps y, si se activa el catálogo, el JSONP de Google Sheets.

## Contenido editable

Todo el contenido está en `js/config.js`:

- `brand`, `currency`, `nav` y `navAction`.
- `hero`: título, entrada, botones, nota y fotos del escenario.
- `combos`: título, introducción, nota, comparador (`helper`) y los cinco combos (`items`).
- `order`: textos del pedido, tasa del día, WhatsApp, mensajes, etiquetas y textos de los campos.
- `catalog`: conexión opcional con Google Sheets.
- `about`, `services`, `contact` y `footer`.

Cada combo local tiene `id`, `name`, `tagline`, `price`, `featured`, `image` y `contents` (`id`, `label`, `qty`). Los `id` de `helper.items` deben coincidir con los `contents[].id` para que el comparador funcione.

### Pedido

El formulario permite elegir uno o varios combos con los botones `−` / `+` o con el botón «Pedir» de cada tarjeta. Muestra cantidades, total y resumen. Los datos que pide son:

- nombre completo;
- teléfono venezolano;
- cédula opcional;
- dirección exacta;
- comentarios o notas opcionales;
- aceptación del envío por WhatsApp.

La validación es local. Marca los campos inválidos, escribe el error debajo, pone `aria-invalid` y lleva el foco al primer campo con problema. El resultado se anuncia en una región `role="status"` con `aria-live="polite"`.

El resumen muestra el precio de cada combo y el total en USD y, cuando la tasa está disponible, su equivalente en Bs.

### Configurar el WhatsApp

En `js/config.js`:

```js
order: {
  whatsapp: "584121234567",       // ejemplo; sustituir por el número real
  // ...
}
```

El número debe ser real y estar confirmado. El código normaliza números venezolanos que empiezan por `0` o `4` y añade `58`. El mensaje de WhatsApp incluye:

- combos elegidos y cantidades;
- cantidad y total de cada línea;
- total general;
- nombre, teléfono, cédula (si se escribió), dirección y notas;
- nota de precios de demostración y pie del mensaje.

Al enviar, se abre WhatsApp en una pestaña nueva. El cliente todavía debe pulsar **Enviar** dentro de WhatsApp. Si el navegador bloquea la ventana, el estado muestra un enlace de respaldo. La página no envía nada por sí sola y no guarda el pedido.

Si `order.whatsapp` está vacío, el formulario valida igual y muestra el aviso de número pendiente; no inventa un destino. También hay que actualizar el WhatsApp visible en `contact` y en el pie cuando esté confirmado.

### Tasa del día

La sección «Haz tu pedido» incluye una tarjeta compacta con la tasa oficial del dólar: `1$ = Bs. ...`, la fuente y la fecha de actualización. Se consulta a `https://ve.dolarapi.com/v1/dolares/oficial` y se usa `promedio`; si no viene, `venta` o `compra`.

La tasa se usa para mostrar el equivalente en Bs. de cada línea y del total en el resumen. Los precios base y el pedido siguen en USD; el monto en Bs. es referencial y se confirma por WhatsApp.

El resumen muestra cada combo y el total en USD y Bs. cuando la tasa está disponible. Si la API falla o todavía está cargando, mantiene los precios en USD y muestra un aviso; no se inventa una tasa.

La consulta se hace al cargar, al volver a la pestaña y cada 15 minutos (`refreshMs`). Usa `cache: "no-store"` y un tiempo máximo de 8 segundos (`timeout`). La fecha se muestra en hora de Caracas (`timeZone`). Si la API falla, la tarjeta muestra «No se pudo cargar la tasa» y el formulario sigue funcionando; no se inventa una tasa.

Configuración en `order.rate`:

```js
rate: {
  label: "Tasa del día",
  base: "1$",
  currency: "Bs.",
  endpoint: "https://ve.dolarapi.com/v1/dolares/oficial",
  refreshMs: 900000,
  timeout: 8000,
  timeZone: "America/Caracas",
  // loading, error, updatedPrefix, updatedFallback y source también son editables
}
```

Los textos del aviso del resumen están en `order`: `summaryRateNote`, `summaryRatePending` y `summaryRateError`.

La API es externa y la página necesita internet para consultarla. No se envía ningún dato del cliente a DolarAPI.

### Ubicación, horario y mapa

La sección «Ubicación y contacto» muestra el horario confirmado y un iframe de Google Maps. El horario está en `contact.details`; el mapa, en `contact.map`:

```js
map: {
  title: "Mapa de ubicación del Mercado Guaicaipuro",
  src: "https://www.google.com/maps/embed?...", // URL de inserción
  href: "https://maps.app.goo.gl/kpiPEbp9Uqp1W31V7",
  linkLabel: "Abrir en Google Maps",
  caption: "Mapa de referencia..."
}
```

`src` es la URL de inserción de Google Maps (la que funciona dentro del iframe); `href` es el enlace corto que se abre en otra pestaña. Si cambia la ubicación, actualiza ambos. El iframe usa `loading="lazy"` y un título accesible. El mapa es un servicio externo: al cargarse, Google puede registrar la solicitud y usar cookies propias.

## Catálogo desde Google Sheets

El catálogo está **desactivado por defecto**:

```js
catalog: {
  enabled: false,
  sheetId: "",
  sheetName: "Combos",
  timeout: 7000,
}
```

La hoja es de **solo lectura** para la página. Se edita en Google Sheets y la web vuelve a leerla al recargar.

### Preparar la hoja

1. Crea una hoja de cálculo nueva.
2. Renombra la pestaña a `Combos` o cambia `catalog.sheetName` por el nombre real.
3. Importa `datos/combos-ejemplo.csv` con **Archivo → Importar → Sustituir hoja de cálculo**, o crea estas columnas en la fila 1:

   | id | nombre | descripcion | precio | foto | foto_alt | destacado | activo | orden |
   | --- | --- | --- | --- | --- | --- | --- | --- | --- |
   | basico | Básico | Para el día a día | 12 | assets/img/bowl-of-white-rice-01.jpg | Arroz blanco en un bol | FALSE | TRUE | 1 |
   | familiar | Familiar | Para compartir en casa | 24 | assets/img/black-beans-uncooked-2024-11-27.jpg | Caraotas negras crudas | FALSE | TRUE | 2 |
   | rendidor | Rendidor | Para resolver la semana | 38 | assets/img/corn-flour.jpg | Harina de maíz en un puesto | TRUE | TRUE | 3 |
   | desayuno | Desayuno | Para empezar el día | 10 | assets/img/roasted-coffee-beans.jpg | Granos de café tostado | FALSE | TRUE | 4 |
   | ahorro | Ahorro | Lo esencial sin extra | 9 | assets/img/plantains.jpg | Plátanos verdes en una caja | FALSE | TRUE | 5 |

4. Comparte la hoja con **Cualquier persona con el enlace → Lector**. El endpoint gviz necesita que la hoja sea pública de lectura.
5. Copia el ID de la hoja desde la URL: es el texto entre `/d/` y `/edit`.
6. En `js/config.js`, activa y completa:

   ```js
   catalog: {
     enabled: true,
     sheetId: "TU_ID_DE_GOOGLE_SHEETS",
     sheetName: "Combos",
     timeout: 7000,
   }
   ```

7. Recarga la página. Si la hoja no responde, tarda más que `timeout`, devuelve un error o no tiene combos válidos, la web muestra el catálogo local y deja un aviso en la consola.

### Reglas de la hoja

- Los `id` deben ser `basico`, `familiar`, `rendidor`, `desayuno` y `ahorro`. La hoja **edita esos cinco combos**; no crea combos nuevos. Para añadir o quitar estructura hay que editar `js/config.js`.
- `nombre` y `descripcion` cambian el nombre y la bajada de la tarjeta.
- `precio` acepta `12`, `12,50`, `12.50` o `$ 12,50`. La moneda se configura en `currency`.
- `foto` acepta una ruta local como `assets/img/...` o una URL directa de imagen. No uses una página de Google Drive; usa un enlace directo o sube la imagen al proyecto. `foto_alt` es obligatorio para accesibilidad.
- `destacado` con `TRUE` aplica el estilo de tarjeta destacada. `activo` con `FALSE` oculta el combo sin borrar la fila.
- `orden` cambia el orden de las tarjetas y del formulario.
- El contenido de los combos (`contents`) sigue en `js/config.js`; la hoja no lo edita.
- No pongas datos de clientes en esta hoja: es pública de lectura.
- La hoja se lee una vez al cargar. Mientras llega, la página muestra el catálogo local; si la hoja responde, vuelve a renderizar combos y formulario. Una selección hecha justo durante esa recarga se reinicia.

### Importante sobre la hoja real

La integración se probó con una respuesta gviz simulada: nombres, descripciones, precios, fotos, `foto_alt`, destacado, `activo` y orden se aplicaron; el combo inactivo desapareció de las tarjetas y del formulario; no hubo errores de consola. También se comprobó antes la sintaxis del JSONP con una hoja pública de ejemplo. **No se ha probado con la hoja real del negocio porque todavía no existe el ID.** Antes de publicar, prueba una hoja real con los cinco `id` y revisa que las fotos carguen.

## Datos de demostración y datos pendientes

No se inventaron teléfonos, dirección exacta del puesto, redes sociales, cobertura de delivery ni precios reales.

- **Precios:** 12 / 24 / 38 / 10 / 9 USD. Son de demostración. Cada tarjeta dice «Precio de demostración» y el resumen lo repite.
- **Contenidos de los combos:** son de demostración; confírmalos con el puesto.
- **Horario y mapa:** fueron aportados por el negocio. Lunes a viernes de 8:00 a. m. a 8:00 p. m.; sábados de 8:00 a. m. a 4:00 p. m.; domingos cerrado. El mapa usa la ubicación del enlace de Google Maps proporcionado.
- **WhatsApp, redes sociales y puesto/referencia:** aparecen como «Por confirmar».
- **Delivery:** «Sujeto a cobertura» y «Zona por confirmar».
- **Fotos:** son imágenes de referencia de productos y del mercado, **no del puesto ni de los combos**. La fachada es del Mercado Municipal; el crédito y la aclaración están en la sección de contacto, en la nota del hero y en el pie.
- **Tasa del día:** se consulta a DolarAPI; no es un precio de demostración. Se usa para mostrar el equivalente en Bs. del resumen; no cambia los precios base. Si la API no responde, la tarjeta y el resumen muestran un aviso.
- **WhatsApp:** no hay número todavía. El formulario valida, pero no abre un chat real. El botón de contacto no es un enlace `wa.me`.
- **Catálogo:** desactivado por defecto. El archivo `datos/combos-ejemplo.csv` sirve para preparar la hoja; no está conectado a ninguna hoja real.
- **Pedidos:** no hay backend, base de datos, carrito persistente, pago ni registro de pedidos. El flujo termina en WhatsApp.

Antes de publicar hay que confirmar, como mínimo:

1. precios, moneda, vigencia y contenidos reales;
2. número de WhatsApp y responsable de responder;
3. dirección/referencia exacta del puesto y zonas de delivery;
4. fotos propias o autorizadas de los combos y del puesto;
5. aviso de privacidad y tratamiento de datos definitivo;
6. condiciones de entrega, cambios, cancelaciones y disponibilidad.

## Comparador «Arma tu lista»

El panel de combos incluye ocho productos de la cesta básica. Al marcarlos:

- se busca el combo que cubre más productos seleccionados;
- si hay empate, gana el combo con más productos en total;
- el resultado se anuncia en un `role="status"` con `aria-live="polite"`;
- la tarjeta sugerida muestra una etiqueta «Cubre X de Y»;
- «Limpiar lista» desmarca todo, vuelve al mensaje inicial y devuelve el foco al primer checkbox.

Es una interacción local y no envía ningún pedido. Si Google Sheets oculta un combo, el comparador solo considera los combos activos. Sin JavaScript se muestra el resumen de `<noscript>`.

## Accesibilidad

- Un solo `h1` y orden de encabezados válido.
- `header`, `nav`, `main` y `footer`; navegación principal y de pie etiquetadas.
- Enlace «Saltar al contenido» visible al enfocar.
- Foco visible en enlaces, botones, checkboxes, steppers y campos.
- Controles principales de al menos 44 px; checkboxes nativos dentro de `fieldset` y `legend`.
- Formulario con etiquetas asociadas, ayudas, `aria-describedby`, `aria-invalid`, errores visibles y foco en el primer campo inválido.
- Estado del comparador, del resumen y del envío con `aria-live="polite"`.
- La tarjeta de tasa usa `role="status"` y `aria-live="polite"`; anuncia la carga, el valor y el error sin bloquear el formulario.
- El resumen muestra los importes en USD y Bs. y anuncia el estado de la tasa con `aria-live="polite"`.
- Imágenes de combos y fachada con texto alternativo; fotos decorativas con `alt=""` y el aside del stage con `aria-hidden="true"`.
- Respeto a `prefers-reduced-motion`: se desactivan el revelado, el cambio de foto y el desplazamiento suave.
- El cambio de foto del escenario se adapta al pasar de móvil a escritorio y viceversa.
- Contraste revisado visualmente; no se detectaron avisos en la revisión de esta fase. No se ejecutó axe/Lighthouse.
- La página se renderiza con JavaScript; el `<noscript>` ofrece un resumen útil, pero el catálogo, el comparador y el pedido requieren JS.
- La foto del hero y el pie usan `svh`; se incluyó un fallback `vh`.

## Privacidad

El formulario se procesa en el navegador. La página no envía los datos a un servidor propio, no los guarda y no instala cookies propias de seguimiento ni analítica. Al pulsar el botón de envío, el navegador abre WhatsApp con un mensaje que contiene los datos escritos; desde ese momento se aplican las políticas de WhatsApp y del negocio. El mapa se inserta desde Google Maps como iframe; al cargarse, Google puede registrar la solicitud y usar cookies propias. La hoja de Google Sheets es pública de lectura y solo debe contener datos del catálogo, nunca datos de clientes. La tipografía Switzer se carga desde Fontshare, que puede registrar la solicitud. La tarjeta de tasa consulta DolarAPI; esa solicitud no incluye datos del cliente, pero el proveedor puede registrar la IP o el navegador. Antes de publicar, sustituye el aviso básico del pie por el aviso de privacidad definitivo.

## Créditos de las imágenes

Las fotos se redimensionaron para la web. Las licencias CC BY-SA 4.0 y CC BY-SA 3.0 exigen atribución; las adaptaciones (redimensionado) se indican en el pie y en `assets/img/credits.json`.

| Archivo | Obra / autor | Licencia | Fuente |
| --- | --- | --- | --- |
| `mercado-de-guaicaipuro.jpg` | «Mercado de Guaicaipuro» / JoseGre12 | CC BY-SA 4.0 | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Mercado_de_Guaicaipuro.jpg) |
| `plantains.jpg` | «Plantains» / Daegis | CC BY-SA 3.0 | [Wikimedia Commons](https://commons.wikimedia.org/w/index.php?curid=5215401) |
| `black-beans-uncooked-2024-11-27.jpg` | «Black beans, uncooked, 2024-11-27» / Bean appreciator | CC0 | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Black_beans,_uncooked,_2024-11-27.jpg) |
| `roasted-coffee-beans.jpg` | «Roasted coffee beans» / MarkSweep | Dominio público | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Roasted_coffee_beans.jpg) |
| `bowl-of-white-rice-01.jpg` | «Bowl of white rice 01» / Douglas Perkins | CC0 | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Bowl_of_white_rice_01.jpg) |
| `corn-flour.jpg` | «Corn flour» / Achiri Bitamsimli | CC BY-SA 4.0 | [Wikimedia Commons](https://commons.wikimedia.org/w/index.php?curid=100304475) |

El detalle completo (autor, URL de licencia, dimensiones y bytes) está en `assets/img/credits.json`. Los créditos visibles están en el pie, dentro de «Créditos de las imágenes». Si se reemplazan las fotos, actualiza también ese archivo y el bloque `footer.credits` de `js/config.js`.

## Pruebas realizadas

### Sintaxis y carga

- `node --check js/config.js` y `node --check js/app.js`: sin errores.
- Carga desde `file://` en Chrome headless, sin errores de consola ni excepciones.
- Sin identificadores duplicados; un solo `h1`; orden de encabezados válido.

### Escritorio, tablet y móvil

Prueba CDP en Chrome a 1440 × 900, 764 × 900 y 390 × 844:

- sin desbordamiento horizontal (`scrollWidth === clientWidth` en 764 y 390; el ancho interno incluye la barra de desplazamiento);
- ambos botones del hero visibles en el primer viewport de 390 × 844;
- la navegación móvil se reduce a una fila a 390 px;
- el CSS define 1, 2, 3 y 5 columnas; se vieron 1 columna a 390 px y 5 a 1440 px;
- el escenario cambia la foto al hacer scroll y al cambiar de ancho; en la sección de pedido muestra la harina de maíz;
- los formularios y el resumen se apilan correctamente en móvil y usan dos columnas en escritorio;
- los campos de nombre y teléfono alinean sus bordes superiores en la vista de dos columnas; la ayuda del teléfono queda debajo del campo;
- las esquinas redondeadas se aplican a tarjetas, botones, campos, paneles y fotos;
- las imágenes perezosas cargan al hacer scroll; no se encontraron imágenes rotas.

### Pedido y validación

Prueba con la configuración real (WhatsApp vacío) y con un número simulado en tiempo de ejecución:

- el botón «Pedir» de una tarjeta agrega una unidad y enfoca el control de cantidad;
- el stepper suma; Básico + Familiar da `$ 36,00`;
- sin combos: «Elige al menos un combo», `aria-invalid` en el fieldset y foco en el primer stepper;
- teléfono inválido: error y foco en `pedido-phone`;
- cédula inválida: error y foco en `pedido-id`;
- dirección corta: error y foco en `pedido-address`;
- consentimiento sin marcar: error y foco en el checkbox;
- con el número vacío: estado de WhatsApp pendiente, sin abrir ventana;
- con un número simulado: se abre `wa.me` con el mensaje completo; incluye combos, cantidades, precios, total, nombre, teléfono, cédula, dirección y notas;
- el fallback de ventana bloqueada existe, pero no se probó con un bloqueador real.

### Comparador

- Arroz + caraotas + harina sugiere **Rendidor** con «Cubre 3 de 3»;
- «Limpiar lista» reinicia el estado y enfoca el primer checkbox.

### Tasa del día

Prueba con la API real y con una respuesta 500 simulada:

- el endpoint respondió 200 con CORS `*`; la tarjeta mostró el valor devuelto por la API (en la prueba, `1$ = Bs. 886,23`), la fuente «Dólar oficial» y la fecha en hora de Caracas;
- `role="status"`, `aria-live="polite"`, etiqueta «Tasa del día» y base `1$`;
- a 1440, 764 y 390 px midió 300 px, no generó desbordamiento horizontal y se reveló al entrar en la sección;
- con Básico + Familiar, el resumen mostró `$ 12,00` / `Bs. 10.634,76`, `$ 24,00` / `Bs. 21.269,52` y total `$ 36,00` / `Bs. 31.904,28`; la nota indicó `1$ = Bs. 886,23`;
- con una respuesta 500 simulada mostró «No se pudo cargar la tasa...», aplicó el color de error y el formulario siguió disponible; se hizo una sola solicitud;
- en ese mismo estado de error, el resumen mantuvo los precios en USD, dejó vacío el importe en Bs. y mostró el aviso de que se confirma por WhatsApp;
- sin errores de consola en la carga correcta. La prueba de error registró el 500 simulado como error de red, como es esperable;
- no se esperaron los 15 minutos de actualización ni se probó una caída real de la API.

### Ubicación y contacto

- el iframe de Google Maps se cargó en Chrome headless con el mapa centrado en las coordenadas del enlace corto;
- el enlace «Abrir en Google Maps» apunta a `https://maps.app.goo.gl/kpiPEbp9Uqp1W31V7` y abre en otra pestaña;
- el horario visible es lunes a viernes de 8:00 a. m. a 8:00 p. m. y sábados de 8:00 a. m. a 4:00 p. m.; domingos cerrado;
- el mapa no genera desbordamiento horizontal a 390, 764 ni 1440 px;
- no se probó con bloqueadores de terceros, cookies de Google rechazadas ni una caída de Google Maps.

### Google Sheets

- Prueba con una respuesta gviz simulada (sin hoja real): se aplicaron nombres, descripciones, precios, fotos, `foto_alt`, destacado y orden;
- el combo con `activo: FALSE` desapareció de las tarjetas y del formulario;
- el formulario y el comparador se volvieron a renderizar;
- sin errores de consola;
- no se probó el ID real, los permisos reales de la hoja ni la latencia de Google.

### No probado

- WhatsApp real: falta el número. No se probó en un teléfono físico ni con la app de WhatsApp.
- Google Sheets real: falta la hoja y el ID.
- Tasa del día: caída real de DolarAPI, límites o cambios de formato de la API y espera de 15 minutos.
- Safari, Firefox, lectores de pantalla reales (NVDA/VoiceOver), teléfonos físicos, axe/Lighthouse, red lenta o bloqueada.
- Google Maps con bloqueadores de terceros, cookies rechazadas o caída del servicio.
- Pago, disponibilidad real, delivery real, dirección exacta del puesto y atención al cliente.
- Los scripts `lint.mjs` e `inspect.mjs` de la fase 1 no forman parte del proyecto y no se volvieron a ejecutar en esta fase; las comprobaciones anteriores se sustituyeron por las pruebas CDP descritas.

## Notas de diseño

- Dirección **split stage**: columna de papel con foto fija al lado en escritorio (≥ 1000 px); en móvil la foto va arriba y la tarjeta se superpone.
- Paleta hueso / verde-negro / rojo de mercado; tipografía Switzer; sin sombras ni degradados; la franja de toldo como recurso de marca.
- Esquinas redondeadas moderadas mediante tokens: `4`, `8`, `12` y `18` px.
- La sección de combos rompe a todo el ancho en escritorio; las tarjetas pasan de 1 a 2, 3 y 5 columnas. Rendidor es la tarjeta destacada en verde-negro.
- El pedido mantiene la jerarquía de la marca y usa el mismo lenguaje redondeado en el panel, los campos, los steppers y el resumen.
- La tarjeta de tasa del día es una pieza compacta verde-negro de 300 px dentro del encabezado del pedido; muestra `1$ = Bs. ...`, la fuente y la fecha sin competir con el título.
- El resumen presenta el importe en USD como principal y el equivalente en Bs. debajo, tanto por línea como en el total; la nota indica la tasa aplicada.
- Las imágenes se redujeron de ~4,1 MB a ~1,35 MB (calidad 80) manteniendo la fachada legible.
- La página usa `svh` con fallback `vh`; el movimiento se desactiva con `prefers-reduced-motion`.
