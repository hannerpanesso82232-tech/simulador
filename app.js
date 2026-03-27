/**
 * SIMULADOR DE FÍSICA PRO (Multi-Tema)
 * Patrón de Diseño: Layout Dinámico y Controlador de Estado
 * Módulos: 1. Core & UI, 2. Electrostática, 3. Cinemática
 */

const g = 9.8;
let estadoSimulador = {
    tema: 'electrostatics', // 'electrostatics' or 'kinematics'
    darkMode: false,
    animacionActiva: null // ID de requestAnimationFrame para cinemática
};

// Variables globales para la electrostática
let partX = 0; let partY = 0; let isDragging = false; let draggedOnce = false;
let ultimaVariableCalculada = 'carga'; 

// =========================================================
// MÓDULO 1: UTILIDADES & UI (CONTROLADOR DE TEMAS)
// =========================================================

function leerInputConUnidad(idInput, idSelect) {
    const el = document.getElementById(idInput);
    if (!el || el.value === "") return undefined;
    const mult = (idSelect && document.getElementById(idSelect)) ? parseFloat(document.getElementById(idSelect).value) : 1;
    return parseFloat(el.value) * mult;
}

function formatearNumero(num) {
    if (num === 0) return "0";
    if (Math.abs(num) < 0.001 || Math.abs(num) >= 10000) return num.toExponential(2);
    return parseFloat(num.toPrecision(4)).toString(); 
}

// --- NUEVO: CONTROLADOR DE CAMBIO DE TEMA ---
function inicializarSelectorTemas() {
    const selector = document.getElementById('selector-temas');
    if (!selector) return;

    selector.addEventListener('change', function() {
        cambiarTema(this.value);
    });
}

function cambiarTema(nuevoTema) {
    // 1. Detener cualquier animación en curso
    if (estadoSimulador.animacionActiva) {
        cancelAnimationFrame(estadoSimulador.animacionActiva);
        estadoSimulador.animacionActiva = null;
    }
    
    estadoSimulador.tema = nuevoTema;
    limpiarTodo(); // Limpia inputs, canvas, consola y DCL Drag

    // Ocultar todos los paneles de inputs
    ['electrostatics', 'kinematics'].forEach(t => {
        document.getElementById(`panel-inputs-${t}`).style.display = 'none';
    });
    // Ocultar panel de ejemplos estáticos si no es electrostática
    document.getElementById('panel-ejemplos-estatico').style.display = (nuevoTema === 'electrostatics') ? 'block' : 'none';

    // Mostrar el panel de inputs correcto
    document.getElementById(`panel-inputs-${nuevoTema}`).style.display = 'block';

    // Actualizar títulos
    document.getElementById('consola-pasos').innerText = "Selecciona un tema y dale a resolver...";
    if (nuevoTema === 'electrostatics') {
        document.getElementById('titulo-grafico').innerText = "⚛️ Diagrama de Equilibrio";
    } else {
        document.getElementById('titulo-grafico').innerText = "🚀 Trayectoria de Proyectiles";
    }
    mostrarNotificacion(`Cambiado al modo de ${nuevoTema === 'electrostatics' ? 'Electrostática' : 'Cinemática'}`, 'info');
}
// --------------------------------------------------------

function inicializarConvertidores() {
    const selects = document.querySelectorAll('select[id^="unidad-"]');
    selects.forEach(select => {
        select.dataset.oldMult = select.value;
        select.addEventListener('change', function() {
            const inputId = this.id.replace('unidad-', '');
            const inputEl = document.getElementById(inputId);
            if (inputEl && inputEl.value !== "") {
                const oldMult = parseFloat(this.dataset.oldMult);
                const newMult = parseFloat(this.value);
                const valActual = parseFloat(inputEl.value);
                const valNuevo = (valActual * oldMult) / newMult;
                inputEl.value = parseFloat(valNuevo.toPrecision(5));
            }
            this.dataset.oldMult = this.value;
            if(estadoSimulador.tema === 'electrostatics' && partX !== 0) ejecutarSimulacionElectrostatics(true); 
        });
    });
}

// =========================================================
// MÓDULO 2: ELECTROSTÁTICA (TU CÓDIGO VIEJO REORGANIZADO)
// =========================================================

