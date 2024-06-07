const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const request = require('request');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cfx-finder')
        .setDescription('🚀  CFX-Finder to fetch IP etc.')
        .addStringOption(option =>
            option.setName('cfx')
                .setDescription('Put CFX ID\'et Her!')
                .setRequired(true)),
                async execute(interaction) {
                    try {
                        const cfx = interaction.options.getString('cfx');
                        request.get({
                            url: `https://servers-frontend.fivem.net/api/servers/single/${cfx}`,
                            json: true,
                            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:90.0) Gecko/20100101 Firefox/90.0' }
                        }, async (err, res, _data) => {
                            if (err) {
                                console.log('Error:', err);
                                return;
                            }  

                            // if the cfx ID isnt valid then return an error embed 
                            if (_data?.Data === undefined) {
                                const errorEmbed = new EmbedBuilder()
                                    .setColor(0x0099FF)
                                    .setTitle('> Finder - Ugyldigt ID 🚀')
                                    .setDescription('CFX\'et burde se sån her ud!\n\`\`\`5m5la7\`\`\`Du kan finde CFX ID\'et ved at søge på serveren [Her](https://servers.fivem.net/) Også klikke på den server du vil finde ID\'et på, Også kopiere ID\'et fra URL\'en!')
                                    .setTimestamp()
                                    .setFooter({ text: 'SpoxHub - CFX-Finder' });
                                interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                                return;
                            }

                            const data = _data['Data'];

                            const spillere = data?.clients;
                            const maxPlayers = data?.sv_maxclients; // get hostname
                            const hostname = data?.hostname;
                            const game = data?.gametype;
                            const ip = data?.connectEndPoints[0]; // in the ip after disconnect the last number is the port so new line with PORT: ${port}
                            const port = ip.split(':')[1]; // Total resources in the server 
                            const resources = data?.resources; // if a resource is named OneCode then const it
                            const onecode = resources.find(resource => resource === 'OneCode') ? 'Yes' : 'No'; 

                            let description = `**HOSTNAME:** ${hostname}\n**IP:** ${ip.replace(/:\d+$/, '')}\n**PORT:** ${port}\n**GAME:** ${game}\n**RESOURCES:** ${resources.length}\n**SPILLERE:** ${spillere}/${maxPlayers}\n\n**OneCode:** ${onecode}`; 

                description += ``;

                const aboutEmbed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle('> Cfx Finder 🚀')
                    .setDescription(description)
                    .setTimestamp()
                    .setFooter({ text: 'SpoxHub - CFX-Finder' }); // add a link button

                    const button = new ButtonBuilder()
                    .setStyle('5')
                    .setLabel('SERVER 🔍')
                    .setURL(`https://servers.fivem.net/servers/detail/${cfx}`);

                const row = new ActionRowBuilder()
                .addComponents(button);

                interaction.reply({ embeds: [aboutEmbed], components: [row], ephemeral: true});

            });
        } catch (error) {
            console.error('Error fetching player data:', error);
            interaction.reply({ content: 'There was an error fetching player data.', ephemeral: true });
        }
    }
};
