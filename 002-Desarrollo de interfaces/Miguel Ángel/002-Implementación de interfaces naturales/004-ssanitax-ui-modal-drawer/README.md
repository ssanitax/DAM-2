# jocarsa · subunidad 007 integrada v3

Proyecto integrado de componentes, plantillas, orígenes de datos y eventos.

## Demostraciones

- `index.html`: aplicación integrada con menús, fichas, tabla, formulario dinámico, drag & drop, columnas minimizables y separadores redimensionables.
- `login.html`: pantalla de login jocarsa-iu. Busca `jocarsa.png` en la raíz del proyecto y la usa como fondo a pantalla completa.
- `formularios.html`: catálogo demostrativo de formularios y controles.
- `toasts.html`: demostración independiente de mensajes toast success/info/warning/danger.

## Fondo del login

Coloca la imagen con este nombre exacto:

`jocarsa.png`

en la raíz del proyecto, junto a `index.html` y `login.html`.

## Ejecución

El asistente local habla con Ollama a través de `ollama.php`, así que hay que servir la carpeta con PHP (un servidor estático no ejecuta ese archivo):

```bash
cd "004-ssanitax-ui-modal-drawer"
php -S localhost:8000
```

Abrir `http://localhost:8000/` en Chrome o Edge. El reconocimiento de voz no está en Firefox.

El modelo usado es **phi4-mini** con **Ollama** en local (`ollama serve`).

## Interfaces naturales (UD2)

El asistente es un **chat** fijo en la esquina inferior derecha:

- Escribes en la caja o pulsas el micrófono y hablas. Tu frase sale a la derecha y la respuesta, a la izquierda.
- El altavoz de la cabecera lee la respuesta en voz alta. La × cierra el chat y lo deja como botón redondo en la misma esquina.
- Si dices un comando («abrir gráficos», «nuevo cliente», «buscar Laura», «modo noche», «ayuda»), el chat lo ejecuta en el panel y lo confirma.
- Si un campo del formulario tiene el foco, el micrófono dicta en ese campo.

Los gestos, el detector facial y la realidad aumentada quedan fuera de esta entrega.


## Refactorización de código

Esta versión mantiene la estructura visual y funcional de la versión 5, pero presenta HTML, templates, CSS, JSON y JavaScript en formato legible y no minificado.

El JavaScript de control se ha reorganizado con programación orientada a objetos. El namespace conceptual solicitado es `jocarsa | iu`; como el carácter `|` es un operador de JavaScript y no puede formar parte de un identificador, el namespace técnico utilizado es:

