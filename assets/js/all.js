/**
 * DOM
 */
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
    loading();
    getProductList();
    getCartList();
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

    window.onload = function () {
        setTimeout(function () {
            // loading 消失
            loading.classList.add('loading--fadeOut');

            // Anime 停止
            animation.pause();

            // 載入 AOS
            AOS.init({
                easing: 'ease',
                duration: 800,
                once: true
            });
        }, 1200);
    }
};

// 取得產品列表
function getProductList() {
    axios.get(`${baseUrl}/api/livejs/v1/customer/${api_path}/products`).
    then(function (response) {
        dataProductList = response.data.products;
        renderProductList();
        filterSelect();
    }).catch(function (error) {
        console.log(error);
    })
}

// 產品列表的 HTML
function renderStr(item) {
    return `<li class="col-6 col-md-4 col-lg-3 mb-4">
    <div class="productTag bg-dark text-white py-2 px-4">新品</div>
    <a href="#" class="productImg d-block overflow-hidden">
    <img src=${item.images} class="productImg--bigger">
    </a>
    <a href="#" class="btn btn-dark rounded-0 w-100 mb-2" data-id="${item.id}">加入購物車</a>
    <h4 class="font-size-sm h6-md mb-md-2"><a href="#" class="text-dark">${item.title}</a></h4>
    <del class="font-size-sm h6-md">NT$${toThousands(item.origin_price)}</del>
    <h5 class="h6 h5-md">NT$${toThousands(item.price)}</h5>
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

// 渲染產品列表
function filterSelect() {

    let unSort = dataProductList.map(function (item) {
        return item.category;
    })
    let sorted = unSort.filter(function (item, i) {
        return unSort.indexOf(item) === i;
    })
    sorted.unshift("全部");

    let str = '';
    sorted.forEach(function (item) {
        str += `<option value=${item}>${item}</option>`
    })
    selectItem.innerHTML = str;
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
    if (e.target.dataset.id) {
        // 產品 ID
        let productId = e.target.dataset.id;
        // 數量
        let num = 1;

        // 該產品已存在購物車中，數量 +1
        dataCartList.forEach(function (item) {
            if (item.product.id === productId) {
                num = item.quantity += 1;
            }
        })

        let obj = {
            productId: productId,
            quantity: num
        };
        // console.log(obj);
        axios.post(`${baseUrl}/api/livejs/v1/customer/${api_path}/carts`, {
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
    axios.get(`${baseUrl}/api/livejs/v1/customer/${api_path}/carts`).
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
        <img src=${item.product.images} class="cartImg mb-2 mr-md-3 mb-md-0">
        <h4 class="h6"><span class="d-md-none">品名：</span>${item.product.title}</h4>
    </li>
    <li class="col-md-2 col-lg-3">
        <h5 class="h6"><span class="d-md-none">單價：</span>NT$${item.product.price}</h5>
    </li>
    <li class="col-md-2 col-lg-3 d-flex align-items-center">
    <span class="d-md-none">數量：</span>
        <button class="material-icons btn text-secondary h5 p-1 mr-2" data-id="${item.id}" ${quantityStatus(item.quantity)}>remove</button>
        ${item.quantity}
        <button class="material-icons btn text-secondary h5 p-1 ml-2" data-id="${item.id}">add</button>
    </li>
    <li class="col-md-4 col-lg-3 d-flex align-items-center justify-content-between">
        <h5 class="h6"><span class="d-md-none">金額：</span>NT$${toThousands(item.product.price * item.quantity)}</h5>
        <a href="#" class="material-icons text-dark" data-id="${item.id}">close</a>
    </li>
    </ul>`
        })
    }
    totalMoney.textContent = `NT$${toThousands(finalTotal)}`;
    cartList.innerHTML = strTitle + str;
}

// 刪除數量按鈕狀態條件
function quantityStatus(quantity) {
    if (quantity === 1) {
        return `disabled`;
    } else {
        return;
    }
}

