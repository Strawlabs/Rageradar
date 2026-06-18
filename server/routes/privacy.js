const express = require('express');
const { authenticateUser, logSecurityEvent } = require('../middleware/security');
const { gdpr } = require('../utils/gdpr');
const { encryption } = require('../utils/encryption');
const { supabase } = require('../supabase');
const router = express.Router();

// Get user's current consent settings
router.get('/consent', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.uid;
    
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const consent = userData.gdpr_consent || {
      analytics: false,
      marketing: false,
      functional: true,
      dataProcessing: false
    };
    
    res.json({
      consent,
      lastUpdated: userData.gdpr_consent_updated || null
    });
  } catch (error) {
    logSecurityEvent('CONSENT_RETRIEVAL_FAILED', req.user.uid, {
      ip: req.clientIP,
      error: error.message
    });
    res.status(500).json({ error: 'Failed to retrieve consent settings' });
  }
});

// Update user's consent settings
router.post('/consent', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { analytics, marketing, functional, dataProcessing } = req.body;
    
    // Validate consent data
    const consentTypes = {
      analytics: Boolean(analytics),
      marketing: Boolean(marketing),
      functional: functional !== false, // Default to true, required for functionality
      dataProcessing: Boolean(dataProcessing)
    };
    
    // Update consent
    const consentRecord = await gdpr.updateConsent(
      userId, 
      consentTypes, 
      req.clientIP, 
      req.headers['user-agent']
    );
    
    logSecurityEvent('CONSENT_UPDATED', userId, {
      ip: req.clientIP,
      consentTypes: Object.keys(consentTypes).filter(key => consentTypes[key])
    });
    
    res.json({
      success: true,
      consent: consentRecord.consent,
      updatedAt: new Date(consentRecord.metadata.updatedAt).toISOString()
    });
  } catch (error) {
    logSecurityEvent('CONSENT_UPDATE_FAILED', req.user.uid, {
      ip: req.clientIP,
      error: error.message
    });
    res.status(500).json({ error: 'Failed to update consent settings' });
  }
});

// Export user data (GDPR Article 15 - Right of Access)
router.get('/export', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.uid;
    const format = req.query.format || 'json';
    
    logSecurityEvent('DATA_EXPORT_REQUESTED', userId, {
      ip: req.clientIP,
      format
    });
    
    const exportData = await gdpr.generateDataExport(userId, format);
    
    const filename = `rageradar-data-export-${new Date().toISOString().split('T')[0]}.${format}`;
    
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
    } else {
      res.setHeader('Content-Type', 'application/json');
    }
    
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(exportData);
    
    logSecurityEvent('DATA_EXPORT_COMPLETED', userId, {
      ip: req.ip || req.clientIP,
      format,
      filename
    });
  } catch (error) {
    logSecurityEvent('DATA_EXPORT_FAILED', req.user.uid, {
      ip: req.clientIP,
      error: error.message
    });
    res.status(500).json({ error: 'Failed to export user data' });
  }
});

// Delete user account (GDPR Article 17 - Right to Erasure)
router.delete('/delete-account', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.uid;
    const reason = req.body.reason || 'user_request';
    
    logSecurityEvent('ACCOUNT_DELETION_REQUESTED', userId, {
      ip: req.clientIP,
      reason
    });
    
    // Perform data deletion
    const deletionResult = await gdpr.deleteUserData(userId, reason, 'user');
    
    logSecurityEvent('ACCOUNT_DELETION_COMPLETED', userId, {
      ip: req.clientIP,
      deletedRecords: deletionResult.deletedRecords
    });
    
    res.json({
      success: true,
      message: 'Account and all associated data have been permanently deleted',
      deletionDate: deletionResult.deletionDate,
      deletedRecords: deletionResult.deletedRecords
    });
  } catch (error) {
    logSecurityEvent('ACCOUNT_DELETION_FAILED', req.user.uid, {
      ip: req.clientIP,
      error: error.message
    });
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

// Update user data (GDPR Article 16 - Right to Rectification)
router.put('/rectify', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.uid;
    const updates = req.body;
    
    // Validate and sanitize updates
    const allowedFields = ['firstName', 'lastName', 'companyName', 'companyEmail', 'contactNumber', 'jobTitle', 'companySize'];
    const sanitizedUpdates = {};
    
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key) && updates[key] !== undefined) {
        sanitizedUpdates[key] = String(updates[key]).trim();
      }
    });
    
    if (Object.keys(sanitizedUpdates).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }
    
    const result = await gdpr.rectifyUserData(userId, sanitizedUpdates, 'user');
    
    logSecurityEvent('DATA_RECTIFICATION_COMPLETED', userId, {
      ip: req.clientIP,
      updatedFields: Object.keys(sanitizedUpdates)
    });
    
    res.json({
      success: true,
      message: 'User data updated successfully',
      updatedFields: Object.keys(sanitizedUpdates),
      updatedAt: result.updatedAt
    });
  } catch (error) {
    logSecurityEvent('DATA_RECTIFICATION_FAILED', req.user.uid, {
      ip: req.clientIP,
      error: error.message
    });
    res.status(500).json({ error: 'Failed to update user data' });
  }
});

// Check consent for specific purpose
router.get('/consent/:purpose', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.uid;
    const purpose = req.params.purpose;
    
    const hasConsent = await gdpr.hasConsent(userId, purpose);
    
    res.json({
      purpose,
      hasConsent,
      checkedAt: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check consent' });
  }
});

// Get data processing information
router.get('/processing-info', (req, res) => {
  res.json({
    dataController: {
      name: 'RageRadar Inc.',
      email: 'privacy@rageradar.com',
      dpo: 'dpo@rageradar.com',
      address: 'Your Company Address'
    },
    purposes: [
      {
        purpose: 'Brand sentiment analysis',
        legalBasis: 'Legitimate interest',
        dataTypes: ['Brand mentions', 'Public social media posts', 'Analysis results'],
        retention: '1 year after analysis',
        recipients: ['Hugging Face (AI processing)', 'Google (Search API)']
      },
      {
        purpose: 'User account management',
        legalBasis: 'Contract performance',
        dataTypes: ['Email', 'Name', 'Company information', 'Usage data'],
        retention: '2 years after account deletion',
        recipients: ['Supabase (Data storage)', 'Internal systems']
      },
      {
        purpose: 'Service improvement',
        legalBasis: 'Legitimate interest',
        dataTypes: ['Usage analytics', 'Performance metrics'],
        retention: '1 year',
        recipients: ['Internal analytics systems']
      },
      {
        purpose: 'Marketing communications',
        legalBasis: 'Consent',
        dataTypes: ['Email', 'Name', 'Company information'],
        retention: 'Until consent withdrawn',
        recipients: ['Email service providers']
      }
    ],
    rights: [
      'Right of access (Article 15)',
      'Right to rectification (Article 16)',
      'Right to erasure (Article 17)',
      'Right to restrict processing (Article 18)',
      'Right to data portability (Article 20)',
      'Right to object (Article 21)'
    ],
    transfers: {
      thirdCountries: ['United States'],
      safeguards: 'Standard Contractual Clauses and adequacy decisions'
    },
    retentionPolicy: {
      userData: '2 years after account deletion',
      analysisData: '1 year after analysis',
      auditLogs: '7 years for compliance',
      backups: '90 days'
    }
  });
});

module.exports = router;