# PBS Essential Skills lesson

The default `watch-and-learn.html?lesson=ready` route now opens the 6:52 CET/ThinkTV Education video **What are the MOST Essential Skills for Job Seekers?** using the responsive iframe published under **Share This Video → Embed Video** on its official PBS page:

https://www.pbs.org/video/what-are-the-most-essential-skills-for-job-seekers-lsrp7h/

Official embed: `https://player.pbs.org/viralplayer/3072467436/`. The video is not copied or rehosted. An always-visible original-source link is available if school filtering or PBS availability prevents embedded playback. PBS owns playback, volume, captions and fullscreen controls; no browser speech is needed for this video.

The three-item quick worksheet follows the transcript order, has one word per blank and a shuffled word bank at the bottom. Exact cue times are not asserted. The same question data powers screen practice and browser printing. The separate one-page student PDF contains no answer key. Drag-and-drop also supports tap-word-then-blank and keyboard button activation; words can be moved, cleared and retried without penalties.

The teacher-key screen calls the existing server-backed `classroom-monitor` `teacher_pin` action. No PIN value is stored in the source or browser storage. A newly issued, expiring session token stays in memory and is revoked when the key is locked or the page is left. Empty, invalid, failed, expired and interrupted checks do not unlock the key. Student printing excludes the key. This is a classroom convenience gate, not encrypted answer storage: client-side answer checking necessarily makes answer data inspectable in source.

All previous original lessons remain. The original Ready for Work animated lesson and its original packet are explicitly available at `?lesson=ready-original`; they are not described as the PBS video's worksheet. Other games, activities and student records are unchanged.

Run focused regression checks with `node --test tests/pbs-ready.test.mjs tests/watch-learn.test.mjs`.

Verification notes: the student PDF was rendered and visually inspected. Real successful-PIN testing is intentionally left to the teacher; tests must not guess a code. The local socket-restricted execution environment cannot launch Chromium or expose localhost to the cloud browser, so browser QA must target the deployed lesson. A passing unit test is not proof of school-network video or audio playback.
