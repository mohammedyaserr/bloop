import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import authRoutes from './routes/authRoutes.js'
import usersRoutes from './routes/usersRoutes.js'
import { db } from './config/db.js'
import { createServer } from 'http'
import { Server } from 'socket.io'

// Initialize database schema tables on startup
const initTables = () => {
  // Drop old temporary messages table if it exists
  db.query("DROP TABLE IF EXISTS messages", (dropErr) => {
    if (dropErr) {
      console.warn("⚠️ Warning when dropping old messages table:", dropErr.message);
      
      const isConnectionError = dropErr.fatal || 
                                dropErr.code === 'ENOTFOUND' || 
                                dropErr.code === 'ECONNREFUSED' || 
                                dropErr.code === 'PROTOCOL_CONNECTION_LOST' ||
                                dropErr.message.includes('closed state') ||
                                dropErr.message.includes('getaddrinfo');
      
      if (isConnectionError) {
        console.error("⏳ Database connection failed. Retrying table initialization in 5 seconds...");
        setTimeout(initTables, 5000);
        return;
      }
    }

    const createSearchHistoryTable = `
      CREATE TABLE IF NOT EXISTS search_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        searchedUserId INT NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (searchedUserId) REFERENCES users(id) ON DELETE CASCADE
      );
    `;
    db.query(createSearchHistoryTable, (err) => {
      if (err) {
        console.error("❌ Failed to initialize search_history table:", err);
      } else {
        console.log("✅ search_history table initialized successfully");
      }
    });

    const createConversationsTable = `
      CREATE TABLE IF NOT EXISTS conversations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user1Id INT NOT NULL,
        user2Id INT NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user1Id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (user2Id) REFERENCES users(id) ON DELETE CASCADE
      );
    `;
    db.query(createConversationsTable, (err) => {
      if (err) {
        console.error("❌ Failed to initialize conversations table:", err);
      } else {
        console.log("✅ conversations table initialized successfully");
      }
    });

    const createMessagesTable = `
      CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        conversationId INT NOT NULL,
        senderId INT NOT NULL,
        text LONGTEXT NOT NULL,
        is_read TINYINT(1) DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (conversationId) REFERENCES conversations(id) ON DELETE CASCADE,
        FOREIGN KEY (senderId) REFERENCES users(id) ON DELETE CASCADE
      );
    `;
    db.query(createMessagesTable, (err) => {
      if (err) {
        console.error("❌ Failed to initialize messages table:", err);
      } else {
        console.log("✅ messages table initialized successfully");
      }
    });

    const createEmailVerificationTable = `
      CREATE TABLE IF NOT EXISTS email_verification_otps (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        pendingEmail VARCHAR(255) NOT NULL,
        otp VARCHAR(6) NOT NULL,
        expiry DATETIME NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      );
    `;
    db.query(createEmailVerificationTable, (err) => {
      if (err) {
        console.error("❌ Failed to initialize email_verification_otps table:", err);
      } else {
        console.log("✅ email_verification_otps table initialized successfully");
      }
    });

    const createGroupsTable = `
      CREATE TABLE IF NOT EXISTS \`groups\` (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        avatar LONGTEXT,
        created_by INT NOT NULL,
        is_private TINYINT(1) DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      );
    `;
    db.query(createGroupsTable, (err) => {
      if (err) console.error("❌ Failed to initialize groups table:", err);
      else console.log("✅ groups table initialized successfully");
    });

    const createGroupMembersTable = `
      CREATE TABLE IF NOT EXISTS group_members (
        id INT AUTO_INCREMENT PRIMARY KEY,
        group_id INT NOT NULL,
        user_id INT NOT NULL,
        role VARCHAR(50) DEFAULT 'member',
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (group_id) REFERENCES \`groups\`(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `;
    db.query(createGroupMembersTable, (err) => {
      if (err) console.error("❌ Failed to initialize group_members table:", err);
      else console.log("✅ group_members table initialized successfully");
    });

    const createGroupMessagesTable = `
      CREATE TABLE IF NOT EXISTS group_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        group_id INT NOT NULL,
        senderId INT NOT NULL,
        text LONGTEXT NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (group_id) REFERENCES \`groups\`(id) ON DELETE CASCADE,
        FOREIGN KEY (senderId) REFERENCES users(id) ON DELETE CASCADE
      );
    `;
    db.query(createGroupMessagesTable, (err) => {
      if (err) console.error("❌ Failed to initialize group_messages table:", err);
      else console.log("✅ group_messages table initialized successfully");
    });

    const checkIsOnlineColumn = `
      SELECT COUNT(*) AS count FROM information_schema.columns 
      WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'isOnline'
    `;
    db.query(checkIsOnlineColumn, (err, results) => {
      if (!err && results && results[0] && results[0].count === 0) {
        db.query(`ALTER TABLE users ADD COLUMN isOnline TINYINT(1) DEFAULT 0`, (alterErr) => {
          if (alterErr) {
            console.error("❌ Failed to add isOnline column:", alterErr);
          } else {
            console.log("✅ added isOnline column to users table successfully");
          }
        });
      }
    });

    const checkLastSeenColumn = `
      SELECT COUNT(*) AS count FROM information_schema.columns 
      WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'lastSeen'
    `;
    db.query(checkLastSeenColumn, (err, results) => {
      if (!err && results && results[0] && results[0].count === 0) {
        db.query(`ALTER TABLE users ADD COLUMN lastSeen TIMESTAMP NULL DEFAULT NULL`, (alterErr) => {
          if (alterErr) {
            console.error("❌ Failed to add lastSeen column:", alterErr);
          } else {
            console.log("✅ added lastSeen column to users table successfully");
          }
        });
      }
    });

    // is_read column is now initialized directly inside the createMessagesTable definition DDL.

    // Check and add is_read column to group_messages table
    const checkGroupIsReadColumn = `
      SELECT COUNT(*) AS count FROM information_schema.columns 
      WHERE table_schema = DATABASE() AND table_name = 'group_messages' AND column_name = 'is_read'
    `;
    db.query(checkGroupIsReadColumn, (err, results) => {
      if (!err && results && results[0] && results[0].count === 0) {
        db.query(`ALTER TABLE group_messages ADD COLUMN is_read TINYINT(1) DEFAULT 0`, (alterErr) => {
          if (alterErr) console.error("❌ Failed to add is_read column to group_messages:", alterErr);
          else console.log("✅ Added is_read column to group_messages table successfully");
        });
      }
    });

    // Check and add last_read_message_id column to group_members table
    const checkLastReadMsgColumn = `
      SELECT COUNT(*) AS count FROM information_schema.columns 
      WHERE table_schema = DATABASE() AND table_name = 'group_members' AND column_name = 'last_read_message_id'
    `;
    db.query(checkLastReadMsgColumn, (err, results) => {
      if (!err && results && results[0] && results[0].count === 0) {
        db.query(`ALTER TABLE group_members ADD COLUMN last_read_message_id INT DEFAULT 0`, (alterErr) => {
          if (alterErr) console.error("❌ Failed to add last_read_message_id column to group_members:", alterErr);
          else console.log("✅ Added last_read_message_id column to group_members table successfully");
        });
      }
    });
  });
};
initTables();

