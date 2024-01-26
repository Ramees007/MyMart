export default {
    data() {
        return {
            email: '',
            password: '',
            errorEmail: null,
            errorPassword: null
        }
    },
    template: `
<div class="form-container" style="margin-top:20vh;">
    <div class="text-center">
        <h2>Register</h2>
    </div>

    <div class="form-group">
        <label for="email">Email</label>
        <input type="email" id="email" v-model="email">
        <p class="alert alert-danger mt-1" role="alert" v-if="errorEmail!==null">{{errorEmail}}</p>
    </div>

    <div class="form-group">
        <label for="password">Password</label>
        <input type="password" id="password" 
            v-model="password">
        <p class="alert alert-danger mt-1" role="alert" v-if="errorPassword!==null">{{errorPassword}}</p>
    </div>


    <div class="text-center">
        <button type="submit" @click="submit">Submit</button>
    </div>

    <div class="text-center mt-3">Already Registered? <a href="#/login">Login</a> </div>
</div>
</div>
`,
    methods: {
        submit: function () {
            if (!this.validate()) {
                return
            }
            let q = this.$route.query.role
            let url = q === 'store_manager' ? '/storemanager/register' : '/user/register'
            const req = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email: this.email, password: this.password })
            }
            fetch(url, req).then(res => {
                if (res.ok) {
                    return res.json()
                } else {
                    return res.json().then(json => {
                        throw new Error(json.message)
                    })
                }
            }).then(data => {
                if (data.hasOwnProperty('access_token')) {
                    localStorage.setItem('access_token', data.access_token)
                } else {
                    alert(data.message)
                }
                this.$router.push({ path: '/' })
            }).catch(e => {
                alert(e)
            })
        },
        validate: function () {
            if (!this.email) {
                this.errorEmail = "Please enter Email ID"
                return false
            }
            let emailValid = this.email.match(
                /([A-Za-z0-9]+[.-_])*[A-Za-z0-9]+@[A-Za-z0-9-]+(\.[A-Z|a-z]{2,})+/
            )
            if (!emailValid) {
                this.errorEmail = "Please enter valid Email ID"
                return
            }

            if (!this.password) {
                this.errorPassword = "Please enter password"
                return false
            }

            let passwordValid = this.password
                .match(
                    /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,}$/
                );
            if (!passwordValid) {
                this.errorPassword = "Password must contain atleast eight characters, one letter and one number"
                return
            }

            return true
        }
    },
    watch: {
        email: function (n, o) {
            this.errorEmail = null
        },
        password: function (n, o) {
            this.errorPassword = null
        }
    }
}