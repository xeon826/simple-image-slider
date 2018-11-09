var _createClass = function() {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  return function(Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

function _toConsumableArray(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
      arr2[i] = arr[i];
    }
    return arr2;
  } else {
    return Array.from(arr);
  }
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
var Slider = function() {
  function Slider() {
    _classCallCheck(this, Slider);
    this.bindAll();

    this.el = document.querySelector('.js-slider');
    this.inner = this.el.querySelector('.js-slider__inner');
    this.slides = [].concat(_toConsumableArray(this.el.querySelectorAll('.js-slide')));
    this.bullets = [].concat(_toConsumableArray(this.el.querySelectorAll('.js-slider-bullet')));

    this.renderer = null;
    this.scene = null;
    this.clock = null;
    this.camera = null;

    this.images = [
      'https://s3-us-west-2.amazonaws.com/s.cdpn.io/58281/bg1.jpg',
      'https://s3-us-west-2.amazonaws.com/s.cdpn.io/58281/bg2.jpg',
      'https://s3-us-west-2.amazonaws.com/s.cdpn.io/58281/bg3.jpg'
    ];


    this.data = {
      prev: 2,
      current: 0,
      next: 1,
      total: this.images.length - 1,
      delta: 0,
    };

    this.state = {
      animating: false,
      text: false,
      initial: true
    };

    this.textures = null;

    this.init();
  }
  _createClass(Slider, [{
    key: 'bindAll',
    value: function bindAll() {
      var _this = this;
      ['render', 'nextSlide', 'prevSlide'].
      forEach(function(fn) {
        return _this[fn] = _this[fn].bind(_this);
      });
    }
  }, {
    key: 'setStyles',
    value: function setStyles() {
      this.slides.forEach(function(slide, index) {
        if (index === 0) return;

        TweenMax.set(slide, {
          autoAlpha: 0
        });
      });

      this.bullets.forEach(function(bullet, index) {
        if (index === 0) return;

        var txt = bullet.querySelector('.js-slider-bullet__text');
        var line = bullet.querySelector('.js-slider-bullet__line');

        TweenMax.set(txt, {
          alpha: 0.25
        });

        TweenMax.set(line, {
          scaleX: 0,
          transformOrigin: 'left'
        });

      });
    }
  }, {
    key: 'cameraSetup',
    value: function cameraSetup() {
      this.camera = new THREE.OrthographicCamera(
        this.el.offsetWidth / -2,
        this.el.offsetWidth / 2,
        this.el.offsetHeight / 2,
        this.el.offsetHeight / -2,
        1,
        1000
      );


      this.camera.lookAt(this.scene.position);
      this.camera.position.z = 1;
    }
  }, {
    key: 'setup',
    value: function setup() {
      this.scene = new THREE.Scene();
      this.clock = new THREE.Clock(true);

      this.renderer = new THREE.WebGLRenderer({
        alpha: true
      });
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.setSize(this.el.offsetWidth, this.el.offsetHeight);

      this.inner.appendChild(this.renderer.domElement);
    }
  }, {
    key: 'loadTextures',
    value: function loadTextures() {
      var _this2 = this;
      var loader = new THREE.TextureLoader();
      loader.crossOrigin = '';

      this.textures = [];
      this.images.forEach(function(image) {
        var texture = loader.load(image + '?v=' + Date.now(), _this2.render);
        texture.minFilter = THREE.LinearFilter;
        _this2.textures.push(texture);
      });

      this.disp = loader.load('https://s3-us-west-2.amazonaws.com/s.cdpn.io/58281/rock-_disp.png', this.render);
      this.disp.magFilter = this.disp.minFilter = THREE.LinearFilter;
      this.disp.wrapS = this.disp.wrapT = THREE.RepeatWrapping;
    }
  }, {
    key: 'createMesh',
    value: function createMesh() {
      this.mat = new THREE.ShaderMaterial({
        uniforms: {
          dispPower: {
            type: 'f',
            value: 0.0
          },
          intensity: {
            type: 'f',
            value: 0.5
          },
          texture1: {
            type: 't',
            value: this.textures[0]
          },
          texture2: {
            type: 't',
            value: this.textures[1]
          },
          disp: {
            type: 't',
            value: this.disp
          }
        },

        transparent: true,
        vertexShader: document.querySelector('#vertexShader').textContent,
        fragmentShader: document.querySelector('#fragmentShader').textContent

      });


      var geometry = new THREE.PlaneBufferGeometry(
        this.el.offsetWidth,
        this.el.offsetHeight,
        1);


      var mesh = new THREE.Mesh(geometry, this.mat);

      this.scene.add(mesh);
    }
  }, {
    key: 'transition',
    value: function transition(direction) {
      var _this3 = this;
      _this3.changeTexture(direction);
      TweenMax.to(this.mat.uniforms.dispPower, 2.5, {
        value: 1,
        ease: Expo.easeInOut,
        onUpdate: this.render,
        onComplete: function onComplete() {
          _this3.mat.uniforms.dispPower.value = 0.0;
          _this3.render.bind(_this3);
          _this3.state.animating = false;
        }
      });

      var prev = this.slides[this.data.prev];
      var current = this.slides[this.data.current];
      var next = this.slides[this.data.next];

    }
  }, {
    key: 'prevSlide',
    value: function prevSlide() {
      if (this.state.animating) return;

      this.state.animating = true;

      this.transition('prev');

      this.data.current = this.data.current === this.data.delta ? this.data.total : this.data.current - 1;
      this.data.next = this.data.current === this.data.total ? this.data.delta : this.data.current + 1;
      this.data.prev = this.data.current === this.data.delta ? this.data.total : this.data.current - 1;
    }
  }, {
    key: 'nextSlide',
    value: function nextSlide() {
      if (this.state.animating) return;

      this.state.animating = true;

      this.transition('next');

      this.data.current = this.data.current === this.data.total ? this.data.delta : this.data.current + 1;
      this.data.next = this.data.current === this.data.total ? this.data.delta : this.data.current + 1;
      this.data.prev = this.data.current === this.data.delta ? this.data.total : this.data.current - 1;
    }
  }, {
    key: 'changeTexture',
    value: function changeTexture(direction) {
      this.mat.uniforms.texture1.value = this.textures[this.data.current];
      this.mat.uniforms.texture2.value = direction === 'next' ? this.textures[this.data.next] : this.textures[this.data.prev];
    }
  }, {
    key: 'listeners',
    value: function listeners() {
      document.querySelector('.js-nav-forward').addEventListener('click', this.nextSlide);
      document.querySelector('.js-nav-back').addEventListener('click', this.prevSlide);
    }
  }, {
    key: 'render',
    value: function render() {
      this.renderer.render(this.scene, this.camera);
    }
  }, {
    key: 'init',
    value: function init() {
      this.setup();
      this.cameraSetup();
      this.loadTextures();
      this.createMesh();
      this.setStyles();
      this.render();
      this.listeners();
    }
  }]);
  return Slider;
}();

// Init classes
var slider = new Slider();

// animate slider
// $('.slider__inner').children('canvas').removeAttr('width');
// $('.slider__inner').children('canvas').removeAttr('height');
// $('.slider__inner').children('canvas').removeAttr('style');
// $('.slider__inner').children('canvas').attr('width', '100vmax');
// $('.slider__inner').children('canvas').attr('height', '51vmax');
// $('.slider').animate({
//   'width': '100vmax',
//   'height': '51vmax'
// })

// Detect scroll top past 500px
// $(window).on('scroll', function(event) {
//   if ($(this).scrollTop() > 500) {
//     $('.slider').
//   }
// })


function preventDefault(e) {
  e = e || window.event;
  if (e.preventDefault)
    e.preventDefault();
  e.returnValue = false;
}

function preventDefaultForScrollKeys(e) {
  if (keys[e.keyCode]) {
    preventDefault(e);
    return false;
  }
}
function disableScroll() {
  if (window.addEventListener) // older FF
    window.addEventListener('DOMMouseScroll', preventDefault, false);
  window.onwheel = preventDefault; // modern standard
  window.onmousewheel = document.onmousewheel = preventDefault; // older browsers, IE
  window.ontouchmove = preventDefault; // mobile
  document.onkeydown = preventDefaultForScrollKeys;
}

function enableScroll() {
  if (window.removeEventListener)
    window.removeEventListener('DOMMouseScroll', preventDefault, false);
  window.onmousewheel = document.onmousewheel = null;
  window.onwheel = null;
  window.ontouchmove = null;
  document.onkeydown = null;
}
