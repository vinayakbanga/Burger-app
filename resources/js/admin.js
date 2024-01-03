import axios from 'axios';
import moment from 'moment'; // Ensure moment is imported
import Noty from 'noty';

function initAdmin(socket) {
    const orderTableBody = document.querySelector('#orderTableBody');
    let orders = [];
    let markup;

    axios.get('/admin/orders', {
        // headers: {
        //     "X-Requested-With": "XMLHttpRequest"
        // }
    }).then(res => {
        console.log('API Response:', res.data); // Log the response data
        orders = res.data;
        // orders = res.data;
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
    // Socket
    socket.on('orderPlaced', (order) => {
        new Noty({
            type: 'success',
            timeout: 1000,
            text: 'New order!',
            progressBar: false,
        }).show();
        orders.unshift(order)
        orderTableBody.innerHTML = ''
        orderTableBody.innerHTML = generateMarkup(orders)
    })
}

module.exports=initAdmin;