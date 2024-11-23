export function formatarData(data: string) {
  const [ano, mes, dia] = data?.split('-');
  const dataFormatada = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));

  const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
  const dataBrasileira = dataFormatada.toLocaleDateString('pt-BR');

  return dataBrasileira;
}
