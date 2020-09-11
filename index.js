// ==UserScript==
// @name        D&D Beyond fixed sidebar
// @namespace   dndbeyond-fixed-sidebar
// @description This script sets the sidebar fixed to the left side, and opens the profile upon launch.
// @version     1
// @grant       none
// @include     /^(https://www.dndbeyond.com/profile/[^/]*/characters/.*|https://www.dndbeyond.com/characters/.*)$/
// ==/UserScript==
const clickElement = (query) => {
    let element = document.querySelector(query)

    if (element) {
        element.click()
    }

    return element
}

const keepTrying = (
    fn, 
    {
        checkEvery = 500,
        stopAfter = 5000,
        delayBy = 0
    } = {}
) => new Promise((resolve, reject) => {
    setTimeout(() => {
        const timeout = setTimeout(() => {
            clearInterval(interval)

            reject(new Error('Timeout after ${stopAfter}ms.'))
        }, stopAfter)

        const interval = setInterval(() => {
            const result = fn()

            if (!result) return

            clearInterval(interval)
            clearTimeout(timeout)

            resolve(result)
        }, checkEvery)
    }, delayBy)
})

const expandPromise = async (promise) => {
    let data = null
    let error = null

    try {
        data = await promise
    } catch (err) {
        error = err
    }

    return [error, data]
}

const onLoad = async () => {
    const tryToClickExpand = () => clickElement('.ct-sidebar__control--expand')
    const [timeoutError, expandElement] = await expandPromise(keepTrying(tryToClickExpand, {
        delayBy: 2000
    }))

    if (timeoutError) {
        console.error('Timed out while waiting on sidebar controls')

        return
    }

    console.log("Expanding sidebar")

    expandElement.click()
    clickElement('.ct-sidebar__control--left')
    clickElement('.ct-sidebar__control--fixed')
    clickElement('.ct-sidebar__control--unlock')

    const bannerElement = document.querySelector('.ddb-site-banner')
    if (bannerElement) bannerElement.style.display = 'none'

    const tryToClickProfile = () => clickElement('.ddbc-character-avatar__portrait')
    const [portraitError, portrait] = await expandPromise(keepTrying(tryToClickProfile))

    if (portraitError) {
        console.error('Timed out while waiting on portrait')

        return
    }
}

window.addEventListener('load', onLoad, false)
