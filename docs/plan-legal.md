# Takt — plan del chat legal

> **Estado (2026-11-19, noche): hecho.** Preguntas de la sección 5 respondidas y los 9 documentos redactados en `docs/legal/` (decisiones y marco legal verificado en `docs/legal/README.md`). Falta: revisión con abogado humano y construir la sección 6 en la app.

Preparado el 2026-11-19 para el siguiente chat. En ese chat Claude actúa como **abogado experto en derecho digital mexicano**: protección de datos personales, contratos SaaS y comercio electrónico, propiedad intelectual y lo laboral que toca a una herramienta de estudios de tiempos.

**Advertencia que va en todo lo que salga de ese chat:** son borradores profesionales para ahorrar tiempo y llegar preparados. **Angel los confirma con un abogado humano** (de preferencia especializado en datos personales y tecnología) antes de publicarlos o lanzar la app. Claude no es abogado ni sustituye uno.

## 1. Qué es Takt, visto desde lo legal

- **Producto:** app web SaaS para ingenieros industriales: 6 estudios de tiempos (Work Sampling, Delay Study, Work Element, Speed Trial, Man Machine, SMED), Takt y balanceo, Hoja estándar, Diagramas, Actual Time, Eficiencia compuesta y Cálculo de personal. Reportes PDF. Español e inglés.
- **Clientes:** sobre todo empresas manufactureras (B2B). También puede comprarla un ingeniero por su cuenta (persona física), lo que podría activar reglas de consumidor.
- **Quién usa la app:** Analista (prepara y analiza) y Capturista (toma tiempos en piso). Habrá cuentas, usuarios y roles, guardado en la nube y uso sin internet.
- **Datos que maneja hoy o manejará:**
  - **Del usuario:** nombre, apellidos, correo, puesto, planta, foto opcional (Configuración → Perfil). No se pide fecha de nacimiento a propósito: no se usa.
  - **De la empresa:** nombre, logo, catálogo de plantas, áreas, líneas y estaciones.
  - **De los estudios:** tiempos, actividades, observaciones de operadores en piso, conteos, producción, horas, personal (headcount), costos (Speed Trial). Los estudios pueden llevar **nombres o claves de operadores**, es decir, datos de **terceros** que no son usuarios de Takt.
  - **De pago:** lo maneja el proveedor de pagos (se define en el chat de pagos). Takt no debería guardar tarjetas.
  - **Técnicos:** almacenamiento local del navegador (IndexedDB) para trabajar sin internet; más adelante, registros del servidor.
- **Decisiones ya tomadas que tienen razón legal:**
  - Se descartó el **tiempo estándar propio** para no entrar en problemas legales: Takt usa fórmulas estándar de ingeniería industrial y no publica estándares propios.
  - Se descartó el módulo de ergonomía NOM-036.
  - Nada de código, archivos ni datos de empleadores de Angel (JATCO, ABC Autolíneas u otros). Todo se construyó desde cero con datos ficticios; los formatos base los creó Angel por su cuenta.
  - Exportación solo en PDF de solo lectura.

## 2. Riesgos que hay que cubrir (por qué nos respaldamos)

1. **Decisiones de personal tomadas con los cálculos.** Cálculo de personal, GAP de headcount y eficiencias pueden usarse para recortar plantilla o presionar a operadores. Hace falta una limitación de responsabilidad clara: Takt calcula, la empresa decide.
2. **Datos de operadores en piso** (terceros que no aceptaron nada con Takt). La empresa cliente es la **responsable** de esos datos y Takt es **encargado**. La empresa debe informar a sus trabajadores y, si aplica, al sindicato. Se cubre con un contrato o anexo de tratamiento de datos.
3. **Exactitud de los cálculos.** Hay pruebas automáticas, pero no se garantiza un resultado: «tal cual», sin garantía de idoneidad para un fin particular, con un tope de responsabilidad.
4. **Propiedad de los datos.** Los estudios son del cliente. Takt no los vende y solo los usa para dar el servicio. Hay que decir qué pasa al cancelar (descarga y borrado, plazos).
5. **Propiedad intelectual de Takt:** software, diseño, nombre y marca. Hay que **revisar la disponibilidad de la marca «Takt» en el IMPI** («takt» es un término común en manufactura y puede ser difícil de registrar solo).
6. **Uso indebido:** cuentas compartidas, ingeniería inversa, cargar datos de otras empresas sin permiso.
7. **Pagos y cancelaciones:** reembolsos, renovación automática, facturación (CFDI). Depende del chat de pagos; se redacta con espacios para llenar.
8. **Clientes fuera de México:** GDPR (Unión Europea) y leyes estatales de EE. UU. (por ejemplo, CCPA en California) si se vende allá.

## 3. Marco legal a revisar en ese chat (verificar vigencia con búsqueda antes de citar)

