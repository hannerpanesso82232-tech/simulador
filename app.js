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
    let registro = ["=== RESULTADOS DEL ANÁLISIS ==="];

    let m = leerInputConUnidad('masa', 'unidad-masa');
    let theta = leerInputConUnidad('angulo', null);
    let E = leerInputConUnidad('campo', 'unidad-campo');
    let q = leerInputConUnidad('carga', 'unidad-carga');

    let w_input = leerInputConUnidad('peso', 'unidad-peso');
    let t_input = leerInputConUnidad('tension', 'unidad-tension');
    let fe_input = leerInputConUnidad('fuerza', 'unidad-fuerza');

    try {
        if (w_input !== undefined && m === undefined) {
            m = w_input / g;
            if (!esArrastre) registro.push(`\n[✓] Masa (m) deducida a partir del Peso:\n  > m = W / g = ${m.toPrecision(4)} kg`);
            if (document.getElementById('masa')) {
                const multMasa = parseFloat(document.getElementById('unidad-masa').value);
                document.getElementById('masa').value = parseFloat((m / multMasa).toPrecision(5));
            }
        }

        if (fe_input !== undefined && E !== undefined && q === undefined) {
            q = fe_input / E;
            if (!esArrastre) registro.push(`\n[✓] Carga (q) deducida a partir de Fe y E:\n  > q = Fe / E = ${q.toExponential(4)} C`);
        } else if (fe_input !== undefined && q !== undefined && E === undefined) {
            E = fe_input / Math.abs(q);
            if (!esArrastre) registro.push(`\n[✓] Campo (E) deducido a partir de Fe y q:\n  > E = Fe / |q| = ${E.toExponential(4)} N/C`);
        }

        if (t_input !== undefined && m !== undefined && theta === undefined) {
            let w_temp = m * g;
            if (t_input <= w_temp) throw new Error(`La tensión (${t_input}N) debe ser mayor que el peso (${w_temp.toFixed(2)}N).`);
            let fe_temp = Math.sqrt((t_input * t_input) - (w_temp * w_temp));
            theta = Math.atan(fe_temp / w_temp) * (180 / Math.PI);
            if (!esArrastre) registro.push(`\n[✓] Ángulo (θ) deducido a partir de la Tensión:\n  > θ = ${theta.toFixed(2)}°`);
        }
    } catch (error) {
        if (!esArrastre) mostrarNotificacion(error.message, 'error');
        document.getElementById('consola-pasos').innerText = "❌ Error: " + error.message;
        return;
    }

    const inputs = [m, theta, E, q];
    const vacios = inputs.filter(v => v === undefined).length;

    if (vacios > 1 && !esArrastre) {
        mostrarNotificacion("Faltan datos. Ingresa al menos 3 parámetros principales.", 'error');
        return;
    }

    let w, T, Fe, thetaRad;

    try {
        if (vacios === 0) {
            if (!esArrastre) registro.push(`\n[Info] Sistema completo ingresado manualmente. Graficando...`);
            ultimaVariableCalculada = 'carga'; 
        } 
        else if (q === undefined) {
            ultimaVariableCalculada = 'carga';
            thetaRad = theta * (Math.PI / 180);
            w = m * g;
            Fe = w * Math.tan(thetaRad); 
            if (E === 0) throw new Error("El campo eléctrico no puede ser 0.");
            q = Fe / E;
            
            if (!esArrastre) {
                registro.push(`\n[✓] Despejando la Carga (q) faltante:`);
                registro.push(`  > q = (m·g·tan(θ)) / E = ${q.toExponential(4)} C`);
            }
            if(document.getElementById('carga')) {
                const multCarga = parseFloat(document.getElementById('unidad-carga').value);
                document.getElementById('carga').value = parseFloat((q / multCarga).toPrecision(5));
            }

        } else if (E === undefined) {
            ultimaVariableCalculada = 'campo';
            thetaRad = theta * (Math.PI / 180);
            w = m * g;
            Fe = w * Math.tan(thetaRad);
            if (q === 0) throw new Error("La carga no puede ser 0.");
            E = Fe / Math.abs(q);
            
            if (!esArrastre) {
                registro.push(`\n[✓] Despejando el Campo Eléctrico (E) faltante:`);
                registro.push(`  > E = (m·g·tan(θ)) / |q| = ${E.toPrecision(5)} N/C`);
            }
            if(document.getElementById('campo')) {
                const multCampo = parseFloat(document.getElementById('unidad-campo').value);
                document.getElementById('campo').value = parseFloat((E / multCampo).toPrecision(5));
            }

        } else if (m === undefined) {
            ultimaVariableCalculada = 'masa';
            thetaRad = theta * (Math.PI / 180);
            Fe = Math.abs(q) * E;
            if (theta === 0) throw new Error("El ángulo no puede ser 0.");
            w = Fe / Math.tan(thetaRad);
            m = w / g;
            
            if (!esArrastre) {
                registro.push(`\n[✓] Despejando la Masa (m) faltante:`);
                registro.push(`  > m = (|q|·E) / (g·tan(θ)) = ${m.toPrecision(4)} kg`);
            }
            if(document.getElementById('masa')) {
                const multMasa = parseFloat(document.getElementById('unidad-masa').value);
                document.getElementById('masa').value = parseFloat((m / multMasa).toPrecision(5));
            }

        } else if (theta === undefined) {
            ultimaVariableCalculada = 'angulo';
            w = m * g;
            Fe = Math.abs(q) * E;
            thetaRad = Math.atan(Fe / w);
            theta = thetaRad * (180 / Math.PI);
            
            if (!esArrastre) {
                registro.push(`\n[✓] Despejando el Ángulo (θ) faltante:`);
                registro.push(`  > θ = arctan( (|q|·E) / (m·g) ) = ${theta.toFixed(2)}°`);
            }
            if(document.getElementById('angulo')) {
                document.getElementById('angulo').value = parseFloat(theta.toPrecision(5));
            }
        }

        if (m <= 0 || theta < 0 || theta >= 90 || isNaN(m) || isNaN(theta)) {
            throw new Error("Valores calculados fuera del rango físico aceptable.");
        }

    } catch (error) {
        if (!esArrastre) mostrarNotificacion(error.message, 'error');
        document.getElementById('consola-pasos').innerText = "❌ Error matemático: " + error.message;
        return;
    }

    thetaRad = theta * (Math.PI / 180);
    w = m * g;
    Fe = Math.abs(q) * E;
    T = Math.sqrt((w * w) + (Fe * Fe)); 

    if (!esArrastre) {
        let secundarias = [];
        if (w_input === undefined && ultimaVariableCalculada !== 'masa') secundarias.push(`Peso (W) = ${w.toPrecision(4)} N`);
        if (fe_input === undefined && ultimaVariableCalculada !== 'carga' && ultimaVariableCalculada !== 'campo') secundarias.push(`F. Eléctrica (Fe) = ${Fe.toPrecision(4)} N`);
        if (t_input === undefined) secundarias.push(`Tensión (T) = ${T.toPrecision(4)} N`);

        if (secundarias.length > 0 && vacios > 0) {
            registro.push(`\n[+] Completando valores en blanco del sistema:`);
            secundarias.forEach(sec => registro.push(`  > ${sec}`));
        }
        document.getElementById('consola-pasos').innerText = registro.join('\n');
    }

    if(document.getElementById('peso')) {
        const pMult = parseFloat(document.getElementById('unidad-peso').value);
        document.getElementById('peso').value = parseFloat((w / pMult).toPrecision(5));
    }
    if(document.getElementById('tension')) {
        const tMult = parseFloat(document.getElementById('unidad-tension').value);
        document.getElementById('tension').value = parseFloat((T / tMult).toPrecision(5));
    }
    if(document.getElementById('fuerza')) {
        const fMult = parseFloat(document.getElementById('unidad-fuerza').value);
        document.getElementById('fuerza').value = parseFloat((Fe / fMult).toPrecision(5));
    }

    dibujarDCL(theta, q, E, w, T, Fe);
    if (!esArrastre) agregarHistorial(m, theta, E, q, T, Fe);
}

