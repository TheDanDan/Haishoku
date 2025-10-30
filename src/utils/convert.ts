import { THEMESRGB, type ThemeName } from "@/constants/themes";

function convertImage( 
    canvas: HTMLCanvasElement, 
    ctx: CanvasRenderingContext2D, 
    theme: ThemeName, 
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

                let newPixel = nearestColour(oldPixel, themeColours);

                imageData[index] = newPixel[0];
                imageData[index + 1] = newPixel[1];
                imageData[index + 2] = newPixel[2];
            }
        }

        ctx.putImageData(image, 0, 0);

        if (y < canvas.height) {
            setTimeout(processBatch, 0);
        } 
    }
    processBatch();
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