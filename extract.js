const { getVideoDurationInSeconds } = require('get-video-duration');
const extractFrame = require('ffmpeg-extract-frame');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, 'video.mp4');

//(async () => {

let image_width = 60;//30;//15;
let image_height = 32;//16;//8;

function writeLog(text) {
    //console.log(text);
}

getVideoDurationInSeconds(inputPath).then((duration) => {

    readAndProcessWrapperWrapper(duration);

    //for (let i = 0; i < lengthMillis / frameTime; i++) {}


}).catch(function (err) {
    if (err) {
        writeLog('Error handling video duration: ' + err)
    }
});

async function readAndProcessWrapperWrapper(duration) {

    let fps = 8;

    let frameTime = 1000 / fps;

    //console.log('Got duration: ' + duration);

    let lengthMillis = duration * 1000;
    //let lengthMillis = 200000;

    for (let i = 0; i < (lengthMillis / frameTime); i++) {

        writeLog('Frame: ' + i)

        const result = await readAndProcessWrapper(i, i * frameTime);

        let start = new Date().getTime() + frameTime;

        while(true) {
            
            let currentTime = new Date().getTime();

            if (currentTime > start) {
                break;
            }
        }

        //readAndProcessWrapperWrapper(index, index * frameTime);
    }

    //let interval = setInterval(function() {

        

        /*if (index > (lengthMillis / frameTime)) {
            clearInterval(interval);
        }*/

    //}, frameTime);

    
}

function readAndProcessWrapper(index, frameTime) {
    return new Promise((resolve, reject) => {
        readAndProcess(index, frameTime, () => {
            resolve();
        });
    });
}

function readAndProcess(index, frameTime, callback) {

    //console.log('Getting frame at ' + index);

        (async () => {

            let localIndex = index;
            let localTime = frameTime;

            let filelocation = path.join(__dirname, 'images', /*localIndex +*/ 'image.png')
            let smallLocation = path.join(__dirname, 'smalls', /*localIndex +*/ 'image.png')

            writeLog('Extracting frame ' + localIndex);

            await extractFrame({
                input: inputPath,
                output: filelocation,
                offset: localTime,
                noaccurate: true
            }).catch(function(err) {
                console.log('Error extracting frame: ' + err);
            })

            writeLog('Extracted frame at ' + localTime)

            try {

                let imageData = fs.readFileSync(filelocation);

                    
    
                writeLog('Read file');
    
                    await sharp(imageData).resize(image_width, image_height, { kernel: sharp.kernel.nearest })
                    .raw()
                    .toBuffer(function(err, data, info) {
                        if (err) {
                            console.log(err);
                            return;
                        }
    
                        writeLog('Resized image');
    
                        let text = mapPixels(data);

                        console.log(text);

                        callback()
                    });
    
    
                    /*.toFile(smallLocation, (err, info) => {
    
                        console.log('Writing small image ' + localIndex)
    
                        if (err) {
                            console.log(err);
                        }
                    });*/

            } catch (err) {
                console.log(err);
                callback()
            }

            
        })();
}

function mapPixels(data) {

    //console.log(data);

    let emojis = [];

    for(let i = 0; i < data.length; i+=3) {

        let r = data[i];
        let g = data[i+1];
        let b = data[i+2];

        let hsl = rgbToHsl(r, g, b);

        //console.log(hsl);

        let emoji = hslToEmoji(hsl);

        emojis.push(emoji)
    }

    let emojiText = formatEmojis(emojis);

    return emojiText;
}

function hslToEmoji(hsl) {

    let h = hsl[0];
    let s = hsl[1];
    let l = hsl[2];

    if (s < 0.3) {
        if (l < 0.3) {
            return '⚫';
        } else {
            return '⚪';
        }
    }

    if (h < (20 / 360) || h >= (330 / 360)) {
        return '🟥';
    }

    if (h < (50 / 360)) {
        return '🟧';
    }

    if (h < (60 / 360)) {
        return '🟨';
    }

    if (h < (150 / 360)) {
        return '🟩';
    }

    if (h < (250 / 360)) {
        return '🟦';
    }

    if (h < (330 / 360)) {
        return '🟪';
    }

    return '🟪';
}

function rgbToHsl(r, g, b){ // From https://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if(max == min){
        h = s = 0; // achromatic
    }else{
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h, s, l];
}

function formatEmojis(emojis) {

    let final = "";

    for (let h = 0; h < image_height; h++) {

        for (let w = 0; w < image_width; w++) {

            index = (image_width * h) + w;

            final += emojis[index];
        }

        final += '\n';
    }

    return final;
}