// const Order = require('../../../models/order')
// const moment = require('moment')
// const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY)
// function orderController(){
//     return{
//         store(req,res){
         
//         //validate req
//         const{phone,address,stripeToken,paymentType} = req.body
//         if(!phone || !address){
//             return res.status(422).json({message:"all fields are req"})
//             // req.flash('error','All fields are required')
//             // return res.redirect('/cart')
//         }

//         const order = new Order({
//             customerId:req.user._id,
//             items: req.session.cart.items,
//             phone:phone,
//             address:address
//         })
//         order.save().then(result=>{
//             Order.populate(result,{path:'customerId'},(err,placedOrder)=>{

//                 // req.flash('success','order placed')
//                 //stripe paymnet
//                 if(paymentType === 'card'){
//                     stripe.charges.create({
//                         amount: req.session.cart.totalPrice * 100,
//                         source: stripeToken,
//                         currency: 'inr',
//                         description:`Pizza order:${placedOrder._id}`
//                     }).then(()=>{
//                              placedOrder.paymentStatus=true;
//                              placedOrder.save().then((ord)=>{
//                                 // console.log(r)
//                                 const eventEmitter = req.app.get('eventEmitter')
//                                 eventEmitter.emit('orderPlaced',ord)
//                                 delete req.session.cart
//                                 return res.json({message :'Payment suceesfull Order Placed successfully'})
//                              }).catch((err)=>{
//                                   console.log(err)
//                              })
//                             }).catch((err)=>{
//                                 delete req.session.cart
//                                 return res.json({message :'Order Placed but,Payment failed'})
                                
//                             })
                            
//                         }
//                         //emit
                
//                 // return res.redirect('/customer/orders')
//             })
//         }).catch(err=>{
//             return res.status(500).json({message:'Something went wrong '})
//         //     req.flash('error','Something went wrong')
//         //    return res.redirect('/cart') 
//         })

//         },
//         async index(req,res){
//             const orders = await Order.find({customerId:req.user._id},null,{sort:{'createdAt':-1}})
//             res.render('customers/orders',{orders: orders,moment:moment})
//             // console.log(orders)
//         },

//         async show(req,res){
//             const order = await Order.findById(req.params.id)
//             //Authorisse user
//             if(req.user._id.toString() === order.customerId.toString()){
//                  return res.render('customers/singleOrder',{order: order})

//             }
//             else{
//                 return  res.redirect('/')
//             }
//         }
//     }
// }


// module.exports = orderController
const Order = require('../../../models/order')
const moment = require('moment')
const stripe = require('stripe')('sk_test_51LEupoSJUTZPaYkgMtLEnOQA8UQzPCGZgXZcoOYHl2ydoHRNkh64LZoveswq8LpoZMQIzpCmaCKWUuRUSCpZgG5w00l1pvXQ92')
function orderController () {
    return {
        store(req, res) {
            // Validate request
            const { phone, address, stripeToken, paymentType } = req.body
            console.log(paymentType)
            if(!phone || !address) {
                return res.status(422).json({ message : 'All fields are required' });
            }

            const order = new Order({
                customerId: req.user._id,
                items: req.session.cart.items,
                phone,
                address
            })
            order.save().then(result => {
                Order.populate(result, { path: 'customerId' }, (err, placedOrder) => {
                    // req.flash('success', 'Order placed successfully')

                    // Stripe payment
                    if(paymentType==='card') {
                        stripe.charges.create({
                            amount: req.session.cart.totalPrice  * 100,
                            source: stripeToken,
                            currency: 'inr',
                            description: `Pizza order: ${placedOrder._id}`
                        }).then(() => {
                            placedOrder.paymentStatus = true
                            placedOrder.paymentType = paymentType
                            placedOrder.save().then((ord) => {
                                // Emit
                                const eventEmitter = req.app.get('eventEmitter')
                                eventEmitter.emit('orderPlaced', ord)
                                delete req.session.cart
                                return res.json({ message : 'Payment successful, Order placed successfully' });
                            }).catch((err) => {
                                console.log(err)
                            })

                        }).catch((err) => {
                            delete req.session.cart
                            return res.json({ message : 'OrderPlaced but payment failed, You can pay at delivery time' });
                        })
                    } else {
                        delete req.session.cart
                        return res.json({ message : 'Order placed succesfully' });
                    }
                })
            }).catch(err => {
                return res.status(500).json({ message : 'Something went wrong' });
            })
        },
        async index(req, res) {
            const orders = await Order.find({ customerId: req.user._id },
                null,
                { sort: { 'createdAt': -1 } } )
            res.header('Cache-Control', 'no-store')
            res.render('customers/orders', { orders: orders, moment: moment })
        },
        async show(req, res) {
            const order = await Order.findById(req.params.id)
            // Authorize user
            if(req.user._id.toString() === order.customerId.toString()) {
                return res.render('customers/singleOrder', { order })
            }
            return  res.redirect('/')
        }
    }
}


module.exports = orderController