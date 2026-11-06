import json

agenda = [
        {
            "nombre":"Jose Vicente",
            "telefono":["543534","543534","543534"],
            "email":"info@jocarsa.com",
            },
        {
            "nombre":"Juan",
            "telefono":["543534","543534","543534"],
            "email":"info@jocarsa.com",
            },
    ]

archivo = open("agenda.json",'w')
json.dump(agenda,archivo,indent=4)
archivo.close()
