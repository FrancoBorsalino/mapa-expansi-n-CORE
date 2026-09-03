// ============ MAPA CORE - Multi-región (AMBA / Rosario / Córdoba) ============

const map = L.map('map', { zoomControl: true }).setView([-34.60, -58.45], 11);

L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png?key=cb1_28jq_1_ec4565e452c8a31a09bc245d', {
  attribution: '&copy; OpenStreetMap &copy; CARTO',
  maxZoom: 19
}).addTo(map);

function fmt(n) {
  return new Intl.NumberFormat('es-AR').format(Math.round(n));
}

// ---------- Configuración de regiones ----------
// "vars" mapea un nombre interno común a la variable global real que define
// cada archivo .js (los de AMBA no llevan sufijo, Rosario usa _R, Córdoba _C).
const REGIONS = {
  amba: {
    label: 'AMBA',
    center: [-34.60, -58.45], zoom: 11,
    hasCore: true,
    files: [
      'amba/densidad_slim.geojson.js', 'amba/poder_slim.geojson.js', 'amba/riesgo_slim.geojson.js',
      'amba/barrios_slim.geojson.js', 'amba/core_slim.geojson.js', 'amba/deportivos_slim.geojson.js',
      'amba/transporte_slim.geojson.js', 'amba/tren_slim.geojson.js', 'amba/omnibus_slim.geojson.js',
      'amba/universidades_slim.geojson.js', 'amba/edusuperior_slim.geojson.js', 'amba/zonas_potenciales_slim.geojson.js'
    ],
    vars: {
      densidad: 'DATA_DENSIDAD', poder: 'DATA_PODER', riesgo: 'DATA_RIESGO', barrios: 'DATA_BARRIOS',
      core: 'DATA_CORE', deportivos: 'DATA_DEPORTIVOS', transporte: 'DATA_TRANSPORTE',
      tren: 'DATA_TREN', omnibus: 'DATA_OMNIBUS', universidades: 'DATA_UNIVERSIDADES',
      edusuperior: 'DATA_EDUSUPERIOR', zonaspotenciales: 'DATA_ZONAS_POTENCIALES'
    }
  },
  rosario: {
    label: 'Rosario',
    center: [-32.95, -60.65], zoom: 11,
    hasCore: false,
    files: [
      'rosario/densidad_slimR.geojson.js', 'rosario/poder_slimR.geojson.js', 'rosario/riesgo_slimR.geojson.js',
      'rosario/barrios_slimR.geojson.js', 'rosario/deportivos_slimR.geojson.js',
      'rosario/transporte_slimR.geojson.js', 'rosario/tren_slimR.geojson.js', 'rosario/omnibus_slimR.geojson.js',
      'rosario/universidades_slimR.geojson.js', 'rosario/edusuperior_slimR.geojson.js', 'rosario/zonas_potenciales_slimR.geojson.js'
    ],
    vars: {
      densidad: 'DATA_DENSIDAD_R', poder: 'DATA_PODER_R', riesgo: 'DATA_RIESGO_R', barrios: 'DATA_BARRIOS_R',
      deportivos: 'DATA_DEPORTIVOS_R', transporte: 'DATA_TRANSPORTE_R',
      tren: 'DATA_TREN_R', omnibus: 'DATA_OMNIBUS_R', universidades: 'DATA_UNIVERSIDADES_R',
      edusuperior: 'DATA_EDUSUPERIOR_R', zonaspotenciales: 'DATA_ZONAS_POTENCIALES_R'
    }
  },
  cordoba: {
    label: 'Córdoba',
    center: [-31.40, -64.25], zoom: 11,
    hasCore: false,
    files: [
      'cordoba/densidad_slimC.geojson.js', 'cordoba/poder_slimC.geojson.js', 'cordoba/riesgo_slimC.geojson.js',
      'cordoba/barrios_slimC.geojson.js', 'cordoba/deportivos_slimC.geojson.js',
      'cordoba/transporte_slimC.geojson.js', 'cordoba/tren_slimC.geojson.js', 'cordoba/omnibus_slimC.geojson.js',
      'cordoba/universidades_slimC.geojson.js', 'cordoba/edusuperior_slimC.geojson.js', 'cordoba/zonas_potenciales_slimC.geojson.js'
    ],
    vars: {
      densidad: 'DATA_DENSIDAD_C', poder: 'DATA_PODER_C', riesgo: 'DATA_RIESGO_C', barrios: 'DATA_BARRIOS_C',
      deportivos: 'DATA_DEPORTIVOS_C', transporte: 'DATA_TRANSPORTE_C',
      tren: 'DATA_TREN_C', omnibus: 'DATA_OMNIBUS_C', universidades: 'DATA_UNIVERSIDADES_C',
      edusuperior: 'DATA_EDUSUPERIOR_C', zonaspotenciales: 'DATA_ZONAS_POTENCIALES_C'
    }
  }
};

const loadedScripts = new Set();
function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (loadedScripts.has(src)) return resolve();
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => { loadedScripts.add(src); resolve(); };
    s.onerror = () => reject(new Error('No se pudo cargar ' + src));
    document.body.appendChild(s);
  });
}

// ---------- Paletas y helpers de estilo (comunes a todas las regiones) ----------
const segmentoColors = { 1:'#2E7DFF', 2:'#3FA66B', 3:'#8BC34A', 4:'#E0A526', 5:'#F2C744', 6:'#B5762E', 7:'#7A4A22' };
const segmentoLabels = { 1:'Clase alta', 2:'Clase media alta', 3:'Clase media', 4:'Clase media baja', 5:'Clase baja integrada', 6:'Clase baja', 7:'Clase muy baja' };

function densidadColor(pob) {
  if (pob >= 1191) return '#D9483A';
  if (pob >= 964) return '#E0763A';
  if (pob >= 793) return '#E0A526';
  if (pob >= 619) return '#E8D06B';
  return '#F5EFC9';
}
function riesgoColor(inc) {
  if (inc >= 5) return '#D9483A';
  if (inc >= 4) return '#E0763A';
  if (inc >= 3) return '#E0A526';
  if (inc >= 2) return '#E8D06B';
  return '#F5EFC9';
}
function transporteColor(uso) {
  if (uso >= 1220) return '#0B3D0B';
  if (uso >= 627)  return '#1E7A2E';
  if (uso >= 335)  return '#3FA84A';
  if (uso >= 150)  return '#7ACB6E';
  return '#C9EABB';
}
const nivelColors = { 'Muy buena': '#00E0A4', 'Buena': '#3FA86B', 'Moderada': '#B7D98A' };

