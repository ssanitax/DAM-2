class XystusGraficas {
  static colores = ['#4B2E4F','#E6C36A','#7A4E7C','#C9A227','#2B241C','#A67C52','#8B6B8C','#D4B96A'];

  static crear(contenedor, tipo, etiquetas, valores, titulo='') {
    const el = typeof contenedor === 'string' ? document.querySelector(contenedor) : contenedor;
    if (!el) return;
    el.innerHTML = '';
    if (titulo) {
      const h = document.createElement('h3');
      h.textContent = titulo;
      el.append(h);
    }
    const datos = valores.map((v,i) => ({
      label: String(etiquetas[i] ?? `Elemento ${i+1}`),
      valor: Math.max(0, Number(v) || 0)
    }));
    if (!datos.length || !datos.some(d => d.valor)) {
      el.insertAdjacentHTML('beforeend', '<p class="vacio">Sin datos para representar</p>');
      return;
    }
    const ns = 'http://www.w3.org/2000/svg';
    const nodo = (tag, attrs={}) => {
      const e = document.createElementNS(ns, tag);
      Object.entries(attrs).forEach(([k,v]) => e.setAttribute(k, v));
      return e;
    };
    const svg = nodo('svg', {viewBox:'0 0 440 260', role:'img', 'aria-label': titulo || tipo});
    svg.classList.add('grafica-svg');
    el.append(svg);

    const tooltip = document.querySelector('#grafica-tooltip') || Object.assign(
      document.body.appendChild(document.createElement('div')),
      {id:'grafica-tooltip', className:'grafica-tooltip'}
    );
    const total = datos.reduce((a,d) => a + d.valor, 0);
    const activar = (fig, d) => {
      fig.addEventListener('mousemove', e => {
        tooltip.textContent = `${d.label}: ${new Intl.NumberFormat('es-ES',{maximumFractionDigits:2}).format(d.valor)} (${(d.valor/total*100).toFixed(1)}%)`;
        tooltip.style.display = 'block';
        tooltip.style.left = Math.min(e.clientX+12, innerWidth-tooltip.offsetWidth-8)+'px';
        tooltip.style.top = Math.min(e.clientY+12, innerHeight-tooltip.offsetHeight-8)+'px';
      });
      fig.addEventListener('mouseleave', () => tooltip.style.display = 'none');
    };

    if (tipo === 'linea') {
      const max = Math.max(...datos.map(d => d.valor), 1);
      const n = Math.min(datos.length, 14);
      const slice = datos.slice(0, n);
      const left = 36, right = 420, top = 24, bottom = 210;
      const spanX = right - left;
      const spanY = bottom - top;
      const pts = slice.map((d,i) => {
        const x = left + (n === 1 ? spanX/2 : (i/(n-1))*spanX);
        const y = bottom - (d.valor/max)*spanY;
        return {x,y,d};
      });
      svg.append(nodo('line', {x1:left, y1:bottom, x2:right, y2:bottom, stroke:'#D9D0C3', 'stroke-width':1}));
      [0.25,0.5,0.75,1].forEach(f => {
        const y = bottom - f*spanY;
        svg.append(nodo('line', {x1:left, y1:y, x2:right, y2:y, stroke:'#EDE6DA', 'stroke-width':1}));
      });
      const poly = nodo('polyline', {
        points: pts.map(p => `${p.x},${p.y}`).join(' '),
        fill:'none', stroke:this.colores[0], 'stroke-width':3, 'stroke-linejoin':'round', 'stroke-linecap':'round'
      });
      svg.append(poly);
      const areaPts = `${left},${bottom} ` + pts.map(p => `${p.x},${p.y}`).join(' ') + ` ${pts[pts.length-1].x},${bottom}`;
      svg.append(nodo('polygon', {points:areaPts, fill:this.colores[1], opacity:0.25}));
      pts.forEach(p => {
        const c = nodo('circle', {cx:p.x, cy:p.y, r:5, fill:this.colores[1], stroke:this.colores[0], 'stroke-width':2});
        svg.append(c);
        activar(c, p.d);
        const t = nodo('text', {x:p.x, y:235, 'text-anchor':'middle', 'font-size':10, fill:'#555'});
        t.textContent = p.d.label.slice(0, Math.max(3, Math.floor(spanX/n/6)));
        svg.append(t);
      });
      return;
    }

    if (tipo === 'anillo' || tipo === 'tarta') {
      let ang = -Math.PI/2;
      const cx=145, cy=128, r=105, ri = tipo === 'anillo' ? 62 : 0;
      const punto = (rad,a) => [cx+rad*Math.cos(a), cy+rad*Math.sin(a)];
      datos.forEach((d,i) => {
        if (!d.valor) return;
        const delta = d.valor/total*Math.PI*2, end = ang+delta;
        let path;
        if (delta >= Math.PI*2 - 1e-8) {
          path = ri
            ? `M ${cx-r} ${cy} a ${r} ${r} 0 1 0 ${2*r} 0 a ${r} ${r} 0 1 0 ${-2*r} 0 M ${cx-ri} ${cy} a ${ri} ${ri} 0 1 1 ${2*ri} 0 a ${ri} ${ri} 0 1 1 ${-2*ri} 0 Z`
            : `M ${cx-r} ${cy} a ${r} ${r} 0 1 0 ${2*r} 0 a ${r} ${r} 0 1 0 ${-2*r} 0 Z`;
        } else {
          const [x1,y1]=punto(r,ang), [x2,y2]=punto(r,end), big=delta>Math.PI?1:0;
          if (ri) {
            const [x3,y3]=punto(ri,end), [x4,y4]=punto(ri,ang);
            path = `M ${x1} ${y1} A ${r} ${r} 0 ${big} 1 ${x2} ${y2} L ${x3} ${y3} A ${ri} ${ri} 0 ${big} 0 ${x4} ${y4} Z`;
          } else {
            path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${big} 1 ${x2} ${y2} Z`;
          }
        }
        const fig = nodo('path', {d:path, fill:this.colores[i%this.colores.length], stroke:'#fff', 'stroke-width':2, 'fill-rule':'evenodd'});
        svg.append(fig);
        activar(fig, d);
        ang = end;
      });
      if (ri) {
        const t = nodo('text', {x:cx, y:cy, 'text-anchor':'middle', 'font-size':24, 'font-weight':700, fill:'#2B241C'});
        t.textContent = new Intl.NumberFormat('es-ES', {notation: total>9999?'compact':'standard'}).format(total);
        svg.append(t);
      }
      datos.slice(0,7).forEach((d,i) => {
        const y = 38+i*29;
        svg.append(nodo('rect', {x:275, y:y-11, width:12, height:12, rx:3, fill:this.colores[i%this.colores.length]}));
        const t = nodo('text', {x:293, y, fill:'#444', 'font-size':12});
        t.textContent = d.label.slice(0,17)+' · '+d.valor;
        svg.append(t);
      });
    } else {
      const max = Math.max(...datos.map(d => d.valor), 1);
      const n = Math.min(datos.length, 12);
      const gap = 9;
      const w = (395/n) - gap;
      datos.slice(0,n).forEach((d,i) => {
        const height = d.valor/max*190;
        const x = 25+i*(w+gap);
        const y = 216-height;
        const rect = nodo('rect', {x, y, width:w, height, rx:4, fill:this.colores[i%this.colores.length]});
        svg.append(rect);
        activar(rect, d);
        const t = nodo('text', {x:x+w/2, y:235, 'text-anchor':'middle', 'font-size':10, fill:'#555'});
        t.textContent = d.label.slice(0, Math.max(3, Math.floor(w/6)));
        svg.append(t);
      });
    }
  }

  static frecuencia(registros, columna) {
    const mapa = new Map();
    registros.forEach(r => {
      const k = String(r[columna] ?? '(vacío)');
      mapa.set(k, (mapa.get(k) || 0) + 1);
    });
    return [...mapa].sort((a,b) => b[1]-a[1]).slice(0,10);
  }

  static campo(registros, columnas) {
    const candidatos = columnas.filter(c =>
      !c.pk && !['id','identificador'].includes(c.name) && !/_id$/.test(c.name)
    );
    return candidatos.find(c => {
      const u = new Set(registros.map(r => r[c.name]));
      return u.size > 1 && u.size <= Math.max(12, registros.length * .65);
    }) || candidatos.find(c => new Set(registros.map(r => r[c.name])).size > 1) || candidatos[0];
  }

  static suma(registros, columna) {
    return registros.reduce((a,r) => a + (parseFloat(r[columna]) || 0), 0);
  }
}
