export default {
    data() {
        return {
            email: '',
            password: '',
            error: null
        }
    },
    template: `

<div class="form-container" style="margin-top:20vh;">
    <div class="text-center">
        <h2>Login</h2>
    </div>

    <div class="form-group">
        <label for="email">Email</label>
        <input type="email" id="email" v-model="email">
    </div>

    <div class="form-group">
        <label for="password">Password</label>
        <input type="password" id="password" v-model="password">
    </div>


    <div class="text-center">
        <button type="submit" @click="submit">Submit</button>
    </div>
    <p class="alert alert-danger mt-2" role="alert" v-if="error!==null">{{error}}</p>

    <div class="text-center mt-3">Not registered yet? <a href="#/register"> Register now </a> </div>
</div>

`,
    methods: {
        submit: function () {
            if (!this.validate()) {
                this.error = 'Enter email ID and password'
                return
            }
            const req = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email: this.email, password: this.password })
            }
            fetch('/login', req).then(res => {
                if (res.ok) {
                    return res.json()
                } else {
                    return res.json().then(json => {
                        throw new Error(json.message)
                    })
                }
            }).then(data => {
                localStorage.setItem('access_token', data.access_token)
                this.$router.replace({ path: '/' })
            }).catch(e => {
                this.error = e
            })
        },
        validate: function () {
            return this.email && this.password
        }
    },
    watch: {
        email: function (n, o) {
            this.error = null
        },
        password: function (n, o) {
            this.error = null
        }
    }
}