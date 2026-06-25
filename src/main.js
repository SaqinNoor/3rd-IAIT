import './style.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';
import * as THREE from 'three';

gsap.registerPlugin(ScrollTrigger);



function initLoader(onHandoff) {
  return new Promise(resolve => {
    const counter = { val: 0 };
    const counterEl = document.querySelector('.loader-counter');
    const statusEl = document.querySelector('.loader-status');
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#@%&";

    function scrambleText(element, finalString) {
      let iterations = 0;
      const interval = setInterval(() => {
        element.innerText = finalString.split("").map((letter, index) => {
          if (index < iterations) return finalString[index];
          return chars[Math.floor(Math.random() * 26)];
        }).join("");
        if (iterations >= finalString.length) clearInterval(interval);
        iterations += 1 / 2;
      }, 30);
    }

    const tl = gsap.timeline();
    
    gsap.to('.loader-grid', {
      y: "20%", rotateX: 50, scale: 1.5,
      duration: 3, ease: "none", repeat: -1, yoyo: true
    });

    tl.to(counter, {
      val: 100,
      duration: 3.5,
      ease: "power4.inOut",
      onUpdate: () => {
        const val = Math.floor(counter.val);
        if (counterEl) counterEl.innerText = val.toString().padStart(2, '0');
        if (statusEl) {
          if (val === 15) scrambleText(statusEl, "LOADING CORE...");
          if (val === 40) scrambleText(statusEl, "OPTIMIZING ASSETS...");
          if (val === 75) scrambleText(statusEl, "ESTABLISHING UPLINK...");
          if (val === 98) scrambleText(statusEl, "ACCESS GRANTED");
        }
      }
    });

    tl.to('.loader-line', { width: '100vw', duration: 3, ease: "expo.out" }, '<');

    tl.to('.loader-content', {
      filter: "blur(20px)",
      opacity: 0,
      scale: 0.9,
      duration: 0.5,
      ease: "power2.in"
    });

    tl.to('.acid-loader', {
      yPercent: -100,
      duration: 1.2,
      ease: "power4.inOut",
      onStart: () => {
        if (onHandoff) setTimeout(onHandoff, 100);
      },
      onComplete: resolve
    });
  });
}


function initCursor() {
  const cursor = document.getElementById('cursor');
  const dot = document.getElementById('cursor-dot');
  let mx = 0, my = 0, cx = 0, cy = 0;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  gsap.ticker.add(() => {
    cx += (mx - cx) * 0.12;
    cy += (my - cy) * 0.12;
    gsap.set(cursor, { x: cx, y: cy, xPercent: -50, yPercent: -50 });
    gsap.set(dot, { x: mx, y: my, xPercent: -50, yPercent: -50 });
  });
  document.querySelectorAll('a, button, .hotspot').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
}


function initLenis() {
  const lenis = new Lenis({ 
    lerp: 0.1, 
    smoothWheel: true,
    smoothTouch: true,
    touchMultiplier: 1.5,
    syncTouch: true
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}


function initStars() {
  const field = document.getElementById('star-field');
  const canvas = document.createElement('canvas');
  canvas.style.position = 'absolute';
  canvas.style.inset = '0';
  canvas.style.pointerEvents = 'none';
  field.appendChild(canvas);
  
  const ctx = canvas.getContext('2d');
  let w, h;
  const setSize = () => { w = canvas.width = field.clientWidth; h = canvas.height = Math.max(field.clientHeight, window.innerHeight); };
  setSize();
  window.addEventListener('resize', setSize);

  const stars = Array.from({ length: 150 }, () => ({
    x: Math.random() * w, 
    y: Math.random() * h,
    s: Math.random() * 1.5 + 0.5,
    a: Math.random() * Math.PI * 2,
    v: 0.02 + Math.random() * 0.03
  }));

  gsap.ticker.add(() => {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#ffffff';
    stars.forEach(st => {
      st.a += st.v;
      ctx.globalAlpha = 0.2 + Math.abs(Math.sin(st.a)) * 0.8;
      ctx.beginPath();
      ctx.arc(st.x, st.y, st.s, 0, Math.PI * 2);
      ctx.fill();
    });
  });
}


function drawWireframeFish(canvasId, color) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.globalAlpha = 0.7;
  const cx = W * 0.42, cy = H * 0.5, rx = W * 0.3, ry = H * 0.25;
  ctx.beginPath(); ctx.arc(cx - rx * 0.55, cy - ry * 0.1, 4, 0, Math.PI * 2); ctx.stroke();
}

function drawWireframeJellyfish(canvasId, color) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.globalAlpha = 0.65;
  const cx = W / 2, cy = H * 0.28, rx = W * 0.38, ry = H * 0.26;
  ctx.beginPath();
  for (let i = 0; i <= 20; i++) { const a = (i / 20) * Math.PI; ctx.lineTo(cx + Math.cos(a) * rx, cy - Math.sin(a) * ry); }
  ctx.stroke();
  for (let i = 1; i < 6; i++) { ctx.beginPath(); ctx.moveTo(cx - rx + (i * rx * 2 / 6), cy); ctx.bezierCurveTo(cx, cy - ry * 0.5, cx, cy - ry * 0.8, cx, cy - ry); ctx.stroke(); }
  for (let i = 0; i < 8; i++) {
    const tx = cx - rx * 0.78 + (i * rx * 1.56 / 7), tl = H * (0.3 + Math.random() * 0.35);
    ctx.beginPath(); ctx.moveTo(tx, cy);
    ctx.bezierCurveTo(tx + (Math.random() - 0.5) * 18, cy + tl * 0.35, tx + (Math.random() - 0.5) * 24, cy + tl * 0.7, tx + (Math.random() - 0.5) * 14, cy + tl);
    ctx.stroke();
  }
}

