// ============ MAPA CORE - Análisis de Expansión ============

const map = L.map('map', { zoomControl: true }).setView([-34.60, -58.45], 12);

L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OpenStreetMap &copy; CARTO',
  maxZoom: 19
}).addTo(map);

// ---------- Helpers ----------
function fmt(n) {
  return new Intl.NumberFormat('es-AR').format(Math.round(n));
}

// ---------- Poder adquisitivo (segmento 1-7) ----------
const segmentoColors = {
  1: '#2E7DFF', // Clase alta
  2: '#3FA66B', // Clase media alta
  3: '#8BC34A', // Clase media
  4: '#E0A526', // Clase media baja
  5: '#F2C744', // Clase baja integrada
  6: '#B5762E', // Clase baja
  7: '#7A4A22'  // Clase muy baja
};
const segmentoLabels = {
  1: 'Clase alta',
  2: 'Clase media alta',
  3: 'Clase media',
  4: 'Clase media baja',
  5: 'Clase baja integrada',
  6: 'Clase baja',
  7: 'Clase muy baja'
};

const poderLayer = L.geoJSON(window.DATA_PODER, {
  style: f => {
    const seg = f.properties.segmento;
    return {
      fillColor: segmentoColors[seg] || '#666',
      fillOpacity: 0.55,
      color: 'rgba(0,0,0,0.15)',
      weight: 0.2,
      stroke: false
    };
  },
  onEachFeature: (f, layer) => {
    const seg = f.properties.segmento;
    const dpto = f.properties.DPTO || f.properties.dpto || '';
    layer.bindPopup(`
      <div class="popup-title">Poder adquisitivo</div>
      <div class="popup-row"><b>${segmentoLabels[seg] || '—'}</b></div>
      <div class="popup-row">Partido/Depto: ${dpto}</div>
    `);
  }
});

// ---------- Densidad poblacional (quintiles) ----------
function densidadColor(pob) {
  if (pob >= 1191) return '#D9483A';
  if (pob >= 964) return '#E0763A';
  if (pob >= 793) return '#E0A526';
  if (pob >= 619) return '#E8D06B';
  return '#F5EFC9';
}

const densidadLayer = L.geoJSON(window.DATA_DENSIDAD, {
  style: f => {
    const pob = f.properties.Radios_poblacion_total || 0;
    return {
      fillColor: densidadColor(pob),
      fillOpacity: 0.55,
      color: 'rgba(0,0,0,0.15)',
      weight: 0.2,
      stroke: false
    };
  },
  onEachFeature: (f, layer) => {
    const pob = f.properties.Radios_poblacion_total || 0;
    const sup = f.properties.Radios_superficie_km2 || 0;
    const dpto = f.properties.dpto || f.properties.DPTO || '';
    layer.bindPopup(`
      <div class="popup-title">Densidad poblacional</div>
      <div class="popup-row">Población del radio: <b>${fmt(pob)}</b></div>
      <div class="popup-row">Superficie: ${sup.toFixed(2)} km²</div>
      <div class="popup-row">Partido/Depto: ${dpto}</div>
    `);
  }
});

// ---------- Establecimientos deportivos (competencia) ----------
const deportivosLayer = L.geoJSON(window.DATA_DEPORTIVOS, {
  pointToLayer: (f, latlng) => L.circleMarker(latlng, {
    radius: 4,
    fillColor: '#4C9AFF',
    color: '#1a3a66',
    weight: 1,
    fillOpacity: 0.85
  }),
  onEachFeature: (f, layer) => {
    const p = f.properties;
    layer.bindPopup(`
      <div class="popup-title">${p.nombre}</div>
      <div class="popup-row">${p.deportes || 'Actividad deportiva'}</div>
      <div class="popup-row">${p.DPTO || ''}</div>
    `);
  }
});

// ---------- Riesgo de exclusión (1 bajo - 6 alto) ----------
function riesgoColor(inc) {
  if (inc >= 5) return '#D9483A';
  if (inc >= 4) return '#E0763A';
  if (inc >= 3) return '#E0A526';
  if (inc >= 2) return '#E8D06B';
  return '#F5EFC9';
}
const riesgoLayer = L.geoJSON(window.DATA_RIESGO, {
  style: f => ({
    fillColor: riesgoColor(f.properties.Incidencia || 1),
    fillOpacity: 0.55,
    color: 'rgba(0,0,0,0.15)',
    weight: 0.2,
    stroke: false
  }),
  onEachFeature: (f, layer) => {
    const p = f.properties;
    layer.bindPopup(`
      <div class="popup-title">Riesgo de exclusión</div>
      <div class="popup-row">Incidencia: <b>${p.Incidencia}</b> / 6</div>
      <div class="popup-row">Partido/Depto: ${p.DPTO || ''}</div>
    `);
  }
});

