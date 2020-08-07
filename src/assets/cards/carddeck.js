//import { textureLoader } from "../utils/media-utils";
AFRAME.registerComponent("cardshand", {
  schema: {
    spawnerScale: { default: 0.1 },
    spawnedScale: { default: 0.5 },
    camera: { type: "selector", default: "#avatar-pov-node" },
    hudAngle: { default: -0.5 },
    minHudAngle: { default: -0.2 },
    maxHudAngle: { default: 0.7 },
    hudDistance: { default: 0.4 },
    spawnerPlatformWidth: { default: 0.0625 },
    spawnerPlatformSpacing: { default: 0.021 },
    spawnCooldown: { default: 1 }
  },

  _updateOffset: (function() {
    const targetWorldPos = new THREE.Vector3();
    const cameraForward = new THREE.Vector3();
    const projectedCameraForward = new THREE.Vector3();
    const angledCameraForward = new THREE.Vector3();
    const defaultRight = new THREE.Vector3(1, 0, 0);
    return function() {
      const obj = this.el.object3D;
      const cameraObject3D = this.data.camera.object3D;
      cameraObject3D.updateMatrices();
      cameraForward.set(0, 0, -1);
      cameraForward.transformDirection(cameraObject3D.matrixWorld);
      projectedCameraForward.set(0, 0, -1);
      projectedCameraForward.transformDirection(cameraObject3D.matrixWorld);
      projectedCameraForward.projectOnPlane(THREE.Object3D.DefaultUp).normalize();
      const angle =
        Math.sign(THREE.Object3D.DefaultUp.dot(cameraForward)) * projectedCameraForward.angleTo(cameraForward);
      const angleOffset = angle - Math.max(this.data.minHudAngle, Math.min(this.data.maxHudAngle, angle));
      angledCameraForward.set(0, 0, -1);
      angledCameraForward.applyAxisAngle(defaultRight, this.data.hudAngle - angleOffset);
      angledCameraForward.multiplyScalar(this.data.hudDistance);
      cameraObject3D.localToWorld(angledCameraForward);
      //obj.parent.worldToLocal(angledCameraForward);
      obj.position.copy(angledCameraForward);
      obj.updateMatrices(true);
      //cameraObject3D.getWorldPosition(targetWorldPos);
      //obj.lookAt(targetWorldPos);
      obj.matrixNeedsUpdate = true;
    };
  })(),

  tick() {
    this._updateOffset();
  }
});

AFRAME.registerComponent("cardhand-attacher", {
  schema: {
    id: { default: 0 },
    deck: { default: {} }
  },
  init() {
    const selfEl = AFRAME.scenes[0].querySelector("#avatar-rig");
    const povCam = selfEl.querySelector("#avatar-pov-node");

    this.el.addEventListener("cardCreated", event => {
      const cardEl = event.detail.el;
      cardEl.setAttribute("billboard", "");
      //selfEl.appendChild(cardEl);

      let handEl = selfEl.querySelector("[cardshand]");
      if (handEl === null) {
        console.log("Creating");
        handEl = document.createElement("a-entity");
        handEl.setAttribute("cardshand", { follow: selfEl });
        handEl.object3D.position.set(0, 1, 0.5);
        AFRAME.scenes[0].appendChild(handEl);
      }

      cardEl.setAttribute("position", {
        x: 0,
        y: 0,
        z: 0.5
      });

      handEl.appendChild(cardEl);
    });
  }
});

AFRAME.registerComponent("cardguess", {
  schema: {
    id: { default: 0 },
    deck: { default: {} }
  },
  init() {
    const selfEl = AFRAME.scenes[0].querySelector("#avatar-rig");
    const povCam = selfEl.querySelector("#avatar-pov-node");

    const yCamOffset = 0;

    function attachObjToAvatar(obj, avatar) {
      NAF.utils.getNetworkedEntity(obj).then(networkedEl => {
        const mine = NAF.utils.isMine(networkedEl);
        if (!mine) NAF.utils.takeOwnership(networkedEl);
        networkedEl.object3D.position.copy(avatar.object3D.position);

        networkedEl.object3D.rotation.y = povCam.object3D.rotation.y + yCamOffset;
        networkedEl.object3D.rotation.x = 0;
        networkedEl.object3D.rotation.z = 0;
        networkedEl.object3D.position.y = 2;
        networkedEl.object3D.position.x = 0;
        networkedEl.object3D.position.z = 0;
      });
    }

    this.el.addEventListener("cardCreated", event => {
      const cardEl = event.detail.el;
      cardEl.setAttribute("card", { public: true });
      cardEl.setAttribute("billboard", "");
      selfEl.appendChild(cardEl);
      attachObjToAvatar(cardEl, selfEl);
    });
    //el.classList.add("interactable");
    //el.setAttribute("is-remote-hover-target", "");
  }
});