function drawWireframeAnglerfish(canvasId, color) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.globalAlpha = 0.6;
  const cx = W * 0.45, cy = H * 0.52, rx = W * 0.33, ry = H * 0.3;
  const pts = [];
  for (let i = 0; i < 18; i++) { const a = (i / 18) * Math.PI * 2, w = 1 + 0.15 * Math.sin(a * 3 + 1.5); pts.push({ x: cx + Math.cos(a) * rx * w, y: cy + Math.sin(a) * ry * w }); }
  ctx.beginPath(); pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)); ctx.closePath(); ctx.stroke();
  for (let i = 0; i < 18; i += 3) { ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(pts[i].x, pts[i].y); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(cx - rx * 0.2, cy - ry); ctx.bezierCurveTo(cx, cy - ry * 1.8, cx + rx * 0.6, cy - ry * 1.4, cx + rx * 0.5, cy - ry * 0.7); ctx.stroke();
  ctx.globalAlpha = 0.9; ctx.fillStyle = color; ctx.beginPath(); ctx.arc(cx + rx * 0.5, cy - ry * 0.7, 6, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 0.6;
  ctx.beginPath(); ctx.moveTo(cx - rx, cy + ry * 0.1); ctx.lineTo(cx - rx * 1.15, cy - ry * 0.2);
  for (let t = 0; t <= 7; t++) { const ty = cy - ry * 0.2 + (t * ry * 0.45 / 7); ctx.lineTo(cx - rx * 1.15 + (t % 2 === 0 ? 6 : 18), ty); }
  ctx.stroke();
}

function initCreatures() {
  drawWireframeFish('fish-1', '#99eb1e');
  drawWireframeJellyfish('jellyfish-1', '#333333');
  drawWireframeFish('fish-2', '#7e7f9a');
  drawWireframeAnglerfish('anglerfish-1', '#99eb1e');
  drawWireframeJellyfish('jellyfish-2', '#99eb1e');
  drawWireframeFish('fish-3', '#333333');
  drawWireframeAnglerfish('anglerfish-2', '#7e7f9a');
  drawWireframeFish('fish-4', '#99eb1e');
  drawWireframeJellyfish('jellyfish-3', '#7e7f9a');
  drawWireframeAnglerfish('anglerfish-3', '#333333');
}


function animateCounter(el, target, duration = 2) {
  const obj = { val: 0 };
  gsap.to(obj, { val: target, duration, ease: 'power2.out', onUpdate: () => { el.textContent = Math.floor(obj.val).toLocaleString(); } });
}


function initGlobe(lenis) {
  const container = document.getElementById('globe-container');
  if (!container) return;

  const W = container.clientWidth || 600;
  const H = container.clientHeight || 600;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 1000);
  camera.position.z = (window.innerWidth <= 768) ? 3.5 : 2.8;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  const sphereGeo = new THREE.SphereGeometry(1, 64, 64);
  const sphereMat = new THREE.MeshPhongMaterial({
    color: 0x020c1a,
    emissive: 0x000a14,
    emissiveIntensity: 0.5,
    shininess: 30,
    transparent: true,
    opacity: 0.95
  });
  const sphere = new THREE.Mesh(sphereGeo, sphereMat);
  scene.add(sphere);

  const atmGeo = new THREE.SphereGeometry(1.12, 64, 64);
  const atmMat = new THREE.MeshBasicMaterial({ color: 0x99eb1e, transparent: true, opacity: 0.06, side: THREE.BackSide });
  scene.add(new THREE.Mesh(atmGeo, atmMat));

  const ambient = new THREE.AmbientLight(0x020612, 1.8);
  scene.add(ambient);
  const dirLight = new THREE.DirectionalLight(0x99eb1e, 0.8);
  dirLight.position.set(5, 3, 5);
  scene.add(dirLight);
  const dirLight2 = new THREE.DirectionalLight(0x333333, 0.4);
  dirLight2.position.set(-5, -2, -3);
  scene.add(dirLight2);

  function latLngToVec3(lat, lng, r = 1.002) {
    const phi = (90 - lat) * Math.PI / 180;
    const theta = (lng + 180) * Math.PI / 180;
    return new THREE.Vector3(
      -r * Math.sin(phi) * Math.cos(theta),
      r * Math.cos(phi),
      r * Math.sin(phi) * Math.sin(theta)
    );
  }

  fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json')
    .then(res => res.json())
    .then(data => {
      const geoMat = new THREE.LineBasicMaterial({ color: 0x7e7f9a, transparent: true, opacity: 0.5 });
      data.features.forEach(feature => {
        if (feature.geometry.type === 'Polygon') {
          drawPoly(feature.geometry.coordinates[0], geoMat);
        } else if (feature.geometry.type === 'MultiPolygon') {
          feature.geometry.coordinates.forEach(poly => drawPoly(poly[0], geoMat));
        }
      });
    }).catch(e => {});

  function drawPoly(coords, material) {
    const points = [];
    coords.forEach(coord => {
      points.push(latLngToVec3(coord[1], coord[0], 1.001));
    });
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, material);
    sphere.add(line);
  }

  function createArc(startLat, startLng, endLat, endLng, color, segments = 60) {
    const start = latLngToVec3(startLat, startLng);
    const end = latLngToVec3(endLat, endLng);
    const points = [];
    for (let i = 0; i <= segments; i++) {
      const p = start.clone().lerp(end, i / segments);
      p.normalize().multiplyScalar(1.002);
      points.push(p);
    }
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.8 });
    return new THREE.Line(geo, mat);
  }

  function createPoint(lat, lng, color) {
    const pos = latLngToVec3(lat, lng, 1.025);
    const geo = new THREE.SphereGeometry(0.012, 8, 8);
    const mat = new THREE.MeshBasicMaterial({ color });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(pos);
    return mesh;
  }

  const GREEN = 0x99eb1e;
  const CYAN = 0x00d4ff;
  const GRAY = 0x7e7f9a;

  const cables = [
    [40.7, -74.0, 51.5, -0.1, CYAN],
    [40.7, -74.0, 38.7, -9.1, CYAN],
    [40.7, -74.0, 43.6, -70.2, GREEN],
    [25.8, -80.2, 38.7, -9.1, GREEN],
    [25.8, -80.2, 18.5, -72.3, GREEN],
    [25.8, -80.2, 40.7, -74.0, GREEN],
    [25.8, -80.2, 9.0, -79.5, GREEN],
    [51.5, -0.1, 48.8, 2.3, CYAN],
    [48.8, 2.3, 43.3, 5.3, GREEN],
    [43.3, 5.3, 36.7, 3.1, GREEN],
    [36.7, 3.1, 33.9, 10.2, GREEN],
    [33.9, 10.2, 31.2, 29.9, GREEN],
    [31.2, 29.9, 30.1, 31.3, GREEN],
    [30.1, 31.3, 25.2, 55.3, CYAN],
    [25.2, 55.3, 24.5, 51.5, GREEN],
    [24.5, 51.5, 21.5, 39.2, GREEN],
    [21.5, 39.2, 15.6, 32.5, GREEN],
    [15.6, 32.5, 11.6, 43.1, GREEN],
    [11.6, 43.1, 1.3, 45.3, GREEN],
    [25.2, 55.3, 19.1, 72.9, CYAN],
    [19.1, 72.9, 13.1, 80.3, GREEN],
    [13.1, 80.3, 1.3, 103.8, CYAN],
    [1.3, 103.8, 22.3, 114.2, CYAN],
    [22.3, 114.2, 35.7, 139.7, CYAN],
    [35.7, 139.7, 37.8, -122.4, CYAN],
    [37.8, -122.4, 47.6, -122.3, GREEN],
    [47.6, -122.3, 51.5, -0.1, GRAY],
    [1.3, 103.8, -33.9, 151.2, GREEN],
    [-33.9, 151.2, -36.8, 174.7, GREEN],
    [-36.8, 174.7, 1.3, 103.8, GRAY],
    [37.8, -122.4, 21.3, -157.8, GREEN],
    [21.3, -157.8, -33.9, 151.2, GREEN],
    [21.3, -157.8, 1.3, 103.8, GREEN],
    [21.3, -157.8, 35.7, 139.7, GREEN],
    [40.7, -74.0, -23.5, -46.6, GREEN],
    [-23.5, -46.6, -34.6, -58.3, GREEN],
    [-23.5, -46.6, -33.5, -70.6, GREEN],
    [9.0, -79.5, -23.5, -46.6, GREEN],
    [9.0, -79.5, 37.8, -122.4, GREEN],
    [38.7, -9.1, 14.7, -17.4, GREEN],
    [14.7, -17.4, -33.9, 18.4, GREEN],
    [-33.9, 18.4, -23.5, -46.6, GREEN],
    [-33.9, 18.4, -20.3, 57.5, GREEN],
    [-20.3, 57.5, 1.3, 103.8, GREEN],
    [-20.3, 57.5, 19.1, 72.9, GREEN],
    [51.5, -0.1, 60.4, 5.3, GREEN],
    [60.4, 5.3, 59.9, 30.3, GREEN],
    [59.9, 30.3, 60.2, 24.9, GREEN],
    [51.5, -0.1, 53.3, -6.3, GREEN],
    [55.7, 37.6, 48.5, 34.2, GREEN],
    [25.2, 55.3, 41.0, 28.9, GREEN],
    [14.7, -17.4, 4.4, 9.7, GREEN],
    [4.4, 9.7, -4.3, 15.3, GREEN],
    [-4.3, 15.3, -33.9, 18.4, GREEN],
    [1.3, 103.8, 15.9, 108.2, GREEN],
    [15.9, 108.2, 22.3, 114.2, GREEN],
    [35.7, 139.7, -33.9, 151.2, GREEN],
    [22.3, 114.2, 10.8, 106.7, GREEN],
    [10.8, 106.7, 3.1, 101.7, GREEN],
    [3.1, 101.7, 1.3, 103.8, GREEN],
    [13.1, 80.3, 6.9, 79.9, GREEN],
    [6.9, 79.9, -20.3, 57.5, GREEN],
    [41.0, 28.9, 37.0, 22.0, GREEN],
    [37.0, 22.0, 33.9, 10.2, GREEN],
    [48.8, 2.3, 51.5, -0.1, GREEN],
    [-23.5, -46.6, 10.5, -66.9, GREEN],
    [10.5, -66.9, 18.5, -72.3, GREEN],
    [18.5, -72.3, 25.8, -80.2, GREEN],
    [38.7, -9.1, 27.7, -15.4, GREEN],
    [27.7, -15.4, 14.7, -17.4, GREEN],
    [27.7, -15.4, 25.8, -80.2, GRAY],
    [47.6, -122.3, 21.3, -157.8, GREEN],
    [51.5, -0.1, 40.7, -74.0, CYAN],
    [13.1, 80.3, 22.3, 114.2, GRAY],
    [-33.5, -70.6, -33.9, 18.4, GRAY],
    [59.9, 30.3, 35.7, 139.7, GRAY],
    [60.4, 5.3, 21.3, -157.8, GRAY]
  ];

  const cities = [
    [40.7, -74.0, CYAN],
    [51.5, -0.1, CYAN],
    [38.7, -9.1, GREEN],
    [25.8, -80.2, GREEN],
    [37.8, -122.4, CYAN],
    [47.6, -122.3, GREEN],
    [35.7, 139.7, CYAN],
    [22.3, 114.2, CYAN],
    [1.3, 103.8, CYAN],
    [10.8, 106.7, GREEN],
    [3.1, 101.7, GREEN],
    [15.9, 108.2, GREEN],
    [-33.9, 151.2, GREEN],
    [-36.8, 174.7, GREEN],
    [-33.9, 18.4, GREEN],
    [-23.5, -46.6, GREEN],
    [-34.6, -58.3, GREEN],
    [-33.5, -70.6, GREEN],
    [25.2, 55.3, CYAN],
    [24.5, 51.5, GREEN],
    [21.5, 39.2, GREEN],
    [13.1, 80.3, GREEN],
    [19.1, 72.9, CYAN],
    [6.9, 79.9, GREEN],
    [48.8, 2.3, GREEN],
    [43.3, 5.3, GREEN],
    [36.7, 3.1, GREEN],
    [33.9, 10.2, GREEN],
    [31.2, 29.9, GREEN],
    [30.1, 31.3, GREEN],
    [41.0, 28.9, GREEN],
    [21.3, -157.8, GREEN],
    [14.7, -17.4, GREEN],
    [27.7, -15.4, GREEN],
    [-20.3, 57.5, GREEN],
    [4.4, 9.7, GREEN],
    [-4.3, 15.3, GREEN],
    [11.6, 43.1, GREEN],
    [1.3, 45.3, GREEN],
    [15.6, 32.5, GREEN],
    [60.4, 5.3, GREEN],
    [59.9, 30.3, GREEN],
    [60.2, 24.9, GREEN],
    [53.3, -6.3, GREEN],
    [9.0, -79.5, GREEN],
    [18.5, -72.3, GREEN],
    [10.5, -66.9, GREEN],
    [43.6, -70.2, GREEN],
    [37.0, 22.0, GREEN]
  ];

  cables.forEach(([sLat, sLng, eLat, eLng, col]) => {
    const arc = createArc(sLat, sLng, eLat, eLng, col);
    sphere.add(arc);
  });

  const pulseRings = [];
  cities.forEach(([lat, lng, col]) => {
    const pt = createPoint(lat, lng, col);
    sphere.add(pt);
    const pos = latLngToVec3(lat, lng, 1.03);
    const geo = new THREE.RingGeometry(0.012, 0.025, 16);
    const mat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.8, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(geo, mat);
    ring.position.copy(pos);
    ring.lookAt(new THREE.Vector3(0, 0, 0));
    ring.userData = { phase: Math.random() * Math.PI * 2 };
    sphere.add(ring);
    pulseRings.push(ring);
  });

  let isDragging = false, prevMouse = { x: 0, y: 0 };
  let rotX = 0, rotY = 0, velX = 0, velY = 0;

  const dom = renderer.domElement;
  dom.addEventListener('mousedown', e => { isDragging = true; prevMouse = { x: e.clientX, y: e.clientY }; });
  dom.addEventListener('mousemove', e => {
    if (!isDragging) return;
    const dx = e.clientX - prevMouse.x, dy = e.clientY - prevMouse.y;
    velX = dy * 0.003; velY = dx * 0.003;
    rotX += velX; rotY += velY;
    prevMouse = { x: e.clientX, y: e.clientY };
  });
  dom.addEventListener('mouseup', () => { isDragging = false; });
  dom.addEventListener('mouseleave', () => { isDragging = false; });

  let lastTouch = null;
  dom.addEventListener('touchstart', e => { 
    lastTouch = e.touches[0]; 
    if (lenis) lenis.stop();
  });
  dom.addEventListener('touchmove', e => {
    if (e.cancelable) e.preventDefault();
    if (!lastTouch) return;
    const dx = e.touches[0].clientX - lastTouch.clientX;
    const dy = e.touches[0].clientY - lastTouch.clientY;
    velY = dx * 0.003; velX = dy * 0.003;
    rotX += velX; rotY += velY;
    lastTouch = e.touches[0];
  }, { passive: false });

  dom.addEventListener('touchend', () => { if (lenis) lenis.start(); });
  dom.addEventListener('touchcancel', () => { if (lenis) lenis.start(); });

  let resizeTimer;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const nW = container.clientWidth, nH = container.clientHeight;
      camera.aspect = nW / nH; camera.updateProjectionMatrix();
      camera.position.z = (window.innerWidth <= 768) ? 3.5 : 2.8;
      renderer.setSize(nW, nH);
    }, 100);
  }
  window.addEventListener('resize', onResize);

  ScrollTrigger.create({
    trigger: '#globe-section',
    start: 'top 80%',
    once: true,
    onEnter: () => { dom.style.opacity = '0'; dom.style.transition = 'opacity 1s ease'; setTimeout(() => dom.style.opacity = '1', 100); }
  });

  let globeVisible = false;
  const observer = new IntersectionObserver(entries => {
    globeVisible = entries[0].isIntersecting;
  }, { threshold: 0 });
  observer.observe(document.getElementById('globe-section'));

  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    if (!globeVisible) return;
    const t = clock.getElapsedTime();

    if (!isDragging) {
      velX *= 0.95; velY *= 0.95;
      rotY += 0.0015; 
    }
    rotX += (velX - rotX) * 0;
    sphere.rotation.x = rotX;
    sphere.rotation.y += velY + (isDragging ? 0 : 0.0015);

    pulseRings.forEach(ring => {
      const phase = ring.userData.phase;
      const s = 1 + 0.4 * Math.abs(Math.sin(t * 1.5 + phase));
      ring.scale.setScalar(s);
      ring.material.opacity = 0.8 - 0.5 * Math.abs(Math.sin(t * 1.5 + phase));
    });

    renderer.render(scene, camera);
  }
  animate();
}


