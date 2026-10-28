/* School entrance uses the existing classroom and training destinations. */
window.schoolBuildingScene = function () {
  document.querySelector('#centerScene')?.remove();
  const scene = document.createElement('section');
  scene.id = 'centerScene';
  scene.className = 'school-building-scene school-interior-scene';
  scene.setAttribute('aria-label', 'Transition Town School');
  scene.innerHTML = `
    <div class="school-hall-pan" aria-label="School hallway. Swipe sideways to look around."><div class="school-hall-stage">
      <img class="school-hall-art" src="assets/school/school-hallway.webp?v=20261024inside" alt="Inside Transition Town School: a bright hallway with classroom doors, lockers, and a reception desk.">
      <a class="hall-door hall-near-left" href="school-career-lab.html"><small>CAREER WING</small><strong>Job Exploration</strong><span>Enter →</span></a>
      <button class="hall-door hall-mid-left" onclick="schoolClassrooms()"><small>LEARN</small><strong>Lesson Classrooms</strong><span>Enter →</span></button>
      <button class="hall-door hall-far-left" onclick="collegeFair()"><strong>College & Training</strong><span>Enter →</span></button>
      <button class="hall-door hall-near-right" onclick="schoolGames()"><small>PRACTICE</small><strong>Educational Games</strong><span>Enter →</span></button>
      <button class="hall-door hall-mid-right" onclick="shortTraining()"><strong>Training Video Lab</strong><span>Enter →</span></button>
      <button class="hall-door hall-far-right" onclick="collegeHowTo()"><strong>Resource Room</strong><span>Enter →</span></button>
      <a class="hall-door hall-developer" href="developer-lab.html"><small>CREATE</small><strong>Developer Lab</strong><span>Plan & build →</span></a>
      <a class="hall-door hall-workcrew" href="work-crew-lab.html"><small>CDC WORK LAB</small><strong>Work Crew Lab</strong><span>Practice a shift →</span></a>
    </div></div>
    <nav class="school-hall-nav" aria-label="School navigation"><button onclick="document.querySelector('#centerScene')?.remove()">← Town Map</button><div><small>TRANSITION TOWN SCHOOL</small><h1>Main hallway</h1></div><div class="school-hall-tools"><button class="school-directory-trigger" onclick="schoolDirectoryDialog()">School Directory</button><a href="pre-ets-session-reports.html">Teacher Reports</a></div></nav>
    <div class="school-hall-directory school-hall-shortcuts"><span>Choose a door · Swipe to look around</span><div><a class="hall-job-missions-link" href="job-missions.html">JOB MISSIONS — READY FOR WORK!</a><a href="watch-and-learn.html">Watch &amp; Learn</a></div></div>`;
  document.body.appendChild(scene);
  const pan=scene.querySelector('.school-hall-pan');
  requestAnimationFrame(()=>{pan.scrollLeft=(pan.scrollWidth-pan.clientWidth)/2;});
};



/* The map always enters the original school hallway. The directory is optional. */
window.schoolOriginalHallway = window.schoolBuildingScene;
window.schoolDirectoryDialog = function () {
  if(document.querySelector('#schoolDirectoryDialog')) return;
  const trigger=document.querySelector('.school-directory-trigger');
  const dialog=document.createElement('dialog');
  dialog.id='schoolDirectoryDialog';
  dialog.className='school-directory-dialog';
  dialog.setAttribute('aria-label','School Directory');
  dialog.innerHTML='<div class="school-directory-dialog-bar"><strong>School Directory</strong><button type="button" class="directory-close">← Back to the school hallway</button></div><div class="school-directory-dialog-content"></div>';
  document.body.appendChild(dialog);
  const close=()=>dialog.close();
  dialog.querySelector('.directory-close').onclick=close;
  dialog.addEventListener('close',()=>{try{window.speechSynthesis?.cancel();}catch{}dialog.remove();trigger?.focus();},{once:true});
  dialog.showModal();
  import('../school-directory/directory.mjs?v=20261028hall-directory').then(m=>{
    if(dialog.isConnected)m.renderSchool(dialog.querySelector('.school-directory-dialog-content'),false,{compact:true,onBack:close});
  }).catch(()=>{
    dialog.querySelector('.school-directory-dialog-content').innerHTML='<p>The directory could not load. You can still use the school doors.</p><a href="school-directory.html">Open the directory page</a>';
  });
};
