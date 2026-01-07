async function getAirportMetarInformation() {
  const inputIcao = document.getElementById("airport-ICAO").value.trim().toUpperCase();

  if (inputIcao === "" || inputIcao.length !== 4) {
    console.log("Validação: O ICAO deve ter exatamente 4 caracteres.");
    return;
  }

  const btn = document.querySelector('.btn-api');
  const originalText = btn.innerText;
  btn.innerText = "LOADING...";
  btn.disabled = true;

  const webhookUrl = "https://automacao.csvp.g12.br/webhook/metar_airport";

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        icao: inputIcao,
      }),
    });

    if (!response.ok) throw new Error("Erro na requisição");
    
    const data = await response.json();
    
    console.log(data);

    if (data.wdir !== null) document.querySelector('input[placeholder="Dir"]').value = data.wdir;
    if (data.wspd !== null) document.querySelector('input[placeholder="Spd"]').value = data.wspd;
    if (data.temp !== null) document.querySelector('input[placeholder="15"]').value = data.temp;
    if (data.altim !== null) document.querySelector('input[placeholder="1013"]').value = data.altim;

  } catch (error) {
    console.error('Erro:', error);
    alert('Não foi possível obter os dados do METAR.')
  } finally {
    btn.innerText = originalText;
    btn.disabled = false;
  };
}

function getAirportInformation() {
  
}