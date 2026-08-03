// ============ MAPA CORE - Análisis de Expansión ============

const map = L.map('map', { zoomControl: true, markerZoomAnimation: false }).setView([-34.60, -58.45], 12);

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

// ---------- Sedes CORE ----------
let totalAlumnos = 0;
window.DATA_CORE.features.forEach(f => totalAlumnos += (f.properties.total || 0));
document.getElementById('stat-alumnos').textContent = fmt(totalAlumnos);

function coreIcon(total) {
  const size = Math.max(34, Math.min(80, 30 + Math.sqrt(total || 1) * 2.2));
  const logoW = size * 0.62;
  const logoH = logoW * (100/300); // logo aspect ratio ~3:1
  return L.divIcon({
    className: 'core-marker',
    html: `<div class="core-marker-circle" style="width:${size}px;height:${size}px;">
             <img src="${window.CORE_LOGO}" style="width:${logoW}px;" />
           </div>`,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2]
  });
}

const coreLayer = L.geoJSON(window.DATA_CORE, {
  pointToLayer: (f, latlng) => L.marker(latlng, { icon: coreIcon(f.properties.total) }),
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
