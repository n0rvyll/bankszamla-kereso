# Bankszámlaszám kereső – MNB adatokkal

Ez az alkalmazás lehetővé teszi, hogy a **bankszámlaszám első 8 számjegye** alapján
megtudd, melyik banknál és melyik fióknál vezetik a számlát.  
Az adatok a **Magyar Nemzeti Bank (MNB) szűkített hitelesítő táblájából** származnak, és
naprakészen vannak betöltve.

## Funkciók

- 🔍 **8 számjegyes keresés** – Add meg a számlaszám első 8 számjegyét (bankkód + fiókkód), és a rendszer megmondja:
  - Bank neve
  - Fiók neve
  - Cím
  - BIC / SWIFT kód
- 📌 **Találati részletek**
  - Bank logó (ha ismert)
  - Másolás gomb BIC-hez és címhez
  - „Megnyitás térképen” link a címhez
- 💡 **Részleges találatok (javaslatok)** – Ha nincs pontos egyezés, a bankkód alapján felajánl hasonló fiókokat.
- 📆 **Utolsó frissítés ideje** – Minden keresésnél látod, mikor frissültek az adatok.
- 📱 **Reszponzív és modern felület**
  - Üvegkártyás dizájn (glassmorphism)
  - Skeleton betöltési animáció
  - Morph animáció a keresés gombon
- 💰 **Elhelyezhető AdSense hirdetési kód**
  - AdUnit.tsx oldalon helyezheted el a saját AdSense adataidat (ca-pub-XXXXXXXXXXXXXXXX)
- 📰 **Cikkajánló a kereső és találati box alatt**
  - route.ts-ben tudod szerkeszteni az RSS forrásokat. Jelenleg ami bent van: hvg.hu, 444.hu, gsplus.hu, telex.hu, 24.hu. Szintén ebben a fájlban tudod állítani a revalidate értéket, jelenleg alapértelmezett 480 (8 perc).
- ❗ **Logo**
  - Saját logót tudsz elhelyenzni, alapértelmezett helye a logónak: public/logos/logo.svg

## Technológiai háttér

- **Next.js 14 App Router**
- **TypeScript**
- **Tailwind CSS**
- **Heroicons**
- **MNB XLSX adatfeldolgozás** (`xlsx` könyvtár segítségével)

## Használat

1. Nyisd meg az alkalmazást.
2. Írd be a bankszámlaszám első 8 számjegyét (pl. `117-7301-4`).
3. Kattints a **Keresés** gombra vagy nyomd meg az Enter-t.
4. Megjelennek a bank adatai és a kapcsolódó információk.

## Forrás

- Magyar Nemzeti Bank – [Szűkített hitelesítő tábla](https://www.mnb.hu/penzforgalom/a-hazai-penzforgalmi-infrastruktura/hitelesito-tabla)

Képek:
![Bankszámlaszám kereső – főoldal](https://github.com/n0rvyll/bankszamla-kereso/blob/main/readme/01.jpeg)
![Bankszámlaszám kereső találati oldala](https://github.com/n0rvyll/bankszamla-kereso/blob/main/readme/02.jpeg)
![Bankszámlaszám kereső cikkajánlóval](https://github.com/n0rvyll/bankszamla-kereso/blob/main/readme/03.jpeg)