export default {
    template: `
<div class="inner-body">
    <div v-if="!requests.length">No user approval requests found</div>

    <div v-for="req in requests" class="card p-2" style="margin-bottom:10px; width:300px">
        <p> User email: {{ req.email }}</p>
        <p> Registered date: {{ req.dateStr }}</p>
        <p> Registered time: {{ req.timeStr }}</p>
        <p> User Role: {{ req.userRole }}</p>
        <button class="small" @click="action(true, req.email)">Approve</button>
        <button class="small danger" @click="action(false, req.email)">Reject</button>
    </div>

</div>
`,
    data() {
        return {
            requests: []
        }
    },
    methods: {
        getRole: function (role) {
            switch (role) {
                case "UserRole.ROLE_STORE_MANAGER":
                    return "Store Manager"
                case "UserRole.ROLE_USER":
                    return "User"
                default:
                    return "Admin"
            }
        },
        action: function (approve, emailId) {
            let reqBody = {
                email: emailId,
                approval_status: approve
            }
            const req = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem('access_token')
                },
                body: JSON.stringify(reqBody)
            }
            fetch('/user-activation', req).then(res => {
                if (res.ok) {
                    return res.json()
                } else {
                    return res.json().then(json => {
                        throw new Error(json.message)
                    })
                }
            }).then(data => {
                alert(data.message)
                this.fetchRequests()
            }).catch(e => {
                alert(e)
            })
        },
        fetchRequests: function () {
            const req = {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem('access_token')
                }
            }
            fetch('/user-activation', req).then(res => {
                if (res.ok) {
                    return res.json()
                } else {
                    return res.json().then(json => {
                        throw new Error(json.message)
                    })
                }
            }).then(data => {
                data.forEach(req => {
                    let date = new Date(req.create_date);
                    req.dateStr = date.toLocaleDateString()
                    req.timeStr = date.toLocaleTimeString()
                    req.userRole = this.getRole(req.role)
                });
                this.requests = data
            }).catch(e => {
                alert(e)
            })

        }
    },
    mounted: function () {
        this.fetchRequests()
    }
}