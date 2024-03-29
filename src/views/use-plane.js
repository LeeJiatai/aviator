import * as THREE from 'three'
import { Colors } from '@/config/index.js'

function AirPlane() {
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
    let geomSideWing = new THREE.BoxGeometry(30, 5, 120, 1, 1, 1)
    let matSideWing = new THREE.MeshPhongMaterial({
        color:Colors.red,
        shading:THREE.FlatShading
    })
    let sideWing = new THREE.Mesh(geomSideWing, matSideWing)
    sideWing.castShadow = true
    sideWing.receiveShadow = true
    this.mesh.add(sideWing)

    // 挡风玻璃
    let geomWindshield = new THREE.BoxGeometry(3, 15, 20, 1, 1, 1)
    let matWindshield = new THREE.MeshPhongMaterial({
        color: Colors.red,
        transparent: true,
        opacity: .3,
        shading: THREE.FlatShading
    })
    let windshield = new THREE.Mesh(geomWindshield, matWindshield)
    windshield.position.set(15, 27, 0)
    windshield.castShadow = true
    windshield.receiveShadow = true
    this.mesh.add(windshield)

    // 螺旋桨
    let geomPropeller = new THREE.BoxGeometry(20, 10, 10, 1, 1, 1);
    geomPropeller.vertices[4].y -= 5
    geomPropeller.vertices[4].z += 5
    geomPropeller.vertices[5].y -= 5
    geomPropeller.vertices[5].z -= 5
    geomPropeller.vertices[6].y += 5
    geomPropeller.vertices[6].z += 5
    geomPropeller.vertices[7].y += 5
    geomPropeller.vertices[7].z -= 5
    let matPropeller = new THREE.MeshPhongMaterial({
        color: Colors.red,
        shading: THREE.FlatShading
    })
    this.propeller = new THREE.Mesh(geomPropeller, matPropeller)
  
    this.propeller.castShadow = true
    this.propeller.receiveShadow = true

    // 叶片
    let geomBlade = new THREE.BoxGeometry(1, 80, 10, 1, 1, 1)
    let matBlade = new THREE.MeshPhongMaterial({
        color:Colors.brownDark,
        shading:THREE.FlatShading
    })
    let blade1 = new THREE.Mesh(geomBlade, matBlade)
    blade1.position.set(8, 0, 0)

    blade1.castShadow = true
    blade1.receiveShadow = true

    let blade2 = blade1.clone()
    blade2.rotation.x = Math.PI / 2

    blade2.castShadow = true
    blade2.receiveShadow = true

    this.propeller.add(blade1)
    this.propeller.add(blade2)
    this.propeller.position.set(60 ,0, 0)
    this.mesh.add(this.propeller)

    // 起落架
    let wheelProtecGeom = new THREE.BoxGeometry(30, 15, 10, 1, 1, 1)
    let wheelProtecMat = new THREE.MeshPhongMaterial({
        color: Colors.red,
        shading: THREE.FlatShading
    })
    let wheelProtecR = new THREE.Mesh(wheelProtecGeom, wheelProtecMat)
    wheelProtecR.position.set(25, -20, 25)
    this.mesh.add(wheelProtecR)

    let wheelTireGeom = new THREE.BoxGeometry(24, 24, 4)
    let wheelTireMat = new THREE.MeshPhongMaterial({
        color: Colors.brownDark,
        shading: THREE.FlatShading
    })
    let wheelTireR = new THREE.Mesh(wheelTireGeom,wheelTireMat)
    wheelTireR.position.set(25, -28, 25)

    let wheelAxisGeom = new THREE.BoxGeometry(10,10,6);
    let wheelAxisMat = new THREE.MeshPhongMaterial({color:Colors.brown, shading:THREE.FlatShading});
    let wheelAxis = new THREE.Mesh(wheelAxisGeom,wheelAxisMat);
    wheelTireR.add(wheelAxis);

    this.mesh.add(wheelTireR);

    let wheelProtecL = wheelProtecR.clone()
    wheelProtecL.position.z = -wheelProtecR.position.z
    this.mesh.add(wheelProtecL)

    let wheelTireL = wheelTireR.clone();
    wheelTireL.position.z = -wheelTireR.position.z;
    this.mesh.add(wheelTireL);

    let wheelTireB = wheelTireR.clone();
    wheelTireB.scale.set(.5,.5,.5);
    wheelTireB.position.set(-35,-5,0);
    this.mesh.add(wheelTireB);

    let suspensionGeom = new THREE.BoxGeometry(4,20,4);
    suspensionGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0,10,0))
    let suspensionMat = new THREE.MeshPhongMaterial({color:Colors.red, shading:THREE.FlatShading});
    let suspension = new THREE.Mesh(suspensionGeom,suspensionMat);
    suspension.position.set(-35,-5,0);
    suspension.rotation.z = -.3;
    this.mesh.add(suspension);
    
    // 飞行员
    this.pilot = new Pilot()
    this.pilot.mesh.position.set(-10,27,0)
    this.mesh.add(this.pilot.mesh)
}