function ejecutarSimulacionElectrostatics(esArrastre = false) {
    let registro = ["=== PROCEDIMIENTO MATEMÁTICO ==="];
    let bloquePrincipal = [];
    let logSet = new Set(); 

    function addStep(titulo, formula, sustitucion, resultado) {
        let key = titulo; 
        if (!logSet.has(key) && !esArrastre) {
            logSet.add(key);
            bloquePrincipal.push(`\n> ${titulo}`);
            if(formula) bloquePrincipal.push(`  Fórmula: ${formula}`);
            if(sustitucion) bloquePrincipal.push(`  Sustitución: ${sustitucion}`);
            bloquePrincipal.push(`  Resultado: ${resultado}`);
        }
    }

    let m = leerInputConUnidad('masa', 'unidad-masa');
    let theta = leerInputConUnidad('angulo', null);
    let E = leerInputConUnidad('campo', 'unidad-campo');
    let q = leerInputConUnidad('carga', 'unidad-carga');
    let T = leerInputConUnidad('tension', null);
    let W, Fe;

    let conteoInputs = [m, theta, E, q, T].filter(v => v !== undefined).length;
    if (conteoInputs < 3 && !esArrastre) {
        mostrarNotificacion(`Faltan datos. Ingresa al menos 3 parámetros.`, 'error');
        return;
    }

    try {
        if (theta !== undefined && theta >= 90) throw new Error("Ángulo ≥ 90° es físicamente imposible.");
        for (let i = 0; i < 3; i++) {
            if (m !== undefined && W === undefined) { 
                W = m * g; 
                addStep("Calculando Peso (W)", "W = m · g", `W = ${m.toPrecision(4)} · 9.8`, `W = ${W.toPrecision(4)} N`); 
            }
            if (W !== undefined && m === undefined) { 
                m = W / g; 
                addStep("Calculando Masa (m)", "m = W / g", `m = ${W.toPrecision(4)} / 9.8`, `m = ${m.toPrecision(4)} kg`); 
            }
            if (theta !== undefined && W !== undefined) {
                if (Fe === undefined) { Fe = W * Math.tan(theta * Math.PI/180); addStep("Calculando Fuerza Eléctrica (Fe)", "Fe = W · tan(θ)", `Fe = ${W.toPrecision(4)} · tan(${theta}°)`, `Fe = ${Fe.toPrecision(4)} N`); }
                if (T === undefined) { T = W / Math.cos(theta * Math.PI/180); addStep("Calculando Tensión (T)", "T = W / cos(θ)", `T = ${W.toPrecision(4)} / cos(${theta}°)`, `T = ${T.toPrecision(4)} N`); }
            }
            if (theta !== undefined && Fe !== undefined) {
                if (W === undefined) { W = Fe / Math.tan(theta * Math.PI/180); addStep("Calculando Peso (W)", "W = Fe / tan(θ)", `W = ${Fe.toPrecision(4)} / tan(${theta}°)`, `W = ${W.toPrecision(4)} N`); }
                if (T === undefined) { T = Fe / Math.sin(theta * Math.PI/180); addStep("Calculando Tensión (T)", "T = Fe / sin(θ)", `T = ${Fe.toPrecision(4)} / sin(${theta}°)`, `T = ${T.toPrecision(4)} N`); }
            }
            if (W !== undefined && Fe !== undefined) {
                if (T === undefined) { T = Math.sqrt(W*W + Fe*Fe); addStep("Calculando Tensión (T)", "T = √(W² + Fe²)", `√(${W.toPrecision(4)}² + ${Fe.toPrecision(4)}²)`, `T = ${T.toPrecision(4)} N`); }
                if (theta === undefined) { theta = Math.atan2(Fe, W) * 180/Math.PI; addStep("Calculando Ángulo (θ)", "θ = arctan(Fe/W)", `arctan(${Fe.toPrecision(4)} / ${W.toPrecision(4)})`, `θ = ${theta.toPrecision(4)}°`); }
            }
            if (T !== undefined && W !== undefined && theta === undefined) {
                Fe = Math.sqrt(T*T - W*W); theta = Math.acos(W/T) * 180/Math.PI;
                addStep("Calculando Ángulo (θ)", "θ = arccos(W/T)", `arccos(${W.toPrecision(4)} / ${T.toPrecision(4)})`, `θ = ${theta.toPrecision(4)}°`);
            }
            if (Fe !== undefined && q !== undefined && E === undefined) {
                if (q === 0) throw new Error("La carga no puede ser cero.");
                E = (q < 0) ? - (Fe / Math.abs(q)) : (Fe / Math.abs(q));
                addStep("Calculando Campo Eléctrico (E)", "E = Fe / q", `E = ${Fe.toPrecision(4)} / ${q.toExponential(3)}`, `E = ${E.toPrecision(5)} N/C`);
            }
            if (Fe !== undefined && E !== undefined && q === undefined) {
                if (E === 0) throw new Error("El campo no puede ser cero.");
                q = Fe / E; 
                addStep("Calculando Carga (q)", "q = Fe / E", `q = ${Fe.toPrecision(4)} / ${E.toExponential(3)}`, `q = ${q.toExponential(4)} C`);
            }
            if (q !== undefined && E !== undefined && Fe === undefined) {
                Fe = Math.abs(q * E); 
                addStep("Calculando Fuerza Eléctrica (Fe)", "Fe = |q · E|", `|${q.toExponential(3)} · ${E.toExponential(3)}|`, `Fe = ${Fe.toPrecision(4)} N`);
            }
        }
    } catch (error) {
        if (!esArrastre) mostrarNotificacion(error.message, 'error');
        document.getElementById('consola-pasos').innerText = "❌ Error: " + error.message; return;
    }

    if(document.getElementById('masa') && m !== undefined) document.getElementById('masa').value = parseFloat((m / parseFloat(document.getElementById('unidad-masa').value)).toPrecision(5));
    if(document.getElementById('angulo') && theta !== undefined) document.getElementById('angulo').value = parseFloat(theta.toPrecision(5));
    if(document.getElementById('campo') && E !== undefined) document.getElementById('campo').value = parseFloat((E / parseFloat(document.getElementById('unidad-campo').value)).toPrecision(5));
    if(document.getElementById('carga') && q !== undefined) document.getElementById('carga').value = parseFloat((q / parseFloat(document.getElementById('unidad-carga').value)).toPrecision(5));
    if(document.getElementById('tension') && T !== undefined) document.getElementById('tension').value = parseFloat(T.toPrecision(5));

    if (!esArrastre) {
        registro = registro.concat(bloquePrincipal);
        document.getElementById('consola-pasos').innerText = registro.join('\n');
    }

    dibujarDCL(theta, q, E, W, T, Fe, m);
    if (!esArrastre) agregarHistorial('Electrostática', m, theta, E, q, T, Fe);
}