const TIPO_MAP_DEPORTIVOS = {
  'fitness_centre':'Gimnasio','fitness':'Gimnasio','gym':'Gimnasio','gymnasium':'Gimnasio','exercise':'Gimnasio',
  'crossfit':'CrossFit','cross_fit':'CrossFit','calistenia':'Calistenia','yoga':'Yoga','pilates':'Pilates',
  'boxing':'Boxeo','full_contact':'Boxeo','martial_arts':'Artes marciales','taekwondo':'Artes marciales',
  'karate':'Artes marciales','judo':'Artes marciales','jiu-jitsu':'Artes marciales','swimming':'Natación',
  'weightlifting':'Musculación','powerlifting':'Musculación','spinning':'Spinning','zumba':'Baile/Zumba',
  'dance':'Baile/Zumba','running':'Running','funcional':'Funcional','multi':'Multideporte',
  'padel':'Pádel','paddle_tennis':'Pádel','table_tennis':'Tenis de mesa','squash':'Squash','soccer':'Fútbol'
};

// Colores/tamaño de marcador de sedes CORE (solo aplica en AMBA)
const modeloColors = { 'CORE': '#FF5C33', 'CORE + Pilates': '#6B2A1A', 'CORE + Pilates + Yoga': '#C4A482' };
function colorForModelo(modelo) { return modeloColors[modelo] || '#FF5C33'; }
const BASE_ZOOM = 14, ZOOM_GROWTH = 0.55, MAX_SIZE = 64;
function sizeAtZoom(total, zoom) {
  const baseSize = Math.max(28, Math.min(60, 26 + Math.sqrt(total || 1) * 1.7));
  const scale = Math.pow(2, (zoom - BASE_ZOOM) * ZOOM_GROWTH);
  return Math.max(10, Math.min(MAX_SIZE, baseSize * scale));
}
function buildCoreIcon(total, zoom, modelo) {
  const size = sizeAtZoom(total, zoom);
  const showLogo = size >= 30;
  const logoW = size * 0.62;
  const color = colorForModelo(modelo);
  return L.divIcon({
    className: 'core-marker',
    html: `<div class="core-marker-circle" style="width:${size}px;height:${size}px;background:${color}A6;">
             ${showLogo ? `<img src="${window.CORE_LOGO}" style="width:${logoW}px;" />` : ''}
           </div>`,
    iconSize: [size, size], iconAnchor: [size/2, size/2]
  });
}

// ---------- Estado de la región activa ----------
let currentRegionKey = null;
let regionLayerGroup = L.layerGroup().addTo(map); // contiene TODAS las capas de datos de la región activa
let coreMarkers = []; // para reescalar íconos de sede en zoomend (solo AMBA)
let coreSedes = [];   // usado por la herramienta de proximidad / radio de 1km

const capasActivas = {}; // id checkbox -> L.Layer de la región actual

function limpiarRegionActual() {
  regionLayerGroup.clearLayers();
  map.removeLayer(regionLayerGroup);
  regionLayerGroup = L.layerGroup().addTo(map);
  coreMarkers = [];
  coreSedes = [];
  Object.keys(capasActivas).forEach(k => delete capasActivas[k]);
}

function toggleLayerDinamico(chkId, layer) {
  const chk = document.getElementById(chkId);
  if (!chk) return;
  // saca listeners viejos clonando el nodo (evita acumular handlers de regiones anteriores)
  const nuevoChk = chk.cloneNode(true);
  chk.parentNode.replaceChild(nuevoChk, chk);
  nuevoChk.addEventListener('change', e => {
    if (e.target.checked) { regionLayerGroup.addLayer(layer); layer.bringToFront && layer.bringToFront(); }
    else regionLayerGroup.removeLayer(layer);
    if (capasActivas['chk-core'] && regionLayerGroup.hasLayer(capasActivas['chk-core'])) {
      capasActivas['chk-core'].bringToFront();
    }
  });
  if (nuevoChk.checked) regionLayerGroup.addLayer(layer);
}

