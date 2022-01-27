const billetHelper = require('../helpers/billetHelper');
const basicHelper = require('../helpers/basicHelper');

exports.verifyBilletType = (billetNumber)=>{
    
    const isNumber =  basicHelper.isNumber(billetNumber);
    if(!isNumber) return { status: 400, billetStatus: "Apenas números devem ser enviados na requisição"};

    if(billetNumber.length === 47){
        return bankTitleBillet(billetNumber);    
    }
    else if(billetNumber.length === 48){
        return concessionaireBillet(billetNumber);
    }
    else{
        return { 
            status: 400, 
            billetStatus: "requisição invalida, número de caracteres deve ser de 48 para concessionária e 47 para título bancário, verifique e tente novamente."
         };
    }
}

const bankTitleBillet = (billetNumber)=>{
    
    const billetData = billetHelper.recoveryDataBankTitle(billetNumber);

    const digitCheckerArray = billetData.fields.map((field)=>{
        switch(field.name){

            case "barCodeAux":
                field.value =  billetHelper.calculateDigitCheckerModule11(field.value, "bankTitle");
                return field;

            default:
                field.value = billetHelper.calculateDigitCheckerModule10(field.value, "bankTitle");
                return field;
        }
    });

    const digitCheckerIsValid = billetHelper.validateDigitsChecker(digitCheckerArray, billetData.checkDigits);
    if(digitCheckerIsValid.status === 400) return { status: 400, billetStatus: digitCheckerIsValid.billetStatus };
    
    const expirationDate = billetHelper.calculateExpirationDate(billetData.expirationDate);
    
    const billetValue = billetHelper.calculateValueOfBillet(billetData.amount);

    return {
        status: 200,        
        billetStatus: {
            barCode: billetData.barCode,
            amount: billetValue || '',
            expirationDate: expirationDate || ''
        }
    }  
}

const concessionaireBillet = (billetNumber)=>{
    
    const billetData = billetHelper.recoveryDataConcessionairePayment(billetNumber);    

    const digitCheckerArray = billetData.fields.map((field)=>{
        switch(billetData.currency){

            case '6':
            case '7':
                field.value = billetHelper.calculateDigitCheckerModule10(field.value, "concessionaire");                
                return field;
    
            case '8':
            case '9':
                field.value = billetHelper.calculateDigitCheckerModule11(field.value, "concessionaire");
                return field;                 
        }
    });

    const digitCheckerIsValid = billetHelper.validateDigitsChecker(digitCheckerArray, billetData.checkDigits);
    if(digitCheckerIsValid.status === 400) return { status: 400, billetStatus: digitCheckerIsValid.billetStatus }; 

    const billetValue = billetHelper.calculateValueOfBillet(billetData.amount)

    return {
        status: 200,        
        billetStatus: {
            barCode: billetData.barCode,
            amount: billetValue || '',
            expirationDate: ''
        }
    } 
}