// 清除購物車內全部產品
function deleteAllCartList(e) {
    e.preventDefault();
    if (dataCartList.length !== 0) {
        axios.delete(`${baseUrl}/api/livejs/v1/customer/${api_path}/carts`).
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
}


// 修改數量、刪除購物車內特定產品
function editCartItem(e) {
    e.preventDefault();

    let cartId = e.target.dataset.id;
    // 刪除購物車內特定產品
    if (e.target.textContent === "close") {
        // console.log(cartId);

        axios.delete(`${baseUrl}/api/livejs/v1/customer/${api_path}/carts/${cartId}`).
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

    // 增加購物車產品數量
    if (e.target.textContent === "add") {
        // 數量
        let num = 1;
        // 該產品已存在購物車中，數量 +1
        dataCartList.forEach(function (item) {
            if (item.id === cartId) {
                num = item.quantity += 1;
            }
        })

        let obj = {
            id: cartId,
            quantity: num
        };

        axios.patch(`${baseUrl}/api/livejs/v1/customer/${api_path}/carts`, {
                "data": obj
            })
            .then(function (response) {
                dataCartList = response.data.carts;
                // 最後總金額
                let finalTotal = response.data.finalTotal;
                renderCartList(dataCartList, finalTotal);
            }).catch(function (error) {
                console.log(error);
            })
    }

    // 減少購物車產品數量
    if (e.target.textContent === "remove") {
        // 數量
        let num = 1;
        // 該產品已存在購物車中，數量 +1
        dataCartList.forEach(function (item) {
            if (item.id === cartId) {
                num = item.quantity -= 1;
            }
        })

        // 數量小於 1 時中斷
        if (num < 1) {
            return;
        }

        let obj = {
            id: cartId,
            quantity: num
        };

        axios.patch(`${baseUrl}/api/livejs/v1/customer/${api_path}/carts`, {
                "data": obj
            })
            .then(function (response) {
                dataCartList = response.data.carts;
                // 最後總金額
                let finalTotal = response.data.finalTotal;
                renderCartList(dataCartList, finalTotal);
            }).catch(function (error) {
                console.log(error);
            })
    }
}

// 送出購買訂單
function createOrder(e) {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const tel = document.getElementById('tel').value.trim();
    const email = document.getElementById('email').value.trim();
    const address = document.getElementById('address').value.trim();
    const transaction = document.getElementById('transaction').value;

    const nameRex = /[^\u4e00-\u9fa5-\a-zA-Z]/;
    const telRex = /^[0-9\-]{7,11}$/;
    const emailRex = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9])+$/;

    if (dataCartList.length === 0) {
        // 顯示訊息
        message.innerHTML = `購物車尚未有商品`;
        // 訊息動態顯示
        messageActive();
    } else {
        if (name === '' || nameRex.test(name) || name.length < 2) {
            verifyText[0].textContent = '請輸入姓名';
            name.focus();
        } else if (tel === '') {
            verifyText[0].textContent = '';
            verifyText[1].textContent = '請輸入電話號碼';
            tel.focus();
        } else if (!telRex.test(tel)) {
            verifyText[0].textContent = '';
            verifyText[1].textContent = '電話號碼輸入有誤';
            tel.focus();
        } else if (email === '' || !emailRex.test(email)) {
            verifyText[1].textContent = '';
            verifyText[2].textContent = '請輸入 Email';
            email.focus();
        } else if (address === '') {
            verifyText[2].textContent = '';
            verifyText[3].textContent = '請輸入地址';
            address.focus();
        } else {
            let obj = {
                user: {
                    name: name,
                    tel: tel,
                    email: email,
                    address: address,
                    payment: transaction
                }
            };

            axios.post(`${baseUrl}/api/livejs/v1/customer/${api_path}/orders`, {
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
                // 總金額歸 0
                totalMoney.textContent = `NT$0`;
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
cartList.addEventListener('click', editCartItem, false);
selectItem.addEventListener('change', filterProductList, false);
formSend.addEventListener('click', createOrder, false);