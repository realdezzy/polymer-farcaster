import express from 'express';
import cors from 'cors';
import {
    useWriteContract,
} from "wagmi";

import nftAbi from "./abis/NftMinter.json"
import config from "./config.json"

const app = express();

const {writeContractAsync: write} = useWriteContract();

app.use(express.json());
app.use(cors({
    origin: '*'
}));

const port = 8080;


const metadata = {
    get : {
        button: "Mint",
        imageUrl: 'https://i.imgur.com/ETBYV5E.png',
        responseUrl: "http://polymer-farcaster.onrender.com:8080/frame"
    },
    postSuccess: {
        button: "",
        imageUrl: 'https://i.imgur.com/CNbjzZr.png',
        responseUrl: ""
    },
    postError : {
        button: "Retry",
        imageUrl: 'https://i.imgur.com/JYP5Afc.png',
        responseUrl: ""
    }
}


function frameGenerator(responseType) {
    const { button, imageUrl, responseUrl } = metadata[responseType];

    const html = `<!DOCTYPE html>
        <html>
            <head>
                <meta charset="utf-8">
                <title>Farcaster x PolymerLabs </title>
                <meta property="og:title" content="Mint on Polymer Testnet" />
                <meta property="og:image" content="${imageUrl}" />
                <meta property="fc:frame" content="vNext" />\n
                <meta name="fc:frame:image" content="${imageUrl}" />\n
                <meta name="fc:frame:button:1" content="${button}" />\n
                <meta name="fc:frame:button:1:post_url" content="${responseUrl}" /> \n
            </head>
            <body></body>
        </html>
    `;
    return html;
}

app.get('/frame', (req, res) => {

    res.status(200).send(frameGenerator("get"));
});

app.post('/frame', (req, res) => {

    try {
        write({
            address: config.sendUniversalPacket.base.portAddr,
            functionName: "crossChainMint",
            args: [config.sendUniversalPacket.optimism.portAddr, config.sendUniversalPacket.optimism.channelId, config.sendUniversalPacket.optimism.timeout]
        })
        res.status(200).send(frameGenerator("postSuccess"));
    } catch (error) {
        res.status(200).send(frameGenerator("postError"));
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

console.log(frameGenerator("get"))