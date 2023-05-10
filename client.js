const getTemplate = count => `
<div class="card">
    <div class="row">
        <div class="col-md-8">
            <div class="card-body">
                <h5 class="card-title">${`Id: ${count}`}</h5>
            </div>
        </div>
    </div>
</div>
`

class App {
    constructor(selector) {
        this.$ = document.querySelector(selector)
        this.#init()
    }

    #init() {
        this.startBtn = this.$.querySelector('[data-type="start-btn"]')
        this.stopBtn = this.$.querySelector('[data-type="stop-btn"]')
        this.eventLog = this.$.querySelector('[data-type="event-log"]')
        this.clickHandler = this.clickHandler.bind(this)
        this.$.addEventListener('click', this.clickHandler)
    }

    clickHandler(e) {
        if (e.target.tagName === 'BUTTON') {
            const {
                type
            } = e.target.dataset

            if (type === 'start-btn') {
                this.startEvents()
            } else if (type === 'stop-btn') {
                this.stopEvents()
            }

            this.changeDisabled()
        }
    }

    changeDisabled() {
        if (this.stopBtn.disabled) {
            this.stopBtn.disabled = false
            this.startBtn.disabled = true
        } else {
            this.stopBtn.disabled = true
            this.startBtn.disabled = false
        }
    }

    startEvents() {
        this.eventSource = new EventSource('http://localhost:3000/getUsers')
        this.eventLog.textContent = 'Соединение установлено.'

        this.eventSource.addEventListener('message', e => {
            if (e.lastEventId === '-1') {
                this.eventSource.close()
                this.eventLog.textContent = 'Соединение закрыто сервером.'

                this.startEvents()
            }
        }, {once: true})

        this.eventSource.addEventListener('count', (e) => {
            const { count } = JSON.parse(e.data)
            const template = getTemplate(count)

            this.$.insertAdjacentHTML('beforeend', template)
        })

        this.eventSource.addEventListener('error', e => {
            this.eventSource.close()

            this.eventLog.textContent = `Got an error: ${e}`

            this.changeDisabled()
        }, {once: true})
    }

    stopEvents() {
        this.eventSource.close()
        this.eventLog.textContent = 'Соединение закрыто клиентом.'
    }
}

let app = new App('main')