// =========================================================
// FUNCIONES DE DIBUJO Y FORMATO
// =========================================================

function dibujarDCL(theta, q, E, wVal, tVal, feVal) {
    const canvas = document.getElementById('lienzo');
    const ctx = canvas.getContext('2d');
    const wrapper = canvas.parentElement;
    
    canvas.width = wrapper.clientWidth;
    canvas.height = Math.max(wrapper.clientWidth * 0.75, 280); 
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const origenX = canvas.width / 2;
    const origenY = 40; 
    const longitudCuerda = canvas.height * 0.6; 

    const direccionDesvio = (q * E >= 0) ? 1 : -1;
    const thetaRad = theta * (Math.PI / 180) * direccionDesvio;

    const px = origenX + longitudCuerda * Math.sin(thetaRad);
    const py = origenY + longitudCuerda * Math.cos(thetaRad);

    partX = px; 
    partY = py;

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

    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = isDarkMode ? '#555' : '#aaa'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(origenX, origenY); ctx.lineTo(origenX, canvas.height - 15); ctx.stroke();
    
    if (Math.abs(theta) > 1) {
        ctx.beginPath();
        const startAngle = direccionDesvio === 1 ? Math.PI/2 - Math.abs(thetaRad) : Math.PI/2;
        const endAngle = direccionDesvio === 1 ? Math.PI/2 : Math.PI/2 - Math.abs(thetaRad);
        ctx.arc(origenX, origenY, 50, startAngle, endAngle, direccionDesvio === -1);
        ctx.strokeStyle = '#007bff'; ctx.lineWidth = 2; ctx.stroke();
        dibujarTextoFondo(ctx, `θ = ${theta.toFixed(1)}°`, origenX + (direccionDesvio * 20), origenY + 65, '#007bff');
    }
    ctx.setLineDash([]);

    ctx.strokeStyle = isDarkMode ? '#aaa' : '#333'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(origenX - 50, origenY); ctx.lineTo(origenX + 50, origenY); ctx.stroke();
    
    ctx.lineWidth = 2; ctx.strokeStyle = isDarkMode ? '#fff' : '#000';
    ctx.beginPath(); ctx.moveTo(origenX, origenY); ctx.lineTo(px, py); ctx.stroke();

    const vecScale = canvas.height / 350;
    dibujarFlecha(ctx, px, py, origenX, origenY, '#007bff', `T=${tVal.toPrecision(3)}N`, vecScale);
    dibujarFlecha(ctx, px, py, px, py + 60 * vecScale, '#28a745', `W=${wVal.toPrecision(3)}N`, vecScale);
    dibujarFlecha(ctx, px, py, px + (70 * vecScale * direccionDesvio), py, '#dc3545', `Fe=${feVal.toPrecision(3)}N`, vecScale);

    ctx.beginPath(); ctx.arc(px, py, 18, 0, Math.PI * 2);
    ctx.fillStyle = q >= 0 ? '#ff5722' : '#3f51b5';
    ctx.shadowBlur = isDarkMode ? 15 : 10; ctx.shadowColor = ctx.fillStyle;
    ctx.fill(); 
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = 'white'; ctx.textAlign = 'center'; ctx.font = "bold 11px Arial";
    let qMostrar = (q / 1e-6).toPrecision(3);
    ctx.fillText(`${q > 0 ? '+' : ''}${qMostrar} µC`, px, py + 4);
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

// FORMATEADOR DE NÚMEROS INTELIGENTE PARA EL HISTORIAL
function formatearNumero(num) {
    if (num === 0) return "0";
    if (Math.abs(num) < 0.001 || Math.abs(num) >= 10000) return num.toExponential(2);
    return parseFloat(num.toPrecision(4)).toString(); // Borra ceros inútiles y compacta
}

function agregarHistorial(m, t, e, q, tension, fe) {
    const tabla = document.querySelector('#tabla-resultados tbody');
    if (!tabla) return;
    const fila = tabla.insertRow(0);
    fila.style.animation = "fadeIn 0.5s ease-in";
    
    // Usamos el nuevo formateador para que los datos quepan en la pantalla del celular
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
        partX = 0; partY = 0; // Resetear coordenadas de la partícula
    }
}

