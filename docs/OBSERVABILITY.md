# Expo Observe – indítási hibák és natív crash-ek

## Aktuális állapot

Az Expo Observe **57.0.27 telepítve és konfigurálva**. A natív adapter aktív a forrásban, az EAS production profil source map feltöltése be van kapcsolva. A telefonon futó 6-os buildet ez nem módosítja; új natív build és ellenőrzött online tesztesemény kell. A webes felület helyi hibaképernyőt használ; az Expo Observe natív integrációját nem tölti be.

Hálózattal rendelkező terminálban, a HeatItUp mappában:

```sh
npm run setup:crash-reporting
npm run check:crash-reporting
npm test
npm run lint
npm run export
```

Az első parancs `npx expo install expo-observe --npm -- --legacy-peer-deps` segítségével telepíti az SDK 57-hez való verziót. Az npm 11.19.0 az opcionális Router peerhez SDK 58-as `expo-router` csomagot választott, ami ütközött az SDK 57 `expo-constants` függőségével (ERESOLVE). Az app nem használ Routert vagy React Navigation integrációt. A projekt `.npmrc` fájlja ezért `legacy-peer-deps=true` beállítást tartalmaz, hogy a telepítés és a későbbi `npm ci` ugyanazzal a feloldási móddal fusson. Ez kihagyja az npm peerfüggőség-ellenőrzését; a kompatibilis SDK-verzió kiválasztását továbbra is az Expo végzi. Nem telepítünk SDK 58-as Routert, és nem használunk `--force` kapcsolót. Csak siker után másolja a kész natív adaptert a `src/monitoring/observe.native.js` fájlba, és állítja be az EAS production profil `uploadSourceMaps: true` értékét. Az EAS CLI minimuma ekkor 22.2.0. A projekt meglévő EAS-azonosítóját használja, nem hoz létre új fiókot/projektet. Sikertelen telepítésnél visszavonja az Expo által előre beírt függőséget, egyéb szerkesztést nem töröl. Egyedileg módosított natív adaptert nem ír felül.

## Mit kötöttünk be?

- Az `index.js` a monitoring modult a Startup és az alkalmazás előtt importálja. Aktivált SDK esetén már ekkor települ a JS hibakezelő.
- A Startup teljes tartalma `MonitoringRoot` alatt fut, amely natív buildben `ObserveRoot`.
- A saját hibaképernyő által elkapott modulbetöltési/renderelési kivétel is jelentődik; nem vész el attól, hogy a helyi error boundary helyreállította a felületet.
- Ugyanannak a hibaobjektumnak az ismételt renderelése nem küld új jelentést. A jelentés hibája nem akadályozhatja a hibaképernyőt.
- A `markInteractive` csak a nyelv és a mentett adatok betöltése után, az alkalmazás készenlétekor fut.
- `sampleRate: 0`, `errorSampleRate: 1`: nem küldünk általános teljesítménymetrikákat; a hibák nincsenek mintavételezéssel ritkítva. Debug adatok küldése kikapcsolva.
- Nem csatolunk saját kontextusként névsort, presetet, választ vagy kártyaszöveget. A hibajelentés maga tartalmazhat hibaüzenetet, stacket és az SDK technikai metaadatait.

A natív crashgyűjtéshez legalább expo-observe 57.0.21 szükséges; az aktuális helyi Expo-verzió ajánlása ~57.0.27. A szolgáltatás hibagyűjtése preview. iOS-en a MetricKit-jelentések későbbi indításkor kerülhetnek feladásra; azonnali megérkezés nem garantált. Nem minden OS-kilövés tartozik a támogatott hibákhoz.

## Új natív build és ellenőrzés

A telepített TestFlight 1.0.0 (6) buildbe ez nem kerül be utólag. A sikeres aktiválás után új iOS/Android natív build kell. EAS cloud build esetén a source map feltöltését a profil intézi. Helyi Xcode-archive-nál ez az EAS-beállítás önmagában nem tölti fel a source mapet.

Az új build indítása után ellenőrizni kell egy ismert, semleges teszthiba megjelenését az Expo dashboard Observe / Errors nézetében, valamint a stack megfeleltetését a forrásnak. A helyi mockos tesztek ezt az online próbát nem helyettesítik. Külön, nyilvános teszt-crash gombot nem tettünk a játékba.

Az üzemeltető/agent bejelentkezett Expo-fiókkal az EAS Observe CLI-parancsain keresztül is lekérdezheti a hibákat. Az elérhető parancsokat a telepített CLI `eas observe --help` súgója mutatja; újabb CLI-re lehet szükség. A jelenlegi környezetben az Expo API DNS-hibás, ezért távoli lekérdezés és új cloud build sem volt ellenőrizhető.

## Ellenőrzés

111 Jest teszt sikeres, köztük az adapter mockolt SDK-val, az indítási hibajelentés és a készenléti jelzés. A tényleges SDK a natív JS-exportokban is lefordult. A telepítő további 3 izolált tesztje ellenőrzi a sikertelen telepítés visszavonását, sikeres aktiválást/újrafuttatást és a felhasználói adapter megőrzését. Lint és mindhárom platform JS-exportja sikeres a telepített SDK-val. A legacy-peer-deps mód mellett az @react-native/jest-preset 0.86.3 és a TypeScript 6.0.3 explicit fejlesztői függőség, így az npm nem hagyja ki azokat. Az utóbbi az Expo ESLint-eszköze miatt kell, az alkalmazás továbbra is JavaScript. A source map beállítását az EAS saját sémája elfogadta. A teljes natív build és az online esemény még hátravan; az npm ci offline dry-run a lockfile-t elfogadta.

Források: [Expo Observe bekötés](https://docs.expo.dev/eas/observe/get-started/), [hibagyűjtés](https://docs.expo.dev/eas/observe/errors/), [mintavételezés](https://docs.expo.dev/eas/observe/configuration/), [agent hozzáférés](https://docs.expo.dev/eas/observe/ai-agents/).
