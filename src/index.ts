// @ts-nocheck
import Bot from "meowerbot";
import fetch from "node-fetch";
import * as dotenv from "dotenv";

import { log } from "../lib/logs.js";

dotenv.config();

const username = process.env["TMB_USERNAME"];
const password = process.env["TMB_PASSWORD"];
let startTime = new Date().getTime();
const help: string[] = [
    "help",
    "create",
    "uptime",
    "about"
];
const admins: string[] = ["JoshAtticus"];

async function startBot() {
    try {
        const bot = new Bot();

        bot.onPost(async (user: string, message: string, origin: string | null) => {
            if (message.startsWith(`@${username} `) && !(help.includes(`${message.split(" ")[1]}`))) {
                bot.post(`That command doesn't exist! Use @${username} help to see a list of commands.`, origin);
                log(`${user} tried to use a command that does not exist. The command was "${message}"`);
                return;
            }

            if (message.startsWith(`@${username} help`)) {
                bot.post(`Run @${username} create (theme style) to create a theme | Want to create themes faster with instant theme previews? Check out https://themium.joshatticus.online!`)
                log(`${user} used the command ${message}`);
            }

            if (message.startsWith(`@${username} create`)) {
                const themeName = message.split("create ")[1].trim();
                if (!themeName) {
                    bot.post("You need to provide a style for a theme. Use descriptive language about the colours and where you want them to be for better results.", origin);
                    return;
                }

                bot.post(`Creating that theme... (this should only take up to 15 seconds!)`, origin);
                log(`${user} used the command ${message}`);

                const response = await fetch("https://themiumapi.joshatticus.online/generate-theme", {
                    method: "POST",
                    body: JSON.stringify({
                        style: themeName
                    }),
                    headers: {
                        "Content-Type": "application/json"
                    }
                });

                let themeData = await response.text();
                if (themeData.startsWith("output:")) {
                    themeData = themeData.substring(7);
                }

                let parsedData;
                try {
                    parsedData = JSON.parse(themeData);
                } catch (error) {
                    console.error("Failed to parse JSON:", error);
                    bot.post("Failed to create the theme. Please try again later.", origin);
                    return;
                }

                const minifiedJson = JSON.stringify(parsedData).replace(/\s+/g, "");

                bot.post(`Here's your theme!\n\n\`${minifiedJson}\`\n\nP.S. Want to create themes faster and see theme previews? Try https://themium.joshatticus.online`, origin);
            }

            if (message.startsWith(`@${username} uptime`)) {
                const currentTime = new Date().getTime();
                const seconds = Math.floor((currentTime - startTime) / 1000);
                bot.post(`The bot has been running for ${seconds} seconds.`, origin);
                log(`${user} used the command ${message}`);
            }

            if (message.startsWith(`@${username} about`)) {
                bot.post("ThemiumBot | Powered by Gemini Pro & Themium API | Created & Maintained by @JoshAtticus", origin);
                log(`${user} used the command ${message}`);
            }
        });

        bot.onMessage((messageData: string) => {
            console.log(`New message: ${messageData}`);
        });

        bot.onClose(() => {
            startBot();
        });

        bot.onLogin(() => {
            log(`Logged on as user ${username}`);
        });

        bot.login(username, password);
    } catch (error) {
        console.error("An error occurred:", error);
        console.log("Restarting the bot...");
        startBot();
    }
}

startBot();