function dibujarDCL(theta, q, E, wVal, tVal, feVal, mVal) {
    const canvas = document.getElementById('lienzo');
    const ctx = canvas.getContext('2d');
    const wrapper = canvas.parentElement;
    canvas.width = wrapper.clientWidth; canvas.height = window.innerWidth >= 768 ? 450 : Math.max(wrapper.clientWidth * 0.75, 280); 
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const origenX = canvas.width / 2; const origenY = 40; const longitudCuerda = canvas.height * 0.55; 
    const direccionDesvio = (q * E >= 0) ? 1 : -1;
    const thetaRad = theta * (Math.PI / 180) * direccionDesvio;
    const px = origenX + longitudCuerda * Math.sin(thetaRad);
    const py = origenY + longitudCuerda * Math.cos(thetaRad);
    partX = px; partY = py;

    // Placas
    ctx.fillStyle = E >= 0 ? 'rgba(220, 53, 69, 0.12)' : 'rgba(0, 86, 179, 0.12)'; ctx.fillRect(0, 0, 25, canvas.height);
    ctx.fillStyle = E >= 0 ? 'rgba(0, 86, 179, 0.12)' : 'rgba(220, 53, 69, 0.12)'; ctx.fillRect(canvas.width - 25, 0, 25, canvas.height);
    
    // Eje vertical y Arco
    ctx.setLineDash([5, 5]); ctx.strokeStyle = (document.body.getAttribute('data-theme') === 'dark') ? '#555' : '#aaa'; 
    ctx.beginPath(); ctx.moveTo(origenX, origenY); ctx.lineTo(origenX, canvas.height - 15); ctx.stroke();
    if (Math.abs(theta) > 1) {
        ctx.beginPath(); let startAngle, endAngle, anticlockwise;
        if (direccionDesvio === 1) { startAngle = Math.PI / 2 - thetaRad; endAngle = Math.PI / 2; anticlockwise = false;
        } else { startAngle = Math.PI / 2; endAngle = Math.PI / 2 - thetaRad; anticlockwise = true; }
        ctx.arc(origenX, origenY, 50, startAngle, endAngle, anticlockwise);
        ctx.strokeStyle = '#007bff'; ctx.lineWidth = 2; ctx.stroke();
        dibujarTextoFondo(ctx, `θ = ${theta.toFixed(1)}°`, origenX + (direccionDesvio * 20), origenY + 65, '#007bff');
    }
    ctx.setLineDash([]);

    // Techo y Cuerda
    ctx.strokeStyle = '#aaa'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(origenX - 50, origenY); ctx.lineTo(origenX + 50, origenY); ctx.stroke();
    ctx.lineWidth = 2; ctx.strokeStyle = (document.body.getAttribute('data-theme') === 'dark') ? '#fff' : '#000';
    ctx.beginPath(); ctx.moveTo(origenX, origenY); ctx.lineTo(px, py); ctx.stroke();

    // Vectores
    const vecScale = canvas.height / 350;
    dibujarFlecha(ctx, px, py, origenX, origenY, '#007bff', `T=${tVal.toPrecision(3)}N`, vecScale);
    dibujarFlecha(ctx, px, py, px, py + 60 * vecScale, '#28a745', `W=${wVal.toPrecision(3)}N`, vecScale);
    dibujarFlecha(ctx, px, py, px + (70 * vecScale * direccionDesvio), py, '#dc3545', `Fe=${feVal.toPrecision(3)}N`, vecScale);

    // Partícula y Textos
    ctx.beginPath(); ctx.arc(px, py, 18, 0, Math.PI * 2);
    ctx.fillStyle = q >= 0 ? '#ff5722' : '#3f51b5'; ctx.fill();
    ctx.fillStyle = 'white'; ctx.textAlign = 'center'; ctx.font = "bold 11px Arial";
    let qMostrar = (q / parseFloat(document.getElementById('unidad-carga').value)).toPrecision(3);
    ctx.fillText(`${q > 0 ? '+' : ''}${qMostrar} ${document.getElementById('unidad-carga').options[document.getElementById('unidad-carga').selectedIndex].text}`, px, py + 4);
    
    let mMostrar = (mVal / parseFloat(document.getElementById('unidad-masa').value)).toPrecision(3);
    ctx.fillStyle = (document.body.getAttribute('data-theme') === 'dark') ? '#ccc' : '#555';
    ctx.font = "bold 12px Arial"; ctx.fillText(`m = ${mMostrar} ${document.getElementById('unidad-masa').options[document.getElementById('unidad-masa').selectedIndex].text}`, px, py + 35);
}

