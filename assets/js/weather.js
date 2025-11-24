(function(){
  const weatherBox = document.getElementById('weatherBox');
  const weatherOverlay = document.getElementById('weatherOverlay');
  const body = document.body;

  function setWeatherUI({tempC, code, cityName}) {
    const emoji = codeToEmoji(code);
    const theme = codeToTheme(code);
    document.body.classList.remove('theme-sunny','theme-cloudy','theme-rain','theme-storm','theme-snow','theme-fog');
    document.body.classList.add('theme-' + theme);
    weatherBox.querySelector('.emoji').textContent = emoji;
    weatherBox.querySelector('.temp').innerHTML = Math.round(tempC) + '°C';
    weatherBox.querySelector('.loc').textContent = cityName || 'Your location';
    renderOverlayForTheme(theme);
  }

  function codeToEmoji(code){
    if (code >= 200 && code < 300) return '⛈️';
    if (code >= 300 && code < 600) return '🌧️';
    if (code >= 600 && code < 700) return '❄️';
    if (code >= 700 && code < 800) return '🌫️';
    if (code === 800) return '☀️';
    if (code === 801 || code === 802) return '🌤️';
    return '☁️';
  }

  function codeToTheme(code){
    if (code >= 200 && code < 300) return 'storm';
    if (code >= 300 && code < 600) return 'rain';
    if (code >= 600 && code < 700) return 'snow';
    if (code >= 700 && code < 800) return 'fog';
    if (code === 800) return 'sunny';
    if (code === 801 || code === 802) return 'cloudy';
    return 'cloudy';
  }

  function clearOverlay(){ weatherOverlay.innerHTML = ''; weatherOverlay.style.opacity = '1'; }

  function renderOverlayForTheme(theme){
    clearOverlay();
    if (theme === 'rain' || theme === 'storm') {
      const rainLayer = document.createElement('div'); rainLayer.className='rain';
      for(let i=0;i<70;i++){
        const d=document.createElement('div'); d.className='raindrop';
        d.style.left=Math.random()*100+'vw';
        d.style.top=(-Math.random()*30)+'vh';
        d.style.height=8+Math.random()*26+'px';
        d.style.opacity=0.2+Math.random()*0.6;
        d.style.animationDuration=0.9+Math.random()*1.6+'s';
        d.style.animationDelay=(-Math.random()*2)+'s';
        rainLayer.appendChild(d);
      }
      weatherOverlay.appendChild(rainLayer);
      if(theme==='storm'){
        const flash=document.createElement('div'); flash.style.position='absolute'; flash.style.inset='0';
        flash.style.pointerEvents='none'; flash.style.animation='flash 6s linear infinite';
        flash.style.opacity=0; flash.style.background='linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0))';
        weatherOverlay.appendChild(flash);
      }
      return;
    }
    if(theme==='snow'){
      const snowLayer=document.createElement('div'); snowLayer.className='snow';
      for(let i=0;i<50;i++){
        const f=document.createElement('div'); f.className='flake';
        f.style.left=Math.random()*100+'vw';
        f.style.top=(-Math.random()*40)+'vh';
        f.style.width=6+Math.random()*10+'px';
        f.style.height=f.style.width;
        f.style.opacity=0.6+Math.random()*0.4;
        f.style.animationDuration=6+Math.random()*6+'s';
        f.style.animationDelay=(-Math.random()*3)+'s';
        snowLayer.appendChild(f);
      }
      weatherOverlay.appendChild(snowLayer);
      return;
    }
    if(theme==='sunny'){ const sun=document.createElement('div'); sun.className='sun-glow'; weatherOverlay.appendChild(sun); return; }
    if(theme==='cloudy'){ const cloud=document.createElement('div'); cloud.className='clouds'; weatherOverlay.appendChild(cloud); return; }
    if(theme==='fog'){ const fog=document.createElement('div'); fog.style.position='absolute'; fog.style.inset='0';
      fog.style.background='linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.03))';
      fog.style.opacity='0.12'; weatherOverlay.appendChild(fog); return;
    }
  }

  function fetchWeather(lat, lon){
    const url=`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`;
    fetch(url).then(r=>r.json()).then(data=>{
      if(!data||!data.current_weather){ weatherBox.querySelector('.emoji').textContent='❓';
        weatherBox.querySelector('.temp').textContent='N/A';
        weatherBox.querySelector('.loc').textContent='Weather unavailable'; return;
      }
      const cw=data.current_weather; const tempC=cw.temperature; const code=cw.weathercode;
      let mappedCode=800;
      if(code===0) mappedCode=800; else if(code>=1&&code<=3) mappedCode=801;
      else if(code===45||code===48) mappedCode=741; else if(code>=51&&code<=67) mappedCode=500;
      else if(code>=71&&code<=77) mappedCode=600; else if(code>=80&&code<=86) mappedCode=501;
      else if(code>=95&&code<=99) mappedCode=200;
      let cityName=`${lat.toFixed(2)}, ${lon.toFixed(2)}`;
      fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`)
        .then(r=>r.json()).then(loc=>{
          if(loc&&(loc.city||loc.town||loc.village||loc.county||loc.state)){
            cityName=loc.city||loc.town||loc.village||loc.county||loc.state;
          }
          setWeatherUI({tempC,code:mappedCode,cityName});
        }).catch(()=>setWeatherUI({tempC,code:mappedCode,cityName}));
    }).catch(err=>{
      console.error('Open-Meteo fetch failed',err);
      weatherBox.querySelector('.emoji').textContent='❌';
      weatherBox.querySelector('.temp').textContent='N/A';
      weatherBox.querySelector('.loc').textContent='Weather unavailable';
    });
  }

  function init(){
    if(!navigator.geolocation){
      weatherBox.querySelector('.emoji').textContent='📡';
      weatherBox.querySelector('.temp').textContent='No geo';
      weatherBox.querySelector('.loc').textContent='Enable location';
      return;
    }
    navigator.geolocation.getCurrentPosition(pos=>{
      const lat=pos.coords.latitude; const lon=pos.coords.longitude;
      weatherBox.querySelector('.emoji').textContent='⏳';
      weatherBox.querySelector('.temp').textContent='Loading…';
      weatherBox.querySelector('.loc').textContent='Fetching...';
      fetchWeather(lat,lon);
    },err=>{
      console.warn('geolocation denied or failed',err);
      weatherBox.querySelector('.emoji').textContent='🚫';
      weatherBox.querySelector('.temp').textContent='Location blocked';
      weatherBox.querySelector('.loc').textContent='Allow location to theme site';
    },{enableHighAccuracy:false,maximumAge:600000,timeout:8000});
  }

  init();

})();