function limpiarHistorial() {
    const tbody = document.querySelector('#tabla-resultados tbody');
    if (tbody && tbody.rows.length > 0) {
        if (confirm("¿Borrar todos los registros del historial?")) tbody.innerHTML = "";
    }
}

// =========================================================
// EVENTOS, NOTIFICACIONES Y DRAG & DROP (TÁCTIL Y MOUSE)
// =========================================================

function inicializarDarkMode() { /* Se mantiene igual */
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

function cargarEjemplo(numero) { /* Se mantiene igual */
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

function mostrarNotificacion(mensaje, tipo = 'info') { /* Se mantiene igual */
    const container = document.getElementById('notificacion-container');
    if (!container) return;
    const notif = document.createElement('div');
    notif.className = `notificacion ${tipo}`;
    const icono = tipo === 'error' ? '⚠️' : 'ℹ️';
    notif.innerHTML = `<div class="notificacion-body"><span class="notificacion-icon">${icono}</span><span class="notificacion-text">${mensaje}</span></div>`;
    container.appendChild(notif);
    const timer = setTimeout(() => cerrarNotificacion(notif), 4000);
    notif.addEventListener('click', () => { clearTimeout(timer); cerrarNotificacion(notif); });
}

function cerrarNotificacion(elemento) {
    elemento.classList.add('ocultar');
    elemento.addEventListener('animationend', () => elemento.remove());
}

function inicializarConvertidores() { /* Se mantiene igual */
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
        });
    });
}