// ---------- Construcción de capas para una región ----------
function construirCapasRegion(region) {
  const v = region.vars;

  // Poder adquisitivo
  const poderLayer = L.geoJSON(window[v.poder], {
    style: f => ({ fillColor: segmentoColors[f.properties.segmento] || '#666', fillOpacity: 0.35, color: 'rgba(0,0,0,0.15)', weight: 0.2, stroke: false }),
    onEachFeature: (f, layer) => {
      const seg = f.properties.segmento;
      const dpto = f.properties.DPTO || f.properties.dpto || '';
      layer.bindPopup(`<div class="popup-title">Poder adquisitivo</div><div class="popup-row"><b>${segmentoLabels[seg] || '—'}</b></div><div class="popup-row">Partido/Depto: ${dpto}</div>`);
    }
  });
  capasActivas['chk-poder'] = poderLayer;
  toggleLayerDinamico('chk-poder', poderLayer);

  // Densidad
  const densidadLayer = L.geoJSON(window[v.densidad], {
    style: f => ({ fillColor: densidadColor(f.properties.Radios_poblacion_total || 0), fillOpacity: 0.35, color: 'rgba(0,0,0,0.15)', weight: 0.2, stroke: false }),
    onEachFeature: (f, layer) => {
      const pob = f.properties.Radios_poblacion_total || 0;
      const sup = f.properties.Radios_superficie_km2 || 0;
      const dpto = f.properties.dpto || f.properties.DPTO || '';
      layer.bindPopup(`<div class="popup-title">Densidad poblacional</div><div class="popup-row">Población del radio: <b>${fmt(pob)}</b></div><div class="popup-row">Superficie: ${sup.toFixed ? sup.toFixed(2) : sup} km²</div><div class="popup-row">Partido/Depto: ${dpto}</div>`);
    }
  });
  capasActivas['chk-densidad'] = densidadLayer;
  toggleLayerDinamico('chk-densidad', densidadLayer);

  // Riesgo de exclusión
  const riesgoLayer = L.geoJSON(window[v.riesgo], {
    style: f => ({ fillColor: riesgoColor(f.properties.Incidencia || 1), fillOpacity: 0.35, color: 'rgba(0,0,0,0.15)', weight: 0.2, stroke: false }),
    onEachFeature: (f, layer) => {
      const p = f.properties;
      layer.bindPopup(`<div class="popup-title">Riesgo de exclusión</div><div class="popup-row">Incidencia: <b>${p.Incidencia}</b> / 6</div><div class="popup-row">Partido/Depto: ${p.DPTO || ''}</div>`);
    }
  });
  capasActivas['chk-riesgo'] = riesgoLayer;
  toggleLayerDinamico('chk-riesgo', riesgoLayer);

  // Barrios populares
  const barriosLayer = L.geoJSON(window[v.barrios], {
    style: () => ({ fillColor: '#7A4A22', fillOpacity: 0.4, color: '#3d2510', weight: 0.6 }),
    onEachFeature: (f, layer) => {
      const p = f.properties;
      layer.bindPopup(`<div class="popup-title">${p.nombre_bar || 'Barrio popular'}</div><div class="popup-row">Tipo: ${p.clasificacion || '—'}</div><div class="popup-row">Familias: <b>${p.familias ? fmt(p.familias) : '—'}</b></div><div class="popup-row">Partido/Depto: ${p.DPTO || ''}</div>`);
    }
  });
  capasActivas['chk-barrios'] = barriosLayer;
  toggleLayerDinamico('chk-barrios', barriosLayer);

  // Transporte (uso de colectivo, zonal)
  const transporteLayer = L.geoJSON(window[v.transporte], {
    style: f => ({ fillColor: transporteColor(f.properties.usos_colectivo || 0), fillOpacity: 0.3, color: 'rgba(0,0,0,0.15)', weight: 0.2, stroke: false }),
    onEachFeature: (f, layer) => {
      const p = f.properties;
      layer.bindPopup(`<div class="popup-title">Uso de colectivo</div><div class="popup-row">Transacciones (radio): <b>${fmt(p.usos_colectivo || 0)}</b></div><div class="popup-row">Partido/Depto: ${p.DPTO || ''}</div>`);
    }
  });
  capasActivas['chk-transporte'] = transporteLayer;
  toggleLayerDinamico('chk-transporte', transporteLayer);

  // Tren
  const trenLayer = L.geoJSON(window[v.tren], {
    pointToLayer: (f, latlng) => L.circleMarker(latlng, { radius: 5, fillColor: '#4CE0AF', color: '#1a5c42', weight: 1, fillOpacity: 0.9 }),
    onEachFeature: (f, layer) => {
      const p = f.properties;
      layer.bindPopup(`<div class="popup-title">${p.nam || 'Estación'}</div><div class="popup-row">${p.gna || 'Estación de ferrocarril'}</div>`);
    }
  });
  capasActivas['chk-tren'] = trenLayer;
  toggleLayerDinamico('chk-tren', trenLayer);

  // Ómnibus
  const omnibusLayer = L.geoJSON(window[v.omnibus], {
    pointToLayer: (f, latlng) => L.circleMarker(latlng, { radius: 6, fillColor: '#B04CE0', color: '#4a1a63', weight: 1, fillOpacity: 0.9 }),
    onEachFeature: (f, layer) => {
      const p = f.properties;
      layer.bindPopup(`<div class="popup-title">${p.nam || 'Terminal'}</div><div class="popup-row">${p.fna || 'Terminal de ómnibus'}</div>`);
    }
  });
  capasActivas['chk-omnibus'] = omnibusLayer;
  toggleLayerDinamico('chk-omnibus', omnibusLayer);

  // Universidades
  const universidadesLayer = L.geoJSON(window[v.universidades], {
    pointToLayer: (f, latlng) => L.circleMarker(latlng, { radius: 5, fillColor: '#F2C744', color: '#7a6300', weight: 1, fillOpacity: 0.9 }),
    onEachFeature: (f, layer) => {
      const p = f.properties;
      layer.bindPopup(`<div class="popup-title">${p.fna || 'Universidad'}</div><div class="popup-row">${p.gna || ''}</div>`);
    }
  });
  capasActivas['chk-universidades'] = universidadesLayer;
  toggleLayerDinamico('chk-universidades', universidadesLayer);

  // Educación superior no universitaria
  const eduSuperiorLayer = L.geoJSON(window[v.edusuperior], {
    pointToLayer: (f, latlng) => L.circleMarker(latlng, { radius: 4, fillColor: '#4C7AE0', color: '#1a2f66', weight: 1, fillOpacity: 0.85 }),
    onEachFeature: (f, layer) => {
      const p = f.properties;
      layer.bindPopup(`<div class="popup-title">${p.nombre || 'Instituto'}</div><div class="popup-row">${p.domicilio || ''}</div>`);
    }
  });
  capasActivas['chk-edusuperior'] = eduSuperiorLayer;
  toggleLayerDinamico('chk-edusuperior', eduSuperiorLayer);

  // Competencia (deportivos)
  const deportivosLayer = L.geoJSON(window[v.deportivos], {
    pointToLayer: (f, latlng) => L.circleMarker(latlng, { radius: 4, fillColor: '#4C9AFF', color: '#1a3a66', weight: 1, fillOpacity: 0.85 }),
    onEachFeature: (f, layer) => {
      const p = f.properties;
      const lineaExtra = p.direccion ? p.direccion : (p.DPTO || '');
      layer.bindTooltip(`<div style="font-weight:600; color:var(--orange);">${p.nombre}</div><div>${p.deportes || 'Actividad deportiva'}</div>${lineaExtra ? `<div style="color:var(--muted); font-size:11px;">${lineaExtra}</div>` : ''}`, { sticky: true, direction: 'top', opacity: 0.95 });
      layer.bindPopup(`<div class="popup-title">${p.nombre}</div><div class="popup-row">${p.deportes || 'Actividad deportiva'}</div>${p.direccion ? `<div class="popup-row">${p.direccion}</div>` : ''}${p.DPTO ? `<div class="popup-row">${p.DPTO}</div>` : ''}<div class="popup-row" style="color:var(--muted); font-size:11px;">Fuente: ${p.fuente === 'OSM' ? 'OpenStreetMap' : 'Base propia'}</div>`);
    }
  });
  capasActivas['chk-deportivos'] = deportivosLayer;
  toggleLayerDinamico('chk-deportivos', deportivosLayer);

  // Zonas potenciales
  const zonasPotencialesLayer = L.geoJSON(window[v.zonaspotenciales], {
    style: f => {
      const color = nivelColors[f.properties.nivel] || '#00E0A4';
      return { fillColor: color, fillOpacity: 0.45, color: color, weight: 0.8, opacity: 0.9 };
    },
    onEachFeature: (f, layer) => {
      const p = f.properties;
      const segLabels = {1:'Alta',2:'Media alta',3:'Media'};
      const techo = p.segmento === 3 ? `<div class="popup-row" style="color:var(--muted); font-size:11px;">Techo por poder adquisitivo medio (no puede superar "Moderada")</div>` : '';
      layer.bindPopup(`<div class="popup-title">Zona potencial — ${p.nivel}</div><div class="popup-row">Partido/Comuna: <b>${p.DPTO || ''}</b></div><div class="popup-row">Poder adquisitivo: ${segLabels[p.segmento] || p.segmento}</div><div class="popup-row">Densidad real: <b>${fmt(p.densidad_hab_km2 || 0)} hab/km²</b></div><div class="popup-row">Riesgo de exclusión: ${p.incidencia} / 6</div><div class="popup-row">Puntaje: <b>${p.score}</b> / 9</div>${techo}`);
    }
  });
  capasActivas['chk-zonaspotenciales'] = zonasPotencialesLayer;
  toggleLayerDinamico('chk-zonaspotenciales', zonasPotencialesLayer);

  // Sedes CORE (solo si la región tiene, hoy: AMBA)
  const panelCore = document.getElementById('panel-sedes-core');
  if (region.hasCore && v.core) {
    if (panelCore) panelCore.style.display = 'block';
    coreMarkers = [];
    const coreLayer = L.geoJSON(window[v.core], {
      pointToLayer: (f, latlng) => {
        const marker = L.marker(latlng, { icon: buildCoreIcon(f.properties.total, map.getZoom(), f.properties.modelo) });
        coreMarkers.push({ marker, total: f.properties.total, modelo: f.properties.modelo });
        return marker;
      },
      onEachFeature: (f, layer) => {
        const p = f.properties;
        layer.bindPopup(`<div class="popup-title">CORE ${p.sede}</div><div class="popup-row">${p.direccion}</div><div class="popup-row">Modelo: ${p.modelo}</div>`);
      }
    });
    capasActivas['chk-core'] = coreLayer;
    toggleLayerDinamico('chk-core', coreLayer);

    coreSedes = window[v.core].features.map(f => ({
      nombre: f.properties.sede, lat: f.geometry.coordinates[1], lon: f.geometry.coordinates[0]
    }));

    // radio de 1km por sede
    const radios1kmLayer = L.layerGroup(coreSedes.map(s => L.circle([s.lat, s.lon], {
      radius: 1000, color: '#FF5C33', weight: 1.2, opacity: 0.6, fill: false
    }).bindTooltip(`1km desde CORE ${s.nombre}`, { sticky: true })));
    capasActivas['chk-radio10km'] = radios1kmLayer;
    toggleLayerDinamico('chk-radio10km', radios1kmLayer);
  } else {
    if (panelCore) panelCore.style.display = 'none';
    coreSedes = [];
  }
}

