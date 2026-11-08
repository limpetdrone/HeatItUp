# 06 – Végső ellenőrzés és átadás

**Olvasd:** `STATUS.md`, `package.json`, ezt a fájlt. Hibánál csak az érintett specifikációt és kódot olvasd vissza.
**Módosítható:** szükséges hibajavítások, README futtatási része, STATUS.

## Automatikus ellenőrzés

1. `npm ci` – reprodukálható telepítés a lockfile-ból.
2. `npm test`, `npm run lint`, `npm run export` – mind sikeres.
3. Az exportált webes dist könyvtárat statikus szerverrel is nyisd meg (például `python3 -m http.server 8080 --directory dist`). A sikeres JS bundle-export nem natív bináris build és nem helyettesíti az eszköztesztet.
4. `npx expo-doctor`; Android-emulátoron/eszközön és iOS-szimulátoron/eszközön is nyisd meg a megfelelő SDK-val kompatibilis Expo Go vagy development build segítségével. A hiányzó célplatform maradjon „nem ellenőrzött”.

## Kézi elfogadási lista

- [ ] Jelölés nélküli belépés blokkolt; jelöléssel működik.
- [ ] 0/9 játékos nem állítható be; 1/8 támogatott.
- [ ] Üres, túl hosszú és csak kis-/nagybetűben eltérő ismételt névvel nem indul.
- [ ] 1 fő, Szikra, 3 kör: minden kártya egyedül értelmes; 3 lezárt lépés után vége.
- [ ] 2 fő, Flört: 1–2 szintű kártyák; mindkét játékos sorra kerül.
- [ ] 8 fő, 3 kör: 24 lépés, helyes kör- és játékosjelzés, nincs 25. kártya.
- [ ] 1 fő, Szikra, 10 kör: elfogy a 8 alkalmas lap, újrakeverés után folytatódik.
- [ ] Kész és Passz is léptet; az összegzés külön és helyesen számolja őket.
- [ ] Azonnali befejezés: 0 kész, 0 passz, „megszakított” állapot.
- [ ] Újrakezdés megtartja a beállításokat, nullázza az eredményt; beállításokra visszalépés szerkeszthető.
- [ ] Dupla kattintás/érintés nem okoz véletlen kettős továbblépést.
- [ ] Webes újratöltés vagy natív folyamat-újraindítás után welcome; ezt a beállítás képernyő előre jelzi.
- [ ] Webes mobil/asztali méretek, billentyűzet és nagyítás; natív safe area, képernyőolvasó, nagy betűméret és nyitott billentyűzet rendben.
- [ ] A betöltött játék során nincs AI-, analitikai vagy tartalomlekérő hálózati hívás. A statikus fájlok induló betöltése természetes.
- [ ] Android rendszer-vissza a specifikáció szerint működik; háttérből visszatérés nem nulláz.
- [ ] Nincs böngésző- vagy natív konzolhiba a teljes folyamatban.

Ha egy ellenőrzés eszközhiány miatt nem végezhető el, jelöld „nem ellenőrzött”-ként; ne állítsd késznek az összes ellenőrzést. A tényleges akadályt és az elvégzett ellenőrzéseket külön rögzítsd.

## Átadás

README: telepítés, Expo indítás Android/iOS/web célra, export, tesztek, memóriaalapú állapot és támogatott játékmódok rövid leírása. STATUS: a hat feladat állapota, utolsó ellenőrzések, esetleges nyitott hiba. A felhasználói válasz legyen rövid: mi működik, hogyan indítható, mit ellenőriztél, mi maradt bizonytalan.

Platformonként külön rögzítsd: JS export, futtatás, kézi ellenőrzés, natív bináris build státusza. A nem végzett bináris buildre ne állíts sikert.

A helyi MVP elkészítése nem foglal magában publikálást, távoli repó létrehozását vagy alkalmazásbolti kiadást.
