INSERT INTO usuarios VALUES
('Laura','Martínez García','laura.martinez@xystus.local','600123456','Pádel','Mensual',NULL),
('Carlos','Sánchez López','carlos.sanchez@xystus.local','611234567','Tenis','Anual',NULL),
('Marta','Gómez Navarro','marta.gomez@xystus.local','622345678','Natación','Trimestral',NULL),
('David','Ruiz Fernández','david.ruiz@xystus.local','633456789','Fútbol sala','Bono 10',NULL),
('Elena','Torres Romero','elena.torres@xystus.local','644567890','Pádel','Mensual',NULL),
('Javier','Moreno Pérez','javier.moreno@xystus.local','655678901','Baloncesto','Anual',NULL),
('Sara','Vidal Ortega','sara.vidal@xystus.local','666789012','Natación','Trimestral',NULL),
('Alejandro','Gil Molina','alejandro.gil@xystus.local','677890123','Tenis','Mensual',NULL),
('Lucía','Navarro Díaz','lucia.navarro@xystus.local','688901234','Pádel','Bono 10',NULL),
('Pablo','Herrera Campos','pablo.herrera@xystus.local','699012345','Fútbol sala','Anual',NULL);

INSERT INTO pistas VALUES
('Pista Pádel 1','Pádel',1,18.00,NULL),
('Pista Pádel 2','Pádel',0,14.00,NULL),
('Pista Tenis A','Tenis',0,16.00,NULL),
('Pista Tenis B','Tenis',1,20.00,NULL),
('Sala Polideportiva','Fútbol sala',1,35.00,NULL),
('Cancha Basket','Baloncesto',1,28.00,NULL),
('Calle Natación 1','Natación',1,8.00,NULL),
('Calle Natación 2','Natación',1,8.00,NULL);

INSERT INTO profesores VALUES
('Ana','Martínez','Pádel','610111222',25.00,NULL),
('Carlos','García','Tenis','610222333',28.00,NULL),
('Laura','Sánchez','Natación','610333444',22.00,NULL),
('Miguel','Torres','Fútbol sala','610444555',24.00,NULL),
('Sofía','Navarro','Baloncesto','610555666',26.00,NULL),
('David','Romero','Pádel','610666777',25.00,NULL);

INSERT INTO stock VALUES
('Pala pádel Pro','Material',20,45.00,'Almacén A',NULL),
('Pala pádel Light','Material',35,28.00,'Almacén A',NULL),
('Raqueta tenis','Material',18,55.00,'Almacén A',NULL),
('Pelotas pádel (bote)','Consumible',80,4.50,'Almacén B',NULL),
('Pelotas tenis (bote)','Consumible',60,5.00,'Almacén B',NULL),
('Balón fútbol sala','Material',15,22.00,'Almacén C',NULL),
('Balón baloncesto','Material',12,28.00,'Almacén C',NULL),
('Gorro natación','Consumible',40,6.00,'Almacén B',NULL),
('Red pádel','Material',6,120.00,'Almacén A',NULL);

INSERT INTO proveedores VALUES
('SportSupply','Material deportivo','pedidos@sportsupply.es','963000111',NULL),
('AquaGear','Natación','ventas@aquagear.es','963000222',NULL),
('PadelWorld','Pádel','info@padelworld.es','963000333',NULL),
('CourtPro','Mantenimiento pistas','soporte@courtpro.es','963000444',NULL);

INSERT INTO reservas VALUES
('2026-10-15','10:00','11:00','Confirmada',1,1,1,43.00,NULL),
('2026-10-15','11:00','12:00','Confirmada',2,3,2,44.00,NULL),
('2026-10-16','09:00','10:00','Pendiente',3,7,3,30.00,NULL),
('2026-10-16','18:00','19:00','Confirmada',4,5,4,59.00,NULL),
('2026-10-17','17:00','18:00','Confirmada',5,2,NULL,14.00,NULL),
('2026-10-17','19:00','20:00','Cancelada',6,6,5,54.00,NULL),
('2026-10-18','10:00','11:30','Confirmada',9,1,6,52.50,NULL),
('2026-10-18','12:00','13:00','Pendiente',8,4,2,48.00,NULL);

INSERT INTO lineasreserva VALUES
(1,1,2,45.00,NULL),
(1,4,1,4.50,NULL),
(2,3,1,55.00,NULL),
(2,5,1,5.00,NULL),
(4,6,1,22.00,NULL),
(6,7,1,28.00,NULL),
(7,2,2,28.00,NULL),
(7,4,1,4.50,NULL);
