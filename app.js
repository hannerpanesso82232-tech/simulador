const g = 9.8;

// Variables globales para la interactividad
let partX = 0;
let partY = 0;
let isDragging = false;
let draggedOnce = false;
let ultimaVariableCalculada = 'carga'; 

function leerInputConUnidad(idInput, idSelect) {
    const el = document.getElementById(idInput);
    if (!el || el.value === "") return undefined;
    const mult = (idSelect && document.getElementById(idSelect)) ? parseFloat(document.getElementById(idSelect).value) : 1;
    return parseFloat(el.value) * mult;
}

function ejecutarSimulacion(esArrastre = false) {
    let registro = ["=== PROCEDIMIENTO MATEMÁTICO ==="];
    let bloquePrincipal = [];
    let logSet = new Set(); // Para evitar repetir textos en la consola

    // Función interna para imprimir el paso a paso bonito
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

    // 1. Lectura de inputs
    let m = leerInputConUnidad('masa', 'unidad-masa');
    let theta = leerInputConUnidad('angulo', null);
    let E = leerInputConUnidad('campo', 'unidad-campo');
    let q = leerInputConUnidad('carga', 'unidad-carga');

    let W = leerInputConUnidad('peso', 'unidad-peso');
    let T = leerInputConUnidad('tension', 'unidad-tension');
    let Fe = leerInputConUnidad('fuerza', 'unidad-fuerza');

    let conteoInputs = [m, theta, E, q, W, T, Fe].filter(v => v !== undefined).length;
    if (conteoInputs < 3 && !esArrastre) {
        mostrarNotificacion(`Faltan datos. Ingresa al menos 3 parámetros para armar el sistema.`, 'error');
        return;
    }

    try {
        // === 2. MOTOR FÍSICO EN CASCADA CON PASO A PASO DETALLADO ===
        for (let i = 0; i < 3; i++) {
            
            // Masa y Peso
            if (m !== undefined && W === undefined) { 
                W = m * g; 
                addStep("Calculando Peso (W)", "W = m · g", `W = ${m.toPrecision(4)} · 9.8`, `W = ${W.toPrecision(4)} N`); 
            }
            if (W !== undefined && m === undefined) { 
                m = W / g; 
                addStep("Calculando Masa (m)", "m = W / g", `m = ${W.toPrecision(4)} / 9.8`, `m = ${m.toPrecision(4)} kg`); 
            }

            // Tensión y Ángulo -> Peso y Fe
            if (theta !== undefined && T !== undefined) {
                if (W === undefined) { 
                    W = T * Math.cos(theta * Math.PI/180); 
                    addStep("Calculando Peso (W)", "W = T · cos(θ)", `W = ${T.toPrecision(4)} · cos(${theta}°)`, `W = ${W.toPrecision(4)} N`); 
                }
                if (Fe === undefined) { 
                    Fe = T * Math.sin(theta * Math.PI/180); 
                    addStep("Calculando Fuerza Eléctrica (Fe)", "Fe = T · sin(θ)", `Fe = ${T.toPrecision(4)} · sin(${theta}°)`, `Fe = ${Fe.toPrecision(4)} N`); 
                }
            }

            // Ángulo y Peso -> Fe y Tensión
            if (theta !== undefined && W !== undefined) {
                if (Fe === undefined) { 
                    Fe = W * Math.tan(theta * Math.PI/180); 
                    addStep("Calculando Fuerza Eléctrica (Fe)", "Fe = W · tan(θ)", `Fe = ${W.toPrecision(4)} · tan(${theta}°)`, `Fe = ${Fe.toPrecision(4)} N`); 
                }
                if (T === undefined) { 
                    T = W / Math.cos(theta * Math.PI/180); 
                    addStep("Calculando Tensión (T)", "T = W / cos(θ)", `T = ${W.toPrecision(4)} / cos(${theta}°)`, `T = ${T.toPrecision(4)} N`); 
                }
            }

            // Ángulo y Fe -> Peso y Tensión
            if (theta !== undefined && Fe !== undefined) {
                if (W === undefined) { 
                    W = Fe / Math.tan(theta * Math.PI/180); 
                    addStep("Calculando Peso (W)", "W = Fe / tan(θ)", `W = ${Fe.toPrecision(4)} / tan(${theta}°)`, `W = ${W.toPrecision(4)} N`); 
                }
                if (T === undefined) { 
                    T = Fe / Math.sin(theta * Math.PI/180); 
                    addStep("Calculando Tensión (T)", "T = Fe / sin(θ)", `T = ${Fe.toPrecision(4)} / sin(${theta}°)`, `T = ${T.toPrecision(4)} N`); 
                }
            }

            // Peso y Fe -> Tensión y Ángulo
            if (W !== undefined && Fe !== undefined) {
                if (T === undefined) { 
                    T = Math.sqrt(W*W + Fe*Fe); 
                    addStep("Calculando Tensión (T) por Pitágoras", "T = √(W² + Fe²)", `T = √(${W.toPrecision(4)}² + ${Fe.toPrecision(4)}²)`, `T = ${T.toPrecision(4)} N`); 
                }
                if (theta === undefined) { 
                    theta = Math.atan2(Fe, W) * 180/Math.PI; 
                    addStep("Calculando Ángulo (θ)", "θ = arctan(Fe / W)", `θ = arctan(${Fe.toPrecision(4)} / ${W.toPrecision(4)})`, `θ = ${theta.toPrecision(4)}°`); 
                }
            }

            // Tensión y Peso -> Fe y Ángulo
            if (T !== undefined && W !== undefined) {
                if (T < W) throw new Error("Físicamente imposible: La Tensión no puede ser menor al Peso.");
                if (Fe === undefined) { 
                    Fe = Math.sqrt(T*T - W*W); 
                    addStep("Calculando Fuerza Eléctrica (Fe)", "Fe = √(T² - W²)", `Fe = √(${T.toPrecision(4)}² - ${W.toPrecision(4)}²)`, `Fe = ${Fe.toPrecision(4)} N`); 
                }
                if (theta === undefined) { 
                    theta = Math.atan2(Fe, W) * 180/Math.PI; 
                    addStep("Calculando Ángulo (θ)", "θ = arctan(Fe / W)", `θ = arctan(${Fe.toPrecision(4)} / ${W.toPrecision(4)})`, `θ = ${theta.toPrecision(4)}°`); 
                }
            }

            // Eléctricas: Fe, E, q
            if (Fe !== undefined && q !== undefined && E === undefined) {
                if (q === 0) throw new Error("La carga no puede ser cero si hay Fuerza Eléctrica.");
                E = Fe / Math.abs(q);
                addStep("Calculando Campo Eléctrico (E)", "E = Fe / |q|", `E = ${Fe.toPrecision(4)} / |${q.toExponential(3)}|`, `E = ${E.toPrecision(5)} N/C`);
            }
            if (Fe !== undefined && E !== undefined && q === undefined) {
                if (E === 0) throw new Error("El campo no puede ser cero si hay Fuerza Eléctrica.");
                q = Fe / E; 
                addStep("Calculando Carga (q)", "q = Fe / E", `q = ${Fe.toPrecision(4)} / ${E.toExponential(3)}`, `q = ${q.toExponential(4)} C`);
            }
            if (q !== undefined && E !== undefined && Fe === undefined) {
                Fe = Math.abs(q) * E;
                addStep("Calculando Fuerza Eléctrica (Fe)", "Fe = |q| · E", `Fe = |${q.toExponential(3)}| · ${E.toExponential(3)}`, `Fe = ${Fe.toPrecision(4)} N`);
            }
        }

        // Revisión final de faltantes
        let faltantes = [];
        if (m === undefined) faltantes.push("Masa (m)");
        if (theta === undefined) faltantes.push("Ángulo (θ)");
        if (E === undefined) faltantes.push("Campo (E)");
        if (q === undefined) faltantes.push("Carga (q)");

        if (faltantes.length > 0) {
            throw new Error(`Con los datos ingresados no se pudo deducir: ${faltantes.join(', ')}. Falta información en el sistema.`);
        }

    } catch (error) {
        if (!esArrastre) mostrarNotificacion(error.message, 'error');
        document.getElementById('consola-pasos').innerText = "❌ Error: " + error.message;
        return;
    }

    // 4. Escribir resultados en el DOM
    if(document.getElementById('masa') && m !== undefined) document.getElementById('masa').value = parseFloat((m / parseFloat(document.getElementById('unidad-masa').value)).toPrecision(5));
    if(document.getElementById('angulo') && theta !== undefined) document.getElementById('angulo').value = parseFloat(theta.toPrecision(5));
    if(document.getElementById('campo') && E !== undefined) document.getElementById('campo').value = parseFloat((E / parseFloat(document.getElementById('unidad-campo').value)).toPrecision(5));
    if(document.getElementById('carga') && q !== undefined) document.getElementById('carga').value = parseFloat((q / parseFloat(document.getElementById('unidad-carga').value)).toPrecision(5));
    
    if(document.getElementById('peso') && W !== undefined) document.getElementById('peso').value = parseFloat((W / parseFloat(document.getElementById('unidad-peso').value)).toPrecision(5));
    if(document.getElementById('tension') && T !== undefined) document.getElementById('tension').value = parseFloat((T / parseFloat(document.getElementById('unidad-tension').value)).toPrecision(5));
    if(document.getElementById('fuerza') && Fe !== undefined) document.getElementById('fuerza').value = parseFloat((Fe / parseFloat(document.getElementById('unidad-fuerza').value)).toPrecision(5));

    // Consola Final
    if (!esArrastre) {
        if (bloquePrincipal.length === 0) {
            registro.push("\n> Sistema ingresado manualmente completo. Comprobando y graficando...");
        } else {
            registro = registro.concat(bloquePrincipal);
            registro.push(`\n=== SISTEMA RESUELTO Y GRAFICADO ===`);
        }
        document.getElementById('consola-pasos').innerText = registro.join('\n');
    }

    dibujarDCL(theta, q, E, W, T, Fe, m);
    if (!esArrastre) agregarHistorial(m, theta, E, q, T, Fe);
}

