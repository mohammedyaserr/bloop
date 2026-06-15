import { db } from '../config/db.js'
import nodemailer from 'nodemailer'

export const registerUser = (req, res) => {
  const { fullName, username, email, password } = req.body;

  // Basic validation check
  if (!fullName || !username || !email || !password) {
    return res.status(400).json({ 
      success: false, 
      message: "All fields (fullName, username, email, password) are required." 
    });
  }

  // Insert query using plain-text password (no bcrypt hashing as requested)
  const insertQuery = `
    INSERT INTO users (fullName, username, email, password) 
    VALUES (?, ?, ?, ?)
  `;

  db.query(
    insertQuery, 
    [fullName, username, email, password], 
    (err, result) => {
      if (err) {
        // Handle duplicate entry error (ER_DUP_ENTRY)
        if (err.code === 'ER_DUP_ENTRY') {
          if (err.message.includes('username')) {
            return res.status(409).json({ 
              success: false, 
              message: "Username is already taken." 
            });
          }
          if (err.message.includes('email')) {
            return res.status(409).json({ 
              success: false, 
              message: "Email is already registered." 
            });
          }
          return res.status(409).json({ 
            success: false, 
            message: "Username or Email already exists." 
          });
        }
        
        console.error("❌ Database query error:", err);
        return res.status(500).json({ 
          success: false, 
          message: "Internal server error." 
        });
      }

      return res.status(201).json({
        success: true,
        message: "User registered successfully!",
        userId: result.insertId
      });
    }
  )
}

export const loginUser = (req, res) => {
  const { emailOrUsername, password } = req.body;

  if (!emailOrUsername || !password) {
    return res.status(400).json({ 
      success: false, 
      message: "Both email/username and password are required." 
    });
  }

  const findQuery = `
    SELECT * FROM users 
    WHERE email = ? OR username = ?
  `;

  db.query(findQuery, [emailOrUsername, emailOrUsername], (err, results) => {
    if (err) {
      console.error("❌ Database query error:", err);
      return res.status(500).json({ 
        success: false, 
        message: "Internal server error." 
      });
    }

    if (results.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid email/username or password." 
      });
    }

    const user = results[0];

    if (user.password !== password) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid email/username or password." 
      });
    }

    db.query('UPDATE users SET isOnline = 1 WHERE id = ?', [user.id], (updateErr) => {
      if (updateErr) {
        console.error("❌ Failed to update isOnline on login:", updateErr);
      }
      return res.status(200).json({
        success: true,
        message: "Login successful!",
        user: {
          id: user.id,
          fullName: user.fullName,
          username: user.username,
          email: user.email
        }
      });
    });
  });
};

const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      Buffer.from(base64, 'base64')
        .toString()
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.error("❌ Failed to decode JWT:", err);
    return null;
  }
};

export const googleRegisterUser = (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({ success: false, message: "Google credential is required." });
  }

  const payload = decodeJWT(credential);
  if (!payload) {
    return res.status(400).json({ success: false, message: "Invalid Google credential token." });
  }

  const { email, name } = payload;
  const fullName = name || "Google User";
  
  // Generate a clean, unique username from email prefix
  const emailPrefix = email.split('@')[0];
  const username = emailPrefix.replace(/[^a-zA-Z0-9_]/g, '') + Math.floor(Math.random() * 1000);

  // Check if email already exists in DB
  db.query("SELECT * FROM users WHERE email = ?", [email], (err, users) => {
    if (err) {
      console.error("❌ Database query error:", err);
      return res.status(500).json({ success: false, message: "Database query error." });
    }

    if (users.length > 0) {
      // User exists, sign them in directly!
      return res.status(200).json({
        success: true,
        message: "Google sign-in successful!",
        user: {
          id: users[0].id,
          fullName: users[0].fullName,
          username: users[0].username,
          email: users[0].email
        }
      });
    }

    // User does not exist, insert them as a new Google registered user
    const generatedPassword = `google_oauth_${Math.random().toString(36).substring(2, 10)}`;

    const insertQuery = `
      INSERT INTO users (fullName, username, email, password) 
      VALUES (?, ?, ?, ?)
    `;

    db.query(insertQuery, [fullName, username, email, generatedPassword], (insertErr, result) => {
      if (insertErr) {
        console.error("❌ Database insert error:", insertErr);
        return res.status(500).json({ success: false, message: "Failed to register user." });
      }

      return res.status(201).json({
        success: true,
        message: "User registered with Google successfully!",
        userId: result.insertId,
        user: {
          id: result.insertId,
          fullName,
          username,
          email
        }
      });
    });
  });
};

