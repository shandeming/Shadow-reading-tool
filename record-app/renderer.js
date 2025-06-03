console.log('Renderer process is ready.');

let mediaRecorder;
let audioChunks = [];
let audioBlob;
let audioUrl;
let audio;

let recordingInterval;
let recordingDuration = 0;
let recordingAnimationId = null; // 用于控制录音进度动画帧

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
                if (recordingAnimationId) {
                    cancelAnimationFrame(recordingAnimationId);
                    recordingAnimationId = null;
                }
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

                // Stop any ongoing progress updates
                cancelAnimationFrame(updateRecordingProgress);
            };

            mediaRecorder.onstart = () => {
                progressBar.value = 0;
                progressBar.max = 100; // Set progress bar max to 100 for visual feedback
                recordingDuration = 0; // Initialize recording duration
                document.getElementById('recording-duration').textContent = '录音时长: 0 秒'; // Initialize duration display

                recordButton.textContent = '停止录音'; // Update button text
                recordButton.style.display = 'inline'; // Show the stop recording button
                playbackButton.style.display = 'none'; // Hide the playback button
                reRecordButton.style.display = 'inline'; // Show the re-record button during recording

                const updateRecordingProgress = () => {
                    recordingDuration += 0.1; // Increment duration in smaller steps
                    document.getElementById('recording-duration').textContent = `录音时长: ${Math.floor(recordingDuration)} 秒`;
                    progressBar.value = (recordingDuration / 60) * 100; // Update progress bar value

                    if (recordingDuration < 60 && mediaRecorder && mediaRecorder.state === 'recording') {
                        recordingAnimationId = requestAnimationFrame(updateRecordingProgress);
                    } else {
                        mediaRecorder.stop(); // Automatically stop recording after 60 seconds
                    }
                };
                recordingAnimationId = requestAnimationFrame(updateRecordingProgress);
            };

            mediaRecorder.start();
            console.log('Recording started');
        } catch (error) {
            console.error('Error accessing microphone:', error);
            alert('无法访问麦克风，请检查权限设置。');
        }
    } else if (recordButton.textContent === '停止录音') {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            if (recordingAnimationId) {
                cancelAnimationFrame(recordingAnimationId);
                recordingAnimationId = null;
            }
            console.log('Recording stopped');
        }
    }
});

reRecordButton.addEventListener('click', async () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop(); // Stop the current recording if active
    }

    audioChunks = [];
    audioBlob = null;
    audioUrl = null;
    audio = null;
    progressBar.value = 0; // Reset progress bar
    document.getElementById('recording-duration').textContent = '录音时长: 0 秒'; // Reset duration display
    console.log('Re-recording setup complete');

    // Automatically start a new recording
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
            if (recordingAnimationId) {
                cancelAnimationFrame(recordingAnimationId);
                recordingAnimationId = null;
            }
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

            // Stop any ongoing progress updates
            cancelAnimationFrame(updateRecordingProgress);
        };

        mediaRecorder.onstart = () => {
            progressBar.value = 0;
            progressBar.max = 100; // Set progress bar max to 100 for visual feedback
            recordingDuration = 0; // Initialize recording duration
            document.getElementById('recording-duration').textContent = '录音时长: 0 秒'; // Initialize duration display

            recordButton.textContent = '停止录音'; // Update button text
            recordButton.style.display = 'inline'; // Show the stop recording button
            playbackButton.style.display = 'none'; // Hide the playback button
            reRecordButton.style.display = 'inline'; // Show the re-record button during recording

            const updateRecordingProgress = () => {
                recordingDuration += 0.1; // Increment duration in smaller steps
                document.getElementById('recording-duration').textContent = `录音时长: ${Math.floor(recordingDuration)} 秒`;
                progressBar.value = (recordingDuration / 60) * 100; // Update progress bar value

                if (recordingDuration < 60 && mediaRecorder && mediaRecorder.state === 'recording') {
                    recordingAnimationId = requestAnimationFrame(updateRecordingProgress);
                } else {
                    mediaRecorder.stop(); // Automatically stop recording after 60 seconds
                }
            };
            recordingAnimationId = requestAnimationFrame(updateRecordingProgress);
        };

        mediaRecorder.start();
        console.log('Re-recording started');
    } catch (error) {
        console.error('Error accessing microphone:', error);
        alert('无法访问麦克风，请检查权限设置。');
    }
});

playbackButton.addEventListener('click', () => {
    if (audio) {
        audio.play();
        console.log('Playback started');

        playbackButton.style.display = 'none'; // Hide playback button during playback
        reRecordButton.style.display = 'inline'; // Show re-record button during playback

        const updateProgress = () => {
            progressBar.value = (audio.currentTime / audio.duration) * 100;
            if (!audio.paused && !audio.ended) {
                requestAnimationFrame(updateProgress);
            } else {
                playbackButton.style.display = 'inline'; // Show playback button after playback ends
            }
        };
        requestAnimationFrame(updateProgress); // Use requestAnimationFrame for smoother updates
    } else {
        console.log('No audio to play');
    }
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
