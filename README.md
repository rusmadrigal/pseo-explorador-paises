# Curso de SEO Programático (pSEO) con Next.js

Este repositorio contiene el código fuente del curso de **SEO Programático (pSEO)** impartido por **Rus Madrigal**.

El proyecto genera automáticamente más de 250 páginas optimizadas para motores de búsqueda — una por cada país del mundo — a partir de una sola fuente de datos (REST Countries API), demostrando en la práctica cómo funciona el SEO programático.

## Video del curso

Puedes seguir el curso completo en YouTube:

[Ver la playlist del curso en YouTube](https://www.youtube.com/watch?v=8YnA_El17m4&list=PLAK1ErK60OT8gtXldWxfQwnkL9jhjp1Ng)

## ¿Qué es el SEO programático?

El SEO programático (pSEO) es una estrategia que consiste en generar cientos o miles de páginas optimizadas a partir de datos estructurados y plantillas, en lugar de crear cada página manualmente. Esto permite escalar el contenido de un sitio web de forma eficiente y aparecer en resultados de búsqueda para una gran variedad de consultas.

## ¿Qué se construye en este curso?

**WorldExplorer** — una aplicación web que genera páginas individuales para cada país del mundo con:

- Datos de población, capital, idiomas y monedas
- Información geográfica (coordenadas, zona horaria, países fronterizos)
- Navegación por regiones y subregiones
- Búsqueda instantánea de países

## Temas de pSEO cubiertos

- Generación estática de páginas con `generateStaticParams`
- Meta tags dinámicos por página (`generateMetadata`)
- Datos estructurados con Schema.org (JSON-LD)
- Sitemap dinámico (`sitemap.ts`)
- Archivo `robots.txt` programático
- URLs canónicas
- Open Graph tags
- Interlinking entre páginas (países fronterizos, misma región)
- Breadcrumbs para estructura de navegación

## Stack tecnológico

- **Next.js 16** — App Router con React Server Components
- **React 19**
- **TypeScript**
- **Tailwind CSS 4**
- **shadcn/ui** — componentes de interfaz
- **REST Countries API** — fuente de datos

## Instalación

```bash
git clone https://github.com/tu-usuario/pseo-explorador-paises.git
cd pseo-explorador-paises
npm install
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`.

## Estructura del proyecto

```
src/
├── app/
│   ├── country/[slug]/   # Página individual de cada país
│   ├── region/[region]/  # Página por región
│   ├── layout.tsx        # Layout principal
│   ├── page.tsx          # Página de inicio
│   ├── not-found.tsx     # Página 404
│   ├── sitemap.ts        # Sitemap dinámico
│   └── robots.ts         # Robots.txt programático
├── components/
│   ├── ui/               # Componentes shadcn/ui
│   ├── country-card.tsx  # Tarjeta de país
│   ├── header.tsx        # Encabezado
│   ├── footer.tsx        # Pie de página
│   └── search-countries.tsx # Búsqueda
└── lib/
    ├── countries.ts      # Lógica de datos y API
    └── utils.ts          # Utilidades
```

## Licencia

Este proyecto es material educativo del curso de pSEO de Rus Madrigal.
