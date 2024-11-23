interface CalcBasePrice {
  type: string,
  month: string,
  guests: number,
  perPersonPrice: number,
}

export function calcBasePrice(
  {guests,month,perPersonPrice,type}:CalcBasePrice
) {
  if (type === "EVENT") {
    let result = 0;

    if(guests < 25){

      if(month === "12"){
        return 3750
      }

      return 2500
    }else{
      if(month === "12"){
        const pessoasMais25 = guests  * 150

        return pessoasMais25
      }

      const pessoasMais25 = guests * perPersonPrice

      return pessoasMais25
    }
  }

  if (type === "PRODUCTION") {
    if(guests < 15){
      return 1500
    }else{
      const pessoasMais25 = (guests - 15) * 50

      return 1500 + pessoasMais25
    }
  }

  return 0
}
