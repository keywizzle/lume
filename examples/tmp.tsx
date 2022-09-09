import {createMutable} from 'solid-js/store'
import {useFrame} from 'solid-three'

export function Node() {
	const rotation = createMutable({x: 0, y: 0})

	useFrame(() => {
		rotation.x += 0.01
		rotation.y += 0.01
	})

	return (
		<Canvas gl={{antialias: true}} shadows>
			<perspectiveCamera
				fov={75}
				aspect={window.innerWidth / window.innerHeight}
				near={0.1}
				far={1000}
				position={{z: 5}}
			/>
			<mesh rotation={rotation}>
				<boxBufferGeometry width={1} height={1} depth={1} />
				<meshBasicMaterial color={0x00ff00} />
			</mesh>
			<ambientLight />
			<spotLight position={[0, 5, 10]} intensity={1} />
		</Canvas>
	)
}