export const getUsers = (req, res) => {
  const { search } = req.query;
  let query = "SELECT id, fullName, username, email, isOnline, lastSeen, avatar, avatarColor, phone FROM users";
  const params = [];

  if (search) {
    query += " WHERE username LIKE ? OR fullName LIKE ?";
    params.push(`%${search}%`, `%${search}%`);
  }

  db.query(query, params, (err, results) => {
    if (err) {
      console.error("❌ Database query error:", err);
      return res.status(500).json({ success: false, message: "Internal server error." });
    }
    return res.status(200).json({ success: true, users: results });
  });
};

export const getSearchHistory = (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ success: false, message: "userId is required." });
  }

  const query = `
    SELECT sh.id AS historyId, u.id, u.fullName, u.username, u.email, u.avatar, u.avatarColor
    FROM search_history sh
    JOIN users u ON sh.searchedUserId = u.id
    WHERE sh.userId = ?
    ORDER BY sh.createdAt DESC
    LIMIT 10
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("❌ Database query error fetching search history:", err);
      return res.status(500).json({ success: false, message: "Internal server error." });
    }
    return res.status(200).json({ success: true, history: results });
  });
};

export const addSearchHistory = (req, res) => {
  const { userId, searchedUserId } = req.body;

  if (!userId || !searchedUserId) {
    return res.status(400).json({ success: false, message: "userId and searchedUserId are required." });
  }

  // Delete duplicate searches first to refresh order on duplicate
  const deleteQuery = `
    DELETE FROM search_history 
    WHERE userId = ? AND searchedUserId = ?
  `;

  db.query(deleteQuery, [userId, searchedUserId], (deleteErr) => {
    if (deleteErr) {
      console.error("❌ Database error deleting duplicate search history:", deleteErr);
      return res.status(500).json({ success: false, message: "Database error." });
    }

    const insertQuery = `
      INSERT INTO search_history (userId, searchedUserId) 
      VALUES (?, ?)
    `;

    db.query(insertQuery, [userId, searchedUserId], (insertErr, result) => {
      if (insertErr) {
        console.error("❌ Database error adding search history:", insertErr);
        return res.status(500).json({ success: false, message: "Database error." });
      }

      return res.status(201).json({
        success: true,
        message: "Search history added successfully!",
        historyId: result.insertId
      });
    });
  });
};

export const clearSearchHistory = (req, res) => {
  const userId = req.body.userId || req.query.userId;

  if (!userId) {
    return res.status(400).json({ success: false, message: "userId is required." });
  }

  const query = "DELETE FROM search_history WHERE userId = ?";

  db.query(query, [userId], (err) => {
    if (err) {
      console.error("❌ Database error clearing search history:", err);
      return res.status(500).json({ success: false, message: "Internal server error." });
    }
    return res.status(200).json({ success: true, message: "Search history cleared successfully!" });
  });
};

export const logoutUser = (req, res) => {
  const userId = req.body.userId || req.query.userId;

  if (!userId) {
    return res.status(400).json({ success: false, message: "userId is required." });
  }

  const query = "UPDATE users SET isOnline = 0, lastSeen = CURRENT_TIMESTAMP WHERE id = ?";

  db.query(query, [userId], (err) => {
    if (err) {
      console.error("❌ Database error setting offline on logout:", err);
      return res.status(500).json({ success: false, message: "Internal server error." });
    }
    return res.status(200).json({ success: true, message: "Logged out successfully!" });
  });
};

// Check if conversation exists, or create new one
export const createConversation = (req, res) => {
  const user1 = req.body.user1Id || req.body.senderId;
  const user2 = req.body.user2Id || req.body.receiverId;

  if (!user1 || !user2) {
    return res.status(400).json({ success: false, message: "Both user IDs are required." });
  }

  // Mathematically sort IDs to keep a single unique pair in DB
  const user1Id = Math.min(parseInt(user1), parseInt(user2));
  const user2Id = Math.max(parseInt(user1), parseInt(user2));

  const checkQuery = "SELECT id FROM conversations WHERE user1Id = ? AND user2Id = ?";
  db.query(checkQuery, [user1Id, user2Id], (err, results) => {
    if (err) {
      console.error("❌ Database query error:", err);
      return res.status(500).json({ success: false, message: "Internal server error." });
    }

    if (results.length > 0) {
      return res.status(200).json({
        success: true,
        message: "Conversation already exists.",
        conversationId: results[0].id,
        isNew: false
      });
    }

    const insertQuery = "INSERT INTO conversations (user1Id, user2Id) VALUES (?, ?)";
    db.query(insertQuery, [user1Id, user2Id], (insertErr, result) => {
      if (insertErr) {
        console.error("❌ Database insert error:", insertErr);
        return res.status(500).json({ success: false, message: "Internal server error." });
      }

      return res.status(201).json({
        success: true,
        message: "Conversation created successfully!",
        conversationId: result.insertId,
        isNew: true
      });
    });
  });
};

// Get all conversations for a user with last message
export const getConversations = (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ success: false, message: "userId is required." });
  }

  const query = `
    SELECT 
      c.id AS id,
      u.id AS otherUserId,
      u.fullName,
      u.username,
      u.email,
      u.isOnline,
      u.lastSeen,
      u.avatar,
      u.avatarColor,
      m.text AS lastMessage,
      m.createdAt AS lastMessageTime,
      m.senderId AS lastMessageSenderId,
      m.is_read AS lastMessageIsRead,
      u2.fullName AS lastMessageSenderName,
      (SELECT COUNT(*) FROM messages WHERE messages.conversationId = c.id AND messages.senderId != ? AND messages.is_read = 0) AS unreadCount
    FROM conversations c
    INNER JOIN users u ON u.id = CASE WHEN c.user1Id = ? THEN c.user2Id ELSE c.user1Id END
    LEFT JOIN (
      SELECT conversationId, MAX(id) AS maxMsgId
      FROM messages
      GROUP BY conversationId
    ) last_msg ON c.id = last_msg.conversationId
    LEFT JOIN messages m ON m.id = last_msg.maxMsgId
    LEFT JOIN users u2 ON m.senderId = u2.id
    WHERE c.user1Id = ? OR c.user2Id = ?
  `;

  db.query(query, [userId, userId, userId, userId], (err, conversations) => {
    if (err) {
      console.error("❌ Database query error:", err);
      return res.status(500).json({ success: false, message: "Internal server error." });
    }

    const groupsQuery = `
      SELECT 
        CONCAT('group_', g.id) AS id,
        g.id AS groupId,
        g.name AS fullName,
        g.description,
        g.avatar,
        g.created_by AS createdBy,
        g.is_private AS isPrivate,
        gm.role,
        gm.joined_at,
        gm_count.memberCount,
        m.text AS lastMessage,
        m.createdAt AS lastMessageTime,
        m.senderId AS lastMessageSenderId,
        NULL AS lastMessageIsRead,
        u2.fullName AS lastMessageSenderName,
        (
          SELECT COUNT(*) FROM group_messages gm2
          WHERE gm2.group_id = g.id 
            AND gm2.senderId != ?
            AND gm2.id > IFNULL(gm.last_read_message_id, 0)
        ) AS unreadCount
      FROM \`groups\` g
      INNER JOIN group_members gm ON g.id = gm.group_id AND gm.user_id = ?
      LEFT JOIN (
        SELECT group_id, COUNT(*) AS memberCount
        FROM group_members
        GROUP BY group_id
      ) gm_count ON g.id = gm_count.group_id
      LEFT JOIN (
        SELECT group_id, MAX(id) AS maxMsgId
        FROM group_messages
        GROUP BY group_id
      ) last_msg ON g.id = last_msg.group_id
      LEFT JOIN group_messages m ON m.id = last_msg.maxMsgId
      LEFT JOIN users u2 ON m.senderId = u2.id
    `;

    db.query(groupsQuery, [userId, userId], (groupErr, groups) => {
      if (groupErr) {
        console.error("❌ Failed to fetch groups:", groupErr);
        return res.status(200).json({ success: true, conversations });
      }

      const formattedGroups = groups.map(g => ({
        id: g.id,
        otherUserId: null,
        fullName: g.fullName,
        username: 'group',
        online: true,
        avatar: g.avatar,
        avatarColor: 'from-indigo-400 to-violet-500',
        lastMessage: g.lastMessage,
        lastMessageTime: g.lastMessageTime,
        lastMessageSenderId: g.lastMessageSenderId,
        lastMessageSenderName: g.lastMessageSenderName,
        group: true,
        memberCount: g.memberCount,
        createdBy: g.createdBy,
        description: g.description,
        isPrivate: g.isPrivate === 1,
        unreadCount: g.unreadCount || 0
      }));

      // Merge and sort by newest first
      const merged = [...conversations.map(c => ({ ...c, group: false })), ...formattedGroups].sort((a, b) => {
        const timeA = a.lastMessageTime ? new Date(a.lastMessageTime) : new Date(0);
        const timeB = b.lastMessageTime ? new Date(b.lastMessageTime) : new Date(0);
        return timeB - timeA;
      });

      return res.status(200).json({ success: true, conversations: merged });
    });
  });
};

