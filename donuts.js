//Les axes sont définit comme des objects 
class Axe{
  constructor(nom,pourcentageEpaisseur,text,couleur,couleurover,couleurgrise,couleurdepassement,couleurdepassementover,couleurdepassemengrise,lien,lienImage){
    
    this.couleuractuelle=couleur //c'est la couleur utilisé par la fonction qui descine de donuts pour la partie entre les limites
    this.couleur=couleur; //c'est la couleur de base pour la partie entre les limites
    this.couleurover=couleurover; //c'est la couleur quand on passe la sourie sur la partie entre les limites
    this.couleurgrise=couleurgrise; //c'est la couleur de la partie entre les limites quand le donuts est ouvert sur un autre cartier

    this.couleurdepassementactuelle=couleurdepassement; //c'est la couleur utilisé par la fonction qui descine de donuts pour la partie en dehors des limites
    this.couleurdepassement=couleurdepassement; //c'est la couleur de base pour la partie en dehors des limites
    this.couleurdepassementover=couleurdepassementover; //c'est la couleur quand on passe la sourie sur la partie en dehors des limites
    this.couleurdepassemengrise=couleurdepassemengrise; //c'est la couleur de la partie en dehors des limites quand le donuts est ouvert sur un autre cartier
    this.grise=false; //True lorsque le cartier est grisé

    this.nom=nom; //Nom de l'axe
    this.pourcentageEpaisseur=pourcentageEpaisseur; //Pourcentage de l'epaisseur d'un axe quand 100% est la distance entre le planché et le plafont
    this.text=text; //Texte expicatif qui s'affiche dans la boite sur le coté
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
  var worksheet = workbook.Sheets["Plancher Sociale"];
  FeuilleSocial=XLSX.utils.sheet_to_json(worksheet, { //fait reférence à la feuille 1 du document excel
    raw: true
  })

  var worksheet = workbook.Sheets["Plafond Environnement"];
  FeuilleEnvironnement=XLSX.utils.sheet_to_json(worksheet, { //fait reférence à la feuille 1 du document excel
    raw: true
  })

  var worksheet = workbook.Sheets["Parametre donuts"];
  FeuilleParametreDonuts=XLSX.utils.sheet_to_json(worksheet, { //fait reférence à la feuille 1 du document excel
    raw: true
  })




  //Initialisation des valeurs et des couleurs

  CouleurInterAxe=FeuilleParametreDonuts[1].Couleur_Interne; 
  CouleurInterAxeOver=FeuilleParametreDonuts[1].Couleur_Interne_Over; 
  CouleurInterAxeGrise=FeuilleParametreDonuts[1].Couleur_Interne_Grise;
  CouleurRouge=FeuilleParametreDonuts[1].Couleur_Rouge;
  CouleurRougeOver=FeuilleParametreDonuts[1].Couleur_Rouge_Over;//le [3] fait référence à la première ligne qui n'est pas l'entête soit la ligne 2 l'excel
  CouleurRougeGrise=FeuilleParametreDonuts[1].Couleur_Rouge_Grise; //le .Nom correspond au nom écrit dans l'entête de la feuille, soit la ligne 1.


  var AxeInterne =[]
  nbreaxes=FeuilleSocial[0].Nom_Social //Nombre d'axes sociaux calculés directement via Excel

  LignePremierAxeDansLExcel=5;
  for (let w = LignePremierAxeDansLExcel-2; w < LignePremierAxeDansLExcel-2+nbreaxes; w++) { //Pour chaque axe social on le crée dans une liste rassemblant tout les axes sociaux
    AxeInterne=AxeInterne.concat([new Axe(FeuilleSocial[w].Nom_Social,FeuilleSocial[w].Pourcentage_Depassement_Social,FeuilleSocial[w].Texte_Social,null,null,null,CouleurRouge,CouleurRougeOver,CouleurRougeGrise,FeuilleSocial[w].Lien_Social,FeuilleSocial[w].Lien_image_sociale)]);
  } //le .replace permet de remplacer la première valeur par la deuxième


  var AxeExterne =[]
  nbreaxes=FeuilleEnvironnement[0].Nom_Environnement; //On fait la même chose que pour les axes sociaux ci-dessus mais avec les axes environementaux
  LignePremierAxeDansLExcel=5;
  for (let w = LignePremierAxeDansLExcel-3; w < LignePremierAxeDansLExcel-4+nbreaxes; w++) {
    AxeExterne=AxeExterne.concat([new Axe(FeuilleEnvironnement[w].Nom_Environnement,FeuilleEnvironnement[w].Pourcentage_Depassement_Environnnement,FeuilleEnvironnement[w].Texte_Environnement,CouleurInterAxe,CouleurInterAxeOver,CouleurInterAxeGrise,CouleurRouge,CouleurRougeOver,CouleurRougeGrise,FeuilleEnvironnement[w].Lien_Environnement,FeuilleEnvironnement[w].Lien_image_environnementale)]);
  }







// Bien que non indenté pour des questions de lisibilité, tout les code ce-dessous est dans le AddEventLister "load"



//Valeurs de testes pour les axes aux cas où le lien avec le document Excele est cassé
//var AxeInterne= [new Axe("Egalité",0.2,"Texte Egalité",null,null,null,CouleurRouge,CouleurRougeOver,CouleurRougeGrise), new Axe("Pauvreté",0.5,"Texte Pauvreté",null,null,null,CouleurRouge,CouleurRougeOver,CouleurRougeGrise),new Axe("Alimentation",1,"Texte Alimentation",null,null,null,CouleurRouge,CouleurRougeOver,CouleurRougeGrise)];
//var AxeExterne=[new Axe("Déchets",2,"Texte dechet",CouleurInterAxe,CouleurInterAxeOver,CouleurInterAxeGrise,CouleurRouge,CouleurRougeOver,CouleurRougeGrise),new Axe("Pollution",1.4,"Texte polution",CouleurInterAxe,CouleurInterAxeOver,CouleurInterAxeGrise,CouleurRouge,CouleurRougeOver,CouleurRougeGrise),new Axe("Azote",1.2,"Texte azote",CouleurInterAxe,CouleurInterAxeOver,CouleurInterAxeGrise,CouleurRouge,CouleurRougeOver,CouleurRougeGrise),new Axe ("Eau",1.4,"Texte eaux",CouleurInterAxe,CouleurInterAxeOver,CouleurInterAxeGrise,CouleurRouge,CouleurRougeOver,CouleurRougeGrise),new Axe ("Phosphore",0.4,"Text Phosophore",CouleurInterAxe,CouleurInterAxeOver,CouleurInterAxeGrise,CouleurRouge,CouleurRougeOver,CouleurRougeGrise),new Axe ("CO2",2.5,"text CO2",CouleurInterAxe,CouleurInterAxeOver,CouleurInterAxeGrise,CouleurRouge,CouleurRougeOver,CouleurRougeGrise)];

PourcetageExterneMax=AxeExterne[0].pourcentageEpaisseur
for (let i = 0; i < AxeExterne.length; i++) {
  if (AxeExterne[i].pourcentageEpaisseur>PourcetageExterneMax){
    PourcetageExterneMax=AxeExterne[i].pourcentageEpaisseur;
  }
}

tailleducanevas=Math.floor((0.85*Math.min(window.innerWidth,window.innerHeight)/10))*10; //La division par 10 est que sinon ça coupe les bords

RayonInternePlanche=eval(FeuilleParametreDonuts[1].Pourcentage_Rayon_InternePlanche)*tailleducanevas;
EppaiseurPlanche=eval(FeuilleParametreDonuts[1].Pourcentage_Epaisseur_Plancher)*tailleducanevas;
CouleurPlanche=FeuilleParametreDonuts[1].Couleur_Plancher;

EppaiseurPlafond=eval(FeuilleParametreDonuts[1].Pourcentage_Epaisseur_Plafond)*tailleducanevas;
RayonInternePlafond=RayonInternePlanche+EppaiseurPlanche-EppaiseurPlafond/2+(tailleducanevas/2-RayonInternePlanche-EppaiseurPlanche)/(PourcetageExterneMax);
CouleurPlafond=FeuilleParametreDonuts[1].Couleur_Plafond;

EppaiseurCercleAutour=eval(FeuilleParametreDonuts[1].Pourcentage_Epaisseur_Cercle_Autour)*tailleducanevas;
EppaiseurRayons=eval(FeuilleParametreDonuts[1].Pourcentage_Epaisseur_Rayons)*tailleducanevas;
CouleurCercleAutour="black"

//Faire un cercle
function CreerArcDeCercle(pourcentage,RayonInterne,epaiseur,couleur,PourcentageDebut){
  GetContextCanvaDonuts.lineWidth=epaiseur //on fixe l'eppaiseur du trait
  GetContextCanvaDonuts.strokeStyle=couleur //on fixe la couleur du trait
  GetContextCanvaDonuts.beginPath(); //on commence à écrire
  GetContextCanvaDonuts.arc(tailleducanevas/2, tailleducanevas/2, RayonInterne+epaiseur/2, (PourcentageDebut*0.02-0.5)*Math.PI, ((PourcentageDebut+pourcentage)*0.02-0.5)*Math.PI,0); //permet de tracer un arc avec pour argument (Xcentre,Ycentre,Rayon,AngleDébut, AngleFin, AngleDépart)
  GetContextCanvaDonuts.stroke(); //permet d'afficher
}

//Tracer un trait
function Trait(DistanceAuCentre,longeur,pourcentage,couleur,epaiseur){  
  GetContextCanvaDonuts.lineWidth=epaiseur //on fixe l'eppaiseur du trait
  GetContextCanvaDonuts.strokeStyle=couleur //on fixe la couleur du trait
  GetContextCanvaDonuts.beginPath(); //on commence à écrire
  GetContextCanvaDonuts.moveTo(tailleducanevas/2+DistanceAuCentre*Math.cos((pourcentage/100*2-0.5)*Math.PI),tailleducanevas/2+DistanceAuCentre*Math.sin((pourcentage/100*2-0.5)*Math.PI));
  GetContextCanvaDonuts.lineTo(tailleducanevas/2+(DistanceAuCentre+longeur)*Math.cos((pourcentage/100*2-0.5)*Math.PI),tailleducanevas/2+(DistanceAuCentre+longeur)*Math.sin((pourcentage/100*2-0.5)*Math.PI));
  GetContextCanvaDonuts.stroke(); //permet d'afficher
}

//Ecrire en Cercle
function EcrireArcDeCercle(taille,police,couleur,text, RayonInterne, PourcentageMilieu,PDebut,Pfin) {
  angle=Math.PI*2*PourcentageMilieu/100;
  var CanvaDonuts = document.getElementById("DessinDonuts"); //on détermine le canevas en questuon
  var GetContextCanvaDonuts = CanvaDonuts.getContext("2d");
  GetContextCanvaDonuts.font ="bold "+taille+" "+police;
  GetContextCanvaDonuts.fillStyle =couleur;
 

  anglemot=0;
  for (let i = 0; i < text.length; i++) {
    anglemot += GetContextCanvaDonuts.measureText(text[i]).width / RayonInterne;
  }

  if ((typeof(PDebut)!="undefined")&&(Pfin-PDebut<anglemot*100/(2*Math.PI))){
    text=text[0]+text[1];
    anglemot=0;
    for (let i = 0; i < text.length; i++) {
      anglemot += GetContextCanvaDonuts.measureText(text[i]).width / RayonInterne;
    }
  }

  var len = text.length, s, letterAngle;
  GetContextCanvaDonuts.save();
  GetContextCanvaDonuts.textAlign = 'center';
  GetContextCanvaDonuts.translate(tailleducanevas/2, tailleducanevas/2);
  GetContextCanvaDonuts.rotate(angle-anglemot/2);

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
}



//Axes internes
function ScoreInterne(pourcentage,couleur,PourcentageDebut,rayonExterne,epaisseur,nom){
  CreerArcDeCercle(pourcentage,rayonExterne-epaisseur,epaisseur,couleur,PourcentageDebut);
  Trait(rayonExterne-epaisseur,epaisseur,PourcentageDebut+pourcentage,CouleurCercleAutour,EppaiseurRayons); //Trait fin arc de cercle
  Trait(rayonExterne-epaisseur,epaisseur,PourcentageDebut,CouleurCercleAutour,EppaiseurRayons); //Trait début arc de cercle
  CreerArcDeCercle(pourcentage,rayonExterne-EppaiseurRayons,EppaiseurRayons,CouleurCercleAutour,PourcentageDebut); //arc de cercle fin faisant la boudure
  CreerArcDeCercle(pourcentage,rayonExterne-epaisseur,EppaiseurRayons,CouleurCercleAutour,PourcentageDebut); //arc de cercle fin faisant la boudure
  EcrireArcDeCercle(EppaiseurPlanche.toString()+"px","Serif","black",nom,RayonInternePlanche-EppaiseurPlanche,PourcentageDebut+pourcentage/2,PourcentageDebut,PourcentageDebut+pourcentage) ;
}

//Axes externe
function ScoreExterne(pourcentage,couleur,couleurdepassement,PourcentageDebut,rayonInterne,Epaiseur,nom){
  if (Epaiseur <= RayonInternePlafond+EppaiseurPlafond/2-RayonInternePlanche-EppaiseurPlanche){
    CreerArcDeCercle(pourcentage,rayonInterne,Epaiseur,couleur,PourcentageDebut);
  }
  else{
    CreerArcDeCercle(pourcentage,rayonInterne,RayonInternePlafond+EppaiseurPlafond/2-RayonInternePlanche-EppaiseurPlanche,couleur,PourcentageDebut);
    CreerArcDeCercle(pourcentage,RayonInternePlafond+EppaiseurPlafond/2,Epaiseur-(RayonInternePlafond+EppaiseurPlafond/2-RayonInternePlanche-EppaiseurPlanche),couleurdepassement,PourcentageDebut);
  }
  Trait(RayonInternePlanche+EppaiseurPlanche,Epaiseur,PourcentageDebut+pourcentage,CouleurCercleAutour,EppaiseurRayons); //Trait fin arc de cercle
  Trait(RayonInternePlanche+EppaiseurPlanche,Epaiseur,PourcentageDebut,CouleurCercleAutour,EppaiseurRayons); //Trait début arc de cercle
  CreerArcDeCercle(100,RayonInternePlanche+EppaiseurPlanche,EppaiseurRayons,CouleurCercleAutour,PourcentageDebut); //arc de cercle fin intérieur faisant la boudure
  CreerArcDeCercle(pourcentage,RayonInternePlanche+EppaiseurPlanche+Epaiseur-EppaiseurRayons,EppaiseurRayons,CouleurCercleAutour,PourcentageDebut); //arc de cercle fin extérieur faisant la boudure
  EcrireArcDeCercle(EppaiseurPlanche.toString()+"px","Serif","black",nom,RayonInternePlafond+(tailleducanevas/2-RayonInternePlafond-EppaiseurPlafond)/2,PourcentageDebut+pourcentage/2,PourcentageDebut,PourcentageDebut+pourcentage) ;
}

function Desciner(){
  GetContextCanvaDonuts.clearRect(0, 0, CanvaDonuts.width, CanvaDonuts.height);
  for (let i = 0; i < nombreinterne; i++) {
    ScoreInterne(AxeInterne[i].PEtendu,AxeInterne[i].couleurdepassementactuelle,AxeInterne[i].PDebut,AxeInterne[i].rayonExterne,AxeInterne[i].epaisseur,AxeInterne[i].nom);
  }
  for (let i = 0; i < NombreExterne; i++) {
    ScoreExterne(AxeExterne[i].PEtendu,AxeExterne[i].couleuractuelle,AxeExterne[i].couleurdepassementactuelle,AxeExterne[i].PDebut,AxeExterne[i].rayonInterne,AxeExterne[i].epaisseur,AxeExterne[i].nom);
  }

  // Plafond environmental
  CreerArcDeCercle(100,RayonInternePlafond,EppaiseurPlafond,CouleurPlafond,0);
  EcrireArcDeCercle(EppaiseurPlafond.toString()+"px","Serif","white","Plafond Environnemental",RayonInternePlafond*1.03,0) ;

  //Planché social
  CreerArcDeCercle(100,RayonInternePlanche-1,EppaiseurPlanche+1,CouleurPlanche,0);
  EcrireArcDeCercle(EppaiseurPlanche.toString()+"px","Serif","white","Plancher Social",RayonInternePlanche*1.03,0) ;

  //Cercle extérieur
  CreerArcDeCercle(100,tailleducanevas/2-EppaiseurCercleAutour,EppaiseurCercleAutour,CouleurCercleAutour,0);
}






// Initialisation
premier=true;
Axes=[AxeInterne,AxeExterne]
//Nommer le Canva
var CanvaDonuts = document.getElementById("DessinDonuts"); //on détermine le canevas en questuon
var GetContextCanvaDonuts = CanvaDonuts.getContext("2d");
var Textexplicatif= document.getElementById("textexplicatif");
var LienEnSavoirPlus= document.getElementById("lienEnSavoirPlus");
var imageIllustation = document.getElementById("imageIllustation");
var BoiteTextExplicatif= document.getElementById("blocktextexplicatif");

//Fixer la taille du canevas et du block sur le coté
CanvaDonuts.setAttribute("width", tailleducanevas); //ajouter un attribut à l'HTML
CanvaDonuts.setAttribute("height", tailleducanevas);
BoiteTextExplicatif.style.width = (window.innerWidth-tailleducanevas-60);
BoiteTextExplicatif.style.borderRadius=Math.trunc(((window.innerWidth-tailleducanevas)/1.2)*0.05)+"px";
BoiteTextExplicatif.style.backgroundColor="rgb(64, 197, 93)";
BoiteTextExplicatif.style.height="80%";
BoiteTextExplicatif.style.position="absolute";
BoiteTextExplicatif.style.top="50%";
BoiteTextExplicatif.style.right="0%";
BoiteTextExplicatif.style.transform="translate(+0%, -50%)";
BoiteTextExplicatif.style.padding="20 20 20 20"

//Axes internes
nombreinterne=AxeInterne.length;
pourcentageInterneInit=100/nombreinterne;
for (let i = 0; i < nombreinterne; i++) {
  AxeInterne[i].setPourcentages(i*pourcentageInterneInit,(i+1)*pourcentageInterneInit);
  AxeInterne[i].setRayons(RayonInternePlanche-RayonInternePlanche*AxeInterne[i].pourcentageEpaisseur,RayonInternePlanche*AxeInterne[i].pourcentageEpaisseur);
}

//Axes externe
NombreExterne=AxeExterne.length;
pourcentageExterneInit=100/NombreExterne;
for (let i = 0; i < NombreExterne; i++) {
  AxeExterne[i].setPourcentages(i*pourcentageExterneInit,(i+1)*pourcentageExterneInit);
  AxeExterne[i].setRayons(RayonInternePlanche+EppaiseurPlanche,(RayonInternePlafond+EppaiseurPlafond/2-RayonInternePlanche-EppaiseurPlanche)*AxeExterne[i].pourcentageEpaisseur);
}

pourcentageInit=[pourcentageInterneInit,pourcentageExterneInit];

Desciner();






//Action interactive
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function Theta(x,y){
  var reponse;
  if (x==0){
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
  if (reponse>2*Math.PI){
      reponse-=2*Math.PI
  }
  return reponse;
}


CanvaDonuts.addEventListener("mousemove",moveCanva);

function moveCanva(e){
  let x;
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
  Axes.forEach(Axe => {
    for (let i = 0; i < Axe.length; i++) {
      if ((theta >Axe[i].PDebut/100*2*Math.PI) && (theta<Axe[i].PFin/100*2*Math.PI) && ((x**2+y**2)<=(Axe[i].rayonInterne+Axe[i].epaisseur)**2) && ((x**2+y**2)>=Axe[i].rayonInterne**2)){
        if (Axe[i].couleurdepassementactuelle!=Axe[i].couleurdepassementover){ //pour ne pas faire 40 dessins dès que la sourie bouge 
          Axe[i].couleuractuelle=Axe[i].couleurover;
          Axe[i].couleurdepassementactuelle=Axe[i].couleurdepassementover;
          Desciner();
        }
      }
      else if (Axe[i].grise){
        if (Axe[i].couleurdepassementactuelle!=Axe[i].couleurdepassement){ //pour ne pas faire 40 dessins dès que la sourie bouge
          Axe[i].couleuractuelle=Axe[i].couleurgrise;
          Axe[i].couleurdepassementactuelle=Axe[i].couleurdepassemengrise;
          Desciner();
        }
      }
      else{
        if (Axe[i].couleurdepassementactuelle!=Axe[i].couleurdepassement){ //pour ne pas faire 40 dessins dès que la sourie bouge
          Axe[i].couleuractuelle=Axe[i].couleur;
          Axe[i].couleurdepassementactuelle=Axe[i].couleurdepassement;
          Desciner();
        }
      }
    }
  });
}


async function ReInitialisatialiserLeDonutsAnnime(){
  /*Gestion de la zone de texte */
  BoiteTextExplicatif.classList.add('cacher');
  pas=20;
  for (let k = 0; k < Axes.length; k++) {
    for (let j = 0; j < Axes[k].length; j++) {
      Axes[k][j].setEcart(j*pourcentageInit[k]-Axes[k][j].PDebut,(j+1)*pourcentageInit[k]-Axes[k][j].PFin)
    }
  }
  
  for (let l = 0; l < pas; l++) {
    for (let k = 0; k < Axes.length; k++) {
      for (let j = 0; j < Axes[k].length; j++) {
        Axes[k][j].grise=false;
        Axes[k][j].setPourcentages(Axes[k][j].PDebut+Axes[k][j].ecartDebut/pas,Axes[k][j].PFin+Axes[k][j].ecartFin/pas);
        Axes[k][j].couleuractuelle=Axes[k][j].couleur;
        Axes[k][j].couleurdepassementactuelle=Axes[k][j].couleurdepassement;
      }
    }
    Desciner();
    await sleep(15);
  }
}


CanvaDonuts.addEventListener("click",clicCanvaSansAnimations);

async function clicCanvaSansAnimations(e){
  test=true
  let x;
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
      if ((theta >Axes[k][i].PDebut/100*2*Math.PI) && (theta<Axes[k][i].PFin/100*2*Math.PI) && ((x**2+y**2)<=(Axes[k][i].rayonInterne+Axes[k][i].epaisseur)**2) && ((x**2+y**2)>=Axes[k][i].rayonInterne**2)){
        test=false
        ReInitialisatialiserLeDonutsAnnime();
        PourcentageAjoute=Axes[k][i].PEtendu*1;
        pas=20;
        for (let l = 0; l < pas; l++) {
          Axes[k][i].setPourcentages(Axes[k][i].PDebut-PourcentageAjoute/(2*pas),Axes[k][i].PFin+PourcentageAjoute/(2*pas));
          for (let j = 0; j < Axes[k].length; j++) {
            PourcentageDebutAncien=Axes[k][j].PDebut;
            PourcentageFinAncien=Axes[k][j].PFin;
            if (i!=j){
              Axes[k][j].grise=true;
              Axes[k][j].couleuractuelle=Axes[k][j].couleurgrise;
              Axes[k][j].couleurdepassementactuelle=Axes[k][j].couleurdepassemengrise;
            }
            if (j<i){
              Axes[k][j].setPourcentages(PourcentageDebutAncien+(-PourcentageAjoute/2+(i-j)*PourcentageAjoute/(nbreAxe-1))/pas,PourcentageFinAncien+(-PourcentageAjoute/2+PourcentageAjoute/(nbreAxe-1)*(i-j-1))/pas);
            }
            else if (j>i){
              Axes[k][j].setPourcentages(PourcentageDebutAncien+(PourcentageAjoute/2-PourcentageAjoute/(nbreAxe-1)*(j-i-1))/pas,PourcentageFinAncien+(PourcentageAjoute/2-PourcentageAjoute/(nbreAxe-1)*(j-i))/pas);
            }
          }
          await sleep(15);
        }

        /*Gestion de la zone de texte */
        if (premier){
          pas=50;
          left=50;
          translate=50;
          deltaleft=(left)/pas;
          deltatranslate=translate/pas
          for (let l = 0; l < pas; l++) {
            left-=deltaleft;
            translate-=deltatranslate;
            CanvaDonuts.style.left=left.toString()+"%";
            CanvaDonuts.style.transform="translate(-"+Math.trunc(translate.toString())+"%, -50%)";
            await sleep(20);  
          }
          premier=false;
        }
        Textexplicatif.innerHTML=Axes[k][i].text;
        LienEnSavoirPlus.setAttribute("href",Axes[k][i].lien);
        imageIllustation.setAttribute("src",Axes[k][i].lienImage);
        BoiteTextExplicatif.classList.remove('cacher');

        Axes[k][i].couleuractuelle=Axes[k][i].couleurover;
        Axes[k][i].couleurdepassementactuelle=Axes[k][i].couleurdepassementover;
        Desciner();
      }
    }
  }

    if (test){
        ReInitialisatialiserLeDonutsAnnime()
      };
}


Ensemble=document.getElementById("ensemble")
Ensemble.addEventListener("click",(e)=>{
  target = (e.target);
  if((target.closest('#DessinDonuts')==null&&(target.closest('#blocktextexplicatif')==null))){
    ReInitialisatialiserLeDonutsAnnime();
  }
});


//Fin de l'AddEventLister du load
});
oReq.send();