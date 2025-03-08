import React, { useState, useRef } from 'react';
import { login } from '../services/api';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    audioChunksRef.current = [];

    mediaRecorderRef.current.ondataavailable = (e) => audioChunksRef.current.push(e.data);
    mediaRecorderRef.current.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
      handleSubmit(audioBlob);
    };

    mediaRecorderRef.current.start();
    setIsRecording(true);
    console.log('Recording started');
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    console.log('Recording stopped');
  };

  const handleSubmit = async (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('voice', audioBlob, 'voice.wav');

    try {
      const response = await login(formData);
      localStorage.setItem('token', response.data.token);
      alert('Voice login successful, bro!');
    } catch (error) {
      console.error('Voice login failed:', error);
      alert('Login failed—check console!');
    }
  };

  return (
    <div>
      <h2>Voice Login</h2>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
      />
      <button onClick={startRecording} disabled={isRecording}>
        Start Recording
      </button>
      <button onClick={stopRecording} disabled={!isRecording}>
        Stop & Login
      </button>
      {isRecording && <p>Recording... Say "it’s me!"</p>}
    </div>
  );
};

export default Login;