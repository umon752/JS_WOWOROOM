/**
 * DOM
 */
const api_path = 'umon752';
const token = 'oXQlr3K4qDTYUtYt4dv53DGCS3V2';
const productList = document.querySelector('.js-products');
const cartList = document.querySelector('.js-carts');
const totalMoney = document.querySelector('.js-finalTotal');
const deleteCart = document.querySelector('.js-deleteCartAll');
const form = document.querySelector('.js-form');
const formSend = document.querySelector('.js-formSend');
const verifyText = document.querySelectorAll('.js-verify');
const selectItem = document.querySelector('.js-selectItem');
const message = document.querySelector('.js-message');



/**
 * Model
 */
// 產品列表資料
let dataProductList = [];
// 購物車列表資料
let dataCartList = [];



/**
 * init
 */
function init() {
    getProductList();
    getCartList();
    loading();
}
init();



// Loading
function loading() {
    const textWrapper = document.querySelector('.js-loading-letters');
    const loading = document.querySelector(".js-loading");
    textWrapper.innerHTML = textWrapper.textContent.replace(/\S/g, "<span class='js-loading-letter d-inline-block'>$&</span>");

    /* Anime */
    let animation = anime.timeline({
            loop: true
        })
        .add({
            targets: '.js-loading-line',
            scaleX: [0, 1],
            opacity: [0.5, 1],
            easing: "easeInOutExpo",
            duration: 900
        }).add({
            targets: '.js-loading-letter',
            opacity: [0, 1],
            translateX: [40, 0],
            translateZ: 0,
            scaleX: [0.3, 1],
            easing: "easeOutExpo",
            duration: 800,
            offset: '-=1000',
            delay: (el, i) => 150 + 25 * i
        }).add({
            targets: '.js-loading-block',
            opacity: 0,
            duration: 1000,
            easing: "easeOutExpo",
            delay: 1000
        });



    // loading 消失
    setTimeout(function () {
        loading.classList.add('loading--fadeOut');
        // Anime 停止
        animation.pause();
        // 載入 AOS
        AOS.init({
            easing: 'ease',
            duration: 800,
            once: true
        });
    }, 1800)
}



// 取得產品列表
function getProductList() {
    axios.get(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${api_path}/products`).
    then(function (response) {
        dataProductList = response.data.products;
        renderProductList();
    }).catch(function (error) {
        console.log(error);
    })
}

function renderStr(item) {
    return `<li class="col-6 col-md-4 col-lg-3 mb-4">
    <div class="productTag bg-dark text-white py-2 px-4">新品</div>
    <a href="#" class="productImg d-block overflow-hidden">
    <img src=${item.images} class="productImg--bigger">
    </a>
    <a href="#" class="btn btn-dark rounded-0 w-100 mb-2" data-id="${item.id}">加入購物車</a>
    <h4 class="font-size-sm h6-md mb-md-2"><a href="#" class="text-dark">${item.title}</a></h4>
    <del class="font-size-sm h6-md">NT$${item.origin_price}</del>
    <h5 class="h6 h5-md">NT$${item.price}</h5>
    </li>`
}

// 渲染產品列表
function renderProductList() {
    let str = '';
    dataProductList.forEach(function (item) {
        str += renderStr(item);
    })
    productList.innerHTML = str;
}

// 篩選產品列表
function filterProductList(e) {
    let category = e.target.value;

    let str = '';
    dataProductList.forEach(function (item) {
        if (category === item.category) {
            str += renderStr(item);
        } else if (category === "全部") {
            str += renderStr(item);
        }
    })
    productList.innerHTML = str;
}

// 加入購物車
function addCartItem(e) {
    e.preventDefault();
    if (e.target.getAttribute('class') == 'btn btn-dark rounded-0 w-100 mb-2') {
        // 產品 ID
        let productId = e.target.getAttribute('data-id');
        // 數量
        let num = 1;

        // 該產品已存在購物車中，數量 +1
        dataCartList.forEach(function (item) {
            if (item.product.id === productId) {
                num = item.quantity += 1;
            }
        })

        let obj = {
            "productId": productId,
            "quantity": num
        };
        // console.log(obj);
        axios.post(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${api_path}/carts`, {
            data: obj
        }).
        then(function (response) {
            dataCartList = response.data.carts;
            // 最後總金額
            let finalTotal = response.data.finalTotal;
            // 顯示訊息
            message.innerHTML = `<span class="material-icons text-primary-dark mr-1">check</span>
            加入購物車成功`;
            // 訊息動態顯示
            messageActive();
            // console.log(dataCartList);
            renderCartList(dataCartList, finalTotal);
        }).catch(function (error) {
            console.log(error);
        })
    }
}

