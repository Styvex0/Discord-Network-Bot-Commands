const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');
const ping = require('ping');

const cooldowns = {};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('🚀 IP Pinger - Returns ms of IP')
        .addStringOption(option =>
            option.setName('ip')
                .setDescription('Put IP\'en Her!')
                .setRequired(true)),
    async execute(interaction) {

        const member = interaction.member;
        const userId = member.id;
        const roleId = ''; // bypass cooldown role id

        const now = Date.now();
        const cooldownAmount = 5 * 1000; // 60 seconds in milliseconds

        // Check if the user has the cooldown bypass role
        const hasCooldownBypass = member.roles.cache.has(roleId);

        if (!hasCooldownBypass && cooldowns[userId] && (now - cooldowns[userId]) < cooldownAmount) {
            const timeLeft = ((cooldowns[userId] + cooldownAmount - now) / 1000).toFixed(1);
            return interaction.reply({ content: `Cooldown Please wait **${timeLeft}** Second(s) --> *Or buy V.I.P to bypass this cooldown!*`, ephemeral: true });
        }

        cooldowns[userId] = now;

        const ip = interaction.options.getString('ip');

        // Validate IP address format
        const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        if (!ipRegex.test(ip)) {
            return interaction.reply({ content: 'Invalid IP address format.', ephemeral: true });
        }

        try {
            const res = await ping.promise.probe(ip);

            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle('> Ping Result 🌐')
                .setDescription(res.alive 
                    ? `Connected to ${ip} Time: ${res.time}ms`
                    : `Ping to ${ip} failed. Host is unreachable.`)
                .setTimestamp()
                .setFooter({ text: 'P&S Bot - Ping' });

            interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (error) {
            console.error(`Error pinging IP: ${error}`);
            interaction.reply({ content: `Error pinging IP: ${error.message}`, ephemeral: true });
        }
    }
};