// =========================================================
// MÓDULO 3: CINEMÁTICA (TIRO PARABÓLICO)
// =========================================================

function ejecutarSimulacionKinematics() {
    let registro = ["=== ANÁLISIS DEL MOVIMIENTO PROYECTIL ==="];
    
    let v0 = leerInputConUnidad('v0_k', 'unidad-v0_k');
    let theta_deg = leerInputConUnidad('angulo_k', null);
    let gk = leerInputConUnidad('g_k', null);
    let ax = leerInputConUnidad('ax_k', null);

    if (v0 === undefined || theta_deg === undefined || gk === undefined) {
        mostrarNotificacion(`Ingresa v₀, Ángulo y Gravedad.`, 'error'); return;
    }
    if (v0 <= 0 || gk <= 0) throw new Error("Valores de v₀ y g deben ser positivos.");

    let theta_rad = theta_deg * (Math.PI / 180);
    
    // 1. Componentes de la Velocidad Inicial
    let v0x = v0 * Math.cos(theta_rad);
    let v0y = v0 * Math.sin(theta_rad);
    registro.push(`\n> Componentes v₀:`);
    registro.push(`  v₀ₓ = ${v0} · cos(${theta_deg}°) = ${v0x.toFixed(2)} m/s`);
    registro.push(`  v₀ᵧ = ${v0} · sin(${theta_deg}°) = ${v0y.toFixed(2)} m/s`);

    // 2. Cálculos Clave (Eje Y Vertical - MRUV)
    let t_Hmax = v0y / gk;
    let Hmax = (v0y * v0y) / (2 * gk);
    let t_flight = 2 * t_Hmax;
    
    registro.push(`\n> Resultados Eje Vertical (Y):`);
    registro.push(`  Tiempo a Hmax: t = v₀ᵧ/g = ${t_Hmax.toFixed(2)} s`);
    registro.push(`  Altura Máxima (Hmax): H = (v₀ᵧ)²/(2g) = ${Hmax.toFixed(2)} m`);
    registro.push(`  Tiempo Total Vuelo: t = 2·t_Hmax = ${t_flight.toFixed(2)} s`);

    // 3. Cálculos Clave (Eje X Horizontal - MRUV si hay aₓ, MRU si aₓ=0)
    let Rmax = (v0x * t_flight) + (0.5 * ax * t_flight * t_flight);
    registro.push(`\n> Resultados Eje Horizontal (X):`);
    registro.push(`  Alcance Máximo (R): x = v₀ₓ·t + ½aₓt² = ${Rmax.toFixed(2)} m`);
    
    document.getElementById('consola-pasos').innerText = registro.join('\n');
    
    // Dibujar y Animación
    iniciarAnimacionKinematics(v0x, v0y, ax, gk, t_flight, Rmax, Hmax);
    agregarHistorial('Proyectil', undefined, theta_deg, undefined, undefined, undefined, undefined, v0);
}

