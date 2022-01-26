const basicHelper = require('../helpers/basicHelper');

const mountBarCodebankTitle = (billetNumber)=>{
                          
// 212 9 00011 9 / 2110001210 9 /  0447561740 5 / 9 / 75870000002000 = linha digitada
// 2129000119 21100012109 04475617405 9/ 75870000002000 = linha digitada
// 212 9 9 75870000002000 00011 2110001210 0447561740 = cod barras
//                    conv  comple  ag   conta    tipo carteira 
// 2129975870000002000 0001 1211000 1210 04475617 40

    const bank = basicHelper.splitString(billetNumber, 0,3);
    const currency = basicHelper.splitString(billetNumber, 3,1);
    const field1 = basicHelper.splitString(billetNumber, 4, 5);
    const verifyingDigit1 = basicHelper.splitString(billetNumber, 9, 1);
    
    const field2 = basicHelper.splitString(billetNumber, 10, 10);
    const verifyingDigit2 = basicHelper.splitString(billetNumber, 20, 1);
    
    const field3 = basicHelper.splitString(billetNumber, 21, 10);
    const verifyingDigit3 = basicHelper.splitString(billetNumber, 31, 1);
    
    const field4 = basicHelper.splitString(billetNumber, 32, 1);
    
    const field5 = basicHelper.splitString(billetNumber, 33,14);
    
    const expirationDate = basicHelper.splitString(field5, 0,4);
    
    const amount = basicHelper.splitString(field5, 4,10);
    
    const barCode = `${bank}${currency}${field4}${field5}${field1}${field2}${field3}`;

    const barCodeAux = basicHelper.splitString(barCode, 0, 4) + basicHelper.splitString(barCode, 5, 39);
    
    return {
        barCode: barCode,
        fields: [
            { name: "Campo1", value: bank + currency + field1 },
            { name: "Campo2", value: field2 },
            { name: "Campo3", value: field3 },
            { name: "barCodeAux", value: barCodeAux }
        ],

        checkDigits:[
            { name: "verifyingDigit1", value: +verifyingDigit1 },
            { name: "verifyingDigit2", value: +verifyingDigit2 },
            { name: "verifyingDigit3", value: +verifyingDigit3 },            
            { name: "digitCheckerBarCode", value: +field4 }
        ],

        expirationDate: expirationDate,
        amount: amount,
        field5: field5,
    };
}

const mountBarCodeConcessionaire = (billetNumber)=>{

    // modulo 10 ou 11 dependendo da moeda escolhida
    //16 à 19 identificação da Empresa/Órgão
    //data de vencimento (AAAAMMDD), incluir nas 8 primeiras posições do campo livre
    // posição 3 = val 6 e 7 = modulo 10 || val 8 e 9 = modulo 11
    // posição 3 = valor efetivo = valor cobrado
    // posição 3 = valor referência = quantidade de moeda || zeros || valor a ser reajustado por um índice

    //modulo 10 se o resto for 0 o dv é 0

    // Modulo 11 Quando o resto da divisão for igual a 0 ou 1, atribuí-se ao DV o digito “0”, e quando for 10, atribuíse ao DV o digito “1”
    // 0         11 12        23 24        35 36        47
    // 846700000017 435900240209 024050002435 842210108119
    // 8 4 6 7 0000001 7 / 43590024020 9 / 02405000243 5 / 84221010811 9
    // 8 4 6 7 0000001 / 4359002402 / 002405000243 / 84221010811
    //84670000001 4359002402 002405000243 84221010811
    
    const field1 = basicHelper.splitString(billetNumber, 0, 11);
    const checkDigit1 = basicHelper.splitString(billetNumber, 11, 1);
    
    const field2 = basicHelper.splitString(billetNumber, 12, 11);
    const checkDigit2 = basicHelper.splitString(billetNumber, 23, 1);
    
    const field3 = basicHelper.splitString(billetNumber, 24, 11);
    const checkDigit3 = basicHelper.splitString(billetNumber, 35, 1);
    
    const field4 = basicHelper.splitString(billetNumber, 36, 11);
    const checkDigit4 = basicHelper.splitString(billetNumber, 47, 1);
    
    const checkDigitBarCode = basicHelper.splitString(billetNumber, 3,1);

    const currency = basicHelper.splitString(billetNumber, 2,1);
        
    const barCode = `${field1}${field2}${field3}${field4}`;

    const amount = basicHelper.splitString(barCode, 4,11);
    
    const barCodeAux = basicHelper.splitString(barCode, 0, 3) + basicHelper.splitString(barCode, 4, 40);
    
    return {
        barCode: barCode,
        fields: [
            { name: "Campo1", value: field1 },
            { name: "Campo2", value: field2 },
            { name: "Campo3", value: field3 },
            { name: "Campo4", value: field4 },
            { name: "barCodeAux", value: barCodeAux },
        ],

        checkDigits:[
            { name: "checkDigit1", value: +checkDigit1 },
            { name: "checkDigit2", value: +checkDigit2 },
            { name: "checkDigit3", value: +checkDigit3 },            
            { name: "checkDigit4", value: +checkDigit4 },
            { name: "digitCheckerBarCode", value: +checkDigitBarCode }
        ],
        
        currency: currency,
        amount: amount,          
    };
}

