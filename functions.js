const { shell } = require('electron');
const { remote } = require('electron');

const fs = require('fs');
const path = require('path');

const raiz = path.join(__dirname);

const { title } = require('process');

const { dialog } = require('@electron/remote')
// DEFINICIONES

let pos = 0;

let titulo = document.getElementById('titulo');
let alias = document.getElementById('alias');
let nombre = document.getElementById('nombre');
let apellidos = document.getElementById('apellidos');
let nacimiento = document.getElementById('nacimiento')
let email = document.getElementById('email');
let telf = document.getElementById('telf');
let rrss = document.getElementById('rrss');
let dni = document.getElementById('dni');
let direccion = document.getElementById('direccion');
let notas = document.getElementById('notas');
let impresiones = document.getElementById('impresiones');
let experiencia = document.getElementById('experiencia');
let intereses = document.getElementById('intereses');
let rutaGaleria = document.getElementById('rutaGaleria');
let ruta = "";


const botonNuevo = document.getElementById('botonNuevo');
const botonGuardar = document.getElementById('botonGuardar');
const botonIzquierda = document.getElementById('botonIzquierda');
const botonDerecha = document.getElementById('botonDerecha');
const botonAbrirCarpeta = document.getElementById('botonAbrirCarpeta');
const botonBorrar = document.getElementById('botonBorrar');
const galeriaDiv = document.getElementById('galeria');
const archivosPorPagina = 9; // Número de archivos por página

let miArray = new Array();
let archivos = [];
let paginaActual = 1;

// MAIN

// Carga personas en el array
let fichero = fs.readFileSync('./data/catalogo.json');
miArray = JSON.parse(fichero);
fichero.close;

actualiza();

colorBtnDesplazamiento();


// FUNCIONES

function actualiza() {
  alias.value = miArray[pos].alias;
  titulo.innerHTML = alias.value;
  nombre.value = miArray[pos].nombre;
  apellidos.value = miArray[pos].apellidos;
  nacimiento.value = miArray[pos].nacimiento;
  email.value = miArray[pos].email;
  telf.value = miArray[pos].telf;
  rrss.value = miArray[pos].rrss;
  dni.value = miArray[pos].dni;
  direccion.value = miArray[pos].direccion;
  notas.value = miArray[pos].notas;
  impresiones.value = miArray[pos].impresiones;
  experiencia.value = miArray[pos].experiencia;
  intereses.value = miArray[pos].intereses;
  ruta = miArray[pos].ruta;
  rutaGaleria.innerHTML = ruta;

  // Crea la carpeta multimedia de la persona si no existe
  if (!fs.existsSync(ruta)) {
    fs.mkdirSync(ruta);
  }

  actualizaGaleria();
}


function actualizarPagina() {
  // Actualiza la galería y la página actual
  cargarGaleria(paginaActual);
}


// Prepara el visor multimedia
function actualizaGaleria() {
  fs.promises.readdir(ruta)
    .then(todosLosArchivos => {
      // Filtrar solo los archivos permitidos
      archivos = todosLosArchivos.filter(archivo => {
        const extension = path.extname(archivo).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.gif', '.mp4'].includes(extension);
      });

      // Mostrar la primera página
      cargarGaleria(paginaActual);

      // Buscar el elemento footer existente
      const footer = document.querySelector('.toolbar-footer');

      if (footer) {
        // Crear un contenedor para los botones en el lateral derecho
        const contenedorBotones = document.createElement('div');
        contenedorBotones.style.float = 'right'; // Alinea al lado derecho

        // Agregar botones de desplazamiento al contenedor
        const btnAnterior = document.createElement('button');
        btnAnterior.innerText = '<';
        btnAnterior.onclick = () => irAPagina(paginaActual - 1);

        const btnSiguiente = document.createElement('button');
        btnSiguiente.innerText = '>';
        btnSiguiente.onclick = () => irAPagina(paginaActual + 1);

        if (!btnAnterior) {
          contenedorBotones.appendChild(btnAnterior);
        }
        if (!btnSiguiente) {
          contenedorBotones.appendChild(btnSiguiente);
        }

        // Agregar el contenedor al footer
        footer.appendChild(contenedorBotones);
      } else {
        console.error('Elemento footer no encontrado. Asegúrate de tener un elemento footer con la clase correcta en tu HTML.');
      }
    })
    .catch(error => console.error(error));
}