// --- NUEVO: MOTOR DE ANIMACIÓN PARA CINEMÁTICA ---
function iniciarAnimacionKinematics(v0x, v0y, ax, gy, t_flight, Rmax, Hmax) {
    const canvas = document.getElementById('lienzo');
    const ctx = canvas.getContext('2d');
    
    // Detenemos la animación anterior si existe
    if (estadoSimulador.animacionActiva) cancelAnimationFrame(estadoSimulador.animacionActiva);
    
    let startTime = DateOfNow();
    
    // Escala dinámica profesional (55% del alto para Hmax)
    let scaleY = (canvas.height * 0.55) / (Hmax > 0.1 ? Hmax : 1); 
    let scaleX = scaleY; // Escala isométrica
    
    // Si el alcance máximo es muy grande, escalamos por X para que quepa todo
    if (Rmax * scaleX > canvas.width * 0.8) {
        scaleX = (canvas.width * 0.8) / Rmax;
        scaleY = scaleX;
    }

    // Offset de dibujo (origen en la esquina inferior izquierda con margen)
    const offsetX = canvas.width * 0.1;
    const offsetY = canvas.height * 0.8;

    function animar() {
        // Tiempo transcurrido en segundos de simulación (velocidad real o 1.5x)
        let elapsed_sec = (DateOfNow() - startTime) / 1000 * 1.5; 
        
        // Detener animación al completar el vuelo
        if (elapsed_sec > t_flight) {
            elapsed_sec = t_flight; // Mostramos el estado final
            estadoSimulador.animacionActiva = null; 
        } else {
            estadoSimulador.animacionActiva = requestAnimationFrame(animar);
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Dibujo de Fondo (Suelo)
        dibujarSuelo(ctx, canvas, isDarkMode());

        // Fórmulas principales de movimiento
        let cur_x = (v0x * elapsed_sec) + (0.5 * ax * elapsed_sec * elapsed_sec);
        let cur_y = (v0y * elapsed_sec) - (0.5 * gy * elapsed_sec * elapsed_sec);
        let cur_vx = v0x + (ax * elapsed_sec);
        let cur_vy = v0y - (gy * elapsed_sec);
        let cur_v = Math.sqrt(cur_vx*cur_vx + cur_vy*cur_vy);

        // Coordenadas de Canvas
        let px = offsetX + (cur_x * scaleX);
        let py = offsetY - (cur_y * scaleY);

        // --- RENDERIZADO VISUAL PRO ---
        // 1. Trayectoria completa (Punteada)
        ctx.beginPath(); ctx.lineWidth = 1; ctx.strokeStyle = isDarkMode() ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'; ctx.setLineDash([5, 5]);
        for (let t = 0; t <= t_flight; t += t_flight/50) {
            let path_x = offsetX + ((v0x * t) + (0.5 * ax * t * t)) * scaleX;
            let path_y = offsetY - ((v0y * t) - (0.5 * gy * t * t)) * scaleY;
            t === 0 ? ctx.moveTo(path_x, path_y) : ctx.lineTo(path_x, path_y);
        }
        ctx.stroke(); ctx.setLineDash([]);

        // 2. Vectores de Fuerza Dinámicos
        const vecS = canvas.height / 350;
        const sF = 5; // Factor de escala para vectores
        dibujarFlecha(ctx, px, py, px + cur_vx * vecS * sF * scaleX/scaleY, py, '#success', '', vecS); // Vx Verde
        dibujarFlecha(ctx, px, py, px, py - cur_vy * vecS * sF, '#danger', '', vecS); // Vy Roja
        dibujarFlecha(ctx, px, py, px + cur_vx * vecS * sF * scaleX/scaleY, py - cur_vy * vecS * sF, '#007bff', '', vecS); // V Total Azul

        // 3. La Partícula
        ctx.beginPath(); ctx.arc(px, py, 12, 0, Math.PI * 2); ctx.fillStyle = '#ff6b6b'; ctx.shadowBlur = 10; ctx.shadowColor = '#ff6b6b'; ctx.fill(); 
        ctx.shadowBlur = 0; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
        
        // 4. Texto de Estado Live (Sigue a la bola)
        dibujarTextoLive(ctx, `t: ${elapsed_sec.toFixed(2)}s | x: ${cur_x.toFixed(1)}m | y: ${cur_y.toFixed(1)}m`, px, py - 25);
        dibujarTextoLive(ctx, `|V|: ${cur_v.toFixed(1)}m/s`, px + 30, py + 30);
    }
    animar();
}
// -----------------------------------------------------

// =========================================================
// MÓDULO 4: UI COMÚN & HISTORIAL (REORGANIZADO)
// =========================================================

function dibujarSuelo(ctx, canvas, darkMode) {
    ctx.strokeStyle = darkMode ? '#444' : '#ccc'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(canvas.width * 0.05, canvas.height * 0.8); ctx.lineTo(canvas.width * 0.95, canvas.height * 0.8); ctx.stroke();
}
function dibujarTextoLive(ctx, txt, x, y) {
    ctx.font = "bold 11px Arial"; ctx.fillStyle = isDarkMode() ? '#fff' : '#333'; ctx.textAlign = 'left'; ctx.fillText(txt, x, y);
}
function isDarkMode() { return document.body.getAttribute('data-theme') === 'dark'; }
function DateOfNow() { return new Date().getTime(); }

// --- HISTORIAL ADAPTADO (MULTI-TEMA) ---
function agregarHistorial(tipo, m, theta, E, q, T, Fe, v0) {
    const tableBody = document.querySelector('#tabla-resultados tbody');
    if (!tableBody) return;
    const row = tableBody.insertRow(0);
    row.style.animation = "fadeIn 0.4s ease-out";
    row.innerHTML = `
        <td>${tipo}</td>
        <td>${m !== undefined ? m.toFixed(4) : '-'}</td>
        <td>${theta !== undefined ? theta.toFixed(1) + '°' : '-'}</td>
        <td>${v0 !== undefined ? v0.toFixed(2) : '-'}</td>
        <td>${E !== undefined ? E.toFixed(0) : '-'}</td>
        <td>${q !== undefined ? q.toExponential(2) : '-'}</td>
        <td>${T !== undefined ? T.toFixed(4) : '-'}</td>
        <td>${Fe !== undefined ? Fe.toFixed(4) : '-'}</td>
    `;
    if (window.innerWidth < 768 && tableBody.rows.length > 5) tableBody.deleteRow(5);
}

// =========================================================
// MÓDULO 5: ELECTORSTÁTICA INTERACTIVA (TU VIEJO DRAG & DROP)
// =========================================================

function inicializarEventosDrag() {
    const canvas = document.getElementById('lienzo');
    function obtenerPos(e) { let rect = canvas.getBoundingClientRect(); let evt = e.touches ? e.touches[0] : e; if (!evt) return null; return { x: (evt.clientX - rect.left) * (canvas.width / rect.width), y: (evt.clientY - rect.top) * (canvas.height / rect.height) }; }
    function alPresionar(e) {
        if (estadoSimulador.tema !== 'electrostatics') return; // Bloquea el drag si no es electrostática
        let pos = obtenerPos(e); if (!pos) return;
        if (Math.hypot(pos.x - partX, pos.y - partY) < 35) { isDragging = true; draggedOnce = false; canvas.style.cursor = 'grabbing'; if (ultimaVariableCalculada === 'angulo' || !ultimaVariableCalculada) ultimaVariableCalculada = 'carga'; if (e.type === 'touchstart') e.preventDefault(); }
    }
    function alMover(e) {
        if (estadoSimulador.tema !== 'electrostatics' || !isDragging) { if (estadoSimulador.tema === 'electrostatics') { let pos = obtenerPos(e); if (pos) canvas.style.cursor = Math.hypot(pos.x - partX, pos.y - partY) < 35 ? 'grab' : 'default'; } return; }
        if (e.type === 'touchmove') e.preventDefault(); draggedOnce = true;
        let pos = obtenerPos(e); if (!pos) return;
        let origenX = canvas.width / 2; let origenY = 40; let dx = pos.x - origenX; let dy = pos.y - origenY;
        let newTheta = Math.atan2(Math.abs(dx), dy) * (180 / Math.PI);
        if (newTheta < 0) newTheta = 0; if (newTheta > 85) newTheta = 85; 
        document.getElementById('angulo').value = newTheta.toFixed(2);
        
        let E = leerInputConUnidad('campo', 'unidad-campo'); let qEl = document.getElementById('carga');
        if (qEl && qEl.value !== "") { let qActual = parseFloat(qEl.value); if ((dx < 0 && E > 0) || (dx > 0 && E < 0)) { if (qActual > 0) qEl.value = -Math.abs(qActual); } else { if (qActual < 0) qEl.value = Math.abs(qActual); } }
        if(document.getElementById(ultimaVariableCalculada)) document.getElementById(ultimaVariableCalculada).value = "";
        ejecutarSimulacionElectrostatics(true); 
    }
    function alSoltar(e) { if (isDragging) { isDragging = false; canvas.style.cursor = 'grab'; if (draggedOnce) { if(document.getElementById(ultimaVariableCalculada)) document.getElementById(ultimaVariableCalculada).value = ""; ejecutarSimulacionElectrostatics(false); } } }
    canvas.addEventListener('mousedown', alPresionar); canvas.addEventListener('mousemove', alMover); window.addEventListener('mouseup', alSoltar); canvas.addEventListener('touchstart', alPresionar, {passive: false}); canvas.addEventListener('touchmove', alMover, {passive: false}); window.addEventListener('touchend', alSoltar);
}

//==========================================================
// MÓDULO COMÚN: DIBUJO DE FLECHAS, NOTIFACIONES Y DARK MODE
//==========================================================

function dibujarTextoFondo(ctx, txt, x, y, color) { ctx.font = "bold 12px Arial"; let isDark = document.body.getAttribute('data-theme') === 'dark'; ctx.fillStyle = isDark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.8)'; let met = ctx.measureText(txt); ctx.fillRect(x - met.width/2 - 2, y - 10, met.width + 4, 14); ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.fillText(txt, x, y); }
function dibujarFlecha(ctx, x1, y1, x2, y2, color, txt, scale=1) { let ang = Math.atan2(y2 - y1, x2 - x1); ctx.strokeStyle = ctx.fillStyle = color; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x2, y2); let arrowSize = 10 * scale; ctx.lineTo(x2 - arrowSize * Math.cos(ang - Math.PI / 6), y2 - arrowSize * Math.sin(ang - Math.PI / 6)); ctx.lineTo(x2 - arrowSize * Math.cos(ang + Math.PI / 6), y2 - arrowSize * Math.sin(ang + Math.PI / 6)); ctx.fill(); if (txt) { let offsetX = x2 > x1 ? 25*scale : (x2 < x1 ? -25*scale : 0); let offsetY = y2 > y1 ? 15*scale : (y2 < y1 ? -12*scale : -8*scale); dibujarTextoFondo(ctx, txt, x2 + offsetX, y2 + offsetY, color); } }

