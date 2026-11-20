# Aviso sobre los cálculos — Takt

Versión: 2026-11-19 · Estado: **BORRADOR para revisión de abogado**
Relación: cláusula 9 de los Términos, cláusula 3.5 del Contrato de tratamiento de datos (art. 26 LFPDPPP, oposición a decisiones automatizadas) y sección 2 de la Política de uso aceptable.

> Tres versiones del mismo mensaje, de la más larga a la más corta, para usarlas en lugares distintos.

---

## A. Versión completa (Configuración → Legal)

**Cómo calcula Takt y qué significan sus resultados**

1. **Métodos estándar.** Takt aplica métodos públicos y reconocidos de la medición del trabajo y la ingeniería industrial (muestreo del trabajo, estudio de tiempos con cronómetro, análisis de demoras, pruebas de velocidad, diagramas hombre-máquina, SMED, takt time y balanceo de líneas, eficiencia y cálculo de personal). **Takt no crea ni publica estándares de tiempo propios** ni tablas de suplementos de terceros: los tiempos, porcentajes y suplementos los define y captura cada empresa.

2. **Los resultados dependen de los datos.** La calidad de cada resultado depende de lo que se captura: el método elegido, el número de observaciones o ciclos, la calificación de actuación, los suplementos, las horas, la demanda y el criterio del analista. Datos incompletos o mal tomados dan resultados equivocados aunque la fórmula sea correcta.

3. **Son información de apoyo, no decisiones.** Los resultados (incluidos el cálculo de personal, el GAP de plantilla y las eficiencias) ayudan a analizar un proceso. **No son una recomendación** de contratar, despedir, sancionar, reubicar ni cambiar las condiciones de trabajo de ninguna persona.

4. **Decide una persona.** Cualquier decisión que afecte a trabajadores debe tomarla una persona de la empresa, revisando los datos, el contexto de la planta y cumpliendo la Ley Federal del Trabajo, el contrato colectivo y el reglamento interior aplicables. Los trabajadores pueden oponerse a decisiones basadas únicamente en tratamientos automatizados que los afecten significativamente.

5. **Verificamos, pero no garantizamos.** Takt verifica sus cálculos con pruebas automáticas antes de cada versión. Aun así, puede haber errores; si encuentras uno, repórtalo a **[CORREO DE SOPORTE]**. La responsabilidad de Takt por los resultados se rige por los Términos y condiciones.

## B. Versión en pantalla (debajo de los resultados de Cálculo de personal, Eficiencia compuesta y Takt y balanceo)

> **Resultados de apoyo.** Calculados con métodos estándar de ingeniería industrial a partir de los datos capturados. No son una recomendación sobre personas: las decisiones las revisa y toma la empresa. [Más información](#)

## C. Pie de los reportes PDF (una línea, letra pequeña)

> Calculado con Takt mediante métodos estándar de ingeniería industrial a partir de los datos capturados por la empresa. Resultados de apoyo; las decisiones son responsabilidad de la empresa.

---

## Dónde va cada versión (para cuando se construya)

| Lugar | Versión | Comentario |
|---|---|---|
| Configuración → Legal | A | Con fecha de versión |
| Resultados de Cálculo de personal, Eficiencia compuesta, Takt y balanceo, tablero de Inicio (GAP) | B | Son las pantallas con más riesgo de usarse para decidir sobre plantilla |
| Resto de los estudios | Ninguna o solo C en el PDF | Para no saturar; un aviso en todas partes deja de leerse |
| Pie de **todos** los PDF | C | El PDF es lo que circula en la empresa sin la app |

## Notas para Angel

- **Por qué no ponerlo en todas las pantallas.** Un aviso que aparece en todos lados se vuelve ruido y nadie lo lee; uno en los lugares donde de verdad se decide sobre personas sí cumple su función y luce profesional.
- **El PDF es lo importante.** El reporte sale de la app y llega a gerencia o a RH sin contexto. Por eso el pie va en todos.
- **El punto 1 refuerza tu decisión** de no publicar estándares de tiempo propios: deja claro que los tiempos y suplementos los pone la empresa.
- En la app el texto debe pasar por `i18n/*.txt` como todo lo demás; la versión en inglés del aviso se fija después de la revisión del abogado.

## Pendiente de confirmar con abogado

1. Si el pie de PDF es suficiente o conviene más visible en Cálculo de personal.
2. Redacción del punto 4 frente al art. 26 LFPDPPP (el derecho es del trabajador frente a su empresa, no frente a Takt).
3. Si conviene que el cliente marque «leí el aviso» la primera vez que use Cálculo de personal.
