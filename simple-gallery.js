// ----------------------------------------------------------------------------
// This code is released under the MIT License.
// Alexander Hübert, 20th of April 2025
// ----------------------------------------------------------------------------
//

document.addEventListener('DOMContentLoaded', () => {
    applyCss()
    initSoloImages() // initSoloImages() must be called before initGalleries()
    initGalleries()
}, { once: true })
// -----------------------------------------------------------------------------
const galleryBg = 'transparent'
const lightboxBg = 'black'
const animationDurationMs = 400
const imgPreloadCount = 2
// -----------------------------------------------------------------------------
function initSoloImages() {
    const lightboxImages = document.querySelectorAll('img.-lightbox')
    if (lightboxImages.length === 0) return

    const tmpGallery = document.createElement('div')
    tmpGallery.className = '-gallery -lightbox -tmp'
    document.body.appendChild(tmpGallery)

    tmpGallery.style.position = 'fixed'
    tmpGallery.style.visibility = 'hidden'
    tmpGallery.style.pointerEvents = 'none'
    tmpGallery.style.outline = 'none'

    // ref to all images
    tmpGallery.lightboxImages = lightboxImages

    lightboxImages.forEach((img, index) => {
        img.style.cursor = 'pointer'
        img.setAttribute('tabindex', '0')

        const tmpImg = document.createElement('img')
        tmpImg.src = img.src
        tmpGallery.appendChild(tmpImg)

        img.addEventListener('click', () => {
            showGallery(img, index)
        })

        img.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault()
                showGallery(img, index)
            }
        })
    })

    function showGallery(img, index) {
        img.style.opacity = '0'
        tmpGallery.currentImageIndex = index

        tmpGallery.style.pointerEvents = 'all'
        tmpGallery.style.visibility = 'visible'

        const imgBounds = img.getBoundingClientRect()
        tmpGallery.style.top = `${imgBounds.top}px`
        tmpGallery.style.left = `${imgBounds.left}px`
        tmpGallery.style.width = `${imgBounds.width}px`
        tmpGallery.style.height = `${imgBounds.height}px`

        const slider = tmpGallery.querySelector('.simple-slider')
        const originalTransition = slider.style.transition
        slider.style.transition = 'none'

        const indicatorsContainer = tmpGallery.querySelector('.indicators')
        indicatorsContainer.style.transition = 'opacity var(--gallery-timing) ease'
        indicatorsContainer.style.opacity = '0'

        slider.click()

        const indicators = tmpGallery.querySelectorAll('.indicator')
        indicators[index].click()

        requestAnimationFrame(() => {
            indicatorsContainer.style.opacity = '1'
        })

        tmpGallery.addEventListener('transitionend', () => {
            slider.style.transition = originalTransition
        }, { once: true })
    }
}
// -----------------------------------------------------------------------------
function initGalleries() {
    const galleries = document.querySelectorAll('.-gallery')
    if (galleries.length === 0) return

    galleries.forEach((gallery, galleryIndex) => {
        gallery.setAttribute('tabindex', '0')
        createSlider(gallery, galleryIndex)
    })
}

function createSlider(gallery, galleryIndex) {
    let galleryImages = []
    const images = gallery.querySelectorAll('img')

    if (images.length > 0) {
        let widestImage = images[0]
        let maxWidth = 0
        let loadedImagesCount = 0

        images.forEach(img => {
            galleryImages.push(img.src)

            // define gallery aspect ratio based on the widest image
            function checkImageWidth() {
                if (img.width > maxWidth) {
                    maxWidth = img.width
                    widestImage = img
                }

                loadedImagesCount++
                if (loadedImagesCount === images.length) {
                    gallery.style.aspectRatio = `${widestImage.width} / ${widestImage.height}`
                }
            }

            if (img.complete) {
                checkImageWidth()
            } else {
                img.onload = checkImageWidth
            }
        })

        // clear original gallery
        gallery.replaceChildren()
    }

    const slider = document.createElement('div')
    slider.className = 'simple-slider'

    const leftNavArea = document.createElement('div')
    leftNavArea.className = 'nav-area left'

    const rightNavArea = document.createElement('div')
    rightNavArea.className = 'nav-area right'

    const indicatorsContainer = document.createElement('div')
    indicatorsContainer.className = 'indicators'

    gallery.appendChild(slider)
    gallery.appendChild(leftNavArea)
    gallery.appendChild(rightNavArea)
    gallery.appendChild(indicatorsContainer)

    initSliderWithState(galleryIndex, galleryImages, slider, leftNavArea, rightNavArea, gallery, indicatorsContainer)
}

