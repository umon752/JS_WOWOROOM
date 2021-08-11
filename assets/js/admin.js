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
const tbody = document.querySelector('.js-tbody');
const deleteOrder = document.querySelector('.js-deleteOrderAll');
const modal = document.querySelector('#modal');
const modalBody = document.querySelector('.js-modalBody');
const message = document.querySelector('.js-message');
const btnGroup = document.querySelectorAll('.js-btnGroup');
const chartTitle = document.querySelector('.js-chartTitle');
const chart = document.querySelector('.js-chart');



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
// 顏色 (深到淺 -> 排名高到低 (共四個排名))
let colors = [primaryDark, primary, primaryLight, light];



/**
 * init
 */
function init() {
    // 在 axios header 內統一加上 token (就不需在每個方法內一一夾帶)
    axios.defaults.headers.common.Authorization = token;
    getOrderList();
}
init();



// 全品項營收比重資料處理
function productTitle(data) {
    if (data.length === 0) {
        chart.innerHTML = `<div class="h5-md text-primary py-4">目前尚未有訂單</div>`;
    } else {
        let obj = {};
        let objAry = [];
        let productTitle = [];
        data.forEach(function (item) {
            item.products.forEach(function (value) {
                if (obj[value.title] === undefined) {
                    obj[value.title] = value.price * value.quantity;
                } else {
                    obj[value.title] = value.price * value.quantity;
                }
            })
        })

        objAry = Object.keys(obj);
        objAry.forEach(function (item) {
            let ary = [];
            ary.push(item);
            ary.push(obj[item]);
            productTitle.push(ary);
        })

        // 排序 (多到少)
        productTitle.sort(function (a, b) {
            return b[1] - a[1];
        });

        if (productTitle.length >= 4) {
            // 第三名之後的格式
            let ary = ["其他", 0];

            productTitle.forEach(function (item, index) {
                if (index > 2) {
                    ary[1] += item[1];
                }
            })
            // 將 ary 放到 productTitle 陣列第 4 筆
            productTitle.splice(3, 0, ary);
            // 刪除 productTitle 陣列第 4 筆之後的資料
            productTitle.splice(4, productTitle.length - 1);
        }
        renderC3(productTitle);
    }
}

// 全產品類別營收比重資料處理
function productCategory(data) {
    if (data.length === 0) {
        chart.innerHTML = `<div class="h5-md text-primary py-4">目前尚未有訂單</div>`;
    } else {
        let obj = {};
        let objAry = [];
        let productCategory = [];
        data.forEach(function (item) {
            item.products.forEach(function (value) {
                if (obj[value.category] === undefined) {
                    obj[value.category] = value.quantity;
                } else {
                    obj[value.category] += value.quantity;
                }
            })

        })
        objAry = Object.keys(obj);
        objAry.forEach(function (item) {
            let ary = [];
            ary.push(item);
            ary.push(obj[item]);
            productCategory.push(ary);
        })

        // 排序 (多到少)
        productCategory.sort(function (a, b) {
            return b[1] - a[1];
        });

        renderC3(productCategory);
    }
}

// 渲染圓餅圖
function renderC3(array) {

    // 處理顏色格式
    let arrayName = {};
    array.forEach(function (item, index) {
        if (arrayName[item[0]] === undefined) {
            arrayName[item[0]] = colors[index];
        }
    })

    const pieChart = c3.generate({
        bindto: ".js-chart", // HTML 元素綁定
        data: {
            columns: array, // 資料存放
            type: "pie", // 圖表種類
            colors: arrayName
        }
    });
}

// 點擊按鈕 圖表切換
function toggleChart(e) {
    let text = e.target.textContent;

    // 移除.focus
    btnGroup.forEach(function (item) {
        item.classList.remove("focus");
    })

    if (text) {
        // 標題
        chartTitle.textContent = text;
        // 圖表
        if (text === '全產品類別營收比重') {
            productCategory(dataOrderList);
        } else {
            productTitle(dataOrderList);
        }
    }
}

// 取得訂單列表
function getOrderList() {
    axios.get(`${baseUrl}/api/livejs/v1/admin/${api_path}/orders`)
        .then(function (response) {
            // 訂單列表資料
            dataOrderList = response.data.orders;
            // 重新渲染圖表
            productTitle(dataOrderList);
            // 重新訂單列表
            renderOrderList(dataOrderList);
        }).catch(function () {
            // 顯示訊息
            message.innerHTML = `${errorIcon}發生錯誤，請重新整理頁面`;
        })
}