// Reescalar íconos de sede en zoom (solo tiene efecto si hay coreMarkers, es decir en AMBA)
map.on('zoomend', () => {
  const z = map.getZoom();
  coreMarkers.forEach(({ marker, total, modelo }) => {
    marker.setIcon(buildCoreIcon(total, z, modelo));
  });
});

// ---------- Leyendas dinámicas (se completan una sola vez, son estáticas) ----------
function poblarLeyendasEstaticas() {
  const legendPoder = document.getElementById('legend-poder');
  if (legendPoder && !legendPoder.dataset.filled) {
    Object.keys(segmentoLabels).forEach(k => {
      legendPoder.innerHTML += `<div class="legend-row"><span class="legend-swatch" style="background:${segmentoColors[k]}"></span>${segmentoLabels[k]}</div>`;
    });
    legendPoder.dataset.filled = '1';
  }
  const legendDensidad = document.getElementById('legend-densidad');
  if (legendDensidad && !legendDensidad.dataset.filled) {
    [['#D9483A','≥ 1.191 hab/radio'],['#E0763A','964 – 1.191'],['#E0A526','793 – 964'],['#E8D06B','619 – 793'],['#F5EFC9','< 619']]
      .forEach(([color,label]) => { legendDensidad.innerHTML += `<div class="legend-row"><span class="legend-swatch" style="background:${color}"></span>${label}</div>`; });
    legendDensidad.dataset.filled = '1';
  }
  const legendRiesgo = document.getElementById('legend-riesgo');
  if (legendRiesgo && !legendRiesgo.dataset.filled) {
    [['#D9483A','Muy alto (5-6)'],['#E0763A','Alto (4)'],['#E0A526','Medio (3)'],['#E8D06B','Bajo (2)'],['#F5EFC9','Muy bajo (1)']]
      .forEach(([color,label]) => { legendRiesgo.innerHTML += `<div class="legend-row"><span class="legend-swatch" style="background:${color}"></span>${label}</div>`; });
    legendRiesgo.dataset.filled = '1';
  }
  document.getElementById('chk-poder') && document.getElementById('chk-poder').addEventListener('change', e => legendPoder.classList.toggle('show', e.target.checked));
  document.getElementById('chk-densidad') && document.getElementById('chk-densidad').addEventListener('change', e => legendDensidad.classList.toggle('show', e.target.checked));
  document.getElementById('chk-riesgo') && document.getElementById('chk-riesgo').addEventListener('change', e => legendRiesgo.classList.toggle('show', e.target.checked));
}

// ---------- Cambio de región (tabs) ----------
async function cambiarRegion(key) {
  const region = REGIONS[key];
  if (!region || key === currentRegionKey) return;

  document.querySelectorAll('.region-tab').forEach(t => t.classList.remove('active'));
  const tabEl = document.querySelector(`.region-tab[data-region="${key}"]`);
  if (tabEl) tabEl.classList.add('active');

  const loader = document.getElementById('region-loader');
  if (loader) loader.style.display = 'flex';

  try {
    for (const src of region.files) {
      await loadScript(src);
    }
  } catch (err) {
    if (loader) loader.style.display = 'none';
    alert('No se pudieron cargar los datos de ' + region.label + '. Revisá que los archivos estén en la carpeta correcta junto al index.html.');
    return;
  }

  limpiarRegionActual();
  construirCapasRegion(region);
  poblarLeyendasEstaticas();
  map.setView(region.center, region.zoom);
  currentRegionKey = key;

  if (loader) loader.style.display = 'none';
}

// arrancamos siempre en AMBA
cambiarRegion('amba');

document.querySelectorAll('.region-tab').forEach(tab => {
  tab.addEventListener('click', () => cambiarRegion(tab.getAttribute('data-region')));
});

// ---------- Botón "Apagar todas las capas" ----------
document.getElementById('btn-reset-layers').addEventListener('click', () => {
  document.querySelectorAll('#sidebar .layer-item input[type="checkbox"]').forEach(chk => {
    if (chk.id === 'chk-core') return;
    if (chk.checked) {
      chk.checked = false;
      chk.dispatchEvent(new Event('change'));
    }
  });
});

// ============================================================
// Herramientas (pines, medición, radio personalizado, dibujo,
// locales cargados): son independientes de la región activa,
// trabajan con lat/lon directo y no dependen de qué capas estén
// prendidas, así que no se tocan al cambiar de tab.
// ============================================================

// ---------- Buscador de direcciones (Nominatim / OpenStreetMap) ----------
const pinIcon = L.divIcon({
  className: '',
  html: `<svg width="30" height="42" viewBox="0 0 30 42" xmlns="http://www.w3.org/2000/svg">
           <path d="M15 0C6.7 0 0 6.7 0 15c0 10.5 15 27 15 27s15-16.5 15-27C30 6.7 23.3 0 15 0z" fill="#FF3D9A" stroke="#7a1a4a" stroke-width="1.5"/>
           <circle cx="15" cy="15" r="6" fill="white"/>
         </svg>`,
  iconSize: [30, 42], iconAnchor: [15, 42], popupAnchor: [0, -38]
});

const pinsLayer = L.layerGroup().addTo(map);
let pinCounter = 0;
const pinsById = {};

function sedeMasCercana(lat, lon) {
  if (!coreSedes.length) return { sede: null, distancia: Infinity };
  const p = L.latLng(lat, lon);
  let mejor = null, mejorDist = Infinity;
  coreSedes.forEach(s => {
    const d = p.distanceTo(L.latLng(s.lat, s.lon));
    if (d < mejorDist) { mejorDist = d; mejor = s; }
  });
  return { sede: mejor, distancia: mejorDist };
}

