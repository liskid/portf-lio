let timezoneUsuario = Intl.DateTimeFormat().resolvedOptions().timeZone;
let horariodosistema = false;

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

      info.innerHTML = `
        <strong>${pais ?? ''}${estado ? ', ' + estado : ''}</strong>
        <span id="relogio"></span>
      `;

      atualizarRelogio();
      setInterval(atualizarRelogio, 60 * 1000);

    } catch (erro) {
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

  info.innerHTML = `<span id="relogio"></span>`;
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