// =========================================================
// FUNCIONES DE DIBUJO Y FORMATO 
// =========================================================

function dibujarDCL(theta, q, E, wVal, tVal, feVal, mVal) {
    const canvas = document.getElementById('lienzo');
    const ctx = canvas.getContext('2d');
    const wrapper = canvas.parentElement;
    
    canvas.width = wrapper.clientWidth;
    canvas.height = window.innerWidth >= 768 ? 450 : Math.max(wrapper.clientWidth * 0.75, 280); 
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const origenX = canvas.width / 2;
    const origenY = 40; 
    const longitudCuerda = canvas.height * 0.55; 

    const direccionDesvio = (q * E >= 0) ? 1 : -1;
    const thetaRad = theta * (Math.PI / 180) * direccionDesvio;

    const px = origenX + longitudCuerda * Math.sin(thetaRad);
    const py = origenY + longitudCuerda * Math.cos(thetaRad);

    partX = px; 
    partY = py;

    // Placas Laterales
    ctx.fillStyle = E >= 0 ? 'rgba(220, 53, 69, 0.12)' : 'rgba(0, 86, 179, 0.12)';
    ctx.fillRect(0, 0, 25, canvas.height);
    ctx.fillStyle = E >= 0 ? 'rgba(0, 86, 179, 0.12)' : 'rgba(220, 53, 69, 0.12)';
    ctx.fillRect(canvas.width - 25, 0, 25, canvas.height);
    
    const isDarkMode = document.body.getAttribute('data-theme') === 'dark';
    ctx.fillStyle = E >= 0 ? '#ff6b6b' : '#4dabf7'; 
    ctx.font = "bold 20px Arial"; ctx.textAlign = 'center';
    ctx.fillText(E >= 0 ? "+" : "-", 12, canvas.height / 2 + 7);
    ctx.fillStyle = E >= 0 ? '#4dabf7' : '#ff6b6b';
    ctx.fillText(E >= 0 ? "-" : "+", canvas.width - 12, canvas.height / 2 + 7);

    // Eje vertical
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = isDarkMode ? '#555' : '#aaa'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(origenX, origenY); ctx.lineTo(origenX, canvas.height - 15); ctx.stroke();
    
    // Arco de Ángulo
    if (Math.abs(theta) > 1) {
        ctx.beginPath();
        const startAngle = direccionDesvio === 1 ? Math.PI/2 - Math.abs(thetaRad) : Math.PI/2;
        const endAngle = direccionDesvio === 1 ? Math.PI/2 : Math.PI/2 - Math.abs(thetaRad);
        ctx.arc(origenX, origenY, 50, startAngle, endAngle, direccionDesvio === -1);
        ctx.strokeStyle = '#007bff'; ctx.lineWidth = 2; ctx.stroke();
        dibujarTextoFondo(ctx, `θ = ${theta.toFixed(1)}°`, origenX + (direccionDesvio * 20), origenY + 65, '#007bff');
    }
    ctx.setLineDash([]);

    // Techo y Cuerda
    ctx.strokeStyle = isDarkMode ? '#aaa' : '#333'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(origenX - 50, origenY); ctx.lineTo(origenX + 50, origenY); ctx.stroke();
    
    ctx.lineWidth = 2; ctx.strokeStyle = isDarkMode ? '#fff' : '#000';
    ctx.beginPath(); ctx.moveTo(origenX, origenY); ctx.lineTo(px, py); ctx.stroke();

    // Vectores
    const vecScale = canvas.height / 350;
    dibujarFlecha(ctx, px, py, origenX, origenY, '#007bff', `T=${tVal.toPrecision(3)}N`, vecScale);
    dibujarFlecha(ctx, px, py, px, py + 60 * vecScale, '#28a745', `W=${wVal.toPrecision(3)}N`, vecScale);
    dibujarFlecha(ctx, px, py, px + (70 * vecScale * direccionDesvio), py, '#dc3545', `Fe=${feVal.toPrecision(3)}N`, vecScale);

    // Partícula
    ctx.beginPath(); ctx.arc(px, py, 18, 0, Math.PI * 2);
    ctx.fillStyle = q >= 0 ? '#ff5722' : '#3f51b5';
    ctx.shadowBlur = isDarkMode ? 15 : 10; ctx.shadowColor = ctx.fillStyle;
    ctx.fill(); 
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
    
    // --- Carga Dinámica con Unidad Real ---
    ctx.fillStyle = 'white'; ctx.textAlign = 'center'; ctx.font = "bold 11px Arial";
    const qSelect = document.getElementById('unidad-carga');
    const qUnitText = qSelect.options[qSelect.selectedIndex].text; 
    const qMult = parseFloat(qSelect.value);
    let qMostrar = (q / qMult).toPrecision(3);
    ctx.fillText(`${q > 0 ? '+' : ''}${qMostrar} ${qUnitText}`, px, py + 4);

    // --- Masa Debajo de la Esfera ---
    const mSelect = document.getElementById('unidad-masa');
    const mUnitText = mSelect.options[mSelect.selectedIndex].text; 
    const mMult = parseFloat(mSelect.value);
    let mMostrar = (mVal / mMult).toPrecision(3);
    
    ctx.fillStyle = isDarkMode ? '#cccccc' : '#555555';
    ctx.font = "bold 12px Arial";
    ctx.fillText(`m = ${mMostrar} ${mUnitText}`, px, py + 35);
}

