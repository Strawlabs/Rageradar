# 🔥 Firestore Backup Configuration Guide

## Overview

Configure automated backups for your Firestore database to protect against data loss.

## Backup Strategy

### What to Backup
- **User data** (`users` collection)
- **Brand analyses** (`analyses` collection)
- **Payment records** (if storing locally)
- **Admin configurations**

### Backup Frequency
- **Daily backups:** Recommended for production
- **Retention:** 30 days minimum
- **Location:** Different region from primary database

## Option 1: Firebase Console (Recommended for Beginners)

### Setup Steps

1. **Go to Firebase Console**
   - Navigate to https://console.firebase.google.com
   - Select your project

2. **Enable Firestore Backups**
   - Go to Firestore Database
   - Click on "Backups" tab
   - Click "Set up automated backups"

3. **Configure Backup Schedule**
   - **Frequency:** Daily
   - **Time:** Off-peak hours (e.g., 2 AM UTC)
   - **Retention:** 30 days
   - **Location:** Choose different region

4. **Set Backup Bucket**
   - Create Cloud Storage bucket for backups
   - Enable versioning
   - Set lifecycle rules for retention

### Cost Estimate
- **Storage:** ~$0.026/GB/month
- **Operations:** Minimal
- **Estimated:** $5-20/month depending on data size

## Option 2: gcloud CLI (Advanced)

### Prerequisites
```bash
# Install gcloud CLI
# https://cloud.google.com/sdk/docs/install

# Authenticate
gcloud auth login

# Set project
gcloud config set project YOUR_PROJECT_ID
```

### Create Backup Script

**File:** `scripts/backup-firestore.sh`

```bash
#!/bin/bash

# Firestore Backup Script
PROJECT_ID="your-project-id"
BUCKET_NAME="gs://your-backup-bucket"
COLLECTION_IDS="users,analyses"

# Generate timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
OUTPUT_URI="${BUCKET_NAME}/backups/${TIMESTAMP}"

echo "Starting Firestore backup..."
echo "Project: ${PROJECT_ID}"
echo "Output: ${OUTPUT_URI}"

# Execute backup
gcloud firestore export ${OUTPUT_URI} \
  --project=${PROJECT_ID} \
  --collection-ids=${COLLECTION_IDS}

if [ $? -eq 0 ]; then
  echo "✅ Backup completed successfully"
  echo "Location: ${OUTPUT_URI}"
else
  echo "❌ Backup failed"
  exit 1
fi
```

### Schedule with Cron

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /path/to/scripts/backup-firestore.sh >> /var/log/firestore-backup.log 2>&1
```

## Option 3: Cloud Scheduler (Production Recommended)

### Setup Cloud Scheduler

1. **Enable Cloud Scheduler API**
   ```bash
   gcloud services enable cloudscheduler.googleapis.com
   ```

2. **Create Backup Job**
   ```bash
   gcloud scheduler jobs create http firestore-backup \
     --schedule="0 2 * * *" \
     --uri="https://firestore.googleapis.com/v1/projects/YOUR_PROJECT_ID/databases/(default):exportDocuments" \
     --http-method=POST \
     --headers="Content-Type=application/json" \
     --message-body='{
       "outputUriPrefix": "gs://your-backup-bucket/scheduled-backups",
       "collectionIds": ["users", "analyses"]
     }' \
     --oauth-service-account-email="YOUR_SERVICE_ACCOUNT@YOUR_PROJECT.iam.gserviceaccount.com"
   ```

3. **Verify Job**
   ```bash
   gcloud scheduler jobs list
   ```

## Backup Verification

### Test Backup Creation

```bash
# Manual backup test
gcloud firestore export gs://your-backup-bucket/test-backup \
  --project=your-project-id \
  --collection-ids=users,analyses
```

### Verify Backup Contents

```bash
# List backups
gsutil ls gs://your-backup-bucket/

# Check backup size
gsutil du -sh gs://your-backup-bucket/backups/
```

## Restore Procedures

### Full Database Restore

```bash
# Restore from backup
gcloud firestore import gs://your-backup-bucket/backups/20251124_020000 \
  --project=your-project-id
```

**⚠️ Warning:** This will overwrite existing data!

### Restore Specific Collections

```bash
# Restore only users collection
gcloud firestore import gs://your-backup-bucket/backups/20251124_020000 \
  --project=your-project-id \
  --collection-ids=users
```

### Restore to Different Project (Testing)

```bash
# Restore to staging environment
gcloud firestore import gs://your-backup-bucket/backups/20251124_020000 \
  --project=your-staging-project-id
```

## Backup Monitoring

### Set Up Alerts

**Cloud Monitoring Alert:**
```yaml
Condition:
  - Backup job fails
  - Backup size drops significantly
  - Backup not created in 25 hours

Notification:
  - Email to admin
  - Slack webhook
  - PagerDuty (optional)
```

### Check Backup Status

```bash
# View recent backup jobs
gcloud firestore operations list \
  --project=your-project-id \
  --filter="type:EXPORT_DOCUMENTS" \
  --limit=10
