import dotenv from "dotenv"
dotenv.config()

import OpenAI from "openai";
import axios from "axios"

import { Telegraf } from 'telegraf';
import * as func from "./config.mjs"

(async () =>{
    const bot = new Telegraf(process.env.BOTKEY)
    bot.start(async(ctx) =>{
        const name = ctx.message.chat.first_name
        await ctx.reply(func.messageWelcome(name), { parse_mode: 'HTML' })
    })

    bot.command('imagine', async(ctx) =>{
        const text = ctx.message.text.trim()
        const message = text.replace('/','')
        await ctx.reply('Aguarde, estou imaginando...')
        let idMessage = ctx.message.message_id + 1
        const url = await generateImg(message)
        const dirImg = await imgDownload(url)
        await ctx.replyWithPhoto({source: dirImg})
        await ctx.reply('Imagem gerada com sucesso.')
        await ctx.telegram.deleteMessage(ctx.chat.id, idMessage)
    })
    bot.launch();
})()

async function generateImg(message) {
    try{
        const openai = new OpenAI( { apiKey: process.env.APIKEY } )
        const image = await openai.images.generate({ 
            prompt: message,
            model: "dall-e-3",
            n: 1,
            size: "1792x1024",
        });
        return image.data[0].url
    }catch(error){
        console.log('Erro ao gerar imagem', error)
    }
}

async function imgDownload(url){
    try {
        const response = await axios({
            method: 'GET',
            url: url,
            responseType: 'arraybuffer'
        })
        // const nameImg = Math.random() * 10
        // const arquivo = fs.createWriteStream(`./downloads/OpenAi${nameImg}.png`)
        // response.data.pipe(arquivo)
        return Buffer.from(response.data, 'binary');
    } catch (error) {
        console.log('Erro ao baixar imagem', error)
    }
}
