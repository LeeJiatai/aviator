<template>
	<div class="home">
		<div class="header">
			<h1><span>the</span>Aviator</h1>
			<h2>fly it to the end</h2>
			<div class="score" id="score">
				<div class="score__content" id="level">
					<div class="score__label">level</div>
					<div class="score__value score__value--level" id="levelValue">1</div>
					<svg
						class="level-circle"
						id="levelCircle"
						viewBox="0 0 200 200"
						version="1.1"
						xmlns="http://www.w3.org/2000/svg"
					>
						<circle id="levelCircleBgr" r="80" cx="100" cy="100" fill="none" stroke="#d1b790" stroke-width="24px" />
						<circle id="levelCircleStroke" r="80" cx="100" cy="100" fill="none" stroke="#68c3c0" stroke-width="14px" stroke-dasharray="502" />
					</svg>
				</div>
				<div class="score__content" id="dist">
					<div class="score__label">distance</div>
					<div class="score__value score__value--dist" id="distValue">000</div>
				</div>
				<div class="score__content" id="energy">
					<div class="score__label">energy</div>
					<div class="score__value score__value--energy" id="energyValue">
						<div class="energy-bar" id="energyBar"></div>
					</div>
				</div>
			</div>
		</div>
		<div id="world"></div>

		<div class="message message--replay" id="replayMessage">Click to Replay</div>
		<div class="message message--instructions" id="instructions">Grab the blue pills<span>avoid the red ones</span></div>
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
@import 'https://fonts.googleapis.com/css?family=Playfair+Display:400,700,700italic';
.home {
	position: absolute;
	width: 100%;
	height: 100%;
	background: -webkit-linear-gradient(#e4e0ba, #f7d9aa);
	background: linear-gradient(#e4e0ba, #f7d9aa);

	.header {
		position: absolute;
		top: 8vh;
		left: 0;
		width: 100%;
		text-align: center;
		pointer-events: none;

		h1 {
			font-family: 'Playfair Display';
			font-size: 4.5em;
			line-height: 1;
			margin: 0;
			letter-spacing: -0.025em;
			color: #d1b790;

			span {
				font-size: 0.2em;
				font-style: italic;
				display: block;
				margin: 0 0 -1.5em -7em;
				letter-spacing: 0px;
			}
		}

		h2 {
			font-size: 0.585em;
			margin: 0.25em 0;
			white-space: nowrap;
			text-indent: 1em;
			letter-spacing: 1em;
			text-transform: uppercase;
			color: #d6483b;
		}

		.score {
			width: 100%;
			margin: 2em 0 0;
			text-align: center;
			white-space: nowrap;

			.score__content {
				position: relative;
				display: inline-block;
				padding: 0 1em;
				vertical-align: top;

				&:nth-of-type(2) {
					border-right: 1px solid #d1b790;
					border-left: 1px solid #d1b790;
				}

				.score__label {
					font-size: 9px;
					position: relative;
					margin: 0 0 1.5em 0;
					text-align: center;
					letter-spacing: 3px;
					text-transform: uppercase;
					color: #d1b790;
				}

				.score__value {
					font-family: 'Playfair Display';
					font-weight: bold;
					color: #d1b790;

					&.score__value--level {
						font-size: 26px;
					}

					&.score__value--dist {
						font-size: 30px;
					}
				}

				.score__value--energy {
					position: relative;
					width: 60px;
					height: 8px;
					margin-top: 20px;
					border-radius: 3px;
					background-color: #d1b790;
				}

				.energy-bar {
					position: absolute;
					top: 0;
					right: 0;
					bottom: 0;
					left: 0;
					margin: 2px;
					background-color: #f25346;
					-webkit-animation-name: none;
					animation-name: none;
					-webkit-animation-duration: 150ms;
					animation-duration: 150ms;
					-webkit-animation-iteration-count: infinite;
					animation-iteration-count: infinite;
				}

				.level-circle {
					position: absolute;
					left: 50%;
					width: 46px;
					margin: -33px 0 0 -23px;
					-webkit-transform: rotate(-90deg);
					transform: rotate(-90deg);
				}
			}
		}
	}

	.message {
		font-weight: bold;
		position: absolute;
		left: 0;
		width: 100%;
		text-align: center;
		text-transform: uppercase;
		pointer-events: none;
	}

	.message--replay {
		font-size: 1.25vw;
		bottom: 40vh;
		display: none;
		text-indent: 0.5em;
		letter-spacing: 0.5em;
		color: #d1b790;
	}

	.message--instructions {
		font-family: 'Playfair Display';
		font-size: 0.85em;
		bottom: 8vh;
		letter-spacing: 0.2em;
		color: #68c3c0;
	}

	.message--instructions span {
		display: block;
		color: #d6483b;
		white-space: nowrap;
	}

	#world {
		position: absolute;
		width: 100%;
		height: 100%;
		overflow: hidden;
	}
}
</style>
