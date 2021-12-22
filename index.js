const { Client, Intents } = require("discord.js")
// const ytdl = require("ytdl-core"); //Use this if you wanna play youtube links!
//Example:  createAudioResource(ytdl("https://youtu.be/JNl1_hRwpXE", { highWaterMark: 1024* 1024* 64,quality: "highestaudio"}), { inlineVoluem: true})
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require("@discordjs/voice");
//WE ALSO NEED:    npm i  libsodium-wrappers    and    npm i @discordjs/opus    for playing audio!
const client = new Client({
    shards: "auto", //1700+ servers
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_VOICE_STATES
    ]
})
//Login to the Bot
client.login(require("./config.json").token);
//an array of all channels can be a database output too!
const Channels = require("./config.json").VC_channels;
//Once the bot is ready join all channels and play the audio
client.on("ready", async () => {
    for(const channelId of Channels){
        joinChannel(channelId);
        //wait 500ms        
        await new Promise(res => setTimeout(() => res(2), 500))
    }

    function joinChannel(channelId) {
        client.channels.fetch(channelId).then(channel => {
            //JOIN THE VC AND PLAY AUDIO
            const VoiceConnection = joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guild.id,
                adapterCreator: channel.guild.voiceAdapterCreator
            });
            //use a: direct mp3 link / file / const ytdl = require("ytdl-core"); ytdl("https://youtu.be/dQw4w9WgXcQ")
            const resource = createAudioResource("https://streams.ilovemusic.de/iloveradio109.mp3", {
                inlineVolume: true
            });
            resource.volume.setVolume(0.2);
            const player = createAudioPlayer()
            VoiceConnection.subscribe(player);
            player.play(resource);
            player.on("idle", () => {
                try{
                    player.stop()
                } catch (e) { }
                try{
                    VoiceConnection.destroy()
                } catch (e) { }
                joinChannel(channel.id)
            })
        }).catch(console.error)
    }
})

client.on("voiceStateUpdate", async (oldState, newState) => {
    if(newState.channelId && newState.channel.type === "GUILD_STAGE_VOICE" && newState.guild.me.voice.suppress) {
        try{
            await newState.guild.me.voice.setSuppressed(false)
        }catch (e) {

        }
    }
})
