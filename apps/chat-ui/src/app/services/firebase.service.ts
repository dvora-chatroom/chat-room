import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, query, orderBy, limit, onSnapshot, doc, updateDoc, deleteDoc } from '@firebase/firestore';
import { db } from '../firebase.config';
import { ChatMessage, User } from '@chat-room/shared';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private messagesCollection = collection(db, 'messages');
  private usersCollection = collection(db, 'users');

  constructor() {}

  // Save message to Firebase
  async saveMessage(message: ChatMessage): Promise<void> {
    try {
      await addDoc(this.messagesCollection, {
        id: message.id,
        user: message.user,
        message: message.message,
        timestamp: message.timestamp,
        createdAt: new Date()
      });
    } catch (error) {
      console.error('Error saving message to Firebase:', error);
    }
  }

  // Get messages from Firebase
  getMessages(): Observable<ChatMessage[]> {
    return new Observable(observer => {
      const q = query(this.messagesCollection, orderBy('timestamp', 'desc'), limit(100));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const messages: ChatMessage[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          messages.push({
            id: data['id'] || '',
            user: data['user'] || '',
            message: data['message'] || '',
            timestamp: data['timestamp']?.toDate() || new Date()
          });
        });
        observer.next(messages.reverse());
      }, (error) => {
        console.error('Error getting messages from Firebase:', error);
        observer.error(error);
      });

      return unsubscribe;
    });
  }

  // Save user to Firebase
  async saveUser(user: User): Promise<void> {
    try {
      await addDoc(this.usersCollection, {
        name: user.name,
        socketId: user.socketId,
        joinedAt: new Date(),
        isOnline: true
      });
    } catch (error) {
      console.error('Error saving user to Firebase:', error);
    }
  }

  // Update user online status
  async updateUserStatus(socketId: string, isOnline: boolean): Promise<void> {
    try {
      const q = query(this.usersCollection);
      const unsubscribe = onSnapshot(q, (snapshot) => {
        snapshot.forEach((docSnapshot) => {
          const data = docSnapshot.data();
          if (data['socketId'] === socketId) {
            updateDoc(doc(this.usersCollection, docSnapshot.id), {
              isOnline: isOnline,
              lastSeen: new Date()
            });
          }
        });
      });
      
      // Unsubscribe after finding and updating
      setTimeout(() => unsubscribe(), 1000);
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  }

  // Get online users from Firebase
  getOnlineUsers(): Observable<User[]> {
    return new Observable(observer => {
      const q = query(this.usersCollection);
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const users: User[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data['isOnline']) {
            users.push({
              name: data['name'] || '',
              socketId: data['socketId'] || ''
            });
          }
        });
        observer.next(users);
      }, (error) => {
        console.error('Error getting users from Firebase:', error);
        observer.error(error);
      });

      return unsubscribe;
    });
  }

  // Clean up old messages (keep only last 1000)
  async cleanupOldMessages(): Promise<void> {
    try {
      const q = query(this.messagesCollection, orderBy('timestamp', 'desc'), limit(1000));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const messagesToDelete: string[] = [];
        snapshot.docs.forEach((doc, index) => {
          if (index >= 1000) {
            messagesToDelete.push(doc.id);
          }
        });
        
        // Delete old messages
        messagesToDelete.forEach(async (docId) => {
          await deleteDoc(doc(this.messagesCollection, docId));
        });
      });
      
      setTimeout(() => unsubscribe(), 2000);
    } catch (error) {
      console.error('Error cleaning up old messages:', error);
    }
  }
}
