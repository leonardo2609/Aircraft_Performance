const FT_TO_M = 0.3048;

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
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ icao: inputIcao }),
        });

        if (!response.ok) throw new Error("Erro na requisição");
        
        const rawData = await response.json();
        const data = rawData;

        // --- LÓGICA DE VENTO VARIÁVEL (VRB) ---
        const vDir = data.metar.vento_direcao;
        const inputDir = document.querySelector('input[placeholder="Dir"]');

        if (vDir === "VRB" || vDir === "vrb" || vDir === 0 || vDir === "0") {
            inputDir.value = "VRB";
            // Pop-up de atenção em inglês conforme solicitado
            alert("ATTENTION: Variable winds detected (VRB). Please select the preferred runway for the aerodrome.");
        } else {
            inputDir.value = vDir ?? "";
        }
        // ---------------------------------------

        // Restante do preenchimento do METAR
        if (data.metar.vento_velocidade !== null) document.querySelector('input[placeholder="Spd"]').value = data.metar.vento_velocidade;
        if (data.metar.temperatura !== null) document.querySelector('input[placeholder="15"]').value = data.metar.temperatura;
        if (data.metar.altimetro !== null) document.querySelector('input[placeholder="1013"]').value = data.metar.altimetro;

        getAirportInformation(data);

    } catch (error) {
        console.error('Erro:', error);
        alert('Não foi possível obter os dados do METAR.');
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
}

function getAirportInformation(data) {
    const runwaySelect = document.getElementById("runway-select");
    const elevationInput = document.getElementById("airport-elevation");

    if (!runwaySelect) return;

    runwaySelect.innerHTML = '<option value="" disabled selected>Select a runway...</option>';

    if (data.aeroporto && data.aeroporto.pistas && data.aeroporto.pistas.length > 0) {
        data.aeroporto.pistas.forEach(pistaObj => {
            pistaObj.designadores.forEach((designador, index) => {
                const option = document.createElement("option");
                option.value = designador;
                option.textContent = `RWY ${designador}`;
                
                // Cálculo de Heading Oposto
                let headingFinal = pistaObj.alinhamento;
                if (index === 1) {
                    headingFinal = (pistaObj.alinhamento + 180) % 360;
                    if (headingFinal === 0) headingFinal = 360;
                }

                // Armazena valor original em PÉS para conversão dinâmica
                option.dataset.length = pistaObj.comprimento_m;
                option.dataset.heading = headingFinal;
                runwaySelect.appendChild(option);
            });
        });
        console.log("Pistas e headings calculados com sucesso.");
    } else {
        runwaySelect.innerHTML = '<option value="" disabled>No runways found</option>';
    }

    if (elevationInput && data.metar.elevacao_ft !== null) {
        elevationInput.value = data.metar.elevacao_ft;
    }
}

// Função para atualizar os campos de texto baseado na seleção e unidade
function updateRunwayDisplay() {
    const runwaySelect = document.getElementById("runway-select");
    const unitSelect = document.getElementById("runway-unit"); // Certifique-se de ter este ID no HTML
    const lengthInput = document.getElementById("runway-length");
    const headingInput = document.getElementById("runway-heading");

    const selectedOption = runwaySelect.options[runwaySelect.selectedIndex];
    
    if (selectedOption && selectedOption.dataset.length) {
        const lengthInFeet = parseFloat(selectedOption.dataset.length);
        const isMetric = unitSelect.value === "m";

        // Aplica conversão se necessário
        lengthInput.value = isMetric ? Math.round(lengthInFeet * FT_TO_M) : Math.round(lengthInFeet);
        headingInput.value = selectedOption.dataset.heading;
    }
}

// Listeners configurados uma única vez fora das funções
document.getElementById("runway-select")?.addEventListener("change", updateRunwayDisplay);
document.getElementById("runway-unit")?.addEventListener("change", updateRunwayDisplay);