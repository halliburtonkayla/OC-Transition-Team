/* School entrance uses the existing classroom and training destinations. */
window.schoolBuildingScene = function () {
  document.querySelector('#centerScene')?.remove();
  const scene = document.createElement('section');
  scene.id = 'centerScene';
  scene.className = 'school-building-scene';
  scene.setAttribute('aria-label', 'Transition Town School');
  scene.innerHTML = `
    <img class="school-building-art" src="assets/school/school-building.webp?v=20261024" alt="A welcoming brick school building with classroom windows, a clock, and a courtyard leading to the front doors.">
    <div class="school-entrance-content">
      <nav class="school-entrance-nav" aria-label="School navigation"><button onclick="document.querySelector('#centerScene')?.remove()">← Town Map</button><span>TRANSITION TOWN</span></nav>
      <div class="school-welcome"><p>YOUR NEXT CHAPTER STARTS HERE</p><h1>Welcome to school</h1></div>
      <div class="school-entrance-panel"><div class="school-panel-heading"><span>COME ON IN</span><h2>Where are we headed?</h2></div>
        <div class="school-door-grid">
          <a class="school-door school-career-door" href="school-career-lab.html"><span class="school-door-number">01</span><span><strong>Job Exploration</strong><small>50 careers · ID, résumé & work experience</small></span><b aria-hidden="true">→</b></a>
          <button class="school-door" onclick="schoolClassrooms()"><span class="school-door-number">02</span><span><strong>Lesson Classrooms</strong><small>Learn skills for work and everyday life</small></span><b aria-hidden="true">→</b></button>
          <button class="school-door" onclick="schoolGames()"><span class="school-door-number">03</span><span><strong>Educational Games</strong><small>Practice what you’re learning</small></span><b aria-hidden="true">→</b></button>
        </div>
        <div class="school-extra-doors"><button onclick="collegeFair()">College & Training</button><button onclick="shortTraining()">Training Video Lab</button><button onclick="collegeHowTo()">Resource Room</button><a href="pre-ets-session-reports.html">Teacher Reports</a></div>
      </div>
    </div>`;
  document.body.appendChild(scene);
};
