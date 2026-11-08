# HeatItUp – implementálási szabályok

- A felhasználó aktuális utasítása az elsődleges. Az MVP forrása már elkészült; az aktuális ellenőrzési korlátokat a STATUS.md tartalmazza.
- Induláskor ezt a fájlt és a `STATUS.md`-t olvasd. MVP-munkánál az aktuális `docs/tasks/NN-*.md`, 1.0-munkánál a `docs/RELEASE_PLAN.md` és a `docs/release/TASKS.md` aktuális feladata/olvasási listája következik. A README csak térkép.
- Ne töltsd be automatikusan az összes dokumentumot, forrásfájlt, lockfile-t vagy korábbi naplót. Keress `rg`-vel; csak releváns részleteket olvass. Ne pásztázd a szomszédos projekteket.
- Egy feladaton belül dolgozz. Teljes implementálási kérésnél folytasd a következő feladattal, amíg az összes kész. Egy kész részfeladat önmagában nem indok a megállásra.
- Az MVP forrásai `docs/PRODUCT.md` és `docs/CONTRACTS.md`. Az 1.0 névsor/session és zene változásainak egyetlen specifikációja `docs/release/PLAYERS.md` és `MUSIC.md`; az érintett MVP-részeket felülírják. Ne másold a szabályokat további fájlokba.
- Expo + React Native; JavaScript, közös JSDoc-típusok, StyleSheet. Új csomagot csak konkrét hiány miatt adj hozzá. Nincs állapotkezelő könyvtár, router, UI keretrendszer vagy AI SDK.
- Expo/RN API használata előtt ellenőrizd a telepített SDK releváns dokumentumát; ne töltsd be a teljes dokumentációt. Csomagtelepítés: `npx expo install`; egyetlen npm lockfile. Az `ios/` és `android/` generált, nem kézzel szerkesztett forrás.
- A játékmotor nem importálhat Reactet és nem módosíthatja a bemeneteit. A felület ne ismételje meg a motor szabályait.
- Beszédes nevek; rövid, célzott függvények. Ne tömörítsd a forrást tokenspórolásból. Komment csak nem nyilvánvaló döntéshez.
- Az aktuális feladat célzott ellenőrzését futtasd; a végén a teljes ellenőrzést. Új változás vagy hiba nélkül ne ismételd meg ugyanazt a sikeres futást. Ne tekints kihagyott ellenőrzést sikeresnek.
- Parancskimenetből összefoglalót és a hibához szükséges részletet mutasd; teljes buildnaplót csak szükség esetén olvass.
- Feladatzáráskor írd át a `STATUS.md` aktuális állapotát: következő feladat, érintett fájlok, ellenőrzés, akadály. Legfeljebb 25 sor; ne növeld munkanaplóvá.
- A dokumentált feltételezéseket ne alakítsd át megerősített felhasználói igénnyé.
