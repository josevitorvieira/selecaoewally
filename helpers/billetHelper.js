
const verifyBilletNumber = (billetNumber) =>{
    if(isNaN(billetNumber) === true) return { status: 400, billetStatus: "Apenas números devem ser enviados na requisição" };
    return {status: 200};
}

const mountBarCodebancTitle = (billetNumber)=>{
                          
// 212 9 00011 9 / 2110001210 9 /  0447561740 5 / 9 / 75870000002000 = linha digitada
// 2129000119 21100012109 04475617405 9/ 75870000002000 = linha digitada
// 212 9 9 75870000002000 00011 2110001210 0447561740 = cod barras
//                    conv  comple  ag   conta    tipo carteira 
// 2129975870000002000 0001 1211000 1210 04475617 40

    const banc = recoveryInBilletNumber(billetNumber, 0,3);
    const coin = billetNumber.substr(3,1);
    const field1 = recoveryInBilletNumber(billetNumber, 4, 5);
    const verifyingDigit1 = recoveryInBilletNumber(billetNumber, 9, 1);
    
    const field2 = recoveryInBilletNumber(billetNumber, 10, 10);
    const verifyingDigit2 = recoveryInBilletNumber(billetNumber, 20, 1);
    
    const field3 = recoveryInBilletNumber(billetNumber, 21, 10);
    const verifyingDigit3 = recoveryInBilletNumber(billetNumber, 31, 1);
    
    const field4 = recoveryInBilletNumber(billetNumber, 32, 1);
    
    const field5 = recoveryInBilletNumber(billetNumber, 33,14);
    
    const expirationDate = recoveryInBilletNumber(field5, 0,4);
    
    const amount = recoveryInBilletNumber(field5, 4,10);
    

    const barCode = `${banc}${coin}${field4}${field5}${field1}${field2}${field3}`;
    // console.log('Codigo de barras: ' + barCode);

    return {
        barCode: barCode,
        fields: [
            { name: "field1", value: banc + coin + field1 },
            { name: "field2", value: field2 },
            { name: "field3", value: field3 },
        ],

        verifyingDigitsBilletNumber:[
            { name: "verifyingDigit1", value: +verifyingDigit1 },
            { name: "verifyingDigit2", value: +verifyingDigit2 },
            { name: "verifyingDigit3", value: +verifyingDigit3 },
            { name: "verifyingDigitBillet", value: +field4 }
        ],      
        expirationDate: expirationDate,
        amount: amount,
        field5: field5,
    };
}

const recoveryInBilletNumber = (billetNumber, index, charQuantity)=>{
    return billetNumber.substr(index,charQuantity);
}

const setMultiplier = (fields)=>{

    const fieldsData = fields.map((field)=>{        
        const fieldArray = field.value.split('');
        const reverseFieldArray = fieldArray.reverse();
        let multiplier = 2;
        
        const fieldMap = reverseFieldArray.map((value)=>{
            if(multiplier === 2){
                value = value * multiplier;
                multiplier = 1;
                return value;
            } else if(multiplier === 1){
                value = value * multiplier;
                multiplier = 2;
                return value;
            }              
        });
        field.value = fieldMap.reverse();
        console.log(field.value);
        return field;
    });

    return fieldsData;
}

const verifyMultipliedFieldData = (fieldArray)=>{

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

    fieldArray = fieldArray.map((field)=>{

        const verifiedMultiplication = field.value.map((value)=>{
            if(value > 9){    
                // const verifiedValue = verifyFieldValue(field);
                // return  verifiedValue;
                value = value.toString().split('');
                value = (+value[0]) + (+value[1]);                             
            }
            return value;     
        })
        // console.log("Mult Verif: " + verifiedMultiplication);
    
        const totalValue = verifiedMultiplication.reduce((acc, value)=> value + acc);
        // console.log("Valor Total: " + totalValue);
        field.value = totalValue
        return field;
        
    })

    return fieldArray;   
}

const subtractValue = (fieldDataArray)=>{

    fieldDataArray = fieldDataArray.map((fieldData)=>{
        // console.log("Field Data: " + fieldData);
        const rest = fieldData.value%10;
        let fieldDataArray =  fieldData.value.toString().split('');
        const valueForTen =  10 - (+fieldDataArray[1]);
        fieldData.value = fieldData.value + valueForTen;
        fieldData.value = fieldData.value - rest;
        fieldData.value = fieldData.value.toString().split('');
        const result = +fieldData.value[1];
        // console.log("result: " + result);
        fieldData.value = result;
        return fieldData;
    });

    return fieldDataArray;
}

const validateVerifyingDigits = (VerifyingDigitsCalculated, verifyingDigitsBilletNumber)=>{
    for (let index = 0; index < VerifyingDigitsCalculated.length; index++) {
        if(VerifyingDigitsCalculated[index].value !== verifyingDigitsBilletNumber[index].value){
            if(VerifyingDigitsCalculated[index].name === "digitCheckerBarCode" ){ 
                return { status: 400, billetStatus: "o digito verificador do codigo de barras calculado não confere com o enviado na requisição." }
            }
            return {status: 400, billetStatus: `o digito verificador do campo${index+1} calculado não confere com o enviado na requisição.` }
        } 
        
    }
    return {status: 200};
}

const calculateValueOfBillet = (amount)=>{
    amount = +amount;
    let amountLength = amount.toString().length;
    amountLength = +amountLength - 2
    amount = amount.toString();
    const totalValue = amount.substr(0,amountLength) + '.' + amount.substr(amountLength, 2);
    return totalValue;
}

const calculateexpirationDate = (billetNumber)=>{
    return "2022-01-25";
}

const calculateDigitCheckerBarcode = (barCode)=>{

    let operator = 2;
    let operatorArray = [];

    barcode = recoveryInBilletNumber(barCode, 0, 4) + recoveryInBilletNumber(barCode, 5, 39);
    barCode = barcode.split('');
    console.log("Bar Code N: " + barCode);
    
    barCode = barCode.reverse();
    console.log("Bar Code R: " + barCode);

    barCode = barCode.map((element) => {
        if(operator > 9) operator = 2;
        element = +element*operator;
        operatorArray.push(operator);
        operator++;
        return element;
    });
    console.log("Operator  : " + operatorArray);
    console.log("Bar Code M: " + barCode);

    barCode = barCode.reduce((acc, value)=> value + acc);
    
    console.log("Reduce: " + barCode);
    const rest = barCode%11;
    const totalValue = 11-rest;

    if(totalvalue === 10 || totalvalue === 11 || totalvalue === 0) totalValue = 1;

    return { name: "digitCheckerBarCode", value: totalValue };
}

module.exports = {
    verifyBilletNumber,
    calculateValueOfBillet,
    mountBarCodebancTitle,
    calculateexpirationDate,
    setMultiplier,
    verifyMultipliedFieldData,
    subtractValue,
    validateVerifyingDigits,
    calculateDigitCheckerBarcode

};

// 001 9 3 37370000000100 05009 4014481606 0680935031 = codigo de barras 44
// 001 9 05009 / 4014481606 / 0680935031 / 3 / 37370000000100 = liha digitavel 47

