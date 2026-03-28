/**
 * SIMULADOR DE FÍSICA PRO (Multi-Tema)
 */

const g = 9.8;
let estadoSimulador = {
    tema: 'electrostatics', 
    darkMode: false,
    animacionActiva: null 
};

let partX = 0; let partY = 0; let isDragging = false; let draggedOnce = false;
let ultimaVariableCalculada = 'carga'; 

// =========================================================
// MÓDULO 1: UTILIDADES & UI (CONTROLADOR DE TEMAS)
// =========================================================

function leerInputConUnidad(idInput, idSelect) {
    const el = document.getElementById(idInput);
    if (!el || el.value === "") return undefined;
    
    let mult = 1;
    if (idSelect) {
        const selEl = document.getElementById(idSelect);
        if (selEl && selEl.value !== "") {
            let parsed = parseFloat(selEl.value);
            if (!isNaN(parsed)) mult = parsed;
        }
    }
    
    let parsedVal = parseFloat(el.value);
    return isNaN(parsedVal) ? undefined : parsedVal * mult;
}

function formatearNumero(num) {
    if (num === undefined || num === null || isNaN(num)) return "-";
    if (num === 0) return "0";
    if (Math.abs(num) < 0.001 || Math.abs(num) >= 10000) return num.toExponential(2);
    return parseFloat(num.toPrecision(4)).toString(); 
}

function inicializarSelectorTemas() {
    const selector = document.getElementById('selector-temas');
    if (!selector) return;
    selector.addEventListener('change', function() { cambiarTema(this.value); });
}

function cambiarTema(nuevoTema) {
    if (estadoSimulador.animacionActiva) {
        cancelAnimationFrame(estadoSimulador.animacionActiva);
        estadoSimulador.animacionActiva = null;
    }
    
    estadoSimulador.tema = nuevoTema;
    limpiarTodo(); 

    ['electrostatics', 'kinematics'].forEach(t => {
        document.getElementById(`panel-inputs-${t}`).style.display = 'none';
    });
    document.getElementById('panel-ejemplos-estatico').style.display = (nuevoTema === 'electrostatics') ? 'block' : 'none';
    document.getElementById(`panel-inputs-${nuevoTema}`).style.display = 'block';

    document.getElementById('consola-pasos').innerText = "Esperando datos...";
    if (nuevoTema === 'electrostatics') {
        document.getElementById('titulo-grafico').innerText = "⚛️ Diagrama de Equilibrio";
    } else {
        document.getElementById('titulo-grafico').innerText = "🚀 Trayectoria de Proyectiles";
    }
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
            if(estadoSimulador.tema === 'electrostatics' && partX !== 0) ejecutarSimulacionElectrostatics(true); 
        });
    });
}

// =========================================================
// MÓDULO 2: ELECTROSTÁTICA 
// =========================================================

