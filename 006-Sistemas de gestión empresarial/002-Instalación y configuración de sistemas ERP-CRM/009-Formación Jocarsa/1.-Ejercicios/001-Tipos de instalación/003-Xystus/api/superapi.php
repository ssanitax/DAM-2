<?php
 switch($_GET['ruta']){
 		case "entidades":
    	echo '
      	["actividad","socios","personal","almacen"]
      ';
      break;
    case "tabla":
    	echo '
      	{
          "usuarios": [
            {
              "id": 1,
              "nombre": "Laura",
              "apellidos": "Martínez García",
              "email": "laura.martinez@xystus.local",
              "telefono": "600123456",
              "deporte": "Pádel",
              "abono": "Mensual"
            },
            {
              "id": 2,
              "nombre": "Carlos",
              "apellidos": "Sánchez López",
              "email": "carlos.sanchez@xystus.local",
              "telefono": "611234567",
              "deporte": "Tenis",
              "abono": "Anual"
            },
            {
              "id": 3,
              "nombre": "Marta",
              "apellidos": "Gómez Navarro",
              "email": "marta.gomez@xystus.local",
              "telefono": "622345678",
              "deporte": "Natación",
              "abono": "Trimestral"
            },
            {
              "id": 4,
              "nombre": "David",
              "apellidos": "Ruiz Fernández",
              "email": "david.ruiz@xystus.local",
              "telefono": "633456789",
              "deporte": "Fútbol sala",
              "abono": "Bono 10"
            },
            {
              "id": 5,
              "nombre": "Elena",
              "apellidos": "Torres Romero",
              "email": "elena.torres@xystus.local",
              "telefono": "644567890",
              "deporte": "Pádel",
              "abono": "Mensual"
            },
            {
              "id": 6,
              "nombre": "Javier",
              "apellidos": "Moreno Pérez",
              "email": "javier.moreno@xystus.local",
              "telefono": "655678901",
              "deporte": "Baloncesto",
              "abono": "Anual"
            },
            {
              "id": 7,
              "nombre": "Sara",
              "apellidos": "Vidal Ortega",
              "email": "sara.vidal@xystus.local",
              "telefono": "666789012",
              "deporte": "Natación",
              "abono": "Trimestral"
            },
            {
              "id": 8,
              "nombre": "Alejandro",
              "apellidos": "Gil Molina",
              "email": "alejandro.gil@xystus.local",
              "telefono": "677890123",
              "deporte": "Tenis",
              "abono": "Mensual"
            },
            {
              "id": 9,
              "nombre": "Lucía",
              "apellidos": "Navarro Díaz",
              "email": "lucia.navarro@xystus.local",
              "telefono": "688901234",
              "deporte": "Pádel",
              "abono": "Bono 10"
            },
            {
              "id": 10,
              "nombre": "Pablo",
              "apellidos": "Herrera Campos",
              "email": "pablo.herrera@xystus.local",
              "telefono": "699012345",
              "deporte": "Fútbol sala",
              "abono": "Anual"
            }
          ]
        }
      ';
      break;
 }
?>
