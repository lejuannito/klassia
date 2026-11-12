// Lot 9c : un appareil neuf n'installe que la classe de l'enfant. Les tests qui parcourent les cinq classes hors connexion
// choisissent d'abord « toutes les classes », comme le ferait le bouton « Installer les cinq classes ». Le parcours par
// classe a son propre test (tests/pwa-browser.cjs, « offline classes »).
module.exports=async ctx=>ctx.addInitScript(()=>{try{if(!localStorage.getItem('klassia_offline_classes_v1'))localStorage.setItem('klassia_offline_classes_v1','"all"');}catch{}});