function ejecutarSimulacionElectrostatics(esArrastre = false) {
    let registro = ["=== PROCEDIMIENTO MATEMÁTICO (ELECTROSTÁTICA) ==="];
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
    
    let W = leerInputConUnidad('peso', 'unidad-peso');
    let T = leerInputConUnidad('tension', 'unidad-tension');
    let Fe = leerInputConUnidad('fuerza', 'unidad-fuerza');

    let conteoInputs = [m, theta, E, q, W, T, Fe].filter(v => v !== undefined).length;
    
    if (conteoInputs < 2 && !esArrastre) {
        mostrarNotificacion(`Faltan datos. Ingresa al menos 2 parámetros para calcular.`, 'error');
        return;
    }

    try {
        if (theta !== undefined && theta >= 90) throw new Error("Ángulo ≥ 90° es físicamente imposible.");
        for (let i = 0; i < 3; i++) {
            if (m !== undefined && W === undefined) { 
                W = m * g; addStep("Calculando Peso (W)", "W = m · g", `W = ${m.toPrecision(4)} · 9.8`, `W = ${W.toPrecision(4)} N`); 
            }
            if (W !== undefined && m === undefined) { 
                m = W / g; addStep("Calculando Masa (m)", "m = W / g", `m = ${W.toPrecision(4)} / 9.8`, `m = ${m.toPrecision(4)} kg`); 
            }
            if (theta !== undefined && T !== undefined) {
                if (W === undefined) { W = T * Math.cos(theta * Math.PI/180); addStep("Calculando Peso (W)", "W = T · cos(θ)", `W = ${T.toPrecision(4)} · cos(${theta}°)`, `W = ${W.toPrecision(4)} N`); }
                if (Fe === undefined) { Fe = T * Math.sin(theta * Math.PI/180); addStep("Calculando Fuerza Eléctrica (Fe)", "Fe = T · sin(θ)", `Fe = ${T.toPrecision(4)} · sin(${theta}°)`, `Fe = ${Fe.toPrecision(4)} N`); }
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
                q = Fe / E; addStep("Calculando Carga (q)", "q = Fe / E", `q = ${Fe.toPrecision(4)} / ${E.toExponential(3)}`, `q = ${q.toExponential(4)} C`);
            }
            if (q !== undefined && E !== undefined && Fe === undefined) {
                Fe = Math.abs(q * E); addStep("Calculando Fuerza Eléctrica (Fe)", "Fe = |q · E|", `|${q.toExponential(3)} · ${E.toExponential(3)}|`, `Fe = ${Fe.toPrecision(4)} N`);
            }
        }
    } catch (error) {
        if (!esArrastre) mostrarNotificacion(error.message, 'error');
        document.getElementById('consola-pasos').innerText = "❌ Error: " + error.message; return;
    }

    const asignarSeguro = (idInput, valor, idUnidad) => {
        const input = document.getElementById(idInput);
        if (!input || valor === undefined || isNaN(valor)) return;
        
        const factor = idUnidad ? parseFloat(document.getElementById(idUnidad).value) : 1;
        const valorFinal = valor / factor;
        
        if (!isNaN(valorFinal) && isFinite(valorFinal)) {
            input.value = parseFloat(valorFinal.toPrecision(5));
        }
    };

    asignarSeguro('masa', m, 'unidad-masa');
    asignarSeguro('angulo', theta, null);
    asignarSeguro('campo', E, 'unidad-campo');
    asignarSeguro('carga', q, 'unidad-carga');
    asignarSeguro('peso', W, 'unidad-peso');
    asignarSeguro('tension', T, 'unidad-tension');
    asignarSeguro('fuerza', Fe, 'unidad-fuerza');

    if (!esArrastre) {
        registro = registro.concat(bloquePrincipal);
        document.getElementById('consola-pasos').innerText = registro.join('\n');
    }

    dibujarDCL(theta, q, E, W, T, Fe, m);
    if (!esArrastre) agregarHistorial('Eléctrico', m, theta, undefined, E, q, T, Fe);
}