function actualizarListaPines() {
  const cont = document.getElementById('addr-pins-list');
  const btnClear = document.getElementById('btn-clear-pins');
  const ids = Object.keys(pinsById);
  if (ids.length === 0) { cont.innerHTML = ''; btnClear.style.display = 'none'; return; }
  btnClear.style.display = 'block';
  cont.innerHTML = ids.map(id => `
    <div class="addr-pin-item">
      <span class="dot"></span>
      <span class="label" title="${pinsById[id].label}">${pinsById[id].label}</span>
      <span class="remove-pin" data-pin-id="${id}">✕</span>
    </div>
  `).join('');
  cont.querySelectorAll('.remove-pin').forEach(el => {
    el.addEventListener('click', () => {
      const id = el.getAttribute('data-pin-id');
      pinsLayer.removeLayer(pinsById[id].marker);
      if (pinsById[id].proxLine) pinsLayer.removeLayer(pinsById[id].proxLine);
      delete pinsById[id];
      actualizarListaPines();
    });
  });
}

function agregarPin(lat, lon, label) {
  const id = 'pin' + (++pinCounter);
  const marker = L.marker([lat, lon], { icon: pinIcon }).addTo(pinsLayer);
  marker.bindPopup(`<div class="popup-title">📍 ${label}</div><div class="popup-row" style="color:var(--muted); font-size:11px;">${lat.toFixed(5)}, ${lon.toFixed(5)}</div>`);
  pinsById[id] = { marker, label };

  const { sede, distancia } = sedeMasCercana(lat, lon);
  if (sede && distancia <= 1000) {
    const proxLine = L.polyline([[lat, lon], [sede.lat, sede.lon]], { color: '#FF3D3D', weight: 2, dashArray: '6,4', opacity: 0.85 }).addTo(pinsLayer);
    proxLine.bindTooltip(`${Math.round(distancia)}m de CORE ${sede.nombre}`, { permanent: true, direction: 'center', className: 'dist-label warning' });
    pinsById[id].proxLine = proxLine;
  }

  actualizarListaPines();
  map.setView([lat, lon], 16);
  marker.openPopup();
}

async function buscarDireccion(query) {
  const resultsDiv = document.getElementById('addr-search-results');
  if (!query.trim()) return;
  resultsDiv.innerHTML = `<div style="font-size:11px; color:var(--muted); padding:.3rem;">Buscando...</div>`;
  try {
    const region = REGIONS[currentRegionKey] || REGIONS.amba;
    const [latC, lonC] = region.center;
    const d = 0.9;
    const viewbox = `${lonC - d},${latC + d},${lonC + d},${latC - d}`;
    const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&countrycodes=ar&viewbox=${viewbox}&q=${encodeURIComponent(query)}`;
    const resp = await fetch(url);
    const data = await resp.json();
    if (!data.length) {
      resultsDiv.innerHTML = `<div style="font-size:11px; color:var(--muted); padding:.3rem;">Sin resultados. Probá agregando el partido/comuna.</div>`;
      return;
    }
    resultsDiv.innerHTML = data.map((r, i) => `<div class="addr-result-item" data-idx="${i}">${r.display_name}</div>`).join('');
    resultsDiv.querySelectorAll('.addr-result-item').forEach(el => {
      el.addEventListener('click', () => {
        const r = data[parseInt(el.getAttribute('data-idx'))];
        agregarPin(parseFloat(r.lat), parseFloat(r.lon), r.display_name.split(',').slice(0, 2).join(','));
        resultsDiv.innerHTML = '';
        document.getElementById('addr-search-input').value = '';
      });
    });
  } catch (err) {
    resultsDiv.innerHTML = `<div style="font-size:11px; color:var(--muted); padding:.3rem;">Error al buscar. Probá de nuevo.</div>`;
  }
}

document.getElementById('addr-search-btn').addEventListener('click', () => buscarDireccion(document.getElementById('addr-search-input').value));
document.getElementById('addr-search-input').addEventListener('keydown', e => { if (e.key === 'Enter') buscarDireccion(e.target.value); });
document.getElementById('btn-clear-pins').addEventListener('click', () => {
  pinsLayer.clearLayers();
  Object.keys(pinsById).forEach(id => delete pinsById[id]);
  actualizarListaPines();
});

map.on('contextmenu', async (e) => {
  const { lat, lng } = e.latlng;
  agregarPin(lat, lng, 'Buscando dirección...');
  const idsAntes = Object.keys(pinsById);
  const idNuevo = idsAntes[idsAntes.length - 1];
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    const resp = await fetch(url);
    const data = await resp.json();
    const label = data.display_name ? data.display_name.split(',').slice(0, 2).join(',') : `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    if (idNuevo && pinsById[idNuevo]) {
      pinsById[idNuevo].label = label;
      pinsById[idNuevo].marker.setPopupContent(`<div class="popup-title">📍 ${label}</div><div class="popup-row" style="color:var(--muted); font-size:11px;">${lat.toFixed(5)}, ${lng.toFixed(5)}</div>`);
      actualizarListaPines();
    }
  } catch (err) {
    if (idNuevo && pinsById[idNuevo]) {
      pinsById[idNuevo].label = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      actualizarListaPines();
    }
  }
});

// ---------- Desplegable de Herramientas ----------
const herramientasBody = document.getElementById('herramientas-body');
const herramientasArrow = document.getElementById('herramientas-arrow');
document.getElementById('toggle-herramientas').addEventListener('click', () => {
  const abierto = herramientasBody.style.display === 'block';
  herramientasBody.style.display = abierto ? 'none' : 'block';
  herramientasArrow.style.transform = abierto ? 'rotate(0deg)' : 'rotate(180deg)';
});

// ---------- Medir distancia (A -> B), mediciones individuales ----------
const medicionLayer = L.layerGroup().addTo(map);
let midiendo = false, puntoA = null, medicionCounter = 0;
const medicionesById = {};
const btnMedir = document.getElementById('btn-medir');
const medirStatus = document.getElementById('medir-status');
const btnClearMedicion = document.getElementById('btn-clear-medicion');

function iniciarMedicion() { midiendo = true; puntoA = null; btnMedir.classList.add('active'); medirStatus.textContent = 'Hacé click en el primer punto del mapa.'; }
function cancelarModoMedicion() { midiendo = false; btnMedir.classList.remove('active'); }
btnMedir.addEventListener('click', () => { midiendo ? (cancelarModoMedicion(), medirStatus.textContent = '') : iniciarMedicion(); });