function limpiarTodo() {
    if (estadoSimulador.tema === 'electrostatics') {
        ['masa', 'angulo', 'campo', 'carga', 'tension'].forEach(id => { if(document.getElementById(id)) document.getElementById(id).value = ""; });
    } else {
        ['v0_k', 'angulo_k'].forEach(id => { if(document.getElementById(id)) document.getElementById(id).value = ""; });
    }
    document.getElementById('consola-pasos').innerText = "Esperando datos...";
    if (estadoSimulador.animacionActiva) cancelAnimationFrame(estadoSimulador.animacionActiva);
    document.getElementById('lienzo').getContext('2d').clearRect(0, 0, document.getElementById('lienzo').width, document.getElementById('lienzo').height);
    partX = 0; partY = 0; 
}
function mostrarNotificacion(mensaje, tipo = 'info') { const container = document.getElementById('notificacion-container'); if (!container) return; const notif = document.createElement('div'); notif.className = `notificacion ${tipo}`; const icono = tipo === 'error' ? '⚠️' : 'ℹ️'; notif.innerHTML = `<div class="notificacion-body"><span class="notificacion-icon">${icono}</span><span class="notificacion-text" style="line-height:1.4;">${mensaje}</span></div>`; container.appendChild(notif); const timer = setTimeout(() => cerrarNotificacion(notif), 5000); notif.addEventListener('click', () => { clearTimeout(timer); cerrarNotificacion(notif); }); }
function cerrarNotificacion(elemento) { elemento.classList.add('ocultar'); elemento.addEventListener('animationend', () => elemento.remove()); }

