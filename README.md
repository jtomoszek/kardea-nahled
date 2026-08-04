# Kardea — náhled webu

Náhled připravované webové prezentace kardiologické ambulance MUDr. Jana Pavlase.

**Živý náhled:** https://jtomoszek.github.io/kardea-nahled/

## K čemu tento repozitář slouží

Slouží výhradně k odsouhlasení návrhu klientem. Není to ostrý web ambulance.

Stránka je označená `noindex, nofollow`, takže ji vyhledávače nezaindexují a nevznikne
duplicita s živým webem ordinace.

## Obsah

Statický web bez závislostí a bez build kroku.

```
index.html      jediná stránka
css/style.css   design systém
js/main.js      interakce
assets/         obrázky, logo, podpis
fonts/          Plus Jakarta Sans (hostováno lokálně)
```

Web nevolá žádnou externí službu ani analytiku. Jediný požadavek mimo tuto doménu
je vložená mapa Google Maps v sekci Kontakt.

## Před nasazením na ostrou doménu

1. **Indexace** — v `index.html` vrátit `<meta name="robots" content="index, follow" />`.
2. **Kanonická adresa** — doplnit `<link rel="canonical">` a `og:url` s finální doménou
   (v `<head>` je připravený zakomentovaný řádek).
3. **Formulář „Žádost o předpis léku"** — zatím nemá backend a otevírá předvyplněný e-mail.
   Po doplnění atributu `data-endpoint` u `<form id="rxForm">` začne odesílat JSON přes `POST`.
4. **Ochrana osobních údajů** — žádost o předpis obsahuje zdravotní údaje. Před zveřejněním
   formuláře je potřeba endpoint na HTTPS, bezpečné uložení a ošetření podle GDPR.
   Nespoléhat na nešifrovaný e-mail.
