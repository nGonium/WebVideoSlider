// Media Element Tools
// Configuration
const CF = {
    syms: {
        // \ufe0e ensures non-emoji representation, see variation selector-15
        logo: '⚲\ufe0e',
        config: '🛠',
        close: '⨯',
        play: '⏵\ufe0e',
        pause: '⏸\ufe0e',
        speedUp: '\u203A',
        speedDown: '\u2039',
        jumpUp: '»',
        jumpDown: '«',
        control: 'C',
        loop: '🔁\ufe0e',
        mute: '🔊\ufe0e',
        muted: '🔇\ufe0e',
        pitch: '~',
        info: 'ℹ',
    },
    increment: 0.1,
    jump: 10,
}

// Setup videos for MET
document.querySelectorAll('video').forEach((video) => createMet(video))

function createMet(video) {
    // Setup met container
    const met = document.createElement('div')
    met.classList.add('met')
    const panel = document.createElement('div')
    panel.classList.add('met-panel')
    const dropdown = document.createElement('span')
    dropdown.classList.add('met-dropdown')
    dropdown.textContent = 'M'

    const collapse = document.createElement('div')
    collapse.classList.add('met-collapse')
    
    // Allow elements to subscribe to video element events
    const listeners = {}

    // Controls (button) configurations
    const metBtns = getBtnConfig({video, panel})

    // Prevent video and other elements behind panel from receiving events
    panel.addEventListener('click', (e) => e.stopImmediatePropagation())
    panel.addEventListener('dblclick', (e) => e.stopImmediatePropagation())
    panel.addEventListener('contextmenu', (e) => e.stopImmediatePropagation())

    // Instantiate buttons
    metBtns.forEach((btn) => collapse.appendChild(createMetBtn(btn, listeners)))

    // Bubble video events to subscribed elements, trigger update via metupdate
    for (eventType of Object.keys(listeners)) {
        video.addEventListener(eventType, (e) => {
            listeners[e.type].forEach((el) => el.dispatchEvent(new Event('metupdate')))
        })
    }

    // Make panel draggable
    setElementMoveable(panel)
    
    // Attach elements
    // Contain video and panel
    video.parentNode.replaceChild(met, video)
    met.appendChild(panel)
    met.appendChild(video)
    // Assemble panel
    panel.appendChild(dropdown)
    panel.appendChild(collapse)
}

function getBtnConfig({video, panel}) {
    return [
        {
            type: 'span',
            symbol: CF.syms.logo,
            handler: (e) => {
                const isPinned = panel.classList.toggle('met-panel--pinned')
                e.target.style.lineHeight = isPinned ? '80%' : null
                e.target.textContent = isPinned ? '●' : CF.syms.logo
            },
        },
        {
            type: 'span',
            symbol: '1.00',
            handler: undefined,
            update: (e) => e.target.textContent = video.playbackRate.toFixed(2),
            listensTo: ['ratechange'],
            classList: ['met-playback-indicator'],
        },
        {
            type: 'span',
            symbol: CF.syms.config,
            handler: undefined,
        },
        {
            type: 'span',
            symbol: CF.syms.close,
            handler: () => {
                panel.remove()
            },
        },
        {
            symbol: CF.syms.jumpDown,
            handler: () => video.currentTime -= 1,
        },
        {
            symbol: CF.syms.speedDown,
            handler: () => video.playbackRate -= 0.1,
        },
        {
            symbol: CF.syms.play,
            handler: () => video.paused ? video.play() : video.pause(),
            update: (e) => e.target.textContent = video.paused ? CF.syms.play : CF.syms.pause,
            listensTo: ['pause', 'play'],
        },
        {
            symbol: CF.syms.speedUp,
            handler: () => video.playbackRate += 0.1,
        },
        {
            symbol: CF.syms.jumpUp,
            handler: () => video.currentTime += 1,
        },
        {
            symbol: CF.syms.control,
            handler: (e) => {
                video.toggleAttribute('controls')
                // This removes controlslist restrictions if present
                video.removeAttribute('controlslist')
                e.target.dispatchEvent(new Event('metupdate'))
            },
            update: (e) => e.target.classList.toggle('met-btn--on', video.hasAttribute('controls')),
        },
        {
            symbol: CF.syms.loop,
            handler: (e) => {
                video.toggleAttribute('loop')
                e.target.dispatchEvent(new Event('metupdate'))
            },
            update: (e) => e.target.classList.toggle('met-btn--on', video.hasAttribute('loop')),
        },
        {
            symbol: CF.syms.mute,
            handler: (e) => {
                video.muted = !video.muted
            },
            update: (e) => {
                e.target.classList.toggle('met-btn--on', video.muted)
                e.target.textContent = video.muted ? CF.syms.muted : CF.syms.mute
            },
            listensTo: ['volumechange'],
        },
        {
            symbol: CF.syms.pitch,
            handler: (e) => {
                video.preservesPitch = !video.preservesPitch
                e.target.dispatchEvent(new Event('metupdate'))
            },
            update: (e) => e.target.classList.toggle('met-btn--on', video.preservesPitch),
        },
        {
            symbol: CF.syms.info,
            handler: () => undefined,
        },
    ]
}

// Creates button elements
function createMetBtn({type, symbol, handler, update, listensTo, classList}, listeners) {
    const btn = document.createElement(type ?? 'button')
    btn.textContent = symbol
    btn.addEventListener('click', handler)
    btn.addEventListener('metupdate', update)
    listensTo?.forEach((eventType) => {
        if (!(eventType in listeners)) listeners[eventType] = []
        listeners[eventType].push(btn)
    })
    if (classList) btn.classList.add(...classList)
    btn.dispatchEvent(new Event('metupdate'))
    return btn
}

// Assumes an absolutely positioned element, intended for panel
function setElementMoveable(el) {
    el.setAttribute('draggable', 'true')
    let dragStart = {}
    el.addEventListener('dragstart', e => {
        dragStart.x = e.offsetX
        dragStart.y = e.offsetY
    })
    el.addEventListener('dragend', e => {
        // --- Positions ---
        // original: el.offset
        // movement: e.offset - dragstart
        // dest. XY: original + movement
        el.style.top = `${el.offsetTop + e.offsetY - dragStart.y}px`
        el.style.left = `${el.offsetLeft + e.offsetX - dragStart.x}px`
    })
}




