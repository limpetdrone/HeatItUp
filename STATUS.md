# Állapot

Aktív: a TestFlight 6-os indulási crash oka igazolva és forrásban javítva; új 8-as build szükséges.
Technológia: Expo 57 / React Native 0.86 / JavaScript.

- Telefonos .ips: iOS 27.2, EXC_BREAKPOINT/SIGTRAP, UIApplicationEvaluateRuntimeIssueForNoSceneLifecycleAdoption.
- A 6-os archive iOS 27 SDK-val készült, de nincs UIApplicationSceneManifest.
- plugins/with-ios-scenes.js: manifest + ExpoReactNativeFactoryProvider, ablak/RN indítás az ExpoAppSceneDelegate-be kerül.
- A generált natív forrásokat prebuild módosítja; nincs kézi ios-forráspatch vagy SDK-majorváltás.
- Az elkészült 7-es IPA/archive is scene manifest nélküli; a forrás buildNumber értéke 8-ra emelve.
- Az iOS release pipeline export előtt a scene manifestet is ellenőrzi, hibás archive nem mehet feltöltésre.
- Részletek: docs/IOS_STARTUP.md, docs/LOCAL_IOS_RELEASE.md.

Ellenőrzés: 3 scene-teszt + 7 iOS release-teszt, lint, Expo config-introspection scene manifest, diff --check.
Korábbi appellenőrzés: 111 Jest teszt, 3 monitoring-telepítőteszt és valódi SDK-val háromplatformos JS-export sikeres.
A 8-as build telefonos indítása még nincs ellenőrizve; az agentnél a build aláírási előellenőrzésen megállt (0 identities).
Következő: a Mac termináljában npm run release:ios:local, majd a 8-as TestFlight-build indítása a telefonon.

A 7-es helyi build már elkészült; build/ios/latest.json rögzíti. Feltöltésének eredményét nem igazoltuk.
Expo Observe 57.0.27 telepítve és aktív a forrásban; a korábbi buildbe utólag nem kerül.
Splash javítva (négyzetes ikon, 300-as méret); a 6-os archive/IPA megmaradt.
Google Play automatizálás forrása kész; távoli feltöltés/CI-aktiválás nem igazolt (docs/ANDROID_RELEASE.md).
Feedback/javaslat forrása kész; Firebase-projekt/bekötés függőben (docs/FEEDBACK.md).
