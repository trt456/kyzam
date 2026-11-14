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

    koleckaDiv.innerHTML = '<img src="closed-optimized.jpg" id="img"><div class="inputs-wrapper"></div>';
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

document.querySelectorAll('button').forEach(button => {
    button.remove();
});
document.getElementById('char').remove();
document.getElementById('message-setting').remove();
document.getElementById('link-help').remove();
document.getElementById('share-result').remove();
document.getElementById('qr-code').remove();
generateKolecka();
window.setupWheelControls(koleckaDiv);

const unlockButton = document.createElement('button');
unlockButton.textContent = 'Odemknout';
unlockButton.className = 'unlock-button';
const unlockResult = document.createElement('p');
unlockResult.setAttribute('aria-live', 'polite');
koleckaDiv.after(unlockButton, unlockResult);

unlockButton.addEventListener('click', async () => {
    const digits = Array.from(koleckaDiv.querySelectorAll('.kolecko'))
        .map(input => input.value);
    const code = digits.join('');

    if (digits.length < 1 || digits.length > 12 ||
        digits.some(digit => !/^[0-9]$/.test(digit))) {
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

        document.getElementById('img').src = 'open-optimized.jpg';
        document.getElementById('img').classList.add('open');
        const message = typeof result.message === 'string'
            ? result.message.trim()
            : '';

        unlockResult.replaceChildren();

        const parts = message.split(/a:\/([\s\S]*?)\/:a/g);
        parts.forEach((part, index) => {
            if (index % 2 === 0) {
                unlockResult.append(document.createTextNode(part));
                return;
            }

            const address = part.trim();
            const candidate = /^https?:\/\//i.test(address)
                ? address
                : `https://${address}`;

            let linkUrl = null;
            try {
                const parsedUrl = new URL(candidate);
                if (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') {
                    linkUrl = parsedUrl.href;
                }
            } catch {
                // Neplatná adresa zůstane v textu.
            }

            if (!linkUrl) {
                unlockResult.append(document.createTextNode(`a:/${part}/:a`));
                return;
            }

            const link = document.createElement('a');
            link.href = linkUrl;
            link.textContent = address;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            unlockResult.append(link);
        });

    } catch (error) {
        unlockResult.textContent = error instanceof Error
            ? error.message
            : 'Kód se nepodařilo ověřit.';
    } finally {
        unlockButton.disabled = false;
    }
});