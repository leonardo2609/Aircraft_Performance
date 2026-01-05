async function getAirportInformation() {
  const inputIcao = document.getElementById("airport-ICAO");
  const icao = inputIcao.value.trim().toUpperCase();

  if (icao === "" || icao.length !== 4) {
    console.log("Validação: O ICAO deve ter exatamente 4 caracteres.");
    return;
  }

  const webhookUrl = "https://automacao.csvp.g12.br:8443/webhook/metar_airport";

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      icao: icao,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      return data;
    })
    .catch((error) => {
      console.error("Erro:", error);
    });
}