// Get all messages for a specific conversation
export const getMessages = (req, res) => {
  const { conversationId } = req.params;

  if (!conversationId) {
    return res.status(400).json({ success: false, message: "conversationId is required." });
  }

  if (String(conversationId).startsWith('group_')) {
    const groupId = parseInt(conversationId.replace('group_', ''));
    const query = `
      SELECT 
        gm.id, 
        CONCAT('group_', gm.group_id) AS conversationId, 
        gm.senderId, 
        gm.text, 
        gm.createdAt,
        u.fullName AS senderName,
        u.avatar AS senderAvatar,
        u.avatarColor AS senderAvatarColor
      FROM group_messages gm
      INNER JOIN users u ON gm.senderId = u.id
      WHERE gm.group_id = ?
      ORDER BY gm.createdAt ASC
    `;
    db.query(query, [groupId], (err, results) => {
      if (err) {
        console.error("❌ Database query error:", err);
        return res.status(500).json({ success: false, message: "Internal server error." });
      }
      return res.status(200).json({ success: true, messages: results });
    });
  } else {
    const query = `
      SELECT id, conversationId, senderId, text, createdAt, is_read 
      FROM messages 
      WHERE conversationId = ?
      ORDER BY createdAt ASC
    `;

    db.query(query, [conversationId], (err, results) => {
      if (err) {
        console.error("❌ Database query error:", err);
        return res.status(500).json({ success: false, message: "Internal server error." });
      }
      return res.status(200).json({ success: true, messages: results });
    });
  }
};

