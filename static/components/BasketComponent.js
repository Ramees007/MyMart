export default {
    template: `<div class="inner-body">
    <h2>Basket</h2>
    <div class="basket-container">
        <div v-if="!basketItems.length">Your basket is empty</div>
        <div class="basket-product-list">

            <div v-for="basketItem in basketItems">
                <div class="basket-product" style="width: auto;">
                    <img class="product-image-small" :src="basketItem.product.image_url" alt="Card Image">

                    <div class="basket-product-body">

                        <h5>{{ basketItem.product.name }}</h5>

                        <div class="vertically-centered-row">
                            <div>Quantity:</div>
                            <button class="decrement-btn" @click="decrementQuantity(basketItem)">-</button>
                            <span class="quantity-value">{{basketItem.qty}}</span>
                            <button class="increment-btn" @click="incrementQuantity(basketItem)">+</button>
                        </div>

                        <div>Price: ₹ {{ basketItem.product.price * basketItem.qty}}</div>
                        <div v-if="basketItem.product.current_stock < basketItem.qty" class="error-text">Out of stock,
                            please remove from basket to place order</div>


                    </div>

                </div>
                <div
                    style="height:1px;  margin-right: 10px;  background-image: linear-gradient(to right,lightgrey, white)">
                </div>
            </div>


        </div>
        <div class="cost-summary">
            <h3>Cost Summary</h3>
            <p class="mt-4">Item count: {{basketCount}} </p>
            <p>Total: ₹ {{basketTotal}} </p>
            <button :disabled="!basketItems.length" @click="purchase()">Purchase</button>

        </div>
    </div>
</div>`,
    data() {
        return {
            basketItems: [],
            basketTotal: '',
            basketId: 0
        }
    },
    methods: {
        incrementQuantity: function (basketItem) {
            this.basketAction(true, basketItem.product).then(res => {
                if (res.ok) {
                    return res.json()
                } else {
                    return res.json().then(json => {
                        throw new Error(json.message)
                    })
                }
            }).then(data => {
                basketItem.qty += 1
                this.basketTotal += basketItem.product.price
                alert(data.message)
            }).catch(e => {
                alert(e)
            })
        },
        decrementQuantity: function (basketItem) {
            this.basketAction(false, basketItem.product).then(res => {
                if (res.ok) {
                    return res.json()
                } else {
                    return res.json().then(json => {
                        throw new Error(json.message)
                    })
                }
            }).then(data => {
                basketItem.qty -= 1
                if (basketItem.qty == 0) {
                    this.fetchBasket()
                } else {
                    alert(data.message)
                }
                this.basketTotal -= basketItem.product.price
            }).catch(e => {
                alert(e)
            })
        },
        basketAction: async function (isAdd, product) {
            let item = {
                product_id: product.id,
                action: isAdd ? "add" : "remove"
            }
            const req = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem('access_token')
                },
                body: JSON.stringify(item)

            }
            return fetch('/basket', req)
        },
        fetchBasket: function () {
            const req = {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem('access_token')
                }
            }
            fetch('/basket', req).then(res => {
                if (res.ok) {
                    return res.json()
                } else {
                    return res.json().then(json => {
                        throw new Error(json.msg)
                    })
                }
            }).then(data => {
                this.basketItems = data.products
                this.basketTotal = data.total
                this.basketId = data.id
            }).catch(e => {
                this.error = e
                alert(e)
            })
        },
        purchase: function () {
            const req = {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem('access_token')
                }
            }
            fetch('/purchase', req).then(res => {
                if (res.ok) {
                    return res.json()
                } else {
                    return res.json().then(json => {
                        throw new Error(json.message)
                    })
                }
            }).then(data => {
                alert(data.message)
                this.$router.replace({ path: '/' })
            }).catch(e => {
                alert(e)
            })
        }
    },
    computed: {
        basketCount: function () {
            let count = 0
            this.basketItems.forEach(basketItem => {
                count += basketItem.qty
            });
            return count
        }
    },
    mounted: function () {
        this.fetchBasket()
    }
}