function dibujarTextoFondo(ctx, txt, x, y, color) {
    ctx.font = "bold 12px Arial";
    const metrica = ctx.measureText(txt);
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    ctx.fillStyle = isDark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.8)';
    ctx.fillRect(x - metrica.width/2 - 2, y - 10, metrica.width + 4, 14);
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.fillText(txt, x, y);
}

function dibujarFlecha(ctx, x1, y1, x2, y2, color, txt, scale=1) {
    const ang = Math.atan2(y2 - y1, x2 - x1);
    ctx.strokeStyle = ctx.fillStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x2, y2);
    const arrowSize = 10 * scale;
    ctx.lineTo(x2 - arrowSize * Math.cos(ang - Math.PI / 6), y2 - arrowSize * Math.sin(ang - Math.PI / 6));
    ctx.lineTo(x2 - arrowSize * Math.cos(ang + Math.PI / 6), y2 - arrowSize * Math.sin(ang + Math.PI / 6));
    ctx.fill();
    if (txt) {
        const offsetX = x2 > x1 ? 25*scale : (x2 < x1 ? -25*scale : 0);
        const offsetY = y2 > y1 ? 15*scale : (y2 < y1 ? -12*scale : -8*scale);
        dibujarTextoFondo(ctx, txt, x2 + offsetX, y2 + offsetY, color);
    }
}

