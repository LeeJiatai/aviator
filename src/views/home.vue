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
import * as THREE from 'three'
import { onMounted } from 'vue'
import useScene from './use-scene'
import useLight from './use-light'
import useSea from './use-sea'
import useSky from './use-sky'
import usePlane from './use-plane'
import { Colors } from '@/config/index.js'
import { TweenMax } from 'gsap'

export default {
  	name: 'Home',

  	setup() {
		onMounted(() => {
			init()
		})
		
		let game
		let deltaTime = 0
		let newTime = new Date().getTime()
		let oldTime = new Date().getTime()
		let ennemiesPool = []
		let particlesPool = []
		let particlesInUse = []
		let fieldDistance, energyBar, replayMessage, fieldLevel, levelCircle
		let ennemiesHolder, particlesHolder
		function init() {
			fieldDistance = document.getElementById('distValue')
			energyBar = document.getElementById('energyBar')
			replayMessage = document.getElementById('replayMessage')
			fieldLevel = document.getElementById('levelValue')
			levelCircle = document.getElementById('levelCircleStroke')
			resetGame()

			initAction()
			
			document.addEventListener('mousemove', handleMouseMove, false)
			document.addEventListener('touchmove', handleTouchMove, false)
			document.addEventListener('mouseup', handleMouseUp, false)
			document.addEventListener('touchend', handleTouchEnd, false)

			loop()
		}

		function handleTouchMove(event) {
			event.preventDefault();
			var tx = -1 + (event.touches[0].pageX / WIDTH)*2;
			var ty = 1 - (event.touches[0].pageY / HEIGHT)*2;
			mousePos = {x:tx, y:ty};
		}

		function handleMouseUp(){
			if (game.status == "waitingReplay"){
				resetGame();
				hideReplay();
			}
		}

		function handleTouchEnd(){
			if (game.status == "waitingReplay"){
				resetGame();
				hideReplay();
			}
		}

		let scene, camera, WIDTH, HEIGHT, renderer, sea, sky, airplane, ambientLight
		function initAction() {
			// 初始化场景
			({ scene, camera, WIDTH, HEIGHT, renderer } = useScene())
			// 创建灯光
			ambientLight = useLight(scene)

			// 初始化海洋
			sea = useSea(scene)
			// 创建天空
			sky = useSky(scene, game, deltaTime)
			// 创建飞机
			airplane = usePlane(scene)
			createCoins()
			createEnnemies()
			createParticles()
		}

		function resetGame() {
			game = {
				speed:0,
				initSpeed:.00035,
				baseSpeed:.00035,
				targetBaseSpeed:.00035,
				incrementSpeedByTime:.0000025,
				incrementSpeedByLevel:.000005,
				distanceForSpeedUpdate:100,
				speedLastUpdate:0,

				distance:0,
				ratioSpeedDistance:50,
				energy:100,
				ratioSpeedEnergy:3,

				level:1,
				levelLastUpdate:0,
				distanceForLevelUpdate:1000,

				planeDefaultHeight:100,
				planeAmpHeight:80,
				planeAmpWidth:75,
				planeMoveSensivity:0.005,
				planeRotXSensivity:0.0008,
				planeRotZSensivity:0.0004,
				planeFallSpeed:.001,
				planeMinSpeed:1.2,
				planeMaxSpeed:1.6,
				planeSpeed:0,
				planeCollisionDisplacementX:0,
				planeCollisionSpeedX:0,

				planeCollisionDisplacementY:0,
				planeCollisionSpeedY:0,

				seaRadius:600,
				seaLength:800,
				//seaRotationSpeed:0.006,
				wavesMinAmp : 5,
				wavesMaxAmp : 20,
				wavesMinSpeed : 0.001,
				wavesMaxSpeed : 0.003,

				cameraFarPos:500,
				cameraNearPos:150,
				cameraSensivity:0.002,

				coinDistanceTolerance:15,
				coinValue:3,
				coinsSpeed:.5,
				coinLastSpawn:0,
				distanceForCoinsSpawn:100,

				ennemyDistanceTolerance:10,
				ennemyValue:10,
				ennemiesSpeed:.6,
				ennemyLastSpawn:0,
				distanceForEnnemiesSpawn:50,

				status : "playing"
			}
			fieldLevel.innerHTML = Math.floor(game.level);
		}

		function Ennemy(){
			var geom = new THREE.TetrahedronGeometry(8, 2)
			var mat = new THREE.MeshPhongMaterial({
				color:Colors.red,
				shininess:0,
				specular:0xffffff,
				shading:THREE.FlatShading
			})
			this.mesh = new THREE.Mesh(geom,mat);
			this.mesh.castShadow = true;
			this.angle = 0;
			this.dist = 0;
		}

		function EnnemiesHolder() {
			this.mesh = new THREE.Object3D();
			this.ennemiesInUse = []
		}

		EnnemiesHolder.prototype.spawnEnnemies = function(){
			var nEnnemies = game.level;

			for (var i=0; i<nEnnemies; i++){
				var ennemy;
				if (ennemiesPool.length) {
					ennemy = ennemiesPool.pop();
				}else{
					ennemy = new Ennemy();
				}

				ennemy.angle = - (i*0.1);
				ennemy.distance = game.seaRadius + game.planeDefaultHeight + (-1 + Math.random() * 2) * (game.planeAmpHeight-20);
				ennemy.mesh.position.y = -game.seaRadius + Math.sin(ennemy.angle)*ennemy.distance;
				ennemy.mesh.position.x = Math.cos(ennemy.angle)*ennemy.distance;

				this.mesh.add(ennemy.mesh);
				this.ennemiesInUse.push(ennemy);
			}
		}

		EnnemiesHolder.prototype.rotateEnnemies = function(){
			for (var i=0; i<this.ennemiesInUse.length; i++){
				var ennemy = this.ennemiesInUse[i];
				ennemy.angle += game.speed*deltaTime*game.ennemiesSpeed;

				if (ennemy.angle > Math.PI*2) ennemy.angle -= Math.PI*2;

				ennemy.mesh.position.y = -game.seaRadius + Math.sin(ennemy.angle)*ennemy.distance;
				ennemy.mesh.position.x = Math.cos(ennemy.angle)*ennemy.distance;
				ennemy.mesh.rotation.z += Math.random()*.1;
				ennemy.mesh.rotation.y += Math.random()*.1;

				var diffPos = airplane.mesh.position.clone().sub(ennemy.mesh.position.clone());
				var d = diffPos.length();
				if (d < game.ennemyDistanceTolerance){
					particlesHolder.spawnParticles(ennemy.mesh.position.clone(), 15, Colors.red, 3);

					ennemiesPool.unshift(this.ennemiesInUse.splice(i,1)[0]);
					this.mesh.remove(ennemy.mesh);
					game.planeCollisionSpeedX = 100 * diffPos.x / d;
					game.planeCollisionSpeedY = 100 * diffPos.y / d;
					ambientLight.intensity = 2;

					removeEnergy();
					i--;
				} else if (ennemy.angle > Math.PI){
					ennemiesPool.unshift(this.ennemiesInUse.splice(i,1)[0]);
					this.mesh.remove(ennemy.mesh);
					i--;
				}
			}
		}

		function Particle(){
			var geom = new THREE.TetrahedronGeometry(3,0);
			var mat = new THREE.MeshPhongMaterial({
				color:0x009999,
				shininess:0,
				specular:0xffffff,
				shading:THREE.FlatShading
			});
			this.mesh = new THREE.Mesh(geom,mat);
		}

		Particle.prototype.explode = function(pos, color, scale){
			var _this = this;
			var _p = this.mesh.parent;
			this.mesh.material.color = new THREE.Color( color);
			this.mesh.material.needsUpdate = true;
			this.mesh.scale.set(scale, scale, scale);
			var targetX = pos.x + (-1 + Math.random()*2)*50;
			var targetY = pos.y + (-1 + Math.random()*2)*50;
			var speed = .6+Math.random()*.2;
			TweenMax.to(this.mesh.rotation, speed, {x:Math.random()*12, y:Math.random()*12});
			TweenMax.to(this.mesh.scale, speed, {x:.1, y:.1, z:.1});
			TweenMax.to(this.mesh.position, speed, {x:targetX, y:targetY, delay:Math.random() *.1, ease:Power2.easeOut, onComplete:function(){
				if(_p) _p.remove(_this.mesh);
				_this.mesh.scale.set(1,1,1);
				particlesPool.unshift(_this);
			}});
		}

		function ParticlesHolder() {
			this.mesh = new THREE.Object3D();
			this.particlesInUse = [];
		}

		ParticlesHolder.prototype.spawnParticles = function(pos, density, color, scale){
			let nPArticles = density;
			for (var i=0; i < nPArticles; i++){
				var particle;
				if (particlesPool.length) {
					particle = particlesPool.pop();
				} else {
					particle = new Particle();
				}
				this.mesh.add(particle.mesh);
				particle.mesh.visible = true;
				var _this = this;
				particle.mesh.position.y = pos.y;
				particle.mesh.position.x = pos.x;
				particle.explode(pos,color, scale);
			}
		}

		function Coin() {
			var geom = new THREE.TetrahedronGeometry(5,0);
			var mat = new THREE.MeshPhongMaterial({
				color:0x009999,
				shininess:0,
				specular:0xffffff,

				shading:THREE.FlatShading
			})
			this.mesh = new THREE.Mesh(geom,mat)
			this.mesh.castShadow = true
			this.angle = 0
			this.dist = 0
		}

		function CoinsHolder(nCoins) {
			this.mesh = new THREE.Object3D();
			this.coinsInUse = [];
			this.coinsPool = [];
			for (var i=0; i<nCoins; i++){
				var coin = new Coin();
				this.coinsPool.push(coin);
			}
		}

		CoinsHolder.prototype.spawnCoins = function(){

			var nCoins = 1 + Math.floor(Math.random()*10);
			var d = game.seaRadius + game.planeDefaultHeight + (-1 + Math.random() * 2) * (game.planeAmpHeight-20);
			var amplitude = 10 + Math.round(Math.random()*10);
			for (var i=0; i<nCoins; i++){
				var coin;
				if (this.coinsPool.length) {
				coin = this.coinsPool.pop();
				}else{
				coin = new Coin();
				}
				this.mesh.add(coin.mesh);
				this.coinsInUse.push(coin);
				coin.angle = - (i*0.02);
				coin.distance = d + Math.cos(i*.5)*amplitude;
				coin.mesh.position.y = -game.seaRadius + Math.sin(coin.angle)*coin.distance;
				coin.mesh.position.x = Math.cos(coin.angle)*coin.distance;
			}
		}

		CoinsHolder.prototype.rotateCoins = function(){
			for (var i=0; i<this.coinsInUse.length; i++){
				var coin = this.coinsInUse[i];
				if (coin.exploding) continue;
				coin.angle += game.speed*deltaTime*game.coinsSpeed;
				if (coin.angle>Math.PI*2) coin.angle -= Math.PI*2;
					coin.mesh.position.y = -game.seaRadius + Math.sin(coin.angle)*coin.distance;
					coin.mesh.position.x = Math.cos(coin.angle)*coin.distance;
					coin.mesh.rotation.z += Math.random()*.1;
					coin.mesh.rotation.y += Math.random()*.1;

					//var globalCoinPosition =  coin.mesh.localToWorld(new THREE.Vector3());
					var diffPos = airplane.mesh.position.clone().sub(coin.mesh.position.clone());
					var d = diffPos.length();
					if (d<game.coinDistanceTolerance){
					this.coinsPool.unshift(this.coinsInUse.splice(i,1)[0]);
					this.mesh.remove(coin.mesh);
					particlesHolder.spawnParticles(coin.mesh.position.clone(), 5, 0x009999, .8);
					addEnergy();
					i--;
				}else if (coin.angle > Math.PI){
					this.coinsPool.unshift(this.coinsInUse.splice(i,1)[0]);
					this.mesh.remove(coin.mesh);
					i--;
				}
			}
		}
		let coinsHolder
		function createCoins(){
			coinsHolder = new CoinsHolder(20)
			scene.add(coinsHolder.mesh)
		}

		function createEnnemies(){
			for (var i=0; i<10; i++){
				var ennemy = new Ennemy();
				ennemiesPool.push(ennemy);
			}
			ennemiesHolder = new EnnemiesHolder();
			//ennemiesHolder.mesh.position.y = -game.seaRadius;
			scene.add(ennemiesHolder.mesh)
		}

		function createParticles(){
			for (var i=0; i<10; i++){
				var particle = new Particle();
				particlesPool.push(particle);
			}
			particlesHolder = new ParticlesHolder();
			//ennemiesHolder.mesh.position.y = -game.seaRadius;
			scene.add(particlesHolder.mesh)
		}

		function loop(){
			newTime = new Date().getTime();
			deltaTime = newTime-oldTime;
			oldTime = newTime;

			if (game.status=="playing"){

				// Add energy coins every 100m;
				if (Math.floor(game.distance)%game.distanceForCoinsSpawn == 0 && Math.floor(game.distance) > game.coinLastSpawn){
				game.coinLastSpawn = Math.floor(game.distance);
				coinsHolder.spawnCoins();
				}

				if (Math.floor(game.distance)%game.distanceForSpeedUpdate == 0 && Math.floor(game.distance) > game.speedLastUpdate){
				game.speedLastUpdate = Math.floor(game.distance);
				game.targetBaseSpeed += game.incrementSpeedByTime*deltaTime;
				}


				if (Math.floor(game.distance)%game.distanceForEnnemiesSpawn == 0 && Math.floor(game.distance) > game.ennemyLastSpawn){
				game.ennemyLastSpawn = Math.floor(game.distance);
				ennemiesHolder.spawnEnnemies();
				}

				if (Math.floor(game.distance)%game.distanceForLevelUpdate == 0 && Math.floor(game.distance) > game.levelLastUpdate){
				game.levelLastUpdate = Math.floor(game.distance);
				game.level++;
				fieldLevel.innerHTML = Math.floor(game.level);

				game.targetBaseSpeed = game.initSpeed + game.incrementSpeedByLevel*game.level
				}


				updatePlane();
				updateDistance();
				updateEnergy();
				game.baseSpeed += (game.targetBaseSpeed - game.baseSpeed) * deltaTime * 0.02;
				game.speed = game.baseSpeed * game.planeSpeed;

			}else if(game.status=="gameover"){
				game.speed *= .99;
				airplane.mesh.rotation.z += (-Math.PI/2 - airplane.mesh.rotation.z)*.0002*deltaTime;
				airplane.mesh.rotation.x += 0.0003*deltaTime;
				game.planeFallSpeed *= 1.05;
				airplane.mesh.position.y -= game.planeFallSpeed*deltaTime;

				if (airplane.mesh.position.y <-200){
				showReplay();
				game.status = "waitingReplay";

				}
			}else if (game.status=="waitingReplay"){

			}


			airplane.propeller.rotation.x +=.2 + game.planeSpeed * deltaTime*.005;
			sea.mesh.rotation.z += game.speed*deltaTime;//*game.seaRotationSpeed;

			if ( sea.mesh.rotation.z > 2*Math.PI)  sea.mesh.rotation.z -= 2*Math.PI;

			ambientLight.intensity += (.5 - ambientLight.intensity)*deltaTime*0.005;

			coinsHolder.rotateCoins();
			ennemiesHolder.rotateEnnemies();

			sky.moveClouds(deltaTime);
			sea.moveWaves();

			renderer.render(scene, camera);
			requestAnimationFrame(loop);
		}

		function updateDistance(){
			game.distance += game.speed*deltaTime*game.ratioSpeedDistance;
			fieldDistance.innerHTML = Math.floor(game.distance);
			var d = 502*(1-(game.distance%game.distanceForLevelUpdate)/game.distanceForLevelUpdate);
			levelCircle.setAttribute("stroke-dashoffset", d);

		}

		var blinkEnergy=false;

		function updateEnergy(){
			game.energy -= game.speed*deltaTime*game.ratioSpeedEnergy;
			game.energy = Math.max(0, game.energy);
			energyBar.style.right = (100-game.energy)+"%";
			energyBar.style.backgroundColor = (game.energy<50)? "#f25346" : "#68c3c0";

			if (game.energy<30){
				energyBar.style.animationName = "blinking";
			}else{
				energyBar.style.animationName = "none";
			}

			if (game.energy <1){
				game.status = "gameover";
			}
		}

		function addEnergy(){
			game.energy += game.coinValue;
			game.energy = Math.min(game.energy, 100);
		}

		function removeEnergy(){
			game.energy -= game.ennemyValue;
			game.energy = Math.max(0, game.energy);
		}



		function updatePlane(){
			game.planeSpeed = normalize(mousePos.x,-.5,.5,game.planeMinSpeed, game.planeMaxSpeed);
			var targetY = normalize(mousePos.y,-.75,.75,game.planeDefaultHeight-game.planeAmpHeight, game.planeDefaultHeight+game.planeAmpHeight);
			var targetX = normalize(mousePos.x,-1,1,-game.planeAmpWidth*.7, -game.planeAmpWidth);

			game.planeCollisionDisplacementX += game.planeCollisionSpeedX;
			targetX += game.planeCollisionDisplacementX;


			game.planeCollisionDisplacementY += game.planeCollisionSpeedY;
			targetY += game.planeCollisionDisplacementY;

			airplane.mesh.position.y += (targetY-airplane.mesh.position.y)*deltaTime*game.planeMoveSensivity;
			airplane.mesh.position.x += (targetX-airplane.mesh.position.x)*deltaTime*game.planeMoveSensivity;

			airplane.mesh.rotation.z = (targetY-airplane.mesh.position.y)*deltaTime*game.planeRotXSensivity;
			airplane.mesh.rotation.x = (airplane.mesh.position.y-targetY)*deltaTime*game.planeRotZSensivity;
			var targetCameraZ = normalize(game.planeSpeed, game.planeMinSpeed, game.planeMaxSpeed, game.cameraNearPos, game.cameraFarPos);
			camera.fov = normalize(mousePos.x,-1,1,40, 80);
			camera.updateProjectionMatrix ()
			camera.position.y += (airplane.mesh.position.y - camera.position.y)*deltaTime*game.cameraSensivity;

			game.planeCollisionSpeedX += (0-game.planeCollisionSpeedX)*deltaTime * 0.03;
			game.planeCollisionDisplacementX += (0-game.planeCollisionDisplacementX)*deltaTime *0.01;
			game.planeCollisionSpeedY += (0-game.planeCollisionSpeedY)*deltaTime * 0.03;
			game.planeCollisionDisplacementY += (0-game.planeCollisionDisplacementY)*deltaTime *0.01;

			airplane.pilot.updateHairs();
		}

		function showReplay(){
			replayMessage.style.display="block";
		}

		function hideReplay(){
			replayMessage.style.display="none";
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
