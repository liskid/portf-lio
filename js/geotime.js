let timezoneUsuario = Intl.DateTimeFormat().resolvedOptions().timeZone; //pega o fuso do navegador
let horariodosistema = false; //flag controlar se usara horario local 
const keyclima = "1e1a61752c638f8b6da1d887c385ae92"

function atualizarRelogio() { // formatação da hora config
  const horarioAtual = new Date().toLocaleTimeString("pt-BR", {
    timeZone: horariodosistema ? undefined : timezoneUsuario,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  const relogio = document.getElementById('relogio');
  if (relogio) {
    relogio.textContent = horarioAtual; // atualiza a hora
  }
}

function esconderInfo() {
  const info = document.getElementById('info');
  if (info) {
    info.style.display = 'none'; // oculta o bloco (fallback)
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

  if (!navigator.geolocation) { // checa suporte à geolocalização
    horariodosistema = true;
    mostrarHorarioDoSistema();
    return;
  }

  navigator.geolocation.getCurrentPosition(async function (posicao) { // solicita a localização do usuário
    const lat = posicao.coords.latitude;
    const lon = posicao.coords.longitude;

    try { // chama a API BigData (get)
      const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=pt`;
      const resposta = await fetch(url); // get
      const dados = await resposta.json();

      const estado = dados.principalSubdivision || null; // puxa o estado
      const pais = dados.countryName || null; // puxa o país

      if (!estado && !pais) {
        esconderInfo();
        return;
      }

      if (dados.timeZone && typeof dados.timeZone === 'string') {
        timezoneUsuario = dados.timeZone;
      }

      const clima = await obterClima(lat, lon);

      // Container para relógio e clima lado a lado
      let timeWeatherHTML = '<div class="time-weather-container">';
      timeWeatherHTML += '<span id="relogio"></span>';
      
      if (clima) {
        timeWeatherHTML += `
          <div class="weather-info">
            <img src="${clima.icone}" alt="${clima.descricao}">
            <span>${clima.temperatura}°C</span>
          </div>`;
      }
      // Se não houver clima, não adiciona nada
      
      timeWeatherHTML += '</div>';

      info.innerHTML = `
        <div class="location-info">
          <strong>${pais ?? ''}${estado ? ', ' + estado : ''}</strong>
        </div>
        ${timeWeatherHTML}
      `;

      atualizarRelogio();
      setInterval(atualizarRelogio, 60 * 1000); // atualiza a cada 1 min

    } catch (erro) {
      console.error(erro);
      horariodosistema = true;
      mostrarHorarioDoSistema(); // fallback para horário do sistema
    }
  }, function () {
    horariodosistema = true;
    mostrarHorarioDoSistema();
  });
}

function mostrarHorarioDoSistema() {
  const info = document.getElementById('info');

  if (!info) return;

  // Mostra apenas o relógio, sem clima, quando em fallback
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