# 🏢 Aplicación de Evaluación e Inspección de Edificaciones Post-Sismo

![Versión](https://shields.io)
![Ecosistema](https://shields.io)
![Plataforma](https://shields.io)
![Autoría](https://shields.io)

Esta aplicación es una herramienta tecnológica de **Triage Técnico y Habitabilidad Inmediata**, diseñada para ser ejecutada directamente en teléfonos móviles en zonas afectadas por desastres sísmicos. Su motor lógico automatizado recopila datos de campo, calcula el nivel de riesgo de la estructura, genera **Informes Periciales Preliminares en formato PDF** para los propietarios y exporta **Capas Geográficas en estándar GeoJSON** listas para ser procesadas de manera oficial en softwares SIG como **QGIS o ArcGIS**.

---

## 📖 1. Glosario Pedagógico: Entendiendo los Sistemas Constructivos

Para facilitar el uso de la aplicación a usuarios de la comunidad, inspectores voluntarios o personal de socorro que no cuentan con formación en ingeniería estructural, este componente traduce los conceptos de la normativa colombiana (**NSR-10** y **AIS 410-23**) a criterios de observación visual simple:

### A. Pórticos de Concreto Reforzado
*   **¿Cómo identificarlo?:** Son las estructuras compuestas por un "esqueleto" de columnas verticales y vigas horizontales de hormigón (cemento, arena y piedra) que sostienen las placas de los techos. Los muros o paredes dentro de este sistema son meras divisiones y se pueden tumbar sin que el edificio se caiga. Es el sistema estándar en edificios modernos o conjuntos residenciales de más de 3 pisos.
*   **Puntos Críticos de Falla (Qué buscar):**
    *   **Trituración en Nudos:** Desmoronamiento o pulverización del concreto en las esquinas donde se une una columna con una viga. Si se ve el hierro de adentro doblado, es una **falla letal de colapso inminente**.
    *   **Grietas a 45°:** Fisuras diagonales que atraviesan las columnas. Indican que el sismo superó la capacidad de resistencia al corte de la estructura.

### B. Mampostería Confinada (Formal tradicional)
*   **¿Cómo identificarlo?:** Son viviendas donde las paredes de ladrillo o bloque cumplen la función de soportar el peso de la casa (muros de carga). Para que sea "confinada", el constructor debió amarrar los ladrillos fundiendo pequeñas columnas y vigas de concreto (vigas de corona) alrededor de cada pared. Es el sistema más común en las viviendas formales de 1 a 3 pisos en Colombia.
*   **Puntos Críticos de Falla (Qué buscar):**
    *   **Grietas en "X" o en Escalera:** Fracturas diagonales que siguen la línea del cemento entre los ladrillos o rompen el bloque en dos. Si la grieta atraviesa el muro de lado a lado (pasante) y cabe un lápiz en ella (>5mm), el muro ha perdido su capacidad de carga.
    *   **Separación de Amarres:** Grietas verticales que desprenden la pared de ladrillo de la columna de concreto colindante.

### C. Mampostería No Reforzada / Informal (Autoconstrucción)
*   **¿Cómo identificarlo?:** Viviendas construidas por autogestión comunitaria, muy comunes en zonas periféricas y laderas. Se caracterizan por tener paredes de ladrillo (muchas veces hueco o de baja calidad) pegadas con mortero, pero **carecen de columnas y vigas de amarre de concreto**. El techo suele apoyarse directamente sobre el ladrillo suelto o sobre vigas de madera/metal artesanales.
*   **Puntos Críticos de Falla (Qué buscar):**
    *   **Desplome o Volcamiento:** Paredes que pierden la verticalidad (se ven sopladas o inclinadas hacia afuera). Al no tener amarres, el sismo las empuja y tienden a caerse como un castillo de naipes.
    *   **Grietas Horizontales en la Base:** Fracturas largas en la base del muro que indican que la pared se está deslizando o desprendiendo del suelo.

### D. Bahareque / Tapia Pisada / Adobe
*   **¿Cómo identificarlo?:** Sistemas de construcción tradicional o histórica, típicos en zonas de ladera antigua o centros patrimoniales. El bahareque utiliza un entramado interno de caña, guadua o madera recubierto con una mezcla de tierra, barro y paja (pañete). La tapia y el adobe consisten en bloques macizos de tierra compactada a golpes o secada al sol.
*   **Puntos Críticos de Falla (Qué buscar):**
    *   **Rotura de Amarres:** Separación o agrietamiento en los puntos donde se cruzan las guaduas o maderas principales.
    *   **Pérdida de Pañete Masiva:** Caída de grandes bloques de barro que dejan expuesta la madera interna, debilitando mecánicamente el muro ante la humedad o réplicas.

---

## 🛠️ 2. Guía de Instalación Rápida en Dispositivos Móviles (PWA)

La aplicación está diseñada bajo la arquitectura de **Aplicación Web Progresiva (PWA)**, lo que significa que es multiplataforma y funciona de forma **100% offline (sin internet)** una vez instalada en el dispositivo móvil:

### 📱 En Dispositivos Android (Google Chrome)
1. Abra el navegador **Google Chrome** e ingrese al enlace oficial del repositorio implementado: `https://github.io`
2. Espere a que cargue la interfaz. Automáticamente aparecerá un aviso flotante en la parte inferior de la pantalla que dice: **"Añadir a la pantalla de inicio"**.
3. Si el aviso no aparece, toque los **tres puntos verticales** ubicados en la esquina superior derecha del navegador.
4. Seleccione la opción **"Instalar aplicación"** o **"Añadir a la pantalla de inicio"** y confirme la acción.

### 🍏 En Dispositivos iPhone / iOS (Safari)
1. Abra el navegador nativo **Safari** e ingrese al enlace oficial de la aplicación.
2. Toque el botón **Compartir** (representado por un icono de un cuadrado con una flecha apuntando hacia arriba, ubicado en la barra inferior del navegador).
3. Desplace las opciones hacia abajo y seleccione **"Añadir a la pantalla de inicio"**.
4. Toque el botón **"Añadir"** en la esquina superior derecha para confirmar el icono oficial en su pantalla de aplicaciones.

---

## 🗺️ 3. Directrices para el Procesamiento de Datos en Sistemas SIG (QGIS)

Para los Analistas GIS e Ingenieros Revisores en la oficina de control, el procesamiento cartográfico debe regirse bajo los siguientes parámetros estrictos para evitar errores de desfase métrico:

1. **Estándar de Captura de Datos:** La aplicación captura de forma nativa los datos espaciales mediante los sensores de geolocalización móvil utilizando el sistema elipsoidal global **WGS84 (Código EPSG: 4326)**.
2. **Obligatoriedad de Reproyección (Colombia):** De acuerdo con la **Resolución 1109 de 2020 del Instituto Geográfico Agustín Codazzi (IGAC)**, toda la cartografía en Colombia debe estar unificada bajo un solo origen nacional. Por ende, al importar el archivo `.geojson` descargado de la APP dentro de **QGIS**, el analista **DEBE reproyectar la capa obligatoriamente al Sistema de Coordenadas de Referencia (CRS): MAGNA-SIRGAS Origen Nacional / CTM12 (Código EPSG: 9377)**.
3. **Uso en otros Países:** Si la aplicación es ejecutada en zonas de desastre fuera de Colombia, el analista de datos debe omitir el metadato CTM12 y transformar la capa WGS84 al sistema UTM o Datum oficial determinado por la entidad gubernamental cartográfica del territorio correspondiente.

---

## ⚖️ 4. Marco Legal y Descargo de Responsabilidad

Este software constituye una herramienta tecnológica de recopilación ágil de datos y triage algorítmico preliminar de habitabilidad inmediata. Los reportes y dictámenes generados de manera automatizada por la aplicación (P1, P2, P3, P4) sirven como un censo prioritario ante emergencias masivas y **no reemplazan bajo ninguna circunstancia el concepto técnico vinculante definitivo ni las firmas periciales exigidas legalmente por un Ingeniero Civil Estructural matriculado**, bajo las directrices estipuladas en la **Ley 400 de 1997 de la República de Colombia** y sus decretos reglamentarios.

---
*Desarrollado de manera conjunta e institucional por el **Ing. R. Truque** y el modelo adaptativo de **GIA AI** para la preservación de la vida y mitigación del riesgo sísmico en el territorio nacional.*
