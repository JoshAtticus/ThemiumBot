// @ts-nocheck
import Bot from "meowerbot";
import fetch from "node-fetch";
import { exec } from "child_process";
import * as dotenv from "dotenv";
import JSONdb from "simple-json-db";

import { log } from "./../lib/logs.js";
import Wordle from "./../lib/wordle.js";
import { toRelative } from "./../lib/relative.js";

dotenv.config();

const username = process.env["MDW125_USERNAME"];
const password = process.env["MDW125_PASSWORD"];
const uptime: number = new Date().getTime();
const help: string[] = [
    `@${username} help`,
    `@${username} uptime`,
    `@${username} uwu`,
    `@${username} 8ball`,
    `@${username} zen`,
    `@${username} shorten`,
    `@${username} cat`,
    `@${username} status`,
    `@${username} credits`,
    `@${username} karma`,
    `@${username} mute`,
    `@${username} unmute`,
    `@${username} wordle`,
    `@${username} poll`
];
const admins: string[] = [
    "mdwalters",
    "m",
    "JoshAtticus",
    "AltJosh"
];
const db = new JSONdb("./../db.json");
const bot = new Bot(username, password);
const wordle = new Wordle();

if (!(db.has("MDW125-POLLS"))) {
    db.set("MDW125-POLLS", []);
}

