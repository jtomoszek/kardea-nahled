# Kardea — kardiologická ambulance MUDr. Jana Pavlase

Živý web: **https://kardea.cz**

Tenhle repozitář je zdrojem toho webu. Co je ve větvi `main`, to je na kardea.cz —
GitHub Pages ho nasadí do minuty po pushnutí. Není to náhled ani kopie.

## Obsah

Statický web bez závislostí a bez build kroku.

```
index.html      jediná stránka
css/style.css   design systém
js/main.js      interakce
assets/         logo, fotky, favicony
fonts/          Plus Jakarta Sans (hostováno lokálně)
CNAME           doména kardea.cz — nemazat
robots.txt      pro vyhledávače
sitemap.xml     mapa webu
```

## Jak dělat úpravy

Repozitář je nastavený pro práci s Claude Code. Pravidla, ověřené údaje ambulance
a seznam věcí, na které se nesmí sahat, jsou v [CLAUDE.md](CLAUDE.md) — Claude si
je načte sám.

```bash
git clone https://github.com/jtomoszek/kardea-nahled.git
```

Pak ve staženém adresáři spusťte `claude` a řekněte, co se má změnit.

## Vrácení změny

Každá úprava je samostatný commit, takže jde vrátit zvlášť:

```bash
git revert HEAD && git push
```

## Co běží mimo tenhle repozitář

| | |
|---|---|
| Doména a DNS | Active24 |
| Hosting | GitHub Pages |
| Měření návštěvnosti | Cloudflare Web Analytics |
| Formulář na předpis léku | FormSubmit → info@kardea.cz |
| Zdrojové soubory a archiv | soukromý repozitář `jtomoszek/kardea` |
