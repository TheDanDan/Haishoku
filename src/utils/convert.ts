import { THEMESRGB, type ThemeName } from "@/constants/themes";
import convert from 'color-convert';

export default function convertImage(
    canvas: HTMLCanvasElement, 
    ctx: CanvasRenderingContext2D, 
    theme: ThemeName,
    conversionRate: number = .6,
    useOkLab: boolean = false
) {
    const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const imageData = image.data;
    let themeColours = THEMESRGB[theme];
    let batchSize = 50;
    let y = 0;

    function processBatch() {
        let yEnd = Math.min(y + batchSize, canvas.height);

        for (; y < yEnd; y++) {
            for (let x = 0; x < canvas.width; x++) {
                const index = (y * canvas.width + x) * 4;

                let oldPixel = [imageData[index], imageData[index + 1], imageData[index + 2]];

                if (useOkLab) {
                    let newPixel = nearestColourOkLab(oldPixel, themeColours);
                    let oldLab = convert.rgb.lab(oldPixel[0], oldPixel[1], oldPixel[2]);
                    let newLab = convert.rgb.lab(newPixel[0], newPixel[1], newPixel[2]);

                    let labDelta = [
                        newLab[0] - oldLab[0],
                        newLab[1] - oldLab[1],
                        newLab[2] - oldLab[2]
                    ];

                    let blendedLab = [
                        oldLab[0] + labDelta[0] * conversionRate,
                        oldLab[1] + labDelta[1] * conversionRate,
                        oldLab[2] + labDelta[2] * conversionRate
                    ];
                    let blendedRgb = convert.lab.rgb(blendedLab[0], blendedLab[1], blendedLab[2]);

                    imageData[index] = blendedRgb[0];
                    imageData[index + 1] = blendedRgb[1];
                    imageData[index + 2] = blendedRgb[2];
                } else {
                    let newPixel = nearestColour(oldPixel, themeColours);
                    imageData[index] = (newPixel[0] - oldPixel[0]) * conversionRate + oldPixel[0];
                    imageData[index + 1] = (newPixel[1] - oldPixel[1]) * conversionRate + oldPixel[1];
                    imageData[index + 2] = (newPixel[2] - oldPixel[2]) * conversionRate + oldPixel[2];
                }
            }
        }
        ctx.putImageData(image, 0, 0);

        if (y < canvas.height) {
            setTimeout(processBatch, 0);
        } 
    }
    processBatch();
}

function nearestColourOkLab(targetColour: number[], colourScheme: number[][]) {
    let minDistance = Infinity;
    let closestColor = colourScheme[0];
    let secondClosestColor = colourScheme[0];
    let targetLab = convert.rgb.lab(targetColour[0], targetColour[1], targetColour[2]);

    for (let i = 0; i < colourScheme.length; i += 3) {
        let color = [colourScheme[i][0], colourScheme[i][1], colourScheme[i][2]];
        let colorLab = convert.rgb.lab(color[0], color[1], color[2]);
        let distance = Math.sqrt(
            Math.pow(targetLab[0] - colorLab[0], 2) +
                Math.pow(targetLab[1] - colorLab[1], 2) +
                Math.pow(targetLab[2] - colorLab[2], 2)
        );
        if (distance < minDistance) {
            minDistance = distance;
            secondClosestColor = closestColor;
            closestColor = color;
        }
    }
    return [closestColor, secondClosestColor, minDistance];
}

function nearestColour(targetColour: number[], colourScheme: number[][]) {
    let minDistance = Infinity;
    let closestColor = colourScheme[0];

    for (let i = 0; i < colourScheme.length; i += 3) {
        let color = [colourScheme[i][0], colourScheme[i][1], colourScheme[i][2]];
        let distance = Math.sqrt(
            Math.pow(targetColour[0] - color[0], 2) +
                Math.pow(targetColour[1] - color[1], 2) +
                Math.pow(targetColour[2] - color[2], 2)
        );

        if (distance < minDistance) {
            minDistance = distance;
            closestColor = color;
        }
    }
    return closestColor;
}