import { io } from 'socket.io-client';

const socket = io('http://localhost:8081', {
  transports: ['websocket', 'polling']
});

let callInterval = null;
let isRingingOrConnected = false;

socket.on('connect', () => {
  console.log('🔌 Test socket connected as Jack (User 2)');
  socket.emit('join-user-room', 2);
  
  // Start calling and retry every 2 seconds until ringing/connected
  callInterval = setInterval(() => {
    if (!isRingingOrConnected) {
      console.log('📞 Emitting voice call to User 1 (mohammed_yaserr)...');
      socket.emit('call:start', {
        senderId: 2,
        receiverId: 1,
        callerName: 'Jack',
        callerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'
      });
    }
  }, 2000);
});

socket.on('call:ringing', () => {
  console.log('🔔 Ringing: User 1 device is ringing!');
  isRingingOrConnected = true;
  if (callInterval) clearInterval(callInterval);
});

socket.on('call:accepted', () => {
  console.log('✅ Connected: User 1 accepted the call!');
  isRingingOrConnected = true;
  if (callInterval) clearInterval(callInterval);
  
  // Let the call stay active for 30 seconds, then end it
  setTimeout(() => {
    console.log('⏹️ Ending call...');
    socket.emit('call:ended', {
      senderId: 2,
      receiverId: 1
    });
  }, 30000);
});

socket.on('call:rejected', () => {
  console.log('❌ Rejected: User 1 declined the call!');
  socket.disconnect();
  process.exit(0);
});

socket.on('call:ended', () => {
  console.log('⏹️ Ended: Call ended successfully.');
  socket.disconnect();
  process.exit(0);
});

socket.on('call:missed', () => {
  console.log('⏰ Missed: Call timed out with no answer.');
  socket.disconnect();
  process.exit(0);
});
