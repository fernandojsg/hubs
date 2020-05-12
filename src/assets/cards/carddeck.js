AFRAME.registerComponent("card", {
  schema: {
    id: { default: 0 },
    deck: { default: "" }
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
    el.setAttribute("geometry", {
      primitive: "plane",
      width: 0.61,
      height: 0.95
    });
    const s = 0.3;
    el.setAttribute("scale", {
      x: s,
      y: s,
      z: s
    });
    el.setAttribute("material", {
      src: "#card1",
      color: "#FFFFFF",
      shader: "flat"
    });
    el.setAttribute("rotation", {
      x: -90,
      y: 180 * Math.random(),
      z: 0
    });

    let pos = this.el.getAttribute("position");
    let w = 1.8;
    el.setAttribute("position", {
      x: pos.x + Math.random() * w - w / 2,
      y: pos.y + 0.01,
      z: pos.z + Math.random() * w - w / 2
    });

    el.setAttribute("body-helper", { type: "dynamic", mass: 1, collisionFilterGroup: 1, collisionFilterMask: 15 });
    el.id = Math.random().toString();
    el.setAttribute("matrix-auto-update", "");
    el.setAttribute("floaty-object", { modifyGravityOnRelease: true, autoLockOnLoad: true });
  }
});

AFRAME.registerComponent("carddeck", {
  schema: {
    numWidth: { default: 7 },
    numHeight: { default: 10 },
    backURL: { default: "" },
    faceURL: { default: "" },

    numberCards: { default: 100 },
    currentCards: { default: 100 }
  },

  init: function() {
    console.log(">>>>>>>>>>");
    this._handleGrabStart = this._handleGrabStart.bind(this);

    const el = this.el;
    el.setAttribute("scale", "3 3 3");
    el.setAttribute("gltf-model-plus", {
      src: "#cards-deck"
    });
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

    this.cards = [];
    for (i = 0; i < this.data.numberCards; i++) {
      this.cards.push({
        id: i,
        el: null
      });
    }
    this.shuffle();
  },

  shuffle: function() {
    function shuffle(a) {
      for (let i = a.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }

    shuffle(this.cards);
    console.log(this.cards);
  },

  play: function() {
    this.el.object3D.addEventListener("interact", this._handleGrabStart);
  },

  pause: function() {
    this.el.object3D.removeEventListener("interact", this._handleGrabStart);
  },

  _handleGrabStart: function() {
    this.data.currentCards--;
    this.el.object3D.children[0].children[0].scale.y = this.data.currentCards / this.data.numberCards;
    this.el.object3D.children[0].children[0].matrixAutoUpdate = true;

    console.log("Grabbbing");

    const scene = AFRAME.scenes[0];
    const el = document.createElement("a-entity");
    el.setAttribute("card", {
      id:
    });
    scene.appendChild(el);

    //setTimeout(() => {
    //setMatrixWorld(el.object3D, document.getElementById("viewing-camera").object3DMap.camera.matrixWorld);
    //}, 0);

    /*
    const rand = Math.random();
    if (rand < this.data.specialQuackPercentage) {
      this.el.sceneEl.systems["hubs-systems"].soundEffectsSystem.playSoundOneShot(SOUND_SPECIAL_QUACK);
    } else if (rand < this.data.quackPercentage) {
      this.el.sceneEl.systems["hubs-systems"].soundEffectsSystem.playSoundOneShot(SOUND_QUACK);
    }
    */
  }
});
