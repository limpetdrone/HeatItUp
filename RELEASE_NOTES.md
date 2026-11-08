# HeatItUp 1.0 – kiadásjelölt állapota

## Friss általános funkciók

- Új játék 2–8 fővel; a korábbi egyfős presetek szerkeszthetők maradnak.
- Angol, magyar, német felület és a meglévő 48 kártya fordítása.
- Telefonnyelv-felismerés és helyben mentett nyelvválasztás.
- Minden lépés előtt Felelsz/Mersz választás, csak az adott típusból történő húzással.
- 47 sikeres teszt, lint, Android/iOS/web JS-export.

## Korábban elkészült

- Helyi presetek létrehozása, másolása, szerkesztése és törlése.
- Független session-pillanatkép; játékos szüneteltetése, visszatérése és kivétele csak az adott játékból.
- Fix körlista, elavult gombesemények elutasítása, létszámfüggő kártyacsere, várakozás és folytatás.
- Soros mentés, mentési hibajelzés/újrapróbálás, játék folytatása újraindítás után.
- Zenei módok, saját feladat–dal párosítások és helyi, determinisztikus kiválasztás.
- YouTube beágyazott lejátszó webes és natív implementációja; YouTube Music külső megnyitás.

## Kiadás előtt nyitott

- Nincs gyárilag meghallgatással jóváhagyott 96 dalpárosítás. A saját katalógus üresből indul; a zenebeállításokban ellenőrzött dalok adhatók hozzá. Ez az F06 tartalmi követelményét még nem teljesíti.
- A Spotify játékhasználati korlátja miatt Spotify-vezérlés nem készült. A külön YouTube Music app távirányítása sem igazolt képesség.
- Valódi hálózaton YouTube-lejátszás, autoplay, háttérkezelés, WebView-origin és videóelérhetőség eszköztesztje szükséges.
- Natív aláírt binárisok, vizuális/akadálymentességi QA és store-metaadatok még hiányoznak. A JS-export nem natív build.
- Az új csomagok hivatalos lockadatai a helyben telepített referencia csomagjaiból kerültek a lockfile-ba az npm DNS-hibája miatt. A dry-run egyezést ellenőrzi, de tiszta `npm ci` még szükséges hálózattal.
- Végleges alkalmazásazonosítók, EAS-projektkapcsolat, kiadási ikon/splash és üzemeltetői adatok szükségesek a publikálás előtt.

A teljes végleges verzió a fenti pontok rendezéséig nincs kiadásra késznek minősítve.