function dibujarDCL(theta, q, E, wVal, tVal, feVal, mVal) {
    const canvas = document.getElementById('lienzo');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const wrapper = canvas.parentElement;
    canvas.width = wrapper.clientWidth; 
    canvas.height = window.innerWidth >= 768 ? 450 : Math.max(wrapper.clientWidth * 0.75, 280); 
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const safeNum = (val) => (val !== undefined && val !== null && !isNaN(val));
    const safePrecision = (val, prec) => safeNum(val) ? val.toPrecision(prec) : "?";
    const getSelectText = (id, def) => {
        const el = document.getElementById(id);
        return (el && el.options && el.selectedIndex >= 0) ? el.options[el.selectedIndex].text : def;
    };
    const getSelectVal = (id) => {
        const el = document.getElementById(id);
        return (el && el.value !== "" && !isNaN(parseFloat(el.value))) ? parseFloat(el.value) : 1;
    };

    const origenX = canvas.width / 2; const origenY = 40; const longitudCuerda = canvas.height * 0.55; 
    
    let safeTheta = safeNum(theta) ? theta : 0;
    let safeE = safeNum(E) ? E : 1; 
    let safeQ = safeNum(q) ? q : 1;

    const direccionDesvio = (safeQ * safeE >= 0) ? 1 : -1;
    const thetaRad = safeTheta * (Math.PI / 180) * direccionDesvio;
    const px = origenX + longitudCuerda * Math.sin(thetaRad);
    const py = origenY + longitudCuerda * Math.cos(thetaRad);
    partX = px; partY = py;

    ctx.fillStyle = safeE >= 0 ? 'rgba(220, 53, 69, 0.12)' : 'rgba(0, 86, 179, 0.12)'; ctx.fillRect(0, 0, 25, canvas.height);
    ctx.fillStyle = safeE >= 0 ? 'rgba(0, 86, 179, 0.12)' : 'rgba(220, 53, 69, 0.12)'; ctx.fillRect(canvas.width - 25, 0, 25, canvas.height);
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    ctx.fillStyle = safeE >= 0 ? '#ff6b6b' : '#4dabf7'; ctx.font = "bold 20px Arial"; ctx.textAlign = 'center'; 
    ctx.fillText(safeE >= 0 ? "+" : "-", 12, canvas.height / 2 + 7);
    ctx.fillStyle = safeE >= 0 ? '#4dabf7' : '#ff6b6b'; 
    ctx.fillText(safeE >= 0 ? "-" : "+", canvas.width - 12, canvas.height / 2 + 7);

    ctx.setLineDash([5, 5]); ctx.strokeStyle = isDark ? '#555' : '#aaa'; 
    ctx.beginPath(); ctx.moveTo(origenX, origenY); ctx.lineTo(origenX, canvas.height - 15); ctx.stroke();
    
    if (Math.abs(safeTheta) > 1) {
        ctx.beginPath(); let sA, eA, ac;
        if (direccionDesvio === 1) { sA = Math.PI/2 - thetaRad; eA = Math.PI/2; ac = false; } else { sA = Math.PI/2; eA = Math.PI/2 - thetaRad; ac = true; }
        ctx.arc(origenX, origenY, 50, sA, eA, ac); ctx.strokeStyle = '#007bff'; ctx.lineWidth = 2; ctx.stroke();
        dibujarTextoFondo(ctx, `θ = ${safeTheta.toFixed(1)}°`, origenX + (direccionDesvio * 20), origenY + 65, '#007bff');
    }
    ctx.setLineDash([]);

    ctx.strokeStyle = '#aaa'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(origenX - 50, origenY); ctx.lineTo(origenX + 50, origenY); ctx.stroke();
    ctx.lineWidth = 2; ctx.strokeStyle = isDark ? '#fff' : '#000'; ctx.beginPath(); ctx.moveTo(origenX, origenY); ctx.lineTo(px, py); ctx.stroke();

    const vecScale = canvas.height / 350;
    dibujarFlecha(ctx, px, py, origenX, origenY, '#007bff', `T=${safePrecision(tVal, 3)}N`, vecScale);
    dibujarFlecha(ctx, px, py, px, py + 60 * vecScale, '#28a745', `W=${safePrecision(wVal, 3)}N`, vecScale);
    dibujarFlecha(ctx, px, py, px + (70 * vecScale * direccionDesvio), py, '#dc3545', `Fe=${safePrecision(feVal, 3)}N`, vecScale);

    ctx.beginPath(); ctx.arc(px, py, 18, 0, Math.PI * 2); ctx.fillStyle = (safeNum(q) && q >= 0) ? '#ff5722' : '#3f51b5'; ctx.fill();
    ctx.fillStyle = 'white'; ctx.textAlign = 'center'; 
    
    // --- SOLUCIÓN VISUAL: Adaptar tamaño de texto si es notación científica
    let qMostrar = safeNum(q) ? safePrecision(q / getSelectVal('unidad-carga'), 3) : "?";
    ctx.font = qMostrar.length > 5 ? "bold 9px Arial" : "bold 11px Arial";
    ctx.fillText(`${(safeNum(q) && q > 0) ? '+' : ''}${qMostrar} ${getSelectText('unidad-carga', 'C')}`, px, py + 4);
    
    let mMostrar = safeNum(mVal) ? safePrecision(mVal / getSelectVal('unidad-masa'), 3) : "?";
    ctx.fillStyle = isDark ? '#ccc' : '#555'; ctx.font = "bold 12px Arial"; 
    ctx.fillText(`m = ${mMostrar} ${getSelectText('unidad-masa', 'kg')}`, px, py + 35);
}

// =========================================================
// MÓDULO 3: CINEMÁTICA INTELIGENTE 
// =========================================================