function formatearNumero(num) {
    if (num === 0) return "0";
    if (Math.abs(num) < 0.001 || Math.abs(num) >= 10000) return num.toExponential(2);
    return parseFloat(num.toPrecision(4)).toString(); 
}

function agregarHistorial(m, t, e, q, tension, fe) {
    const tabla = document.querySelector('#tabla-resultados tbody');
    if (!tabla) return;
    const fila = tabla.insertRow(0);
    fila.style.animation = "fadeIn 0.5s ease-in";
    
    fila.innerHTML = `
        <td>${formatearNumero(m)}</td>
        <td>${t.toFixed(1)}°</td>
        <td>${formatearNumero(e)}</td>
        <td>${formatearNumero(q)}</td>
        <td>${formatearNumero(tension)}</td>
        <td>${formatearNumero(fe)}</td>
    `;
    if (window.innerWidth < 768 && tabla.rows.length > 5) tabla.deleteRow(5);
}

function limpiarTodo() {
    ['masa', 'angulo', 'campo', 'carga', 'peso', 'tension', 'fuerza'].forEach(id => {
        if(document.getElementById(id)) document.getElementById(id).value = "";
    });
    const consola = document.getElementById('consola-pasos');
    if(consola) consola.innerText = "Esperando datos...\nIngresa al menos 3 parámetros principales.";
    const cv = document.getElementById('lienzo');
    if(cv) {
        cv.getContext('2d').clearRect(0, 0, cv.width, cv.height);
        partX = 0; partY = 0; 
    }
}