function borrarCarpetaRecursivamente(ruta) {
  if (fs.existsSync(ruta)) {
    fs.readdirSync(ruta).forEach((archivo, index) => {
      const rutaArchivo = path.join(ruta, archivo);

      if (fs.lstatSync(rutaArchivo).isDirectory()) {
        // Si es una carpeta, llamar recursivamente para borrarla
        borrarCarpetaRecursivamente(rutaArchivo);
      } else {
        // Si es un archivo, borrarlo
        fs.unlinkSync(rutaArchivo);
      }
    });

    // Después de borrar todos los archivos de la carpeta, borrar la carpeta misma
    fs.rmdirSync(ruta);
    console.log(`Carpeta borrada: ${ruta}`);
  } else {
    console.log(`La carpeta no existe: ${ruta}`);
  }
}


function cargarGaleria(pagina) {
  galeriaDiv.innerHTML = ''; // Limpiar el contenido actual

  const archivosPagina = archivos.slice((pagina - 1) * archivosPorPagina, pagina * archivosPorPagina);

  archivosPagina.forEach(archivo => {
    const extension = path.extname(archivo).toLowerCase();
    const filePath = path.join(ruta, archivo);

    const elemento = extension === '.mp4'
      ? `<video width="150" height="150" controls><source src="${filePath}" type="video/mp4"></video>`
      : `<img src="${filePath}" alt="${archivo}" style="width: 150px; height: 150px; margin: 5px; cursor: pointer;" onclick="mostrarEnGrande('${filePath}', '${extension}');">`;

    galeriaDiv.innerHTML += elemento;
  });
}


function colorBtnDesplazamiento() {
  if (pos == 0) {
    botonIzquierda.disabled = true;
    botonIzquierda.classList.value = "btn btn-negative";
  } else {
    botonIzquierda.disabled = false;
    botonIzquierda.classList.value = "btn btn-positive";
  }
  if (pos == miArray.length - 1) {
    botonDerecha.disabled = true;
    botonDerecha.classList.value = "btn btn-negative";
  } else {
    botonDerecha.disabled = false;
    botonDerecha.classList.value = "btn btn-positive";
  }
}

function guarda() {
  // Guarda el array
  fs.writeFileSync('./data/catalogo.json', JSON.stringify(miArray));
  fs.close;
}

function irAPagina(pagina) {
  // Valida que la página solicitada sea válida
  if (pagina >= 1 && pagina <= Math.ceil(archivos.length / archivosPorPagina)) {
    paginaActual = pagina;
    actualizarPagina();
  }
}

function mostrarEnGrande(filePath, extension) {
  const modal = document.createElement('div');
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100%';
  modal.style.height = '100%';
  modal.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  modal.style.display = 'flex';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';
  modal.style.zIndex = '999';

  if (extension === '.mp4') {
    modal.innerHTML = `<video controls style="max-width: 90%; max-height: 90%;">
                        <source src="${filePath}" type="video/mp4">
                      </video>`;
  } else {
    modal.innerHTML = `<img src="${filePath}" alt="Imagen en grande" style="max-width: 90%; max-height: 90%;">`;
  }

  modal.onclick = () => {
    modal.remove();
  };

  document.body.appendChild(modal);
}


function validaFecha() {
  const inputFecha = document.getElementById('nacimiento');
  const formatoFecha = /^\d{2}\/\d{2}\/\d{4}$/;

  if (!formatoFecha.test(inputFecha.value)) {
    // El formato no es correcto, mostrar mensaje de error
    nacimiento.style.backgroundColor = 'red';
    alert("Formato de fecha incorrecto. Debe ser dd/mm/yyyy.");
    return false;
  } else {
    nacimiento.style.backgroundColor = 'white';
    return false;
  }
}




