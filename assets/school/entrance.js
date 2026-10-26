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
    <nav class="school-hall-nav" aria-label="School navigation"><button onclick="document.querySelector('#centerScene')?.remove()">← Town Map</button><div><small>TRANSITION TOWN SCHOOL</small><h1>Main hallway</h1></div><a href="pre-ets-session-reports.html">Teacher Reports</a></nav>
    <div class="school-hall-directory"><div style="display:flex;gap:10px;flex-wrap:wrap"><a href="career-feud.html" style="background:#ffd477;color:#17213b;font-weight:800;padding:12px 16px;border-radius:10px;text-decoration:none">Ready, Set, Work!</a><a href="cdc-sort-it.html" style="background:linear-gradient(135deg,#ef6fab,#7256d8,#4bbbe8);color:#fff;font-weight:900;padding:12px 16px;border-radius:10px;text-decoration:none;box-shadow:0 5px 14px #0002">CDC Sort It!</a></div><span>Choose a door · Swipe to look around</span><div><a href="school-career-lab.html">Job Exploration →</a><a href="cdc-sort-it.html">CDC Sort It! →</a><a href="multiplication-wall.html">Multiplication Wall →</a><a href="double-digit-multiplication.html">Double-Digit Multiplication →</a><a href="money-counting-game.html">Money Counting →</a><a href="build-your-own-story.html">Build Your Own Story →</a><a href="developer-lab.html">Developer Lab →</a><a href="work-crew-lab.html">Work Crew Lab →</a><button onclick="schoolClassrooms()">Classrooms →</button><button onclick="schoolGames()">Games →</button></div></div>`;
  document.body.appendChild(scene);
  const pan=scene.querySelector('.school-hall-pan');
  requestAnimationFrame(()=>{pan.scrollLeft=(pan.scrollWidth-pan.clientWidth)/2;});
};
