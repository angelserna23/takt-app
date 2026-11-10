# Kit de arranque — App de ingeniería industrial

> Copia este documento completo en el primer mensaje del nuevo chat o proyecto.
> Al final hay un prompt listo para pegar.

---

## 1. Nombres propuestos para el proyecto

Antes de elegir, revisa que el dominio (.com / .mx) y el nombre en App Store y Google Play estén libres, y búscalo en el registro de marcas del IMPI.

| Nombre | Idea detrás |
|---|---|
| **Takt** | El ritmo de la línea. Corto, técnico, se dice igual en español e inglés |
| **Gemba** | "Donde pasan las cosas". Muy reconocido en Lean (es probable que ya esté ocupado) |
| **Cronos IE** | Tiempo + ingeniería industrial |
| **TimeLine IE** | Tiempo y línea de producción en un solo nombre |
| **Estándar** | El tiempo estándar como producto. Fuerte en español |
| **Kaizo** | De kaizen: mejora continua, fácil de recordar |
| **OpTime** | Operación + tiempo; suena a optimizar |
| **FloorIQ** | El piso de producción con inteligencia |

Lema propuesto: **"Deja el papel y el cronómetro. Tu estudio de tiempos, calculado y graficado mientras lo tomas."**

---

## 2. El problema (validado por Angel)

- Ingenieros industriales y de manufactura en **Donaldson, Marelli, JATCO, Nissan y Capgemini** siguen haciendo estudios de tiempos con **papel, lápiz y cronómetro**, o con el cronómetro del teléfono.
- Las apps que existen (Time It Up, Timestu, ProcessTM, WorkStudy+, TimeStudy Pro, etc.) fallan en lo básico:
  - no son responsivas en teléfono, tablet y laptop;
  - las gráficas se ven mal;
  - exportan a Excel y el análisis se sigue haciendo **a mano**;
  - casi todas están en inglés y solo para iPhone.
- Ninguna une los tres pilares del ingeniero industrial en un solo flujo.

## 3. La solución

Una **app web instalable (PWA)** para teléfono, tablet y laptop, que **funciona sin internet** en piso de producción y calcula todo mientras se toman los tiempos.

**Tres pilares integrados:**
1. **Tiempo:** cronómetro por elementos, ciclos, valoración del desempeño, suplementos, tiempo estándar, tamaño de muestra y gráficas en vivo.
2. **Eficiencia de máquina:** OEE (disponibilidad, desempeño, calidad), pérdidas y paros.
3. **Costo de mano de obra directa:** horas requeridas contra trabajadas por modelo, costo por pieza, plantilla por volumen y balanceo de línea.

**Diferenciador:** la app "piensa como un ingeniero industrial senior". Del cronómetro salen automáticamente el tiempo estándar, el balanceo, el OEE y el costo, con KPIs y tableros listos para presentar.

## 4. Usuarios

- **Principal:** ingeniero industrial o de procesos que toma tiempos en piso (con una mano, a veces con guantes, con ruido y poca señal).
- **Secundarios:** supervisores de producción, líderes de mejora continua y estudiantes de ingeniería industrial.
- **Comprador:** gerente de ingeniería, de planta o de mejora continua.

## 5. Validación de precio (conversaciones de Angel)

- Ingeniero individual: dispuesto a pagar **~$100–200 MXN/mes**.
- Las empresas pagarían bastante más por licencias de equipo o planta.

| Plan | Para quién | Incluye | Precio orientativo |
|---|---|---|---|
| Gratis | Estudiantes, prueba | Cronómetro por elementos, tiempo estándar básico | $0 |
| Pro | Ingeniero individual | Gráficas en vivo, OEE, costo de MO, exportación Excel/PDF, historial | ~$149–199 MXN/mes |
| Planta | Equipo de ingeniería | Multiusuario, estudios compartidos, KPIs por línea | Por usuario o por planta |
| Corporativo | Multiplanta | Permisos, varias plantas, soporte | A cotizar |

## 6. MVP (solo Pilar 1: tiempos)

1. Crear estudio: planta, línea, estación, operación, operador (opcional) y elementos.
2. Cronómetro por elementos con botones grandes, cronometraje continuo o vuelta a cero, conteo de ciclos y elementos extraños.
3. Valoración del desempeño por ciclo o por estudio.
4. Suplementos (personales, fatiga, demoras) configurables.
5. Cálculos automáticos: tiempo observado, normal y estándar, piezas por hora y tamaño de muestra recomendado.
6. Gráficas en vivo: variación por ciclo, distribución por elemento y Pareto de elementos.
7. Funciona sin internet y sincroniza después.
8. Exportación limpia a Excel y PDF, lista para presentar.
9. Bilingüe (español e inglés).

