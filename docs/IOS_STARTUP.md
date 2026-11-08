# TestFlight 1.0.0 (6) – igazolt indulási hiba

A telefonról exportált, 2026-11-08 20:49:33-as jelentésben a főszál `___UIApplicationEvaluateRuntimeIssueForNoSceneLifecycleAdoption_block_invoke` hívásnál `EXC_BREAKPOINT / SIGTRAP` miatt áll le. A készülék iOS 27.2-t futtat. A 6-os archive iOS 27 SDK-val készült, de Info.plist fájljából hiányzik a UIApplicationSceneManifest. Ez a natív életciklus-adoptálási hiba az Expo hivatalos leírásával is egyezik; a JavaScript-hibaképernyő nem tudja elfogni.

## Javítás

Az Expo 57.0.32 már tartalmazza az ExpoAppSceneDelegate és ExpoReactNativeFactoryProvider típusokat. A helyi `plugins/with-ios-scenes.js` config plugin ezeket kapcsolja be, új csomag vagy SDK-majorváltás nélkül:

- A manifest a natív `EXExpoAppSceneDelegate` osztályra hivatkozik, egyablakos konfigurációval.
- Az AppDelegate megfelel az ExpoReactNativeFactoryProvider protokollnak.
- Az AppDelegate közvetlen ablaklétrehozása és React Native indítása kikerül; ezt a scene delegate végzi. A factory létrehozása, a super hívás és a többi callback megmarad.
- A plugin prebuildkor fut; a generált iOS forrásokat nem kell kézzel módosítani. Ismeretlen/custom indítási kód esetén leáll.

A közben elkészült 7-es helyi archive-ból is hiányzott a scene manifest. Ezért a következő buildszám **8**. A feltöltő nem küldi fel automatikusan a 7-es IPA-t a 8-as konfigurációhoz, az új archive pedig manifest-ellenőrzést is kapott az export előtt.

```sh
npm run release:ios:local
```

A build és feltöltés részletei: [LOCAL_IOS_RELEASE.md](LOCAL_IOS_RELEASE.md). A 8-as natív build eszközös indítása még ellenőrzendő. A jelenlegi agentfolyamat továbbra sem látja a Keychain aláíróazonosságát, így a tényleges build itt az előellenőrzésnél megállt.

## Ellenőrzés

A scene plugin három célzott tesztje ellenőrzi a migrációt, idempotenciát, manifestet és a nem várt indulási kód elutasítását. Az iOS release tesztek a manifest nélküli archive exportját/feltöltését is tiltják. Az Expo config-introspectionban a scene manifest helyesen megjelent. A telefonon végzett regressziós indítás még szükséges.

A splash korábbi mérethibája külön javítva: négyzetes ikon, 300-as imageWidth. Az Expo Observe telepítve/configurálva; az új buildben a későbbi támogatott hibák online gyűjthetők. Részletek: [OBSERVABILITY.md](OBSERVABILITY.md).

Forrás: [Expo SDK 57 scene lifecycle](https://github.com/expo/fyi/blob/main/ios-scene-lifecycle.md), [Apple scene-életciklus követelmény](https://developer.apple.com/documentation/uikit/transitioning-to-the-uikit-scene-based-life-cycle).