function ejecutarSimulacionKinematics() {
    let registro = ["=== PROCEDIMIENTO MATEMÁTICO (CINEMÁTICA) ==="];
    let bloquePrincipal = [];
    let logSet = new Set();
    
    function addStep(titulo, formula, sustitucion, resultado) {
        let key = titulo;
        if (!logSet.has(key)) {
            logSet.add(key);
            bloquePrincipal.push(`\n> ${titulo}`);
            if(formula) bloquePrincipal.push(`  Fórmula: ${formula}`);
            if(sustitucion) bloquePrincipal.push(`  Sustitución: ${sustitucion}`);
            bloquePrincipal.push(`  Resultado: ${resultado}`);
        }
    }
    
    let v0 = leerInputConUnidad('v0_k', 'unidad-v0_k');
    let theta_deg = leerInputConUnidad('angulo_k', null);
    let gk = leerInputConUnidad('g_k', null);
    let ax = leerInputConUnidad('ax_k', null);
    
    let rmax_input = leerInputConUnidad('rmax_k', 'unidad-rmax_k');
    let hmax_input = leerInputConUnidad('hmax_k', 'unidad-hmax_k');
    let t_input = leerInputConUnidad('t_k', 'unidad-t_k');

    if (gk === undefined) gk = 9.8;
    if (ax === undefined) ax = 0; 

    // --- SOLUCIÓN DE JERARQUÍA: v0 y Ángulo mandan. Si existen, ignoramos los inputs manuales erróneos.
    if (v0 !== undefined && theta_deg !== undefined) {
        rmax_input = undefined;
        hmax_input = undefined;
        t_input = undefined;
    }

    try {
        for(let i=0; i<3; i++) {
            if (v0 !== undefined && theta_deg !== undefined && (rmax_input === undefined || hmax_input === undefined || t_input === undefined)) {
                let theta_rad = theta_deg * (Math.PI / 180);
                let v0x = v0 * Math.cos(theta_rad);
                let v0y = v0 * Math.sin(theta_rad);
                
                if (t_input === undefined) {
                    t_input = 2 * (v0y / gk);
                    addStep("Calculando Tiempo Total (t)", "t = 2(v₀·sin(θ))/g", `t = 2(${v0}·sin(${theta_deg}°))/${gk}`, `t = ${t_input.toFixed(2)} s`);
                }
                if (hmax_input === undefined) {
                    hmax_input = (v0y * v0y) / (2 * gk);
                    addStep("Calculando Altura Máxima (Hmax)", "Hmax = (v₀·sin(θ))² / 2g", `Hmax = (${v0y.toFixed(2)})² / (2·${gk})`, `Hmax = ${hmax_input.toFixed(2)} m`);
                }
                if (rmax_input === undefined) {
                    rmax_input = (v0x * t_input) + (0.5 * ax * t_input * t_input);
                    addStep("Calculando Alcance (Rmax)", "Rmax = v₀ₓ·t + ½aₓ·t²", `Rmax = (${v0x.toFixed(2)}·${t_input.toFixed(2)}) + 0.5(${ax})(${t_input.toFixed(2)})²`, `Rmax = ${rmax_input.toFixed(2)} m`);
                }
            }
            
            if (rmax_input !== undefined && theta_deg !== undefined && v0 === undefined && ax === 0) {
                let theta_rad = theta_deg * (Math.PI / 180);
                v0 = Math.sqrt((rmax_input * gk) / Math.sin(2 * theta_rad));
                addStep("Despejando Velocidad Inicial (v₀) desde Rmax", "v₀ = √(Rmax·g / sin(2θ))", `v₀ = √(${rmax_input}·${gk} / sin(${2*theta_deg}°))`, `v₀ = ${v0.toFixed(2)} m/s`);
            }
            
            if (hmax_input !== undefined && theta_deg !== undefined && v0 === undefined) {
                let theta_rad = theta_deg * (Math.PI / 180);
                let v0y = Math.sqrt(2 * gk * hmax_input);
                v0 = v0y / Math.sin(theta_rad);
                addStep("Despejando Velocidad Inicial (v₀) desde Hmax", "v₀ = √(2g·Hmax) / sin(θ)", `v₀ = √(2·${gk}·${hmax_input}) / sin(${theta_deg}°)`, `v₀ = ${v0.toFixed(2)} m/s`);
            }
            
            if (v0 !== undefined && rmax_input !== undefined && theta_deg === undefined && ax === 0) {
                let sin2theta = (rmax_input * gk) / (v0 * v0);
                if(sin2theta > 1) throw new Error("Ese alcance es imposible con esa velocidad inicial.");
                theta_deg = (Math.asin(sin2theta) / 2) * (180 / Math.PI);
                addStep("Despejando Ángulo (θ) desde Rmax", "θ = ½ arcsin(Rmax·g / v₀²)", `θ = ½ arcsin(${rmax_input}·${gk} / ${v0}²)`, `θ = ${theta_deg.toFixed(2)}°`);
            }
        }
    } catch(err) {
        mostrarNotificacion(err.message, 'error');
        document.getElementById('consola-pasos').innerText = "❌ Error: " + err.message;
        return;
    }

    if (v0 === undefined || theta_deg === undefined) {
        mostrarNotificacion(`Faltan datos. Ingresa al menos (v₀ y θ) o (Rmax y θ).`, 'error'); 
        return;
    }

    const asignarSeguroK = (idInput, valor, idUnidad) => {
        const input = document.getElementById(idInput);
        if (!input || valor === undefined || isNaN(valor)) return;
        const factor = idUnidad ? parseFloat(document.getElementById(idUnidad).value) : 1;
        input.value = parseFloat((valor / factor).toPrecision(5));
    };

    asignarSeguroK('v0_k', v0, 'unidad-v0_k');
    asignarSeguroK('angulo_k', theta_deg, null);
    asignarSeguroK('rmax_k', rmax_input, 'unidad-rmax_k');
    asignarSeguroK('hmax_k', hmax_input, 'unidad-hmax_k');
    asignarSeguroK('t_k', t_input, 'unidad-t_k');
    
    registro = registro.concat(bloquePrincipal);
    registro.push(`\n=== TRAYECTORIA CALCULADA. ANIMANDO... ===`);
    document.getElementById('consola-pasos').innerText = registro.join('\n');
    
    let theta_rad = theta_deg * (Math.PI / 180);
    let v0x = v0 * Math.cos(theta_rad);
    let v0y = v0 * Math.sin(theta_rad);
    
    iniciarAnimacionKinematics(v0x, v0y, ax, gk, t_input, rmax_input, hmax_input);
    
    agregarHistorial('Proyectil', undefined, theta_deg, v0, undefined, undefined, rmax_input, hmax_input);
}

