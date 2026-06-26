/**
 * Shared Supabase client for CLI scripts
 * Loads environment variables from server/.env and initializes the Supabase admin client
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../server/.env') });

const { supabase, isMockMode } = require('../server/supabase');

module.exports = { supabase, isMockMode };