function inicializarDarkMode() { const toggle = document.getElementById('dark-mode-toggle'); if (!toggle) return; const temaGuardado = localStorage.getItem('theme'); if (temaGuardado === 'dark' || (!temaGuardado && window.matchMedia('(prefers-color-scheme: dark)').matches)) { document.body.setAttribute('data-theme', 'dark'); toggle.checked = true; estadoSimulador.darkMode = true; } toggle.addEventListener('change', function() { if (this.checked) { document.body.setAttribute('data-theme', 'dark'); localStorage.setItem('theme', 'dark'); estadoSimulador.darkMode = true; } else { document.body.removeAttribute('data-theme'); localStorage.setItem('theme', 'light'); estadoSimulador.darkMode = false; } if (partX !== 0) ejecutarSimulacionElectrostatics(true); }); }
function cargarEjemplo(n) { limpiarTodo(); let mults = {g: 1e-3, kN: 1e3, µ: 1e-6}; switch(n) { case 1: document.getElementById('masa').value = 10; document.getElementById('unidad-masa').value = mults.g; document.getElementById('angulo').value = 30; document.getElementById('campo').value = 500; break; case 2: document.getElementById('masa').value = 50; document.getElementById('unidad-masa').value = mults.g; document.getElementById('campo').value = 26; document.getElementById('unidad-campo').value = mults.kN; break; case 3: document.getElementById('masa').value = 20.4; document.getElementById('unidad-masa').value = mults.g; document.getElementById('angulo').value = 15; document.getElementById('campo').value = -1; break; } setTimeout(() => ejecutarSimulacionElectrostatics(false), 300); }

