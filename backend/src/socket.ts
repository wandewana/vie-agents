import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { AuthUtils } from './utils/auth';
import { MessageModel } from './models/Message';
import { UserModel } from './models/User';
import { GroupModel } from './models/Group';

interface AuthenticatedSocket extends Socket {
  user?: {
    userId: number;
    email: string;
    username: string;
  };
}

interface Socket {
  id: string;
  handshake: any;
  join: (room: string) => void;
  leave: (room: string) => void;
  to: (room: string) => {
    emit: (event: string, data: any) => void;
  };
  emit: (event: string, data: any) => void;
}

export class SocketManager {
  private io: SocketIOServer;
  private userSockets: Map<number, string> = new Map();

  constructor(server: HttpServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        methods: ["GET", "POST"]
      }
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication error: No token provided'));
        }

        const decoded = AuthUtils.verifyToken(token);
        socket.user = decoded;
        next();
      } catch (error) {
        next(new Error('Authentication error: Invalid token'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`User ${socket.user?.username} connected`);

      // Store user's socket connection
      if (socket.user) {
        this.userSockets.set(socket.user.userId, socket.id);
      }

      // Join user to their personal room
      if (socket.user) {
        socket.join(`user_${socket.user.userId}`);
      }

      // Handle direct message
      socket.on('send_direct_message', async (data) => {
        try {
          const { recipient_id, content } = data;
          const sender_id = socket.user!.userId;

          if (!recipient_id || !content) {
            socket.emit('error', { message: 'Recipient ID and content are required' });
            return;
          }

          // Create message in database
          const message = await MessageModel.create({
            content,
            sender_id,
            recipient_id,
          });

          const messageWithUser = await MessageModel.findById(message.id);

          // Emit to sender
          socket.emit('new_direct_message', messageWithUser);

          // Emit to recipient if online
          const recipientSocketId = this.userSockets.get(recipient_id);
          if (recipientSocketId) {
            this.io.to(recipientSocketId).emit('new_direct_message', messageWithUser);
          }

          console.log(`Direct message sent from ${socket.user?.username} to user ${recipient_id}`);
        } catch (error) {
          console.error('Send direct message error:', error);
          socket.emit('error', { message: 'Failed to send message' });
        }
      });

      // Handle group message
      socket.on('send_group_message', async (data) => {
        try {
          const { group_id, content } = data;
          const sender_id = socket.user!.userId;

          if (!group_id || !content) {
            socket.emit('error', { message: 'Group ID and content are required' });
            return;
          }

          // Verify user is member of group
          const isMember = await GroupModel.isMember(group_id, sender_id);
          if (!isMember) {
            socket.emit('error', { message: 'You are not a member of this group' });
            return;
          }

          // Create message in database
          const message = await MessageModel.create({
            content,
            sender_id,
            group_id,
          });

          const messageWithUser = await MessageModel.findById(message.id);

          // Emit to all group members
          this.io.to(`group_${group_id}`).emit('new_group_message', messageWithUser);

          console.log(`Group message sent to group ${group_id} by ${socket.user?.username}`);
        } catch (error) {
          console.error('Send group message error:', error);
          socket.emit('error', { message: 'Failed to send message' });
        }
      });

      // Join group room
      socket.on('join_group', (data) => {
        const { group_id } = data;
        if (group_id) {
          socket.join(`group_${group_id}`);
          console.log(`User ${socket.user?.username} joined group ${group_id}`);
        }
      });

      // Leave group room
      socket.on('leave_group', (data) => {
        const { group_id } = data;
        if (group_id) {
          socket.leave(`group_${group_id}`);
          console.log(`User ${socket.user?.username} left group ${group_id}`);
        }
      });

      // Handle typing indicators
      socket.on('typing_start', (data) => {
        const { conversation_id, type } = data; // type: 'direct' or 'group'
        if (type === 'direct' && data.recipient_id) {
          const recipientSocketId = this.userSockets.get(data.recipient_id);
          if (recipientSocketId) {
            this.io.to(recipientSocketId).emit('user_typing', {
              user_id: socket.user!.userId,
              username: socket.user!.username,
            });
          }
        } else if (type === 'group' && data.group_id) {
          socket.to(`group_${data.group_id}`).emit('user_typing', {
            user_id: socket.user!.userId,
            username: socket.user!.username,
          });
        }
      });

      socket.on('typing_stop', (data) => {
        const { conversation_id, type } = data;
        if (type === 'direct' && data.recipient_id) {
          const recipientSocketId = this.userSockets.get(data.recipient_id);
          if (recipientSocketId) {
            this.io.to(recipientSocketId).emit('user_stop_typing', {
              user_id: socket.user!.userId,
            });
          }
        } else if (type === 'group' && data.group_id) {
          socket.to(`group_${data.group_id}`).emit('user_stop_typing', {
            user_id: socket.user!.userId,
          });
        }
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log(`User ${socket.user?.username} disconnected`);
        if (socket.user) {
          this.userSockets.delete(socket.user.userId);
        }
      });
    });
  }

  // Method to emit events to specific users
  public emitToUser(userId: number, event: string, data: any) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
    }
  }

  // Method to emit events to all users in a group
  public emitToGroup(groupId: number, event: string, data: any) {
    this.io.to(`group_${groupId}`).emit(event, data);
  }

  public getIO(): SocketIOServer {
    return this.io;
  }
}