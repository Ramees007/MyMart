import router from "./router.js"
import Navbar from "./components/Navbar.js"
import store from './store.js';

let isAuthenticated = () => localStorage.getItem('access_token') ? true : false

let isAuthRequiredPath = (to) => to.name !== 'Login' && to.name !== 'Register'

router.beforeEach((to, from, next) => {
    //console.log("Navigate ", from.name, " to ",to.name)
    if (isAuthRequiredPath(to) && !isAuthenticated()) next({ name: 'Login' })
    else next()
})

new Vue({
    el: "#app",
    store: store,
    template: `<div>
    <Navbar v-if="!$route.meta.hideNavbar"/>
    <router-view/>
    </div>`,
    router: router,
    components: {
        Navbar,
    }
})