- **Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP).** La **nueva** ley entró en vigor el **21 de marzo de 2025** (DOF 20-03-2025) y abrogó la de 2010; tuvo una reforma el 14 de noviembre de 2025. La autoridad ahora es la **Secretaría Anticorrupción y Buen Gobierno**: el INAI desapareció. Hay que verificar si ya salió el **Reglamento actualizado**.
  - Puntos a cubrir: aviso de privacidad (integral, simplificado y corto), finalidades que requieren consentimiento, derechos ARCO, revocación del consentimiento, transferencias y remisiones (nube, pagos), plazos de conservación, bloqueo y supresión, medidas de seguridad y vulneraciones.
- **Código de Comercio** (comercio electrónico y mensajes de datos) y **Código Civil Federal** (contratos, consentimiento electrónico). Considerar la **NOM-151-SCFI-2016** para conservar la constancia de aceptación de los términos.
- **Ley Federal de Protección al Consumidor (PROFECO)**, si venden a personas físicas: información de precios, cancelación y contratos de adhesión.
- **Ley Federal del Trabajo**, solo para orientar a los clientes sobre el uso de estudios de tiempos con sus trabajadores (Takt no es patrón de nadie).
- **Ley Federal del Derecho de Autor** (software) y **Ley Federal de Protección a la Propiedad Industrial** (marca, IMPI).
- **Fiscal:** facturación electrónica (CFDI, SAT) cuando haya cobros; se aterriza en el chat de pagos.
- **Extranjero:** GDPR, CCPA y otras, solo si se decide vender fuera de México.

## 4. Documentos que se crearán en ese chat (en este orden)

| # | Documento | Para quién | Notas |
|---|---|---|---|
| 1 | **Aviso de privacidad integral** + versión **simplificada** | Usuarios de Takt | Obligatorio desde que se recaban datos; ya se piden datos en Perfil |
| 2 | **Términos y condiciones** del servicio | Usuarios y empresas | Licencia de uso, cuentas, propiedad de datos, limitación de responsabilidad, suspensión, ley aplicable y tribunales |
| 3 | **Contrato o anexo de tratamiento de datos** | Empresas cliente | Cliente = responsable, Takt = encargado; datos de operadores; subencargados (nube, pagos) |
| 4 | **Política de uso aceptable** | Usuarios | Usos prohibidos; uso ético de estudios con trabajadores |
| 5 | **Aviso sobre los cálculos** | En la app y en los PDF | Fórmulas estándar de IE; resultados de apoyo; la decisión es del cliente |
| 6 | **Política de almacenamiento local y cookies** | Usuarios | IndexedDB, uso sin internet, qué se guarda en el dispositivo |
| 7 | **Política de reembolsos y cancelación** | Clientes que pagan | Con espacios; se completa en el chat de pagos |
| 8 | **Guía para el cliente:** cómo informar a sus trabajadores que se harán estudios de tiempos | Empresas cliente | Valor agregado y respaldo; no es obligación de Takt |
| 9 | **Lista para registrar la marca** en el IMPI | Angel | Clases y búsqueda de disponibilidad |

Formato: Markdown en el repo (`docs/legal/`), en español; la versión en inglés va después de la revisión del abogado. Cada documento lleva fecha de versión y un apartado «Pendiente de confirmar con abogado».

## 5. Preguntas para Angel al iniciar ese chat (las hace Claude primero)

1. ¿Quién es el **responsable** legal de Takt: tú como persona física con actividad empresarial, o una sociedad (S.A.S., S. de R.L., etc.)? ¿Nombre o razón social y domicilio para los avisos?
2. ¿Qué **correo** se usará para privacidad y derechos ARCO?
3. ¿Venderás **solo en México** al inicio, o también en EE. UU. y Europa?
4. ¿Venderás también a **personas físicas** (ingenieros independientes) o solo a empresas?
5. ¿Los estudios llevarán **nombres de operadores**, o solo claves y números? (Recomendación probable: claves, para reducir riesgo.)
6. ¿Edad mínima para usar Takt? (Recomendación: 18 años; es una herramienta profesional.)
7. ¿Ya hay **proveedor de nube** en mente? (Se pueden dejar espacios.)
8. ¿Plazos de conservación al cancelar? (Por ejemplo, 30 días para descargar y después se borra.)

## 6. Dónde se verá en la app (se construye después del chat legal)

- **Configuración → sección nueva «Legal»** con los documentos y su fecha de versión.
- **Aceptación al crear cuenta** (casilla y constancia), cuando existan las cuentas.
- **Aviso simplificado** junto a los datos del Perfil; hoy dice «Tus datos se guardan solo en este dispositivo».
- **Pie de los reportes PDF:** aviso corto sobre los cálculos, si el abogado lo recomienda.

## 7. Orden acordado con Angel

**Legal (siguiente chat) → Diseño visual → Pagos** y lo que quede pendiente. Después se ve qué sigue, y se agregan puntos al plan conforme salgan.
