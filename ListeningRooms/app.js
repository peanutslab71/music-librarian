/* THE LISTENING ROOMS v3 — seven period sets, free navigation, people, richer dressing. */
(function () {
  'use strict';

  // ================= DATA =================
  const albums = LIBRARY.filter(a => a.year)
    .sort((a, b) => a.year - b.year || a.artist.localeCompare(b.artist));

  const ROOMS = [
    {
      key: 'club', name: 'The Club', span: '1927 – 1949', y1: 1949, W: 13, H: 5.2,
      copy: 'Hot jazz and swing, when this music was played in rooms like this one — smoke, small tables, a band on the stand. Records were 78rpm shellac, three minutes a side, and the radio made dance bands into national stars.',
      events: ['1929 · Wall Street crashes; the Depression begins', '1935 · Goodman at the Palomar — the Swing Era ignites', '1938 · Jazz reaches Carnegie Hall', '1941-45 · The bands go to war; Glenn Miller is lost over the Channel']
    },
    {
      key: 'jukebox', name: 'The Jukebox', span: '1950 – 1969', y1: 1969, W: 12, H: 4.6,
      copy: 'The 45rpm single, the teenager, and the three-minute miracle. Elvis walks into Sun Studio; Detroit builds hit records on an assembly line; soul comes north from Memphis and Muscle Shoals. Put a coin in.',
      events: ['1954 · Elvis records at Sun Studio, Memphis', '1959 · Motown founded in a Detroit house', '1963 · JFK shot; Beatlemania begins', '1969 · Moon landing, Woodstock']
    },
    {
      key: 'shop', name: 'The Record Shop', span: 'The 1970s', y1: 1979, W: 14, H: 4.8,
      copy: 'The album decade. Gatefold sleeves, side one / side two, Saturday afternoons spent digging through the bins. Metal is forged in Birmingham, reggae goes worldwide from Kingston — and then punk arrives to burn the shop down.',
      events: ['1970 · Sabbath invent heavy metal in six days', '1973 · Oil crisis; the vinyl gets thinner', '1976-77 · Punk explodes in London and Manchester', '1979 · Thatcher elected; the Walkman goes on sale']
    },
    {
      key: 'neon', name: 'Neon', span: 'The 1980s', y1: 1989, W: 14, H: 5.0,
      copy: 'MTV launches in 1981 and the song becomes something you watch. Synths from Essex, New Romantics from Birmingham nightclubs, rap crossing over from New York. The compact disc arrives, promising perfect sound forever.',
      events: ['1981 · MTV: video kills the radio star', '1982 · The compact disc goes on sale', '1985 · Live Aid — 1.9 billion watching', '1989 · The Berlin Wall falls']
    },
    {
      key: 'bedroom', name: 'The Bedroom', span: 'The 1990s', y1: 1999, W: 11, H: 3.6,
      copy: 'Where the records actually got listened to: a teenager’s room, CD towers, posters, the NME on the floor. Britpop makes England swing again, big beat and French house fill the clubs, and in 1999 a program called Napster quietly ends this world.',
      events: ['1991 · The Soviet Union dissolves', '1994 · Parklife; Britpop vs grunge', '1997 · Cool Britannia; Homework arrives from Paris', '1999 · Napster — the last year of the old music business']
    },
    {
      key: 'white', name: 'The White Room', span: 'The 2000s', y1: 2009, W: 12, H: 4.6,
      copy: 'A thousand songs in your pocket. Music dematerialises into the white minimalism of the iPod advert — silhouettes dancing, wires glowing. The record shop starts to vanish; the album unbundles into 99-cent tracks.',
      events: ['2001 · 9/11; the iPod launches the same autumn', '2003 · The iTunes Store opens', '2006 · Back to Black era — British soul revival', '2008 · Financial crisis; streaming waits in the wings']
    },
    {
      key: 'cloud', name: 'The Cloud', span: '2010 –', y1: 9999, W: 14, H: 6,
      copy: 'Everything, everywhere, all at once. Music becomes weather — always on, never owned. And in the corner, on a turntable, the vinyl revival: the physical object made precious again. Which is rather the point of these rooms.',
      events: ['2011 · Spotify reaches America', '2013 · Sabbath return to No.1, 43 years after Paranoid', '2014 · Vinyl begins its unlikely comeback', 'Today · The whole corridor fits in your hand']
    }
  ];
  let lo = 0;
  ROOMS.forEach(r => { r.albums = albums.filter(a => a.year > lo && a.year <= r.y1); lo = r.y1; });

  // ================= RENDERER =================
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById('app').appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x030303);
  scene.fog = new THREE.Fog(0x030303, 14, 58);
  // warm club light for lit materials (GLTF characters); the baked-lit room ignores it
  scene.add(new THREE.HemisphereLight(0xffeedd, 0x40352a, 1.9));
  const keyLight = new THREE.DirectionalLight(0xffe2b8, 0.85);
  keyLight.position.set(3, 8, 4);
  scene.add(keyLight);
  const camera = new THREE.PerspectiveCamera(64, window.innerWidth / window.innerHeight, 0.1, 300);
  const texLoader = new THREE.TextureLoader();
  const MAXANISO = renderer.capabilities.getMaxAnisotropy();

  // ================= TEXT / TEXTURE HELPERS =================
  function cTex(w, h, draw, repX, repY) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    draw(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c);
    t.anisotropy = MAXANISO;
    if (repX) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repX, repY || repX); }
    return t;
  }
  // draw text shrunk to fit maxW — no more cut-off signage
  function fitText(ctx, text, x, y, maxW, size, style) {
    let s = size;
    do { ctx.font = (style || 'bold') + ' ' + s + 'px Georgia'; s -= 2; }
    while (ctx.measureText(text).width > maxW && s > 9);
    ctx.fillText(text, x, y);
  }
  function wrapText(ctx, text, x, y, maxW, lh) {
    let line = '';
    for (const w of String(text).split(' ')) {
      const t = line ? line + ' ' + w : w;
      if (ctx.measureText(t).width > maxW && line) { ctx.fillText(line, x, y); y += lh; line = w; }
      else line = t;
    }
    if (line) ctx.fillText(line, x, y);
    return y + lh;
  }
  const rand = (a, b) => a + Math.random() * (b - a);

  // vertical ambient-occlusion band multiplied over wall textures
  function aoWall(draw, repX, repY) {
    return cTex(256, 256, (ctx, w, h) => {
      draw(ctx, w, h);
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, 'rgba(0,0,0,0.42)'); g.addColorStop(0.25, 'rgba(0,0,0,0)');
      g.addColorStop(0.72, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.5)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    }, repX, repY);
  }
  function woodTex(base, dark, sheen) {
    return cTex(512, 512, (ctx) => {
      ctx.fillStyle = base; ctx.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 8; i++) {
        ctx.fillStyle = i % 2 ? base : dark;
        ctx.globalAlpha = 0.55; ctx.fillRect(i * 64, 0, 64, 512); ctx.globalAlpha = 1;
        ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(i * 64, 0); ctx.lineTo(i * 64, 512); ctx.stroke();
        for (let g = 0; g < 7; g++) {
          ctx.strokeStyle = 'rgba(0,0,0,0.10)'; ctx.lineWidth = rand(1, 2.5);
          ctx.beginPath();
          const x = i * 64 + rand(6, 58); ctx.moveTo(x, 0);
          ctx.bezierCurveTo(x + rand(-7, 7), 170, x + rand(-7, 7), 340, x + rand(-4, 4), 512); ctx.stroke();
        }
        for (let k = 0; k < 3; k++) { // plank joints
          ctx.strokeStyle = 'rgba(0,0,0,0.3)';
          const y = rand(0, 512); ctx.beginPath(); ctx.moveTo(i * 64, y); ctx.lineTo(i * 64 + 64, y); ctx.stroke();
        }
      }
      if (sheen) {
        const g = ctx.createLinearGradient(0, 0, 512, 512);
        g.addColorStop(0, 'rgba(255,240,200,0.10)'); g.addColorStop(0.5, 'rgba(255,240,200,0)');
        g.addColorStop(1, 'rgba(255,240,200,0.07)');
        ctx.fillStyle = g; ctx.fillRect(0, 0, 512, 512);
      }
    }, 3, 3);
  }
  function checkerTex(c1, c2) {
    return cTex(256, 256, (ctx) => {
      ctx.fillStyle = c1; ctx.fillRect(0, 0, 256, 256);
      ctx.fillStyle = c2;
      ctx.fillRect(0, 0, 128, 128); ctx.fillRect(128, 128, 128, 128);
      // worn sheen
      const g = ctx.createRadialGradient(128, 128, 20, 128, 128, 190);
      g.addColorStop(0, 'rgba(255,255,255,0.07)'); g.addColorStop(1, 'rgba(0,0,0,0.1)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 256);
    }, 7, 12);
  }
  function carpetTex(base, fleck) {
    return cTex(256, 256, (ctx) => {
      ctx.fillStyle = base; ctx.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 2600; i++) {
        ctx.fillStyle = i % 2 ? fleck : 'rgba(0,0,0,0.35)';
        ctx.globalAlpha = rand(0.06, 0.22);
        ctx.fillRect(rand(0, 256), rand(0, 256), 1.6, 1.6);
      }
      ctx.globalAlpha = 1;
    }, 5, 9);
  }
  function pegboardTex(base, hole) {
    return aoWall((ctx) => {
      ctx.fillStyle = base; ctx.fillRect(0, 0, 256, 256);
      ctx.fillStyle = 'rgba(255,255,255,0.03)';
      for (let i = 0; i < 30; i++) ctx.fillRect(rand(0, 256), rand(0, 256), 8, 8);
      ctx.fillStyle = hole;
      for (let x = 8; x < 256; x += 20) for (let y = 8; y < 256; y += 20) {
        ctx.beginPath(); ctx.arc(x, y, 2.6, 0, 7); ctx.fill();
      }
    }, 4, 1.6);
  }
  function curtainTex(c1, c2) {
    return cTex(256, 256, (ctx) => {
      for (let x = 0; x < 256; x += 16) {
        const g = ctx.createLinearGradient(x, 0, x + 16, 0);
        g.addColorStop(0, c2); g.addColorStop(0.5, c1); g.addColorStop(1, c2);
        ctx.fillStyle = g; ctx.fillRect(x, 0, 16, 256);
      }
      const g2 = ctx.createLinearGradient(0, 0, 0, 256);
      g2.addColorStop(0, 'rgba(0,0,0,0.45)'); g2.addColorStop(0.3, 'rgba(0,0,0,0)');
      g2.addColorStop(1, 'rgba(0,0,0,0.4)');
      ctx.fillStyle = g2; ctx.fillRect(0, 0, 256, 256);
    }, 3, 1);
  }
  function glowSpot(color) {
    return cTex(128, 128, (ctx) => {
      const g = ctx.createRadialGradient(64, 64, 2, 64, 64, 62);
      g.addColorStop(0, color); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, 128, 128);
    });
  }
  function neonTextTex(text, color) {
    const w = 1024, h = 240;
    return cTex(w, h, (ctx) => {
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.shadowColor = color; ctx.fillStyle = color;
      let s = 130;
      do { ctx.font = 'bold ' + s + 'px Georgia'; s -= 4; } while (ctx.measureText(text).width > w - 120 && s > 20);
      for (const b of [60, 34, 14]) { ctx.shadowBlur = b; ctx.fillText(text, w / 2, h / 2); }
      ctx.shadowBlur = 0; ctx.fillStyle = '#fff'; ctx.globalAlpha = 0.92;
      ctx.fillText(text, w / 2, h / 2);
    });
  }

  // ================= MESH HELPERS =================
  const matC = (c) => new THREE.MeshBasicMaterial({ color: c });
  const matT = (t) => new THREE.MeshBasicMaterial({ map: t });
  function B(w, h, d, m) { return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m && m.isMaterial ? m : matC(m)); }
  function P(w, h, m, dbl) {
    const mm = m && m.isMaterial ? m : (m && m.isTexture ? matT(m) : matC(m));
    if (dbl) mm.side = THREE.DoubleSide;
    return new THREE.Mesh(new THREE.PlaneGeometry(w, h), mm);
  }
  function Cyl(r1, r2, h, m, seg) { return new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, seg ? Math.max(seg, 10) : 24), m && m.isMaterial ? m : matC(m)); }
  function Sph(r, m, seg) { const s = seg ? Math.max(seg, 10) : 24; return new THREE.Mesh(new THREE.SphereGeometry(r, s, Math.max(8, Math.round(s * 0.75))), m && m.isMaterial ? m : matC(m)); }
  function spr(tex, s, sy) {
    const s0 = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
    s0.scale.set(s, sy || s, 1); return s0;
  }
  function floorPool(x, z, r, color) {
    const p = P(r * 2, r * 2, new THREE.MeshBasicMaterial({ map: glowSpot(color), transparent: true, depthWrite: false }));
    p.rotation.x = -Math.PI / 2; p.position.set(x, 0.02, z);
    scene.add(p); return p;
  }
  function contactShadow(x, z, r) { // dark pool under props — grounds everything
    const p = P(r * 2, r * 2, new THREE.MeshBasicMaterial({ map: glowSpot('rgba(0,0,0,0.5)'), transparent: true, depthWrite: false }));
    p.rotation.x = -Math.PI / 2; p.position.set(x, 0.015, z);
    scene.add(p); return p;
  }
  // cylinder connecting two points (for straps, cords, braces)
  function link(ax, ay, az, bx, by, bz, r, c) {
    const v = new THREE.Vector3(bx - ax, by - ay, bz - az);
    const m = Cyl(r, r, v.length(), c, 6);
    m.position.set((ax + bx) / 2, (ay + by) / 2, (az + bz) / 2);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), v.normalize());
    return m;
  }
  function lightCone(x, yTop, z, r, color) {
    const geo = new THREE.CylinderGeometry(0.12, r, yTop - 0.1, 12, 1, true);
    const m = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.055, side: THREE.DoubleSide, depthWrite: false });
    const cone = new THREE.Mesh(geo, m);
    cone.position.set(x, (yTop) / 2 + 0.05, z);
    scene.add(cone); return cone;
  }

  // ================= PEOPLE (articulated) =================
  const peopleAnims = [];
  function shade(c, f) { const col = new THREE.Color(c); col.multiplyScalar(f); return col; }
  function person(cfg) {
    // articulated figure, origin at feet, ~1.73 tall. Joints: hips, knees, shoulders, elbows, spine, head.
    const g = new THREE.Group();
    const sil = !!cfg.silhouette;
    const sex = cfg.sex || (cfg.skirt ? 'f' : 'm');
    // every body is different: height, build (width), limb thickness — and no two outfits share a colour
    const bh = cfg.tall ? 1.07 : rand(sex === 'f' ? 0.9 : 0.94, sex === 'f' ? 1.03 : 1.1);
    const bw = rand(0.86, sex === 'm' ? 1.28 : 1.12);
    const th = 0.78 + bw * 0.26;
    const belly = sex === 'm' && bw > 1.14;
    const jit = (c) => { const col = new THREE.Color(c); col.offsetHSL(rand(-0.015, 0.015), rand(-0.05, 0.05), rand(-0.045, 0.045)); return col; };
    const skin = sil ? 0x0a0a0a : (cfg.skin || 0xd8a880);
    const topC = sil ? 0x0a0a0a : jit(cfg.top);
    const botC = sil ? 0x0a0a0a : jit(cfg.bottom || cfg.top);
    const skirtC = cfg.skirt && !sil ? jit(cfg.skirt) : null;
    const parts = { legs: [], arms: [] };
    // hips
    const hips = B(0.25 * bw, 0.13, 0.15 * bw, skirtC ? skirtC : shade(botC, 0.9));
    hips.position.y = 0.92; g.add(hips);
    // legs (hip pivot → thigh → knee pivot → shin + shoe)
    for (const s of [-1, 1]) {
      const hip = new THREE.Group(); hip.position.set(s * 0.082, 0.92, 0);
      const thighC = cfg.legC ? cfg.legC : (skirtC ? shade(skirtC, 0.9) : shade(botC, 0.97));
      const thigh = Cyl(0.056 * th, 0.066 * th, 0.42, thighC);
      thigh.position.y = -0.21; hip.add(thigh);
      const knee = new THREE.Group(); knee.position.y = -0.42;
      const shinC = cfg.legC ? shade(cfg.legC, 0.9) : (cfg.skirt ? skin : shade(botC, 0.8));
      const kneeJ = Sph(0.05 * th, shinC, 12); knee.add(kneeJ);
      const shin = Cyl(0.044 * th, 0.054 * th, 0.42, shinC);
      shin.position.y = -0.21; knee.add(shin);
      // shaped shoe: heel block + toe cap
      const shoeC = sil ? 0x0a0a0a : (cfg.shoeC || 0x18120e);
      const heel = B(0.082, 0.05, 0.1, shoeC); heel.position.set(0, -0.415, -0.01); knee.add(heel);
      const toe = B(0.078, 0.042, 0.12, shoeC); toe.position.set(0, -0.419, 0.09); knee.add(toe);
      if (cfg.heels) { const spike = Cyl(0.012, 0.02, 0.05, shoeC, 8); spike.position.set(0, -0.445, -0.04); knee.add(spike); }
      if (sex === 'm' && !sil && Math.random() < 0.25) { // spats
        const spat = B(0.088, 0.032, 0.104, 0xe8e4d8); spat.position.set(0, -0.398, -0.005); knee.add(spat);
      }
      hip.add(knee); g.add(hip);
      parts.legs.push({ hip, knee });
    }
    let skirtMesh = null;
    if (cfg.skirt && !sil) {
      const sw = 0.88 + bw * 0.14;
      const sd = cfg.shortSkirt ? [0.15 * sw, 0.26 * sw, 0.28, 0.85] : [0.155 * sw, 0.31 * sw, 0.52, 0.72];
      skirtMesh = new THREE.Mesh(new THREE.CylinderGeometry(sd[0], sd[1], sd[2], 14, 1, true), matC(skirtC));
      skirtMesh.material.side = THREE.DoubleSide;
      skirtMesh.position.y = sd[3]; g.add(skirtMesh);
      if (Math.random() < 0.6) { // contrast hem band
        const hem = new THREE.Mesh(new THREE.CylinderGeometry(sd[1] * 0.99, sd[1] * 1.01, 0.03, 14, 1, true), matC(shade(skirtC, 0.55)));
        hem.material.side = THREE.DoubleSide;
        hem.position.y = sd[3] - sd[2] / 2 + 0.015; g.add(hem);
      }
    }
    // spine (torso + arms + head) pivots at waist; torso is a lathe with a real silhouette
    const spine = new THREE.Group(); spine.position.y = 0.98; g.add(spine);
    const fem = sex === 'f';
    const prof = (fem
      ? [[0.148, 0.0], [0.126, 0.1], [0.117, 0.16], [0.138, 0.26], [0.15, 0.33], [0.139, 0.4], [0.128, 0.46], [0.09, 0.51], [0.045, 0.535]]
      : [[0.147, 0.0], [0.151, 0.08], [0.146, 0.18], [0.152, 0.3], [0.162, 0.4], [0.153, 0.47], [0.1, 0.52], [0.045, 0.545]]
    ).map(p2 => new THREE.Vector2(
      p2[0] * bw + (belly && p2[1] > 0.04 && p2[1] < 0.34 ? 0.024 * (1 - Math.abs(p2[1] - 0.17) / 0.17) : 0),
      p2[1]));
    const torso = new THREE.Mesh(new THREE.LatheGeometry(prof, 22), matC(topC));
    spine.add(torso);
    parts.torso = torso;
    if (cfg.tie && !sil) {
      // slim shirt-V and tie hugging the chest; knot at the collar
      const shirt = new THREE.Mesh(new THREE.CylinderGeometry(0.152 * bw, 0.168 * bw, 0.26, 12, 1, true, -0.3, 0.6), matC(0xe8e4d8));
      shirt.position.y = 0.35; spine.add(shirt);
      const tieC = cfg.tie === true ? jit(0x5a1018) : jit(cfg.tie);
      const tieM = new THREE.Mesh(new THREE.CylinderGeometry(0.154 * bw, 0.17 * bw, 0.3, 8, 1, true, -0.06, 0.12), matC(tieC));
      tieM.position.y = 0.28; spine.add(tieM);
      const knot = Sph(0.016, tieC, 8); knot.position.set(0, 0.46, 0.148 * bw); spine.add(knot);
      // tailoring: lapels, jacket buttons, sometimes a waistcoat or pocket square
      const lapC = shade(topC, 0.82);
      for (const s2 of [-1, 1]) {
        const lap = B(0.052, 0.17, 0.012, lapC);
        lap.position.set(s2 * 0.062 * bw, 0.365, 0.143 * bw);
        lap.rotation.z = s2 * 0.35; lap.rotation.y = s2 * -0.3;
        spine.add(lap);
      }
      for (const by of [0.16, 0.07]) {
        const btn = Sph(0.0085, 0x14100c, 8); btn.position.set(0.035 * bw, by, 0.152 * bw); spine.add(btn);
      }
      if (Math.random() < 0.4) {
        const vest = new THREE.Mesh(new THREE.CylinderGeometry(0.156 * bw, 0.172 * bw, 0.3, 12, 1, true, -0.55, 1.1), matC(shade(topC, 0.55)));
        vest.position.y = 0.18; spine.add(vest);
      }
      if (Math.random() < 0.45) {
        const pk = B(0.032, 0.02, 0.01, 0xf0ece0); pk.position.set(-0.085 * bw, 0.4, 0.138 * bw); spine.add(pk);
      }
    }
    if (!sil && sex === 'f') {
      // jewellery and sashes make each dress its own
      if (Math.random() < 0.55) {
        for (let k = -2; k <= 2; k++) {
          const pearl = Sph(0.0095, Math.random() < 0.5 ? 0xd4af37 : 0xf0ead8, 8);
          pearl.position.set(k * 0.021, 0.43 - Math.abs(k) * 0.011, 0.128 * bw);
          spine.add(pearl);
        }
      }
      if (Math.random() < 0.4) {
        const sash = Cyl(0.152 * bw, 0.158 * bw, 0.05, [0xc9a227, 0xd8d0c0, 0x14100c][Math.floor(rand(0, 3))]);
        sash.position.y = 0.03; spine.add(sash);
      }
      if (Math.random() < 0.35) {
        const brooch = Sph(0.013, 0xd4af37, 8); brooch.position.set(0.06 * bw, 0.36, 0.135 * bw); spine.add(brooch);
      }
    }
    if (!cfg.skirt && !sil) {
      const belt = Cyl(0.15 * bw, 0.15 * bw, 0.045, 0x14100a); belt.position.y = 0.015; spine.add(belt);
    }
    // arms (shoulder pivot → upper → elbow pivot → forearm + hand), joint spheres keep bends continuous
    const shW = 0.178 * (0.82 + bw * 0.2);
    for (const s of [-1, 1]) {
      const sh = new THREE.Group(); sh.position.set(s * shW, 0.47, 0);
      const deltoid = Sph(0.055 * th, topC, 14); deltoid.scale.set(1, 1.15, 1); sh.add(deltoid);
      const upperArm = Cyl(0.04 * th, 0.05 * th, 0.3, topC); upperArm.position.y = -0.15; sh.add(upperArm);
      const el = new THREE.Group(); el.position.y = -0.3;
      const foreC = cfg.gloves && !sil ? cfg.gloves : (cfg.sleeves === 'short' && !sil ? skin : shade(topC, 0.88));
      const elbowJ = Sph(0.041 * th, foreC, 12); el.add(elbowJ);
      const fore = Cyl(0.034 * th, 0.04 * th, 0.28, foreC);
      fore.position.y = -0.14; el.add(fore);
      // wrist joint → hand with palm, four articulated fingers and a thumb
      const handC = cfg.gloves && !sil ? cfg.gloves : shade(skin, 0.96);
      const wrist = new THREE.Group(); wrist.position.y = -0.29;
      const hand = new THREE.Group();
      const palm = Sph(0.048, handC, 16); palm.scale.set(0.75, 1.05, 0.42); hand.add(palm);
      const fingers = new THREE.Group();
      for (let f = 0; f < 4; f++) {
        const fin = Cyl(0.0075, 0.0088, 0.054, handC, 8);
        fin.position.set((f - 1.5) * 0.017, -0.027, 0);
        fin.rotation.z = (f - 1.5) * 0.06;
        fingers.add(fin);
      }
      fingers.position.set(0, -0.042, 0.004);
      fingers.rotation.x = -0.35;      // relaxed natural curl
      hand.add(fingers);
      const thumb = Cyl(0.008, 0.0095, 0.042, handC, 8);
      thumb.position.set(s * -0.038, -0.01, 0.012);
      thumb.rotation.z = s * -0.7; thumb.rotation.x = -0.3;
      hand.add(thumb);
      hand.position.y = -0.02;
      wrist.add(hand);
      el.add(wrist);
      sh.add(el); spine.add(sh);
      sh.rotation.z = s * 0.09; el.rotation.x = -0.16;
      parts.arms.push({ sh, el, wrist, hand, fingers });
    }
    // neck + head with nose/ears
    const neck = Cyl(0.044, 0.05, 0.09, skin); neck.position.y = 0.575; spine.add(neck);
    const headG = new THREE.Group(); headG.position.y = 0.73; spine.add(headG);
    const head = Sph(0.104, skin, 18); head.scale.set(1, 1.14, 1.02); headG.add(head);
    headG.scale.setScalar(rand(0.96, 1.05));
    if (!sil) {
      const nose = Sph(0.018, shade(skin, 0.96)); nose.position.set(0, -0.022, 0.102); headG.add(nose);
      for (const s of [-1, 1]) { const ear = Sph(0.022, skin); ear.position.set(s * 0.1, -0.005, 0); headG.add(ear); }
      if (sex === 'f' && Math.random() < 0.5) {
        for (const s of [-1, 1]) { const er = Sph(0.011, 0xd4af37, 8); er.position.set(s * 0.102, -0.035, 0.01); headG.add(er); }
      }
      // face: eyes (in blink groups), brows, mouth
      const eyeC = 0x241a12, browC = cfg.hair || 0x2a1c10;
      parts.eyes = [];
      for (const s of [-1, 1]) {
        const eyeG = new THREE.Group();
        const white = Sph(0.017, 0xf2ede4, 10); white.scale.set(1, 0.8, 0.55); eyeG.add(white);
        const eye = Sph(0.009, eyeC, 10); eye.position.z = 0.012; eyeG.add(eye);
        eyeG.position.set(s * 0.04, 0.012, 0.094);
        headG.add(eyeG);
        parts.eyes.push(eyeG);
        const brow = B(0.032, 0.007, 0.006, browC); brow.position.set(s * 0.041, 0.045, 0.099);
        brow.rotation.z = s * -0.15; headG.add(brow);
      }
      const mouth = B(0.034, 0.007, 0.005, shade(skin, 0.62)); mouth.position.set(0, -0.058, 0.094);
      headG.add(mouth);
      parts.mouth = mouth;
      if (cfg.lipstick) { mouth.material = matC(0x8a2030); mouth.scale.set(1.1, 1.6, 1); }
      if (cfg.moustache) {
        const mo = B(0.04, 0.012, 0.008, browC); mo.position.set(0, -0.04, 0.098); headG.add(mo);
      }
    }
    if (!sil && cfg.hairStyle !== 'none') {
      const hairC = cfg.hair || 0x2a1c10;
      if (cfg.hairStyle === 'big') {
        const h1 = Sph(0.145, hairC); h1.position.set(0, 0.045, -0.015); h1.scale.set(1.15, 1.05, 1.12); headG.add(h1);
      } else if (cfg.hairStyle === 'long') {
        const cap = Sph(0.109, hairC); cap.position.set(0, 0.028, -0.012); cap.scale.set(1.05, 0.98, 1.05); headG.add(cap);
        const nape = Sph(0.1, hairC); nape.position.set(0, -0.025, -0.045); nape.scale.set(0.95, 0.9, 0.8); headG.add(nape);
        const back = Cyl(0.085, 0.1, 0.34, hairC); back.position.set(0, -0.13, -0.062); headG.add(back);
      } else if (cfg.hairStyle === 'pony') {
        const cap = Sph(0.109, hairC); cap.position.set(0, 0.028, -0.012); cap.scale.set(1.05, 0.95, 1.05); headG.add(cap);
        const nape = Sph(0.098, hairC); nape.position.set(0, -0.02, -0.045); nape.scale.set(0.92, 0.85, 0.75); headG.add(nape);
        const tail = Cyl(0.038, 0.055, 0.26, hairC); tail.position.set(0, -0.055, -0.145); tail.rotation.x = 0.45; headG.add(tail);
      } else {
        // full cap: crown plus nape so nobody gets an accidental bald patch
        const cap = Sph(0.109, hairC); cap.position.set(0, 0.028, -0.012); cap.scale.set(1.05, 0.86, 1.06); headG.add(cap);
        const nape = Sph(0.099, hairC); nape.position.set(0, -0.02, -0.05); nape.scale.set(0.95, 0.82, 0.72); headG.add(nape);
      }
    }
    if (cfg.hat === 'fedora') {
      // seated low on the head, brim just above the brows
      const hc = cfg.hatC || 0x2c2118;
      const brim = Cyl(0.155, 0.163, 0.018, hc); brim.position.y = 0.052; headG.add(brim);
      const crown = Cyl(0.084, 0.108, 0.13, hc); crown.position.y = 0.115; headG.add(crown);
      const band = Cyl(0.109, 0.109, 0.032, shade(hc, 0.55)); band.position.y = 0.072; headG.add(band);
    } else if (cfg.hat === 'cloche') {
      const cl = Sph(0.117, cfg.hatC || 0x7a3a4a); cl.position.y = 0.018; cl.scale.set(1, 0.98, 1); headG.add(cl);
    } else if (cfg.hat === 'cap') {
      const hc = cfg.hatC || 0x203050;
      const cr = Sph(0.112, hc); cr.position.y = 0.022; cr.scale.set(1.02, 0.78, 1.02); headG.add(cr);
      const peak = B(0.13, 0.016, 0.12, hc); peak.position.set(0, 0.02, 0.128); headG.add(peak);
    }
    if (cfg.headphones) {
      const band = new THREE.Mesh(new THREE.TorusGeometry(0.115, 0.016, 8, 14, Math.PI), matC(0x222228));
      band.position.y = 0.02; headG.add(band);
      for (const s of [-1, 1]) { const cup = Sph(0.048, 0x222228); cup.position.set(s * 0.115, -0.005, 0); headG.add(cup); }
    }
    if (sil) {
      const wire = Cyl(0.007, 0.007, 0.45, 0xffffff); wire.position.set(0.05, 0.42, 0.1); wire.rotation.z = 0.14;
      spine.add(wire);
    }
    parts.spine = spine; parts.head = headG;
    // ----- poses -----
    if (cfg.seated) {
      for (const l of parts.legs) { l.hip.rotation.x = -1.45; l.knee.rotation.x = 1.5; }
      // elbows well bent, hands held above table height, slightly out from the body
      parts.arms.forEach((a, ai) => {
        a.sh.rotation.x = -0.35; a.sh.rotation.z = (ai === 0 ? 1 : -1) * 0.14; a.el.rotation.x = -1.0;
      });
      // drape the skirt over the lap instead of leaving the standing bell
      if (skirtMesh) {
        skirtMesh.scale.set(1, 0.62, 1);
        skirtMesh.rotation.x = -0.72;
        skirtMesh.position.set(0, 0.82, 0.12);
      }
      g.userData.sitOffset = -0.85;
    }
    if (cfg.floorSit) {
      parts.legs.forEach((l, i) => {
        l.hip.rotation.x = -1.4; l.hip.rotation.z = (i ? -1 : 1) * 0.75; l.knee.rotation.x = 2.2;
      });
      g.userData.sitOffset = -0.82;
    }
    if (cfg.digging) {
      spine.rotation.x = 0.62;
      for (const a of parts.arms) { a.sh.rotation.x = -0.55; a.el.rotation.x = -0.45; }
      headG.rotation.x = -0.2;
    }
    if (cfg.dancing) {
      parts.arms[0].sh.rotation.z = 2.1; parts.arms[0].el.rotation.x = -0.6;
      parts.arms[1].sh.rotation.z = -0.55; parts.arms[1].el.rotation.x = -1.15;
    }
    if (cfg.holdPhone) {
      const a = parts.arms[1]; a.sh.rotation.x = -0.5; a.el.rotation.x = -1.2;
      headG.rotation.x = 0.32;
    }
    if (cfg.lean) spine.rotation.z = cfg.lean;
    g.userData.parts = parts;
    g.userData.seatedFlag = !!(cfg.seated || cfg.floorSit);
    g.scale.setScalar(bh);
    return g;
  }
  // ---- exact per-frame arm tracking: hands follow prop-anchored targets, analytically ----
  const armSolvers = [];
  const _sA = new THREE.Vector3(), _sT = new THREE.Vector3(), _sD = new THREE.Vector3(),
    _sP = new THREE.Vector3(), _sE = new THREE.Vector3(), _sB = new THREE.Vector3();
  const _sQ = new THREE.Quaternion(), _sQ2 = new THREE.Quaternion(), _sQ3 = new THREE.Quaternion();
  const _DOWN = new THREE.Vector3(0, -1, 0);
  function registerArmSolver(p, ai, targetObj, pole) {
    p.userData.ikLock = p.userData.ikLock || [];
    p.userData.ikLock[ai] = true;
    armSolvers.push({ p, ai, targetObj, pole: pole.clone() });
  }
  function runArmSolvers() {
    for (const s of armSolvers) {
      const arm = s.p.userData.parts.arms[s.ai];
      arm.sh.getWorldPosition(_sA);
      s.targetObj.getWorldPosition(_sT);
      const scl = s.p.scale.x || 1;
      const L1 = 0.3 * scl, L2 = 0.29 * scl;
      _sD.subVectors(_sT, _sA);
      let d = _sD.length();
      if (d < 0.04) continue;
      const dMax = (L1 + L2) * 0.999;
      if (d > dMax) { _sD.multiplyScalar(dMax / d); _sT.copy(_sA).add(_sD); d = dMax; }
      _sD.normalize();
      s.p.getWorldQuaternion(_sQ3);
      _sP.copy(s.pole).applyQuaternion(_sQ3);
      _sP.addScaledVector(_sD, -_sP.dot(_sD));
      if (_sP.lengthSq() < 1e-6) _sP.set(0, -1, 0).addScaledVector(_sD, _sD.y);
      _sP.normalize();
      const a = (L1 * L1 - L2 * L2 + d * d) / (2 * d);
      const h = Math.sqrt(Math.max(1e-6, L1 * L1 - a * a));
      _sE.copy(_sA).addScaledVector(_sD, a).addScaledVector(_sP, h);
      // upper arm: parent-local −Y → shoulder→elbow
      _sB.subVectors(_sE, _sA).normalize();
      arm.sh.parent.getWorldQuaternion(_sQ);
      _sQ2.setFromUnitVectors(_DOWN, _sB);
      arm.sh.quaternion.copy(_sQ.invert().multiply(_sQ2));
      // forearm: parent(=shoulder)-local −Y → elbow→target
      _sB.subVectors(_sT, _sE).normalize();
      arm.sh.getWorldQuaternion(_sQ);
      _sQ2.setFromUnitVectors(_DOWN, _sB);
      arm.el.quaternion.copy(_sQ.invert().multiply(_sQ2));
    }
  }
  // small coordinate-descent IK: put a hand exactly on a spine-local target (instruments, trays)
  const _ikA = new THREE.Vector3(), _ikB = new THREE.Vector3();
  function aimHand(p, ai, tx, ty, tz) {
    const parts = p.userData.parts;
    const arm = parts.arms[ai];
    const marker = new THREE.Object3D();
    marker.position.set(tx, ty, tz);
    parts.spine.add(marker);
    const err = () => {
      p.updateMatrixWorld(true);
      arm.hand.getWorldPosition(_ikA); marker.getWorldPosition(_ikB);
      return _ikA.distanceTo(_ikB);
    };
    p.userData.ikLock = p.userData.ikLock || [];
    p.userData.ikLock[ai] = true;
    // joint limits keep the solution anatomical (left arm ai=0: outward is +z)
    const zLim = ai === 0 ? [-0.7, 1.5] : [-1.5, 0.7];
    const lims = { shx: [-1.65, 0.25], shz: zLim, elx: [-2.2, -0.05] };
    const dims = [[arm.sh.rotation, 'x', lims.shx], [arm.sh.rotation, 'z', lims.shz], [arm.el.rotation, 'x', lims.elx]];
    // start from a natural hold instead of whatever pose came before
    arm.sh.rotation.x = -0.7; arm.sh.rotation.z = ai === 0 ? 0.15 : -0.15; arm.el.rotation.x = -0.7;
    let step = 0.4;
    for (let it = 0; it < 56 && step > 0.02; it++) {
      let improved = false;
      for (const [rot, ax, lim] of dims) {
        const base = rot[ax], e0 = err();
        rot[ax] = Math.min(lim[1], base + step);
        const e1 = err();
        rot[ax] = Math.max(lim[0], base - step);
        const e2 = err();
        if (e1 < e0 && e1 <= e2) { rot[ax] = Math.min(lim[1], base + step); improved = true; }
        else if (e2 < e0) { rot[ax] = Math.max(lim[0], base - step); improved = true; }
        else rot[ax] = base;
      }
      if (!improved) step *= 0.55;
    }
    parts.spine.remove(marker);
  }
  function placePerson(cfg, x, z, rotY, anim) {
    const p = person(cfg);
    p.position.set(x, (p.userData.sitOffset || 0) + (cfg.y || 0), z);
    p.rotation.y = rotY || 0;
    scene.add(p);
    contactShadow(x, z, 0.4);
    peopleAnims.push({ g: p, type: anim || 'idle', ph: rand(0, 6), baseY: p.position.y, baseRy: rotY || 0, sp: rand(2.2, 3.0) });
    return p;
  }
  const walkers = [];
  // waypoint patrol: walks pts in ping-pong order, pauses at each stop, waits politely for the player
  function placeWalker(cfg, pts, speed) {
    const p = person(cfg);
    p.position.set(pts[0].x, 0, pts[0].z);
    scene.add(p);
    walkers.push({ g: p, pts, i: 0, dir: 1, speed: speed || 0.8, ph: rand(0, 6), state: 'walk', pauseT: rand(0, 2) });
    return p;
  }
  const chatters = [];
  function makeChatter(p, name, lines, voice) {
    chatters.push({ g: p, name, lines, voice: voice || { p: 1, r: 1 }, cd: 0, vi: chatters.length });
  }

  // ================= GLTF CHARACTERS (drop-in upgrade path) =================
  // Rigged .glb models replace the procedural figures wherever their clips cover the role.
  // Sources: embedded MODELS (from the library's Characters/ folder at build time) or files
  // dragged onto the window at runtime (Quaternius / KayKit / any glTF with named clips).
  const charSources = [];
  const charMixers = [];
  function mapClips(animations) {
    const find = (re) => animations.find(c => re.test(c.name)) || null;
    return {
      idle: find(/^idle|idle$|stand|breath/i),
      walk: find(/^walk$|walking/i) || find(/walk(?!_)/i) || find(/run/i),
      dance: find(/dance|swing|samba|charleston|groove/i) || find(/victory/i),
      talk: find(/talk|gesture|wave|yes/i),
      sit: find(/^sit|sitdown/i)
    };
  }
  function addCharacterSource(name, arrayBuffer) {
    try {
      new THREE.GLTFLoader().parse(arrayBuffer, '', (gltf) => {
        const clips = mapClips(gltf.animations || []);
        if (!clips.idle && !clips.walk && !clips.dance) return; // not a usable character
        charSources.push({ name, scene: gltf.scene, animations: gltf.animations, clips });
        swapFigures();
      }, (e) => console.warn('GLB parse failed:', name, e));
    } catch (e) { console.warn('GLB error', e); }
  }
  function b64ToBuf(dataURI) {
    const b64 = dataURI.split(',').pop();
    const bin = atob(b64);
    const buf = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
    return buf.buffer;
  }
  function spawnInstance(src, host, clip, speedScale) {
    const inst = THREE.SkeletonUtils.clone(src.scene);
    // relight for the club (Lambert pops where PBR reads muddy) + a per-person tint so the crowd varies
    const tintH = rand(-0.06, 0.06), tintL = rand(-0.08, 0.12);
    inst.traverse(o => {
      if (o.isMesh && o.material) {
        const m = o.material;
        const col = m.color ? m.color.clone() : new THREE.Color(0xffffff);
        col.offsetHSL(tintH, 0, tintL);
        const lam = new THREE.MeshLambertMaterial({
          color: col,
          map: m.map || null,
          vertexColors: !!m.vertexColors
        });
        lam.skinning = o.isSkinnedMesh === true;
        o.material = lam;
        o.frustumCulled = false;
      }
    });
    // normalise: feet on the floor, ~1.72m tall
    const box = new THREE.Box3().setFromObject(inst);
    const h = Math.max(0.01, box.max.y - box.min.y);
    const s = 1.72 / h;
    inst.scale.setScalar(s);
    inst.position.y = -box.min.y * s;
    // hide the procedural body, keep the group (navigation, look-at and patrols still steer it)
    for (const c of host.children) c.visible = false;
    host.add(inst);
    const mixer = new THREE.AnimationMixer(inst);
    const action = mixer.clipAction(clip);
    action.timeScale = (speedScale || 1) * rand(0.92, 1.08);
    if (/^sit|sitdown/i.test(clip.name)) {
      // transition clip: play once and stay seated
      action.setLoop(THREE.LoopOnce);
      action.clampWhenFinished = true;
      action.timeScale = 1.4;
    } else {
      action.time = rand(0, clip.duration);
    }
    action.play();
    charMixers.push(mixer);
    return inst;
  }
  function swapFigures() {
    if (!charSources.length) return;
    let n = 0, si = 0;
    const pick = () => charSources[(si++) % charSources.length];
    for (const pa of peopleAnims) {
      if (pa.gltfDone) continue;
      const seated = pa.g.userData.seatedFlag;
      const performer = ['sing', 'clarinet', 'piano', 'drum', 'shake', 'dig'].includes(pa.type);
      if (performer) continue;                       // instrument holders stay procedural
      const src = pick();
      let clip = null;
      if (pa.type === 'dance' || pa.type === 'waltz') clip = src.clips.dance || src.clips.idle;
      else if (seated) clip = src.clips.sit;         // only swap seated figures if a sit clip exists
      else clip = (pa.type === 'talk' && src.clips.talk) || src.clips.idle;
      if (!clip) continue;
      spawnInstance(src, pa.g, clip);
      pa.gltfDone = true; pa.type = 'gltf';          // procedural animator stands down
      n++;
    }
    for (const w of walkers) {
      if (w.gltfDone) continue;
      const src = pick();
      const clip = src.clips.walk || src.clips.idle;
      if (!clip) continue;
      spawnInstance(src, w.g, clip, w.speed / 0.85);
      w.gltfDone = true; w.gltf = true;              // keep pathing, drop the procedural gait
      n++;
    }
    console.log('GLTF characters in place:', n);
  }
  if (typeof MODELS !== 'undefined') {
    for (const k in MODELS) addCharacterSource(k, b64ToBuf(MODELS[k]));
  }
  window.addEventListener('dragover', (e) => e.preventDefault());
  window.addEventListener('drop', (e) => {
    e.preventDefault();
    for (const f of e.dataTransfer.files) {
      if (/\.glb$/i.test(f.name)) {
        const rd = new FileReader();
        rd.onload = () => addCharacterSource(f.name, rd.result);
        rd.readAsArrayBuffer(f);
      }
    }
  });

  // ================= SLEEVES =================
  const pickables = [];
  const audioPts = [];
  const hoverAnims = [];
  const colliders = []; // {x,z,r}

  function artTexture(album, fallbackCol) {
    const uri = ART[album.id];
    if (uri) { const t = texLoader.load(uri); t.anisotropy = MAXANISO; return t; }
    return cTex(512, 512, (ctx) => {
      ctx.fillStyle = '#181614'; ctx.fillRect(0, 0, 512, 512);
      ctx.strokeStyle = fallbackCol || '#c9a227'; ctx.lineWidth = 8; ctx.strokeRect(20, 20, 472, 472);
      ctx.textAlign = 'center'; ctx.fillStyle = fallbackCol || '#c9a227';
      ctx.font = 'bold 120px Georgia';
      ctx.fillText(album.artist.split(/\s+/).slice(0, 2).map(s => s[0]).join(''), 256, 230);
      ctx.fillStyle = '#cfc6b2'; ctx.font = '30px Georgia';
      wrapText(ctx, album.album, 256, 320, 440, 38);
    });
  }
  function playableSrc(album) {
    if (!album.paths) return null;
    for (const p of album.paths) if (/\.(mp3|m4a)$/i.test(p)) return encodeURI(p).replace(/#/g, '%23');
    return null;
  }
  function registerSleeve(group, album, lift) {
    group.userData.album = album;
    group.userData.baseY = group.position.y;
    group.userData.lift = lift || 0;
    pickables.push(group);
    hoverAnims.push(group);
    audioPts.push({ x: group.position.x, z: group.position.z, album, src: playableSrc(album) });
  }
  function sleeve(album, size, framed, frameCol, mat) {
    const g = new THREE.Group();
    if (framed) {
      const f = B(size + 0.18, size + 0.18, 0.07, frameCol || 0x2b241a);
      g.add(f);
      if (mat) { const m0 = P(size + 0.1, size + 0.1, 0xf2ede2); m0.position.z = 0.04; g.add(m0); }
    }
    const art = P(size, size, artTexture(album));
    art.position.z = framed ? 0.048 : 0.012;
    g.add(art);
    if (album.note) {
      const tag = P(0.14, 0.14, cTex(64, 64, (ctx) => {
        ctx.fillStyle = '#c9a227'; ctx.beginPath(); ctx.arc(32, 32, 30, 0, 7); ctx.fill();
        ctx.fillStyle = '#1a1508'; ctx.font = 'bold 40px Georgia'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('★', 32, 36);
      }));
      tag.position.set(size / 2 - 0.02, size / 2 - 0.02, framed ? 0.075 : 0.03);
      g.add(tag);
    }
    return g;
  }
  function plaque(album, w) {
    const t = cTex(512, 140, (ctx) => {
      ctx.fillStyle = '#14110d'; ctx.fillRect(0, 0, 512, 140);
      ctx.strokeStyle = '#4a4335'; ctx.lineWidth = 3; ctx.strokeRect(3, 3, 506, 134);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#e8e0d0'; fitText(ctx, album.artist, 256, 52, 480, 36);
      ctx.fillStyle = '#b0a488'; fitText(ctx, album.album + ' · ' + album.year, 256, 100, 480, 28, 'italic');
    });
    return P(w || 0.8, (w || 0.8) * 0.273, t);
  }

  // ================= ROOM SHELL =================
  const sections = [];
  const doorZs = [];
  let Z = 0;

  function doorWall(z, W, H, colFar, name) {
    const gW = 2.6, gH = 3.1;
    const m = matC(colFar); m.side = THREE.DoubleSide;
    const l = P((W - gW) / 2, H, m, true); l.position.set(-(gW / 2 + (W - gW) / 4), H / 2, z);
    const r = l.clone(); r.position.x = gW / 2 + (W - gW) / 4;
    const top = P(gW, H - gH, m, true); top.position.set(0, gH + (H - gH) / 2, z);
    scene.add(l, r, top);
    // door frame trim
    const trimM = matC(0x0d0b08); trimM.side = THREE.DoubleSide;
    for (const dx of [-gW / 2, gW / 2]) {
      const t = B(0.14, gH, 0.22, trimM); t.position.set(dx, gH / 2, z); scene.add(t);
    }
    const lintel = B(gW + 0.28, 0.14, 0.22, trimM); lintel.position.set(0, gH + 0.07, z); scene.add(lintel);
    if (name) {
      const t = cTex(768, 160, (ctx) => {
        ctx.textAlign = 'center';
        ctx.fillStyle = '#c9a227'; fitText(ctx, name.toUpperCase(), 384, 78, 690, 64);
        ctx.fillStyle = '#8a8272'; ctx.font = 'italic 40px Georgia'; ctx.fillText('↓', 384, 138);
      });
      const mm = new THREE.MeshBasicMaterial({ map: t, transparent: true });
      mm.side = THREE.DoubleSide;
      const s = P(2.9, 0.6, mm, true);
      s.position.set(0, gH + 0.42, z + 0.03);
      scene.add(s);
      const s2 = s.clone(); s2.position.z = z - 0.03; s2.rotation.y = Math.PI; scene.add(s2);
    }
    doorZs.push(z);
  }

  function shell(room, L, mats) {
    const { W, H } = room;
    const z0 = Z, z1 = Z - L, zm = (z0 + z1) / 2;
    const floor = P(W, L, mats.floor, true);
    floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, zm);
    const ceil = P(W, L, mats.ceil || matC(0x0a0908), true);
    ceil.rotation.x = Math.PI / 2; ceil.position.set(0, H, zm);
    const wl = P(L, H, mats.wall, true);
    wl.rotation.y = Math.PI / 2; wl.position.set(-W / 2, H / 2, zm);
    const wr = P(L, H, mats.wall2 || mats.wall.clone(), true);
    wr.rotation.y = -Math.PI / 2; wr.position.set(W / 2, H / 2, zm);
    scene.add(floor, ceil, wl, wr);
    // skirting boards
    if (!mats.noSkirt) {
      for (const s of [-1, 1]) {
        const sk = B(0.06, 0.18, L, mats.skirtC || 0x14100a);
        sk.position.set(s * (W / 2 - 0.03), 0.09, zm);
        scene.add(sk);
      }
    }
    return { z0, z1, zm };
  }

  function placardStand(room, x, z, rotY) {
    // wall-mounted info board just inside the left of each doorway — easy to walk up to and read
    const t = cTex(640, 860, (ctx) => {
      ctx.fillStyle = '#171410'; ctx.fillRect(0, 0, 640, 860);
      ctx.strokeStyle = '#c9a227'; ctx.lineWidth = 5; ctx.strokeRect(12, 12, 616, 836);
      ctx.textAlign = 'left';
      ctx.fillStyle = '#c9a227'; fitText(ctx, room.name, 36, 78, 560, 52);
      ctx.fillStyle = '#8a8272'; ctx.font = 'italic 32px Georgia';
      ctx.fillText(room.span + ' · ' + room.albums.length + ' albums', 36, 126);
      ctx.fillStyle = '#d8d2c4'; ctx.font = '27px Georgia';
      let y = wrapText(ctx, room.copy, 36, 180, 570, 36);
      ctx.fillStyle = '#c9a227'; ctx.font = 'bold 26px Georgia';
      ctx.fillText('MEANWHILE, OUT THERE', 36, y + 26); y += 66;
      ctx.fillStyle = '#c2bba9'; ctx.font = '25px Georgia';
      for (const ev of room.events) y = wrapText(ctx, '•  ' + ev, 36, y, 570, 33) + 6;
    });
    const g = new THREE.Group();
    const frame = B(1.62, 2.13, 0.05, 0x2a2015); frame.position.z = -0.032; g.add(frame);
    g.add(P(1.52, 2.04, t));
    g.position.set(-(room.W / 2 - 0.1), 1.95, z);
    g.rotation.y = Math.PI / 2;
    scene.add(g);
  }

  // ================= ROOM BUILDERS =================
  const animatedTex = [];
  const videoScreens = [];
  const arcadeScreens = [];
  const waltzers = [];
  let stageSinger = null, bowUntil = 0;
  const flickers = [];
  const bobbers = [];
  const dustFields = [];
  const ledStrips = [];

  function addDust(z0, z1, W, H, count, color) {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = rand(-W / 2 + 0.4, W / 2 - 0.4);
      pos[i * 3 + 1] = rand(0.3, H - 0.3);
      pos[i * 3 + 2] = rand(z1, z0);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const m = new THREE.PointsMaterial({ color, size: 0.02, transparent: true, opacity: 0.5, depthWrite: false });
    const pts = new THREE.Points(geo, m);
    scene.add(pts);
    dustFields.push(pts);
  }

  function buildClub(room) {
    const n = room.albums.length, perSide = Math.ceil(n / 2);
    const L = perSide * 3.0 + 14;
    doorWall(Z, room.W, room.H, 0x241b10, room.name);
    const S = shell(room, L, {
      floor: matT(woodTex('#38290f', '#2a1f0b', true)),
      wall: matT(aoWall((ctx) => {
        ctx.fillStyle = '#20180f'; ctx.fillRect(0, 0, 256, 256);
        ctx.fillStyle = '#261c12'; ctx.fillRect(0, 168, 256, 88);
        ctx.strokeStyle = '#c9a227'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(0, 168); ctx.lineTo(256, 168); ctx.stroke();
        ctx.strokeStyle = 'rgba(201,162,39,0.3)'; ctx.lineWidth = 2;
        for (let x = 32; x < 256; x += 64) { ctx.beginPath(); ctx.moveTo(x, 6); ctx.lineTo(x, 166); ctx.stroke(); }
        // art-deco fan motif
        ctx.strokeStyle = 'rgba(201,162,39,0.16)';
        for (let x = 32; x < 256; x += 64) for (let a = 0; a < 5; a++) {
          ctx.beginPath(); ctx.arc(x, 166, 20 + a * 9, Math.PI, Math.PI * 2); ctx.stroke();
        }
      }, 4, 1)),
      ceil: matT(cTex(128, 128, (ctx) => { // pressed tin
        ctx.fillStyle = '#171209'; ctx.fillRect(0, 0, 128, 128);
        ctx.strokeStyle = 'rgba(201,162,39,0.12)'; ctx.lineWidth = 2;
        ctx.strokeRect(8, 8, 112, 112); ctx.strokeRect(28, 28, 72, 72);
        ctx.beginPath(); ctx.arc(64, 64, 18, 0, 7); ctx.stroke();
      }, 6, 12)),
      skirtC: 0x0d0a06
    });
    placardStand(room, room.W / 2 - 1.6, S.z0 - 2.6, -0.5);
    // stage, offset left of the doorway
    const stageX = -room.W / 2 + 3.1;
    const stage = B(5.2, 0.5, 3.2, matT(woodTex('#4a3a22', '#3a2d18')));
    stage.position.set(stageX, 0.25, S.z1 + 2.1);
    const curtain = P(5.4, room.H - 0.7, curtainTex('#7a1520', '#3a0a10'));
    curtain.position.set(stageX, (room.H - 0.7) / 2 + 0.5, S.z1 + 0.55);
    scene.add(stage, curtain);
    colliders.push({ x: stageX, z: S.z1 + 2.1, r: 2.9 });
    // clarinettist on stage (this is the Goodman room, after all)
    const clarman = placePerson({ top: 0x1a1a22, bottom: 0x1a1a22, hat: 'fedora', skin: 0x9a6a48, tie: true, y: 0.5 },
      stageX - 0.7, S.z1 + 2.2, 0.35, 'clarinet');
    (function () {
      const cp = clarman.userData.parts;
      // clarinet hangs from the mouth, angled down-forward
      const clG = new THREE.Group();
      const body2 = Cyl(0.016, 0.019, 0.5, 0x14100c, 10); body2.position.y = -0.25; clG.add(body2);
      const bell2 = Cyl(0.045, 0.02, 0.07, 0x14100c, 10); bell2.position.y = -0.53; clG.add(bell2);
      for (let k = 0; k < 5; k++) { const key = Sph(0.007, 0xc8ccd2, 6); key.position.set(0.014, -0.12 - k * 0.07, 0.008); clG.add(key); }
      clG.position.set(0, -0.06, 0.1); clG.rotation.x = -0.9;
      cp.head.add(clG);
      // both hands up on the instrument
      for (const a of cp.arms) { a.sh.rotation.x = -0.62; a.el.rotation.x = -0.85; }
    })();
    // singer at the mic, one hand raised to it
    const singer = placePerson({ skirt: 0x6a1025, top: 0x6a1025, hairStyle: 'long', hair: 0x150d08, skin: 0x8a5a3a, lipstick: true, y: 0.5 },
      stageX + 0.6, S.z1 + 2.3, 0.1, 'sing');
    singer.userData.parts.arms[1].sh.rotation.x = -1.15;
    singer.userData.parts.arms[1].el.rotation.x = -0.4;
    const mp = Cyl(0.02, 0.03, 1.5, 0x777777); mp.position.set(stageX + 0.85, 1.25, S.z1 + 2.5);
    const mh = Sph(0.06, 0x333333); mh.position.set(stageX + 0.85, 2.0, S.z1 + 2.5);
    scene.add(mp, mh);
    // drummer with a small kit, back of the stage
    (function () {
      const kx = stageX - 1.9, kz = S.z1 + 1.15, sy = 0.5;
      // bass drum facing the room
      const bass = Cyl(0.28, 0.28, 0.3, 0x6a1520, 20); bass.rotation.x = Math.PI / 2;
      bass.position.set(kx, sy + 0.28, kz + 0.1);
      const bhead = Cyl(0.27, 0.27, 0.02, 0xe8e0cc, 20); bhead.rotation.x = Math.PI / 2;
      bhead.position.set(kx, sy + 0.28, kz + 0.26);
      const bdot = Cyl(0.09, 0.09, 0.022, 0x8a2030, 14); bdot.rotation.x = Math.PI / 2;
      bdot.position.set(kx, sy + 0.28, kz + 0.265);
      scene.add(bass, bhead, bdot);
      // snare
      const snare = Cyl(0.13, 0.13, 0.09, 0xd8d0c0, 16); snare.position.set(kx + 0.32, sy + 0.58, kz + 0.12); snare.rotation.z = 0.1;
      const spole = Cyl(0.012, 0.012, 0.55, 0x888888); spole.position.set(kx + 0.32, sy + 0.28, kz + 0.12);
      scene.add(snare, spole);
      // hi-hat
      const hpole = Cyl(0.01, 0.01, 0.85, 0x888888); hpole.position.set(kx - 0.38, sy + 0.42, kz + 0.15);
      const hh1 = Cyl(0.11, 0.11, 0.008, 0xc9a227, 16); hh1.position.set(kx - 0.38, sy + 0.85, kz + 0.15);
      const hh2 = hh1.clone(); hh2.position.y = sy + 0.82;
      scene.add(hpole, hh1, hh2);
      // ride cymbal
      const rpole = Cyl(0.01, 0.01, 1.0, 0x888888); rpole.position.set(kx + 0.5, sy + 0.5, kz - 0.15); rpole.rotation.z = -0.15;
      const ride = Cyl(0.16, 0.16, 0.008, 0xd4af37, 18); ride.position.set(kx + 0.57, sy + 1.0, kz - 0.15); ride.rotation.z = 0.2; ride.rotation.x = 0.1;
      scene.add(rpole, ride);
      // stool + drummer with sticks
      const dst = Cyl(0.2, 0.22, 0.1, 0x1a140c, 12); dst.position.set(kx, sy + 0.48, kz - 0.62);
      scene.add(dst);
      const drummer = placePerson({ seated: true, y: sy + 0.53, top: 0x3a3040, bottom: 0x2a2430, skin: 0xd8a880, hairStyle: 'cap', hair: 0x1a1208 },
        kx, kz - 0.62, 0, 'drum');
      for (const a of drummer.userData.parts.arms) {
        a.sh.rotation.x = -0.5; a.el.rotation.x = -0.55;
        const stick = Cyl(0.008, 0.008, 0.3, 0xc8a878, 6);
        stick.position.set(0, -0.3, 0.12); stick.rotation.x = -1.25;
        a.el.add(stick);
      }
    })();
    floorPool(stageX, S.z1 + 2.1, 2.8, 'rgba(255,190,90,0.32)');
    lightCone(stageX - 0.7, room.H, S.z1 + 2.2, 1.2, 0xffc060);
    lightCone(stageX + 0.6, room.H, S.z1 + 2.3, 1.2, 0xffc060);
    // gramophone right of door
    const horn = Cyl(0.5, 0.06, 0.9, 0x8a6a20, 20); horn.rotation.z = 2.0;
    horn.position.set(room.W / 2 - 2.0, 1.15, S.z1 + 1.6);
    const hbox = B(0.6, 0.35, 0.6, 0x2c2113); hbox.position.set(room.W / 2 - 2.15, 0.68, S.z1 + 1.6);
    scene.add(horn, hbox);
    contactShadow(room.W / 2 - 2.15, S.z1 + 1.6, 0.6);
    colliders.push({ x: room.W / 2 - 2.15, z: S.z1 + 1.6, r: 0.8 });
    // tables + seated patrons
    const patrons = [
      [{ top: 0x2c2118, bottom: 0x2c2118, hat: 'fedora', skin: 0xd8a880, moustache: true }, { skirt: 0x1a5a5a, top: 0x1a5a5a, hat: 'cloche', hatC: 0x144444, skin: 0xe0b090, lipstick: true }],
      [{ skirt: 0x5a2a5a, top: 0x5a2a5a, hairStyle: 'long', hair: 0x3a2510, skin: 0xc89878, lipstick: true }, { top: 0x3a3a45, bottom: 0x3a3a45, skin: 0x9a6a48 }],
      [{ top: 0x4a3520, bottom: 0x4a3520, hat: 'fedora', hatC: 0x3a2a18, skin: 0xd8a880 }, null],
      [{ skirt: 0x7a5a20, top: 0x7a5a20, hat: 'cloche', hatC: 0x5a4418, skin: 0xe0b090 }, { top: 0x22222c, bottom: 0x22222c, skin: 0xc89878 }]
    ];
    for (let i = 0; i < 4; i++) {
      const tz = S.z0 - 6.5 - i * ((L - 13) / 4);
      const tx = (i % 2 ? -1 : 1) * rand(1.7, 2.2);
      const cloth = Cyl(0.6, 0.5, 0.1, 0xe8e2d2, 20); cloth.position.set(tx, 0.76, tz);
      const leg = Cyl(0.05, 0.1, 0.74, 0x1a140c); leg.position.set(tx, 0.37, tz);
      scene.add(cloth, leg);
      contactShadow(tx, tz, 0.75);
      colliders.push({ x: tx, z: tz, r: 0.82 });
      const lamp = spr(glowSpot('rgba(255,180,80,0.95)'), 0.5); lamp.position.set(tx, 0.98, tz);
      scene.add(lamp); flickers.push({ s: lamp.material, base: 0.9, amp: 0.1, f: rand(2, 5) });
      const shade = Cyl(0.08, 0.12, 0.13, 0xe0b060); shade.position.set(tx, 0.92, tz); scene.add(shade);
      const pair = patrons[i];
      for (let k = 0; k < 2; k++) {
        if (!pair[k]) continue;
        const ang = (k ? 1 : -1) * 1.2 + (i % 2 ? 0.5 : -0.5);
        const px = tx + Math.sin(ang) * 0.85, pz = tz + Math.cos(ang) * 0.85;
        const chair = B(0.42, 0.06, 0.42, 0x241a0f); chair.position.set(px, 0.5, pz);
        const cb = B(0.42, 0.5, 0.06, 0x241a0f); cb.position.set(px + Math.sin(ang) * 0.24, 0.8, pz + Math.cos(ang) * 0.24);
        cb.rotation.y = ang; chair.rotation.y = ang;
        scene.add(chair, cb);
        placePerson(Object.assign({ seated: true, y: 0.53, tie: !pair[k].skirt }, pair[k]), px, pz, ang + Math.PI, 'idle');
      }
    }
    // waiter walking the aisle
    placeWalker({ top: 0xf0ead8, bottom: 0x14100c, skin: 0x9a6a48, hairStyle: 'cap', hair: 0x111111 },
      0, S.z0 - 7, 0, S.z1 + 5.5, 0.055);
    // wall sconces
    for (let i = 0; i < perSide; i++) {
      const z = S.z0 - 5.5 - i * 3.0 + 1.5;
      for (const s of [-1, 1]) {
        const sc = spr(glowSpot('rgba(255,190,100,0.6)'), 1.1);
        sc.position.set(s * (room.W / 2 - 0.25), 3.4, z);
        scene.add(sc);
      }
    }
    // easels
    room.albums.forEach((a, i) => {
      const side = i % 2 ? -1 : 1;
      const idx = Math.floor(i / 2);
      const z = S.z0 - 5.5 - idx * 3.0;
      const x = side * (room.W / 2 - 1.35);
      const g = new THREE.Group();
      const sl = sleeve(a, 1.15, true, 0x3a2f1c, true);
      sl.position.y = 1.5; sl.rotation.x = -0.16;
      for (const dx of [-0.45, 0.45]) {
        const leg2 = Cyl(0.025, 0.025, 1.9, 0x2a1f12);
        leg2.position.set(dx, 0.95, 0.12); leg2.rotation.x = 0.12; g.add(leg2);
      }
      const back = Cyl(0.025, 0.025, 1.85, 0x2a1f12);
      back.position.set(0, 0.9, -0.22); back.rotation.x = -0.3; g.add(back);
      const pl = plaque(a, 0.85); pl.position.set(0, 0.62, 0.3); pl.rotation.x = -0.25; g.add(pl);
      g.add(sl);
      g.position.set(x, 0, z);
      g.rotation.y = side < 0 ? 0.9 : -0.9;
      scene.add(g);
      registerSleeve(g, a, 0);
      contactShadow(x, z, 0.7);
      colliders.push({ x, z, r: 0.75 });
      floorPool(x, z, 1.5, 'rgba(255,200,110,0.22)');
      lightCone(x, room.H, z, 1.0, 0xffce80);
    });
    addDust(S.z0 - 3, S.z1 + 3, room.W, room.H, 110, 0xffdda0);
    Z = S.z1;
    return S;
  }

  function buildJukebox(room) {
    const n = room.albums.length, perSide = Math.ceil(n / 2);
    const L = perSide * 2.9 + 13;
    doorWall(Z, room.W, room.H, 0x22333a, room.name);
    const S = shell(room, L, {
      floor: matT(checkerTex('#ddd9cb', '#20242a')),
      wall: matT(aoWall((ctx) => {
        ctx.fillStyle = '#7fb2ad'; ctx.fillRect(0, 0, 256, 256);
        ctx.fillStyle = '#e8e4d8'; ctx.fillRect(0, 0, 256, 62);
        ctx.fillStyle = '#c04040'; ctx.fillRect(0, 62, 256, 10);
        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        for (let x = 0; x < 256; x += 32) ctx.fillRect(x, 72, 2, 184);
      }, 3, 1)),
      ceil: matT(cTex(128, 128, (ctx) => {
        ctx.fillStyle = '#d8d4c8'; ctx.fillRect(0, 0, 128, 128);
        ctx.fillStyle = '#fdfdf2'; ctx.fillRect(52, 8, 24, 112); // fluoro strip
        ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.fillRect(0, 0, 8, 128); ctx.fillRect(120, 0, 8, 128);
      }, 2, 8)),
      skirtC: 0x8a2a2a
    });
    placardStand(room, room.W / 2 - 1.6, S.z0 - 2.6, -0.5);
    // counter + waitress + leaning customer
    const counter = B(1.1, 0.95, L - 11, 0xc04048);
    counter.position.set(-room.W / 2 + 1.5, 0.475, S.zm);
    const counterTop = B(1.3, 0.06, L - 10.6, 0xf0f0ee);
    counterTop.position.set(-room.W / 2 + 1.5, 0.98, S.zm);
    const counterTrim = B(1.32, 0.08, L - 10.6, 0xc8ccd2);
    counterTrim.position.set(-room.W / 2 + 1.5, 0.55, S.zm);
    scene.add(counter, counterTop, counterTrim);
    colliders.push({ x: -room.W / 2 + 1.5, z: S.zm, r: 0 }); // handled by wall clamp anyway
    for (let zz = S.z0 - 6; zz > S.z1 + 5; zz -= 2.2) colliders.push({ x: -room.W / 2 + 1.9, z: zz, r: 0.9 });
    placePerson({ top: 0xf5f0e0, skirt: 0x40a0a8, hairStyle: 'pony', hair: 0x6a4a20, skin: 0xe0b090, lipstick: true },
      -room.W / 2 + 0.7, S.zm + 1, Math.PI / 2, 'idle');
    placePerson({ top: 0x14100c, bottom: 0x2a3a5a, hairStyle: 'cap', hair: 0x111111, skin: 0xc89878, lean: 0.12 },
      -room.W / 2 + 2.75, S.zm - 1.5, -Math.PI / 2, 'idle');
    for (let i = 0; i < 5; i++) {
      const sz = S.z0 - 5.5 - i * ((L - 12) / 5);
      const pole = Cyl(0.06, 0.06, 0.62, 0xbfc4c9); pole.position.set(-room.W / 2 + 2.6, 0.31, sz);
      const seat = Cyl(0.3, 0.3, 0.1, 0xc04048, 18); seat.position.set(-room.W / 2 + 2.6, 0.66, sz);
      scene.add(pole, seat);
      contactShadow(-room.W / 2 + 2.6, sz, 0.35);
    }
    // seated customer on a stool
    placePerson({ seated: true, y: 0.73, top: 0x8a3a2a, bottom: 0x2a3050, skin: 0xd8a880, hairStyle: 'cap', hair: 0x3a2a15 },
      -room.W / 2 + 2.6, S.z0 - 5.5, -Math.PI / 2, 'idle');
    // booth on right side near entry
    (function () {
      const bx = room.W / 2 - 1.35, bz = S.z0 - 7.5;
      for (const dz of [-1.1, 1.1]) {
        const bench = B(1.5, 0.5, 0.6, 0xc04048); bench.position.set(bx, 0.25, bz + dz);
        const backr = B(1.5, 0.7, 0.14, 0xa83038); backr.position.set(bx, 0.85, bz + dz + (dz > 0 ? 0.25 : -0.25));
        scene.add(bench, backr);
      }
      const tbl = B(1.3, 0.08, 0.9, 0xf0f0ee); tbl.position.set(bx, 0.78, bz);
      const tleg = B(0.12, 0.78, 0.12, 0xbfc4c9); tleg.position.set(bx, 0.39, bz);
      scene.add(tbl, tleg);
      colliders.push({ x: bx, z: bz, r: 1.5 });
      placePerson({ seated: true, y: 0.53, skirt: 0xe888b0, top: 0xf5f0e0, hairStyle: 'pony', hair: 0x2a1c10, skin: 0xe0b090 },
        bx - 0.1, bz - 0.75, Math.PI, 'idle');
    })();
    // jukebox + dancer
    (function () {
      const x = room.W / 2 - 2.0, z = S.z1 + 1.8;
      const body = B(1.15, 1.5, 0.65, 0x5a2a10); body.position.set(x, 0.75, z);
      const arch = Cyl(0.58, 0.58, 0.62, 0xd8b040, 24);
      arch.rotation.z = Math.PI / 2; arch.rotation.y = Math.PI / 2;
      arch.position.set(x, 1.5, z);
      const face = P(1.0, 1.15, cTex(256, 300, (ctx) => {
        ctx.fillStyle = '#1a0f08'; ctx.fillRect(0, 0, 256, 300);
        const g0 = ctx.createLinearGradient(0, 0, 0, 300);
        g0.addColorStop(0, '#ffcf60'); g0.addColorStop(0.5, '#ff7040'); g0.addColorStop(1, '#802020');
        ctx.fillStyle = g0; ctx.fillRect(14, 14, 228, 150);
        ctx.fillStyle = '#100a06'; ctx.fillRect(30, 30, 196, 80);
        ctx.fillStyle = '#ffe0a0';
        for (let i = 0; i < 5; i++) ctx.fillRect(36 + i * 39, 190, 30, 80);
      }));
      face.position.set(x, 0.95, z + 0.34);
      scene.add(body, arch, face);
      contactShadow(x, z, 0.9);
      colliders.push({ x, z, r: 1.0 });
      const gl = spr(glowSpot('rgba(255,150,60,0.7)'), 3.2); gl.position.set(x, 1.4, z + 0.4);
      scene.add(gl); flickers.push({ s: gl.material, base: 0.75, amp: 0.12, f: 3 });
      placePerson({ skirt: 0xe86890, top: 0xf5f0e0, hairStyle: 'pony', hair: 0x5a3a18, skin: 0xe8c098, dancing: true },
        x - 1.5, z + 0.9, -0.7, 'dance');
      placePerson({ top: 0x1a1a20, bottom: 0x30405a, hairStyle: 'cap', hair: 0x1a1208, skin: 0xd8a880, dancing: true },
        x - 2.4, z + 1.3, 0.6, 'dance');
    })();
    // neon sign on right wall (not floating mid-room)
    const ns = spr(neonTextTex('HITS · 45s · SOUL', '#ff5f9e'), 4.4, 1.03);
    ns.position.set(room.W / 2 - 0.5, room.H - 0.85, S.zm + 2);
    scene.add(ns); flickers.push({ s: ns.material, base: 0.95, amp: 0.15, f: 9 });
    // wall clock
    const clock = P(0.55, 0.55, cTex(128, 128, (ctx) => {
      ctx.fillStyle = '#e8e8e8'; ctx.beginPath(); ctx.arc(64, 64, 58, 0, 7); ctx.fill();
      ctx.strokeStyle = '#c04040'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(64, 64, 56, 0, 7); ctx.stroke();
      ctx.strokeStyle = '#222'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(64, 64); ctx.lineTo(64, 26); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(64, 64); ctx.lineTo(90, 74); ctx.stroke();
    }));
    clock.position.set(-room.W / 2 + 0.06, 3.6, S.z0 - 4);
    clock.rotation.y = Math.PI / 2;
    scene.add(clock);
    // sleeves on chrome rails
    room.albums.forEach((a, i) => {
      const side = i % 2 ? -1 : 1;
      const idx = Math.floor(i / 2);
      const z = S.z0 - 5.5 - idx * 2.9;
      const x = side * (room.W / 2 - 0.15);
      const g = new THREE.Group();
      const rail = B(1.55, 0.05, 0.16, 0xc8ccd2); rail.position.set(0, -0.75, 0.08); g.add(rail);
      const sl = sleeve(a, 1.2, true, 0xe8e8ea, true); g.add(sl);
      const pl = plaque(a, 0.8); pl.position.set(0, -0.98, 0.06); g.add(pl);
      g.position.set(x, 1.9, z);
      g.rotation.y = side < 0 ? Math.PI / 2 : -Math.PI / 2;
      scene.add(g);
      registerSleeve(g, a, 0);
    });
    Z = S.z1;
    return S;
  }

  function buildShop(room) {
    const picks = room.albums.filter(a => a.note).slice(0, 6);
    const binAlbums = room.albums.filter(a => !picks.includes(a));
    const bins = [];
    for (let i = 0; i < binAlbums.length; i += 6) bins.push(binAlbums.slice(i, i + 6));
    const L = Math.max(21, bins.length * 5.2 + 10);
    doorWall(Z, room.W, room.H, 0x2c2418, room.name);
    const S = shell(room, L, {
      floor: matT(woodTex('#4a3a24', '#3a2d1a', true)),
      wall: matT(pegboardTex('#3a3126', '#241d14')),
      ceil: matC(0x15110c),
      skirtC: 0x1a140c
    });
    placardStand(room, room.W / 2 - 1.6, S.z0 - 2.6, -0.5);
    // hanging bulbs down the aisle
    for (let i = 0; i < Math.floor(L / 4); i++) {
      const bz = S.z0 - 4 - i * 4;
      const cord = Cyl(0.01, 0.01, 0.7, 0x111111); cord.position.set(0, room.H - 0.35, bz);
      const bulb = spr(glowSpot('rgba(255,200,110,0.95)'), 0.55); bulb.position.set(0, room.H - 0.75, bz);
      scene.add(cord, bulb);
      flickers.push({ s: bulb.material, base: 0.92, amp: 0.06, f: rand(1, 3) });
    }
    // shop sign
    const signT = cTex(768, 192, (ctx) => {
      ctx.fillStyle = '#20180e'; ctx.fillRect(0, 0, 768, 192);
      ctx.strokeStyle = '#c9a227'; ctx.lineWidth = 8; ctx.strokeRect(10, 10, 748, 172);
      ctx.textAlign = 'center'; ctx.fillStyle = '#e8ce70'; fitText(ctx, 'USED & NEW', 384, 92, 700, 78);
      ctx.fillStyle = '#a89468'; fitText(ctx, 'LPs · SINGLES · IMPORTS', 384, 152, 700, 40, 'italic');
    });
    const sm = new THREE.MeshBasicMaterial({ map: signT }); sm.side = THREE.DoubleSide;
    const sign = P(3.4, 0.85, sm, true);
    sign.position.set(0, room.H - 0.85, S.z0 - 4.5);
    scene.add(sign);
    for (const dx of [-1.3, 1.3]) {
      const wire = Cyl(0.012, 0.012, 0.55, 0x222222);
      wire.position.set(dx, room.H - 0.35, S.z0 - 4.5); scene.add(wire);
    }
    // front counter with till + clerk
    (function () {
      const cx = -room.W / 2 + 2.2, cz = S.z0 - 3.4;
      const cnt = B(2.2, 1.0, 0.9, matT(woodTex('#54402a', '#43331e')));
      cnt.position.set(cx, 0.5, cz);
      const till = B(0.5, 0.4, 0.45, 0x8a8578); till.position.set(cx - 0.5, 1.22, cz);
      scene.add(cnt, till);
      contactShadow(cx, cz, 1.3);
      colliders.push({ x: cx, z: cz, r: 1.4 });
      placePerson({ top: 0x6a5a3a, bottom: 0x2a2118, hairStyle: 'long', hair: 0x1a1208, skin: 0xc89878 },
        cx, cz - 1.0, Math.PI, 'idle');
    })();
    // spinning 7" rack
    (function () {
      const rx = room.W / 2 - 2.4, rz = S.z0 - 4.2;
      const pole = Cyl(0.03, 0.03, 1.7, 0x555555); pole.position.set(rx, 0.85, rz);
      scene.add(pole);
      const rackG = new THREE.Group();
      for (let lvl = 0; lvl < 3; lvl++) for (let k = 0; k < 4; k++) {
        const card = B(0.34, 0.34, 0.01, [0xd23b52, 0x3178b0, 0xe0a020, 0x3f9950][k]);
        card.position.set(Math.sin(k * 1.57) * 0.2, 0.75 + lvl * 0.4, Math.cos(k * 1.57) * 0.2);
        card.rotation.y = k * 1.57;
        rackG.add(card);
      }
      rackG.position.set(rx, 0, rz);
      scene.add(rackG);
      bobbers.push({ g: rackG, y: 0, ph: 0, spin: 0.3 });
      contactShadow(rx, rz, 0.5);
      colliders.push({ x: rx, z: rz, r: 0.6 });
    })();
    // gig posters
    const posterCols = [['#d23b52', '#f5e9d0'], ['#3178b0', '#f0f0e0'], ['#3f9950', '#101010'], ['#e08020', '#181818']];
    room.albums.slice(0, 8).forEach((a, i) => {
      const [bg, fg] = posterCols[i % posterCols.length];
      const t = cTex(256, 384, (ctx) => {
        ctx.fillStyle = bg; ctx.fillRect(0, 0, 256, 384);
        ctx.strokeStyle = fg; ctx.lineWidth = 4; ctx.strokeRect(10, 10, 236, 364);
        ctx.fillStyle = fg; ctx.textAlign = 'center';
        ctx.font = 'bold 20px Georgia'; ctx.fillText('ONE NIGHT ONLY', 128, 48);
        ctx.font = 'bold 34px Georgia';
        wrapText(ctx, a.artist.toUpperCase(), 128, 120, 216, 40);
        ctx.font = '20px Georgia';
        ctx.fillText('+ SPECIAL GUESTS', 128, 300);
        ctx.fillText('TICKETS 75p', 128, 340);
      });
      const p = P(0.72, 1.08, t);
      const side = i % 2 ? -1 : 1;
      p.position.set(side * (room.W / 2 - 0.05), 3.1, S.z0 - 6 - i * 1.9);
      p.rotation.y = side < 0 ? Math.PI / 2 : -Math.PI / 2;
      p.rotation.z = rand(-0.05, 0.05);
      scene.add(p);
    });
    // bins with diggers
    bins.forEach((group, bi) => {
      const bz = S.z0 - 7.5 - bi * 5.2;
      const bx = (bi % 2 ? -1 : 1) * 2.2;
      const table = B(2.4, 0.16, 1.35, matT(woodTex('#5a4426', '#463418')));
      table.position.set(bx, 0.86, bz);
      for (const [lx, lz] of [[-1.05, -0.5], [1.05, -0.5], [-1.05, 0.5], [1.05, 0.5]]) {
        const leg = B(0.09, 0.86, 0.09, 0x2c2113);
        leg.position.set(bx + lx, 0.43, bz + lz); scene.add(leg);
      }
      const rim = B(2.5, 0.3, 1.45, 0x2c2113); rim.position.set(bx, 1.0, bz);
      scene.add(table, rim);
      contactShadow(bx, bz, 1.5);
      colliders.push({ x: bx, z: bz, r: 1.55 });
      const bt = cTex(256, 64, (ctx) => {
        ctx.fillStyle = '#e8dfc8'; ctx.fillRect(0, 0, 256, 64);
        ctx.fillStyle = '#1a1508'; ctx.textAlign = 'center';
        fitText(ctx, group[0].year + ' – ' + group[group.length - 1].year, 128, 44, 230, 36);
      });
      const bl = P(0.8, 0.2, bt); bl.position.set(bx, 0.98, bz + 0.74); bl.rotation.x = -0.4;
      scene.add(bl);
      group.forEach((a, i) => {
        const g = new THREE.Group();
        g.add(sleeve(a, 1.12, false));
        g.position.set(bx, 1.62, bz + 0.52 - i * 0.19);
        g.rotation.x = -0.32;
        scene.add(g);
        registerSleeve(g, a, 0.5);
      });
      floorPool(bx, bz, 2.2, 'rgba(255,190,100,0.18)');
      lightCone(bx, room.H, bz, 1.5, 0xffc878);
      // a digger at each bin
      const digCfg = bi % 2
        ? { top: 0x3a4a2a, bottom: 0x2a3040, hairStyle: 'long', hair: 0x2a1c10, skin: 0xd8a880, digging: true }
        : { top: 0x30405a, bottom: 0x28303a, hairStyle: 'big', hair: 0x181008, skin: 0x9a6a48, digging: true };
      placePerson(digCfg, bx + (bx > 0 ? -1.15 : 1.15), bz, bx > 0 ? -Math.PI / 2 : Math.PI / 2, 'dig');
    });
    // staff picks + browser
    picks.forEach((a, i) => {
      const side = i % 2 ? -1 : 1;
      const z = S.z0 - 8.5 - Math.floor(i / 2) * 4.6;
      const x = side * (room.W / 2 - 0.15);
      const g = new THREE.Group();
      const sl = sleeve(a, 1.25, true, 0x1e1811); g.add(sl);
      const cardT = cTex(360, 300, (ctx) => {
        ctx.fillStyle = '#f5e9b8'; ctx.fillRect(0, 0, 360, 300);
        ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.fillRect(0, 0, 360, 26);
        ctx.fillStyle = '#8a2020'; ctx.font = 'bold italic 30px Georgia'; ctx.textAlign = 'left';
        ctx.fillText('STAFF PICK ★', 18, 52);
        ctx.fillStyle = '#2a2418'; ctx.font = 'italic 21px Georgia';
        wrapText(ctx, a.note.split('. ').slice(0, 2).join('. ') + '.', 18, 92, 324, 28);
      });
      const card = P(0.72, 0.6, cardT);
      card.position.set(0.95, -0.35, 0.02); card.rotation.z = rand(-0.08, 0.03);
      g.add(card);
      const pl = plaque(a, 0.8); pl.position.set(0, -0.85, 0.02); g.add(pl);
      g.position.set(x, 2.05, z);
      g.rotation.y = side < 0 ? Math.PI / 2 : -Math.PI / 2;
      scene.add(g);
      registerSleeve(g, a, 0);
      floorPool(x * 0.8, z, 1.4, 'rgba(255,200,110,0.2)');
    });
    // a browser wandering the aisle
    placeWalker({ top: 0x5a2a2a, bottom: 0x2a3040, hairStyle: 'long', hair: 0x3a2510, skin: 0xe0b090 },
      [{ x: 0, z: S.z0 - 6 }, { x: 1.2, z: S.zm }, { x: -0.8, z: S.z1 + 4 }], 0.75);
    addDust(S.z0 - 3, S.z1 + 3, room.W, room.H, 80, 0xffe0b0);
    Z = S.z1;
    return S;
  }

  function buildNeon(room) {
    const n = room.albums.length, perSide = Math.ceil(n / 2);
    const L = perSide * 2.5 + 13;
    doorWall(Z, room.W, room.H, 0x0d0d18, room.name);
    const S = shell(room, L, {
      floor: matT(cTex(256, 256, (ctx) => {
        ctx.fillStyle = '#0a0a14'; ctx.fillRect(0, 0, 256, 256);
        const g0 = ctx.createRadialGradient(128, 128, 10, 128, 128, 180);
        g0.addColorStop(0, 'rgba(255,45,149,0.12)'); g0.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g0; ctx.fillRect(0, 0, 256, 256);
        ctx.strokeStyle = '#ff2d95'; ctx.lineWidth = 2; ctx.globalAlpha = 0.5;
        for (let i = 0; i <= 256; i += 32) {
          ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 256); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(256, i); ctx.stroke();
        }
      }, 6, 10)),
      wall: matT(aoWall((ctx) => {
        ctx.fillStyle = '#0d0d18'; ctx.fillRect(0, 0, 256, 256);
        ctx.strokeStyle = 'rgba(34,211,238,0.25)'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(0, 200); ctx.lineTo(256, 200); ctx.stroke();
        ctx.strokeStyle = 'rgba(255,45,149,0.2)';
        ctx.beginPath(); ctx.moveTo(0, 208); ctx.lineTo(256, 208); ctx.stroke();
      }, 4, 1)),
      ceil: matC(0x04040a),
      skirtC: 0x181828
    });
    placardStand(room, room.W / 2 - 1.6, S.z0 - 2.6, -0.5);
    // laser lines along ceiling
    for (const [c, y, x] of [[0x22d3ee, room.H - 0.1, -2], [0xff2d95, room.H - 0.2, 2], [0xc084fc, room.H - 0.15, 0]]) {
      const l = B(0.03, 0.03, L - 2, new THREE.MeshBasicMaterial({ color: c }));
      l.position.set(x, y, S.zm);
      scene.add(l);
    }
    // sunset grid, split around the doorway
    const sunT = cTex(512, 384, (ctx) => {
      const g0 = ctx.createLinearGradient(0, 0, 0, 384);
      g0.addColorStop(0, '#120824'); g0.addColorStop(0.55, '#4a1060'); g0.addColorStop(0.8, '#c02870');
      ctx.fillStyle = g0; ctx.fillRect(0, 0, 512, 384);
      ctx.fillStyle = '#ff9040';
      ctx.beginPath(); ctx.arc(256, 250, 90, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#120824';
      for (let i = 0; i < 6; i++) ctx.fillRect(0, 175 + i * 14 + i * i, 512, 4 + i);
      ctx.strokeStyle = '#ff2d95'; ctx.lineWidth = 2;
      for (let x = -256; x <= 768; x += 64) {
        ctx.beginPath(); ctx.moveTo(256 + (x - 256) * 0.2, 260); ctx.lineTo(x, 384); ctx.stroke();
      }
      ctx.beginPath(); ctx.moveTo(0, 262); ctx.lineTo(512, 262); ctx.stroke();
    });
    const panW = (room.W - 2.6) / 2 - 0.2;
    for (const s of [-1, 1]) {
      const sp = P(panW, room.H - 0.2, matT(sunT));
      sp.position.set(s * (1.3 + panW / 2 + 0.1), room.H / 2, S.z1 + 0.1);
      scene.add(sp);
    }
    // CRT wall near entry, left — MTV-style music videos built from this decade's sleeves
    const vidArts = room.albums.map(a => ART[a.id]).filter(Boolean);
    const vidTextures = [];
    for (let v = 0; v < 3; v++) {
      const c = document.createElement('canvas'); c.width = 128; c.height = 96;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#08080c'; ctx.fillRect(0, 0, 128, 96);
      const tex = new THREE.CanvasTexture(c);
      const imgs = [];
      vidArts.forEach((uri, k) => {
        if (k % 3 !== v) return;
        const im = new Image(); im.src = uri; imgs.push(im);
      });
      videoScreens.push({ ctx, tex, imgs, cur: 0, f: rand(0, 100), burst: 0, ph: v * 2.1 });
      vidTextures.push(tex);
    }
    for (let r0 = 0; r0 < 3; r0++) for (let c0 = 0; c0 < 3; c0++) {
      const tv = B(1.02, 0.8, 0.85, 0x1a1a22);
      tv.position.set(-room.W / 2 + 1.0, 0.45 + r0 * 0.85, S.z0 - 5.2 - c0 * 1.12);
      tv.rotation.y = Math.PI / 2 + rand(-0.08, 0.08);
      const scr = P(0.78, 0.58, new THREE.MeshBasicMaterial({ map: vidTextures[(r0 + c0) % 3] }));
      scr.position.set(0, 0, 0.44);
      tv.add(scr);
      scene.add(tv);
    }
    for (let zz = S.z0 - 5.2; zz > S.z0 - 8.6; zz -= 1.1) colliders.push({ x: -room.W / 2 + 1.0, z: zz, r: 1.1 });
    // watcher in front of the TVs
    placePerson({ top: 0x22222a, bottom: 0x1a1a20, hairStyle: 'big', hair: 0x181008, skin: 0xd8a880 },
      -room.W / 2 + 2.6, S.z0 - 6.3, -Math.PI / 2, 'idle');
    // arcade corner: Defender, Space Invaders, Asteroids
    function cabinet(name, color, drawFn, az) {
      const ax = room.W / 2 - 1.05;
      const cab = B(0.85, 1.75, 0.75, 0x14141f); cab.position.set(ax, 0.875, az); cab.rotation.y = -Math.PI / 2;
      // marquee
      const mq = P(0.8, 0.28, cTex(256, 90, (ctx) => {
        ctx.fillStyle = '#08080c'; ctx.fillRect(0, 0, 256, 90);
        ctx.strokeStyle = color; ctx.lineWidth = 5; ctx.strokeRect(4, 4, 248, 82);
        ctx.fillStyle = color; ctx.textAlign = 'center';
        ctx.shadowColor = color; ctx.shadowBlur = 14;
        fitText(ctx, name, 128, 62, 220, 44);
      }));
      mq.position.set(0, 0.78, 0.39); mq.rotation.x = 0.15; cab.add(mq);
      // animated screen
      const c = document.createElement('canvas'); c.width = 112; c.height = 84;
      const tex = new THREE.CanvasTexture(c);
      arcadeScreens.push({ ctx: c.getContext('2d'), tex, draw: drawFn, f: Math.floor(rand(0, 40)) });
      const scr = P(0.58, 0.44, new THREE.MeshBasicMaterial({ map: tex }));
      scr.position.set(0, 0.28, 0.4); scr.rotation.x = -0.08; cab.add(scr);
      // control deck, joystick, buttons
      const deck = B(0.8, 0.08, 0.3, 0x1e1e2c); deck.position.set(0, -0.05, 0.48); deck.rotation.x = -0.25; cab.add(deck);
      const joy = Cyl(0.016, 0.016, 0.12, 0x999999); joy.position.set(-0.18, 0.05, 0.5); cab.add(joy);
      const ball = Sph(0.035, 0xd02030); ball.position.set(-0.18, 0.12, 0.5); cab.add(ball);
      for (const bx2 of [0.08, 0.22]) { const btn = Cyl(0.032, 0.032, 0.02, bx2 > 0.1 ? 0xe0e0e0 : 0xd02030, 10); btn.position.set(bx2, 0.02, 0.5); cab.add(btn); }
      // side stripe
      for (const s of [-1, 1]) {
        const stripe = P(0.12, 1.6, color === '#7fff40' ? 0x40a020 : 0xc02890);
        stripe.position.set(s * 0.435, 0, 0.1); stripe.rotation.y = s * Math.PI / 2; cab.add(stripe);
      }
      const glow = spr(glowSpot('rgba(120,160,255,0.35)'), 1.9); glow.position.set(ax, 1.75, az);
      scene.add(cab, glow);
      contactShadow(ax, az, 0.7);
      colliders.push({ x: ax, z: az, r: 0.85 });
    }
    const drawInvaders = (ctx, f) => {
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 112, 84);
      ctx.fillStyle = '#40ff60';
      const ox = Math.round(Math.sin(f * 0.15) * 8), legs = Math.floor(f / 4) % 2;
      for (let r = 0; r < 3; r++) for (let cc = 0; cc < 6; cc++) {
        const x = 14 + cc * 15 + ox, y = 10 + r * 11;
        ctx.fillRect(x, y, 9, 5); ctx.fillRect(x + 2, y - 2, 5, 2);
        if (legs) { ctx.fillRect(x - 1, y + 5, 3, 2); ctx.fillRect(x + 7, y + 5, 3, 2); }
        else { ctx.fillRect(x + 1, y + 5, 3, 2); ctx.fillRect(x + 5, y + 5, 3, 2); }
      }
      for (let s = 0; s < 4; s++) ctx.fillRect(12 + s * 26, 60, 14, 6);
      const px2 = 50 + Math.round(Math.sin(f * 0.09) * 30);
      ctx.fillRect(px2, 74, 12, 4); ctx.fillRect(px2 + 5, 71, 2, 3);
      if (f % 9 < 4) { ctx.fillStyle = '#fff'; ctx.fillRect(px2 + 5, 50 - (f % 9) * 8, 1, 6); }
      ctx.fillStyle = '#fff'; ctx.font = '7px monospace'; ctx.fillText('SCORE 1730', 4, 7);
    };
    const drawDefender = (ctx, f) => {
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 112, 84);
      ctx.fillStyle = '#fff';
      for (let s = 0; s < 20; s++) ctx.fillRect((s * 37 + 11) % 112, (s * 23 + 5) % 60, 1, 1);
      ctx.strokeStyle = '#7fff40'; ctx.lineWidth = 1.5; ctx.beginPath();
      for (let x = 0; x <= 112; x += 8) {
        const y = 70 - Math.abs(Math.sin((x + f * 3) * 0.09)) * 16;
        x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.stroke();
      ctx.fillStyle = '#e8e8ff'; // ship
      ctx.fillRect(30, 38, 14, 3); ctx.fillRect(40, 36, 6, 2);
      ctx.fillStyle = '#ff8020'; ctx.fillRect(24 - (f % 4), 38, 5, 2);
      if (f % 7 < 3) { ctx.fillStyle = '#fff'; ctx.fillRect(46, 38, 30 + (f % 7) * 8, 1); }
      ctx.fillStyle = '#ff4060'; ctx.fillRect(80, 30 + Math.sin(f * 0.3) * 8, 5, 4);
      ctx.fillStyle = '#7fff40'; ctx.font = '7px monospace'; ctx.fillText('DEFENDER', 4, 8);
    };
    const drawAsteroids = (ctx, f) => {
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 112, 84);
      ctx.strokeStyle = '#e8e8f0'; ctx.lineWidth = 1;
      const rocks = [[20, 20, 9], [80, 18, 12], [90, 60, 7], [30, 62, 10]];
      rocks.forEach(([rx, ry, rr], k) => {
        ctx.beginPath();
        for (let a = 0; a < 7; a++) {
          const th = a / 7 * Math.PI * 2 + f * 0.02 * (k % 2 ? 1 : -1);
          const rad = rr * (0.75 + ((a * 37 + k * 13) % 10) / 20);
          const x = rx + Math.cos(th) * rad + Math.sin(f * 0.05 + k) * 6;
          const y = ry + Math.sin(th) * rad;
          a ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        }
        ctx.closePath(); ctx.stroke();
      });
      const ang = f * 0.1;
      ctx.save(); ctx.translate(56, 42); ctx.rotate(ang);
      ctx.beginPath(); ctx.moveTo(0, -7); ctx.lineTo(4, 6); ctx.lineTo(0, 3); ctx.lineTo(-4, 6); ctx.closePath(); ctx.stroke();
      ctx.restore();
      ctx.font = '7px monospace'; ctx.fillStyle = '#e8e8f0'; ctx.fillText('ASTEROIDS', 4, 8);
    };
    cabinet('DEFENDER', '#7fff40', drawDefender, S.z0 - 7.25);
    cabinet('INVADERS', '#40ffd0', drawInvaders, S.z0 - 9.75);
    cabinet('ASTEROIDS', '#e8e8f0', drawAsteroids, S.z0 - 12.25);
    // players at the machines
    placePerson({ top: 0xc03040, bottom: 0x1a1a20, hairStyle: 'cap', hatC: 0xc03040, hat: 'cap', skin: 0x9a6a48, lean: 0.1 },
      room.W / 2 - 1.95, S.z0 - 9.75, -Math.PI / 2, 'idle');
    placePerson({ top: 0x2a4a2a, bottom: 0x22222a, hairStyle: 'big', hair: 0x1a1008, skin: 0xd8a880, lean: 0.08 },
      room.W / 2 - 1.95, S.z0 - 7.25, -Math.PI / 2, 'idle');
    // boombox guy + big-hair walker
    (function () {
      const bb = placePerson({ top: 0xd8d0c8, bottom: 0x30303a, hairStyle: 'big', hair: 0x0d0a06, skin: 0x8a5a3a },
        1.6, S.zm + 2.5, 0.8, 'sway');
      const box = B(0.55, 0.28, 0.2, 0x22222a);
      box.position.set(0.28, 0.55, 0.05); box.rotation.z = 0.2;
      bb.userData.parts.spine.add(box);
      bb.userData.parts.arms[1].sh.rotation.z = -1.9; // holding it on the shoulder
    })();
    placeWalker({ skirt: 0xd82a8a, top: 0x30104a, hairStyle: 'big', hair: 0x2a1408, skin: 0xe0b090, lipstick: true },
      [{ x: 1.8, z: S.z0 - 6 }, { x: -1.5, z: S.zm }, { x: 1.2, z: S.z1 + 4 }], 0.85);
    // neon signs on walls
    const s1 = spr(neonTextTex('VIDEO', '#22d3ee'), 3.0, 0.7);
    s1.position.set(-room.W / 2 + 0.6, room.H - 1.0, S.zm + 3);
    const s2 = spr(neonTextTex('12" IMPORTS', '#ff2d95'), 3.8, 0.89);
    s2.position.set(room.W / 2 - 0.6, room.H - 1.2, S.zm - 2);
    scene.add(s1, s2);
    flickers.push({ s: s1.material, base: 0.9, amp: 0.25, f: 13 }, { s: s2.material, base: 0.9, amp: 0.12, f: 7 });
    // neon palm
    const palm = spr(cTex(256, 256, (ctx) => {
      ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 6; ctx.shadowColor = '#22d3ee'; ctx.shadowBlur = 18;
      ctx.beginPath(); ctx.moveTo(128, 250); ctx.quadraticCurveTo(120, 160, 128, 120); ctx.stroke();
      for (const a of [-1.2, -0.6, 0, 0.6, 1.2]) {
        ctx.beginPath(); ctx.moveTo(128, 120);
        ctx.quadraticCurveTo(128 + Math.sin(a) * 70, 120 - 40 + Math.abs(a) * 14, 128 + Math.sin(a) * 100, 120 - 10 + Math.abs(a) * 26);
        ctx.stroke();
      }
    }), 2.4);
    palm.position.set(room.W / 2 - 0.7, 2.1, S.z0 - 14);
    scene.add(palm);
    flickers.push({ s: palm.material, base: 0.9, amp: 0.1, f: 5 });
    // sleeves in backlit racks
    room.albums.forEach((a, i) => {
      const side = i % 2 ? -1 : 1;
      const idx = Math.floor(i / 2);
      const z = S.z0 - 6 - idx * 2.5;
      const x = side * (room.W / 2 - 0.18);
      const g = new THREE.Group();
      const glowCols = ['#22d3ee', '#ff2d95', '#a3e635', '#c084fc'];
      const gc = glowCols[i % 4];
      const halo = P(1.55, 1.55, new THREE.MeshBasicMaterial({ map: glowSpot(gc), transparent: true, opacity: 0.85, depthWrite: false }));
      halo.position.z = -0.02;
      const sl = sleeve(a, 1.15, true, 0x101018);
      const wire = B(1.45, 0.04, 0.1, 0x30303c); wire.position.set(0, -0.68, 0.06);
      const pl = plaque(a, 0.8); pl.position.set(0, -0.95, 0.05);
      g.add(halo, sl, wire, pl);
      g.position.set(x, 2.0, z);
      g.rotation.y = side < 0 ? Math.PI / 2 : -Math.PI / 2;
      scene.add(g);
      registerSleeve(g, a, 0);
    });
    Z = S.z1;
    return S;
  }

  function buildBedroom(room) {
    const posters = room.albums.filter(a => a.note).slice(0, 5);
    const shelfA = room.albums.filter(a => !posters.includes(a));
    const L = Math.max(20, Math.ceil(shelfA.length / 4) * 6 + posters.length * 1.2 + 9);
    doorWall(Z, room.W, room.H, 0x2a2438, room.name);
    const S = shell(room, L, {
      floor: matT(carpetTex('#3a3450', '#6a62a0')),
      wall: matT(aoWall((ctx) => {
        ctx.fillStyle = '#443c60'; ctx.fillRect(0, 0, 256, 256);
        ctx.fillStyle = 'rgba(255,255,255,0.045)';
        for (let i = 0; i < 40; i++) ctx.fillRect(rand(0, 256), rand(0, 256), 3, 3);
      }, 3, 1)),
      ceil: matT(cTex(256, 256, (ctx) => { // glow-star stickers
        ctx.fillStyle = '#241f38'; ctx.fillRect(0, 0, 256, 256);
        ctx.fillStyle = '#b8f0c0';
        for (let i = 0; i < 22; i++) {
          const x = rand(10, 246), y = rand(10, 246), r = rand(2, 5);
          ctx.globalAlpha = rand(0.4, 0.95);
          ctx.beginPath();
          for (let k = 0; k < 10; k++) {
            const rr = k % 2 ? r * 0.45 : r;
            const a = k * Math.PI / 5;
            ctx[k ? 'lineTo' : 'moveTo'](x + Math.sin(a) * rr, y + Math.cos(a) * rr);
          }
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }, 3, 5)),
      skirtC: 0x2a2440
    });
    placardStand(room, room.W / 2 - 1.5, S.z0 - 2.4, -0.5);
    // window on far wall, off-centre
    const wx = -3.3;
    const win = P(2.2, 1.6, cTex(256, 192, (ctx) => {
      const g0 = ctx.createLinearGradient(0, 0, 0, 192);
      g0.addColorStop(0, '#0a1030'); g0.addColorStop(1, '#202848');
      ctx.fillStyle = g0; ctx.fillRect(0, 0, 256, 192);
      ctx.fillStyle = '#e8e0b0';
      for (let i = 0; i < 60; i++) ctx.fillRect(rand(0, 256), rand(0, 90), 1.6, 1.6);
      ctx.fillStyle = '#05070f';
      for (let i = 0; i < 9; i++) { const bw = rand(18, 40), bh = rand(40, 100); ctx.fillRect(i * 30, 192 - bh, bw, bh); }
      ctx.fillStyle = '#ffd890';
      for (let i = 0; i < 40; i++) ctx.fillRect(rand(0, 256), rand(110, 188), 2, 3);
      ctx.fillStyle = '#f0ead0'; ctx.beginPath(); ctx.arc(210, 34, 14, 0, 7); ctx.fill();
    }));
    win.position.set(wx, 2.1, S.z1 + 0.08);
    const frame1 = B(2.4, 0.1, 0.06, 0x1a1626); frame1.position.set(wx, 2.9, S.z1 + 0.1);
    const frame2 = frame1.clone(); frame2.position.y = 1.3;
    const frame3 = B(0.1, 1.7, 0.06, 0x1a1626); frame3.position.set(wx - 1.15, 2.1, S.z1 + 0.1);
    const frame4 = frame3.clone(); frame4.position.x = wx + 1.15;
    const frame5 = frame3.clone(); frame5.position.x = wx;
    scene.add(win, frame1, frame2, frame3, frame4, frame5);
    // bed with sleeping teen's friend lying reading
    (function () {
      const bx = room.W / 2 - 1.6, bz = S.z1 + 3.4;
      const base = B(2.1, 0.35, 1.25, 0x3a2c50); base.position.set(bx, 0.175, bz);
      const duvet = B(2.05, 0.22, 1.2, 0x6a4a8a); duvet.position.set(bx, 0.45, bz);
      const pillow = B(0.5, 0.14, 0.8, 0xe8e2f0); pillow.position.set(bx + 0.7, 0.6, bz);
      scene.add(base, duvet, pillow);
      contactShadow(bx, bz, 1.4);
      colliders.push({ x: bx, z: bz, r: 1.5 });
      // magazine on duvet
      const mag = P(0.3, 0.4, cTex(64, 84, (ctx) => {
        ctx.fillStyle = '#e02040'; ctx.fillRect(0, 0, 64, 84);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 16px Georgia'; ctx.textAlign = 'center';
        ctx.fillText('NME', 32, 26);
      }));
      mag.rotation.x = -Math.PI / 2; mag.rotation.z = 0.4;
      mag.position.set(bx - 0.5, 0.57, bz + 0.2);
      scene.add(mag);
    })();
    // rug
    const rug = P(2.6, 1.8, cTex(128, 96, (ctx) => {
      ctx.fillStyle = '#8a3050'; ctx.fillRect(0, 0, 128, 96);
      ctx.strokeStyle = '#e0c060'; ctx.lineWidth = 5; ctx.strokeRect(8, 8, 112, 80);
    }));
    rug.rotation.x = -Math.PI / 2; rug.position.set(0.4, 0.025, S.zm + 1);
    scene.add(rug);
    // teen sitting cross-legged with headphones facing shelf
    placePerson({ floorSit: true, y: 0.07, top: 0x2a4a2a, bottom: 0x2a3040, hairStyle: 'long', hair: 0x1a1208, skin: 0xe0b090, headphones: true },
      0.4, S.zm + 1, Math.PI / 2.5, 'idle');
    // string lights
    for (let side of [-1, 1]) for (let i = 0; i < Math.floor(L / 1.1); i++) {
      const gl = spr(glowSpot(i % 2 ? 'rgba(255,190,120,0.9)' : 'rgba(190,150,255,0.9)'), 0.26);
      gl.position.set(side * (room.W / 2 - 0.15), room.H - 0.25 - Math.sin(i * 1.1) * 0.12, S.z0 - 1 - i * 1.1);
      scene.add(gl);
    }
    // lava lamp + dresser + boombox + CD tower
    const dresser = B(1.3, 0.65, 0.55, 0x2c2440); dresser.position.set(-room.W / 2 + 1.1, 0.33, S.zm);
    scene.add(dresser);
    contactShadow(-room.W / 2 + 1.1, S.zm, 0.9);
    colliders.push({ x: -room.W / 2 + 1.1, z: S.zm, r: 1.0 });
    const lava = Cyl(0.09, 0.16, 0.5, 0x201830); lava.position.set(-room.W / 2 + 1.1, 0.9, S.zm);
    scene.add(lava);
    const lgl = spr(glowSpot('rgba(255,80,160,0.9)'), 1.3); lgl.position.set(-room.W / 2 + 1.1, 1.05, S.zm);
    scene.add(lgl); flickers.push({ s: lgl.material, base: 0.8, amp: 0.2, f: 0.7 });
    (function () {
      const x = -room.W / 2 + 1.15, z = S.zm - 2.5;
      const shelf = B(1.2, 0.06, 0.5, 0x342c4c); shelf.position.set(x, 0.65, z);
      const bb = B(1.0, 0.45, 0.3, 0x22222a); bb.position.set(x, 0.93, z); bb.rotation.y = 0.5;
      const sp1 = Cyl(0.14, 0.14, 0.05, 0x111116, 16); sp1.rotation.x = Math.PI / 2;
      sp1.position.set(-0.3, 0, 0.16); bb.add(sp1);
      const sp2 = sp1.clone(); sp2.position.x = 0.3; bb.add(sp2);
      scene.add(bb, shelf);
      colliders.push({ x, z, r: 0.8 });
    })();
    for (let i = 0; i < 24; i++) {
      const cd = B(0.32, 0.025, 0.28, i % 3 ? 0xd8d8e0 : 0x9090a0);
      cd.position.set(room.W / 2 - 0.9, 0.1 + i * 0.032, S.zm + 2.2);
      cd.rotation.y = rand(-0.08, 0.08);
      scene.add(cd);
    }
    colliders.push({ x: room.W / 2 - 0.9, z: S.zm + 2.2, r: 0.6 });
    // posters
    posters.forEach((a, i) => {
      const side = i % 2 ? -1 : 1;
      const z = S.z0 - 5 - i * 2.6;
      const g = new THREE.Group();
      const sl = sleeve(a, 1.7, false);
      sl.rotation.z = rand(-0.04, 0.04);
      g.add(sl);
      const pl = plaque(a, 0.75); pl.position.set(0, -1.12, 0.02); g.add(pl);
      g.position.set(side * (room.W / 2 - 0.08), 2.0, z);
      g.rotation.y = side < 0 ? Math.PI / 2 : -Math.PI / 2;
      scene.add(g);
      registerSleeve(g, a, 0);
    });
    // shelves
    const shelves = [];
    for (let i = 0; i < shelfA.length; i += 4) shelves.push(shelfA.slice(i, i + 4));
    shelves.forEach((grp, si) => {
      const z = S.z0 - 6.5 - posters.length * 1.3 - si * 6;
      const side = si % 2 ? -1 : 1;
      const x = side * (room.W / 2 - 0.75);
      const unit = B(4.6, 0.08, 0.6, 0x2c2440);
      unit.position.set(x, 1.15, z); unit.rotation.y = side < 0 ? Math.PI / 2 : -Math.PI / 2;
      const unit2 = unit.clone(); unit2.position.y = 0.35;
      scene.add(unit, unit2);
      grp.forEach((a, i) => {
        const g = new THREE.Group();
        g.add(sleeve(a, 1.05, false));
        const zi = z - 2.3 + ((i + 0.5) / grp.length) * 4.6;
        g.position.set(side * (room.W / 2 - 0.42), 1.75, zi);
        g.rotation.y = (side < 0 ? Math.PI / 2 : -Math.PI / 2) + rand(-0.06, 0.06);
        g.rotation.x = -0.08;
        scene.add(g);
        registerSleeve(g, a, 0);
      });
    });
    Z = S.z1;
    return S;
  }

  function buildWhite(room) {
    const n = room.albums.length;
    const rows = Math.ceil(n / 2);
    const L = rows * 4.4 + 10;
    doorWall(Z, room.W, room.H, 0xe8e8ea, room.name);
    const S = shell(room, L, {
      floor: matT(cTex(256, 256, (ctx) => {
        const g0 = ctx.createRadialGradient(128, 128, 10, 128, 128, 180);
        g0.addColorStop(0, '#fbfbfb'); g0.addColorStop(1, '#d4d4d8');
        ctx.fillStyle = g0; ctx.fillRect(0, 0, 256, 256);
        ctx.strokeStyle = 'rgba(0,0,0,0.05)'; ctx.lineWidth = 2;
        for (let i = 0; i <= 256; i += 64) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 256); ctx.stroke(); }
      }, 2, 4)),
      wall: matT(cTex(256, 256, (ctx) => {
        const g0 = ctx.createLinearGradient(0, 0, 0, 256);
        g0.addColorStop(0, '#ffffff'); g0.addColorStop(1, '#d8d8de');
        ctx.fillStyle = g0; ctx.fillRect(0, 0, 256, 256);
      }, 1, 1)),
      ceil: matT(cTex(128, 128, (ctx) => { // luminous panels
        ctx.fillStyle = '#e8e8ec'; ctx.fillRect(0, 0, 128, 128);
        ctx.fillStyle = '#ffffff'; ctx.fillRect(10, 10, 108, 108);
        ctx.strokeStyle = '#d0d0d6'; ctx.strokeRect(10, 10, 108, 108);
      }, 3, 5)),
      skirtC: 0xcfcfd6
    });
    placardStand(room, room.W / 2 - 1.6, S.z0 - 2.6, -0.5);
    // iPod-ad silhouettes
    const adCols = ['#7fd320', '#00b0ea', '#ff4ea1', '#ffb400'];
    for (let i = 0; i < 4; i++) {
      const t = cTex(256, 384, (ctx) => {
        ctx.fillStyle = adCols[i]; ctx.fillRect(0, 0, 256, 384);
        ctx.fillStyle = '#000';
        ctx.beginPath(); ctx.arc(128 + rand(-16, 16), 86, 26, 0, 7); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(128, 106); ctx.quadraticCurveTo(rand(60, 90), 180, rand(50, 80), rand(230, 260));
        ctx.lineTo(rand(80, 110), 250); ctx.quadraticCurveTo(128, 190, rand(150, 180), rand(240, 270));
        ctx.lineTo(rand(180, 210), rand(250, 280)); ctx.quadraticCurveTo(160, 170, 128, 106); ctx.fill();
        ctx.lineWidth = 15; ctx.strokeStyle = '#000';
        ctx.beginPath(); ctx.moveTo(102, 148); ctx.quadraticCurveTo(60, 200, 82, 300); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(154, 148); ctx.quadraticCurveTo(198, 210, 174, 310); ctx.stroke();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.moveTo(120, 90); ctx.quadraticCurveTo(150, 160, 128, 218); ctx.stroke();
      });
      const side = i % 2 ? -1 : 1;
      const p = P(1.7, 2.55, t);
      p.position.set(side * (room.W / 2 - 0.06), 2.2, S.z0 - 5 - i * 3.4);
      p.rotation.y = side < 0 ? Math.PI / 2 : -Math.PI / 2;
      scene.add(p);
    }
    // silhouette people with earbuds
    placePerson({ silhouette: true, top: 0x0a0a0a, bottom: 0x0a0a0a, dancing: true }, -2.6, S.z0 - 7.5, 0.9, 'dance');
    placePerson({ silhouette: true, top: 0x0a0a0a, bottom: 0x0a0a0a }, 2.4, S.zm - 1, -0.6, 'sway');
    // white bench + seated silhouette
    (function () {
      const bx = 0, bz = S.z0 - 4.6;
      const bench = B(1.9, 0.08, 0.55, 0xffffff); bench.position.set(bx, 0.5, bz);
      for (const dx of [-0.8, 0.8]) { const bl = B(0.1, 0.5, 0.5, 0xe4e4e8); bl.position.set(bx + dx, 0.25, bz); scene.add(bl); }
      scene.add(bench);
      contactShadow(bx, bz, 1.1);
      colliders.push({ x: bx, z: bz, r: 1.15 });
      placePerson({ silhouette: true, seated: true, y: 0.56 }, bx - 0.4, bz, Math.PI, 'idle');
    })();
    // plinths
    room.albums.forEach((a, i) => {
      const row = Math.floor(i / 2), col = i % 2;
      const x = col ? 1.9 : -1.9;
      const z = S.z0 - 7 - row * 4.4;
      const plinth = B(0.95, 1.05, 0.95, 0xffffff);
      plinth.position.set(x, 0.525, z);
      const shadow = contactShadow(x, z, 0.85);
      scene.add(plinth);
      colliders.push({ x, z, r: 0.95 });
      const g = new THREE.Group();
      g.add(sleeve(a, 1.05, true, 0xf0f0f2));
      const pt = cTex(512, 110, (ctx) => {
        ctx.textAlign = 'center'; ctx.fillStyle = '#333';
        fitText(ctx, a.artist, 256, 44, 480, 38);
        ctx.fillStyle = '#888'; fitText(ctx, a.album + ' · ' + a.year, 256, 90, 480, 28);
      });
      const pl = P(0.85, 0.18, new THREE.MeshBasicMaterial({ map: pt, transparent: true }));
      pl.position.set(0, -0.75, 0.3); pl.rotation.x = -0.5;
      g.add(pl);
      g.position.set(x, 1.75, z);
      g.rotation.y = col ? -0.35 : 0.35;
      scene.add(g);
      registerSleeve(g, a, 0);
    });
    Z = S.z1;
    return S;
  }

  function buildCloud(room) {
    const L = 18;
    doorWall(Z, room.W, room.H, 0x08080f, room.name);
    const S = shell(room, L, {
      floor: matT(cTex(256, 256, (ctx) => {
        ctx.fillStyle = '#06060c'; ctx.fillRect(0, 0, 256, 256);
        ctx.strokeStyle = 'rgba(120,140,255,0.13)'; ctx.lineWidth = 1;
        for (let i = 0; i <= 256; i += 32) {
          ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 256); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(256, i); ctx.stroke();
        }
      }, 5, 6)),
      wall: matC(0x07070d),
      ceil: matC(0x040408),
      noSkirt: true
    });
    placardStand(room, room.W / 2 - 1.7, S.z0 - 2.8, -0.5);
    addDust(S.z0 - 1, S.z1 + 1, room.W, room.H, 280, 0x8fa8ff);
    // server racks with blinking LEDs
    for (const [sx, sz] of [[-room.W / 2 + 1.2, S.z0 - 5], [-room.W / 2 + 1.2, S.z0 - 8], [room.W / 2 - 1.2, S.z0 - 6.5]]) {
      const rack = B(0.9, 2.6, 0.9, 0x0c0c14); rack.position.set(sx, 1.3, sz);
      scene.add(rack);
      contactShadow(sx, sz, 0.8);
      colliders.push({ x: sx, z: sz, r: 0.9 });
      for (let i = 0; i < 8; i++) {
        const led = P(0.06, 0.06, new THREE.MeshBasicMaterial({ color: i % 3 ? 0x30ff80 : 0x3080ff, transparent: true }));
        led.position.set(sx + (sx < 0 ? 0.46 : -0.46), 0.4 + i * 0.28, sz + rand(-0.3, 0.3));
        led.rotation.y = sx < 0 ? Math.PI / 2 : -Math.PI / 2;
        scene.add(led);
        ledStrips.push({ m: led.material, ph: rand(0, 6), f: rand(2, 9) });
      }
    }
    // waveform on end wall
    const wave = P(room.W - 3, 1.4, cTex(1024, 128, (ctx) => {
      ctx.strokeStyle = 'rgba(140,160,255,0.7)'; ctx.lineWidth = 3;
      ctx.beginPath();
      for (let x = 0; x < 1024; x += 4) {
        const y = 64 + Math.sin(x * 0.05) * Math.sin(x * 0.011) * 52;
        x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.stroke();
    }));
    wave.position.set(0, room.H - 1.2, S.z1 + 0.15);
    scene.add(wave);
    // floating sleeves
    room.albums.forEach((a, i) => {
      const g = new THREE.Group();
      g.add(sleeve(a, 1.35, true, 0x1a1a2e));
      const pl = plaque(a, 0.85); pl.position.set(0, -1.0, 0.02); g.add(pl);
      g.position.set(i % 2 ? 2.4 : -2.4, 2.2, S.z0 - 6 - i * 3.4);
      g.rotation.y = i % 2 ? -0.6 : 0.6;
      scene.add(g);
      registerSleeve(g, a, 0);
      bobbers.push({ g, y: 2.2, ph: i * 2.1 });
      const halo = P(2.2, 2.2, new THREE.MeshBasicMaterial({ map: glowSpot('rgba(140,160,255,0.35)'), transparent: true, depthWrite: false }));
      halo.position.copy(g.position); halo.position.z -= 0.15; halo.rotation.y = g.rotation.y;
      scene.add(halo);
    });
    // lone listener with phone glow
    placePerson({ top: 0x20202a, bottom: 0x181820, hairStyle: 'cap', hair: 0x14100c, skin: 0xc89878, holdPhone: true },
      1.2, S.z0 - 9, -2.6, 'idle');
    const phGlow = spr(glowSpot('rgba(160,190,255,0.85)'), 0.5);
    phGlow.position.set(1.05, 1.35, S.z0 - 9.15);
    scene.add(phGlow);
    // vinyl turntable nook
    (function () {
      const x = 0, z = S.z1 + 2.6;
      const table = B(1.6, 0.75, 0.9, 0x241a10); table.position.set(x, 0.375, z);
      const deck = B(1.2, 0.09, 0.8, 0x3a2c1a); deck.position.set(x, 0.8, z);
      const platter = Cyl(0.33, 0.33, 0.03, 0x111111, 28); platter.position.set(x - 0.15, 0.87, z);
      const vinyl = Cyl(0.3, 0.3, 0.012, 0x050505, 28); vinyl.position.set(x - 0.15, 0.895, z);
      const labelC = Cyl(0.1, 0.1, 0.014, 0xc03030, 20); labelC.position.set(x - 0.15, 0.9, z);
      const arm = B(0.5, 0.02, 0.03, 0xb0b0b0); arm.position.set(x + 0.28, 0.93, z - 0.1); arm.rotation.y = 0.6;
      scene.add(table, deck, platter, vinyl, labelC, arm);
      contactShadow(x, z, 1.1);
      colliders.push({ x, z, r: 1.2 });
      floorPool(x, z, 2.2, 'rgba(255,180,90,0.3)');
      lightCone(x, room.H, z, 1.4, 0xffc878);
      const st = cTex(768, 128, (ctx) => {
        ctx.textAlign = 'center'; ctx.fillStyle = '#c9a227';
        fitText(ctx, '…and back to vinyl.', 384, 78, 700, 52, 'italic');
      });
      const sMat = new THREE.MeshBasicMaterial({ map: st, transparent: true }); sMat.side = THREE.DoubleSide;
      const s = P(2.6, 0.43, sMat, true);
      s.position.set(x, 2.35, z); scene.add(s);
    })();
    Z = S.z1;
    return S;
  }

  // ================= CLUB v2: easels left, long bar right, dance floor, full staff =================
  function buildClub2(room) {
    const n = room.albums.length;          // 12 → all on the left wall
    const L = n * 2.4 + 26;                // extra length for the big dance floor
    doorWall(Z, room.W, room.H, 0x241b10, room.name);
    const S = shell(room, L, {
      floor: matT(woodTex('#38290f', '#2a1f0b', true)),
      wall: matT(aoWall((ctx) => {
        ctx.fillStyle = '#20180f'; ctx.fillRect(0, 0, 256, 256);
        ctx.fillStyle = '#261c12'; ctx.fillRect(0, 168, 256, 88);
        ctx.strokeStyle = '#c9a227'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(0, 168); ctx.lineTo(256, 168); ctx.stroke();
        ctx.strokeStyle = 'rgba(201,162,39,0.3)'; ctx.lineWidth = 2;
        for (let x = 32; x < 256; x += 64) { ctx.beginPath(); ctx.moveTo(x, 6); ctx.lineTo(x, 166); ctx.stroke(); }
        ctx.strokeStyle = 'rgba(201,162,39,0.16)';
        for (let x = 32; x < 256; x += 64) for (let a = 0; a < 5; a++) {
          ctx.beginPath(); ctx.arc(x, 166, 20 + a * 9, Math.PI, Math.PI * 2); ctx.stroke();
        }
      }, 4, 1)),
      ceil: matT(cTex(128, 128, (ctx) => {
        ctx.fillStyle = '#171209'; ctx.fillRect(0, 0, 128, 128);
        ctx.strokeStyle = 'rgba(201,162,39,0.12)'; ctx.lineWidth = 2;
        ctx.strokeRect(8, 8, 112, 112); ctx.strokeRect(28, 28, 72, 72);
        ctx.beginPath(); ctx.arc(64, 64, 18, 0, 7); ctx.stroke();
      }, 6, 12)),
      skirtC: 0x0d0a06
    });
    placardStand(room, -(room.W / 2 - 1.6), S.z0 - 2.6, 0.5);
    // ---- stage (offset left) ----
    const stageX = -room.W / 2 + 3.1;
    const stage = B(5.2, 0.5, 3.2, matT(woodTex('#4a3a22', '#3a2d18')));
    stage.position.set(stageX, 0.25, S.z1 + 2.1);
    const curtain = P(5.4, room.H - 0.7, curtainTex('#7a1520', '#3a0a10'));
    curtain.position.set(stageX, (room.H - 0.7) / 2 + 0.5, S.z1 + 0.55);
    scene.add(stage, curtain);
    colliders.push({ x: stageX, z: S.z1 + 2.1, r: 2.9 });
    // clarinettist, hands actually on the instrument
    const clarman = placePerson({ top: 0x1a1a22, bottom: 0x1a1a22, hat: 'fedora', skin: 0x9a6a48, tie: true, y: 0.5 },
      stageX - 0.7, S.z1 + 2.2, 0.35, 'clarinet');
    (function () {
      const cp = clarman.userData.parts;
      const clG = new THREE.Group();
      const body2 = Cyl(0.016, 0.019, 0.5, 0x14100c, 10); body2.position.y = -0.25; clG.add(body2);
      const bell2 = Cyl(0.045, 0.02, 0.07, 0x14100c, 10); bell2.position.y = -0.53; clG.add(bell2);
      for (let k = 0; k < 5; k++) { const key = Sph(0.007, 0xc8ccd2, 6); key.position.set(0.014, -0.12 - k * 0.07, 0.008); clG.add(key); }
      clG.position.set(0, -0.06, 0.1); clG.rotation.x = -0.55; // angled forward, bell clear of the chest
      cp.head.add(clG);
      // hands TRACK the tube every frame — wherever the bell swings, the grip follows
      const gripA = new THREE.Object3D(); gripA.position.set(0.015, -0.16, 0.02); clG.add(gripA);
      const gripB = new THREE.Object3D(); gripB.position.set(-0.015, -0.32, 0.02); clG.add(gripB);
      registerArmSolver(clarman, 0, gripA, new THREE.Vector3(-0.75, -0.45, 0.35));
      registerArmSolver(clarman, 1, gripB, new THREE.Vector3(0.75, -0.45, 0.35));
      cp.arms.forEach(a => {
        a.wrist.rotation.x = 0.35; a.wristLock = true;
        a.fingers.rotation.x = -1.0;
      });
    })();
    // singer, visibly singing
    const singer = placePerson({ skirt: 0x6a1025, top: 0x6a1025, hairStyle: 'long', hair: 0x150d08, skin: 0x8a5a3a, lipstick: true, y: 0.5 },
      stageX + 0.6, S.z1 + 2.3, 0.1, 'sing');
    singer.userData.parts.arms[1].sh.rotation.x = -1.15;
    singer.userData.parts.arms[1].el.rotation.x = -0.4;
    stageSinger = singer;
    const mp = Cyl(0.02, 0.03, 1.5, 0x777777); mp.position.set(stageX + 0.85, 1.25, S.z1 + 2.5);
    const mh = Sph(0.06, 0x333333); mh.position.set(stageX + 0.85, 2.0, S.z1 + 2.5);
    scene.add(mp, mh);
    // drummer + small kit — set well in front of the curtain so the whole band reads
    (function () {
      const kx = stageX - 1.9, kz = S.z1 + 1.75, sy = 0.5;
      const bass = Cyl(0.28, 0.28, 0.3, 0x6a1520, 20); bass.rotation.x = Math.PI / 2;
      bass.position.set(kx, sy + 0.28, kz + 0.1);
      const bhead = Cyl(0.27, 0.27, 0.02, 0xe8e0cc, 20); bhead.rotation.x = Math.PI / 2;
      bhead.position.set(kx, sy + 0.28, kz + 0.26);
      const bdot = Cyl(0.09, 0.09, 0.022, 0x8a2030, 14); bdot.rotation.x = Math.PI / 2;
      bdot.position.set(kx, sy + 0.28, kz + 0.265);
      const snare = Cyl(0.13, 0.13, 0.09, 0xd8d0c0, 16); snare.position.set(kx + 0.3, sy + 0.58, kz - 0.02); snare.rotation.z = 0.1;
      const spole = Cyl(0.012, 0.012, 0.55, 0x888888); spole.position.set(kx + 0.3, sy + 0.28, kz - 0.02);
      const hpole = Cyl(0.01, 0.01, 0.85, 0x888888); hpole.position.set(kx - 0.34, sy + 0.42, kz - 0.02);
      const hh1 = Cyl(0.11, 0.11, 0.008, 0xc9a227, 16); hh1.position.set(kx - 0.34, sy + 0.85, kz - 0.02);
      const hh2 = hh1.clone(); hh2.position.y = sy + 0.82;
      const rpole = Cyl(0.01, 0.01, 1.0, 0x888888); rpole.position.set(kx + 0.62, sy + 0.5, kz + 0.12); rpole.rotation.z = -0.15;
      const ride = Cyl(0.16, 0.16, 0.008, 0xd4af37, 18); ride.position.set(kx + 0.69, sy + 1.0, kz + 0.12); ride.rotation.z = 0.2; ride.rotation.x = 0.1;
      const dst = Cyl(0.2, 0.22, 0.1, 0x1a140c, 12); dst.position.set(kx, sy + 0.48, kz - 0.6);
      scene.add(bass, bhead, bdot, snare, spole, hpole, hh1, hh2, rpole, ride, dst);
      // lighter jacket so he reads against the dark stage
      const drummer = placePerson({ seated: true, y: sy + 0.56, top: 0x8a8598, bottom: 0x4a4658, skin: 0xe0b090, hairStyle: 'cap', hair: 0x2a1c10, tie: 0x14100c },
        kx, kz - 0.6, 0, 'drum');
      const dArms = drummer.userData.parts.arms;
      dArms.forEach(a => {
        const stick = Cyl(0.008, 0.008, 0.32, 0xc8a878, 6);
        stick.position.set(0, -0.3, 0.13); stick.rotation.x = -1.42;
        a.el.add(stick);
      });
      // stick hands track strike targets that dip onto the drum heads in time
      const hitL = new THREE.Object3D(); hitL.position.set(kx - 0.3, sy + 1.04, kz - 0.3); scene.add(hitL);
      const hitR = new THREE.Object3D(); hitR.position.set(kx + 0.26, sy + 0.86, kz - 0.32); scene.add(hitR);
      registerArmSolver(drummer, 0, hitL, new THREE.Vector3(-0.85, -0.35, 0.3));
      registerArmSolver(drummer, 1, hitR, new THREE.Vector3(0.85, -0.35, 0.3));
      drummer.userData.hits = { hitL, hitR, hiY: sy + 1.04, snY: sy + 0.86, dip: 0.15 };
      dArms.forEach(a => {
        a.wrist.rotation.x = 0.25; a.wristLock = true;
        a.fingers.rotation.x = -1.2;
      });
      // the stool needs legs
      for (const a2 of [0.5, 2.6, 4.7]) {
        const dl = Cyl(0.018, 0.024, 0.46, 0x14100c, 8);
        dl.position.set(kx + Math.sin(a2) * 0.13, sy + 0.24, kz - 0.6 + Math.cos(a2) * 0.13);
        scene.add(dl);
      }
    })();
    floorPool(stageX, S.z1 + 2.1, 2.8, 'rgba(255,190,90,0.32)');
    lightCone(stageX - 0.7, room.H, S.z1 + 2.2, 1.2, 0xffc060);
    lightCone(stageX + 0.6, room.H, S.z1 + 2.3, 1.2, 0xffc060);
    // gramophone right of door
    const horn = Cyl(0.5, 0.06, 0.9, 0x8a6a20, 20); horn.rotation.z = 2.0;
    horn.position.set(room.W / 2 - 2.0, 1.15, S.z1 + 1.6);
    const hbox = B(0.6, 0.35, 0.6, 0x2c2113); hbox.position.set(room.W / 2 - 2.15, 0.68, S.z1 + 1.6);
    scene.add(horn, hbox);
    contactShadow(room.W / 2 - 2.15, S.z1 + 1.6, 0.6);
    colliders.push({ x: room.W / 2 - 2.15, z: S.z1 + 1.6, r: 0.8 });
    // ---- big rectangular dance floor: 20 dancers in couples ----
    const danceZ = S.z1 + 7.3;
    const parquet = P(8.6, 7.2, matT(woodTex('#4c3a1e', '#3c2e14', true)), true);
    parquet.rotation.x = -Math.PI / 2;
    parquet.position.set(0, 0.013, danceZ);
    const parqTrim = B(8.8, 0.025, 0.12, 0xc9a227); parqTrim.position.set(0, 0.012, danceZ + 3.65);
    const parqTrim2 = parqTrim.clone(); parqTrim2.position.z = danceZ - 3.65;
    scene.add(parquet, parqTrim, parqTrim2);
    floorPool(0, danceZ, 4.4, 'rgba(255,190,100,0.16)');
    lightCone(0, room.H, danceZ - 1.5, 2.0, 0xffc878);
    lightCone(-2, room.H, danceZ + 1.5, 1.8, 0xffc878);
    lightCone(2.2, room.H, danceZ + 0.5, 1.8, 0xffc878);
    const menTops = [0x1c2438, 0x4a3018, 0x3a3a42, 0x2a2a34, 0x33281a, 0x1c2c3c, 0x2c2118, 0x22222c, 0x3c2c1c, 0x2a3038];
    const dressCols = [0x1a6a68, 0x7a1535, 0x50285a, 0x7a5a20, 0x8a3a1a, 0x306048, 0x5a2a5a, 0x1a5a5a, 0x6a1025, 0x8a1a4a];
    const skins = [0xd8a880, 0x9a6a48, 0xc89878, 0xe0b090];
    let jiveCat = null;
    for (let i = 0; i < 10; i++) {
      const cx2 = -3.2 + (i % 5) * 1.62 + rand(-0.2, 0.2);
      const cz2 = danceZ - 1.9 + Math.floor(i / 5) * 3.1 + rand(-0.3, 0.3);
      const fa = rand(0, Math.PI * 2);
      const closed = i % 2 === 0;                     // half the couples dance in closed ballroom hold
      const hold = closed ? 0.34 : 0.45;
      const man = placePerson({
        top: menTops[i], bottom: menTops[i], tie: true, skin: skins[i % 4], dancing: !closed,
        hat: i % 3 ? 'fedora' : null, hatC: menTops[i], moustache: i % 4 === 1, hair: [0x2a1c10, 0x0d0a06, 0x3a2a15, 0x14100c][i % 4]
      }, cx2 + Math.sin(fa) * hold, cz2 + Math.cos(fa) * hold, fa + Math.PI, closed ? 'waltz' : 'dance');
      if (i === 2) jiveCat = man;
      const woman = placePerson({
        skirt: dressCols[i], top: dressCols[i], lipstick: true, skin: skins[(i + 2) % 4], dancing: !closed,
        hairStyle: ['long', 'pony'][i % 2], hair: [0x2a1808, 0x0d0a06, 0x5a3a18, 0x30200a][i % 4],
        hat: i % 2 ? null : 'cloche', hatC: dressCols[i]
      }, cx2 - Math.sin(fa) * hold, cz2 - Math.cos(fa) * hold, fa, closed ? 'waltz' : 'dance');
      if (closed) {
        // closed position: his hand at her waist + hands clasped; her hand on his shoulder
        const mp2 = man.userData.parts, wp2 = woman.userData.parts;
        mp2.arms[1].sh.rotation.x = -0.68; mp2.arms[1].sh.rotation.z = -0.35; mp2.arms[1].el.rotation.x = -0.4;
        mp2.arms[0].sh.rotation.x = -0.6; mp2.arms[0].sh.rotation.z = 0.85; mp2.arms[0].el.rotation.x = -0.5;
        wp2.arms[0].sh.rotation.x = -0.68; wp2.arms[0].sh.rotation.z = 0.35; wp2.arms[0].el.rotation.x = -0.4;
        wp2.arms[1].sh.rotation.x = -0.6; wp2.arms[1].sh.rotation.z = -0.85; wp2.arms[1].el.rotation.x = -0.5;
        waltzers.push({ m: man, w: woman, cx: cx2, cz: cz2, r: hold, ph: rand(0, 6) });
      }
      colliders.push({ x: cx2, z: cz2, r: 0.6 });
    }
    if (jiveCat) makeChatter(jiveCat, 'Hep Cat', [
      'Whatcha know, gate? This combo is solid murder — the skins-man is beatin’ it out!',
      'Say, you’re in the groove now, jack! Get on that floor and cut a rug!',
      'That canary up front? Straight outta heaven. She sends me, no lie.',
      'This joint is jumpin’ tonight, gate. Stick around for the killer-diller!'
    ], { g: 'm', p: 1.05, r: 1.06 });
    // ---- tables with patrons, menus, cocktails ----
    function cocktail(cx, cy, cz, col) {
      const base = Cyl(0.035, 0.035, 0.006, 0xd8d8dc, 10); base.position.set(cx, cy + 0.003, cz);
      const stem = Cyl(0.005, 0.005, 0.09, 0xd8d8dc, 8); stem.position.set(cx, cy + 0.05, cz);
      const cone = Cyl(0.055, 0.005, 0.07, col, 10); cone.position.set(cx, cy + 0.13, cz);
      const olive = Sph(0.012, 0x556b2f, 8); olive.position.set(cx, cy + 0.165, cz);
      scene.add(base, stem, cone, olive);
    }
    const patronPool = [
      [{ top: 0x2c2118, bottom: 0x2c2118, hat: 'fedora', skin: 0xd8a880, moustache: true }, { skirt: 0x1a5a5a, top: 0x1a5a5a, hat: 'cloche', hatC: 0x144444, skin: 0xe0b090, lipstick: true }],
      [{ skirt: 0x5a2a5a, top: 0x5a2a5a, hairStyle: 'long', hair: 0x3a2510, skin: 0xc89878, lipstick: true }, { top: 0x3a3a45, bottom: 0x3a3a45, hat: 'fedora', hatC: 0x2c2c34, skin: 0x9a6a48 }],
      [{ top: 0x4a3520, bottom: 0x4a3520, hat: 'fedora', hatC: 0x3a2a18, skin: 0xd8a880 }, null],
      [{ skirt: 0x7a5a20, top: 0x7a5a20, hat: 'cloche', hatC: 0x5a4418, skin: 0xe0b090, lipstick: true }, { top: 0x22222c, bottom: 0x22222c, hat: 'fedora', hatC: 0x1a1a22, skin: 0xc89878 }],
      [{ top: 0x1c2c3c, bottom: 0x1c2c3c, hat: 'fedora', hatC: 0x142230, tie: true, skin: 0xd8a880 }, { skirt: 0x306048, top: 0x306048, hairStyle: 'long', hair: 0x1a1005, skin: 0xe0b090, lipstick: true }],
      [null, { top: 0x3c2c1c, bottom: 0x3c2c1c, hat: 'fedora', skin: 0x9a6a48, moustache: true }],
      [{ skirt: 0x50285a, top: 0x50285a, hat: 'cloche', hatC: 0x3c1e44, lipstick: true, skin: 0xc89878 }, { top: 0x2a3038, bottom: 0x2a3038, hat: 'fedora', hatC: 0x20262c, tie: true, skin: 0xd8a880 }],
      [{ top: 0x33281a, bottom: 0x33281a, hat: 'fedora', hatC: 0x281e12, tie: true, skin: 0xd8a880 }, { skirt: 0x8a3a1a, top: 0x8a3a1a, hairStyle: 'long', hair: 0x30200a, lipstick: true, skin: 0xe0b090 }]
    ];
    const cockCols = [0xc9822a, 0xa02035, 0x6a9a30, 0xd8c060];
    for (let i = 0; i < 8; i++) {
      const tz = S.z0 - 6.8 - i * 3.35;
      const tx = (i % 2 ? -1 : 1) * rand(1.6, 2.2);
      const cloth = Cyl(0.6, 0.5, 0.1, 0xe8e2d2, 20); cloth.position.set(tx, 0.76, tz);
      const leg = Cyl(0.05, 0.1, 0.74, 0x1a140c); leg.position.set(tx, 0.37, tz);
      scene.add(cloth, leg);
      contactShadow(tx, tz, 0.75);
      colliders.push({ x: tx, z: tz, r: 0.82 });
      const lamp = spr(glowSpot('rgba(255,180,80,0.95)'), 0.5); lamp.position.set(tx, 0.98, tz);
      scene.add(lamp); flickers.push({ s: lamp.material, base: 0.9, amp: 0.1, f: rand(2, 5) });
      const shade2 = Cyl(0.08, 0.12, 0.13, 0xe0b060); shade2.position.set(tx, 0.92, tz); scene.add(shade2);
      // menu card leaning by the lamp
      const menu = P(0.13, 0.19, cTex(64, 96, (ctx) => {
        ctx.fillStyle = '#f0e8d0'; ctx.fillRect(0, 0, 64, 96);
        ctx.strokeStyle = '#8a6a20'; ctx.lineWidth = 3; ctx.strokeRect(3, 3, 58, 90);
        ctx.fillStyle = '#5a3a10'; ctx.font = 'bold 13px Georgia'; ctx.textAlign = 'center';
        ctx.fillText('MENU', 32, 24);
        ctx.font = '8px Georgia';
        ctx.fillText('Sidecar . . 60¢', 32, 44); ctx.fillText('Highball . 50¢', 32, 58);
        ctx.fillText('Martini . . 55¢', 32, 72);
      }));
      menu.position.set(tx + 0.2, 0.9, tz + 0.12);
      menu.rotation.x = -0.35; menu.rotation.y = rand(-0.6, 0.6);
      scene.add(menu);
      const pair = patronPool[i % patronPool.length];
      const both = pair[0] && pair[1];
      for (let k = 0; k < 2; k++) {
        if (!pair[k]) continue;
        const ang = (k ? 1 : -1) * 1.2 + (i % 2 ? 0.5 : -0.5);
        const px2 = tx + Math.sin(ang) * 0.97, pz2 = tz + Math.cos(ang) * 0.97;
        const chair = B(0.42, 0.06, 0.42, 0x241a0f); chair.position.set(px2, 0.5, pz2);
        const cb = B(0.42, 0.5, 0.06, 0x241a0f); cb.position.set(px2 + Math.sin(ang) * 0.24, 0.8, pz2 + Math.cos(ang) * 0.24);
        cb.rotation.y = ang; chair.rotation.y = ang;
        scene.add(chair, cb);
        for (const [ldx, ldz] of [[-0.16, -0.16], [0.16, -0.16], [-0.16, 0.16], [0.16, 0.16]]) {
          const cl3 = B(0.04, 0.5, 0.04, 0x1a1108);
          cl3.position.set(px2 + ldx, 0.25, pz2 + ldz);
          scene.add(cl3);
        }
        // couples talk; singles smoke or drink — everyone is doing something
        const act = both ? 'talk' : (i % 2 ? 'smoke' : 'drink');
        const guest = placePerson(Object.assign({ seated: true, y: 0.53, tie: !pair[k].skirt }, pair[k]), px2, pz2, ang + Math.PI, act);
        if (act === 'drink') {
          const gl2 = Cyl(0.028, 0.022, 0.08, 0xe8ecf0, 8);
          gl2.position.set(0, -0.31, 0.05);
          guest.userData.parts.arms[1].el.add(gl2);
          guest.userData.parts.arms[1].fingers.rotation.x = -1.1; // wrapped around the glass
        } else if (act === 'smoke') {
          // cigarette held between the fingers: paper, tan filter at the near end, ember glowing at the tip
          const cigG = new THREE.Group();
          const paper = Cyl(0.006, 0.006, 0.06, 0xf0ede4, 8); paper.position.y = 0.014; cigG.add(paper);
          const filt = Cyl(0.0062, 0.0062, 0.024, 0xc9945a, 8); filt.position.y = -0.028; cigG.add(filt);
          const ember = spr(glowSpot('rgba(255,120,40,0.95)'), 0.05); ember.position.y = 0.047; cigG.add(ember);
          flickers.push({ s: ember.material, base: 0.7, amp: 0.3, f: rand(1.5, 3) });
          cigG.position.set(0, -0.3, 0.05); cigG.rotation.x = 1.35;
          guest.userData.parts.arms[1].el.add(cigG);
        }
        cocktail(tx + Math.sin(ang) * 0.36, 0.81, tz + Math.cos(ang) * 0.36, cockCols[(i + k) % 4]);
      }
    }
    // the band plays a vocal number — walk near the stage and the singer has a voice
    (function () {
      const vocal = room.albums.find(a => /holiday/i.test(a.artist) && playableSrc(a)) ||
        room.albums.find(a => playableSrc(a));
      // big radius: the band fades in as you approach the dance floor; stage flag drives the setlist
      if (vocal) audioPts.push({ x: stageX, z: S.z1 + 3.2, album: vocal, src: playableSrc(vocal), r: 16, stage: true });
    })();
    // ---- long bar along the right wall ----
    (function () {
      const bx = room.W / 2 - 1.55, bz0 = S.z0 - 4.2, bz1 = S.z0 - 15.8;
      const bl = bz0 - bz1, bzm = (bz0 + bz1) / 2;
      const front = B(0.68, 1.02, bl, matT(woodTex('#41301a', '#332512')));
      front.position.set(bx, 0.51, bzm);
      const top = B(0.9, 0.07, bl + 0.2, matT(woodTex('#1e1913', '#15110c', true)));
      top.position.set(bx, 1.06, bzm);
      const rail = Cyl(0.022, 0.022, bl, 0xc9a227, 8); rail.rotation.x = Math.PI / 2;
      rail.position.set(bx - 0.45, 0.26, bzm);
      scene.add(front, top, rail);
      for (let zz = bz0; zz > bz1; zz -= 1.2) colliders.push({ x: bx, z: zz, r: 0.85 });
      // mirror + shelves + bottles on the wall behind
      const mirror = P(bl, 2.0, cTex(256, 128, (ctx) => {
        const g0 = ctx.createLinearGradient(0, 0, 256, 128);
        g0.addColorStop(0, '#3a3830'); g0.addColorStop(0.5, '#5c584a'); g0.addColorStop(1, '#34322a');
        ctx.fillStyle = g0; ctx.fillRect(0, 0, 256, 128);
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.beginPath(); ctx.moveTo(30, 128); ctx.lineTo(90, 0); ctx.lineTo(130, 0); ctx.lineTo(70, 128); ctx.fill();
      }));
      mirror.position.set(room.W / 2 - 0.04, 2.0, bzm);
      mirror.rotation.y = -Math.PI / 2;
      scene.add(mirror);
      const bottleCols = [0xc9822a, 0x3a7a30, 0x8a2030, 0xd8d0c0, 0x4a5a8a, 0xb8862a];
      for (const sy of [1.55, 2.15]) {
        const shelf = B(0.26, 0.05, bl - 0.5, 0x2a2015);
        shelf.position.set(room.W / 2 - 0.28, sy, bzm);
        scene.add(shelf);
        for (let k = 0; k < 16; k++) {
          const bh = rand(0.2, 0.32);
          const bot = Cyl(0.035, 0.04, bh, bottleCols[Math.floor(rand(0, 6))], 8);
          bot.position.set(room.W / 2 - 0.28 + rand(-0.05, 0.05), sy + 0.025 + bh / 2, bz0 - 0.6 - k * ((bl - 1.4) / 16) + rand(-0.1, 0.1));
          scene.add(bot);
          const neckB = Cyl(0.012, 0.014, 0.08, 0x1a140c, 6);
          neckB.position.set(bot.position.x, sy + 0.025 + bh + 0.04, bot.position.z);
          scene.add(neckB);
        }
      }
      const bgl = spr(glowSpot('rgba(255,200,120,0.35)'), 5); bgl.position.set(room.W / 2 - 0.5, 2.2, bzm);
      scene.add(bgl);
      // three barmen: polisher, shaker, greeter
      const bmX = room.W / 2 - 0.75;
      const gm = room.albums.find(a => /goodman/i.test(a.artist));
      const bh = room.albums.find(a => /holiday/i.test(a.artist));
      const bm1 = placePerson({ top: 0xf0ece0, bottom: 0x14100c, tie: 0x14100c, skin: 0xd8a880, hairStyle: 'cap', hair: 0x2a1c10 },
        bmX, bz0 - 2.2, -Math.PI / 2, 'idle');
      makeChatter(bm1, 'Barman', [
        'What’ll it be, friend? The Sidecar’s the house special — sixty cents.',
        'Easy on the hooch, pal. The night’s young and so’s the band.',
        'We water nothing down here. Well — almost nothing.',
        gm ? 'You want music? ' + gm.artist + ' on the phonograph, right over on the far wall. The King of Swing, no fooling.' : 'The good records are on the far wall, friend.'
      ], { g: 'm', p: 0.92, r: 0.98 });
      // polishing a glass
      bm1.userData.parts.arms[0].sh.rotation.x = -0.7; bm1.userData.parts.arms[0].el.rotation.x = -0.8;
      bm1.userData.parts.arms[1].sh.rotation.x = -0.6; bm1.userData.parts.arms[1].el.rotation.x = -0.95;
      const glass = Cyl(0.03, 0.025, 0.07, 0xdfe4e8, 8);
      glass.position.set(0, -0.3, 0.05); bm1.userData.parts.arms[0].el.add(glass);
      const shaker = placePerson({ top: 0xf0ece0, bottom: 0x14100c, tie: 0x14100c, skin: 0x9a6a48, hairStyle: 'cap', hair: 0x0d0a06, moustache: true },
        bmX, bzm, -Math.PI / 2, 'shake');
      (function () {
        // hand-authored classic pose: shaker up beside the right shoulder, both hands stacked on it
        const cp = shaker.userData.parts;
        // the shaker lives IN the right hand — parented to it, so it can't be anywhere else
        const shk = Cyl(0.045, 0.055, 0.17, 0xc8ccd2, 12);
        shk.position.set(0, -0.045, 0.025); shk.rotation.x = 1.4;
        cp.arms[1].hand.add(shk);           // lives in the right hand
        cp.arms[1].sh.rotation.x = -1.25; cp.arms[1].sh.rotation.z = -0.5; cp.arms[1].el.rotation.x = -1.6;
        // the left hand TRACKS the shaker cap wherever the right hand takes it
        const shkTop = new THREE.Object3D(); shkTop.position.set(0, 0.1, 0); shk.add(shkTop);
        registerArmSolver(shaker, 0, shkTop, new THREE.Vector3(-0.85, -0.35, 0.4));
        cp.arms.forEach(a => { a.wrist.rotation.x = 0.2; a.wristLock = true; a.fingers.rotation.x = -1.2; });
        shaker.userData.ikLock = [true, true];
      })();
      const bm3 = placePerson({ top: 0xf0ece0, bottom: 0x14100c, tie: 0x14100c, skin: 0xc89878, hairStyle: 'cap', hair: 0x3a2a15 },
        bmX, bz1 + 2.0, -Math.PI / 2, 'idle');
      makeChatter(bm3, 'Barman', [
        bh ? 'Hear that voice? That’s ' + bh.artist + '. Sings like she means every word of it — breaks your heart proper.' : 'Some voice on that singer, eh?',
        'Band’s on till two. Nobody leaves before the last number, house rules.',
        'The pianist? Plays for scale and drinks for free. Fair trade, I’d say.'
      ], { g: 'm', p: 0.88, r: 0.96 });
      // bar stools + a customer
      for (let k = 0; k < 4; k++) {
        const sz = bz0 - 1.6 - k * 2.8;
        const pole = Cyl(0.05, 0.06, 0.66, 0x2a2015); pole.position.set(bx - 0.85, 0.33, sz);
        const seat = Cyl(0.24, 0.26, 0.08, 0x6a1520, 14); seat.position.set(bx - 0.85, 0.7, sz);
        scene.add(pole, seat);
        contactShadow(bx - 0.85, sz, 0.3);
      }
      const barfly = placePerson({ seated: true, y: 0.74, top: 0x2a2a34, bottom: 0x2a2a34, hat: 'fedora', tie: true, skin: 0xd8a880 },
        bx - 0.85, bz0 - 4.4, Math.PI / 2, 'drink');
      const gl3 = Cyl(0.028, 0.022, 0.08, 0xe8ecf0, 8);
      gl3.position.set(0, -0.31, 0.05);
      barfly.userData.parts.arms[1].el.add(gl3);
      makeChatter(barfly, 'Man at the bar', [
        'Terrible business with that airship over in Jersey. Makes a fellow glad to keep his feet on the ground.',
        'Roosevelt says the only thing we have to fear is fear itself. I’ll drink to that.',
        'They put a nickel in the jukebox down the street. A machine, playing records! What becomes of clubs like this, I ask you.',
        'Word is Goodman hired Teddy Wilson and Lionel Hampton for his trio. About time somebody did it.'
      ], { g: 'm', p: 0.85, r: 0.94 });
      // cocktails standing on the bar
      cocktail(bx - 0.15, 1.1, bz0 - 3.2, 0xa02035);
      cocktail(bx + 0.1, 1.1, bzm + 1.4, 0xc9822a);
      cocktail(bx - 0.05, 1.1, bz1 + 2.6, 0x6a9a30);
    })();
    // ---- staff on the move: both weave around the tables and pause ----
    const waiter = placeWalker({ top: 0xf0ead8, bottom: 0x14100c, tie: 0x14100c, skin: 0x9a6a48, hairStyle: 'cap', hair: 0x111111 },
      [{ x: 0.3, z: S.z0 - 5.5 }, { x: 0.85, z: S.z0 - 9 }, { x: -0.85, z: S.z0 - 12.4 }, { x: 0.85, z: S.z0 - 15.8 },
       { x: -0.85, z: S.z0 - 19.2 }, { x: 0.85, z: S.z0 - 22.6 }, { x: -0.8, z: S.z0 - 26 }, { x: 0.3, z: S.z0 - 30 }], 0.95);
    waiter.userData.serve = true;
    (function () {
      waiter.userData.lockArms = [false, true];
      const cp = waiter.userData.parts;
      const tray = Cyl(0.17, 0.17, 0.015, 0xd8d8dc, 18);
      tray.position.set(0.3, 0.62, 0.1);
      cp.spine.add(tray);
      // the palm tracks the underside of the tray at all times
      const trayGrip = new THREE.Object3D(); trayGrip.position.set(0, -0.035, 0); tray.add(trayGrip);
      registerArmSolver(waiter, 1, trayGrip, new THREE.Vector3(0.9, -0.3, 0.2));
      cp.arms[1].wrist.rotation.x = -0.35; cp.arms[1].wristLock = true;
      cp.arms[1].fingers.rotation.x = -0.45;
      // he offers a drink when you come near (he stops and faces you already)
      makeChatter(waiter, 'Waiter', [
        'Can I get you a drink, sir? The Sidecar is very good tonight.',
        'Something from the bar? We are rather famous for the Martinis.',
        'A drink for you? Say the word and I will bring it right over.'
      ], { g: 'm', p: 0.95, r: 0.97 });
      for (const [gx2, gz2] of [[0.24, 0.06], [0.35, 0.16]]) {
        const gl2 = Cyl(0.025, 0.02, 0.09, 0xe8ecf0, 8);
        gl2.position.set(gx2, 0.68, gz2);
        cp.spine.add(gl2);
      }
    })();
    // cigarette & sweets girl — showgirl outfit: short flared skirt, dark stockings, opera gloves, heels
    const cigGirl = placeWalker({
      skirt: 0xb01535, shortSkirt: true, top: 0xb01535, legC: 0x2a1e20, gloves: 0xf0e8e0,
      hairStyle: 'pony', hair: 0x2a1808, lipstick: true, skin: 0xe0b090,
      hat: 'cap', hatC: 0x7a1025, shoeC: 0x8a1020, heels: true
    }, [{ x: -0.8, z: S.z0 - 8 }, { x: 0.8, z: S.z0 - 11.2 }, { x: -0.8, z: S.z0 - 14.5 }, { x: 0.8, z: S.z0 - 18 },
        { x: -0.8, z: S.z0 - 21.5 }, { x: 0.8, z: S.z0 - 25 }, { x: -0.7, z: S.z0 - 28.5 }], 0.8);
    (function () {
      cigGirl.userData.lockArms = [true, true];
      const cp = cigGirl.userData.parts;
      const tray = B(0.5, 0.035, 0.3, 0xe8dfc8);
      tray.position.set(0, 0.05, 0.31);
      cp.spine.add(tray);
      const rim2 = B(0.52, 0.05, 0.02, 0xb08d55); rim2.position.set(0, 0.06, 0.46); cp.spine.add(rim2);
      const items = [0xd02030, 0xf0f0e8, 0x2a6a3a, 0xe0a020, 0xf0f0e8, 0xd02030];
      items.forEach((c2, k) => {
        const it = B(0.09, 0.05, 0.06, c2);
        it.position.set(-0.15 + (k % 3) * 0.15, 0.09, 0.25 + Math.floor(k / 3) * 0.11);
        cp.spine.add(it);
      });
      // straps run from her shoulders down to the tray's front corners; hands hold the sides
      for (const s of [-1, 1]) {
        cp.spine.add(link(s * 0.12, 0.5, 0.04, s * 0.22, 0.07, 0.29, 0.011, 0x4a3020));
      }
      // both hands track the tray's side edges
      const gripL = new THREE.Object3D(); gripL.position.set(-0.27, 0.01, 0); tray.add(gripL);
      const gripR = new THREE.Object3D(); gripR.position.set(0.27, 0.01, 0); tray.add(gripR);
      registerArmSolver(cigGirl, 0, gripL, new THREE.Vector3(-0.85, -0.45, 0.3));
      registerArmSolver(cigGirl, 1, gripR, new THREE.Vector3(0.85, -0.45, 0.3));
      cp.arms.forEach(a => {
        a.wrist.rotation.x = -0.25; a.wristLock = true;
        a.fingers.rotation.x = -1.0;
      });
      makeChatter(cigGirl, 'Cigarette Girl', [
        'Cigarettes? Sweets? Chewing gum?',
        'Lucky Strikes, mister — everybody’s smoking ’em.',
        'Chocolates for the lady? Only a dime.',
        'The band takes requests, you know. Slip the drummer a quarter.'
      ], { g: 'f', p: 1.12, r: 1.02 });
    })();
    // wall sconces (left wall along the easels, right wall above the bar)
    for (let i = 0; i < n; i++) {
      const z = S.z0 - 5.2 - i * 2.4 + 1.2;
      const sc = spr(glowSpot('rgba(255,190,100,0.6)'), 1.1);
      sc.position.set(-(room.W / 2 - 0.25), 3.4, z);
      scene.add(sc);
    }
    for (let i = 0; i < 4; i++) {
      const sc = spr(glowSpot('rgba(255,190,100,0.5)'), 1.0);
      sc.position.set(room.W / 2 - 0.25, 3.7, S.z0 - 5 - i * 3.2);
      scene.add(sc);
    }
    // ---- easels, all along the left wall ----
    room.albums.forEach((a, i) => {
      const z = S.z0 - 5.2 - i * 2.4;
      const x = -(room.W / 2 - 1.35);
      const g = new THREE.Group();
      const sl = sleeve(a, 1.15, true, 0x3a2f1c, true);
      // sleeve sits IN FRONT of the easel — the legs never cross the artwork
      sl.position.set(0, 1.5, 0.07); sl.rotation.x = -0.13;
      for (const s2 of [-1, 1]) {
        const leg2 = Cyl(0.03, 0.036, 2.15, 0x2a1f12, 12);
        leg2.position.set(s2 * 0.44, 1.04, -0.04); leg2.rotation.z = s2 * 0.12; leg2.rotation.x = -0.13; g.add(leg2);
      }
      const rear = Cyl(0.028, 0.034, 1.95, 0x241a0e, 12);
      rear.position.set(0, 0.9, -0.44); rear.rotation.x = -0.55; g.add(rear);
      const cross = B(1.0, 0.06, 0.05, 0x2a1f12); cross.position.set(0, 1.4, -0.13); cross.rotation.x = -0.13; g.add(cross);
      const ledge = B(1.02, 0.05, 0.16, 0x241a0e); ledge.position.set(0, 0.83, 0.12); ledge.rotation.x = -0.13; g.add(ledge);
      const pl = plaque(a, 0.85); pl.position.set(0, 0.5, 0.3); pl.rotation.x = -0.3; g.add(pl);
      g.add(sl);
      g.position.set(x, 0, z);
      g.rotation.y = 0.9;
      scene.add(g);
      registerSleeve(g, a, 0);
      contactShadow(x, z, 0.7);
      colliders.push({ x, z, r: 0.7 });
      floorPool(x, z, 1.5, 'rgba(255,200,110,0.22)');
      lightCone(x, room.H, z, 1.0, 0xffce80);
    });
    // ---- glamour: carpet, columns, grand chandelier, sofas, palms, society groups ----
    (function () {
      // red carpet runner up the aisle
      const runZ0 = S.z0 - 0.6, runZ1 = danceZ + 3.8;
      const runner = P(1.7, runZ0 - runZ1, cTex(64, 512, (ctx) => {
        ctx.fillStyle = '#5a1020'; ctx.fillRect(0, 0, 64, 512);
        ctx.fillStyle = '#c9a227'; ctx.fillRect(0, 0, 4, 512); ctx.fillRect(60, 0, 4, 512);
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        for (let i = 0; i < 300; i++) ctx.fillRect(rand(4, 60), rand(0, 512), 2, 2);
      }, 1, 8));
      runner.rotation.x = -Math.PI / 2;
      runner.position.set(0, 0.016, (runZ0 + runZ1) / 2);
      scene.add(runner);
      // fluted columns with uplights
      for (const cz of [S.z0 - 6, S.z0 - 14, S.z0 - 22, S.z0 - 30]) {
        for (const sx of [-1, 1]) {
          const colX = sx * (room.W / 2 - 0.5);
          const col = Cyl(0.16, 0.2, room.H - 0.6, matT(cTex(64, 64, (ctx) => {
            ctx.fillStyle = '#9a8a5e'; ctx.fillRect(0, 0, 64, 64);
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            for (let x = 0; x < 64; x += 8) ctx.fillRect(x, 0, 3, 64);
          }, 2, 1)), 20);
          col.position.set(colX, (room.H - 0.6) / 2 + 0.15, cz);
          const base2 = B(0.5, 0.15, 0.5, 0x6a5c3a); base2.position.set(colX, 0.075, cz);
          const cap2 = B(0.46, 0.12, 0.46, 0x6a5c3a); cap2.position.set(colX, room.H - 0.4, cz);
          scene.add(col, base2, cap2);
          floorPool(colX, cz, 0.9, 'rgba(255,210,130,0.3)');
          colliders.push({ x: colX, z: cz, r: 0.42 });
        }
      }
      // grand tiered chandelier over the dance floor
      const chG = new THREE.Group();
      const stem2 = Cyl(0.03, 0.03, 1.0, 0x8a6a20); stem2.position.y = 0.5; chG.add(stem2);
      [[1.15, 0], [0.78, -0.35], [0.42, -0.65]].forEach(([rr, dy]) => {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(rr, 0.035, 12, 44), matC(0x8a6a20));
        ring.rotation.x = Math.PI / 2; ring.position.y = dy; chG.add(ring);
        const nb = Math.round(rr * 10);
        for (let k = 0; k < nb; k++) {
          const a = k / nb * Math.PI * 2;
          const bulb = spr(glowSpot('rgba(255,215,140,0.95)'), 0.34);
          bulb.position.set(Math.sin(a) * rr, dy + 0.09, Math.cos(a) * rr);
          chG.add(bulb);
          flickers.push({ s: bulb.material, base: 0.85, amp: 0.08, f: rand(2, 5) });
        }
      });
      chG.position.set(0, room.H - 0.55, danceZ);
      scene.add(chG);
      const chGlow = spr(glowSpot('rgba(255,210,130,0.4)'), 5.5); chGlow.position.set(0, room.H - 1.1, danceZ);
      scene.add(chGlow);
      // swagged valance across the stage top
      const valance = P(5.6, 0.55, cTex(512, 64, (ctx) => {
        ctx.fillStyle = '#5a0e18'; ctx.fillRect(0, 0, 512, 64);
        ctx.fillStyle = '#7a1520';
        for (let x = 0; x < 512; x += 64) { ctx.beginPath(); ctx.arc(x + 32, 0, 32, 0, Math.PI); ctx.fill(); }
        ctx.fillStyle = '#c9a227';
        for (let x = 0; x < 512; x += 64) ctx.fillRect(x + 28, 50, 8, 14);
      }));
      valance.position.set(stageX, room.H - 0.85, S.z1 + 0.62);
      scene.add(valance);
      // velvet chesterfield sofas with gold piping
      function sofa(x, z, ry) {
        const gS = new THREE.Group();
        const seat = B(2.0, 0.34, 0.8, 0x6a1220); seat.position.y = 0.38; gS.add(seat);
        const backC = Cyl(0.3, 0.3, 2.0, 0x6a1220, 22); backC.rotation.z = Math.PI / 2;
        backC.position.set(0, 0.78, -0.32); gS.add(backC);
        for (const s of [-1, 1]) {
          const armR = Sph(0.26, 0x5a0e1b, 20); armR.position.set(s * 0.95, 0.52, 0); armR.scale.set(0.8, 1, 1.3); gS.add(armR);
        }
        for (let k = 0; k < 5; k++) { const btn = Sph(0.02, 0xc9a227, 8); btn.position.set(-0.7 + k * 0.35, 0.82, -0.1); gS.add(btn); }
        for (const px3 of [-0.55, 0.55]) {
          const cush = B(0.8, 0.1, 0.62, 0x7a1a2c); cush.position.set(px3, 0.58, 0.05); cush.rotation.y = rand(-0.05, 0.05); gS.add(cush);
        }
        for (const [lx3, lz3] of [[-0.9, 0.32], [0.9, 0.32], [-0.9, -0.32], [0.9, -0.32]]) {
          const leg3 = Cyl(0.03, 0.045, 0.22, 0xc9a227, 10); leg3.position.set(lx3, 0.11, lz3); gS.add(leg3);
        }
        gS.position.set(x, 0, z); gS.rotation.y = ry;
        scene.add(gS);
        contactShadow(x, z, 1.3);
        colliders.push({ x, z, r: 1.25 });
      }
      sofa(-3.6, S.z0 - 11.8, 1.05);
      sofa(-3.6, S.z0 - 24.5, 0.85);
      // couple lounging on the first sofa — seated on the cushions, facing out into the room
      (function () {
        const sx = -3.6, sz = S.z0 - 11.8, sry = 1.05;
        const seatAt = (lx, lz) => ({
          x: sx + lx * Math.cos(sry) + lz * Math.sin(sry),
          z: sz - lx * Math.sin(sry) + lz * Math.cos(sry)
        });
        const p1 = seatAt(-0.5, 0.12), p2 = seatAt(0.5, 0.12);
        placePerson({ seated: true, y: 0.66, skirt: 0x2a4a6a, top: 0x2a4a6a, hairStyle: 'long', hair: 0x1a1005, lipstick: true, skin: 0xe0b090 },
          p1.x, p1.z, sry + 0.25, 'talk');
        placePerson({ seated: true, y: 0.66, top: 0x22222a, bottom: 0x22222a, tie: true, hairStyle: 'cap', hair: 0x2a1c10, skin: 0xd8a880 },
          p2.x, p2.z, sry - 0.25, 'drink');
      })();
      // champagne stand by the sofa
      const chx = -2.55, chz = S.z0 - 11.0;
      const tri = Cyl(0.02, 0.14, 0.75, 0xc8ccd2, 12); tri.position.set(chx, 0.375, chz);
      const buck = Cyl(0.14, 0.1, 0.2, 0xd8dce2, 18); buck.position.set(chx, 0.82, chz);
      const champ = Cyl(0.035, 0.045, 0.24, 0x1a3a1a, 12); champ.position.set(chx + 0.05, 0.97, chz); champ.rotation.z = 0.5;
      scene.add(tri, buck, champ);
      contactShadow(chx, chz, 0.25);
      colliders.push({ x: chx, z: chz, r: 0.3 });
      // potted palms
      function palm2(x, z) {
        const pot = Cyl(0.22, 0.16, 0.3, 0x7a5a2a, 16); pot.position.set(x, 0.15, z);
        const trunk = Cyl(0.04, 0.06, 0.9, 0x6a4a20, 10); trunk.position.set(x, 0.75, z);
        scene.add(pot, trunk);
        for (let k = 0; k < 7; k++) {
          const a = k / 7 * Math.PI * 2;
          const leaf = P(0.16, 1.0, matC(0x2a5a2a), true);
          leaf.position.set(x + Math.sin(a) * 0.35, 1.5, z + Math.cos(a) * 0.35);
          leaf.rotation.y = a; leaf.rotation.x = 0.9;
          scene.add(leaf);
        }
        contactShadow(x, z, 0.35);
        colliders.push({ x, z, r: 0.35 });
      }
      palm2(-room.W / 2 + 0.7, S.z0 - 1.2);
      palm2(room.W / 2 - 3.3, S.z0 - 1.0);
      palm2(-room.W / 2 + 0.8, S.z1 + 10.2);
      // knots of standing guests deep in conversation
      [{ x: 2.6, z: S.z0 - 7.2 }, { x: -2.9, z: S.z0 - 27.5 }].forEach((gd, gi) => {
        const cfgs = [
          { top: 0x26262e, bottom: 0x26262e, hat: 'fedora', tie: true, skin: 0xd8a880 },
          { skirt: [0x7a1535, 0x1a5a6a][gi], top: [0x7a1535, 0x1a5a6a][gi], hairStyle: 'long', hair: 0x2a1808, lipstick: true, skin: 0xe0b090 },
          { top: 0x3c2c1c, bottom: 0x3c2c1c, hat: 'fedora', hatC: 0x2c2014, tie: true, moustache: gi === 0, skin: 0x9a6a48 }
        ];
        cfgs.forEach((c2, k) => {
          const a = k / 3 * Math.PI * 2 + gi;
          placePerson(c2, gd.x + Math.sin(a) * 0.62, gd.z + Math.cos(a) * 0.62, a + Math.PI, 'talk');
        });
        colliders.push({ x: gd.x, z: gd.z, r: 0.95 });
      });
      // a society lady with opinions (female voice)
      const lady = placePerson({ skirt: 0x8a6a1a, top: 0x8a6a1a, hairStyle: 'long', hair: 0x30200a, lipstick: true, skin: 0xe0b090 },
        2.0, S.z0 - 26.2, -0.6, 'talk');
      makeChatter(lady, 'Society Lady', [
        'Isn’t the band simply divine? We’ve been here every Friday since spring.',
        'They say the trumpet player once sat in with Ellington. I believe every word.',
        'Darling, the Lindy Hop is all anyone does now. Even the mayor tries it.'
      ], { g: 'f', p: 1.08, r: 0.98 });
    })();
    addDust(S.z0 - 3, S.z1 + 3, room.W, room.H, 110, 0xffdda0);
    Z = S.z1;
    return S;
  }

  // ================= EXTRA DRESSING =================
  const dress = {
    club(S, room) {
      // grand piano on stage (stage top is at y=0.5) — solid: closed body, keybed, propped lid
      const px = -room.W / 2 + 4.6, pz = S.z1 + 2.4;
      const pbody = B(1.5, 0.32, 1.0, 0x0c0a08); pbody.position.set(px, 1.35, pz);
      const pInner = B(1.42, 0.06, 0.92, 0x1c1610); pInner.position.set(px, 1.52, pz); scene.add(pInner);
      const keybed = B(1.36, 0.09, 0.34, 0x0c0a08); keybed.position.set(px, 1.19, pz + 0.53); scene.add(keybed);
      const lid = B(1.42, 0.025, 0.95, 0x14100c);
      lid.position.set(px, 1.8, pz - 0.1); lid.rotation.x = -0.85;
      const lidProp = Cyl(0.014, 0.014, 0.62, 0x2a2018, 8);
      lidProp.position.set(px + 0.5, 1.72, pz - 0.28); lidProp.rotation.x = 0.5; scene.add(lidProp);
      const keys2 = P(1.3, 0.13, cTex(256, 24, (ctx) => {
        ctx.fillStyle = '#e8e4d8'; ctx.fillRect(0, 0, 256, 24);
        ctx.fillStyle = '#111';
        for (let x = 4; x < 256; x += 14) { ctx.fillRect(x, 0, 2, 24); if ((x / 14) % 7 !== 3) ctx.fillRect(x + 4, 0, 6, 13); }
      }));
      keys2.rotation.x = -Math.PI / 2; keys2.position.set(px, 1.23, pz + 0.55);
      for (const [lx, lz] of [[-0.6, -0.4], [0.6, -0.4], [0, 0.45]]) {
        const pleg = Cyl(0.045, 0.05, 0.7, 0x0c0a08); pleg.position.set(px + lx, 0.85, pz + lz); scene.add(pleg);
      }
      scene.add(pbody, lid, keys2);
      colliders.push({ x: px, z: pz, r: 1.1 });
      // pianist on a stool — with legs down to the stage
      const stool = Cyl(0.22, 0.24, 0.12, 0x1a140c, 14); stool.position.set(px, 1.0, pz + 1.0);
      scene.add(stool);
      for (const [lx4, lz4] of [[-0.15, -0.15], [0.15, -0.15], [-0.15, 0.15], [0.15, 0.15]]) {
        const sl3 = Cyl(0.02, 0.026, 0.46, 0x14100c, 8);
        sl3.position.set(px + lx4, 0.72, pz + 1.0 + lz4);
        scene.add(sl3);
      }
      const pianist = placePerson({ seated: true, y: 1.06, top: 0x14141c, bottom: 0x14141c, tie: true, skin: 0xc89878, hairStyle: 'cap', hair: 0x0d0a06 },
        px, pz + 1.0, Math.PI, 'piano');
      for (const a of pianist.userData.parts.arms) { a.sh.rotation.x = -0.72; a.el.rotation.x = -0.5; }
      // brass music stand at the side of the stage (the leaning double bass read badly)
      const bx = -room.W / 2 + 1.1, bz = S.z1 + 1.4;
      const msPole = Cyl(0.015, 0.02, 0.95, 0xc9a227, 10); msPole.position.set(bx, 0.98, bz);
      const msPlate = P(0.4, 0.3, 0x1a140c); msPlate.position.set(bx, 1.55, bz + 0.03); msPlate.rotation.x = -0.4;
      const msSheet = P(0.3, 0.2, 0xf0ead8); msSheet.position.set(bx, 1.56, bz + 0.048); msSheet.rotation.x = -0.4;
      scene.add(msPole, msPlate, msSheet);
      contactShadow(bx, bz, 0.3);
      // chandeliers
      for (const cz of [S.z0 - 8, S.zm - 2]) {
        const stem = Cyl(0.02, 0.02, 0.5, 0x8a6a20); stem.position.set(0, room.H - 0.25, cz);
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.03, 8, 20), matC(0x8a6a20));
        ring.rotation.x = Math.PI / 2; ring.position.set(0, room.H - 0.55, cz);
        scene.add(stem, ring);
        for (let k = 0; k < 6; k++) {
          const a = k * Math.PI / 3;
          const c0 = spr(glowSpot('rgba(255,200,110,0.9)'), 0.35);
          c0.position.set(Math.sin(a) * 0.4, room.H - 0.48, cz + Math.cos(a) * 0.4);
          scene.add(c0);
          flickers.push({ s: c0.material, base: 0.85, amp: 0.1, f: rand(2, 6) });
        }
      }
      // haze sheets under the cones
      for (let i = 0; i < 3; i++) {
        const hz = spr(glowSpot('rgba(255,220,160,0.06)'), 7);
        hz.position.set(0, 2.4, S.z0 - 8 - i * 7);
        scene.add(hz);
      }
      // framed b/w photos high on the left wall (the right wall is the bar's)
      for (let i = 0; i < 6; i++) {
        const side = -1;
        const ph = P(0.5, 0.62, cTex(64, 80, (ctx) => {
          const g0 = ctx.createLinearGradient(0, 0, 0, 80);
          g0.addColorStop(0, '#666'); g0.addColorStop(1, '#222');
          ctx.fillStyle = g0; ctx.fillRect(0, 0, 64, 80);
          ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(32, 34, 13, 0, 7); ctx.fill();
          ctx.fillRect(16, 46, 32, 34);
          ctx.strokeStyle = '#c9a227'; ctx.lineWidth = 4; ctx.strokeRect(1, 1, 62, 78);
        }));
        ph.position.set(side * (room.W / 2 - 0.05), 4.1, S.z0 - 6 - i * 4.4);
        ph.rotation.y = side < 0 ? Math.PI / 2 : -Math.PI / 2;
        scene.add(ph);
      }
    },
    jukebox(S, room) {
      // menu board above counter
      const menu = P(2.4, 1.1, cTex(512, 236, (ctx) => {
        ctx.fillStyle = '#18120c'; ctx.fillRect(0, 0, 512, 236);
        ctx.strokeStyle = '#d8b040'; ctx.lineWidth = 5; ctx.strokeRect(6, 6, 500, 224);
        ctx.fillStyle = '#f0e8d0'; ctx.textAlign = 'center'; ctx.font = 'bold 40px Georgia';
        ctx.fillText('— MENU —', 256, 52);
        ctx.font = '28px Georgia'; ctx.textAlign = 'left';
        const items = [['MALT SHAKE', '25¢'], ['CHEESEBURGER', '30¢'], ['CHERRY COLA', '10¢'], ['APPLE PIE', '15¢']];
        items.forEach(([n, p0], i) => {
          ctx.fillText(n, 60, 100 + i * 34);
          ctx.textAlign = 'right'; ctx.fillText(p0, 452, 100 + i * 34); ctx.textAlign = 'left';
        });
      }));
      menu.position.set(-room.W / 2 + 0.06, 3.3, S.zm + 1);
      menu.rotation.y = Math.PI / 2;
      scene.add(menu);
      // milkshakes on counter + booth
      for (const [mx, mz] of [[-room.W / 2 + 1.6, S.zm - 1.4], [-room.W / 2 + 1.6, S.z0 - 6], [room.W / 2 - 1.35, S.z0 - 7.4]]) {
        const glass = Cyl(0.05, 0.035, 0.16, 0xf0f0f5); glass.position.set(mx, 1.1, mz);
        const cream = Sph(0.05, 0xfff4f6); cream.position.set(mx, 1.2, mz);
        const straw = Cyl(0.008, 0.008, 0.18, 0xd04050); straw.position.set(mx + 0.02, 1.28, mz); straw.rotation.z = 0.25;
        if (mz === S.z0 - 7.4) { glass.position.y = 0.9; cream.position.y = 1.0; straw.position.y = 1.08; }
        scene.add(glass, cream, straw);
      }
      // TWIST NIGHT poster
      const tw = P(0.8, 1.1, cTex(160, 220, (ctx) => {
        ctx.fillStyle = '#f0e8d0'; ctx.fillRect(0, 0, 160, 220);
        ctx.fillStyle = '#d02030'; ctx.font = 'bold 30px Georgia'; ctx.textAlign = 'center';
        ctx.fillText('TWIST', 80, 60); ctx.fillText('NIGHT', 80, 95);
        ctx.fillStyle = '#1a1a2a'; ctx.font = '20px Georgia';
        ctx.fillText('FRIDAY 8PM', 80, 140);
        ctx.fillText('FREE ENTRY', 80, 170);
        ctx.strokeStyle = '#d02030'; ctx.lineWidth = 6; ctx.strokeRect(4, 4, 152, 212);
      }));
      tw.position.set(room.W / 2 - 0.05, 2.6, S.z0 - 4.6);
      tw.rotation.y = -Math.PI / 2; tw.rotation.z = 0.03;
      scene.add(tw);
      // coat rack by the door
      const cr = Cyl(0.03, 0.05, 1.8, 0x8a4a20); cr.position.set(room.W / 2 - 0.6, 0.9, S.z0 - 1.2);
      scene.add(cr);
      for (let k = 0; k < 3; k++) {
        const hook = Sph(0.035, 0x5a3010); hook.position.set(room.W / 2 - 0.6 + Math.sin(k * 2.1) * 0.12, 1.65, S.z0 - 1.2 + Math.cos(k * 2.1) * 0.12);
        scene.add(hook);
      }
      const coat = B(0.34, 0.5, 0.1, 0x8a2a2a); coat.position.set(room.W / 2 - 0.72, 1.35, S.z0 - 1.2); scene.add(coat);
      contactShadow(room.W / 2 - 0.6, S.z0 - 1.2, 0.35);
    },
    shop(S, room) {
      // crates of overflow records on the floor
      for (const [cx, cz, rot] of [[-2.2, S.z0 - 10.4, 0.3], [2.3, S.z0 - 13, -0.2], [-2.4, S.z0 - 15.6, 0.1]]) {
        const crate = B(0.8, 0.35, 0.55, matT(woodTex('#6a5230', '#54401f')));
        crate.position.set(cx, 0.18, cz); crate.rotation.y = rot;
        scene.add(crate);
        for (let k = 0; k < 7; k++) {
          const rec = B(0.02, 0.5, 0.5, [0xd23b52, 0x3178b0, 0x222222, 0xe0a020, 0x3f9950, 0x772299, 0xbbbbbb][k]);
          rec.position.set(cx - 0.28 + k * 0.09, 0.42, cz);
          rec.rotation.y = rot; rec.rotation.z = rand(-0.06, 0.06);
          scene.add(rec);
        }
        contactShadow(cx, cz, 0.6);
        colliders.push({ x: cx, z: cz, r: 0.7 });
      }
      // listening post on the right wall
      const lx = room.W / 2 - 0.45, lz = S.zm - 3;
      const post = Cyl(0.03, 0.04, 1.6, 0x333333); post.position.set(lx, 0.8, lz);
      const hband = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.02, 8, 14, Math.PI), matC(0x222228));
      hband.position.set(lx, 1.62, lz);
      for (const s of [-1, 1]) { const cup = Sph(0.05, 0x222228); cup.position.set(lx + s * 0.12, 1.58, lz); scene.add(cup); }
      const lsign = P(0.7, 0.28, cTex(256, 100, (ctx) => {
        ctx.fillStyle = '#f5e9b8'; ctx.fillRect(0, 0, 256, 100);
        ctx.fillStyle = '#2a2418'; ctx.textAlign = 'center'; ctx.font = 'italic 26px Georgia';
        ctx.fillText('listen before', 128, 40); ctx.fillText('you buy!', 128, 74);
      }));
      lsign.position.set(room.W / 2 - 0.06, 2.2, lz); lsign.rotation.y = -Math.PI / 2;
      scene.add(post, hband, lsign);
      contactShadow(lx, lz, 0.3);
      // magazine rack near the counter
      const mx = -room.W / 2 + 0.35, mz = S.z0 - 5.6;
      for (let k = 0; k < 4; k++) {
        const mag = P(0.3, 0.4, cTex(64, 84, (ctx) => {
          ctx.fillStyle = ['#e02040', '#2060c0', '#111111', '#e0a020'][k]; ctx.fillRect(0, 0, 64, 84);
          ctx.fillStyle = '#fff'; ctx.font = 'bold 13px Georgia'; ctx.textAlign = 'center';
          ctx.fillText(['NME', 'SOUNDS', 'ZigZag', 'MelodyM'][k], 32, 20);
          ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(8, 30, 48, 44);
        }));
        mag.position.set(mx + 0.02, 1.5 - Math.floor(k / 2) * 0.55, mz + (k % 2) * 0.4);
        mag.rotation.y = Math.PI / 2; mag.rotation.x = -0.12;
        scene.add(mag);
      }
      const rack = B(0.06, 1.3, 1.0, 0x2a2118); rack.position.set(mx - 0.04, 1.05, mz + 0.2); scene.add(rack);
    },
    neon(S, room) {
      // mirrorball + floor sparkles
      const mbz = S.zm + 1;
      const ball = Sph(0.42, 0xd8d8e0, 10);
      const facets = cTex(128, 128, (ctx) => {
        for (let x = 0; x < 128; x += 12) for (let y = 0; y < 128; y += 12) {
          ctx.fillStyle = 'hsl(220,10%,' + rand(45, 90) + '%)';
          ctx.fillRect(x, y, 11, 11);
        }
      }, 2, 1);
      ball.material = matT(facets);
      ball.position.set(0, room.H - 0.9, mbz);
      const stem2 = Cyl(0.015, 0.015, 0.5, 0x333333); stem2.position.set(0, room.H - 0.35, mbz);
      scene.add(ball, stem2);
      bobbers.push({ g: ball, spin: 0.6, y: 0, ph: 0 });
      const bglow = spr(glowSpot('rgba(220,225,255,0.5)'), 2.4); bglow.position.copy(ball.position);
      scene.add(bglow);
      for (let k = 0; k < 12; k++) {
        const a = k * Math.PI / 6;
        const sp0 = floorPool(Math.sin(a) * rand(1.5, 4), mbz + Math.cos(a) * rand(1.5, 4), 0.28, 'rgba(200,210,255,0.4)');
        flickers.push({ s: sp0.material, base: 0.6, amp: 0.4, f: rand(3, 8) });
      }
      // cassette wall display
      const cw = new THREE.Group();
      for (let r0 = 0; r0 < 4; r0++) for (let c0 = 0; c0 < 6; c0++) {
        const cas = B(0.28, 0.18, 0.05, [0xff2d95, 0x22d3ee, 0xa3e635, 0xc084fc, 0xffb400, 0xff6040][(r0 * 6 + c0) % 6]);
        cas.position.set(c0 * 0.34, r0 * 0.24, 0);
        cw.add(cas);
        const lbl = P(0.2, 0.09, 0xf0f0e0); lbl.position.set(c0 * 0.34, r0 * 0.24, 0.028); cw.add(lbl);
      }
      cw.position.set(room.W / 2 - 0.1, 1.6, S.z0 - 16.5);
      cw.rotation.y = -Math.PI / 2;
      scene.add(cw);
      const ct = P(1.6, 0.3, cTex(512, 96, (ctx) => {
        ctx.fillStyle = '#22d3ee'; ctx.textAlign = 'center';
        fitText(ctx, 'HOME TAPING IS KILLING MUSIC', 256, 60, 480, 40);
      }));
      ct.position.set(room.W / 2 - 0.08, 2.75, S.z0 - 15.7); ct.rotation.y = -Math.PI / 2;
      scene.add(ct);
      // velvet rope near entrance
      for (const [px2, pz2] of [[-1.4, S.z0 - 2.2], [-2.6, S.z0 - 3.4]]) {
        const pole2 = Cyl(0.035, 0.035, 1.0, 0xc8ccd2); pole2.position.set(px2, 0.5, pz2);
        const knob = Sph(0.06, 0xc8ccd2); knob.position.set(px2, 1.02, pz2);
        scene.add(pole2, knob);
        contactShadow(px2, pz2, 0.25);
      }
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-1.4, 0.95, S.z0 - 2.2),
        new THREE.Vector3(-2.0, 0.7, S.z0 - 2.8),
        new THREE.Vector3(-2.6, 0.95, S.z0 - 3.4));
      const rope = new THREE.Mesh(new THREE.TubeGeometry(curve, 12, 0.03, 6), matC(0xa01838));
      scene.add(rope);
      colliders.push({ x: -2.0, z: S.z0 - 2.8, r: 0.8 });
    },
    bedroom(S, room) {
      // desk with CRT computer, keyboard, swivel chair
      const dx = room.W / 2 - 1.3, dz = S.z0 - 8.2;
      const desk = B(1.6, 0.06, 0.75, 0x54406a); desk.position.set(dx, 0.72, dz);
      for (const [lx2, lz2] of [[-0.72, -0.3], [0.72, -0.3], [-0.72, 0.3], [0.72, 0.3]]) {
        const dleg = Cyl(0.03, 0.03, 0.72, 0x3a2c50); dleg.position.set(dx + lx2, 0.36, dz + lz2); scene.add(dleg);
      }
      const crt = B(0.55, 0.5, 0.5, 0xd8d2c0); crt.position.set(dx - 0.25, 1.0, dz); crt.rotation.y = -Math.PI / 2 + 0.3;
      const crtScr = P(0.4, 0.32, cTex(128, 96, (ctx) => {
        ctx.fillStyle = '#101838'; ctx.fillRect(0, 0, 128, 96);
        ctx.fillStyle = '#88e0a0'; ctx.font = '10px monospace';
        ctx.fillText('C:\\> winamp.exe', 8, 20);
        ctx.fillStyle = '#e0a030'; ctx.fillRect(8, 34, 112, 12);
        ctx.fillStyle = '#88e0a0';
        for (let k = 0; k < 14; k++) ctx.fillRect(8 + k * 8, 60 + Math.sin(k) * 8, 5, 18);
      }));
      crtScr.position.set(0, 0.02, 0.26); crt.add(crtScr);
      const kb = B(0.42, 0.03, 0.16, 0xc8c2b0); kb.position.set(dx + 0.3, 0.77, dz + 0.12); kb.rotation.y = 0.2;
      scene.add(desk, crt, kb);
      contactShadow(dx, dz, 1.0);
      colliders.push({ x: dx, z: dz, r: 1.1 });
      const seat2 = Cyl(0.28, 0.28, 0.08, 0x22222c, 16); seat2.position.set(dx - 0.2, 0.5, dz + 0.85);
      const spost = Cyl(0.03, 0.03, 0.45, 0x333333); spost.position.set(dx - 0.2, 0.25, dz + 0.85);
      scene.add(seat2, spost);
      // guitar leaning in corner
      const gx = -room.W / 2 + 0.55, gz = S.z1 + 1.1;
      const gbody = Sph(0.24, 0xc03030); gbody.scale.set(0.72, 1, 0.3); gbody.position.set(gx, 0.32, gz);
      const gneck = Cyl(0.022, 0.028, 0.95, 0x2a1c10); gneck.position.set(gx + 0.1, 1.0, gz); gneck.rotation.z = -0.15;
      const ghead = B(0.09, 0.16, 0.03, 0x14100c); ghead.position.set(gx + 0.18, 1.52, gz);
      scene.add(gbody, gneck, ghead);
      contactShadow(gx, gz, 0.35);
      // beanbag
      const bean = Sph(0.55, 0xc06828); bean.scale.set(1, 0.5, 1); bean.position.set(-2.6, 0.26, S.zm + 2.6);
      scene.add(bean);
      contactShadow(-2.6, S.zm + 2.6, 0.7);
      colliders.push({ x: -2.6, z: S.zm + 2.6, r: 0.8 });
      // skateboard by the door
      const sb = B(0.7, 0.03, 0.2, 0xe0a030); sb.position.set(1.6, 0.09, S.z0 - 1.1); sb.rotation.y = 0.5;
      for (const [wx2, wz2] of [[-0.24, -0.07], [0.24, -0.07], [-0.24, 0.07], [0.24, 0.07]]) {
        const wh = Cyl(0.045, 0.045, 0.03, 0xf0f0e8, 10);
        wh.rotation.z = Math.PI / 2;
        wh.position.set(1.6 + wx2 * Math.cos(0.5) + wz2 * Math.sin(0.5), 0.045, S.z0 - 1.1 - wx2 * Math.sin(0.5) + wz2 * Math.cos(0.5));
        scene.add(wh);
      }
      scene.add(sb);
      // corkboard with polaroids
      const cork = P(1.1, 0.8, cTex(220, 160, (ctx) => {
        ctx.fillStyle = '#a8845a'; ctx.fillRect(0, 0, 220, 160);
        ctx.strokeStyle = '#54402a'; ctx.lineWidth = 8; ctx.strokeRect(4, 4, 212, 152);
        for (let k = 0; k < 5; k++) {
          const x = 20 + k * 38 + rand(-6, 6), y = rand(24, 80);
          ctx.save(); ctx.translate(x, y); ctx.rotate(rand(-0.2, 0.2));
          ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 30, 36);
          ctx.fillStyle = ['#6a8ab0', '#b06a6a', '#6ab07a', '#b0a06a', '#8a6ab0'][k]; ctx.fillRect(3, 3, 24, 24);
          ctx.restore();
        }
      }));
      cork.position.set(room.W / 2 - 0.06, 2.3, S.z0 - 8.2);
      cork.rotation.y = -Math.PI / 2;
      scene.add(cork);
    },
    white(S, room) {
      // glass case with iPod on pedestal, centre of the room
      const cx = 0, cz = S.zm - 1;
      const ped = B(0.7, 1.0, 0.7, 0xffffff); ped.position.set(cx, 0.5, cz);
      const caseM = new THREE.MeshBasicMaterial({ color: 0xcfe8f4, transparent: true, opacity: 0.18 });
      const gcase = B(0.6, 0.6, 0.6, caseM); gcase.position.set(cx, 1.32, cz);
      const ipod = B(0.22, 0.36, 0.04, 0xfbfbfb); ipod.position.set(cx, 1.3, cz);
      const wheel = Cyl(0.075, 0.075, 0.012, 0xe4e4e8, 20); wheel.rotation.x = Math.PI / 2;
      wheel.position.set(cx, 1.21, cz + 0.024);
      const ipScr = P(0.14, 0.1, 0xd8e4ea); ipScr.position.set(cx, 1.39, cz + 0.022);
      scene.add(ped, gcase, ipod, wheel, ipScr);
      contactShadow(cx, cz, 0.7);
      colliders.push({ x: cx, z: cz, r: 0.85 });
      // wall lettering
      const let1 = P(3.4, 0.42, new THREE.MeshBasicMaterial({
        map: cTex(1024, 128, (ctx) => {
          ctx.fillStyle = '#555'; ctx.textAlign = 'center';
          fitText(ctx, '1,000 songs in your pocket.', 512, 80, 940, 64, 'italic');
        }), transparent: true
      }));
      let1.position.set(0, 3.4, S.z1 + 0.08);
      scene.add(let1);
      // ceiling track lights
      for (const tz of [S.z0 - 5, S.z0 - 10, S.z1 + 4]) {
        const track = B(0.08, 0.05, 2.4, 0xd0d0d6); track.position.set(0, room.H - 0.08, tz);
        scene.add(track);
        for (const dz2 of [-0.9, 0, 0.9]) {
          const can = Cyl(0.06, 0.08, 0.16, 0xe8e8ec); can.position.set(0, room.H - 0.2, tz + dz2);
          can.rotation.x = 0.4; scene.add(can);
        }
      }
    },
    cloud(S, room) {
      // holographic play button
      const tri = cTex(256, 256, (ctx) => {
        ctx.strokeStyle = 'rgba(140,170,255,0.9)'; ctx.lineWidth = 5;
        ctx.shadowColor = 'rgba(140,170,255,1)'; ctx.shadowBlur = 25;
        ctx.beginPath(); ctx.arc(128, 128, 100, 0, 7); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(100, 78); ctx.lineTo(100, 178); ctx.lineTo(180, 128); ctx.closePath(); ctx.stroke();
      });
      const play = P(1.6, 1.6, new THREE.MeshBasicMaterial({ map: tri, transparent: true, opacity: 0.8, depthWrite: false }), true);
      play.position.set(0, 3.4, S.zm);
      scene.add(play);
      bobbers.push({ g: play, y: 3.4, ph: 3 });
      flickers.push({ s: play.material, base: 0.75, amp: 0.2, f: 1.2 });
      // extra large drifting particles
      addDust(S.z0, S.z1, room.W, room.H, 60, 0xbaccff);
    }
  };

  // ================= BUILD =================
  const builders = { club: buildClub2, jukebox: buildJukebox, shop: buildShop, neon: buildNeon, bedroom: buildBedroom, white: buildWhite, cloud: buildCloud };
  // lobby
  (function () {
    const lf = P(9, 8, matT(woodTex('#2c2115', '#211810', true)), true);
    lf.rotation.x = -Math.PI / 2; lf.position.set(0, 0, 3.6);
    const lc = P(9, 8, matC(0x0a0908), true);
    lc.rotation.x = Math.PI / 2; lc.position.set(0, 5.2, 3.6);
    const lwL = P(8, 5.2, matC(0x14100b), true);
    lwL.rotation.y = Math.PI / 2; lwL.position.set(-4.5, 2.6, 3.6);
    const lwR = lwL.clone(); lwR.position.x = 4.5;
    const back = P(9, 5.5, matC(0x0b0a08), true); back.position.set(0, 2.75, 7.5);
    scene.add(lf, lc, lwL, lwR, back);
    floorPool(0, 2.2, 2.6, 'rgba(255,200,110,0.2)');
    const t = cTex(1024, 560, (ctx) => {
      ctx.fillStyle = '#0d0c0a'; ctx.fillRect(0, 0, 1024, 560);
      ctx.strokeStyle = '#c9a227'; ctx.lineWidth = 8; ctx.strokeRect(18, 18, 988, 524);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#c9a227'; fitText(ctx, 'THE LISTENING ROOMS', 512, 150, 920, 86);
      ctx.fillStyle = '#e8e0d0'; fitText(ctx, 'Seven rooms · ' + albums.length + ' albums · ninety years', 512, 250, 900, 42, 'italic');
      ctx.fillStyle = '#8a8272'; fitText(ctx, 'Walk forward. The music will find you.', 512, 380, 900, 34);
      ctx.fillStyle = '#8a8272'; fitText(ctx, '★ marks a curator’s pick — click any sleeve.', 512, 440, 900, 34);
    });
    const sm = new THREE.MeshBasicMaterial({ map: t }); sm.side = THREE.DoubleSide;
    const sign = P(6.2, 3.4, sm, true); sign.rotation.y = Math.PI; sign.position.set(0, 2.7, 7.4);
    scene.add(sign);
  })();
  // second dressing pass: people, chatters and feature audio applied room by room
  const dress2 = {
    jukebox(S, room) {
      const W = room.W;
      // the jukebox itself carries the room — 50s/60s sides fade in from far off
      const juke = room.albums.find(a => /elvis|supremes|dusty|aretha/i.test(a.artist) && playableSrc(a)) ||
        room.albums.find(a => playableSrc(a));
      if (juke) audioPts.push({ x: W / 2 - 2.0, z: S.z1 + 1.8, album: juke, src: playableSrc(juke), r: 15 });
      // soda jerk behind the counter
      const jerk = placePerson({ top: 0xf5f2e8, bottom: 0xf5f2e8, skin: 0xd8a880, hat: 'cap', hatC: 0xf5f2e8, hairStyle: 'cap', hair: 0x3a2a15 },
        -W / 2 + 0.7, S.zm - 2.2, Math.PI / 2, 'idle');
      makeChatter(jerk, 'Soda Jerk', [
        'What’ll you have? Malt’s a quarter, smiles are free.',
        'Did you see Presley on the Sullivan show? My old man near threw the set out the window.',
        'The kids keep feeding that jukebox. Best investment the boss ever made.'
      ], { g: 'm', p: 0.9, r: 1.02 });
      // waitress on rounds, pausing to serve
      const wtr = placeWalker({ top: 0xf5f0e0, skirt: 0xe888b0, hairStyle: 'pony', hair: 0x5a3a18, lipstick: true, skin: 0xe0b090 },
        [{ x: -W / 2 + 2.8, z: S.z0 - 5 }, { x: W / 2 - 2.2, z: S.z0 - 7.5 }, { x: -W / 2 + 2.8, z: S.zm },
         { x: W / 2 - 2.4, z: S.z0 - 11 }, { x: -W / 2 + 2.8, z: S.z1 + 4 }], 0.85);
      wtr.userData.serve = true;
      makeChatter(wtr, 'Waitress', [
        'Refill, hon?',
        'Cherry cola for booth two, coming right up.',
        'Try the pie. I baked it myself. Well — I unwrapped it myself.'
      ], { g: 'f', p: 1.3, r: 1.05 });
      // teen by the jukebox
      const teen2 = placePerson({ top: 0x14100c, bottom: 0x2a3a5a, hairStyle: 'cap', hair: 0x0d0a06, skin: 0xc89878, dancing: true },
        W / 2 - 3.4, S.z1 + 2.6, 0.7, 'dance');
      makeChatter(teen2, 'Kid at the Jukebox', [
        'This box has every hit in it, Daddy-O!',
        'That’s the new Detroit sound — Motown! It flips me, man.',
        'Play E7! Hound Dog! I got one nickel left and it’s going to the King.'
      ], { g: 'm', p: 1.2, r: 1.15 });
      // second booth with a talking couple and shakes
      const bx = room.W / 2 - 1.35, bz = S.z0 - 11;
      for (const dz of [-1.1, 1.1]) {
        const bench = B(1.5, 0.5, 0.6, 0xc04048); bench.position.set(bx, 0.25, bz + dz);
        const backr = B(1.5, 0.7, 0.14, 0xa83038); backr.position.set(bx, 0.85, bz + dz + (dz > 0 ? 0.25 : -0.25));
        scene.add(bench, backr);
      }
      const tbl = B(1.3, 0.08, 0.9, 0xf0f0ee); tbl.position.set(bx, 0.78, bz);
      const tleg = B(0.12, 0.78, 0.12, 0xbfc4c9); tleg.position.set(bx, 0.39, bz);
      scene.add(tbl, tleg);
      colliders.push({ x: bx, z: bz, r: 1.4 });
      placePerson({ seated: true, y: 0.53, top: 0x2a4a6a, bottom: 0x2a3040, hairStyle: 'cap', hair: 0x2a1c10, skin: 0xd8a880 },
        bx - 0.1, bz - 0.75, Math.PI, 'talk');
      placePerson({ seated: true, y: 0.53, skirt: 0x40a0a8, top: 0xf5f0e0, hairStyle: 'pony', hair: 0x6a4a20, lipstick: true, skin: 0xe0b090 },
        bx - 0.1, bz + 0.75, 0, 'talk');
      const shake2 = Cyl(0.05, 0.035, 0.16, 0xf0f0f5, 10); shake2.position.set(bx, 0.9, bz - 0.2);
      const cream2 = Sph(0.05, 0xfff4f6, 12); cream2.position.set(bx, 1.0, bz - 0.2);
      scene.add(shake2, cream2);
      // pie stand under glass on the counter
      const pieB = Cyl(0.16, 0.16, 0.03, 0xd8dce2, 16); pieB.position.set(-W / 2 + 1.55, 1.03, S.zm + 2.5);
      const pie = Cyl(0.12, 0.14, 0.07, 0xc98a3a, 16); pie.position.set(-W / 2 + 1.55, 1.08, S.zm + 2.5);
      const dome = Sph(0.17, new THREE.MeshBasicMaterial({ color: 0xcfe4f0, transparent: true, opacity: 0.25 }), 18);
      dome.scale.set(1, 0.8, 1); dome.position.set(-W / 2 + 1.55, 1.12, S.zm + 2.5);
      scene.add(pieB, pie, dome);
    },
    shop(S, room) {
      const W = room.W;
      // counter turntable spins the heavy stuff
      const heavy = room.albums.find(a => /sabbath|ac.dc/i.test(a.artist) && playableSrc(a)) ||
        room.albums.find(a => playableSrc(a));
      if (heavy) audioPts.push({ x: -W / 2 + 2.2, z: S.z0 - 3.4, album: heavy, src: playableSrc(heavy), r: 14 });
      const deck2 = B(0.5, 0.06, 0.4, 0x3a2c1a); deck2.position.set(-W / 2 + 2.7, 1.05, S.z0 - 3.4);
      const plat2 = Cyl(0.16, 0.16, 0.02, 0x111111, 20); plat2.position.set(-W / 2 + 2.7, 1.1, S.z0 - 3.4);
      scene.add(deck2, plat2);
      // a regular leaning on the counter, full of opinions
      const reg = placePerson({ top: 0x3a4a5a, bottom: 0x2a3040, hairStyle: 'long', hair: 0x2a1c10, skin: 0xd8a880, moustache: true, lean: 0.1 },
        -W / 2 + 3.4, S.z0 - 3.2, Math.PI / 2, 'idle');
      makeChatter(reg, 'Shop Regular', [
        'Paranoid? Recorded in six days, mate. Six days! And the title track in half an hour.',
        'Punk’s killing the long-player, they reckon. Suits me — more singles in the bins.',
        'Don’t buy the reissue. The original pressing, or nothing.'
      ], { g: 'm', p: 0.85, r: 1.05 });
      // someone actually using the listening post, lost in it
      placePerson({ top: 0x4a3a5a, bottom: 0x2a3040, hairStyle: 'big', hair: 0x181008, skin: 0x9a6a48, headphones: true },
        W / 2 - 1.0, S.zm - 3, -Math.PI / 2, 'sway');
      // browser by the staff picks
      const fan = placePerson({ skirt: 0x6a3a1a, top: 0x8a5a2a, hairStyle: 'long', hair: 0x30200a, lipstick: true, skin: 0xe0b090 },
        -W / 2 + 1.6, S.z0 - 9.5, 1.2, 'talk');
      makeChatter(fan, 'Crate Digger', [
        'The staff picks are all right, but the real gems are at the back of the bins.',
        'I queued all night outside the Apollo once. Worth every minute of it.',
        'Check the run-out groove — that’s how you spot a first pressing.'
      ], { g: 'f', p: 1.15, r: 1.0 });
      // SALE sign
      const saleT = cTex(256, 128, (ctx) => {
        ctx.fillStyle = '#d23b52'; ctx.fillRect(0, 0, 256, 128);
        ctx.fillStyle = '#f5e9d0'; ctx.textAlign = 'center';
        fitText(ctx, 'SALE', 128, 62, 200, 64);
        fitText(ctx, '3 LPs FOR £1', 128, 108, 220, 28);
      });
      const saleM = new THREE.MeshBasicMaterial({ map: saleT }); saleM.side = THREE.DoubleSide;
      const sale = P(1.1, 0.55, saleM, true);
      sale.position.set(0, room.H - 1.6, S.zm); sale.rotation.z = 0.04;
      scene.add(sale);
    },
    neon(S, room) {
      const W = room.W;
      const mbz = S.zm + 1;
      // dance spot under the mirrorball
      const dj = room.albums.find(a => /buzzcocks|chas|foreigner|adam/i.test(a.artist) && playableSrc(a)) ||
        room.albums.find(a => playableSrc(a));
      if (dj) audioPts.push({ x: 0, z: mbz, album: dj, src: playableSrc(dj), r: 14 });
      // two dancers under the ball
      const nd1 = placePerson({ top: 0xd8d0c8, bottom: 0x30303a, hairStyle: 'big', hair: 0x0d0a06, skin: 0x8a5a3a, dancing: true },
        -0.8, mbz - 0.4, 0.8, 'dance');
      placePerson({ skirt: 0xff2d95, top: 0x22222a, hairStyle: 'big', hair: 0x2a1408, lipstick: true, legC: 0x241a1e, skin: 0xe0b090, dancing: true },
        0.8, mbz + 0.4, -2.2, 'dance');
      colliders.push({ x: 0, z: mbz, r: 0.9 });
      makeChatter(nd1, 'Breaker', [
        'This floor is fresh. The ball, the lasers — it’s like the videos, man.',
        'You gotta fight for your right to party. That’s just science.',
        'Twenty D-cell batteries in that box. Worth every penny.'
      ], { g: 'm', p: 1.05, r: 1.12 });
      // arcade kid
      const kid = placePerson({ top: 0x2a4a2a, bottom: 0x22222a, hat: 'cap', hatC: 0x2a4a2a, hairStyle: 'cap', hair: 0x1a1008, skin: 0xd8a880 },
        W / 2 - 2.1, S.z0 - 12.25, -Math.PI / 2, 'idle');
      makeChatter(kid, 'Arcade Kid', [
        'I turned Defender over once. Nine hundred and ninety thousand. Then my ma made me come home.',
        'Space Invaders ate my whole paper-round money. Worth it.',
        'The trick on Asteroids is you never stop drifting. Like life, my dad says.'
      ], { g: 'm', p: 1.35, r: 1.15 });
      // MTV devotee by the screens
      const mtv = placePerson({ skirt: 0x22d3ee, top: 0x30104a, hairStyle: 'big', hair: 0x2a1408, lipstick: true, skin: 0xc89878 },
        -W / 2 + 3.2, S.z0 - 7.2, -Math.PI / 2, 'talk');
      makeChatter(mtv, 'Video Fan', [
        'Music you can watch, all day and all night. Video killed the radio star, I suppose.',
        'It’s all hair and smoke machines in the new videos. I love it.',
        'They played the same clip three times in an hour and I watched it three times.'
      ], { g: 'f', p: 1.25, r: 1.08 });
    },
    bedroom(S, room) {
      const W = room.W;
      // the boombox is on: 90s beats from the shelf
      const bx2 = room.albums.find(a => /blur|daft|fatboy|beastie/i.test(a.artist) && playableSrc(a)) ||
        room.albums.find(a => playableSrc(a));
      if (bx2) audioPts.push({ x: -W / 2 + 1.15, z: S.zm - 2.5, album: bx2, src: playableSrc(bx2), r: 13 });
      // mate perched on the bed edge
      const mate = placePerson({ seated: true, y: 0.55, top: 0x3a4a2a, bottom: 0x2a3040, hairStyle: 'cap', hair: 0x2a1c10, skin: 0xd8a880 },
        W / 2 - 2.3, S.z1 + 3.4, -Math.PI / 2, 'talk');
      makeChatter(mate, 'Mate on the Bed', [
        'Have you heard Homework? Two French blokes made it in a bedroom like this one. A bedroom!',
        'Napster, mate. Every song ever recorded, for nothing. It can’t be legal. ...Is it legal?',
        'Parklife though. PARKLIFE.'
      ], { g: 'm', p: 1.0, r: 1.1 });
      // friend flicking through the shelf albums
      const fr = placePerson({ skirt: 0x8a3050, top: 0x443c60, hairStyle: 'long', hair: 0x1a1208, lipstick: true, skin: 0xe0b090 },
        -W / 2 + 1.6, S.z0 - 13, 1.3, 'talk');
      makeChatter(fr, 'Friend', [
        'Blur or Oasis? Blur. Always Blur. We don’t discuss it.',
        'I taped the Top 40 off the radio and my brother recorded the football over it. Devastated.',
        'One day all our CDs will fit in a matchbox. You watch.'
      ], { g: 'f', p: 1.3, r: 1.08 });
    },
    white(S, room) {
      // the iPod on its plinth quietly plays the decade
      const ip = room.albums.find(a => /winehouse|gray/i.test(a.artist) && playableSrc(a)) ||
        room.albums.find(a => playableSrc(a));
      if (ip) audioPts.push({ x: 0, z: S.zm - 1, album: ip, src: playableSrc(ip), r: 12 });
      // gallery attendant in white
      const att = placePerson({ top: 0xf4f4f6, bottom: 0xe4e4e8, hairStyle: 'cap', hair: 0x3a2a15, skin: 0xc89878 },
        1.2, S.z0 - 4.2, -0.8, 'idle');
      makeChatter(att, 'Attendant', [
        'A thousand songs in your pocket. The click wheel changed everything.',
        'The white earbuds were the real status symbol. People wore the advert.',
        'Everything is ninety-nine cents now. The album as we knew it is in trouble, friend.'
      ], { g: 'm', p: 0.95, r: 0.98 });
      // one more ad-silhouette dancing
      placePerson({ silhouette: true, dancing: true }, -2.2, S.zm + 2, 1.4, 'dance');
    },
    cloud(S, room) {
      // the turntable nook plays the revival
      const vin = room.albums.find(a => playableSrc(a));
      if (vin) audioPts.push({ x: 0, z: S.z1 + 2.6, album: vin, src: playableSrc(vin), r: 12 });
      // a believer by the record player
      const bel = placePerson({ top: 0x2a2a34, bottom: 0x1a1a22, hairStyle: 'long', hair: 0x2a1c10, skin: 0xd8a880 },
        1.1, S.z1 + 4.0, -2.6, 'idle');
      makeChatter(bel, 'Vinyl Believer', [
        'Forty million songs on tap, and I still play the same ten.',
        'I bought the record player for the ritual. Streaming is for the kitchen.',
        'Vinyl outsold CDs again this year. Round and round we go.'
      ], { g: 'm', p: 0.9, r: 0.95 });
    }
  };

  ROOMS.forEach(r => {
    const S = builders[r.key](r);
    S.zm = (S.z0 + S.z1) / 2;
    if (dress[r.key]) dress[r.key](S, r);
    if (dress2[r.key]) dress2[r.key](S, r);
    sections.push({ room: r, z0: S.z0, z1: S.z1 });
  });
  const endW = P(16, 7, matC(0x030305), true); endW.position.set(0, 3.5, Z - 0.5); scene.add(endW);
  const Z_MIN = Z + 1.2, Z_MAX = 6.8;

  // ================= NAVIGATION (free-look, collisions) =================
  const pos = { x: 0, z: 4.2 };
  const tPos = { x: 0, z: 4.2 };
  let yaw = 0, pitch = 0, tYaw = 0, tPitch = 0;
  let dragging = false, dragMoved = false, lastX = 0, lastY = 0;
  const keys = {};
  const raycaster = new THREE.Raycaster();
  const mouseNDC = new THREE.Vector2();
  const canvas = renderer.domElement;

  function roomAt(z) {
    for (const s of sections) if (z <= s.z0 && z > s.z1) return s;
    return null;
  }
  function tryMove(nx, nz) {
    // z bounds
    nz = Math.max(Z_MIN, Math.min(Z_MAX, nz));
    // doorway rule: can only cross a wall z through the gap
    for (const b of doorZs) {
      if ((tPos.z - b) * (nz - b) < 0) {
        if (Math.abs(nx) > 1.05) {
          // blocked by the wall — hold z but steer sideways toward the door gap
          const overshoot = Math.abs(nz - b);
          nz = b + (tPos.z > b ? 0.35 : -0.35);
          nx -= Math.sign(nx) * Math.min(Math.abs(nx), overshoot + 0.05);
        } else {
          nx = Math.max(-0.95, Math.min(0.95, nx));
        }
      }
    }
    // room side walls
    const s = roomAt(nz);
    const halfW = s ? s.room.W / 2 - 0.38 : 3.95;
    nx = Math.max(-halfW, Math.min(halfW, nx));
    // prop colliders (gentle slide-out)
    for (const c of colliders) {
      if (!c.r) continue;
      const dx = nx - c.x, dz = nz - c.z;
      const d = Math.hypot(dx, dz);
      if (d < c.r + 0.26 && d > 0.001) {
        const push = (c.r + 0.26 - d);
        nx += (dx / d) * push; nz += (dz / d) * push;
      }
    }
    tPos.x = nx; tPos.z = nz;
  }
  canvas.addEventListener('pointerdown', (e) => {
    dragging = true; dragMoved = false; lastX = e.clientX; lastY = e.clientY;
  });
  window.addEventListener('pointerup', () => {
    if (dragging && !dragMoved) handleClick();
    dragging = false;
  });
  window.addEventListener('pointermove', (e) => {
    mouseNDC.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
    if (dragging) {
      const dx = e.clientX - lastX, dy = e.clientY - lastY;
      if (Math.abs(dx) + Math.abs(dy) > 4) dragMoved = true;
      lastX = e.clientX; lastY = e.clientY;
      tYaw += dx * 0.005;               // free 360° turn
      tPitch = Math.max(-0.85, Math.min(0.85, tPitch + dy * 0.0035));
    }
    updateHover();
  });
  window.addEventListener('wheel', (e) => {
    if (overlayOpen()) return;
    const d = e.deltaY * 0.012;         // scroll down = walk forward, along the view direction
    tryMove(tPos.x + Math.sin(yaw) * d, tPos.z - Math.cos(yaw) * d);
  }, { passive: true });
  window.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) e.preventDefault();
    if (overlayOpen()) { if (e.key === 'Escape') closePanel(); return; }
    keys[k] = true;
    if (e.key === 'Escape') closePanel();
  });
  window.addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = false; });
  // double-click anywhere: walk to that spot, Street-View style
  canvas.addEventListener('dblclick', (e) => {
    if (overlayOpen()) return;
    mouseNDC.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
    raycaster.setFromCamera(mouseNDC, camera);
    const hits = raycaster.intersectObjects(scene.children, true)
      .filter(h => !h.object.isSprite && !h.object.isPoints &&
        !(h.object.material && h.object.material.transparent && h.object.material.opacity < 0.5));
    if (!hits.length) return;
    const pt = hits[0].point;
    const dx = pt.x - tPos.x, dz = pt.z - tPos.z;
    const d = Math.hypot(dx, dz);
    if (d < 0.3) return;
    const lim = Math.min(d, 16) / d;
    tryMove(tPos.x + dx * lim, tPos.z + dz * lim);
  });

  let moveEase = 0;
  function keyMove(dt) {
    let f = 0, r = 0, turn = 0;
    if (keys['w'] || keys['arrowup']) f += 1;
    if (keys['s'] || keys['arrowdown']) f -= 1;
    if (keys['a']) r -= 1;
    if (keys['d']) r += 1;
    if (keys['q'] || keys['arrowleft']) turn -= 1;
    if (keys['e'] || keys['arrowright']) turn += 1;
    if (turn) tYaw += turn * 2.1 * dt;
    // ease speed in/out so key movement doesn't jump; all frame-rate independent
    moveEase += (((f || r) ? 1 : 0) - moveEase) * Math.min(1, dt * 9);
    if (f || r) {
      const sp = 5.2 * dt * moveEase;
      // camera forward is (sin(yaw), 0, -cos(yaw)); right is (cos(yaw), 0, sin(yaw))
      const fx = Math.sin(yaw) * f + Math.cos(yaw) * r;
      const fz = -Math.cos(yaw) * f + Math.sin(yaw) * r;
      tryMove(tPos.x + fx * sp, tPos.z + fz * sp);
    }
  }

  window.__lr = {
    pos, tPos, yaw: () => yaw, tYaw: () => tYaw, keys,
    get els() { return audioEls; },
    addModel: (name, b64) => addCharacterSource(name, b64ToBuf('base64,' + b64)),
    charCount: () => charSources.length
  };
  let hovered = null;
  function updateHover() {
    if (overlayOpen()) return;
    raycaster.setFromCamera(mouseNDC, camera);
    const hits = raycaster.intersectObjects(pickables, true);
    let obj = null;
    if (hits.length && hits[0].distance < 14) {
      obj = hits[0].object;
      while (obj && !obj.userData.album) obj = obj.parent;
    }
    if (hovered !== obj) { hovered = obj; canvas.style.cursor = obj ? 'pointer' : 'default'; }
  }
  function handleClick() {
    if (overlayOpen()) return;
    if (hovered && hovered.userData.album) openDetail(hovered.userData.album);
  }

  // ================= PROXIMITY AUDIO =================
  const audioEls = [new Audio(), new Audio()];
  audioEls.forEach(a => { a.preload = 'none'; });
  // setlist: when a track ends (or errors), queue the next track from the same album;
  // the stage takes a 10-second break between numbers while the singer takes her bow
  function advanceTrack(p, viaError) {
    if (!p) return;
    if (!p.tracks) {
      p.tracks = (p.album.paths || []).filter(x => /\.(mp3|m4a)$/i.test(x)).map(x => encodeURI(x).replace(/#/g, '%23'));
      p.ti = Math.max(0, p.tracks.indexOf(p.src));
    }
    if (p.tracks.length > 1) {
      p.ti = (p.ti + 1) % p.tracks.length;
      p.src = p.tracks[p.ti];
    }
    if (p.stage && !viaError) {
      const now = performance.now() / 1000;
      p.holdUntil = now + 10;
      bowUntil = now + 5.5;
    }
    audioCur.id = null; // forces a fresh pick-up of the next track
  }
  audioEls.forEach(el => {
    el.addEventListener('ended', () => { if (audioCur.el === el) advanceTrack(audioCur.pt); });
    el.addEventListener('error', () => { if (audioCur.el === el) advanceTrack(audioCur.pt, true); });
  });
  let audioCur = { el: audioEls[0], id: null, vol: 0 };
  let audioOld = { el: audioEls[1], id: null, vol: 0 };
  let muted = false, manualHold = false, audioUnlocked = false;
  const AUDIO_R = 6.2;

  function nearestAudible() {
    // sideways distance counts less; each point has its own radius; only the room you're in plays
    const sec = roomAt(pos.z);
    let best = null, bq = 1;
    const nowS = performance.now() / 1000;
    for (const p of audioPts) {
      if (!p.src) continue;
      if (p.holdUntil && nowS < p.holdUntil) continue; // band break
      if (sec && (p.z > sec.z0 + 0.5 || p.z < sec.z1 - 0.5)) continue;
      const rr = p.r || AUDIO_R;
      const q = Math.hypot((p.x - pos.x) * 0.35, p.z - pos.z) / rr;
      if (q < bq) { bq = q; best = p; }
    }
    return best ? { p: best, q: bq } : null;
  }
  let audioTick = 0;
  function updateAudio() {
    if (muted || manualHold || !audioUnlocked) {
      audioEls.forEach(a => { if (!a.paused) a.pause(); });
      $('now-playing').classList.remove('show');
      return;
    }
    audioTick++;
    // safety net: never let a finished track strand the room in silence
    if (audioTick % 30 === 0 && audioCur.id && audioCur.el.ended) advanceTrack(audioCur.pt);
    if (audioTick % 12 === 0) {
      const n = nearestAudible();
      const nid = n ? n.p.album.id : null;
      if (nid !== audioCur.id) {
        const tmp = audioOld; audioOld = audioCur; audioCur = tmp;
        audioCur.id = nid;
        audioCur.pt = n ? n.p : null;
        if (n) {
          const el = audioCur.el;
          el.src = n.p.src;
          el.onloadedmetadata = () => { try { el.currentTime = Math.min(35, (el.duration || 60) * 0.25); } catch (e) { } };
          el.volume = 0;
          el.play().catch(() => { audioCur.id = null; });
        } else {
          audioCur.el.pause(); audioCur.id = null;
        }
      }
    }
    const n = nearestAudible();
    let target = 0;
    if (n && audioCur.id === n.p.album.id) target = Math.max(0, Math.min(1, 1 - n.q)) * 0.85;
    audioCur.vol += (target - audioCur.vol) * 0.05;
    audioOld.vol += (0 - audioOld.vol) * 0.06;
    try { audioCur.el.volume = Math.max(0, Math.min(1, audioCur.vol)); } catch (e) { }
    try { audioOld.el.volume = Math.max(0, Math.min(1, audioOld.vol)); } catch (e) { }
    if (audioOld.vol < 0.01 && !audioOld.el.paused) audioOld.el.pause();
    const np = $('now-playing');
    if (n && audioCur.vol > 0.03) {
      np.textContent = '♪ ' + n.p.album.artist + ' — ' + n.p.album.album;
      np.classList.add('show');
    } else np.classList.remove('show');
  }

  // ================= DETAIL PANEL =================
  const $ = (id) => document.getElementById(id);
  const detailEl = $('detail');
  function overlayOpen() { return detailEl.classList.contains('open'); }
  function closePanel() { detailEl.classList.remove('open'); stopManual(); manualHold = false; }
  $('detail-close').onclick = closePanel;

  const manualAudio = new Audio();
  let playingBtn = null;
  function stopManual() {
    manualAudio.pause();
    if (playingBtn) { playingBtn.textContent = '▶'; playingBtn = null; }
  }
  manualAudio.addEventListener('ended', stopManual);
  manualAudio.addEventListener('error', () => { if (playingBtn) { playingBtn.textContent = '✕'; playingBtn = null; } });

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

  function openDetail(album) {
    manualHold = true;
    const art = ART[album.id];
    let h = '';
    h += '<div class="d-art">' + (art ? '<img src="' + art + '">' : '<div class="d-noart">' + esc(album.artist) + '</div>') + '</div>';
    h += '<div class="d-head"><h2>' + esc(album.album) + '</h2><h3>' + esc(album.artist) + '</h3></div>';
    if (album.note) h += '<div class="note"><span>★ CURATOR’S NOTE</span>' + esc(album.note) + '</div>';
    h += '<div class="d-meta">';
    const row = (k, v) => '<div class="mrow"><span>' + k + '</span><b>' + v + '</b></div>';
    h += row('Year', album.year + (album.tagYear && album.tagYear !== album.year ? ' <i>(tagged ' + album.tagYear + (album.placement ? ' — ' + esc(album.placement) : '') + ')</i>' : ''));
    if (album.genre) h += row('Genre', esc(album.genre));
    if (album.label) h += row('Label', esc(album.label));
    if (album.scene) h += row('Scene', (album.city ? esc(album.city) + ' — ' : '') + esc(album.scene));
    if (album.composers && album.composers.length) h += row('Writers', esc(album.composers.slice(0, 4).join('; ')));
    h += '</div>';
    if (album.subgenres && album.subgenres.length > 1) {
      h += '<div class="chips">' + album.subgenres.map(s => '<span>' + esc(s) + '</span>').join('') + '</div>';
    }
    h += '<ol class="tracks">' + album.tracks.map((t, i) =>
      '<li><button class="play" data-i="' + i + '">▶</button><span class="tt">' + esc(t.title || 'Track ' + (i + 1)) + '</span>' +
      (t.rating ? '<span class="tr">' + '★'.repeat(Math.round(t.rating / 51)) + '</span>' : '') + '</li>').join('') + '</ol>';
    $('detail-body').innerHTML = h;
    detailEl.querySelectorAll('.play').forEach(btn => {
      btn.onclick = () => {
        const i = +btn.dataset.i;
        const p = album.paths ? album.paths[i] : null;
        if (playingBtn === btn) { stopManual(); return; }
        stopManual();
        if (!p) { btn.textContent = '✕'; return; }
        if (/\.m4p$/i.test(p)) { btn.textContent = '🔒'; btn.title = 'Protected iTunes file (DRM)'; return; }
        manualAudio.src = encodeURI(p).replace(/#/g, '%23');
        manualAudio.volume = 0.9;
        manualAudio.play().then(() => { playingBtn = btn; btn.textContent = '■'; }).catch(() => { btn.textContent = '✕'; });
      };
    });
    detailEl.classList.add('open');
  }

  // ================= WALK-UP CHAT =================
  let activeChat = null, chatTimer = 0;
  const chatV = new THREE.Vector3();
  // gendered, per-character voices: pick real synth voices where available
  let voicesF = [], voicesM = [];
  function loadVoices() {
    try {
      const vs = speechSynthesis.getVoices();
      // quality first: block the robotic novelty voices, then pick from a known-good list
      const bad = /albert|bad news|bahh|bells|boing|bubbles|cellos|deranged|fred|good news|jester|junior|kathy|organ|superstar|ralph|trinoids|whisper|wobble|zarvox|eddy|flo\b|grandma|grandpa|reed|rocko|sandy|shelley|eloquence|compact/i;
      const us = vs.filter(v => /^en[-_]US/i.test(v.lang) && !bad.test(v.name));
      const pool = us.length ? us : vs.filter(v => /^en/i.test(v.lang) && !bad.test(v.name));
      const pick = (prefs) => {
        const out = [];
        for (const name of prefs) {
          const v = pool.find(v2 => v2.name.toLowerCase().includes(name) && !out.includes(v2));
          if (v) out.push(v);
        }
        return out;
      };
      voicesF = pick(['samantha', 'google us english', 'ava', 'allison', 'susan', 'zoe', 'nicky', 'joelle', 'vicki', 'victoria', 'karen', 'jenny', 'aria']);
      voicesM = pick(['alex', 'tom', 'aaron', 'nathan', 'evan', 'guy', 'davis', 'christopher', 'daniel']);
      // better one decent voice for everyone than a cast of robots
      if (!voicesF.length) voicesF = pool.slice(0, 2);
      if (!voicesM.length) voicesM = voicesF.length ? voicesF : pool.slice(0, 2);
    } catch (e) { }
  }
  if (window.speechSynthesis) { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }
  function speak(line, voice) {
    try {
      if (muted || !window.speechSynthesis) return;
      speechSynthesis.cancel();
      // soften the phrasing: dashes and ellipses read badly, commas breathe better
      const clean = line.replace(/[—–]/g, ',').replace(/\.\.\./g, ',').replace(/’/g, "'");
      const u = new SpeechSynthesisUtterance(clean);
      const list = voice.g === 'f' ? voicesF : voicesM;
      if (list.length) u.voice = list[(voice.vi || 0) % list.length];
      // keep pitch and rate near natural — caricature settings sound robotic
      u.pitch = Math.max(0.8, Math.min(1.2, voice.p));
      u.rate = Math.max(0.9, Math.min(1.08, voice.r));
      u.volume = 0.95;
      speechSynthesis.speak(u);
    } catch (e) { }
  }
  function updateChat(dt) {
    const el = $('chat');
    for (const c of chatters) c.cd = Math.max(0, c.cd - dt);
    if (activeChat) {
      chatTimer -= dt;
      const cdx = activeChat.g.position.x - pos.x, cdz = activeChat.g.position.z - pos.z;
      const d = Math.hypot(cdx, cdz);
      // they keep the bubble up until you've actually turned to face them
      const facingThem = d > 0.01 && ((cdx * Math.sin(yaw) + cdz * -Math.cos(yaw)) / d) > 0.65;
      const done = (chatTimer <= 0 && facingThem) || chatTimer <= -18 || d > 2.9 || overlayOpen();
      if (done) {
        activeChat = null; el.classList.remove('show');
      } else {
        chatV.set(activeChat.g.position.x, activeChat.g.position.y + 1.95, activeChat.g.position.z).project(camera);
        if (chatV.z < 1) {
          el.style.left = ((chatV.x * 0.5 + 0.5) * window.innerWidth) + 'px';
          el.style.top = ((-chatV.y * 0.5 + 0.5) * window.innerHeight) + 'px';
          el.classList.add('show');
        } else el.classList.remove('show');
      }
      return;
    }
    if (overlayOpen()) return;
    for (const c of chatters) {
      if (c.cd > 0) continue;
      const d = Math.hypot(c.g.position.x - pos.x, c.g.position.z - pos.z);
      if (d < 1.9) {
        const line = c.lines[Math.floor(Math.random() * c.lines.length)];
        activeChat = c; chatTimer = 3.2 + line.length * 0.055;
        c.cd = 24;
        $('chat-name').textContent = c.name;
        $('chat-line').textContent = line;
        speak(line, Object.assign({ vi: c.vi }, c.voice));
        break;
      }
    }
  }

  // ================= HUD =================
  $('mute').onclick = () => {
    muted = !muted;
    $('mute').textContent = muted ? '🔇' : '🔊';
    $('mute').classList.toggle('off', muted);
  };
  (function buildTimeline() {
    const tl = $('timeline');
    sections.forEach((s, i) => {
      const seg = document.createElement('div');
      seg.className = 'tl-seg';
      seg.innerHTML = '<span>' + s.room.name + '</span><em>' + s.room.span + '</em>';
      seg.onclick = () => {
        tPos.x = 0; tPos.z = s.z0 - 3.4;
        pos.x = 0; pos.z = s.z0 - 1.2;
        tYaw = 0; yaw = 0; tPitch = 0;
      };
      seg.dataset.i = i;
      tl.appendChild(seg);
    });
  })();
  function updateHUD() {
    let ci = -1;
    sections.forEach((s, i) => { if (pos.z <= s.z0 + 0.5 && pos.z > s.z1) ci = i; });
    document.querySelectorAll('.tl-seg').forEach(el => el.classList.toggle('current', +el.dataset.i === ci));
    $('room-now').textContent = ci >= 0 ? sections[ci].room.name + ' · ' + sections[ci].room.span : 'The Lobby';
  }
  $('enter').onclick = () => {
    $('intro').classList.add('gone');
    audioUnlocked = true;
  };
  $('stat-albums').textContent = albums.length;
  $('stat-rooms').textContent = ROOMS.length;
  $('stat-notes').textContent = albums.filter(a => a.note).length;

  // ================= LOOP =================
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  let frame = 0, staticFrame = 0, walkPhase = 0;
  const clockT = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    frame++;
    const dt = Math.min(clockT.getDelta(), 0.08);
    keyMove(dt);
    const preX = pos.x, preZ = pos.z;
    const posK = 1 - Math.exp(-6.5 * dt), lookK = 1 - Math.exp(-9 * dt);
    pos.x += (tPos.x - pos.x) * posK;
    pos.z += (tPos.z - pos.z) * posK;
    yaw += (tYaw - yaw) * lookK;
    pitch += (tPitch - pitch) * lookK;
    const speed = Math.hypot(pos.x - preX, pos.z - preZ);
    walkPhase += speed * 7;
    camera.position.set(pos.x, 1.62 + Math.sin(walkPhase) * Math.min(0.035, speed * 2), pos.z);
    camera.rotation.set(-pitch, -yaw, 0, 'YXZ');
    // hover lift
    for (const g of hoverAnims) {
      const targetY = g.userData.baseY + (g === hovered ? g.userData.lift : 0);
      const s = g === hovered ? 1.05 : 1;
      g.position.y += (targetY - g.position.y) * 0.18;
      g.scale.x += (s - g.scale.x) * 0.18; g.scale.y = g.scale.z = g.scale.x;
    }
    const t = performance.now() / 1000;
    for (const f of flickers) f.s.opacity = f.base + Math.sin(t * f.f) * f.amp * 0.5 + (Math.random() < 0.02 ? -0.3 : 0);
    for (const b of bobbers) {
      if (b.spin) { b.g.rotation.y += b.spin * dt; continue; }
      b.g.position.y = b.y + Math.sin(t * 0.8 + b.ph) * 0.15;
      b.g.userData.baseY = b.g.position.y;
    }
    for (const d of dustFields) d.rotation.y = Math.sin(t * 0.05) * 0.01;
    for (const l of ledStrips) l.m.opacity = 0.25 + (Math.sin(t * l.f + l.ph) > 0.2 ? 0.75 : 0);
    // people
    for (const pa of peopleAnims) {
      const parts = pa.g.userData.parts;
      const sp = parts.spine, hd = parts.head;
      if (pa.type === 'sway') {
        sp.rotation.z = Math.sin(t * 1.1 + pa.ph) * 0.04;
        sp.rotation.y = Math.sin(t * 0.7 + pa.ph) * 0.12;
        hd.rotation.z = Math.sin(t * 1.1 + pa.ph + 0.6) * 0.05;
      } else if (pa.type === 'dance') {
        // swing steps, everyone locked to the band's beat (phases quantised to on-beat / off-beat)
        if (pa.phq === undefined) pa.phq = (Math.round(pa.ph / Math.PI) % 2) * Math.PI;
        const beat = t * 2.7 + pa.phq;
        pa.g.position.y = pa.baseY + Math.abs(Math.sin(beat)) * 0.055;
        pa.g.rotation.y = pa.baseRy + Math.sin(t * 0.8 + pa.ph) * 0.35;
        sp.rotation.z = Math.sin(beat) * 0.1;
        sp.rotation.x = 0.03 + Math.sin(beat * 2) * 0.045;
        sp.rotation.y = Math.sin(beat * 0.5) * 0.18;
        hd.rotation.z = Math.sin(beat + 0.7) * 0.09;
        // z stays outward so forearms never pass through the torso
        parts.arms[0].sh.rotation.z = 0.75 + Math.sin(beat) * 0.42;
        parts.arms[1].sh.rotation.z = -0.75 + Math.sin(beat) * 0.42;
        parts.arms[0].sh.rotation.x = Math.sin(beat) * 0.32;
        parts.arms[1].sh.rotation.x = -Math.sin(beat) * 0.32;
        parts.arms[0].el.rotation.x = -0.55 + Math.sin(beat * 2) * 0.22;
        parts.arms[1].el.rotation.x = -0.55 - Math.sin(beat * 2) * 0.22;
        parts.legs[0].hip.rotation.x = Math.max(0, Math.sin(beat)) * -0.4;
        parts.legs[1].hip.rotation.x = Math.max(0, Math.sin(beat + Math.PI)) * -0.4;
        parts.legs[0].knee.rotation.x = Math.max(0, Math.sin(beat)) * 0.5;
        parts.legs[1].knee.rotation.x = Math.max(0, Math.sin(beat + Math.PI)) * 0.5;
      } else if (pa.type === 'talk') {
        hd.rotation.y = Math.sin(t * 0.6 + pa.ph) * 0.45;
        hd.rotation.z = Math.sin(t * 1.3 + pa.ph) * 0.05;
        // nods and the occasional emphatic double-nod
        hd.rotation.x = Math.sin(t * 1.7 + pa.ph) * 0.06 + (Math.sin(t * 0.31 + pa.ph) > 0.92 ? Math.sin(t * 9) * 0.09 : 0);
        if (parts.mouth) {
          const talking = Math.sin(t * 0.9 + pa.ph) > -0.3;
          parts.mouth.scale.y = talking ? Math.max(0.6, 1.5 + Math.sin(t * 8 + pa.ph) * 1.1) : 1;
        }
        // gestures lift up and inward, always above the table line
        parts.arms[0].sh.rotation.x = -0.35 - Math.max(0, Math.sin(t * 1.1 + pa.ph)) * 0.2;
        parts.arms[0].el.rotation.x = -1.0 - Math.max(0, Math.sin(t * 1.1 + pa.ph)) * 0.4;
        // the other hand joins in now and then
        parts.arms[1].el.rotation.x = -1.0 - Math.max(0, Math.sin(t * 0.7 + pa.ph + 2)) * 0.35;
      } else if (pa.type === 'waltz') {
        // handled as couples below; just soft head attention to the partner
        hd.rotation.x = Math.sin(t * 1.1 + pa.ph) * 0.04;
      } else if (pa.type === 'drink') {
        const cyc = (t * 0.45 + pa.ph) % 3;
        const lift = Math.max(0, Math.sin(Math.min(Math.PI, cyc * 2)));
        parts.arms[1].sh.rotation.x = -0.35 - lift * 0.55;
        parts.arms[1].el.rotation.x = -1.0 - lift * 0.55;
        hd.rotation.x = -lift * 0.28;
        hd.rotation.y = Math.sin(t * 0.4 + pa.ph) * 0.25;
      } else if (pa.type === 'smoke') {
        const cyc = (t * 0.35 + pa.ph) % 3;
        const lift = Math.max(0, Math.sin(Math.min(Math.PI, cyc * 2)));
        parts.arms[1].sh.rotation.x = -0.35 - lift * 0.45;
        parts.arms[1].el.rotation.x = -1.0 - lift * 0.7;
        hd.rotation.x = lift * 0.08 - 0.02;
        hd.rotation.y = Math.sin(t * 0.5 + pa.ph) * 0.3;
      } else if (pa.type === 'dig') {
        sp.rotation.x = 0.62 + Math.sin(t * 1.4 + pa.ph) * 0.05;
        parts.arms[0].el.rotation.x = -0.45 + Math.sin(t * 2.6 + pa.ph) * 0.18;
        parts.arms[1].el.rotation.x = -0.45 + Math.sin(t * 2.6 + pa.ph + Math.PI) * 0.18;
      } else if (pa.type === 'clarinet') {
        // a real performance: deep body rock, knee dips on the low phrases, bell swung skyward on the wails
        const rock = Math.sin(t * 1.35 + pa.ph);
        sp.rotation.x = 0.06 + rock * 0.1;
        sp.rotation.z = Math.sin(t * 0.85 + pa.ph) * 0.07;
        pa.g.rotation.y = pa.baseRy + Math.sin(t * 0.6 + pa.ph) * 0.16;
        const wail = Math.pow(Math.max(0, Math.sin(t * 0.5 + pa.ph + 2)), 3);
        hd.rotation.x = rock * 0.06 - wail * 0.55;
        sp.rotation.x -= wail * 0.12;
        const dip = Math.max(0, -rock) * 0.4;
        parts.legs.forEach(l => { l.hip.rotation.x = -dip * 0.35; l.knee.rotation.x = dip * 0.7; });
        pa.g.position.y = pa.baseY - dip * 0.05;
        // fingers working the keys
        parts.arms[0].el.rotation.x = -1.35 + Math.sin(t * 5.4 + pa.ph) * 0.05;
        parts.arms[1].el.rotation.x = -1.15 + Math.sin(t * 5.4 + pa.ph + 1.2) * 0.05;
        parts.arms[0].fingers.rotation.x = -1.0 + Math.sin(t * 5.4) * 0.22;
        parts.arms[1].fingers.rotation.x = -1.0 + Math.sin(t * 5.4 + 1.6) * 0.22;
      } else if (pa.type === 'sing') {
        if (t < bowUntil && pa.g === stageSinger) {
          // end of the number: she takes a bow
          const k = Math.min(1, (bowUntil - t) > 4.5 ? (5.5 - (bowUntil - t)) : 1) * (bowUntil - t > 1 ? 1 : Math.max(0, bowUntil - t));
          sp.rotation.x += (0.75 * Math.min(1, k) - sp.rotation.x) * 0.1;
          sp.rotation.z *= 0.9; sp.rotation.y *= 0.9;
          hd.rotation.x += (0.35 - hd.rotation.x) * 0.1;
          parts.arms[0].sh.rotation.z *= 0.9;
          if (parts.mouth) parts.mouth.scale.set(1.1, 1, 1);
        } else {
          // full performance: sway, phrase-driven arm sweeps, chin-up lean on the big note
          pa.g.rotation.y = pa.baseRy + Math.sin(t * 0.5 + pa.ph) * 0.18;
          sp.rotation.z = Math.sin(t * 0.9 + pa.ph) * 0.07;
          sp.rotation.y = Math.sin(t * 0.55 + pa.ph) * 0.14;
          const arm = parts.arms[0];
          const phr = Math.sin(t * 0.42 + pa.ph);
          if (phr > 0.15) {
            // arm sweeps out to the room, hand opening
            const k = Math.min(1, (phr - 0.15) / 0.5);
            arm.sh.rotation.z = 0.2 + k * 1.15;
            arm.sh.rotation.x = -0.25 - k * 0.45;
            arm.el.rotation.x = -0.9 + k * 0.72;
            arm.fingers.rotation.x = -0.35 + k * 0.25;
          } else {
            // hand drawn back to the heart
            const k = Math.min(1, (0.15 - phr) / 0.5);
            arm.sh.rotation.z = 0.2 + k * 0.15;
            arm.sh.rotation.x = -0.25 - k * 0.55;
            arm.el.rotation.x = -0.9 - k * 0.5;
            arm.fingers.rotation.x = -0.6;
          }
          const big = Math.max(0, Math.sin(t * 0.55 + pa.ph) - 0.93) / 0.07;
          sp.rotation.x = -0.12 * big;
          hd.rotation.x = -0.08 + Math.sin(t * 1.1 + pa.ph) * 0.07 - big * 0.3;
          if (big > 0) { arm.sh.rotation.x = -0.25 - big * 1.0; arm.sh.rotation.z = 0.2 + big * 0.9; }
          hd.rotation.z = Math.sin(t * 0.8 + pa.ph) * 0.06;
          // knees give a little on the beat
          parts.legs[0].knee.rotation.x = Math.max(0, Math.sin(t * 2.7)) * 0.08;
          parts.legs[1].knee.rotation.x = Math.max(0, Math.sin(t * 2.7 + Math.PI)) * 0.08;
          if (parts.mouth) {
            const open = Math.max(0.5, 1.6 + Math.sin(t * 5.4 + pa.ph) * 1.3 + Math.sin(t * 1.3) * 0.5);
            parts.mouth.scale.set(1.15, open, 1);
          }
        }
      } else if (pa.type === 'shake') {
        // fast diagonal rattle beside the shoulder — arms stay in their authored grip
        sp.rotation.x = 0.02 + Math.sin(t * 13) * 0.02;
        sp.rotation.z = -0.06 + Math.sin(t * 13) * 0.05;
        parts.arms[0].el.rotation.x = -1.3 + Math.sin(t * 13) * 0.07;
        parts.arms[1].el.rotation.x = -1.6 + Math.sin(t * 13) * 0.07;
        hd.rotation.z = 0.08 + Math.sin(t * 2.1 + pa.ph) * 0.04;
      } else if (pa.type === 'piano') {
        sp.rotation.x = 0.12 + Math.sin(t * 1.8 + pa.ph) * 0.04;
        sp.rotation.y = Math.sin(t * 0.9 + pa.ph) * 0.12; // ranging over the keyboard
        hd.rotation.x = Math.sin(t * 1.8 + pa.ph + 1) * 0.08;
        parts.arms[0].el.rotation.x = -0.5 + Math.abs(Math.sin(t * 4.2 + pa.ph)) * 0.14;
        parts.arms[1].el.rotation.x = -0.5 + Math.abs(Math.sin(t * 4.2 + pa.ph + 1.6)) * 0.14;
      } else if (pa.type === 'drum') {
        // the strike targets themselves dip onto the heads; the tracked arms follow exactly
        const H = pa.g.userData.hits;
        if (H) {
          H.hitL.position.y = H.hiY - Math.max(0, Math.sin(t * 5.4)) * H.dip;
          H.hitR.position.y = H.snY - Math.max(0, Math.sin(t * 5.4 + Math.PI)) * H.dip;
        }
        hd.rotation.x = Math.abs(Math.sin(t * 2.7)) * 0.1;
        sp.rotation.x = 0.06 + Math.sin(t * 5.4) * 0.02;
      } else {
        // idle: weight shift, occasional glance
        sp.rotation.y = Math.sin(t * 0.5 + pa.ph) * 0.08;
        hd.rotation.y = Math.sin(t * 0.33 + pa.ph * 1.7) * 0.35;
        pa.g.rotation.z = Math.sin(t * 0.9 + pa.ph) * 0.01;
      }
    }
    // ---- signs of life: breathing, blinking, foot-tapping, anatomical wrists ----
    for (const pa of peopleAnims) {
      if (pa.type === 'gltf') continue;
      const parts = pa.g.userData.parts;
      if (parts.torso) {
        const br = Math.sin(t * 1.65 + pa.ph) * 0.016;
        parts.torso.scale.set(1 + br * 0.5, 1 + br * 0.3, 1 + br);
      }
      if (parts.eyes) {
        const bl = ((t * 0.33 + pa.ph * 1.31) % 3.7) < 0.09;
        for (const e of parts.eyes) e.scale.y = bl ? 0.08 : 1;
      }
      // anatomical bounds + wrist counter-bend, so arms never fold through the body or salute
      const ikL = pa.g.userData.ikLock || [], lkL = pa.g.userData.lockArms || [];
      parts.arms.forEach((a, ai) => {
        if (!ikL[ai] && !lkL[ai]) {
          // arm 0 is the left (outward = +z rotation), arm 1 the right (outward = −z)
          if (ai === 0) a.sh.rotation.z = Math.max(-0.18, a.sh.rotation.z);
          else a.sh.rotation.z = Math.min(0.18, a.sh.rotation.z);
          a.sh.rotation.x = Math.max(-1.75, Math.min(0.7, a.sh.rotation.x));
          a.el.rotation.x = Math.max(-2.3, Math.min(0.02, a.el.rotation.x));
        }
        if (a.wrist && !a.wristLock) a.wrist.rotation.x = Math.max(-0.7, Math.min(0.7, -(a.el.rotation.x + 0.16) * 0.5));
      });
      if (pa.g.userData.seatedFlag && (pa.type === 'talk' || pa.type === 'drink' || pa.type === 'smoke' || pa.type === 'idle')) {
        if (pa.phq === undefined) pa.phq = (Math.round(pa.ph / Math.PI) % 2) * Math.PI;
        parts.legs[1].knee.rotation.x = 1.5 + Math.max(0, Math.sin(t * 2.7 + pa.phq)) * 0.14;
      }
    }
    for (const w of walkers) {
      const parts = w.g.userData.parts;
      if (parts.torso) {
        const br = Math.sin(t * 1.8 + w.ph) * 0.014;
        parts.torso.scale.set(1 + br * 0.5, 1 + br * 0.3, 1 + br);
      }
      if (parts.eyes) {
        const bl = ((t * 0.33 + w.ph * 1.31) % 3.7) < 0.09;
        for (const e of parts.eyes) e.scale.y = bl ? 0.08 : 1;
      }
      for (const a of parts.arms) {
        if (a.wrist && !a.wristLock) a.wrist.rotation.x = Math.max(-0.7, Math.min(0.7, -(a.el.rotation.x + 0.16) * 0.5));
      }
    }
    // couples revolving in closed hold, bobbing on the same beat as everyone else
    for (const wz of waltzers) {
      const ang = t * 0.42 + wz.ph;
      const ox = Math.sin(ang) * wz.r, oz = Math.cos(ang) * wz.r;
      wz.m.position.x = wz.cx + ox; wz.m.position.z = wz.cz + oz;
      wz.w.position.x = wz.cx - ox; wz.w.position.z = wz.cz - oz;
      wz.m.rotation.y = Math.atan2(-ox, -oz);
      wz.w.rotation.y = Math.atan2(ox, oz);
      const bob = Math.abs(Math.sin(t * 2.7)) * 0.045;
      wz.m.position.y = bob; wz.w.position.y = bob;
      wz.m.userData.parts.spine.rotation.z = Math.sin(t * 2.7) * 0.06;
      wz.w.userData.parts.spine.rotation.z = -Math.sin(t * 2.7) * 0.06;
    }
    // everyone notices you: heads turn your way when you come close; chatters face you fully
    for (const pa of peopleAnims) {
      if (pa.type === 'gltf') continue;
      const g0 = pa.g;
      const ddx = pos.x - g0.position.x, ddz = pos.z - g0.position.z;
      const dd = Math.hypot(ddx, ddz);
      if (dd < 2.7) {
        const parts = g0.userData.parts;
        const want = Math.atan2(ddx, ddz);
        let rel = want - g0.rotation.y;
        while (rel > Math.PI) rel -= Math.PI * 2;
        while (rel < -Math.PI) rel += Math.PI * 2;
        const cl = Math.max(-1.0, Math.min(1.0, rel));
        parts.head.rotation.y += (cl - parts.head.rotation.y) * 0.55;
        if (activeChat && activeChat.g === g0) {
          if (g0.userData.seatedFlag) {
            // seated: twist the torso toward you as far as a body can
            const tw = Math.max(-0.85, Math.min(0.85, rel));
            parts.spine.rotation.y += (tw - parts.spine.rotation.y) * Math.min(1, dt * 5);
          } else {
            g0.rotation.y += rel * Math.min(1, dt * 6);
          }
        }
      }
    }
    for (const m of charMixers) m.update(dt);
    // waypoint patrols with a proper gait, pauses, and player-avoidance
    for (const w of walkers) {
      const parts = w.g.userData.parts;
      const lock = w.g.userData.lockArms || [];
      const pd = Math.hypot(w.g.position.x - pos.x, w.g.position.z - pos.z);
      if (w.state === 'walk' && pd < 1.25) w.state = 'blocked';
      if (w.state === 'blocked' && pd > 1.6) w.state = 'walk';
      if (w.state === 'pause' || w.state === 'blocked') {
        if (w.state === 'pause') w.pauseT -= dt;
        // settle limbs, glance around
        for (const l of parts.legs) { l.hip.rotation.x *= 0.88; l.knee.rotation.x *= 0.88; }
        if (!lock[0]) parts.arms[0].sh.rotation.x *= 0.88;
        if (!lock[1]) parts.arms[1].sh.rotation.x *= 0.88;
        w.g.position.y *= 0.85;
        if (pd < 2.7) {
          // stopped near you: turn and face you directly
          const want = Math.atan2(pos.x - w.g.position.x, pos.z - w.g.position.z);
          let rel = want - w.g.rotation.y;
          while (rel > Math.PI) rel -= Math.PI * 2;
          while (rel < -Math.PI) rel += Math.PI * 2;
          w.g.rotation.y += rel * Math.min(1, dt * 4);
          parts.head.rotation.y += (0 - parts.head.rotation.y) * 0.3;
        } else {
          parts.head.rotation.y = Math.sin(t * 0.7 + w.ph) * 0.4;
        }
        // the waiter sets a drink down while he pauses at a table
        if (w.g.userData.serve && w.state === 'pause' && !lock[0]) {
          const k = Math.max(0, Math.sin(w.pauseT * 2.4));
          parts.arms[0].sh.rotation.x = -k * 0.95;
          parts.arms[0].el.rotation.x = -0.25 - k * 0.5;
        }
        if (w.state === 'pause' && w.pauseT <= 0) {
          w.state = 'walk';
          w.i += w.dir;
          if (w.i >= w.pts.length - 1) { w.i = w.pts.length - 1; w.dir = -1; }
          else if (w.i <= 0) { w.i = 0; w.dir = 1; }
        }
        continue;
      }
      const tgt = w.pts[Math.max(0, Math.min(w.pts.length - 1, w.i + w.dir))];
      const dx = tgt.x - w.g.position.x, dz = tgt.z - w.g.position.z;
      const d = Math.hypot(dx, dz);
      if (d < 0.15) { w.state = 'pause'; w.pauseT = rand(1.8, 4.5); continue; }
      const step = Math.min(d, w.speed * dt);
      w.g.position.x += dx / d * step;
      w.g.position.z += dz / d * step;
      const targetRy = Math.atan2(dx, dz);
      let dr = targetRy - w.g.rotation.y;
      while (dr > Math.PI) dr -= Math.PI * 2;
      while (dr < -Math.PI) dr += Math.PI * 2;
      w.g.rotation.y += dr * Math.min(1, dt * 6);
      w.ph += dt * 6.2;
      if (w.gltf) continue;   // model animation handles the gait
      const s0 = Math.sin(w.ph), s1 = Math.sin(w.ph + Math.PI);
      parts.legs[0].hip.rotation.x = s0 * 0.5;
      parts.legs[1].hip.rotation.x = s1 * 0.5;
      parts.legs[0].knee.rotation.x = Math.max(0, Math.sin(w.ph - 1.1)) * 0.85;
      parts.legs[1].knee.rotation.x = Math.max(0, Math.sin(w.ph - 1.1 + Math.PI)) * 0.85;
      if (!lock[0]) { parts.arms[0].sh.rotation.x = s1 * 0.35; parts.arms[0].el.rotation.x = -0.16 - Math.max(0, s1) * 0.3; }
      if (!lock[1]) { parts.arms[1].sh.rotation.x = s0 * 0.35; parts.arms[1].el.rotation.x = -0.16 - Math.max(0, s0) * 0.3; }
      w.g.position.y = Math.abs(Math.cos(w.ph)) * 0.035;
      parts.spine.rotation.y = s0 * 0.06;
      parts.spine.rotation.z = Math.sin(w.ph) * 0.03;  // hip sway
      w.g.rotation.z = Math.sin(w.ph) * 0.015;
    }
    // music-video wall (every 3rd frame ≈ 20fps)
    if (frame % 3 === 0) {
      for (const vs of videoScreens) {
        const ctx = vs.ctx;
        vs.f++;
        if (vs.burst > 0) {
          // channel-change static
          vs.burst--;
          const img = ctx.createImageData(128, 96);
          for (let i = 0; i < img.data.length; i += 4) {
            const v = Math.random() * 170;
            img.data[i] = v; img.data[i + 1] = v; img.data[i + 2] = v + 20; img.data[i + 3] = 255;
          }
          ctx.putImageData(img, 0, 0);
          if (vs.burst === 0) vs.cur = (vs.cur + 1) % Math.max(1, vs.imgs.length);
        } else {
          const im = vs.imgs.length ? vs.imgs[vs.cur % vs.imgs.length] : null;
          ctx.fillStyle = '#04040a'; ctx.fillRect(0, 0, 128, 96);
          if (im && im.complete && im.naturalWidth) {
            // slow pan + zoom over the sleeve, like a cheap 80s video effect
            const zm = 1.15 + Math.sin(vs.f * 0.01 + vs.ph) * 0.12;
            const w = 128 * zm, h = 128 * zm;
            ctx.drawImage(im, (128 - w) / 2 + Math.sin(vs.f * 0.008 + vs.ph) * 10,
              (96 - h) / 2 + Math.cos(vs.f * 0.006 + vs.ph) * 8, w, h);
          }
          // scanlines + rolling bright bar + logo bug
          ctx.fillStyle = 'rgba(0,0,0,0.28)';
          for (let y = 0; y < 96; y += 3) ctx.fillRect(0, y, 128, 1);
          const ry = (vs.f * 1.7 + vs.ph * 30) % 110 - 8;
          ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(0, ry, 128, 3);
          ctx.fillStyle = '#e8e8f0'; ctx.font = 'bold 9px monospace'; ctx.textAlign = 'left';
          ctx.fillText('♪TV', 4, 91);
          if (vs.f % 130 === 0) vs.burst = 5;
        }
        vs.tex.needsUpdate = true;
      }
    }
    // arcade screens (~12fps)
    if (frame % 5 === 0) {
      for (const as of arcadeScreens) {
        as.f++;
        as.draw(as.ctx, as.f);
        as.tex.needsUpdate = true;
      }
    }
    runArmSolvers();   // last word on gripping arms: hands land exactly on their props
    updateChat(dt);
    updateAudio();
    updateHUD();
    renderer.render(scene, camera);
  }
  animate();
})();