function iniciarAnimacionKinematics(v0x, v0y, ax, gy, t_flight, Rmax, Hmax) {
    const canvas = document.getElementById('lienzo');
    const ctx = canvas.getContext('2d');
    const wrapper = canvas.parentElement;
    canvas.width = wrapper.clientWidth; 
    canvas.height = window.innerWidth >= 768 ? 450 : Math.max(wrapper.clientWidth * 0.75, 280); 
    
    if (estadoSimulador.animacionActiva) cancelAnimationFrame(estadoSimulador.animacionActiva);
    let startTime = DateOfNow();
    
    const padding = 40; 
    const availableWidth = canvas.width - (padding * 2);
    const availableHeight = canvas.height - (padding * 2);
    
    let maxAbsX = Math.abs(Rmax) < 0.1 ? 1 : Math.abs(Rmax);
    let maxAbsY = Hmax < 0.1 ? 1 : Hmax;

    let scaleX = availableWidth / maxAbsX;
    let scaleY = availableHeight / maxAbsY;
    
    let scaleUniform = Math.min(scaleX, scaleY);
    
    const offsetX = padding;
    const offsetY = canvas.height - padding; 

    function animar() {
        let elapsed_sec = (DateOfNow() - startTime) / 1000 * 1.5; 
        if (elapsed_sec > t_flight) { elapsed_sec = t_flight; estadoSimulador.animacionActiva = null; 
        } else { estadoSimulador.animacionActiva = requestAnimationFrame(animar); }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        ctx.strokeStyle = isDarkMode() ? '#444' : '#ccc'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(0, offsetY); ctx.lineTo(canvas.width, offsetY); ctx.stroke();

        let cur_x = (v0x * elapsed_sec) + (0.5 * ax * elapsed_sec * elapsed_sec);
        let cur_y = (v0y * elapsed_sec) - (0.5 * gy * elapsed_sec * elapsed_sec);
        let cur_vx = v0x + (ax * elapsed_sec);
        let cur_vy = v0y - (gy * elapsed_sec);
        let cur_v = Math.sqrt(cur_vx*cur_vx + cur_vy*cur_vy);

        let px = offsetX + (cur_x * scaleUniform);
        let py = offsetY - (cur_y * scaleUniform);

        ctx.beginPath(); ctx.lineWidth = 2; ctx.strokeStyle = isDarkMode() ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)'; ctx.setLineDash([5, 5]);
        for (let t = 0; t <= t_flight; t += t_flight/50) {
            let path_x = offsetX + ((v0x * t) + (0.5 * ax * t * t)) * scaleUniform;
            let path_y = offsetY - ((v0y * t) - (0.5 * gy * t * t)) * scaleUniform;
            t === 0 ? ctx.moveTo(path_x, path_y) : ctx.lineTo(path_x, path_y);
        }
        ctx.stroke(); ctx.setLineDash([]);

        const vectorLen = 40; 
        let dir_x = cur_vx === 0 ? 0 : (cur_vx / cur_v) * vectorLen;
        let dir_y = cur_vy === 0 ? 0 : (cur_vy / cur_v) * vectorLen;
        
        dibujarFlecha(ctx, px, py, px + dir_x, py, '#28a745', '', 1); 
        dibujarFlecha(ctx, px, py, px, py - dir_y, '#dc3545', '', 1); 
        dibujarFlecha(ctx, px, py, px + dir_x, py - dir_y, '#007bff', '', 1); 

        ctx.beginPath(); ctx.arc(px, py, 8, 0, Math.PI * 2); ctx.fillStyle = '#ff6b6b'; ctx.shadowBlur = 10; ctx.shadowColor = '#ff6b6b'; ctx.fill(); 
        ctx.shadowBlur = 0; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
        
        ctx.font = "bold 12px Arial"; ctx.fillStyle = isDarkMode() ? '#fff' : '#333'; ctx.textAlign = 'left'; 
        let textoPosX = px + 15 > canvas.width - 120 ? px - 120 : px + 15; 
        let textoPosY = py - 30 < 20 ? py + 30 : py - 30; 
        
        ctx.fillText(`t: ${elapsed_sec.toFixed(2)}s | x: ${cur_x.toFixed(1)}m | y: ${cur_y.toFixed(1)}m`, textoPosX, textoPosY);
        ctx.fillText(`|V|: ${cur_v.toFixed(1)}m/s`, textoPosX, textoPosY + 15);
    }
    animar();
}

