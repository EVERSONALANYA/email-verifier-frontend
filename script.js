// JavaScript source code
// *** REEMPLAZA ESTA URL CON LA URL REAL DE TU API DESPLEGADA ***
const API_URL = 'hhttps://email-verifier-d799uy09z-eversonalanyas-projects.vercel.app';

async function verificarEmailAvanzado() {
    const emailInput = document.getElementById('emailInput');
    const verifyButton = document.getElementById('verifyButton');
    const resultadoElement = document.getElementById('resultado');
    const email = emailInput.value.trim();

    // 1. Limpieza y manejo de carga (UX)
    resultadoElement.textContent = '';
    resultadoElement.className = '';
    verifyButton.disabled = true;
    verifyButton.textContent = 'Verificando...'; // Muestra estado de carga

    if (email === "") {
        resultadoElement.textContent = "Por favor, ingresa una dirección.";
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

        // 3. Mostrar resultado final
        if (data.isValid) {
            resultadoElement.textContent = `✅ Éxito: ${data.reason}`;
            resultadoElement.className = 'valido visible';
        } else {
            resultadoElement.textContent = `❌ Fallo: ${data.reason}`;
            resultadoElement.className = 'invalido visible';
        }
    } catch (error) {
        resultadoElement.textContent = '⚠️ Error de conexión. Vuelve a intentarlo.';
        resultadoElement.className = 'invalido visible';
    } finally {
        // 4. Resetear botón y estado
        verifyButton.disabled = false;
        verifyButton.textContent = 'Verificar Dominio';
    }
}