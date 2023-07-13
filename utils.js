function getDate(date) {
    // Store for in-progress games. In production, you'd want to use a DB
    const dataAtual = date ? new Date(date) : new Date();

    const mes = String(dataAtual.getMonth() + 1).padStart(2, '0'); // Obter o mês (lembrando que os meses começam em 0)
    const dia = String(dataAtual.getDate()).padStart(2, '0'); // Obter o dia
    const ano = String(dataAtual.getFullYear()); // Obter o ano

    return `${ano}-${mes}-${dia}`;
}

function formatDate(dataStr) {
    // Criar um objeto Date com a string de data
    var partesData = dataStr.split('-');

    // Obtendo os componentes da data
    var ano = parseInt(partesData[0]);
    var mes = parseInt(partesData[1]) - 1; // Os meses são indexados a partir de 0 (janeiro = 0)
    var dia = parseInt(partesData[2]);

    // Criando o objeto Date
    var data = new Date(ano, mes, dia);

    // Obter o dia do mês e adicionar o zero à esquerda, se necessário
    var dia = ("0" + data.getDate()).slice(-2);
    
    // Obter o mês e adicionar o zero à esquerda, se necessário
    var mes = ("0" + (data.getMonth() + 1)).slice(-2);
    
    // Formatar a data para "dd/MM"
    var dataFormatada = dia + "/" + mes;
    
    // Obter o dia da semana
    var diasSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    var diaSemana = diasSemana[data.getDay()];

    // Retornar a data formatada e o dia da semana
    return dataFormatada + " (" + diaSemana + ")";
}
  
module.exports = {
    getDate, formatDate
};