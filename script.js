window.kyzamConfig = {
    supabaseUrl: 'https://rhivsxhrswevmhlojrtk.supabase.co',
    publishableKey: 'sb_publishable_WUQD4RPhBSkj1GbxKQBVTQ_xpXNGC0-'
};

const appScript = document.createElement('script');
appScript.src = window.location.hash ? 'lustit.js' : 'genrate.js';
appScript.onerror = () => console.error(`Nepodařilo se načíst ${appScript.src}`);
document.body.appendChild(appScript);
