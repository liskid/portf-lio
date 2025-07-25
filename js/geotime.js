let timezoneUsuario = Intl.DateTimeFormat().resolvedOptions().timeZone;
let horariodosistema = false;
const keyclima = "1e1a61752c638f8b6da1d887c385ae92";

function atualizarRelogio() {
  const horarioAtual = new Date().toLocaleTimeString("pt-BR", {
    timeZone: horariodosistema ? undefined : timezoneUsuario,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  const relogio = document.getElementById('relogio');
  if (relogio) {
    relogio.textContent = horarioAtual;
  }
}

function esconderInfo() {
  const info = document.getElementById('info');
  if (info) {
    info.style.display = 'none';
  }
}

async function obterClima(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${keyclima}&units=metric&lang=pt`;
  try {
    const resposta = await fetch(url);
    const dados = await resposta.json();

    const temperatura = Math.round(dados.main.temp);
    const icone = dados.weather[0].icon;

    return {
      temperatura,
      icone: `https://openweathermap.org/img/wn/${icone}.png`,
      descricao: dados.weather[0].description
    };
  } catch (erro) {
    console.error("Erro ao obter o clima:", erro);
    return null;
  }
}

async function obterLocalizacaoComPermissao() {
  const info = document.getElementById('info');

  if (!info) return;

  if (!navigator.geolocation) {
    horariodosistema = true;
    mostrarHorarioDoSistema();
    return;
  }

  navigator.geolocation.getCurrentPosition(async function (posicao) {
    const lat = posicao.coords.latitude;
    const lon = posicao.coords.longitude;

    try {
      const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=pt`;
      const resposta = await fetch(url);
      const dados = await resposta.json();

      const estado = dados.principalSubdivision || null;
      const pais = dados.countryName || null;

      if (!estado && !pais) {
        esconderInfo();
        return;
      }

      if (dados.timeZone && typeof dados.timeZone === 'string') {
        timezoneUsuario = dados.timeZone;
      }

      const clima = await obterClima(lat, lon);

      let timeWeatherHTML = '<div class="time-weather-container">';
      timeWeatherHTML += '<span id="relogio"></span>';
      
      if (clima) {
        timeWeatherHTML += `
          <div class="weather-container">
            <img class="weather-icon" src="${clima.icone}" alt="${clima.descricao}">
            <span class="temperature">${clima.temperatura}°C</span>
          </div>`;
      }
      
      timeWeatherHTML += '</div>';

      info.innerHTML = `
        <div class="location-info">
          <strong>${pais ?? ''}${estado ? ', ' + estado : ''}</strong>
        </div>
        ${timeWeatherHTML}
      `;

      atualizarRelogio();
      setInterval(atualizarRelogio, 60 * 1000);

    } catch (erro) {
      console.error(erro);
      horariodosistema = true;
      mostrarHorarioDoSistema();
    }
  }, function () {
    horariodosistema = true;
    mostrarHorarioDoSistema();
  });
}

function mostrarHorarioDoSistema() {
  const info = document.getElementById('info');

  if (!info) return;

  info.innerHTML = '<span id="relogio"></span>';
  atualizarRelogio();
  setInterval(atualizarRelogio, 60 * 1000);
}

document.addEventListener("DOMContentLoaded", () => {
  const info = document.getElementById('info');
  if (info) {
    info.style.display = 'block';
  }
  obterLocalizacaoComPermissao();
});