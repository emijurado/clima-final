/*capturar los elementos de DOM pra modificarlos despues */
//definimos variables
let container = document.getElementById("container");
let searchForm = document.getElementById("search__submit");
let searchInput = document.getElementById("search__input")
let gradosTemperatura = document.getElementById("degreenumber")
let velocidadViento = document.getElementById("speedViento")
let icono = document.getElementById("sun")
let timezone = document.getElementById("description")
let hora = document.getElementById("hora")
let fechaDia = document.getElementById("fechaDia")
let min = document.getElementById("min")
let max = document.getElementById("max")

const climaPorHora = document.getElementById('weather-forecast')
const dias = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];
const ciudadLabel = document.getElementById('ciudad');

//capturamos el elemento selecionado del "selector de ciudades"
const select = document.getElementById("select");
//const searchCity = document.getElementById("search").addEventListener("click", getClima);
const miLocalizacion = document.getElementById("myLocation");


//despues que se carga la pagina se ejecuta esta funcion
window.onload = function () {
  console.log("cargamos por defecto el clima de Buenos Aires");
  //pasamos lat y lon de bs as
  getData(-34.61315, -58.37723);
}

//pregunta que numero del indice desplegable elegimos para planchar el nombre de la ciudad
const opcionCambiada = () => {
  console.log("Cambio");
  var value = select.value;
  var ciudadSelect = select.options[select.selectedIndex].text;
  var option = select.options[select.selectedIndex];
  var attrs = option.attributes;
  var datalat = option.getAttribute("data-latitude");
  var datalon = option.getAttribute("data-longitude");

  console.log(datalat);
  console.log(datalon);
  console.log(value, ciudadSelect);

  getData(datalat, datalon);

};

select.addEventListener("change", opcionCambiada);


function getData(latitude, longitude) {
  climaPorHora.innerHTML = ''

  fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relativehumidity_2m,cloudcover_mid,windspeed_120m&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum,rain_sum,windgusts_10m_max,weathercode&timezone=auto&current_weather=true`)
    .then(res => res.json()).then(data => {
      console.log(data)
      mostrarDataCard(data);
      mostrarDiarioByFor(data);
    })

}


//consigo el clima de mi ubicacion actual
//localizacion que viene geolocalizador del navegador- 
miLocalizacion.addEventListener('click', () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(onSuccess, onError);
  }
  else {
    alert("Your browser does not support geolocation api")
  }

})

//si permitimos la geolocalizacion
function onSuccess(position) {
  climaPorHora.innerHTML = ''
  let { latitude, longitude } = position.coords
  getData(latitude, longitude);
}
//sino no lo permitimos
function onError(error) {
  console.log(error)
}

////////card gris del dia actual///////////////
function mostrarDataCard(data) {
  //console.log(data.current_weather)


  var d = new Date(data.current_weather.time);
  var dayName = dias[d.getDay()];

  //REVISAR porque mantiene el formate css de CIUDAD
  ciudadLabel.innerText = select.options[select.selectedIndex].text;
  gradosTemperatura.innerText = data.current_weather.temperature + '°C';
  velocidadViento.innerText = data.current_weather.windspeed + ' km/h';
  fechaDia.innerText = data.current_weather.time.substring(0, 10) + '--' + dayName;

  //REVISAR porque no sobreescribe el texto del elemento, sino que lo concatena
  //ejemplo min y max
  min.innerText = data.daily.temperature_2m_min[0] + '°C';
  max.innerText = data.daily.temperature_2m_max[0] + '°C';

}

////////// card verdes de los dias de la semana ////////////////
function mostrarDiarioByFor(data) {
  console.log(data.daily)
  console.log(data.daily.sunrise[0])

  //funcion para que haga el bucle diario-for
  //obtenemos el nombre del dia
  //let otherHoursForecast = '';
  for (let x = 0; x <= 6; x++) {

    let time_data = data.daily.time[x]
    //obtenemos el nombre del dia
    var d = new Date(time_data);
    var dayName = dias[d.getDay()];

    let temp_min = data.daily.temperature_2m_min[x]
    let temp_max = data.daily.temperature_2m_max[x]
    let amanecer = data.daily.sunrise[x].substring(11, 16)
    let atardecer = data.daily.sunset[x].substring(11, 16)

    //actualizamos imagen grande general
    const imagen = actualizarImagen(data.daily.weathercode[x]);
  
    //actualizamos imagen de cada dia
    const imagenDiario = obtenerImagenSegunClima(data.daily.weathercode[x]);
    console.log("x:" + x + " valor: "+ data.daily.weathercode[x]);
    console.log(imagenDiario);

//con el html en JS no declaramos las  variables 42 veces-
    climaPorHora.innerHTML += ` <div class="weather-forecast-item">
          <div class="hour"> ${(time_data + " " + dayName)}  <span id='am-pm'></span></div>
          <div class="each-weather-item">
          <i class="fa fa-thermometer-half" aria-hidden="true"></i>
          <div class="temp">${temp_min}   &#176;C MIN</div>
          </div>
          <div class="each-weather-item wind-speed">
          <i class="fas fa-wind"></i>
          <div class="">${temp_max} &#176;C MAX</div>
          </div>
          <div class="each-weather-item">
          <img src="${imagenDiario}.png" class="card-img-top3">
          <div class="humidity">Amanece: ${amanecer}</div>
          </div>
          <div class="each-weather-item">
          <i class="fa-solid fa-cloud"></i>
          <div class="cloud-cover">Atarcede: ${atardecer}</div>
          </div>
      </div>`

      
  }
}


function obtenerImagenSegunClima(weathercode) {
  //seguimos esta web en donde estan los codigos del clima
  // https://www.nodc.noaa.gov/archive/arc0021/0002199/1.1/data/0-data/HTML/WMO-CODE/WMO4677.HTM


  //si es codigo es mayor a 99 que ponga por defecto el "sun"
  switch (weathercode) {
    default:
      return "sun";
//climas genericos
    case 0:
    case 1:
    case 2:
    case 3:
      return "nublado";

    case 40:
    case 41:
    case 42:
    case 43:
    case 44:
    case 45:
    case 46:
    case 47:
    case 48:
    case 49:
      return "niebla";

    case 50:
    case 51:
    case 52:
    case 53:
    case 54:
    case 55:
    case 56:
    case 57:
    case 58:
    case 59:
      return "llovizna";

    case 60:
    case 61:
    case 62:
    case 63:
    case 64:
    case 65:
    case 66:
    case 67:
    case 68:
    case 69:
      return "lluvia";

    case 70:
    case 71:
    case 72:
    case 73:
    case 74:
    case 75:
    case 76:
    case 77:
    case 78:
    case 79:
      return "nieve";

    case 80:
    case 81:
    case 82:
    case 83:
    case 84:
    case 85:
    case 86:
    case 87:
    case 88:
    case 89:
      return "aguacero";

    case 95:
    case 96:
    case 97:
    case 98:
    case 99:
      return "tormenta";
  }
}

//actualiza las imagenes de card diarias
function actualizarImagen(weathercode) {
  const imgClima = document.getElementById('imagenClima');
  const imagen = obtenerImagenSegunClima(weathercode);
  imgClima.src = imagen + '.png';
}