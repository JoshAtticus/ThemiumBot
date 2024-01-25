// @ts-nocheck
import Bot from "meowerbot";
import fetch from "node-fetch";
import * as dotenv from "dotenv";
import { exec } from "child_process";
import { existsSync, writeFile, unlink } from "fs";

import { log } from "../lib/logs.js";

dotenv.config();

const username = process.env["TMB_USERNAME"];
const password = process.env["TMB_PASSWORD"];
const sudoPassword = process.env["SUDO_PASSWORD"];
const updateFile = ".updating";
const restartFile = ".restarting";
const help: string[] = [
  "help",
  "create",
  "uptime",
  "about",
  "update",
  "restart",
];
const admins: string[] = ["JoshAtticus"];

async function startBot() {
  let startTime = new Date().getTime();
  try {
    const bot = new Bot();

    bot.onPost(async (user: string, message: string, origin: string | null) => {
      if (
        message.startsWith(`@${username} `) &&
        !help.includes(`${message.split(" ")[1]}`)
      ) {
        bot.post(
          `That command doesn't exist! Use @${username} help to see a list of commands.`,
          origin
        );
        log(
          `${user} tried to use a command that does not exist. The command was "${message}"`
        );
        return;
      }

      if (message.startsWith(`@${username} help`)) {
        bot.post(
          `Run @${username} create (theme style) to create a theme | Want to create themes faster with instant theme previews? Check out https://themium.joshatticus.online!`
        );
        log(`${user} used the command ${message}`);
      }

      if (message.startsWith(`@${username} create`)) {
        const themeName = message.split("create ")[1].trim();
        if (!themeName) {
          bot.post(
            "You need to provide a style for a theme. Use descriptive language about the colours and where you want them to be for better results.",
            origin
          );
          return;
        }

        bot.post(
          `Creating that theme... (this should only take up to 15 seconds!)`,
          origin
        );
        log(`${user} used the command ${message}`);

        const response = await fetch(
          "https://geminium.joshatticus.online/api/themium/generate",
          {
            method: "POST",
            body: JSON.stringify({
              style: themeName,
            }),
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        let themeData = await response.text();
        if (themeData.startsWith("output:")) {
          themeData = themeData.substring(7);
        }

        let parsedData;
        try {
          parsedData = JSON.parse(themeData);
        } catch (error) {
          console.error("Failed to parse JSON:", error);
          bot.post(
            "Failed to create the theme. Please try again later.",
            origin
          );
          return;
        }

        const minifiedJson = JSON.stringify(parsedData).replace(/\s+/g, "");

        bot.post(
          `Here's your theme!\n\n\`${minifiedJson}\`\n\nP.S. Want to create themes faster and see theme previews? Try https://themium.joshatticus.online`,
          origin
        );
      }

      if (message.startsWith(`@${username} uptime`)) {
        const currentTime = new Date().getTime();
        const uptimeInSeconds = Math.floor((currentTime - startTime) / 1000);

        const days = Math.floor(uptimeInSeconds / (3600 * 24));
        const months = Math.floor(days / 30);
        const remainingDays = days % 30;
        const hours = Math.floor((uptimeInSeconds % (3600 * 24)) / 3600);
        const minutes = Math.floor((uptimeInSeconds % 3600) / 60);
        const seconds = uptimeInSeconds % 60;

        let uptimeMessage = "The bot has been running for ";
        if (months > 0) {
          uptimeMessage += `${months} month${months > 1 ? "s" : ""} `;
        }
        if (remainingDays > 0) {
          uptimeMessage += `${remainingDays} day${
            remainingDays > 1 ? "s" : ""
          } `;
        }
        if (hours > 0) {
          uptimeMessage += `${hours} hour${hours > 1 ? "s" : ""} `;
        }
        if (minutes > 0) {
          uptimeMessage += `${minutes} minute${minutes > 1 ? "s" : ""} `;
        }
        uptimeMessage += `${seconds} second${seconds > 1 ? "s" : ""}.`;

        bot.post(uptimeMessage, origin);
        log(`${user} used the command ${message}`);
      }

      if (message.startsWith(`@${username} about`)) {
        bot.post(
          "This is a bot created by JoshAtticus. It can create themes based on a given style. For more information, visit https://themium.joshatticus.online.",
          origin
        );
        log(`${user} used the command ${message}`);
      }

      if (message.startsWith(`@${username} update`) && admins.includes(user)) {
        if (existsSync(updateFile)) {
          bot.post("Bot successfully updated and restarted.", origin);
          unlink(updateFile, (err) => {
            if (err) {
              console.error("Failed to delete the update file:", err);
            }
          });
        } else {
          bot.post("Updating the bot...", origin);
          log(`${user} used the command ${message}`);

          writeFile(updateFile, "", (err) => {
            if (err) {
              console.error("Failed to create the update file:", err);
              bot.post(
                "Failed to update the bot. Please try again later.",
                origin
              );
              return;
            }

            exec(
              "git config --global --add safe.directory /home/josh/ThemiumBot",
              (error, stdout, stderr) => {
                if (error) {
                  console.error("Failed to update the bot:", error);
                  bot.post(
                    "Failed to update the bot. Please try again later.",
                    origin
                  );
                  return;
                }

                exec(
                  "git pull",
                  { cwd: "/home/josh/ThemiumBot" },
                  (error, stdout, stderr) => {
                    if (error) {
                      console.error("Failed to update the bot:", error);
                      bot.post(
                        "Failed to update the bot. Please try again later.",
                        origin
                      );
                      return;
                    }

                    exec(
                      "systemctl restart themiumbot",
                      (error, stdout, stderr) => {
                        if (error) {
                          console.error("Failed to restart the bot:", error);
                          bot.post(
                            "Failed to restart the bot. Please try again later.",
                            origin
                          );
                          return;
                        }

                        bot.post(
                          "Bot successfully updated and restarted.",
                          origin
                        );
                      }
                    );
                  }
                );
              }
            );
          });
        }
      }

      if (message.startsWith(`@${username} restart`) && admins.includes(user)) {
        if (existsSync(restartFile)) {
          bot.post("Bot successfully restarted.", origin);
          unlink(restartFile, (err) => {
            if (err) {
              console.error("Failed to delete the restart file:", err);
            }
          });
        } else {
          bot.post("Restarting the bot...", origin);
          log(`${user} used the command ${message}`);

          writeFile(restartFile, "", (err) => {
            if (err) {
              console.error("Failed to create the restart file:", err);
              bot.post(
                "Failed to restart the bot. Please try again later.",
                origin
              );
              return;
            }

            exec("systemctl restart themiumbot", (error, stdout, stderr) => {
              if (error) {
                console.error("Failed to restart the bot:", error);
                bot.post(
                  "Failed to restart the bot. Please try again later.",
                  origin
                );
                return;
              }

              bot.post("Bot successfully restarted.", origin);
            });
          });
        }
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
      if (existsSync(updateFile)) {
        bot.post("Bot successfully updated and restarted.");
        unlink(updateFile, (err) => {
          if (err) {
            console.error("Failed to delete the update file:", err);
          }
        });
      }
      if (existsSync(restartFile)) {
        bot.post("Bot successfully restarted.");
        unlink(restartFile, (err) => {
          if (err) {
            console.error("Failed to delete the restart file:", err);
          }
        });
      }
    });

    bot.login(username, password);
  } catch (error) {
    console.error("An error occurred:", error);
    console.log("Restarting the bot...");
    startBot();
  }
}

startBot();