// ---------- Barrios populares ----------
const barriosLayer = L.geoJSON(window.DATA_BARRIOS, {
  style: f => ({
    fillColor: '#7A4A22',
    fillOpacity: 0.6,
    color: '#3d2510',
    weight: 0.6
  }),
  onEachFeature: (f, layer) => {
    const p = f.properties;
    layer.bindPopup(`
      <div class="popup-title">${p.nombre_bar || 'Barrio popular'}</div>
      <div class="popup-row">Tipo: ${p.clasificacion || '—'}</div>
      <div class="popup-row">Familias: <b>${p.familias ? fmt(p.familias) : '—'}</b></div>
      <div class="popup-row">Partido/Depto: ${p.DPTO || ''}</div>
    `);
  }
});

// ---------- Transporte: uso de colectivo (zonal, quintiles) ----------
function transporteColor(uso) {
  if (uso >= 1348) return '#0B3D0B';
  if (uso >= 419)  return '#1E7A2E';
  if (uso >= 216)  return '#3FA84A';
  if (uso >= 91)   return '#7ACB6E';
  return '#C9EABB';
}
const transporteLayer = L.geoJSON(window.DATA_TRANSPORTE, {
  style: f => ({
    fillColor: transporteColor(f.properties.usos_colectivo || 0),
    fillOpacity: 0.4,
    color: 'rgba(0,0,0,0.15)',
    weight: 0.2,
    stroke: false
  }),
  onEachFeature: (f, layer) => {
    const p = f.properties;
    layer.bindPopup(`
      <div class="popup-title">Uso de colectivo</div>
      <div class="popup-row">Transacciones (radio): <b>${fmt(p.usos_colectivo || 0)}</b></div>
      <div class="popup-row">Partido/Depto: ${p.DPTO || ''}</div>
    `);
  }
});

// ---------- Estaciones de tren (puntos) ----------
const trenLayer = L.geoJSON(window.DATA_TREN, {
  pointToLayer: (f, latlng) => L.circleMarker(latlng, {
    radius: 5,
    fillColor: '#4CE0AF',
    color: '#1a5c42',
    weight: 1,
    fillOpacity: 0.9
  }),
  onEachFeature: (f, layer) => {
    const p = f.properties;
    layer.bindPopup(`
      <div class="popup-title">${p.nam || 'Estación'}</div>
      <div class="popup-row">${p.gna || 'Estación de ferrocarril'}</div>
    `);
  }
});

// ---------- Terminales de ómnibus (puntos, muy pocos) ----------
const omnibusLayer = L.geoJSON(window.DATA_OMNIBUS, {
  pointToLayer: (f, latlng) => L.circleMarker(latlng, {
    radius: 6,
    fillColor: '#B04CE0',
    color: '#4a1a63',
    weight: 1,
    fillOpacity: 0.9
  }),
  onEachFeature: (f, layer) => {
    const p = f.properties;
    layer.bindPopup(`
      <div class="popup-title">${p.nam || 'Terminal'}</div>
      <div class="popup-row">${p.fna || 'Terminal de ómnibus'}</div>
    `);
  }
});

// ---------- Sedes CORE ----------
// Tamaño geográfico real: el círculo representa un radio fijo en METROS,
// así que se ve chico alejado (zoom bajo) y grande acercado (zoom alto) —
// igual que cualquier objeto real dibujado sobre un mapa.
const BASE_ZOOM = 14; // zoom de referencia donde el tamaño en px = tamaño "natural"
const ZOOM_GROWTH = 0.55; // qué tan agresivo crece el círculo por nivel de zoom (1 = duplica cada nivel)
const MAX_SIZE = 64; // tope de tamaño en px, para que de cerca no tape media cuadra

function sizeAtZoom(total, zoom) {
  const baseSize = Math.max(28, Math.min(60, 26 + Math.sqrt(total || 1) * 1.7));
  const scale = Math.pow(2, (zoom - BASE_ZOOM) * ZOOM_GROWTH);
  return Math.max(10, Math.min(MAX_SIZE, baseSize * scale));
}

// Colores por modelo de negocio — paleta oficial CORE
const modeloColors = {
  'CORE': '#FF5C33',
  'CORE + Pilates': '#6B2A1A',
  'CORE + Pilates + Yoga': '#C4A482'
};
function colorForModelo(modelo) {
  return modeloColors[modelo] || '#FF5C33';
}

function buildIcon(total, zoom, modelo) {
  const size = sizeAtZoom(total, zoom);
  const showLogo = size >= 30; // a tamaños muy chicos, el logo no entra legible
  const logoW = size * 0.62;
  const color = colorForModelo(modelo);
  return L.divIcon({
    className: 'core-marker',
    html: `<div class="core-marker-circle" style="width:${size}px;height:${size}px;background:${color}A6;">
             ${showLogo ? `<img src="${window.CORE_LOGO}" style="width:${logoW}px;" />` : ''}
           </div>`,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2]
  });
}

