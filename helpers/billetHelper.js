const basicHelper = require('../helpers/basicHelper');

const recoveryDataBankTitle = (billetNumber)=>{
                          
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

const recoveryDataConcessionairePayment = (billetNumber)=>{

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

const calculateDigitCheckerModule10 = (data, type)=>{

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

const validateDigitsChecker = (digitCheckerCalculated, verifyingDigitsBilletNumber)=>{
    
    for (let index = 0; index < digitCheckerCalculated.length; index++) {
        
        if(digitCheckerCalculated[index].value !== verifyingDigitsBilletNumber[index].value){

            switch(digitCheckerCalculated[index].name){

                case "digitCheckerBarCode":
                    return { status: 400, billetStatus: "o digito verificador do codigo de barras enviado na requisição não confere com calculado." };
                    
                default:
                    return {status: 400, billetStatus: `o digito verificador do ${digitCheckerCalculated[index].name} enviado na requisição não confere com o calculado.` };                        
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
            return `00.0${amount}`;     

        case 2: 
            return `00.${amount}`;       

        case 3: 
            return `0${basicHelper.splitString(amount, 0, 1)}.${basicHelper.splitString(amount, 1, 2)}`;
            
        default:
            amountLength = amount.length -2;
            return basicHelper.splitString(amount, 0, amountLength) + "." + basicHelper.splitString(amount, amountLength, 2);                                   
    }
}

const calculateExpirationDate = (expirationFactor, type)=>{
    
    switch(type){

        case "bankTitle":

            if(basicHelper.splitString(expirationFactor, 0, 1) === '0') return '';

            var date = new Date('10/07/1997');
            date.setTime(date.getTime() + ((+expirationFactor + 1 ) * 24 * 60 * 60 * 1000));
            return date.getFullYear() + '-' + ("0" + (date.getMonth() + 1)).slice(-2) + '-' + ("0" + (date.getDate())).slice(-2)
                        
        case "concessionaire":
            return '';            
    }    
}

module.exports = {
    recoveryDataBankTitle,
    recoveryDataConcessionairePayment,
    calculateDigitCheckerModule10,
    calculateDigitCheckerModule11,
    validateDigitsChecker,
    calculateValueOfBillet,
    calculateExpirationDate   
};