
### 2. Motor Lógico Depurado: `app.js`
```javascript
let baseDatosReportes = JSON.parse(localStorage.getItem('reportes_sismo_cali')) || [];

// Variables globales para la memoria de fotos en Base64
let ultimaFoto1 = null, ultimaFoto2 = null, ultimaFoto3 = null;

document.addEventListener('DOMContentLoaded', () => {
    actualizarContador();
    obtenerGPSOpciones(); // Inicialización automática de ubicación del equipo al abrir

    // Enlazar los disparadores de eventos de la interfaz principal
    document.getElementById('sistema').addEventListener('change', manejarFiltroSistema);
    document.getElementById('sismoForm').addEventListener('submit', procesarGuardado);
    document.getElementById('btnExportar').addEventListener('click', exportarCapaGeoJSON);
    document.getElementById('btnLimpiar').addEventListener('click', limpiarAlmacenamientoLocal);
    document.getElementById('btnGenerarPDF').addEventListener('click', generarInformePDF);

    // Oyentes dinámicos para el semáforo de colores automático
    const triggers = ['g_colapso', 'g_fema', 'g_geotecnia', 'concreto_nudos', 'concreto_columnas', 'concreto_muros', 'confina_muros_x', 'confina_separacion', 'info_desplome', 'info_grietas_anchas', 'baha_uniones', 'baha_perdida'];
    triggers.forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.addEventListener('change', calcularHabitabilidadAlgoritmo);
        }
    });

    // Enlazar captura de fotos con compresión segura e instantánea
    document.getElementById('foto1').addEventListener('change', async (e) => { ultimaFoto1 = await optimizarYConvertirImagen(e.target.files[0]); });
    document.getElementById('foto2').addEventListener('change', async (e) => { ultimaFoto2 = await optimizarYConvertirImagen(e.target.files[0]); });
    document.getElementById('foto3').addEventListener('change', async (e) => { ultimaFoto3 = await optimizarYConvertirImagen(e.target.files[0]); });
});

// CAPTURA AUTOMÁTICA DEL GPS DEL EQUIPO (Sin intervención del usuario)
function obtenerGPSOpciones() {
    const gpsInput = document.getElementById('gps');
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => { 
                gpsInput.value = `${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`; 
            },
            (error) => { 
                gpsInput.value = "3.451649, -76.532049"; // Fallback del centro de Cali por seguridad si no hay señal
                console.warn("Permiso de GPS en espera o señal satelital ausente.");
            },
            { enableHighAccuracy: true, timeout: 15000 }
        );
    } else {
        gpsInput.value = "GPS no soportado por el hardware.";
    }
}

// FILTRO DINÁMICO DE PATOLOGÍAS SEGÚN MATERIAL SELECCIONADO
function manejarFiltroSistema() {
    const sistema = document.getElementById('sistema').value;
    const panelPatologias = document.getElementById('panelPatologias');
    const panelFotos = document.getElementById('panelFotos');
    
    // Ocultar todas las sub-opciones
    document.querySelectorAll('.panel-especifico').forEach(p => p.classList.add('hidden'));
    
    if (!sistema) {
        panelPatologias.classList.add('hidden');
        panelFotos.classList.add('hidden');
        document.getElementById('triageDisplay').innerText = "SELECCIONE UN SISTEMA CONSTRUCTIVO";
        document.getElementById('triageDisplay').style.backgroundColor = "#f1f5f9";
        document.getElementById('triageDisplay').style.color = "#0f172a";
        return;
    }

    panelPatologias.classList.remove('hidden');
    panelFotos.classList.remove('hidden');

    if (sistema === "Porticos Concreto") {
        document.getElementById('opcionesConcreto').classList.remove('hidden');
        configurarGuiasFotos("Concreto", "Fachada General", "Vista Ampliada del Elemento", "Detalle / Zoom");
    } else if (sistema === "Mamposteria Confinada") {
        document.getElementById('opcionesConfinada').classList.remove('hidden');
        configurarGuiasFotos("Mampostería Confinada", "Fachada General", "Vista Ampliada del Elemento", "Detalle / Zoom");
    } else if (sistema === "Mamposteria Informal") {
        document.getElementById('opcionesInformal').classList.remove('hidden');
        configurarGuiasFotos("Mampostería Informal", "Fachada General", "Vista Ampliada del Elemento", "Detalle / Zoom");
    } else if (sistema === "Bahareque Tapia") {
        document.getElementById('opcionesBahareque').classList.remove('hidden');
        configurarGuiasFotos("Bahareque/Tapia", "Fachada General", "Vista Ampliada del Elemento", "Detalle / Zoom");
    }
    calcularHabitabilidadAlgoritmo();
}

function configurarGuiasFotos(sistema, g1, g2, g3) {
    document.getElementById('lblFoto1').innerText = `Foto 1: ${g1} (${sistema})`;
    document.getElementById('wmFoto1').innerText = `GUÍA REVISOR: Contexto completo de la edificación y entorno urbano.`;
    document.getElementById('lblFoto2').innerText = `Foto 2: ${g2} (${sistema})`;
    document.getElementById('wmFoto2').innerText = `GUÍA REVISOR: Perspectiva del elemento estructural o muro afectado.`;
    document.getElementById('lblFoto3').innerText = `Foto 3: ${g3} (${sistema})`;
    document.getElementById('wmFoto3').innerText = `GUÍA REVISOR: Acercamiento métrico a la fisura o fractura del material.`;
}

// CÓMPUTO AUTOMÁTICO DE COLORES DEL SEMÁFORO DE HABITABILIDAD (Reactivo e Instantáneo)
function calcularHabitabilidadAlgoritmo() {
    const sistema = document.getElementById('sistema').value;
    if (!sistema) return;

    const colapso = document.getElementById('g_colapso').checked;
    const fema = document.getElementById('g_fema').checked;
    const geotecnia = document.getElementById('g_geotecnia').checked;
    
    // Capturas condicionales seguras (evitan errores si el panel está oculto)
    const cNudos = document.getElementById('concreto_nudos')?.checked || false;
    const cColumnas = document.getElementById('concreto_columnas')?.checked || false;
    const cMuros = document.getElementById('concreto_muros')?.checked || false;
    const mX = document.getElementById('confina_muros_x')?.checked || false;
    const mSepara = document.getElementById('confina_separacion')?.checked || false;
    const iDesplome = document.getElementById('info_desplome')?.checked || false;
    const iGrietas = document.getElementById('info_grietas_anchas')?.checked || false;
    const bUniones = document.getElementById('baha_uniones')?.checked || false;
    const bPerdida = document.getElementById('baha_perdida')?.checked || false;

    const display = document.getElementById('triageDisplay');
    let dictamen = "🟢 HABITABLE (Verde)";
    let colorBg = "#10b981";

    // Jerarquía de Triage Estructural Ley 400 / AIS
    if (colapso || cNudos || iDesplome) {
        dictamen = "🔴 PELIGRO DE COLAPSO / NO HABITABLE (Rojo)";
        colorBg = "#ef4444";
    } else if (cColumnas || mX || iGrietas || bUniones || geotecnia) {
        dictamen = "🟠 NO HABITABLE - EVALUACIÓN DETALLADA (Naranja)";
        colorBg = "#f97316";
    } else if (fema || cMuros || mSepara || bPerdida) {
        dictamen = "🟡 USO RESTRINGIDO - DAÑO MODERADO (Amarillo)";
        colorBg = "#f59e0b";
    }

    display.innerText = dictamen;
    display.style.backgroundColor = colorBg;
    display.style.color = "#ffffff";
}

// COMPRESIÓN ULTRALIGERA DE IMÁGENES (Solución definitiva al error de espacio de captura)
function optimizarYConvertirImagen(file) {
    return new Promise((resolve) => {
        if (!file) resolve(null);
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 500; // Redimensión óptima para no saturar memoria
                let width = img.width;
                let height = img.height;

                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d'); // Corrección del error de lienzo
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.60)); // Compresión óptima al 60%
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });
}

function procesarGuardado(e) {
    e.preventDefault();
    const gpsRaw = document.getElementById('gps').value.split(',');

    const registro = {
        meta_id: "REPORTE-CALI-" + Date.now(),
        meta_fecha: new Date().toLocaleString(),
        evaluador: document.getElementById('idEvaluador').value,
        cargo: document.getElementById('profesion').value,
        tarjeta: document.getElementById('matricula').value || "NO SUMINISTRADA",
        catastro: document.getElementById('catastro').value || "NO REGISTRADO",
        direccion: document.getElementById('direccion').value,
        coor_lat: parseFloat(gpsRaw[0]),
        coor_lon: parseFloat(gpsRaw[1]),
        sistema: document.getElementById('sistema').value,
        dictamen: document.getElementById('triageDisplay').innerText,
        observaciones: document.getElementById('notas').value || "Sin observaciones.",
        fotos: { f1: ultimaFoto1, f2: ultimaFoto2, f3: ultimaFoto3 }
    };

    baseDatosReportes.push(registro);
    localStorage.setItem('reportes_sismo_cali', JSON.stringify(baseDatosReportes));
    actualizarContador();
    alert("¡Registro estructural guardado con éxito localmente!");
    
    // Resetear variables de fotos
    ultimaFoto1 = null; ultimaFoto2 = null; ultimaFoto3 = null;
    document.getElementById('sismoForm').reset();
    obtenerGPSOpciones();
    manejarFiltroSistema();
}