const validateVerifyingDigits = (digitCheckerCalculated, verifyingDigitsBilletNumber)=>{
    
    for (let index = 0; index < digitCheckerCalculated.length; index++) {
        
        if(digitCheckerCalculated[index].value !== verifyingDigitsBilletNumber[index].value){

            switch(digitCheckerCalculated[index].name){
                case "digitCheckerBarCode":
                    return { status: 400, billetStatus: "o digito verificador do codigo de barras enviado na requisição não confere com calculado." }
                    break;
                default:
                    return {status: 400, billetStatus: `o digito verificador do ${digitCheckerCalculated[index].name} enviado na requisição não confere com o calculado.` }    
                    break;    
            }
        }         
    }
    return {status: 200};
}

const calculateValueOfBillet = (amount)=>{
    if(+amount === 0) return '';

    const amountArray = amount.split('');
    
    for (let index = 0; index < amountArray.length; index++) {
        if(amount[index] !== '0'){
            amount = amount.substr(index);
            break;    
        }                    
    }

    switch(amount.length){
        case 1:
            amount = `00.0${amount}`
            break;

        case 2: 
            amount = `00.${amount}`
            break;    

        case 3: 
            amount = `0${basicHelper.splitString(amount, 0, 1)}.${basicHelper.splitString(amount, 1, 2)}`;
            break;

        default:
            amountLength = amount.length -2;
            return basicHelper.splitString(amount, 0, amountLength) + "." + basicHelper.splitString(amount, amountLength, 2)            
            break;                
    }
}

const calculateExpirationDate = (expirationFactor, type)=>{
    
    switch(type){
        case "bankTitle":
            if(basicHelper.splitString(expirationFactor, 0, 1) === '0') return '';

            var date = new Date('10/07/1997');
            
            date.setTime(date.getTime() + ((+expirationFactor + 1 ) * 24 * 60 * 60 * 1000));
            const data = date.getFullYear() + '/' + ("0" + (date.getMonth() + 1)).slice(-2) + '/' + ("0" + (date.getDate())).slice(-2)
            return data;
            break;

        case "concessionaire":
            return '';
            break;
    }    
}

const calculateDigitCheckerModule10 = (data, type)=>{

    // const fieldMap = reverseFieldArray.map((value, index)=>{
    //     return index % 2 === 0 ? value * 2: value;             
    // });   

    data = data.split('');
    data = data.reverse();
    let multiplier = 2;

    data = data.map((value)=>{
        value = +value * multiplier;
        multiplier = multiplier === 2 ? 1 : 2;

        if(value > 9){
            value = value.toString().split('');
            value = (+value[0]) + (+value[1]);                 
        }    

        return value;
    });

    data = data.reduce((acc, value)=> value + acc, 0);    

    const rest = data%10;
    let result = 10-rest;

    switch(type){
        case "bankTitle":
            if(result === 10) result = 1;
            break;

        case "concessionaire":
            if(result === 10) result = 0;
            break;
    }
    return result;     
}

const calculateDigitCheckerModule11 = (data, type)=>{

    let operator = 2;

    data = data.split('');
    data = data.reverse();
    
    data = data.map((element) => {
        if(operator > 9) operator = 2;
        element = +element*operator;
        operator++;
        return element;
    });

    data = data.reduce((acc, value)=> value + acc, 0);
    
    const rest = data%11;
    let result = 11-rest;

    switch(type){
        case "bankTitle":
            if(result === 10 || result === 11 || result === 0) result = 1;
            break;

        case "concessionaire":
            if(result === 11 || 10) result = 0;
            break;
    }
    return result;      
}

module.exports = {
    calculateValueOfBillet,
    mountBarCodebankTitle,
    mountBarCodeConcessionaire,
    calculateExpirationDate,
    validateVerifyingDigits,
    calculateDigitCheckerModule10,
    calculateDigitCheckerModule11,    
};