```

## Backup Retention Policy

### Lifecycle Rules

**Cloud Storage Lifecycle:**
```json
{
  "lifecycle": {
    "rule": [
      {
        "action": {
          "type": "Delete"
        },
        "condition": {
          "age": 30,
          "matchesPrefix": ["backups/"]
        }
      },
      {
        "action": {
          "type": "SetStorageClass",
          "storageClass": "NEARLINE"
        },
        "condition": {
          "age": 7,
          "matchesPrefix": ["backups/"]
        }
      }
    ]
  }
}
```

**Apply Lifecycle:**
```bash
gsutil lifecycle set lifecycle.json gs://your-backup-bucket
```

## Disaster Recovery Plan

### Scenarios

**1. Accidental Data Deletion**
- Identify last good backup
- Restore specific collection
- Verify data integrity
- Resume operations

**2. Database Corruption**
- Stop all writes
- Restore from latest backup
- Verify data
- Resume operations

**3. Complete Data Loss**
- Restore full database from backup
- Verify all collections
- Test critical functions
- Resume operations

### Recovery Time Objective (RTO)
- **Target:** < 4 hours
- **Actual:** Depends on data size
  - Small (< 1GB): 30 minutes
  - Medium (1-10GB): 1-2 hours
  - Large (> 10GB): 2-4 hours

### Recovery Point Objective (RPO)
- **Daily backups:** Up to 24 hours data loss
- **Hourly backups:** Up to 1 hour data loss (premium)

## Testing Backup Restoration

### Monthly Test Procedure

1. **Create Test Project**
   ```bash
   gcloud projects create rageradar-backup-test
   ```

2. **Restore Latest Backup**
   ```bash
   gcloud firestore import gs://your-backup-bucket/backups/latest \
     --project=rageradar-backup-test
   ```

3. **Verify Data**
   - Check user count
   - Verify analyses exist
   - Test queries
   - Compare with production

4. **Document Results**
   - Restoration time
   - Data integrity
   - Issues encountered
   - Lessons learned

5. **Clean Up**
   ```bash
   gcloud projects delete rageradar-backup-test
   ```

## Backup Security

### Encryption
- **At Rest:** Enabled by default (Google-managed keys)
- **In Transit:** TLS encryption
- **Custom Keys:** Optional (Cloud KMS)

### Access Control
```bash
# Grant backup access to service account
gsutil iam ch \
  serviceAccount:backup-service@your-project.iam.gserviceaccount.com:roles/storage.admin \
  gs://your-backup-bucket
```

### Audit Logging
- Enable Cloud Audit Logs
- Monitor backup access
- Alert on unauthorized access

## Cost Optimization

### Tips
1. **Use Nearline Storage** for backups > 7 days old
2. **Delete old backups** beyond retention period
3. **Compress exports** if possible
4. **Monitor storage usage** monthly

### Cost Breakdown
```
Daily Backup (5GB database):
- Storage: 5GB × $0.026/GB = $0.13/day
- Operations: ~$0.01/day
- Monthly: ~$4.20

With 30-day retention:
- Storage: 150GB × $0.026/GB = $3.90/month
- Operations: ~$0.30/month
- Total: ~$4.20/month
```

## Troubleshooting

### Backup Fails

**Check Permissions:**
```bash
gcloud projects get-iam-policy your-project-id \
  --flatten="bindings[].members" \
  --filter="bindings.role:roles/datastore.importExportAdmin"
```

**Check Quota:**
```bash
gcloud compute project-info describe \
  --project=your-project-id
```

### Restore Fails

**Common Issues:**
- Insufficient permissions
- Bucket not accessible
- Backup corrupted
- Project quota exceeded

**Solution:**
```bash
# Verify backup integrity
gsutil ls -l gs://your-backup-bucket/backups/

# Check service account permissions
gcloud projects get-iam-policy your-project-id
```

## Checklist

### Initial Setup
- [ ] Create backup bucket
- [ ] Configure lifecycle rules
- [ ] Set up automated backups
- [ ] Test manual backup
- [ ] Verify backup creation

### Ongoing Maintenance
- [ ] Monitor backup success (weekly)
- [ ] Test restoration (monthly)
- [ ] Review storage costs (monthly)
- [ ] Update retention policy (quarterly)
- [ ] Audit access logs (quarterly)

### Emergency Procedures
- [ ] Document restoration steps
- [ ] Train team on recovery
- [ ] Test disaster recovery (annually)
- [ ] Update contact information

## Resources

- **Firestore Backup Docs:** https://cloud.google.com/firestore/docs/backups
- **Cloud Scheduler:** https://cloud.google.com/scheduler/docs
- **Cloud Storage:** https://cloud.google.com/storage/docs

---

**Next Steps:**
1. Choose backup method (Console recommended for start)
2. Create backup bucket
3. Configure automated backups
4. Test restoration procedure
5. Document recovery process