// Send a message under a conversation (auto-creates conversation if sender + receiver supplied)
export const sendMessage = (req, res) => {
  let { conversationId, senderId, receiverId, text } = req.body;

  if (!senderId || !text) {
    return res.status(400).json({ success: false, message: "senderId and text are required." });
  }

  const performInsert = (convId) => {
    const query = "INSERT INTO messages (conversationId, senderId, text) VALUES (?, ?, ?)";
    db.query(query, [convId, senderId, text], (err, result) => {
      if (err) {
        console.error("❌ Database query error:", err);
        return res.status(500).json({ success: false, message: "Internal server error." });
      }

      return res.status(201).json({
        success: true,
        message: "Message sent successfully!",
        messageId: result.insertId,
        newMessage: {
          id: result.insertId,
          conversationId: convId,
          senderId,
          text,
          createdAt: new Date()
        }
      });
    });
  };

  if (conversationId) {
    if (String(conversationId).startsWith('group_')) {
      const groupId = parseInt(conversationId.replace('group_', ''));
      const query = "INSERT INTO group_messages (group_id, senderId, text) VALUES (?, ?, ?)";
      db.query(query, [groupId, senderId, text], (err, result) => {
        if (err) {
          console.error("❌ Group message insert error:", err);
          return res.status(500).json({ success: false, message: "Internal server error." });
        }

        db.query("SELECT fullName, avatar, avatarColor FROM users WHERE id = ?", [senderId], (userErr, userResults) => {
          const senderName = (!userErr && userResults.length > 0) ? userResults[0].fullName : 'User';
          const senderAvatar = (!userErr && userResults.length > 0) ? userResults[0].avatar : null;
          const senderAvatarColor = (!userErr && userResults.length > 0) ? userResults[0].avatarColor : 'from-indigo-400 to-violet-500';
          
          return res.status(201).json({
            success: true,
            message: "Group message sent successfully!",
            messageId: result.insertId,
            newMessage: {
              id: result.insertId,
              conversationId: conversationId,
              senderId: senderId,
              senderName: senderName,
              senderAvatar: senderAvatar,
              senderAvatarColor: senderAvatarColor,
              text: text,
              createdAt: new Date()
            }
          });
        });
      });
    } else {
      performInsert(conversationId);
    }
  } else if (receiverId) {
    // Dynamically retrieve or insert conversation first
    const u1 = Math.min(parseInt(senderId), parseInt(receiverId));
    const u2 = Math.max(parseInt(senderId), parseInt(receiverId));

    const checkQuery = "SELECT id FROM conversations WHERE user1Id = ? AND user2Id = ?";
    db.query(checkQuery, [u1, u2], (err, results) => {
      if (err) {
        console.error("❌ Database query error:", err);
        return res.status(500).json({ success: false, message: "Internal server error." });
      }

      if (results.length > 0) {
        performInsert(results[0].id);
      } else {
        const insertQuery = "INSERT INTO conversations (user1Id, user2Id) VALUES (?, ?)";
        db.query(insertQuery, [u1, u2], (insertErr, result) => {
          if (insertErr) {
            console.error("❌ Database insert error:", insertErr);
            return res.status(500).json({ success: false, message: "Internal server error." });
          }
          performInsert(result.insertId);
        });
      }
    });
  } else {
    return res.status(400).json({ success: false, message: "Either conversationId or receiverId must be supplied." });
  }
};