function limpiarHistorial() {
    const tbody = document.querySelector('#tabla-resultados tbody');
    if (tbody && tbody.rows.length > 0) {
        if (confirm("¿Borrar todos los registros del historial?")) tbody.innerHTML = "";
    }
}

// =========================================================
// EVENTOS, NOTIFICACIONES Y UI 
// =========================================================

function inicializarDarkMode() {
    const toggle = document.getElementById('dark-mode-toggle');
    if (!toggle) return;
    const temaGuardado = localStorage.getItem('theme');
    const prefiereOscuro = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (temaGuardado === 'dark' || (!temaGuardado && prefiereOscuro)) {
        document.body.setAttribute('data-theme', 'dark'); toggle.checked = true;
    }
    toggle.addEventListener('change', function() {
        if (this.checked) { document.body.setAttribute('data-theme', 'dark'); localStorage.setItem('theme', 'dark'); } 
        else { document.body.removeAttribute('data-theme'); localStorage.setItem('theme', 'light'); }
        if (partX !== 0) ejecutarSimulacion(true); 
    });
}

function cargarEjemplo(numero) {
    limpiarTodo();
    mostrarNotificacion(`Cargando Ejemplo ${numero}. Ejecutando simulación...`, 'info');
    switch(numero) {
        case 1:
            document.getElementById('masa').value = "10"; document.getElementById('unidad-masa').value = "1e-3"; 
            document.getElementById('angulo').value = "30"; document.getElementById('campo').value = "500"; 
            ultimaVariableCalculada = 'carga'; break;
        case 2:
            document.getElementById('masa').value = "0.05"; document.getElementById('campo').value = "3";
            document.getElementById('unidad-campo').value = "1e3"; document.getElementById('carga').value = "2";
            document.getElementById('unidad-carga').value = "1e-6"; ultimaVariableCalculada = 'angulo'; break;
        case 3:
            document.getElementById('peso').value = "0.2"; document.getElementById('angulo').value = "15";
            document.getElementById('carga').value = "-5"; document.getElementById('unidad-carga').value = "1e-6"; 
            ultimaVariableCalculada = 'campo'; break;
    }
    setTimeout(() => ejecutarSimulacion(false), 300);
}

