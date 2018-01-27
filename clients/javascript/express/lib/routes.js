const {
    countries
} = require('./costs.js');

function isValidReq(req) {
    const {
        prices,
        quantities,
        country,
        reduction
    } = req.body;
    if (!quantities || !prices) {
        console.log('!prices || !quantities')
        return false;
    }
    if (!Array.isArray(quantities) || !quantities.length) {
        console.log('Not array(quantities)');
        return false;
    }
    if (!Array.isArray(prices) || !prices.length) {
        console.log('Not array(Prices)')
        return false;
    }
    if (quantities.length != prices.length) {
        console.log('Different length of arrays')
        console.log('Prices length', prices.length)
        console.log('q length', quantities.length)
        return false;
    }
    if (!countries[country]) {
        console.log('wrong country');
        return false;
    }
    if(!reduction){
        return false;
    }
    return true;
}
exports.order = function order(req, res, next) {
    console.log('Received order')
    console.log(req.body);
    // TODO implement from here
    const {
        prices,
        quantities,
        country,
        reduction
    } = req.body;
    let sum = 0;
    if (!isValidReq(req)) {
        res.status(400);
    }
    try {
        quantities.forEach((q, index) => {
            sum += parseInt(q) * parseFloat(prices[index]);
        });
    } catch (e) {
        res.status(400);
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
    }
    total = total - total * reductNum;
    if (Number.isNaN(total)) {
        res.status(400);
    }
    res.json({
        total
    });
}
exports.feedback = function feedback(req, res, next) {
    console.info("FEEDBACK:", req.body.type, req.body.content);
    next();
}