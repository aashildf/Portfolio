// Raindrops
document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.createElement("canvas");
  canvas.style.position = "fixed";
  canvas.style.top = 0;
  canvas.style.left = 0;
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = 9999;
  
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  let width = window.innerWidth;
  let height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;

  window.addEventListener("resize", () => {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  });

  const drops = [];

  document.addEventListener("mousemove", (e) => {
    if (Math.random() < 0.3) {
      // less chance of drops per movement
      drops.push({
        x: e.clientX + (Math.random() * 40 - 20), // spread in x-direction
        y: e.clientY + 10 + Math.random() * 20,               // starter under musepekeren
        radius: Math.random() * 2 + 1,
        opacity: 1,
        speed: Math.random() * 2 + 2,
        ripple: false,
        rippleRadius: 0,
        rippleOpacity: 0.4,
        impactY: height * 0.5 + Math.random() * height * 0.5, // lander alltid i nedre halvdel
      });

      if (drops.length > 100) drops.splice(0, 30); // number of drops
    }
  });

  function draw() {
    ctx.clearRect(0, 0, width, height);
    for (let i = drops.length - 1; i >= 0; i--) {
      const d = drops[i];
      if (!d.ripple) {
        //  Make raindrop
    
       const wobble = Math.random() * 0.2 - 0.1;

       ctx.beginPath();
       ctx.ellipse(
         d.x,
         d.y,
         d.radius * (0.4 + wobble),
         d.radius * (1.2 + wobble),
         0,
         0,
         Math.PI * 2,
       );


       // fyll
       ctx.fillStyle = "rgba(219, 226, 242, 0.8)";
       ctx.fill();

       // outline
       ctx.strokeStyle = "rgba(177, 191, 218, 0.9)";
       ctx.lineWidth = 1;
       ctx.stroke();


        // falling speed
        d.y += d.speed * 3;

        //  Start ripple when drop hits "water"
       if (d.y >= d.impactY && !d.ripple) {
         d.ripple = true;
         d.rippleRadius = 2;
         d.rippleOpacity = 1;
         d.rippleOpacity -= 0.01;
         d.impactY = d.y; // ← dette er nøkkelen
       }
      } else {
        // multiple rings on water
        for (let r = 1; r <= 3; r++) {
          ctx.beginPath();
         ctx.ellipse(
           d.x,
            d.impactY,
           d.rippleRadius * r, // bredde
           d.rippleRadius * r * 0.35, // høyde (komprimert)
           0,
           0,
           Math.PI * 2,
         );

         ctx.strokeStyle = `rgba(0, 0, 0, ${d.rippleOpacity * (1 - r * 0.2) * 0.15})`;
         ctx.lineWidth = 1;
          ctx.stroke();
        }

        d.rippleRadius += 0.2; // ring spreads
        d.rippleOpacity -= 0.006;// fade out
      }

      // remove drop when ripple is done
      if (d.ripple && d.rippleOpacity <= 0) {
        drops.splice(i, 1);
      }
    }

    requestAnimationFrame(draw);
  }
  draw();
});