export default function usePlane(scene) { 
    const airplane = new AirPlane()
    airplane.mesh.scale.set(.25, .25, .25);
    airplane.mesh.position.y = 100
    scene.add(airplane.mesh)

    return airplane
}

function Pilot() {
    this.mesh = new THREE.Object3D()
    this.mesh.name = 'pilot'

    this.angleHairs = 0

    // 飞行员身体 
    let bodyGeom = new THREE.BoxGeometry(15,15, 15)
    let bodyMat = new THREE.MeshPhongMaterial({
        color:Colors.brown,
        shading:THREE.FlatShading
    })
    let body = new THREE.Mesh(bodyGeom, bodyMat)
    body.position.set(2, -12, 0)
    this.mesh.add(body)

    // 脸部
    let faceGeom = new THREE.BoxGeometry(10, 10, 10)
    let faceMat = new THREE.MeshLambertMaterial({
        color:Colors.pink
    })
    let face = new THREE.Mesh(faceGeom, faceMat)
    this.mesh.add(face)

    // 头发
    let hairGeom = new THREE.BoxGeometry(4, 4, 4)
    let hairMat = new THREE.MeshLambertMaterial({
        color: Colors.brown
    })
    let hair = new THREE.Mesh(hairGeom, hairMat)
    hair.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, 2, 0))

    // 头发容器
    let hairs = new THREE.Object3D()
    this.hairsTop = new THREE.Object3D()

    for (let i = 0; i < 12; i++){
        let h = hair.clone()
        let col = i % 3
        let row = Math.floor(i / 3)
        let startPosZ = -4
        let startPosX = -4
        h.position.set(startPosX + row*4, 0, startPosZ + col*4)
        this.hairsTop.add(h)
    }
    hairs.add(this.hairsTop)

    // 创建脸部头发
    let hairSideGeom = new THREE.BoxGeometry(12,4,2);
    hairSideGeom.applyMatrix(new THREE.Matrix4().makeTranslation(-6,0,0));
    let hairSideR = new THREE.Mesh(hairSideGeom, hairMat);
    let hairSideL = hairSideR.clone();
    hairSideR.position.set(8,-2,6);
    hairSideL.position.set(8,-2,-6);
    hairs.add(hairSideR);
    hairs.add(hairSideL);

    // 创建后面头发
    let hairBackGeom = new THREE.BoxGeometry(2,8,10);
    let hairBack = new THREE.Mesh(hairBackGeom, hairMat);
    hairBack.position.set(-1,-4,0)
    hairs.add(hairBack);
    hairs.position.set(-5,5,0);

    this.mesh.add(hairs);

    let glassGeom = new THREE.BoxGeometry(5,5,5);
    let glassMat = new THREE.MeshLambertMaterial({color:Colors.brown});
    let glassR = new THREE.Mesh(glassGeom,glassMat);
    glassR.position.set(6,0,3);
    let glassL = glassR.clone();
    glassL.position.z = -glassR.position.z

    let glassAGeom = new THREE.BoxGeometry(11,1,11);
    let glassA = new THREE.Mesh(glassAGeom, glassMat);
    this.mesh.add(glassR);
    this.mesh.add(glassL);
    this.mesh.add(glassA);

    let earGeom = new THREE.BoxGeometry(2,3,2);
    let earL = new THREE.Mesh(earGeom,faceMat);
    earL.position.set(0,0,-6);
    let earR = earL.clone();
    earR.position.set(0,0,6);
    this.mesh.add(earL);
    this.mesh.add(earR);

}

// 移动头发
Pilot.prototype.updateHairs = function() {
    let hairs = this.hairsTop.children

    let l = hairs.length
    for (let i = 0; i < l; i++){
        let h = hairs[i];
        h.scale.y = .75 + Math.cos(this.angleHairs+i/3)*.25
    }
    this.angleHairs += 0.16
}
