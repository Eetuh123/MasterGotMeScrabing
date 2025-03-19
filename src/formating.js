function formatNutrienInfo(price, name, nutrition){
    let cleaned = nutrition.filter(item => Object.keys(item).length > 0)
    let formatedNutrient = {
        name : name,
        info : {
            price : price,
            nutrition : {
            }
        }
    }
    cleaned.forEach(item => {
        formatedNutrient.info.nutrition[item.nutrient] = item.value;
    });
    return formatedNutrient
}

module.exports = { formatNutrienInfo }