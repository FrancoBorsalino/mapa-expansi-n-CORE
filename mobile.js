// Cajón lateral, botón de ubicación y registro del service worker
(function () {
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }
  const wrap = document.getElementById('map-wrap');
  if (!wrap) return;
  const ICON_MENU = '<svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';
  const ICON_LOC = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/><circle cx="12" cy="12" r="8"/></svg>';

  const scrim = document.createElement('div'); scrim.id = 'drawer-scrim'; document.body.appendChild(scrim);
  const bd = document.createElement('button'); bd.id = 'btn-drawer'; bd.setAttribute('aria-label', 'Abrir panel'); bd.innerHTML = ICON_MENU;
  const bl = document.createElement('button'); bl.id = 'btn-locate'; bl.setAttribute('aria-label', 'Mi ubicación'); bl.innerHTML = ICON_LOC;
  wrap.appendChild(bd); wrap.appendChild(bl);
  [bd, bl].forEach(b => { b.addEventListener('click', e => e.stopPropagation()); b.addEventListener('dblclick', e => e.stopPropagation()); });

  const toggle = open => document.body.classList.toggle('drawer-open', open);
  bd.addEventListener('click', () => toggle(!document.body.classList.contains('drawer-open')));
  scrim.addEventListener('click', () => toggle(false));
  document.querySelectorAll('.region-tab').forEach(t => t.addEventListener('click', () => toggle(false)));

  let marker = null, circle = null;
  bl.addEventListener('click', () => {
    if (!navigator.geolocation) { alert('Este dispositivo no permite geolocalización.'); return; }
    bl.classList.add('active');
    navigator.geolocation.getCurrentPosition(pos => {
      const ll = [pos.coords.latitude, pos.coords.longitude];
      if (marker) { map.removeLayer(marker); map.removeLayer(circle); }
      circle = L.circle(ll, { radius: pos.coords.accuracy, color: '#FF5C33', weight: 1, fillOpacity: .1, interactive: false }).addTo(map);
      marker = L.circleMarker(ll, { radius: 8, color: '#fff', weight: 2, fillColor: '#FF5C33', fillOpacity: 1 }).addTo(map);
      map.setView(ll, Math.max(map.getZoom(), 16));
      marker.bindPopup('<button id="loc-pin" style="padding:8px 12px;background:#FF5C33;color:#fff;border:0;border-radius:6px;font-size:13px">Marcar pin aquí</button>');
      marker.on('popupopen', () => { const b = document.getElementById('loc-pin'); if (b) b.onclick = () => { if (typeof agregarPin === 'function') agregarPin(ll[0], ll[1], 'Mi ubicación'); marker.closePopup(); }; });
    }, err => { bl.classList.remove('active'); alert('No se pudo obtener la ubicación (' + err.message + ').'); },
    { enableHighAccuracy: true, timeout: 15000 });
  });
})();
