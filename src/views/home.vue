<template>
	<div class="home">
		<div id="world"></div>
	</div>
</template>

<script>
import { onMounted } from 'vue'
import { Colors } from '@/config/index.js'
import * as THREE from 'three'
export default {
  	name: 'Home',

  	setup() {
		onMounted(() => {
			init()
		})

		function init() {
			// 创建场景、相机、渲染器
			createScene()

			// 创建灯光
			createLights()

			// 添加海洋，天空，飞机
			createSea()
			createSky()
			createPlane()
			loop()

			document.addEventListener('mousemove', handleMouseMove, false)
		}

		let scene, camera, fieldOfView, aspectRatio, nearPlane, farPlane, HEIGHT, WIDTH, renderer, container
		function createScene() {
			HEIGHT = window.innerHeight;
  			WIDTH = window.innerWidth;

			// 创建场景
			scene = new THREE.Scene()

			// 添加场景雾
			scene.fog = new THREE.Fog(0xf7d9aa, 100, 950)

			// 创建相机
			aspectRatio = WIDTH / HEIGHT
			fieldOfView = 60
			nearPlane = 1
			farPlane = 10000
			camera = new THREE.PerspectiveCamera(
				fieldOfView,
				aspectRatio,
				nearPlane,
				farPlane
			)

			// 设置相机位置
			camera.position.x = 0
			camera.position.z = 200
			camera.position.y = 100


			// 创建渲染器
			renderer = new THREE.WebGLRenderer({
				alpha: true,
				antialias: true
			})

			// 定义渲染器宽高
			renderer.setSize(WIDTH, HEIGHT)

			// 渲染阴影开启
			renderer.shadowMap.enabled = true

			// 将渲染器实例添加到#wolrd
			container = document.getElementById('world')
			container.appendChild(renderer.domElement)

			// 监听屏幕大小变化重新设置相机、渲染器
			window.addEventListener('resize', handleWindowResize, false);
		}

		function handleWindowResize() {
			// 更新相机、渲染器
			HEIGHT = window.innerHeight;
			WIDTH = window.innerWidth;
			renderer.setSize(WIDTH, HEIGHT);
			camera.aspect = WIDTH / HEIGHT;
			camera.updateProjectionMatrix();
		}

		// 创建灯光
		let hemisphereLight, shadowLight
		function createLights() {
			// 创建半球光
			hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, .9)

			// 创建平行光
			shadowLight = new THREE.DirectionalLight(0xffffff, .9)
			// 设置平行光源位置
			shadowLight.position.set(150, 350, 350)
			// 开启灯光阴影
			shadowLight.castShadow = true
			// 定义投影可见区域
			shadowLight.shadow.camera.left = -400
			shadowLight.shadow.camera.right = 400
			shadowLight.shadow.camera.top = 400
			shadowLight.shadow.camera.bottom = -400
			shadowLight.shadow.camera.near = 1
			shadowLight.shadow.camera.far = 1000
			// 投影清晰度
			shadowLight.shadow.mapSize.width = 2048
			shadowLight.shadow.mapSize.height = 2048

			scene.add(hemisphereLight)
			scene.add(shadowLight)
		}

		// 创建海洋
		let Sea
		Sea = function() {
			const geom = new THREE.CylinderGeometry(600, 600, 800, 40, 10)
			// 在X轴旋转几何体
			geom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2))
			// 创建材质
			let mat = new THREE.MeshPhongMaterial({
				color: Colors.blue,
				transparent:true,
				opacity:.6,
				shading: THREE.FlatShading
			})

			this.mesh = new THREE.Mesh(geom, mat)
			// 是否接受阴影
			this.mesh.receiveShadow = true
		}
		let sea
		function createSea() {
			sea = new Sea()

			sea.mesh.position.y = -600

			scene.add(sea.mesh)
		}

		let Cloud
		Cloud = function() {
			// 创建一个空3d对象
			this.mesh = new THREE.Object3D()

			// 创建一个立方体
			const geom = new THREE.BoxGeometry(20,20,20)
			// 创建材质
			let mat = new THREE.MeshPhongMaterial({
				color: Colors.white
			})

			// 随机n次复制几何图形
			let nBlocs = 3 + Math.floor(Math.random() * 3)
			for (let i = 0; i < nBlocs; i++ ) {
				let m = new THREE.Mesh(geom, mat)

				m.position.x = i * 15
				m.position.y = Math.random() * 10
				m.position.z = Math.random()*10
				m.rotation.z = Math.random() * Math.PI * 2
				m.rotation.y = Math.random()*Math.PI * 2
				// 设置立方体的缩放
				const s = .1 + Math.random() * .9
				m.scale.set(s, s, s)
				// 阴影设置
				m.castShadow = true
				m.receiveShadow = true

				this.mesh.add(m)
			}
		}

		let Sky
		Sky = function() {
			this.mesh = new THREE.Object3D()

			// 天空中云的数量
			this.nClouds = 20
			let stepAngle = Math.PI*2 / this.nClouds

			for (let i = 0; i < this.nClouds; i++) {
				let c = new Cloud()

				let a = stepAngle * i
				let h = 750 + Math.random() * 200

				c.mesh.position.y = Math.sin(a) * h
				c.mesh.position.x = Math.cos(a) * h
				c.mesh.rotation.z = a + Math.PI / 2
				c.mesh.position.z = -400 - Math.random() * 400

				let s = 1 + Math.random() * 2
				c.mesh.scale.set(s, s, s)

				this.mesh.add(c.mesh)
			}
		}

		let sky
		function createSky(){
			sky = new Sky()
			sky.mesh.position.y = -600
			scene.add(sky.mesh)
		}

		let AirPlane = function(){
			this.mesh = new THREE.Object3D()
			this.mesh.name = 'airPlane'

			// 驾驶舱
			let geomCockpit = new THREE.BoxGeometry(80, 50, 50, 1, 1, 1)
			let matCockpit = new THREE.MeshPhongMaterial({
				color:Colors.red,
				shading:THREE.FlatShading
			})
			geomCockpit.vertices[4].y -= 10
			geomCockpit.vertices[4].z += 20
			geomCockpit.vertices[5].y -= 10
			geomCockpit.vertices[5].z -= 20
			geomCockpit.vertices[6].y += 30
			geomCockpit.vertices[6].z += 20
			geomCockpit.vertices[7].y += 30
			geomCockpit.vertices[7].z -= 20
			let cockpit = new THREE.Mesh(geomCockpit, matCockpit)
			cockpit.castShadow = true
			cockpit.receiveShadow = true
			this.mesh.add(cockpit)

			// 发动机
			let geomEngine = new THREE.BoxGeometry(20, 50, 50, 1, 1, 1)
			let matEngine = new THREE.MeshPhongMaterial({
				color:Colors.white,
				shading:THREE.FlatShading
			})
			let engine = new THREE.Mesh(geomEngine, matEngine)
			engine.position.x = 40
			engine.castShadow = true
			engine.receiveShadow = true
			this.mesh.add(engine)

			// 尾巴
			let geomTailPlane = new THREE.BoxGeometry(15, 20, 5, 1, 1, 1)
			let matTailPlane = new THREE.MeshPhongMaterial({
				color:Colors.red,
				shading:THREE.FlatShading
			})
			let tailPlane = new THREE.Mesh(geomTailPlane, matTailPlane)
			tailPlane.position.set(-35, 25, 0)
			tailPlane.castShadow = true
			tailPlane.receiveShadow = true
			this.mesh.add(tailPlane)

			// 翅膀
			let geomSideWing = new THREE.BoxGeometry(40, 8, 150, 1, 1, 1)
			let matSideWing = new THREE.MeshPhongMaterial({
				color:Colors.red,
				shading:THREE.FlatShading
			})
			let sideWing = new THREE.Mesh(geomSideWing, matSideWing)
			sideWing.castShadow = true
			sideWing.receiveShadow = true
			this.mesh.add(sideWing)

			// 螺旋桨
			let geomPropeller = new THREE.BoxGeometry(20, 10, 10, 1, 1,1 )
			let matPropeller = new THREE.MeshPhongMaterial({
				color:Colors.brown,
				shading:THREE.FlatShading
			})
			this.propeller = new THREE.Mesh(geomPropeller, matPropeller)
			this.propeller.castShadow = true
			this.propeller.receiveShadow = true

			// 叶片
			let geomBlade = new THREE.BoxGeometry(1, 100, 20, 1, 1, 1)
			let matBlade = new THREE.MeshPhongMaterial({
				color:Colors.brownDark,
				shading:THREE.FlatShading
			})
			let blade = new THREE.Mesh(geomBlade, matBlade);
			blade.position.set(8,0,0)
			blade.castShadow = true
			blade.receiveShadow = true
			this.propeller.add(blade)
			this.propeller.position.set(50, 0, 0)
			this.mesh.add(this.propeller)
		};

		let airplane
		function createPlane(){ 
			airplane = new AirPlane()
			airplane.mesh.scale.set(.25,.25,.25);
			airplane.mesh.position.y = 100
			scene.add(airplane.mesh)
		}

		function loop(){
			airplane.propeller.rotation.x += 0.3
			sea.mesh.rotation.z += .005
			sky.mesh.rotation.z += .01
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
			
			let targetX = normalize(mousePos.x, -1, 1, -100, 100)
			let targetY = normalize(mousePos.y, -1, 1, 25, 175)

			airplane.mesh.position.y = targetY
			airplane.mesh.position.x = targetX
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