// Fetch complete profile info for a user
export const getProfile = (req, res) => {
  const { userId } = req.params;
  
  if (!userId) {
    return res.status(400).json({ success: false, message: "userId parameter is required." });
  }
  
  const query = "SELECT id, fullName, username, email, isOnline, lastSeen, bio, phone, location, website, avatar, avatarColor, statusMessage, joinedAt FROM users WHERE id = ?";
  
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("❌ Database query error fetching profile:", err);
      return res.status(500).json({ success: false, message: "Internal server error." });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ success: false, message: "User profile not found." });
    }
    
    return res.status(200).json({ success: true, profile: results[0] });
  });
};

// Update profile details for a user
export const updateProfile = (req, res) => {
  const { userId } = req.params;
  const { fullName, username, bio, phone, location, website, avatar, avatarColor, statusMessage } = req.body;
  
  if (!userId) {
    return res.status(400).json({ success: false, message: "userId parameter is required." });
  }
  
  const query = `
    UPDATE users 
    SET fullName = ?, username = ?, bio = ?, phone = ?, location = ?, website = ?, avatar = ?, avatarColor = ?, statusMessage = ?
    WHERE id = ?
  `;
  
  db.query(
    query, 
    [fullName, username, bio, phone, location, website, avatar, avatarColor, statusMessage, userId], 
    (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ success: false, message: "Username is already taken." });
        }
        console.error("❌ Database query error updating profile:", err);
        return res.status(500).json({ success: false, message: "Internal server error." });
      }
      
      return res.status(200).json({ 
        success: true, 
        message: "Profile updated successfully!",
        updatedFields: { fullName, username, bio, phone, location, website, avatar, avatarColor, statusMessage }
      });
    }
  );
};

// Check username availability
export const checkUsernameAvailability = (req, res) => {
  const { username } = req.params;
  const { excludeUserId } = req.query;

  if (!username) {
    return res.status(400).json({ 
      available: false, 
      message: "Username parameter is required." 
    });
  }

  // Normalize to lowercase
  const normalizedUsername = username.toLowerCase().trim();

  // Validate formatting:
  // - allow numbers and underscore
  // - minimum 3 characters, maximum 20 characters
  // - no spaces
  // - no special symbols except underscore
  const usernameRegex = /^[a-z0-9_]{3,20}$/;
  if (!usernameRegex.test(normalizedUsername)) {
    return res.status(200).json({ 
      available: false, 
      message: "Username must be 3-20 characters, lowercase, with only letters, numbers, and underscores." 
    });
  }

  let query = 'SELECT id FROM users WHERE username = ?';
  let queryParams = [normalizedUsername];

  if (excludeUserId) {
    query += ' AND id != ?';
    queryParams.push(excludeUserId);
  }

  db.query(query, queryParams, (err, results) => {
    if (err) {
      console.error("❌ Error checking username availability:", err);
      return res.status(500).json({ 
        available: false, 
        message: "Internal server error during verification." 
      });
    }

    if (results.length > 0) {
      return res.status(200).json({ 
        available: false, 
        message: "This username is already taken" 
      });
    }

    return res.status(200).json({ 
      available: true 
    });
  });
};

// Check phone number availability
export const checkPhoneAvailability = (req, res) => {
  const { phone } = req.params;
  const { excludeUserId } = req.query;

  if (!phone) {
    return res.status(400).json({ 
      available: false, 
      message: "Phone parameter is required." 
    });
  }

  const cleanedPhone = phone.trim();

  if (cleanedPhone.length < 5) {
    return res.status(200).json({
      available: false,
      message: "Please enter a valid phone number."
    });
  }

  let query = 'SELECT id FROM users WHERE phone = ?';
  let queryParams = [cleanedPhone];

  if (excludeUserId) {
    query += ' AND id != ?';
    queryParams.push(excludeUserId);
  }

  db.query(query, queryParams, (err, results) => {
    if (err) {
      console.error("❌ Error checking phone availability:", err);
      return res.status(500).json({ 
        available: false, 
        message: "Internal server error during verification." 
      });
    }

    if (results.length > 0) {
      return res.status(200).json({ 
        available: false, 
        message: "This phone number is already connected to another account." 
      });
    }

    return res.status(200).json({ 
      available: true 
    });
  });
};

// Beautiful Visual Terminal Email Delivery Logger
const logOtpToConsole = (email, otp) => {
  const envelope = `
  ┌────────────────────────────────────────────────────────┐
  │                                                        │
  │                  📬 BLOOP MAIL DELIVERY                │
  │                                                        │
  │   To:      ${email.padEnd(44)}│
  │   Subject: Verify Your New Email                       │
  │                                                        │
  │   We received a request to update your email.          │
  │   Please use the 6-digit verification code below:      │
  │                                                        │
  │                ┌──────────────────────┐                │
  │                │       ${otp}         │                │
  │                └──────────────────────┘                │
  │                                                        │
  │   This code is valid for 5 minutes.                     │
  │   If you did not request this, please ignore.          │
  │                                                        │
  └────────────────────────────────────────────────────────┘
  `;
  console.log(envelope);
};