// Load environment variables from .env file
dotenv.config({ override: true })

const app = express()
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',') 
  : ["http://localhost:5173", "localhost:5173", "https://bloop-af6u.onrender.com"];

app.use(cors(
    {
        origin: allowedOrigins,
        methods:["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        credentials:true
    }
))

// Mount authentication endpoints
app.use('/api/auth', authRoutes)

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')))

// Mount user management endpoints
app.use('/api/users', usersRoutes)

const PORT = process.env.PORT || 8081;
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

const activeCalls = new Map();

io.on("connection", (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  // Helper to mark a user online
  const markUserOnline = (userId) => {
    if (!userId) return;
    const room = `user_${userId}`;
    socket.join(room);
    socket.userId = userId;
    console.log(`👤 Socket ${socket.id} registered (userId: ${userId})`);

    db.query("UPDATE users SET isOnline = 1 WHERE id = ?", [userId], (err) => {
      if (err) {
        console.error(`❌ Failed to update presence for user ${userId}:`, err);
      } else {
        console.log(`🟢 User ${userId} is now ONLINE in database`);
        
        // Broadcast online presence via both event standards
        io.emit("user-online", { userId });
        io.emit("presence_update", {
          userId,
          status: 'online'
        });

        // Send current active users list
        const activeUserIds = Array.from(io.sockets.sockets.values())
          .map(s => s.userId)
          .filter(Boolean);
        io.emit("active-users", activeUserIds);
      }
    });
  };

  // Support both join-user-room (Web) and user_online (Mobile)
  socket.on("join-user-room", (userId) => {
    markUserOnline(userId);
  });

  socket.on("user_online", (data) => {
    markUserOnline(data?.userId);
  });

  // Support manual user_offline event
  socket.on("user_offline", (data) => {
    const userId = data?.userId || socket.userId;
    if (userId) {
      db.query("UPDATE users SET isOnline = 0, lastSeen = CURRENT_TIMESTAMP WHERE id = ?", [userId], (err) => {
        if (err) {
          console.error(`❌ Failed to update presence offline for user ${userId}:`, err);
        } else {
          console.log(`🔴 User ${userId} is now OFFLINE (manual event)`);
          
          io.emit("user-offline", { userId });
          io.emit("presence_update", {
            userId,
            status: 'offline',
            lastSeen: new Date()
          });

          // Broadcast new active users list
          const activeUserIds = Array.from(io.sockets.sockets.values())
            .map(s => s.userId)
            .filter(Boolean);
          io.emit("active-users", activeUserIds);
        }
      });
    }
  });

  // Typing start (supports both formats)
  const handleTypingStart = (data) => {
    const { conversationId, senderId, receiverId } = data;
    console.log(`✏️ User ${senderId} started typing in conversation ${conversationId}`);
    if (receiverId) {
      const room = `user_${receiverId}`;
      io.to(room).emit("typing-start", { conversationId, senderId, receiverId });
      io.to(room).emit("typing_start", { conversationId, senderId, receiverId });
    }
  };

  socket.on("typing-start", handleTypingStart);
  socket.on("typing_start", handleTypingStart);

  // Typing stop (supports both formats)
  const handleTypingStop = (data) => {
    const { conversationId, senderId, receiverId } = data;
    console.log(`🛑 User ${senderId} stopped typing in conversation ${conversationId}`);
    if (receiverId) {
      const room = `user_${receiverId}`;
      io.to(room).emit("typing-stop", { conversationId, senderId, receiverId });
      io.to(room).emit("typing_stop", { conversationId, senderId, receiverId });
    }
  };

  socket.on("typing-stop", handleTypingStop);
  socket.on("typing_stop", handleTypingStop);

  // Handle realtime new message routing
  socket.on("new-message", (data) => {
    const { message, conversationId, senderId, receiverId, group } = data;
    console.log(`✉️ Realtime Message: sender ${senderId} to ${group ? 'group' : 'user ' + receiverId} in conv ${conversationId}`);
    
    if (group) {
      socket.broadcast.emit("new-message", data);
    } else if (receiverId) {
      io.to(`user_${receiverId}`).emit("new-message", data);
    }
  });

  // Handle realtime message-read notification
  socket.on("message-read", (data) => {
    const { conversationId, userId } = data;
    console.log(`👁️ Realtime Read Receipt: conversationId ${conversationId} read by ${userId}`);
    socket.broadcast.emit("message-read", data);
  });

  // ==========================================
  // REAL-TIME VOICE CALLING RELAYS
  // ==========================================
  
  // User A starts call -> Relayed to User B
  socket.on("call:start", (data) => {
    const { senderId, receiverId, callerName, callerAvatar } = data;
    console.log("CALL START RECEIVED", data);
    activeCalls.set(Number(senderId), Number(receiverId));
    activeCalls.set(Number(receiverId), Number(senderId));
    console.log("INCOMING CALL FORWARDED", receiverId);
    io.to(`user_${receiverId}`).emit("incoming-call", data);
  });

  // User B's device is ringing -> Relayed to User A
  socket.on("call:ringing", (data) => {
    const { senderId, receiverId } = data;
    console.log(`[CallEvent Server] call:ringing | Sender: ${senderId} | Receiver: ${receiverId} | Timestamp: ${new Date().toISOString()} | Payload:`, data);
    io.to(`user_${senderId}`).emit("call:ringing", data);
  });

  // User B accepts call -> Relayed to User A
  socket.on("call:accepted", (data) => {
    const { senderId, receiverId } = data;
    console.log("CALL ACCEPTED RECEIVED", data);
    io.to(`user_${senderId}`).emit("call:accepted", data);
  });

  // User B rejects call -> Relayed to User A
  socket.on("call:rejected", (data) => {
    const { senderId, receiverId } = data;
    console.log("CALL REJECTED RECEIVED", data);
    activeCalls.delete(Number(senderId));
    activeCalls.delete(Number(receiverId));
    io.to(`user_${senderId}`).emit("call:rejected", data);
  });

  // Either user ends call -> Relayed to both users
  socket.on("call:ended", (data) => {
    const { senderId, receiverId } = data;
    console.log(`[CallEvent Server] call:ended | Sender: ${senderId} | Receiver: ${receiverId} | Timestamp: ${new Date().toISOString()} | Payload:`, data);
    activeCalls.delete(Number(senderId));
    activeCalls.delete(Number(receiverId));
    io.to(`user_${senderId}`).emit("call:ended", data);
    io.to(`user_${receiverId}`).emit("call:ended", data);
  });

  // Call missed (no answer timeout) -> Relayed to User A
  socket.on("call:missed", (data) => {
    const { senderId, receiverId } = data;
    console.log(`[CallEvent Server] call:missed | Sender: ${senderId} | Receiver: ${receiverId} | Timestamp: ${new Date().toISOString()} | Payload:`, data);
    activeCalls.delete(Number(senderId));
    activeCalls.delete(Number(receiverId));
    io.to(`user_${senderId}`).emit("call:missed", data);
  });

  // WebRTC Offer relay
  socket.on("webrtc-offer", (data) => {
    const { senderId, receiverId } = data;
    console.log(`[CallEvent Server] webrtc-offer | Sender: ${senderId} | Receiver: ${receiverId} | Timestamp: ${new Date().toISOString()} | SDP type: ${data.sdp?.type}`);
    io.to(`user_${receiverId}`).emit("webrtc-offer", data);
  });

  // WebRTC Answer relay
  socket.on("webrtc-answer", (data) => {
    const { senderId, receiverId } = data;
    console.log(`[CallEvent Server] webrtc-answer | Sender: ${senderId} | Receiver: ${receiverId} | Timestamp: ${new Date().toISOString()} | SDP type: ${data.sdp?.type}`);
    io.to(`user_${receiverId}`).emit("webrtc-answer", data);
  });

  // WebRTC ICE Candidate relay
  socket.on("ice-candidate", (data) => {
    const { senderId, receiverId } = data;
    console.log(`[CallEvent Server] ice-candidate | Sender: ${senderId} | Receiver: ${receiverId} | Timestamp: ${new Date().toISOString()} | Candidate:`, data.candidate?.candidate);
    io.to(`user_${receiverId}`).emit("ice-candidate", data);
  });

  socket.on("disconnect", () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
    const userId = socket.userId;
    if (userId) {
      // Check if user is in an active call
      const peerId = activeCalls.get(Number(userId));
      if (peerId) {
        console.log(`🔌 Call participant ${userId} disconnected. Notifying ${peerId}`);
        console.log(`[CallEvent Server] call:ended (disconnect auto) | Sender: ${userId} | Receiver: ${peerId} | Timestamp: ${new Date().toISOString()}`);
        io.to(`user_${peerId}`).emit("call:ended", {
          senderId: userId,
          receiverId: peerId,
          statusText: 'User Disconnected'
        });
        activeCalls.delete(Number(userId));
        activeCalls.delete(Number(peerId));
      }

      // Check if there are any other sockets open for this same user
      const otherSockets = Array.from(io.sockets.sockets.values())
        .filter(s => s.userId === userId && s.id !== socket.id);

      if (otherSockets.length === 0) {
        // No other active connections for this user, mark as offline in DB
        db.query("UPDATE users SET isOnline = 0, lastSeen = CURRENT_TIMESTAMP WHERE id = ?", [userId], (err) => {
          if (err) {
            console.error(`❌ Failed to update presence offline for user ${userId}:`, err);
          } else {
            console.log(`🔴 User ${userId} is now OFFLINE in database`);
            
            // Broadcast offline state via both event standards
            io.emit("user-offline", { userId });
            io.emit("presence_update", {
              userId,
              status: 'offline',
              lastSeen: new Date()
            });

            // Broadcast new active users list
            const activeUserIds = Array.from(io.sockets.sockets.values())
              .map(s => s.userId)
              .filter(Boolean);
            io.emit("active-users", activeUserIds);
          }
        });
      } else {
        // Still has other tabs open, just broadcast updated list
        const activeUserIds = Array.from(io.sockets.sockets.values())
          .map(s => s.userId)
          .filter(Boolean);
        io.emit("active-users", activeUserIds);
      }
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});