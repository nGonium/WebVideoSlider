// Media Element Tools
// Configuration
const CF = {
    syms: {
        play: '⏵',
        pause: '⏸',
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
                if (video.hasAttribute('controlslist')) {
                    video.removeAttribute('controlslist')
                }
                e.target.dispatchEvent(new Event('metupdate'))
            },
            update: (e) => {
                if (video.hasAttribute('controls')) {
                    e.target.classList.add('met-btn--on')
                } else {
                    e.target.classList.remove('met-btn--on')
                }
            },
        },
        {
            symbol: CF.syms.loop,
            handler: (e) => {
                video.toggleAttribute('loop')
                e.target.dispatchEvent(new Event('metupdate'))
            },
            update: (e) => {
                if (video.hasAttribute('loop')) {
                    e.target.classList.add('met-btn--on')
                } else {
                    e.target.classList.remove('met-btn--on')
                }
            }
        },
        {
            symbol: CF.syms.mute,
            handler: (e) => {
                video.muted = !video.muted
            },
            update: (e) => {
                if (video.muted) {
                    e.target.textContent = CF.syms.muted
                    e.target.classList.remove('met-btn--on')
                } else {
                    e.target.textContent = CF.syms.mute
                    e.target.classList.add('met-btn--on')
                }
            },
            listensTo: ['volumechange'],
        },
        {
            symbol: CF.syms.pitch,
            handler: (e) => {
                video.preservesPitch = !video.preservesPitch
                e.target.dispatchEvent(new Event('metupdate'))
            },
            update: (e) => {
                if (video.preservesPitch) {
                    e.target.classList.add('met-btn--on')
                } else {
                    e.target.classList.remove('met-btn--on')
                }
            }
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
            if (eventType in listeners) {
                listeners[eventType].push(btn)
            } else {
                listeners[eventType] = [btn]
            }
        })
        btn.dispatchEvent(new Event('metupdate'))
        return btn
    }

    // Instantiate buttons
    const playback = document.createElement('div')
    playback.classList.add('met-playback')
    metPlaybackBtns.forEach((el) => {
        const btn = createMetBtn(el)
        playback.appendChild(btn)
    })

    const toggles = document.createElement('div')
    toggles.classList.add('met-toggles')
    metToggleBtns.forEach((el) => {
        const btn = createMetBtn(el)
        toggles.appendChild(btn)
    })

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