function initSliderWithState(galleryIndex, images, slider, leftNavArea, rightNavArea, galleryContainer, indicatorsContainer) {
    const isTmpGallery = galleryContainer.classList.contains('-tmp')
    const isLightbox = galleryContainer.classList.contains('-lightbox')

    let currentIndex = 0

    let touchStartX = 0
    let touchEndX = 0

    let isDragging = false
    let inLightboxMode = false

    if (images.length === 1) {
        indicatorsContainer.style.display = 'none'
        leftNavArea.style.display = 'none'
        rightNavArea.style.display = 'none'
    }

    images.forEach((_, index) => {
        const slide = document.createElement('div')
        slide.className = 'slide'
        slide.id = `slide-${galleryIndex}-${index}`
        slider.appendChild(slide)

        const indicator = document.createElement('div')
        indicator.className = 'indicator'
        indicator.dataset.index = index
        if (index === 0) indicator.classList.add('active')
        indicatorsContainer.appendChild(indicator)
    })

    function updateIndicators() {
        const indicators = indicatorsContainer.querySelectorAll('.indicator')
        indicators.forEach((indicator, index) => {
            if (index === currentIndex) {
                indicator.classList.add('active')
            } else {
                indicator.classList.remove('active')
            }
        })
    }

    function loadImage(index, callback) {
        if (index < 0 || index >= images.length) return

        const slide = document.getElementById(`slide-${galleryIndex}-${index}`)

        if (slide.querySelector('img')) {
            if (callback) callback()
            return
        }

        const img = document.createElement('img')
        img.onload = function () {
            if (callback) callback()
        }
        img.src = images[index]
        slide.appendChild(img)
    }

    // if isTmpGallery preload all images to avoid flicker
    function preloadNext(index) {
        const nextIndex = index + 1
        if (nextIndex >= images.length || !isTmpGallery && nextIndex - currentIndex > imgPreloadCount) return

        loadImage(nextIndex, () => {
            preloadNext(nextIndex)
        })
    }

    function preloadPrev(index) {
        const prevIndex = index - 1
        if (prevIndex < 0 || !isTmpGallery && currentIndex - prevIndex > imgPreloadCount) return

        loadImage(prevIndex, () => {
            preloadPrev(prevIndex)
        })
    }

    function goToSlide(index) {
        loadImage(index, () => {
            if (isTmpGallery) {
                // set opacity to 0 of the current image in DOM
                galleryContainer.lightboxImages[galleryContainer.currentImageIndex].style.opacity = '1'
                galleryContainer.lightboxImages[index].style.opacity = '0'
                galleryContainer.currentImageIndex = index
            }

            currentIndex = index
            updateSlider()
            updateIndicators()
            preloadNext(currentIndex)
            preloadPrev(currentIndex)
        })
    }

    function showNextImage() {
        if (currentIndex >= images.length - 1) {
            bounceAnimation('right')
            return
        }
        goToSlide(currentIndex + 1)
    }

    function showPreviousImage() {
        if (currentIndex <= 0) {
            bounceAnimation('left')
            return
        }
        goToSlide(currentIndex - 1)
    }

    function updateSlider() {
        slider.style.transform = `translate3d(${-currentIndex * 100}%, 0, 0)`
    }

    function bounceAnimation(direction) {
        slider.className = `simple-slider bounce-from-${direction}`
        setTimeout(() => {
            slider.className = 'simple-slider'
        }, 300)
    }

    loadImage(currentIndex, () => {
        preloadNext(currentIndex)
        preloadPrev(currentIndex)
    })

    // navigation event listener -----------------------------------------------
    leftNavArea.addEventListener('click', showPreviousImage)
    rightNavArea.addEventListener('click', showNextImage)

    indicatorsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('indicator')) {
            const index = parseInt(e.target.dataset.index, 10)
            if (currentIndex !== index) goToSlide(index)
        }
    })

    galleryContainer.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            e.preventDefault()
            showPreviousImage()
        } else if (e.key === 'ArrowRight') {
            e.preventDefault()
            showNextImage()
        } else if (e.key === 'Enter' && isLightbox) {
            e.preventDefault()
            inLightboxMode ? closeLightbox() : openLightbox()
        } else if (e.key === 'Escape' && isLightbox && inLightboxMode) {
            e.preventDefault()
            closeLightbox()
        }
    })

    galleryContainer.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX
        isDragging = true
        slider.style.transition = 'none'
    }, { passive: true })

    galleryContainer.addEventListener('touchmove', (e) => {
        if (!isDragging) return

        const touchCurrentX = e.touches[0].clientX
        const diff = touchCurrentX - touchStartX

        // limit movement at the edges
        if ((currentIndex === 0 && diff > 0) || (currentIndex >= images.length - 1 && diff < 0)) {
            slider.style.transform = `translate3d(calc(${-currentIndex * 100}% + ${diff / 3}px), 0, 0)`
        } else {
            slider.style.transform = `translate3d(calc(${-currentIndex * 100}% + ${diff}px), 0, 0)`
        }
    }, { passive: true })

    galleryContainer.addEventListener('touchend', (e) => {
        if (!isDragging) return
        isDragging = false

        slider.style.transition = ''

        touchEndX = e.changedTouches[0].clientX
        const diff = touchEndX - touchStartX
        const galleryWidth = galleryContainer.offsetWidth

        if ((currentIndex === 0 && diff > 0) || (currentIndex >= images.length - 1 && diff < 0)) {
            updateSlider()
        } else if (diff > galleryWidth * 0.2) {
            showPreviousImage()
        } else if (diff < -galleryWidth * 0.2) {
            showNextImage()
        } else {
            updateSlider()
        }
    }, { passive: true })

    // lightbox ----------------------------------------------------------------
    if (galleryContainer.classList.contains('-lightbox')) {
        let originalParent = null
        let originalNextSibling = null

        let placeholder = null
        let overlay = null
        let overlayBg = null

        slider.addEventListener('click', (e) => {
            if (!e.composedPath().includes(leftNavArea) &&
                !e.composedPath().includes(rightNavArea) &&
                !e.composedPath().includes(indicatorsContainer)) {

                inLightboxMode ? closeLightbox() : openLightbox()
            }
        })

        function openLightbox() {
            if (inLightboxMode) return
            inLightboxMode = true

            galleryContainer.style.outline = 'none'

            if (!isTmpGallery) {
                // FLIP: get initial bounds
                const firstBounds = galleryContainer.getBoundingClientRect()
                galleryContainer.style.top = `${firstBounds.top}px`
                galleryContainer.style.left = `${firstBounds.left}px`
                galleryContainer.style.width = `${firstBounds.width}px`
                galleryContainer.style.height = `${firstBounds.height}px`

                // get gallery position in DOM
                originalParent = galleryContainer.parentNode
                originalNextSibling = galleryContainer.nextElementSibling

                // placeholder to prevent layout shift
                placeholder = document.createElement('div')
                placeholder.style.width = `${firstBounds.width}px`
                placeholder.style.height = `${firstBounds.height}px`
                originalParent.insertBefore(placeholder, galleryContainer)
            }

            overlay = document.createElement('div')
            overlay.className = '-overlay'

            overlayBg = document.createElement('div')
            overlayBg.className = '-overlay-bg'


            document.body.appendChild(overlay)
            overlay.appendChild(overlayBg)
            overlay.appendChild(galleryContainer)

            // FLIP: invert & play (animate from initial to final)
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    overlayBg.style.opacity = 1

                    galleryContainer.style.top = 0
                    galleryContainer.style.left = 0
                    galleryContainer.style.width = '100%'
                    galleryContainer.style.height = '100%'

                    galleryContainer.focus()
                })
            })
        }

        function closeLightbox() {
            if (!inLightboxMode) return

            // FLIP: play & invert (animate from final to initial)
            overlayBg.style.opacity = ''

            if (!isTmpGallery) {
                const targetRect = placeholder.getBoundingClientRect()
                galleryContainer.style.top = `${targetRect.top}px`
                galleryContainer.style.left = `${targetRect.left}px`
                galleryContainer.style.width = `${targetRect.width}px`
                galleryContainer.style.height = `${targetRect.height}px`
            } else {
                const indicatorsContainer = galleryContainer.querySelector('.indicators')
                indicatorsContainer.style.opacity = '0'

                // zoom out to current image
                const sourceImage = document.querySelectorAll('img.-lightbox')[currentIndex]
                const imgBounds = sourceImage.getBoundingClientRect()

                galleryContainer.style.top = `${imgBounds.top}px`
                galleryContainer.style.left = `${imgBounds.left}px`
                galleryContainer.style.width = `${imgBounds.width}px`
                galleryContainer.style.height = `${imgBounds.height}px`
            }

            // clean up
            const handleTransitionEnd = (e) => {
                galleryContainer.style.top = ''
                galleryContainer.style.left = ''
                galleryContainer.style.width = ''
                galleryContainer.style.height = ''

                galleryContainer.style.outline = ''

                // insert gallery back into DOM
                if (!isTmpGallery) {
                    originalParent.insertBefore(galleryContainer, originalNextSibling)
                    placeholder.remove()
                } else {
                    galleryContainer.lightboxImages[galleryContainer.currentImageIndex].style.opacity = '1'
                    galleryContainer.style.visibility = 'hidden'
                    galleryContainer.style.pointerEvents = 'none'
                    document.body.appendChild(galleryContainer)
                }

                overlay.remove()

                inLightboxMode = false
            }

            galleryContainer.addEventListener('transitionend', handleTransitionEnd, { once: true })
        }
    }
}