function inyectarModalConfirmacion() { if (document.getElementById('modal-confirmacion')) return; const modalHTML = ` <div id="modal-confirmacion" class="modal-overlay"> <div class="modal-content"> <h3>⚠️ Borrar Historial</h3> <p>¿Estás seguro? Esta acción eliminará permanentemente todos los registros del historial.</p> <div class="modal-botones"> <button id="btn-cancelar-modal" class="btn-secundario full-width">Cancelar</button> <button id="btn-confirmar-modal" class="btn-principal btn-danger full-width">Sí, borrar</button> </div> </div> </div> `; document.body.insertAdjacentHTML('beforeend', modalHTML); document.getElementById('btn-cancelar-modal').addEventListener('click', () => { document.getElementById('modal-confirmacion').classList.remove('active'); }); document.getElementById('btn-confirmar-modal').addEventListener('click', () => { document.querySelector('#tabla-resultados tbody').innerHTML = ""; document.getElementById('modal-confirmacion').classList.remove('active'); mostrarNotificacion("Historial borrado correctamente.", 'info'); }); }
function limpiarHistorial() { const tbody = document.querySelector('#tabla-resultados tbody'); if (tbody && tbody.rows.length > 0) { document.getElementById('modal-confirmacion').classList.add('active'); } else { mostrarNotificacion("El historial ya está vacío.", 'info'); } }

// Inicialización de la Aplicación Multi-Física
document.addEventListener('DOMContentLoaded', () => {
    inicializarDarkMode();    
    inicializarConvertidores(); 
    window.addEventListener('resize', () => { if (partX !== 0) ejecutarSimulacionElectrostatics(true); });
    inicializarEventosDrag();
    inyectarModalConfirmacion();
    inicializarSelectorTemas(); // <-- Arranca el controlador de temas

    // Enlazar los botones de resolver con sus módulos específicos
    document.getElementById('btn-resolver-electrostatics').addEventListener('click', ejecutarSimulacionElectrostatics);
    document.getElementById('btn-lanzar-kinematics').addEventListener('click', ejecutarSimulacionKinematics);
});