// Unified dynamic mail dispatcher helper (NodeMailer SMTP with console fallback)
const sendVerificationEmail = async (email, otp) => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: parseInt(SMTP_PORT) || 587,
        secure: parseInt(SMTP_PORT) === 465,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS
        }
      });

      const mailOptions = {
        from: SMTP_FROM || `"Bloop Messenger" <${SMTP_USER}>`,
        to: email,
        subject: "Verify Your New Email - Bloop",
        text: `We received a request to update your email. Please use the following 6-digit verification code: ${otp}\n\nThis code is valid for 5 minutes.`,
        html: `
          <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h2 style="color: #4f46e5; margin: 0; font-size: 24px;">📬 Bloop Mail Delivery</h2>
              <p style="color: #64748b; font-size: 14px; margin: 4px 0 0 0;">Verify Your New Email Address</p>
            </div>
            <p style="color: #334155; font-size: 15px; line-height: 24px; margin: 0 0 16px 0;">We received a request to update your email on your Bloop account. Please use the 6-digit verification code below to authorize this change:</p>
            <div style="text-align: center; margin: 24px 0; background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 12px; padding: 16px;">
              <span style="font-family: monospace; font-size: 32px; font-weight: 800; color: #1e293b; letter-spacing: 4px;">${otp}</span>
            </div>
            <p style="color: #64748b; font-size: 13px; line-height: 20px; margin: 0 0 24px 0;">This code is valid for <strong>5 minutes</strong>. If you did not request this email change, please ignore this message securely.</p>
            <div style="border-top: 1px solid #f1f5f9; padding-top: 16px; text-align: center;">
              <span style="font-size: 11px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Bloop System • Handcrafted in local schema</span>
            </div>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log(`✨ [NODEMAILER] Email OTP successfully sent to ${email}`);
      return true;
    } catch (mailErr) {
      console.error("❌ [NODEMAILER] Failed to send real email. Falling back to terminal display.", mailErr);
    }
  }

  // Fallback to beautiful terminal console envelope
  logOtpToConsole(email, otp);
  return false;
};

// Send OTP code to pending email address
export const sendEmailOtp = (req, res) => {
  const { userId, newEmail } = req.body;

  if (!userId || !newEmail) {
    return res.status(400).json({ success: false, message: "userId and newEmail parameters are required." });
  }

  // Validate format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(newEmail)) {
    return res.status(400).json({ success: false, message: "Please provide a valid email format." });
  }

  // Prevent duplicate email address check (against active users)
  db.query("SELECT id FROM users WHERE email = ? AND id != ?", [newEmail.trim().toLowerCase(), userId], (err, results) => {
    if (err) {
      console.error("❌ Database query error checking email:", err);
      return res.status(500).json({ success: false, message: "Internal server error." });
    }

    if (results.length > 0) {
      return res.status(409).json({ success: false, message: "This email address is already taken by another account." });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Delete any old pending OTP codes for this user first
    db.query("DELETE FROM email_verification_otps WHERE userId = ?", [userId], (deleteErr) => {
      if (deleteErr) {
        console.error("❌ Failed to clear old OTPs:", deleteErr);
      }

      // Insert new OTP record
      db.query(
        "INSERT INTO email_verification_otps (userId, pendingEmail, otp, expiry) VALUES (?, ?, ?, ?)",
        [userId, newEmail.trim().toLowerCase(), otp, expiry],
        async (insertErr) => {
          if (insertErr) {
            console.error("❌ Database query error saving OTP:", insertErr);
            return res.status(500).json({ success: false, message: "Internal server error." });
          }

          // Trigger unified mail dispatcher helper
          await sendVerificationEmail(newEmail.trim().toLowerCase(), otp);

          return res.status(200).json({ 
            success: true, 
            message: "Verification code sent to your new email address." 
          });
        }
      );
    });
  });
};

// Verify OTP and save the new email address
export const verifyEmailOtp = (req, res) => {
  const { userId, otp } = req.body;

  if (!userId || !otp) {
    return res.status(400).json({ success: false, message: "userId and otp parameters are required." });
  }

  // Select the pending verification code
  db.query(
    "SELECT pendingEmail, otp, expiry FROM email_verification_otps WHERE userId = ? ORDER BY id DESC LIMIT 1",
    [userId],
    (err, results) => {
      if (err) {
        console.error("❌ Database query error reading OTP:", err);
        return res.status(500).json({ success: false, message: "Internal server error." });
      }

      if (results.length === 0) {
        return res.status(404).json({ success: false, message: "No verification request found for this user." });
      }

      const record = results[0];

      // Check OTP matching
      if (record.otp !== otp.trim()) {
        return res.status(400).json({ success: false, message: "Invalid verification code" });
      }

      // Check Expiry
      if (new Date() > new Date(record.expiry)) {
        return res.status(400).json({ success: false, message: "Verification code has expired. Please request a new one." });
      }

      // Successful verification! Commit pending email to the users table
      const newEmail = record.pendingEmail;
      
      db.query(
        "UPDATE users SET email = ? WHERE id = ?",
        [newEmail, userId],
        (updateErr) => {
          if (updateErr) {
            if (updateErr.code === 'ER_DUP_ENTRY') {
              return res.status(409).json({ success: false, message: "This email address is already taken." });
            }
            console.error("❌ Failed to update email in users table:", updateErr);
            return res.status(500).json({ success: false, message: "Failed to update email in user database record." });
          }

          // Clear verification OTP database record
          db.query("DELETE FROM email_verification_otps WHERE userId = ?", [userId]);

          return res.status(200).json({
            success: true,
            message: "✓ Email verified successfully",
            updatedEmail: newEmail
          });
        }
      );
    }
  );
};

// Create a new group conversation and assign members
export const createGroup = (req, res) => {
  const { name, description, avatar, created_by, is_private, members } = req.body;

  if (!name || !created_by || !members || !Array.isArray(members)) {
    return res.status(400).json({ success: false, message: "Group name, creator ID, and members array are required." });
  }

  // Insert group details
  const insertGroupQuery = "INSERT INTO \`groups\` (name, description, avatar, created_by, is_private) VALUES (?, ?, ?, ?, ?)";
  db.query(insertGroupQuery, [name, description || "", avatar || "", created_by, is_private ? 1 : 0], (err, groupResult) => {
    if (err) {
      console.error("❌ Failed to create group:", err);
      return res.status(500).json({ success: false, message: "Failed to create group in database." });
    }

    const groupId = groupResult.insertId;

    // Prepare members values: Creator as 'admin', others as 'member'
    const membershipValues = [
      [groupId, created_by, 'admin']
    ];

    members.forEach(userId => {
      if (parseInt(userId) !== parseInt(created_by)) {
        membershipValues.push([groupId, userId, 'member']);
      }
    });

    const insertMembersQuery = "INSERT INTO group_members (group_id, user_id, role) VALUES ?";
    db.query(insertMembersQuery, [membershipValues], (membersErr) => {
      if (membersErr) {
        console.error("❌ Failed to insert group members:", membersErr);
        // Delete the orphaned group to maintain integrity
        db.query("DELETE FROM \`groups\` WHERE id = ?", [groupId]);
        return res.status(500).json({ success: false, message: "Failed to allocate group members." });
      }

      // Add a system welcome message to the group
      const welcomeMsg = `👥 Group "${name}" created successfully.`;
      db.query("INSERT INTO group_messages (group_id, senderId, text) VALUES (?, ?, ?)", [groupId, created_by, welcomeMsg], () => {
        return res.status(201).json({
          success: true,
          message: "Group created successfully!",
          group: {
            id: `group_${groupId}`,
            groupId: groupId,
            fullName: name,
            description: description,
            avatar: avatar,
            createdBy: created_by,
            isPrivate: is_private,
            group: true,
            memberCount: membershipValues.length,
            lastMessage: welcomeMsg,
            lastMessageTime: new Date()
          }
        });
      });
    });
  });
};

// Fetch full group metadata along with participant directory
export const getGroupInfo = (req, res) => {
  const { groupId } = req.params;

  if (!groupId) {
    return res.status(400).json({ success: false, message: "groupId parameter is required." });
  }

  const groupSelect = "SELECT * FROM \`groups\` WHERE id = ?";
  db.query(groupSelect, [groupId], (err, groups) => {
    if (err) {
      console.error("❌ Database group select error:", err);
      return res.status(500).json({ success: false, message: "Internal server error." });
    }

    if (groups.length === 0) {
      return res.status(404).json({ success: false, message: "Group not found." });
    }

    const group = groups[0];

    // Fetch members detail
    const membersQuery = `
      SELECT 
        gm.role, 
        gm.joined_at AS joinedAt,
        u.id, 
        u.fullName, 
        u.username, 
        u.email, 
        u.avatar, 
        u.avatarColor,
        u.isOnline,
        u.lastSeen
      FROM group_members gm
      INNER JOIN users u ON gm.user_id = u.id
      WHERE gm.group_id = ?
    `;

    db.query(membersQuery, [groupId], (membersErr, members) => {
      if (membersErr) {
        console.error("❌ Database query error fetching group members:", membersErr);
        return res.status(500).json({ success: false, message: "Internal server error." });
      }

      return res.status(200).json({
        success: true,
        group: {
          id: `group_${group.id}`,
          groupId: group.id,
          name: group.name,
          description: group.description,
          avatar: group.avatar,
          createdBy: group.created_by,
          isPrivate: group.is_private === 1,
          createdAt: group.createdAt,
          members: members
        }
      });
    });
  });
};

// Add members to an existing group
export const addMembersToGroup = (req, res) => {
  const { groupId } = req.params;
  const { members } = req.body; // Array of user IDs e.g. [4, 5]

  if (!groupId || !members || !Array.isArray(members) || members.length === 0) {
    return res.status(400).json({ success: false, message: "groupId and members array are required." });
  }

  const membershipValues = members.map(userId => [groupId, userId, 'member']);

  const insertQuery = "INSERT INTO group_members (group_id, user_id, role) VALUES ?";
  db.query(insertQuery, [membershipValues], (err) => {
    if (err) {
      console.error("❌ Failed to add members to group:", err);
      return res.status(500).json({ success: false, message: "Internal server error." });
    }
    return res.status(200).json({ success: true, message: "Members added successfully!" });
  });
};

// Leave group
export const leaveGroup = (req, res) => {
  const { groupId, userId } = req.params;

  if (!groupId || !userId) {
    return res.status(400).json({ success: false, message: "groupId and userId parameters are required." });
  }

  const deleteQuery = "DELETE FROM group_members WHERE group_id = ? AND user_id = ?";
  db.query(deleteQuery, [groupId, userId], (err) => {
    if (err) {
      console.error("❌ Failed to leave group:", err);
      return res.status(500).json({ success: false, message: "Internal server error." });
    }
    return res.status(200).json({ success: true, message: "Left group successfully." });
  });
};

// Delete group - Admin only
export const deleteGroup = (req, res) => {
  const { groupId } = req.params;
  const { userId } = req.body;

  if (!groupId || !userId) {
    return res.status(400).json({ success: false, message: "groupId and requester userId are required." });
  }

  // Double check admin role
  const checkRoleQuery = "SELECT role FROM group_members WHERE group_id = ? AND user_id = ?";
  db.query(checkRoleQuery, [groupId, userId], (roleErr, results) => {
    if (roleErr) {
      console.error("❌ Role verification error:", roleErr);
      return res.status(500).json({ success: false, message: "Internal server error." });
    }

    if (results.length === 0 || results[0].role !== 'admin') {
      return res.status(403).json({ success: false, message: "Unauthorized: Only administrators can delete this group." });
    }

    const deleteGroupQuery = "DELETE FROM \`groups\` WHERE id = ?";
    db.query(deleteGroupQuery, [groupId], (err) => {
      if (err) {
        console.error("❌ Group deletion error:", err);
        return res.status(500).json({ success: false, message: "Failed to delete group." });
      }
      return res.status(200).json({ success: true, message: "Group deleted successfully." });
    });
  });
};

// Mark all messages in a conversation/group as read
export const markAsRead = (req, res) => {
  const { conversationId, userId } = req.body;

  if (!conversationId || !userId) {
    return res.status(400).json({ success: false, message: "conversationId and userId are required." });
  }

  if (conversationId.toString().startsWith('group_')) {
    const groupId = conversationId.replace('group_', '');
    // Group Chat: Update member's last_read_message_id to the max group_messages id
    const getMaxMsgQuery = "SELECT IFNULL(MAX(id), 0) AS maxId FROM group_messages WHERE group_id = ?";
    db.query(getMaxMsgQuery, [groupId], (err, maxResult) => {
      if (err) {
        console.error("❌ Failed to get max group message ID:", err);
        return res.status(500).json({ success: false, message: "Failed to mark group as read." });
      }
      
      const maxId = maxResult[0]?.maxId || 0;
      const updateMemberQuery = "UPDATE group_members SET last_read_message_id = ? WHERE group_id = ? AND user_id = ?";
      db.query(updateMemberQuery, [maxId, groupId, userId], (upErr) => {
        if (upErr) {
          console.error("❌ Failed to update last_read_message_id:", upErr);
          return res.status(500).json({ success: false, message: "Failed to mark group as read." });
        }
        return res.status(200).json({ success: true, message: "Group conversation marked as read." });
      });
    });
  } else {
    // 1-on-1 Chat: Update is_read = 1 for all messages sent by the other user in this conversation
    const query = "UPDATE messages SET is_read = 1 WHERE conversationId = ? AND senderId != ? AND is_read = 0";
    db.query(query, [conversationId, userId], (err) => {
      if (err) {
        console.error("❌ Failed to mark messages as read:", err);
        return res.status(500).json({ success: false, message: "Failed to mark messages as read." });
      }
      return res.status(200).json({ success: true, message: "Conversation marked as read." });
    });
  }
};
