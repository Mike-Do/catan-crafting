import * as THREE from 'three';

export default class Weather {

    constructor(scene, camera, appState) {
        this.scene = scene;
        this.camera = camera;
        this.appState = appState;
        this.noLightning = false;
        this.noFog = false;

        this.ambient = new THREE.AmbientLight(0x555555);
        scene.add(this.ambient);

        this.fog = new THREE.Fog( 0xcccccc, 1, 60 );
        scene.fog = this.fog;

        this.rain = this.addRain();

        this.clouds = this.addClouds();
    }

    addClouds() {
        const cloudParticles = [];
        const camera = this.camera;
        const scene = this.scene;
        let loader = new THREE.TextureLoader();
        loader.load("../assets/cloud.png", function (texture) {
            // texture.rotation = Math.PI / 2;
            const cloudGeo = new THREE.PlaneGeometry(5, 5);
            const cloudMaterial = new THREE.MeshLambertMaterial({
                map: texture,
                transparent: true
            });

            for (let p = 0; p < 25; p++) {
                let cloud = new THREE.Mesh(cloudGeo, cloudMaterial);
                cloud.position.set(
                    Math.random() * 40 - 20,
                    7,
                    Math.random() * 40 - 20
                );
                cloud.lookAt(camera.position);
                // console.log(cloud.rotation);
                cloud.material.opacity = 0.7;
                cloudParticles.push(cloud);
                scene.add(cloud);
            }
        });
        return cloudParticles;
    }
    
    addRain() {
        var rainGroup = new THREE.Group();
        var particleCount = 1000;
    
        var rainMaterial = new THREE.PointsMaterial({
            color: 0xcccccc,
            size: 0.1,
            transparent: true,
            opacity: 0.6
        });
    
        var rainGeometry = new THREE.BufferGeometry();
    
        var rainVertices = [];
        for (var i = 0; i < particleCount; i++) {
            var x = (Math.random() - 0.5) * 30;
            var y = Math.random() * 7;
            var z = (Math.random() - 0.5) * 30;
    
            rainVertices.push(x, y, z);
        }
    
        rainGeometry.setAttribute('position', new THREE.Float32BufferAttribute(rainVertices, 3));
    
        var rainParticles = new THREE.Points(rainGeometry, rainMaterial);
        rainParticles.scale.set(1, 1, 1);
        rainGroup.add(rainParticles);
    
        this.scene.add(rainGroup);

        return rainGroup;
    }

    update() {

        if (this.clouds !== null) {
            this.clouds.forEach(p => {
                p.lookAt(this.camera.position);
            });
        }

        if (this.rain !== null) {
            var positions = this.rain.children[0].geometry.attributes.position.array;
            for (var i = 1; i < positions.length; i += 3) {
                // Move raindrops along the y-axis
                positions[i] -= Math.random() * Math.pow(20 - positions[i], 2) * 0.003;

                // Reset raindrop position if it goes below the scene
                if (positions[i] < 0) {
                    positions[i] = 10;
                }
            }
            this.rain.children[0].geometry.attributes.position.needsUpdate = true;
        }

        if (!this.noLightning) {
            if (Math.random() > 0.97) {
                this.scene.fog = new THREE.Fog( 0xddddff, 0, 0 );
                setTimeout(() => {
                    this.scene.fog = this.fog;
                }, 80);
            }
        }

    }

    updateState() {
        if (this.noLightning && this.appState.lightning) {
            this.noLightning = false;
        } else if (!this.noLightning && !this.appState.lightning) {
            this.noLightning = true;
        }

        if (this.noFog && this.appState.fog) {
            this.noFog = false;
            this.fog = new THREE.Fog( 0xcccccc, 1, 60 );
            this.scene.fog = this.fog;
        } else if (!this.noFog && !this.appState.fog) {
            this.noFog = true;
            this.fog = new THREE.Fog( 0xcccccc, 1000, 1000 );
            this.scene.fog = this.fog;
        }

        if (this.rain === null && this.appState.rain) {
            this.rain = this.addRain();
        } else if (this.rain !== null && !this.appState.rain) {
            this.removeObject(this.rain);
            this.rain = null;
        }

        if (this.clouds === null && this.appState.cloud) {
            this.clouds = this.addClouds();
        } else if (this.clouds !== null && !this.appState.cloud) {
            this.clouds.forEach(p => {
                this.removeObject(p);
            });
            this.clouds = null;
        }

    }

    removeObject(object3D) {
        if (!(object3D instanceof THREE.Object3D)) return false;
    
        // for better memory management and performance
        if (object3D.geometry) object3D.geometry.dispose();
    
        if (object3D.material) {
            if (object3D.material instanceof Array) {
                // for better memory management and performance
                object3D.material.forEach(material => material.dispose());
            } else {
                // for better memory management and performance
                object3D.material.dispose();
            }
        }
        object3D.removeFromParent(); // the parent might be the scene or another Object3D, but it is sure to be removed this way
        return true;
    }

}