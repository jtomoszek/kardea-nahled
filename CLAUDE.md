# Kardea — web kardiologické ambulance

Tenhle repozitář **je** živý web na https://kardea.cz. Není to kopie ani náhled.

**Cokoliv se pushne do větve `main`, je do minuty veřejně na kardea.cz.** Žádné
testovací prostředí mezi tím není. Web navštěvují pacienti, kteří na něm hledají
telefon na ordinaci — chyba se projeví okamžitě a na skutečných lidech.

Hostuje to GitHub Pages přímo z kořene větve `main`.

## Než něco pushneš

1. Zobraz uživateli, co přesně měníš, a nech si to potvrdit.
2. Po pushnutí ověř, že je změna opravdu na kardea.cz a že se stránka načte.
3. Když se něco pokazí, vrať to: `git revert HEAD && git push`. Každá změna je
   jeden commit, takže se dá vrátit zvlášť.

## Co se nesmí

- **Nemazat ani neupravovat soubor `CNAME`.** Drží doménu kardea.cz. Bez něj web
  spadne na adresu `jtomoszek.github.io` a kardea.cz přestane fungovat.
- **Neměnit `<meta name="robots">` na `noindex`.** Vyhledávače by web vyhodily.
- **Neměnit `data-endpoint` u formuláře** (`index.html`, `<form id="rxForm">`).
  Tudy chodí žádosti o předpis léku na info@kardea.cz.
- **Neměnit token v `data-cf-beacon`** na konci `index.html`. Je to měření
  návštěvnosti.
- **Nepřidávat Google Analytics, Facebook pixel, chat ani jiné cizí skripty.**
  Web dnes nenastavuje jediné cookie, a proto nepotřebuje lištu se souhlasem.
  Jakýkoliv takový skript to zruší a lišta se stane povinnou.

## Co je pravda a co ne

Je to web zdravotnického zařízení. **Nikdy si nevymýšlej fakta** — počty
pacientů, roky praxe, certifikace, reference, čekací doby, ceny. Když text
potřebuje údaj, který v repozitáři není, zeptej se uživatele. Nedoplňuj ho
odhadem ani „pro lepší dojem".

Ověřené údaje, které na webu jsou:

| | |
|---|---|
| Lékař | MUDr. Jan Pavlas, kardiolog |
| Sestra | Monika Vrbková |
| Adresa | Zdeňka Chalabaly 3041/2, 700 30 Ostrava |
| Telefon | +420 606 727 444 |
| E-mail | info@kardea.cz |

Adresa a telefon jsou v `index.html` na několika místech (sekce Kontakt, patička,
strukturovaná data `schema.org` na konci souboru) a v odkazu na mapu. Když se
mění, musí se změnit **všude**.

## Struktura

```
index.html      celý web, jediná stránka
css/style.css   design systém — barvy a rozměry jsou nahoře v :root
js/main.js      menu, FAQ, formulář, animace nadpisů, tečky na pozadí
assets/         logo (SVG), fotky, favicony
fonts/          Plus Jakarta Sans, hostovaný lokálně
CNAME           doména — nesahat
robots.txt      pro vyhledávače
sitemap.xml     mapa webu
```

Žádný build krok, žádné závislosti. Soubory se nasazují tak, jak jsou.

## Sekce stránky

Kotvy v `index.html`: `#lekar`, `#sluzby`, `#proc`, `#prubeh`, `#predpis`,
`#faq`, `#kontakt`, `#mapa`. Když měníš pořadí sekcí, uprav i menu, ať sedí.

## Texty

Web je česky, vyká se, tón je věcný a klidný — bez marketingových superlativů.
Nadpisy jsou krátké. Když text zkracuješ nebo prodlužuješ, zkontroluj, že se
nerozbije zalomení na mobilu (šířka 375 px).

## Obrázky

Fotky jsou schválně zmenšené na dvojnásobek velikosti, ve které se zobrazují —
CSS je omezuje na 678 px (lékař), 560 px (sestra) a 445 px (srdce). Když budeš
přidávat obrázek, drž se toho a ukládej do WebP, ať se web nezpomalí.

## Kde co ještě žije

- **Doména a DNS** — Active24 (ne v tomhle repozitáři)
- **Měření návštěvnosti** — Cloudflare Web Analytics
- **Formulář na předpis** — služba FormSubmit, doručuje na info@kardea.cz
- **Zdrojové soubory** (logo z Affinity, původní WordPress, fotky v plné
  velikosti) — soukromý repozitář `jtomoszek/kardea`
