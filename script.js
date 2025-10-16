// *** REEMPLAZA ESTA URL CON LA URL REAL DE TU API DESPLEGADA ***
const API_URL = 'https://verificador-de-correo-electronico-api-one.vercel.app/api/verify'; 

async function verificarEmailAvanzado() {
    const emailInput = document.getElementById('emailInput');
    const verifyButton = document.getElementById('verifyButton');
    const resultadoElement = document.getElementById('resultado');
    const email = emailInput.value.trim();

    // 1. Limpieza y manejo de carga (UX)
    resultadoElement.textContent = '';
    resultadoElement.className = '';
    verifyButton.disabled = true;
    verifyButton.textContent = 'Verificando...'; 

    if (email === "") {
        resultadoElement.textContent = "⚠️ Por favor, ingresa una dirección.";
        resultadoElement.className = 'info visible';
        verifyButton.disabled = false;
        verifyButton.textContent = 'Verificar Dominio';
        return;
    }

    // 2. Llamada a la API Serverless
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email })
        });

        const data = await response.json();
        
        // 3. Mostrar resultado final basado en la respuesta del servidor
        if (data.isValid) {
            resultadoElement.innerHTML = `<i class="fas fa-check-circle"></i> ${data.reason}`;
            resultadoElement.className = 'valido visible';
        } else {
            resultadoElement.innerHTML = `<i class="fas fa-times-circle"></i> ${data.reason}`;
            resultadoElement.className = 'invalido visible';
        }
    } catch (error) {
        // Este catch maneja errores de red o CORS que la API no puede interceptar
        resultadoElement.innerHTML = '⚠️ Error de conexión. El servidor no respondió o hubo un problema de CORS.';
        resultadoElement.className = 'invalido visible';
    } finally {
        // 4. Resetear botón
        verifyButton.disabled = false;
        verifyButton.textContent = 'Verificar Dominio';
    }
}