function initBangladeshCanvas() {
  const canvas = document.getElementById('bd-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = 600, H = 600;

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    const s = rect.width / W;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = (H * s) + 'px';
    canvas.width = W;
    canvas.height = H;
  }
  resize();
  window.addEventListener('resize', resize);

  const green = '#99eb1e';
  const cyan = '#00d4ff';
  const white = '#ffffff';

  const MAP_LAT_MIN = 0, MAP_LAT_MAX = 30;
  const MAP_LNG_MIN = 72, MAP_LNG_MAX = 108;
  const MAP_LAT_RNG = MAP_LAT_MAX - MAP_LAT_MIN;
  const MAP_LNG_RNG = MAP_LNG_MAX - MAP_LNG_MIN;

  function geoToCanvas(lat, lng) {
    return {
      x: (lng - MAP_LNG_MIN) / MAP_LNG_RNG * W,
      y: (MAP_LAT_MAX - lat) / MAP_LAT_RNG * H
    };
  }

  const nodeData = [
    { lat: 23.8, lng: 90.4, r: 24, label: 'BANGLADESH', color: white, tag: 'DHAKA · NOC' },
    { lat: 21.4, lng: 92.0, r: 12, label: "COX'S BAZAR", color: green, tag: 'SEA-ME-WE 4/5' },
    { lat: 21.8, lng: 90.1, r: 12, label: 'KUAKATA', color: green, tag: 'SEA-ME-WE 6' },
    { lat: 1.3, lng: 103.8, r: 10, label: 'SINGAPORE', color: cyan, tag: 'REGIONAL HUB' },
    { lat: 13.1, lng: 80.3, r: 10, label: 'CHENNAI', color: green, tag: 'SEA-ME-WE 4' },
    { lat: 6.9, lng: 79.9, r: 9, label: 'COLOMBO', color: cyan, tag: 'SEA-ME-WE 6' },
  ];

  const nodes = nodeData.map(d => ({ ...d, ...geoToCanvas(d.lat, d.lng) }));

  const links = [
    { a: 0, b: 1, color: green, label: '80 km', dash: [4, 8] },
    { a: 0, b: 2, color: green, label: '120 km', dash: [4, 8] },
    { a: 1, b: 3, color: cyan, label: '2,400 km', dash: [6, 10] },
    { a: 1, b: 4, color: green, label: '1,800 km', dash: [6, 10] },
    { a: 2, b: 5, color: cyan, label: '1,500 km', dash: [6, 10] },
  ];

  const particles = [];
  links.forEach((lk, li) => {
    for (let i = 0; i < 3; i++) {
      particles.push({
        li, t: i / 3 + Math.random() * 0.1,
        speed: 0.002 + Math.random() * 0.002,
        trail: []
      });
    }
  });

  function midBetween(a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const bend = dist * 0.2;
    return { x: (a.x + b.x) / 2 - dy / dist * bend, y: (a.y + b.y) / 2 + dx / dist * bend };
  }

  function sampleLink(lk, t) {
    const na = nodes[lk.a], nb = nodes[lk.b];
    const m = midBetween(na, nb);
    const u = 1 - t;
    return {
      x: u * u * na.x + 2 * u * t * m.x + t * t * nb.x,
      y: u * u * na.y + 2 * u * t * m.y + t * t * nb.y
    };
  }

  let countriesGeo = null;
  let mapLoaded = false;

  fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json')
    .then(r => r.json())
    .then(data => { countriesGeo = data; mapLoaded = true; })
    .catch(() => {});

  function drawMap() {
    if (!mapLoaded || !countriesGeo) return;

    ctx.save();

    const landColor = 'rgba(12, 20, 36, 0.97)';
    const borderColor = 'rgba(153, 235, 30, 0.35)';
    const coastColor = 'rgba(153, 235, 30, 0.5)';

    function drawPolygon(coords, fill, stroke, lw) {
      ctx.beginPath();
      let started = false;
      coords.forEach(([lng, lat]) => {
        const { x, y } = geoToCanvas(lat, lng);
        if (x < -10 || x > W + 10 || y < -10 || y > H + 10) return;
        if (!started) { ctx.moveTo(x, y); started = true; }
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      if (fill) { ctx.fillStyle = fill; ctx.fill(); }
      if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1; ctx.stroke(); }
    }

    ctx.fillStyle = landColor;
    ctx.fillRect(0, 0, W, H);

    countriesGeo.features.forEach(f => {
      const geom = f.geometry;
      if (!geom) return;
      if (geom.type === 'Polygon') {
        drawPolygon(geom.coordinates[0], landColor, null, 0);
      } else if (geom.type === 'MultiPolygon') {
        geom.coordinates.forEach(poly => drawPolygon(poly[0], landColor, null, 0));
      }
    });

    countriesGeo.features.forEach(f => {
      const geom = f.geometry;
      if (!geom) return;
      if (geom.type === 'Polygon') {
        drawPolygon(geom.coordinates[0], null, borderColor, 1);
      } else if (geom.type === 'MultiPolygon') {
        geom.coordinates.forEach(poly => drawPolygon(poly[0], null, borderColor, 1));
      }
    });

    countriesGeo.features.forEach(f => {
      const geom = f.geometry;
      if (!geom) return;
      if (geom.type === 'Polygon') {
        drawPolygon(geom.coordinates[0], null, coastColor, 0.8);
      } else if (geom.type === 'MultiPolygon') {
        geom.coordinates.forEach(poly => drawPolygon(poly[0], null, coastColor, 0.8));
      }
    });

    ctx.restore();
  }

  function drawBackground() {
    ctx.fillStyle = 'rgba(2, 6, 12, 0.15)';
    ctx.fillRect(0, 0, W, H);
  }

  function drawGrid() {
    ctx.save();
    for (let r = 80; r < 400; r += 80) {
      ctx.beginPath();
      ctx.arc(300, 240, r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(153, 235, 30, ${0.03 + r * 0.0001})`;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
    for (let a = 0; a < 6; a++) {
      const ang = a * Math.PI / 3;
      ctx.beginPath();
      ctx.moveTo(300, 240);
      ctx.lineTo(300 + Math.cos(ang) * 320, 240 + Math.sin(ang) * 320);
      ctx.strokeStyle = 'rgba(153, 235, 30, 0.025)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawLinks(time) {
    links.forEach((lk) => {
      const na = nodes[lk.a], nb = nodes[lk.b];
      const steps = 60;

      ctx.save();

      ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const p = sampleLink(lk, i / steps);
        i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
      }
      ctx.strokeStyle = lk.color;
      ctx.globalAlpha = 0.06;
      ctx.lineWidth = 8;
      ctx.stroke();

      ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const p = sampleLink(lk, i / steps);
        i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
      }
      ctx.globalAlpha = 0.12;
      ctx.lineWidth = 3;
      ctx.stroke();

      const offset = (time * 0.04) % 20;
      ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const p = sampleLink(lk, i / steps);
        i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
      }
      ctx.globalAlpha = 0.5;
      ctx.lineWidth = 1.2;
      ctx.setLineDash(lk.dash);
      ctx.lineDashOffset = -offset;
      ctx.stroke();
      ctx.setLineDash([]);

      const mid = sampleLink(lk, 0.5);
      ctx.font = '6px "JetBrains Mono", monospace';
      ctx.fillStyle = lk.color;
      ctx.globalAlpha = 0.2;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(lk.label, mid.x, mid.y - 4);

      ctx.restore();
    });
  }

  function drawParticles(time) {
    particles.forEach(p => {
      p.t += p.speed;
      if (p.t > 1) p.t -= 1;

      const lk = links[p.li];
      const pos = sampleLink(lk, p.t);
      const glow = 0.5 + 0.5 * Math.sin(time * 0.004 + p.t * 15 + p.li);

      p.trail.push({ x: pos.x, y: pos.y, life: 1 });
      if (p.trail.length > 6) p.trail.shift();
      p.trail.forEach(tr => tr.life -= 0.2);

      ctx.save();
      p.trail.forEach(tr => {
        if (tr.life <= 0) return;
        ctx.beginPath();
        ctx.arc(tr.x, tr.y, 2 * tr.life, 0, Math.PI * 2);
        ctx.fillStyle = lk.color;
        ctx.globalAlpha = tr.life * 0.12;
        ctx.fill();
      });

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 2.5 + glow, 0, Math.PI * 2);
      ctx.fillStyle = white;
      ctx.globalAlpha = 0.8;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 5 + glow * 2, 0, Math.PI * 2);
      ctx.fillStyle = lk.color;
      ctx.globalAlpha = 0.15 * glow;
      ctx.fill();

      ctx.restore();
    });
  }

  function drawNodes(time) {
    nodes.forEach((node, i) => {
      const pulse = 0.5 + 0.5 * Math.sin(time * 0.0015 + i * 1.7);
      const isCentral = i === 0;

      ctx.save();

      for (let r = 0; r < 3; r++) {
        const phase = (time * 0.001 + r * 0.35 + i * 0.7) % 1;
        const radius = node.r + 6 + phase * (isCentral ? 35 : 20);
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = node.color;
        ctx.globalAlpha = 0.15 * (1 - phase);
        ctx.lineWidth = isCentral ? 1.5 : 0.8;
        ctx.stroke();
      }

      const grad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.r);
      if (isCentral) {
        grad.addColorStop(0, 'rgba(153, 235, 30, 0.15)');
        grad.addColorStop(0.5, 'rgba(153, 235, 30, 0.05)');
        grad.addColorStop(1, 'rgba(153, 235, 30, 0)');
      } else {
        grad.addColorStop(0, 'rgba(153, 235, 30, 0.08)');
        grad.addColorStop(1, 'rgba(153, 235, 30, 0)');
      }
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.r + (isCentral ? 15 : 8), 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      if (isCentral) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(153, 235, 30, ${0.15 + 0.1 * pulse})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(node.x, node.y, isCentral ? 5 : 3, 0, Math.PI * 2);
      ctx.fillStyle = white;
      ctx.globalAlpha = 0.9;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(node.x, node.y, isCentral ? 8 : 5, 0, Math.PI * 2);
      ctx.fillStyle = node.color;
      ctx.globalAlpha = 0.2 + 0.15 * pulse;
      ctx.fill();

      ctx.globalAlpha = 1;

      ctx.font = isCentral ? '9px "JetBrains Mono", monospace' : '7px "JetBrains Mono", monospace';
      ctx.fillStyle = node.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(node.label, node.x, node.y - node.r - 8);

      if (node.tag) {
        ctx.font = '5px "JetBrains Mono", monospace';
        ctx.fillStyle = `rgba(153, 235, 30, ${0.2 + 0.2 * pulse})`;
        ctx.fillText(node.tag, node.x, node.y - node.r - (isCentral ? 22 : 18));
      }

      const statusDot = Math.sin(time * 0.003 + i) > -0.5;
      if (statusDot) {
        ctx.beginPath();
        ctx.arc(node.x + (isCentral ? 70 : 50), node.y - node.r - (isCentral ? 8 : 5), 2, 0, Math.PI * 2);
        ctx.fillStyle = green;
        ctx.globalAlpha = 0.5 + 0.5 * pulse;
        ctx.fill();
      }

      ctx.restore();
    });
  }

  function drawScanLine(time) {
    const y = (time * 0.06) % H;
    const g = ctx.createLinearGradient(0, y - 20, 0, y + 20);
    g.addColorStop(0, 'rgba(153, 235, 30, 0)');
    g.addColorStop(0.5, 'rgba(153, 235, 30, 0.02)');
    g.addColorStop(1, 'rgba(153, 235, 30, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, y - 20, W, 40);
  }

  function drawStatusBar(time) {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(0, H - 24, W, 24);

    ctx.font = '6px "JetBrains Mono", monospace';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = 'rgba(153, 235, 30, 0.12)';
    ctx.textAlign = 'left';
    ctx.fillText('BANGLADESH SUBNET · v2.1', 10, H - 12);

    ctx.textAlign = 'center';
    const blink = Math.sin(time * 0.003) > 0.2;
    ctx.fillStyle = blink ? 'rgba(153, 235, 30, 0.15)' : 'rgba(153, 235, 30, 0.05)';
    ctx.fillText('● SYSTEM ONLINE', 300, H - 12);

    ctx.fillStyle = 'rgba(153, 235, 30, 0.08)';
    ctx.textAlign = 'right';
    ctx.fillText(`${Math.floor(time / 1000)}s UPTIME`, W - 10, H - 12);

    ctx.restore();
  }

  function drawCornerBrackets() {
    ctx.save();
    ctx.strokeStyle = 'rgba(153, 235, 30, 0.06)';
    ctx.lineWidth = 1;
    const s = 20, gap = 10;

    ctx.beginPath();
    ctx.moveTo(gap, gap + s); ctx.lineTo(gap, gap); ctx.lineTo(gap + s, gap);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(W - gap - s, gap); ctx.lineTo(W - gap, gap); ctx.lineTo(W - gap, gap + s);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(gap, H - gap - s); ctx.lineTo(gap, H - gap); ctx.lineTo(gap + s, H - gap);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(W - gap - s, H - gap); ctx.lineTo(W - gap, H - gap); ctx.lineTo(W - gap, H - gap - s);
    ctx.stroke();
    ctx.restore();
  }

  let animId;

  function draw(time) {
    ctx.clearRect(0, 0, W, H);

    ctx.fillStyle = '#030b1a';
    ctx.fillRect(0, 0, W, H);

    drawMap();
    drawBackground();
    drawGrid();
    drawScanLine(time);
    drawLinks(time);
    drawParticles(time);
    drawNodes(time);
    drawCornerBrackets();
    drawStatusBar(time);

    animId = requestAnimationFrame(draw);
  }

  const section = document.getElementById('bangladesh');
  let isVisible = false;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !isVisible) {
        isVisible = true;
        animId = requestAnimationFrame(draw);
      } else if (!entry.isIntersecting && isVisible) {
        isVisible = false;
        if (animId) cancelAnimationFrame(animId);
      }
    });
  }, { threshold: 0.1 });
  observer.observe(section);
}

function initAnimations() {

  gsap.set('.hero-subtitle', { y: '100%' });
  gsap.set('.hero-stats', { opacity: 0, scale: 0.95 });
  gsap.set(['.outro-title', '.outro-body', '.outro-cta-row'], { y: 40 });
  gsap.set('.truth-eyebrow', { y: 20 });
  gsap.set('.bd-eyebrow', { opacity: 0, y: 20 });
  gsap.set('.bd-reveal', { opacity: 0, y: 80 });
  gsap.set('.bd-sub', { opacity: 0, y: 20 });
  gsap.set('.bd-card', { opacity: 0, x: -30 });
  gsap.set('.bd-stat-item', { opacity: 0, y: 20 });

  const heroTl = gsap.timeline({ paused: true });
  heroTl
    .to('.hero-eyebrow', { opacity: 1, duration: 0.8, ease: 'power2.out' })
    .fromTo('.hero-title .line', { y: '110%', skewY: 5 }, { y: '0%', skewY: 0, duration: 1, stagger: 0.08, ease: 'expo.out' }, '-=0.5')
    .to('.hero-subtitle', { y: '0%', duration: 0.8, ease: 'expo.out' }, '-=0.6')
    .to('.hero-stats', { opacity: 1, scale: 1, duration: 0.8, ease: 'expo.out' }, '-=0.4')
    .to('.stat-item', { opacity: 1, duration: 0.5, stagger: 0.12, ease: 'power2.out' }, '-=0.6')
    .to('.scroll-cue', { opacity: 1, duration: 0.5 }, '-=0.2');

  document.querySelectorAll('.stat-num').forEach(el => {
    ScrollTrigger.create({ trigger: el, start: 'top 80%', once: true, onEnter: () => animateCounter(el, parseInt(el.dataset.val, 10)) });
  });


  const gauge = document.querySelector('.depth-gauge');
  const depthVal = document.getElementById('depth-value');
  const depthBar = document.getElementById('depth-bar');
  ScrollTrigger.create({
    trigger: '#descent', start: 'top+=15% center', end: 'bottom-=15% center',
    onToggle: self => gauge.classList.toggle('visible', self.isActive),
    onUpdate: self => {
      const isMob = window.innerWidth <= 768;
      depthVal.innerHTML = `${Math.floor(self.progress * 11000).toLocaleString()}<span>M</span>`;
      if (isMob) {
        depthBar.style.transform = `scaleX(${self.progress})`;
      } else {
        depthBar.style.transform = `scaleY(${self.progress})`;
      }
    }
  });


  const pContainer = document.getElementById('particles-container');
  if (pContainer) {
    for (let i = 0; i < 200; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      const size = Math.random() * 4 + 1;
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      p.style.left = Math.random() * 100 + '%';
      p.style.top = Math.random() * 100 + '%';
      pContainer.appendChild(p);
      gsap.to(p, {
        y: -window.innerHeight * (1.5 + Math.random() * 2),
        ease: 'none',
        scrollTrigger: { trigger: '#descent', start: 'top bottom', end: 'bottom top', scrub: true }
      });
    }
  }


  const fibers = document.querySelectorAll('#cable-casing, .fiber-line, .fiber-glow');
  fibers.forEach(path => {
    const len = path.getTotalLength() || 6500;
    gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
    ScrollTrigger.create({
      trigger: '#descent', start: 'top center', end: 'bottom center', scrub: true,
      onUpdate: self => path.style.strokeDashoffset = len * (1 - self.progress)
    });
  });


  const pulseFiber = document.querySelector('.pulse-fiber');
  if (pulseFiber) {
    gsap.to(pulseFiber, { strokeDashoffset: -2000, duration: 40, ease: 'none', repeat: -1 });
  }


  document.querySelectorAll('.creature').forEach((wrapper, i) => {
    const canvas = wrapper.querySelector('.creature-canvas');
    const speed = parseFloat(wrapper.dataset.speed) || 0.3;
    ScrollTrigger.create({
      trigger: wrapper, start: 'top bottom', once: true,
      onEnter: () => {
        gsap.to(wrapper, { opacity: 0.9, duration: 1.5, delay: i * 0.1, ease: 'power2.out' });
        if(canvas) gsap.to(canvas, { y: 20 + i * 4, duration: 3 + Math.random(), ease: 'sine.inOut', yoyo: true, repeat: -1 });
      }
    });
    ScrollTrigger.create({
      trigger: '#descent', start: 'top bottom', end: 'bottom top', scrub: true,
      onUpdate: self => gsap.set(wrapper, { y: (self.progress - 0.5) * 600 * speed })
    });
  });


  const hotspots = document.querySelectorAll('.hotspot');
  hotspots.forEach((hs, i) => {
    const line = hs.querySelector('.hotspot-line');
    const card = hs.querySelector('.inline-card');
    const content = card.querySelectorAll(':scope > *');
    const pulse = hs.querySelector('.hotspot-pulse');
    const isLeft = hs.classList.contains('left-aligned');
    const isMobile = window.innerWidth <= 768;
    const clipStart = 'polygon(0% 10%, 0% 10%, 0% 10%, 0% 10%, 0% 10%, 0% 10%)';
    const clipEnd = 'polygon(0% 2%, 2% 0%, 100% 0%, 100% 98%, 98% 100%, 0% 100%)';
    const lineWidth = isMobile ? 25 : 80;
    
    gsap.set(hs, { opacity: 1 });
    gsap.set(pulse, { scale: 0, opacity: 0 });
    gsap.set(line, { width: 0 });
    gsap.set(card, { autoAlpha: 0, clipPath: clipStart });
    gsap.set(content, { autoAlpha: 0, y: 15 });

    const tl = gsap.timeline({ paused: true });

    tl.to(pulse, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(2)' })
      .to(line, { width: lineWidth, duration: 0.4, ease: 'expo.inOut' }, '-=0.1')
      .to(card, { autoAlpha: 1, duration: 0.05 }, '-=0.1')
      .to(card, { clipPath: clipEnd, duration: 0.5, ease: 'power4.out' }, '<')
      .to(content, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' }, '-=0.3');

    ScrollTrigger.create({
      trigger: pulse,
      start: 'center center',
      end: 'bottom 10%',
      fastScrollEnd: true,
      preventOverlaps: true,
      onEnter: () => tl.play(),
      onLeaveBack: () => tl.reverse(),
      onLeave: () => { if (!isMobile) gsap.to(hs, { autoAlpha: 0, y: -20, duration: 0.4 }); },
      onEnterBack: () => { if (!isMobile) gsap.to(hs, { autoAlpha: 1, y: 0, duration: 0.4, onComplete: () => tl.play() }); }
    });
  });


  ScrollTrigger.create({
    trigger: '#truth', start: 'top 65%', once: true,
    onEnter: () => {
      gsap.to('.truth-eyebrow', { opacity: 1, y: 0, duration: 0.6 });
      gsap.to('.reveal-word', { opacity: 1, y: 0, duration: 0.8, stagger: 0.08, ease: 'expo.out', delay: 0.2 });
      gsap.to('.truth-row', { opacity: 1, y: 0, duration: 0.9, stagger: 0.2, ease: 'power3.out', delay: 0.7 });
    }
  });


  ScrollTrigger.create({
    trigger: '#bangladesh', start: 'top 65%', once: true,
    onEnter: () => {
      gsap.to('.bd-eyebrow', { opacity: 1, y: 0, duration: 0.6 });
      gsap.to('.bd-reveal', { opacity: 1, y: 0, duration: 0.8, stagger: 0.08, ease: 'expo.out', delay: 0.2 });
      gsap.to('.bd-sub', { opacity: 1, y: 0, duration: 0.6, delay: 0.5 });
      gsap.to('.bd-card', { opacity: 1, x: 0, duration: 0.7, stagger: 0.15, ease: 'power3.out', delay: 0.7 });
      gsap.to('.bd-stat-item', { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, delay: 1.2 });
    }
  });

  document.querySelectorAll('.bd-stat-num').forEach(el => {
    ScrollTrigger.create({
      trigger: el, start: 'top 80%', once: true,
      onEnter: () => {
        const target = parseInt(el.dataset.val, 10);
        if (target === 2006) {
          el.textContent = target;
          return;
        }
        animateCounter(el, target);
      }
    });
  });

  ScrollTrigger.create({
    trigger: '#globe-section', start: 'top 70%', once: true,
    onEnter: () => {
      gsap.to('.globe-eyebrow', { opacity: 1, duration: 0.5 });
      gsap.to('.globe-title', { opacity: 1, duration: 0.6, delay: 0.2 });
      gsap.to('.globe-sub', { opacity: 1, duration: 0.6, delay: 0.4 });
      gsap.to('.globe-legend', { opacity: 1, duration: 0.6, delay: 0.8 });
    }
  });


  ScrollTrigger.create({
    trigger: '#outro', start: 'top 70%', once: true,
    onEnter: () => {
      gsap.timeline()
        .to('.outro-title', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' })
        .to('.outro-body', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.5')
        .to('.outro-cta-row', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.5')
        .to('.outro-credit', { opacity: 1, duration: 0.6 }, '-=0.3');
    }
  });

  return heroTl;
}


async function main() {
  initCursor();
  initStars();
  initCreatures();
  initBangladeshCanvas();
  const lenis = initLenis();
  initGlobe(lenis);
  ScrollTrigger.refresh();
  const introTl = initAnimations();
  await initLoader(() => {
    if (introTl) introTl.play();
    ScrollTrigger.refresh();
  });
}

main();
