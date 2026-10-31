(() => {
  function decorate(){
    const top=document.querySelector('.topbar');
    if(!top || top.querySelector('.klassia-class-switch')) return;
    const b=document.createElement('button');
    b.className='iconBtn klassia-class-switch';
    b.title='Changer de classe';
    b.setAttribute('aria-label','Changer de classe');
    b.textContent='🎒';
    b.onclick=()=>location.href='./ms/';
    const logout=document.getElementById('logout');
    if(logout) top.insertBefore(b,logout); else top.appendChild(b);
  }
  document.addEventListener('klassia:render',decorate);
})();

