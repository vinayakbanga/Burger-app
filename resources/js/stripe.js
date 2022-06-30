
import {loadStripe} from '@stripe/stripe-js';
import { placeOrder } from './apiService';

export async function initStripe(){
    const stripe = await loadStripe('pk_test_51LEupoSJUTZPaYkg0Q9mECVveYzOTVNVywIoj10qC3QBI7rrnHUl342SeKm9JythCh9Eesuz8eU7C4NQRFfALopj00YbYjKBsL');
   
    let card =null;
function mountWidget(){
    let style = {
        base: {
        color: '#32325d',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
            color: '#aab7c4'
        }
        },
        invalid: {
        color: '#fa755a',
        iconColor: '#fa755a'
        }
    };
const elements =stripe.elements()

 card =elements.create('card',{style, hidePostalCode:true })

card.mount('#cardElement')

}




    const paymentType= document.querySelector('#paymentType')
    if(!paymentType){
        return;
    }
    paymentType.addEventListener('change',(e)=>{
        // console.log(e)
        if(e.target.value === "card"){
             //dispay Widget
      mountWidget();

        } else {
               card.destroy();
        }
    })



//Ajax call
const paymentForm=document.querySelector('#payment-form');
if(paymentForm){

  paymentForm.addEventListener('submit',(e)=>{
    e.preventDefault();
    let formData= new FormData(paymentForm);
    let formObject ={}
    
    
    for(let [key,value] of formData.entries()){
      
      formObject[key] = value
    }


    if(!card){
       
      placeOrder(formObject)
      // console.log();
      return;

    }
//verify card
stripe.createToken(card).then((result)=>{
//  console.log(result);
 formObject.stripeToken=result.token.id;
 placeOrder(formObject)
}).catch((err)=>{
  console.log(err);

})

   


    // axios.post('/orders',formObject).then((res)=>{
    //     //  console.log(res.data);
    //     new Noty({
    //       type:'success',
    //       timeout:1000,
    //       text: res.data.message,
    //       layout:"bottomCenter"
          
    //     }).show();
    //     setTimeout(() => {
                    
    //       window.location.href='/customer/orders'
    //     }, 1000);
    //   }).catch((err)=>{
    //               // console.log(err);
    //               new Noty({
    //                 type:'error',
    //                 timeout:1000,
    //                 text: err.res.data.message,
    //                 layout:"bottomCenter"
                    
    //               }).show();

                  
    //     })
        // console.log(formObject);
        // console.log(key)
  })

}  

}