map.on('click', (e) => {
  if (!midiendo) return;
  if (!puntoA) { puntoA = e.latlng; medirStatus.textContent = 'Ahora hacé click en el segundo punto.'; return; }

  const puntoB = e.latlng;
  const id = 'med' + (++medicionCounter);
  const grupo = L.layerGroup().addTo(medicionLayer);
  L.circleMarker(puntoA, { radius: 5, color: '#FFD23F', fillColor: '#FFD23F', fillOpacity: 1, weight: 2 }).addTo(grupo);
  L.circleMarker(puntoB, { radius: 5, color: '#FFD23F', fillColor: '#FFD23F', fillOpacity: 1, weight: 2 }).addTo(grupo);
  const linea = L.polyline([puntoA, puntoB], { color: '#FFD23F', weight: 2.5, dashArray: '8,5', opacity: 0.9 }).addTo(grupo);
  const distancia = puntoA.distanceTo(puntoB);
  const label = distancia >= 1000 ? `${(distancia/1000).toFixed(2)} km` : `${Math.round(distancia)} m`;
  linea.bindTooltip(label, { permanent: true, direction: 'center', className: 'dist-label' });
  linea.bindPopup(`<div class="popup-title">📏 ${label}</div><div class="popup-row" style="margin-top:4px;"><span class="remove-pin" style="cursor:pointer; color:#FF6B6B;" id="borrar-${id}">✕ Borrar esta medición</span></div>`);
  linea.on('popupopen', () => {
    const btn = document.getElementById(`borrar-${id}`);
    if (btn) btn.addEventListener('click', () => {
      medicionLayer.removeLayer(grupo);
      delete medicionesById[id];
      map.closePopup();
      if (Object.keys(medicionesById).length === 0) btnClearMedicion.style.display = 'none';
    });
  });
  medicionesById[id] = grupo;
  medirStatus.textContent = `Distancia: ${label} (~${Math.round(distancia/100)} cuadras). Click en la línea para borrarla.`;
  btnClearMedicion.style.display = 'block';
  cancelarModoMedicion();
});

btnClearMedicion.addEventListener('click', () => {
  medicionLayer.clearLayers();
  Object.keys(medicionesById).forEach(id => delete medicionesById[id]);
  medirStatus.textContent = '';
  btnClearMedicion.style.display = 'none';
});

// ---------- Radio personalizado ----------
const radioPersonalizadoLayer = L.layerGroup().addTo(map);
let modoRadio = false, radioCounter = 0;
const radiosById = {};
const btnRadio = document.getElementById('btn-radio');
const radioStatus = document.getElementById('radio-status');
const btnClearRadios = document.getElementById('btn-clear-radios');

btnRadio.addEventListener('click', () => {
  modoRadio = !modoRadio;
  btnRadio.classList.toggle('active', modoRadio);
  radioStatus.textContent = modoRadio ? 'Hacé click en el mapa para ubicar el centro.' : '';
});

map.on('click', (e) => {
  if (!modoRadio) return;
  const metrosTxt = window.prompt('Radio en metros (ej: 500):', '500');
  modoRadio = false; btnRadio.classList.remove('active');
  const metros = parseFloat(metrosTxt);
  if (!metrosTxt || isNaN(metros) || metros <= 0) { radioStatus.textContent = ''; return; }
  const id = 'radio' + (++radioCounter);
  const circulo = L.circle(e.latlng, { radius: metros, color: '#4CE0AF', weight: 1.5, fillColor: '#4CE0AF', fillOpacity: 0.12 }).addTo(radioPersonalizadoLayer);
  const label = metros >= 1000 ? `${(metros/1000).toFixed(2)}km` : `${Math.round(metros)}m`;
  circulo.bindTooltip(`Radio ${label}`, { sticky: true });
  circulo.bindPopup(`<div class="popup-title">⭕ Radio ${label}</div><div class="popup-row" style="margin-top:4px;"><span class="remove-pin" style="cursor:pointer; color:#FF6B6B;" id="borrar-${id}">✕ Borrar este radio</span></div>`);
  circulo.on('popupopen', () => {
    const btn = document.getElementById(`borrar-${id}`);
    if (btn) btn.addEventListener('click', () => {
      radioPersonalizadoLayer.removeLayer(circulo);
      delete radiosById[id];
      map.closePopup();
      if (Object.keys(radiosById).length === 0) btnClearRadios.style.display = 'none';
    });
  });
  radiosById[id] = circulo;
  radioStatus.textContent = `Último radio: ${label}. Click en el círculo para borrarlo.`;
  btnClearRadios.style.display = 'block';
});

btnClearRadios.addEventListener('click', () => {
  radioPersonalizadoLayer.clearLayers();
  Object.keys(radiosById).forEach(id => delete radiosById[id]);
  radioStatus.textContent = '';
  btnClearRadios.style.display = 'none';
});

// ---------- Dibujo de zonas (persistente en localStorage + export/import) ----------
const LS_DIBUJOS_KEY = 'core_mapa_dibujos_v1';
const drawnItems = new L.FeatureGroup().addTo(map);
document.getElementById('chk-zonas-dibujadas').addEventListener('change', e => {
  if (e.target.checked) map.addLayer(drawnItems); else map.removeLayer(drawnItems);
});
const dibujoStatus = document.getElementById('dibujo-status');

function estiloZonaDibujada() { return { color: '#A78BFA', weight: 2, fillColor: '#A78BFA', fillOpacity: 0.22 }; }

// ---------- Modal de texto multilínea (para nombrar/renombrar zonas) ----------
function pedirNombreZona(titulo, valorInicial) {
  return new Promise((resolve) => {
    const overlay = document.getElementById('zona-nombre-overlay');
    const input = document.getElementById('zona-nombre-input');
    const tituloEl = document.getElementById('zona-nombre-titulo');
    const btnGuardar = document.getElementById('zona-nombre-guardar');
    const btnCancelar = document.getElementById('zona-nombre-cancelar');

    tituloEl.textContent = titulo;
    input.value = valorInicial || '';
    overlay.style.display = 'flex';
    input.focus();
    input.select();

    function limpiar() {
      overlay.style.display = 'none';
      btnGuardar.removeEventListener('click', onGuardar);
      btnCancelar.removeEventListener('click', onCancelar);
      input.removeEventListener('keydown', onKeydown);
    }
    function onGuardar() { const v = input.value; limpiar(); resolve(v); }
    function onCancelar() { limpiar(); resolve(null); }
    function onKeydown(e) {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { onGuardar(); }
      else if (e.key === 'Escape') { onCancelar(); }
    }
    btnGuardar.addEventListener('click', onGuardar);
    btnCancelar.addEventListener('click', onCancelar);
    input.addEventListener('keydown', onKeydown);
  });
}

