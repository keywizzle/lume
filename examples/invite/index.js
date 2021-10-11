/** @type {import('../../src/index')} */
const LUME = window.LUME

const {autorun, variable, untrack, Motor} = LUME

// fitted.three.material.opacity = 0.3

///// FIT CARD IN VIEWPORT /////////////////////////////////////////
{
	//////// SCALE MODE ///////////////////////////////////

	// let queued = null

	// autorun(() => {
	// 	// fitter.calculatedSize
	// 	// fitted.calculatedSize
	// 	// if (queued) return
	// 	// queued = Promise.resolve().then(() => {
	// 	// 	queued = null

	// 	const outerAspect = fitter.calculatedSize.x / fitter.calculatedSize.y
	// 	const innerAspect = fitted.calculatedSize.x / fitted.calculatedSize.y

	// 	let ratio = 1

	// 	if (innerAspect <= outerAspect) {
	// 		// inner should fit vertically
	// 		const outerSize = fitter.calculatedSize.y
	// 		const innerSize = fitted.calculatedSize.y

	// 		ratio = outerSize / innerSize
	// 	} else {
	// 		// inner should fit horizontally
	// 		const outerSize = fitter.calculatedSize.x
	// 		const innerSize = fitted.calculatedSize.x

	// 		ratio = outerSize / innerSize
	// 	}

	// 	fitted.scale = [ratio, ratio]

	// 	// })
	// })

	//////// RESIZE MODE ///////////////////////////////////

	// Requires literal sizing
	// Use a given aspect, or calculate it based on initial size.
	const innerSize = fitted.size
	const innerAspect = innerSize.x / innerSize.y

	const outerAspect = variable(1)
	autorun(() => outerAspect(fitter.calculatedSize.x / fitter.calculatedSize.y))

	autorun(() => {
		// const outerAspect = fitter.calculatedSize.x / fitter.calculatedSize.y

		if (innerAspect <= outerAspect()) {
			untrack(() => {
				// inner should fit vertically
				innerSize.y = fitter.calculatedSize.y
				innerSize.x = innerSize.y * innerAspect
				// fitted.size = [innerSize.y * innerAspect, fitter.calculatedSize.y]
			})
		} else {
			untrack(() => {
				// inner should fit horizontally
				innerSize.x = fitter.calculatedSize.x
				innerSize.y = innerSize.x / innerAspect
				// fitted.size = [fitter.calculatedSize.x, innerSize.x / innerAspect]
			})
		}
	})

	// let running = 0

	// Motor.addRenderTask((t, dt) => {
	// 	// requestAnimationFrame(function loop(t) {
	// 	// 	requestAnimationFrame(loop)

	// 	running += dt
	// 	if (running > 2000) return false

	// 	fitter.size.y = 100 * Math.abs(Math.sin(t * 0.001))
	// })
}

///// ROTATION ON POINTER MOVE ///////////////////////////////////////////////

const rotationAmount = 10
const targetRotation = {
	x: 0,
	y: 0,
}

const setTargetRotation = event => {
	targetRotation.y = (event.clientX / scene.calculatedSize.x) * (rotationAmount * 2) - rotationAmount
	targetRotation.x = -((event.clientY / scene.calculatedSize.y) * (rotationAmount * 2) - rotationAmount)
}

// Rotate the image a little bit based on pointer position.
scene.addEventListener('pointermove', setTargetRotation)
scene.addEventListener('pointerdown', setTargetRotation)

// Rotate the container towards the targetRotation over time to make it smooth.
Motor.addRenderTask(() => {
	fitter.rotation.x += (targetRotation.x - fitter.rotation.x) * 0.05
	fitter.rotation.y += (targetRotation.y - fitter.rotation.y) * 0.05
})

autorun(() => (particleContainer.rotation = fitter.rotation))

/////// CHANGE DEPTH ON SMALLER DEVICES /////////////////////////////////////////////////

// const layers = Array.from(document.querySelectorAll('#fitted > lume-node'))

// let smaller = false

// window.addEventListener('resize', () => {
// 	if (window.innerWidth < 1024) {
// 		if (smaller) return
// 		smaller = true

// 		for (const layer of layers) {
// 			layer.position.z *= 1.5
// 		}
// 	} else {
// 		if (!smaller) return
// 		smaller = false

// 		for (const layer of layers) {
// 			layer.position.z /= 1.5
// 		}
// 	}
// })

////// ADD PARTICLES /////////////////////////////////////////////////////////
makeParticles()

