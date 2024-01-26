import ProductComponent from "./ProductComponent.js"
export default {
    template: `
<div class="inner-body">

    <h2>Products</h2>

    <div>
        <p v-if="!categoryProducts.length"> No products found </p>
        <div class="row mt-4" v-for="item in categoryProducts">

            <p>{{ item.name }}</p>

       
                <div class="scrolling-container">
                    <ProductComponent v-for="product in item.products" :product="product" v-bind:key="product.id"></ProductComponent>
                </div>
          

        </div>
    </div>

</div>

`,
    data() {
        return {
            categoryProducts: []
        }
    },
    methods: {
        moveToAddProduct: function () {
            this.$router.push({ path: '/add-product' })
        }

    },
    mounted: function () {
        const req = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem('access_token')
            }
        }
        fetch('/category_products', req).then(res => {
            if (res.ok) {
                return res.json()
            } else {
                if (res.status == 401) {
                    throw new Error(res.status)
                }
                return res.json().then(json => {
                    throw new Error(json.msg)
                })
            }
        }).then(data => {
            this.categoryProducts = data
        }).catch(e => {
            if (e.message == 401) {
                alert("Session expired, login to continue")
                localStorage.removeItem("access_token");
                this.$router.push({ path: '#/login' }).catch(() => {});
            } else {
                this.error = e
                alert(e)
            }

        })
    },
    components: {
        ProductComponent
    }
}