bot.onPost(async (user: string, message: string, origin: string | null) => {
    if (message.startsWith(`@${username} `) && db.has(`MDW125-MUTED-${user}`)) {
        if (db.get(`MDW125-MUTED-${user}`)) {
            bot.post(`You are currently muted from ${username}.
Reason: "${db.get(`MDW125-MUTED-${user}`)}"`, origin);
            log(`${user} tried to use the command "${message}", but they are muted from ${username} for "${db.get(`MDW125-MUTED-${user}`)}"`);
        } else {
            bot.post(`You are currently muted from ${username}.`, origin);
            log(`${user} tried to use the command "${message}", but they are muted from ${username}`);
        }
        return;
    }

    if (message === `@${username}`) {
        return;
    }

    if (message.startsWith(`@${username} `) && !(help.includes(`@${username} ${message.split(" ")[1]}`))) {
        bot.post(`That command doesn't exist! Use @${username} help to see a list of commands.`, origin);
        log(`${user} tried to use a command that does not exist. The command was "${message}"`);
        return;
    }

    if (message.startsWith(`@${username} help`)) {
        if (message.split(" ")[2] === undefined) {
            bot.post(`Commands:
    ${help.join("\n    ")}`, origin);
        } else {
            if (message.split(" ")[2] === "help") {
                bot.post(`@${username} help:
    Shows you a list of commands.`, origin);
            } else if (message.split(" ")[2] === "uptime") {
                bot.post(`@${username} uptime:
    Shows you how long the bot was online for.`, origin);
            } else if (message.split(" ")[2] === "uwu") {
                bot.post(`@${username} uwu:
    Posts "UwU".`, origin);
            } else if (message.split(" ")[2] === "8ball") {
                bot.post(`@${username} 8ball:
    Makes a prediction.`, origin);
            } else if (message.split(" ")[2] === "zen") {
                bot.post(`@${username} zen:
    Posts zen quotes from GitHub's API.`, origin);
            } else if (message.split(" ")[2] === "shorten") {
                bot.post(`@${username} shorten:
    Shortens links via shortco.de's API.`, origin);
            } else if (message.split(" ")[2] === "zen") {
                bot.post(`@${username} cat:
    Posts random cat pictures.`, origin);
            } else if (message.split(" ")[2] === "zen") {
                bot.post(`@${username} status:
    Lets you view, and set a status.`, origin);
            } else if (message.split(" ")[2] === "credits") {
                bot.post(`@${username} credits:
    Lists everyone behind ${username}!`, origin);
            } else if (message.split(" ")[2] === "karma") {
                bot.post(`@${username} karma:
    Upvote, downvote, and view someone's karma.`, origin);
            } else if (message.split(" ")[2] === "mute") {
                bot.post(`@${username} mute:
    Mutes the specified user. Must be a bot admin to do this.`, origin);
            } else if (message.split(" ")[2] === "unmute") {
                bot.post(`@${username} unmute:
    Unmutes the specified user. Must be a bot admin to do this.`, origin);
            } else if (message.split(" ")[2] === "wordle") {
                bot.post(`@${username} wordle:
    Lets you play wordle.`, origin);
            } else if (message.split(" ")[2] === "poll") {
                bot.post(`@${username} poll:
    Create and answer polls.`, origin);
            } else {
                bot.post("This command doesn't exist!", origin);
                log(`${user} tried to get help on a command that does not exist. The command was "${message}"`);
            }
        }
    }

    if (message.startsWith(`@${username} uptime`)) {
        bot.post(`${username} was online since ${toRelative(uptime)}.`, origin);
        log(`${user} used the command ${message}`);
    }

    if (message.startsWith(`@${username} uwu`)) {
        bot.post("UwU", origin);
        log(`${user} used the command ${message}`);
    }

    if (message.startsWith(`@${username} 8ball`)) {
        let eightBall: string[] = ["It is certain.", "It is decidedly so.", "Without a doubt.", "Yes, definitely.", "You may rely on it.", "As I see it, yes.", "Most likely.", "Outlook good.", "Yes.", "Signs point to yes.", "Reply hazy, try again.", "Ask again later.", "Better not tell you now.", "Cannot predict now.", "Concentrate and ask again.", "Don't count on it.", "My reply is no.", "My sources say no.", "Outlook not so good.", "Very doubtful."];
    	bot.post(eightBall[Math.floor(Math.random() * eightBall.length)], origin);
        log(`${user} used the command ${message}`);
    }

    if (message.startsWith(`@${username} zen`)) {
        bot.post(await fetch("https://api.github.com/zen").then(res => res.text()), origin);
        log(`${user} used the command ${message}`);
    }

    if (message.startsWith(`@${username} shorten`)) {
        if (message.split(" ")[2] === undefined) {
            bot.post("You need to specify a website to shorten!", origin);
            log(`${user} used the command ${message}`);
        } else {
            let link: Object = await fetch(`https://api.shrtco.de/v2/shorten?url=${message.split(" ")[2]}`).then(res => res.json());
            bot.post(link.result.full_short_link, origin);
            log(`${user} used the command ${message}`);
        }
    }

    if (message.startsWith(`@${username} cat`)) {
        let image: Object = await fetch("https://aws.random.cat/meow").then(res => res.json());
        bot.post(`[Random cat image: ${image.file}]`, origin);
        log(`${user} used the command ${message}`);
    }

    if (message.startsWith(`@${username} status`)) {
        if (message.split(" ")[2] === "set") {
            db.set(`MDW125-STATUS-${user}`, message.split(" ").slice(3, message.split(" ").length).join(" "));
            bot.post("Status successfully set!", origin);
            log(`${user} set their status with the command "${message}"`);
        } else if (message.split(" ")[2] === "clear") {
            db.delete(`MDW125-STATUS-${user}`);
            bot.post("Status successfully cleared!", origin);
            log(`${user} cleared their status with the command "${message}"`);
        } else if (message.split(" ")[2] === "view") {
            if (message.split(" ")[3] === user) {
                if (!(db.has(`MDW125-STATUS-${user}`))) {
                    bot.post(`You don't have a status set. To set one, use @${username} status set [message].`, origin);
                    log(`${user} tried to view their status, but they don't have one set. They used the command "[message]"`);
                } else {
                    bot.post(`Your status:
    ${db.get("MDW125-STATUS-" + user)}`, origin);
                    log(`${user} viewed their status with the command "${message}"`);
                }
            } else {
                if (db.has(`MDW125-STATUS-${user}`)) {
                    bot.post(`@${message.split(" ")[2]}'s status:
    ${db.get("MDW125-STATUS-" + message.split(" ")[3])}`, origin);
                    log(`${user} viewed someone else's status with the command "${message}"`);
                } else {
                    bot.post(`@${message.split(" ")[3]} doesn't have a status set.`, origin);
                    log(`${user} + " tried to view someone else's status, but they don't have one set. They used the command "${message}"`);
                }
            }    
        } else {
            if (!(db.has(`MDW125-STATUS-${user}`))) {
                bot.post("You don't have a status set. To set one, use ~status set [message].", origin);
                log(`${user} tried to view their status, but they don't have one set. They used the command "${message}"`);
            } else {
                bot.post(`Your status:
    ${db.get("MDW125-STATUS-" + user)}`, origin);
                log(`${user} viewed their status with the command "${message}"`);
            }
        }
    }

    if (message.startsWith(`@${username} credits`)) {
    	bot.post(`Creator: M.D. Walters
Hosting: M.D. Walters (MDWalters125), JoshAtticus (MDBot)
Bot Library: MeowerBot.js`, origin);
        log(`${user} used the command ${message}`);
    }

    if (message.startsWith(`@${username} karma`)) {
    	if (message.split(" ")[2] === "upvote") {
            if (!(db.has(`MDW125-KARMA-${message.split(" ")[3]}`))) {
                if (message.split(" ")[3] === user) {
                    bot.post("You can't upvote yourself!", origin);
                    log(`${user} tried to upvote themselves unsucessfully with the command ${message}`);
                } else {
                    db.set(`MDW125-KARMA-${message.split(" ")[3]}`, 1);
                    bot.post(`Successfully upvoted @${message.split(" ")[3]}! They now have 1 karma.`, origin);
                    log(`${user} upvoted someone with the command "${message}"`);
                }
            } else {
                if (message.split(" ")[3] === user) {
                    bot.post("You can't upvote yourself!", origin);
                    log(`${user} tried to upvote themselves unsucessfully with the command ${message}`);
                } else {
                    db.set(`MDW125-KARMA-${message.split(" ")[3]}`, (parseInt(db.get(`MDW125-KARMA-${message.split(" ")[3]}`)) + 1));
                    bot.post(`Successfully upvoted @${message.split(" ")[3]}! They now have ${db.get("MDW125-KARMA-" + message.split(" ")[3])} karma.`, origin);
                    log(`${user} upvoted someone with the command "${message}"`);
                }
            }
        } else if (message.split(" ")[2] === "downvote") {
            if (!(db.has(`MDW125-KARMA-${message.split(" ")[3]}`))) {
                if (message.split(" ")[3] === user) {
                    bot.post("You can't downvote yourself!", origin);
                    log(`${user} tried to downvote themselves unsucessfully with the command "${message}"`);
                } else {
                    db.set(`MDW125-KARMA-${message.split(" ")[3]}`, -1);
                    bot.post(`Successfully downvoted @${message.split(" ")[3]}. They now have -1 karma.`, origin);
                    log(`${user} downvoted someone with the command "${message}"`);
                }
            } else {
                if (message.split(" ")[3] === user) {
                    bot.post("You can't downvote yourself!", origin);
                    log(`${user} tried to downvote themselves unsucessfully with the command "${message}"`);
                } else {
                    db.set(`MDW125-KARMA-${message.split(" ")[3]}`, (parseInt(db.get(`MDW125-KARMA-${message.split(" ")[3]}`)) - 1));
                    bot.post(`Successfully downvoted @${message.split(" ")[3]}! They now have ${db.get("MDW125-KARMA-" + message.split(" ")[3])} karma.`, origin);
                    log(`${user} downvoted someone with the command "${message}"`);
                }
            }
        } else if (message.split(" ")[2] === "view") {
            if (message.split(" ")[3] === user) {
                if (!(db.has(`MDW125-KARMA-${user}`))) {
                    bot.post(`You have 0 karma.`, origin);
                    log(`${user} viewed their 0 karma with the command "${message}"`);
                } else {
                    bot.post(`You have ${db.get("MDW125-KARMA-" + user)} karma.`, origin);
                    log(`${user} viewed their karma with the command "${message}"`);
                }
            } else {
                if (!(db.has(`MDW125-KARMA-${message.split(" ")[3]}`))) {
                    bot.post(`@${message.split(" ")[3]} has 0 karma.`, origin);
                    log(`${user} viewed someone else's 0 karma with the command "${message}"`);
                } else {
                    bot.post(`@${message.split(" ")[3]} has ${db.get("MDW125-KARMA-" + message.split(" ")[3])} karma.`, origin);
                    log(`${user} viewed someone else's karma with the command "${message}"`);
                }
            }
        } else {
            if (!(db.has(`MDW125-KARMA-${user}`))) {
                bot.post(`You have 0 karma.`, origin);
                log(`${user} viewed their 0 karma with the command "${message}"`);
            } else {
                bot.post(`You have ${db.get("MDW125-KARMA-" + user)} karma.`, origin);
                log(`${user} viewed their karma with the command "${message}"`);
            }
        }
    }

    if (message.startsWith(`@${username} mute`)) {
        if (admins.includes(user)) {
            if (db.has(`MDW125-MUTED-${message.split(" ")[2]}`)) {
                bot.post(`@${message.split(" ")[2]} is already muted!`, origin);
                log(`${user} tried to mute someone, but they are already muted. They used the command "${message}"`);
            } else {
                if (message.split(" ")[2]) {
                    db.set(`MDW125-MUTED-${message.split(" ")[2]}`, message.split(" ").slice(3, message.split(" ").length).join(" "));
                } else {
                    db.set(`MDW125-MUTED-${message.split(" ")[2]}`, null);
                }
                bot.post(`Successfully muted @${message.split(" ")[2]}!`, origin);
                log(`${user} muted someone with the command "${message}"`);
            }
        } else {
            bot.post("You don't have the permissions to run this command.", origin);
            log(`${user} tried to mute someone, but they didn't have permission to do so. They used the command "${message}"`);
        }
    }

    if (message.startsWith(`@${username} unmute`)) {
        if (admins.includes(user)) {
            if (!(db.has(`MDW125-MUTED-${message.split(" ")[2]}`))) {
                bot.post(`@${message.split(" ")[2]} isn't muted!`, origin);
                log(`${user} tried to unmute someone, but they weren't muted. They used the command "${message}"`);
            } else {
                db.delete(`MDW125-MUTED-${message.split(" ")[2]}`);
                bot.post(`Successfully unmuted @${message.split(" ")[2]}!`, origin);
                log(`${user} unmuted someone with the command "${message}"`);
            }
        } else {
            bot.post("You don't have the permissions to run this command.", origin);
            log(`${user} tried to unmute someone, but they didn't have permission to do so. They used the command "${message}"`);
        }
    }

    if (message.startsWith(`@${username} wordle`)) {
        if (message.split(" ")[2] === "new") {
            wordle.init();
            bot.post(`New Wordle game started! Use @${username} wordle guess [word] to guess a word.`, origin);
            log(`${user} started a Wordle game with the command "${message}"`);
        } else if (message.split(" ")[2] === "guess") {
            try {
                wordle.guess(message.split(" ")[3]);
                bot.post(`${wordle.grid[0].join("")}
${wordle.grid[1].join("")}
${wordle.grid[2].join("")}
${wordle.grid[3].join("")}
${wordle.grid[4].join("")}
${wordle.grid[5].join("")}          
`, origin);
            } catch(e) {
                bot.post(`${e}`, origin);
            }
        } else if (message.split(" ")[3] === "grid") {
            bot.post(`${wordle.grid[0].join("")}
${wordle.grid[1].join("")} 
${wordle.grid[2].join("")}
${wordle.grid[3].join("")}
${wordle.grid[4].join("")}
${wordle.grid[5].join("")}          
`, origin);
        }
    }

    if (message.startsWith(`@${username} poll`)) {
        if (message.split(" ")[2] === "new") {
            let polls: Object[] = db.get("MDW125-POLLS");
            polls.push({ "question": message.split(" ").slice(3, message.split(" ").length).join(" "), "id": polls.length + 1, "answers": [], "username": user });
            db.set("MDW125-POLLS", polls);
            bot.post(`Succesfully created new poll! For others to answer this poll, use @${username} poll ${polls.length} [answer].`, origin);
            log(`${user} created a new poll with the command "${message}"`);
        } else if (message.split(" ")[2] === "answer") {
            let polls: Object[] = db.get("MDW125-POLLS");
            if (user == polls[message.split(" ")[3] - 1].username) {
                bot.post("You can't answer a poll you made!", origin);
                log(`${user} tried to answer a poll they created with the command "${message}"`);
            } else if (polls[message.split(" ")[3] - 1] == undefined) {
                bot.post("This poll doesn't exist!");
            } else {
                polls[message.split(" ")[3] - 1].answers.push({ "username": user, "answer": message.split(" ").slice(4, message.split(" ").length).join(" ") });
                db.set("MDW125-POLLS", polls);
                bot.post("Successfully answered poll!", origin);
                log(`${user} answered a poll with the command "${message}"`);
            }
        } else {
            let polls: Object[] = db.get("MDW125-POLLS");

            for (let i in polls) {
                if (polls[i].username == user) {
                    polls.splice(i, 1);
                }
            }

            let randomPoll = polls[Math.floor(Math.random() * polls.length)];

            try {
                bot.post(`Random poll: ${randomPoll.question}
    To answer this poll, use @${username} poll answer ${randomPoll.id} [answer].`, origin);
                log(`${user} found a random poll with the command "${message}"`);
            } catch(e) {
                bot.post(`There are no polls to answer! Check back later or create a poll with ${username} poll new [poll].`, origin);
            }
        }
    }
});

bot.onMessage((messageData: string) => {
    console.log(`New message: ${messageData}`);
});

bot.onClose(() => {
    let command = exec("npm run start");
    command.stdout.on("data", (output) => {
        console.log(output.toString());
    });
});

bot.onLogin(() => {
    log(`Logged on as user ${username}`);
    bot.post(`${username} is now online! Use @${username} help to see a list of commands.`);
});

