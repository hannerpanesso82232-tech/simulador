# ⚡ Simulador de Equilibrio Electrostático Pro

Un laboratorio virtual interactivo construido con Vanilla JavaScript para calcular, visualizar y aprender sobre la dinámica de fuerzas en partículas con carga eléctrica suspendidas en campos eléctricos uniformes.

![Estado del Proyecto](https://img.shields.io/badge/Estado-Completado-success)
![Tecnologías](https://img.shields.io/badge/Tecnologías-HTML5%20|%20CSS3%20|%20JS-blue)

## 🎯 Características Principales

* **🧠 Motor Físico en Cascada:** No se limita a una sola fórmula. Ingresa *cualquier* combinación de 3 parámetros (ej. Tensión, Ángulo y Carga) y el sistema deducirá el resto automáticamente.
* **👨‍🏫 Modo Profesor (Paso a Paso):** No solo da el resultado final. La terminal integrada muestra el desglose matemático completo con fórmulas, sustituciones numéricas y despejes.
* **🖱️ Interactividad Drag & Drop:** Arrastra la partícula directamente en el lienzo (Canvas) con el mouse o desde una pantalla táctil para cambiar el ángulo en tiempo real.
* **🎨 Diseño Responsivo & Modo Oscuro:** Interfaz moderna que se adapta perfectamente a pantallas de PC, tablets y teléfonos celulares. Incluye un interruptor de Modo Oscuro nativo.
* **📏 Conversión de Unidades Inteligente:** Soporte nativo para microcoulombs (µC), nanocoulombs (nC), gramos (g), kiloNewtons por Coulomb (kN/C), etc.

## 🛠️ Tecnologías Utilizadas

Este proyecto fue desarrollado íntegramente con tecnologías web nativas, sin depender de librerías o frameworks externos para maximizar el rendimiento:
* **HTML5:** Estructura semántica.
* **CSS3:** Flexbox, CSS Grid, Media Queries y variables nativas para el cambio de temas.
* **Vanilla JavaScript (ES6+):** Lógica matemática, manipulación del DOM y renderizado gráfico mediante la API de `<canvas>`.

## 🚀 Cómo usar el simulador

1. **Ingresa los datos:** Dirígete al panel izquierdo y llena al menos 3 campos (pueden ser Datos Base o Dinámica de Fuerzas).
2. **Calcula:** Presiona el botón "Resolver".
3. **Analiza:** Observa el Diagrama de Cuerpo Libre (DCL) generado dinámicamente, lee el paso a paso matemático en la consola y revisa el historial de la parte inferior.
4. **Interactúa:** Toca y arrastra la esfera para ver cómo cambian las fuerzas en tiempo real. Cruzar el eje vertical invertirá el signo de la carga automáticamente.

## 👨‍💻 Desarrollador
Creado por **[HANNER MAURICIO PANESSO QUEJADA/JUDAS]** como herramienta educativa para el estudio del electromagnetismo y la física clásica.
