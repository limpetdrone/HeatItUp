# Helyi iOS build, Expo Submit feltöltéssel

A fordítás és az IPA-export a saját Macen fut. Kizárólag a kész IPA feltöltése megy az Expo Submit szolgáltatásán keresztül, TestFlightra. EAS cloud buildet ez a folyamat nem indít.

## Egy parancs

A Mac saját termináljában, a HeatItUp mappában:

```sh
npm run release:ios:local
```

Külön lépésekben:

```sh
npm run build:ios:local
npm run submit:ios
```

A sikeres build után a `build/ios/latest.json` tartalmazza az új IPA, archive és (ha keletkezett) source map helyét, a verziót, buildszámot és az IPA SHA-256 lenyomatát. A submit ezt a konkrét fájlt választja és a lenyomatot újraellenőrzi. A régi `dist-ios/HeatItUp.ipa` nincs automatikusan kiválasztva, a régi 6-os archive/IPA megmarad. A verzió/buildszám az `app.json`-ból jön, jelenleg 1.0.0 (8). Xcode-alapú helyi buildnél az EAS távoli autoIncrement nem lép működésbe; egy újabb kiadáshoz a buildszámot növelni kell.

## Előfeltételek és lépések

- Beállított Xcode, CocoaPods, Node és EAS CLI.
- Az Apple Distribution aláíróazonosság legyen látható a buildet indító folyamat számára a Keychainben (team: 6Z45F3A37G).
- A `com.limpetdrone.heatitup AppStore` provisioning profil legyen telepítve. A repó meglévő exportOptions.plist fájlját használjuk.
- Az Expo Observe legyen aktiválva; ezt a script ellenőrzi.
- Hálózat kellhet a CocoaPods letöltésekhez, és kell az EAS Submit feltöltéshez. Expo-bejelentkezés és az App Store Connecthez beállított EAS Submit hitelesítés szükséges.

A script aláírási előellenőrzés után `expo prebuild --platform ios --no-install`, majd `pod install` segítségével szinkronizálja a natív projektet, ellenőrzi az ExpoAppMetrics podot, Release archive-ot készít, ellenőrzi a scene manifestet és exportál. A scene-életciklust külön config plugin kapcsolja be az iOS 27 kompatibilitáshoz. Egy helyi config plugin megőrzi a podok aláírásának kikapcsolását, miközben maga az alkalmazás disztribúciós aláírást kap; nincs kézi módosítás a generált Podfile-ban.

A feltöltés `eas submit --platform ios --profile production --path <ellenőrzött IPA> --non-interactive --wait`. Hiányzó Expo/App Store Connect hitelesítésnél leáll; a kész IPA megmarad, a `submit:ios` paranccsal később újrapróbálható. A sikeres feltöltés után az Apple feldolgozását és a tesztelői elérhetőséget TestFlightban külön ellenőrizni kell.

## Crash reporting és source map

Az SDK része lesz az új natív buildnek. A script `SOURCEMAP_FILE` változóval kéri és megőrzi a buildhez tartozó mapet. Az EAS `uploadSourceMaps` beállítása a helyi Xcode-build mapjét nem tölti fel automatikusan; az Observe online esemény és a stack értelmezhetősége továbbra is ellenőrizendő. Emiatt nem váltunk át cloud buildre.

## Ellenőrzés és jelenlegi akadály

Hat izolált folyamat-teszt sikeres (`npm run test:ios:release`), köztük az aláírási hiba, a sikertelen export, a konkrét IPA feltöltése és a régi/módosított IPA elutasítása. Lint és Expo config-introspection is lefutott.

A tényleges helyi buildpróba ebben a munkakörnyezetben **0 valid identities found** eredménnyel megállt, még a natív generálás előtt. Az Expo API külön `ENOTFOUND api.expo.dev` hibával nem érhető el innen. Új archive/IPA és TestFlight-feltöltés ebben a próbában nem készült. A fenti egyparancsos folyamatot a Mac saját termináljában kell futtatni, ahol a Keychain és a hálózat elérhető. Jelszót vagy privát kulcsot ne másolj a chatbe.

Forrás: [Expo Submit, helyi IPA-val](https://docs.expo.dev/submit/ios/), [helyi build source map korlátja](https://docs.expo.dev/eas/observe/errors/).