function mostrarNotificacion(mensaje, tipo = 'info') {
    const container = document.getElementById('notificacion-container');
    if (!container) return;
    const notif = document.createElement('div');
    notif.className = `notificacion ${tipo}`;
    const icono = tipo === 'error' ? '⚠️' : 'ℹ️';
    notif.innerHTML = `<div class="notificacion-body"><span class="notificacion-icon">${icono}</span><span class="notificacion-text" style="line-height:1.4;">${mensaje}</span></div>`;
    container.appendChild(notif);
    const timer = setTimeout(() => cerrarNotificacion(notif), 5000); 
    notif.addEventListener('click', () => { clearTimeout(timer); cerrarNotificacion(notif); });
}

function cerrarNotificacion(elemento) {
    elemento.classList.add('ocultar');
    elemento.addEventListener('animationend', () => elemento.remove());
}

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
            if(partX !== 0) ejecutarSimulacion(true); 
        });
    });
}

function inicializarCanvasResponsivo() {
    window.addEventListener('resize', () => { if (partX !== 0) ejecutarSimulacion(true); });
}

function inicializarEventosDrag() {
    const canvas = document.getElementById('lienzo');
    if (!canvas) return;

    function obtenerPosicion(e) {
        const rect = canvas.getBoundingClientRect();
        const evt = e.touches ? e.touches[0] : e; 
        if (!evt) return null;
        const x = (evt.clientX - rect.left) * (canvas.width / rect.width);
        const y = (evt.clientY - rect.top) * (canvas.height / rect.height);
        return { x, y };
    }

    function alPresionar(e) {
        const pos = obtenerPosicion(e);
        if (!pos) return;
        if (Math.hypot(pos.x - partX, pos.y - partY) < 35) {
            isDragging = true;
            draggedOnce = false;
            canvas.style.cursor = 'grabbing';
            if (ultimaVariableCalculada === 'angulo' || !ultimaVariableCalculada) ultimaVariableCalculada = 'carga';
            if (e.type === 'touchstart') e.preventDefault(); 
        }
    }

    function alMover(e) {
        const pos = obtenerPosicion(e);
        if (!pos) return;

        if (!isDragging) {
            canvas.style.cursor = Math.hypot(pos.x - partX, pos.y - partY) < 35 ? 'grab' : 'default';
            return;
        }

        if (e.type === 'touchmove') e.preventDefault();

        draggedOnce = true;
        const origenX = canvas.width / 2;
        const origenY = 40;

        const dx = pos.x - origenX;
        const dy = pos.y - origenY;

        let newTheta = Math.atan2(Math.abs(dx), dy) * (180 / Math.PI);
        if (newTheta < 0) newTheta = 0;
        if (newTheta > 85) newTheta = 85; 

        document.getElementById('angulo').value = newTheta.toFixed(2);
        
        if(document.getElementById(ultimaVariableCalculada)) document.getElementById(ultimaVariableCalculada).value = "";
        ['peso', 'tension', 'fuerza'].forEach(id => { if(document.getElementById(id)) document.getElementById(id).value = ""; });

        ejecutarSimulacion(true); 
    }

    function alSoltar(e) {
        if (isDragging) {
            isDragging = false;
            canvas.style.cursor = 'grab';
            
            if (draggedOnce) {
                if(document.getElementById(ultimaVariableCalculada)) document.getElementById(ultimaVariableCalculada).value = "";
                ['peso', 'tension', 'fuerza'].forEach(id => { if(document.getElementById(id)) document.getElementById(id).value = ""; });
                ejecutarSimulacion(false); 
            }
        }
    }

    canvas.addEventListener('mousedown', alPresionar);
    canvas.addEventListener('mousemove', alMover);
    window.addEventListener('mouseup', alSoltar);

    canvas.addEventListener('touchstart', alPresionar, {passive: false});
    canvas.addEventListener('touchmove', alMover, {passive: false});
    window.addEventListener('touchend', alSoltar);
}

function inicializarApp() {
    inicializarDarkMode();    
    inicializarConvertidores(); 
    inicializarCanvasResponsivo(); 
    inicializarEventosDrag();
}

document.addEventListener('DOMContentLoaded', inicializarApp);
