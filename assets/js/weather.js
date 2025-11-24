(function(){
    const weatherBox = document.getElementById('weatherBox');
    const weatherOverlay = document.getElementById('weatherOverlay');

    function setWeatherUI({tempC, code, cityName, intensity=1}) {
        const emoji = codeToEmoji(code);
        const theme = codeToTheme(code);

        document.body.classList.remove('theme-sunny','theme-cloudy','theme-rain','theme-storm','theme-snow','theme-fog');
        document.body.classList.add('theme-' + theme);

        weatherBox.querySelector('.emoji').textContent = emoji;
        weatherBox.querySelector('.temp').innerHTML = Math.round(tempC) + '°C';
        weatherBox.querySelector('.loc').textContent = cityName || 'Your location';

        renderOverlayForTheme(theme, intensity);
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

    function clearOverlay(){ weatherOverlay.innerHTML = ''; weatherOverlay.style.opacity='1'; }

    function renderOverlayForTheme(theme, intensity=1){
        clearOverlay();
        const screenFactor = Math.max(window.innerWidth, window.innerHeight)/1920;
        const rainCount = Math.floor(30*intensity + 30*screenFactor);
        const snowCount = Math.floor(20*intensity + 20*screenFactor);

        if(theme==='rain'||theme==='storm'){
            const rainLayer=document.createElement('div'); rainLayer.className='rain';
            for(let i=0;i<rainCount;i++){
                const d=document.createElement('div'); d.className='raindrop';
                d.style.left=Math.random()*100+'vw';
                d.style.top=(-Math.random()*50)+'vh';
                d.style.height=8+Math.random()*15+'px';
                d.style.opacity=0.2+Math.random()*0.6;
                d.style.animationDuration=(0.9+Math.random()*1.6)/intensity+'s';
                d.style.animationDelay=(-Math.random()*2)+'s';
                rainLayer.appendChild(d);
            }
            weatherOverlay.appendChild(rainLayer);
            if(theme==='storm' && intensity>0.6){
                const flash=document.createElement('div'); flash.className='flash';
                weatherOverlay.appendChild(flash);
            }
            return;
        }

        if(theme==='snow'){
            const snowLayer=document.createElement('div'); snowLayer.className='snow';
            for(let i=0;i<snowCount;i++){
                const f=document.createElement('div'); f.className='flake';
                f.style.left=Math.random()*100+'vw';
                f.style.top=(-Math.random()*40)+'vh';
                const size=4+Math.random()*8; f.style.width=size+'px'; f.style.height=size+'px';
                f.style.opacity=0.4 + Math.random()*0.6*intensity;
                f.style.animationDuration=(6+Math.random()*6)/intensity+'s';
                f.style.animationDelay=(-Math.random()*3)+'s';
                snowLayer.appendChild(f);
            }
            weatherOverlay.appendChild(snowLayer);
            return;
        }

        if(theme==='sunny'){
            const sun=document.createElement('div'); sun.className='sun-glow';
            weatherOverlay.appendChild(sun);
            return;
        }

        if(theme==='cloudy'){
            const cloud=document.createElement('div'); cloud.className='clouds';
            cloud.style.opacity=0.05+0.05*intensity;
            cloud.style.animationDuration=120/intensity+'s';
            weatherOverlay.appendChild(cloud);
            return;
        }

        if(theme==='fog'){
            const fog=document.createElement('div'); fog.className='fog';
            fog.style.opacity=0.08+0.12*intensity;
            fog.style.animationDuration=90/intensity+'s';
            weatherOverlay.appendChild(fog);
            return;
        }
    }

    function fetchWeather(lat, lon){
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`)
        .then(r=>r.json()).then(data=>{
            if(!data||!data.current_weather){
                weatherBox.querySelector('.emoji').textContent='❓';
                weatherBox.querySelector('.temp').textContent='N/A';
                weatherBox.querySelector('.loc').textContent='Weather unavailable';
                return;
            }
            const cw=data.current_weather;
            let tempC=cw.temperature, code=cw.weathercode;
            let mappedCode=800; 
            if(code===0) mappedCode=800;
            else if(code>=1 && code<=3) mappedCode=801;
            else if(code===45 || code===48) mappedCode=741;
            else if(code>=51 && code<=67) mappedCode=500;
            else if(code>=71 && code<=77) mappedCode=600;
            else if(code>=80 && code<=86) mappedCode=501;
            else if(code>=95 && code<=99) mappedCode=200;

            let intensity=1;
            if(mappedCode===200 || mappedCode===501) intensity=1;
            else if(mappedCode===500) intensity=0.6;
            else if(mappedCode===600) intensity=0.5+Math.random()*0.5;
            else intensity=0.3;

            let cityName=`${lat.toFixed(2)}, ${lon.toFixed(2)}`;
            fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`)
            .then(r=>r.json()).then(loc=>{
                if(loc&&(loc.city||loc.town||loc.village||loc.county||loc.state)){
                    cityName=loc.city||loc.town||loc.village||loc.county||loc.state;
                }
                setWeatherUI({tempC, code:mappedCode, cityName, intensity});
            }).catch(()=>setWeatherUI({tempC, code:mappedCode, cityName, intensity}));
        }).catch(err=>{
            console.error(err);
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
            const lat=pos.coords.latitude, lon=pos.coords.longitude;
            weatherBox.querySelector('.emoji').textContent='⏳';
            weatherBox.querySelector('.temp').textContent='Loading…';
            weatherBox.querySelector('.loc').textContent='Fetching...';
            fetchWeather(lat, lon);
        }, err=>{
            console.warn(err);
            weatherBox.querySelector('.emoji').textContent='🚫';
            weatherBox.querySelector('.temp').textContent='Location blocked';
            weatherBox.querySelector('.loc').textContent='Allow location to theme site';
        }, {enableHighAccuracy:false, maximumAge:600000, timeout:8000});
    }

    init();
})();
