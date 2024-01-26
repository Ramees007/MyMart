import Home from "./components/Home.js"
import Login from "./components/Login.js"
import BasketComponent from './components/BasketComponent.js';
import Register from "./components/Register.js";
import AddProduct from "./components/AddProduct.js"
import AddCategory from './components/AddCategory.js';
import Categories from "./components/Categories.js";
import Orders from "./components/Orders.js"
import ProductSearch from "./components/ProductSearch.js";
import ManageUsers from "./components/ManageUsers.js";
import Exports from "./components/Exports.js";
import ProductDetails from "./components/ProductDetails.js"

const routes = [
    {
        path: '/', component: Home, name: 'Home'
    },
    {
        path: '/login',
        component: Login,
        name: 'Login',
        meta: {
            hideNavbar: true,
        }
    },
    {
        path: '/basket', component: BasketComponent, name: 'Basket'
    },
    {
        path: '/register',
        component: Register,
        name: 'Register',
        meta: {
            hideNavbar: true,
        }
    },
    {
        path: '/add-product',
        component: AddProduct,
        name: 'AddProduct'
    },
    {
        path: '/edit-product',
        component: AddProduct,
        name: 'EditProduct'
    },
    {
        path: '/add-category', component: AddCategory, name: 'AddCategory'
    },
    {
        path: '/edit-category', component: AddCategory, name: 'EditCategory'
    },
    {
        path: '/categories', component: Categories, name: 'Categories'
    },
    {
        path: '/orders', component: Orders, name: 'Orders'
    },
    {
        path: '/product-search', component: ProductSearch, name: 'ProductSearch'
    },
    {
        path: '/user-management', component: ManageUsers, name: 'ManageUsers'
    },
    {
        path: '/export-products', component: Exports, name: 'ExportProducts'
    },
    {
        path: '/product-details/:id', component: ProductDetails, name: 'ProductDetails'
    }
]

export default new VueRouter({
    routes,
})