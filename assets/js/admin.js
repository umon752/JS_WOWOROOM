/* AOS */
AOS.init({
    easing: 'ease',
    duration: 800,
    once: true
});



/* AJAX */
/**
 * DOM
 */
const api_path = 'umon752';
const token = 'oXQlr3K4qDTYUtYt4dv53DGCS3V2';
const tbody = document.querySelector('.js-tbody');
const deleteOrder = document.querySelector('.js-deleteOrderAll');
const modal = document.querySelector('#modal');
const modalBody = document.querySelector('.js-modalBody');



/**
 * Model
 */
// 訂單列表資料
let dataOrderList = [];
// 顏色變數
const primary = "#fd9a6c";
const primaryLight = "#ffd0b3";
const primaryDark = "#ff7b3e";
const light = "#e9ecef";
// 顏色 (深到淺 -> 排名高到低)
let colors = [primaryDark, primary, primaryLight, light];



/**
 * init
 */
function init() {
    getOrderList();
}
init();



// 全品項營收比重資料處理
function productTitle(data) {
    let obj = {};
    let objAry = [];
    let productTitle = [];
    // console.log(data);
    data.forEach(function (item) {
        item.products.forEach(function (value) {
            if (obj[value.title] === undefined) {
                obj[value.title] = 1;
            } else {
                obj[value.title] += 1;
            }
        })
    })
    // console.log(obj);

    objAry = Object.keys(obj);
    objAry.forEach(function (item) {
        let ary = [];
        ary.push(item);
        ary.push(obj[item]);
        productTitle.push(ary);
    })

    // console.log(objAry);
    // console.log(productTitle);

    // 排序 (多到少)
    productTitle.sort(function (a, b) {
        return b - a;
    });
    // console.log(productTitle);
    productTitle.forEach(function (item, index) {
        let ary = ["其他", 0];

        if (index > 2) {
            ary[1] += item[1];
            productTitle.splice(3, 0, ary);
        }
        // console.log(ary);
    })
    productTitle.splice(4, productTitle.length - 1);
    // console.log(productTitle);
    renderC3(productTitle);
}

// 全產品類別營收比重資料處理
// function productCategory(data) {
//     let obj = {};
//     let objAry = [];
//     let productCategory = [];
//     console.log(data);
//     data.forEach(function (item) {
//         item.products.forEach(function (value) {
//             if (obj[value.category] === undefined) {
//                 obj[value.category] = 1;
//             } else {
//                 obj[value.category] += 1;
//             }
//         })

//     })
//     // console.log(obj);
//     objAry = Object.keys(obj);
//     objAry.forEach(function (item) {
//         let ary = [];
//         ary.push(item);
//         ary.push(obj[item]);
//         productCategory.push(ary);
//     })
//     // console.log(objAry);
//     // console.log(productCategory);
//     renderC3(productCategory);
// }

// 渲染圓餅圖
function renderC3(array) {

    // 處理顏色格式
    let arrayName = {};
    array.forEach(function (item, index) {
        if (arrayName[item[0]] === undefined) {
            arrayName[item[0]] = colors[index];
        }
    })
    // console.log(arrayName);

    const pieChart = c3.generate({
        bindto: ".js-pie", // HTML 元素綁定
        data: {
            columns: array, // 資料存放
            type: "pie", // 圖表種類
            colors: arrayName
        }
    });
}



// 取得訂單列表
function getOrderList() {
    axios.get(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/admin/${api_path}/orders`, {
            headers: {
                'Authorization': token
            }
        })
        .then(function (response) {
            // 訂單列表資料
            dataOrderList = response.data.orders;
            // console.log(dataOrderList);
            renderOrderList(dataOrderList);
            productTitle(dataOrderList);
        }).catch(function (error) {
            console.log(error);
        })
}

// 渲染訂單列表
function renderOrderList(data) {
    let str = '';
    data.forEach(function (item, index) {
        str += `<tr>
    <td>${item.createdAt}</td>
    <td>${item.user.name} ${item.user.tel}</td>
    <td>${item.user.address}</td>
    <td>${item.user.email}</td>
    <td><a href="#" class="js-check text-primary-dark" data-toggle="modal" data-target="#modal${index}">查看訂單</a></td>
    <td>${item.user.year}/${item.user.month}/${item.user.date}</td>
    <td>${orderStatus(item.paid, item.id)}</td>
    <td>
        <a href="#" class="material-icons h5 text-secondary-light" data-id="${item.id}">
            delete
        </a>
    </td>
    </tr>`;
    });

    tbody.innerHTML = str;

    // 訂單品項
    const check = document.querySelectorAll('.js-check');

    check.forEach(function (item) {
        item.addEventListener('click', checkList, false);
    })
}

// 訂單品項點擊
function checkList(e) {

    // 擷取 '#modal${index}' ${index} 字串
    let index = e.target.dataset.target.slice(-1);
    // console.log(index);

    modal.id = `modal${index}`;
    // console.log(dataOrderList);
    let strModalBody = '';
    let strModalFooter = '';

    dataOrderList[index].products.forEach(function (item, index) {
        // console.log(dataOrderList[index]);
        strModalBody += `<li class="row align-items-center mb-2">        
        <span class="col-9 col-md-7">${item.title}</span>
        <span class="col-3 col-md-2 text-center">x ${item.quantity}</span>
        <span class="col-md-3 text-right d-none d-md-block">NT$${item.price*item.quantity}</span>
        </li>`;
        strModalFooter = `<div class="border-top border-secondary-light text-right pt-2 mt-3">總金額<span class="ml-3">NT$${dataOrderList[index].total}</span></div>`
    })

    modalBody.innerHTML = strModalBody + strModalFooter;
}

// 訂單狀態條件
function orderStatus(paid, id) {
    if (paid) {
        return `<button class="btn text-secondary" disabled>已處理</button>`;
    } else {
        return `<button class="btn text-primary-dark" data-id="${id}">未處理</button>`;
    }
}

// 修改訂單狀態、刪除特定訂單
function editOrderList(e) {
    e.preventDefault();

    // 修改訂單狀態
    if (e.target.getAttribute('class') === 'btn text-primary-dark') {
        let orderId = e.target.getAttribute('data-id');
        let obj = {
            "id": orderId,
            "paid": true
        };

        axios.put(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/admin/${api_path}/orders`, {
                "data": obj
            }, {
                headers: {
                    'Authorization': token
                }
            })
            .then(function (response) {
                let dataOrderList = [];
                dataOrderList = response.data.orders;
                renderOrderList(dataOrderList);
            }).catch(function (error) {
                console.log(error);
            })
    }

    // 刪除特定訂單
    if (e.target.getAttribute('class') === 'material-icons h5 text-secondary-light') {
        let orderId = e.target.getAttribute('data-id');

        axios.delete(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/admin/${api_path}/orders/${orderId}`, {
                headers: {
                    'Authorization': token
                }
            })
            .then(function (response) {
                let dataOrderList = [];
                dataOrderList = response.data.orders;
                renderOrderList(dataOrderList);
            }).catch(function (error) {
                console.log(error);
            })
    }
}

// 刪除全部訂單
function deleteAllOrder(e) {
    e.preventDefault();

    axios.delete(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/admin/${api_path}/orders`, {
            headers: {
                'Authorization': token
            }
        })
        .then(function (response) {
            let dataOrderList = [];
            dataOrderList = response.data.orders;
            renderOrderList(dataOrderList);
        }).catch(function (error) {
            console.log(error);
        })
}



/**
 * Controller
 */
tbody.addEventListener('click', editOrderList, false);
deleteOrder.addEventListener('click', deleteAllOrder, false);