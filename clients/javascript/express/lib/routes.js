const {
    countries
} = require('./costs.js');
exports.order = function order(req, res, next) {
    console.log('Received order')
    console.log(req.body);
    // TODO implement from here
    const {
        prices,
        quantity,
        country,
        reduction
    } = req.body;
    let sum = 0;
    if (Array.isArray(quantity)) {
        quantity.forEach((q, index) => {
            sum += parseInt(q) * parseInt(prices[index]);
        });
    }
    const taxCode = countries[country];
    let taxNum = taxCode / 100;
    let total = sum + sum * taxNum;
    let reductNum = 0;
    if (reduction == "STANDARD") {
        if (total >= 50000) {
            reductNum = 0.15;
        } else if (total >= 10000) {
            reductNum = 0.1;
        } else if (total >= 7000) {
            reductNum = 0.07;
        } else if (total >= 5000) {
            reductNum = 0.05;
        } else if (total >= 1000) {
            reductNum = 0.03;
        }
        total = total - total * reductNum;
    }
    // res.json({
    //     total
    // });
    next({
        total
    })
}

exports.feedback = function feedback(req, res, next) {
    console.info("FEEDBACK:", req.body.type, req.body.content);
    next();
}