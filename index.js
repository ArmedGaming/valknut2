const Discord = require('discord.js');
const prefix = '!';
const bot = new Discord.Client();
const fs = require('fs');
const economy = require('discord-eco');
const YTDL = require('ytdl-core');
const http = require('http');
const express = require('express');
const app = express();

const modRole = 'ArmedGaming';

app.get("/", (request, response) => {
  console.log(Date.now() + " Ping Received");
  response.sendStatus(200);
});
app.listen(process.env.PORT);
setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 280000);

function play(connection, message) {

  var server = servers[message.guild.id];

  server.dispatcher = connection.playStream(YTDL(server.queue[0], {filter: "audioonly"}));

  server.queue.shift();

  server.dispatcher.on("end", function() {
    if(server.queue[0]) play(connection, message);
    else connection.disconnect();
  });
}

var servers = {};

economy.fetchBalance('userID').then((i) => {
  console.log(i) // { userID: '144645791145918464', money: 998, lastDaily: 'Not Collected' }
    console.log(i.money) // 998
});


bot.on("ready", function() {
  console.log(`Launched on ${bot.guilds.size} servers`);
  bot.user.setActivity("Do !help for a list of commands!")
});

bot.on('message', function(message) {

  if (message.author.equals(bot.user)) return;

  if(!message.content.startsWith(prefix)) return;
  let msg = message.content.toUpperCase();
  let cont = message.content.slice(prefix.length).split(" ");
  let args2 = cont.slice(1);
  let args3 = message.content.split(' ').slice(1);
  var args = message.content.substring(prefix.length).split(" ");
  var argsresult = args3.join(' ');
  let args4 = message.content.slice(prefix.length).trim().split(' ');
  let cmd = args4.shift().toLowerCase();

  try {
    let commandFile = require(`./commands/${cmd}.js`);
    commandFile.run(bot, message, args4);
  } catch (e) {
    console.log(e.message);
  } finally {
    console.log(`${message.author.tag} ran the command ${cmd}`);
  }

  switch (args[0]) {
    case "$":
      let user = message.mentions.users.first() || message.author;
      economy.fetchBalance(user.id).then((i) => {
      const embed = new Discord.RichEmbed()
        .setDescription("**" + user + "** has " + `${i.money} ` + " <:Megumin:432764143024734208>")
        .setColor(0x000000)
        message.channel.send(embed);
        })
      break;
    case "play":
      if (!args[1]) {
        var embed = new Discord.RichEmbed()
        .setTitle("ERROR:")
        .setDescription("Please provide a link!")
        .setColor(0xff0000)
        message.channel.send(embed);
        return;
      } 
      if(!message.member.voiceChannel) {
        var embed = new Discord.RichEmbed()
        .setTitle("ERROR:")
        .setDescription("You must be in a voice channel!")
        .setColor(0xff0000)
        message.channel.send(embed);
        return;
      }
      if(!servers[message.guild.id]) servers[message.guild.id] = {
        queue: []
      };

      var server = servers[message.guild.id];

      server.queue.push(args[1]);

      if (!message.guild.voiceConnection) message.member.voiceChannel.join().then(function(connection) {
        play(connection, message);
      var embed = new Discord.RichEmbed()
        .setDescription("Joined the voice channel!")
        .setColor(0x000000)
        message.channel.send(embed);
      });
      break;
    case "skip":
      var server = servers[message.guild.id];

      if(server.dispatcher) server.dispatcher.end();
      var embed = new Discord.RichEmbed()
        .setDescription("I have skipped the current song!")
        .setColor(0x000000)
        message.channel.send(embed);
      break;
    case "stop":
      var server = servers[message.guild.id];

      if(message.guild.voiceConnection) message.guild.voiceConnection.disconnect();
        var embed = new Discord.RichEmbed()
        .setDescription("Stopped playing and cleared the queue!")
        .setColor(0x000000)
        message.channel.send(embed);
      break;
}
});

bot.on('guildMemberAdd', function(member) {
  member.addRole(member.guild.roles.find('name', 'Member'));
});
  
bot.login(process.env.BOT_TOKEN);
