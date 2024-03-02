<template>
	<div class="home">
		<div id="world"></div>
	</div>
</template>

<script>
import { onMounted } from 'vue'
import useScene from './use-scene'
import useLight from './use-light'
import useSea from './use-sea'
import useSky from './use-sky'
import usePlane from './use-plane'

export default {
  	name: 'Home',

  	setup() {
		onMounted(() => {
			init()
		})

		function init() {
			initAction()

			loop()
			document.addEventListener('mousemove', handleMouseMove, false)
		}

		let scene, camera, WIDTH, HEIGHT, renderer, sea, sky, airplane
		function initAction() {
			// 初始化场景
			({ scene, camera, WIDTH, HEIGHT, renderer } = useScene())
			// 创建灯光
			useLight(scene)

			// 初始化海洋
			sea = useSea(scene)
			// 创建天空
			sky = useSky(scene)
			// 创建飞机
			airplane = usePlane(scene)
		}

		function loop(){
			airplane.propeller.rotation.x += 0.3
			sea.mesh.rotation.z += .005
			sea.moveWaves()
			sky.mesh.rotation.z += .01
			airplane.pilot.updateHairs()
			renderer.render(scene, camera)
			// 更新飞机位置
			updatePlane()

			requestAnimationFrame(loop);
		}

		let mousePos = {
			x: 0,
			y: 0
		}

		function handleMouseMove(event) {
			
			let tx = (event.clientX / WIDTH) * 2 - 1
			
			let ty = -(event.clientY / HEIGHT) * 2 + 1
			mousePos = {
				x: tx,
				y: ty
			}

		}

		function updatePlane(){
			let targetY = normalize(mousePos.y,-.75,.75,25, 175)
			let targetX = normalize(mousePos.x,-.75,.75,-100, 100)

			airplane.mesh.position.y += (targetY-airplane.mesh.position.y)*0.1
			airplane.mesh.rotation.z = (targetY-airplane.mesh.position.y) * 0.0128
			airplane.mesh.rotation.x = (airplane.mesh.position.y-targetY) * 0.0064
			airplane.propeller.rotation.x += 0.3
		}

		function normalize(v,vmin,vmax,tmin, tmax){
			let nv = Math.max(Math.min(v, vmax), vmin)
			let dv = vmax - vmin
			let pc = (nv - vmin) / dv
			let dt = tmax - tmin
			let tv = tmin + (pc * dt)
			return tv
		}
	}
}
</script>

<style lang="scss" scoped>
.home {
	position: absolute;
	width: 100%;
	height: 100%;

	#world {
		position: absolute;
		width: 100%;
		height: 100%;
		overflow: hidden;
		background: linear-gradient(#e4e0ba, #f7d9aa);
	}
}
</style>
