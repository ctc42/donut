/*
Organisation du code (ordre des lignes de code):
1- Récupération des données depuis l'Excel
2- Affectation de toutes les variales récupérée dans la feuille Excel
3- Definition de toutes les fonctions servant à desciner le Donuts
4- Récupération des éléments HTML et CSS utiles
5- Initialisation des variables utiles au tracé et qui ne dépendent pas directement des valeurs du Excel.
6- Initialisation du dessin du donuts faisant appel aux fonctons au dessus
7- Partie s'occupant de l'interactivité du donuts


Fonctionnement global de l'algorythme:
1- Récupération des données depuis l'Excel
2- Initialisation des variable permettant de dessiner le donuts
3- Dessin du donuts à l'aide de la fonction Desciner()
  3.1- Netoyage du canvas
  3.2- Dessin axe interne
  3.2- Dessin axe externe
  3.3- Dessin plancher social
  3.4- Dessin plafont environnemental


Lorsque la sourie bouge sur le canva:
1- L'evenement mousemove appel moveCanva
2- moveCanva s'exécute:
  2.1- Place un repère
  2.2- Détermine sur quel axe est la sourie:
    2.2.1 - Changer la couleur de l'axe survolé
    2.2.1 - Enlever la couleur des axes non survolés
  

Lorqu'on click sur le canva
1- l'evenement "click" appel clickCanva
2- clickCanva s'exécute:
  2.1- Place un repère
  2.2- Détermine sur quel axe est la sourie 
    2.2.1- Augmente la taille de l'axe cliqué d'un certain pourcentage
    2.2.1- Injecte les éléments dans la boite sur le coté et la fait afficher
    2.2.2- Diminue la taille des autre axes de façon complémentaire
  2.3- Si on est sur aucun axe, on réinitialise le donuts
  2.4- Si on click en dehors de la div du donuts, il y a un event (en dessous de clickcaneva) qui réinitialise le donuts 

*/

//Les axes sont définit comme des objects 
class Axe{
  constructor(nom,pourcentageEpaisseur,text,couleur,couleurover,couleurgrise,couleurdepassement,couleurdepassementover,couleurdepassemengrise,lien,lienImage,traite){
    if ((traite=="oui")||(this.traite=="Oui")||(this.traite=="OUI")) {
      this.couleuractuelle=couleur //c'est la couleur utilisé par la fonction qui descine de donuts pour la partie entre les limites
      this.couleur=couleur; //c'est la couleur de base pour la partie entre les limites
      this.couleurover=couleurover; //c'est la couleur quand on passe la sourie sur la partie entre les limites
      this.couleurgrise=couleurgrise; //c'est la couleur de la partie entre les limites quand le donuts est ouvert sur un autre cartier

      this.couleurdepassementactuelle=couleurdepassement; //c'est la couleur utilisé par la fonction qui descine de donuts pour la partie en dehors des limites
      this.couleurdepassement=couleurdepassement; //c'est la couleur de base pour la partie en dehors des limites
      this.couleurdepassementover=couleurdepassementover; //c'est la couleur quand on passe la sourie sur la partie en dehors des limites
      this.couleurdepassemengrise=couleurdepassemengrise; //c'est la couleur de la partie en dehors des limites quand le donuts est ouvert sur un autre cartier
    }
    else{
      //console.log("rgba("+couleur.substring(4,couleur.length-1)+",0.4)");
      const CouleurNonTraiteInterne="rgba(115, 191, 66,0.5)";
      const CouleurNonTraiteInterneOver="rgba(0,128,0,0.4)";
      const CouleurNonTraiteExterne="rgba(238, 55, 52,0.4)";
      const CouleurNonTraiteExterneOver="rgba(255,0,0,0.4)";
      this.couleuractuelle=CouleurNonTraiteInterne;
      this.couleur=CouleurNonTraiteInterne;
      this.couleurover=CouleurNonTraiteInterneOver;
      this.couleurgrise=CouleurNonTraiteInterne;
      this.couleurdepassementactuelle=CouleurNonTraiteExterne;
      this.couleurdepassement=CouleurNonTraiteExterne;
      this.couleurdepassementover=CouleurNonTraiteExterneOver;
      this.couleurdepassemengrise=CouleurNonTraiteExterne;
    }

    this.grise=false; //True lorsque le cartier est grisé
    this.nom=nom; //Nom de l'axe
    this.pourcentageEpaisseur=pourcentageEpaisseur; //Pourcentage de l'epaisseur d'un axe quand 100% est la distance entre le planché et le plafont
    this.text=text; //Texte expicatif qui s'affiche dans la boite sur le coté
    this.ouvert=false; //Savoir si l'arc est ouvert
    if (typeof(lien)=="undefined"){ //Si il n'y a pas de liens défini on met un lien par default
      this.lien="https://drive.ctc-42.org/index.php/s/H8VMgZFSDTgeXqP"
    }
    else{
      this.lien=lien ; 
    }


    if (typeof(lienImage)=="undefined"){ //Si il n'y a pas de liens on met rien
      this.lienImage= "";
    }
    else{
      this.lienImage= lienImage;

    }
    
  }

//Un cercle complet correspond à 100%. Le 0 est en haut du cercle et on tourne dans le sens des aiguilles d'une montre
  setPourcentages(P1,P2){
    this.PDebut=P1; //pourcentage corespondant à l'angle de début de l'affichage de l'axe
    this.PFin=P2; //pourcentage corespondant à l'angle de fin de l'affichage de l'axe
    this.PEtendu=P2-P1; //Etendu de l'angle de l'affichage de l'axe
  }

