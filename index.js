const qrcode = require("qrcode-terminal");
const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const fetch = require("cross-fetch");

// Manages authentication under the hood.
const client = new Client({
  authStrategy: new LocalAuth(),
});

// Sets up events and requirements, kicks off authentication request
client.initialize();

//Generating qr to show in terminal 
client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("authenticated", () => {
  console.log("AUTHENTICATED");
});

client.on("ready", () => {
  console.log("Client is ready!");
});

client.on("message", async (message) => {
  if (message.body.toLowerCase() === "meme") {
    
    try {
      //get media from url
      // endpoint below provides random meme on each request.
      const res = await fetch("https://meme-api.herokuapp.com/gimme");

      if (res.status >= 400) {
        throw new Error("Bad response from server");
      }
      // Convert response into json()
      let jsonRes = await res.json();
      const extractedMeme =
        (await jsonRes?.preview[3]) ||
        jsonRes?.preview[2] ||
        jsonRes?.preview[1];
      const memeTitle = await jsonRes?.title;
      const media = await MessageMedia.fromUrl(extractedMeme);

      //replying with media
      client.sendMessage(message.from, media, {
        caption: memeTitle,
      });
    } catch (err) {
      console.error(err);
    }
  }
});
