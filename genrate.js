const charInput = document.getElementById('char');
const koleckaDiv = document.getElementById('kolecka');
const randomButton = document.querySelector('button.random');
const generateButton = document.querySelector('button.generate');
const messageInput = document.getElementById('message');
const shareResult = document.getElementById('share-result');
const qrCodeDiv = document.getElementById('qr-code');

function generateKolecka() {
    const char = Number(charInput.value);
    koleckaDiv.innerHTML = '<img class="open" src="open.jpg" id="img"><div class="inputs-wrapper"></div>';
    const inputsWrapper = koleckaDiv.querySelector('.inputs-wrapper');

    for (let i = 0; i < char; i++) {
        if (i % 6 === 0) {
            const row = document.createElement('div');
            row.classList.add('input-row');
            inputsWrapper.appendChild(row);
        }

        const kolecko = document.createElement('input');
        kolecko.type = 'text';
        kolecko.inputMode = 'numeric';
        kolecko.maxLength = 1;
        kolecko.pattern = '[0-9]';
        kolecko.value = '0';
        kolecko.classList.add('kolecko');
        kolecko.addEventListener('focus', () => kolecko.select());
        inputsWrapper.lastElementChild.appendChild(kolecko);
    }
}

charInput.addEventListener('input', generateKolecka);
generateKolecka();

koleckaDiv.addEventListener('input', (event) => {
    const input = event.target;
    if (input instanceof HTMLInputElement && input.classList.contains('kolecko')) {
        input.value = input.value.replace(/[^0-9]/g, '').slice(0, 1);
    }
});

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

randomButton.addEventListener('click', () => {
    const kolecka = koleckaDiv.querySelectorAll('.kolecko');
    for (const kolecko of kolecka) {
        const randomValue = Math.floor(Math.random() * 10);
        kolecko.value = String(randomValue);
    }
});

generateButton.addEventListener('click', async () => {
    const kolecka = Array.from(koleckaDiv.querySelectorAll('.kolecko'));
    const code = kolecka.map(input => input.value).join('');
    const message = messageInput.value.trim();

    if (kolecka.length < 1 || kolecka.length > 12 ||
        kolecka.some(input => !/^\d$/.test(input.value))) {
        shareResult.textContent = 'Každé kolečko musí obsahovat jednu číslici.';
        return;
    }
    if (!message) {
        shareResult.textContent = 'Nejdřív zadej zprávu po odemčení.';
        return;
    }

    generateButton.disabled = true;
    shareResult.textContent = 'Vytvářím odkaz…';
    qrCodeDiv.hidden = true;
    qrCodeDiv.replaceChildren();

    try {
        const response = await fetch(`${window.kyzamConfig.supabaseUrl}/functions/v1/create-lock`, {
            method: 'POST',
            headers: {
                apikey: window.kyzamConfig.publishableKey,
                Authorization: `Bearer ${window.kyzamConfig.publishableKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code, message })
        });
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || `Server vrátil chybu ${response.status}.`);
        }

        const shareUrl = new URL(window.location.href);
        shareUrl.hash = result.fragment.slice(1);
        const link = document.createElement('a');
        link.href = shareUrl.href;
        link.textContent = shareUrl.href;
        shareResult.replaceChildren('Odkaz na zámek: ', link);

        qrCodeDiv.hidden = false;
        try {
            new QRCode(qrCodeDiv, {
                text: shareUrl.href,
                width: 200,
                height: 200,
                correctLevel: QRCode.CorrectLevel.H
            });
        } catch (error) {
            console.error('Nepodařilo se vytvořit QR kód.', error);
            qrCodeDiv.textContent = 'Odkaz funguje, ale QR kód se nepodařilo vytvořit.';
        }
    } catch (error) {
        shareResult.textContent = error instanceof Error
            ? error.message
            : 'Odkaz se nepodařilo vytvořit.';
    } finally {
        generateButton.disabled = false;
    }
});