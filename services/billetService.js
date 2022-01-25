const billetHelper = require('../helpers/billetHelper');

exports.verifyBilletType = (billetNumber)=>{
    
    const verifiedBilletNumber =  billetHelper.verifyBilletNumber(billetNumber);
    if(verifiedBilletNumber === true) return { status: 400, billet: "Apenas números devem ser enviados na requisição" };
    
    const billetData = billetHelper.mountBarCodebancTitle(billetNumber);

    const billetValue = billetHelper.calculateValueOfBillet(billetNumber);

    const expirationDate = billetHelper.calculateexpirationDate(billetNumber);

    const fieldMultiplied = billetHelper.setMultiplier(billetData.field3);

    const verifiedMultiplication = billetHelper.verifyMultipliedFieldData(fieldMultiplied);

    const subtractionPerformed = billetHelper.subtractValue(verifiedMultiplication);

    if( subtractionPerformed === billetData.verifyingDigit3 ) console.log("aaaaaaaa");

    
    

    
    return {
        status: 200,        
        billet: {
            barCode: billetData.barCode,
            amount: billetValue,
            expirationDate: expirationDate
        }
    }    
}

const bankTitleCalculation = (billetNumber)=>{




}

// 47 titulo
// 48 convenio