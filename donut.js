// Data source: use Excel file.
const url = "https://drive.ctc-42.org/index.php/s/t4pWxGcqdVD5QD2/download"

// Donut axis.
class Axis
{
    constructor(title, value, text, baseColor, hoverColor, disabledColor, overBaseColor, overHoverColor, disabledOverColor, link, picture, useCustomColor)
    {
        //handle error in case useCustomColor is undefined to avoid errors that prevents display
        if(typeof(useCustomColor)=='undefined'){
            useCustomColor='non'
        }

        // Use custom colors.
        if ((useCustomColor.toLowerCase() == "oui"))
        {
            this.currentColor       = baseColor;          //< Current color used by the pen when drawing.
            this.baseColor          = baseColor;          //< Base color for donut between limits.
            this.hoverColor         = hoverColor;         //< Color between limits when mouse is hover.
            this.disabledColor      = disabledColor;      //< Color between limits when section is disabled.

            this.overCurrentColor   = overBaseColor;      //< Current color used by the pen when drawing outside limits.
            this.overBaseColor      = overBaseColor;      //< Base color for donut outside limits.
            this.overHoverColor     = overHoverColor;     //< Color outside limits when mouse is hover.
            this.disabledOverColor  = disabledOverColor;  //< Color outside limits when section is disabled.
        }

        // Use default colors.
        else
        {
            const defaultInternalColorHover = "rgba(115, 191, 66,0.5)";
            const defaultInternalColorOver  = "rgba(0,128,0,0.4)";
            const defaultExternalColor      = "rgba(238, 55, 52,0.4)";
            const defaultExternalColorHover = "rgba(255,0,0,0.4)";

            this.currentColor               = defaultInternalColorHover;
            this.baseColor                  = defaultInternalColorHover;
            this.hoverColor                 = defaultInternalColorOver;
            this.disabledColor              = defaultInternalColorHover;
            
            this.overCurrentColor           = defaultExternalColor;
            this.overBaseColor              = defaultExternalColor;
            this.overHoverColor             = defaultExternalColorHover;
            this.disabledOverColor          = defaultExternalColor;
        }

        this.disabled = false;    // True if section is disabled.
        this.title    = title;    // Axis title.
        this.text     = text;     // Axis text.
        this.open     = false;    // Axis state: open or closed.
        this.link     = link;     // Axis link.
        this.picture  = picture;  //< Axis picture link.
        this.value    = value;    //< Axis value as percent. 0% means floor level and 100% means ceil level.
    }

    // Set section angles from begin to end.
    setAngles(begin, end)
    {
        this.beginAngle = begin;
        this.endAngle   = end;
        this.angle      = end - begin;
    }

    // Set section radius (internal to external).
    setRadius(internalRadius, thickness)
    {
        this.internalRadius = internalRadius;             //< Distance in pixels between donut center and begin of the section.
        this.thickness      = thickness;                  //< Section thickness.
        this.externalRadius = internalRadius + thickness; //< Distance in pixels between donut center and end of the section.
    }

    // Set section offset when section is opened.
    setOffset(begin, end)
    {
        this.beginOffset  = begin;  //< Begin offset between closed and opened section.
        this.endOffset    = end;    //< End offset between closed and opened section.
    }
}

// Read data source.
var request = new XMLHttpRequest();
request.open("GET", url, true);
request.responseType = "arraybuffer";

