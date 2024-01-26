export default {
    template: `
    <div class="inner-body">
    <h2>Orders</h2>

    <div v-if="!orders.length">Your order history is empty</div>

    <div v-for="order in orders" class="card p-2" style="margin-bottom:10px;">
    <p> Date: {{ order.dateStr }}</p>
    <p> Time: {{ order.timeStr }}</p>
    <p> Order Total: ₹ {{ order.order_total }}</p>

    </div>
    </div>
    `,
    data() {
        return {
            orders: []
        }
    },
    methods: {

    },
    mounted: function () {
        const req = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem('access_token')
            }
        }
        fetch('/orders', req).then(res => {
            if (res.ok) {
                return res.json()
            } else {
                return res.json().then(json => {
                    throw new Error(json.msg)
                })
            }
        }).then(data => {
            this.orders = data
            this.orders.forEach(order => {
                let date = new Date(order.create_date);
                order.dateStr = date.toLocaleDateString()
                order.timeStr = date.toLocaleTimeString()
            });
        }).catch(e => {
            this.error = e
            alert(e)
        })
    }
}