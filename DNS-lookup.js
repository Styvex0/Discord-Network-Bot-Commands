const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');
const dns = require('dns').promises;

const cooldowns = {};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dns-lookup')
        .setDescription('🚀 Perform a DNS lookup for a domain')
        .addStringOption(option =>
            option.setName('domain')
                .setDescription('The domain to look up')
                .setRequired(true)),
    async execute(interaction) {

        
        const member = interaction.member;
        const userId = member.id;
        const roleId = ''; // bypass cooldown role id

        const now = Date.now();
        const cooldownAmount = 30 * 1000; // 60 seconds in milliseconds

        // Check if the user has the cooldown bypass role
        const hasCooldownBypass = member.roles.cache.has(roleId);

        if (!hasCooldownBypass && cooldowns[userId] && (now - cooldowns[userId]) < cooldownAmount) {
            const timeLeft = ((cooldowns[userId] + cooldownAmount - now) / 1000).toFixed(1);
            return interaction.reply({ content: `Cooldown Please wait **${timeLeft}** Second(s) --> *Or buy V.I.P to bypass this cooldown!*`, ephemeral: true });
        }

        cooldowns[userId] = now;

        const domain = interaction.options.getString('domain');

        try {
            const addresses = await dns.resolve4(domain);
            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle('> DNS Lookup 🔍')
                .setDescription(`IP addresses for ${domain}: ${addresses.join(', ')}`)
                .setTimestamp()
                .setFooter({ text: 'SpoxHub - DNS Lookup' });

            interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (error) {
            console.error(`DNS lookup error: ${error}`);
            interaction.reply({ content: `Error performing DNS lookup: ${error.message}`, ephemeral: true });
        }
    }
};
