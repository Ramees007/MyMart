export default {
    template: `
<div class="inner-body">

    <h4>Export Products</h4>
    <p>{{ message }}</p>

    <button class="ml-3" @click="downlodProducts" :disabled="buttonState == STATE_LOADING"
        v-if="buttonState != STATE_DOWNLOADED">{{ buttonText }} </button>
    <button @click="viewDoc" v-if="buttonState == STATE_DOWNLOADED"> {{ buttonText }} </button>

</div>
`,
    data() {
        return {
            buttonState: this.STATE_INITIAL,
            taskId: ''
        }
    },
    methods: {
        downlodProducts: async function () {
            console.log(this.buttonState)
            this.buttonState = this.STATE_LOADING
            const res = await fetch('/download-products')
            if (res.ok) {
                const data = await res.json()
                const taskId = data['task-id']
                const intv = setInterval(async () => {
                    const productsRes = await fetch(`/get-products/${taskId}`)
                    if (productsRes.ok) {
                        this.taskId = taskId
                        this.buttonState = this.STATE_DOWNLOADED
                        clearInterval(intv)
                    } else if (productsRes.status != 425) {
                        alert("Could not download document")
                        this.buttonState = this.STATE_INITIAL
                        clearInterval(intv)
                    }
                }, 1000)
            } else {
                alert("Could not download document")
                this.buttonState = this.STATE_INITIAL
            }
        },
        viewDoc: function () {
            window.location.href = `/get-products/${this.taskId}`

        }

    },
    computed: {
        buttonText: function () {
            let text = "Request Download"
            switch (this.buttonState) {
                case this.STATE_INITIAL:
                    text = "Request Download"
                    break
                case this.STATE_LOADING:
                    text = "In progress"
                    break
                case this.STATE_DOWNLOADED:
                    text = "Download Document"
                    break
            }
            return text
        },
        message: function () {
            let text = ""
            switch (this.buttonState) {
                case this.STATE_INITIAL:
                    text = "You can export product details as a csv file, request download by clicking Request Download button and wait for the document to get generated. Once the csv file is generated click Download Document button"
                    break
                case this.STATE_LOADING:
                    text = "You have already requested to generate product details csv,Please wait & once the csv file is generated click Download Documentbutton"
                    break
                case this.STATE_DOWNLOADED:
                    text = "Please click Download Document button to download csv file"
                    break
            }
            return text
        }
    },
    beforeCreate() {
        this.STATE_INITIAL = 'initial'
        this.STATE_LOADING = 'loading'
        this.STATE_DOWNLOADED = 'downloaded'
    }
}