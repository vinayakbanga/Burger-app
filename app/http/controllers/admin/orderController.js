const order = require("../../../models/order")

const Order = require('../../../models/order')

function orderController() {
    return {
        index(req, res) {
            // console.log(req.xhr);
           order.find({ status: { $ne: 'completed' } }, null, { sort: { 'createdAt': -1 }}).populate('customerId', '-password').exec((err, orders) => {
               if(req.xhr) {
                console.log(req.xhr);
                   return res.json(orders)
               } else {
                res.render('admin/orders', { orders: orders });
               }
           })
        }
    }
}

module.exports = orderController