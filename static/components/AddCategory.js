
export default {
    template: `
    <div class="inner-body">
    <div class="vertically-centered-row centered-content" style="margin-top: 20vh;">
        <h2 class="text-center">{{title}}</h2>
    </div>

    <div>
        <form class="form-container">
            <div class="form-group">
                <label for="name">Name:</label>
                <input type="text" id="name" v-model="form.name">
            </div>

            <div class="form-group">
                <label for="description">Description:</label>
                <textarea id="description" v-model="form.description"></textarea>
            </div>


            <p v-if="errorText" class="alert alert-danger" role="alert">{{errorText}}</p>

            <div class="text-center">
                <button type="button" @click="saveCategory">Submit</button>
            </div>
        </form>
    </div>
</div>
    `,
    data() {
        return {
            form: {
                name: '',
                description: ''
            },
            errorText: '',
            isAdd: true,
            title: 'Add Category',
            category: null
        };
    },
    methods: {
        saveCategory() {
            let error = this.validate()
            if (error) {
                this.errorText = error
                return
            }

            let categoryData = {
                name: this.form.name,
                description: this.form.description
            }
            if (!this.isAdd) {
                categoryData.id = this.category?.id
            }

            const req = {
                method: this.isAdd ? "POST" : "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem('access_token')
                },
                body: JSON.stringify(categoryData)
            }
            fetch('/category', req).then(res => {
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
        validate() {
            if (!this.form.name) {
                return "Name required"
            }
            return null
        },
        deleteIt() {

        }
    },
    mounted: function () {
        this.isAdd = this.$router.currentRoute.name == 'AddCategory'
        this.title = this.isAdd ? 'Add Category' : 'Edit Category'
        this.category = this.$store.getters.getCurrentCategory
        this.$store.commit('setCurrentCategory', null);
        if (this.category != null) {
            this.form = this.category
        }
    }

}