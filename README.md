# Bankszámlaszám kereső – MNB adatokkal

![Bankszámlaszám kereső – főoldal](readme/01.jpg)
![Bankszámlaszám kereső találati oldala](readme/02.jpg)

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
  - Világos/sötét mód
  - Üvegkártyás dizájn (glassmorphism)
  - Skeleton betöltési animáció
  - Morph animáció a keresés gombon

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

- Magyar Nemzeti Bank – [Szűkített hitelesítő tábla](https://www.mnb.hu/)

---