console.log('Renderer process is ready.');

let mediaRecorder;
let audioChunks = [];
let audioBlob;
let audioUrl;
let audio;

let recordingInterval;
let recordingDuration = 0;

const recordButton = document.getElementById('start-record');
const playbackButton = document.getElementById('playback');
const reRecordButton = document.getElementById('re-record');
const progressBar = document.getElementById('progress-bar');

recordButton.addEventListener('click', async () => {
    if (recordButton.textContent === '开始录音') {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);

            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = () => {
                clearInterval(recordingInterval);
                recordingDuration = 0; // Reset recording duration
                document.getElementById('recording-duration').textContent = '录音时长: 0 秒'; // Reset duration display
                progressBar.value = 0; // Reset progress bar
                audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                audioUrl = URL.createObjectURL(audioBlob);
                audio = new Audio(audioUrl);
                audioChunks = []; // Clear chunks for re-recording
                recordButton.style.display = 'none'; // Hide the record button
                playbackButton.style.display = 'inline'; // Show the playback button
                reRecordButton.style.display = 'inline'; // Show the re-record button
            };

            mediaRecorder.onstart = () => {
                progressBar.value = 0;
                progressBar.max = 100; // Set progress bar max to 100 for visual feedback
                recordingDuration = 0; // Initialize recording duration
                document.getElementById('recording-duration').textContent = '录音时长: 0 秒'; // Initialize duration display
            };

            mediaRecorder.start();
            console.log('Recording started');
            recordButton.textContent = '停止录音';

            // Simulate progress bar update during recording
            recordingInterval = setInterval(() => {
                recordingDuration++;
                document.getElementById('recording-duration').textContent = `录音时长: ${recordingDuration} 秒`;
                progressBar.value += 2; // Increment progress bar value
                if (progressBar.value >= 100) {
                    progressBar.value = 100; // Cap progress bar at 100
                }
            }, 1000);
        } catch (error) {
            console.error('Error accessing microphone:', error);
            alert('无法访问麦克风，请检查权限设置。');
        }
    } else if (recordButton.textContent === '停止录音') {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            console.log('Recording stopped');
        }
    }
});

playbackButton.addEventListener('click', () => {
    if (audio) {
        audio.play();
        console.log('Playback started');

        // Update progress bar during playback
        const updateProgress = () => {
            progressBar.value = (audio.currentTime / audio.duration) * 100;
            if (!audio.paused && !audio.ended) {
                requestAnimationFrame(updateProgress);
            }
        };
        updateProgress();
    } else {
        console.log('No audio to play');
    }
});

reRecordButton.addEventListener('click', () => {
    audioChunks = [];
    audioBlob = null;
    audioUrl = null;
    audio = null;
    recordButton.style.display = 'inline'; // Show the record button
    playbackButton.style.display = 'none'; // Hide the playback button
    reRecordButton.style.display = 'none'; // Hide the re-record button
    recordButton.textContent = '开始录音';
    console.log('Re-recording setup complete');
});

// Initially hide playback and re-record buttons
playbackButton.style.display = 'none';
reRecordButton.style.display = 'none';

document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'r': // Start or stop recording, or playback if recording is stopped
            if (recordButton.style.display !== 'none') {
                recordButton.click();
            } else if (playbackButton.style.display !== 'none') {
                playbackButton.click();
            }
            break;
        case 'w': // Re-record
            reRecordButton.click();
            break;
        default:
            break;
    }
});
