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
                salt: product.salt,
                fibre: product.fibre
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

module.exports = { getItemid, formatNutrionInfoFromDB }