const coreMarkers = []; // {marker, total, modelo}

const coreLayer = L.geoJSON(window.DATA_CORE, {
  pointToLayer: (f, latlng) => {
    const marker = L.marker(latlng, { icon: buildIcon(f.properties.total, map.getZoom(), f.properties.modelo) });
    coreMarkers.push({ marker, total: f.properties.total, modelo: f.properties.modelo });
    return marker;
  },
  onEachFeature: (f, layer) => {
    const p = f.properties;
    layer.bindPopup(`
      <div class="popup-title">CORE ${p.sede}</div>
      <div class="popup-row">${p.direccion}</div>
      <div class="popup-row">Modelo: ${p.modelo}</div>
      <div class="popup-row">Alumnos CORE: <b>${fmt(p.core)}</b></div>
      ${p.pilates ? `<div class="popup-row">Alumnos Pilates: <b>${fmt(p.pilates)}</b></div>` : ''}
      ${p.yoga ? `<div class="popup-row">Alumnos Yoga: <b>${fmt(p.yoga)}</b></div>` : ''}
      <div class="popup-row">Total activos: <b>${fmt(p.total)}</b></div>
    `);
  }
}).addTo(map);

// Recalcular tamaño de cada marcador cuando cambia el zoom
map.on('zoomend', () => {
  const z = map.getZoom();
  coreMarkers.forEach(({ marker, total, modelo }) => {
    marker.setIcon(buildIcon(total, z, modelo));
  });
});

// ---------- Checkboxes de capas ----------
function toggleLayer(chkId, layer) {
  document.getElementById(chkId).addEventListener('change', e => {
    if (e.target.checked) { map.addLayer(layer); layer.bringToFront && layer.bringToFront(); }
    else map.removeLayer(layer);
    // sedes CORE siempre arriba de todo
    if (map.hasLayer(coreLayer)) coreLayer.bringToFront();
  });
}
toggleLayer('chk-core', coreLayer);
toggleLayer('chk-deportivos', deportivosLayer);
toggleLayer('chk-poder', poderLayer);
toggleLayer('chk-densidad', densidadLayer);
toggleLayer('chk-riesgo', riesgoLayer);
toggleLayer('chk-barrios', barriosLayer);
toggleLayer('chk-transporte', transporteLayer);
toggleLayer('chk-tren', trenLayer);
toggleLayer('chk-omnibus', omnibusLayer);

// ---------- Leyendas dinámicas ----------
const legendPoder = document.getElementById('legend-poder');
Object.keys(segmentoLabels).forEach(k => {
  legendPoder.innerHTML += `<div class="legend-row"><span class="legend-swatch" style="background:${segmentoColors[k]}"></span>${segmentoLabels[k]}</div>`;
});
document.getElementById('chk-poder').addEventListener('change', e => {
  legendPoder.classList.toggle('show', e.target.checked);
});

const legendDensidad = document.getElementById('legend-densidad');
const densBands = [
  ['#D9483A', '≥ 1.191 hab/radio'],
  ['#E0763A', '964 – 1.191'],
  ['#E0A526', '793 – 964'],
  ['#E8D06B', '619 – 793'],
  ['#F5EFC9', '< 619']
];
densBands.forEach(([color, label]) => {
  legendDensidad.innerHTML += `<div class="legend-row"><span class="legend-swatch" style="background:${color}"></span>${label}</div>`;
});
document.getElementById('chk-densidad').addEventListener('change', e => {
  legendDensidad.classList.toggle('show', e.target.checked);
});

const legendRiesgo = document.getElementById('legend-riesgo');
const riesgoBands = [
  ['#D9483A', 'Muy alto (5-6)'],
  ['#E0763A', 'Alto (4)'],
  ['#E0A526', 'Medio (3)'],
  ['#E8D06B', 'Bajo (2)'],
  ['#F5EFC9', 'Muy bajo (1)']
];
riesgoBands.forEach(([color, label]) => {
  legendRiesgo.innerHTML += `<div class="legend-row"><span class="legend-swatch" style="background:${color}"></span>${label}</div>`;
});
document.getElementById('chk-riesgo').addEventListener('change', e => {
  legendRiesgo.classList.toggle('show', e.target.checked);
});

const legendTransporte = document.getElementById('legend-transporte');
const transporteBands = [
  ['#0B3D0B', '≥ 1.348 usos/radio'],
  ['#1E7A2E', '419 – 1.348'],
  ['#3FA84A', '216 – 419'],
  ['#7ACB6E', '91 – 216'],
  ['#C9EABB', '< 91']
];
transporteBands.forEach(([color, label]) => {
  legendTransporte.innerHTML += `<div class="legend-row"><span class="legend-swatch" style="background:${color}"></span>${label}</div>`;
});
document.getElementById('chk-transporte').addEventListener('change', e => {
  legendTransporte.classList.toggle('show', e.target.checked);
});
