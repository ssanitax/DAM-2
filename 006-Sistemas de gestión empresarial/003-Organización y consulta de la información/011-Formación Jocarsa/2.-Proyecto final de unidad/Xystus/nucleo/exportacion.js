class XystusExportacion {
  static campos(columnas) {
    return columnas.map(c => typeof c === 'string' ? c : c.name);
  }

  static nombreArchivo(nombre, extension) {
    return String(nombre).replace(/[^a-zA-Z0-9_-]/g, '_') + '.' + extension;
  }

  static descargarBlob(nombre, contenido, tipo, extension) {
    const blob = new Blob([contenido], {type: tipo});
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = this.nombreArchivo(nombre, extension);
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  static escaparCSV(valor) {
    let texto = String(valor ?? '');
    if (/^[\s\x00-\x1f]*[=+@-]/.test(texto) && !/^-?\d+(?:[.,]\d+)?$/.test(texto.trim())) texto = "'" + texto;
    return '"' + texto.replace(/"/g, '""') + '"';
  }

  static csv(nombre, columnas, registros) {
    const campos = this.campos(columnas);
    const lineas = [
      campos.map(c => this.escaparCSV(c)).join(';'),
      ...registros.map(fila => campos.map(c => this.escaparCSV(fila[c])).join(';'))
    ];
    this.descargarBlob(nombre, '\uFEFF' + lineas.join('\r\n'), 'text/csv;charset=utf-8', 'csv');
  }

  static html(nombre, columnas, registros) {
    const campos = this.campos(columnas);
    const esc = v => String(v ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    const filas = registros.map(fila =>
      '<tr>' + campos.map(c => '<td>' + esc(fila[c]) + '</td>').join('') + '</tr>'
    ).join('\n');
    const doc = `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><title>${esc(nombre)}</title>
<style>
body{font-family:Ubuntu,Arial,sans-serif;margin:24px;color:#2B241C}
h1{color:#4B2E4F}
table{border-collapse:collapse;width:100%;font-size:14px}
th,td{border:1px solid #D9D0C3;padding:8px 10px;text-align:left}
th{background:#4B2E4F;color:#E6C36A}
tr:nth-child(even){background:#FAF7F2}
</style></head><body>
<h1>${esc(nombre)}</h1>
<p>${registros.length} registros · ssanitax | Xystus</p>
<table><thead><tr>${campos.map(c => '<th>' + esc(c) + '</th>').join('')}</tr></thead>
<tbody>${filas}</tbody></table>
</body></html>`;
    this.descargarBlob(nombre, doc, 'text/html;charset=utf-8', 'html');
  }

  static md(nombre, columnas, registros) {
    const campos = this.campos(columnas);
    const esc = v => String(v ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
    const cabecera = '| ' + campos.map(esc).join(' | ') + ' |';
    const sep = '| ' + campos.map(() => '---').join(' | ') + ' |';
    const filas = registros.map(fila =>
      '| ' + campos.map(c => esc(fila[c])).join(' | ') + ' |'
    ).join('\n');
    const doc = `# ${nombre}\n\n${registros.length} registros · ssanitax | Xystus\n\n${cabecera}\n${sep}\n${filas}\n`;
    this.descargarBlob(nombre, doc, 'text/markdown;charset=utf-8', 'md');
  }

  static descargar(nombre, columnas, registros, formato='csv') {
    if (formato === 'html') return this.html(nombre, columnas, registros);
    if (formato === 'md') return this.md(nombre, columnas, registros);
    return this.csv(nombre, columnas, registros);
  }

  static async exportarTodo(formato='csv') {
    const tablas = await fetch('api/superapi.php?ruta=entidades').then(r => r.json());
    for (const tabla of tablas) {
      const datos = await fetch('api/superapi.php?ruta=tabla&tabla=' + encodeURIComponent(tabla)).then(r => r.json());
      this.descargar(tabla, datos.columnas || [], datos.registros || [], formato);
      await new Promise(r => setTimeout(r, 250));
    }
  }
}

class XystusCSV {
  static descargar(nombre, columnas, registros) {
    XystusExportacion.csv(nombre, columnas, registros);
  }
}
