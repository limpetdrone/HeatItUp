# HeatItUp – adatkezelési működés

A játékosnevek, presetek, játékállapot, zenebeállítások és a saját dalpárosítások az adott készülék helyi alkalmazástárolójába mentődnek. Ezek a helyi mentések nincsenek alkalmazásszinten titkosítva. Nincs HeatItUp-fiók vagy analitika; a kérdésekre adott válaszokat nem rögzítjük.

A mentett játék a kezdőoldalról törölhető. A presetek a Preseteim oldalról, a dalpárosítások a zenebeállításokból külön törölhetők. Az alkalmazás vagy a webhelyadatok törlése a helyi adatokat is eltávolítja. A helyi mentés nem felhős biztonsági másolat.

Kikapcsolt zene mellett a játék nem kezdeményez zenei lekérést. Bekapcsolt YouTube-lejátszó esetén a beágyazott YouTube szolgáltatás saját feltételei és adatkezelése érvényesül; például hálózati és eszközadatokat kezelhet. A HeatItUp nem küldi el a játékosneveket, preseteket vagy a kártyaszöveget a YouTube-nak. A külső YouTube Music megnyitása a szolgáltató felületére vezet.

A nyilvános kiadáshoz tartozó hivatalos, élő adatkezelési tájékoztató elérhetősége: https://limpetdrone.github.io/HeatItUp/privacy.html
Üzemeltető: limpetdrone (Póka Dávid), Kapcsolat: pokadavid@gmail.com

## Önkéntes visszajelzések és javaslatok

A „Hibajelzés” és a beállítások javaslatküldő űrlapja csak a Beküldés gomb megnyomásakor kezdeményez hálózati kérést. A külön HeatItUp Firebase-projekt alapértelmezett Cloud Firestore-adatbázisának `submissions` gyűjteményébe kerül a jelzés típusa, a kártya azonosítója és változatlenyomata, típusa/szintje, a felület nyelve, az app verziója, időpont és az opcionálisan megadott szöveg. Javaslatnál a leírás kötelező. Játékosnevet, profilt, játékállapotot vagy megválaszolt kérdést a program nem csatol. A megjegyzésbe írt személyes adat viszont a beküldött szöveg része, ezért az űrlap kéri ennek mellőzését.

A Test mód kártyánként és nyelvenként helyben tárolja a jegyzetet és az átnézettségi jelölést. Feltöltés csak a kártya feltöltési gombjával vagy az „Összes függő feltöltése” gombbal indul. Az online rekord a fenti kártyaadatok mellett az átnézettséget (0/1) és az ellenőrzött kártya nyelvét tartalmazza. A program nem küldi el a teljes kártyaszöveget. A helyi jegyzet, jelölés és a sikertelen kérés azonosítója alkalmazás-újraindítás után is megmarad. Megváltozott kártyához új átnézési állapot tartozik; a régi jegyzet a helyi tárolóban megmarad, de a böngésző az aktuális változatot mutatja.

A beküldéseket a Firebase IAM-hozzáféréssel rendelkező üzemeltetők/agentek olvashatják; az alkalmazás nem listázhatja vagy módosíthatja más beküldését. A hálózati szolgáltató a kérés továbbításához hálózati adatokat (például IP-címet) kezelhet. Automatikus háttérfeltöltés nincs: újrapróbáláskor a felhasználó indítja a küldést. A sima hibajelző/javaslatűrlap szövege csak az űrlap bezárásáig marad meg; a Test mód jegyzetei tartós helyi mentést kapnak. A visszajelzések szerveroldali törlését az üzemeltető végzi.

## Technikai hibajelentések (Expo Observe)

Az Expo Observe 57.0.27 SDK telepítve és konfigurálva van. Az ezt tartalmazó új natív buildben az app automatikusan technikai hibaüzeneteket, stackeket, natív crashjelentéseket és az SDK kapcsolódó eszköz-/verzióadatait továbbíthatja az Expo szolgáltatásának. Az SDK telepítésenként anonim azonosítót használ. Általános teljesítményadatok küldése ki van kapcsolva, a hibák teljes mintán jelentődnek. Saját kontextusként nem csatolunk játékosnevet, presetet, választ vagy kártyaszöveget; a hibaüzenet tartalma azonban része a jelentésnek. A jelentések a projekthez hozzáférő Expo-fiókok számára olvashatók. Az Expo dokumentációja szerint a megőrzési idő 90 nap. A natív jelentések helyben várakozhatnak, és későbbi indításkor/hálózati kapcsolatnál továbbítódhatnak. A webes appba ezt az SDK-t nem töltjük be.

Technikai részletek és aktuális aktiválási állapot: `docs/OBSERVABILITY.md`.