function inicializarCanvasResponsivo() {
    window.addEventListener('resize', () => { if (partX !== 0) ejecutarSimulacion(true); });
}

// --- EL CORAZÓN DE LA INTERACTIVIDAD TÁCTIL (¡AQUÍ ESTÁ LA MAGIA PARA TU CELULAR!) ---
function inicializarEventosDrag() {
    const canvas = document.getElementById('lienzo');
    if (!canvas) return;

    // Función para obtener la posición exacta ya sea tocando con el dedo o con el mouse
    function obtenerPosicion(e) {
        const rect = canvas.getBoundingClientRect();
        // Si es táctil, usa e.touches[0]. Si es mouse, usa la e normal.
        const evt = e.touches ? e.touches[0] : e; 
        if (!evt) return null;
        const x = (evt.clientX - rect.left) * (canvas.width / rect.width);
        const y = (evt.clientY - rect.top) * (canvas.height / rect.height);
        return { x, y };
    }

    function alPresionar(e) {
        const pos = obtenerPosicion(e);
        if (!pos) return;
        
        // Área de detección un poco más grande (35px) porque los dedos son más gruesos que el cursor del ratón
        if (Math.hypot(pos.x - partX, pos.y - partY) < 35) {
            isDragging = true;
            draggedOnce = false;
            canvas.style.cursor = 'grabbing';
            if (ultimaVariableCalculada === 'angulo' || !ultimaVariableCalculada) ultimaVariableCalculada = 'carga';
            
            // IMPORTANTE: Evita que la pantalla del celular se mueva mientras arrastras la partícula
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
                ejecutarSimulacion(false); // Guarda el historial y actualiza consola
            }
        }
    }

    // Escuchamos el Mouse (Computadora)
    canvas.addEventListener('mousedown', alPresionar);
    canvas.addEventListener('mousemove', alMover);
    window.addEventListener('mouseup', alSoltar);

    // Escuchamos los Dedos (Teléfono Celular / Tablet)
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