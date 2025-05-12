/**
 * Test script for MongoDB connection
 * Tests both Atlas and local MongoDB connections
 */
require('dotenv').config();
const mongoose = require('mongoose');
const db = require('./backend/config/db');

// Save original MONGODB_URI to restore it later
const originalUri = process.env.MONGODB_URI;

async function testAtlasConnection() {
  console.log('\n🧪 TESTING ATLAS CONNECTION');
  console.log('--------------------------------');
  
  try {
    const result = await db.connect();
    console.log('✅ Atlas connection test result:', result);
    await db.close();
    return true;
  } catch (error) {
    console.error('❌ Atlas connection test failed:', error.message);
    return false;
  }
}

async function testLocalConnection() {
  console.log('\n🧪 TESTING LOCAL CONNECTION');
  console.log('--------------------------------');
  
  // Temporarily remove MONGODB_URI to force local connection
  const tempUri = process.env.MONGODB_URI;
  delete process.env.MONGODB_URI;
  
  try {
    const result = await db.connect();
    console.log('✅ Local connection test result:', result);
    await db.close();
    
    // Restore the original URI
    if (tempUri) process.env.MONGODB_URI = tempUri;
    return true;
  } catch (error) {
    console.error('❌ Local connection test failed:', error.message);
    
    // Restore the original URI
    if (tempUri) process.env.MONGODB_URI = tempUri;
    return false;
  }
}

async function testFallbackMechanism() {
  console.log('\n🧪 TESTING FALLBACK MECHANISM');
  console.log('--------------------------------');
  
  // Set an invalid MongoDB URI to force fallback
  process.env.MONGODB_URI = 'mongodb+srv://invalid:invalid@invalid.invalid/invalid';
  
  try {
    const result = await db.connect();
    console.log('✅ Fallback mechanism test result:', result);
    await db.close();
    
    // Restore the original URI
    if (originalUri) process.env.MONGODB_URI = originalUri;
    return true;
  } catch (error) {
    console.error('❌ Fallback mechanism test failed:', error.message);
    
    // Restore the original URI
    if (originalUri) process.env.MONGODB_URI = originalUri;
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('🔄 Starting database connection tests...');
  
  const atlasResult = await testAtlasConnection();
  const localResult = await testLocalConnection();
  const fallbackResult = await testFallbackMechanism();
  
  console.log('\n📊 TEST RESULTS SUMMARY');
  console.log('--------------------------------');
  console.log(`Atlas Connection: ${atlasResult ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Local Connection: ${localResult ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Fallback Mechanism: ${fallbackResult ? '✅ PASS' : '❌ FAIL'}`);
  
  // Check if any connection method works
  if (atlasResult || localResult || fallbackResult) {
    console.log('\n✅ At least one connection method is working!');
  } else {
    console.log('\n❌ All connection methods failed. Please check your configuration and MongoDB installations.');
  }
  
  // Force exit to ensure all connections are properly closed
  process.exit(0);
}

runTests().catch(error => {
  console.error('Fatal error during tests:', error);
  process.exit(1);
});