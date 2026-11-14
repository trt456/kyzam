const charInput = document.getElementById('char');
const koleckaDiv = document.getElementById('kolecka');
const randomButton = document.querySelector('button.random');
const generateButton = document.querySelector('button.generate');
const messageInput = document.getElementById('message');
const shareResult = document.getElementById('share-result');

function generateKolecka() {
    const char = Number(charInput.value);
    koleckaDiv.innerHTML = '<img class="open" src="open-optimized.jpg" id="img"><div class="inputs-wrapper"></div>';
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
        kolecko.value = '0';
        kolecko.classList.add('kolecko');
        inputsWrapper.lastElementChild.appendChild(kolecko);
    }
}

charInput.addEventListener('input', generateKolecka);
generateKolecka();
window.setupWheelControls(koleckaDiv);

randomButton.addEventListener('click', () => {
    const kolecka = koleckaDiv.querySelectorAll('.kolecko');
    for (const kolecko of kolecka) {
        const randomValue = Math.floor(Math.random() * 10);
        kolecko.value = String(randomValue);
    }
});

generateButton.addEventListener('click', async () => {
    const digits = Array.from(koleckaDiv.querySelectorAll('.kolecko'))
        .map(input => input.value);
    const code = digits.join('');
    const message = messageInput.value.trim();

    if (digits.length < 1 || digits.length > 12 ||
        digits.some(digit => !/^[0-9]$/.test(digit))) {
        shareResult.textContent = 'Každé kolečko musí obsahovat jednu číslici.';
        return;
    }
    if (!message) {
        shareResult.textContent = 'Nejdřív zadej zprávu po odemčení.';
        return;
    }

    generateButton.disabled = true;
    shareResult.textContent = 'Vytvářím odkaz…';

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

        const qrCode = document.getElementById('qr-code');
        qrCode.replaceChildren();
        if (typeof QRCode === 'undefined') {
            qrCode.textContent = 'QR kód se nepodařilo načíst; použij odkaz.';
        } else {
            new QRCode(qrCode, {
                text: shareUrl.href,
                width: 220,
                height: 220,
                correctLevel: QRCode.CorrectLevel.M
            });
        }
    } catch (error) {
        shareResult.textContent = error instanceof Error
            ? error.message
            : 'Odkaz se nepodařilo vytvořit.';
    } finally {
        generateButton.disabled = false;
    }
});