import axios from 'axios'
import Noty from 'noty'
import {initAdmin} from './admin'
import moment from 'moment'
import {initStripe} from "./stripe"

// import { emit } from '../../app/models/user'

let addToCart =document.querySelectorAll('.add-to-cart')
let cartCounter=document.querySelector('#cartCounter')
let amount = document.querySelector('.amount')

function updateCart(pizza){

    axios.post('/update-cart',pizza).then((res)=>{
        // console.log(res);
        cartCounter.innerText = res.data.totalQty
        
        new Noty({
            type:'success',
            timeout:1000,
            text: "Item added to cart",
            layout:"bottomCenter"
            
          }).show();
    }).catch(err => {

        new Noty({
            type:'error',
            timeout:1000,
            text: "error",
            layout:"bottomCenter"
            
          }).show();
    })

}

addToCart.forEach((btn)=>{
  btn.addEventListener('click',(e)=>{
      
      let pizza = JSON.parse(btn.dataset.burger)
      updateCart(pizza);
    //   console.log(pizza);
    
  })
})

// Remove alert message after X seconds
const alertMsg = document.querySelector('#success-alert')
if(alertMsg) {
    setTimeout(() => {
        alertMsg.remove()
    }, 2000)
}
const slideAndFade =  elem => {
  elem.style.transform = "translate(100px)";
  elem.style.opacity = "0";
  setTimeout(() => {
      elem.remove();
  }, 2000);
}


const cancelCartItem = e => {
  let cancelBtn = e.currentTarget
  cancelBtn.removeEventListener('click', cancelCartItem)
  cancelBtn.className = "cancel-item-icon-progress"
  let burger = JSON.parse(e.currentTarget.dataset.burger)
  axios.post('/remove-cart-item', { burger }).then(res => {
      let { updatedQty, updatedTotalPrice } = res.data;
      cancelBtn.className = "cancel-item-icon-success"
      cartCounter.innerText = updatedQty
      amount.innerText = updatedTotalPrice
      slideAndFade(cancelBtn.parentElement)
  });
}

//cancel feature for cart items
document.querySelectorAll('.cancel-item-icon').forEach(elem => {
  elem.addEventListener('click', cancelCartItem)
});


// Change order






// change order statud
let statuses = document.querySelectorAll('.status_line')

let order = document.querySelector('#hiddenInput') ? document.querySelector('#hiddenInput').value : null
order=JSON.parse(order)
let time= document.createElement('small')

// console.log(order);
function updateStatus(order){

  statuses.forEach(status => {
      status.classList.remove('step-completed')
      status.classList.remove('current')
  });
  let stepCompleted=true;

  statuses.forEach((status)=>{
    let dataProp =status.dataset.status

    if(stepCompleted){
          status.classList.add('step-completed')
    }
    if(dataProp === order.status){
      stepCompleted=false
      time.innerText=moment(order.updatedAt).format('hh:mm A')
      status.appendChild(time)
      if(status.nextElementSibling){

        status.nextElementSibling.classList.add('current')
      }
      
    }

  })


}

updateStatus(order);





initStripe()






//socket client side
let socket =io()

//join
if(order){
  
  socket.emit('join',`order_${order._id}`)
}

//for admin
// let adminAreaPath= window.location.pathname
// // console.log(adminAreaPath);
// if(adminAreaPath.includes('admin')){
//   initAdmin(socket)
//   socket.emit('join','adminRoom')
// }
// initAdmin(socket)

        // Make sure this code is adapted to work without import statements
        // and in a browser context

        const orderTableBody = document.querySelector('#orderTableBody');
        let orders = [];
        let markup;

        axios.get('/admin/orders', {
            headers: {
                "X-Requested-With": "XMLHttpRequest"
            }
        }).then(res => {
            orders = res.data;
            markup = generateMarkup(orders);
            orderTableBody.innerHTML = markup;
        }).catch(err => {
            console.error(err);
        });

        function renderItems(items) {
            let parsedItems = Object.values(items);
            return parsedItems.map(menuItem => `
                <p>${menuItem.item.name} - ${menuItem.qty} pcs</p>
            `).join('');
        }

        function generateMarkup(orders) {
            return orders.map(order => `
                <tr>
                    <td class="border px-4 py-2 text-green-900">
                        <p>${order._id}</p>
                        <div>${renderItems(order.items)}</div>
                    </td>
                    <td class="border px-4 py-2">${order.customerId.name}</td>
                    <td class="border px-4 py-2">${order.address}</td>
                    <td class="border px-4 py-2">${order.status}</td>
                    <td class="border px-4 py-2">
                        ${moment(order.createdAt).format('hh:mm A')}
                    </td>
                    <td class="border px-4 py-2">
                        ${order.paymentStatus ? 'Paid' : 'Not Paid'}
                    </td>
                </tr>
            `).join('');
        }

        // Socket initialization
         socket = io();
        socket.on('orderPlaced', (newOrder) => {
            new Noty({
                type: 'success',
                timeout: 1000,
                text: 'New order!',
                progressBar: false,
            }).show();
            orders.unshift(newOrder);
            orderTableBody.innerHTML = '';
            orderTableBody.innerHTML = generateMarkup(orders);
        });
   

socket.on('orderUpdated',(data)=>{
  const updatedOrder ={ ...order}
  updatedOrder.updatedAt=moment().format()
  updatedOrder.status = data.status
  updateStatus(updatedOrder)
  console.log(data)
  new Noty({
    type:'success',
    timeout:1000,
    text: "Order updated",
    layout:"bottomCenter"
    
  }).show();
})
