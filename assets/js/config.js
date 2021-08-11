const api_path = 'umon752';
const baseUrl = "https://livejs-api.hexschool.io";
const token = 'oXQlr3K4qDTYUtYt4dv53DGCS3V2';

// 共用元件
// spinner
function spinner(color = 'text-secondary-light', text) {
    console.log(color, text)
    return`<div class="spinner-border spinner-border-sm ${color}" role="status">
    <span class="sr-only">Loading...</span>
    </div>${text}`;
}


// checkIcon
let checkIcon = `<span class="material-icons text-primary mr-2">check_circle</span>`
// errorIcon
let errorIcon = `<span class="material-icons text-primary mr-2">error</span>`