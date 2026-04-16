const app = {
    progress: 0,
    
    startLesson() {
        document.getElementById('station-0').classList.add('hidden');
        document.getElementById('main-content').classList.remove('hidden');
        this.updateProgress(10);
    },

    updateProgress(percent) {
        document.getElementById('progress').style.width = percent + '%';
    },

    nextStation(currentId, nextId, progress) {
        document.getElementById(currentId).classList.add('hidden');
        document.getElementById(nextId).classList.remove('hidden');
        this.updateProgress(progress);
    },

    init() {
        // --- 1. Station 1 (Schlitten Intro) ---
        let s1Attempts = 0;
        const btnCheckS1 = document.getElementById('btn-check-s1');
        const btnSolutionS1 = document.getElementById('btn-solution-s1');
        const s1Feedback = document.getElementById('s1-feedback');
        const s1Input = document.getElementById('sled-input');

        btnCheckS1.addEventListener('click', () => {
            if (btnCheckS1.dataset.solved === "true") {
                this.nextStation('station-1', 'station-2', 30);
                return;
            }

            const input = s1Input.value.toLowerCase();
            if(input.includes('schieb') || input.includes('drück') || input.includes('zieh') || input.includes('kraft') || input.includes('anstoß')) {
                s1Feedback.innerHTML = "Perfekt! Jemand muss von außen etwas tun, z.B. anschieben. Da wirkt eine Kraft!";
                s1Feedback.className = "feedback-msg success";
                btnCheckS1.textContent = "Zum Testlabor";
                btnCheckS1.dataset.solved = "true";
                btnSolutionS1.classList.add('hidden');
                s1Feedback.classList.remove('hidden');
                return;
            } 
            
            s1Attempts++;
            s1Feedback.className = "feedback-msg error";
            s1Feedback.classList.remove('hidden');
            if (input.length < 3) s1Feedback.innerHTML = "Bitte schreibe zumindest ein paar Stichpunkte auf.";
            else if (s1Attempts === 1) s1Feedback.innerHTML = "Guter Versuch! <strong>Tipp 1:</strong> Stell dir vor, du stehst <em>hinter</em> dem Schlitten, oder jemand an einem Seil steht <em>vor</em> dem Schlitten. Was könntet ihr mit den Händen machen?";
            else if (s1Attempts === 2) s1Feedback.innerHTML = "Wir suchen ein Tätigkeitswort. Es beginnt z.B. mit 'sch' oder 'z'...";
            else {
                s1Feedback.innerHTML = "<strong>Tipp 3:</strong> Die Bewegung ändert sich durch eine sogenannte <em>Einwirkung</em> von außen. Was würdest du also tun?";
                btnSolutionS1.classList.remove('hidden');
            }
        });

        btnSolutionS1.addEventListener('click', () => {
            s1Input.value = "Der Schlitten muss z.B. angeschoben oder gezogen werden.";
            btnSolutionS1.classList.add('hidden');
            s1Feedback.innerHTML = "Hier ist ein Lösungsvorschlag. Klicke auf 'Idee überprüfen', um fortzufahren!";
            s1Feedback.className = "feedback-msg";
        });


        // --- 2. Station 2 (Labor Challenge) ---
        let currentChallenge = 1; // 1 = Max Speed, 2 = Min Speed
        const sM = document.getElementById('sim-mass');
        const sF = document.getElementById('sim-force');
        const sT = document.getElementById('sim-time');
        const animSled = document.getElementById('anim-sled');
        const wind = document.getElementById('wind');
        const btnSimStart = document.getElementById('btn-sim-start');
        const errorMsg = document.getElementById('sim-error-msg');
        
        const updatePassengerVisual = () => {
            let m = parseInt(sM.value);
            document.getElementById('val-sim-mass').textContent = m + (m===1?" Person":" Personen");
            let innerSVG = '';
            for(let i=0; i<m; i++) {
                let offset = 25 * i;
                innerSVG += `<circle cx="${35+offset}" cy="15" r="8" fill="#fff" />
                             <rect x="${31+offset}" y="25" width="8" height="15" fill="#fff" />`;
            }
            document.getElementById('passengers').innerHTML = innerSVG;
        };

        const updateSliders = () => {
            document.getElementById('val-sim-force').textContent = sF.value == 1 ? "Sehr schwach" : (sF.value == 5 ? "Sehr stark" : "Mittel");
            document.getElementById('val-sim-time').textContent = sT.value == 1 ? "Sehr kurz" : (sT.value == 5 ? "Sehr lang" : "Mittel");
        };

        sM.addEventListener('input', updatePassengerVisual);
        sF.addEventListener('input', updateSliders);
        sT.addEventListener('input', updateSliders);
        updatePassengerVisual();

        btnSimStart.addEventListener('click', () => {
            let m = parseInt(sM.value);
            let F = parseInt(sF.value);
            let t = parseInt(sT.value);
            
            // Qualitativ: v = F * t / m (Max ist 5*5/1 = 25. Min ist 1*1/3 = 0.33)
            let isMax = (F === 5 && t === 5 && m === 1);
            let isMin = (F === 1 && t === 1 && m === 3);

            if(currentChallenge === 1 && !isMax) {
                errorMsg.innerHTML = "Nicht maximal! Erinnere dich: Wenig Trägheit (wenig Personen), viel Kraft und langes Schieben bedeutet maximaler Speed.";
                errorMsg.classList.remove('hidden');
                return;
            }
            if(currentChallenge === 2 && !isMin) {
                errorMsg.innerHTML = "Noch zu schnell! Um ganz langsam zu sein, brauchst du viel Trägheit (viele Personen), sehr wenig Kraft und sehr wenig Dauer.";
                errorMsg.classList.remove('hidden');
                return;
            }
            errorMsg.classList.add('hidden');

            // Set up animation
            animSled.style.transition = 'none';
            animSled.style.transform = `translateX(0px)`;
            wind.className = "wind-lines"; // reset

            let targetDistance = (F * t * 25) / m;
            targetDistance = Math.min(Math.max(targetDistance, 30), 400); 
            let animDuration = Math.max(0.3, 4 - (F * 0.6) + (m * 0.3));

            // Set wind effect based on velocity
            let vel = targetDistance / animDuration;
            if(vel > 100) wind.classList.add("wind-fast");
            else if (vel > 30) wind.classList.add("wind-slow");

            setTimeout(() => {
                animSled.style.transition = `transform ${animDuration}s cubic-bezier(0.3, 0.0, 0.2, 1)`;
                animSled.style.transform = `translateX(${targetDistance}px)`;
            }, 50);

            // Challenge progression
            setTimeout(() => {
                wind.className = "wind-lines";
                if(currentChallenge === 1) {
                    currentChallenge = 2;
                    document.getElementById('sim-challenge-box').innerHTML = `<h3>🎯 Labor-Challenge 2: Minimaler Speed!</h3>
                        <p>Das war zu schnell! Stelle die Regler um auf <strong>minimale Zusatzgeschwindigkeit</strong> (er soll kaum losrollen).</p>`;
                } else if(currentChallenge === 2) {
                    currentChallenge = 3;
                    document.getElementById('sim-challenge-box').classList.add('hidden');
                    document.getElementById('sim-conclusion').classList.remove('hidden');
                }
            }, animDuration * 1000 + 500);
        });

        // Conclusion Check
        document.getElementById('btn-check-s2').addEventListener('click', () => {
            let vM = document.getElementById('sel-var-m').value;
            let vV = document.getElementById('sel-var-v').value;
            let vF = document.getElementById('sel-var-f').value;
            let vT = document.getElementById('sel-var-t').value;
            const fb = document.getElementById('s2-feedback');

            if(vM === 'masse' && vV === 'geschwindigkeit' && vF === 'kraft' && vT === 'dauer') {
                fb.innerHTML = "Wunderbar kombiniert! Lass uns das im Heft festhalten.";
                fb.className = "feedback-msg success";
                document.getElementById('btn-check-s2').textContent = "Zum Hefteintrag";
                document.getElementById('btn-check-s2').onclick = () => this.nextStation('station-2', 'station-3', 50);
            } else {
                fb.innerHTML = "Prüfe deine Zuordnung noch einmal! Schwer = viel Masse, Stark beschleunigt = viel Zusatzgeschwindigkeit.";
                fb.className = "feedback-msg error";
            }
            fb.classList.remove('hidden');
        });

        // --- 3. Station 3 Hefteintrag ---
        let selectedWord = null;
        let selectedElement = null;
        const chips = document.querySelectorAll('.word-chip');
        const blanks = document.querySelectorAll('.drop-blank');
        const targetVars = ["Kraft F", "Einwirkungsdauer Δt", "Masse m", "Zusatzgeschwindigkeit Δv"];
        let blueBoxesFilled = []; 

        const checkCompletionS3 = () => {
            let ublanksOK = true;
            document.querySelectorAll('.underline-blank').forEach(b => { if(!b.classList.contains('filled')) ublanksOK = false; });
            let varsOK = targetVars.every(tw => blueBoxesFilled.includes(tw)) && blueBoxesFilled.length === 4;
            if(ublanksOK && varsOK) {
                document.getElementById('s3-feedback').classList.remove('hidden');
                document.getElementById('btn-next-s3').classList.remove('hidden');
            }
        };

        chips.forEach(chip => {
            chip.addEventListener('click', () => {
                if(chip.classList.contains('used')) return;
                chips.forEach(c => c.style.border = '2px solid transparent');
                chip.style.border = '2px solid white';
                selectedWord = chip.dataset.word;
                selectedElement = chip;
            });
        });

        blanks.forEach(blank => {
            blank.addEventListener('click', () => {
                if(selectedWord && !blank.classList.contains('filled')) {
                    if (blank.classList.contains('var-box')) {
                        if (targetVars.includes(selectedWord)) {
                            blank.textContent = selectedWord;
                            blank.classList.add('filled');
                            selectedElement.classList.add('used');
                            blueBoxesFilled.push(selectedWord);
                            selectedWord = null;
                            selectedElement.style.border = '2px solid transparent';
                        } else {
                            blank.innerHTML = "<span style='color:red'>Passt nicht hier rein</span>";
                            setTimeout(() => blank.innerHTML = "???", 1000);
                        }
                    } else {
                        if(selectedWord === blank.dataset.target) {
                            blank.textContent = selectedWord;
                            blank.classList.add('filled');
                            selectedElement.classList.add('used');
                            selectedWord = null;
                            selectedElement.style.border = '2px solid transparent';
                        } else {
                            let old = blank.innerHTML;
                            blank.innerHTML = "<span style='color:red'>X</span>"; 
                            setTimeout(() => blank.innerHTML = old, 500);
                        }
                    }
                    checkCompletionS3();
                }
            });
        });

        document.getElementById('btn-next-s3').addEventListener('click', () => this.nextStation('station-3', 'station-4', 75));


        // --- 4. Station 4 Exercises ---

        // True/False Logic
        let tfCorrectCount = 0;
        // Correct answers index (1-based): 1=falsch, 2=wahr, 3=wahr, 4=falsch
        const ansTF = { 1: "falsch", 2: "wahr", 3: "wahr", 4: "falsch" };
        
        document.querySelectorAll('.tf-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                let q = this.dataset.q;
                let val = this.dataset.val;
                let fb = document.getElementById(`fb-tf-${q}`);
                
                // Block other button
                this.parentElement.querySelectorAll('.tf-btn').forEach(b => b.disabled = true);
                
                if (ansTF[q] === val) {
                    this.classList.add('selected');
                    this.style.backgroundColor = "var(--success)";
                    fb.innerHTML = "✅ " + fb.innerHTML;
                    tfCorrectCount++;
                } else {
                    this.style.backgroundColor = "var(--error)";
                    fb.innerHTML = "❌ Eigentlich ist die Aussage " + ansTF[q].toUpperCase() + ". " + fb.innerHTML;
                }
                fb.classList.remove('hidden');
                checkFinal();
            });
        });

        // Je-Desto Builder Logic
        let jdCorrectCount = 0;
        const checkJD = (num) => {
            let s1 = document.getElementById(`jd${num}-1`).value;
            let s2 = document.getElementById(`jd${num}-2`).value;
            let fb = document.getElementById(`fb-jd-${num}`);
            
            if(s1 !== "" && s2 !== "") {
                // Rule: Kraft(1) + Dauer(3) direct prop., Mass(2) inverse prop.
                let isCorrect = false;
                if(num === 1 || num === 3) {
                    // Direct proportional
                    if(s1 === s2) isCorrect = true;
                } else {
                    // Inversely proportional (Masse)
                    if(s1 !== s2) isCorrect = true;
                }
                
                if(isCorrect) {
                    fb.innerHTML = "✅ Richtig!";
                    document.getElementById(`jd${num}-1`).disabled = true;
                    document.getElementById(`jd${num}-2`).disabled = true;
                    if(!fb.dataset.done) {
                        fb.dataset.done = "true";
                        jdCorrectCount++;
                        checkFinal();
                    }
                } else {
                    fb.innerHTML = "❌ Falsch!";
                }
            }
        };

        [1,2,3].forEach(num => {
            document.getElementById(`jd${num}-1`).addEventListener('change', () => checkJD(num));
            document.getElementById(`jd${num}-2`).addEventListener('change', () => checkJD(num));
        });

        const checkFinal = () => {
            if(tfCorrectCount + jdCorrectCount === 7) { // 4 TF + 3 JD answers 
                document.getElementById('je-desto-box').classList.remove('hidden'); // Show part 2 if passing part 1... wait, let's keep part 2 visible if part 1 is interacted.
                app.updateProgress(100);
                document.getElementById('final-screen').classList.remove('hidden');
            } else if (tfCorrectCount >= 2) {
                document.getElementById('je-desto-box').classList.remove('hidden'); 
            }
        };
    }
};

document.addEventListener('DOMContentLoaded', () => app.init());