function bindZonaPopup(layer, label) {
  layer._zonaLabel = label || 'Zona sin nombre';
  const labelHtml = layer._zonaLabel.replace(/\n/g, '<br>');

  // Etiqueta visible siempre sobre la zona (no hace falta hacer click)
  if (layer._zonaTooltip) {
    layer.setTooltipContent(labelHtml);
  } else {
    layer.bindTooltip(labelHtml, { permanent: true, direction: 'center', className: 'zona-label' });
    layer._zonaTooltip = true;
  }

  layer.bindPopup(() => `
    <div class="popup-title">✏️ ${labelHtml}</div>
    <div class="popup-row" style="margin-top:4px; display:flex; gap:10px;">
      <span class="remove-pin" style="cursor:pointer; color:var(--orange);" id="renombrar-zona-${L.Util.stamp(layer)}">✎ Renombrar</span>
      <span class="remove-pin" style="cursor:pointer; color:#FF6B6B;" id="borrar-zona-${L.Util.stamp(layer)}">✕ Borrar esta zona</span>
    </div>
  `);
  layer.on('popupopen', () => {
    const btnBorrar = document.getElementById(`borrar-zona-${L.Util.stamp(layer)}`);
    if (btnBorrar) btnBorrar.addEventListener('click', () => { drawnItems.removeLayer(layer); guardarDibujos(); map.closePopup(); });

    const btnRenombrar = document.getElementById(`renombrar-zona-${L.Util.stamp(layer)}`);
    if (btnRenombrar) btnRenombrar.addEventListener('click', async () => {
      map.closePopup();
      const nuevoNombre = await pedirNombreZona('Renombrar zona', layer._zonaLabel);
      if (nuevoNombre === null) return; // canceló
      const label = nuevoNombre.trim() || 'Zona sin nombre';
      layer.feature = layer.feature || { type: 'Feature', properties: {} };
      layer.feature.properties.label = label;
      bindZonaPopup(layer, label);
      guardarDibujos();
      dibujoStatus.textContent = 'Zona renombrada.';
    });
  });
}

function guardarDibujos() {
  try { localStorage.setItem(LS_DIBUJOS_KEY, JSON.stringify(drawnItems.toGeoJSON())); }
  catch (err) { dibujoStatus.textContent = 'No se pudo guardar (almacenamiento del navegador lleno o bloqueado).'; }
}

function cargarDibujos() {
  try {
    const raw = localStorage.getItem(LS_DIBUJOS_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    L.geoJSON(data, { style: estiloZonaDibujada, onEachFeature: (f, layer) => bindZonaPopup(layer, f.properties && f.properties.label) }).eachLayer(l => drawnItems.addLayer(l));
  } catch (err) { console.warn('No se pudieron cargar los dibujos guardados', err); }
}
cargarDibujos();

const drawPolygonHandler = new L.Draw.Polygon(map, { shapeOptions: estiloZonaDibujada(), showArea: true });
const btnDibujar = document.getElementById('btn-dibujar');
btnDibujar.addEventListener('click', () => {
  if (btnDibujar.classList.contains('active')) { drawPolygonHandler.disable(); btnDibujar.classList.remove('active'); }
  else { drawPolygonHandler.enable(); btnDibujar.classList.add('active'); }
});

map.on(L.Draw.Event.CREATED, async (e) => {
  const layer = e.layer;
  layer.setStyle && layer.setStyle(estiloZonaDibujada());
  const nombre = await pedirNombreZona('Nombre de la zona', '');
  const label = (nombre && nombre.trim()) || 'Zona sin nombre';
  bindZonaPopup(layer, label);
  layer.feature = { type: 'Feature', properties: { label } };
  drawnItems.addLayer(layer);
  guardarDibujos();
  btnDibujar.classList.remove('active');
  dibujoStatus.textContent = `Zona "${label.replace(/\n/g, ' / ')}" guardada.`;
});

const editHandler = new L.EditToolbar.Edit(map, { featureGroup: drawnItems });
const btnEditar = document.getElementById('btn-editar-dibujos');
btnEditar.addEventListener('click', () => {
  if (btnEditar.classList.contains('active')) {
    editHandler.save(); editHandler.disable();
    btnEditar.classList.remove('active'); btnEditar.innerHTML = '🖊️<br>Editar formas';
    guardarDibujos(); dibujoStatus.textContent = 'Cambios guardados.';
  } else {
    editHandler.enable();
    btnEditar.classList.add('active'); btnEditar.innerHTML = '✅<br>Listo (guardar)';
    dibujoStatus.textContent = 'Arrastrá los vértices para modificar la forma.';
  }
});

document.getElementById('btn-exportar-dibujos').addEventListener('click', () => {
  const data = drawnItems.toGeoJSON();
  if (!data.features.length) { dibujoStatus.textContent = 'No hay zonas dibujadas para exportar.'; return; }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/geo+json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `core_dibujos_${new Date().toISOString().slice(0,10)}.geojson`;
  a.click(); URL.revokeObjectURL(url);
  dibujoStatus.textContent = 'Dibujos exportados.';
});

const inputImportar = document.getElementById('input-importar-dibujos');
document.getElementById('btn-importar-dibujos').addEventListener('click', () => inputImportar.click());
inputImportar.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const data = JSON.parse(ev.target.result);
      L.geoJSON(data, { style: estiloZonaDibujada, onEachFeature: (f, layer) => bindZonaPopup(layer, f.properties && f.properties.label) }).eachLayer(l => drawnItems.addLayer(l));
      guardarDibujos();
      dibujoStatus.textContent = 'Dibujos importados y sumados a los existentes.';
    } catch (err) { dibujoStatus.textContent = 'El archivo no es un geojson válido.'; }
    inputImportar.value = '';
  };
  reader.readAsText(file);
});

// ---------- Locales comerciales (geojson externo, cargado por el usuario) ----------
const LS_LOCALES_KEY = 'core_mapa_locales_v1';
const localesLayer = L.layerGroup().addTo(map);
const localesStatus = document.getElementById('locales-status');
const btnQuitarLocales = document.getElementById('btn-quitar-locales');

const LABELS_LOCALES = { precio:'Precio', valor:'Precio', price:'Precio', direccion:'Dirección', address:'Dirección', m2:'Superficie', metros:'Superficie', superficie:'Superficie', ambientes:'Ambientes', dpto:'Partido/Comuna', DPTO:'Partido/Comuna', fuente:'Portal', portal:'Portal', estado:'Estado' };
const CLAVES_LINK = ['link', 'url', 'enlace', 'aviso'];
const CLAVES_OCULTAR = ['lat', 'lon', 'latitud', 'longitud', 'lng'];

function formatearValor(key, val) {
  if (val === null || val === undefined || val === '') return null;
  const s = String(val);
  return s.length > 90 ? s.slice(0, 90) + '…' : s;
}
function propsToHtml(props) {
  let filas = '', link = null;
  Object.entries(props || {}).forEach(([key, val]) => {
    const keyLower = key.toLowerCase();
    if (CLAVES_OCULTAR.includes(keyLower)) return;
    if (CLAVES_LINK.includes(keyLower) && val) { link = val; return; }
    const formatted = formatearValor(key, val);
    if (formatted === null) return;
    const label = LABELS_LOCALES[keyLower] || key.replace(/_/g, ' ');
    filas += `<div class="popup-row"><b>${label}:</b> ${formatted}</div>`;
  });
  if (link) filas += `<div class="popup-row" style="margin-top:4px;"><a href="${link}" target="_blank" rel="noopener" style="color:var(--orange);">Ver aviso original ↗</a></div>`;
  return filas || '<div class="popup-row">Sin datos adicionales</div>';
}
function renderLocales(geojsonData) {
  localesLayer.clearLayers();
  let n = 0;
  L.geoJSON(geojsonData, {
    pointToLayer: (f, latlng) => { n++; return L.circleMarker(latlng, { radius: 5, color: '#7a6300', fillColor: '#FFD23F', fillOpacity: 0.9, weight: 1.5 }); },
    onEachFeature: (f, layer) => {
      const p = f.properties || {};
      const nombre = p.direccion || p.nombre || p.address || 'Local comercial';
      layer.bindTooltip(`<div style="font-weight:600; color:var(--orange);">${nombre}</div>`, { sticky: true });
      layer.bindPopup(`<div class="popup-title">🏢 ${nombre}</div>${propsToHtml(p)}`);
    }
  }).addTo(localesLayer);
  return n;
}
function cargarLocalesGuardados() {
  try {
    const raw = localStorage.getItem(LS_LOCALES_KEY);
    if (!raw) return;
    const n = renderLocales(JSON.parse(raw));
    localesStatus.textContent = `${n} locales cargados (guardado en este navegador).`;
    btnQuitarLocales.style.display = 'block';
  } catch (err) { console.warn('No se pudo cargar la capa de locales guardada', err); }
}
cargarLocalesGuardados();