async function makeParticles() {
	const particleSpace = 1000
	const numberOfParticles = 240
	const initialOpacity = 0.99
	const radius = 10

	const goldStarUrl = './star-gold.svg'
	const greenStarUrl = './star-green.svg'

	const starMarkup = await fetch(goldStarUrl).then(r => r.text())
	const starTmpl = document.createElement('template')
	starTmpl.innerHTML = starMarkup

	const goldStars = particleContainer.children[0]
	const grayStars = particleContainer.children[1]

	goldStars.count = numberOfParticles * 0.3
	goldStars.positions = Array(goldStars.count * 3)
	goldStars.size = [radius, radius]
	goldStars.texture = goldStarUrl
	goldStars.color = 'yellow'
	goldStars.opacity = initialOpacity

	grayStars.count = numberOfParticles * 0.7
	grayStars.positions = Array(grayStars.count * 3)
	grayStars.size = [radius, radius]
	grayStars.texture = greenStarUrl
	grayStars.color = 'white'
	grayStars.opacity = 0.4

	const particles = []

	for (let i = 0, l = goldStars.count; i < l; i += 1) {
		const j = i * 3

		goldStars.positions[j + 0] = Math.random() * particleSpace - particleSpace / 2
		goldStars.positions[j + 1] = Math.random() * particleSpace - particleSpace / 2
		goldStars.positions[j + 2] = Math.random() * particleSpace - particleSpace / 2
	}

	for (let i = 0, l = grayStars.count; i < l; i += 1) {
		const j = i * 3

		grayStars.positions[j + 0] = Math.random() * particleSpace - particleSpace / 2
		grayStars.positions[j + 1] = Math.random() * particleSpace - particleSpace / 2
		grayStars.positions[j + 2] = Math.random() * particleSpace - particleSpace / 2
	}

	// Prior art: https://www.instructables.com/Realistic-Fire-Effect-with-Arduino-and-LEDs/
	// const flickerFunction = () => {
	// 	return
	// 	for (let i = 0, l = numberOfParticles; i < l; i += 1) {
	// 		const particle = particles[i]

	// 		// flicker only gold stars
	// 		if (particle.color != 'yellow') continue

	// 		const flicker = (Math.random() - 1) * 0.4
	// 		particle.opacity = initialOpacity + flicker
	// 	}

	// 	setTimeout(() => Motor.once(flickerFunction), Math.random() * 100)
	// }

	// Motor.once(flickerFunction)

	Motor.addRenderTask(() => {
		for (let i = 0, l = goldStars.count; i < l; i += 1) {
			const j = i * 3

			goldStars.positions[j + 0] += 0.5
			goldStars.positions[j + 1]++

			if (goldStars.positions[j + 0] > particleSpace / 2) {
				goldStars.positions[j + 0] = -particleSpace / 2
			}
			if (goldStars.positions[j + 1] > particleSpace / 2) {
				goldStars.positions[j + 1] = -particleSpace / 2
			}

			goldStars.needsUpdate()
		}

		for (let i = 0, l = grayStars.count; i < l; i += 1) {
			const j = i * 3

			grayStars.positions[j + 0] += 0.5
			grayStars.positions[j + 1]++

			if (grayStars.positions[j + 0] > particleSpace / 2) {
				grayStars.positions[j + 0] = -particleSpace / 2
			}
			if (grayStars.positions[j + 1] > particleSpace / 2) {
				grayStars.positions[j + 1] = -particleSpace / 2
			}

			grayStars.needsUpdate()
		}
	})
}

/////// <lume-svg> element (WIP) /////////////////////////////////////////////////////////////////////////

const {element, THREE} = LUME

class Svg extends LUME.Node {
	connectedCallback() {
		super.connectedCallback()
		debugger

		CONTINUE: Why is _loadGL not being called automatically like it should be? Why we need to call it manually?
		this._loadGL()
	}
	_loadGL() {
		debugger
		if (!super._loadGL()) return false

		this.loader = new THREE.SVGLoader()

		this._glStopFns.push(
			autorun(() => {
				this.loader.load(this.src, data => {
					const paths = data.paths

					const group = new THREE.Group()
					// group.scale.multiplyScalar(0.25)
					// group.position.x = -70
					// group.position.y = 70
					// group.scale.y *= -1

					for (let i = 0; i < paths.length; i++) {
						const path = paths[i]

						const fillColor = path.userData.style.fill
						debugger
						if (fillColor !== undefined && fillColor !== 'none') {
							const material = new THREE.MeshBasicMaterial({
								color: new THREE.Color().setStyle(fillColor),
								opacity: path.userData.style.fillOpacity,
								transparent: path.userData.style.fillOpacity < 1,
								side: THREE.DoubleSide,
								depthWrite: false,
							})

							const shapes = THREE.SVGLoader.createShapes(path)

							for (let j = 0; j < shapes.length; j++) {
								const shape = shapes[j]

								const geometry = new THREE.ShapeGeometry(shape)
								const mesh = new THREE.Mesh(geometry, material)

								group.add(mesh)
							}
						}

						const strokeColor = path.userData.style.stroke
						debugger

						if (strokeColor !== undefined && strokeColor !== 'none') {
							const material = new THREE.MeshBasicMaterial({
								color: new THREE.Color().setStyle(strokeColor),
								opacity: path.userData.style.strokeOpacity,
								transparent: path.userData.style.strokeOpacity < 1,
								side: THREE.DoubleSide,
								depthWrite: false,
							})

							for (let j = 0, jl = path.subPaths.length; j < jl; j++) {
								const subPath = path.subPaths[j]

								const geometry = THREE.SVGLoader.pointsToStroke(
									subPath.getPoints(),
									path.userData.style,
								)

								if (geometry) {
									const mesh = new THREE.Mesh(geometry, material)

									group.add(mesh)
								}
							}
						}
					}

					this.three.add(group)
				})
			}),
		)

		return true
	}
}

Svg.observedAttributes = {
	src: LUME.attribute.string,
}

element('lume-svg')(Svg)

////// AUDIO ///////////////////////////////////////////////////////////////////

// In case autoplay worked.
if (audio.paused) play.classList.remove('showPause')
else play.classList.add('showPause')

audio.onplay = () => {
	// Show pause button while playing.
	play.classList.add('showPause')
}
audio.onpause = () => {
	// Show play button while paused.
	play.classList.remove('showPause')
}

const playFn = () => audio.play()
scene.addEventListener('pointerdown', playFn, {once: true})

play.onpointerdown = () => {
	scene.removeEventListener('pointerdown', playFn, {once: true})
}

play.onclick = () => {
	if (audio.paused) audio.play()
	else audio.pause()
}