//LISTENERS
botonAbrirCarpeta.addEventListener('click', () => {
  if (!fs.existsSync(ruta)) {
    alert("Guarda el nuevo registro antes de acceder a la carpeta");
  } else {
    // Abre la carpeta con el explorador de archivos del sistema operativo
    console.log("Se intenta abrir " + raiz + ruta.slice(1));
    //shell.openPath(ruta)
    shell.openPath(raiz + ruta.slice(1))
      .then(() => console.log('Carpeta abierta correctamente'))
      .catch(error => console.error('Error al abrir la carpeta:', error));
  }

});


botonNuevo.addEventListener('click', () => {
  // Obtiene componentes individuales de la fecha y hora
  const fechaHoraActual = new Date();
  const año = fechaHoraActual.getFullYear();
  const mes = (fechaHoraActual.getMonth() + 1).toString().padStart(2, '0'); // Los meses comienzan desde 0
  const dia = fechaHoraActual.getDate().toString().padStart(2, '0');
  const horas = fechaHoraActual.getHours().toString().padStart(2, '0');
  const minutos = fechaHoraActual.getMinutes().toString().padStart(2, '0');
  const segundos = fechaHoraActual.getSeconds().toString().padStart(2, '0');

  // Construye la cadena en el formato deseado
  ruta = `${año}${mes}${dia}${horas}${minutos}${segundos}`;
  ruta = "./data/" + ruta + "/";

  const persona = {
    "alias": alias.value,
    "nombre": nombre.value,
    "apellidos": apellidos.value,
    "nacimiento": nacimiento.value,
    "email": email.value,
    "telf": telf.value,
    "rrss": rrss.value,
    "dni": dni.value,
    "direccion": direccion.value,
    "notas": notas.value,
    "impresiones": impresiones.value,
    "experiencia": experiencia.value,
    "intereses": intereses.value,
    "ruta": ruta
  };

  //en pos no elimino nada y agrego persona
  miArray.splice(pos, 0, persona)
  // Crea la carpeta multimedia de la persona
  if (!fs.existsSync(ruta)) {
    fs.mkdirSync(ruta);
  }

  guarda();
  actualiza();
  colorBtnDesplazamiento()
})


botonGuardar.addEventListener('click', () => {
  // Agrega al array el elemento actual
  const persona = {
    "alias": alias.value,
    "nombre": nombre.value,
    "apellidos": apellidos.value,
    "nacimiento": nacimiento.value,
    "email": email.value,
    "telf": telf.value,
    "rrss": rrss.value,
    "dni": dni.value,
    "direccion": direccion.value,
    "notas": notas.value,
    "impresiones": impresiones.value,
    "experiencia": experiencia.value,
    "intereses": intereses.value,
    "ruta": ruta
  };
  //en pos elimino uno y agrego persona
  miArray.splice(pos, 1, persona)
  // Crea la carpeta multimedia de la persona
  if (!fs.existsSync(ruta)) {
    fs.mkdirSync(ruta);
  }

  guarda();

  // habilita boton borrar (se deshabilita en botonNuevo)
  botonBorrar.classList.value = "btn btn-warning";
  botonBorrar.disabled = false;
})


botonDerecha.addEventListener('click', () => {
  if (pos < miArray.length - 1) {
    pos++;
    actualiza();
  }
  colorBtnDesplazamiento();

  // habilita boton borrar (se deshabilita en botonNuevo)
  botonBorrar.classList.value = "btn btn-warning";
  botonBorrar.disabled = false;
})


botonIzquierda.addEventListener('click', () => {
  if (pos > 0) {
    pos--;
    actualiza();
  }
  colorBtnDesplazamiento();

  // habilita boton borrar (se deshabilita en botonNuevo)
  botonBorrar.classList.value = "btn btn-warning";
  botonBorrar.disabled = false;
})


botonBorrar.addEventListener('click', () => {
  const options = {
    type: 'question',
    title: 'Pregunta',
    message: '¿Quieres borrar este registro?',
    buttons: ['Sí', 'Cancelar'],
    defaultId: 1, //btn por defecto (0/1)
  };
  let respuestaUsuario = dialog.showMessageBoxSync(options);

  if (respuestaUsuario == 0) {
    borrarCarpetaRecursivamente(miArray[pos].ruta);
    miArray.splice(pos, 1)
    pos = 0;
    actualiza();
    guarda();
  }
  colorBtnDesplazamiento();
})

nacimiento.addEventListener('change', () => {
  validaFecha();
})