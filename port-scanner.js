const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');
const net = require('net');

const cooldowns = {};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('port-scanner')
        .setDescription('🚀  Port Scanner to scan an IP for open ports')
        .addStringOption(option =>
            option.setName('ip')
                .setDescription('Put IP\'en Her!')
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

        const ip = interaction.options.getString('ip');

        // Validate IP address format
        const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        if (!ipRegex.test(ip)) {
            return interaction.reply({ content: 'Invalid IP address format.', ephemeral: true });
        }

        // Ports to scan
        const ports = [20, 21, 22, 23, 25, 53, 80, 110, 143, 443, 445, 3389];

        const scanPort = (ip, port) => {
            return new Promise((resolve) => {
                const socket = new net.Socket();
                let isOpen = false;

                socket.setTimeout(2000);
                socket.on('connect', () => {
                    isOpen = true;
                    socket.destroy();
                });
                socket.on('timeout', () => {
                    socket.destroy();
                });
                socket.on('error', () => {
                    socket.destroy();
                });
                socket.on('close', () => {
                    resolve({ port, isOpen });
                });

                socket.connect(port, ip);
            });
        };

        const scanPorts = async (ip, ports) => {
            const results = await Promise.all(ports.map(port => scanPort(ip, port)));
            return results.filter(result => result.isOpen).map(result => result.port);
        };

        try {
            const openPorts = await scanPorts(ip, ports);

            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle('> Port Scanner 🚀')
                .setDescription(openPorts.length > 0 ? `**IP Address:** \n > ${ip}\n\n**Open ports:**\n > ${openPorts.join(', ')}` : 'No Ports open - Port 53 & 80 can still be open!')
                .setTimestamp()
                .setFooter({ text: 'P&S Bot - Port Scanner' });

            interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (error) {
            console.error(`Error scanning ports: ${error}`);
            interaction.reply({ content: `Error scanning ports: ${error.message}`, ephemeral: true });
        }
    }
};
