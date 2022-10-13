// Media Element Tools
// Configuration
const CF = {
    syms: {
        // \ufe0e ensures non-emoji representation, see variation selector-15
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
const videos = document.querySelectorAll('video');
const mets = []
videos.forEach((video) => {
    mets.push(createMet(video))
})

function createMet(video) {
    // Setup met container
    const met = document.createElement('div')
    met.classList.add('met')
    const panel = document.createElement('div')
    panel.classList.add('met-panel')

    const playbackIndicator = document.createElement('span')
    playbackIndicator.classList.add('met-playback-indicator')
    playbackIndicator.addEventListener(
        'metupdate', (e) => e.target.textContent = video.playbackRate.toFixed(2)) 
    playbackIndicator.dispatchEvent(new Event('metupdate'))

    const collapse = document.createElement('div')
    collapse.classList.add('met-collapse')
    
    video.addEventListener('ratechange', () => {
        listeners.ratechange.forEach((el) => el.dispatchEvent(new Event('metupdate')))
    })
    
    // Allow elements to subscribe to video element events
    const listeners = {
        ratechange: [playbackIndicator]
    }

    // Controls (button) configurations
    const metPlaybackBtns = [
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
    ]

    const metToggleBtns = [
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

    // Creates button elements
    function createMetBtn({symbol, handler, update, listensTo}) {
        const btn = document.createElement('button')
        btn.textContent = symbol
        btn.addEventListener('click', handler)
        btn.addEventListener('metupdate', update)
        listensTo?.forEach((eventType) => {
            if (!(eventType in listeners)) listeners[eventType] = []
            listeners[eventType].push(btn)
        })
        btn.dispatchEvent(new Event('metupdate'))
        return btn
    }

    // Prevent video and other elements behind panel from receiving events
    panel.addEventListener('click', (e) => e.stopImmediatePropagation())
    panel.addEventListener('dblclick', (e) => e.stopImmediatePropagation())
    panel.addEventListener('contextmenu', (e) => e.stopImmediatePropagation())

    // Instantiate buttons
    const playback = document.createElement('div')
    playback.classList.add('met-playback')
    metPlaybackBtns.forEach((btn) => playback.appendChild(createMetBtn(btn)))

    const toggles = document.createElement('div')
    toggles.classList.add('met-toggles')
    metToggleBtns.forEach((btn) => toggles.appendChild(createMetBtn(btn)))

    // Bubble video events to subscribed elements, trigger update via metupdate
    for (eventType of Object.keys(listeners)) {
        video.addEventListener(eventType, (e) => {
            listeners[e.type].forEach((el) => el.dispatchEvent(new Event('metupdate')))
        })
    }
    
    // Attach elements
    // Contain video and panel
    video.parentNode.replaceChild(met, video)
    met.appendChild(panel)
    met.appendChild(video)
    // Assemble panel
    panel.appendChild(playbackIndicator)
    panel.appendChild(collapse)
    collapse.appendChild(playback)
    collapse.appendChild(toggles)
}