AFRAME.registerComponent("card", {
  schema: {
    id: { default: 0 },
    deck: { default: {} },
    public: { default: false },
    owner: { default: "" }
  },
  update(oldData) {
    if (true || this.data.public || this.data.owner === NAF.clientId) {
      this.material.map = this.texture;
      this.material.color.set(0xffffff);
    } else {
      this.material.color.set(0xff3333);
      this.material.map = null;
    }
  },
  init() {
    const el = this.el;
    el.classList.add("interactable");
    el.setAttribute("is-remote-hover-target", "");
    el.setAttribute("tags", {
      isHandCollisionTarget: true,
      isHoldable: true,
      offersHandConstraint: true,
      offersRemoteConstraint: true,
      togglesHoveredActionSet: true,
      singleActionButton: true
    });
    el.object3D.addEventListener("interact", console.log);
    /*
    el.setAttribute("geometry", {
      primitive: "plane",
      width: 0.61,
      height: 0.95
    });
    el.setAttribute("material", {
      src: this.data.deck.faceURL,
      color: "#FFFFFF",
      shader: "flat"
    });
*/
    //object3D.rotation.set(-Math.PI / 2, Math.PI * Math.random(), 0);

    /*
    el.setAttribute("scale", {
      x: s,
      y: s,
      z: s
    });
    */
    el.setAttribute("rotation", {
      x: -90,
      y: 180 * Math.random(),
      z: 0
    });

    //el.setAttribute("set-unowned-body-kinematic", {});
    //el.components["set-unowned-body-kinematic"].setBodyKinematic();

    el.setAttribute("body-helper", { type: "dynamic", mass: 1, collisionFilterGroup: 1, collisionFilterMask: 15 });
    el.setAttribute("matrix-auto-update", "");
    el.setAttribute("floaty-object", { modifyGravityOnRelease: true, autoLockOnLoad: true });

    // COMPUTE THE UVS
    const deck = this.data.deck;
    const numWidth = deck.numWidth;
    const numHeight = deck.numHeight;

    const s = 0.3;
    const object3D = this.el.object3D;
    const geometry = new THREE.PlaneBufferGeometry(0.61, 0.95);
    const texture = new THREE.TextureLoader().load(
      deck.faceURL
      //"https://cdn.glitch.com/f19894b4-a568-4130-b839-4b3598b68100%2Fsolitaire.png?1558627532814"
    );
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.NearestFilter;
    texture.repeat.x = 1 / numWidth;
    texture.repeat.y = 1 / numHeight;
    texture.anisotropy = 8;
    this.texture = texture;

    let material;
    if (true || this.data.public || this.data.owner === NAF.clientId) {
      material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
    } else {
      material = new THREE.MeshBasicMaterial({ color: 0xff3333, side: THREE.DoubleSide });
    }
    this.material = material;
    const plane = new THREE.Mesh(geometry, material);

    this.el.setObject3D("mesh", plane);
    object3D.scale.set(s, s, s);
    const uvs = el.getObject3D("mesh").geometry.attributes.uv;

    const y = numHeight - 1 - Math.floor(this.data.id / numWidth);
    const x = this.data.id % numWidth;

    for (let i = 0; i < uvs.length; i += 2) {
      geometry.attributes.uv.array[i] += x;
      geometry.attributes.uv.array[i + 1] += y;
    }
    uvs.needsUpdate = true;
  }
});

