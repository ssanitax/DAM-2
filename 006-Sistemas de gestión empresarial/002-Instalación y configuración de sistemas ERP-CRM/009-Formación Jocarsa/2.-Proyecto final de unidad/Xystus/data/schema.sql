PRAGMA foreign_keys = ON;

CREATE TABLE usuarios(
    nombre TEXT,
    apellidos TEXT,
    email TEXT,
    telefono TEXT,
    deporte TEXT,
    abono TEXT,
    identificador INTEGER PRIMARY KEY AUTOINCREMENT
);

CREATE TABLE pistas(
    nombre TEXT,
    deporte TEXT,
    cubierta INTEGER,
    precio_hora REAL,
    identificador INTEGER PRIMARY KEY AUTOINCREMENT
);

CREATE TABLE profesores(
    nombre TEXT,
    apellidos TEXT,
    especialidad TEXT,
    telefono TEXT,
    tarifa_hora REAL,
    identificador INTEGER PRIMARY KEY AUTOINCREMENT
);

CREATE TABLE stock(
    nombre TEXT,
    tipo TEXT,
    cantidad INTEGER,
    precio_unidad REAL,
    ubicacion TEXT,
    identificador INTEGER PRIMARY KEY AUTOINCREMENT
);

CREATE TABLE reservas(
    fecha TEXT,
    hora_inicio TEXT,
    hora_fin TEXT,
    estado TEXT,
    usuario_id INTEGER,
    pista_id INTEGER,
    profesor_id INTEGER,
    total REAL,
    identificador INTEGER PRIMARY KEY AUTOINCREMENT,
    FOREIGN KEY(usuario_id) REFERENCES usuarios(identificador),
    FOREIGN KEY(pista_id) REFERENCES pistas(identificador),
    FOREIGN KEY(profesor_id) REFERENCES profesores(identificador)
);

CREATE TABLE lineasreserva(
    reserva_id INTEGER,
    stock_id INTEGER,
    cantidad INTEGER,
    precio_unitario REAL,
    identificador INTEGER PRIMARY KEY AUTOINCREMENT,
    FOREIGN KEY(reserva_id) REFERENCES reservas(identificador),
    FOREIGN KEY(stock_id) REFERENCES stock(identificador)
);

CREATE TABLE proveedores(
    nombre TEXT,
    especialidad TEXT,
    email TEXT,
    telefono TEXT,
    identificador INTEGER PRIMARY KEY AUTOINCREMENT
);