**Después del MVP:** OEE → costo de mano de obra directa → equipos y multiplanta → planes de pago → página de venta.

## 7. Stack técnico sugerido

- **Frontend:** React + TypeScript, como PWA instalable y con modo offline (IndexedDB).
- **Backend:** Python con FastAPI.
- **Base de datos y usuarios:** Postgres en Supabase.
- **Hosting inicial:** Vercel (frontend) y Render (backend), con planes gratuitos.
- **Tiendas de apps (después):** Capacitor para publicarla en App Store y Google Play sin reescribirla.
- **Diseño:** tipo dashboard, dinámico y moderno: tarjetas de KPI, gráficas animadas, superficies de vidrio claro y la línea visual del portafolio de Angel. Usable con una mano en piso.

## 8. Reglas del proyecto

- **No usar código, archivos ni datos de JATCO, ABC Autolíneas ni otros empleadores.** Todo se reconstruye desde cero con datos de ejemplo ficticios. El conocimiento es de Angel; los archivos de las empresas no.
- Antes de vender: consultar a un abogado de propiedad intelectual y registrar la obra ante INDAUTOR y la marca ante el IMPI.
- **Un producto a la vez.** La app de flotillas para transportistas queda como segundo producto, también reconstruida desde cero.
- Los cálculos llevan pruebas automáticas: un error en el tiempo estándar destruye la confianza del cliente.

## 9. Herramientas para trabajar con Claude

- **Proyecto nuevo** en Claude, con su propio repositorio en GitHub, y desarrollo con Claude Code.
- **Skills de diseño:** Impeccable, Emil Kowalski y Taste Skill (subir los ZIP en Customize > Skills), más frontend-design.
- **Skills de proceso (superpowers):** brainstorming → writing-plans → test-driven-development → verification-before-completion.
- **Pruebas visuales:** Playwright, para verificar en teléfono, tablet y laptop.
- **Archivos de contexto en el repo:** `PRODUCT.md` (para quién y por qué) y `DESIGN.md` (sistema visual).

## 10. Qué llevar al primer chat

- Este documento.
- **Tus fórmulas explicadas con tus palabras:** cómo calculas el tiempo estándar, la valoración, los suplementos, el OEE, las horas requeridas contra trabajadas y la plantilla por volumen.
- Ejemplos de estudios con **datos ficticios** (inventados, con la forma real).
- Capturas o descripciones de lo que **no te gusta** de las apps que ya probaste.

---

## 11. Prompt para pegar en el nuevo chat

```
Quiero construir una app para ingenieros industriales y de manufactura.
Soy Senior Industrial Engineer (estudios de tiempos, OEE, costo de mano
de obra directa) y estudio Full Stack Python.

Problema validado: en Donaldson, Marelli, JATCO, Nissan y Capgemini los
ingenieros siguen tomando tiempos con papel, lápiz y cronómetro. Las apps
que existen no son responsivas, sus gráficas se ven mal y el análisis
se sigue haciendo a mano en Excel. Ingenieros me dijeron que pagarían
~$100–200 MXN/mes; las empresas pagarían más por licencias de planta.

Visión: una PWA instalable (teléfono, tablet, laptop) que funcione sin
internet en piso de producción, con tres pilares integrados:
1) Estudio de tiempos: cronómetro por elementos, ciclos, valoración,
   suplementos, tiempo estándar, gráficas en vivo mientras se cronometra.
2) Eficiencia de máquina: OEE (disponibilidad, desempeño, calidad).
3) Costo de mano de obra directa: horas requeridas vs trabajadas por
   modelo, costo por pieza, plantilla por volumen.

Objetivo de negocio: SaaS para manufactura (automotriz, aeroespacial,
electrónica), en español e inglés, con plan gratis, Pro individual,
Planta y Corporativo.

Diseño: dinámico y moderno tipo dashboard (tarjetas de KPI, gráficas
animadas, superficies tipo vidrio claro), usable con una mano y con
guantes en piso.

Stack propuesto: React + TypeScript (PWA, offline con IndexedDB),
FastAPI (Python), Postgres (Supabase). Solo datos de ejemplo ficticios;
no usaré código ni datos de mis empleadores.

Te adjunto el kit de arranque con el detalle. Empecemos con brainstorming
del MVP (solo Pilar 1) antes de escribir código: usuarios, flujo en piso,
cálculos exactos y pantallas clave. Explícame cada decisión, porque
quiero aprender a construirlo yo también.
```