AFRAME.registerComponent("carddeck", {
  schema: {
    id: { default: "" },
    numWidth: { default: 10 },
    numHeight: { default: 7 },
    backURL: { default: "" },
    height: { default: 0.5 },
    faceURL: { default: "#cards" },

    numberCards: { default: 48 },
    currentCards: { default: 48 }
  },

  init: function() {
    this._handleGrabStart = this._handleGrabStart.bind(this);

    const el = this.el;

    el.setAttribute("scale", "3 3 3");
    el.setAttribute("gltf-model-plus", {
      src: "#cards-deck"
    });
    el.setAttribute("hoverable-visuals", "");
    el.setAttribute("tags", {
      isHandCollisionTarget: true,
      isHoldable: true,
      offersHandConstraint: true,
      offersRemoteConstraint: true,
      singleActionButton: true,
      togglesHoveredActionSet: true
    });
    el.setAttribute("floaty-object", { modifyGravityOnRelease: true, autoLockOnLoad: true });
    el.classList.add("interactable");
    el.setAttribute("is-remote-hover-target", "");
    el.setAttribute("interactable");
    el.setAttribute("body-helper", { type: "dynamic", mass: 1, collisionFilterGroup: 1, collisionFilterMask: 15 });

    this.availableCards = [];
    for (let i = 0; i < this.data.numberCards; i++) {
      this.availableCards.push({
        id: i,
        el: null
      });
    }
    this.shuffle();

    NAF.connection.subscribeToDataChannel("sync", (senderId, dataType, data) => {
      this.availableCards = data.cards;
    });

    const shuffleButton = document.createElement("a-entity");

    shuffleButton.setAttribute("is-remote-hover-target", "");
    shuffleButton.setAttribute("billboard", "");
    shuffleButton.classList.add("ui");
    shuffleButton.id = "shuffle";
    shuffleButton.setAttribute("position", "0 0.1 0.1");
    shuffleButton.setAttribute("tags", { singleActionButton: true });
    const s = 0.08;
    shuffleButton.setAttribute("scale", { x: s, y: s, z: s });
    shuffleButton.setAttribute("sprite", { name: "reset.png" });
    this.el.appendChild(shuffleButton);
    shuffleButton.object3D.addEventListener("interact", this.reset.bind(this));
  },

  reset: function() {
    Array.from(document.querySelectorAll("[card]")).forEach(el => {
      const cardData = el.components.card.data;
      if (cardData.deck.id === this.data.id) {
        if (!NAF.utils.isMine(el) && !NAF.utils.takeOwnership(el)) {
          console.error("Can't take ownership on card", cardData.id);
          return;
        }
        console.log("Removing card", cardData.id);
        el.remove();
      }
    });
    this.usedCards.forEach(c => {
      c.el = null;
      this.availableCards.push(c);
    });
    this.usedCards.length = 0;
    this.el.object3D.getObjectByName("Cube").scale.y = 1;
    this.data.currentCards = this.data.numberCards;

    NAF.connection.broadcastDataGuaranteed("sync", {
      cards: this.availableCards
    });
  },

  shuffle: function() {
    function shuffle(a) {
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }

    shuffle(this.availableCards);
    this.usedCards = [];
  },

  play: function() {
    this.el.object3D.addEventListener("interact", this._handleGrabStart);
  },

  pause: function() {
    this.el.object3D.removeEventListener("interact", this._handleGrabStart);
  },

  _handleGrabStart: function() {
    this.data.currentCards--;
    this.el.object3D.getObjectByName("Cube").scale.y = this.data.currentCards / this.data.numberCards;
    this.el.object3D.getObjectByName("Cube").matrixAutoUpdate = true;

    const scene = AFRAME.scenes[0];

    function getRandomIndex(items) {
      return Math.floor(Math.random() * items.length);
    }

    const card = this.availableCards.splice(getRandomIndex(this.availableCards), 1)[0];
    console.log(card);
    this.usedCards.push(card);
    const el = document.createElement("a-entity");
    card.el = el;
    el.setAttribute("card", {
      id: card.id,
      deck: this.data,
      owner: NAF.clientId
    });

    console.log(el, NAF.clientId);

    const pos = this.el.object3D.getObjectByName("Cube").getWorldPosition();
    const w = 1.8;
    el.setAttribute("position", {
      x: pos.x + Math.random() * w - w / 2,
      y: pos.y + 0.05,
      z: pos.z + Math.random() * w - w / 2
    });
    scene.appendChild(el);
    el.setAttribute("networked", { template: "#interactable-card-media" });
    this.el.emit("cardCreated", { card: card, el: el });
  }
});