// =========================================================
// MÓDULO 4: UI COMÚN & HISTORIAL 
// =========================================================

function dibujarTextoFondo(ctx, texto, x, y, colorText) {
    ctx.font = "bold 12px Arial";
    const textWidth = ctx.measureText(texto).width;
    ctx.fillStyle = document.body.getAttribute('data-theme') === 'dark' ? 'rgba(30, 30, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)';
    ctx.fillRect(x - (textWidth / 2) - 4, y - 12, textWidth + 8, 16);
    ctx.fillStyle = colorText;
    ctx.textAlign = 'center';
    ctx.fillText(texto, x, y);
}

function dibujarFlecha(ctx, fromx, fromy, tox, toy, color, texto, scale) {
    const headlen = 10 * scale; 
    const dx = tox - fromx;
    const dy = toy - fromy;
    const angle = Math.atan2(dy, dx);
    
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2 * scale;
    
    ctx.beginPath(); ctx.moveTo(fromx, fromy); ctx.lineTo(tox, toy); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(tox, toy);
    ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
    ctx.fill();
    
    if (texto !== '') {
        ctx.font = `bold ${12 * scale}px Arial`;
        // --- SOLUCIÓN VISUAL: Distancia dinámica para que el texto no tape la partícula ---
        let textDist = 25 * scale; 
        ctx.fillText(texto, tox + textDist * Math.cos(angle), toy + textDist * Math.sin(angle) + 5);
    }
}

function isDarkMode() { return document.body.getAttribute('data-theme') === 'dark'; }
function DateOfNow() { return new Date().getTime(); }

function agregarHistorial(tipo, m, theta, v0, E, q, T_or_Rmax, Fe_or_Hmax) {
    const tableBody = document.querySelector('#tabla-resultados tbody');
    if (!tableBody) return;
    const row = tableBody.insertRow(0);
    row.style.animation = "fadeIn 0.4s ease-out";
    
    row.innerHTML = `
        <td><span style="background:var(--primary);color:white;padding:2px 6px;border-radius:4px;font-size:0.75rem;">${tipo}</span></td>
        <td>${m !== undefined ? formatearNumero(m) : '-'}</td>
        <td>${theta !== undefined ? theta.toFixed(1) + '°' : '-'}</td>
        <td>${v0 !== undefined ? formatearNumero(v0) : '-'}</td>
        <td>${E !== undefined ? formatearNumero(E) : '-'}</td>
        <td>${q !== undefined ? formatearNumero(q) : '-'}</td>
        <td>${T_or_Rmax !== undefined ? formatearNumero(T_or_Rmax) : '-'}</td>
        <td>${Fe_or_Hmax !== undefined ? formatearNumero(Fe_or_Hmax) : '-'}</td>
    `;
    if (window.innerWidth < 768 && tableBody.rows.length > 5) tableBody.deleteRow(5);
}

