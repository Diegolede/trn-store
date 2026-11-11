# TRN — catálogo con consulta por WhatsApp

Sitio estático del catálogo **TRN** (Argentina), pensado para publicarse en **GitHub Pages**. No hay carrito ni checkout en la web: la clienta o el cliente elige un producto y consulta por WhatsApp. Después se confirma el stock y se coordina el pago con Mercado Pago o transferencia (5% off).

Los precios, descuentos, fotos por color, badges de stock y el estimador de envío se mantienen igual que en la tienda de referencia.

## Lo primero: el número de WhatsApp

El único dato que hace falta cambiar antes de publicar es el número, en `js/data.js`, dentro de `STORE_CONFIG`:

```js
whatsapp: "5493410000000",       // internacional, sin +. Este es el que usan los botones.
whatsappDisplay: "341 000-0000", // cómo se muestra en contacto y en el menú
```

El valor de `whatsapp` va directo a `https://wa.me/<número>?text=...`. Usá el formato internacional **sin el signo +**. Ejemplo argentino: `54` + `9` + código de área sin el 0 + número (`5493410000000`).

Hoy está un placeholder (`5493410000000`). Cambialo por el número real de TRN y, si querés, actualizá también mail, Instagram, TikTok y los datos de transferencia en el mismo objeto.

## Cómo verlo en local

No hay paso de build. Desde esta carpeta:

```bash
python3 -m http.server 8080
```

Abrí [http://localhost:8080](http://localhost:8080).

## Cómo se consulta un producto

- En cada card hay una píldora chica **Consultar**.
- En la ficha, el botón principal es **Consultar por WhatsApp** (incluye el color elegido, la cantidad si es más de una, el precio y el enlace de la ficha).
- El botón redondo negro, abajo a la derecha, y el ícono de WhatsApp del header abren un mensaje genérico: `Hola TRN! Quiero hacer una consulta.`
- El mensaje de un producto sigue este tono: `Hola TRN! Quiero consultar por: TRN Pulse X2 Wireless — Color: Rosa — Precio: $ 80.991. ¿Tienen stock?`

## Cómo editar el inventario

### A mano

Editá `js/data.js`:

- `STORE_CONFIG`: contacto, descuento por transferencia (5%), umbral de envío gratis, cuotas y datos de CBU / alias / titular.
- `CATEGORIES` y `PRODUCTS`: cada ítem tiene `id`, `name`, `category`, `price` (entero en ARS, sin puntos), `stock`, `description`, `variants` (colores, stock e imágenes) y, si aplica, `discount` / `discountUntil`.

Los precios se muestran con formato argentino, por ejemplo `$ 45.990`.

### Panel de administración

Entrá a `#/admin` (el enlace no está en el pie público; la ruta sigue existiendo). La contraseña de este prototipo es **`trn-admin`**.

Desde ahí podés cargar o editar productos, ajustar stock y precio, aplicar un descuento a una categoría, importar un CSV o bajar la plantilla.

Los cambios del admin se guardan solo en el `localStorage` de **ese navegador**. No se publican solos en GitHub Pages.

### Exportar y subir el catálogo al repo

1. En `#/admin`, tocá **Exportar catálogo**.
2. Se descarga un `data.js` actualizado (incluye `STORE_CONFIG`, categorías, FAQ, productos y páginas de ayuda).
3. Reemplazá `js/data.js` en esta carpeta con el archivo descargado.
4. Hacé commit y push a `main`. Cuando GitHub Pages vuelva a desplegar, el inventario nuevo queda en el sitio público.
5. **Restablecer** en el admin vuelve al contenido de `js/data.js` (el que está en el repo).

Si cargaste fotos desde el panel, pueden ir como data URL dentro de `data.js` y el archivo puede hacerse grande. Para un catálogo definitivo conviene hostear las imágenes y poner la URL en la variante.

## Cómo publicarlo en GitHub Pages

1. Creá un repositorio nuevo (por ejemplo `trn-catalogo`) y subí el contenido de esta carpeta a la rama `main`.
2. En el repo: **Settings → Pages**.
3. En *Build and deployment*, elegí **Deploy from a branch**, rama `main`, carpeta `/ (root)`.
4. Guardá. En uno o dos minutos el sitio queda en `https://<usuario>.github.io/<repo>/`.

Los estilos y scripts usan rutas relativas (`./css/styles.css`, `./js/app.js`), así que funcionan en la raíz de un proyecto de Pages. Hay un `404.html` que redirige al `index.html` por si alguien entra a una ruta que no existe.

Este repo no incluye un remoto: inicializalo y conectalo vos cuando quieras publicarlo.

## Estructura

```
trn-catalogo/
  index.html      # cascarón: header, pie y botón flotante de WhatsApp
  404.html        # redirección hacia el catálogo
  favicon.svg     # marca TRN en negro
  css/styles.css
  js/data.js      # catálogo, contacto y textos
  js/app.js       # ruteo, fichas, WhatsApp y admin
  README.md
```

Tipografía: [Inter](https://fonts.google.com/specimen/Inter) por Google Fonts, con fallback al sans del sistema.

## Descuentos, colores y CSV

En el admin, cada producto puede tener un **descuento %** y una **fecha de vencimiento** opcional. En el catálogo se ve el precio original tachado, el precio final y una píldora `−10%`. El 5% extra por transferencia se calcula sobre el precio ya descontado. También se puede aplicar un descuento a toda una categoría.

Cada color puede tener su propio stock y una o más fotos. En la ficha, al elegir el color cambian la imagen, el stock y el mensaje de WhatsApp. En las cards, los puntos de color sirven para previsualizar y actualizan el enlace **Consultar**.

Sin foto real, el catálogo tiñe el ícono del producto del color elegido. Los colores de producto son la única excepción a la paleta blanco y negro de la interfaz.

La plantilla CSV incluye `discount`, `discountUntil`, `variants` y, si hace falta, columnas por fila:

- `variants`: compacto, `Negro:8:;Blanco:6:;Rosa:4:https://…/rosa.jpg` (nombre:stock:urls separadas por `|`; variantes separadas por `;`).
- O varias filas con el mismo `id` y `variante_color`, `variante_imagen`, `variante_stock`.

## Íconos

En Home, el renglón “¿Qué buscás?” es una fila de píldoras con el nombre de cada categoría (Mouse, Teclados, Mousepads, Glasspads, Auriculares in-ear, Mangas, Skates, más Ofertas).

En las fichas y las cards, si no hay foto, se usa un placeholder:

- **Mouse:** [Phosphor](https://phosphoricons.com/) `mouse-fill` (MIT).
- **Teclados** y **Auriculares in-ear:** [Material Symbols Rounded](https://fonts.google.com/icons), estilo filled (Apache 2.0): `keyboard` y `earbuds`.
- **Mousepads, glasspads y skates:** composiciones en el mismo peso.
- **Mangas:** un bloque neutro redondeado.

## Contacto y textos legales

En `STORE_CONFIG` (`js/data.js`) están el mail, WhatsApp, Instagram, TikTok, el umbral de envío gratis, las cuotas y los datos de transferencia. Las páginas de Ayuda y Legal (`#/envios`, `#/cambios`, `#/garantia`, `#/faq`, `#/contacto`, `#/terminos`, `#/privacidad`, `#/arrepentimiento`) ya tienen texto para una tienda en Argentina (incluye botón de arrepentimiento y el enlace a Defensa del consumidor), adaptado a la compra por WhatsApp.
