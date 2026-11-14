const koleckaDiv = document.getElementById('kolecka');
const pocetMatch = window.location.hash.match(/^#(\d+)_([0-9a-f-]{36})$/i);
const pocetInp = pocetMatch ? Number.parseInt(pocetMatch[1], 10) : NaN;
const lockId = pocetMatch ? pocetMatch[2] : '';

function generateKolecka() {
    const char = pocetInp;
    if (!Number.isInteger(char) || char < 1 || char > 12) {
        koleckaDiv.textContent = 'Neplatný odkaz: počet koleček musí být mezi 1 a 12.';
        return;
    }

    koleckaDiv.innerHTML = '<img src="closed.jpg" id="img"><div class="inputs-wrapper"></div>';
    const inputsWrapper = koleckaDiv.querySelector('.inputs-wrapper');

    for (let i = 0; i < char; i++) {
        if (i % 6 === 0) {
            const row = document.createElement('div');
            row.classList.add('input-row');
            inputsWrapper.appendChild(row);
        }

        const kolecko = document.createElement('input');
        kolecko.type = 'number';
        kolecko.min = '0';
        kolecko.max = '9';
        kolecko.value = '0';
        kolecko.classList.add('kolecko');
        inputsWrapper.lastElementChild.appendChild(kolecko);
    }
}

document.querySelectorAll('button').forEach(button => {
    button.remove();
});
document.getElementById('char').remove();
document.getElementById('message-setting').remove();
document.getElementById('share-result').remove();
generateKolecka();

const unlockButton = document.createElement('button');
unlockButton.textContent = 'Odemknout';
const unlockResult = document.createElement('p');
unlockResult.setAttribute('aria-live', 'polite');
koleckaDiv.after(unlockButton, unlockResult);

koleckaDiv.addEventListener('wheel', (event) => {
    const input = event.target;

    if (!(input instanceof HTMLInputElement) ||
        !input.classList.contains('kolecko') ||
        event.deltaY === 0) {
        return;
    }

    event.preventDefault();

    const current = Number(input.value || 0);
    const next = (current + (event.deltaY < 0 ? 1 : 9)) % 10;

    input.value = String(next);
    input.dispatchEvent(new Event('input', { bubbles: true }));
}, { passive: false });

unlockButton.addEventListener('click', async () => {
    const code = Array.from(koleckaDiv.querySelectorAll('.kolecko'))
        .map(input => input.value)
        .join('');

    if (!/^\d{1,12}$/.test(code)) {
        unlockResult.textContent = 'Každé kolečko musí obsahovat jednu číslici.';
        return;
    }

    unlockButton.disabled = true;
    unlockResult.textContent = 'Ověřuji kód…';

    try {
        const response = await fetch(`${window.kyzamConfig.supabaseUrl}/functions/v1/unlock-lock`, {
            method: 'POST',
            headers: {
                apikey: window.kyzamConfig.publishableKey,
                Authorization: `Bearer ${window.kyzamConfig.publishableKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: lockId, code })
        });
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || `Server vrátil chybu ${response.status}.`);
        }

        document.getElementById('img').src = 'open.jpg';
        document.getElementById('img').classList.add('open');
        unlockResult.textContent = result.message;
    } catch (error) {
        unlockResult.textContent = error instanceof Error
            ? error.message
            : 'Kód se nepodařilo ověřit.';
    } finally {
        unlockButton.disabled = false;
    }
});