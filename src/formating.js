function formatNutrienInfoFromScrape(price, name, nutrition){
    let cleaned = nutrition.filter(item => Object.keys(item).length > 0) //Pitää olla myös numero imo? formaatti rikko sivun
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

function formatNutrionInfoFromDB(product){
    let formatedNutrient = {
        name: product.name,
        info: {
            price: product.price,
            nutrition: {
                kcal: product.kcal,
                fat: product.fat,
                fatSaturated: product.fatSaturated,
                carbs: product.carbs,
                carbsSugar: product.carbsSugar,
                Protein: product.protein,
            },
            scrappingTime: product.scraped_at,
            url: product.url,
        }
    }
    return formatedNutrient
}

function getItemid(url) {
    const numberMatches = url.match(/\d+/g)
    const longest = numberMatches.reduce((a,b) => (b.length > a.length ? b:a))
    const id = parseInt(longest, 10)

    return id
}

module.exports = { formatNutrienInfoFromScrape, getItemid, formatNutrionInfoFromDB }