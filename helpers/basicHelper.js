
const isNumber = (number) =>{
    return !isNaN(number);
}

const splitString = (text, index, charQuantity)=>{
    return text.substr(index,charQuantity);
}

module.exports = {
    isNumber,
    splitString
};