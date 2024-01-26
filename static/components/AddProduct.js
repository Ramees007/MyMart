export default {
    template: `<div class="inner-body">

    <div class="vertically-centered-row centered-content">
        <h2 class="text-center">{{title}}</h2>
        <img v-if="!isAdd" src="/static/icons/delete.svg" style="margin-left:16px;" @click="deleteIt">
    </div>

    <div>
        <form class="form-container">
            <div class="form-group">
                <label for="name">Name:</label>
                <input type="text" id="name" v-model="form.name" required>
            </div>

            <div class="form-group">
                <label for="description">Description:</label>
                <textarea id="description" v-model="form.description" required></textarea>
            </div>

            <div class="form-group">
                <label for="price">Price:</label>
                <input type="number" id="price" v-model="form.price" required>
            </div>

            <div class="form-group">
                <label for="unit_qty">Unit Quantity:</label>
                <input type="text" id="unit_qty" v-model="form.unit_qty" required>
            </div>

            <div class="form-group">
                <label for="image_url">Image URL:</label>
                <input type="text" id="image_url" v-model="form.image_url" required>
            </div>

            <div class="form-group">
                <label for="category_id">Category ID:</label>
                <select v-model="selectedCategory">
                    <option id="current_stock" v-for="item in categories" :value="item.id" :key="item.id">{{ item.name
                        }}</option>
                </select>
            </div>

            <div class="form-group">
                <label for="current_stock">Current Stock:</label>
                <input type="number" id="current_stock" v-model="form.current_stock" required>
            </div>

            <p v-if="errorText" class="alert alert-danger" role="alert">{{errorText}}</p>

            <div class="text-center">
                <button type="button" @click="addProduct">Submit</button>
            </div>
        </form>
    </div>
</div>`,
    data() {
        return {
            form: {
                name: '',
                description: '',
                price: '',
                unit_qty: '',
                image_url: '',
                category_id: 0,
                current_stock: ''
            },
            categories: [],
            selectedCategory: 0,
            errorText: '',
            product: null,
            isAdd: true,
            title: 'Add Product'
        };
    },
    methods: {
        addProduct() {
            let error = this.validate()
            if (error) {
                this.errorText = error
                return error
            }

            let productData = {
                name: this.form.name,
                description: this.form.description,
                price: this.form.price,
                unit_qty: this.form.unit_qty,
                image_url: this.form.image_url,
                category_id: this.selectedCategory,
                current_stock: this.form.current_stock
            }

            if (!this.isAdd) {
                productData.id = this.product?.id
            }

            const req = {
                method: this.isAdd ? "POST" : "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem('access_token')
                },
                body: JSON.stringify(productData)
            }
            fetch('/product', req).then(res => {
                if (res.ok) {
                    return res.json()
                } else {
                    return res.json().then(json => {
                        throw new Error(json.message)
                    })
                }
            }).then(data => {
                let msg = this.isAdd ? "Product added successfully" : "Product updated successfully"
                alert(msg)
                this.$router.replace({ path: '/' })
            }).catch(e => {
                this.error = e
                alert(e)
            })

        },
        fetchCategories() {
            const req = {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem('access_token')
                }
            }
            fetch('/categories', req).then(res => {
                if (res.ok) {
                    return res.json()
                } else {
                    return res.json().then(json => {
                        throw new Error(json.message)
                    })
                }
            }).then(data => {
                this.categories = data
                if (this.product?.category_id != null) {
                    this.selectedCategory = this.product.category_id
                }
            }).catch(e => {
                alert(e)
            })
        },
        validate() {
            if (!this.form.name) {
                return "Name required"
            } else if (!this.form.description) {
                return "Description required"
            } else if (!this.form.price) {
                return "Price required"
            } else if (!this.form.unit_qty) {
                return "Unit quantity required"
            } else if (!this.form.image_url) {
                return "Image url required"
            } else if (this.selectedCategory == 0) {
                return "Please select category"
            } else if (!this.form.current_stock) {
                return "Current stock required"
            } else {
                return null
            }
        },
        deleteIt() {
            if (confirm("Are you sure to delete this product?")) {
                const req = {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + localStorage.getItem('access_token')
                    }
                }
                fetch('/product/' + this.product?.id, req).then(res => {
                    if (res.ok) {
                        return res.json()
                    } else {
                        return res.json().then(json => {
                            throw new Error(json.message)
                        })
                    }
                }).then(data => {
                    alert('Product deleted successfully')
                    this.$router.replace({ path: '/' })
                }).catch(e => {
                    alert(e)
                })

            }
        }
    },
    watch: {
        selectedCategory: function () {
            this.errorText = ''
        },
        form: {
            deep: true,
            handler() {
                this.errorText = ''
            }
        }
    },
    mounted: function () {
        this.isAdd = this.$router.currentRoute.name == 'AddProduct'
        this.title = this.isAdd ? 'Add Product' : 'Edit Product'
        this.product = this.$store.getters.getCurrentProduct
        this.$store.commit('setCurrentProduct', null);
        if (this.product != null) {
            this.form = this.product
        }
        this.fetchCategories()
    }
}