// 渲染訂單列表
function renderOrderList(data) {
    let str = '';
    if (data.length === 0) {
        // 新增按鈕 disabled 狀態
        deleteOrder.classList.add('disabled');
    } else {
        // 移除按鈕 disabled 狀態
        deleteOrder.classList.remove('disabled');
    }
        data.forEach(function (item, index) {
            // 訂單日期處理
            const dateObj = new Date(item.createdAt * 1000);
            let date = dateObj.getDate()
            let month = dateObj.getMonth() + 1
            let year = dateObj.getFullYear()

            if (month < 10) {
                month = `0${month}`;
            }
            if (date < 10) {
                date = `0${date}`;
            }

            let orderDate = `${year}/${month}/${date}`;

            str += `<tr>
        <td>${item.id}</td>
        <td>${item.user.name} ${item.user.tel}</td>
        <td>${item.user.address}</td>
        <td>${item.user.email}</td>
        <td><a href="#" class="js-check text-primary-dark" data-toggle="modal" data-target="#modal${index}">查看訂單</a></td>
        <td>${orderDate}</td>
        <td>${orderStatus(item.paid, item.id)}</td>
        <td>
            <a href="#" class="material-icons h5 text-secondary-light" data-id="${item.id}">delete</a>
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

    modal.id = `modal${index}`;
    let strModalBody = '';
    let strModalFooter = '';

    dataOrderList[index].products.forEach(function (item) {
        strModalBody += `<li class="row align-items-center mb-2">        
        <span class="col-9 col-md-7">${item.title}</span>
        <span class="col-3 col-md-2">x${item.quantity}</span>
        <span class="col-md-3 d-none d-md-block">NT$${toThousands(item.price*item.quantity)}</span>
        </li>`;
        strModalFooter = `<div class="border-top border-secondary-light text-right pt-2 mt-3">總金額<span class="ml-3">NT$${toThousands(dataOrderList[index].total)}</span></div>`
    })

    modalBody.innerHTML = strModalBody + strModalFooter;
}

// 訂單狀態條件
function orderStatus(paid, id) {
    if (paid) {
        return `<button class="btn text-secondary" data-id="${id}" data-paid="${paid}">已處理</button>`;
    } else {
        return `<button class="btn text-primary-dark" data-id="${id}" data-paid="${paid}">未處理</button>`;
    }
}

// 修改訂單狀態、刪除特定訂單
function editOrderList(e) {
    e.preventDefault();

    let orderId = e.target.dataset.id;

    // 修改訂單狀態
    if (e.target.dataset.paid) {
        let paidStatus = e.target.dataset.paid;
        let newStatus;

        if (paidStatus == 'true') {
            newStatus = false;
        } else {
            newStatus = true;
        }

        let obj = {
            id: orderId,
            paid: newStatus
        };

        axios.put(`${baseUrl}/api/livejs/v1/admin/${api_path}/orders`, {
                "data": obj
            })
            .then(function (response) {
                dataOrderList = response.data.orders;
                // 顯示訊息
                message.innerHTML = `${checkIcon}訂單狀態修改成功！`;
                // 訊息動態顯示
                messageActive();
                // 重新渲染訂單列表
                renderOrderList(dataOrderList);
            }).catch(function () {
                // 顯示訊息
            message.innerHTML = `${errorIcon}發生錯誤，請重新整理頁面`;
            })
    }



    // 刪除特定訂單
    if (e.target.textContent === "delete") {
        // 顯示 spinner
        e.target.innerHTML = spinner('text-secondary-light', '');

        axios.delete(`${baseUrl}/api/livejs/v1/admin/${api_path}/orders/${orderId}`)
            .then(function (response) {
                dataOrderList = response.data.orders;
                // 顯示訊息
                message.innerHTML = `${checkIcon}已刪除此筆訂單！`;
                // 隱藏 spinner
                e.target.innerHTML = `delete`;
                // 訊息動態顯示
                messageActive();
                // 重新渲染圖表
                productTitle(dataOrderList);
                // 重新渲染訂單列表
                renderOrderList(dataOrderList);
            }).catch(function () {
                // 顯示訊息
            message.innerHTML = `${errorIcon}發生錯誤，請重新整理頁面`;
            })
    }
}

// 刪除全部訂單
function deleteAllOrder(e) {
    e.preventDefault();

    if (dataOrderList.length !== 0) {
        // 顯示 spinner
        e.target.innerHTML = spinner('text-secondary-light', '<span class="ml-2">清除全部訂單</span>');
        axios.delete(`${baseUrl}/api/livejs/v1/admin/${api_path}/orders`)
            .then(function (response) {
                dataOrderList = response.data.orders;
                // 顯示訊息
                message.innerHTML = `${checkIcon}已刪除全部訂單！`;
                // 訊息動態顯示
                messageActive();
                // 隱藏 spinner
                e.target.innerHTML = `清除全部訂單`;
                // 重新渲染圖表
                productTitle(dataOrderList);
                // 重新渲染訂單列表
                renderOrderList(dataOrderList);
            }).catch(function () {
                // 顯示訊息
            message.innerHTML = `${errorIcon}發生錯誤，請重新整理頁面`;
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
tbody.addEventListener('click', editOrderList, false);
btnGroup.forEach(function (item) {
    item.addEventListener('click', toggleChart, false);
})
deleteOrder.addEventListener('click', deleteAllOrder, false);