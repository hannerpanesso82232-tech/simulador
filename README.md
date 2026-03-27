# ⚛️ Laboratorio de Física Pro: Simulador Multi-Física

Una plataforma educativa interactiva construida con Vanilla JavaScript para simular, visualizar y aprender sobre diferentes fenómenos físicos en tiempo real. 

![Estado del Proyecto](https://img.shields.io/badge/Estado-Activo-success)
![Tecnologías](https://img.shields.io/badge/Tecnologías-HTML5%20|%20CSS3%20|%20JS-blue)
![Módulos](https://img.shields.io/badge/Módulos-Electrostática%20|%20Cinemática-ff69b4)

## 🌟 Características de la Plataforma

Este laboratorio cuenta con una arquitectura de **Layout Dinámico**, permitiendo al usuario alternar entre diferentes ramas de la física desde un único panel central sin recargar la página.

### ⚡ Módulo 1: Equilibrio Electrostático
Simula una partícula cargada suspendida en un campo eléctrico uniforme.
* **Motor en Cascada:** Ingresa cualquier combinación de 3 parámetros (Masa, Ángulo, Campo, Carga, Tensión, Fuerza) y el sistema deducirá el resto.
* **Interactividad Drag & Drop:** Arrastra la partícula con el mouse o dedo. El sistema recalcula el ángulo y detecta inversiones de polaridad automáticamente.
* **Modo Profesor:** Consola integrada que muestra el paso a paso matemático (fórmulas, sustituciones y resultados) de cada deducción.

### 🚀 Módulo 2: Cinemática (Tiro Parabólico)
Analiza el movimiento de proyectiles en dos dimensiones.
* **Cálculo Automático:** Determina el tiempo de vuelo, la altura máxima (Hmax) y el alcance máximo (Rmax) a partir de la velocidad inicial, el ángulo y la gravedad.
* **Animación en Tiempo Real:** Renderizado del vuelo del proyectil utilizando `requestAnimationFrame`.
* **Vectores Dinámicos:** Visualización en vivo de los componentes de la velocidad (Vx constante en verde, Vy variable en rojo y V-total en azul) mientras la partícula viaja.

### ✨ Funciones Globales
* **Modo Oscuro Nativo:** Interfaz adaptable con paleta de colores de alto contraste.
* **Diseño Responsivo:** Optimizado para funcionar perfectamente en PC, tablets y dispositivos móviles.
* **Historial Inteligente:** Tabla de registros que formatea los datos automáticamente (notación científica dinámica) para ahorrar espacio en pantallas pequeñas.
* **UI/UX Personalizada:** Sistema propio de notificaciones animadas y ventanas modales (sin usar los molestos `alert` o `confirm` del navegador).

## 🛠️ Tecnologías Utilizadas

Desarrollado con tecnologías web nativas para garantizar el máximo rendimiento y compatibilidad:
* **HTML5:** Estructura semántica modular.
* **CSS3:** Flexbox, CSS Grid, variables nativas para temas y Media Queries.
* **Vanilla JavaScript (ES6+):** Lógica de física, controladores de estado (Theme Manager) y renderizado gráfico fluido mediante la API de `<canvas>`.

## 🚀 Cómo empezar

1. Abre el simulador en tu navegador web.
2. Utiliza el selector superior para elegir la rama de la física que deseas explorar.
3. Ingresa los parámetros en el panel izquierdo.
4. Presiona **Resolver** o **Lanzar** para iniciar el motor físico y disfrutar de la simulación gráfica y matemática.

## 👨‍💻 Desarrollador
Creado por **[HANNER MAURICIO PANESSO QUEJADA/JUDAS]** combinando la pasión por la ingeniería de software y la física.