// CSS -------------------------------------------------------------------------
function applyCss() {
    const style = document.createElement('style')
    style.id = 'gallery-css'
    style.textContent = `
    :root {
        --gallery-timing: ${animationDurationMs}ms
    }
    
    .-overlay {
        position: fixed;
        inset: 0;
        z-index: 9999;
    }
    
    .-overlay-bg {
        position: absolute;
        inset: 0;
        opacity: 0;
        background-color: ${lightboxBg};
        transition: opacity var(--gallery-timing) ease;
    }
    
    .-gallery {
        position: relative;
        overflow: hidden;
        width: 100%;
        background-color: ${galleryBg};
        transition: all var(--gallery-timing) ease;
    }
    
    .-gallery .simple-slider {
        display: flex;
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        white-space: nowrap;
        transition: transform var(--gallery-timing) ease;
    }
    
    .-gallery .simple-slider .slide {
        flex: 0 0 100%;
    }
    
    .-gallery .simple-slider .slide img {
        box-sizing: border-box;
        width: 100%;
        height: 100%;
        object-fit: contain;
        cursor: pointer;
    
        /* avoids flicker of neighbouring img bounds */
        padding-inline: 1px;
    }
    
    .-gallery .nav-area {
        position: absolute;
        top: 0;
        height: 100%;
        width: 30%;
        z-index: 2;
        cursor: pointer;
    }
    
    .-gallery .nav-area.left {
        left: 0;
        cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="28" viewBox="0 0 24 28"><text x="0" y="18" font-size="20" fill="black" stroke="white" stroke-width="1">❮</text></svg>'), auto;
    }
    
    .-gallery .nav-area.right {
        right: 0;
        cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="28" viewBox="0 0 24 28"><text x="0" y="18" font-size="20" fill="black" stroke="white" stroke-width="1">❯</text></svg>'), auto;
    
    }
    
    .-gallery .indicators {
        position: absolute;
        bottom: 10px;
        left: 0;
        right: 0;
        text-align: center;
        z-index: 3;
    }
    
    .-gallery .indicator {
        display: inline-block;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.2);
        margin: 0 5px;
        cursor: pointer;
        transition: background-color var(--gallery-timing) ease;
    }
    
    .-gallery .indicator.active,
    .-gallery .indicator:hover {
        background-color: rgba(255, 255, 255, 0.5);
        transform: scale(1.2);
        transition: background-color var(--gallery-timing) ease;
    }
    
    @keyframes -gallery-bounceFromRight {
        0% {
            margin-left: 0;
        }
    
        50% {
            margin-left: -30px;
        }
    
        100% {
            margin-left: 0;
        }
    }
    
    @keyframes -gallery-bounceFromLeft {
        0% {
            margin-left: 0;
        }
    
        50% {
            margin-left: 30px;
        }
    
        100% {
            margin-left: 0;
        }
    }
    
    .-gallery .bounce-from-right {
        animation: -gallery-bounceFromRight var(--gallery-timing) ease-out;
    }
    
    .-gallery .bounce-from-left {
        animation: -gallery-bounceFromLeft var(--gallery-timing) ease-out;
    }`

    document.head.appendChild(style)
}
