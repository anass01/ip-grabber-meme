const express = require('express');
const requestIp = require('request-ip');
const Jimp = require('jimp') ;
const geoip = require('geoip-lite');
const app = express()
app.use(requestIp.mw())
app.use(express.json())
app.set('trust proxy', true) // trust first proxy


app.get("/*",async (req, res) =>{
    const ip = req.clientIp || req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    console.log(ip,req.headers['user-agent'])
    const geo = geoip.lookup(ip);
    const text = ip+" "+Object.keys(geo).map((key)=>{
        return ' '+key+':'+geo[key]+' ';
    })
    const image =await textOverlay(text)
    res.writeHead(200, ['Content-Type', 'image/png']);
    const buffer = await image.getBufferAsync(Jimp.MIME_PNG);
    res.end(Buffer.from(buffer));
})

async function textOverlay(text) {
    // Reading image
    const image = await Jimp.read('./tmp/IMG.jpg');
    // Defining the text font
    const font = await Jimp.loadFont(Jimp.FONT_SANS_64_BLACK);

    image.print(
        font,
        0,
        0,
        {
            text: text,
            alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
            alignmentY: Jimp.VERTICAL_ALIGN_TOP
        },
        image.getWidth(),
        image.getHeight()
    );
    console.log(image.getWidth())
    // Writing image after processing
    return image
}
module.exports = app