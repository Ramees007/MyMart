import ProductComponent from "./ProductComponent.js"
export default {
    template:
        `
<div class="inner-body">

    <h2>Search Products</h2>

    <div class="search-item">

        <div class="no-shrink">Filter By: </div>
        <div>Category </div>
        <div class="dropdown">
            <button class="btn btn-light dropdown-toggle border" type="button" id="dropdownMenuButton1"
                data-bs-toggle="dropdown" aria-expanded="false">
                {{ selectedcategory?.name ?? "Select Category" }}
            </button>
            <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                <li>
                    <div class="dropdown-item" v-for="category in categories" @click="selectCategory(category)"> {{
                        category.name }}</div>
                </li>
            </ul>
        </div>

        <div class="search-item">
            <div class="no-shrink">Price Range </div>
            <div class="dropdown">
                <button class="btn btn-light dropdown-toggle border" type="button" id="dropdownMenuButton1"
                    data-bs-toggle="dropdown" aria-expanded="false">
                    {{ selectedPriceRange?.text ?? "Select Price Range" }}
                </button>
                <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                    <li>
                        <div class="dropdown-item" v-for="price in priceRanges" @click="selectPriceRange(price)"> {{
                            price.text }}</div>
                    </li>
                </ul>
            </div>
        </div>

    </div>

    <div class="search-item mt-2">
        <input type="text" placeholder="Enter Search Term" aria-label="Search Product" v-model="term"
            style="width:250px;">
        <button class="small" type="search" @click="search">Submit</button>
    </div>

    <div style="display: flex; flex-wrap: wrap; gap: 10px;">
        <ProductComponent v-for="product in products" :product="product" v-bind:key="product.id" class="no-shrink">
        </ProductComponent>
    </div>

</div>

`,
    data() {
        return {
            term: '',
            products: [],
            categories: [],
            priceRanges: [],
            selectedcategory: null,
            selectedPriceRange: null
        }
    },
    methods: {

        search: function () {
            const req = {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem('access_token')
                }
            }
            let url = '/product-search?name=' + this.term + '&category=' + (this.selectedcategory?.id ?? '') + '&price=' +
                (this.selectedPriceRange?.id ?? '')
            fetch(url, req).then(res => {
                if (res.ok) {
                    return res.json()
                } else {
                    return res.json().then(json => {
                        throw new Error(json.message)
                    })
                }
            }).then(data => {
                this.products = data
            }).catch(e => {
                alert(e)
            })
        },
        fetchCategories: function () {
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
                let cat = {
                    "name": "All",
                    "id": -1
                }
                data.push(cat)
                this.categories = data
                this.selectedcategory = cat
            }).catch(e => {
                alert(e)
            })
        },
        preparePriceRange: function () {
            let anyPR = { "text": "Any", "id": "0:-1" }
            this.priceRanges = [{ "text": "Below 50", "id": "0:50" }, { "text": "50 - 100", "id": "50:100" }, {
                "text": "100 - 200",
                "id": "100:200"
            }, { "text": "200 - 500", "id": "200:500" }, { "text": "Above 500", "id": "500:-1" }, anyPR]
            this.selectedPriceRange = anyPR
        },
        selectCategory: function (category) {
            this.selectedcategory = category
        },
        selectPriceRange: function (priceRange) {
            this.selectedPriceRange = priceRange
        }

    },
    mounted: function () {
        this.fetchCategories()
        this.preparePriceRange()
    },
    components: {
        ProductComponent
    }
}