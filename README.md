# Kyzam

Kyzam je jednoduchá statická webová aplikace, která schová zprávu za číselný zámek. Nastav počet číslic a zprávu, vytvoř sdílecí odkaz a pošli ho dál. Příjemce zámek odemkne zadáním správného kódu.

**Web:** [trt456.github.io/kyzam](https://trt456.github.io/kyzam/)

## Jak aplikaci používat

1. Nastav počet číslic zámku (1–12).
2. Zadej zprávu, která se zobrazí po odemčení.
3. Číslice nastav kliknutím, klávesnicí nebo na telefonu přejetím po kolečkách. Tlačítko **random** je vyplní náhodnými číslicemi.
4. Klikni na **Vytvořit odkaz** a sdílej odkaz nebo QR kód.
5. Otevři sdílený odkaz a zadej kód, kterým byl zámek vytvořen.

Odkaz ve zprávě lze zadat ve formátu `a:/www.google.com/:a`; po odemčení se zobrazí jako klikací odkaz.

## Spuštění lokálně

Jde o statickou stránku bez kroku sestavení. Otevři `index.html` v prohlížeči, nebo spusť v kořeni projektu jednoduchý lokální server:

```bash
python -m http.server 8000
