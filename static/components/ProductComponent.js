import { getRole } from "../Utils.js"
export default {
    props: {
        product: {

        }
    },
    template: `
    <div class="card no-shrink">
    <img class="card-img-top product-image" :src="product.image_url" alt="Card Image">
    <div class="card-body">
        <h5 class="card-text text-wrap text-center">{{ product.name }}</h5>
        <p class="text-wrap card-text text-center">{{ product.description }}</p>
        <p class="text-wrap card-text text-center">Rs {{ product.price }} per {{ product.unit_qty }}</p>
        <div class="text-center">
        <button type="submit"  :disabled="product.current_stock <= 0" @click="productAction" class="small">{{ actionText }}</button>

        <a  @click="navigateToProductDetail" class="view-product-link">View Details</a>
        </div>
    </div>
</div>
    `,
    data() {
        return {
            actionText: '',
            role: ''
        }
    },

    methods: {
        productAction() {
            if (this.role != 'user') {
                this.$store.commit('setCurrentProduct', this.product);
                this.$router.push({
                    path: '/edit-product'
                })
            } else {
                this.addToBasket()
            }

        },
        addToBasket() {
            let item = {
                product_id: this.product.id,
                action: "add"
            }
            const req = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem('access_token')
                },
                body: JSON.stringify(item)
            }
            fetch('/basket', req).then(res => {
                if (res.ok) {
                    return res.json()
                } else {
                    return res.json().then(json => {
                        throw new Error(json.message)
                    })
                }
            }).then(data => {
                alert(data.message)
            }).catch(e => {
                alert(e)
            })
        },
        navigateToProductDetail: function () {
            this.$store.commit('setCurrentProduct', this.product);
            this.$router.push({
                path: '/product-details/' + this.product.id
            })
        }
    },
    computed: {
        getActionText() {
            let text = ''
            switch (this.role) {
                case 'user':
                    if (this.product.current_stock > 0) {
                        text = 'Add to Basket'
                    } else {
                        text = 'Out of Stock'
                    }

                    break;
                default:
                    text = 'Edit'
            }
            return text;
        }
    },
    mounted: function () {
        this.role = getRole()
        this.actionText = this.getActionText
    }
}