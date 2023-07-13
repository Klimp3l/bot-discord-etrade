/* eslint-disable comma-dangle */
/* eslint-disable indent */
const { SlashCommandBuilder, EmbedBuilder, MessageManager } = require('discord.js');
const { urlApiEtrade, urlWhatsEtrade } = require('../../config.json');
const utils = require('../../utils.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('trade')
		.setDescription('Selecione o trader, WIN ou LOSS, depois o horário e porcentagem operada.')
        .addIntegerOption(option =>
            option.setName('trader')
                .setDescription('Selecione o Trader')
                .setRequired(true)
				.setAutocomplete(true)
        )
        .addIntegerOption(option =>
            option.setName('tipo')
                .setDescription('Selecione WIN ou LOSS')
                .setRequired(true)
                .addChoices(
                    {
                        "value": 1,
                        "name": "WIN",
                    },
                    {
                        "value": 0,
                        "name": "LOSS",
                    }
                )
        )
        .addIntegerOption(option =>
            option.setName('hora')
                .setDescription('Digite o Horário')
                .setRequired(true)
                .setMinValue(0)
                .setMaxValue(23)
        )
        .addIntegerOption(option =>
            option.setName('minuto')
                .setDescription('Digite o minuto')
                .setRequired(true)
                .setMinValue(0)
                .setMaxValue(59)
        )
        .addNumberOption(option =>
            option.setName('porcentagem')
                .setDescription('Selecione a porcentagem operada')
                .setRequired(true)
                .addChoices(
                    {
                      "value": 0.5,
                      "name": "0,5%",
                    },
                    {
                      "value": 0.7,
                      "name": "0,7%",
                    },
                    {
                      "value": 1.0,
                      "name": "1%",
                    },
                    {
                      "value": 2.0,
                      "name": "2%",
                    }
                )
        ),
    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused();

        const choices = await fetch(`${urlApiEtrade}/traders`)
                .then(res => res.json())
                .then(data => data)
        
        const filtered = choices.filter(choice => choice.name.startsWith(focusedValue));
        
        await interaction.respond(
            filtered.map(choice => ({ name: choice.icon + ' ' + choice.name, value: choice.value })),
        );
    },
	async execute(interaction) {
        const trader = interaction.options.getInteger('trader');
        const hour = interaction.options.getInteger('hora');
        const minute = interaction.options.getInteger('minuto');
        const type = interaction.options.getInteger('tipo');
        const percentage = interaction.options.getNumber('porcentagem');

        const dataFormatada = utils.getDate();

        const details = {
            "idtrader": trader,
            "date": dataFormatada,
            "hour": hour,
            "minute": minute,
            "type": type,
            "percentage": percentage
        }

        // Salva o novo registro de log
        const response = await fetch(`${urlApiEtrade}/logtrade`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(details)
            })
            .then(res => res.json())
            .then(data => data);
        
        // Busca o placar
        const score = await fetch(`${urlApiEtrade}/scoreboard/${dataFormatada}`, {
                method: 'GET' 
            })
            .then(res => res.json())
            .then(data => data);

        // Monta a mensagem a ser enviada
        let message = "";
  
        for (let i=0; i < score.length; i++) {
            message += `${score[i].icon} ${score[i].name} ${score[i].trades.filter(x => x.type).length}x${score[i].trades.filter(x => !x.type).length}\n`;
            
            for (let j=0; j < score[i].trades.length; j++) {
            message += `${score[i].trades[j].type ? '✅' : '❌' } ${score[i].trades[j].hour.toString().padStart(2, '0')}:${score[i].trades[j].minute.toString().padStart(2, '0')} - ${score[i].trades[j].percentage}%\n`;
            }
            
            message += '\n';
        }

        const channel = interaction.client.channels.cache.get(`1125440639698489507`);

        const embed = new EmbedBuilder()
            .setTitle(`📌 Placar - ${utils.formatDate(dataFormatada)}`)
            .setDescription(message);
        
        const sentMessage = await channel.send({ embeds: [embed] });

        // Parâmetros opcionais para fetchMessages()
        const options = {
            limit: 1, // Limita o número de mensagens buscadas
            before: sentMessage.id, // Busca mensagens antes da mensagem atual
        };

        channel.messages.fetch(options)
            .then(res => res)
            .then(list => {
                const data = list.first();
                if (utils.getDate(data.createdTimestamp) == dataFormatada) {
                    try {
                        data.delete()
                    } catch (e) {
                        console.log('ERRO', e)
                    }
                    // setTimeout(() => channel.messages.delete(data.id), 1000);
                }
            })
            .catch(console.error);

        // Envia mensagem no whats
        // const detailsWhats = {
        //     "name": "Robô placar Etrade",
        //     "message": `📌 Placar - ${utils.formatDate(dataFormatada)}\n\n${message}`
        // }

        // await fetch(`${urlWhatsEtrade}/send-group-message`, {
        //         method: 'POST',
        //         headers: {
        //             'Content-Type': 'application/json'
        //         },
        //         body: JSON.stringify(detailsWhats)
        //     })
        //     .then(res => res.json())
        //     .then(data => data);

		await interaction.reply(`Confira os novos resultados no <#1125440639698489507>`);
	},
};