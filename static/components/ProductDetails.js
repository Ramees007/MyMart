export default {
    template: `
<div class="inner-body vertical-flow">
    <img class="product-image" :src="product?.image_url ?? ''" style="margin-top: 10vh;margin: 0 auto;">
    <br>
    <h5>{{ product?.name ?? '' }}</h5>
    <p>{{ product?.description ?? ''  }}</p>
    <p>Rs {{ product?.price ?? ''  }} per {{ product?.unit_qty ?? '' }}</p>
    <p>{{ product?.stockText ?? ''  }}</p>
    <p></p>
</div>
`,
    data() {
        return {
            productId: '',
            product: null,
            productImage: ''
        }
    },
    methods: {
        fetchProduct: function () {
            const req = {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem('access_token')
                }
            }
            let url = '/product/' + this.productId
            fetch(url, req).then(res => {
                if (res.ok) {
                    return res.json()
                } else {
                    return res.json().then(json => {
                        throw new Error(json.message)
                    })
                }
            }).then(data => {
                this.product = data
                this.product.stockText = this.product.current_stock > 0 ? "In Stock" : "Out of stock"
            }).catch(e => {
                alert(e)
            })
        }
    },
    mounted: function () {
        this.productId = this.$route.params.id
        if (this.product == null) {
            this.fetchProduct()
        }
    },
    created: function () {
        this.product = this.$store.getters.getCurrentProduct
        if (this.product != null) {
            this.$store.commit('setCurrentProduct', null);
            this.product.stockText = this.product.current_stock > 0 ? "In Stock" : "Out of stock"
        }
    },
}