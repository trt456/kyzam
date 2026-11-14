window.kyzamConfig = {
    supabaseUrl: 'https://rhivsxhrswevmhlojrtk.supabase.co',
    publishableKey: 'sb_publishable_WUQD4RPhBSkj1GbxKQBVTQ_xpXNGC0-'
};

window.setupWheelControls = (container) => {
    const swipeStarts = new WeakMap();
    const unchangedValues = new WeakMap();
    const isWheel = (target) =>
        target instanceof HTMLInputElement && target.classList.contains('kolecko');

    const changeDigit = (input, direction) => {
        const previous = unchangedValues.get(input);
        const currentValue = /^\d$/.test(input.value) ? input.value : previous;
        const current = /^\d$/.test(currentValue) ? Number(currentValue) : 0;
        input.value = String((current + direction + 10) % 10);
        input.dispatchEvent(new Event('input', { bubbles: true }));
    };

    container.querySelectorAll('.kolecko').forEach((input, index) => {
        input.type = 'text';
        input.inputMode = 'numeric';
        input.maxLength = 1;
        input.pattern = '[0-9]';
        input.autocomplete = 'off';
        input.setAttribute('aria-label', `Kolečko ${index + 1}, číslice 0 až 9`);
    });

    container.addEventListener('focusin', (event) => {
        const input = event.target;
        if (!isWheel(input) || unchangedValues.has(input)) return;

        unchangedValues.set(input, input.value);
        input.value = '';
    });

    container.addEventListener('focusout', (event) => {
        const input = event.target;
        if (!isWheel(input)) return;

        const previous = unchangedValues.get(input);
        if (input.value === '' && previous !== undefined) input.value = previous;
        unchangedValues.delete(input);
    });

    container.addEventListener('input', (event) => {
        const input = event.target;
        if (!isWheel(input)) return;

        const digit = input.value.replace(/\D/g, '').slice(0, 1);
        if (input.value !== digit) input.value = digit;
        if (digit !== '') {
            unchangedValues.delete(input);

            if (event.isTrusted) {
                const wheels = Array.from(container.querySelectorAll('.kolecko'));
                const nextWheel = wheels[wheels.indexOf(input) + 1];
                if (nextWheel) nextWheel.focus();
            }
        }
    });

    container.addEventListener('keydown', (event) => {
        if (!isWheel(event.target) || !['ArrowUp', 'ArrowDown'].includes(event.key)) return;

        event.preventDefault();
        changeDigit(event.target, event.key === 'ArrowUp' ? 1 : -1);
    });

    container.addEventListener('wheel', (event) => {
        if (!isWheel(event.target) || event.deltaY === 0) return;

        event.preventDefault();
        changeDigit(event.target, event.deltaY < 0 ? 1 : -1);
    }, { passive: false });

    container.addEventListener('pointerdown', (event) => {
        if (event.pointerType === 'touch' && isWheel(event.target)) {
            swipeStarts.set(event.target, { pointerId: event.pointerId, y: event.clientY });
        }
    });

    container.addEventListener('pointerup', (event) => {
        if (!isWheel(event.target)) return;

        const start = swipeStarts.get(event.target);
        if (!start || start.pointerId !== event.pointerId) return;
        swipeStarts.delete(event.target);

        const movement = start.y - event.clientY;
        if (Math.abs(movement) >= 20) {
            event.preventDefault();
            changeDigit(event.target, movement > 0 ? 1 : -1);
        }
    });

    container.addEventListener('pointercancel', (event) => {
        if (isWheel(event.target)) swipeStarts.delete(event.target);
    });
};

const appScript = document.createElement('script');
appScript.src = window.location.hash ? 'lustit.js' : 'genrate.js';
appScript.onerror = () => console.error(`Nepodařilo se načíst ${appScript.src}`);
document.body.appendChild(appScript);
