// Base de datos en memoria local persistente del dispositivo
let baseDatosReportes = JSON.parse(localStorage.getItem('reportes_sismo_cali')) || [];

// Inicialización de Eventos al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    actualizarContador();
    obtenerGPS();

    // Vinculación de oyentes de eventos a los elementos del formulario
    document.getElementById('btnGps').addEventListener('click', obtenerGPS);
    document.getElementById('fallaCritica').addEventListener('change', calcularHabitabilidad);
    document.getElementById('fallaMuros').addEventListener('change', calcularHabitabilidad);
    document.getElementById('fallaSuelo').addEventListener('change', calcularHabitabilidad);
    document.getElementById('sismoForm').addEventListener('submit', guardarReporte);
    document.getElementById('btnExportar').addEventListener('click', exportarGeoJSON);
    document.getElementById('btnLimpiar').addEventListener('click', limpiarBaseDatos);
});

// Captura de coordenadas geográficas nativas del dispositivo móvil
function obtenerGPS() {
    const gpsInput = document.getElementById('gps');
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                gpsInput.value = `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`;
            },
            (error) => {
                gpsInput.value = "3.4516, -76.5320"; // Coordenadas del centro de Cali por seguridad
                console.warn("Acceso al GPS denegado o no disponible. Usando fallback urbano.");
            },
            { enableHighAccuracy: true }
        );
    } else {
        gpsInput.value = "GPS no soportado en este navegador.";
    }
}

// Algoritmo determinista: Evaluación de Daño según Matriz Estructural NSR-10
function calcularHabitabilidad() {
    const fCritica = document.getElementById('fallaCritica').value;
    const fMuros = document.getElementById('fallaMuros').value;
    const fSuelo = document.getElementById('fallaSuelo').value;
    const display = document.getElementById('triageDisplay');

    let dictamen = "P1 - Habitable (Verde)";
    let colorBg = "#10b981"; // Verde original de CSS Variables
    let colorTxt = "#ffffff";

    // Reglas jerárquicas de veto estructural
    if (fCritica === "Concreto triturado" || fSuelo === "Falla Talud") {
        dictamen = "🔴 P4 - Peligro de Colapso (Rojo)";
        colorBg = "#ef4444";
    } else if (fCritica === "Grietas diagonales" || fMuros === "Grietas X Severas") {
        dictamen = "🟠 P3 - No Habitable (Naranja)";
        colorBg = "#f97316";
    } else if (fMuros === "Grietas X Moderadas" || fSuelo === "Grietas Suelo") {
        dictamen = "🟡 P2 - Uso Restringido (Amarillo)";
        colorBg = "#f59e0b";
    }

    display.innerText = dictamen;
    display.style.backgroundColor = colorBg;
    display.style.color = colorTxt;
}

// Persistencia local de los datos capturados (Funcionamiento Offline Total)
function guardarReporte(e) {
    e.preventDefault();

    const gpsRaw = document.getElementById('gps').value.split(',');
    const latitud = parseFloat(gpsRaw[0]);
    const longitud = parseFloat(gpsRaw[1]);

    const nuevoReporte = {
        id: "CALI-" + Date.now(),
        fecha: new Date().toISOString(),
        inspector: document.getElementById('inspector').value,
        direccion: document.getElementById('direccion').value,
        lat: latitud,
        lon: longitud,
        sistema_estructural: document.getElementById('sistema').value,
        falla_critica: document.getElementById('fallaCritica').value,
        falla_muros: document.getElementById('fallaMuros').value,
        falla_suelo: document.getElementById('fallaSuelo').value,
        notas: document.getElementById('notas').value,
        resultado_triage: document.getElementById('triageDisplay').innerText
    };

    baseDatosReportes.push(nuevoReporte);
    localStorage.setItem('reportes_sismo_cali', JSON.stringify(baseDatosReportes));
    
    actualizarContador();
    alert("¡Reporte guardado con éxito localmente en el dispositivo!");
    
    // Limpieza de campos de evaluación conservando credenciales técnicas del usuario
    document.getElementById('direccion').value = '';
    document.getElementById('notas').value = '';
    document.getElementById('sistema').selectedIndex = 0;
    document.getElementById('fallaCritica').selectedIndex = 0;
    document.getElementById('fallaMuros').selectedIndex = 0;
    document.getElementById('fallaSuelo').selectedIndex = 0;
    calcularHabitabilidad();
}

function actualizarContador() {
    document.getElementById('reportCount').innerText = `Reportes guardados localmente: ${baseDatosReportes.length}`;
}

// Procesamiento de datos al estándar de la OGC GeoJSON para Sistemas de Información Geográfica
function exportarGeoJSON() {
    if (baseDatosReportes.length === 0) {
        alert("No hay datos guardados para exportar todavía.");
        return;
    }

    const geojson = {
        type: "FeatureCollection",
        features: baseDatosReportes.map(r => ({
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [r.lon, r.lat] // El formato GeoJSON exige estrictamente [Longitud, Latitud]
            },
            properties: {
                id_reporte: r.id,
                fecha_hora: r.fecha,
                evaluador: r.inspector,
                direccion: r.direccion,
                sistema_constructivo: r.sistema_estructural,
                dano_columnas: r.falla_critica,
                dano_muros: r.falla_muros,
                dano_suelo: r.falla_suelo,
                dictamen_final: r.resultado_triage,
                observaciones: r.notas
            }
        }))
    };

    // Construcción del objeto blob e inyección temporal en el navegador para descarga física instantánea
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(geojson, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `capa_sismo_cali_${Date.now()}.geojson`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

function limpiarBaseDatos() {
    if (confirm("¿Estás seguro de que deseas borrar todos los registros guardados en este celular? Asegúrate de haber exportado primero a QGIS.")) {
        localStorage.removeItem('reportes_sismo_cali');
        baseDatosReportes = [];
        actualizarContador();
    }
}
