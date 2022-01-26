const billetHelper = require('../helpers/billetHelper');
const basicHelper = require('../helpers/basicHelper');

// FALTA BAN
// CALCULAR DATA


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
    
    const billetData = billetHelper.mountBarCodebankTitle(billetNumber);

    const digitCheckerArray = billetData.fields.map((field)=>{
        switch(field.name){
            case "barCodeAux":
                field.value =  billetHelper.calculateDigitCheckerModule11(field.value, "bankTitle");
                return field;
                break;

            default:
                field.value = billetHelper.calculateDigitCheckerModule10(field.value, "bankTitle");
                return field;
                break;
        }
    });

    const digitCheckerIsValid = billetHelper.validateVerifyingDigits(digitCheckerArray, billetData.checkDigits);
    if(digitCheckerIsValid.status === 400) return { status: 400, billetStatus: digitCheckerIsValid.billetStatus };
    
    const expirationDate = billetHelper.calculateExpirationDate(billetData.expirationDate, "bankTitle");
    
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
    
    const billetData = billetHelper.mountBarCodeConcessionaire(billetNumber);
    
    const digitCheckerArray = billetData.fields.map((field)=>{
        switch(billetData.currency){
            case '6':
            case '7':
                field.value = billetHelper.calculateDigitCheckerModule10(field.value, "concessionaire");                
                return field;
                break;
            case '8':
            case '9':
                field.value = billetHelper.calculateDigitCheckerModule11(field.value, "concessionaire");
                return field;
                break;    
        }
    });

    const digitCheckerIsValid = billetHelper.validateVerifyingDigits(digitCheckerArray, billetData.checkDigits);
    if(digitCheckerIsValid.status === 400) return { status: 400, billetStatus: digitCheckerIsValid.billetStatus }; 

    const expirationDate = billetHelper.calculateExpirationDate(billetNumber);
    
    const billetValue = billetHelper.calculateValueOfBillet(billetData.amount)

    return {
        status: 200,        
        billetStatus: {
            barCode: billetData.barCode,
            amount: billetValue || '',
            expirationDate: expirationDate || ''
        }
    } 
}