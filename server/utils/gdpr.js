const crypto = require('crypto');
const { encryption } = require('./encryption');
const { logger } = require('../middleware/security');
const { supabase } = require('../supabase');

class GDPRCompliance {
  constructor() {
    this.supabase = supabase;
  }

  // Data subject access request (Article 15)
  async exportUserData(userId) {
    try {
      logger.info('GDPR_DATA_EXPORT_REQUESTED', {
        userId: encryption.hashForAudit(userId)
      });

      // Get user profile data
      const { data: userData, error: userError } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError || !userData) {
        throw new Error('User not found');
      }

      // Get analysis history
      const { data: analyses } = await this.supabase
        .from('analyses')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      const analysisHistory = (analyses || []).map(row => ({
        id: row.id,
        brandName: row.brand_name,
        createdAt: row.created_at,
        sentimentScore: row.weighted_sentiment_score,
        totalMentions: row.total_mentions,
        platforms: Object.keys(row.platform_stats || {})
      }));

      // Get audit logs related to this user
      const { data: auditRows } = await this.supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', encryption.hashForAudit(userId))
        .order('timestamp', { ascending: false })
        .limit(100);

      const auditLogs = (auditRows || []).map(row => ({
        action: row.action,
        timestamp: row.timestamp,
        details: row.details
      }));

      // Decrypt sensitive data for export
      const mappedUserData = {
        email: userData.email,
        firstName: userData.first_name,
        lastName: userData.last_name,
        companyName: userData.company_name,
        companyEmail: userData.company_email,
        contactNumber: userData.contact_number,
        jobTitle: userData.job_title,
        companySize: userData.company_size
      };
      const decryptedUserData = encryption.decryptSensitiveData(mappedUserData);
      
      const exportData = {
        personalData: {
          userId: userId,
          email: decryptedUserData.email,
          firstName: decryptedUserData.firstName,
          lastName: decryptedUserData.lastName,
          companyName: decryptedUserData.companyName,
          companyEmail: decryptedUserData.companyEmail,
          contactNumber: decryptedUserData.contactNumber,
          jobTitle: decryptedUserData.jobTitle,
          companySize: decryptedUserData.companySize,
          plan: userData.plan,
          createdAt: userData.created_at,
          lastLogin: userData.last_login,
          gdprConsent: userData.gdpr_consent
        },
        analysisHistory: analysisHistory,
        auditTrail: auditLogs,
        dataProcessingPurposes: [
          {
            purpose: 'Brand sentiment analysis',
            legalBasis: 'Legitimate interest',
            dataTypes: ['Brand mentions', 'Public social media posts'],
            retention: '1 year after analysis'
          },
          {
            purpose: 'User account management',
            legalBasis: 'Contract performance',
            dataTypes: ['Email', 'Name', 'Company information'],
            retention: '2 years after account deletion'
          }
        ],
        exportMetadata: {
          exportedAt: new Date().toISOString(),
          exportedBy: 'GDPR Data Subject Request',
          dataRetentionPolicy: '2 years from last activity',
          contactForQuestions: 'privacy@rageradar.com'
        }
      };

      // Log the export
      await this.logGDPRActivity('DATA_EXPORT', userId, {
        recordCount: analysisHistory.length,
        auditLogCount: auditLogs.length
      });

      return exportData;
    } catch (error) {
      logger.error('GDPR_DATA_EXPORT_FAILED', {
        userId: encryption.hashForAudit(userId),
        error: error.message
      });
      throw error;
    }
  }

  // Right to be forgotten (Article 17)
  async deleteUserData(userId, reason = 'user_request', requestedBy = 'user') {
    try {
      logger.info('GDPR_DATA_DELETION_REQUESTED', {
        userId: encryption.hashForAudit(userId),
        reason,
        requestedBy
      });

      // Get user data before deletion for audit
      const { data: userData } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      // Delete user analyses, consents, events, notifications, and profile
      await this.supabase.from('analyses').delete().eq('user_id', userId);
      await this.supabase.from('gdpr_consent').delete().eq('user_id', userId);
      await this.supabase.from('events').delete().eq('user_id', userId);
      await this.supabase.from('notifications').delete().eq('user_id', userId);
      
      const { error: deleteUserError } = await this.supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (deleteUserError) throw deleteUserError;

      // Create deletion audit record (with anonymized data)
      const deletionRecord = {
        action: 'GDPR_DATA_DELETION',
        user_id: encryption.hashForAudit(userId),
        timestamp: new Date().toISOString(),
        details: {
          reason,
          requestedBy,
          dataTypes: ['user_profile', 'analysis_history', 'consent_records'],
          originalEmail: userData ? encryption.hashForAudit(userData.email || 'unknown') : null,
          deletionCompleted: true
        },
        compliance: 'GDPR'
      };
      
      await this.supabase.from('audit_logs').insert(deletionRecord);
      
      // Delete from Supabase Auth
      try {
        await this.supabase.auth.admin.deleteUser(userId);
        logger.info('SUPABASE_AUTH_USER_DELETED', {
          userId: encryption.hashForAudit(userId)
        });
      } catch (authError) {
        logger.error('SUPABASE_AUTH_DELETION_FAILED', {
          userId: encryption.hashForAudit(userId),
          error: authError.message
        });
      }

      // Log successful deletion
      await this.logGDPRActivity('DATA_DELETION_COMPLETED', userId, {
        reason,
        requestedBy
      });

      return {
        success: true,
        deletedRecords: {
          userProfile: 1,
          analyses: 'all',
          consentRecords: 'all'
        },
        deletionDate: new Date().toISOString()
      };
    } catch (error) {
      logger.error('GDPR_DATA_DELETION_FAILED', {
        userId: encryption.hashForAudit(userId),
        error: error.message
      });
      throw error;
    }
  }

  // Data portability (Article 20)
  async generateDataExport(userId, format = 'json') {
    const userData = await this.exportUserData(userId);
    
    if (format === 'csv') {
      return this.convertToCSV(userData);
    }
    
    return JSON.stringify(userData, null, 2);
  }

  // Convert data to CSV format
  convertToCSV(userData) {
    const csvRows = [];
    
    // Personal data
    csvRows.push('Personal Data');
    csvRows.push('Field,Value');
    Object.entries(userData.personalData).forEach(([key, value]) => {
      csvRows.push(`${key},"${value || ''}"`);  
    });
    
    csvRows.push(''); // Empty row
    
    // Analysis history
    csvRows.push('Analysis History');
    if (userData.analysisHistory.length > 0) {
      const headers = Object.keys(userData.analysisHistory[0]);
      csvRows.push(headers.join(','));
      
      userData.analysisHistory.forEach(analysis => {
        const row = headers.map(header => `"${analysis[header] || ''}"`).join(',');
        csvRows.push(row);
      });
    }
    
    return csvRows.join('\n');
  }

  // Consent management (Article 7)
  async updateConsent(userId, consentTypes, ipAddress, userAgent) {
    try {
      const consentRecord = {
        user_id: userId,
        consent: {
          analytics: consentTypes.analytics || false,
          marketing: consentTypes.marketing || false,
          functional: consentTypes.functional !== false, // Default to true
          dataProcessing: consentTypes.dataProcessing || false
        },
        metadata: {
          updatedAt: new Date().toISOString(),
          ipAddress: encryption.hashForAudit(ipAddress),
          userAgent: userAgent ? encryption.hashForAudit(userAgent) : null,
          consentVersion: '1.0',
          method: 'explicit_user_action'
        }
      };

      // Store consent record
      await this.supabase.from('gdpr_consent').insert(consentRecord);
      
      // Update user document with current consent
      await this.supabase
        .from('users')
        .update({
          gdpr_consent: consentRecord.consent,
          gdpr_consent_updated: new Date().toISOString()
        })
        .eq('id', userId);

      await this.logGDPRActivity('CONSENT_UPDATED', userId, {
        consentTypes: Object.keys(consentTypes).filter(key => consentTypes[key])
      });

      return consentRecord;
    } catch (error) {
      logger.error('GDPR_CONSENT_UPDATE_FAILED', {
        userId: encryption.hashForAudit(userId),
        error: error.message
      });
      throw error;
    }
  }

  // Data rectification (Article 16)
  async rectifyUserData(userId, updates, requestedBy = 'user') {
    try {
      // Encrypt sensitive fields in updates
      const encryptedUpdates = encryption.encryptSensitiveData(updates);
      
      // Map camelCase updates to snake_case table columns
      const snakeUpdates = {};
      if (encryptedUpdates.email) snakeUpdates.email = encryptedUpdates.email;
      if (encryptedUpdates.firstName) snakeUpdates.first_name = encryptedUpdates.firstName;
      if (encryptedUpdates.lastName) snakeUpdates.last_name = encryptedUpdates.lastName;
      if (encryptedUpdates.companyName) snakeUpdates.company_name = encryptedUpdates.companyName;
      if (encryptedUpdates.companyEmail) snakeUpdates.company_email = encryptedUpdates.companyEmail;
      if (encryptedUpdates.contactNumber) snakeUpdates.contact_number = encryptedUpdates.contactNumber;
      if (encryptedUpdates.jobTitle) snakeUpdates.job_title = encryptedUpdates.jobTitle;
      if (encryptedUpdates.companySize) snakeUpdates.company_size = encryptedUpdates.companySize;
      
      snakeUpdates.updated_at = new Date().toISOString();

      await this.supabase
        .from('users')
        .update(snakeUpdates)
        .eq('id', userId);
      
      await this.logGDPRActivity('DATA_RECTIFICATION', userId, {
        updatedFields: Object.keys(updates),
        requestedBy
      });

      return { success: true, updatedAt: new Date().toISOString() };
    } catch (error) {
      logger.error('GDPR_DATA_RECTIFICATION_FAILED', {
        userId: encryption.hashForAudit(userId),
        error: error.message
      });
      throw error;
    }
  }

  // Check if user has given consent for specific purpose
  async hasConsent(userId, purpose) {
    try {
      const { data: userData, error } = await this.supabase
        .from('users')
        .select('gdpr_consent')
        .eq('id', userId)
        .single();

      if (error || !userData) return false;
      const consent = userData.gdpr_consent || {};
      
      return consent[purpose] === true;
    } catch (error) {
      logger.error('GDPR_CONSENT_CHECK_FAILED', {
        userId: encryption.hashForAudit(userId),
        purpose,
        error: error.message
      });
      return false;
    }
  }

  // Log GDPR-related activities
  async logGDPRActivity(action, userId, details = {}) {
    try {
      const logEntry = {
        action: `GDPR_${action}`,
        user_id: encryption.hashForAudit(userId),
        timestamp: new Date().toISOString(),
        details,
        compliance: 'GDPR'
      };

      await this.supabase.from('audit_logs').insert(logEntry);
    } catch (error) {
      logger.error('GDPR_AUDIT_LOG_FAILED', {
        action,
        userId: encryption.hashForAudit(userId),
        error: error.message
      });
    }
  }

  // Data retention policy enforcement
  async enforceDataRetention() {
    try {
      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

      // Find inactive users (no login for 2 years)
      const { data: inactiveUsers, error } = await this.supabase
        .from('users')
        .select('id')
        .lt('last_login', twoYearsAgo.toISOString())
        .limit(100);

      if (error) throw error;

      let deletedCount = 0;
      if (inactiveUsers) {
        for (const doc of inactiveUsers) {
          await this.deleteUserData(doc.id, 'data_retention_policy', 'system');
          deletedCount++;
        }
      }

      logger.info('DATA_RETENTION_ENFORCEMENT', {
        deletedUsers: deletedCount,
        retentionPeriod: '2 years'
      });

      return { deletedUsers: deletedCount };
    } catch (error) {
      logger.error('DATA_RETENTION_ENFORCEMENT_FAILED', {
        error: error.message
      });
      throw error;
    }
  }
}

// Singleton instance
const gdpr = new GDPRCompliance();

module.exports = {
  GDPRCompliance,
  gdpr
};