// 取得購物車列表
function getCartList() {
    axios.get(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${api_path}/carts`).
    then(function (response) {
        dataCartList = response.data.carts;
        // 最後總金額
        let finalTotal = response.data.finalTotal;
        // console.log(dataCartList, finalTotal);
        renderCartList(dataCartList, finalTotal);
    }).catch(function (error) {
        console.log(error);
    })
}

// 渲染購物車列表
function renderCartList(data, finalTotal) {
    let str = '';
    let strTitle = `<div class="row d-none d-md-flex mb-3">
    <div class="col-md-4 col-lg-3">品項</div>
    <div class="col-md-2 col-lg-3">單價</div>
    <div class="col-md-2 col-lg-3">數量</div>
    <div class="col-md-4 col-lg-3">金額</div>
</div>`;
    if (data.length === 0) {
        strTitle = '';
        str = `<div class="h5-md text-primary text-center py-4">目前尚未有商品</div>`;
    } else {
        data.forEach(function (item) {
            str += `<ul class="row align-items-center border-bottom pb-3 mb-3">
    <li class="col-md-4 col-lg-3 d-flex flex-column flex-md-row align-items-md-center">
        <img src=${item.product.images} class="cartImg mb-2 mr-md-3">
        <h4 class="h6"><span class="d-md-none">品名：</span>${item.product.title}</h4>
    </li>
    <li class="col-md-2 col-lg-3">
        <h5 class="h6"><span class="d-md-none">單價：</span>NT$${item.product.price}</h5>
    </li>
    <li class="col-md-2 col-lg-3">
        <div><span class="d-md-none">數量：</span>${item.quantity}</div>
    </li>
    <li class="col-md-4 col-lg-3 d-flex align-items-center justify-content-between">
        <h5 class="h6"><span class="d-md-none">金額：</span>NT$${item.product.price * item.quantity}</h5>
        <a href="#" class="material-icons text-dark" data-id="${item.id}">
            close
        </a>
    </li>
    </ul>`
        })
    }
    totalMoney.textContent = `NT$${finalTotal}`;
    cartList.innerHTML = strTitle + str;
}

// 清除購物車內全部產品
function deleteAllCartList(e) {
    e.preventDefault();

    axios.delete(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${api_path}/carts`).
    then(function (response) {
        dataCartList = response.data.carts;
        // 最後總金額
        let finalTotal = response.data.finalTotal;
        // 顯示訊息
        message.innerHTML = `已刪除所有品項`;
        // 訊息動態顯示
        messageActive();
        renderCartList(dataCartList, finalTotal);
    }).catch(function (error) {
        console.log(error);
    })
}


// 刪除購物車內特定產品
function deleteCartItem(e) {
    e.preventDefault();

    if (e.target.getAttribute('class') === 'material-icons text-dark') {
        let cartId = e.target.getAttribute('data-id');
        // console.log(cartId);

        axios.delete(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${api_path}/carts/${cartId}`).
        then(function (response) {
            dataCartList = response.data.carts;
            // 最後總金額
            let finalTotal = response.data.finalTotal;
            // 顯示訊息
            message.innerHTML = `已刪除單筆品項`;
            // 訊息動態顯示
            messageActive();
            renderCartList(dataCartList, finalTotal);
        }).catch(function (error) {
            console.log(error);
        })
    }
}

// 送出購買訂單
function createOrder(e) {
    e.preventDefault();

    const name = document.getElementById('name');
    const tel = document.getElementById('tel');
    const email = document.getElementById('email');
    const address = document.getElementById('address');
    const transaction = document.getElementById('transaction');

    const nameRex = /[^\u4e00-\u9fa5]/;
    const telRex = /^(09)[0-9]{8}$/;
    const emailRex = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9])+$/;

    const dateObj = new Date();
    let date = dateObj.getDate() //15
    let month = dateObj.getMonth() + 1 //6
    let year = dateObj.getFullYear() //2016

    if (month < 10) {
        month = `0${month}`;
    }
    if (date < 10) {
        date = `0${date}`;
    }

    if (name.value === '' || nameRex.test(name.value) || name.value.length < 2) {
        verifyText[0].textContent = '請輸入中文姓名';
        name.focus();
    } else if (tel.value === '' || !telRex.test(tel.value)) {
        verifyText[0].textContent = '';
        verifyText[1].textContent = '請輸入電話號碼';
        tel.focus();
    } else if (email.value === '' || !emailRex.test(email.value)) {
        verifyText[1].textContent = '';
        verifyText[2].textContent = '請輸入 Email';
        email.focus();
    } else if (address.value === '') {
        verifyText[2].textContent = '';
        verifyText[3].textContent = '請輸入地址';
        address.focus();
    } else {
        let obj = {
            user: {
                name: name.value,
                tel: tel.value,
                email: email.value,
                address: address.value,
                payment: transaction.value,
                year: year,
                month: month,
                date: date
            }
        };

        axios.post(`https://hexschoollivejs.herokuapp.com/api/livejs/v1/customer/${api_path}/orders`, {
            "data": obj
        }).then(function (response) {
            // 清除驗證文字
            verifyText.forEach(function (item) {
                item.textContent = '';
            })
            // 清除 input 
            form.reset();
            // 清除購物車產品
            cartList.innerHTML = `<div class="text-primary text-center py-4">目前尚未有商品</div>`;
            // 顯示訊息
            message.innerHTML = `<span class="material-icons text-primary-dark mr-1">check</span>
            已送出預訂資料`;
            // 訊息動態顯示
            messageActive();
        }).catch(function (error) {
            console.log(error);
        })
    }
}

// 訊息顯示
function messageActive() {
    message.classList.add('message--active');
    setTimeout(function () {
        message.classList.remove('message--active');
    }, 1500);
}



/**
 * Controller
 */
productList.addEventListener('click', addCartItem, false);
deleteCart.addEventListener('click', deleteAllCartList, false);
cartList.addEventListener('click', deleteCartItem, false);
selectItem.addEventListener('change', filterProductList, false);
formSend.addEventListener('click', createOrder, false);