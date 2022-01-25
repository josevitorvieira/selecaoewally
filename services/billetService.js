const billetHelper = require('../helpers/billetHelper');

exports.verifyBilletType = (billetNumber)=>{
    
    const responseBanckTitle = bankTitleCalculation(billetNumber)
    
    return responseBanckTitle;
}

const bankTitleCalculation = (billetNumber)=>{
    let expirationDate;


    const verifiedBilletNumber =  billetHelper.verifyBilletNumber(billetNumber);
    if(verifiedBilletNumber.status === 400) return { status: verifiedBilletNumber.status, billetStatus: verifiedBilletNumber.billetStatus };
    
    const billetData = billetHelper.mountBarCodebancTitle(billetNumber);

    const fieldsMultiplied = billetHelper.setMultiplier(billetData.fields);

    const verifiedMultiplication = billetHelper.verifyMultipliedFieldData(fieldsMultiplied);

    const subtractionPerformed = billetHelper.subtractValue(verifiedMultiplication);

    const calculatedDigitCheckerBarCode =  billetHelper.calculateDigitCheckerBarcode(billetData.barCode);
    subtractionPerformed.push(calculatedDigitCheckerBarCode);

    const validatedVerifyingDigits = billetHelper.validateVerifyingDigits(subtractionPerformed,billetData.verifyingDigitsBilletNumber);
    if(validatedVerifyingDigits.status === 400) return { status: validatedVerifyingDigits.status, billetStatus: validatedVerifyingDigits.billetStatus };
    
    
    
    if(billetData.field5.substr(0,1) !== '0'){
        expirationDate = billetHelper.calculateexpirationDate(billetNumber);
    }

    const billetValue = billetHelper.calculateValueOfBillet(billetData.amount);

    return {
        status: 200,        
        billetStatus: {
            barCode: billetData.barCode,
            amount: billetValue || null,
            expirationDate: expirationDate || null
        }
    }  
}



// 47 titulo
// 48 convenio