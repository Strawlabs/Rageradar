const crypto = require('crypto');

class DataEncryption {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.key = Buffer.from(process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex'), 'hex');
    
    if (!process.env.ENCRYPTION_KEY) {
      console.warn('⚠️  ENCRYPTION_KEY not set in environment variables. Using temporary key.');
    }
  }

  encrypt(text) {
    if (!text) return null;
    
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipher(this.algorithm, this.key);
      cipher.setAAD(Buffer.from('RageRadar', 'utf8'));
      
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const authTag = cipher.getAuthTag();
      
      return {
        encrypted,
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex')
      };
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  decrypt(encryptedData) {
    if (!encryptedData || typeof encryptedData !== 'object') return null;
    
    try {
      const decipher = crypto.createDecipher(this.algorithm, this.key);
      decipher.setAAD(Buffer.from('RageRadar', 'utf8'));
      decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
      
      let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  // Hash sensitive data for logging/audit purposes
  hashForAudit(data) {
    if (!data) return null;
    return crypto.createHash('sha256').update(data.toString()).digest('hex').substring(0, 16);
  }

  // Encrypt sensitive fields in user data
  encryptSensitiveData(userData) {
    if (!userData || typeof userData !== 'object') return userData;
    
    const sensitiveFields = ['email', 'companyName', 'contactNumber', 'companyEmail'];
    const encrypted = { ...userData };
    
    sensitiveFields.forEach(field => {
      if (encrypted[field] && typeof encrypted[field] === 'string') {
        try {
          encrypted[field] = this.encrypt(encrypted[field]);
        } catch (error) {
          console.error(`Failed to encrypt field ${field}:`, error);
          // Don't fail the entire operation, but log the error
        }
      }
    });
    
    return encrypted;
  }

  // Decrypt sensitive fields in user data
  decryptSensitiveData(userData) {
    if (!userData || typeof userData !== 'object') return userData;
    
    const sensitiveFields = ['email', 'companyName', 'contactNumber', 'companyEmail'];
    const decrypted = { ...userData };
    
    sensitiveFields.forEach(field => {
      if (decrypted[field] && typeof decrypted[field] === 'object' && decrypted[field].encrypted) {
        try {
          decrypted[field] = this.decrypt(decrypted[field]);
        } catch (error) {
          console.error(`Failed to decrypt field ${field}:`, error);
          // Set to null if decryption fails
          decrypted[field] = null;
        }
      }
    });
    
    return decrypted;
  }

  // Generate secure random tokens
  generateSecureToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  // Secure password hashing (for additional security beyond Supabase)
  hashPassword(password, salt = null) {
    if (!salt) {
      salt = crypto.randomBytes(16).toString('hex');
    }
    
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return { hash, salt };
  }

  // Verify password hash
  verifyPassword(password, hash, salt) {
    const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return hash === verifyHash;
  }
}

// Singleton instance
const encryption = new DataEncryption();

module.exports = {
  DataEncryption,
  encryption
};