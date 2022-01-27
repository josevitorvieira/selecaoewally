const request = require('supertest');

const billetHelper = require('./helpers/billetHelper');
const app = require('./index');

describe("Testing barcode functions", ()=>{

    it("should return an object with data from a bank slip", ()=>{
        
        const digitableLine = "10499141369100010004900060580966388920000005500";
        const response = billetHelper.recoveryDataBankTitle(digitableLine); 
        
        expect(response).toEqual(expect.objectContaining(
            {
                barCode: "10493889200000055009141391000100040006058096",
                fields: [
                    { name: "Campo1", value: "104991413" },
                    { name: "Campo2", value: "9100010004" },
                    { name: "Campo3", value: "0006058096" },
                    { name: "barCodeAux", value: "1049889200000055009141391000100040006058096" }
                ],
        
                checkDigits:[
                    { name: "verifyingDigit1", value: 6 },
                    { name: "verifyingDigit2", value: 9 },
                    { name: "verifyingDigit3", value: 6 },            
                    { name: "digitCheckerBarCode", value: 3 }
                ],
        
                expirationDate: "8892",
                amount: "0000005500",
            }
        ));
        
    });
    
    it("should returns the check digit of a billet field according to the parameter passed", ()=>{
        const response = billetHelper.calculateDigitCheckerModule10("104991413");        
        expect(response).toEqual(6);
    });

    it("should returns the general check digit of a billet according to the parameter passed", ()=>{
        const codeBarAux = "1049889200000055009141391000100040006058096";
        const response = billetHelper.calculateDigitCheckerModule11(codeBarAux);
        expect(response).toEqual(3);
    });

    it("should return status 200 if the value of the two parameters are equal", ()=>{
        const parameter1 = [{ name: "Campo1", value: 6 }];
        const parameter2 = [{ name: "verifyingDigit1", value: 6 }];
        const response = billetHelper.validateDigitsChecker(parameter1, parameter2);
        expect(response.status).toBe(200);
    });

    it("should return status 400 if the value of the two parameters are different", ()=>{
        const parameter1 = [{ name: "Campo1", value: 6 }];
        const parameter2 = [{ name: "verifyingDigit1", value: 5 }];
        const response = billetHelper.validateDigitsChecker(parameter1, parameter2);
        expect(response.status).toBe(400);
    });

    it("should returns a string with the value of the billet with a dot separating the cents", ()=>{
        const amount = "0000005500";
        const response = billetHelper.calculateValueOfBillet(amount);
        expect(response).toMatch(/55.00/);
    });

    it("should return a expiration date calculated according to the expiration factor", ()=>{
        const expirationDate = "8892";
        const response = billetHelper.calculateExpirationDate(expirationDate, "bankTitle");
        expect(response).toMatch(/2022-02-10/);
    });
});

describe('Test router',()=>{
    it('should test connection with route, status and returned object ', async ()=>{
        const billetNumber = "10499141369100010004900060580966388920000005500";
        const response = await request(app).get(`/boleto/${billetNumber}`);
        const object = JSON.parse(response.text); 
        
        expect(object).toEqual(expect.objectContaining(
            {
                barCode: "10493889200000055009141391000100040006058096",
                amount:  "55.00",
                expirationDate: "2022-02-10"
            }
        ));
        expect(response.status).toEqual(200);
    });

    it('should test the return if something other than numbers is sent in the request', async ()=>{
        const billetNumber = "1049914136910001000490006058096638892000000550a";
        const response = await request(app).get(`/boleto/${billetNumber}`);
        
        expect(response.text).toMatch("Apenas números devem ser enviados na requisição");
        expect(response.status).toEqual(400);
    });

    

})



  