
const verifyBilletNumber = (billetNumber) =>{
    return isNaN(billetNumber);
}

const mountBarCodebancTitle = (billetNumber)=>{

// 212 9 00011 9 / 2110001210 9 /  0447561740 5 / 9 / 75870000002000 = linha digitada
// 2129000119 21100012109 04475617405 9/ 75870000002000 = linha digitada
// 212 9 9 75870000002000 00011 2110001210 0447561740 = cod barras

    const banc = billetNumber.substr(0,3);
    // console.log('banc: ' + banc);

    //passar todos para essa função
    const banc2 = recoveryInBilletNumber(billetNumber, 0,3);
    // console.log('bank2: ' + banc2);

    const coin = billetNumber.substr(3,1);
    // console.log('coin: ' + coin);

    const bloco1 = billetNumber.substr(4,5);
    const verifyingDigit1 = billetNumber.substr(9,1);
    // console.log('bloco1: ' + bloco1);
    
    const bloco2 = billetNumber.substr(10,10);
    const verifyingDigit2 = billetNumber.substr(20,1);
    // console.log('bloco2: ' + bloco2);

    const bloco3 = billetNumber.substr(21,10);
    const verifyingDigit3 = billetNumber.substr(31,1);
    // console.log('bloco3: ' + bloco3);

    const bloco4 = billetNumber.substr(32,1);
    // console.log('bloco4: ' + bloco4);

    const bloco5 = billetNumber.substr(33,14);
    // console.log('bloco5: ' + bloco5);

    const barCode = `${banc}${coin}${bloco4}${bloco5}${bloco1}${bloco2}${bloco3}`;
    // console.log('Codigo de barras: ' + barCode);
    return {
        barCode: barCode,
        field1: banc + coin + bloco1,
        verifyingDigit1: verifyingDigit1,
        field2: bloco2,
        verifyingDigit2: verifyingDigit2,
        field3: bloco3,
        verifyingDigit3: verifyingDigit3,
        field4: bloco4,
        field5: bloco5
    };
}

const recoveryInBilletNumber = (billetNumber, index, charQuantity)=>{
    return billetNumber.substr(index,charQuantity);
}

const setMultiplier = (fieldData)=>{
    const fieldDataArray = fieldData.split('');
    const reverseFieldDataArray = fieldDataArray.reverse();
    // console.log("ReverseArray: " + reverseFieldDataArray);
    let multiplier = 2;
    
    const fieldMap = reverseFieldDataArray.map((field)=>{
        if(multiplier === 2){
            field = field * multiplier;
            multiplier = 1;
            return field;
        } else if(multiplier === 1){
            field = field * multiplier;
            multiplier = 2;
            return field;
        }              
    });
    // console.log("multiplier:   2,1,2,1,2,1,2,1,2");
    // console.log("Field Map   : " + fieldMap);
    
    fieldData = fieldMap.reverse();
    // console.log("FieldData: " + fieldData);

    return fieldData;
}

const verifyMultipliedFieldData = (fieldData)=>{

    // function verifyFieldValue(field){
    //     console.log("Entrou Verificacao");
    //     field = field.toString().split('');
    //     field = (+field[0]) + (+field[1]);
    //     if(field > 9){
    //         verifyFieldValue(field)
    //     }
    //     else{
    //         return field;  
    //     }
    // }
    
    const verifiedMultiplication = fieldData.map((field)=>{
        if(field > 9){    
            // const verifiedValue = verifyFieldValue(field);
            // return  verifiedValue;
            field = field.toString().split('');
            field = (+field[0]) + (+field[1]);                             
        }
        return field;     
    })
    // console.log("Mult Verif: " + verifiedMultiplication);

    const totalValue = verifiedMultiplication.reduce((acc, value)=> value + acc);
    // console.log("Valor Total: " + totalValue);

    return totalValue;
}

const subtractValue = (fieldData)=>{
    console.log("Field Data: " + fieldData);
    const rest = fieldData%10;
    let fieldDataArray =  fieldData.toString().split('');
    const valueForTen =  10 - (+fieldDataArray[1]);
    fieldData = fieldData + valueForTen;
    fieldData = fieldData - rest;
    fieldData = fieldData.toString().split('');
    const result = +fieldData[1];
    console.log("result: " + result);
    return result;

}

const calculateValueOfBillet = (billetNumber)=>{
    return "12.00";
}

const calculateexpirationDate = (billetNumber)=>{
    return "2022-01-25";
}

module.exports = {
    verifyBilletNumber,
    calculateValueOfBillet,
    mountBarCodebancTitle,
    calculateexpirationDate,
    setMultiplier,
    verifyMultipliedFieldData,
    subtractValue

};

// 001 9 3 37370000000100 05009 4014481606 0680935031 = codigo de barras 44
// 001 9 05009 / 4014481606 / 0680935031 / 3 / 37370000000100 = liha digitavel 47

