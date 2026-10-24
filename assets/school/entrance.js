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
    </div></div>
    <nav class="school-hall-nav" aria-label="School navigation"><button onclick="document.querySelector('#centerScene')?.remove()">← Town Map</button><div><small>TRANSITION TOWN SCHOOL</small><h1>Main hallway</h1></div><a href="pre-ets-session-reports.html">Teacher Reports</a></nav>
    <div class="school-hall-directory"><span>Choose a door · Swipe to look around</span><div><a href="school-career-lab.html">Job Exploration →</a><button onclick="schoolClassrooms()">Classrooms →</button><button onclick="schoolGames()">Games →</button></div></div>`;
  document.body.appendChild(scene);
  const pan=scene.querySelector('.school-hall-pan');
  requestAnimationFrame(()=>{pan.scrollLeft=(pan.scrollWidth-pan.clientWidth)/2;});
};
