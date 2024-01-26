import { getRole } from "../Utils.js"

export default {
    template: `
<div class="inner-body">

    <h2>Categories</h2>
    <p v-if="!categories.length" class="p-2">No categories found</p>
    <div class="wrapping-list">
        <div v-for="category in categories" class="card padded-body no-shrink">
            <div class="category-cell">
                <h5 class="no-grow-flex-item">{{category.name}}</h5>
                <p class="no-grow-flex-item">{{category.description}}</p>
                <div class="growing-flex-item"></div>
                <div class="no-grow-flex-item">
                    <button class="small" @click="editCategory(category)">Edit</button>
                    <button class="small danger" @click="deleteCategory(category)">Delete</button>
                </div>

            </div>
        </div>
    </div>


    <br />
    <br />

    <div v-if="isAdmin">
        <h2>Requests</h2>
        <p v-if="!requests.length" class="p-2">No requests found </p>
        <div class="wrapping-list">
            <div v-for="category in requests" class="card padded-body">
                <div class="category-cell">
                    <h5 class="no-grow-flex-item">{{category.name}}</h5>
                    <p class="no-grow-flex-item">{{category.description}}</p>
                    <p class="no-grow-flex-item">Requested for: {{ getRequestType(category.req_type) }}</p>
                    <p class="no-grow-flex-item">From : {{ category.user_email}}</p>
                    <div class="growing-flex-item"></div>
                    <div class="no-grow-flex-item">
                        <button class="small" @click="actOnRequest(true, category)">Accept</button>
                        <button class="small danger" @click="actOnRequest(false, category)">Reject</button>
                    </div>
                </div>
            </div>
        </div>

    </div>
</div>
`,
    data() {
        return {
            categories: [],
            requests: [],
            isAdmin: false
        }
    },
    methods: {
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
            }).catch(e => {
                alert(e)
            })
        },
        fetchCategoryRequests() {
            const req = {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem('access_token')
                }
            }
            fetch('/categoryapproval', req).then(res => {
                if (res.ok) {
                    return res.json()
                } else {
                    return res.json().then(json => {
                        throw new Error(json.message)
                    })
                }
            }).then(data => {
                this.requests = data
            }).catch(e => {
                alert(e)
            })
        },
        actOnRequest(accept, category) {
            let content = {
                id: category.id,
                is_approved: accept
            }
            const req = {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem('access_token')
                },
                body: JSON.stringify(content)
            }
            fetch('/categoryapproval', req).then(res => {
                if (res.ok) {
                    return res.json()
                } else {
                    return res.json().then(json => {
                        throw new Error(json.message)
                    })
                }
            }).then(data => {
                this.fetchCategories()
                this.fetchCategoryRequests()
            }).catch(e => {
                alert(e)
            })
        },
        deleteCategory(category) {
            const req = {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem('access_token')
                }
            }
            fetch('/category/' + category.id, req).then(res => {
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
                this.error = e
                alert(e)
            })

        },
        editCategory(category) {
            this.$store.commit('setCurrentCategory', category);
            this.$router.push({ path: '/edit-category' })
        },
        getRequestType(type) {
            switch (type) {
                case 'CategoryApprovalReqType.CREATE':
                    return 'Create'
                case 'CategoryApprovalReqType.UPDATE':
                    return 'Update'
                case 'CategoryApprovalReqType.DELETE':
                    return 'Delete'
            }
            return ''
        }
    },
    mounted: function () {
        this.isAdmin = getRole() == 'admin'
        this.fetchCategories()
        if (this.isAdmin) {
            this.fetchCategoryRequests()
        }
    }
}