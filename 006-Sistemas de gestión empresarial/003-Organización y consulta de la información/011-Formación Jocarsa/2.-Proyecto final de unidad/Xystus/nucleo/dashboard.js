class XystusDashboard {
  constructor(contenedor='section') {
    this.contenedor = document.querySelector(contenedor);
  }

  async render() {
    const zona = this.contenedor;
    zona.innerHTML = '<div class="vacio">Cargando dashboard…</div>';
    const t0 = performance.now();
    try {
      const nombres = await fetch('api/superapi.php?ruta=entidades').then(r => r.json());
      const entidades = await Promise.all(nombres.map(async n => {
        const r = await fetch('api/superapi.php?ruta=tabla&tabla=' + encodeURIComponent(n));
        return r.json();
      }));
      const ms = Math.round(performance.now() - t0);
      const porNombre = Object.fromEntries(entidades.map(e => [e.tabla, e]));
      const reservas = porNombre.reservas?.registros || [];
      const usuarios = porNombre.usuarios?.registros || [];
      const stock = porNombre.stock?.registros || [];
      const pistas = porNombre.pistas?.registros || [];
      const profesores = porNombre.profesores?.registros || [];

      const ingresos = XystusGraficas.suma(reservas, 'total');
      const confirmadas = reservas.filter(r => r.estado === 'Confirmada').length;
      const ocupacion = pistas.length
        ? Math.round((new Set(reservas.map(r => r.pista_id)).size / pistas.length) * 100)
        : 0;
      const totalRegistros = entidades.reduce((a,e) => a + (e.registros?.length || 0), 0);

      zona.innerHTML = `
        <div class="barra">
          <div><small>VISIÓN GENERAL · POLIDEPORTIVO</small><h2>Dashboard</h2></div>
          <span class="demo-aviso">Carga en ${ms} ms · ${totalRegistros} registros</span>
        </div>
        <div class="dashboard-kpis">
          <div><small>Ingresos reservas</small><strong>${new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR'}).format(ingresos)}</strong><span>Suma de totales</span></div>
          <div><small>Reservas</small><strong>${reservas.length}</strong><span>${confirmadas} confirmadas</span></div>
          <div><small>Socios activos</small><strong>${usuarios.length}</strong><span>${profesores.length} profesores · ${pistas.length} pistas</span></div>
          <div><small>Ocupación pistas</small><strong>${ocupacion}%</strong><span>${totalRegistros} registros en ${entidades.length} tablas</span></div>
        </div>
        <div class="dashboard-grid">
          <div class="grafica-card" id="dg1"></div>
          <div class="grafica-card" id="dg2"></div>
          <div class="grafica-card" id="dg3"></div>
          <div class="grafica-card" id="dg4"></div>
          <div class="grafica-card" id="dg5"></div>
          <div class="grafica-card" id="dg6"></div>
        </div>`;

      const porEstado = XystusGraficas.frecuencia(reservas, 'estado');
      XystusGraficas.crear('#dg1', 'anillo',
        porEstado.map(x => x[0]), porEstado.map(x => x[1]),
        'Reservas por estado');

      const porDeporte = XystusGraficas.frecuencia(usuarios, 'deporte');
      XystusGraficas.crear('#dg2', 'tarta',
        porDeporte.map(x => x[0]), porDeporte.map(x => x[1]),
        'Socios por deporte');

      const ingresosDia = {};
      reservas.forEach(r => {
        const k = String(r.fecha || '').slice(5) || '(sin fecha)';
        ingresosDia[k] = (ingresosDia[k] || 0) + (parseFloat(r.total) || 0);
      });
      const dias = Object.keys(ingresosDia).sort();
      XystusGraficas.crear('#dg3', 'linea',
        dias, dias.map(d => ingresosDia[d]),
        'Ingresos por día (€)');

      const porAbono = XystusGraficas.frecuencia(usuarios, 'abono');
      XystusGraficas.crear('#dg4', 'barras',
        porAbono.map(x => x[0]), porAbono.map(x => x[1]),
        'Socios por tipo de abono');

      const porPistaDeporte = XystusGraficas.frecuencia(pistas, 'deporte');
      XystusGraficas.crear('#dg5', 'anillo',
        porPistaDeporte.map(x => x[0]), porPistaDeporte.map(x => x[1]),
        'Pistas por deporte');

      const porTipoStock = XystusGraficas.frecuencia(stock, 'tipo');
      const porFecha = Object.entries(
        reservas.reduce((m,r) => {
          const k = String(r.fecha || '').slice(5);
          m[k] = (m[k] || 0) + 1;
          return m;
        }, {})
      ).sort((a,b) => a[0].localeCompare(b[0]));
      if (porFecha.length) {
        XystusGraficas.crear('#dg6', 'barras',
          porFecha.map(x => x[0]), porFecha.map(x => x[1]),
          'Reservas por día');
      } else {
        XystusGraficas.crear('#dg6', 'anillo',
          porTipoStock.map(x => x[0]), porTipoStock.map(x => x[1]),
          'Stock por tipo');
      }
    } catch (e) {
      zona.textContent = 'No se pudo cargar el dashboard: ' + e.message;
    }
  }
}
