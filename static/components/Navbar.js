import { getRole, getEmail } from "../Utils.js"
export default {
  template: `

<nav class="navbar navbar-expand-lg  navbar-dark bg-dark">
  <div class="container-fluid">

    <div class="navbar-brand">
      <a class="navbar-brand" href="/">{{ brandName }}</a>
      <label style="font-size: small;">{{ userEmail }}</label>
    </div>

    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
      aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse justify-content-end" id="navbarNav">
      <ul class="navbar-nav">
        <li class="nav-item" v-if="shouldShowHome">
          <a class="nav-link" aria-current="page" href="#/">Home</a>
        </li>
        <li class="nav-item" v-if="shouldShowBasket">
          <a class="nav-link" href="#/basket">Basket</a>
        </li>
        <li class="nav-item" v-if="shouldShowOrders">
          <a class="nav-link" href="#/orders">Orders</a>
        </li>


        <li class="nav-item" v-if="shouldShowCategories">
          <a class="nav-link" href="#/categories">Categories</a>
        </li>

        <li class="nav-item dropdown" v-if="isNotUser">
          <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown"
            aria-expanded="false">
            Actions
          </a>
          <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
            <li><a class="dropdown-item" href="#/add-product">Add Product</a></li>
            <li>
              <hr class="dropdown-divider">
            </li>
            <li><a class="dropdown-item" href="#/add-category">Add Category</a></li>
            <li v-if="shouldShowUserManagement">
              <hr class="dropdown-divider">
            </li>
            <li v-if="shouldShowUserManagement"><a class="dropdown-item" href="#/user-management">Manage Users</a></li>

            <li v-if="shouldShowExportProducts">
              <hr class="dropdown-divider">
            </li>
            <li v-if="shouldShowExportProducts"><a class="dropdown-item" href="#/export-products">Export Products</a>
            </li>

          </ul>
        </li>

        <li class="nav-item">
          <a class="nav-link" href="#/product-search" v-if="shouldShowSearch">Search Product</a>
        </li>


        <li class="nav-item">
          <a class="nav-link" href="#" @click="logout">Logout</a>
        </li>
      </ul>
    </div>
  </div>
</nav>

`,
  data() {
    return {

    }
  },
  methods: {
    logout: function () {
      localStorage.removeItem("access_token");
      this.$router.push({ path: '#/login' })
    },
    currentRouteName: function () {
      return this.$route.name;
    }
  },
  computed: {
    shouldShowBasket: function () {
      return getRole() == 'user' && this.currentRouteName() !== 'Basket'
    },
    shouldShowOrders: function () {
      return getRole() == 'user' && this.currentRouteName() !== 'Orders'
    },
    isNotUser: function () {
      return getRole() != 'user'
    },
    shouldShowHome: function () {
      return this.currentRouteName() !== 'Home'
    },
    shouldShowSearch: function () {
      return this.currentRouteName() !== 'ProductSearch'
    },
    shouldShowUserManagement: function () {
      return getRole() == 'admin'
    },
    shouldShowCategories: function () {
      return this.currentRouteName() != 'Categories' && this.isNotUser
    },
    shouldShowExportProducts: function () {
      return this.currentRouteName() != 'ExportProducts' && getRole() == 'store_manager'
    },
    brandName: function () {
      let title = "My Mart"
      switch (getRole()) {
        case 'store_manager':
          title = "My Mart - Store Manager"
          break
        case 'admin':
          title = "My Mart - Admin"
          break
        default:
          title = "My Mart"
      }
      return title
    },
    userEmail: function () {
      let email = ""
      if (getRole() != 'admin') {
        email = getEmail()
      }
      return email
    }
  }
}