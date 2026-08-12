let baseDatosReportes = JSON.parse(localStorage.getItem('reportes_sismo_cali')) || [];

document.addEventListener('DOMContentLoaded', () => {
    actualizarContador();
    obtenerGPSOpciones();

    document.getElementById('sistema').addEventListener('change', manejarFiltroSistema);
    document.getElementById('sismoForm').addEventListener('submit', procesarGuardado);
    document.getElementById('btnExportar').addEventListener('click', exportarCapaGeoJSON);
    document.getElementById('btnLimpiar').addEventListener('click', limpiarAlmacenamientoLocal);
    
    // NUEVO DISPARADOR: Motor de renderizado PDF
    document.getElementById('btnGenerarPDF').addEventListener('click', generarInformePDF);

    const triggers = ['g_colapso', 'g_fema', 'g_geotecnia', 'concreto_nudos', 'concreto_columnas', 'concreto_muros', 'confina_muros_x', 'confina_separacion', 'info_desplome', 'info_grietas_anchas', 'baha_uniones', 'baha_perdida'];
    triggers.forEach(id => {
        document.getElementById(id).addEventListener('change', calcularHabitabilidadAlgoritmo);
    });
});

function obtenerGPSOpciones() {
    const gpsInput = document.getElementById('gps');
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => { gpsInput.value = `${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`; },
            () => { gpsInput.value = "3.451649, -76.532049"; },
            { enableHighAccuracy: true }
        );
    }
}

function manejarFiltroSistema() {
    const sistema = document.getElementById('sistema').value;
    const panelPatologias = document.getElementById('panelPatologias');
    const panelFotos = document.getElementById('panelFotos');
    
    document.querySelectorAll('.panel-especifico').forEach(p => p.classList.add('hidden'));
    
    if (!sistema) {
        panelPatologias.classList.add('hidden');
        panelFotos.classList.add('hidden');
        document.getElementById('triageDisplay').innerText = "SELECCIONE UN SISTEMA CONSTRUCTIVO";
        return;
    }

    panelPatologias.classList.remove('hidden');
    panelFotos.classList.remove('hidden');

    if (sistema === "Porticos Concreto") {
        document.getElementById('opcionesConcreto').classList.remove('hidden');
        configurarGuiasFotos("Concreto", "Registro General de la Fachada", "Vista Ampliada del Elemento", "Detalle / Zoom de la Patología");
    } else if (sistema === "Mamposteria Confinada") {
        document.getElementById('opcionesConfinada').classList.remove('hidden');
        configurarGuiasFotos("Mampostería Confinada", "Registro General de la Fachada", "Vista Ampliada del Elemento", "Detalle / Zoom de la Patología");
    } else if (sistema === "Mamposteria Informal") {
        document.getElementById('opcionesInformal').classList.remove('hidden');
        configurarGuiasFotos("Mampostería Informal", "Registro General de la Fachada", "Vista Ampliada del Elemento", "Detalle / Zoom de la Patología");
    } else if (sistema === "Bahareque Tapia") {
        document.getElementById('opcionesBahareque').classList.remove('hidden');
        configurarGuiasFotos("Bahareque/Tapia", "Registro General de la Fachada", "Vista Ampliada del Elemento", "Detalle / Zoom de la Patología");
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

function calcularHabitabilidadAlgoritmo() {
    const sistema = document.getElementById('sistema').value;
    if (!sistema) return;

    const colapso = document.getElementById('g_colapso').checked;
    const fema = document.getElementById('g_fema').checked;
    const geotecnia = document.getElementById('g_geotecnia').checked;
    const cNudos = document.getElementById('concreto_nudos').checked;
    const cColumnas = document.getElementById('concreto_columnas').checked;
    const cMuros = document.getElementById('concreto_muros').checked;
    const mX = document.getElementById('confina_muros_x').checked;
    const mSepara = document.getElementById('confina_separacion').checked;
    const iDesplome = document.getElementById('info_desplome').checked;
    const iGrietas = document.getElementById('info_grietas_anchas').checked;
    const bUniones = document.getElementById('baha_uniones').checked;
    const bPerdida = document.getElementById('baha_perdida').checked;

    const display = document.getElementById('triageDisplay');
    let dictamen = "🟢 HABITABLE (Verde)";
    let colorBg = "#10b981";

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

function optimizarYConvertirImagen(file) {
    return new Promise((resolve) => {
        if (!file || file.length === 0) resolve(null);
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 500;
                let width = img.width;
                let height = img.height;

                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.65));
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });
}

// Variables temporales en memoria de sesión para capturar las últimas imágenes procesadas para el PDF
let ultimaFoto1 = null, ultimaFoto2 = null, ultimaFoto3 = null;
document.getElementById('foto1').addEventListener('change', async (e) => { ultimaFoto1 = await optimizarYConvertirImagen(e.target.files); });
document.getElementById('foto2').addEventListener('change', async (e) => { ultimaFoto2 = await optimizarYConvertirImagen(e.target.files); });
document.getElementById('foto3').addEventListener('change', async (e) => { ultimaFoto3 = await optimizarYConvertirImagen(e.target.files); });

async function procesarGuardado(e) {
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
}

// ARQUITECTURA DE GENERACIÓN DE INFORME TÉCNICO EN PDF DE 2 PÁGINAS (CLIENT-SIDE)
function generarInformePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    // Captura de datos actuales directamente de la pantalla táctil
    const evaluador = document.getElementById('idEvaluador').value || "[No Registrado]";
    const cargo = document.getElementById('profesion').value;
    const mp = document.getElementById('matricula').value || "NO SUMINISTRADA";
    const direccion = document.getElementById('direccion').value || "[No Registrado]";
    const catastro = document.getElementById('catastro').value || "NO REGISTRADO";
    const gps = document.getElementById('gps').value;
    const sistema = document.getElementById('sistema').value || "[No Seleccionado]";
    const notas = document.getElementById('notas').value || "Sin observaciones particulares registradas en el sitio.";
    const dictamen = document.getElementById('triageDisplay').innerText;

    // --- PÁGINA 1: MARCO DE TEXTO Y TABLAS TÉCNICAS ---
    // Encabezado Centralizado Institucional
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("SISTEMA DE GESTIÓN DEL RIESGO DE DESASTRES", 105, 15, { align: "center" });
    doc.setFontSize(12);
    doc.text("INFORME TÉCNICO PRELIMINAR DE INSPECCIÓN VISUAL POST-SISMO", 105, 21, { align: "center" });
    doc.setFont("helvetica", "normal");