function limpiarTodo() {
    if (estadoSimulador.tema === 'electrostatics') {
        ['masa', 'angulo', 'campo', 'carga', 'peso', 'tension', 'fuerza'].forEach(id => { if(document.getElementById(id)) document.getElementById(id).value = ""; });
    } else {
        ['v0_k', 'angulo_k', 'rmax_k', 'hmax_k', 't_k'].forEach(id => { if(document.getElementById(id)) document.getElementById(id).value = ""; });
        document.getElementById('g_k').value = 9.8;
        document.getElementById('ax_k').value = 0;
    }
    document.getElementById('consola-pasos').innerText = "Esperando datos...";
    if (estadoSimulador.animacionActiva) cancelAnimationFrame(estadoSimulador.animacionActiva);
    const canvas = document.getElementById('lienzo');
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    partX = 0; partY = 0; 
}

function mostrarNotificacion(mensaje, tipo = 'info') { const container = document.getElementById('notificacion-container'); if (!container) return; const notif = document.createElement('div'); notif.className = `notificacion ${tipo}`; const icono = tipo === 'error' ? '⚠️' : 'ℹ️'; notif.innerHTML = `<div class="notificacion-body"><span class="notificacion-icon">${icono}</span><span class="notificacion-text" style="line-height:1.4;">${mensaje}</span></div>`; container.appendChild(notif); const timer = setTimeout(() => cerrarNotificacion(notif), 5000); notif.addEventListener('click', () => { clearTimeout(timer); cerrarNotificacion(notif); }); }
function cerrarNotificacion(elemento) { elemento.classList.add('ocultar'); elemento.addEventListener('animationend', () => elemento.remove()); }

function inicializarDarkMode() { const toggle = document.getElementById('dark-mode-toggle'); if (!toggle) return; const temaGuardado = localStorage.getItem('theme'); if (temaGuardado === 'dark' || (!temaGuardado && window.matchMedia('(prefers-color-scheme: dark)').matches)) { document.body.setAttribute('data-theme', 'dark'); toggle.checked = true; estadoSimulador.darkMode = true; } toggle.addEventListener('change', function() { if (this.checked) { document.body.setAttribute('data-theme', 'dark'); localStorage.setItem('theme', 'dark'); estadoSimulador.darkMode = true; } else { document.body.removeAttribute('data-theme'); localStorage.setItem('theme', 'light'); estadoSimulador.darkMode = false; } if (partX !== 0 && estadoSimulador.tema === 'electrostatics') ejecutarSimulacionElectrostatics(true); }); }
function cargarEjemplo(n) { limpiarTodo(); let mults = {g: 1e-3, kN: 1e3, µ: 1e-6}; switch(n) { case 1: document.getElementById('masa').value = 10; document.getElementById('unidad-masa').value = mults.g; document.getElementById('angulo').value = 30; document.getElementById('campo').value = 500; break; case 2: document.getElementById('masa').value = 50; document.getElementById('unidad-masa').value = mults.g; document.getElementById('campo').value = 26; document.getElementById('unidad-campo').value = mults.kN; break; case 3: document.getElementById('peso').value = 0.2; document.getElementById('angulo').value = 15; document.getElementById('carga').value = -5; document.getElementById('unidad-carga').value = mults.µ; break; } setTimeout(() => ejecutarSimulacionElectrostatics(false), 300); }