document.getElementById('btn-cargar-locales').addEventListener('click', () => document.getElementById('input-locales').click());
document.getElementById('input-locales').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const data = JSON.parse(ev.target.result);
      const n = renderLocales(data);
      try { localStorage.setItem(LS_LOCALES_KEY, JSON.stringify(data)); }
      catch (storageErr) {
        localesStatus.textContent = `${n} locales cargados (no se pudo guardar para la próxima sesión: archivo muy grande).`;
        btnQuitarLocales.style.display = 'block';
        return;
      }
      localesStatus.textContent = `${n} locales cargados y guardados. Reemplaza la carga anterior.`;
      btnQuitarLocales.style.display = 'block';
    } catch (err) { localesStatus.textContent = 'El archivo no es un geojson válido.'; }
    e.target.value = '';
  };
  reader.readAsText(file);
});
btnQuitarLocales.addEventListener('click', () => {
  localesLayer.clearLayers();
  localStorage.removeItem(LS_LOCALES_KEY);
  localesStatus.textContent = '';
  btnQuitarLocales.style.display = 'none';
});
document.getElementById('chk-locales').addEventListener('change', e => {
  if (e.target.checked) map.addLayer(localesLayer); else map.removeLayer(localesLayer);
});

// ---------- Mapa de calor de clientes ----------
// A propósito, esta capa NO se guarda en localStorage ni en ningún archivo
// del repo: vive solo en memoria mientras dure la sesión del navegador,
// por ser el dato más sensible de todos los que carga el mapa (ubicación
// real de clientes). Se pierde al recargar la página, a propósito.
let heatLayer = null;
const heatmapStatus = document.getElementById('heatmap-status');
const heatmapControles = document.getElementById('heatmap-controles');
const btnQuitarHeatmap = document.getElementById('btn-quitar-heatmap');
let heatPuntosActuales = [];

function parseCSVSimple(text) {
  const lineas = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (!lineas.length) return [];
  const headers = lineas[0].split(',').map(h => h.trim().toLowerCase().replace(/["']/g, ''));
  const filas = [];
  for (let i = 1; i < lineas.length; i++) {
    const valores = lineas[i].split(',').map(v => v.trim().replace(/["']/g, ''));
    const fila = {};
    headers.forEach((h, idx) => { fila[h] = valores[idx]; });
    filas.push(fila);
  }
  return filas;
}

function extraerPuntosDeCSV(text) {
  const filas = parseCSVSimple(text);
  const puntos = [];
  filas.forEach(fila => {
    const lat = parseFloat(fila.lat || fila.latitud || fila.latitude);
    const lon = parseFloat(fila.lon || fila.lng || fila.longitud || fila.longitude);
    const peso = parseFloat(fila.peso || fila.weight || fila.cantidad) || 1;
    if (!isNaN(lat) && !isNaN(lon)) puntos.push([lat, lon, peso]);
  });
  return puntos;
}

function extraerPuntosDeGeoJSON(data) {
  const puntos = [];
  (data.features || []).forEach(f => {
    if (!f.geometry || f.geometry.type !== 'Point') return;
    const [lon, lat] = f.geometry.coordinates;
    const p = f.properties || {};
    const peso = parseFloat(p.peso || p.weight || p.cantidad) || 1;
    puntos.push([lat, lon, peso]);
  });
  return puntos;
}

function renderHeatmap(puntos) {
  if (heatLayer) { map.removeLayer(heatLayer); heatLayer = null; }
  heatPuntosActuales = puntos;
  const radio = parseInt(document.getElementById('heatmap-radio').value, 10);
  const blur = parseInt(document.getElementById('heatmap-blur').value, 10);
  heatLayer = L.heatLayer(puntos, { radius: radio, blur: blur, maxZoom: 17 });
  if (document.getElementById('chk-heatmap').checked) heatLayer.addTo(map);
  heatmapControles.style.display = 'block';
  btnQuitarHeatmap.style.display = 'block';
}

document.getElementById('btn-cargar-heatmap').addEventListener('click', () => document.getElementById('input-heatmap').click());
document.getElementById('input-heatmap').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      let puntos = [];
      if (file.name.toLowerCase().endsWith('.csv')) {
        puntos = extraerPuntosDeCSV(ev.target.result);
      } else {
        const data = JSON.parse(ev.target.result);
        puntos = extraerPuntosDeGeoJSON(data);
      }
      if (!puntos.length) {
        heatmapStatus.textContent = 'No se encontraron puntos válidos en el archivo. Revisá los nombres de columna (lat/lon).';
        return;
      }
      renderHeatmap(puntos);
      heatmapStatus.textContent = `${puntos.length} ubicaciones cargadas (solo en esta sesión, no se guardan).`;
    } catch (err) {
      heatmapStatus.textContent = 'No se pudo leer el archivo. Verificá que sea un CSV o GeoJSON válido.';
    }
    e.target.value = '';
  };
  reader.readAsText(file);
});

document.getElementById('heatmap-radio').addEventListener('input', (e) => {
  document.getElementById('heatmap-radio-val').textContent = e.target.value;
  if (heatLayer) renderHeatmap(heatPuntosActuales);
});
document.getElementById('heatmap-blur').addEventListener('input', (e) => {
  document.getElementById('heatmap-blur-val').textContent = e.target.value;
  if (heatLayer) renderHeatmap(heatPuntosActuales);
});

document.getElementById('chk-heatmap').addEventListener('change', e => {
  if (!heatLayer) return;
  if (e.target.checked) map.addLayer(heatLayer); else map.removeLayer(heatLayer);
});

btnQuitarHeatmap.addEventListener('click', () => {
  if (heatLayer) { map.removeLayer(heatLayer); heatLayer = null; }
  heatPuntosActuales = [];
  heatmapStatus.textContent = '';
  heatmapControles.style.display = 'none';
  btnQuitarHeatmap.style.display = 'none';
});