  setRayons(rayonInterne,epaisseur){
    this.rayonInterne=rayonInterne; //Correspond au nombre de pixel entre le centre et le rayon interne de l'axe
    this.epaisseur=epaisseur; //Nombre de pixel de l'eppaiseur de l'axe
    this.rayonExterne=rayonInterne+epaisseur; //Correspond au nombre de pixel entre le centre et le rayon interne de l'axe
  }

  setEcart(ecartDebut,ecartFin){
    this.ecartDebut=ecartDebut; //Ecart angulaire en poucentage entre la position actuel et la position du donuts fermé
    this.ecartFin=ecartFin;
  }
}




//---------------------------Lecture du document Excel -------------------------------------------------------------//


const url = "https://drive.ctc-42.org/index.php/s/H8VMgZFSDTgeXqP/download" //Adresse DE TELECHAGEMENT du document Excel permetant de paramettrer le Donuts et qui est sur le drive
var oReq = new XMLHttpRequest(); //Object qui permet de récupérer des valeur sur internet
oReq.open("GET", url, true);     // Ouverture de l'url
oReq.responseType = "arraybuffer";

oReq.addEventListener("load",(e)=>{  //Evenement charger la page internet. Tout le code est à l'intérieur
  var arraybuffer = oReq.response; //La suite est un copié collé pas bien compris

  /* convert data to binary string */
  var data = new Uint8Array(arraybuffer);
  var arr = new Array();
  for (var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
  var bstr = arr.join("");

  /* Call XLSX */
  var workbook = XLSX.read(bstr, {
    type: "binary"
  });

  /* DO SOMETHING WITH workbook HERE */
  /* Get worksheet */
  var worksheet = workbook.Sheets["Plancher Social"]; //Appel de la feulle s'appellant Plancher Social
  FeuilleSocial=XLSX.utils.sheet_to_json(worksheet, { //définition de la variable correspondant à la feuille
    raw: true
  })

  var worksheet = workbook.Sheets["Plafond Environnement"];
  FeuilleEnvironnement=XLSX.utils.sheet_to_json(worksheet, { //de même qu'au dessus
    raw: true
  })

  var worksheet = workbook.Sheets["Parametre donuts"];
  FeuilleParametreDonuts=XLSX.utils.sheet_to_json(worksheet, { //de même qu'au dessus
    raw: true
  })




  //Initialisation des valeurs et des couleurs

  CouleurInterAxe=FeuilleParametreDonuts[1].Couleur_Interne; 
  CouleurInterAxeOver=FeuilleParametreDonuts[1].Couleur_Interne_Over; 
  CouleurInterAxeGrise=FeuilleParametreDonuts[1].Couleur_Interne_Grise;
  CouleurRouge=FeuilleParametreDonuts[1].Couleur_Rouge;
  CouleurRougeOver=FeuilleParametreDonuts[1].Couleur_Rouge_Over;//le [1] fait référence à la première ligne non vide qui n'est pas l'entête (en blanc sur blanc dans la première ligne)
  CouleurRougeGrise=FeuilleParametreDonuts[1].Couleur_Rouge_Grise; //le .Nom correspond au nom écrit dans l'entête de la feuille, sur la ligne 1.


  var AxeInterne =[]
  nbreaxes=FeuilleSocial[0].Nom_Social //Recupere le nombre d'axes sociaux calculés directement via Excel

  LignePremierAxeDansLExcel=5; //Correspond au numéro de ligne Excel du premier axe 
  for (let w = LignePremierAxeDansLExcel-2; w < LignePremierAxeDansLExcel-2+nbreaxes; w++) { //On le crée dans une liste rassemblant tout les axes sociaux
    AxeInterne=AxeInterne.concat([new Axe(FeuilleSocial[w].Nom_Social,FeuilleSocial[w].Pourcentage_Depassement_Social,FeuilleSocial[w].Texte_Social,null,null,null,CouleurRouge,CouleurRougeOver,CouleurRougeGrise,FeuilleSocial[w].Lien_Social,FeuilleSocial[w].Lien_image_sociale,FeuilleSocial[w].traite_social)]);
  }


  var AxeExterne =[]
  nbreaxes=FeuilleEnvironnement[0].Nom_Environnement; //On fait la même chose que pour les axes sociaux ci-dessus mais avec les axes environementaux
  LignePremierAxeDansLExcel=5;
  for (let w = LignePremierAxeDansLExcel-3; w < LignePremierAxeDansLExcel-4+nbreaxes; w++) {
    AxeExterne=AxeExterne.concat([new Axe(FeuilleEnvironnement[w].Nom_Environnement,FeuilleEnvironnement[w].Pourcentage_Depassement_Environnnement,FeuilleEnvironnement[w].Texte_Environnement,CouleurInterAxe,CouleurInterAxeOver,CouleurInterAxeGrise,CouleurRouge,CouleurRougeOver,CouleurRougeGrise,FeuilleEnvironnement[w].Lien_Environnement,FeuilleEnvironnement[w].Lien_image_environnementale,FeuilleEnvironnement[w].traite_envi)]);
  }







// -----------Bien que non indenté pour des questions de lisibilité, tout les code ce-dessous est dans le AddEventLister "load" ---------------------//

//---------------------------------Initialisation des varibles----------------------------------------------------------//


//Valeurs de testes pour les axes aux cas où le lien avec le document Excele est cassé :
/*
var AxeInterne= [new Axe("Egalité",0.2,"Texte Egalité",null,null,null,CouleurRouge,CouleurRougeOver,CouleurRougeGrise), new Axe("Pauvreté",0.5,"Texte Pauvreté",null,null,null,CouleurRouge,CouleurRougeOver,CouleurRougeGrise),new Axe("Alimentation",1,"Texte Alimentation",null,null,null,CouleurRouge,CouleurRougeOver,CouleurRougeGrise)];
var AxeExterne=[new Axe("Déchets",2,"Texte dechet",CouleurInterAxe,CouleurInterAxeOver,CouleurInterAxeGrise,CouleurRouge,CouleurRougeOver,CouleurRougeGrise),new Axe("Pollution",1.4,"Texte polution",CouleurInterAxe,CouleurInterAxeOver,CouleurInterAxeGrise,CouleurRouge,CouleurRougeOver,CouleurRougeGrise),new Axe("Azote",1.2,"Texte azote",CouleurInterAxe,CouleurInterAxeOver,CouleurInterAxeGrise,CouleurRouge,CouleurRougeOver,CouleurRougeGrise),new Axe ("Eau",1.4,"Texte eaux",CouleurInterAxe,CouleurInterAxeOver,CouleurInterAxeGrise,CouleurRouge,CouleurRougeOver,CouleurRougeGrise),new Axe ("Phosphore",0.4,"Text Phosophore",CouleurInterAxe,CouleurInterAxeOver,CouleurInterAxeGrise,CouleurRouge,CouleurRougeOver,CouleurRougeGrise),new Axe ("CO2",2.5,"text CO2",CouleurInterAxe,CouleurInterAxeOver,CouleurInterAxeGrise,CouleurRouge,CouleurRougeOver,CouleurRougeGrise)];
*/

PourcetageExterneMax=AxeExterne[0].pourcentageEpaisseur //rechercher de la valeur de l'epaisseur maxiale afin de dimenssionner l'écart entre l'axe interne et externe de façon à ce que ça ne dépasse pas
for (let i = 0; i < AxeExterne.length; i++) {
  if (AxeExterne[i].pourcentageEpaisseur>PourcetageExterneMax){
    PourcetageExterneMax=AxeExterne[i].pourcentageEpaisseur;
  }
}

//Definition de la taille du canvas en pixel en fonction de la taille de la fenêtre.
tailleducanevas=Math.floor((0.85*Math.min(window.innerWidth,window.innerHeight)/10))*10; //L'arrondit et le /10 *10 sert juste à avoir une un nombre de pixel multiple de 10 car sinon il y a des problèmes d'affichage

RayonInternePlanche=eval(FeuilleParametreDonuts[1].Pourcentage_Rayon_InternePlanche)*tailleducanevas; //Definition du nombre de pixel du rayon interne
EppaiseurPlanche=eval(FeuilleParametreDonuts[1].Pourcentage_Epaisseur_Plancher)*tailleducanevas;  //Il y a un eval car la valeur rentré dans le excel est un string. 
CouleurPlanche=FeuilleParametreDonuts[1].Couleur_Plancher;                                        // Cela permet de garder la precision necessaire.

EppaiseurPlafond=eval(FeuilleParametreDonuts[1].Pourcentage_Epaisseur_Plafond)*tailleducanevas;
//Calcule de la longeur de rayon externe de façon que même avec le dépassement maximale, cela ne dépasse pas du canevas
RayonInternePlafond=RayonInternePlanche+EppaiseurPlanche-EppaiseurPlafond/2+(tailleducanevas/2-RayonInternePlanche-EppaiseurPlanche)/(PourcetageExterneMax);
CouleurPlafond=FeuilleParametreDonuts[1].Couleur_Plafond;

//Permet de définit les paramètres du cercle autour et des bordures noires
EppaiseurCercleAutour=eval(FeuilleParametreDonuts[1].Pourcentage_Epaisseur_Cercle_Autour)*tailleducanevas;
EppaiseurRayons=eval(FeuilleParametreDonuts[1].Pourcentage_Epaisseur_Rayons)*tailleducanevas;
CouleurCercleAutour="black"


//Faire un cercle
//pourcentage = pourcenge correspondant à la la larguer angulaire de l'axe
//RayonInterne= nombre de pixels du rayon interne
//epaisseur = nombre de pixels de l'epaisseur du trait
//PourcentageDebut= pourcentage correspondant à la valeur angulaire du début de l'axe
function CreerArcDeCercle(pourcentage,RayonInterne,epaiseur,couleur,PourcentageDebut){
  GetContextCanvaDonuts.lineWidth=epaiseur //on fixe l'eppaiseur du trait
  GetContextCanvaDonuts.strokeStyle=couleur //on fixe la couleur du trait
  GetContextCanvaDonuts.beginPath(); //on commence à écrire
  GetContextCanvaDonuts.arc(tailleducanevas/2, tailleducanevas/2, RayonInterne+epaiseur/2, (PourcentageDebut*0.02-0.5)*Math.PI, ((PourcentageDebut+pourcentage)*0.02-0.5)*Math.PI,0); //permet de tracer un arc avec pour argument (Xcentre,Ycentre,Rayon,AngleDébut, AngleFin, AngleDépart)
  //Le -0.5 dans la formule permet d'avoir le 0 en haut
  GetContextCanvaDonuts.stroke(); //permet d'afficher
}

//Tracer un trait selon le rayon du cercle
function Trait(DistanceAuCentre,longeur,pourcentage,couleur,epaiseur){  
  GetContextCanvaDonuts.lineWidth=epaiseur //on fixe l'epaisseur du trait
  GetContextCanvaDonuts.strokeStyle=couleur //on fixe la couleur du trait
  GetContextCanvaDonuts.beginPath(); //on commence à écrire
  GetContextCanvaDonuts.moveTo(tailleducanevas/2+DistanceAuCentre*Math.cos((pourcentage/100*2-0.5)*Math.PI),tailleducanevas/2+DistanceAuCentre*Math.sin((pourcentage/100*2-0.5)*Math.PI)); //utilisation des coordonnés cylindrique pour déterminer le point de départ et d'arrivé
  GetContextCanvaDonuts.lineTo(tailleducanevas/2+(DistanceAuCentre+longeur)*Math.cos((pourcentage/100*2-0.5)*Math.PI),tailleducanevas/2+(DistanceAuCentre+longeur)*Math.sin((pourcentage/100*2-0.5)*Math.PI));
  GetContextCanvaDonuts.stroke(); //permet d'afficher
}




//-----------------------------------Déclaration des fonctions-----------------------------------------------------//


//Ecrire en Cercle
//taille= nombre de pixels des lettre
//PourcentageMilieu correspond au poucentage angulaire du centre du mot
function EcrireArcDeCercle(taille,police,couleur,text, RayonInterne, PourcentageMilieu,PDebut,Pfin) {
  angle=Math.PI*2*PourcentageMilieu/100; 
  var CanvaDonuts = document.getElementById("DessinDonuts");
  var GetContextCanvaDonuts = CanvaDonuts.getContext("2d");
  GetContextCanvaDonuts.font ="bold "+taille+" "+police; //Précise le type d'écriture
  GetContextCanvaDonuts.fillStyle =couleur;
 

  anglemot=0;
  for (let i = 0; i < text.length; i++) { //Permet de déterminer le débatement angulaire du mot (en pourcentage)
    anglemot += GetContextCanvaDonuts.measureText(text[i]).width / RayonInterne;
  }

  if ((typeof(PDebut)!="undefined")&&(Pfin-PDebut<anglemot*100/(2*Math.PI))){ //Si le mot de rentre pas dans la case
    text=text[0]+text[1]; //On affiche que les 2 premiers charactères. 
    anglemot=0;
    for (let i = 0; i < text.length; i++) { //On recalcul le débatement angulaire du mot
      anglemot += GetContextCanvaDonuts.measureText(text[i]).width / RayonInterne;
    }
  }

  //Bout de code copié collé pour écrire en cercle
  var len = text.length, s, letterAngle;
  GetContextCanvaDonuts.save();
  GetContextCanvaDonuts.textAlign = 'center';
  GetContextCanvaDonuts.translate(tailleducanevas/2, tailleducanevas/2);
  GetContextCanvaDonuts.rotate(angle-anglemot/2); //ajustement pour que le mot soit centré dans son arc de cercle

  for (var n = 0; n < len; n++) {
      s = text[n];
      letterAngle = 0.5*(GetContextCanvaDonuts.measureText(s).width / RayonInterne);

      GetContextCanvaDonuts.rotate(letterAngle);
      GetContextCanvaDonuts.save();

      GetContextCanvaDonuts.translate(0, -RayonInterne);
      GetContextCanvaDonuts.fillText(s, 0, 0);
      GetContextCanvaDonuts.restore();

      GetContextCanvaDonuts.rotate(letterAngle);
  }
  GetContextCanvaDonuts.restore();
  //Fin du bout copié collé
}



//Axes internes --Permet de tracer les axes à l'intérieur avec des bordures noires
function ScoreInterne(pourcentage,couleur,PourcentageDebut,rayonExterne,epaisseur,nom){ 
  CreerArcDeCercle(pourcentage,rayonExterne-epaisseur,epaisseur,couleur,PourcentageDebut); //Arc de cercle avec les bonnes dimenssions
  Trait(rayonExterne-epaisseur,epaisseur,PourcentageDebut+pourcentage,CouleurCercleAutour,EppaiseurRayons); //Trait fin arc de cercle
  Trait(rayonExterne-epaisseur,epaisseur,PourcentageDebut,CouleurCercleAutour,EppaiseurRayons); //Trait début arc de cercle
  CreerArcDeCercle(pourcentage,rayonExterne-EppaiseurRayons,EppaiseurRayons,CouleurCercleAutour,PourcentageDebut); //arc de cercle faisant la boudure
  CreerArcDeCercle(pourcentage,rayonExterne-epaisseur,EppaiseurRayons,CouleurCercleAutour,PourcentageDebut); //arc de cercle fin faisant la boudure
  EcrireArcDeCercle(EppaiseurPlanche.toString()+"px","Serif","black",nom,RayonInternePlanche-EppaiseurPlanche,PourcentageDebut+pourcentage/2,PourcentageDebut,PourcentageDebut+pourcentage) ; //Ecriture du nom de l'axe
}

//Axes externe --Permet de tracer les axes à l'extérieur avec des bordures noires
function ScoreExterne(pourcentage,couleur,couleurdepassement,PourcentageDebut,rayonInterne,Epaiseur,nom){
  if (Epaiseur <= RayonInternePlafond+EppaiseurPlafond/2-RayonInternePlanche-EppaiseurPlanche){ //Trace l'arc de cercle entre plafont planché 
    CreerArcDeCercle(pourcentage,rayonInterne,Epaiseur,couleur,PourcentageDebut);
  }
  else{ //Trace l'arc de cercle au dessus du plafond (pas la même couleur)
    CreerArcDeCercle(pourcentage,rayonInterne,RayonInternePlafond+EppaiseurPlafond/2-RayonInternePlanche-EppaiseurPlanche,couleur,PourcentageDebut); //on remplit jusqu'au planfond
    CreerArcDeCercle(pourcentage,RayonInternePlafond+EppaiseurPlafond/2,Epaiseur-(RayonInternePlafond+EppaiseurPlafond/2-RayonInternePlanche-EppaiseurPlanche),couleurdepassement,PourcentageDebut); //on trace ce qui dépasse
  }
  Trait(RayonInternePlanche+EppaiseurPlanche,Epaiseur,PourcentageDebut+pourcentage,CouleurCercleAutour,EppaiseurRayons); //Trait fin arc de cercle
  Trait(RayonInternePlanche+EppaiseurPlanche,Epaiseur,PourcentageDebut,CouleurCercleAutour,EppaiseurRayons); //Trait début arc de cercle
  CreerArcDeCercle(100,RayonInternePlanche+EppaiseurPlanche,EppaiseurRayons,CouleurCercleAutour,PourcentageDebut); //arc de cercle fin intérieur faisant la boudure
  CreerArcDeCercle(pourcentage,RayonInternePlanche+EppaiseurPlanche+Epaiseur-EppaiseurRayons,EppaiseurRayons,CouleurCercleAutour,PourcentageDebut); //arc de cercle fin extérieur faisant la boudure
  EcrireArcDeCercle(EppaiseurPlanche.toString()+"px","Serif","black",nom,RayonInternePlafond+(tailleducanevas/2-RayonInternePlafond-EppaiseurPlafond)/2,PourcentageDebut+pourcentage/2,PourcentageDebut,PourcentageDebut+pourcentage) ; //Ecriture du nom de l'axe
}

function Desciner(){ //Permet de dessiner tout le donuts d'un coup
  GetContextCanvaDonuts.clearRect(0, 0, CanvaDonuts.width, CanvaDonuts.height); //Efface le canevas précedement tracé
  for (let i = 0; i < nombreinterne; i++) { //Descine les scores internes
    ScoreInterne(AxeInterne[i].PEtendu,AxeInterne[i].couleurdepassementactuelle,AxeInterne[i].PDebut,AxeInterne[i].rayonExterne,AxeInterne[i].epaisseur,AxeInterne[i].nom);
  }
  for (let i = 0; i < NombreExterne; i++) { //Descine les scores externes
    ScoreExterne(AxeExterne[i].PEtendu,AxeExterne[i].couleuractuelle,AxeExterne[i].couleurdepassementactuelle,AxeExterne[i].PDebut,AxeExterne[i].rayonInterne,AxeExterne[i].epaisseur,AxeExterne[i].nom);
  }

  // Descine le plafond environmental et écrit le nom
  CreerArcDeCercle(100,RayonInternePlafond,EppaiseurPlafond,CouleurPlafond,0);
  EcrireArcDeCercle(EppaiseurPlafond.toString()+"px","Serif","white","Plafond Environnemental",RayonInternePlafond*1.03,0) ;

  //Descine le placher social et écrit le nom
  CreerArcDeCercle(100,RayonInternePlanche-1,EppaiseurPlanche+1,CouleurPlanche,0);
  EcrireArcDeCercle(EppaiseurPlanche.toString()+"px","Serif","white","Plancher Social",RayonInternePlanche*1.03,0) ;

  //Descine le cercle extérieur
  /*CreerArcDeCercle(100,tailleducanevas/2-EppaiseurCercleAutour,EppaiseurCercleAutour,CouleurCercleAutour,0);*/
}





//-----------------------------------Initialisation------------------------------------------------------------------//


premier=true; //permet de savoir si c'est le premier click effectué sur le donuts
Axes=[AxeInterne,AxeExterne]
//Nommer le Canva
var CanvaDonuts = document.getElementById("DessinDonuts"); //Récupération de tout les éléments HTML
var GetContextCanvaDonuts = CanvaDonuts.getContext("2d");
var Textexplicatif= document.getElementById("textexplicatif");
var LienEnSavoirPlus= document.getElementById("lienEnSavoirPlus");
var imageIllustation = document.getElementById("imageIllustation");
var BoiteTextExplicatif= document.getElementById("blocktextexplicatif");

//Fixe la taille du canevas et du block sur le coté
CanvaDonuts.setAttribute("width", tailleducanevas); //ajouter un attribut à l'HTML
CanvaDonuts.setAttribute("height", tailleducanevas);

//Definitions des valeurs css
BoiteTextExplicatif.style.width = (window.innerWidth-tailleducanevas-60); //définit la largeur de la boite verte sur le côté
BoiteTextExplicatif.style.borderRadius=Math.trunc(((window.innerWidth-tailleducanevas)/1.2)*0.05)+"px"; //Définit l'arrondit des angles de la boite verte 

BoiteTextExplicatif.style.backgroundColor="rgb(64, 197, 93)"; //Forçage de certaines valeurs ccs
BoiteTextExplicatif.style.height="80%"; // car un bout du code Css ne se charge pas sinon
BoiteTextExplicatif.style.position="absolute"; //oui c'est de la magie noire
BoiteTextExplicatif.style.top="50%";
BoiteTextExplicatif.style.right="0%";
BoiteTextExplicatif.style.transform="translate(+0%, -50%)";
BoiteTextExplicatif.style.padding="20 20 20 20"
BoiteTextExplicatif.style.textAlign="left"

//Axes internes
nombreinterne=AxeInterne.length;
pourcentageInterneInit=100/nombreinterne; //débatement d'un axe interne lorqu'ils sont tous égaux
for (let i = 0; i < nombreinterne; i++) {
  AxeInterne[i].setPourcentages(i*pourcentageInterneInit,(i+1)*pourcentageInterneInit); //initialisation des pourcentages de début et de fin en configuration initiale
  AxeInterne[i].setRayons(RayonInternePlanche-RayonInternePlanche*AxeInterne[i].pourcentageEpaisseur,RayonInternePlanche*AxeInterne[i].pourcentageEpaisseur);
}

//Axes externe
NombreExterne=AxeExterne.length; //de même qu'au dessus
pourcentageExterneInit=100/NombreExterne;
for (let i = 0; i < NombreExterne; i++) {
  AxeExterne[i].setPourcentages(i*pourcentageExterneInit,(i+1)*pourcentageExterneInit);
  AxeExterne[i].setRayons(RayonInternePlanche+EppaiseurPlanche,(RayonInternePlafond+EppaiseurPlafond/2-RayonInternePlanche-EppaiseurPlanche)*AxeExterne[i].pourcentageEpaisseur);
}

pourcentageInit=[pourcentageInterneInit,pourcentageExterneInit];

Desciner(); //descine le donuts avec les paramètre initiaux







//---------------------------------------------Partie interactive--------------------------------------------------------------------------------//



function sleep(ms) { //création d'une fonction sleep à la main parce que le système de js n'est pas pratique
  return new Promise(resolve => setTimeout(resolve, ms));
}

function Theta(x,y){ //fonction permetant de transformer en coordonées "cylindriques"
  var reponse;
  if (x==0){ //varleur de theta en fonction des différents cas.
      if (y>0){
          reponse=Math.PI/2;
      }
      else{
          reponse=3*Math.PI/2;
      }
  }    
  else if (x>0){
      if (y>=0){
          reponse=Math.atan(y/x);
      }
      else {
          reponse=Math.atan(y/x)+2*Math.PI;
      }
  }
  else {
      reponse=Math.atan(y/x)+Math.PI;
  }


  reponse=-reponse+Math.PI/2; //Modification de theta de façon à ce que 0 soit au sommet du cercle
  reponse+=Math.PI*2          //et qu'il tourne dans le sens horaire
  if (reponse>2*Math.PI){ //ramène dans l'interval 0, 2pi
      reponse-=2*Math.PI
  }
  return reponse;
}



//evenement lorqu'on bouge la sourie sur le canva 
CanvaDonuts.addEventListener("mousemove",moveCanva);

function moveCanva(e){
  let x;
  let y;
  if (/^.*Firefox.*$/.test(window.navigator.userAgent)){; //le centre du repère est en haut à gauche sur Firefox
    x=(e.layerX-tailleducanevas/2); //on recentre le repère sur le cercle
    y=-(e.layerY-tailleducanevas/2);
  }
  else if (premier) { //et au centre pour les autres quand le canevas n'a pas bougé
    x=e.layerX;
    y=-e.layerY;
  }
  else { //le repère ne bouge pas quand le caevas bouge
    x=e.layerX-tailleducanevas/2; //on recentre le repère
    y=-e.layerY;
  }
  theta=Theta(x,y);
  Axes.forEach(Axe => { //Pour tout les axes (interne et externe)
    for (let i = 0; i < Axe.length; i++) {  //on parcours tous les axes
      if ((theta >Axe[i].PDebut/100*2*Math.PI) && (theta<Axe[i].PFin/100*2*Math.PI) && ((x**2+y**2)<=(Axe[i].rayonInterne+Axe[i].epaisseur)**2) && ((x**2+y**2)>=Axe[i].rayonInterne**2)){ //si on est dans la zonne graphique correspondant à l'axe
        if (Axe[i].couleurdepassementactuelle!=Axe[i].couleurdepassementover){ //si la couleur est déjà correcte on ne redescine pas
          Axe[i].couleuractuelle=Axe[i].couleurover; //sinon on change les couleurs entre les axes et au dessus du plafont
          Axe[i].couleurdepassementactuelle=Axe[i].couleurdepassementover; //par leur équivalent quand on passe la sourie dessus
          Desciner(); //on redecine le donuts
        }
      }
      else if (Axe[i].grise){ //si l'axe est définit comme grisé en change ses couleurs pas les équivalents transparent
        if (Axe[i].couleurdepassementactuelle!=Axe[i].couleurdepassement){ //si la couleur est déjà correcte on ne redescine pas
          Axe[i].couleuractuelle=Axe[i].couleurgrise;
          Axe[i].couleurdepassementactuelle=Axe[i].couleurdepassemengrise;
          Desciner();
        }
      }
      else{ //si on est pas dans la zone et que l'axe n'est pas grisé on remet les couleurs initiales
        if (Axe[i].couleurdepassementactuelle!=Axe[i].couleurdepassement){ //si la couleur est déjà correcte on ne redescine pas
          Axe[i].couleuractuelle=Axe[i].couleur;
          Axe[i].couleurdepassementactuelle=Axe[i].couleurdepassement;
          Desciner();
        }
      }
    }
  });
}


async function ReInitialisatialiserLeDonutsAnnime(){ //Remet tout les axes de la même tailles
  /*Gestion de la zone de texte */
  console.log("eeee");
  BoiteTextExplicatif.classList.add('cacher'); //on cache la boite sur le côté en ajoutent un argument css
  pas=20; //nombre de pas intermédiaire pour faire l'animation
  for (let k = 0; k < Axes.length; k++) {
    for (let j = 0; j < Axes[k].length; j++) { //pour tout les axes
      //on définit l'écart qu'ils ont par rapport à leur position initiale
      Axes[k][j].setEcart(j*pourcentageInit[k]-Axes[k][j].PDebut,(j+1)*pourcentageInit[k]-Axes[k][j].PFin)
    }
  }
  
  for (let l = 0; l < pas; l++) { //pour chaque pas
    for (let k = 0; k < Axes.length; k++) { //pour tous les axes
      for (let j = 0; j < Axes[k].length; j++) {
        Axes[k][j].grise=false;
        Axes[k][j].setPourcentages(Axes[k][j].PDebut+Axes[k][j].ecartDebut/pas,Axes[k][j].PFin+Axes[k][j].ecartFin/pas); //on modifie la les valeurs de début et de fin pour revenir progressivement à la confiuration initiale
        Axes[k][j].couleuractuelle=Axes[k][j].couleur; //On remet les couleurs de base
        Axes[k][j].couleurdepassementactuelle=Axes[k][j].couleurdepassement;
      }
    }
    Desciner(); //on descine
    await sleep(15); //on attends 15ms entre 2 dessins. Pour qu'il fonctionne il faut que la fonction soit async
  }
}


//Action réalisé lorqu'on clic sur le caneva
CanvaDonuts.addEventListener("click",clicCanva);

async function clicCanva(e){ //ouvre l'axe sur lequel on a cliqué et affiche la boite sur le côté
  test=true
  let x; //même début que pour movecaneva
  let y;
  if (/^.*Firefox.*$/.test(window.navigator.userAgent)){;
    x=(e.layerX-tailleducanevas/2); //on recentre le repère sur le cercle
    y=-(e.layerY-tailleducanevas/2);
  }
  else if (premier) {
    x=e.layerX;
    y=-e.layerY;
  }
  else {
    x=e.layerX-tailleducanevas/2;
    y=-e.layerY;
  }
  theta=Theta(x,y);
  for (let k = 0; k < Axes.length; k++) {
    nbreAxe=Axes[k].length
    for (let i = 0; i < nbreAxe; i++) {
      if ((Axes[k][i].ouvert==false)&&(theta >Axes[k][i].PDebut/100*2*Math.PI) && (theta<Axes[k][i].PFin/100*2*Math.PI) && ((x**2+y**2)<=(Axes[k][i].rayonInterne+Axes[k][i].epaisseur)**2) && ((x**2+y**2)>=Axes[k][i].rayonInterne**2)){ //quand on clic sur un axe
        Axes[k][i].ouvert=true; //On dit que l'axe est effectivement ouvert 
        test=false
        ReInitialisatialiserLeDonutsAnnime(); //on remet le donuts à sa configuration initial (au cas ou un axe soi déjà ouvert)
        PourcentageAjoute=Axes[k][i].PEtendu*1; //On ajoute un poucentage angulaire à la valeur de l'axe cliqué
        pas=20; //nombre de descins intermédiaire permttant de faire la transition
        for (let l = 0; l < pas; l++) { //pour chaque pas
          Axes[k][i].setPourcentages(Axes[k][i].PDebut-PourcentageAjoute/(2*pas),Axes[k][i].PFin+PourcentageAjoute/(2*pas)); //on modifier la taille de l'axe cliqué de la valuer voulu pour un pas
          for (let j = 0; j < Axes[k].length; j++) { //Pour tous les axes non cliqués
            PourcentageDebutAncien=Axes[k][j].PDebut;
            PourcentageFinAncien=Axes[k][j].PFin;
            if (i!=j){ //on les grise
              Axes[k][j].grise=true;
              Axes[k][j].couleuractuelle=Axes[k][j].couleurgrise;
              Axes[k][j].couleurdepassementactuelle=Axes[k][j].couleurdepassemengrise;
            }
            if (j<i){ //si l'axe est avant l'axe clické, on réduit sa taille et on le décale dans le sens trigo de façon à ce que les jonctions soient faite
              Axes[k][j].setPourcentages(PourcentageDebutAncien+(-PourcentageAjoute/2+(i-j)*PourcentageAjoute/(nbreAxe-1))/pas,PourcentageFinAncien+(-PourcentageAjoute/2+PourcentageAjoute/(nbreAxe-1)*(i-j-1))/pas);
            }
            else if (j>i){ //si l'axe est après l'axe clické, on réduit sa taille et on le décale dans le sens horaire de façon à ce que les jonctions soient faite
              Axes[k][j].setPourcentages(PourcentageDebutAncien+(PourcentageAjoute/2-PourcentageAjoute/(nbreAxe-1)*(j-i-1))/pas,PourcentageFinAncien+(PourcentageAjoute/2-PourcentageAjoute/(nbreAxe-1)*(j-i))/pas);
            }
          }
          await sleep(15); //on fait une pose entre chaque pas.
        }

        /*Gestion de la zone de texte */
        if (premier){ //si c'était le premier clic on décale le donuts sur la gauche
          pas=50;
          left=50;
          translate=50;
          deltaleft=(left)/pas; //valeur dont on va décaler horizontalement le canva 
          deltatranslate=translate/pas
          for (let l = 0; l < pas; l++) { //modification de la distance au bord et on retire progressivement la translation relative qui faisait que c'éait centré
            left-=deltaleft;
            translate-=deltatranslate;
            CanvaDonuts.style.left=left.toString()+"%";
            CanvaDonuts.style.transform="translate(-"+Math.trunc(translate.toString())+"%, -50%)";
            await sleep(20);  //on attend entre chaque pas
          }
          premier=false;
        }
        Textexplicatif.innerHTML=Axes[k][i].text; //on injecte le texte explicatif dans la div html sur la côté
        LienEnSavoirPlus.setAttribute("href",Axes[k][i].lien); //on injecte le lien en savoir plus dans le bouton
        imageIllustation.setAttribute("src",Axes[k][i].lienImage); //on injecte la sourse de l'image à ajouter.
        BoiteTextExplicatif.classList.remove('cacher'); //on enlève l'attibut css permettant de cacher la case

        Axes[k][i].couleuractuelle=Axes[k][i].couleurover; //on change la couleur de fin parce que sinon c'est bizarre
        Axes[k][i].couleurdepassementactuelle=Axes[k][i].couleurdepassementover;
        Desciner();
        //je comprends pas pourquoi ça descine dans la boucle qui fait varier le pas mais bon... ça marche
      }
    }
  }

  if (test){ //pour que quand on clic en dehors du donuts ou qu'il a été ouvert, ça le replit
      ReInitialisatialiserLeDonutsAnnime()
      for (let q = 0; q < Axes.length; q++) {
        for (let r = 0; r < Axes[q].length; r++) {
          Axes[q][r].ouvert=false;
        }
      }
  };
      
}


//Permet que le donuts se replit même si on click en dehors du Canva du donuts
Ensemble=document.getElementById("ensemble")
Ensemble.addEventListener("click",(e)=>{
  target = (e.target);
  if((target.closest('#DessinDonuts')==null&&(target.closest('#blocktextexplicatif')==null))){ //si on clic ni sur le caneva du donuts, ni sur le texte explicatif, on replie le donuts
    ReInitialisatialiserLeDonutsAnnime();
  }
});


//Fin de l'AddEventLister du load
});

oReq.send();