function inyectarModalConfirmacion() { if (document.getElementById('modal-confirmacion')) return; const modalHTML = ` <div id="modal-confirmacion" class="modal-overlay"> <div class="modal-content"> <h3>⚠️ Borrar Historial</h3> <p>¿Estás seguro? Esta acción eliminará permanentemente todos los registros del historial.</p> <div class="modal-botones"> <button id="btn-cancelar-modal" class="btn-secundario full-width">Cancelar</button> <button id="btn-confirmar-modal" class="btn-principal btn-peligro full-width">Sí, borrar</button> </div> </div> </div> `; document.body.insertAdjacentHTML('beforeend', modalHTML); document.getElementById('btn-cancelar-modal').addEventListener('click', () => { document.getElementById('modal-confirmacion').classList.remove('active'); }); document.getElementById('btn-confirmar-modal').addEventListener('click', () => { document.querySelector('#tabla-resultados tbody').innerHTML = ""; document.getElementById('modal-confirmacion').classList.remove('active'); mostrarNotificacion("Historial borrado correctamente.", 'info'); }); }
function limpiarHistorial() { const tbody = document.querySelector('#tabla-resultados tbody'); if (tbody && tbody.rows.length > 0) { document.getElementById('modal-confirmacion').classList.add('active'); } else { mostrarNotificacion("El historial ya está vacío.", 'info'); } }

// =========================================================
// MÓDULO 5: DRAG & DROP (ELECTROSTÁTICA) Y EVENTOS EXTRA
// =========================================================

function inicializarEventosDrag() {
    const canvas = document.getElementById('lienzo');
    function obtenerPos(e) { let rect = canvas.getBoundingClientRect(); let evt = e.touches ? e.touches[0] : e; if (!evt) return null; return { x: (evt.clientX - rect.left) * (canvas.width / rect.width), y: (evt.clientY - rect.top) * (canvas.height / rect.height) }; }
    
    function alPresionar(e) {
        if (estadoSimulador.tema !== 'electrostatics') return; 
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
        
        if (ultimaVariableCalculada && ultimaVariableCalculada !== 'angulo') {
            let el = document.getElementById(ultimaVariableCalculada);
            if (el) el.value = "";
        }
        
        ['peso', 'tension', 'fuerza'].forEach(id => { if(document.getElementById(id)) document.getElementById(id).value = ""; });
        ejecutarSimulacionElectrostatics(true); 
    }
    
    function alSoltar(e) { if (isDragging) { isDragging = false; canvas.style.cursor = 'grab'; if (draggedOnce) { 
        if (ultimaVariableCalculada && ultimaVariableCalculada !== 'angulo') {
            let el = document.getElementById(ultimaVariableCalculada);
            if (el) el.value = "";
        }
        ['peso', 'tension', 'fuerza'].forEach(id => { if(document.getElementById(id)) document.getElementById(id).value = ""; }); ejecutarSimulacionElectrostatics(false); } } }
    
    function alDobleClic(e) {
        if (estadoSimulador.tema !== 'electrostatics') return;
        let pos = obtenerPos(e); if (!pos) return;
        
        if (Math.hypot(pos.x - partX, pos.y - partY) < 35) {
            let qEl = document.getElementById('carga');
            if (qEl && qEl.value !== "") {
                let qActual = parseFloat(qEl.value);
                if (!isNaN(qActual) && qActual !== 0) {
                    qEl.value = (qActual * -1).toString(); 
                    
                    ['peso', 'tension', 'fuerza'].forEach(id => { if(document.getElementById(id)) document.getElementById(id).value = ""; });
                    if (ultimaVariableCalculada && ultimaVariableCalculada !== 'angulo' && ultimaVariableCalculada !== 'carga') {
                        let el = document.getElementById(ultimaVariableCalculada);
                        if (el) el.value = "";
                    }
                    
                    ejecutarSimulacionElectrostatics(false);
                }
            }
        }
    }

    canvas.addEventListener('mousedown', alPresionar); canvas.addEventListener('mousemove', alMover); window.addEventListener('mouseup', alSoltar); 
    canvas.addEventListener('touchstart', alPresionar, {passive: false}); canvas.addEventListener('touchmove', alMover, {passive: false}); window.addEventListener('touchend', alSoltar);
    
    canvas.addEventListener('dblclick', alDobleClic);
}

document.addEventListener('DOMContentLoaded', () => {
    inicializarDarkMode();    
    inicializarConvertidores(); 
    window.addEventListener('resize', () => { if (partX !== 0 && estadoSimulador.tema === 'electrostatics') ejecutarSimulacionElectrostatics(true); });
    inicializarEventosDrag();
    inyectarModalConfirmacion();
    inicializarSelectorTemas(); 

    document.getElementById('btn-resolver-electrostatics').addEventListener('click', () => ejecutarSimulacionElectrostatics(false));
    document.getElementById('btn-lanzar-kinematics').addEventListener('click', ejecutarSimulacionKinematics);
});