request.addEventListener("load", (e) =>
{
    // Read data.
    var data = new Uint8Array(request.response);
    var arr = new Array();
    for (var i = 0 ; i != data.length ; i++)
        arr[i] = String.fromCharCode(data[i]);

    // Open workbook.
    var workbook = XLSX.read(arr.join(""), { type: "binary" });

    // Open sheets.
    var socialSheet       = XLSX.utils.sheet_to_json(workbook.Sheets["Plancher Social"], { raw: true })
    var environmentSheet  = XLSX.utils.sheet_to_json(workbook.Sheets["Plafond Environnement"], { raw: true })
    var donutParameters   = XLSX.utils.sheet_to_json(workbook.Sheets["Parametre donuts"], { raw: true })

    // Read color from parameters.
    internalAxisColor         = donutParameters[1].Couleur_Interne; 
    internalAxisHoverColor    = donutParameters[1].Couleur_Interne_Over; 
    internalDisabledAxisColor = donutParameters[1].Couleur_Interne_Grise;
    redColor                  = donutParameters[1].Couleur_Rouge;
    redHoverColor             = donutParameters[1].Couleur_Rouge_Over;
    redDisabledColor          = donutParameters[1].Couleur_Rouge_Grise;

    var internalAxisList = []
    var axisNumber = socialSheet[0].Nom_Social

    // Start from line 5.
    var currentExcelLine = 5;

    for (let w = currentExcelLine - 2 ; w < currentExcelLine - 2 + axisNumber ; w++)
    {
        internalAxisList = internalAxisList.concat([new Axis(socialSheet[w].Nom_Social,
                                                             socialSheet[w].Pourcentage_Depassement_Social,
                                                             socialSheet[w].Texte_Social,
                                                             null,
                                                             null,
                                                             null,
                                                             redColor,
                                                             redHoverColor,
                                                             redDisabledColor,
                                                             socialSheet[w].Lien_Social,
                                                             socialSheet[w].Lien_image_sociale,
                                                             socialSheet[w].traite_social)]);
    }

    var externalAxisList =[]
    axisNumber = environmentSheet[0].Nom_Environnement;

    // Reset current line.
    currentExcelLine=5;

    for (let w = currentExcelLine - 3 ; w < currentExcelLine - 4 + axisNumber ; w++)
    {
        externalAxisList = externalAxisList.concat([new Axis(environmentSheet[w].Nom_Environnement,
                                                             environmentSheet[w].Pourcentage_Depassement_Environnnement,
                                                             environmentSheet[w].Texte_Environnement,
                                                             internalAxisColor,
                                                             internalAxisHoverColor,
                                                             internalDisabledAxisColor,
                                                             redColor,
                                                             redHoverColor,
                                                             redDisabledColor,
                                                             environmentSheet[w].Lien_Environnement,
                                                             environmentSheet[w].Lien_image_environnementale,
                                                             environmentSheet[w].traite_envi)]);
    }

    // Get max radius.
    var maxExternalRadius = externalAxisList[0].value
    
    for (let i = 0 ; i < externalAxisList.length ; i++)
    {
        if (externalAxisList[i].value > maxExternalRadius)
        {
            maxExternalRadius = externalAxisList[i].value;
        }
    }

    // Define canvas width as multiple of 10 pixels.
    var canvasWidth = Math.floor((0.85 * Math.min(window.innerWidth, window.innerHeight) / 10)) * 10; //< TODO: magic number 0.85 ??

    // Define internal radius in pixels.
    var internalDonutRadius = eval(donutParameters[1].Pourcentage_Rayon_InternePlanche) * canvasWidth;

    // Define donut thickness in pixels.
    var donutThickness = eval(donutParameters[1].Pourcentage_Epaisseur_Plancher) * canvasWidth;

    // Donut floor color.
    var donutFloorColor = donutParameters[1].Couleur_Plancher;

    // Define ceil thickness.
    var ceilThickness = eval(donutParameters[1].Pourcentage_Epaisseur_Plafond) * canvasWidth;

    // Define ceil radius to fit with canvas max size.
    var ceilMaxRadius = internalDonutRadius + donutThickness - ceilThickness / 2 + (canvasWidth / 2 - internalDonutRadius - donutThickness) / (maxExternalRadius);

    // Donut ceil color.
    var donutCeilColor = donutParameters[1].Couleur_Plafond;

    // Define thickness.
    var radiusThickness = eval(donutParameters[1].Pourcentage_Epaisseur_Rayons) * canvasWidth;

    // Define default color for pen.
    var circleColor = "black"

    // Draw arc.
    // 'angle': arc angle in degrees.
    // 'internalRadius': internal radius in pixels.
    // 'thickness': pen thickness.
    // 'color': pen color.
    // 'beginAngle': begin angle in degrees.
    function drawArc(angle, internalRadius, thickness, color, beginAngle)
    {
        context.lineWidth   = thickness
        context.strokeStyle = color

        context.beginPath();
        
        // TODO: magic number 0.02 and 0.5 ??
        context.arc(canvasWidth / 2, canvasWidth / 2, internalRadius + thickness / 2, (beginAngle * 0.02 - 0.5) * Math.PI, ((beginAngle + angle) * 0.02 - 0.5) * Math.PI, 0);
        
        context.stroke();
    }

    // Draw line.
    // 'centerDistance': center distance in pixels.
    // 'length': line length.
    // 'angle': angle in degrees.
    // 'color': pen color.
    // 'thickness': pen thickness.
    function drawLine(centerDistance, length, angle, color, thickness)
    {
        context.lineWidth   = thickness
        context.strokeStyle = color

        context.beginPath();

        // TODO: magic number 100, 2 and 0.5 ??
        context.moveTo(canvasWidth / 2 + centerDistance * Math.cos((angle / 100 * 2 - 0.5) * Math.PI), canvasWidth / 2 + centerDistance * Math.sin((angle / 100 * 2 - 0.5) * Math.PI));
        context.lineTo(canvasWidth / 2 + (centerDistance + length) * Math.cos((angle / 100 * 2 - 0.5) * Math.PI), canvasWidth / 2 + (centerDistance + length) * Math.sin((angle / 100 * 2 - 0.5)*Math.PI));

        context.stroke();
    }

    // Write text on an arc baseline.
    // 'size': font size in pixels.
    // 'font': font.
    // 'color': font color.
    // 'text': text to draw.
    // 'radius': radius in pixels.
    // 'centerAngle': center angle in degrees.
    // 'beginAngle': begin angle in degrees.
    // 'endAngle': end angle in degrees.
    function writeTextOnArcBaseline(fontSize, font, color, text, radius, centerAngle, beginAngle, endAngle)
    {
        var angle         = Math.PI * 2 * centerAngle / 100; 
        var canvas        = document.getElementById("donut");
        var context       = canvas.getContext("2d");
        context.font      = "bold " + fontSize + " " + font;
        context.fillStyle = color;

        var wordAngle=0;
        for (let i = 0 ; i < text.length ; i++)
        {
            wordAngle += context.measureText(text[i]).width / radius;
        }

        // If word length exceeds arc length.
        // TODO: magic number 100 ??
        if ((typeof(beginAngle)!="undefined") && (endAngle - beginAngle < wordAngle * 100 / (2 * Math.PI)))
        {
            // Display only the first 2 letters.
            text      = text[0] + text[1];
            wordAngle = 0;

            for (let i = 0 ; i < text.length ; i++)
            {
                wordAngle += context.measureText(text[i]).width / radius;
            }
        }

        // Draw text.
        var len = text.length;

        context.save();
        context.textAlign = 'center';
        context.translate(canvasWidth / 2, canvasWidth / 2);
        context.rotate(angle - wordAngle / 2);

        for (var n = 0; n < len; n++)
        {
            var s = text[n];
            var letterAngle = 0.5 * (context.measureText(s).width / radius);

            context.rotate(letterAngle);
            context.save();

            context.translate(0, -radius);
            context.fillText(s, 0, 0);
            context.restore();

            context.rotate(letterAngle);
        }
        context.restore();
    }

    // Draw internal axis with black borders.
    function drawInternalSection(angle, color, beginAngle, externalRadius, thickness, title)
    { 
        drawArc(angle, externalRadius - thickness, thickness, color, beginAngle);
        drawLine(externalRadius - thickness, thickness, beginAngle + angle, circleColor, radiusThickness);
        drawLine(externalRadius - thickness, thickness, beginAngle, circleColor, radiusThickness);
        drawArc(angle, externalRadius - radiusThickness, radiusThickness, circleColor, beginAngle);
        drawArc(angle, externalRadius - thickness, radiusThickness, circleColor, beginAngle);
        writeTextOnArcBaseline((Math.trunc(donutThickness/2)).toString() + "px", "Serif", "black", title, internalDonutRadius - donutThickness, beginAngle + angle / 2, beginAngle, beginAngle + angle);
    }

    // Draw external axis with black borders.
    function drawExternalSection(angle, color, overColor, beginAngle, internalRadius, thickness, title)
    {
        if (thickness <= ceilMaxRadius + ceilThickness / 2 - internalDonutRadius - donutThickness)
            drawArc(angle, internalRadius, thickness, color, beginAngle);

        else
        {
            drawArc(angle, internalRadius, ceilMaxRadius + ceilThickness / 2 - internalDonutRadius - donutThickness, color, beginAngle);
            drawArc(angle, ceilMaxRadius + ceilThickness / 2, thickness - (ceilMaxRadius + ceilThickness / 2 - internalDonutRadius - donutThickness), overColor, beginAngle);
        }

        drawLine(internalDonutRadius + donutThickness, thickness, beginAngle + angle, circleColor, radiusThickness);
        drawLine(internalDonutRadius + donutThickness, thickness, beginAngle, circleColor, radiusThickness);
        drawArc(100, internalDonutRadius + donutThickness, radiusThickness, circleColor, beginAngle);
        drawArc(angle, internalDonutRadius + donutThickness + thickness - radiusThickness, radiusThickness, circleColor, beginAngle);
        writeTextOnArcBaseline(donutThickness.toString() + "px", "Serif", "black", title, ceilMaxRadius + (canvasWidth / 2 - ceilMaxRadius - ceilThickness) / 2, beginAngle + angle / 2, beginAngle, beginAngle + angle);
    }

    // Draw donut.
    function drawDonut()
    {
        context.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0 ; i < internalAxisNumber ; i++)
        {
            drawInternalSection(internalAxisList[i].angle,
                                internalAxisList[i].overCurrentColor,
                                internalAxisList[i].beginAngle,
                                internalAxisList[i].externalRadius,
                                internalAxisList[i].thickness,
                                internalAxisList[i].title);
        }

        for (let i = 0 ; i < externalAxisNumber ; i++)
        {
            drawExternalSection(externalAxisList[i].angle,
                        externalAxisList[i].currentColor,
                        externalAxisList[i].overCurrentColor,
                        externalAxisList[i].beginAngle,
                        externalAxisList[i].internalRadius,
                        externalAxisList[i].thickness,
                        externalAxisList[i].title);
        }

        drawArc(100, ceilMaxRadius, ceilThickness, donutCeilColor, 0);

        // TODO: magic number 1.03 ??
        writeTextOnArcBaseline(ceilThickness.toString() + "px", "Serif", "white", "Plafond Environnemental", ceilMaxRadius * 1.03, 0) ;

        drawArc(100, internalDonutRadius - 1, donutThickness + 1, donutFloorColor, 0);

        // TODO: magic number 1.03 ??
        writeTextOnArcBaseline(donutThickness.toString() + "px", "Serif", "white", "Plancher Social", internalDonutRadius * 1.03, 0) ;
    }

    // First click on the donut.
    var firstClick = true;

    var canvas  = document.getElementById("donut");
    var context = canvas.getContext("2d");

    var axisList = [internalAxisList,externalAxisList]

    // Get HTML elements.
    var axisDetailsText         = document.getElementById("axisDetailsText");
    var axisDetailsMoreInfoLink = document.getElementById("axisDetailsMoreInfoLink");
    var axisDetailsPicture      = document.getElementById("axisDetailsPicture");
    var axisDetails             = document.getElementById("axisDetails");

    // Apply some styles.
    canvas.setAttribute("width", canvasWidth);
    canvas.setAttribute("height", canvasWidth);

    // TODO: magic number 60 ??
    axisDetails.style.width         = window.innerWidth - canvasWidth - 60;
    axisDetails.style.borderRadius  = Math.trunc(((window.innerWidth - canvasWidth) / 1.2) * 0.05) + "px";

    axisDetails.style.backgroundColor = "rgb(64, 197, 93)";
    axisDetails.style.height          = "80%";
    axisDetails.style.position        = "absolute";
    axisDetails.style.top             = "50%";
    axisDetails.style.right           = "0%";
    axisDetails.style.transform       = "translate(+0%, -50%)";
    axisDetails.style.padding         = "20px";
    axisDetails.style.textAlign       = "left";

    // Internal axis.
    var internalAxisNumber = internalAxisList.length;

    var internalPercentInit = 100 / internalAxisNumber;
    for (let i = 0 ; i < internalAxisNumber ; i++)
    {
        internalAxisList[i].setAngles(i * internalPercentInit, (i + 1) * internalPercentInit);
        internalAxisList[i].setRadius(internalDonutRadius - internalDonutRadius * internalAxisList[i].value, internalDonutRadius * internalAxisList[i].value);
    }

    // External axis.
    var externalAxisNumber = externalAxisList.length;

    var externalPercentInit = 100 / externalAxisNumber;
    for (let i = 0 ; i < externalAxisNumber ; i++)
    {
        externalAxisList[i].setAngles(i * externalPercentInit, (i + 1) * externalPercentInit);
        externalAxisList[i].setRadius(internalDonutRadius + donutThickness, (ceilMaxRadius + ceilThickness / 2 - internalDonutRadius - donutThickness) * externalAxisList[i].value);
    }

    var percentInit = [internalPercentInit, externalPercentInit];

    drawDonut();

    // TODO: hack ??
    function sleep(ms)
    {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Return polar angle form cartesian coordinates.
    function Theta(x,y)
    {
        var reponse;

        if (x == 0)
        {
            if (y > 0)
                reponse = Math.PI / 2;

              else
                reponse = 3 * Math.PI / 2;
        }

        else if (x > 0)
        {
            if (y >= 0)
                reponse = Math.atan(y / x);

            else
                reponse = Math.atan(y / x) + 2 * Math.PI;
        }

        else
            reponse = Math.atan(y / x) + Math.PI;

        reponse = -reponse + Math.PI/2;
        reponse += Math.PI * 2;

        if (reponse > 2 * Math.PI)
            reponse -= 2 * Math.PI

        return reponse;
    }

    // Mouse move event.
    canvas.addEventListener("mousemove", mouseMoveEvent);

    function mouseMoveEvent(e)
    {
        let x;
        let y;

        // TODO: hack ??
        if (/^.*Firefox.*$/.test(window.navigator.userAgent))
        {
            x = (e.layerX - canvasWidth / 2);
            y = -(e.layerY - canvasWidth / 2);
        }

        else if (firstClick)
        {
            x = e.layerX;
            y = -e.layerY;
        }
        else
        {
            x = e.layerX - canvasWidth / 2;
            y = -e.layerY;
        }

        var theta = Theta(x,y);

        axisList.forEach(axis =>
        {
            for (let i = 0 ; i < axis.length ; i++)
            {
                if ((theta > axis[i].beginAngle / 100 * 2 * Math.PI) && (theta < axis[i].endAngle / 100 * 2 * Math.PI) && ((x ** 2 + y ** 2) <= (axis[i].internalRadius + axis[i].thickness) ** 2) && ((x ** 2 + y ** 2) >= axis[i].internalRadius ** 2))
                {
                    if (axis[i].overCurrentColor != axis[i].overHoverColor)
                    {
                        axis[i].currentColor     = axis[i].hoverColor;
                        axis[i].overCurrentColor = axis[i].overHoverColor;
                        drawDonut();
                    }
                }

                else if (axis[i].grise)
                {
                    if (axis[i].overCurrentColor != axis[i].overBaseColor)
                    {
                        axis[i].currentColor     = axis[i].disabledColor;
                        axis[i].overCurrentColor = axis[i].disabledOverColor;
                        drawDonut();
                    }
                }

                else
                {
                    if (axis[i].overCurrentColor != axis[i].overBaseColor)
                    {
                        axis[i].currentColor     = axis[i].baseColor;
                        axis[i].overCurrentColor = axis[i].overBaseColor;
                        drawDonut();
                    }
                }
            }
        });
    }

    // Reset donut: close all opened sections.
    async function resetDonut()
    {
        axisDetails.classList.add('hidden');

        // Number of steps to perform animation.
        var stepNumber = 20;

        for (let k = 0 ; k < axisList.length ; k++)
        {
            for (let j = 0 ; j < axisList[k].length ; j++)
            {
                axisList[k][j].setOffset(j * percentInit[k] - axisList[k][j].beginAngle, (j + 1) * percentInit[k] - axisList[k][j].endAngle)
            }
        }
        
        for (let l = 0 ; l < stepNumber ; l++)
        {
            for (let k = 0 ; k < axisList.length ; k++)
            {
                for (let j = 0 ; j < axisList[k].length ; j++)
                {
                  axisList[k][j].grise = false;
                  axisList[k][j].setAngles(axisList[k][j].beginAngle + axisList[k][j].beginOffset / stepNumber, axisList[k][j].endAngle + axisList[k][j].endOffset / stepNumber);
                  axisList[k][j].currentColor = axisList[k][j].baseColor;
                  axisList[k][j].overCurrentColor = axisList[k][j].overBaseColor;
                }
            }

            drawDonut();
            await sleep(15);
        }
    }

    // Canvas click event.
    canvas.addEventListener("click", canvasClickEvent);

    async function canvasClickEvent(e)
    {
        var closeDonut = true
        
        let x;
        let y;

        // TODO: hack ??
        if (/^.*Firefox.*$/.test(window.navigator.userAgent))
        {
            x = (e.layerX - canvasWidth / 2);
            y = -(e.layerY - canvasWidth / 2);
        }

        else if (firstClick)
        {
            x = e.layerX;
            y = -e.layerY;
        }

        else
        {
            x = e.layerX - canvasWidth / 2;
            y = -e.layerY;
        }

        var theta = Theta(x,y);

        for (let k = 0 ; k < axisList. length; k++)
        {
            var axisNumber = axisList[k].length;

            for (let i = 0 ; i < axisNumber ; i++)
            {
                if ((axisList[k][i].open == false) && (theta > axisList[k][i].beginAngle / 100 * 2 * Math.PI) && (theta < axisList[k][i].endAngle / 100 * 2 * Math.PI) && ((x ** 2 + y ** 2) <= (axisList[k][i].internalRadius+axisList[k][i].thickness) ** 2) && ((x ** 2 + y ** 2) >= axisList[k][i].internalRadius ** 2))
                {
                    axisList[k][i].open = true;
                    closeDonut          = false;

                    resetDonut();
                    
                    var cumuledPercent = axisList[k][i].angle * 1;
                    stepNumber = 20;

                    for (let l = 0 ; l < stepNumber ; l++)
                    {
                        axisList[k][i].setAngles(axisList[k][i].beginAngle - cumuledPercent / (2 * stepNumber), axisList[k][i].endAngle + cumuledPercent / (2 * stepNumber));
                        for (let j = 0 ; j < axisList[k].length ; j++)
                        {
                            var oldBeginPercent = axisList[k][j].beginAngle;
                            var oldEndPercent   = axisList[k][j].endAngle;

                            if (i != j)
                            {
                                axisList[k][j].grise            = true;
                                axisList[k][j].currentColor     = axisList[k][j].disabledColor;
                                axisList[k][j].overCurrentColor = axisList[k][j].disabledOverColor;
                            }

                            if (j < i)
                            {
                                axisList[k][j].setAngles(oldBeginPercent + (-cumuledPercent / 2 + (i - j) * cumuledPercent / (axisNumber - 1)) / stepNumber, oldEndPercent + (-cumuledPercent / 2 + cumuledPercent / (axisNumber - 1) * (i - j - 1)) / stepNumber);
                            }

                            else if (j > i)
                            {
                                axisList[k][j].setAngles(oldBeginPercent + (cumuledPercent / 2 - cumuledPercent / (axisNumber - 1) * (j - i - 1)) / stepNumber, oldEndPercent + (cumuledPercent / 2 - cumuledPercent / (axisNumber - 1) * (j - i)) / stepNumber);
                            }
                        }

                        await sleep(15);
                    }

                    if (firstClick)
                    {
                        stepNumber =50;

                        var left            = 50;
                        var translate       = 50;
                        var deltaleft       = left / stepNumber;
                        var deltatranslate  = translate / stepNumber;

                        for (let l = 0 ; l < stepNumber ; l++)
                        {
                            left -= deltaleft;
                            translate -= deltatranslate;
                            canvas.style.left = left.toString() + "%";
                            canvas.style.transform = "translate(-" + Math.trunc(translate.toString()) + "%, -50%)";
                            await sleep(20);
                        }

                        firstClick = false;
                    }

                    axisDetailsText.innerHTML = axisList[k][i].text;
                    axisDetailsMoreInfoLink.setAttribute("href", axisList[k][i].link);

                    //prevent the display of the image if the source is not provided
                    if (typeof axisList[k][i].picture === 'string'){
                        axisDetailsPicture.style.display = 'block'; //to force the display back if it was set to none before
                        axisDetailsPicture.setAttribute("src", axisList[k][i].picture);
                    }
                    else {
                        axisDetailsPicture.style.display = 'none';
                    }

                    axisDetails.classList.remove('hidden');
                    axisDetails.style.width = String(window.innerWidth - canvasWidth - 60) + "px";

                    axisList[k][i].currentColor = axisList[k][i].hoverColor;
                    axisList[k][i].overCurrentColor = axisList[k][i].overHoverColor;

                    drawDonut();
                }
            }
        }

        if (closeDonut)
        {
            resetDonut()

            for (let q = 0 ; q < axisList.length ; q++)
            {
                for (let r = 0 ; r < axisList[q].length ; r++)
                    axisList[q][r].open = false;
            }
        };
    }

    var container = document.getElementById("container")
    container.addEventListener("click", (e) =>
    {
        var target = (e.target);
        if((target.closest('#donut') == null && (target.closest('#blockaxisDetailsText') == null)))
            resetDonut();
    });
});

request.send();
